// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  isActive: boolean;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserWithOrganization extends User {
  organizationId?: string;
  role?: string;
  organization?: Organization;
}

// Organization Types
export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
  industry?: string;
  size?: string;
  currency: string;
  timezone: string;
  address?: Address;
  settings?: OrganizationSettings;
  isActive: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: Role;
  permissions?: any;
  invitedAt: string;
  joinedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface OrganizationSettings {
  fiscalYearStart?: string;
  defaultCurrency?: string;
  invoiceNumbering?: InvoiceNumberingSettings;
  taxSettings?: TaxSettings;
  notifications?: NotificationSettings;
}

export interface InvoiceNumberingSettings {
  prefix: string;
  startNumber: number;
  padding: number;
}

export interface TaxSettings {
  defaultTaxRate: number;
  taxInclusive: boolean;
  taxNumbers: Record<string, string>;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  invoiceReminders: boolean;
  paymentNotifications: boolean;
  expenseApprovals: boolean;
}

// Address Type
export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

// Enums
export enum Role {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  ACCOUNTANT = 'ACCOUNTANT',
  VIEWER = 'VIEWER'
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER',
  ADJUSTMENT = 'ADJUSTMENT'
}

export enum BankAccountType {
  CHECKING = 'CHECKING',
  SAVINGS = 'SAVINGS',
  CREDIT_CARD = 'CREDIT_CARD',
  INVESTMENT = 'INVESTMENT',
  LOAN = 'LOAN',
  OTHER = 'OTHER'
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  VIEWED = 'VIEWED',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export enum ExpenseStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID'
}

export enum CategoryType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY'
}

export enum ReportType {
  PROFIT_LOSS = 'PROFIT_LOSS',
  BALANCE_SHEET = 'BALANCE_SHEET',
  CASH_FLOW = 'CASH_FLOW',
  AGING_REPORT = 'AGING_REPORT',
  EXPENSE_REPORT = 'EXPENSE_REPORT',
  INCOME_REPORT = 'INCOME_REPORT',
  TAX_REPORT = 'TAX_REPORT',
  CUSTOM = 'CUSTOM'
}

export enum ReportStatus {
  PENDING = 'PENDING',
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export enum AIAnalysisType {
  TRANSACTION_CATEGORIZATION = 'TRANSACTION_CATEGORIZATION',
  EXPENSE_PREDICTION = 'EXPENSE_PREDICTION',
  ANOMALY_DETECTION = 'ANOMALY_DETECTION',
  CASH_FLOW_PREDICTION = 'CASH_FLOW_PREDICTION',
  NATURAL_LANGUAGE_QUERY = 'NATURAL_LANGUAGE_QUERY',
  INSIGHT_GENERATION = 'INSIGHT_GENERATION'
}

// Financial Types
export interface Transaction {
  id: string;
  organizationId: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  reference?: string;
  category?: string;
  subcategory?: string;
  date: string;
  balance?: number;
  metadata?: any;
  isReconciled: boolean;
  createdAt: string;
  updatedAt: string;
  bankAccount?: BankAccount;
  bankAccountId?: string;
}

export interface BankAccount {
  id: string;
  organizationId: string;
  name: string;
  type: BankAccountType;
  accountNumber?: string;
  routingNumber?: string;
  balance: number;
  currency: string;
  isActive: boolean;
  plaidAccountId?: string;
  plaidItemId?: string;
  lastSyncAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  organizationId: string;
  userId: string;
  invoiceNumber: string;
  customerId?: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate?: string;
  paidDate?: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  notes?: string;
  terms?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  organizationId: string;
  userId: string;
  amount: number;
  description: string;
  category?: string;
  subcategory?: string;
  date: string;
  receipt?: string;
  vendor?: string;
  isReimbursable: boolean;
  isTaxDeductible: boolean;
  status: ExpenseStatus;
  approvedBy?: string;
  approvedAt?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  organizationId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: Address;
  taxId?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  id: string;
  organizationId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: Address;
  taxId?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  organizationId: string;
  name: string;
  type: CategoryType;
  parentId?: string;
  color?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  parent?: Category;
  children?: Category[];
}

export interface Report {
  id: string;
  organizationId: string;
  userId: string;
  name: string;
  type: ReportType;
  parameters: any;
  data?: any;
  status: ReportStatus;
  scheduledAt?: string;
  generatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIAnalysis {
  id: string;
  organizationId: string;
  type: AIAnalysisType;
  input: any;
  output: any;
  confidence: number;
  model: string;
  cost?: number;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  code?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  organizationName: string;
}

export interface InvoiceForm {
  customerId?: string;
  issueDate: string;
  dueDate?: string;
  items: InvoiceItemForm[];
  notes?: string;
  terms?: string;
}

export interface InvoiceItemForm {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface ExpenseForm {
  amount: number;
  description: string;
  category?: string;
  subcategory?: string;
  date: string;
  vendor?: string;
  isReimbursable: boolean;
  isTaxDeductible: boolean;
  receipt?: File;
}

// Dashboard Types
export interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  pendingInvoices: number;
  monthlyGrowth: number;
  cashFlow: CashFlowData[];
  recentTransactions: Transaction[];
  topCustomers: CustomerRevenue[];
  expenseCategories: CategoryExpense[];
}

export interface CashFlowData {
  date: string;
  income: number;
  expenses: number;
  net: number;
}

export interface CustomerRevenue {
  customerId: string;
  customerName: string;
  totalRevenue: number;
  invoiceCount: number;
}

export interface CategoryExpense {
  categoryId: string;
  categoryName: string;
  totalAmount: number;
  transactionCount: number;
}

// Search and Filter Types
export interface SearchFilters {
  query?: string;
  dateFrom?: string;
  dateTo?: string;
  category?: string;
  status?: string;
  amountMin?: number;
  amountMax?: number;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: number;
}

// Modal Types
export interface ModalState {
  [key: string]: boolean;
}

// Theme Types
export type Theme = 'light' | 'dark';

// UI State Types
export interface UIState {
  sidebarOpen: boolean;
  theme: Theme;
  notifications: Notification[];
  modals: ModalState;
}
