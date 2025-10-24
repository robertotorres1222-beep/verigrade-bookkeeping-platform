import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: any;
}

export interface ExpenseEntry {
  amount: number;
  merchant: string;
  category: string;
  date: Date;
  location?: string;
  description?: string;
  confidence: number;
}

export interface FinancialQuery {
  query: string;
  intent: string;
  entities: any;
  response: string;
  data?: any;
  confidence: number;
}

export class AIChatbotService {
  private conversationContext: Map<string, ChatMessage[]> = new Map();

  /**
   * Process natural language expense entry
   * Example: "I spent $47 on lunch with client at Chipotle"
   */
  async processExpenseEntry(userId: string, message: string): Promise<{
    expense: ExpenseEntry | null;
    confirmation: string;
    suggestions: string[];
  }> {
    try {
      // Get user context for better understanding
      const userContext = await this.getUserContext(userId);
      
      const prompt = `
You are an AI assistant for expense entry. Extract expense information from the user's message.

User Context:
- Recent expenses: ${userContext.recentExpenses}
- Common categories: ${userContext.commonCategories}
- Recent merchants: ${userContext.recentMerchants}

User Message: "${message}"

Extract the following information:
1. Amount (number)
2. Merchant (string)
3. Category (string - choose from: Travel, Meals, Office Supplies, Marketing, Software, Utilities, Professional Services, Other)
4. Date (if mentioned, otherwise use today)
5. Location (if mentioned)
6. Description (if any additional context)

Respond with JSON format:
{
  "amount": number,
  "merchant": "string",
  "category": "string",
  "date": "YYYY-MM-DD",
  "location": "string or null",
  "description": "string or null",
  "confidence": number (0-1)
}

If information is unclear, set confidence to 0.5 or lower.
`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: message }
        ],
        temperature: 0.1,
        max_tokens: 500
      });

      const response = completion.choices[0].message.content;
      const expenseData = JSON.parse(response);

      // Validate and process the expense
      const expense: ExpenseEntry = {
        amount: expenseData.amount || 0,
        merchant: expenseData.merchant || '',
        category: expenseData.category || 'Other',
        date: new Date(expenseData.date || new Date()),
        location: expenseData.location,
        description: expenseData.description,
        confidence: expenseData.confidence || 0
      };

      // Generate confirmation message
      const confirmation = this.generateExpenseConfirmation(expense);
      
      // Generate suggestions for improvement
      const suggestions = this.generateExpenseSuggestions(expense, userContext);

      return {
        expense: expense.confidence > 0.3 ? expense : null,
        confirmation,
        suggestions
      };

    } catch (error) {
      console.error('Error processing expense entry:', error);
      throw new Error('Failed to process expense entry');
    }
  }

  /**
   * Process financial Q&A queries
   * Example: "What's my cash runway?", "How much did I spend on marketing last month?"
   */
  async processFinancialQuery(userId: string, query: string): Promise<FinancialQuery> {
    try {
      const userContext = await this.getUserContext(userId);
      
      const prompt = `
You are an AI financial assistant. Answer the user's financial question based on their data.

User Context:
- Business type: ${userContext.businessType}
- Current metrics: ${JSON.stringify(userContext.currentMetrics)}
- Recent transactions: ${userContext.recentTransactions}

User Query: "${query}"

Analyze the query and provide:
1. Intent classification (cash_flow, spending_analysis, revenue_analysis, profitability, forecasting, comparison)
2. Key entities mentioned
3. Relevant data needed
4. Clear, actionable response

Respond with JSON:
{
  "intent": "string",
  "entities": {},
  "response": "string",
  "data": {},
  "confidence": number
}
`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: query }
        ],
        temperature: 0.2,
        max_tokens: 1000
      });

      const response = completion.choices[0].message.content;
      const queryData = JSON.parse(response);

      // Fetch relevant data based on intent
      const data = await this.fetchRelevantData(userId, queryData.intent, queryData.entities);

      return {
        query,
        intent: queryData.intent,
        entities: queryData.entities,
        response: queryData.response,
        data,
        confidence: queryData.confidence
      };

    } catch (error) {
      console.error('Error processing financial query:', error);
      throw new Error('Failed to process financial query');
    }
  }

  /**
   * Process voice input and convert to text
   */
  async processVoiceInput(audioBuffer: Buffer): Promise<string> {
    try {
      const transcription = await openai.audio.transcriptions.create({
        file: new File([audioBuffer], 'audio.wav'),
        model: 'whisper-1'
      });

      return transcription.text;
    } catch (error) {
      console.error('Error processing voice input:', error);
      throw new Error('Failed to process voice input');
    }
  }

  /**
   * Get conversation history for context
   */
  async getConversationHistory(userId: string, limit: number = 10): Promise<ChatMessage[]> {
    const history = this.conversationContext.get(userId) || [];
    return history.slice(-limit);
  }

  /**
   * Add message to conversation history
   */
  async addMessage(userId: string, message: ChatMessage): Promise<void> {
    const history = this.conversationContext.get(userId) || [];
    history.push(message);
    
    // Keep only last 50 messages to manage memory
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }
    
    this.conversationContext.set(userId, history);
  }

  /**
   * Get user context for better AI responses
   */
  private async getUserContext(userId: string): Promise<any> {
    try {
      // Get recent expenses
      const recentExpenses = await prisma.expense.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          amount: true,
          merchant: true,
          category: true,
          description: true
        }
      });

      // Get common categories
      const categoryCounts = await prisma.expense.groupBy({
        by: ['category'],
        where: { userId },
        _count: { category: true },
        orderBy: { _count: { category: 'desc' } }
      });

      // Get recent merchants
      const merchantCounts = await prisma.expense.groupBy({
        by: ['merchant'],
        where: { userId },
        _count: { merchant: true },
        orderBy: { _count: { merchant: 'desc' } }
      });

      // Get current financial metrics
      const currentMetrics = await this.getCurrentFinancialMetrics(userId);

      return {
        recentExpenses: recentExpenses.map(e => `${e.merchant}: $${e.amount} (${e.category})`),
        commonCategories: categoryCounts.map(c => c.category),
        recentMerchants: merchantCounts.map(m => m.merchant),
        currentMetrics,
        businessType: 'SaaS', // This could be dynamic
        recentTransactions: recentExpenses.slice(0, 5)
      };

    } catch (error) {
      console.error('Error getting user context:', error);
      return {
        recentExpenses: [],
        commonCategories: [],
        recentMerchants: [],
        currentMetrics: {},
        businessType: 'SaaS',
        recentTransactions: []
      };
    }
  }

  /**
   * Get current financial metrics
   */
  private async getCurrentFinancialMetrics(userId: string): Promise<any> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      // Monthly revenue
      const monthlyRevenue = await prisma.invoice.aggregate({
        where: {
          userId,
          status: 'PAID',
          paidAt: { gte: startOfMonth }
        },
        _sum: { total: true }
      });

      // Monthly expenses
      const monthlyExpenses = await prisma.expense.aggregate({
        where: {
          userId,
          createdAt: { gte: startOfMonth }
        },
        _sum: { amount: true }
      });

      // Cash balance (simplified)
      const cashBalance = (monthlyRevenue._sum.total || 0) - (monthlyExpenses._sum.amount || 0);

      return {
        monthlyRevenue: monthlyRevenue._sum.total || 0,
        monthlyExpenses: monthlyExpenses._sum.amount || 0,
        cashBalance,
        burnRate: monthlyExpenses._sum.amount || 0
      };

    } catch (error) {
      console.error('Error getting financial metrics:', error);
      return {};
    }
  }

  /**
   * Fetch relevant data based on query intent
   */
  private async fetchRelevantData(userId: string, intent: string, entities: any): Promise<any> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);

      switch (intent) {
        case 'cash_flow':
          return await this.getCashFlowData(userId);
        
        case 'spending_analysis':
          return await this.getSpendingAnalysis(userId, entities);
        
        case 'revenue_analysis':
          return await this.getRevenueAnalysis(userId, entities);
        
        case 'profitability':
          return await this.getProfitabilityAnalysis(userId);
        
        case 'forecasting':
          return await this.getForecastingData(userId);
        
        default:
          return {};
      }

    } catch (error) {
      console.error('Error fetching relevant data:', error);
      return {};
    }
  }

  /**
   * Get cash flow data
   */
  private async getCashFlowData(userId: string): Promise<any> {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [inflows, outflows] = await Promise.all([
      prisma.invoice.aggregate({
        where: {
          userId,
          status: 'PAID',
          paidAt: { gte: lastMonth, lt: nextMonth }
        },
        _sum: { total: true }
      }),
      prisma.expense.aggregate({
        where: {
          userId,
          createdAt: { gte: lastMonth, lt: nextMonth }
        },
        _sum: { amount: true }
      })
    ]);

    return {
      inflows: inflows._sum.total || 0,
      outflows: outflows._sum.amount || 0,
      netCashFlow: (inflows._sum.total || 0) - (outflows._sum.amount || 0)
    };
  }

  /**
   * Get spending analysis
   */
  private async getSpendingAnalysis(userId: string, entities: any): Promise<any> {
    const whereClause: any = { userId };
    
    if (entities.category) {
      whereClause.category = entities.category;
    }
    
    if (entities.timeframe === 'last_month') {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      whereClause.createdAt = { gte: lastMonth };
    }

    const expenses = await prisma.expense.findMany({
      where: whereClause,
      select: {
        amount: true,
        category: true,
        merchant: true,
        createdAt: true
      }
    });

    return {
      totalSpent: expenses.reduce((sum, e) => sum + e.amount, 0),
      categoryBreakdown: this.groupByCategory(expenses),
      merchantBreakdown: this.groupByMerchant(expenses),
      expenses
    };
  }

  /**
   * Get revenue analysis
   */
  private async getRevenueAnalysis(userId: string, entities: any): Promise<any> {
    const whereClause: any = {
      userId,
      status: 'PAID'
    };

    if (entities.timeframe === 'last_month') {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      whereClause.paidAt = { gte: lastMonth };
    }

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      select: {
        total: true,
        clientId: true,
        paidAt: true
      }
    });

    return {
      totalRevenue: invoices.reduce((sum, i) => sum + i.total, 0),
      clientBreakdown: this.groupByClient(invoices),
      invoices
    };
  }

  /**
   * Get profitability analysis
   */
  private async getProfitabilityAnalysis(userId: string): Promise<any> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [revenue, expenses] = await Promise.all([
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
      })
    ]);

    const totalRevenue = revenue._sum.total || 0;
    const totalExpenses = expenses._sum.amount || 0;
    const profit = totalRevenue - totalExpenses;
    const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    return {
      revenue: totalRevenue,
      expenses: totalExpenses,
      profit,
      margin
    };
  }

  /**
   * Get forecasting data
   */
  private async getForecastingData(userId: string): Promise<any> {
    // This would integrate with existing cash flow forecasting service
    return {
      message: "Forecasting data would be provided by the cash flow forecasting service"
    };
  }

  /**
   * Generate expense confirmation message
   */
  private generateExpenseConfirmation(expense: ExpenseEntry): string {
    const { amount, merchant, category, date, location } = expense;
    
    let confirmation = `I've extracted: $${amount} at ${merchant} (${category})`;
    
    if (location) {
      confirmation += ` in ${location}`;
    }
    
    if (date) {
      confirmation += ` on ${date.toLocaleDateString()}`;
    }
    
    if (expense.confidence < 0.7) {
      confirmation += "\n\n⚠️ Some information might be incorrect. Please review and confirm.";
    }
    
    return confirmation;
  }

  /**
   * Generate expense suggestions
   */
  private generateExpenseSuggestions(expense: ExpenseEntry, context: any): string[] {
    const suggestions: string[] = [];
    
    if (expense.confidence < 0.5) {
      suggestions.push("Please provide more details about this expense");
    }
    
    if (!expense.location && context.recentMerchants.includes(expense.merchant)) {
      suggestions.push(`Add location for ${expense.merchant} based on previous entries`);
    }
    
    if (expense.category === 'Other' && expense.confidence > 0.7) {
      suggestions.push(`Consider categorizing as: ${context.commonCategories[0] || 'Travel'}`);
    }
    
    return suggestions;
  }

  /**
   * Helper methods for data grouping
   */
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
      acc[invoice.clientId] = (acc[invoice.clientId] || 0) + invoice.total;
      return acc;
    }, {});
  }
}

export default AIChatbotService;







