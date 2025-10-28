'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  CurrencyDollarIcon,
  RocketLaunchIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  ClockIcon,
  ChartBarIcon,
  UserGroupIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const benefits = [
  {
    icon: CurrencyDollarIcon,
    title: 'Startup-Friendly Pricing',
    description: 'Start at just $29/month with no hidden fees. Scale as you grow with transparent pricing.',
    features: ['No setup fees', 'Cancel anytime', 'Transparent pricing', 'Volume discounts'],
    color: 'from-green-500 to-emerald-500',
    highlight: true
  },
  {
    icon: RocketLaunchIcon,
    title: 'Grows With You',
    description: 'From pre-revenue to IPO, VeriGrade scales with your business needs.',
    features: ['Unlimited transactions', 'Team collaboration', 'Advanced features', 'Enterprise support'],
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: CpuChipIcon,
    title: 'AI-Powered Automation',
    description: 'Let our AI handle the tedious work so you can focus on growing your business.',
    features: ['Smart categorization', 'Receipt processing', 'Anomaly detection', 'Predictive insights'],
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Enterprise Security',
    description: 'Bank-level security that meets the highest compliance standards.',
    features: ['SOC 2 compliant', 'GDPR ready', '256-bit encryption', 'Regular audits'],
    color: 'from-indigo-500 to-blue-500'
  },
  {
    icon: ClockIcon,
    title: 'Quick Setup',
    description: 'Get started in minutes, not weeks. Our intuitive interface gets you up and running fast.',
    features: ['5-minute setup', 'Data import tools', 'Migration assistance', 'Training resources'],
    color: 'from-orange-500 to-red-500'
  },
  {
    icon: ChartBarIcon,
    title: 'Real-Time Insights',
    description: 'Make data-driven decisions with instant financial insights and forecasting.',
    features: ['Live dashboards', 'Cash flow forecasting', 'KPI tracking', 'Custom reports'],
    color: 'from-teal-500 to-green-500'
  }
];

const testimonials = [
  {
    quote: "VeriGrade saved us 20 hours per week on bookkeeping. The AI is incredible!",
    author: "Sarah Chen",
    role: "Founder, TechFlow",
    savings: "20 hours/week"
  },
  {
    quote: "Finally, a bookkeeping tool that understands startups. Game changer!",
    author: "Marcus Rodriguez",
    role: "CEO, GrowthLab",
    savings: "50% cost reduction"
  },
  {
    quote: "The setup was so easy. We were up and running in 10 minutes.",
    author: "Emily Watson",
    role: "Co-founder, InnovateCo",
    savings: "10-minute setup"
  }
];

const pricingComparison = [
  {
    feature: 'Monthly Cost',
    verigrade: '$29-79',
    traditional: '$200-500',
    savings: 'Up to 80% cheaper'
  },
  {
    feature: 'Setup Time',
    verigrade: '5 minutes',
    traditional: '2-4 weeks',
    savings: '99% faster'
  },
  {
    feature: 'AI Features',
    verigrade: 'Included',
    traditional: 'Not available',
    savings: 'Unique advantage'
  },
  {
    feature: 'Data Export',
    verigrade: 'Unlimited',
    traditional: 'Limited',
    savings: 'Full control'
  }
];

const StartupValueProp: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Built for Modern Businesses
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We understand that startups need more than just bookkeeping. 
              You need a financial partner that grows with you.
            </p>
          </motion.div>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`bg-white rounded-2xl shadow-lg p-8 border-2 transition-all duration-300 hover:shadow-xl ${
                benefit.highlight ? 'border-blue-200 ring-2 ring-blue-100' : 'border-gray-200'
              }`}
            >
              {benefit.highlight && (
                <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mb-4">
                  <SparklesIcon className="h-4 w-4 mr-1" />
                  Most Popular
                </div>
              )}
              
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${benefit.color} text-white mb-6`}>
                <benefit.icon className="h-8 w-8" />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{benefit.title}</h3>
              <p className="text-gray-600 mb-6">{benefit.description}</p>
              
              <ul className="space-y-2">
                {benefit.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                    <CheckIcon className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Pricing Comparison */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-4">See the Difference</h3>
            <p className="text-lg text-gray-600">
              How VeriGrade compares to traditional bookkeeping solutions
            </p>
          </motion.div>

          <div className="bg-gray-50 rounded-2xl p-8">
            <div className="grid md:grid-cols-4 gap-6">
              <div className="font-semibold text-gray-900">Feature</div>
              <div className="text-center">
                <div className="font-semibold text-blue-600 mb-2">VeriGrade</div>
                <div className="text-sm text-gray-500">Modern & Affordable</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-700 mb-2">Traditional</div>
                <div className="text-sm text-gray-500">Expensive & Complex</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-green-600 mb-2">Your Savings</div>
                <div className="text-sm text-gray-500">Time & Money</div>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200 mt-6">
              {pricingComparison.map((item, index) => (
                <div key={index} className="grid md:grid-cols-4 gap-6 py-4">
                  <div className="font-medium text-gray-900">{item.feature}</div>
                  <div className="text-center text-blue-600 font-semibold">{item.verigrade}</div>
                  <div className="text-center text-gray-700">{item.traditional}</div>
                  <div className="text-center text-green-600 font-semibold">{item.savings}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-4">What Founders Say</h3>
            <p className="text-lg text-gray-600">
              Real results from real startup founders
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200"
              >
                <div className="text-4xl text-blue-600 mb-4">"</div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.quote}"</p>
                <div className="border-t border-gray-200 pt-4">
                  <div className="font-semibold text-gray-900">{testimonial.author}</div>
                  <div className="text-sm text-gray-500 mb-2">{testimonial.role}</div>
                  <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                    <CheckIcon className="h-4 w-4 mr-1" />
                    {testimonial.savings}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center"
        >
          <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Finances?</h3>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of startups who've already made the switch to smarter, 
            more affordable bookkeeping.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center">
              Start Free Trial
              <ArrowRightIcon className="h-5 w-5 ml-2" />
            </button>
            <button className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors">
              View Pricing
            </button>
          </div>
          
          <div className="mt-8 flex items-center justify-center space-x-8 text-sm text-blue-100">
            <div className="flex items-center">
              <UserGroupIcon className="h-4 w-4 mr-2" />
              1,000+ Happy Customers
            </div>
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-2" />
              5-Minute Setup
            </div>
            <div className="flex items-center">
              <ShieldCheckIcon className="h-4 w-4 mr-2" />
              SOC 2 Compliant
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StartupValueProp;
