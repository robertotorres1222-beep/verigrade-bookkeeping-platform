import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create Supabase client for public operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Create Supabase client for admin operations (uses service role key)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Database types
export interface Profile {
  id: string
  email: string
  full_name?: string
  role: 'admin' | 'manager' | 'accountant' | 'viewer'
  company_id?: string
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  name: string
  description?: string
  address?: any
  phone?: string
  email?: string
  website?: string
  tax_id?: string
  created_at: string
  updated_at: string
}

export interface ChartOfAccount {
  id: string
  company_id: string
  account_code: string
  account_name: string
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
  parent_account_id?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  company_id: string
  transaction_date: string
  description: string
  reference?: string
  transaction_type: 'income' | 'expense' | 'transfer'
  total_amount: number
  created_by?: string
  created_at: string
  updated_at: string
}

export interface TransactionLine {
  id: string
  transaction_id: string
  account_id: string
  debit_amount: number
  credit_amount: number
  description?: string
  created_at: string
}

export interface Customer {
  id: string
  company_id: string
  name: string
  email?: string
  phone?: string
  address?: any
  tax_id?: string
  credit_limit: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Vendor {
  id: string
  company_id: string
  name: string
  email?: string
  phone?: string
  address?: any
  tax_id?: string
  payment_terms: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  company_id: string
  customer_id?: string
  invoice_number: string
  invoice_date: string
  due_date: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  subtotal: number
  tax_amount: number
  total_amount: number
  notes?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface InvoiceLine {
  id: string
  invoice_id: string
  description: string
  quantity: number
  unit_price: number
  line_total: number
  created_at: string
}

// Helper functions
export const getCompanyId = async (userId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('company_id')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data?.company_id || null
  } catch (error) {
    console.error('Error getting company ID:', error)
    return null
  }
}

export const getUserProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error getting user profile:', error)
    return null
  }
}

export const createUserProfile = async (userId: string, email: string, fullName?: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        email,
        full_name: fullName,
        role: 'viewer'
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating user profile:', error)
    return null
  }
}

export const updateUserProfile = async (userId: string, updates: Partial<Profile>): Promise<Profile | null> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating user profile:', error)
    return null
  }
}

export default supabase



