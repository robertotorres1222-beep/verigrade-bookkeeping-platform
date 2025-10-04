import { Configuration, PlaidApi, PlaidEnvironments, LinkTokenCreateRequest, CountryCode, Products, TransactionsGetRequest } from 'plaid';
import { prisma } from '../index';
import { logger } from '../utils/logger';

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env['PLAID_ENVIRONMENT'] as keyof typeof PlaidEnvironments] || PlaidEnvironments['sandbox'] || '',
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env['PLAID_CLIENT_ID'] || '',
      'PLAID-SECRET': process.env['PLAID_SECRET'] || '',
    },
  },
});

const plaidClient = new PlaidApi(configuration);

export interface BankAccountInfo {
  accountId: string;
  name: string;
  type: string;
  subtype: string;
  mask: string;
  balances: {
    available: number | null;
    current: number | null;
    limit: number | null;
  };
}

export interface TransactionInfo {
  transactionId: string;
  accountId: string;
  amount: number;
  date: string;
  name: string;
  merchantName?: string;
  category: string[];
  categoryId?: string;
  pending: boolean;
  accountOwner?: string;
}

// Create link token for Plaid Link
export const createLinkToken = async (userId: string): Promise<string> => {
  try {
    const request: LinkTokenCreateRequest = {
      user: {
        client_user_id: userId,
      },
      client_name: 'VeriGrade',
      products: [Products.Transactions, Products.Auth],
      country_codes: [CountryCode.Us],
      language: 'en',
    };

    const response = await plaidClient.linkTokenCreate(request);
    return response.data.link_token;
  } catch (error) {
    logger.error('Failed to create link token:', error);
    throw new Error('Failed to create link token');
  }
};

// Exchange public token for access token
export const exchangePublicToken = async (
  publicToken: string,
  organizationId: string
): Promise<string> => {
  try {
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;

    // Store access token in database
    await prisma.bankAccount.create({
      data: {
        organizationId,
        name: 'Connected Bank Account',
        type: 'CHECKING',
        plaidAccountId: 'main',
        plaidItemId: itemId,
        balance: 0,
        isActive: true,
      },
    });

    // Store access token securely (in production, use encryption)
    // For now, we'll store it in a secure configuration table
    await prisma.systemConfig.upsert({
      where: { key: `plaid_access_token_${itemId}` },
      update: { value: accessToken },
      create: { key: `plaid_access_token_${itemId}`, value: accessToken },
    });

    logger.info(`Plaid access token exchanged for item ${itemId}`);
    return accessToken;
  } catch (error) {
    logger.error('Failed to exchange public token:', error);
    throw new Error('Failed to exchange public token');
  }
};

// Get accounts for a connected item
export const getAccounts = async (organizationId: string): Promise<BankAccountInfo[]> => {
  try {
    // Get all bank accounts for the organization
    const bankAccounts = await prisma.bankAccount.findMany({
      where: {
        organizationId,
        plaidItemId: { not: null },
        isActive: true,
      },
    });

    const accounts: BankAccountInfo[] = [];

    for (const bankAccount of bankAccounts) {
      if (!bankAccount.plaidItemId) continue;

      // Get access token
      const tokenConfig = await prisma.systemConfig.findUnique({
        where: { key: `plaid_access_token_${bankAccount.plaidItemId}` },
      });

      if (!tokenConfig) continue;

      try {
        const response = await plaidClient.accountsGet({
          access_token: tokenConfig.value as string,
        });

        const plaidAccounts = response.data.accounts.map(account => ({
          accountId: account.account_id,
          name: account.name,
          type: account.type || 'unknown',
          subtype: account.subtype || 'unknown',
          mask: account.mask || '',
          balances: {
            available: account.balances.available,
            current: account.balances.current,
            limit: account.balances.limit,
          },
        }));

        accounts.push(...plaidAccounts);
      } catch (error) {
        logger.error(`Failed to get accounts for item ${bankAccount.plaidItemId}:`, error);
        // Continue with other accounts
      }
    }

    return accounts;
  } catch (error) {
    logger.error('Failed to get accounts:', error);
    throw new Error('Failed to get accounts');
  }
};

// Get transactions for a connected account
export const getTransactions = async (
  organizationId: string,
  startDate: string,
  endDate: string,
  accountIds?: string[]
): Promise<TransactionInfo[]> => {
  try {
    // Get all bank accounts for the organization
    const bankAccounts = await prisma.bankAccount.findMany({
      where: {
        organizationId,
        plaidItemId: { not: null },
        isActive: true,
      },
    });

    const allTransactions: TransactionInfo[] = [];

    for (const bankAccount of bankAccounts) {
      if (!bankAccount.plaidItemId) continue;

      // Get access token
      const tokenConfig = await prisma.systemConfig.findUnique({
        where: { key: `plaid_access_token_${bankAccount.plaidItemId}` },
      });

      if (!tokenConfig) continue;

      try {
        const request: TransactionsGetRequest = {
          access_token: tokenConfig.value as string,
          start_date: startDate,
          end_date: endDate,
          ...(accountIds && { account_ids: accountIds }),
        };

        const response = await plaidClient.transactionsGet(request);
        
        const transactions = response.data.transactions.map(transaction => ({
          transactionId: transaction.transaction_id,
          accountId: transaction.account_id,
          amount: transaction.amount,
          date: transaction.date,
          name: transaction.name || '',
          merchantName: transaction.merchant_name || '',
          category: transaction.category || [],
          categoryId: transaction.category_id || '',
          pending: transaction.pending,
          accountOwner: transaction.account_owner || '',
        }));

        allTransactions.push(...transactions);
      } catch (error) {
        logger.error(`Failed to get transactions for item ${bankAccount.plaidItemId}:`, error);
        // Continue with other accounts
      }
    }

    return allTransactions;
  } catch (error) {
    logger.error('Failed to get transactions:', error);
    throw new Error('Failed to get transactions');
  }
};

// Sync transactions to database
export const syncTransactions = async (organizationId: string): Promise<number> => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Last 30 days
    const endDate = new Date();

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    if (!startDateStr || !endDateStr) {
      throw new Error('Failed to format dates');
    }

    const transactions = await getTransactions(
      organizationId,
      startDateStr,
      endDateStr
    );

    let syncedCount = 0;

    for (const transaction of transactions) {
      try {
        // Check if transaction already exists
        const existingTransaction = await prisma.transaction.findFirst({
          where: {
            organizationId,
            metadata: {
              path: ['plaidTransactionId'],
              equals: transaction.transactionId,
            },
          },
        });

        if (existingTransaction) {
          continue; // Skip existing transactions
        }

        // Create transaction in database
        await prisma.transaction.create({
          data: {
            organizationId,
            userId: '', // Will be set by the system
            type: transaction.amount > 0 ? 'INCOME' : 'EXPENSE',
            amount: Math.abs(transaction.amount),
            description: transaction.name,
            date: new Date(transaction.date),
            metadata: {
              plaidTransactionId: transaction.transactionId,
              plaidAccountId: transaction.accountId,
              merchantName: transaction.merchantName,
              category: transaction.category,
              categoryId: transaction.categoryId,
              pending: transaction.pending,
            },
            isReconciled: !transaction.pending,
          },
        });

        syncedCount++;
      } catch (error) {
        logger.error(`Failed to sync transaction ${transaction.transactionId}:`, error);
        // Continue with other transactions
      }
    }

    // Update last sync time for all bank accounts
    await prisma.bankAccount.updateMany({
      where: {
        organizationId,
        plaidItemId: { not: null },
      },
      data: {
        lastSyncAt: new Date(),
      },
    });

    logger.info(`Synced ${syncedCount} transactions for organization ${organizationId}`);
    return syncedCount;
  } catch (error) {
    logger.error('Failed to sync transactions:', error);
    throw new Error('Failed to sync transactions');
  }
};

// Remove bank connection
export const removeBankConnection = async (itemId: string, organizationId: string): Promise<void> => {
  try {
    // Get access token
    const tokenConfig = await prisma.systemConfig.findUnique({
      where: { key: `plaid_access_token_${itemId}` },
    });

    if (tokenConfig) {
      // Remove item from Plaid
      await plaidClient.itemRemove({
        access_token: tokenConfig.value as string,
      });

      // Remove access token from database
      await prisma.systemConfig.delete({
        where: { key: `plaid_access_token_${itemId}` },
      });
    }

    // Mark bank accounts as inactive
    await prisma.bankAccount.updateMany({
      where: {
        organizationId,
        plaidItemId: itemId,
      },
      data: {
        isActive: false,
      },
    });

    logger.info(`Removed bank connection for item ${itemId}`);
  } catch (error) {
    logger.error('Failed to remove bank connection:', error);
    throw new Error('Failed to remove bank connection');
  }
};

// Get account balance
export const getAccountBalance = async (accountId: string, organizationId: string): Promise<number> => {
  try {
    const bankAccount = await prisma.bankAccount.findFirst({
      where: {
        organizationId,
        plaidAccountId: accountId,
        isActive: true,
      },
    });

    if (!bankAccount?.plaidItemId) {
      throw new Error('Bank account not found');
    }

    // Get access token
    const tokenConfig = await prisma.systemConfig.findUnique({
      where: { key: `plaid_access_token_${bankAccount.plaidItemId}` },
    });

    if (!tokenConfig) {
      throw new Error('Access token not found');
    }

    const response = await plaidClient.accountsGet({
      access_token: tokenConfig.value as string,
    });

    const account = response.data.accounts.find(acc => acc.account_id === accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    return account.balances.current || 0;
  } catch (error) {
    logger.error('Failed to get account balance:', error);
    throw new Error('Failed to get account balance');
  }
};
