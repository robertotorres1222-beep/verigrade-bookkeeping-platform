import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { asyncHandler, CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { sendEmail } from '../services/emailService';
import Stripe from 'stripe';

const stripe = new Stripe(process.env['STRIPE_SECRET_KEY'] || '', {
  apiVersion: '2023-10-16',
});

const router = Router();

// Create payment intent (Stripe integration would go here)
router.post('/create-intent',
  [
    body('plan').isString().isIn(['starter', 'growth', 'enterprise']),
    body('billingPeriod').isString().isIn(['monthly', 'annual']),
    body('name').isString().trim().isLength({ min: 1, max: 100 }),
    body('email').isEmail().normalizeEmail(),
    body('company').optional().isString().trim().isLength({ max: 100 }),
    body('amount').isNumeric(),
    body('currency').isString().equals('usd'),
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const { plan, billingPeriod, name, email, company, amount, currency } = req.body;

    try {
      // Log the payment attempt
      logger.info('Payment intent created:', {
        plan,
        billingPeriod,
        name,
        email,
        company: company || 'Not provided',
        amount,
        currency,
        timestamp: new Date().toISOString(),
      });

      // Create Stripe customer
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          company: company || 'Not provided',
          plan,
          billingPeriod,
        },
      });

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        customer: customer.id,
        metadata: {
          plan,
          billingPeriod,
          company: company || 'Not provided',
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      const paymentIntentId = paymentIntent.id;
      
      // Send confirmation email to customer
      try {
        await sendEmail({
          to: email,
          subject: 'Welcome to VeriGrade - Payment Confirmed',
          template: 'paymentConfirmation',
          data: {
            name,
            plan: plan.charAt(0).toUpperCase() + plan.slice(1),
            billingPeriod,
            amount,
            paymentIntentId,
            company: company || 'Not provided',
          },
        });
        logger.info(`Payment confirmation email sent to ${email}`);
      } catch (emailError) {
        logger.error('Failed to send payment confirmation email:', emailError);
        // Don't fail the request if email sending fails
      }

      // Send notification to admin
      try {
        await sendEmail({
          to: process.env['ADMIN_EMAIL'] || 'admin@verigrade.com',
          subject: `New Subscription - ${name}`,
          template: 'newSubscription',
          data: {
            name,
            email,
            plan: plan.charAt(0).toUpperCase() + plan.slice(1),
            billingPeriod,
            amount,
            company: company || 'Not provided',
            timestamp: new Date().toLocaleString(),
          },
        });
        logger.info(`New subscription notification sent to admin for ${email}`);
      } catch (emailError) {
        logger.error('Failed to send new subscription notification:', emailError);
        // Don't fail the request if email sending fails
      }

      res.status(200).json({
        success: true,
        message: 'Payment processed successfully! Welcome to VeriGrade.',
        paymentIntentId,
        amount,
        currency,
        plan,
        billingPeriod,
      });

    } catch (error) {
      logger.error('Payment processing error:', error);
      throw new CustomError('Failed to process payment', 500);
    }
  })
);

export default router;
