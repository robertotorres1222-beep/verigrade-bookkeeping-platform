import axios from 'axios';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';

export interface PerplexitySearchResult {
  success: boolean;
  data: {
    query: string;
    answer: string;
    sources: string[];
    model: string;
  };
  message: string;
}

export interface PerplexityReasonResult {
  success: boolean;
  data: {
    query: string;
    reasoning: string;
    conclusion: string;
    sources: string[];
    model: string;
  };
  message: string;
}

export interface PerplexityDeepResearchResult {
  success: boolean;
  data: {
    query: string;
    research: string;
    focus_areas: string[];
    sources: string[];
    model: string;
  };
  message: string;
}

class PerplexityService {
  private mcpProcess: ChildProcess | null = null;
  private isInitialized = false;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY || '';
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;
    
    if (!this.apiKey) {
      console.log('⚠️ Perplexity API key not found. MCP features will be limited.');
      return false;
    }

    try {
      // Test API connectivity
      const response = await axios.post('https://api.perplexity.ai/chat/completions', {
        model: 'sonar-pro',
        messages: [{ role: 'user', content: 'Test connection' }],
        max_tokens: 10
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      this.isInitialized = true;
      console.log('✅ Perplexity MCP Service initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Perplexity MCP Service:', error);
      return false;
    }
  }

  async search(query: string, forceModel: boolean = false): Promise<PerplexitySearchResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const response = await axios.post('https://api.perplexity.ai/chat/completions', {
        model: 'sonar-pro',
        messages: [{ role: 'user', content: query }],
        max_tokens: 500,
        temperature: 0.2
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        data: {
          query,
          answer: response.data.choices[0]?.message?.content || 'No answer provided',
          sources: response.data.sources || [],
          model: 'sonar-pro'
        },
        message: 'Search completed successfully'
      };
    } catch (error: any) {
      console.error('Perplexity search error:', error);
      return {
        success: false,
        data: {
          query,
          answer: '',
          sources: [],
          model: 'sonar-pro'
        },
        message: error.response?.data?.error?.message || 'Search failed'
      };
    }
  }

  async reason(query: string, forceModel: boolean = false): Promise<PerplexityReasonResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const response = await axios.post('https://api.perplexity.ai/chat/completions', {
        model: 'sonar-reasoning-pro',
        messages: [{ role: 'user', content: query }],
        max_tokens: 1000,
        temperature: 0.3
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        data: {
          query,
          reasoning: response.data.choices[0]?.message?.content || 'No reasoning provided',
          conclusion: response.data.choices[0]?.message?.content || '',
          sources: response.data.sources || [],
          model: 'sonar-reasoning-pro'
        },
        message: 'Reasoning completed successfully'
      };
    } catch (error: any) {
      console.error('Perplexity reasoning error:', error);
      return {
        success: false,
        data: {
          query,
          reasoning: '',
          conclusion: '',
          sources: [],
          model: 'sonar-reasoning-pro'
        },
        message: error.response?.data?.error?.message || 'Reasoning failed'
      };
    }
  }

  async deepResearch(query: string, focusAreas: string[] = [], forceModel: boolean = false): Promise<PerplexityDeepResearchResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const researchQuery = focusAreas.length > 0 
        ? `${query}\n\nFocus areas: ${focusAreas.join(', ')}`
        : query;

      const response = await axios.post('https://api.perplexity.ai/chat/completions', {
        model: 'sonar-deep-research',
        messages: [{ role: 'user', content: researchQuery }],
        max_tokens: 2000,
        temperature: 0.4
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        data: {
          query,
          research: response.data.choices[0]?.message?.content || 'No research provided',
          focus_areas: focusAreas,
          sources: response.data.sources || [],
          model: 'sonar-deep-research'
        },
        message: 'Deep research completed successfully'
      };
    } catch (error: any) {
      console.error('Perplexity deep research error:', error);
      return {
        success: false,
        data: {
          query,
          research: '',
          focus_areas: focusAreas,
          sources: [],
          model: 'sonar-deep-research'
        },
        message: error.response?.data?.error?.message || 'Deep research failed'
      };
    }
  }

  // Business-specific methods for VeriGrade
  async researchAccountingBestPractices(topic: string): Promise<PerplexitySearchResult> {
    return this.search(`Accounting best practices for ${topic} in 2024`);
  }

  async analyzeBusinessTrends(industry: string): Promise<PerplexityReasonResult> {
    return this.reason(`What are the current trends and challenges in ${industry} accounting and bookkeeping?`);
  }

  async deepResearchTaxRegulations(country: string): Promise<PerplexityDeepResearchResult> {
    return this.deepResearch(
      `Tax regulations and compliance requirements for small businesses in ${country}`,
      ['Tax rates', 'Filing requirements', 'Deductions', 'Penalties', 'Recent changes']
    );
  }

  async getCompetitorAnalysis(competitorName: string): Promise<PerplexityDeepResearchResult> {
    return this.deepResearch(
      `Analysis of ${competitorName} bookkeeping and accounting software`,
      ['Features', 'Pricing', 'Market position', 'User reviews', 'Strengths and weaknesses']
    );
  }

  async researchIntegrationOptions(platform: string): Promise<PerplexitySearchResult> {
    return this.search(`How to integrate ${platform} with bookkeeping software APIs`);
  }
}

export const perplexityService = new PerplexityService();
