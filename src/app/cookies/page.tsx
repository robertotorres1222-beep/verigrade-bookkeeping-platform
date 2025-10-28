'use client';

import { motion } from 'framer-motion';
import VeriGradeLogo from '../../components/VeriGradeLogo';
import { 
  CakeIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

export default function CookiePolicyPage() {
  const cookieTypes = [
    {
      name: 'Essential Cookies',
      description: 'These cookies are necessary for the website to function and cannot be switched off.',
      examples: ['Authentication', 'Security', 'Load balancing'],
      required: true
    },
    {
      name: 'Analytics Cookies',
      description: 'These cookies help us understand how visitors interact with our website.',
      examples: ['Google Analytics', 'User behavior tracking', 'Performance monitoring'],
      required: false
    },
    {
      name: 'Functional Cookies',
      description: 'These cookies enable enhanced functionality and personalization.',
      examples: ['Language preferences', 'User settings', 'Chat widgets'],
      required: false
    },
    {
      name: 'Marketing Cookies',
      description: 'These cookies are used to track visitors across websites for advertising purposes.',
      examples: ['Ad targeting', 'Social media integration', 'Email marketing'],
      required: false
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
              <a href="/cookies" className="text-blue-600 font-semibold">Cookies</a>
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
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-3xl flex items-center justify-center shadow-lg">
                <CakeIcon className="h-10 w-10 text-white" />
              </div>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl"
            >
              Cookie{' '}
              <span className="bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                Policy
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg leading-8 text-gray-700 max-w-3xl mx-auto font-medium"
            >
              Learn about how VeriGrade uses cookies and similar technologies to enhance your experience and improve our services.
            </motion.p>
          </div>
        </div>
      </div>

      {/* Cookie Types */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Types of Cookies We Use
            </h2>
            <p className="mt-4 text-lg text-gray-700">
              We use different types of cookies to provide you with the best possible experience on our website.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {cookieTypes.map((cookie, index) => (
              <motion.div
                key={cookie.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`rounded-2xl shadow-lg border p-8 ${
                  cookie.required 
                    ? 'border-red-200 bg-red-50' 
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{cookie.name}</h3>
                  {cookie.required && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Required
                    </span>
                  )}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">{cookie.description}</p>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">Examples:</h4>
                  <ul className="space-y-1">
                    {cookie.examples.map((example, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cookie Settings */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Manage Your Cookie Preferences
            </h2>
            <p className="mt-4 text-lg text-gray-700">
              You have control over which cookies you accept. Manage your preferences below.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="space-y-6">
                {cookieTypes.map((cookie, index) => (
                  <div key={cookie.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{cookie.name}</h3>
                      <p className="text-sm text-gray-600">{cookie.description}</p>
                    </div>
                    <div className="ml-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          defaultChecked={cookie.required}
                          disabled={cookie.required}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 p-6 bg-blue-50 rounded-xl">
                <div className="flex items-start">
                  <InformationCircleIcon className="h-6 w-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Cookie Settings Notice</h3>
                    <p className="text-sm text-gray-700">
                      Essential cookies are required for the website to function properly and cannot be disabled. 
                      You can manage your preferences for other cookie types, but some features may not work if you disable them.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <button className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors duration-200">
                  Save Cookie Preferences
                </button>
                <button className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors duration-200">
                  Accept All Cookies
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Browser Settings */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Browser Cookie Settings
            </h2>
            <p className="mt-4 text-lg text-gray-700">
              You can also manage cookies directly through your browser settings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">GC</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Google Chrome</h3>
              <p className="text-sm text-gray-600 mb-4">Settings → Privacy and security → Cookies</p>
              <a href="#" className="text-blue-600 text-sm font-medium hover:text-blue-700">
                Learn More →
              </a>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">FF</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Firefox</h3>
              <p className="text-sm text-gray-600 mb-4">Options → Privacy & Security → Cookies</p>
              <a href="#" className="text-blue-600 text-sm font-medium hover:text-blue-700">
                Learn More →
              </a>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">S</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Safari</h3>
              <p className="text-sm text-gray-600 mb-4">Preferences → Privacy → Manage Cookies</p>
              <a href="#" className="text-blue-600 text-sm font-medium hover:text-blue-700">
                Learn More →
              </a>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">E</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Edge</h3>
              <p className="text-sm text-gray-600 mb-4">Settings → Cookies and permissions</p>
              <a href="#" className="text-blue-600 text-sm font-medium hover:text-blue-700">
                Learn More →
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
