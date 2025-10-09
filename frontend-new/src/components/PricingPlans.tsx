'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface PricingPlan {
  id: string
  name: string
  description: string
  price: number
  interval: 'month' | 'year'
  features: string[]
  popular?: boolean
  maxTransactions: number
  maxUsers: number
}

const plans: PricingPlan[] = [
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
      'Bank connection (1 account)',
      'Mobile app access',
      'Basic AI categorization'
    ],
    maxTransactions: 100,
    maxUsers: 1
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
      'Advanced AI categorization',
      'Custom categories',
      'Receipt scanning',
      'Tax preparation tools',
      'Integration with accounting software'
    ],
    maxTransactions: 1000,
    maxUsers: 5,
    popular: true
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
      'White-label options',
      'Custom reporting',
      'Advanced security features',
      'SLA guarantee'
    ],
    maxTransactions: -1,
    maxUsers: -1
  }
]

export default function PricingPlans() {
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month')
  const [loading, setLoading] = useState<string | null>(null)

  const handleSelectPlan = async (planId: string) => {
    setLoading(planId)
    
    try {
      // In a real implementation, this would redirect to Stripe checkout
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          planId,
          billingInterval
        })
      })

      if (response.ok) {
        const { url } = await response.json()
        window.location.href = url
      } else {
        console.error('Failed to create checkout session')
      }
    } catch (error) {
      console.error('Error selecting plan:', error)
    } finally {
      setLoading(null)
    }
  }

  const getPrice = (plan: PricingPlan) => {
    if (billingInterval === 'year') {
      return Math.round(plan.price * 12 * 0.8) // 20% discount for yearly
    }
    return plan.price
  }

  const getBillingText = (plan: PricingPlan) => {
    if (billingInterval === 'year') {
      return `$${getPrice(plan)}/year (20% off)`
    }
    return `$${getPrice(plan)}/month`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Start with a free trial, then choose the plan that fits your business needs
        </p>
        
        {/* Billing Toggle */}
        <div className="flex items-center justify-center space-x-4">
          <span className={`text-sm ${billingInterval === 'month' ? 'text-gray-900' : 'text-gray-500'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingInterval(billingInterval === 'month' ? 'year' : 'month')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              billingInterval === 'year' ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                billingInterval === 'year' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm ${billingInterval === 'year' ? 'text-gray-900' : 'text-gray-500'}`}>
            Yearly
          </span>
          {billingInterval === 'year' && (
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
              Save 20%
            </span>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-indigo-600 text-white text-sm font-medium px-4 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
            )}
            
            <Card className={`h-full ${plan.popular ? 'border-indigo-600 shadow-lg' : ''}`}>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-gray-600">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">
                    ${getPrice(plan)}
                  </span>
                  <span className="text-gray-500 ml-1">
                    /{billingInterval === 'year' ? 'year' : 'month'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {getBillingText(plan)}
                </p>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <motion.li
                      key={featureIndex}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (index * 0.1) + (featureIndex * 0.05) }}
                      className="flex items-start"
                    >
                      <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
                
                <Button
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-indigo-600 hover:bg-indigo-700' 
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={loading === plan.id}
                >
                  {loading === plan.id ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    `Get Started with ${plan.name}`
                  )}
                </Button>
                
                <p className="text-xs text-gray-500 text-center mt-3">
                  Start with a 14-day free trial. Cancel anytime.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Additional Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-16"
      >
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          All plans include:
        </h3>
        <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
          <div className="flex items-center">
            <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            256-bit SSL encryption
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Bank-level security
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Data backup & recovery
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Regular software updates
          </div>
        </div>
      </motion.div>
    </div>
  )
}


