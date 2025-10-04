export const config = {
  // Database
  DATABASE_URL: process.env['DATABASE_URL'] || 'postgresql://postgres:postgres@localhost:5432/verigrade_dev',
  
  // Authentication
  JWT_SECRET: process.env['JWT_SECRET'] || 'your-super-secret-jwt-key-here',
  JWT_EXPIRES_IN: process.env['JWT_EXPIRES_IN'] || '7d',
  REFRESH_TOKEN_SECRET: process.env['REFRESH_TOKEN_SECRET'] || 'your-refresh-token-secret',
  REFRESH_TOKEN_EXPIRES_IN: process.env['REFRESH_TOKEN_EXPIRES_IN'] || '30d',
  
  // Redis
  REDIS_URL: process.env['REDIS_URL'] || 'redis://localhost:6379',
  
  // Server Configuration
  NODE_ENV: process.env['NODE_ENV'] || 'development',
  PORT: parseInt(process.env['PORT'] || '3001'),
  API_VERSION: process.env['API_VERSION'] || 'v1',
  
  // External APIs
  OPENAI_API_KEY: process.env['OPENAI_API_KEY'],
  PLAID_CLIENT_ID: process.env['PLAID_CLIENT_ID'],
  PLAID_SECRET: process.env['PLAID_SECRET'],
  PLAID_ENVIRONMENT: process.env['PLAID_ENVIRONMENT'] || 'sandbox',
  
  // Payment Processing
  STRIPE_SECRET_KEY: process.env['STRIPE_SECRET_KEY'],
  STRIPE_PUBLISHABLE_KEY: process.env['STRIPE_PUBLISHABLE_KEY'],
  STRIPE_WEBHOOK_SECRET: process.env['STRIPE_WEBHOOK_SECRET'],
  
  // Email Configuration
  SMTP_HOST: process.env['SMTP_HOST'] || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env['SMTP_PORT'] || '587'),
  SMTP_SECURE: process.env['SMTP_SECURE'] === 'true',
  SMTP_USER: process.env['SMTP_USER'],
  SMTP_PASS: process.env['SMTP_PASS'],
  FROM_EMAIL: process.env['FROM_EMAIL'] || 'noreply@verigrade.com',
  
  // File Storage
  AWS_ACCESS_KEY_ID: process.env['AWS_ACCESS_KEY_ID'],
  AWS_SECRET_ACCESS_KEY: process.env['AWS_SECRET_ACCESS_KEY'],
  AWS_REGION: process.env['AWS_REGION'] || 'us-east-1',
  AWS_S3_BUCKET: process.env['AWS_S3_BUCKET'],
  AWS_CLOUDFRONT_DOMAIN: process.env['AWS_CLOUDFRONT_DOMAIN'],
  
  // Security
  BCRYPT_ROUNDS: parseInt(process.env['BCRYPT_ROUNDS'] || '12'),
  SESSION_SECRET: process.env['SESSION_SECRET'] || 'your-session-secret',
  RATE_LIMIT_WINDOW_MS: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000'),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100'),
  
  // CORS
  CORS_ORIGIN: process.env['CORS_ORIGIN'] || 'http://localhost:3000',
  FRONTEND_URL: process.env['FRONTEND_URL'] || 'http://localhost:3000',
  
  // Logging
  LOG_LEVEL: process.env['LOG_LEVEL'] || 'info',
  LOG_FILE: process.env['LOG_FILE'] || 'logs/app.log',
  
  // Feature Flags
  ENABLE_AI_FEATURES: process.env['ENABLE_AI_FEATURES'] === 'true',
  ENABLE_PLAID_INTEGRATION: process.env['ENABLE_PLAID_INTEGRATION'] === 'true',
  ENABLE_STRIPE_INTEGRATION: process.env['ENABLE_STRIPE_INTEGRATION'] === 'true',
  ENABLE_EMAIL_NOTIFICATIONS: process.env['ENABLE_EMAIL_NOTIFICATIONS'] === 'true',
  
  // Monitoring
  SENTRY_DSN: process.env['SENTRY_DSN'],
};
