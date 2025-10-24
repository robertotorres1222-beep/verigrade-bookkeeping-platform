import { Router } from 'express';
import { integrationController } from '../controllers/integrationController';

const router = Router();

// QuickBooks Integration
router.post('/quickbooks/sync', integrationController.syncQuickBooks);
router.get('/quickbooks/status', integrationController.getQuickBooksStatus);

// Xero Integration
router.post('/xero/sync', integrationController.syncXero);
router.get('/xero/status', integrationController.getXeroStatus);

// Shopify Integration
router.post('/shopify/sync', integrationController.syncShopify);
router.get('/shopify/status', integrationController.getShopifyStatus);

// Salesforce Integration
router.post('/salesforce/sync', integrationController.syncSalesforce);
router.get('/salesforce/status', integrationController.getSalesforceStatus);

// HubSpot Integration
router.post('/hubspot/sync', integrationController.syncHubSpot);
router.get('/hubspot/status', integrationController.getHubSpotStatus);

// Mailchimp Integration
router.post('/mailchimp/sync', integrationController.syncMailchimp);
router.get('/mailchimp/status', integrationController.getMailchimpStatus);

// Slack Integration
router.post('/slack/sync', integrationController.syncSlack);
router.get('/slack/status', integrationController.getSlackStatus);

export default router;