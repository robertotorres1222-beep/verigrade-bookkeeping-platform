import { Request, Response } from 'express';
import AIChatbotService from '../services/aiChatbotService';
import AIFinancialQAService from '../services/aiFinancialQAService';

const aiChatbotService = new AIChatbotService();
const aiFinancialQAService = new AIFinancialQAService();

/**
 * Send chat message to AI chatbot
 */
export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { message, type = 'text' } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    let response;

    if (type === 'expense_entry') {
      // Process as expense entry
      const result = await aiChatbotService.processExpenseEntry(userId, message);
      response = {
        type: 'expense_entry',
        expense: result.expense,
        confirmation: result.confirmation,
        suggestions: result.suggestions,
        success: true
      };
    } else if (type === 'financial_query') {
      // Process as financial Q&A
      const result = await aiChatbotService.processFinancialQuery(userId, message);
      response = {
        type: 'financial_query',
        query: result.query,
        intent: result.intent,
        response: result.response,
        data: result.data,
        confidence: result.confidence,
        success: true
      };
    } else {
      // General chat
      const result = await aiFinancialQAService.processQuery(userId, message);
      response = {
        type: 'general_chat',
        query: result.query,
        intent: result.intent,
        response: result.response,
        data: result.data,
        confidence: result.confidence,
        followUpQuestions: result.followUpQuestions,
        success: true
      };
    }

    // Store message in conversation history
    await aiChatbotService.addMessage(userId, {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    await aiChatbotService.addMessage(userId, {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response.response || response.confirmation,
      timestamp: new Date(),
      metadata: response
    });

    res.json(response);

  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      success: false 
    });
  }
};

/**
 * Get chat history for user
 */
export const getChatHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;

    const history = await aiChatbotService.getConversationHistory(
      userId, 
      parseInt(limit as string)
    );

    res.json({
      history,
      success: true
    });

  } catch (error) {
    console.error('Error getting chat history:', error);
    res.status(500).json({ 
      error: 'Failed to get chat history',
      success: false 
    });
  }
};

/**
 * Process voice input
 */
export const processVoiceInput = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { audioData } = req.body;

    if (!audioData) {
      res.status(400).json({ error: 'Audio data is required' });
      return;
    }

    // Convert base64 audio data to buffer
    const audioBuffer = Buffer.from(audioData, 'base64');
    
    // Process voice input to text
    const transcription = await aiChatbotService.processVoiceInput(audioBuffer);
    
    // Process the transcribed text
    const result = await aiChatbotService.processFinancialQuery(userId, transcription);

    res.json({
      transcription,
      query: result.query,
      intent: result.intent,
      response: result.response,
      data: result.data,
      confidence: result.confidence,
      success: true
    });

  } catch (error) {
    console.error('Error processing voice input:', error);
    res.status(500).json({ 
      error: 'Failed to process voice input',
      success: false 
    });
  }
};

/**
 * Provide feedback on AI response
 */
export const provideFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { messageId, feedback, rating } = req.body;

    if (!messageId || !feedback) {
      res.status(400).json({ error: 'Message ID and feedback are required' });
      return;
    }

    // Store feedback for AI model improvement
    // This would typically be stored in a feedback database
    console.log(`Feedback for message ${messageId}: ${feedback} (rating: ${rating})`);

    res.json({
      message: 'Feedback received',
      success: true
    });

  } catch (error) {
    console.error('Error providing feedback:', error);
    res.status(500).json({ 
      error: 'Failed to process feedback',
      success: false 
    });
  }
};

/**
 * Get AI suggestions for user
 */
export const getSuggestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { context } = req.query;

    // Generate contextual suggestions based on user's financial data
    const suggestions = await generateContextualSuggestions(userId, context as string);

    res.json({
      suggestions,
      success: true
    });

  } catch (error) {
    console.error('Error getting suggestions:', error);
    res.status(500).json({ 
      error: 'Failed to get suggestions',
      success: false 
    });
  }
};

/**
 * Clear conversation history
 */
export const clearHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    // Clear conversation context
    // In a real implementation, you would clear from database
    console.log(`Clearing conversation history for user ${userId}`);

    res.json({
      message: 'Conversation history cleared',
      success: true
    });

  } catch (error) {
    console.error('Error clearing history:', error);
    res.status(500).json({ 
      error: 'Failed to clear history',
      success: false 
    });
  }
};

/**
 * Generate contextual suggestions based on user data
 */
async function generateContextualSuggestions(userId: string, context?: string): Promise<string[]> {
  const suggestions: string[] = [];

  // Common suggestions
  suggestions.push("What's my cash flow this month?");
  suggestions.push("Show me my biggest expenses");
  suggestions.push("How much revenue did I generate?");
  suggestions.push("Create expense for $25 at Starbucks");

  // Context-specific suggestions
  if (context === 'expense_entry') {
    suggestions.push("Add receipt photo");
    suggestions.push("Set up recurring expense");
    suggestions.push("Categorize as business expense");
  } else if (context === 'revenue_analysis') {
    suggestions.push("Compare to last month");
    suggestions.push("Show revenue by client");
    suggestions.push("Project next month's revenue");
  } else if (context === 'dashboard') {
    suggestions.push("What's my profit margin?");
    suggestions.push("Show expense breakdown");
    suggestions.push("Generate financial report");
  }

  return suggestions;
}

export default {
  sendMessage,
  getChatHistory,
  processVoiceInput,
  provideFeedback,
  getSuggestions,
  clearHistory
};







