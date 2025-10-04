import Stripe from 'stripe';
import { logger } from '../utils/logger';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env['STRIPE_SECRET_KEY'] || '', {
  apiVersion: '2023-10-16',
});

export interface CreateCustomerData {
  email: string;
  name: string;
  phone?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  metadata?: Record<string, string>;
}

export interface CreateSubscriptionData {
  customerId: string;
  priceId: string;
  paymentMethodId: string;
  trialPeriodDays?: number;
  metadata?: Record<string, string>;
}

export interface CreatePaymentIntentData {
  amount: number;
  currency: string;
  customerId?: string;
  paymentMethodId?: string;
  description: string;
  metadata?: Record<string, string>;
  automaticPaymentMethods?: {
    enabled: boolean;
  };
}

export interface CreateSetupIntentData {
  customerId: string;
  paymentMethodId: string;
  usage: 'off_session' | 'on_session';
  metadata?: Record<string, string>;
}

class StripeService {
  // Create a new customer
  async createCustomer(data: CreateCustomerData): Promise<Stripe.Customer> {
    try {
      const customerData: any = {
        email: data.email,
        name: data.name,
        metadata: data.metadata || {},
      };
      
      if (data.phone) {
        customerData.phone = data.phone;
      }
      
      if (data.address) {
        customerData.address = data.address;
      }
      
      const customer = await stripe.customers.create(customerData);

      logger.info(`Stripe customer created: ${customer.id}`);
      return customer;
    } catch (error) {
      logger.error('Error creating Stripe customer:', error);
      throw new Error('Failed to create customer');
    }
  }

  // Retrieve customer by ID
  async getCustomer(customerId: string): Promise<Stripe.Customer> {
    try {
      const customer = await stripe.customers.retrieve(customerId);
      return customer as Stripe.Customer;
    } catch (error) {
      logger.error('Error retrieving Stripe customer:', error);
      throw new Error('Failed to retrieve customer');
    }
  }

  // Update customer
  async updateCustomer(customerId: string, data: Partial<CreateCustomerData>): Promise<Stripe.Customer> {
    try {
      const updateData: any = {};
      
      if (data.email) updateData.email = data.email;
      if (data.name) updateData.name = data.name;
      if (data.phone) updateData.phone = data.phone;
      if (data.address) updateData.address = data.address;
      if (data.metadata) updateData.metadata = data.metadata;
      
      const customer = await stripe.customers.update(customerId, updateData);

      logger.info(`Stripe customer updated: ${customer.id}`);
      return customer;
    } catch (error) {
      logger.error('Error updating Stripe customer:', error);
      throw new Error('Failed to update customer');
    }
  }

  // Create subscription
  async createSubscription(data: CreateSubscriptionData): Promise<Stripe.Subscription> {
    try {
      const subscriptionData: any = {
        customer: data.customerId,
        items: [{ price: data.priceId }],
        default_payment_method: data.paymentMethodId,
        metadata: data.metadata || {},
        expand: ['latest_invoice.payment_intent'],
      };
      
      if (data.trialPeriodDays) {
        subscriptionData.trial_period_days = data.trialPeriodDays;
      }
      
      const subscription = await stripe.subscriptions.create(subscriptionData);

      logger.info(`Stripe subscription created: ${subscription.id}`);
      return subscription;
    } catch (error) {
      logger.error('Error creating Stripe subscription:', error);
      throw new Error('Failed to create subscription');
    }
  }

  // Retrieve subscription
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error) {
      logger.error('Error retrieving Stripe subscription:', error);
      throw new Error('Failed to retrieve subscription');
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string, immediately = false): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: !immediately,
      });

      if (immediately) {
        await stripe.subscriptions.cancel(subscriptionId);
      }

      logger.info(`Stripe subscription cancelled: ${subscriptionId}`);
      return subscription;
    } catch (error) {
      logger.error('Error cancelling Stripe subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  // Create payment intent
  async createPaymentIntent(data: CreatePaymentIntentData): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntentData: any = {
        amount: data.amount,
        currency: data.currency,
        description: data.description,
        metadata: data.metadata || {},
        automatic_payment_methods: data.automaticPaymentMethods || { enabled: true },
        confirmation_method: 'manual',
        confirm: true,
      };
      
      if (data.customerId) {
        paymentIntentData.customer = data.customerId;
      }
      
      if (data.paymentMethodId) {
        paymentIntentData.payment_method = data.paymentMethodId;
      }
      
      const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);

      logger.info(`Stripe payment intent created: ${paymentIntent.id}`);
      return paymentIntent;
    } catch (error) {
      logger.error('Error creating Stripe payment intent:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  // Retrieve payment intent
  async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      logger.error('Error retrieving Stripe payment intent:', error);
      throw new Error('Failed to retrieve payment intent');
    }
  }

  // Create setup intent for saving payment methods
  async createSetupIntent(data: CreateSetupIntentData): Promise<Stripe.SetupIntent> {
    try {
      const setupIntent = await stripe.setupIntents.create({
        customer: data.customerId,
        payment_method: data.paymentMethodId,
        usage: data.usage,
        metadata: data.metadata || {},
      });

      logger.info(`Stripe setup intent created: ${setupIntent.id}`);
      return setupIntent;
    } catch (error) {
      logger.error('Error creating Stripe setup intent:', error);
      throw new Error('Failed to create setup intent');
    }
  }

  // List customer's payment methods
  async getCustomerPaymentMethods(customerId: string, type: 'card' | 'us_bank_account' = 'card'): Promise<Stripe.PaymentMethod[]> {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type,
      });

      return paymentMethods.data;
    } catch (error) {
      logger.error('Error retrieving customer payment methods:', error);
      throw new Error('Failed to retrieve payment methods');
    }
  }

  // Create price for subscription
  async createPrice(
    productId: string,
    unitAmount: number,
    currency: string = 'usd',
    interval: 'month' | 'year' = 'month',
    nickname?: string
  ): Promise<Stripe.Price> {
    try {
      const priceData: any = {
        product: productId,
        unit_amount: unitAmount,
        currency,
        recurring: {
          interval,
        },
      };
      
      if (nickname) {
        priceData.nickname = nickname;
      }
      
      const price = await stripe.prices.create(priceData);

      logger.info(`Stripe price created: ${price.id}`);
      return price;
    } catch (error) {
      logger.error('Error creating Stripe price:', error);
      throw new Error('Failed to create price');
    }
  }

  // Create product
  async createProduct(name: string, description?: string, metadata?: Record<string, string>): Promise<Stripe.Product> {
    try {
      const productData: any = {
        name,
        metadata: metadata || {},
      };
      
      if (description) {
        productData.description = description;
      }
      
      const product = await stripe.products.create(productData);

      logger.info(`Stripe product created: ${product.id}`);
      return product;
    } catch (error) {
      logger.error('Error creating Stripe product:', error);
      throw new Error('Failed to create product');
    }
  }

  // Handle webhook events
  async handleWebhook(payload: string | Buffer, signature: string): Promise<Stripe.Event> {
    try {
      const webhookSecret = process.env['STRIPE_WEBHOOK_SECRET'];
      if (!webhookSecret) {
        throw new Error('Stripe webhook secret not configured');
      }

      const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      logger.info(`Stripe webhook received: ${event.type}`);
      return event;
    } catch (error) {
      logger.error('Error handling Stripe webhook:', error);
      throw new Error('Failed to handle webhook');
    }
  }

  // Create checkout session
  async createCheckoutSession(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
    metadata?: Record<string, string>
  ): Promise<Stripe.Checkout.Session> {
    try {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: metadata || {},
      });

      logger.info(`Stripe checkout session created: ${session.id}`);
      return session;
    } catch (error) {
      logger.error('Error creating Stripe checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  // Create payment link
  async createPaymentLink(priceId: string, metadata?: Record<string, string>): Promise<Stripe.PaymentLink> {
    try {
      const paymentLink = await stripe.paymentLinks.create({
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        metadata: metadata || {},
      });

      logger.info(`Stripe payment link created: ${paymentLink.id}`);
      return paymentLink;
    } catch (error) {
      logger.error('Error creating Stripe payment link:', error);
      throw new Error('Failed to create payment link');
    }
  }

  // Get Stripe instance for direct access
  getStripeInstance(): Stripe {
    return stripe;
  }
}

export const stripeService = new StripeService();
export default stripeService;
