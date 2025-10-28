'use client';

import { 
  CheckIcon,
  StarIcon,
  ArrowRightIcon,
  SparklesIcon,
  CheckCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

export default function PricingPage() {
  const pricingPlans = [
    {
      name: 'Starter',
      price: '$29',
      period: '/month',
      originalPrice: '$39',
      description: 'Perfect for small businesses and freelancers',
      features: [
        'Up to 200 transactions/month',
        'Basic financial reports',
        'Email support (48hr response)',
        'Mobile app access',
        'Bank account integration',
        'Receipt capture (10/month)',
        'Basic tax preparation'
      ],
      benefits: ['Save $10/month', '14-day free trial', 'No setup fees'],
      cta: 'Start Free Trial',
      popular: false,
      savings: 'Save $10/month'
    },
    {
      name: 'Professional',
      price: '$79',
      period: '/month',
      originalPrice: '$99',
      description: 'Ideal for growing businesses',
      features: [
        'Up to 1,000 transactions/month',
        'Advanced analytics & insights',
        'Priority support (24hr response)',
        'Multi-currency support (50+ currencies)',
        'AI receipt processing (unlimited)',
        'Advanced tax features',
        'API access',
        'Custom reporting',
        'Team collaboration (up to 5 users)'
      ],
      benefits: ['Save $20/month', 'Most popular', 'Best value'],
      cta: 'Start Free Trial',
      popular: true,
      savings: 'Save $20/month'
    },
    {
      name: 'Business',
      price: '$149',
      period: '/month',
      originalPrice: '$199',
      description: 'For established businesses',
      features: [
        'Up to 5,000 transactions/month',
        'Advanced AI insights',
        'Phone & chat support (4hr response)',
        'All currencies supported',
        'Custom integrations',
        'Advanced tax planning',
        'Dedicated account manager',
        'White-label reporting',
        'Team collaboration (up to 25 users)',
        'Custom training sessions'
      ],
      benefits: ['Save $50/month', 'Dedicated support', 'Custom features'],
      cta: 'Start Free Trial',
      popular: false,
      savings: 'Save $50/month'
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large enterprises',
      features: [
        'Unlimited transactions',
        'Custom AI models',
        '24/7 dedicated support',
        'Custom currency workflows',
        'Enterprise integrations',
        'Full-service tax preparation',
        'Dedicated success manager',
        'Custom branding',
        'Unlimited team members',
        'On-premise deployment option'
      ],
      benefits: ['Volume discounts', 'Custom pricing', 'Enterprise features'],
      cta: 'Contact Sales',
      popular: false,
      savings: 'Volume discounts available'
    }
  ];

  const faqs = [
    {
      question: 'Can I change plans anytime?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and we\'ll prorate any differences.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for annual plans.'
    },
    {
      question: 'Is there a setup fee?',
      answer: 'No setup fees. You only pay for your chosen plan after the free trial ends. We also don\'t charge for data migration.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'Yes, we offer a 30-day money-back guarantee if you\'re not satisfied with our service. No questions asked.'
    },
    {
      question: 'What happens after my free trial?',
      answer: 'After your 14-day free trial, you\'ll be automatically charged for your selected plan. You can cancel anytime before the trial ends.'
    },
    {
      question: 'Can I get a custom quote?',
      answer: 'Absolutely! Contact our sales team for custom pricing based on your specific business needs and requirements.'
    }
  ];

  const testimonials = [
    {
      content: 'VeriGrade saved us $2,400 per year compared to our previous bookkeeping service. The ROI is incredible.',
      author: 'Sarah Johnson',
      role: 'CEO, TechStart Inc.',
      savings: '$2,400/year saved',
      rating: 5
    },
    {
      content: 'The Professional plan gives us everything we need. The AI features alone are worth the price.',
      author: 'Michael Chen',
      role: 'CFO, GrowthCorp',
      savings: '10 hours/week saved',
      rating: 5
    },
    {
      content: 'Enterprise support is outstanding. Our dedicated manager helps us optimize everything.',
      author: 'Emily Rodriguez',
      role: 'Founder, CreativeStudio',
      savings: '300% efficiency gain',
      rating: 5
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-indigo-50 via-white to-blue-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-800 mb-6">
              <SparklesIcon className="h-4 w-4 mr-2" />
              Limited Time Offer
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Simple, Transparent
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600"> Pricing</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              Choose the plan that fits your business needs. All plans include a 14-day free trial with no credit card required.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="#pricing"
                className="rounded-md bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:from-indigo-500 hover:to-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transform hover:scale-105 transition-all duration-200"
              >
                View Plans
              </a>
              <a
                href="#faq"
                className="text-sm font-semibold leading-6 text-gray-900 flex items-center gap-2 hover:text-indigo-600 transition-colors"
              >
                <ArrowRightIcon className="h-4 w-4" />
                See FAQ
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Pricing Toggle */}
          <div className="flex justify-center mb-16">
            <div className="bg-gray-100 rounded-lg p-1">
              <button className="px-6 py-2 text-sm font-medium text-gray-900 bg-white rounded-md shadow-sm">
                Monthly
              </button>
              <button className="px-6 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
                Annual (Save 20%)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-2xl border-2 p-8 relative transition-all duration-200 hover:shadow-xl ${
                  plan.popular ? 'border-indigo-500 ring-2 ring-indigo-100 scale-105' : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-1">{plan.period}</span>
                  </div>
                  {plan.originalPrice && (
                    <div className="mb-3">
                      <span className="text-sm text-gray-500 line-through">{plan.originalPrice}{plan.period}</span>
                      <span className="ml-2 text-sm font-medium text-green-600">{plan.savings}</span>
                    </div>
                  )}
                  <p className="text-gray-600 text-sm">{plan.description}</p>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="ml-3 text-gray-600 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="space-y-3 mb-8">
                  {plan.benefits.map((benefit) => (
                    <div key={benefit} className="flex items-center text-sm">
                      <div className="h-2 w-2 bg-indigo-500 rounded-full mr-2"></div>
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
                
                <div>
                  <a
                    href={plan.cta === 'Contact Sales' ? '/contact' : '/register'}
                    className={`w-full rounded-lg px-4 py-3 text-sm font-semibold text-center block transition-all duration-200 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-500 hover:to-blue-500 shadow-lg hover:shadow-xl transform hover:scale-105'
                        : 'bg-gray-900 text-white hover:bg-gray-800 shadow-sm hover:shadow-md'
                    }`}
                  >
                    {plan.cta}
                  </a>
                  {plan.cta === 'Start Free Trial' && (
                    <p className="mt-2 text-center text-xs text-gray-500">No credit card required</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              What Our Customers Say
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              See how VeriGrade is helping businesses save money and time
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-gray-900 mb-6">
                  "{testimonial.content}"
                </blockquote>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">{testimonial.savings}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need to know about our pricing and plans
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600 text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-gradient-to-r from-indigo-600 to-blue-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Need Help Choosing?
              </h2>
              <p className="mt-4 text-lg text-indigo-100">
                Our team is here to help you find the perfect plan for your business. 
                Get personalized recommendations and answers to all your questions.
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex items-center">
                  <PhoneIcon className="h-5 w-5 text-indigo-200 mr-3" />
                  <span className="text-white">1-800-VERIGRADE</span>
                </div>
                <div className="flex items-center">
                  <EnvelopeIcon className="h-5 w-5 text-indigo-200 mr-3" />
                  <span className="text-white">sales@verigrade.com</span>
                </div>
                <div className="flex items-center">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 text-indigo-200 mr-3" />
                  <span className="text-white">Live chat available</span>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-6">Get a Custom Quote</h3>
              <form className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/10 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/10 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>
                <div>
                  <select className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white/50">
                    <option value="">Company Size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="200+">200+ employees</option>
                  </select>
                </div>
                <div>
                  <textarea
                    placeholder="Tell us about your needs"
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/10 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Get Custom Quote
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}



