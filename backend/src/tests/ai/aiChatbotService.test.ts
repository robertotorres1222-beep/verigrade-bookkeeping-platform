import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import * as aiChatbotService from '../../services/aiChatbotService';

describe('AI Chatbot Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('processNaturalLanguageExpense', () => {
    it('should process travel expense correctly', async () => {
      const text = 'I spent $47 on lunch with client at Chipotle';
      const result = await aiChatbotService.processNaturalLanguageExpense(text);
      
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('amount');
      expect(result).toHaveProperty('category');
      expect(result).toHaveProperty('date');
      expect(result).toHaveProperty('currency');
      expect(result.description).toBe(text);
      expect(result.currency).toBe('USD');
    });

    it('should categorize travel expenses correctly', async () => {
      const text = 'Business trip to New York, spent $200 on hotel';
      const result = await aiChatbotService.processNaturalLanguageExpense(text);
      
      expect(result.category).toBe('Travel');
    });

    it('should categorize food expenses correctly', async () => {
      const text = 'Team lunch at restaurant, $85 total';
      const result = await aiChatbotService.processNaturalLanguageExpense(text);
      
      expect(result.category).toBe('Meals & Entertainment');
    });

    it('should categorize software expenses correctly', async () => {
      const text = 'Monthly subscription to Adobe Creative Suite, $52.99';
      const result = await aiChatbotService.processNaturalLanguageExpense(text);
      
      expect(result.category).toBe('Software & Subscriptions');
    });

    it('should default to uncategorized for unknown expenses', async () => {
      const text = 'Random purchase for $25';
      const result = await aiChatbotService.processNaturalLanguageExpense(text);
      
      expect(result.category).toBe('Uncategorized');
    });
  });

  describe('getFinancialAnswer', () => {
    it('should provide profit information', async () => {
      const query = 'What is my current profit?';
      const result = await aiChatbotService.getFinancialAnswer(query);
      
      expect(result).toContain('profit');
      expect(result).toContain('$15,000');
    });

    it('should provide cash flow information', async () => {
      const query = 'How is my cash flow looking?';
      const result = await aiChatbotService.getFinancialAnswer(query);
      
      expect(result).toContain('cash flow');
      expect(result).toContain('positive');
    });

    it('should provide expense information', async () => {
      const query = 'What are my top expenses?';
      const result = await aiChatbotService.getFinancialAnswer(query);
      
      expect(result).toContain('top expense');
      expect(result).toContain('Software & Subscriptions');
    });

    it('should handle unknown queries gracefully', async () => {
      const query = 'What is the meaning of life?';
      const result = await aiChatbotService.getFinancialAnswer(query);
      
      expect(result).toContain("I'm sorry");
      expect(result).toContain("don't have enough information");
    });
  });
});







