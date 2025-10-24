import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface QueryIntent {
  intent: string;
  confidence: number;
  entities: Record<string, any>;
  parameters: Record<string, any>;
}

interface QueryResult {
  type: 'chart' | 'table' | 'summary' | 'list';
  data: any;
  visualization?: {
    type: 'bar' | 'line' | 'pie' | 'scatter' | 'area';
    config: any;
  };
  title: string;
  description: string;
}

interface QueryHistory {
  id: string;
  query: string;
  intent: string;
  result: QueryResult;
  timestamp: Date;
  userId: string;
  organizationId: string;
}

export class NLPQueryService {
  private organizationId: string;
  private userId: string;

  constructor(organizationId: string, userId: string) {
    this.organizationId = organizationId;
    this.userId = userId;
  }

  async processQuery(query: string): Promise<QueryResult> {
    // Parse the natural language query
    const intent = await this.parseIntent(query);
    
    // Execute the query based on intent
    const result = await this.executeQuery(intent);
    
    // Save query to history
    await this.saveQueryHistory(query, intent, result);
    
    return result;
  }

  private async parseIntent(query: string): Promise<QueryIntent> {
    const lowerQuery = query.toLowerCase();
    
    // Define intent patterns
    const intentPatterns = {
      // Revenue queries
      revenue: {
        patterns: ['revenue', 'income', 'sales', 'earnings', 'profit'],
        intent: 'revenue_analysis',
        entities: ['time_period', 'category', 'customer']
      },
      
      // Expense queries
      expenses: {
        patterns: ['expenses', 'costs', 'spending', 'outgoings'],
        intent: 'expense_analysis',
        entities: ['time_period', 'category', 'vendor']
      },
      
      // Cash flow queries
      cashflow: {
        patterns: ['cash flow', 'cashflow', 'money flow', 'liquidity'],
        intent: 'cashflow_analysis',
        entities: ['time_period']
      },
      
      // Profitability queries
      profitability: {
        patterns: ['profit', 'profitability', 'margin', 'roi'],
        intent: 'profitability_analysis',
        entities: ['time_period', 'customer', 'service']
      },
      
      // Customer queries
      customers: {
        patterns: ['customer', 'client', 'who', 'which customer'],
        intent: 'customer_analysis',
        entities: ['time_period', 'amount', 'status']
      },
      
      // Transaction queries
      transactions: {
        patterns: ['transaction', 'payment', 'invoice', 'bill'],
        intent: 'transaction_analysis',
        entities: ['time_period', 'amount', 'status', 'type']
      },
      
      // Trend queries
      trends: {
        patterns: ['trend', 'trending', 'over time', 'growth', 'decline'],
        intent: 'trend_analysis',
        entities: ['time_period', 'metric']
      },
      
      // Comparison queries
      comparison: {
        patterns: ['compare', 'vs', 'versus', 'difference', 'better', 'worse'],
        intent: 'comparison_analysis',
        entities: ['time_period', 'metric', 'entity']
      }
    };

    // Find matching intent
    let bestMatch = { intent: 'unknown', confidence: 0, entities: {}, parameters: {} };
    
    for (const [intentName, config] of Object.entries(intentPatterns)) {
      const matchCount = config.patterns.filter(pattern => 
        lowerQuery.includes(pattern)
      ).length;
      
      if (matchCount > 0) {
        const confidence = matchCount / config.patterns.length;
        if (confidence > bestMatch.confidence) {
          bestMatch = {
            intent: config.intent,
            confidence,
            entities: this.extractEntities(query, config.entities),
            parameters: this.extractParameters(query)
          };
        }
      }
    }

    return bestMatch;
  }

  private extractEntities(query: string, entityTypes: string[]): Record<string, any> {
    const entities: Record<string, any> = {};
    
    // Extract time periods
    if (entityTypes.includes('time_period')) {
      entities.time_period = this.extractTimePeriod(query);
    }
    
    // Extract amounts
    if (entityTypes.includes('amount')) {
      entities.amount = this.extractAmount(query);
    }
    
    // Extract categories
    if (entityTypes.includes('category')) {
      entities.category = this.extractCategory(query);
    }
    
    // Extract customers
    if (entityTypes.includes('customer')) {
      entities.customer = this.extractCustomer(query);
    }
    
    return entities;
  }

  private extractTimePeriod(query: string): any {
    const lowerQuery = query.toLowerCase();
    
    // Current period
    if (lowerQuery.includes('this month') || lowerQuery.includes('current month')) {
      return { type: 'current_month' };
    }
    
    if (lowerQuery.includes('this year') || lowerQuery.includes('current year')) {
      return { type: 'current_year' };
    }
    
    if (lowerQuery.includes('this quarter') || lowerQuery.includes('current quarter')) {
      return { type: 'current_quarter' };
    }
    
    // Last period
    if (lowerQuery.includes('last month')) {
      return { type: 'last_month' };
    }
    
    if (lowerQuery.includes('last year')) {
      return { type: 'last_year' };
    }
    
    if (lowerQuery.includes('last quarter')) {
      return { type: 'last_quarter' };
    }
    
    // Specific periods
    if (lowerQuery.includes('last 30 days') || lowerQuery.includes('past 30 days')) {
      return { type: 'days', value: 30 };
    }
    
    if (lowerQuery.includes('last 90 days') || lowerQuery.includes('past 90 days')) {
      return { type: 'days', value: 90 };
    }
    
    if (lowerQuery.includes('last 6 months') || lowerQuery.includes('past 6 months')) {
      return { type: 'months', value: 6 };
    }
    
    if (lowerQuery.includes('last 12 months') || lowerQuery.includes('past 12 months')) {
      return { type: 'months', value: 12 };
    }
    
    // Default to current month
    return { type: 'current_month' };
  }

  private extractAmount(query: string): any {
    const amountRegex = /\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/g;
    const matches = query.match(amountRegex);
    
    if (matches) {
      return matches.map(match => {
        const value = parseFloat(match.replace(/[$,]/g, ''));
        return { value, currency: 'USD' };
      });
    }
    
    return null;
  }

  private extractCategory(query: string): any {
    const lowerQuery = query.toLowerCase();
    
    // Common expense categories
    const categories = [
      'office supplies', 'rent', 'utilities', 'marketing', 'travel',
      'meals', 'equipment', 'software', 'consulting', 'legal',
      'insurance', 'taxes', 'payroll', 'benefits'
    ];
    
    for (const category of categories) {
      if (lowerQuery.includes(category)) {
        return { name: category };
      }
    }
    
    return null;
  }

  private extractCustomer(query: string): any {
    // This would typically use named entity recognition
    // For now, we'll look for common customer name patterns
    const nameRegex = /(?:customer|client)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i;
    const match = query.match(nameRegex);
    
    if (match) {
      return { name: match[1] };
    }
    
    return null;
  }

  private extractParameters(query: string): Record<string, any> {
    const parameters: Record<string, any> = {};
    
    // Extract sorting parameters
    if (query.toLowerCase().includes('highest') || query.toLowerCase().includes('top')) {
      parameters.sort = 'desc';
    } else if (query.toLowerCase().includes('lowest') || query.toLowerCase().includes('bottom')) {
      parameters.sort = 'asc';
    }
    
    // Extract limit parameters
    const limitMatch = query.match(/(\d+)\s+(?:top|highest|lowest)/i);
    if (limitMatch) {
      parameters.limit = parseInt(limitMatch[1]);
    }
    
    return parameters;
  }

  private async executeQuery(intent: QueryIntent): Promise<QueryResult> {
    switch (intent.intent) {
      case 'revenue_analysis':
        return await this.executeRevenueAnalysis(intent);
      
      case 'expense_analysis':
        return await this.executeExpenseAnalysis(intent);
      
      case 'cashflow_analysis':
        return await this.executeCashflowAnalysis(intent);
      
      case 'profitability_analysis':
        return await this.executeProfitabilityAnalysis(intent);
      
      case 'customer_analysis':
        return await this.executeCustomerAnalysis(intent);
      
      case 'transaction_analysis':
        return await this.executeTransactionAnalysis(intent);
      
      case 'trend_analysis':
        return await this.executeTrendAnalysis(intent);
      
      case 'comparison_analysis':
        return await this.executeComparisonAnalysis(intent);
      
      default:
        return {
          type: 'summary',
          data: { message: 'I didn\'t understand your query. Please try rephrasing it.' },
          title: 'Query Not Understood',
          description: 'The system could not interpret your natural language query.'
        };
    }
  }

  private async executeRevenueAnalysis(intent: QueryIntent): Promise<QueryResult> {
    const timePeriod = intent.entities.time_period || { type: 'current_month' };
    const dateRange = this.getDateRange(timePeriod);
    
    // Get revenue data
    const revenueData = await prisma.transaction.findMany({
      where: {
        organizationId: this.organizationId,
        type: 'INCOME',
        date: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      },
      include: {
        customer: true,
        category: true
      }
    });
    
    const totalRevenue = revenueData.reduce((sum, t) => sum + Number(t.amount), 0);
    const byCategory = this.groupByCategory(revenueData);
    const byCustomer = this.groupByCustomer(revenueData);
    
    return {
      type: 'chart',
      data: {
        total: totalRevenue,
        byCategory,
        byCustomer,
        transactions: revenueData
      },
      visualization: {
        type: 'pie',
        config: {
          data: Object.entries(byCategory).map(([category, amount]) => ({
            name: category,
            value: amount
          }))
        }
      },
      title: 'Revenue Analysis',
      description: `Total revenue: $${totalRevenue.toFixed(2)}`
    };
  }

  private async executeExpenseAnalysis(intent: QueryIntent): Promise<QueryResult> {
    const timePeriod = intent.entities.time_period || { type: 'current_month' };
    const dateRange = this.getDateRange(timePeriod);
    
    // Get expense data
    const expenseData = await prisma.transaction.findMany({
      where: {
        organizationId: this.organizationId,
        type: 'EXPENSE',
        date: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      },
      include: {
        category: true
      }
    });
    
    const totalExpenses = expenseData.reduce((sum, t) => sum + Number(t.amount), 0);
    const byCategory = this.groupByCategory(expenseData);
    
    return {
      type: 'chart',
      data: {
        total: totalExpenses,
        byCategory,
        transactions: expenseData
      },
      visualization: {
        type: 'bar',
        config: {
          data: Object.entries(byCategory).map(([category, amount]) => ({
            name: category,
            value: amount
          }))
        }
      },
      title: 'Expense Analysis',
      description: `Total expenses: $${totalExpenses.toFixed(2)}`
    };
  }

  private async executeCashflowAnalysis(intent: QueryIntent): Promise<QueryResult> {
    const timePeriod = intent.entities.time_period || { type: 'current_month' };
    const dateRange = this.getDateRange(timePeriod);
    
    // Get all transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        organizationId: this.organizationId,
        date: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      }
    });
    
    const income = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const expenses = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const netCashFlow = income - expenses;
    
    return {
      type: 'summary',
      data: {
        income,
        expenses,
        netCashFlow
      },
      title: 'Cash Flow Analysis',
      description: `Net cash flow: $${netCashFlow.toFixed(2)}`
    };
  }

  private async executeProfitabilityAnalysis(intent: QueryIntent): Promise<QueryResult> {
    const timePeriod = intent.entities.time_period || { type: 'current_month' };
    const dateRange = this.getDateRange(timePeriod);
    
    // Get revenue and expenses
    const transactions = await prisma.transaction.findMany({
      where: {
        organizationId: this.organizationId,
        date: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      }
    });
    
    const revenue = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const expenses = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const profit = revenue - expenses;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    
    return {
      type: 'summary',
      data: {
        revenue,
        expenses,
        profit,
        margin
      },
      title: 'Profitability Analysis',
      description: `Profit margin: ${margin.toFixed(2)}%`
    };
  }

  private async executeCustomerAnalysis(intent: QueryIntent): Promise<QueryResult> {
    const timePeriod = intent.entities.time_period || { type: 'current_month' };
    const dateRange = this.getDateRange(timePeriod);
    
    // Get customer data
    const customerData = await prisma.customer.findMany({
      where: {
        organizationId: this.organizationId
      },
      include: {
        transactions: {
          where: {
            date: {
              gte: dateRange.start,
              lte: dateRange.end
            }
          }
        }
      }
    });
    
    const customerStats = customerData.map(customer => ({
      id: customer.id,
      name: customer.name,
      totalRevenue: customer.transactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + Number(t.amount), 0),
      transactionCount: customer.transactions.length
    }));
    
    // Sort by revenue
    customerStats.sort((a, b) => b.totalRevenue - a.totalRevenue);
    
    return {
      type: 'table',
      data: customerStats,
      title: 'Customer Analysis',
      description: `Top customers by revenue`
    };
  }

  private async executeTransactionAnalysis(intent: QueryIntent): Promise<QueryResult> {
    const timePeriod = intent.entities.time_period || { type: 'current_month' };
    const dateRange = this.getDateRange(timePeriod);
    
    // Get transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        organizationId: this.organizationId,
        date: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      },
      include: {
        customer: true,
        category: true
      },
      orderBy: {
        date: 'desc'
      },
      take: 50
    });
    
    return {
      type: 'table',
      data: transactions,
      title: 'Recent Transactions',
      description: `Latest ${transactions.length} transactions`
    };
  }

  private async executeTrendAnalysis(intent: QueryIntent): Promise<QueryResult> {
    const timePeriod = intent.entities.time_period || { type: 'last_12_months' };
    const dateRange = this.getDateRange(timePeriod);
    
    // Get monthly data
    const monthlyData = await this.getMonthlyTrends(dateRange);
    
    return {
      type: 'chart',
      data: monthlyData,
      visualization: {
        type: 'line',
        config: {
          data: monthlyData.map(month => ({
            month: month.month,
            revenue: month.revenue,
            expenses: month.expenses,
            profit: month.profit
          }))
        }
      },
      title: 'Trend Analysis',
      description: `Revenue and expense trends over time`
    };
  }

  private async executeComparisonAnalysis(intent: QueryIntent): Promise<QueryResult> {
    // This would compare different periods or entities
    const currentPeriod = { type: 'current_month' };
    const previousPeriod = { type: 'last_month' };
    
    const currentData = await this.getPeriodData(currentPeriod);
    const previousData = await this.getPeriodData(previousPeriod);
    
    const comparison = {
      current: currentData,
      previous: previousData,
      changes: {
        revenue: ((currentData.revenue - previousData.revenue) / previousData.revenue) * 100,
        expenses: ((currentData.expenses - previousData.expenses) / previousData.expenses) * 100,
        profit: ((currentData.profit - previousData.profit) / previousData.profit) * 100
      }
    };
    
    return {
      type: 'summary',
      data: comparison,
      title: 'Period Comparison',
      description: `Comparing current month to previous month`
    };
  }

  private getDateRange(timePeriod: any): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date();
    const end = new Date();
    
    switch (timePeriod.type) {
      case 'current_month':
        start.setDate(1);
        end.setMonth(now.getMonth() + 1, 0);
        break;
      
      case 'last_month':
        start.setMonth(now.getMonth() - 1, 1);
        end.setMonth(now.getMonth(), 0);
        break;
      
      case 'current_year':
        start.setMonth(0, 1);
        end.setMonth(11, 31);
        break;
      
      case 'last_year':
        start.setFullYear(now.getFullYear() - 1, 0, 1);
        end.setFullYear(now.getFullYear() - 1, 11, 31);
        break;
      
      case 'days':
        start.setDate(now.getDate() - timePeriod.value);
        break;
      
      case 'months':
        start.setMonth(now.getMonth() - timePeriod.value);
        break;
    }
    
    return { start, end };
  }

  private groupByCategory(transactions: any[]): Record<string, number> {
    return transactions.reduce((acc, transaction) => {
      const category = transaction.category?.name || 'Uncategorized';
      acc[category] = (acc[category] || 0) + Number(transaction.amount);
      return acc;
    }, {} as Record<string, number>);
  }

  private groupByCustomer(transactions: any[]): Record<string, number> {
    return transactions.reduce((acc, transaction) => {
      const customer = transaction.customer?.name || 'Unknown';
      acc[customer] = (acc[customer] || 0) + Number(transaction.amount);
      return acc;
    }, {} as Record<string, number>);
  }

  private async getMonthlyTrends(dateRange: { start: Date; end: Date }): Promise<any[]> {
    // This would implement monthly trend calculation
    // For now, return mock data
    return [
      { month: 'Jan', revenue: 10000, expenses: 8000, profit: 2000 },
      { month: 'Feb', revenue: 12000, expenses: 9000, profit: 3000 },
      { month: 'Mar', revenue: 11000, expenses: 8500, profit: 2500 }
    ];
  }

  private async getPeriodData(timePeriod: any): Promise<any> {
    const dateRange = this.getDateRange(timePeriod);
    
    const transactions = await prisma.transaction.findMany({
      where: {
        organizationId: this.organizationId,
        date: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      }
    });
    
    const revenue = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const expenses = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    return {
      revenue,
      expenses,
      profit: revenue - expenses
    };
  }

  private async saveQueryHistory(query: string, intent: QueryIntent, result: QueryResult): Promise<void> {
    // In a real implementation, you would save this to a database
    console.log('Query saved to history:', { query, intent, result });
  }

  async getQueryHistory(): Promise<QueryHistory[]> {
    // In a real implementation, you would fetch from database
    return [];
  }

  async getQuerySuggestions(): Promise<string[]> {
    return [
      'Show me revenue for this month',
      'What are my top expenses?',
      'How is my cash flow?',
      'Which customers generate the most revenue?',
      'Show me profit trends',
      'Compare this month to last month',
      'What are my biggest expense categories?',
      'Show me recent transactions'
    ];
  }
}

