import { Request, Response } from 'express';
import SlackService from '../integrations/slack/SlackService';
import IntegrationFramework from '../integrations/framework/IntegrationFramework';
import logger from '../utils/logger';

export const getChannels = async (req: Request, res: Response): Promise<void> => {
  try {
    const { connectionId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const connection = IntegrationFramework.getConnection(connectionId);
    if (!connection || connection.userId !== userId) {
      res.status(403).json({ success: false, message: 'Access denied to this connection' });
      return;
    }

    const channels = await SlackService.getChannels(connectionId);

    res.status(200).json({
      success: true,
      channels
    });
  } catch (error) {
    logger.error(`Error getting Slack channels for connection ${req.params.connectionId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to get channels',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { connectionId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const connection = IntegrationFramework.getConnection(connectionId);
    if (!connection || connection.userId !== userId) {
      res.status(403).json({ success: false, message: 'Access denied to this connection' });
      return;
    }

    const users = await SlackService.getUsers(connectionId);

    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    logger.error(`Error getting Slack users for connection ${req.params.connectionId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getChannelMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { connectionId, channelId } = req.params;
    const { limit = 100 } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const connection = IntegrationFramework.getConnection(connectionId);
    if (!connection || connection.userId !== userId) {
      res.status(403).json({ success: false, message: 'Access denied to this connection' });
      return;
    }

    const messages = await SlackService.getChannelMessages(
      connectionId, 
      channelId, 
      parseInt(limit as string)
    );

    res.status(200).json({
      success: true,
      messages
    });
  } catch (error) {
    logger.error(`Error getting Slack messages for connection ${req.params.connectionId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to get messages',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { connectionId } = req.params;
    const { channelId, text, attachments, threadTs } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const connection = IntegrationFramework.getConnection(connectionId);
    if (!connection || connection.userId !== userId) {
      res.status(403).json({ success: false, message: 'Access denied to this connection' });
      return;
    }

    if (!channelId || !text) {
      res.status(400).json({ success: false, message: 'Channel ID and text are required' });
      return;
    }

    const message = await SlackService.sendMessage(connectionId, {
      channelId,
      text,
      attachments,
      threadTs
    });

    res.status(200).json({
      success: true,
      message: 'Message sent successfully',
      sentMessage: message
    });
  } catch (error) {
    logger.error(`Error sending Slack message for connection ${req.params.connectionId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const notifyInvoiceCreated = async (req: Request, res: Response): Promise<void> => {
  try {
    const { connectionId } = req.params;
    const { channelId, invoiceData } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const connection = IntegrationFramework.getConnection(connectionId);
    if (!connection || connection.userId !== userId) {
      res.status(403).json({ success: false, message: 'Access denied to this connection' });
      return;
    }

    if (!channelId || !invoiceData) {
      res.status(400).json({ success: false, message: 'Channel ID and invoice data are required' });
      return;
    }

    const message = await SlackService.notifyInvoiceCreated(connectionId, channelId, invoiceData);

    res.status(200).json({
      success: true,
      message: 'Invoice notification sent successfully',
      sentMessage: message
    });
  } catch (error) {
    logger.error(`Error sending invoice notification for connection ${req.params.connectionId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to send invoice notification',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const notifyPaymentReceived = async (req: Request, res: Response): Promise<void> => {
  try {
    const { connectionId } = req.params;
    const { channelId, paymentData } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const connection = IntegrationFramework.getConnection(connectionId);
    if (!connection || connection.userId !== userId) {
      res.status(403).json({ success: false, message: 'Access denied to this connection' });
      return;
    }

    if (!channelId || !paymentData) {
      res.status(400).json({ success: false, message: 'Channel ID and payment data are required' });
      return;
    }

    const message = await SlackService.notifyPaymentReceived(connectionId, channelId, paymentData);

    res.status(200).json({
      success: true,
      message: 'Payment notification sent successfully',
      sentMessage: message
    });
  } catch (error) {
    logger.error(`Error sending payment notification for connection ${req.params.connectionId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to send payment notification',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const notifyLowStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { connectionId } = req.params;
    const { channelId, stockData } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const connection = IntegrationFramework.getConnection(connectionId);
    if (!connection || connection.userId !== userId) {
      res.status(403).json({ success: false, message: 'Access denied to this connection' });
      return;
    }

    if (!channelId || !stockData) {
      res.status(400).json({ success: false, message: 'Channel ID and stock data are required' });
      return;
    }

    const message = await SlackService.notifyLowStock(connectionId, channelId, stockData);

    res.status(200).json({
      success: true,
      message: 'Low stock notification sent successfully',
      sentMessage: message
    });
  } catch (error) {
    logger.error(`Error sending low stock notification for connection ${req.params.connectionId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to send low stock notification',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const notifyOverdueInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { connectionId } = req.params;
    const { channelId, overdueData } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const connection = IntegrationFramework.getConnection(connectionId);
    if (!connection || connection.userId !== userId) {
      res.status(403).json({ success: false, message: 'Access denied to this connection' });
      return;
    }

    if (!channelId || !overdueData) {
      res.status(400).json({ success: false, message: 'Channel ID and overdue data are required' });
      return;
    }

    const message = await SlackService.notifyOverdueInvoices(connectionId, channelId, overdueData);

    res.status(200).json({
      success: true,
      message: 'Overdue invoices notification sent successfully',
      sentMessage: message
    });
  } catch (error) {
    logger.error(`Error sending overdue invoices notification for connection ${req.params.connectionId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to send overdue invoices notification',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const setupWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { connectionId } = req.params;
    const { webhookUrl } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const connection = IntegrationFramework.getConnection(connectionId);
    if (!connection || connection.userId !== userId) {
      res.status(403).json({ success: false, message: 'Access denied to this connection' });
      return;
    }

    if (!webhookUrl) {
      res.status(400).json({ success: false, message: 'Webhook URL is required' });
      return;
    }

    const success = await SlackService.setupWebhook(connectionId, webhookUrl);

    if (success) {
      res.status(200).json({
        success: true,
        message: 'Webhook setup successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to setup webhook'
      });
    }
  } catch (error) {
    logger.error(`Error setting up Slack webhook for connection ${req.params.connectionId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to setup webhook',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};






