// API Configuration for Mobile App
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3001' 
  : 'https://api.verigrade.com';

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password'
  },
  
  // User Management
  USER: {
    PROFILE: '/api/user/profile',
    PREFERENCES: '/api/user/preferences',
    SETTINGS: '/api/user/settings'
  },
  
  // Expenses
  EXPENSES: {
    LIST: '/api/expenses',
    CREATE: '/api/expenses',
    UPDATE: '/api/expenses',
    DELETE: '/api/expenses',
    CATEGORIES: '/api/expenses/categories',
    RECEIPTS: '/api/expenses/receipts'
  },
  
  // Invoices
  INVOICES: {
    LIST: '/api/invoices',
    CREATE: '/api/invoices',
    UPDATE: '/api/invoices',
    DELETE: '/api/invoices',
    SEND: '/api/invoices/send',
    PAY: '/api/invoices/pay'
  },
  
  // Clients
  CLIENTS: {
    LIST: '/api/clients',
    CREATE: '/api/clients',
    UPDATE: '/api/clients',
    DELETE: '/api/clients'
  },
  
  // Banking
  BANKING: {
    ACCOUNTS: '/api/banking/accounts',
    TRANSACTIONS: '/api/banking/transactions',
    RECONCILE: '/api/banking/reconcile',
    SYNC: '/api/banking/sync'
  },
  
  // Time Tracking
  TIME: {
    ENTRIES: '/api/time/entries',
    PROJECTS: '/api/time/projects',
    TIMESHEETS: '/api/time/timesheets',
    APPROVE: '/api/time/approve'
  },
  
  // Mileage
  MILEAGE: {
    TRIPS: '/api/mileage/trips',
    REPORTS: '/api/mileage/reports',
    EXPORT: '/api/mileage/export'
  },
  
  // Voice Notes
  VOICE: {
    NOTES: '/api/voice/notes',
    TRANSCRIBE: '/api/voice/transcribe',
    SEARCH: '/api/voice/search'
  },
  
  // Sync
  SYNC: {
    STATUS: '/api/sync/status',
    PUSH: '/api/sync/push',
    PULL: '/api/sync/pull',
    CONFLICT: '/api/sync/conflict'
  },
  
  // Payments
  PAYMENTS: {
    PROCESS: '/api/payments/process',
    METHODS: '/api/payments/methods',
    HISTORY: '/api/payments/history',
    REFUND: '/api/payments/refund'
  },
  
  // Notifications
  NOTIFICATIONS: {
    LIST: '/api/notifications',
    MARK_READ: '/api/notifications/read',
    PREFERENCES: '/api/notifications/preferences'
  },
  
  // Reports
  REPORTS: {
    GENERATE: '/api/reports/generate',
    SCHEDULE: '/api/reports/schedule',
    EXPORT: '/api/reports/export'
  }
};

export const API_TIMEOUT = 30000; // 30 seconds
export const API_RETRY_ATTEMPTS = 3;
export const API_RETRY_DELAY = 1000; // 1 second

export const SYNC_CONFIG = {
  INTERVAL: 30000, // 30 seconds
  BATCH_SIZE: 50,
  MAX_RETRIES: 3,
  CONFLICT_RESOLUTION: 'manual' as const
};

export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  COMPRESSION_QUALITY: 0.8
};

export const LOCATION_CONFIG = {
  ACCURACY: 'high' as const,
  TIMEOUT: 10000,
  MAX_AGE: 5000
};

export const VOICE_CONFIG = {
  SAMPLE_RATE: 22050,
  CHANNELS: 1,
  BIT_RATE: 32000,
  FORMAT: 'm4a'
};

export const NOTIFICATION_CONFIG = {
  TIMER_REMINDER: 3600, // 1 hour
  EXPENSE_REMINDER: 86400, // 24 hours
  SYNC_REMINDER: 7200, // 2 hours
  BREAK_REMINDER: 3600 // 1 hour
};










