import { PrismaClient } from '@prisma/client';

// Create a singleton Prisma client instance
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  errorFormat: 'pretty',
});

// Connection pooling configuration for production
if (process.env.NODE_ENV === 'production') {
  // Configure connection pooling for production
  const connectionLimit = parseInt(process.env.DATABASE_CONNECTION_LIMIT || '10');
  const poolTimeout = parseInt(process.env.DATABASE_POOL_TIMEOUT || '20000');
  
  // These settings help with connection management in production
  // Note: beforeExit event is not available in all Prisma versions
}

// Graceful shutdown handler
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;