'use client';

import { motion } from 'framer-motion';
import VeriGradeLogo from '../../components/VeriGradeLogo';
import { 
  DocumentTextIcon,
  ScaleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function TermsOfServicePage() {
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
              <a href="/terms" className="text-blue-600 font-semibold">Terms</a>
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
                <ScaleIcon className="h-10 w-10 text-white" />
              </div>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl"
            >
              Terms of{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Service
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg leading-8 text-gray-700 max-w-3xl mx-auto font-medium"
            >
              Please read these Terms of Service carefully before using VeriGrade. By using our service, you agree to be bound by these terms.
            </motion.p>
          </div>
        </div>
      </div>

      {/* Terms Content */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8">
              <div className="flex">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400 mr-3 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Last Updated: January 15, 2024</h3>
                  <p className="text-gray-700 mt-1">These terms are effective as of the date above and govern your use of VeriGrade services.</p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              By accessing or using VeriGrade's services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using our services.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Description of Service</h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              VeriGrade provides AI-powered bookkeeping and financial management services, including but not limited to transaction categorization, receipt processing, invoice generation, and financial reporting.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">3. User Accounts</h2>
            <div className="space-y-4 mb-6">
              <div className="flex items-start">
                <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <p className="text-gray-700">You must provide accurate and complete information when creating an account</p>
              </div>
              <div className="flex items-start">
                <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <p className="text-gray-700">You are responsible for maintaining the confidentiality of your account credentials</p>
              </div>
              <div className="flex items-start">
                <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <p className="text-gray-700">You must notify us immediately of any unauthorized use of your account</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Acceptable Use</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">You agree not to use VeriGrade services to:</p>
            <ul className="list-disc list-inside space-y-2 mb-6 text-gray-700">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on the rights of others</li>
              <li>Transmit harmful or malicious code</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use the service for any illegal or unauthorized purpose</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Payment Terms</h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Subscription fees are billed in advance on a monthly or annual basis. All fees are non-refundable except as required by law. We reserve the right to change our pricing with 30 days' notice.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Intellectual Property</h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              VeriGrade and its licensors own all rights, title, and interest in and to the service, including all intellectual property rights. You retain ownership of your data but grant us a license to process it to provide our services.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Data and Privacy</h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information. We implement industry-standard security measures to protect your data.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Limitation of Liability</h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              To the maximum extent permitted by law, VeriGrade shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or business opportunities.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">9. Termination</h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Either party may terminate this agreement at any time. Upon termination, your right to use the service will cease immediately. We may terminate your account if you violate these terms.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">10. Changes to Terms</h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              We reserve the right to modify these terms at any time. We will notify users of material changes via email or through the service. Your continued use constitutes acceptance of the modified terms.
            </p>

            <div className="mt-12 p-6 bg-blue-50 rounded-2xl">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Questions About These Terms?</h3>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms of Service, please contact our legal team.
              </p>
              <a 
                href="mailto:legal@verigrade.com"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                Contact Legal Team
                <DocumentTextIcon className="ml-2 h-5 w-5" />
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