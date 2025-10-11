// Subscription Management Service
import Stripe from 'stripe';
import { prisma } from '../config/database';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

// Subscription Plans
export const PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month' as const,
    features: {
      invoices: 5,
      expenses: 10,
      users: 1,
      aiCategorization: false,
      reports: 'basic',
      support: 'email',
    },
  },
  STARTER: {
    id: 'price_starter', // Replace with actual Stripe price ID
    name: 'Starter',
    price: 19,
    interval: 'month' as const,
    features: {
      invoices: 50,
      expenses: -1, // unlimited
      users: 3,
      aiCategorization: true,
      reports: 'advanced',
      support: 'priority',
    },
  },
  PROFESSIONAL: {
    id: 'price_professional', // Replace with actual Stripe price ID
    name: 'Professional',
    price: 49,
    interval: 'month' as const,
    features: {
      invoices: -1, // unlimited
      expenses: -1, // unlimited
      users: 10,
      aiCategorization: true,
      reports: 'advanced',
      support: 'phone',
      integrations: true,
      api: true,
    },
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 0, // Custom pricing
    interval: 'month' as const,
    features: {
      invoices: -1,
      expenses: -1,
      users: -1,
      aiCategorization: true,
      reports: 'custom',
      support: 'dedicated',
      integrations: true,
      api: true,
      whiteLabel: true,
      sla: true,
    },
  },
};

export class SubscriptionService {
  /**
   * Create a new subscription for a user
   */
  async createSubscription(userId: string, priceId: string) {
    // Get or create Stripe customer
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscriptions: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: {
          userId: user.id,
        },
      });

      customerId = customer.id;

      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    // Save to database
    await prisma.subscription.create({
      data: {
        userId,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: customerId,
        stripePriceId: priceId,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });

    return subscription;
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(userId: string) {
    const subscription = await prisma.subscription.findFirst({
      where: { userId, status: 'active' },
    });

    if (!subscription) {
      throw new Error('No active subscription found');
    }

    await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'canceled',
        canceledAt: new Date(),
      },
    });

    return { success: true };
  }

  /**
   * Update subscription (upgrade/downgrade)
   */
  async updateSubscription(userId: string, newPriceId: string) {
    const subscription = await prisma.subscription.findFirst({
      where: { userId, status: 'active' },
    });

    if (!subscription) {
      throw new Error('No active subscription found');
    }

    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId
    );

    const updatedSubscription = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      {
        items: [
          {
            id: stripeSubscription.items.data[0].id,
            price: newPriceId,
          },
        ],
        proration_behavior: 'always_invoice',
      }
    );

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        stripePriceId: newPriceId,
        status: updatedSubscription.status,
      },
    });

    return updatedSubscription;
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await this.syncSubscription(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: 'canceled',
            canceledAt: new Date(),
          },
        });
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        // Handle successful payment
        console.log(`Invoice paid: ${invoice.id}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        // Handle failed payment
        console.log(`Invoice payment failed: ${invoice.id}`);
        // Send email notification, update subscription status, etc.
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  /**
   * Sync subscription from Stripe to database
   */
  private async syncSubscription(stripeSubscription: Stripe.Subscription) {
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: stripeSubscription.customer as string },
    });

    if (!user) {
      console.error('User not found for Stripe customer:', stripeSubscription.customer);
      return;
    }

    await prisma.subscription.upsert({
      where: {
        stripeSubscriptionId: stripeSubscription.id,
      },
      update: {
        status: stripeSubscription.status,
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        canceledAt: stripeSubscription.canceled_at
          ? new Date(stripeSubscription.canceled_at * 1000)
          : null,
      },
      create: {
        userId: user.id,
        stripeSubscriptionId: stripeSubscription.id,
        stripeCustomerId: stripeSubscription.customer as string,
        stripePriceId: stripeSubscription.items.data[0].price.id,
        status: stripeSubscription.status,
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      },
    });
  }

  /**
   * Check if user can perform action based on plan limits
   */
  async checkLimit(userId: string, feature: 'invoices' | 'expenses' | 'users') {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: {
          where: { status: 'active' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user || !user.subscriptions[0]) {
      // Free plan limits
      const count = await this.getUsageCount(userId, feature);
      const limit = PLANS.FREE.features[feature];
      return { allowed: count < limit, limit, current: count };
    }

    // Find plan by price ID
    const plan = Object.values(PLANS).find(
      (p) => p.id === user.subscriptions[0].stripePriceId
    );

    if (!plan) {
      return { allowed: true, limit: -1, current: 0 }; // Unknown plan, allow
    }

    const limit = plan.features[feature];
    if (limit === -1) {
      return { allowed: true, limit: -1, current: 0 }; // Unlimited
    }

    const count = await this.getUsageCount(userId, feature);
    return { allowed: count < limit, limit, current: count };
  }

  /**
   * Get current usage count for a feature
   */
  private async getUsageCount(userId: string, feature: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { organizationMemberships: true },
    });

    if (!user) return 0;

    const orgId = user.organizationMemberships[0]?.organizationId;
    if (!orgId) return 0;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    switch (feature) {
      case 'invoices':
        return prisma.invoice.count({
          where: {
            organizationId: orgId,
            createdAt: { gte: startOfMonth },
          },
        });

      case 'expenses':
        return prisma.expense.count({
          where: {
            organizationId: orgId,
            createdAt: { gte: startOfMonth },
          },
        });

      case 'users':
        return prisma.organizationMember.count({
          where: {
            organizationId: orgId,
            isActive: true,
          },
        });

      default:
        return 0;
    }
  }
}

export const subscriptionService = new SubscriptionService();

