import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { asyncHandler, CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { stripeService } from '../services/stripeService';
import { sendEmail } from '../services/emailService';

const router = Router();

// Create or get Stripe customer
router.post('/customer',
  authenticate,
  [
    body('name').isString().trim().isLength({ min: 1, max: 100 }),
    body('email').isEmail(),
    body('phone').optional().isString().trim(),
    body('address').optional().isObject(),
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const { name, email, phone, address } = req.body;
    const userId = req.user!.id;
    const organizationId = req.user!.organizationId;

    try {
      // Check if customer already exists
      let customer;
      try {
        // In a real app, you'd store the Stripe customer ID in your database
        // For now, we'll create a new customer each time
        customer = await stripeService.createCustomer({
          email,
          name,
          phone,
          address,
          metadata: {
            userId,
            organizationId,
          },
        });
      } catch (error) {
        logger.error('Error creating Stripe customer:', error);
        throw new CustomError('Failed to create customer', 500);
      }

      res.json({
        success: true,
        data: {
          customerId: customer.id,
          email: customer.email,
          name: customer.name,
        }
      });

    } catch (error) {
      logger.error('Stripe customer creation error:', error);
      throw new CustomError('Failed to create customer', 500);
    }
  })
);

// Create subscription
router.post('/subscription',
  authenticate,
  [
    body('priceId').isString().trim().isLength({ min: 1 }),
    body('paymentMethodId').isString().trim().isLength({ min: 1 }),
    body('trialPeriodDays').optional().isInt({ min: 0, max: 365 }),
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const { priceId, paymentMethodId, trialPeriodDays } = req.body;
    const userId = req.user!.id;
    const organizationId = req.user!.organizationId;
    const userEmail = req.user!.email;

    try {
      // Create or get customer
      const customer = await stripeService.createCustomer({
        email: userEmail,
        name: req.user!.firstName + ' ' + req.user!.lastName,
        metadata: {
          userId,
          organizationId,
        },
      });

      // Create subscription
      const subscription = await stripeService.createSubscription({
        customerId: customer.id,
        priceId,
        paymentMethodId,
        trialPeriodDays,
        metadata: {
          userId,
          organizationId,
          plan: priceId, // You'd map this to actual plan names
        },
      });

      // Send confirmation email
      await sendEmail({
        to: userEmail,
        subject: 'Subscription Confirmed - VeriGrade',
        template: 'paymentConfirmation',
        data: {
          name: req.user!.firstName,
          plan: 'VeriGrade Subscription',
          billingPeriod: 'Monthly',
          amount: '99.00', // You'd get this from the price
          paymentIntentId: subscription.id,
          company: organizationId,
        },
      });

      res.json({
        success: true,
        data: {
          subscriptionId: subscription.id,
          customerId: customer.id,
          status: subscription.status,
          currentPeriodStart: subscription.current_period_start,
          currentPeriodEnd: subscription.current_period_end,
        }
      });

    } catch (error) {
      logger.error('Subscription creation error:', error);
      throw new CustomError('Failed to create subscription', 500);
    }
  })
);

// Create advisor session payment
router.post('/advisor-payment',
  authenticate,
  [
    body('advisorId').isString().trim().isLength({ min: 1 }),
    body('sessionType').isString().trim().isLength({ min: 1 }),
    body('duration').isInt({ min: 30, max: 240 }),
    body('amount').isFloat({ min: 0.01 }),
    body('paymentMethodId').isString().trim().isLength({ min: 1 }),
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const { advisorId, sessionType, duration, amount, paymentMethodId } = req.body;
    const userId = req.user!.id;
    const organizationId = req.user!.organizationId;
    const userEmail = req.user!.email;

    try {
      // Create or get customer
      const customer = await stripeService.createCustomer({
        email: userEmail,
        name: req.user!.firstName + ' ' + req.user!.lastName,
        metadata: {
          userId,
          organizationId,
        },
      });

      // Create payment intent
      const paymentIntent = await stripeService.createPaymentIntent({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        customerId: customer.id,
        paymentMethodId,
        description: `Advisor session: ${sessionType} (${duration} minutes)`,
        metadata: {
          userId,
          organizationId,
          advisorId,
          sessionType,
          duration: duration.toString(),
          service: 'advisor_session',
        },
      });

      res.json({
        success: true,
        data: {
          paymentIntentId: paymentIntent.id,
          clientSecret: paymentIntent.client_secret,
          amount: amount,
          status: paymentIntent.status,
        }
      });

    } catch (error) {
      logger.error('Advisor payment error:', error);
      throw new CustomError('Failed to process advisor payment', 500);
    }
  })
);

// Create tax filing payment
router.post('/tax-payment',
  authenticate,
  [
    body('filingType').isString().trim().isLength({ min: 1 }),
    body('taxYear').isInt({ min: 2020, max: new Date().getFullYear() }),
    body('amount').isFloat({ min: 0.01 }),
    body('paymentMethodId').isString().trim().isLength({ min: 1 }),
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const { filingType, taxYear, amount, paymentMethodId } = req.body;
    const userId = req.user!.id;
    const organizationId = req.user!.organizationId;
    const userEmail = req.user!.email;

    try {
      // Create or get customer
      const customer = await stripeService.createCustomer({
        email: userEmail,
        name: req.user!.firstName + ' ' + req.user!.lastName,
        metadata: {
          userId,
          organizationId,
        },
      });

      // Create payment intent
      const paymentIntent = await stripeService.createPaymentIntent({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        customerId: customer.id,
        paymentMethodId,
        description: `Tax filing: ${filingType} for ${taxYear}`,
        metadata: {
          userId,
          organizationId,
          filingType,
          taxYear: taxYear.toString(),
          service: 'tax_filing',
        },
      });

      res.json({
        success: true,
        data: {
          paymentIntentId: paymentIntent.id,
          clientSecret: paymentIntent.client_secret,
          amount: amount,
          status: paymentIntent.status,
        }
      });

    } catch (error) {
      logger.error('Tax payment error:', error);
      throw new CustomError('Failed to process tax payment', 500);
    }
  })
);

// Create banking setup payment
router.post('/banking-payment',
  authenticate,
  [
    body('setupFee').isFloat({ min: 0 }),
    body('paymentMethodId').isString().trim().isLength({ min: 1 }),
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const { setupFee, paymentMethodId } = req.body;
    const userId = req.user!.id;
    const organizationId = req.user!.organizationId;
    const userEmail = req.user!.email;

    try {
      // Create or get customer
      const customer = await stripeService.createCustomer({
        email: userEmail,
        name: req.user!.firstName + ' ' + req.user!.lastName,
        metadata: {
          userId,
          organizationId,
        },
      });

      // Create payment intent (only if there's a setup fee)
      let paymentIntent = null;
      if (setupFee > 0) {
        paymentIntent = await stripeService.createPaymentIntent({
          amount: Math.round(setupFee * 100), // Convert to cents
          currency: 'usd',
          customerId: customer.id,
          paymentMethodId,
          description: 'Business banking account setup fee',
          metadata: {
            userId,
            organizationId,
            service: 'banking_setup',
          },
        });
      }

      res.json({
        success: true,
        data: {
          customerId: customer.id,
          paymentIntentId: paymentIntent?.id || null,
          clientSecret: paymentIntent?.client_secret || null,
          amount: setupFee,
          status: paymentIntent?.status || 'succeeded',
        }
      });

    } catch (error) {
      logger.error('Banking payment error:', error);
      throw new CustomError('Failed to process banking payment', 500);
    }
  })
);

// Create setup intent for saving payment methods
router.post('/setup-intent',
  authenticate,
  [
    body('paymentMethodId').isString().trim().isLength({ min: 1 }),
    body('usage').optional().isIn(['off_session', 'on_session']),
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const { paymentMethodId, usage = 'off_session' } = req.body;
    const userId = req.user!.id;
    const organizationId = req.user!.organizationId;
    const userEmail = req.user!.email;

    try {
      // Create or get customer
      const customer = await stripeService.createCustomer({
        email: userEmail,
        name: req.user!.firstName + ' ' + req.user!.lastName,
        metadata: {
          userId,
          organizationId,
        },
      });

      // Create setup intent
      const setupIntent = await stripeService.createSetupIntent({
        customerId: customer.id,
        paymentMethodId,
        usage,
        metadata: {
          userId,
          organizationId,
        },
      });

      res.json({
        success: true,
        data: {
          setupIntentId: setupIntent.id,
          clientSecret: setupIntent.client_secret,
          status: setupIntent.status,
        }
      });

    } catch (error) {
      logger.error('Setup intent error:', error);
      throw new CustomError('Failed to create setup intent', 500);
    }
  })
);

// Get customer payment methods
router.get('/payment-methods',
  authenticate,
  asyncHandler(async (req: any, res: any) => {
    const userId = req.user!.id;
    const organizationId = req.user!.organizationId;
    const userEmail = req.user!.email;

    try {
      // Create or get customer
      const customer = await stripeService.createCustomer({
        email: userEmail,
        name: req.user!.firstName + ' ' + req.user!.lastName,
        metadata: {
          userId,
          organizationId,
        },
      });

      // Get payment methods
      const paymentMethods = await stripeService.getCustomerPaymentMethods(customer.id);

      res.json({
        success: true,
        data: paymentMethods.map(pm => ({
          id: pm.id,
          type: pm.type,
          card: pm.card ? {
            brand: pm.card.brand,
            last4: pm.card.last4,
            expMonth: pm.card.exp_month,
            expYear: pm.card.exp_year,
          } : null,
          created: pm.created,
        }))
      });

    } catch (error) {
      logger.error('Payment methods error:', error);
      throw new CustomError('Failed to retrieve payment methods', 500);
    }
  })
);

// Create checkout session for subscriptions
router.post('/checkout-session',
  authenticate,
  [
    body('priceId').isString().trim().isLength({ min: 1 }),
    body('successUrl').isURL(),
    body('cancelUrl').isURL(),
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const { priceId, successUrl, cancelUrl } = req.body;
    const userId = req.user!.id;
    const organizationId = req.user!.organizationId;
    const userEmail = req.user!.email;

    try {
      // Create or get customer
      const customer = await stripeService.createCustomer({
        email: userEmail,
        name: req.user!.firstName + ' ' + req.user!.lastName,
        metadata: {
          userId,
          organizationId,
        },
      });

      // Create checkout session
      const session = await stripeService.createCheckoutSession(
        customer.id,
        priceId,
        successUrl,
        cancelUrl,
        {
          userId,
          organizationId,
        }
      );

      res.json({
        success: true,
        data: {
          sessionId: session.id,
          url: session.url,
        }
      });

    } catch (error) {
      logger.error('Checkout session error:', error);
      throw new CustomError('Failed to create checkout session', 500);
    }
  })
);

// Handle Stripe webhooks
router.post('/webhook',
  asyncHandler(async (req: any, res: any) => {
    const signature = req.headers['stripe-signature'];
    const payload = req.body;

    try {
      const event = await stripeService.handleWebhook(payload, signature);

      // Handle different event types
      switch (event.type) {
        case 'payment_intent.succeeded':
          logger.info('Payment succeeded:', event.data.object.id);
          // Update your database, send confirmation emails, etc.
          break;

        case 'payment_intent.payment_failed':
          logger.info('Payment failed:', event.data.object.id);
          // Handle failed payments
          break;

        case 'customer.subscription.created':
          logger.info('Subscription created:', event.data.object.id);
          // Handle new subscription
          break;

        case 'customer.subscription.updated':
          logger.info('Subscription updated:', event.data.object.id);
          // Handle subscription changes
          break;

        case 'customer.subscription.deleted':
          logger.info('Subscription cancelled:', event.data.object.id);
          // Handle subscription cancellation
          break;

        default:
          logger.info(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });

    } catch (error) {
      logger.error('Webhook error:', error);
      res.status(400).json({ error: 'Webhook signature verification failed' });
    }
  })
);

export default router;
