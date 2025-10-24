import express from 'express'
import { DatabaseService } from '../services/databaseService'
import { getCompanyId } from '../config/supabase'

const router = express.Router()

// Middleware to get company ID from user
const getCompanyMiddleware = async (req: any, res: any, next: any) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' })
    }

    const companyId = await getCompanyId(userId)
    if (!companyId) {
      return res.status(403).json({ error: 'User not associated with any company' })
    }

    req.companyId = companyId
    next()
  } catch (error) {
    console.error('Error in getCompanyMiddleware:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Company routes
router.get('/company', getCompanyMiddleware, async (req: any, res) => {
  try {
    const company = await DatabaseService.getCompany(req.companyId)
    if (!company) {
      return res.status(404).json({ error: 'Company not found' })
    }
    res.json(company)
  } catch (error) {
    console.error('Error getting company:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.put('/company', getCompanyMiddleware, async (req: any, res) => {
  try {
    const company = await DatabaseService.updateCompany(req.companyId, req.body)
    if (!company) {
      return res.status(400).json({ error: 'Failed to update company' })
    }
    res.json(company)
  } catch (error) {
    console.error('Error updating company:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Customer routes
router.get('/customers', getCompanyMiddleware, async (req: any, res) => {
  try {
    const customers = await DatabaseService.getCustomers(req.companyId)
    res.json(customers)
  } catch (error) {
    console.error('Error getting customers:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/customers/:id', getCompanyMiddleware, async (req: any, res) => {
  try {
    const customer = await DatabaseService.getCustomer(req.params.id)
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' })
    }
    res.json(customer)
  } catch (error) {
    console.error('Error getting customer:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/customers', getCompanyMiddleware, async (req: any, res) => {
  try {
    const customerData = {
      ...req.body,
      company_id: req.companyId
    }
    const customer = await DatabaseService.createCustomer(customerData)
    if (!customer) {
      return res.status(400).json({ error: 'Failed to create customer' })
    }
    res.status(201).json(customer)
  } catch (error) {
    console.error('Error creating customer:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.put('/customers/:id', getCompanyMiddleware, async (req: any, res) => {
  try {
    const customer = await DatabaseService.updateCustomer(req.params.id, req.body)
    if (!customer) {
      return res.status(400).json({ error: 'Failed to update customer' })
    }
    res.json(customer)
  } catch (error) {
    console.error('Error updating customer:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Vendor routes
router.get('/vendors', getCompanyMiddleware, async (req: any, res) => {
  try {
    const vendors = await DatabaseService.getVendors(req.companyId)
    res.json(vendors)
  } catch (error) {
    console.error('Error getting vendors:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/vendors/:id', getCompanyMiddleware, async (req: any, res) => {
  try {
    const vendor = await DatabaseService.getVendor(req.params.id)
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' })
    }
    res.json(vendor)
  } catch (error) {
    console.error('Error getting vendor:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/vendors', getCompanyMiddleware, async (req: any, res) => {
  try {
    const vendorData = {
      ...req.body,
      company_id: req.companyId
    }
    const vendor = await DatabaseService.createVendor(vendorData)
    if (!vendor) {
      return res.status(400).json({ error: 'Failed to create vendor' })
    }
    res.status(201).json(vendor)
  } catch (error) {
    console.error('Error creating vendor:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Chart of Accounts routes
router.get('/chart-of-accounts', getCompanyMiddleware, async (req: any, res) => {
  try {
    const accounts = await DatabaseService.getChartOfAccounts(req.companyId)
    res.json(accounts)
  } catch (error) {
    console.error('Error getting chart of accounts:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/chart-of-accounts', getCompanyMiddleware, async (req: any, res) => {
  try {
    const accountData = {
      ...req.body,
      company_id: req.companyId
    }
    const account = await DatabaseService.createAccount(accountData)
    if (!account) {
      return res.status(400).json({ error: 'Failed to create account' })
    }
    res.status(201).json(account)
  } catch (error) {
    console.error('Error creating account:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Transaction routes
router.get('/transactions', getCompanyMiddleware, async (req: any, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50
    const offset = parseInt(req.query.offset) || 0
    const transactions = await DatabaseService.getTransactions(req.companyId, limit, offset)
    res.json(transactions)
  } catch (error) {
    console.error('Error getting transactions:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/transactions/:id', getCompanyMiddleware, async (req: any, res) => {
  try {
    const transaction = await DatabaseService.getTransaction(req.params.id)
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' })
    }
    res.json(transaction)
  } catch (error) {
    console.error('Error getting transaction:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/transactions', getCompanyMiddleware, async (req: any, res) => {
  try {
    const transactionData = {
      ...req.body,
      company_id: req.companyId,
      created_by: req.user.id
    }
    const transaction = await DatabaseService.createTransaction(transactionData)
    if (!transaction) {
      return res.status(400).json({ error: 'Failed to create transaction' })
    }
    res.status(201).json(transaction)
  } catch (error) {
    console.error('Error creating transaction:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Invoice routes
router.get('/invoices', getCompanyMiddleware, async (req: any, res) => {
  try {
    const status = req.query.status
    const invoices = await DatabaseService.getInvoices(req.companyId, status)
    res.json(invoices)
  } catch (error) {
    console.error('Error getting invoices:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/invoices/:id', getCompanyMiddleware, async (req: any, res) => {
  try {
    const invoice = await DatabaseService.getInvoice(req.params.id)
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' })
    }
    res.json(invoice)
  } catch (error) {
    console.error('Error getting invoice:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/invoices', getCompanyMiddleware, async (req: any, res) => {
  try {
    const invoiceData = {
      ...req.body,
      company_id: req.companyId,
      created_by: req.user.id
    }
    const invoice = await DatabaseService.createInvoice(invoiceData)
    if (!invoice) {
      return res.status(400).json({ error: 'Failed to create invoice' })
    }
    res.status(201).json(invoice)
  } catch (error) {
    console.error('Error creating invoice:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.put('/invoices/:id', getCompanyMiddleware, async (req: any, res) => {
  try {
    const invoice = await DatabaseService.updateInvoice(req.params.id, req.body)
    if (!invoice) {
      return res.status(400).json({ error: 'Failed to update invoice' })
    }
    res.json(invoice)
  } catch (error) {
    console.error('Error updating invoice:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Financial reports routes
router.get('/reports/trial-balance', getCompanyMiddleware, async (req: any, res) => {
  try {
    const asOfDate = req.query.asOfDate
    const trialBalance = await DatabaseService.getTrialBalance(req.companyId, asOfDate)
    res.json(trialBalance)
  } catch (error) {
    console.error('Error getting trial balance:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/reports/profit-and-loss', getCompanyMiddleware, async (req: any, res) => {
  try {
    const { startDate, endDate } = req.query
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' })
    }
    const profitAndLoss = await DatabaseService.getProfitAndLoss(req.companyId, startDate, endDate)
    res.json(profitAndLoss)
  } catch (error) {
    console.error('Error getting profit and loss:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/reports/balance-sheet', getCompanyMiddleware, async (req: any, res) => {
  try {
    const asOfDate = req.query.asOfDate
    const balanceSheet = await DatabaseService.getBalanceSheet(req.companyId, asOfDate)
    res.json(balanceSheet)
  } catch (error) {
    console.error('Error getting balance sheet:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
