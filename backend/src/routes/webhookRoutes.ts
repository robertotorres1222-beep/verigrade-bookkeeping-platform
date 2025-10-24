import { Router } from 'express';
import { 
  handleWebhook, 
  handleQuickBooksWebhook, 
  handleXeroWebhook, 
  handleShopifyWebhook, 
  handleSalesforceWebhook, 
  handleSlackWebhook 
} from '../controllers/webhookController';

const router = Router();

// Generic webhook handler
router.post('/:integrationId', handleWebhook);

// Specific webhook handlers for each integration
router.post('/quickbooks', handleQuickBooksWebhook);
router.post('/xero', handleXeroWebhook);
router.post('/shopify', handleShopifyWebhook);
router.post('/salesforce', handleSalesforceWebhook);
router.post('/slack', handleSlackWebhook);

export default router;