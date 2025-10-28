import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

export interface PaymentProcessor {
  id: string;
  name: string;
  type: 'stripe' | 'paypal' | 'square' | 'braintree';
  isActive: boolean;
  configuration: any;
}

export interface PaymentMethod {
  id: string;
  clientId: string;
  type: 'credit_card' | 'bank_account' | 'paypal' | 'stripe';
  processorId: string;
  processorToken: string;
  lastFour: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  isActive: boolean;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentIntent {
  id: string;
  clientId: string;
  invoiceId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled';
  paymentMethodId?: string;
  processorPaymentId?: string;
  failureReason?: string;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  processorResponse?: any;
}

class PaymentService {
  private prisma: PrismaClient;
  private processors: Map<string, PaymentProcessor> = new Map();

  constructor() {
    this.prisma = new PrismaClient();
    this.initializeProcessors();
    logger.info('[PaymentService] Initialized');
  }

  private initializeProcessors() {
    const defaultProcessors: PaymentProcessor[] = [
      {
        id: 'stripe',
        name: 'Stripe',
        type: 'stripe',
        isActive: true,
        configuration: {
          publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
          secretKey: process.env.STRIPE_SECRET_KEY,
          webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
        }
      },
      {
        id: 'paypal',
        name: 'PayPal',
        type: 'paypal',
        isActive: true,
        configuration: {
          clientId: process.env.PAYPAL_CLIENT_ID,
          clientSecret: process.env.PAYPAL_CLIENT_SECRET,
          environment: process.env.PAYPAL_ENVIRONMENT || 'sandbox'
        }
      }
    ];

    defaultProcessors.forEach(processor => {
      this.processors.set(processor.id, processor);
    });
  }

  /**
   * Creates a payment method for a client
   */
  public async createPaymentMethod(
    clientId: string,
    type: PaymentMethod['type'],
    processorId: string,
    processorToken: string,
    lastFour: string,
    brand?: string,
    expiryMonth?: number,
    expiryYear?: number,
    metadata: any = {}
  ): Promise<PaymentMethod> {
    try {
      const paymentMethod = await this.prisma.paymentMethod.create({
        data: {
          clientId,
          type,
          processorId,
          processorToken,
          lastFour,
          brand,
          expiryMonth,
          expiryYear,
          isDefault: false,
          isActive: true,
          metadata
        }
      });

      logger.info(`[PaymentService] Created payment method ${paymentMethod.id} for client ${clientId}`);
      return paymentMethod as PaymentMethod;
    } catch (error: any) {
      logger.error('[PaymentService] Error creating payment method:', error);
      throw new Error(`Failed to create payment method: ${error.message}`);
    }
  }

  /**
   * Gets payment methods for a client
   */
  public async getClientPaymentMethods(clientId: string): Promise<PaymentMethod[]> {
    try {
      const paymentMethods = await this.prisma.paymentMethod.findMany({
        where: { clientId, isActive: true },
        orderBy: { createdAt: 'desc' }
      });

      return paymentMethods as PaymentMethod[];
    } catch (error: any) {
      logger.error(`[PaymentService] Error getting payment methods for client ${clientId}:`, error);
      throw new Error(`Failed to get payment methods: ${error.message}`);
    }
  }

  /**
   * Sets default payment method
   */
  public async setDefaultPaymentMethod(
    paymentMethodId: string,
    clientId: string
  ): Promise<boolean> {
    try {
      // Remove default from all other payment methods
      await this.prisma.paymentMethod.updateMany({
        where: { clientId, isDefault: true },
        data: { isDefault: false }
      });

      // Set new default
      await this.prisma.paymentMethod.updateMany({
        where: { id: paymentMethodId, clientId },
        data: { isDefault: true }
      });

      logger.info(`[PaymentService] Set default payment method ${paymentMethodId} for client ${clientId}`);
      return true;
    } catch (error: any) {
      logger.error('[PaymentService] Error setting default payment method:', error);
      return false;
    }
  }

  /**
   * Deletes payment method
   */
  public async deletePaymentMethod(paymentMethodId: string, clientId: string): Promise<boolean> {
    try {
      await this.prisma.paymentMethod.updateMany({
        where: { id: paymentMethodId, clientId },
        data: { isActive: false }
      });

      logger.info(`[PaymentService] Deleted payment method ${paymentMethodId} for client ${clientId}`);
      return true;
    } catch (error: any) {
      logger.error('[PaymentService] Error deleting payment method:', error);
      return false;
    }
  }

  /**
   * Creates payment intent
   */
  public async createPaymentIntent(
    clientId: string,
    invoiceId: string,
    amount: number,
    currency: string = 'USD',
    paymentMethodId?: string,
    metadata: any = {}
  ): Promise<PaymentIntent> {
    try {
      const paymentIntent = await this.prisma.paymentIntent.create({
        data: {
          clientId,
          invoiceId,
          amount,
          currency,
          status: 'pending',
          paymentMethodId,
          metadata
        }
      });

      logger.info(`[PaymentService] Created payment intent ${paymentIntent.id} for invoice ${invoiceId}`);
      return paymentIntent as PaymentIntent;
    } catch (error: any) {
      logger.error('[PaymentService] Error creating payment intent:', error);
      throw new Error(`Failed to create payment intent: ${error.message}`);
    }
  }

  /**
   * Processes payment
   */
  public async processPayment(
    paymentIntentId: string,
    paymentMethodId: string
  ): Promise<PaymentResult> {
    try {
      const paymentIntent = await this.prisma.paymentIntent.findUnique({
        where: { id: paymentIntentId }
      });

      if (!paymentIntent) {
        return { success: false, error: 'Payment intent not found' };
      }

      if (paymentIntent.status !== 'pending') {
        return { success: false, error: 'Payment intent is not in pending status' };
      }

      const paymentMethod = await this.prisma.paymentMethod.findUnique({
        where: { id: paymentMethodId }
      });

      if (!paymentMethod) {
        return { success: false, error: 'Payment method not found' };
      }

      // Update status to processing
      await this.prisma.paymentIntent.update({
        where: { id: paymentIntentId },
        data: { status: 'processing' }
      });

      // Process payment based on processor
      const processor = this.processors.get(paymentMethod.processorId);
      if (!processor) {
        return { success: false, error: 'Payment processor not found' };
      }

      const paymentResult = await this.processPaymentWithProcessor(
        processor,
        paymentMethod,
        paymentIntent
      );

      // Update payment intent with result
      await this.prisma.paymentIntent.update({
        where: { id: paymentIntentId },
        data: {
          status: paymentResult.success ? 'succeeded' : 'failed',
          processorPaymentId: paymentResult.transactionId,
          failureReason: paymentResult.error,
          processorResponse: paymentResult.processorResponse
        }
      });

      logger.info(`[PaymentService] Processed payment ${paymentIntentId}: ${paymentResult.success ? 'success' : 'failed'}`);
      return paymentResult;
    } catch (error: any) {
      logger.error('[PaymentService] Error processing payment:', error);
      return { success: false, error: 'Payment processing failed' };
    }
  }

  /**
   * Processes payment with specific processor
   */
  private async processPaymentWithProcessor(
    processor: PaymentProcessor,
    paymentMethod: PaymentMethod,
    paymentIntent: PaymentIntent
  ): Promise<PaymentResult> {
    try {
      switch (processor.type) {
        case 'stripe':
          return await this.processStripePayment(processor, paymentMethod, paymentIntent);
        case 'paypal':
          return await this.processPayPalPayment(processor, paymentMethod, paymentIntent);
        default:
          return { success: false, error: 'Unsupported payment processor' };
      }
    } catch (error: any) {
      logger.error(`[PaymentService] Error processing payment with ${processor.type}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Processes Stripe payment
   */
  private async processStripePayment(
    processor: PaymentProcessor,
    paymentMethod: PaymentMethod,
    paymentIntent: PaymentIntent
  ): Promise<PaymentResult> {
    try {
      // This would integrate with actual Stripe API
      // For now, returning mock success
      const transactionId = `pi_${Date.now()}`;
      
      logger.info(`[PaymentService] Processed Stripe payment: ${transactionId}`);
      return {
        success: true,
        transactionId,
        processorResponse: {
          id: transactionId,
          status: 'succeeded',
          amount: paymentIntent.amount,
          currency: paymentIntent.currency
        }
      };
    } catch (error: any) {
      logger.error('[PaymentService] Error processing Stripe payment:', error);
      return { success: false, error: 'Stripe payment failed' };
    }
  }

  /**
   * Processes PayPal payment
   */
  private async processPayPalPayment(
    processor: PaymentProcessor,
    paymentMethod: PaymentMethod,
    paymentIntent: PaymentIntent
  ): Promise<PaymentResult> {
    try {
      // This would integrate with actual PayPal API
      // For now, returning mock success
      const transactionId = `PAY-${Date.now()}`;
      
      logger.info(`[PaymentService] Processed PayPal payment: ${transactionId}`);
      return {
        success: true,
        transactionId,
        processorResponse: {
          id: transactionId,
          state: 'approved',
          amount: paymentIntent.amount,
          currency: paymentIntent.currency
        }
      };
    } catch (error: any) {
      logger.error('[PaymentService] Error processing PayPal payment:', error);
      return { success: false, error: 'PayPal payment failed' };
    }
  }

  /**
   * Gets payment intent by ID
   */
  public async getPaymentIntent(paymentIntentId: string): Promise<PaymentIntent | null> {
    try {
      const paymentIntent = await this.prisma.paymentIntent.findUnique({
        where: { id: paymentIntentId }
      });

      return paymentIntent as PaymentIntent | null;
    } catch (error: any) {
      logger.error(`[PaymentService] Error getting payment intent ${paymentIntentId}:`, error);
      throw new Error(`Failed to get payment intent: ${error.message}`);
    }
  }

  /**
   * Gets payment intents for client
   */
  public async getClientPaymentIntents(
    clientId: string,
    status?: PaymentIntent['status'],
    limit: number = 50,
    offset: number = 0
  ): Promise<PaymentIntent[]> {
    try {
      const where: any = { clientId };
      if (status) {
        where.status = status;
      }

      const paymentIntents = await this.prisma.paymentIntent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      });

      return paymentIntents as PaymentIntent[];
    } catch (error: any) {
      logger.error(`[PaymentService] Error getting payment intents for client ${clientId}:`, error);
      throw new Error(`Failed to get payment intents: ${error.message}`);
    }
  }

  /**
   * Refunds payment
   */
  public async refundPayment(
    paymentIntentId: string,
    amount?: number,
    reason?: string
  ): Promise<{ success: boolean; refundId?: string; error?: string }> {
    try {
      const paymentIntent = await this.getPaymentIntent(paymentIntentId);
      if (!paymentIntent) {
        return { success: false, error: 'Payment intent not found' };
      }

      if (paymentIntent.status !== 'succeeded') {
        return { success: false, error: 'Payment must be successful to refund' };
      }

      const refundAmount = amount || paymentIntent.amount;
      const refundId = `re_${Date.now()}`;

      // This would integrate with actual payment processor for refund
      logger.info(`[PaymentService] Refunded payment ${paymentIntentId}: ${refundId}`);
      return {
        success: true,
        refundId
      };
    } catch (error: any) {
      logger.error('[PaymentService] Error refunding payment:', error);
      return { success: false, error: 'Refund failed' };
    }
  }

  /**
   * Handles webhook from payment processor
   */
  public async handleWebhook(
    processorId: string,
    eventType: string,
    payload: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const processor = this.processors.get(processorId);
      if (!processor) {
        return { success: false, error: 'Unknown processor' };
      }

      switch (processor.type) {
        case 'stripe':
          return await this.handleStripeWebhook(eventType, payload);
        case 'paypal':
          return await this.handlePayPalWebhook(eventType, payload);
        default:
          return { success: false, error: 'Unsupported processor' };
      }
    } catch (error: any) {
      logger.error(`[PaymentService] Error handling webhook from ${processorId}:`, error);
      return { success: false, error: 'Webhook processing failed' };
    }
  }

  /**
   * Handles Stripe webhook
   */
  private async handleStripeWebhook(eventType: string, payload: any): Promise<{ success: boolean; error?: string }> {
    try {
      switch (eventType) {
        case 'payment_intent.succeeded':
          // Update payment intent status
          await this.updatePaymentIntentStatus(payload.id, 'succeeded');
          break;
        case 'payment_intent.payment_failed':
          // Update payment intent status
          await this.updatePaymentIntentStatus(payload.id, 'failed');
          break;
        default:
          logger.info(`[PaymentService] Unhandled Stripe event: ${eventType}`);
      }

      return { success: true };
    } catch (error: any) {
      logger.error('[PaymentService] Error handling Stripe webhook:', error);
      return { success: false, error: 'Stripe webhook processing failed' };
    }
  }

  /**
   * Handles PayPal webhook
   */
  private async handlePayPalWebhook(eventType: string, payload: any): Promise<{ success: boolean; error?: string }> {
    try {
      switch (eventType) {
        case 'PAYMENT.SALE.COMPLETED':
          // Update payment intent status
          await this.updatePaymentIntentStatus(payload.id, 'succeeded');
          break;
        case 'PAYMENT.SALE.DENIED':
          // Update payment intent status
          await this.updatePaymentIntentStatus(payload.id, 'failed');
          break;
        default:
          logger.info(`[PaymentService] Unhandled PayPal event: ${eventType}`);
      }

      return { success: true };
    } catch (error: any) {
      logger.error('[PaymentService] Error handling PayPal webhook:', error);
      return { success: false, error: 'PayPal webhook processing failed' };
    }
  }

  /**
   * Updates payment intent status
   */
  private async updatePaymentIntentStatus(
    processorPaymentId: string,
    status: PaymentIntent['status']
  ): Promise<void> {
    try {
      await this.prisma.paymentIntent.updateMany({
        where: { processorPaymentId },
        data: { status }
      });

      logger.info(`[PaymentService] Updated payment intent status to ${status} for ${processorPaymentId}`);
    } catch (error: any) {
      logger.error('[PaymentService] Error updating payment intent status:', error);
    }
  }
}

export default new PaymentService();










