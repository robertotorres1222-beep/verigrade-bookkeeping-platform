import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  console.warn('OPENAI_API_KEY not set — categorizer will fail until provided.');
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || undefined });

// Comprehensive category list for bookkeeping
const allowedCategories = [
  "Office Supplies",
  "Software & SaaS", 
  "Meals & Entertainment",
  "Travel",
  "Utilities",
  "Payroll",
  "Rent",
  "Professional Services",
  "Marketing & Advertising",
  "Insurance",
  "Legal & Accounting",
  "Equipment & Hardware",
  "Telecommunications",
  "Banking & Finance",
  "Transportation",
  "Training & Education",
  "Repairs & Maintenance",
  "Taxes & Fees",
  "Charitable Contributions",
  "Other"
];

export interface CategorizationRequest {
  amount: number;
  description: string;
  metadata?: Record<string, any>;
  merchant?: string;
  date?: string;
}

export interface CategorizationResult {
  category: string;
  confidence: number;
  reasoning?: string;
}

/**
 * Categorize a transaction using OpenAI
 */
export async function categorizeTransaction(request: CategorizationRequest): Promise<CategorizationResult> {
  if (!process.env.OPENAI_API_KEY) {
    return {
      category: 'Other',
      confidence: 0,
      reasoning: 'OpenAI API key not configured'
    };
  }

  try {
    const prompt = `
You are an expert bookkeeping assistant. Given a transaction, return the most appropriate category from this exact list: ${JSON.stringify(allowedCategories)}.

Analyze the transaction details and return ONLY a JSON object with:
- "category": the exact category name from the list above
- "confidence": a number from 0-1 indicating your confidence
- "reasoning": a brief explanation of why you chose this category

Transaction details:
- Amount: $${request.amount}
- Description: "${request.description}"
- Merchant: "${request.merchant || 'Unknown'}"
- Date: ${request.date || 'Unknown'}
- Additional metadata: ${JSON.stringify(request.metadata || {})}

Return only the JSON object, no other text.`;

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.1,
    });

    const text = response?.choices?.[0]?.message?.content || '';
    
    try {
      const result = JSON.parse(text);
      
      // Validate the result
      if (!allowedCategories.includes(result.category)) {
        return {
          category: 'Other',
          confidence: 0.1,
          reasoning: `Invalid category returned: ${result.category}`
        };
      }

      return {
        category: result.category,
        confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
        reasoning: result.reasoning || 'AI categorization'
      };
    } catch (parseError) {
      // Fallback: try to extract category from text
      const foundCategory = allowedCategories.find(cat => 
        text.toLowerCase().includes(cat.toLowerCase())
      );
      
      return {
        category: foundCategory || 'Other',
        confidence: 0.3,
        reasoning: 'Fallback categorization due to parsing error'
      };
    }
  } catch (error) {
    console.error('OpenAI categorization error:', error);
    return {
      category: 'Other',
      confidence: 0,
      reasoning: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Batch categorize multiple transactions
 */
export async function categorizeTransactions(requests: CategorizationRequest[]): Promise<CategorizationResult[]> {
  const results: CategorizationResult[] = [];
  
  // Process in batches to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(request => categorizeTransaction(request))
    );
    results.push(...batchResults);
    
    // Add small delay between batches
    if (i + batchSize < requests.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

/**
 * Get category suggestions based on description patterns
 */
export function getCategorySuggestions(description: string): string[] {
  const lowerDesc = description.toLowerCase();
  const suggestions: string[] = [];
  
  // Pattern matching for common transactions
  const patterns: Record<string, string[]> = {
    'office supplies': ['Office Supplies'],
    'software': ['Software & SaaS'],
    'saas': ['Software & SaaS'],
    'subscription': ['Software & SaaS'],
    'lunch': ['Meals & Entertainment'],
    'dinner': ['Meals & Entertainment'],
    'food': ['Meals & Entertainment'],
    'travel': ['Travel'],
    'hotel': ['Travel'],
    'flight': ['Travel'],
    'electric': ['Utilities'],
    'water': ['Utilities'],
    'internet': ['Telecommunications'],
    'phone': ['Telecommunications'],
    'salary': ['Payroll'],
    'wages': ['Payroll'],
    'payroll': ['Payroll'],
    'rent': ['Rent'],
    'lease': ['Rent'],
    'marketing': ['Marketing & Advertising'],
    'advertising': ['Marketing & Advertising'],
    'legal': ['Legal & Accounting'],
    'accounting': ['Legal & Accounting'],
    'lawyer': ['Legal & Accounting'],
    'insurance': ['Insurance'],
    'equipment': ['Equipment & Hardware'],
    'computer': ['Equipment & Hardware'],
    'hardware': ['Equipment & Hardware'],
    'bank': ['Banking & Finance'],
    'fee': ['Banking & Finance'],
    'tax': ['Taxes & Fees'],
    'repair': ['Repairs & Maintenance'],
    'maintenance': ['Repairs & Maintenance']
  };
  
  for (const [pattern, categories] of Object.entries(patterns)) {
    if (lowerDesc.includes(pattern)) {
      suggestions.push(...categories);
    }
  }
  
  // Remove duplicates and return top suggestions
  return [...new Set(suggestions)].slice(0, 3);
}

export default {
  categorizeTransaction,
  categorizeTransactions,
  getCategorySuggestions,
  allowedCategories
};


