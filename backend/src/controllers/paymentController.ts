import { Request, Response } from 'express';
import PaymentService from '../services/paymentService';
import logger from '../utils/logger';

export const createPaymentMethod = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientId } = req.params;
    const { type, processorId, processorToken, lastFour, brand, expiryMonth, expiryYear, metadata } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    if (!type || !processorId || !processorToken || !lastFour) {
      res.status(400).json({ success: false, message: 'Required fields are missing' });
      return;
    }

    const paymentMethod = await PaymentService.createPaymentMethod(
      clientId,
      type,
      processorId,
      processorToken,
      lastFour,
      brand,
      expiryMonth,
      expiryYear,
      metadata || {}
    );

    res.status(201).json({
      success: true,
      message: 'Payment method created successfully',
      paymentMethod: {
        id: paymentMethod.id,
        type: paymentMethod.type,
        lastFour: paymentMethod.lastFour,
        brand: paymentMethod.brand,
        expiryMonth: paymentMethod.expiryMonth,
        expiryYear: paymentMethod.expiryYear,
        isDefault: paymentMethod.isDefault,
        isActive: paymentMethod.isActive,
        createdAt: paymentMethod.createdAt
      }
    });
  } catch (error: any) {
    logger.error(`Error creating payment method for client ${req.params.clientId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment method',
      error: error.message
    });
  }
};

export const getClientPaymentMethods = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const paymentMethods = await PaymentService.getClientPaymentMethods(clientId);

    res.status(200).json({
      success: true,
      paymentMethods: paymentMethods.map(pm => ({
        id: pm.id,
        type: pm.type,
        lastFour: pm.lastFour,
        brand: pm.brand,
        expiryMonth: pm.expiryMonth,
        expiryYear: pm.expiryYear,
        isDefault: pm.isDefault,
        isActive: pm.isActive,
        createdAt: pm.createdAt
      }))
    });
  } catch (error: any) {
    logger.error(`Error getting payment methods for client ${req.params.clientId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment methods',
      error: error.message
    });
  }
};

export const setDefaultPaymentMethod = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientId, paymentMethodId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const success = await PaymentService.setDefaultPaymentMethod(paymentMethodId, clientId);

    if (success) {
      res.status(200).json({
        success: true,
        message: 'Default payment method updated successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to update default payment method'
      });
    }
  } catch (error: any) {
    logger.error(`Error setting default payment method for client ${req.params.clientId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to set default payment method',
      error: error.message
    });
  }
};

export const deletePaymentMethod = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientId, paymentMethodId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const success = await PaymentService.deletePaymentMethod(paymentMethodId, clientId);

    if (success) {
      res.status(200).json({
        success: true,
        message: 'Payment method deleted successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to delete payment method'
      });
    }
  } catch (error: any) {
    logger.error(`Error deleting payment method for client ${req.params.clientId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete payment method',
      error: error.message
    });
  }
};

export const createPaymentIntent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientId } = req.params;
    const { invoiceId, amount, currency = 'USD', paymentMethodId, metadata } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    if (!invoiceId || !amount) {
      res.status(400).json({ success: false, message: 'Invoice ID and amount are required' });
      return;
    }

    const paymentIntent = await PaymentService.createPaymentIntent(
      clientId,
      invoiceId,
      amount,
      currency,
      paymentMethodId,
      metadata || {}
    );

    res.status(201).json({
      success: true,
      message: 'Payment intent created successfully',
      paymentIntent: {
        id: paymentIntent.id,
        invoiceId: paymentIntent.invoiceId,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        paymentMethodId: paymentIntent.paymentMethodId,
        createdAt: paymentIntent.createdAt
      }
    });
  } catch (error: any) {
    logger.error(`Error creating payment intent for client ${req.params.clientId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: error.message
    });
  }
};

export const processPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentIntentId } = req.params;
    const { paymentMethodId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    if (!paymentMethodId) {
      res.status(400).json({ success: false, message: 'Payment method ID is required' });
      return;
    }

    const result = await PaymentService.processPayment(paymentIntentId, paymentMethodId);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Payment processed successfully',
        transactionId: result.transactionId
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment processing failed',
        error: result.error
      });
    }
  } catch (error: any) {
    logger.error(`Error processing payment for intent ${req.params.paymentIntentId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment',
      error: error.message
    });
  }
};

export const getPaymentIntent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentIntentId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const paymentIntent = await PaymentService.getPaymentIntent(paymentIntentId);

    if (!paymentIntent) {
      res.status(404).json({ success: false, message: 'Payment intent not found' });
      return;
    }

    res.status(200).json({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        clientId: paymentIntent.clientId,
        invoiceId: paymentIntent.invoiceId,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        paymentMethodId: paymentIntent.paymentMethodId,
        processorPaymentId: paymentIntent.processorPaymentId,
        failureReason: paymentIntent.failureReason,
        createdAt: paymentIntent.createdAt,
        updatedAt: paymentIntent.updatedAt
      }
    });
  } catch (error: any) {
    logger.error(`Error getting payment intent ${req.params.paymentIntentId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment intent',
      error: error.message
    });
  }
};

export const getClientPaymentIntents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientId } = req.params;
    const { status, limit = 50, offset = 0 } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const paymentIntents = await PaymentService.getClientPaymentIntents(
      clientId,
      status as string,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    res.status(200).json({
      success: true,
      paymentIntents: paymentIntents.map(pi => ({
        id: pi.id,
        invoiceId: pi.invoiceId,
        amount: pi.amount,
        currency: pi.currency,
        status: pi.status,
        paymentMethodId: pi.paymentMethodId,
        processorPaymentId: pi.processorPaymentId,
        failureReason: pi.failureReason,
        createdAt: pi.createdAt,
        updatedAt: pi.updatedAt
      }))
    });
  } catch (error: any) {
    logger.error(`Error getting payment intents for client ${req.params.clientId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment intents',
      error: error.message
    });
  }
};

export const refundPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentIntentId } = req.params;
    const { amount, reason } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const result = await PaymentService.refundPayment(paymentIntentId, amount, reason);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Payment refunded successfully',
        refundId: result.refundId
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Refund failed',
        error: result.error
      });
    }
  } catch (error: any) {
    logger.error(`Error refunding payment for intent ${req.params.paymentIntentId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to refund payment',
      error: error.message
    });
  }
};

export const handlePaymentWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { processorId } = req.params;
    const { eventType, payload } = req.body;

    if (!eventType || !payload) {
      res.status(400).json({ success: false, message: 'Event type and payload are required' });
      return;
    }

    const result = await PaymentService.handleWebhook(processorId, eventType, payload);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Webhook processed successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Webhook processing failed',
        error: result.error
      });
    }
  } catch (error: any) {
    logger.error(`Error handling payment webhook from ${req.params.processorId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to process webhook',
      error: error.message
    });
  }
};







