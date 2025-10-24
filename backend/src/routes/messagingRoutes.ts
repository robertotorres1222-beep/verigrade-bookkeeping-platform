import { Router } from 'express';
import { messagingController } from '../controllers/messagingController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Messaging routes
router.post('/messaging/send', authenticate, messagingController.sendMessage);
router.get('/messaging/messages', authenticate, messagingController.getMessages);
router.put('/messaging/messages/:messageId/read', authenticate, messagingController.markAsRead);
router.get('/messaging/conversations', authenticate, messagingController.getConversations);
router.get('/messaging/statistics', authenticate, messagingController.getMessagingStatistics);

export default router;

