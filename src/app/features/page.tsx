'use client';

import { motion } from 'framer-motion';
import VeriGradeLogo from '../../components/VeriGradeLogo';
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
  ReceiptRefundIcon,
  CpuChipIcon,
  LightBulbIcon,
  GlobeAltIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

export default function FeaturesPage() {
  const features = [
    {
      name: 'AI Receipt Processing',
      description: 'Upload receipts and watch our AI extract data automatically with 99.9% accuracy.',
      icon: DocumentTextIcon,
      gradient: 'from-blue-500 to-cyan-500',
      stats: '99.9% accuracy',
      details: [
        'OCR text recognition in 50+ languages',
        'Automatic data extraction and validation',
        'Duplicate detection and prevention',
        'Batch processing capabilities'
      ]
    },
    {
      name: 'Real-time Analytics',
      description: 'Get instant insights into your business performance with advanced reporting.',
      icon: ChartBarIcon,
      gradient: 'from-purple-500 to-pink-500',
      stats: 'Real-time data',
      details: [
        'Live dashboard updates every second',
        'Interactive charts and visualizations',
        'Custom KPI tracking',
        'Automated report generation'
      ]
    },
    {
      name: 'Smart Categorization',
      description: 'AI automatically categorizes transactions with intelligent pattern recognition.',
      icon: CpuChipIcon,
      gradient: 'from-green-500 to-emerald-500',
      stats: 'AI-powered',
      details: [
        'Machine learning categorization',
        'Pattern recognition algorithms',
        'Confidence scoring system',
        'Continuous learning and improvement'
      ]
    },
    {
      name: 'Multi-Currency Support',
      description: 'Handle transactions in over 100 currencies with real-time exchange rates.',
      icon: GlobeAltIcon,
      gradient: 'from-orange-500 to-red-500',
      stats: '100+ currencies',
      details: [
        'Real-time exchange rate updates',
        'Automatic currency conversion',
        'Multi-currency reporting',
        'Historical rate tracking'
      ]
    },
    {
      name: 'Bank Reconciliation',
      description: 'Automatically match bank transactions with your records for perfect accuracy.',
      icon: BanknotesIcon,
      gradient: 'from-indigo-500 to-blue-500',
      stats: 'Auto-matching',
      details: [
        'Automated transaction matching',
        'Exception handling and alerts',
        'Audit trail maintenance',
        'Compliance reporting'
      ]
    },
    {
      name: 'Enterprise Security',
      description: 'Bank-level security with SOC 2 compliance and end-to-end encryption.',
      icon: ShieldCheckIcon,
      gradient: 'from-gray-500 to-slate-500',
      stats: 'SOC 2 compliant',
      details: [
        '256-bit AES encryption',
        'Multi-factor authentication',
        'Role-based access controls',
        'Regular security audits'
      ]
    },
    {
      name: 'Invoice Management',
      description: 'Create, send, and track professional invoices with automated follow-ups.',
      icon: DocumentCheckIcon,
      gradient: 'from-teal-500 to-cyan-500',
      stats: 'Professional',
      details: [
        'Custom invoice templates',
        'Automated payment reminders',
        'Payment tracking and reconciliation',
        'Client portal integration'
      ]
    },
    {
      name: 'Expense Tracking',
      description: 'Track business expenses with real-time categorization and approval workflows.',
      icon: CalculatorIcon,
      gradient: 'from-yellow-500 to-orange-500',
      stats: 'Real-time',
      details: [
        'Receipt capture and processing',
        'Expense approval workflows',
        'Budget monitoring and alerts',
        'Tax categorization'
      ]
    },
    {
      name: 'Financial Reporting',
      description: 'Generate comprehensive financial reports with one-click export options.',
      icon: PresentationChartLineIcon,
      gradient: 'from-pink-500 to-rose-500',
      stats: 'One-click export',
      details: [
        'P&L, Balance Sheet, Cash Flow',
        'Custom report builder',
        'Scheduled report delivery',
        'Multiple export formats'
      ]
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

  return (
    <div className="bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <a href="/" className="flex items-center">
                <VeriGradeLogo size="md" variant="full" />
              </a>
            </div>
            <div className="flex items-center space-x-8">
              <a href="/" className="text-gray-600 hover:text-gray-900">Home</a>
              <a href="/features" className="text-blue-600 font-semibold">Features</a>
              <a href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
              <a href="/about" className="text-gray-600 hover:text-gray-900">About</a>
              <a href="/contact" className="text-gray-600 hover:text-gray-900">Contact</a>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl"
            >
              Powerful Features for{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Modern Bookkeeping
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto"
            >
              Discover the comprehensive suite of AI-powered tools that make VeriGrade the most advanced bookkeeping platform for modern businesses.
            </motion.p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to manage your finances
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Powerful AI-driven features that automate your bookkeeping and provide real-time insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.name}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <div className="mb-6">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-gradient-to-r ${feature.gradient} text-white`}>
                    {feature.stats}
                  </span>
                </div>
                <ul className="space-y-2">
                  {feature.details.map((detail, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Seamless Integrations
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Connect with your favorite tools and platforms for a unified workflow.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {integrations.map((integration, index) => (
              <motion.div
                key={integration.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-lg">{integration.logo}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{integration.name}</h3>
                <p className="text-sm text-gray-600">{integration.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to experience these features?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Start your free trial today and discover how VeriGrade can transform your bookkeeping workflow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-blue-600 bg-white hover:bg-gray-50 transition-colors duration-200"
            >
              Start Free Trial
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </a>
            <a
              href="/contact"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-lg font-medium rounded-xl text-white hover:bg-white hover:text-blue-600 transition-colors duration-200"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-center">
            <VeriGradeLogo size="md" variant="full" />
            <p className="text-sm text-gray-500">
              © 2024 VeriGrade, Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

