import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid'
import { prisma } from '../config/database'

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments] || PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
})

const client = new PlaidApi(configuration)

export interface BankAccount {
  id: string
  name: string
  type: string
  balance: number
  accountNumber: string
  routingNumber?: string
}

export interface Transaction {
  id: string
  amount: number
  date: string
  description: string
  category: string[]
  accountId: string
}

export const plaidService = {
  async createLinkToken(userId: string, organizationId: string) {
    try {
      const response = await client.linkTokenCreate({
        user: {
          client_user_id: userId,
        },
        client_name: 'VeriGrade',
        products: ['transactions', 'accounts'],
        country_codes: ['US'],
        language: 'en',
        webhook: `${process.env.BACKEND_URL}/api/plaid/webhook`,
        account_filters: {
          depository: {
            account_subtypes: ['checking', 'savings']
          },
          credit: {
            account_subtypes: ['credit card']
          }
        }
      })

      return response.data
    } catch (error) {
      console.error('Plaid link token creation error:', error)
      throw new Error('Failed to create link token')
    }
  },

  async exchangePublicToken(publicToken: string, userId: string, organizationId: string) {
    try {
      const response = await client.itemPublicTokenExchange({
        public_token: publicToken
      })

      const accessToken = response.data.access_token
      const itemId = response.data.item_id

      // Store access token
      await prisma.integration.create({
        data: {
          organizationId,
          userId,
          type: 'PLAID',
          credentials: {
            accessToken,
            itemId
          },
          status: 'CONNECTED',
          settings: {},
          isActive: true
        }
      })

      // Fetch and store accounts
      await this.fetchAndStoreAccounts(accessToken, organizationId)

      return { accessToken, itemId }
    } catch (error) {
      console.error('Plaid token exchange error:', error)
      throw new Error('Failed to exchange public token')
    }
  },

  async fetchAndStoreAccounts(accessToken: string, organizationId: string) {
    try {
      const response = await client.accountsGet({
        access_token: accessToken
      })

      const accounts = response.data.accounts

      for (const account of accounts) {
        // Check if account already exists
        const existingAccount = await prisma.bankAccount.findFirst({
          where: {
            organizationId,
            plaidAccountId: account.account_id
          }
        })

        if (!existingAccount) {
          await prisma.bankAccount.create({
            data: {
              organizationId,
              name: account.name,
              type: this.mapPlaidAccountType(account.type),
              accountNumber: account.mask || '',
              balance: account.balances.current || 0,
              currency: 'USD',
              plaidAccountId: account.account_id,
              isActive: true
            }
          })
        }
      }

      return accounts
    } catch (error) {
      console.error('Plaid accounts fetch error:', error)
      throw new Error('Failed to fetch accounts')
    }
  },

  async fetchTransactions(accessToken: string, organizationId: string, startDate?: Date, endDate?: Date) {
    try {
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      const end = endDate || new Date()

      const response = await client.transactionsGet({
        access_token: accessToken,
        start_date: start,
        end_date: end,
        count: 500
      })

      const transactions = response.data.transactions

      // Store transactions in database
      for (const transaction of transactions) {
        // Check if transaction already exists
        const existingTransaction = await prisma.transaction.findFirst({
          where: {
            organizationId,
            reference: transaction.transaction_id
          }
        })

        if (!existingTransaction) {
          // Get bank account
          const bankAccount = await prisma.bankAccount.findFirst({
            where: {
              organizationId,
              plaidAccountId: transaction.account_id
            }
          })

          await prisma.transaction.create({
            data: {
              organizationId,
              userId: (await prisma.organization.findUnique({
                where: { id: organizationId },
                select: { ownerId: true }
              }))?.ownerId || '',
              type: this.mapPlaidTransactionType(transaction.amount),
              amount: Math.abs(transaction.amount),
              description: transaction.name || transaction.merchant_name || 'Unknown',
              reference: transaction.transaction_id,
              category: transaction.category?.[0] || 'Uncategorized',
              subcategory: transaction.category?.[1] || 'General',
              date: new Date(transaction.date),
              bankAccountId: bankAccount?.id,
              metadata: {
                plaidTransactionId: transaction.transaction_id,
                merchantName: transaction.merchant_name,
                category: transaction.category,
                location: transaction.location
              }
            }
          })
        }
      }

      return transactions
    } catch (error) {
      console.error('Plaid transactions fetch error:', error)
      throw new Error('Failed to fetch transactions')
    }
  },

  async syncTransactions(organizationId: string) {
    try {
      // Get active Plaid integration
      const integration = await prisma.integration.findFirst({
        where: {
          organizationId,
          type: 'PLAID',
          isActive: true
        }
      })

      if (!integration) {
        throw new Error('No active Plaid integration found')
      }

      const credentials = integration.credentials as any
      const accessToken = credentials.accessToken

      // Fetch latest transactions
      await this.fetchAndStoreAccounts(accessToken, organizationId)
      await this.fetchTransactions(accessToken, organizationId)

      // Update last sync time
      await prisma.integration.update({
        where: { id: integration.id },
        data: { lastSyncAt: new Date() }
      })

      return { success: true, syncedAt: new Date() }
    } catch (error) {
      console.error('Plaid sync error:', error)
      throw new Error('Failed to sync transactions')
    }
  },

  async removeIntegration(organizationId: string) {
    try {
      const integration = await prisma.integration.findFirst({
        where: {
          organizationId,
          type: 'PLAID',
          isActive: true
        }
      })

      if (!integration) {
        throw new Error('No active Plaid integration found')
      }

      const credentials = integration.credentials as any
      const accessToken = credentials.accessToken

      // Remove item from Plaid
      await client.itemRemove({
        access_token: accessToken
      })

      // Deactivate integration
      await prisma.integration.update({
        where: { id: integration.id },
        data: { isActive: false, status: 'DISCONNECTED' }
      })

      return { success: true }
    } catch (error) {
      console.error('Plaid integration removal error:', error)
      throw new Error('Failed to remove integration')
    }
  },

  mapPlaidAccountType(plaidType: string): string {
    const typeMap: { [key: string]: string } = {
      'depository': 'CHECKING',
      'credit': 'CREDIT_CARD',
      'loan': 'LOAN',
      'investment': 'INVESTMENT',
      'other': 'OTHER'
    }
    return typeMap[plaidType] || 'OTHER'
  },

  mapPlaidTransactionType(amount: number): string {
    return amount >= 0 ? 'INCOME' : 'EXPENSE'
  }
}