'use client';

import { useState } from 'react';
import { 
  ShieldCheckIcon,
  InformationCircleIcon,
  CogIcon,
  EyeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function CookiePolicyPage() {
  const [cookieTypes] = useState([
    {
      name: 'Essential Cookies',
      description: 'These cookies are necessary for the website to function and cannot be switched off in our systems.',
      examples: ['Authentication tokens', 'Security preferences', 'Load balancing'],
      purpose: 'Required for basic website functionality',
      retention: 'Session or until logout',
      canDisable: false
    },
    {
      name: 'Performance Cookies',
      description: 'These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site.',
      examples: ['Google Analytics', 'Page load times', 'Error tracking'],
      purpose: 'Analytics and performance monitoring',
      retention: 'Up to 2 years',
      canDisable: true
    },
    {
      name: 'Functional Cookies',
      description: 'These cookies enable enhanced functionality and personalization, such as remembering your preferences.',
      examples: ['Language settings', 'Theme preferences', 'Form data'],
      purpose: 'Enhanced user experience',
      retention: 'Up to 1 year',
      canDisable: true
    },
    {
      name: 'Marketing Cookies',
      description: 'These cookies may be set through our site by our advertising partners to build a profile of your interests.',
      examples: ['Targeted advertising', 'Social media integration', 'Remarketing'],
      purpose: 'Personalized marketing',
      retention: 'Up to 2 years',
      canDisable: true
    }
  ]);

  const [thirdPartyServices] = useState([
    {
      name: 'Google Analytics',
      purpose: 'Website analytics and performance monitoring',
      cookies: ['_ga', '_gid', '_gat'],
      privacyPolicy: 'https://policies.google.com/privacy'
    },
    {
      name: 'Stripe',
      purpose: 'Payment processing and fraud prevention',
      cookies: ['__stripe_mid', '__stripe_sid'],
      privacyPolicy: 'https://stripe.com/privacy'
    },
    {
      name: 'Plaid',
      purpose: 'Bank account verification and transaction data',
      cookies: ['plaid_link_token'],
      privacyPolicy: 'https://plaid.com/legal/'
    },
    {
      name: 'HubSpot',
      purpose: 'Customer relationship management and marketing',
      cookies: ['__hssc', '__hssrc', '__hstc'],
      privacyPolicy: 'https://legal.hubspot.com/privacy-policy'
    }
  ]);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Cookie
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> Policy</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              Learn about how VeriGrade uses cookies and similar technologies to enhance your experience, 
              analyze usage, and provide personalized services.
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Last updated: January 15, 2024
            </p>
          </div>
        </div>
      </section>

      {/* What Are Cookies Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-50 rounded-xl p-8 mb-12">
            <div className="flex items-start">
              <InformationCircleIcon className="h-6 w-6 text-blue-600 mt-1 mr-3" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies?</h2>
                <p className="text-gray-700 mb-4">
                  Cookies are small text files that are placed on your computer or mobile device when you visit a website. 
                  They are widely used to make websites work more efficiently and to provide information to website owners.
                </p>
                <p className="text-gray-700">
                  VeriGrade uses cookies and similar technologies to enhance your experience, analyze how our services are used, 
                  and provide personalized features. This policy explains how we use these technologies and your choices regarding them.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Types of Cookies */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Types of Cookies We Use</h2>
            <p className="text-lg text-gray-600">Understanding the different categories of cookies and their purposes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {cookieTypes.map((cookie, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start mb-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mr-4">
                    {cookie.canDisable ? (
                      <CogIcon className="h-6 w-6 text-blue-600" />
                    ) : (
                      <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-900">{cookie.name}</h3>
                      {cookie.canDisable ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Optional
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mt-2">{cookie.description}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Purpose:</h4>
                    <p className="text-sm text-gray-600">{cookie.purpose}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Examples:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {cookie.examples.map((example, exampleIndex) => (
                        <li key={exampleIndex} className="flex items-center">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Retention:</h4>
                    <p className="text-sm text-gray-600">{cookie.retention}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Third-Party Services */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Third-Party Services</h2>
            <p className="text-lg text-gray-600">Cookies from trusted partners that help us provide better services</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Our Third-Party Partners</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {thirdPartyServices.map((service, index) => (
                <div key={index} className="px-6 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{service.name}</h4>
                    <a
                      href={service.privacyPolicy}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                    >
                      Privacy Policy →
                    </a>
                  </div>
                  <p className="text-gray-600 mb-3">{service.purpose}</p>
                  <div>
                    <h5 className="text-sm font-semibold text-gray-900 mb-1">Cookies Used:</h5>
                    <div className="flex flex-wrap gap-2">
                      {service.cookies.map((cookie, cookieIndex) => (
                        <span
                          key={cookieIndex}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {cookie}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Managing Cookies */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Managing Your Cookie Preferences</h2>
            <p className="text-lg text-gray-600">You have control over the cookies we use</p>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start">
                <EyeIcon className="h-6 w-6 text-blue-600 mt-1 mr-3" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Cookie Settings</h3>
                  <p className="text-gray-600 mb-4">
                    You can manage your cookie preferences through our cookie settings panel. 
                    You can enable or disable different categories of cookies based on your preferences.
                  </p>
                  <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-500 transition-colors">
                    Manage Cookie Settings
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start">
                <CogIcon className="h-6 w-6 text-blue-600 mt-1 mr-3" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Browser Settings</h3>
                  <p className="text-gray-600 mb-4">
                    You can also control cookies through your browser settings. Most browsers allow you to:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Block all cookies</li>
                    <li>Block third-party cookies</li>
                    <li>Delete existing cookies</li>
                    <li>Receive notifications when cookies are set</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mt-1 mr-3" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Important Notice</h3>
                  <p className="text-gray-700">
                    Please note that disabling certain cookies may affect the functionality of our website. 
                    Essential cookies cannot be disabled as they are necessary for the website to function properly. 
                    If you disable optional cookies, some features may not work as expected.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-blue-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Questions About Our Cookie Policy?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            If you have any questions about how we use cookies or this policy, 
            please don't hesitate to contact us.
          </p>
          <a
            href="/contact"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </section>
    </div>
  );
}
