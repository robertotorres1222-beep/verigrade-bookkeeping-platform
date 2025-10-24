import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export class NLPQueryEnhancedService {
  // Enhanced NLP with SaaS-specific Queries
  async processQuery(userId: string, query: string) {
    try {
      // Parse and understand the query
      const parsedQuery = await this.parseQuery(query);
      
      // Classify query intent
      const intent = await this.classifyQueryIntent(parsedQuery);
      
      // Process based on intent
      const result = await this.processQueryByIntent(userId, parsedQuery, intent);
      
      // Store query for learning
      await this.storeQueryForLearning(userId, query, intent, result);
      
      return {
        query,
        intent,
        result,
        confidence: result.confidence,
        suggestions: result.suggestions || []
      };
    } catch (error) {
      throw new Error(`Failed to process query: ${error.message}`);
    }
  }

  // Natural Language Financial Questions
  async processFinancialQuery(userId: string, query: string) {
    try {
      const financialIntent = await this.classifyFinancialIntent(query);
      
      switch (financialIntent.type) {
        case 'revenue_analysis':
          return await this.analyzeRevenue(userId, financialIntent.parameters);
        case 'expense_analysis':
          return await this.analyzeExpenses(userId, financialIntent.parameters);
        case 'profitability':
          return await this.analyzeProfitability(userId, financialIntent.parameters);
        case 'cash_flow':
          return await this.analyzeCashFlow(userId, financialIntent.parameters);
        case 'budget_variance':
          return await this.analyzeBudgetVariance(userId, financialIntent.parameters);
        case 'forecasting':
          return await this.generateForecast(userId, financialIntent.parameters);
        case 'comparison':
          return await this.generateComparison(userId, financialIntent.parameters);
        case 'trend_analysis':
          return await this.analyzeTrends(userId, financialIntent.parameters);
        default:
          return await this.processGeneralQuery(userId, query);
      }
    } catch (error) {
      throw new Error(`Failed to process financial query: ${error.message}`);
    }
  }

  // Conversational Query Interface
  async processConversationalQuery(userId: string, conversation: any[]) {
    try {
      const context = await this.buildConversationContext(conversation);
      const currentQuery = conversation[conversation.length - 1];
      
      // Process with context
      const result = await this.processQueryWithContext(userId, currentQuery, context);
      
      // Update conversation context
      const updatedContext = await this.updateConversationContext(context, currentQuery, result);
      
      return {
        response: result.response,
        context: updatedContext,
        followUpQuestions: result.followUpQuestions || [],
        suggestions: result.suggestions || []
      };
    } catch (error) {
      throw new Error(`Failed to process conversational query: ${error.message}`);
    }
  }

  // Query Intent Classification
  async classifyQueryIntent(query: any) {
    try {
      const intents = {
        'data_retrieval': this.isDataRetrievalQuery(query),
        'analysis': this.isAnalysisQuery(query),
        'forecasting': this.isForecastingQuery(query),
        'comparison': this.isComparisonQuery(query),
        'reporting': this.isReportingQuery(query),
        'optimization': this.isOptimizationQuery(query),
        'alerting': this.isAlertingQuery(query),
        'general': true // fallback
      };

      const matchedIntents = Object.entries(intents)
        .filter(([_, matches]) => matches)
        .map(([intent, _]) => intent);

      return {
        primary: matchedIntents[0] || 'general',
        secondary: matchedIntents.slice(1),
        confidence: this.calculateIntentConfidence(query, matchedIntents)
      };
    } catch (error) {
      throw new Error(`Failed to classify query intent: ${error.message}`);
    }
  }

  // Multi-step Query Resolution
  async resolveMultiStepQuery(userId: string, query: string) {
    try {
      // Break down complex query into steps
      const steps = await this.decomposeQuery(query);
      
      const results = [];
      let context = {};

      for (const step of steps) {
        const stepResult = await this.processQueryStep(userId, step, context);
        results.push(stepResult);
        context = { ...context, ...stepResult.context };
      }

      // Synthesize final result
      const finalResult = await this.synthesizeResults(results);

      return {
        originalQuery: query,
        steps,
        results,
        finalResult,
        confidence: this.calculateMultiStepConfidence(results)
      };
    } catch (error) {
      throw new Error(`Failed to resolve multi-step query: ${error.message}`);
    }
  }

  // SaaS-specific Query Processing
  async processSaaSQuery(userId: string, query: string) {
    try {
      const saasIntent = await this.classifySaaSIntent(query);
      
      switch (saasIntent.type) {
        case 'mrr_analysis':
          return await this.analyzeMRR(userId, saasIntent.parameters);
        case 'churn_analysis':
          return await this.analyzeChurn(userId, saasIntent.parameters);
        case 'ltv_analysis':
          return await this.analyzeLTV(userId, saasIntent.parameters);
        case 'cac_analysis':
          return await this.analyzeCAC(userId, saasIntent.parameters);
        case 'retention_analysis':
          return await this.analyzeRetention(userId, saasIntent.parameters);
        case 'expansion_analysis':
          return await this.analyzeExpansion(userId, saasIntent.parameters);
        case 'cohort_analysis':
          return await this.analyzeCohorts(userId, saasIntent.parameters);
        case 'revenue_recognition':
          return await this.analyzeRevenueRecognition(userId, saasIntent.parameters);
        default:
          return await this.processFinancialQuery(userId, query);
      }
    } catch (error) {
      throw new Error(`Failed to process SaaS query: ${error.message}`);
    }
  }

  // Query Learning and Improvement
  async learnFromQuery(userId: string, query: string, userFeedback: any) {
    try {
      const learningRecord = await prisma.nlpLearningRecord.create({
        data: {
          id: uuidv4(),
          userId,
          query,
          userFeedback: JSON.stringify(userFeedback),
          intent: userFeedback.intent,
          wasHelpful: userFeedback.wasHelpful,
          suggestions: JSON.stringify(userFeedback.suggestions),
          createdAt: new Date()
        }
      });

      // Update query patterns
      await this.updateQueryPatterns(userId, query, userFeedback);
      
      // Retrain if enough feedback accumulated
      const feedbackCount = await prisma.nlpLearningRecord.count({
        where: {
          userId,
          wasHelpful: false,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      });

      if (feedbackCount >= 20) {
        await this.retrainQueryClassifier(userId);
      }

      return learningRecord;
    } catch (error) {
      throw new Error(`Failed to learn from query: ${error.message}`);
    }
  }

  // Query Suggestions and Auto-complete
  async getQuerySuggestions(userId: string, partialQuery: string) {
    try {
      const suggestions = [];

      // Get popular queries for this user
      const userQueries = await this.getUserPopularQueries(userId);
      
      // Get similar queries
      const similarQueries = await this.findSimilarQueries(partialQuery);
      
      // Get template queries
      const templateQueries = await this.getTemplateQueries();
      
      // Combine and rank suggestions
      const allSuggestions = [
        ...userQueries.map(q => ({ ...q, type: 'user_history' })),
        ...similarQueries.map(q => ({ ...q, type: 'similar' })),
        ...templateQueries.map(q => ({ ...q, type: 'template' }))
      ];

      // Rank by relevance
      const rankedSuggestions = this.rankSuggestions(partialQuery, allSuggestions);

      return rankedSuggestions.slice(0, 10);
    } catch (error) {
      throw new Error(`Failed to get query suggestions: ${error.message}`);
    }
  }

  // Helper Methods
  private async parseQuery(query: string) {
    return {
      text: query,
      tokens: query.toLowerCase().split(/\s+/),
      entities: await this.extractEntities(query),
      sentiment: await this.analyzeSentiment(query),
      complexity: this.analyzeComplexity(query)
    };
  }

  private async extractEntities(query: string): Promise<any[]> {
    const entities = [];
    
    // Extract dates
    const datePatterns = [
      /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}\b/i,
      /\b\d{1,2}\/\d{1,2}\/\d{4}\b/,
      /\b\d{4}-\d{2}-\d{2}\b/
    ];
    
    for (const pattern of datePatterns) {
      const matches = query.match(pattern);
      if (matches) {
        entities.push({ type: 'date', value: matches[0] });
      }
    }
    
    // Extract amounts
    const amountPatterns = [
      /\$\d+(?:,\d{3})*(?:\.\d{2})?/,
      /\b\d+(?:,\d{3})*(?:\.\d{2})?\s*(?:dollars?|USD)\b/i
    ];
    
    for (const pattern of amountPatterns) {
      const matches = query.match(pattern);
      if (matches) {
        entities.push({ type: 'amount', value: matches[0] });
      }
    }
    
    // Extract time periods
    const timePatterns = [
      /\b(last|this|next)\s+(week|month|quarter|year)\b/i,
      /\b\d+\s+(days?|weeks?|months?|quarters?|years?)\b/i
    ];
    
    for (const pattern of timePatterns) {
      const matches = query.match(pattern);
      if (matches) {
        entities.push({ type: 'time_period', value: matches[0] });
      }
    }
    
    return entities;
  }

  private async analyzeSentiment(query: string): Promise<string> {
    const positiveWords = ['good', 'great', 'excellent', 'increased', 'growing', 'profitable'];
    const negativeWords = ['bad', 'terrible', 'decreased', 'declining', 'loss', 'problem'];
    
    const words = query.toLowerCase().split(/\s+/);
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private analyzeComplexity(query: string): string {
    const wordCount = query.split(/\s+/).length;
    const hasMultipleQuestions = (query.match(/\?/g) || []).length > 1;
    const hasComplexTerms = /\b(analyze|compare|forecast|trend|variance|correlation)\b/i.test(query);
    
    if (wordCount > 20 || hasMultipleQuestions || hasComplexTerms) {
      return 'complex';
    } else if (wordCount > 10) {
      return 'moderate';
    } else {
      return 'simple';
    }
  }

  private async classifyFinancialIntent(query: any) {
    const queryText = query.text.toLowerCase();
    
    if (/\b(revenue|income|sales)\b/.test(queryText)) {
      return { type: 'revenue_analysis', parameters: this.extractRevenueParameters(query) };
    }
    if (/\b(expense|cost|spending)\b/.test(queryText)) {
      return { type: 'expense_analysis', parameters: this.extractExpenseParameters(query) };
    }
    if (/\b(profit|profitability|margin)\b/.test(queryText)) {
      return { type: 'profitability', parameters: this.extractProfitabilityParameters(query) };
    }
    if (/\b(cash flow|cashflow)\b/.test(queryText)) {
      return { type: 'cash_flow', parameters: this.extractCashFlowParameters(query) };
    }
    if (/\b(budget|variance|actual)\b/.test(queryText)) {
      return { type: 'budget_variance', parameters: this.extractBudgetParameters(query) };
    }
    if (/\b(forecast|predict|projection)\b/.test(queryText)) {
      return { type: 'forecasting', parameters: this.extractForecastParameters(query) };
    }
    if (/\b(compare|comparison|vs|versus)\b/.test(queryText)) {
      return { type: 'comparison', parameters: this.extractComparisonParameters(query) };
    }
    if (/\b(trend|trending|change)\b/.test(queryText)) {
      return { type: 'trend_analysis', parameters: this.extractTrendParameters(query) };
    }
    
    return { type: 'general', parameters: {} };
  }

  private async classifySaaSIntent(query: any) {
    const queryText = query.text.toLowerCase();
    
    if (/\b(mrr|monthly recurring revenue)\b/.test(queryText)) {
      return { type: 'mrr_analysis', parameters: this.extractMRRParameters(query) };
    }
    if (/\b(churn|churning|cancellation)\b/.test(queryText)) {
      return { type: 'churn_analysis', parameters: this.extractChurnParameters(query) };
    }
    if (/\b(ltv|lifetime value)\b/.test(queryText)) {
      return { type: 'ltv_analysis', parameters: this.extractLTVParameters(query) };
    }
    if (/\b(cac|customer acquisition cost)\b/.test(queryText)) {
      return { type: 'cac_analysis', parameters: this.extractCACParameters(query) };
    }
    if (/\b(retention|retaining)\b/.test(queryText)) {
      return { type: 'retention_analysis', parameters: this.extractRetentionParameters(query) };
    }
    if (/\b(expansion|upsell|upgrade)\b/.test(queryText)) {
      return { type: 'expansion_analysis', parameters: this.extractExpansionParameters(query) };
    }
    if (/\b(cohort|cohorts)\b/.test(queryText)) {
      return { type: 'cohort_analysis', parameters: this.extractCohortParameters(query) };
    }
    if (/\b(revenue recognition|asc 606)\b/.test(queryText)) {
      return { type: 'revenue_recognition', parameters: this.extractRevenueRecognitionParameters(query) };
    }
    
    return { type: 'general', parameters: {} };
  }

  private isDataRetrievalQuery(query: any): boolean {
    const retrievalKeywords = ['show', 'get', 'find', 'list', 'display', 'retrieve'];
    return retrievalKeywords.some(keyword => query.text.toLowerCase().includes(keyword));
  }

  private isAnalysisQuery(query: any): boolean {
    const analysisKeywords = ['analyze', 'analysis', 'breakdown', 'insights', 'understand'];
    return analysisKeywords.some(keyword => query.text.toLowerCase().includes(keyword));
  }

  private isForecastingQuery(query: any): boolean {
    const forecastKeywords = ['forecast', 'predict', 'projection', 'future', 'next'];
    return forecastKeywords.some(keyword => query.text.toLowerCase().includes(keyword));
  }

  private isComparisonQuery(query: any): boolean {
    const comparisonKeywords = ['compare', 'vs', 'versus', 'against', 'difference'];
    return comparisonKeywords.some(keyword => query.text.toLowerCase().includes(keyword));
  }

  private isReportingQuery(query: any): boolean {
    const reportKeywords = ['report', 'summary', 'overview', 'dashboard'];
    return reportKeywords.some(keyword => query.text.toLowerCase().includes(keyword));
  }

  private isOptimizationQuery(query: any): boolean {
    const optimizationKeywords = ['optimize', 'improve', 'reduce', 'increase', 'maximize'];
    return optimizationKeywords.some(keyword => query.text.toLowerCase().includes(keyword));
  }

  private isAlertingQuery(query: any): boolean {
    const alertKeywords = ['alert', 'notify', 'warning', 'threshold', 'exceed'];
    return alertKeywords.some(keyword => query.text.toLowerCase().includes(keyword));
  }

  private calculateIntentConfidence(query: any, matchedIntents: string[]): number {
    if (matchedIntents.length === 0) return 0.1;
    if (matchedIntents.length === 1) return 0.9;
    return 0.7; // Multiple intents matched
  }

  private async processQueryByIntent(userId: string, query: any, intent: any) {
    // Simplified query processing based on intent
    return {
      response: `Processed ${intent.primary} query: ${query.text}`,
      confidence: intent.confidence,
      data: {},
      suggestions: []
    };
  }

  private async storeQueryForLearning(userId: string, query: string, intent: any, result: any) {
    await prisma.nlpQueryLog.create({
      data: {
        id: uuidv4(),
        userId,
        query,
        intent: intent.primary,
        confidence: result.confidence,
        response: JSON.stringify(result),
        createdAt: new Date()
      }
    });
  }

  // Simplified parameter extraction methods
  private extractRevenueParameters(query: any): any { return {}; }
  private extractExpenseParameters(query: any): any { return {}; }
  private extractProfitabilityParameters(query: any): any { return {}; }
  private extractCashFlowParameters(query: any): any { return {}; }
  private extractBudgetParameters(query: any): any { return {}; }
  private extractForecastParameters(query: any): any { return {}; }
  private extractComparisonParameters(query: any): any { return {}; }
  private extractTrendParameters(query: any): any { return {}; }
  private extractMRRParameters(query: any): any { return {}; }
  private extractChurnParameters(query: any): any { return {}; }
  private extractLTVParameters(query: any): any { return {}; }
  private extractCACParameters(query: any): any { return {}; }
  private extractRetentionParameters(query: any): any { return {}; }
  private extractExpansionParameters(query: any): any { return {}; }
  private extractCohortParameters(query: any): any { return {}; }
  private extractRevenueRecognitionParameters(query: any): any { return {}; }

  // Simplified analysis methods
  private async analyzeRevenue(userId: string, parameters: any): Promise<any> {
    return { type: 'revenue_analysis', data: {}, confidence: 0.8 };
  }
  private async analyzeExpenses(userId: string, parameters: any): Promise<any> {
    return { type: 'expense_analysis', data: {}, confidence: 0.8 };
  }
  private async analyzeProfitability(userId: string, parameters: any): Promise<any> {
    return { type: 'profitability', data: {}, confidence: 0.8 };
  }
  private async analyzeCashFlow(userId: string, parameters: any): Promise<any> {
    return { type: 'cash_flow', data: {}, confidence: 0.8 };
  }
  private async analyzeBudgetVariance(userId: string, parameters: any): Promise<any> {
    return { type: 'budget_variance', data: {}, confidence: 0.8 };
  }
  private async generateForecast(userId: string, parameters: any): Promise<any> {
    return { type: 'forecasting', data: {}, confidence: 0.8 };
  }
  private async generateComparison(userId: string, parameters: any): Promise<any> {
    return { type: 'comparison', data: {}, confidence: 0.8 };
  }
  private async analyzeTrends(userId: string, parameters: any): Promise<any> {
    return { type: 'trend_analysis', data: {}, confidence: 0.8 };
  }
  private async processGeneralQuery(userId: string, query: string): Promise<any> {
    return { type: 'general', data: {}, confidence: 0.5 };
  }

  // SaaS-specific analysis methods
  private async analyzeMRR(userId: string, parameters: any): Promise<any> {
    return { type: 'mrr_analysis', data: {}, confidence: 0.9 };
  }
  private async analyzeChurn(userId: string, parameters: any): Promise<any> {
    return { type: 'churn_analysis', data: {}, confidence: 0.9 };
  }
  private async analyzeLTV(userId: string, parameters: any): Promise<any> {
    return { type: 'ltv_analysis', data: {}, confidence: 0.9 };
  }
  private async analyzeCAC(userId: string, parameters: any): Promise<any> {
    return { type: 'cac_analysis', data: {}, confidence: 0.9 };
  }
  private async analyzeRetention(userId: string, parameters: any): Promise<any> {
    return { type: 'retention_analysis', data: {}, confidence: 0.9 };
  }
  private async analyzeExpansion(userId: string, parameters: any): Promise<any> {
    return { type: 'expansion_analysis', data: {}, confidence: 0.9 };
  }
  private async analyzeCohorts(userId: string, parameters: any): Promise<any> {
    return { type: 'cohort_analysis', data: {}, confidence: 0.9 };
  }
  private async analyzeRevenueRecognition(userId: string, parameters: any): Promise<any> {
    return { type: 'revenue_recognition', data: {}, confidence: 0.9 };
  }

  // Additional helper methods would be implemented here...
  private async buildConversationContext(conversation: any[]): Promise<any> {
    return { history: conversation, context: {} };
  }

  private async processQueryWithContext(userId: string, query: any, context: any): Promise<any> {
    return { response: 'Context-aware response', followUpQuestions: [], suggestions: [] };
  }

  private async updateConversationContext(context: any, query: any, result: any): Promise<any> {
    return { ...context, lastQuery: query, lastResult: result };
  }

  private async decomposeQuery(query: string): Promise<any[]> {
    return [{ step: 1, query: query, type: 'main' }];
  }

  private async processQueryStep(userId: string, step: any, context: any): Promise<any> {
    return { result: 'Step result', context: {} };
  }

  private async synthesizeResults(results: any[]): Promise<any> {
    return { finalResult: 'Synthesized result', confidence: 0.8 };
  }

  private calculateMultiStepConfidence(results: any[]): number {
    return results.reduce((sum, result) => sum + (result.confidence || 0.5), 0) / results.length;
  }

  private async updateQueryPatterns(userId: string, query: string, feedback: any): Promise<void> {
    // Simplified pattern update
  }

  private async retrainQueryClassifier(userId: string): Promise<void> {
    // Simplified retraining
  }

  private async getUserPopularQueries(userId: string): Promise<any[]> {
    return [];
  }

  private async findSimilarQueries(partialQuery: string): Promise<any[]> {
    return [];
  }

  private async getTemplateQueries(): Promise<any[]> {
    return [
      { query: 'Show me revenue for last month', category: 'revenue' },
      { query: 'Analyze expenses by category', category: 'expenses' },
      { query: 'What is my MRR trend?', category: 'saas_metrics' }
    ];
  }

  private rankSuggestions(partialQuery: string, suggestions: any[]): any[] {
    return suggestions.sort((a, b) => {
      const aScore = this.calculateRelevanceScore(partialQuery, a.query);
      const bScore = this.calculateRelevanceScore(partialQuery, b.query);
      return bScore - aScore;
    });
  }

  private calculateRelevanceScore(partialQuery: string, suggestion: string): number {
    const partial = partialQuery.toLowerCase();
    const suggestionLower = suggestion.toLowerCase();
    
    if (suggestionLower.includes(partial)) return 1.0;
    if (partial.includes(suggestionLower)) return 0.8;
    
    const commonWords = this.getCommonWords(partial, suggestionLower);
    return commonWords.length / Math.max(partial.split(' ').length, suggestionLower.split(' ').length);
  }

  private getCommonWords(str1: string, str2: string): string[] {
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
    return words1.filter(word => words2.includes(word));
  }
}

export default new NLPQueryEnhancedService();






