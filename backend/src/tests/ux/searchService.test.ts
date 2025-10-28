import SearchService from '../../services/searchService';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    searchLog: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn()
    },
    savedSearch: {
      create: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn()
    },
    invoice: {
      findMany: jest.fn(),
      count: jest.fn()
    },
    expense: {
      findMany: jest.fn(),
      count: jest.fn()
    },
    client: {
      findMany: jest.fn(),
      count: jest.fn()
    },
    transaction: {
      findMany: jest.fn(),
      count: jest.fn()
    },
    document: {
      findMany: jest.fn(),
      count: jest.fn()
    }
  }))
}));

describe('SearchService', () => {
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = new PrismaClient();
    jest.clearAllMocks();
  });

  describe('search', () => {
    it('should perform search successfully', async () => {
      const mockInvoices = [
        {
          id: 'invoice-1',
          invoiceNumber: 'INV-001',
          totalAmount: 1000,
          status: 'paid',
          client: { name: 'Test Client' },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockPrisma.invoice.findMany.mockResolvedValue(mockInvoices);
      mockPrisma.expense.findMany.mockResolvedValue([]);
      mockPrisma.client.findMany.mockResolvedValue([]);
      mockPrisma.transaction.findMany.mockResolvedValue([]);
      mockPrisma.document.findMany.mockResolvedValue([]);
      mockPrisma.searchLog.create.mockResolvedValue({});

      const result = await SearchService.search('test', 'user-123');

      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(1);
      expect(result.results[0].type).toBe('invoice');
      expect(result.results[0].title).toBe('Invoice #INV-001');
    });

    it('should handle search errors', async () => {
      mockPrisma.invoice.findMany.mockRejectedValue(new Error('Database error'));

      await expect(SearchService.search('test', 'user-123'))
        .rejects.toThrow('Search failed: Database error');
    });

    it('should apply filters correctly', async () => {
      const filters = {
        type: ['invoice'],
        dateRange: {
          start: new Date('2023-01-01'),
          end: new Date('2023-12-31')
        }
      };

      mockPrisma.invoice.findMany.mockResolvedValue([]);
      mockPrisma.expense.findMany.mockResolvedValue([]);
      mockPrisma.client.findMany.mockResolvedValue([]);
      mockPrisma.transaction.findMany.mockResolvedValue([]);
      mockPrisma.document.findMany.mockResolvedValue([]);
      mockPrisma.searchLog.create.mockResolvedValue({});

      await SearchService.search('test', 'user-123', filters);

      expect(mockPrisma.invoice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: 'invoice',
            createdAt: {
              gte: filters.dateRange.start,
              lte: filters.dateRange.end
            }
          })
        })
      );
    });
  });

  describe('getSuggestions', () => {
    it('should return search suggestions', async () => {
      const result = await SearchService.getSuggestions('test', 'user-123');

      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle empty query', async () => {
      const result = await SearchService.getSuggestions('', 'user-123');

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('saveSearch', () => {
    it('should save search successfully', async () => {
      const mockSavedSearch = {
        id: 'search-1',
        userId: 'user-123',
        name: 'Test Search',
        query: 'test query',
        filters: '{}',
        isPublic: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.savedSearch.create.mockResolvedValue(mockSavedSearch);

      const result = await SearchService.saveSearch(
        'user-123',
        'Test Search',
        'test query',
        {},
        false
      );

      expect(result).toEqual(mockSavedSearch);
      expect(mockPrisma.savedSearch.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          name: 'Test Search',
          query: 'test query',
          filters: '{}',
          isPublic: false
        }
      });
    });

    it('should handle save search errors', async () => {
      mockPrisma.savedSearch.create.mockRejectedValue(new Error('Database error'));

      await expect(SearchService.saveSearch('user-123', 'Test', 'query', {}))
        .rejects.toThrow('Failed to save search: Database error');
    });
  });

  describe('getSavedSearches', () => {
    it('should get saved searches for user', async () => {
      const mockSearches = [
        {
          id: 'search-1',
          userId: 'user-123',
          name: 'Test Search',
          query: 'test query',
          filters: '{}',
          isPublic: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockPrisma.savedSearch.findMany.mockResolvedValue(mockSearches);

      const result = await SearchService.getSavedSearches('user-123');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Test Search');
    });

    it('should handle get saved searches errors', async () => {
      mockPrisma.savedSearch.findMany.mockRejectedValue(new Error('Database error'));

      const result = await SearchService.getSavedSearches('user-123');

      expect(result).toEqual([]);
    });
  });

  describe('deleteSavedSearch', () => {
    it('should delete saved search successfully', async () => {
      mockPrisma.savedSearch.deleteMany.mockResolvedValue({ count: 1 });

      await SearchService.deleteSavedSearch('search-1', 'user-123');

      expect(mockPrisma.savedSearch.deleteMany).toHaveBeenCalledWith({
        where: {
          id: 'search-1',
          userId: 'user-123'
        }
      });
    });

    it('should handle delete saved search errors', async () => {
      mockPrisma.savedSearch.deleteMany.mockRejectedValue(new Error('Database error'));

      await expect(SearchService.deleteSavedSearch('search-1', 'user-123'))
        .rejects.toThrow('Failed to delete saved search: Database error');
    });
  });

  describe('getSearchAnalytics', () => {
    it('should get search analytics', async () => {
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');

      mockPrisma.searchLog.count.mockResolvedValue(100);

      const result = await SearchService.getSearchAnalytics('user-123', startDate, endDate);

      expect(result).toHaveProperty('totalSearches');
      expect(result).toHaveProperty('popularQueries');
      expect(result).toHaveProperty('searchPerformance');
      expect(result).toHaveProperty('userBehavior');
    });

    it('should handle analytics errors', async () => {
      mockPrisma.searchLog.count.mockRejectedValue(new Error('Database error'));

      await expect(SearchService.getSearchAnalytics('user-123', new Date(), new Date()))
        .rejects.toThrow('Failed to get search analytics: Database error');
    });
  });
});










