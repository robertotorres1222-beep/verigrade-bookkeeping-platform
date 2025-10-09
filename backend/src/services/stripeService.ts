import Stripe from 'stripe'
import { prisma } from '../config/database'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  interval: 'month' | 'year'
  features: string[]
  maxTransactions: number
  maxUsers: number
  maxOrganizations: number
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small businesses just getting started',
    price: 29,
    interval: 'month',
    features: [
      'Up to 100 transactions per month',
      '1 user account',
      'Basic reporting',
      'Email support',
      'Bank connection (1 account)'
    ],
    maxTransactions: 100,
    maxUsers: 1,
    maxOrganizations: 1
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Ideal for growing businesses with more complex needs',
    price: 79,
    interval: 'month',
    features: [
      'Up to 1,000 transactions per month',
      'Up to 5 user accounts',
      'Advanced reporting & analytics',
      'Priority support',
      'Multiple bank connections',
      'AI-powered categorization',
      'Custom categories'
    ],
    maxTransactions: 1000,
    maxUsers: 5,
    maxOrganizations: 1
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large businesses with advanced requirements',
    price: 199,
    interval: 'month',
    features: [
      'Unlimited transactions',
      'Unlimited users',
      'Advanced analytics & insights',
      '24/7 phone support',
      'Unlimited bank connections',
      'Advanced AI features',
      'Custom integrations',
      'Dedicated account manager',
      'White-label options'
    ],
    maxTransactions: -1, // Unlimited
    maxUsers: -1, // Unlimited
    maxOrganizations: -1 // Unlimited
  }
]

export const stripeService = {
  async createCustomer(userId: string, email: string, name?: string) {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          userId
        }
      })

      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customer.id }
      })

      return customer
    } catch (error) {
      console.error('Stripe customer creation error:', error)
      throw new Error('Failed to create customer')
    }
  },

  async createCheckoutSession(userId: string, planId: string, organizationId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          organizationMemberships: {
            where: { isActive: true },
            include: { organization: true }
          }
        }
      })

      if (!user) {
        throw new Error('User not found')
      }

      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId)
      if (!plan) {
        throw new Error('Invalid plan')
      }

      let customerId = user.stripeCustomerId

      // Create customer if doesn't exist
      if (!customerId) {
        const customer = await this.createCustomer(userId, user.email, `${user.firstName} ${user.lastName}`)
        customerId = customer.id
      }

      // Create Stripe price if it doesn't exist
      const price = await this.getOrCreatePrice(plan)

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: price.id,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/pricing`,
        metadata: {
          userId,
          organizationId,
          planId
        },
        subscription_data: {
          metadata: {
            userId,
            organizationId,
            planId
          }
        }
      })

      return session
    } catch (error) {
      console.error('Stripe checkout session creation error:', error)
      throw new Error('Failed to create checkout session')
    }
  },

  async getOrCreatePrice(plan: SubscriptionPlan) {
    try {
      // Try to find existing price
      const prices = await stripe.prices.list({
        product: plan.id,
        active: true
      })

      if (prices.data.length > 0) {
        return prices.data[0]
      }

      // Create product if it doesn't exist
      const product = await stripe.products.create({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        metadata: {
          maxTransactions: plan.maxTransactions.toString(),
          maxUsers: plan.maxUsers.toString(),
          maxOrganizations: plan.maxOrganizations.toString()
        }
      })

      // Create price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.price * 100, // Convert to cents
        currency: 'usd',
        recurring: {
          interval: plan.interval
        },
        metadata: {
          planId: plan.id
        }
      })

      return price
    } catch (error) {
      console.error('Stripe price creation error:', error)
      throw new Error('Failed to create price')
    }
  },

  async handleWebhook(event: Stripe.Event) {
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
          break
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription)
          break
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
          break
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
          break
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice)
          break
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.Invoice)
          break
        default:
          console.log(`Unhandled event type: ${event.type}`)
      }
    } catch (error) {
      console.error('Stripe webhook handling error:', error)
      throw error
    }
  },

  async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const { userId, organizationId, planId } = session.metadata!

    // Create subscription record
    await prisma.subscription.create({
      data: {
        userId,
        stripeSubscriptionId: session.subscription as string,
        stripeCustomerId: session.customer as string,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    })

    console.log(`Subscription created for user ${userId}, organization ${organizationId}, plan ${planId}`)
  },

  async handleSubscriptionCreated(subscription: Stripe.Subscription) {
    const { userId, organizationId, planId } = subscription.metadata

    await prisma.subscription.create({
      data: {
        userId,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000)
      }
    })
  },

  async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    await prisma.subscription.update({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      }
    })
  },

  async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    await prisma.subscription.update({
      where: { stripeSubscriptionId: subscription.id },
      data: { status: 'cancelled' }
    })
  },

  async handlePaymentSucceeded(invoice: Stripe.Invoice) {
    const subscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: invoice.subscription as string }
    })

    if (subscription) {
      // Update subscription status
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'active' }
      })
    }
  },

  async handlePaymentFailed(invoice: Stripe.Invoice) {
    const subscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: invoice.subscription as string }
    })

    if (subscription) {
      // Update subscription status
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'past_due' }
      })
    }
  },

  async getSubscription(userId: string) {
    return await prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })
  },

  async cancelSubscription(subscriptionId: string) {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: subscriptionId }
      })

      if (!subscription) {
        throw new Error('Subscription not found')
      }

      // Cancel in Stripe
      await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      })

      // Update in database
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { cancelAtPeriodEnd: true }
      })

      return { success: true }
    } catch (error) {
      console.error('Subscription cancellation error:', error)
      throw new Error('Failed to cancel subscription')
    }
  },

  async createPortalSession(customerId: string, returnUrl: string) {
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl
      })

      return session
    } catch (error) {
      console.error('Portal session creation error:', error)
      throw new Error('Failed to create portal session')
    }
  }
}


