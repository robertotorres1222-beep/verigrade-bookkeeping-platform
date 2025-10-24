import { test, expect } from '@playwright/test';

test.describe('Transactions', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'john.doe@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should create a new transaction', async ({ page }) => {
    await page.goto('/transactions');
    
    await page.click('[data-testid="add-transaction-button"]');
    
    await page.fill('[data-testid="amount"]', '100.50');
    await page.fill('[data-testid="description"]', 'Test transaction');
    await page.selectOption('[data-testid="type"]', 'income');
    await page.selectOption('[data-testid="category"]', 'sales');
    await page.fill('[data-testid="date"]', '2024-01-15');
    
    await page.click('[data-testid="save-transaction-button"]');
    
    await expect(page.locator('[data-testid="transaction-list"]')).toContainText('Test transaction');
    await expect(page.locator('[data-testid="transaction-list"]')).toContainText('$100.50');
  });

  test('should edit an existing transaction', async ({ page }) => {
    await page.goto('/transactions');
    
    // First create a transaction
    await page.click('[data-testid="add-transaction-button"]');
    await page.fill('[data-testid="amount"]', '100.50');
    await page.fill('[data-testid="description"]', 'Test transaction');
    await page.selectOption('[data-testid="type"]', 'income');
    await page.selectOption('[data-testid="category"]', 'sales');
    await page.fill('[data-testid="date"]', '2024-01-15');
    await page.click('[data-testid="save-transaction-button"]');
    
    // Then edit it
    await page.click('[data-testid="edit-transaction-button"]');
    await page.fill('[data-testid="amount"]', '150.75');
    await page.fill('[data-testid="description"]', 'Updated transaction');
    await page.click('[data-testid="save-transaction-button"]');
    
    await expect(page.locator('[data-testid="transaction-list"]')).toContainText('Updated transaction');
    await expect(page.locator('[data-testid="transaction-list"]')).toContainText('$150.75');
  });

  test('should delete a transaction', async ({ page }) => {
    await page.goto('/transactions');
    
    // First create a transaction
    await page.click('[data-testid="add-transaction-button"]');
    await page.fill('[data-testid="amount"]', '100.50');
    await page.fill('[data-testid="description"]', 'Test transaction');
    await page.selectOption('[data-testid="type"]', 'income');
    await page.selectOption('[data-testid="category"]', 'sales');
    await page.fill('[data-testid="date"]', '2024-01-15');
    await page.click('[data-testid="save-transaction-button"]');
    
    // Then delete it
    await page.click('[data-testid="delete-transaction-button"]');
    await page.click('[data-testid="confirm-delete-button"]');
    
    await expect(page.locator('[data-testid="transaction-list"]')).not.toContainText('Test transaction');
  });

  test('should filter transactions by type', async ({ page }) => {
    await page.goto('/transactions');
    
    // Create income transaction
    await page.click('[data-testid="add-transaction-button"]');
    await page.fill('[data-testid="amount"]', '100.50');
    await page.fill('[data-testid="description"]', 'Income transaction');
    await page.selectOption('[data-testid="type"]', 'income');
    await page.selectOption('[data-testid="category"]', 'sales');
    await page.fill('[data-testid="date"]', '2024-01-15');
    await page.click('[data-testid="save-transaction-button"]');
    
    // Create expense transaction
    await page.click('[data-testid="add-transaction-button"]');
    await page.fill('[data-testid="amount"]', '50.25');
    await page.fill('[data-testid="description"]', 'Expense transaction');
    await page.selectOption('[data-testid="type"]', 'expense');
    await page.selectOption('[data-testid="category"]', 'office');
    await page.fill('[data-testid="date"]', '2024-01-15');
    await page.click('[data-testid="save-transaction-button"]');
    
    // Filter by income
    await page.selectOption('[data-testid="type-filter"]', 'income');
    
    await expect(page.locator('[data-testid="transaction-list"]')).toContainText('Income transaction');
    await expect(page.locator('[data-testid="transaction-list"]')).not.toContainText('Expense transaction');
  });

  test('should show transaction summary', async ({ page }) => {
    await page.goto('/transactions');
    
    // Create multiple transactions
    await page.click('[data-testid="add-transaction-button"]');
    await page.fill('[data-testid="amount"]', '100.50');
    await page.fill('[data-testid="description"]', 'Income 1');
    await page.selectOption('[data-testid="type"]', 'income');
    await page.selectOption('[data-testid="category"]', 'sales');
    await page.fill('[data-testid="date"]', '2024-01-15');
    await page.click('[data-testid="save-transaction-button"]');
    
    await page.click('[data-testid="add-transaction-button"]');
    await page.fill('[data-testid="amount"]', '50.25');
    await page.fill('[data-testid="description"]', 'Expense 1');
    await page.selectOption('[data-testid="type"]', 'expense');
    await page.selectOption('[data-testid="category"]', 'office');
    await page.fill('[data-testid="date"]', '2024-01-15');
    await page.click('[data-testid="save-transaction-button"]');
    
    // Check summary
    await expect(page.locator('[data-testid="total-income"]')).toContainText('$100.50');
    await expect(page.locator('[data-testid="total-expense"]')).toContainText('$50.25');
    await expect(page.locator('[data-testid="net-income"]')).toContainText('$50.25');
  });
});



