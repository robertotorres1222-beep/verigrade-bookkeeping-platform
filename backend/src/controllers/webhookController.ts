import { Request, Response } from 'express';
import IntegrationService from '../services/integrationService';
import logger from '../utils/logger';

export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { integrationId } = req.params;
    const signature = req.headers['x-hub-signature-256'] || req.headers['x-signature'] || req.headers['x-slack-signature'];
    const eventType = req.headers['x-event-type'] || req.headers['x-github-event'] || req.body?.event?.type || 'unknown';
    
    logger.info(`[WebhookController] Received webhook for ${integrationId}: ${eventType}`);

    await IntegrationService.processWebhookEvent(
      integrationId,
      eventType as string,
      req.body,
      signature as string
    );

    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully'
    });
  } catch (error: any) {
    logger.error(`[WebhookController] Error processing webhook for ${req.params.integrationId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to process webhook',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const handleQuickBooksWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const signature = req.headers['x-intuit-signature'];
    const eventType = req.body?.eventNotifications?.[0]?.eventName || 'unknown';
    
    logger.info(`[WebhookController] Received QuickBooks webhook: ${eventType}`);

    await IntegrationService.processWebhookEvent(
      'quickbooks',
      eventType,
      req.body,
      signature as string
    );

    res.status(200).json({
      success: true,
      message: 'QuickBooks webhook processed successfully'
    });
  } catch (error: any) {
    logger.error('[WebhookController] Error processing QuickBooks webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process QuickBooks webhook',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const handleXeroWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const signature = req.headers['x-xero-signature'];
    const eventType = req.body?.events?.[0]?.eventType || 'unknown';
    
    logger.info(`[WebhookController] Received Xero webhook: ${eventType}`);

    await IntegrationService.processWebhookEvent(
      'xero',
      eventType,
      req.body,
      signature as string
    );

    res.status(200).json({
      success: true,
      message: 'Xero webhook processed successfully'
    });
  } catch (error: any) {
    logger.error('[WebhookController] Error processing Xero webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process Xero webhook',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const handleShopifyWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const signature = req.headers['x-shopify-hmac-sha256'];
    const eventType = req.headers['x-shopify-topic'] as string;
    
    logger.info(`[WebhookController] Received Shopify webhook: ${eventType}`);

    await IntegrationService.processWebhookEvent(
      'shopify',
      eventType,
      req.body,
      signature as string
    );

    res.status(200).json({
      success: true,
      message: 'Shopify webhook processed successfully'
    });
  } catch (error: any) {
    logger.error('[WebhookController] Error processing Shopify webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process Shopify webhook',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const handleSalesforceWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const signature = req.headers['x-salesforce-signature'];
    const eventType = req.body?.sobject?.type || 'unknown';
    
    logger.info(`[WebhookController] Received Salesforce webhook: ${eventType}`);

    await IntegrationService.processWebhookEvent(
      'salesforce',
      eventType,
      req.body,
      signature as string
    );

    res.status(200).json({
      success: true,
      message: 'Salesforce webhook processed successfully'
    });
  } catch (error: any) {
    logger.error('[WebhookController] Error processing Salesforce webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process Salesforce webhook',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const handleSlackWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const signature = req.headers['x-slack-signature'];
    const eventType = req.body?.type || 'unknown';
    
    logger.info(`[WebhookController] Received Slack webhook: ${eventType}`);

    await IntegrationService.processWebhookEvent(
      'slack',
      eventType,
      req.body,
      signature as string
    );

    res.status(200).json({
      success: true,
      message: 'Slack webhook processed successfully'
    });
  } catch (error: any) {
    logger.error('[WebhookController] Error processing Slack webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process Slack webhook',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};