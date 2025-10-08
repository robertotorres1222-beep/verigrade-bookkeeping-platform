'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Bars3Icon, 
  XMarkIcon,
  CheckIcon,
  StarIcon,
  ArrowRightIcon,
  PlayIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon,
  DocumentTextIcon,
  BanknotesIcon,
  Cog6ToothIcon,
  BuildingOfficeIcon,
  SparklesIcon,
  CheckCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

export default function StartupLandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const navigation = [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ];

  const features = [
    {
      name: 'AI Receipt Processing',
      description: 'Upload receipts and watch our AI extract data automatically with 99.9% accuracy.',
      icon: DocumentTextIcon,
    },
    {
      name: 'Real-time Analytics',
      description: 'Get instant insights into your business performance with advanced reporting.',
      icon: ChartBarIcon,
    },
    {
      name: 'Multi-Currency Support',
      description: 'Handle transactions in over 100 currencies with real-time exchange rates.',
      icon: CurrencyDollarIcon,
    },
    {
      name: 'Bank Reconciliation',
      description: 'Automatically match bank transactions with your records for perfect accuracy.',
      icon: BanknotesIcon,
    },
    {
      name: 'Mobile App',
      description: 'Capture receipts and manage finances on-the-go with our mobile app.',
      icon: RocketLaunchIcon,
    },
    {
      name: 'Enterprise Security',
      description: 'Bank-level security with SOC 2 compliance and end-to-end encryption.',
      icon: ShieldCheckIcon,
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'CEO, TechStart Inc',
      content: 'VeriGrade reduced our bookkeeping time by 80%. The AI receipt processing is incredible!',
      avatar: 'SJ',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'CFO, RetailMax',
      content: 'Finally, a bookkeeping platform that actually understands business. Game changer!',
      avatar: 'MC',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Founder, Creative Studio',
      content: 'The mobile app is perfect for capturing receipts on the go. Love the real-time sync!',
      avatar: 'ER',
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: '$29',
      period: '/month',
      description: 'Perfect for small businesses and freelancers',
      features: [
        'Up to 100 transactions/month',
        'AI receipt processing',
        'Basic reporting',
        'Mobile app access',
        'Email support'
      ],
      cta: 'Start Free Trial',
      popular: false
    },
    {
      name: 'Professional',
      price: '$79',
      period: '/month',
      description: 'Ideal for growing businesses',
      features: [
        'Up to 1,000 transactions/month',
        'Advanced AI processing',
        'Real-time analytics',
        'Bank reconciliation',
        'Priority support',
        'Custom integrations'
      ],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large organizations',
      features: [
        'Unlimited transactions',
        'Custom AI models',
        'Advanced security',
        'Dedicated account manager',
        '24/7 phone support',
        'Custom reporting'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-indigo-600">VeriGrade</h1>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-900 hover:text-indigo-600 px-3 py-2 text-sm font-medium"
                >
                  {item.name}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-900 hover:text-indigo-600 px-3 py-2 text-sm font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="startup-btn-primary"
              >
                Start Free Trial
              </Link>
            </div>

            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-900 hover:text-indigo-600"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-900 hover:text-indigo-600 block px-3 py-2 text-base font-medium"
                >
                  {item.name}
                </a>
              ))}
              <div className="border-t pt-4 pb-3">
                <Link
                  href="/login"
                  className="text-gray-900 hover:text-indigo-600 block px-3 py-2 text-base font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="startup-btn-primary mx-3 mt-2"
                >
                  Start Free Trial
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="startup-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              AI-Powered Bookkeeping
              <span className="block text-indigo-200">Made Simple</span>
            </h1>
            <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
              Transform your business finances with our intelligent bookkeeping platform. 
              Process receipts, track expenses, and get real-time insights with the power of AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/register"
                className="startup-btn-primary text-lg px-8 py-4"
              >
                Start Free Trial
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <button
                onClick={() => setShowVideo(true)}
                className="startup-btn-secondary text-lg px-8 py-4"
              >
                <PlayIcon className="mr-2 h-5 w-5" />
                Watch Demo
              </button>
            </div>
            <p className="text-indigo-200 text-sm mt-4">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </div>

      {/* Demo Video Modal */}
      {showVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 relative">
            <button
              onClick={() => setShowVideo(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            
            <div className="demo-video">
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="bg-indigo-600 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <PlayIcon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">VeriGrade Demo</h3>
                  <p className="text-indigo-200 mb-6">
                    See how VeriGrade transforms your bookkeeping workflow
                  </p>
                  <div className="space-y-4">
                    <div className="bg-white bg-opacity-20 rounded-lg p-4">
                      <h4 className="font-semibold text-white mb-2">🎯 AI Receipt Processing</h4>
                      <p className="text-indigo-200 text-sm">
                        Upload a receipt photo and watch our AI extract all data automatically
                      </p>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-4">
                      <h4 className="font-semibold text-white mb-2">📊 Real-time Analytics</h4>
                      <p className="text-indigo-200 text-sm">
                        Get instant insights into your business performance and cash flow
                      </p>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-4">
                      <h4 className="font-semibold text-white mb-2">🏦 Bank Reconciliation</h4>
                      <p className="text-indigo-200 text-sm">
                        Automatically match transactions and maintain perfect accuracy
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/register"
                    className="startup-btn-primary mt-6 inline-block"
                  >
                    Try It Now - Free Trial
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Features Section */}
      <div id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to manage your finances
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed to streamline your bookkeeping and give you 
              complete control over your business finances.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.name} className="feature-card">
                <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mb-4">
                  <feature.icon className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.name}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by thousands of businesses
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers are saying about VeriGrade
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {testimonial.avatar}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that's right for your business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`pricing-card ${plan.popular ? 'popular' : ''}`}
              >
                {plan.popular && (
                  <div className="bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-full absolute -top-3 left-1/2 transform -translate-x-1/2">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`w-full text-center py-3 px-4 rounded-lg font-semibold ${
                    plan.popular
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="startup-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to transform your bookkeeping?
            </h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses already using VeriGrade to streamline 
              their finances and focus on what matters most.
            </p>
            <Link
              href="/register"
              className="startup-btn-primary text-lg px-8 py-4"
            >
              Start Your Free Trial Today
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <p className="text-indigo-200 text-sm mt-4">
              No setup fees • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">VeriGrade</h3>
              <p className="text-gray-400">
                AI-powered bookkeeping platform for modern businesses.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><Link href="/login" className="hover:text-white">Sign In</Link></li>
                <li><Link href="/register" className="hover:text-white">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/guides" className="hover:text-white">Guides</Link></li>
                <li><a href="#contact" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#about" className="hover:text-white">About</a></li>
                <li><Link href="/security" className="hover:text-white">Security</Link></li>
                <li><a href="/privacy" className="hover:text-white">Privacy</a></li>
                <li><a href="/terms" className="hover:text-white">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 VeriGrade. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}