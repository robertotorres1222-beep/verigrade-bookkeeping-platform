import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { join } from 'path';

const prisma = new PrismaClient();

// Setup test database
beforeAll(async () => {
  // Create test database
  execSync('npx prisma migrate deploy', {
    cwd: join(__dirname, '..', '..'),
    stdio: 'inherit',
  });
});

// Clean up after each test
afterEach(async () => {
  // Clean up test data
  await prisma.user.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.expense.deleteMany();
});

// Clean up after all tests
afterAll(async () => {
  await prisma.$disconnect();
});

export { prisma };