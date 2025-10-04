// API Constants
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    ENABLE_2FA: '/auth/2fa/enable',
    VERIFY_2FA: '/auth/2fa/verify',
  },
  USERS: {
    PROFILE: '/users/profile',
    MEMBERS: '/users/members',
    INVITE: '/users/invite',
  },
  ORGANIZATIONS: {
    CURRENT: '/organizations',
    UPDATE: '/organizations',
  },
  TRANSACTIONS: {
    LIST: '/transactions',
    CREATE: '/transactions',
    UPDATE: '/transactions/:id',
    DELETE: '/transactions/:id',
  },
  INVOICES: {
    LIST: '/invoices',
    CREATE: '/invoices',
    UPDATE: '/invoices/:id',
    DELETE: '/invoices/:id',
    SEND: '/invoices/:id/send',
  },
  EXPENSES: {
    LIST: '/expenses',
    CREATE: '/expenses',
    UPDATE: '/expenses/:id',
    DELETE: '/expenses/:id',
    APPROVE: '/expenses/:id/approve',
  },
  REPORTS: {
    LIST: '/reports',
    GENERATE: '/reports',
    DOWNLOAD: '/reports/:id/download',
  },
  AI: {
    CATEGORIZE: '/ai/categorize-transaction',
    QUERY: '/ai/query',
    INSIGHTS: '/ai/insights',
  },
  BANK: {
    ACCOUNTS: '/bank/accounts',
    CONNECT: '/bank/connect',
    SYNC: '/bank/sync',
  },
} as const;

// Currency Constants
export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
] as const;

// Timezone Constants
export const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Australia/Sydney',
] as const;

// Industry Constants
export const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Retail',
  'Manufacturing',
  'Construction',
  'Real Estate',
  'Consulting',
  'Legal',
  'Marketing',
  'Other',
] as const;

// Company Size Constants
export const COMPANY_SIZES = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501-1000 employees',
  '1000+ employees',
] as const;

// Default Categories
export const DEFAULT_CATEGORIES = {
  INCOME: [
    { name: 'Sales Revenue', subcategories: ['Product Sales', 'Service Sales'] },
    { name: 'Other Income', subcategories: ['Interest Income', 'Investment Income'] },
  ],
  EXPENSE: [
    { name: 'Office Supplies', subcategories: ['Stationery', 'Software', 'Hardware'] },
    { name: 'Travel', subcategories: ['Transportation', 'Accommodation', 'Meals'] },
    { name: 'Marketing', subcategories: ['Advertising', 'Promotional Materials'] },
    { name: 'Professional Services', subcategories: ['Legal', 'Accounting', 'Consulting'] },
    { name: 'Utilities', subcategories: ['Electricity', 'Internet', 'Phone'] },
    { name: 'Rent', subcategories: ['Office Rent', 'Equipment Rent'] },
  ],
} as const;

// Form Validation Constants
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
  PASSWORD_MIN_LENGTH: 8,
  ORGANIZATION_NAME_MIN_LENGTH: 2,
  USER_NAME_MIN_LENGTH: 2,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
} as const;

// Pagination Constants
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// Date Format Constants
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  INPUT: 'yyyy-MM-dd',
  DATETIME: 'MMM dd, yyyy HH:mm',
  TIME: 'HH:mm',
} as const;

// Status Colors
export const STATUS_COLORS = {
  DRAFT: 'gray',
  SENT: 'blue',
  VIEWED: 'yellow',
  PAID: 'green',
  OVERDUE: 'red',
  CANCELLED: 'gray',
  PENDING: 'yellow',
  APPROVED: 'green',
  REJECTED: 'red',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

// Modal Names
export const MODAL_NAMES = {
  CREATE_INVOICE: 'createInvoice',
  CREATE_EXPENSE: 'createExpense',
  CREATE_TRANSACTION: 'createTransaction',
  EDIT_PROFILE: 'editProfile',
  INVITE_USER: 'inviteUser',
  DELETE_CONFIRMATION: 'deleteConfirmation',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  THEME: 'theme',
  SIDEBAR_STATE: 'sidebarOpen',
  USER_PREFERENCES: 'userPreferences',
} as const;

// API Error Codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  SERVER_ERROR: 'SERVER_ERROR',
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_AI_FEATURES: 'ENABLE_AI_FEATURES',
  ENABLE_PLAID_INTEGRATION: 'ENABLE_PLAID_INTEGRATION',
  ENABLE_STRIPE_INTEGRATION: 'ENABLE_STRIPE_INTEGRATION',
  ENABLE_EMAIL_NOTIFICATIONS: 'ENABLE_EMAIL_NOTIFICATIONS',
  ENABLE_TWO_FACTOR_AUTH: 'ENABLE_TWO_FACTOR_AUTH',
} as const;
