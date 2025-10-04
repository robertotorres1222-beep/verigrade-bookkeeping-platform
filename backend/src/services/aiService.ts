import OpenAI from 'openai';
import { prisma } from '../index';
import { logger } from '../utils/logger';

const openai = process.env['OPENAI_API_KEY'] ? new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'],
}) : null;

interface CategorizationResult {
  category: string;
  subcategory: string;
  confidence: number;
  taxDeductible: boolean;
  notes?: string;
}

interface InsightResult {
  type: string;
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number;
  actionable: boolean;
  recommendation?: string;
}

interface QueryResult {
  query: string;
  results: any[];
  summary: string;
  confidence: number;
}

// Categorize transaction using AI
export const categorizeTransaction = async (
  description: string,
  amount: number,
  vendor?: string,
  organizationId?: string
): Promise<CategorizationResult> => {
  try {
    if (!openai) {
      logger.warn('OpenAI API key not configured, using fallback categorization');
      return getFallbackCategorization(description, amount, vendor);
    }

    const prompt = `
Analyze this financial transaction and categorize it:

Amount: $${amount}
Description: ${description}
${vendor ? `Vendor: ${vendor}` : ''}

Please categorize this transaction and return a JSON response with:
- category: The main category (e.g., "Office Supplies", "Travel", "Marketing", "Professional Services", "Utilities", etc.)
- subcategory: A specific subcategory
- confidence: A number between 0 and 1 indicating how confident you are in this categorization
- taxDeductible: Whether this expense is likely tax deductible (true/false)
- notes: Any additional insights about this transaction

Return only valid JSON, no other text.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 200,
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{}');
    
    // Log the AI analysis
    if (organizationId) {
      await prisma.aIAnalysis.create({
        data: {
          organizationId,
          type: 'TRANSACTION_CATEGORIZATION',
          input: { description, amount, vendor },
          output: result,
          confidence: result.confidence || 0.5,
          model: 'gpt-4',
          cost: 0.001, // Approximate cost
        },
      });
    }

    return result;
  } catch (error) {
    logger.error('AI categorization failed:', error);
    throw new Error('Failed to categorize transaction');
  }
};

// Categorize expense using AI
export const categorizeExpense = async (
  description: string,
  amount: number,
  vendor?: string
): Promise<CategorizationResult> => {
  return categorizeTransaction(description, amount, vendor);
};

// Generate financial insights
export const generateInsights = async (
  organizationId: string,
  dataType: 'expenses' | 'revenue' | 'cashflow' = 'expenses'
): Promise<InsightResult[]> => {
  try {
    // Get recent data based on type
    let data: any[] = [];
    
    if (dataType === 'expenses') {
      data = await prisma.expense.findMany({
        where: { organizationId },
        orderBy: { date: 'desc' },
        take: 100,
        select: {
          amount: true,
          description: true,
          category: true,
          date: true,
          vendor: true,
        },
      });
    } else if (dataType === 'revenue') {
      data = await prisma.transaction.findMany({
        where: {
          organizationId,
          type: 'INCOME',
        },
        orderBy: { date: 'desc' },
        take: 100,
        select: {
          amount: true,
          description: true,
          category: true,
          date: true,
        },
      });
    }

    if (data.length === 0) {
      return [];
    }

    const prompt = `
Analyze this financial data and provide 3-5 actionable insights:

Data Type: ${dataType}
Data Sample: ${JSON.stringify(data.slice(0, 10), null, 2)}

Please provide insights in JSON format with the following structure:
[
  {
    "type": "cost_optimization" | "revenue_growth" | "cash_flow" | "compliance" | "efficiency",
    "title": "Brief title of the insight",
    "description": "Detailed description of the insight",
    "impact": "positive" | "negative" | "neutral",
    "confidence": 0.85,
    "actionable": true,
    "recommendation": "Specific action to take"
  }
]

Focus on:
1. Cost optimization opportunities
2. Unusual spending patterns
3. Revenue growth opportunities
4. Cash flow improvements
5. Compliance or efficiency issues

Return only valid JSON array, no other text.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 1000,
    });

    const insights = JSON.parse(response.choices[0]?.message?.content || '[]');
    
    // Log the AI analysis
    await prisma.aIAnalysis.create({
      data: {
        organizationId,
        type: 'INSIGHT_GENERATION',
        input: { dataType, recordCount: data.length },
        output: insights,
        confidence: insights.length > 0 ? insights[0].confidence || 0.5 : 0.5,
        model: 'gpt-4',
        cost: 0.01, // Approximate cost
      },
    });

    return insights;
  } catch (error) {
    logger.error('AI insight generation failed:', error);
    throw new Error('Failed to generate insights');
  }
};

// Process natural language query
export const processNaturalLanguageQuery = async (
  query: string,
  organizationId: string
): Promise<QueryResult> => {
  try {
    // Get available data types and recent records
    const [expenses, transactions, invoices] = await Promise.all([
      prisma.expense.findMany({
        where: { organizationId },
        take: 10,
        select: { amount: true, description: true, category: true, date: true },
      }),
      prisma.transaction.findMany({
        where: { organizationId },
        take: 10,
        select: { amount: true, description: true, type: true, date: true },
      }),
      prisma.invoice.findMany({
        where: { organizationId },
        take: 10,
        select: { totalAmount: true, status: true, issueDate: true },
      }),
    ]);

    const prompt = `
You are a financial assistant for a bookkeeping platform. Answer this user query based on the available data:

User Query: "${query}"

Available Data:
- Expenses: ${JSON.stringify(expenses, null, 2)}
- Transactions: ${JSON.stringify(transactions, null, 2)}
- Invoices: ${JSON.stringify(invoices, null, 2)}

Please provide a response in JSON format:
{
  "query": "The original user query",
  "results": [/* Array of relevant data points or calculations */],
  "summary": "A brief summary of the findings",
  "confidence": 0.85
}

If the query asks for calculations, perform them. If it asks for specific data, filter and return it.
Be helpful and provide actionable information when possible.

Return only valid JSON, no other text.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 800,
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{}');
    
    // Log the AI analysis
    await prisma.aIAnalysis.create({
      data: {
        organizationId,
        type: 'NATURAL_LANGUAGE_QUERY',
        input: { query },
        output: result,
        confidence: result.confidence || 0.5,
        model: 'gpt-4',
        cost: 0.008, // Approximate cost
      },
    });

    return result;
  } catch (error) {
    logger.error('AI query processing failed:', error);
    throw new Error('Failed to process query');
  }
};

// Detect anomalies in transactions
export const detectAnomalies = async (organizationId: string): Promise<any[]> => {
  try {
    // Get recent transactions
    const transactions = await prisma.transaction.findMany({
      where: { organizationId },
      orderBy: { date: 'desc' },
      take: 200,
      select: {
        amount: true,
        description: true,
        type: true,
        date: true,
        category: true,
      },
    });

    if (transactions.length < 10) {
      return []; // Need more data for anomaly detection
    }

    const prompt = `
Analyze these financial transactions and identify potential anomalies or unusual patterns:

Transactions: ${JSON.stringify(transactions, null, 2)}

Look for:
1. Unusually large amounts compared to historical data
2. Transactions outside normal business hours or patterns
3. Duplicate or suspicious transactions
4. Categories that don't match the description
5. Rapid changes in spending patterns

Return a JSON array of anomalies:
[
  {
    "type": "amount" | "pattern" | "duplicate" | "category" | "timing",
    "description": "Description of the anomaly",
    "transaction": {/* The suspicious transaction */},
    "severity": "low" | "medium" | "high",
    "confidence": 0.85
  }
]

Return only valid JSON array, no other text.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 600,
    });

    const anomalies = JSON.parse(response.choices[0]?.message?.content || '[]');
    
    // Log the AI analysis
    await prisma.aIAnalysis.create({
      data: {
        organizationId,
        type: 'ANOMALY_DETECTION',
        input: { transactionCount: transactions.length },
        output: anomalies,
        confidence: anomalies.length > 0 ? anomalies[0].confidence || 0.5 : 0.5,
        model: 'gpt-4',
        cost: 0.015, // Approximate cost
      },
    });

    return anomalies;
  } catch (error) {
    logger.error('AI anomaly detection failed:', error);
    throw new Error('Failed to detect anomalies');
  }
};

// Predict cash flow
export const predictCashFlow = async (
  organizationId: string,
  months: number = 3
): Promise<any> => {
  try {
    // Get historical transaction data
    const transactions = await prisma.transaction.findMany({
      where: { organizationId },
      orderBy: { date: 'desc' },
      take: 100,
      select: {
        amount: true,
        type: true,
        date: true,
        category: true,
      },
    });

    if (transactions.length < 20) {
      throw new Error('Insufficient data for cash flow prediction');
    }

    const prompt = `
Based on this historical financial data, predict cash flow for the next ${months} months:

Historical Data: ${JSON.stringify(transactions, null, 2)}

Provide a JSON response with:
{
  "predictions": [
    {
      "month": "2024-02",
      "predictedIncome": 15000,
      "predictedExpenses": 12000,
      "predictedNetCashFlow": 3000,
      "confidence": 0.8
    }
  ],
  "trends": {
    "incomeTrend": "increasing" | "decreasing" | "stable",
    "expenseTrend": "increasing" | "decreasing" | "stable",
    "seasonality": "Description of any seasonal patterns"
  },
  "recommendations": ["Actionable recommendations for cash flow management"]
}

Return only valid JSON, no other text.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 800,
    });

    const prediction = JSON.parse(response.choices[0]?.message?.content || '{}');
    
    // Log the AI analysis
    await prisma.aIAnalysis.create({
      data: {
        organizationId,
        type: 'CASH_FLOW_PREDICTION',
        input: { months, transactionCount: transactions.length },
        output: prediction,
        confidence: prediction.predictions?.[0]?.confidence || 0.5,
        model: 'gpt-4',
        cost: 0.02, // Approximate cost
      },
    });

    return prediction;
  } catch (error) {
    logger.error('AI cash flow prediction failed:', error);
    throw new Error('Failed to predict cash flow');
  }
};

// Helper function for fallback categorization when AI is not available
const getFallbackCategorization = (
  description: string,
  amount: number,
  vendor?: string
): CategorizationResult => {
  const desc = description.toLowerCase();
  
  // Simple rule-based categorization
  if (desc.includes('office') || desc.includes('supplies') || desc.includes('stationery')) {
    return { category: 'Office Supplies', subcategory: 'General', confidence: 0.7, taxDeductible: true };
  }
  if (desc.includes('travel') || desc.includes('hotel') || desc.includes('flight') || desc.includes('uber')) {
    return { category: 'Travel', subcategory: 'Business Travel', confidence: 0.8, taxDeductible: true };
  }
  if (desc.includes('marketing') || desc.includes('advertising') || desc.includes('google ads')) {
    return { category: 'Marketing', subcategory: 'Advertising', confidence: 0.8, taxDeductible: true };
  }
  if (desc.includes('meal') || desc.includes('restaurant') || desc.includes('food') || desc.includes('coffee')) {
    return { category: 'Meals', subcategory: 'Business Meals', confidence: 0.7, taxDeductible: true };
  }
  if (desc.includes('software') || desc.includes('subscription') || desc.includes('saas')) {
    return { category: 'Software', subcategory: 'Subscriptions', confidence: 0.8, taxDeductible: true };
  }
  if (desc.includes('utility') || desc.includes('electric') || desc.includes('internet') || desc.includes('phone')) {
    return { category: 'Utilities', subcategory: 'General', confidence: 0.8, taxDeductible: true };
  }
  if (desc.includes('rent') || desc.includes('lease')) {
    return { category: 'Rent', subcategory: 'Office Rent', confidence: 0.9, taxDeductible: true };
  }
  
  return {
    category: 'Other',
    subcategory: 'Uncategorized',
    confidence: 0.5,
    taxDeductible: false,
    notes: 'AI categorization unavailable - please review manually',
  };
};
