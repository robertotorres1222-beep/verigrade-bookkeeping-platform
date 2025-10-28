'use client';

import { motion } from 'framer-motion';
import VeriGradeLogo from '../../components/VeriGradeLogo';
import { 
  ShieldCheckIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function PrivacyPolicyPage() {
  const contactInfo = [
    {
      title: 'Privacy Team Email',
      value: 'privacy@verigrade.com',
      description: 'Direct contact for privacy concerns',
      icon: EnvelopeIcon
    },
    {
      title: 'Privacy Hotline',
      value: '+1 (555) 123-PRIV',
      description: 'Call our dedicated privacy team',
      icon: PhoneIcon
    },
    {
      title: 'Data Protection Officer',
      value: 'dpo@verigrade.com',
      description: 'Contact our DPO for GDPR matters',
      icon: ShieldCheckIcon
    }
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
              <a href="/privacy" className="text-blue-600 font-semibold">Privacy</a>
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
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-lg">
                <ShieldCheckIcon className="h-10 w-10 text-white" />
              </div>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl"
            >
              Privacy{' '}
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Policy
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg leading-8 text-gray-700 max-w-3xl mx-auto font-medium"
            >
              Your privacy is our priority. Learn how we protect and handle your personal information with transparency and care.
            </motion.p>
          </div>
        </div>
      </div>

      {/* Contact Our Privacy Team */}
      <section className="py-16 bg-blue-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Contact Our Privacy Team
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Have questions about your privacy or data? Our dedicated privacy team is here to help.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contactInfo.map((contact, index) => (
              <motion.div
                key={contact.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center hover:shadow-xl transition-shadow duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <contact.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{contact.title}</h3>
                <p className="text-2xl font-bold text-blue-600 mb-4">{contact.value}</p>
                <p className="text-gray-600">{contact.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Information We Collect</h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support. This may include your name, email address, phone number, and business information.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">How We Use Your Information</h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              We use the information we collect to provide, maintain, and improve our services, process transactions, communicate with you, and ensure the security of our platform.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Security</h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All data is encrypted in transit and at rest.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Rights</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Right to Access</h3>
                  <p className="text-gray-700">Request a copy of your personal data</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Right to Rectification</h3>
                  <p className="text-gray-700">Correct inaccurate personal data</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Right to Erasure</h3>
                  <p className="text-gray-700">Request deletion of your personal data</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Right to Portability</h3>
                  <p className="text-gray-700">Export your data in a structured format</p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-12">Cookies and Tracking</h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, and improve our services. You can control cookie preferences through your browser settings.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">Updates to This Policy</h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
            </p>

            <div className="mt-12 p-6 bg-blue-50 rounded-2xl">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Questions About Privacy?</h3>
              <p className="text-gray-700 mb-4">
                If you have any questions about this Privacy Policy or our data practices, please don't hesitate to contact our privacy team.
              </p>
              <a 
                href="mailto:privacy@verigrade.com"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                Contact Our Privacy Team
                <EnvelopeIcon className="ml-2 h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-center">
            <VeriGradeLogo size="md" variant="full" />
            <p className="text-sm text-gray-700 font-medium">
              © 2024 VeriGrade, Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}