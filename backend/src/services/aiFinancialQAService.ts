import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';

const prisma = new PrismaClient();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface FinancialQuery {
  query: string;
  intent: string;
  entities: any;
  response: string;
  data?: any;
  confidence: number;
  followUpQuestions?: string[];
}

export interface QueryContext {
  userId: string;
  businessType: string;
  currentMetrics: any;
  recentTransactions: any[];
  timeRange: string;
}

export class AIFinancialQAService {
  private queryHistory: Map<string, FinancialQuery[]> = new Map();

  /**
   * Process natural language financial queries
   */
  async processQuery(userId: string, query: string): Promise<FinancialQuery> {
    try {
      const context = await this.getQueryContext(userId);
      const intent = await this.classifyIntent(query, context);
      const entities = await this.extractEntities(query);
      const data = await this.fetchRelevantData(userId, intent, entities, context);
      const response = await this.generateResponse(query, intent, data, context);
      const followUpQuestions = await this.generateFollowUpQuestions(intent, data);

      const result: FinancialQuery = {
        query,
        intent,
        entities,
        response,
        data,
        confidence: 0.9, // High confidence for structured queries
        followUpQuestions
      };

      // Store query in history
      await this.storeQueryHistory(userId, result);

      return result;

    } catch (error) {
      console.error('Error processing financial query:', error);
      throw new Error('Failed to process financial query');
    }
  }

  /**
   * Get query context for better understanding
   */
  private async getQueryContext(userId: string): Promise<QueryContext> {
    try {
      // Get user business information
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          businessType: true,
          companyName: true
        }
      });

      // Get current financial metrics
      const metrics = await this.getCurrentMetrics(userId);
      
      // Get recent transactions
      const recentTransactions = await this.getRecentTransactions(userId);

      return {
        userId,
        businessType: user?.businessType || 'SaaS',
        currentMetrics: metrics,
        recentTransactions,
        timeRange: 'current_month'
      };

    } catch (error) {
      console.error('Error getting query context:', error);
      return {
        userId,
        businessType: 'SaaS',
        currentMetrics: {},
        recentTransactions: [],
        timeRange: 'current_month'
      };
    }
  }

  /**
   * Classify query intent using AI
   */
  private async classifyIntent(query: string, context: QueryContext): Promise<string> {
    const prompt = `
Classify the intent of this financial query. Choose the most appropriate category:

Categories:
- cash_flow: Questions about cash flow, runway, burn rate
- revenue_analysis: Questions about revenue, sales, income
- expense_analysis: Questions about spending, costs, expenses
- profitability: Questions about profit, margins, profitability
- forecasting: Questions about future projections, predictions
- comparison: Questions comparing periods, metrics, or categories
- specific_metric: Questions about specific KPIs or metrics
- general: General financial questions

Query: "${query}"
Business Type: ${context.businessType}

Respond with just the category name.
`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: query }
        ],
        temperature: 0.1,
        max_tokens: 50
      });

      return completion.choices[0].message.content?.trim() || 'general';

    } catch (error) {
      console.error('Error classifying intent:', error);
      return 'general';
    }
  }

  /**
   * Extract entities from query
   */
  private async extractEntities(query: string): Promise<any> {
    const prompt = `
Extract entities from this financial query. Return JSON format:

{
  "timeframe": "string (last_month, this_month, last_quarter, this_quarter, last_year, this_year, custom)",
  "category": "string (if expense category mentioned)",
  "metric": "string (if specific metric mentioned)",
  "amount": "number (if specific amount mentioned)",
  "comparison": "string (if comparing periods or metrics)",
  "client": "string (if specific client mentioned)",
  "vendor": "string (if specific vendor mentioned)"
}

Query: "${query}"

Respond with JSON only.
`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: query }
        ],
        temperature: 0.1,
        max_tokens: 200
      });

      const response = completion.choices[0].message.content;
      return JSON.parse(response || '{}');

    } catch (error) {
      console.error('Error extracting entities:', error);
      return {};
    }
  }

  /**
   * Fetch relevant data based on intent and entities
   */
  private async fetchRelevantData(
    userId: string, 
    intent: string, 
    entities: any, 
    context: QueryContext
  ): Promise<any> {
    try {
      switch (intent) {
        case 'cash_flow':
          return await this.getCashFlowData(userId, entities);
        
        case 'revenue_analysis':
          return await this.getRevenueData(userId, entities);
        
        case 'expense_analysis':
          return await this.getExpenseData(userId, entities);
        
        case 'profitability':
          return await this.getProfitabilityData(userId, entities);
        
        case 'forecasting':
          return await this.getForecastingData(userId, entities);
        
        case 'comparison':
          return await this.getComparisonData(userId, entities);
        
        case 'specific_metric':
          return await this.getSpecificMetricData(userId, entities);
        
        default:
          return await this.getGeneralFinancialData(userId, entities);
      }

    } catch (error) {
      console.error('Error fetching relevant data:', error);
      return {};
    }
  }

  /**
   * Generate AI response based on query and data
   */
  private async generateResponse(
    query: string, 
    intent: string, 
    data: any, 
    context: QueryContext
  ): Promise<string> {
    const prompt = `
You are an AI financial advisor. Answer the user's question based on their financial data.

Query: "${query}"
Intent: ${intent}
Business Type: ${context.businessType}

Financial Data:
${JSON.stringify(data, null, 2)}

Provide a clear, actionable response that:
1. Directly answers their question
2. Includes relevant numbers and insights
3. Offers actionable recommendations if appropriate
4. Uses business-appropriate language
5. Keeps response concise but informative

Format the response in a conversational but professional tone.
`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: query }
        ],
        temperature: 0.3,
        max_tokens: 500
      });

      return completion.choices[0].message.content || 'I apologize, but I could not generate a response.';

    } catch (error) {
      console.error('Error generating response:', error);
      return 'I apologize, but I encountered an error processing your query.';
    }
  }

  /**
   * Generate follow-up questions
   */
  private async generateFollowUpQuestions(intent: string, data: any): Promise<string[]> {
    const followUpMap: { [key: string]: string[] } = {
      cash_flow: [
        "What's my burn rate trend?",
        "How can I improve my cash flow?",
        "What's my runway at current burn rate?"
      ],
      revenue_analysis: [
        "Which clients generate the most revenue?",
        "How is my revenue trending?",
        "What's my average deal size?"
      ],
      expense_analysis: [
        "Which categories are my biggest expenses?",
        "How can I reduce my expenses?",
        "What's my expense trend?"
      ],
      profitability: [
        "How can I improve my profit margins?",
        "What's driving my profitability?",
        "How does my profitability compare to industry standards?"
      ]
    };

    return followUpMap[intent] || [
      "What other financial metrics should I track?",
      "How can I improve my financial performance?",
      "What financial goals should I set?"
    ];
  }

  /**
   * Get current financial metrics
   */
  private async getCurrentMetrics(userId: string): Promise<any> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      const [monthlyRevenue, monthlyExpenses, yearlyRevenue, yearlyExpenses] = await Promise.all([
        prisma.invoice.aggregate({
          where: {
            userId,
            status: 'PAID',
            paidAt: { gte: startOfMonth }
          },
          _sum: { total: true }
        }),
        prisma.expense.aggregate({
          where: {
            userId,
            createdAt: { gte: startOfMonth }
          },
          _sum: { amount: true }
        }),
        prisma.invoice.aggregate({
          where: {
            userId,
            status: 'PAID',
            paidAt: { gte: startOfYear }
          },
          _sum: { total: true }
        }),
        prisma.expense.aggregate({
          where: {
            userId,
            createdAt: { gte: startOfYear }
          },
          _sum: { amount: true }
        })
      ]);

      const monthlyProfit = (monthlyRevenue._sum.total || 0) - (monthlyExpenses._sum.amount || 0);
      const yearlyProfit = (yearlyRevenue._sum.total || 0) - (yearlyExpenses._sum.amount || 0);

      return {
        monthly: {
          revenue: monthlyRevenue._sum.total || 0,
          expenses: monthlyExpenses._sum.amount || 0,
          profit: monthlyProfit,
          margin: monthlyRevenue._sum.total ? (monthlyProfit / monthlyRevenue._sum.total) * 100 : 0
        },
        yearly: {
          revenue: yearlyRevenue._sum.total || 0,
          expenses: yearlyExpenses._sum.amount || 0,
          profit: yearlyProfit,
          margin: yearlyRevenue._sum.total ? (yearlyProfit / yearlyRevenue._sum.total) * 100 : 0
        }
      };

    } catch (error) {
      console.error('Error getting current metrics:', error);
      return {};
    }
  }

  /**
   * Get recent transactions
   */
  private async getRecentTransactions(userId: string): Promise<any[]> {
    try {
      const recentExpenses = await prisma.expense.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          amount: true,
          merchant: true,
          category: true,
          createdAt: true
        }
      });

      const recentInvoices = await prisma.invoice.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          total: true,
          client: { select: { name: true } },
          status: true,
          createdAt: true
        }
      });

      return [
        ...recentExpenses.map(e => ({ type: 'expense', ...e })),
        ...recentInvoices.map(i => ({ type: 'invoice', ...i }))
      ];

    } catch (error) {
      console.error('Error getting recent transactions:', error);
      return [];
    }
  }

  /**
   * Get cash flow data
   */
  private async getCashFlowData(userId: string, entities: any): Promise<any> {
    const timeframe = entities.timeframe || 'current_month';
    const dateRange = this.getDateRange(timeframe);

    const [inflows, outflows] = await Promise.all([
      prisma.invoice.aggregate({
        where: {
          userId,
          status: 'PAID',
          paidAt: { gte: dateRange.start, lte: dateRange.end }
        },
        _sum: { total: true }
      }),
      prisma.expense.aggregate({
        where: {
          userId,
          createdAt: { gte: dateRange.start, lte: dateRange.end }
        },
        _sum: { amount: true }
      })
    ]);

    const totalInflows = inflows._sum.total || 0;
    const totalOutflows = outflows._sum.amount || 0;
    const netCashFlow = totalInflows - totalOutflows;

    return {
      timeframe,
      inflows: totalInflows,
      outflows: totalOutflows,
      netCashFlow,
      burnRate: totalOutflows,
      runway: totalInflows > 0 ? (totalInflows / totalOutflows) * 30 : 0 // Simplified runway calculation
    };
  }

  /**
   * Get revenue data
   */
  private async getRevenueData(userId: string, entities: any): Promise<any> {
    const timeframe = entities.timeframe || 'current_month';
    const dateRange = this.getDateRange(timeframe);

    const invoices = await prisma.invoice.findMany({
      where: {
        userId,
        status: 'PAID',
        paidAt: { gte: dateRange.start, lte: dateRange.end }
      },
      include: {
        client: { select: { name: true } }
      }
    });

    const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
    const clientBreakdown = this.groupByClient(invoices);
    const averageDealSize = invoices.length > 0 ? totalRevenue / invoices.length : 0;

    return {
      timeframe,
      totalRevenue,
      invoiceCount: invoices.length,
      averageDealSize,
      clientBreakdown,
      invoices: invoices.slice(0, 10) // Top 10 invoices
    };
  }

  /**
   * Get expense data
   */
  private async getExpenseData(userId: string, entities: any): Promise<any> {
    const timeframe = entities.timeframe || 'current_month';
    const dateRange = this.getDateRange(timeframe);

    const whereClause: any = {
      userId,
      createdAt: { gte: dateRange.start, lte: dateRange.end }
    };

    if (entities.category) {
      whereClause.category = entities.category;
    }

    const expenses = await prisma.expense.findMany({
      where: whereClause,
      orderBy: { amount: 'desc' }
    });

    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const categoryBreakdown = this.groupByCategory(expenses);
    const merchantBreakdown = this.groupByMerchant(expenses);

    return {
      timeframe,
      totalExpenses,
      expenseCount: expenses.length,
      categoryBreakdown,
      merchantBreakdown,
      expenses: expenses.slice(0, 10) // Top 10 expenses
    };
  }

  /**
   * Get profitability data
   */
  private async getProfitabilityData(userId: string, entities: any): Promise<any> {
    const timeframe = entities.timeframe || 'current_month';
    const dateRange = this.getDateRange(timeframe);

    const [revenue, expenses] = await Promise.all([
      prisma.invoice.aggregate({
        where: {
          userId,
          status: 'PAID',
          paidAt: { gte: dateRange.start, lte: dateRange.end }
        },
        _sum: { total: true }
      }),
      prisma.expense.aggregate({
        where: {
          userId,
          createdAt: { gte: dateRange.start, lte: dateRange.end }
        },
        _sum: { amount: true }
      })
    ]);

    const totalRevenue = revenue._sum.total || 0;
    const totalExpenses = expenses._sum.amount || 0;
    const profit = totalRevenue - totalExpenses;
    const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    return {
      timeframe,
      revenue: totalRevenue,
      expenses: totalExpenses,
      profit,
      margin,
      isProfitable: profit > 0
    };
  }

  /**
   * Get forecasting data
   */
  private async getForecastingData(userId: string, entities: any): Promise<any> {
    // This would integrate with existing forecasting services
    return {
      message: "Forecasting data would be provided by the cash flow forecasting service",
      timeframe: entities.timeframe || 'next_3_months'
    };
  }

  /**
   * Get comparison data
   */
  private async getComparisonData(userId: string, entities: any): Promise<any> {
    const currentPeriod = entities.timeframe || 'current_month';
    const previousPeriod = this.getPreviousPeriod(currentPeriod);
    
    const [currentData, previousData] = await Promise.all([
      this.getGeneralFinancialData(userId, { timeframe: currentPeriod }),
      this.getGeneralFinancialData(userId, { timeframe: previousPeriod })
    ]);

    return {
      current: currentData,
      previous: previousData,
      comparison: this.calculateComparison(currentData, previousData)
    };
  }

  /**
   * Get specific metric data
   */
  private async getSpecificMetricData(userId: string, entities: any): Promise<any> {
    const metric = entities.metric;
    
    switch (metric) {
      case 'mrr':
        return await this.getMRRData(userId);
      case 'arr':
        return await this.getARRData(userId);
      case 'ltv':
        return await this.getLTVData(userId);
      case 'cac':
        return await this.getCACData(userId);
      default:
        return await this.getGeneralFinancialData(userId, entities);
    }
  }

  /**
   * Get general financial data
   */
  private async getGeneralFinancialData(userId: string, entities: any): Promise<any> {
    const timeframe = entities.timeframe || 'current_month';
    const dateRange = this.getDateRange(timeframe);

    const [revenue, expenses, invoices, expenseCount] = await Promise.all([
      prisma.invoice.aggregate({
        where: {
          userId,
          status: 'PAID',
          paidAt: { gte: dateRange.start, lte: dateRange.end }
        },
        _sum: { total: true }
      }),
      prisma.expense.aggregate({
        where: {
          userId,
          createdAt: { gte: dateRange.start, lte: dateRange.end }
        },
        _sum: { amount: true }
      }),
      prisma.invoice.count({
        where: {
          userId,
          status: 'PAID',
          paidAt: { gte: dateRange.start, lte: dateRange.end }
        }
      }),
      prisma.expense.count({
        where: {
          userId,
          createdAt: { gte: dateRange.start, lte: dateRange.end }
        }
      })
    ]);

    return {
      timeframe,
      revenue: revenue._sum.total || 0,
      expenses: expenses._sum.amount || 0,
      profit: (revenue._sum.total || 0) - (expenses._sum.amount || 0),
      invoiceCount: invoices,
      expenseCount
    };
  }

  /**
   * Helper methods
   */
  private getDateRange(timeframe: string): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date();
    const end = new Date();

    switch (timeframe) {
      case 'last_month':
        start.setMonth(now.getMonth() - 1, 1);
        end.setMonth(now.getMonth(), 0);
        break;
      case 'current_month':
        start.setDate(1);
        end.setMonth(now.getMonth() + 1, 0);
        break;
      case 'last_quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        start.setMonth((quarter - 1) * 3, 1);
        end.setMonth(quarter * 3, 0);
        break;
      case 'current_quarter':
        const currentQuarter = Math.floor(now.getMonth() / 3);
        start.setMonth(currentQuarter * 3, 1);
        end.setMonth((currentQuarter + 1) * 3, 0);
        break;
      case 'last_year':
        start.setFullYear(now.getFullYear() - 1, 0, 1);
        end.setFullYear(now.getFullYear() - 1, 11, 31);
        break;
      case 'current_year':
        start.setFullYear(now.getFullYear(), 0, 1);
        end.setFullYear(now.getFullYear(), 11, 31);
        break;
      default:
        start.setDate(1);
        end.setMonth(now.getMonth() + 1, 0);
    }

    return { start, end };
  }

  private getPreviousPeriod(currentPeriod: string): string {
    const periodMap: { [key: string]: string } = {
      'current_month': 'last_month',
      'current_quarter': 'last_quarter',
      'current_year': 'last_year'
    };
    return periodMap[currentPeriod] || 'last_month';
  }

  private calculateComparison(current: any, previous: any): any {
    const revenueChange = previous.revenue ? ((current.revenue - previous.revenue) / previous.revenue) * 100 : 0;
    const expenseChange = previous.expenses ? ((current.expenses - previous.expenses) / previous.expenses) * 100 : 0;
    const profitChange = previous.profit ? ((current.profit - previous.profit) / Math.abs(previous.profit)) * 100 : 0;

    return {
      revenueChange,
      expenseChange,
      profitChange,
      isImproving: profitChange > 0
    };
  }

  private groupByCategory(expenses: any[]): any {
    return expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});
  }

  private groupByMerchant(expenses: any[]): any {
    return expenses.reduce((acc, expense) => {
      acc[expense.merchant] = (acc[expense.merchant] || 0) + expense.amount;
      return acc;
    }, {});
  }

  private groupByClient(invoices: any[]): any {
    return invoices.reduce((acc, invoice) => {
      const clientName = invoice.client?.name || 'Unknown';
      acc[clientName] = (acc[clientName] || 0) + invoice.total;
      return acc;
    }, {});
  }

  private async storeQueryHistory(userId: string, query: FinancialQuery): Promise<void> {
    const history = this.queryHistory.get(userId) || [];
    history.push(query);
    
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }
    
    this.queryHistory.set(userId, history);
  }

  // Placeholder methods for SaaS metrics (would integrate with existing services)
  private async getMRRData(userId: string): Promise<any> {
    return { message: "MRR data would be provided by the SaaS metrics service" };
  }

  private async getARRData(userId: string): Promise<any> {
    return { message: "ARR data would be provided by the SaaS metrics service" };
  }

  private async getLTVData(userId: string): Promise<any> {
    return { message: "LTV data would be provided by the cohort analysis service" };
  }

  private async getCACData(userId: string): Promise<any> {
    return { message: "CAC data would be provided by the SaaS metrics service" };
  }
}

export default AIFinancialQAService;







