'use client';

import { motion } from 'framer-motion';
import VeriGradeLogo from '../../components/VeriGradeLogo';
import { 
  DocumentTextIcon,
  CodeBracketIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

export default function LicensesPage() {
  const openSourceLicenses = [
    {
      name: 'MIT License',
      packages: ['React', 'Next.js', 'Framer Motion', 'Tailwind CSS'],
      description: 'A permissive license allowing commercial use, modification, and distribution.'
    },
    {
      name: 'Apache License 2.0',
      packages: ['TensorFlow.js', 'Google Fonts'],
      description: 'A permissive license with patent protection and explicit grant of patent rights.'
    },
    {
      name: 'BSD 3-Clause',
      packages: ['Heroicons', 'Various utilities'],
      description: 'A permissive license with minimal restrictions on use and distribution.'
    },
    {
      name: 'ISC License',
      packages: ['Node.js modules', 'Build tools'],
      description: 'A permissive license similar to MIT and BSD licenses.'
    }
  ];

  const proprietaryComponents = [
    {
      name: 'VeriGrade AI Engine',
      description: 'Proprietary machine learning algorithms for financial data processing',
      license: 'VeriGrade Proprietary License'
    },
    {
      name: 'Advanced Categorization System',
      description: 'Custom AI models for transaction categorization and pattern recognition',
      license: 'VeriGrade Proprietary License'
    },
    {
      name: 'Security Framework',
      description: 'Enterprise-grade security and encryption systems',
      license: 'VeriGrade Proprietary License'
    },
    {
      name: 'Integration APIs',
      description: 'Custom API endpoints and integration connectors',
      license: 'VeriGrade Proprietary License'
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
              <a href="/licenses" className="text-blue-600 font-semibold">Licenses</a>
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
                <CodeBracketIcon className="h-10 w-10 text-white" />
              </div>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl"
            >
              Open Source{' '}
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Licenses
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg leading-8 text-gray-700 max-w-3xl mx-auto font-medium"
            >
              VeriGrade is built on open source technologies and contributes back to the community. Learn about the licenses we use and our commitment to open source.
            </motion.p>
          </div>
        </div>
      </div>

      {/* Open Source Licenses */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Open Source Components
            </h2>
            <p className="mt-4 text-lg text-gray-700">
              We use and contribute to various open source projects. Here are the main licenses and components.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {openSourceLicenses.map((license, index) => (
              <motion.div
                key={license.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center mr-4">
                    <DocumentTextIcon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{license.name}</h3>
                </div>
                
                <p className="text-gray-700 mb-6 leading-relaxed">{license.description}</p>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">Used in:</h4>
                  <div className="flex flex-wrap gap-2">
                    {license.packages.map((pkg, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {pkg}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Proprietary Components */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Proprietary Components
            </h2>
            <p className="mt-4 text-lg text-gray-700">
              VeriGrade's core AI and security components are proprietary and protected by our own licenses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {proprietaryComponents.map((component, index) => (
              <motion.div
                key={component.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8"
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4">
                    <CodeBracketIcon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{component.name}</h3>
                </div>
                
                <p className="text-gray-700 mb-4 leading-relaxed">{component.description}</p>
                
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">{component.license}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* License Compliance */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              License Compliance
            </h2>
            <p className="mt-4 text-lg text-gray-700">
              We are committed to respecting and complying with all open source licenses.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="space-y-6">
              <div className="flex items-start">
                <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">License Attribution</h3>
                  <p className="text-gray-700">
                    All open source components are properly attributed with their respective license information.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Source Code Availability</h3>
                  <p className="text-gray-700">
                    Where required by license terms, source code modifications are made available to the community.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Regular Audits</h3>
                  <p className="text-gray-700">
                    We conduct regular audits to ensure compliance with all license terms and conditions.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Contributions</h3>
                  <p className="text-gray-700">
                    We actively contribute back to open source projects that we use and benefit from.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* License Files */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              License Files
            </h2>
            <p className="mt-4 text-lg text-gray-700">
              Access the complete license files and attribution notices for all components.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <DocumentTextIcon className="h-8 w-8 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Third-Party Licenses</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Complete list of all third-party open source components and their licenses.
              </p>
              <a href="#" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
                View License File →
              </a>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <CodeBracketIcon className="h-8 w-8 text-green-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Source Code</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Access to source code modifications for components that require it.
              </p>
              <a href="#" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
                View Source Code →
              </a>
            </div>
          </div>

          <div className="mt-8 p-6 bg-blue-50 rounded-xl">
            <div className="flex items-start">
              <InformationCircleIcon className="h-6 w-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">License Questions?</h3>
                <p className="text-sm text-gray-700 mb-4">
                  If you have questions about our use of open source components or licensing, please contact our legal team.
                </p>
                <a 
                  href="mailto:legal@verigrade.com"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                >
                  Contact Legal Team
                </a>
              </div>
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

