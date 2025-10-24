import { supabaseAdmin, getCompanyId, Company, Customer, Vendor, Transaction, ChartOfAccount, Invoice } from '../config/supabase'

export class DatabaseService {
  // Company operations
  static async getCompany(companyId: string): Promise<Company | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting company:', error)
      return null
    }
  }

  static async createCompany(companyData: Partial<Company>): Promise<Company | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('companies')
        .insert(companyData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating company:', error)
      return null
    }
  }

  static async updateCompany(companyId: string, updates: Partial<Company>): Promise<Company | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('companies')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', companyId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating company:', error)
      return null
    }
  }

  // Customer operations
  static async getCustomers(companyId: string): Promise<Customer[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('customers')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting customers:', error)
      return []
    }
  }

  static async getCustomer(customerId: string): Promise<Customer | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting customer:', error)
      return null
    }
  }

  static async createCustomer(customerData: Partial<Customer>): Promise<Customer | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('customers')
        .insert(customerData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating customer:', error)
      return null
    }
  }

  static async updateCustomer(customerId: string, updates: Partial<Customer>): Promise<Customer | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('customers')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', customerId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating customer:', error)
      return null
    }
  }

  // Vendor operations
  static async getVendors(companyId: string): Promise<Vendor[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('vendors')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting vendors:', error)
      return []
    }
  }

  static async getVendor(vendorId: string): Promise<Vendor | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('vendors')
        .select('*')
        .eq('id', vendorId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting vendor:', error)
      return null
    }
  }

  static async createVendor(vendorData: Partial<Vendor>): Promise<Vendor | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('vendors')
        .insert(vendorData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating vendor:', error)
      return null
    }
  }

  // Chart of Accounts operations
  static async getChartOfAccounts(companyId: string): Promise<ChartOfAccount[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('chart_of_accounts')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .order('account_code')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting chart of accounts:', error)
      return []
    }
  }

  static async createAccount(accountData: Partial<ChartOfAccount>): Promise<ChartOfAccount | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('chart_of_accounts')
        .insert(accountData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating account:', error)
      return null
    }
  }

  // Transaction operations
  static async getTransactions(companyId: string, limit = 50, offset = 0): Promise<Transaction[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('transactions')
        .select('*')
        .eq('company_id', companyId)
        .order('transaction_date', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting transactions:', error)
      return []
    }
  }

  static async getTransaction(transactionId: string): Promise<Transaction | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting transaction:', error)
      return null
    }
  }

  static async createTransaction(transactionData: Partial<Transaction>): Promise<Transaction | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('transactions')
        .insert(transactionData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating transaction:', error)
      return null
    }
  }

  // Invoice operations
  static async getInvoices(companyId: string, status?: string): Promise<Invoice[]> {
    try {
      let query = supabaseAdmin
        .from('invoices')
        .select('*')
        .eq('company_id', companyId)
        .order('invoice_date', { ascending: false })

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting invoices:', error)
      return []
    }
  }

  static async getInvoice(invoiceId: string): Promise<Invoice | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting invoice:', error)
      return null
    }
  }

  static async createInvoice(invoiceData: Partial<Invoice>): Promise<Invoice | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('invoices')
        .insert(invoiceData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating invoice:', error)
      return null
    }
  }

  static async updateInvoice(invoiceId: string, updates: Partial<Invoice>): Promise<Invoice | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('invoices')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', invoiceId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating invoice:', error)
      return null
    }
  }

  // Financial reports
  static async getTrialBalance(companyId: string, asOfDate?: string): Promise<any[]> {
    try {
      const { data, error } = await supabaseAdmin
        .rpc('get_trial_balance', {
          company_id: companyId,
          as_of_date: asOfDate || new Date().toISOString().split('T')[0]
        })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting trial balance:', error)
      return []
    }
  }

  static async getProfitAndLoss(companyId: string, startDate: string, endDate: string): Promise<any[]> {
    try {
      const { data, error } = await supabaseAdmin
        .rpc('get_profit_and_loss', {
          company_id: companyId,
          start_date: startDate,
          end_date: endDate
        })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting profit and loss:', error)
      return []
    }
  }

  static async getBalanceSheet(companyId: string, asOfDate?: string): Promise<any[]> {
    try {
      const { data, error } = await supabaseAdmin
        .rpc('get_balance_sheet', {
          company_id: companyId,
          as_of_date: asOfDate || new Date().toISOString().split('T')[0]
        })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting balance sheet:', error)
      return []
    }
  }
}

export default DatabaseService
