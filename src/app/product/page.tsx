'use client';

import { 
  ChartBarIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  PlayIcon,
  StarIcon,
  ClockIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  BuildingOfficeIcon,
  DocumentCheckIcon,
  CalculatorIcon,
  PresentationChartLineIcon,
  ReceiptRefundIcon
} from '@heroicons/react/24/outline';

export default function ProductPage() {
  const features = [
    {
      name: 'AI-Powered Receipt Processing',
      description: 'Automatically extract data from receipts using advanced AI vision technology with 99.2% accuracy.',
      icon: DocumentTextIcon,
      benefits: ['Saves 10+ hours per week', '99.2% accuracy rate', 'Supports 50+ languages', 'Processes any receipt format'],
      demo: 'See how our AI processes receipts in real-time'
    },
    {
      name: 'Real-time Analytics',
      description: 'Get instant insights into your business performance with advanced reporting and forecasting.',
      icon: ChartBarIcon,
      benefits: ['Live dashboard updates', 'Predictive analytics', 'Custom reports', 'Trend analysis'],
      demo: 'Explore our analytics dashboard'
    },
    {
      name: 'Multi-Currency Support',
      description: 'Handle transactions in over 100 currencies with real-time exchange rates and automatic conversions.',
      icon: CurrencyDollarIcon,
      benefits: ['100+ currencies', 'Real-time rates', 'Auto-conversion', 'Historical tracking'],
      demo: 'View currency management features'
    },
    {
      name: 'Bank Reconciliation',
      description: 'Automatically match bank transactions with your records for perfect accuracy and compliance.',
      icon: BanknotesIcon,
      benefits: ['Auto-matching', 'Exception handling', 'Audit trails', 'Compliance ready'],
      demo: 'See reconciliation in action'
    },
    {
      name: 'Mobile App',
      description: 'Capture receipts and manage finances on-the-go with our native mobile applications.',
      icon: RocketLaunchIcon,
      benefits: ['iOS & Android', 'Offline mode', 'Camera integration', 'Push notifications'],
      demo: 'Download mobile app demo'
    },
    {
      name: 'Enterprise Security',
      description: 'Bank-level security with SOC 2 compliance, data encryption, and advanced access controls.',
      icon: ShieldCheckIcon,
      benefits: ['SOC 2 compliant', '256-bit encryption', 'Multi-factor auth', 'Role-based access'],
      demo: 'Learn about our security'
    }
  ];

  const integrations = [
    { name: 'QuickBooks', logo: 'QB', description: 'Seamless sync with QuickBooks Online and Desktop' },
    { name: 'Xero', logo: 'X', description: 'Full integration with Xero accounting software' },
    { name: 'Stripe', logo: 'S', description: 'Connect payment processing data automatically' },
    { name: 'PayPal', logo: 'PP', description: 'Import PayPal transactions and fees' },
    { name: 'Sage', logo: 'Sage', description: 'Sync with Sage 50cloud and Sage Intacct' },
    { name: 'FreshBooks', logo: 'FB', description: 'Two-way sync with FreshBooks accounting' },
    { name: 'Zoho Books', logo: 'ZB', description: 'Complete integration with Zoho ecosystem' },
    { name: 'Wave', logo: 'W', description: 'Connect with Wave accounting platform' }
  ];

  const testimonials = [
    {
      content: 'VeriGrade\'s AI receipt processing saved us 15 hours per week. The accuracy is incredible.',
      author: 'Sarah Johnson',
      role: 'CEO, TechStart Inc.',
      company: 'TechStart Inc.',
      savings: '15 hours/week saved'
    },
    {
      content: 'The real-time analytics help us make better business decisions. ROI increased by 40%.',
      author: 'Michael Chen',
      role: 'CFO, GrowthCorp',
      company: 'GrowthCorp',
      savings: '40% ROI increase'
    },
    {
      content: 'Finally, a bookkeeping platform that actually works. Setup took 10 minutes.',
      author: 'Emily Rodriguez',
      role: 'Founder, CreativeStudio',
      company: 'CreativeStudio',
      savings: '10 min setup'
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-indigo-50 via-white to-blue-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center rounded-full bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-800 mb-6">
              <SparklesIcon className="h-4 w-4 mr-2" />
              AI-Powered Financial Management
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Powerful Features for
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600"> Modern Businesses</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              Discover how VeriGrade's intelligent bookkeeping platform can transform your business operations 
              with cutting-edge AI technology and seamless integrations.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="/register"
                className="rounded-md bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:from-indigo-500 hover:to-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transform hover:scale-105 transition-all duration-200"
              >
                Start Free Trial
              </a>
              <a
                href="#features"
                className="text-sm font-semibold leading-6 text-gray-900 flex items-center gap-2 hover:text-indigo-600 transition-colors"
              >
                <PlayIcon className="h-4 w-4" />
                Watch Demo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything You Need to Succeed
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Our comprehensive suite of features is designed to handle every aspect of your business finances
            </p>
          </div>

          <div className="space-y-24">
            {features.map((feature, index) => (
              <div key={feature.name} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className="inline-flex items-center rounded-full bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-800 mb-6">
                    <feature.icon className="h-4 w-4 mr-2" />
                    {feature.name}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.name}</h3>
                  <p className="text-lg text-gray-600 mb-6">{feature.description}</p>
                  
                  <ul className="space-y-3 mb-8">
                    {feature.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-center">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mr-3" />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <button className="inline-flex items-center text-indigo-600 hover:text-indigo-500 font-medium">
                    {feature.demo}
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </button>
                </div>
                
                <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-8 border border-indigo-100">
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900">{feature.name}</h4>
                        <feature.icon className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="space-y-3">
                        {feature.benefits.slice(0, 3).map((benefit) => (
                          <div key={benefit} className="flex items-center">
                            <div className="h-2 w-2 bg-green-500 rounded-full mr-3"></div>
                            <span className="text-sm text-gray-600">{benefit}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Performance</span>
                          <span className="text-sm font-medium text-green-600">Excellent</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Seamless Integrations
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Connect with your favorite tools and platforms for a unified workflow
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-8">
            {integrations.map((integration) => (
              <div key={integration.name} className="group bg-white rounded-lg p-4 border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200">
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-indigo-200 transition-colors">
                    <span className="text-sm font-bold text-indigo-600">{integration.logo}</span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900">{integration.name}</h3>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">Don't see your favorite tool?</p>
            <button className="text-indigo-600 hover:text-indigo-500 font-medium">
              Request an integration
              <ArrowRightIcon className="ml-2 h-4 w-4 inline" />
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Loved by Businesses Worldwide
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              See how VeriGrade is transforming businesses across industries
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
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

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-indigo-600 to-blue-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Transform Your Bookkeeping?
          </h2>
          <p className="mt-4 text-lg text-indigo-100 max-w-2xl mx-auto">
            Join thousands of businesses already using VeriGrade to streamline their finances. 
            Start your free trial today.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="/register"
              className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-gray-50"
            >
              Start Free Trial
            </a>
            <a
              href="/contact"
              className="text-sm font-semibold leading-6 text-white"
            >
              Contact Sales <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}



