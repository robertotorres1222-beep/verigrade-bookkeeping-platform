'use client';

import { motion } from 'framer-motion';
import VeriGradeLogo from '../../components/VeriGradeLogo';
import { 
  BuildingOfficeIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  GlobeAltIcon,
  ServerIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';

export default function EnterprisePage() {
  const enterpriseFeatures = [
    {
      title: 'Unlimited Transactions',
      description: 'Process unlimited transactions without restrictions. Scale your operations without worrying about limits.',
      icon: ChartBarIcon,
      details: [
        'No monthly transaction limits',
        'Bulk processing capabilities',
        'High-volume data handling',
        'Scalable infrastructure'
      ]
    },
    {
      title: 'Custom AI Models',
      description: 'Train custom AI models specific to your industry and business requirements.',
      icon: Cog6ToothIcon,
      details: [
        'Industry-specific categorization',
        'Custom rule engines',
        'Machine learning training',
        'Continuous model improvement'
      ]
    },
    {
      title: 'White-Label Solution',
      description: 'Fully customizable platform with your branding and domain.',
      icon: BuildingOfficeIcon,
      details: [
        'Custom branding and themes',
        'Your domain name',
        'White-label mobile apps',
        'API integration support'
      ]
    },
    {
      title: 'Dedicated Support',
      description: '24/7 dedicated support team with direct access to our engineering team.',
      icon: UserGroupIcon,
      details: [
        '24/7 phone and chat support',
        'Dedicated account manager',
        'Direct engineering access',
        'Priority issue resolution'
      ]
    },
    {
      title: 'Advanced Integrations',
      description: 'Connect with enterprise systems including ERP, CRM, and custom applications.',
      icon: ServerIcon,
      details: [
        'ERP system integration',
        'Custom API development',
        'Data warehouse connections',
        'Third-party tool integration'
      ]
    },
    {
      title: 'Custom Deployment',
      description: 'Deploy on-premise, private cloud, or hybrid environments based on your security requirements.',
      icon: LockClosedIcon,
      details: [
        'On-premise deployment',
        'Private cloud options',
        'Hybrid deployment models',
        'Compliance-ready infrastructure'
      ]
    }
  ];

  const enterpriseBenefits = [
    {
      title: 'Cost Savings',
      percentage: '60%',
      description: 'Average reduction in bookkeeping costs compared to traditional solutions'
    },
    {
      title: 'Time Efficiency',
      percentage: '80%',
      description: 'Reduction in time spent on manual bookkeeping tasks'
    },
    {
      title: 'Accuracy Improvement',
      percentage: '99.9%',
      description: 'AI-powered accuracy rate for transaction categorization'
    },
    {
      title: 'Compliance Rate',
      percentage: '100%',
      description: 'Compliance with financial regulations and standards'
    }
  ];

  const securityFeatures = [
    'SOC 2 Type II Certified',
    'GDPR & CCPA Compliant',
    'HIPAA Ready',
    'ISO 27001 Compliant',
    'End-to-End Encryption',
    'Multi-Factor Authentication',
    'Role-Based Access Control',
    'Audit Trail & Logging'
  ];

  const industries = [
    { name: 'Healthcare', description: 'HIPAA-compliant bookkeeping for medical practices' },
    { name: 'Financial Services', description: 'Secure financial data management for banks and investment firms' },
    { name: 'Manufacturing', description: 'Complex inventory and supply chain bookkeeping' },
    { name: 'Retail', description: 'Multi-location retail chain financial management' },
    { name: 'Technology', description: 'SaaS and software company financial operations' },
    { name: 'Real Estate', description: 'Property management and real estate investment accounting' }
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
              <a href="/features" className="text-gray-600 hover:text-gray-900">Features</a>
              <a href="/enterprise" className="text-blue-600 font-semibold">Enterprise</a>
              <a href="/contact" className="text-gray-600 hover:text-gray-900">Contact</a>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-center mb-8"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center shadow-lg">
                <BuildingOfficeIcon className="h-10 w-10 text-white" />
              </div>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl"
            >
              Enterprise{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Solutions
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto"
            >
              Scale your bookkeeping operations with our enterprise-grade AI platform. Custom solutions designed for large organizations with complex financial needs.
            </motion.p>
          </div>
        </div>
      </div>

      {/* Enterprise Features */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Enterprise-Grade Features
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need to manage complex financial operations at scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {enterpriseFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 mb-6">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.details.map((detail, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Benefits */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Proven Results
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Enterprise customers see measurable improvements across key metrics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {enterpriseBenefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center bg-white rounded-2xl shadow-lg p-8"
              >
                <div className="text-5xl font-bold text-blue-600 mb-4">{benefit.percentage}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-6">
                Security & Compliance
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Built with enterprise security requirements in mind. We maintain the highest standards of data protection and regulatory compliance.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {securityFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-8 text-white"
            >
              <ShieldCheckIcon className="h-16 w-16 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Bank-Level Security</h3>
              <p className="text-blue-100 mb-6">
                Your financial data is protected by the same security standards used by major financial institutions.
              </p>
              <div className="space-y-3">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-400 mr-3" />
                  <span>256-bit AES encryption</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-400 mr-3" />
                  <span>Regular security audits</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-400 mr-3" />
                  <span>Compliance monitoring</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Industry Solutions
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Tailored solutions for specific industry requirements and compliance needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {industries.map((industry, index) => (
              <motion.div
                key={industry.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-6">
                  <GlobeAltIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{industry.name}</h3>
                <p className="text-gray-600">{industry.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Enterprise */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Transform Your Enterprise?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Let our enterprise team show you how VeriGrade can revolutionize your bookkeeping operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <a
                href="tel:+1-555-123-4567"
                className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-blue-600 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                <PhoneIcon className="h-5 w-5 mr-3" />
                Call Enterprise Sales
              </a>
              <a
                href="mailto:enterprise@verigrade.com"
                className="inline-flex items-center px-8 py-4 border-2 border-white text-lg font-medium rounded-xl text-white hover:bg-white hover:text-blue-600 transition-colors duration-200"
              >
                <EnvelopeIcon className="h-5 w-5 mr-3" />
                Email Enterprise Team
              </a>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <ClockIcon className="h-8 w-8 text-blue-200 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">24/7 Support</h3>
                <p className="text-blue-100">Round-the-clock enterprise support</p>
              </div>
              <div className="text-center">
                <UserGroupIcon className="h-8 w-8 text-blue-200 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Dedicated Team</h3>
                <p className="text-blue-100">Personal account manager and support team</p>
              </div>
              <div className="text-center">
                <Cog6ToothIcon className="h-8 w-8 text-blue-200 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Custom Setup</h3>
                <p className="text-blue-100">Tailored implementation for your needs</p>
              </div>
            </div>
          </motion.div>
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

