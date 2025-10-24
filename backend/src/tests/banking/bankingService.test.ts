import BankingService from '../../services/bankingService';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    bankAccount: {
      create: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn()
    },
    bankTransaction: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn()
    },
    bankFeedRule: {
      create: jest.fn(),
      findMany: jest.fn()
    }
  }))
}));

describe('BankingService', () => {
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = new PrismaClient();
    jest.clearAllMocks();
  });

  describe('createBankAccount', () => {
    it('should create a bank account successfully', async () => {
      const mockAccount = {
        id: 'account-123',
        userId: 'user-123',
        accountName: 'Test Account',
        accountNumber: '123456789',
        bankName: 'Test Bank',
        accountType: 'checking',
        currency: 'USD',
        isActive: true,
        balance: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.bankAccount.create.mockResolvedValue(mockAccount);

      const result = await BankingService.createBankAccount(
        'user-123',
        'Test Account',
        '123456789',
        'Test Bank',
        'checking',
        'USD'
      );

      expect(result).toEqual(mockAccount);
      expect(mockPrisma.bankAccount.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          accountName: 'Test Account',
          accountNumber: '123456789',
          bankName: 'Test Bank',
          accountType: 'checking',
          currency: 'USD',
          isActive: true,
          balance: 0,
          metadata: {}
        }
      });
    });

    it('should handle creation errors', async () => {
      mockPrisma.bankAccount.create.mockRejectedValue(new Error('Database error'));

      await expect(BankingService.createBankAccount(
        'user-123',
        'Test Account',
        '123456789',
        'Test Bank',
        'checking'
      )).rejects.toThrow('Failed to create bank account: Database error');
    });
  });

  describe('getUserBankAccounts', () => {
    it('should get user bank accounts', async () => {
      const mockAccounts = [
        {
          id: 'account-1',
          userId: 'user-123',
          accountName: 'Account 1',
          accountNumber: '123456789',
          bankName: 'Bank 1',
          accountType: 'checking',
          currency: 'USD',
          isActive: true,
          balance: 1000,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'account-2',
          userId: 'user-123',
          accountName: 'Account 2',
          accountNumber: '987654321',
          bankName: 'Bank 2',
          accountType: 'savings',
          currency: 'USD',
          isActive: true,
          balance: 5000,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockPrisma.bankAccount.findMany.mockResolvedValue(mockAccounts);

      const result = await BankingService.getUserBankAccounts('user-123');

      expect(result).toEqual(mockAccounts);
      expect(mockPrisma.bankAccount.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123', isActive: true },
        orderBy: { createdAt: 'desc' }
      });
    });
  });

  describe('updateBankAccount', () => {
    it('should update bank account successfully', async () => {
      const mockUpdatedAccount = {
        id: 'account-123',
        userId: 'user-123',
        accountName: 'Updated Account',
        accountNumber: '123456789',
        bankName: 'Test Bank',
        accountType: 'checking',
        currency: 'USD',
        isActive: true,
        balance: 1000,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.bankAccount.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.bankAccount.findUnique.mockResolvedValue(mockUpdatedAccount);

      const result = await BankingService.updateBankAccount(
        'account-123',
        'user-123',
        { accountName: 'Updated Account' }
      );

      expect(result).toEqual(mockUpdatedAccount);
      expect(mockPrisma.bankAccount.updateMany).toHaveBeenCalledWith({
        where: { id: 'account-123', userId: 'user-123' },
        data: { accountName: 'Updated Account' }
      });
    });

    it('should handle unauthorized update', async () => {
      mockPrisma.bankAccount.updateMany.mockResolvedValue({ count: 0 });

      await expect(BankingService.updateBankAccount(
        'account-123',
        'user-123',
        { accountName: 'Updated Account' }
      )).rejects.toThrow('Bank account not found or unauthorized');
    });
  });

  describe('syncBankAccount', () => {
    it('should sync bank account successfully', async () => {
      const mockAccount = {
        id: 'account-123',
        userId: 'user-123',
        accountName: 'Test Account',
        accountNumber: '123456789',
        bankName: 'Test Bank',
        accountType: 'checking',
        currency: 'USD',
        isActive: true,
        balance: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.bankAccount.findFirst.mockResolvedValue(mockAccount);
      mockPrisma.bankAccount.update.mockResolvedValue({
        ...mockAccount,
        balance: 1000,
        lastSyncAt: new Date()
      });

      const result = await BankingService.syncBankAccount('account-123', 'user-123');

      expect(result.success).toBe(true);
      expect(result.transactionsImported).toBeDefined();
      expect(result.balance).toBeDefined();
      expect(result.lastSyncAt).toBeDefined();
    });

    it('should handle sync errors', async () => {
      mockPrisma.bankAccount.findFirst.mockResolvedValue(null);

      await expect(BankingService.syncBankAccount('account-123', 'user-123'))
        .rejects.toThrow('Bank account not found or unauthorized');
    });
  });

  describe('getBankingDashboard', () => {
    it('should get banking dashboard data', async () => {
      const mockAccounts = [
        {
          id: 'account-1',
          userId: 'user-123',
          accountName: 'Account 1',
          accountNumber: '123456789',
          bankName: 'Bank 1',
          accountType: 'checking',
          currency: 'USD',
          isActive: true,
          balance: 1000,
          availableBalance: 1000,
          lastSyncAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const mockTransactions = [
        {
          id: 'tx-1',
          accountId: 'account-1',
          amount: 100,
          description: 'Test Transaction',
          date: new Date(),
          type: 'credit'
        }
      ];

      mockPrisma.bankAccount.findMany.mockResolvedValue(mockAccounts);
      mockPrisma.bankTransaction.findMany.mockResolvedValue(mockTransactions);
      mockPrisma.bankTransaction.count.mockResolvedValue(5);

      const result = await BankingService.getBankingDashboard('user-123');

      expect(result).toHaveProperty('totalAccounts');
      expect(result).toHaveProperty('activeAccounts');
      expect(result).toHaveProperty('totalBalance');
      expect(result).toHaveProperty('totalAvailable');
      expect(result).toHaveProperty('recentTransactions');
      expect(result).toHaveProperty('unreconciledTransactions');
      expect(result).toHaveProperty('pendingTransactions');
      expect(result).toHaveProperty('accountHealth');
      expect(result).toHaveProperty('cashFlow');
    });
  });

  describe('getBankTransactions', () => {
    it('should get bank transactions with filters', async () => {
      const mockTransactions = [
        {
          id: 'tx-1',
          accountId: 'account-123',
          amount: 100,
          description: 'Test Transaction',
          date: new Date(),
          type: 'credit'
        }
      ];

      mockPrisma.bankTransaction.findMany.mockResolvedValue(mockTransactions);

      const result = await BankingService.getBankTransactions(
        'account-123',
        'user-123',
        new Date('2023-01-01'),
        new Date('2023-12-31'),
        50,
        0
      );

      expect(result).toEqual(mockTransactions);
      expect(mockPrisma.bankTransaction.findMany).toHaveBeenCalledWith({
        where: {
          accountId: 'account-123',
          date: {
            gte: new Date('2023-01-01'),
            lte: new Date('2023-12-31')
          }
        },
        orderBy: { date: 'desc' },
        take: 50,
        skip: 0
      });
    });
  });

  describe('createBankFeedRule', () => {
    it('should create bank feed rule successfully', async () => {
      const mockRule = {
        id: 'rule-123',
        userId: 'user-123',
        name: 'Test Rule',
        conditions: [{ field: 'description', operator: 'contains', value: 'test' }],
        actions: [{ type: 'categorize', value: 'test' }],
        isActive: true,
        priority: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.bankFeedRule.create.mockResolvedValue(mockRule);

      const result = await BankingService.createBankFeedRule(
        'user-123',
        'Test Rule',
        [{ field: 'description', operator: 'contains', value: 'test' }],
        [{ type: 'categorize', value: 'test' }],
        0
      );

      expect(result).toEqual(mockRule);
      expect(mockPrisma.bankFeedRule.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          name: 'Test Rule',
          conditions: [{ field: 'description', operator: 'contains', value: 'test' }],
          actions: [{ type: 'categorize', value: 'test' }],
          isActive: true,
          priority: 0
        }
      });
    });
  });

  describe('performReconciliation', () => {
    it('should perform reconciliation successfully', async () => {
      const mockBankTransactions = [
        {
          id: 'bank-tx-1',
          accountId: 'account-123',
          amount: 100,
          description: 'Test Transaction',
          date: new Date(),
          type: 'credit',
          isReconciled: false
        }
      ];

      const mockBookTransactions = [
        {
          id: 'book-tx-1',
          amount: 100,
          description: 'Test Transaction',
          date: new Date()
        }
      ];

      // Mock the private methods by spying on them
      const getBankTransactionsSpy = jest.spyOn(BankingService as any, 'getBankTransactions');
      const getBookTransactionsSpy = jest.spyOn(BankingService as any, 'getBookTransactions');
      const findBestMatchSpy = jest.spyOn(BankingService as any, 'findBestMatch');
      const createReconciliationMatchSpy = jest.spyOn(BankingService as any, 'createReconciliationMatch');

      getBankTransactionsSpy.mockResolvedValue(mockBankTransactions);
      getBookTransactionsSpy.mockResolvedValue(mockBookTransactions);
      findBestMatchSpy.mockResolvedValue({
        id: 'book-tx-1',
        confidence: 0.95,
        matchType: 'exact'
      });
      createReconciliationMatchSpy.mockResolvedValue({
        id: 'match-1',
        bankTransactionId: 'bank-tx-1',
        bookTransactionId: 'book-tx-1',
        confidence: 0.95,
        matchType: 'exact'
      });

      const result = await BankingService.performReconciliation(
        'account-123',
        'user-123',
        new Date('2023-01-01'),
        new Date('2023-12-31')
      );

      expect(result).toHaveProperty('matches');
      expect(result).toHaveProperty('unmatchedBank');
      expect(result).toHaveProperty('unmatchedBook');
      expect(result).toHaveProperty('reconciliationScore');
    });
  });

  describe('importBankStatement', () => {
    it('should import bank statement successfully', async () => {
      const mockFileData = Buffer.from('test data');
      const mockParsedTransactions = [
        {
          externalId: 'ext-1',
          date: new Date(),
          amount: 100,
          description: 'Test Transaction',
          type: 'credit',
          metadata: {}
        }
      ];

      const parseStatementFileSpy = jest.spyOn(BankingService as any, 'parseStatementFile');
      parseStatementFileSpy.mockResolvedValue(mockParsedTransactions);

      mockPrisma.bankTransaction.findFirst.mockResolvedValue(null);
      mockPrisma.bankTransaction.create.mockResolvedValue({
        id: 'tx-1',
        accountId: 'account-123',
        externalId: 'ext-1',
        date: new Date(),
        amount: 100,
        description: 'Test Transaction',
        type: 'credit',
        status: 'posted',
        isReconciled: false,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await BankingService.importBankStatement(
        'account-123',
        'user-123',
        mockFileData,
        'csv'
      );

      expect(result.success).toBe(true);
      expect(result.transactionsImported).toBe(1);
      expect(result.duplicatesSkipped).toBe(0);
      expect(result.errors).toEqual([]);
    });

    it('should handle duplicate transactions', async () => {
      const mockFileData = Buffer.from('test data');
      const mockParsedTransactions = [
        {
          externalId: 'ext-1',
          date: new Date(),
          amount: 100,
          description: 'Test Transaction',
          type: 'credit',
          metadata: {}
        }
      ];

      const parseStatementFileSpy = jest.spyOn(BankingService as any, 'parseStatementFile');
      parseStatementFileSpy.mockResolvedValue(mockParsedTransactions);

      mockPrisma.bankTransaction.findFirst.mockResolvedValue({
        id: 'existing-tx',
        accountId: 'account-123',
        externalId: 'ext-1',
        amount: 100,
        date: new Date(),
        description: 'Test Transaction'
      });

      const result = await BankingService.importBankStatement(
        'account-123',
        'user-123',
        mockFileData,
        'csv'
      );

      expect(result.success).toBe(true);
      expect(result.transactionsImported).toBe(0);
      expect(result.duplicatesSkipped).toBe(1);
    });
  });
});






