import express from 'express';
import aiChatbotController from '../controllers/aiChatbotController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route POST /api/ai/chat/message
 * @desc Send message to AI chatbot
 * @access Private
 */
router.post('/message', aiChatbotController.sendMessage);

/**
 * @route GET /api/ai/chat/history/:userId
 * @desc Get chat history for user
 * @access Private
 */
router.get('/history/:userId', aiChatbotController.getChatHistory);

/**
 * @route POST /api/ai/chat/voice
 * @desc Process voice input
 * @access Private
 */
router.post('/voice', aiChatbotController.processVoiceInput);

/**
 * @route POST /api/ai/chat/feedback
 * @desc Provide feedback on AI response
 * @access Private
 */
router.post('/feedback', aiChatbotController.provideFeedback);

/**
 * @route GET /api/ai/chat/suggestions/:userId
 * @desc Get AI suggestions for user
 * @access Private
 */
router.get('/suggestions/:userId', aiChatbotController.getSuggestions);

/**
 * @route DELETE /api/ai/chat/history/:userId
 * @desc Clear conversation history
 * @access Private
 */
router.delete('/history/:userId', aiChatbotController.clearHistory);

export default router;










