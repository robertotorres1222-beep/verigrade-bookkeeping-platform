import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

export interface SearchResult {
  id: string;
  type: 'invoice' | 'expense' | 'client' | 'transaction' | 'document' | 'report';
  title: string;
  description: string;
  url: string;
  score: number;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchFilters {
  type?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  amountRange?: {
    min: number;
    max: number;
  };
  status?: string[];
  tags?: string[];
}

export interface SearchSuggestion {
  text: string;
  type: 'query' | 'filter' | 'recent' | 'saved';
  count?: number;
  filters?: SearchFilters;
}

export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  query: string;
  filters: SearchFilters;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchAnalytics {
  totalSearches: number;
  popularQueries: Array<{
    query: string;
    count: number;
  }>;
  searchPerformance: {
    averageResponseTime: number;
    successRate: number;
  };
  userBehavior: {
    mostSearchedTypes: Array<{
      type: string;
      count: number;
    }>;
    searchAbandonmentRate: number;
  };
}

class SearchService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
    logger.info('[SearchService] Initialized');
  }

  /**
   * Performs a full-text search across all searchable entities
   */
  public async search(
    query: string,
    userId: string,
    filters: SearchFilters = {},
    limit: number = 50,
    offset: number = 0
  ): Promise<{
    results: SearchResult[];
    total: number;
    suggestions: SearchSuggestion[];
    executionTime: number;
  }> {
    const startTime = Date.now();
    
    try {
      // Log search for analytics
      await this.logSearch(query, userId, filters);

      // Build search query
      const searchTerms = this.parseSearchQuery(query);
      const whereClause = this.buildWhereClause(searchTerms, filters, userId);

      // Search across different entities
      const [invoices, expenses, clients, transactions, documents] = await Promise.all([
        this.searchInvoices(whereClause, limit, offset),
        this.searchExpenses(whereClause, limit, offset),
        this.searchClients(whereClause, limit, offset),
        this.searchTransactions(whereClause, limit, offset),
        this.searchDocuments(whereClause, limit, offset)
      ]);

      // Combine and rank results
      const allResults = [
        ...invoices.map(this.mapInvoiceToSearchResult),
        ...expenses.map(this.mapExpenseToSearchResult),
        ...clients.map(this.mapClientToSearchResult),
        ...transactions.map(this.mapTransactionToSearchResult),
        ...documents.map(this.mapDocumentToSearchResult)
      ];

      // Sort by relevance score
      const rankedResults = this.rankResults(allResults, searchTerms);
      const paginatedResults = rankedResults.slice(offset, offset + limit);

      // Generate suggestions
      const suggestions = await this.generateSuggestions(query, userId);

      const executionTime = Date.now() - startTime;

      logger.info(`[SearchService] Search completed for user ${userId}: ${paginatedResults.length} results in ${executionTime}ms`);

      return {
        results: paginatedResults,
        total: rankedResults.length,
        suggestions,
        executionTime
      };
    } catch (error: any) {
      logger.error(`[SearchService] Search error for user ${userId}:`, error);
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  /**
   * Gets search suggestions based on query
   */
  public async getSuggestions(
    query: string,
    userId: string,
    limit: number = 10
  ): Promise<SearchSuggestion[]> {
    try {
      const suggestions: SearchSuggestion[] = [];

      // Query suggestions
      const querySuggestions = await this.getQuerySuggestions(query, userId, limit);
      suggestions.push(...querySuggestions);

      // Filter suggestions
      const filterSuggestions = await this.getFilterSuggestions(query, userId, limit);
      suggestions.push(...filterSuggestions);

      // Recent searches
      const recentSearches = await this.getRecentSearches(userId, limit);
      suggestions.push(...recentSearches);

      // Saved searches
      const savedSearches = await this.getSavedSearches(userId, query, limit);
      suggestions.push(...savedSearches);

      return suggestions.slice(0, limit);
    } catch (error: any) {
      logger.error(`[SearchService] Suggestions error for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Saves a search for future use
   */
  public async saveSearch(
    userId: string,
    name: string,
    query: string,
    filters: SearchFilters,
    isPublic: boolean = false
  ): Promise<SavedSearch> {
    try {
      const savedSearch = await this.prisma.savedSearch.create({
        data: {
          userId,
          name,
          query,
          filters: JSON.stringify(filters),
          isPublic
        }
      });

      logger.info(`[SearchService] Search saved for user ${userId}: ${name}`);
      return savedSearch as SavedSearch;
    } catch (error: any) {
      logger.error(`[SearchService] Error saving search for user ${userId}:`, error);
      throw new Error(`Failed to save search: ${error.message}`);
    }
  }

  /**
   * Gets saved searches for a user
   */
  public async getSavedSearches(userId: string): Promise<SavedSearch[]> {
    try {
      const savedSearches = await this.prisma.savedSearch.findMany({
        where: {
          OR: [
            { userId },
            { isPublic: true }
          ]
        },
        orderBy: { updatedAt: 'desc' }
      });

      return savedSearches.map(search => ({
        ...search,
        filters: JSON.parse(search.filters as string)
      })) as SavedSearch[];
    } catch (error: any) {
      logger.error(`[SearchService] Error getting saved searches for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Deletes a saved search
   */
  public async deleteSavedSearch(searchId: string, userId: string): Promise<void> {
    try {
      await this.prisma.savedSearch.deleteMany({
        where: {
          id: searchId,
          userId
        }
      });

      logger.info(`[SearchService] Saved search deleted: ${searchId}`);
    } catch (error: any) {
      logger.error(`[SearchService] Error deleting saved search ${searchId}:`, error);
      throw new Error(`Failed to delete saved search: ${error.message}`);
    }
  }

  /**
   * Gets search analytics
   */
  public async getSearchAnalytics(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<SearchAnalytics> {
    try {
      const [totalSearches, popularQueries, searchPerformance, userBehavior] = await Promise.all([
        this.getTotalSearches(userId, startDate, endDate),
        this.getPopularQueries(userId, startDate, endDate),
        this.getSearchPerformance(userId, startDate, endDate),
        this.getUserBehavior(userId, startDate, endDate)
      ]);

      return {
        totalSearches,
        popularQueries,
        searchPerformance,
        userBehavior
      };
    } catch (error: any) {
      logger.error(`[SearchService] Error getting search analytics for user ${userId}:`, error);
      throw new Error(`Failed to get search analytics: ${error.message}`);
    }
  }

  /**
   * Parses search query into terms
   */
  private parseSearchQuery(query: string): string[] {
    return query
      .toLowerCase()
      .split(/\s+/)
      .filter(term => term.length > 0)
      .map(term => term.replace(/[^\w]/g, ''));
  }

  /**
   * Builds where clause for search
   */
  private buildWhereClause(searchTerms: string[], filters: SearchFilters, userId: string): any {
    const where: any = {
      userId,
      OR: searchTerms.map(term => ({
        OR: [
          { title: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
          { content: { contains: term, mode: 'insensitive' } }
        ]
      }))
    };

    // Apply filters
    if (filters.type && filters.type.length > 0) {
      where.type = { in: filters.type };
    }

    if (filters.dateRange) {
      where.createdAt = {
        gte: filters.dateRange.start,
        lte: filters.dateRange.end
      };
    }

    if (filters.amountRange) {
      where.amount = {
        gte: filters.amountRange.min,
        lte: filters.amountRange.max
      };
    }

    if (filters.status && filters.status.length > 0) {
      where.status = { in: filters.status };
    }

    return where;
  }

  /**
   * Searches in invoices
   */
  private async searchInvoices(where: any, limit: number, offset: number): Promise<any[]> {
    return await this.prisma.invoice.findMany({
      where: { ...where, type: 'invoice' },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Searches in expenses
   */
  private async searchExpenses(where: any, limit: number, offset: number): Promise<any[]> {
    return await this.prisma.expense.findMany({
      where: { ...where, type: 'expense' },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Searches in clients
   */
  private async searchClients(where: any, limit: number, offset: number): Promise<any[]> {
    return await this.prisma.client.findMany({
      where: { ...where, type: 'client' },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Searches in transactions
   */
  private async searchTransactions(where: any, limit: number, offset: number): Promise<any[]> {
    return await this.prisma.transaction.findMany({
      where: { ...where, type: 'transaction' },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Searches in documents
   */
  private async searchDocuments(where: any, limit: number, offset: number): Promise<any[]> {
    return await this.prisma.document.findMany({
      where: { ...where, type: 'document' },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Maps invoice to search result
   */
  private mapInvoiceToSearchResult(invoice: any): SearchResult {
    return {
      id: invoice.id,
      type: 'invoice',
      title: `Invoice #${invoice.invoiceNumber}`,
      description: `${invoice.client?.name || 'Unknown Client'} - ${invoice.totalAmount}`,
      url: `/invoices/${invoice.id}`,
      score: 0,
      metadata: {
        amount: invoice.totalAmount,
        status: invoice.status,
        client: invoice.client?.name
      },
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt
    };
  }

  /**
   * Maps expense to search result
   */
  private mapExpenseToSearchResult(expense: any): SearchResult {
    return {
      id: expense.id,
      type: 'expense',
      title: expense.description,
      description: `${expense.category} - ${expense.amount}`,
      url: `/expenses/${expense.id}`,
      score: 0,
      metadata: {
        amount: expense.amount,
        category: expense.category,
        date: expense.date
      },
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt
    };
  }

  /**
   * Maps client to search result
   */
  private mapClientToSearchResult(client: any): SearchResult {
    return {
      id: client.id,
      type: 'client',
      title: client.name,
      description: client.email || client.phone || 'No contact info',
      url: `/clients/${client.id}`,
      score: 0,
      metadata: {
        email: client.email,
        phone: client.phone,
        status: client.status
      },
      createdAt: client.createdAt,
      updatedAt: client.updatedAt
    };
  }

  /**
   * Maps transaction to search result
   */
  private mapTransactionToSearchResult(transaction: any): SearchResult {
    return {
      id: transaction.id,
      type: 'transaction',
      title: transaction.description,
      description: `${transaction.amount} - ${transaction.account?.name || 'Unknown Account'}`,
      url: `/banking/transactions/${transaction.id}`,
      score: 0,
      metadata: {
        amount: transaction.amount,
        account: transaction.account?.name,
        date: transaction.date
      },
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt
    };
  }

  /**
   * Maps document to search result
   */
  private mapDocumentToSearchResult(document: any): SearchResult {
    return {
      id: document.id,
      type: 'document',
      title: document.name,
      description: document.description || 'No description',
      url: `/documents/${document.id}`,
      score: 0,
      metadata: {
        type: document.documentType,
        size: document.size,
        uploadedAt: document.uploadedAt
      },
      createdAt: document.createdAt,
      updatedAt: document.updatedAt
    };
  }

  /**
   * Ranks search results by relevance
   */
  private rankResults(results: SearchResult[], searchTerms: string[]): SearchResult[] {
    return results.map(result => {
      let score = 0;
      
      // Title match (highest weight)
      searchTerms.forEach(term => {
        if (result.title.toLowerCase().includes(term)) {
          score += 10;
        }
        if (result.description.toLowerCase().includes(term)) {
          score += 5;
        }
      });

      // Recency boost
      const daysSinceCreated = (Date.now() - result.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      score += Math.max(0, 10 - daysSinceCreated / 30);

      return { ...result, score };
    }).sort((a, b) => b.score - a.score);
  }

  /**
   * Generates search suggestions
   */
  private async generateSuggestions(query: string, userId: string): Promise<SearchSuggestion[]> {
    const suggestions: SearchSuggestion[] = [];

    // Add query suggestions
    if (query.length > 2) {
      suggestions.push({
        text: query,
        type: 'query',
        count: 1
      });
    }

    // Add filter suggestions
    const filterSuggestions = [
      { text: 'type:invoice', type: 'filter' as const },
      { text: 'type:expense', type: 'filter' as const },
      { text: 'type:client', type: 'filter' as const },
      { text: 'status:paid', type: 'filter' as const },
      { text: 'status:unpaid', type: 'filter' as const }
    ];

    suggestions.push(...filterSuggestions);

    return suggestions;
  }

  /**
   * Logs search for analytics
   */
  private async logSearch(query: string, userId: string, filters: SearchFilters): Promise<void> {
    try {
      await this.prisma.searchLog.create({
        data: {
          userId,
          query,
          filters: JSON.stringify(filters),
          timestamp: new Date()
        }
      });
    } catch (error) {
      // Don't fail search if logging fails
      logger.warn('[SearchService] Failed to log search:', error);
    }
  }

  /**
   * Gets query suggestions
   */
  private async getQuerySuggestions(query: string, userId: string, limit: number): Promise<SearchSuggestion[]> {
    // Implementation would query search logs for similar queries
    return [];
  }

  /**
   * Gets filter suggestions
   */
  private async getFilterSuggestions(query: string, userId: string, limit: number): Promise<SearchSuggestion[]> {
    // Implementation would suggest relevant filters based on query
    return [];
  }

  /**
   * Gets recent searches
   */
  private async getRecentSearches(userId: string, limit: number): Promise<SearchSuggestion[]> {
    try {
      const recentSearches = await this.prisma.searchLog.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: limit,
        distinct: ['query']
      });

      return recentSearches.map(search => ({
        text: search.query,
        type: 'recent' as const
      }));
    } catch (error) {
      return [];
    }
  }

  /**
   * Gets saved searches
   */
  private async getSavedSearches(userId: string, query: string, limit: number): Promise<SearchSuggestion[]> {
    try {
      const savedSearches = await this.prisma.savedSearch.findMany({
        where: {
          userId,
          name: { contains: query, mode: 'insensitive' }
        },
        take: limit
      });

      return savedSearches.map(search => ({
        text: search.name,
        type: 'saved' as const,
        filters: JSON.parse(search.filters as string)
      }));
    } catch (error) {
      return [];
    }
  }

  /**
   * Gets total searches
   */
  private async getTotalSearches(userId: string, startDate: Date, endDate: Date): Promise<number> {
    return await this.prisma.searchLog.count({
      where: {
        userId,
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      }
    });
  }

  /**
   * Gets popular queries
   */
  private async getPopularQueries(userId: string, startDate: Date, endDate: Date): Promise<Array<{ query: string; count: number }>> {
    // Implementation would aggregate search logs
    return [];
  }

  /**
   * Gets search performance metrics
   */
  private async getSearchPerformance(userId: string, startDate: Date, endDate: Date): Promise<{ averageResponseTime: number; successRate: number }> {
    // Implementation would calculate performance metrics
    return {
      averageResponseTime: 0,
      successRate: 1
    };
  }

  /**
   * Gets user behavior metrics
   */
  private async getUserBehavior(userId: string, startDate: Date, endDate: Date): Promise<{ mostSearchedTypes: Array<{ type: string; count: number }>; searchAbandonmentRate: number }> {
    // Implementation would analyze user search behavior
    return {
      mostSearchedTypes: [],
      searchAbandonmentRate: 0
    };
  }
}

export default new SearchService();










