import { Router } from 'express';
import { 
  getChannels, 
  getUsers, 
  getChannelMessages, 
  sendMessage, 
  notifyInvoiceCreated, 
  notifyPaymentReceived, 
  notifyLowStock, 
  notifyOverdueInvoices, 
  setupWebhook 
} from '../controllers/slackController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get Slack channels
router.get('/connections/:connectionId/channels', authenticateToken, getChannels);

// Get Slack users
router.get('/connections/:connectionId/users', authenticateToken, getUsers);

// Get messages from a channel
router.get('/connections/:connectionId/channels/:channelId/messages', authenticateToken, getChannelMessages);

// Send a message to a channel
router.post('/connections/:connectionId/messages', authenticateToken, sendMessage);

// Send invoice created notification
router.post('/connections/:connectionId/notifications/invoice-created', authenticateToken, notifyInvoiceCreated);

// Send payment received notification
router.post('/connections/:connectionId/notifications/payment-received', authenticateToken, notifyPaymentReceived);

// Send low stock notification
router.post('/connections/:connectionId/notifications/low-stock', authenticateToken, notifyLowStock);

// Send overdue invoices notification
router.post('/connections/:connectionId/notifications/overdue-invoices', authenticateToken, notifyOverdueInvoices);

// Setup webhook
router.post('/connections/:connectionId/webhook', authenticateToken, setupWebhook);

export default router;










