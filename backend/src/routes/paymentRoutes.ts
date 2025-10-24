import { Router } from 'express';
import { 
  createPaymentMethod,
  getClientPaymentMethods,
  setDefaultPaymentMethod,
  deletePaymentMethod,
  createPaymentIntent,
  processPayment,
  getPaymentIntent,
  getClientPaymentIntents,
  refundPayment,
  handlePaymentWebhook
} from '../controllers/paymentController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Payment methods
router.post('/:clientId/payment-methods', authenticateToken, createPaymentMethod);
router.get('/:clientId/payment-methods', authenticateToken, getClientPaymentMethods);
router.put('/:clientId/payment-methods/:paymentMethodId/default', authenticateToken, setDefaultPaymentMethod);
router.delete('/:clientId/payment-methods/:paymentMethodId', authenticateToken, deletePaymentMethod);

// Payment intents
router.post('/:clientId/payment-intents', authenticateToken, createPaymentIntent);
router.post('/payment-intents/:paymentIntentId/process', authenticateToken, processPayment);
router.get('/payment-intents/:paymentIntentId', authenticateToken, getPaymentIntent);
router.get('/:clientId/payment-intents', authenticateToken, getClientPaymentIntents);

// Payment operations
router.post('/payment-intents/:paymentIntentId/refund', authenticateToken, refundPayment);

// Webhooks (no authentication required)
router.post('/webhooks/:processorId', handlePaymentWebhook);

export default router;







