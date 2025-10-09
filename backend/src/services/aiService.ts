import OpenAI from 'openai'
import { prisma } from '../config/database'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export interface TransactionCategorization {
  category: string
  subcategory: string
  confidence: number
  reasoning: string
}

export interface ExpenseAnalysis {
  isTaxDeductible: boolean
  businessPurpose: string
  confidence: number
  reasoning: string
}

export interface CashFlowPrediction {
  predictedAmount: number
  confidence: number
  factors: string[]
  reasoning: string
}

export const aiService = {
  async categorizeTransaction(description: string, amount: number, organizationId: string): Promise<TransactionCategorization> {
    try {
      // Get organization's existing categories for context
      const categories = await prisma.category.findMany({
        where: { organizationId },
        select: { name: true, type: true }
      })

      const categoryContext = categories.map(c => `${c.name} (${c.type})`).join(', ')

      const prompt = `
You are an AI assistant helping to categorize financial transactions for a bookkeeping platform.

Transaction Details:
- Description: "${description}"
- Amount: $${amount}

Available Categories: ${categoryContext}

Please categorize this transaction and provide:
1. The most appropriate category name
2. A relevant subcategory
3. Your confidence level (0-1)
4. Brief reasoning for your choice

Respond in JSON format:
{
  "category": "category_name",
  "subcategory": "subcategory_name", 
  "confidence": 0.95,
  "reasoning": "Brief explanation"
}
`

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 200
      })

      const result = JSON.parse(response.choices[0].message.content || '{}')
      
      // Log AI analysis
      await prisma.aIAnalysis.create({
        data: {
          organizationId,
          type: 'TRANSACTION_CATEGORIZATION',
          input: { description, amount },
          output: result,
          confidence: result.confidence,
          model: 'gpt-3.5-turbo',
          cost: response.usage ? response.usage.total_tokens * 0.000002 : undefined
        }
      })

      return result
    } catch (error) {
      console.error('AI categorization error:', error)
      // Fallback categorization
      return {
        category: 'Uncategorized',
        subcategory: 'General',
        confidence: 0.1,
        reasoning: 'AI categorization failed, using fallback'
      }
    }
  },

  async analyzeExpense(description: string, amount: number, organizationId: string): Promise<ExpenseAnalysis> {
    try {
      const prompt = `
You are an AI assistant analyzing business expenses for tax deduction purposes.

Expense Details:
- Description: "${description}"
- Amount: $${amount}

Analyze this expense and determine:
1. Is it likely tax deductible? (true/false)
2. What is the business purpose?
3. Confidence level (0-1)
4. Brief reasoning

Respond in JSON format:
{
  "isTaxDeductible": true,
  "businessPurpose": "Brief business purpose",
  "confidence": 0.85,
  "reasoning": "Brief explanation"
}
`

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 200
      })

      const result = JSON.parse(response.choices[0].message.content || '{}')

      // Log AI analysis
      await prisma.aIAnalysis.create({
        data: {
          organizationId,
          type: 'EXPENSE_PREDICTION',
          input: { description, amount },
          output: result,
          confidence: result.confidence,
          model: 'gpt-3.5-turbo',
          cost: response.usage ? response.usage.total_tokens * 0.000002 : undefined
        }
      })

      return result
    } catch (error) {
      console.error('AI expense analysis error:', error)
      return {
        isTaxDeductible: false,
        businessPurpose: 'Unable to determine',
        confidence: 0.1,
        reasoning: 'AI analysis failed'
      }
    }
  },

  async predictCashFlow(organizationId: string, days: number = 30): Promise<CashFlowPrediction> {
    try {
      // Get recent transaction history
      const recentTransactions = await prisma.transaction.findMany({
        where: {
          organizationId,
          date: {
            gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
          }
        },
        orderBy: { date: 'desc' },
        take: 100
      })

      const transactionSummary = recentTransactions.map(t => ({
        type: t.type,
        amount: t.amount,
        date: t.date,
        category: t.category
      }))

      const prompt = `
You are an AI assistant predicting cash flow for a business.

Recent Transaction History (last 90 days):
${JSON.stringify(transactionSummary, null, 2)}

Predict the cash flow for the next ${days} days and provide:
1. Predicted net cash flow amount
2. Confidence level (0-1)
3. Key factors influencing the prediction
4. Brief reasoning

Respond in JSON format:
{
  "predictedAmount": 15000.00,
  "confidence": 0.75,
  "factors": ["factor1", "factor2", "factor3"],
  "reasoning": "Brief explanation"
}
`

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 300
      })

      const result = JSON.parse(response.choices[0].message.content || '{}')

      // Log AI analysis
      await prisma.aIAnalysis.create({
        data: {
          organizationId,
          type: 'CASH_FLOW_PREDICTION',
          input: { days, transactionCount: transactionSummary.length },
          output: result,
          confidence: result.confidence,
          model: 'gpt-3.5-turbo',
          cost: response.usage ? response.usage.total_tokens * 0.000002 : undefined
        }
      })

      return result
    } catch (error) {
      console.error('AI cash flow prediction error:', error)
      return {
        predictedAmount: 0,
        confidence: 0.1,
        factors: ['Insufficient data'],
        reasoning: 'AI prediction failed'
      }
    }
  },

  async detectAnomalies(organizationId: string): Promise<any[]> {
    try {
      // Get recent transactions
      const recentTransactions = await prisma.transaction.findMany({
        where: {
          organizationId,
          date: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        },
        orderBy: { date: 'desc' },
        take: 200
      })

      if (recentTransactions.length < 10) {
        return [] // Not enough data for anomaly detection
      }

      const prompt = `
You are an AI assistant detecting financial anomalies in business transactions.

Recent Transactions (last 30 days):
${JSON.stringify(recentTransactions.slice(0, 50), null, 2)}

Analyze these transactions and identify any anomalies such as:
- Unusually large amounts
- Unexpected categories
- Irregular patterns
- Potential errors or fraud

Respond with an array of anomalies in JSON format:
[
  {
    "type": "unusual_amount",
    "transactionId": "transaction_id",
    "severity": "high|medium|low",
    "description": "Description of anomaly",
    "confidence": 0.85
  }
]
`

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 500
      })

      const anomalies = JSON.parse(response.choices[0].message.content || '[]')

      // Log AI analysis
      if (anomalies.length > 0) {
        await prisma.aIAnalysis.create({
          data: {
            organizationId,
            type: 'ANOMALY_DETECTION',
            input: { transactionCount: recentTransactions.length },
            output: anomalies,
            confidence: anomalies.reduce((sum: number, a: any) => sum + a.confidence, 0) / anomalies.length,
            model: 'gpt-3.5-turbo',
            cost: response.usage ? response.usage.total_tokens * 0.000002 : undefined
          }
        })
      }

      return anomalies
    } catch (error) {
      console.error('AI anomaly detection error:', error)
      return []
    }
  },

  async generateInsights(organizationId: string): Promise<string[]> {
    try {
      // Get financial data for insights
      const [transactions, expenses, invoices] = await Promise.all([
        prisma.transaction.findMany({
          where: { organizationId },
          take: 100,
          orderBy: { date: 'desc' }
        }),
        prisma.expense.findMany({
          where: { organizationId },
          take: 50,
          orderBy: { date: 'desc' }
        }),
        prisma.invoice.findMany({
          where: { organizationId },
          take: 50,
          orderBy: { createdAt: 'desc' }
        })
      ])

      const prompt = `
You are an AI assistant generating business insights from financial data.

Financial Data:
- Transactions: ${transactions.length} recent transactions
- Expenses: ${expenses.length} recent expenses  
- Invoices: ${invoices.length} recent invoices

Generate 3-5 actionable business insights based on this data. Focus on:
- Spending patterns
- Revenue trends
- Cost optimization opportunities
- Cash flow management
- Business growth recommendations

Respond with an array of insight strings:
[
  "Insight 1: ...",
  "Insight 2: ...",
  "Insight 3: ..."
]
`

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 400
      })

      const insights = JSON.parse(response.choices[0].message.content || '[]')

      // Log AI analysis
      await prisma.aIAnalysis.create({
        data: {
          organizationId,
          type: 'INSIGHT_GENERATION',
          input: { 
            transactionCount: transactions.length,
            expenseCount: expenses.length,
            invoiceCount: invoices.length
          },
          output: insights,
          confidence: 0.8,
          model: 'gpt-3.5-turbo',
          cost: response.usage ? response.usage.total_tokens * 0.000002 : undefined
        }
      })

      return insights
    } catch (error) {
      console.error('AI insight generation error:', error)
      return ['Unable to generate insights at this time.']
    }
  }
}