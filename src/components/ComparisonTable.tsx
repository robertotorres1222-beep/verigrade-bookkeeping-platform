'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Feature {
  name: string;
  verigrade: boolean | string;
  quickbooks: boolean | string;
  xero: boolean | string;
  zeni: boolean | string;
  category: string;
}

const features: Feature[] = [
  // Core Features
  { name: 'AI-Powered Bookkeeping', verigrade: true, quickbooks: false, xero: false, zeni: true, category: 'Core' },
  { name: 'Real-time Dashboard', verigrade: true, quickbooks: true, xero: true, zeni: true, category: 'Core' },
  { name: 'Bank Integration', verigrade: true, quickbooks: true, xero: true, zeni: true, category: 'Core' },
  { name: 'Invoice Management', verigrade: true, quickbooks: true, xero: true, zeni: true, category: 'Core' },
  { name: 'Expense Tracking', verigrade: true, quickbooks: true, xero: true, zeni: true, category: 'Core' },
  { name: 'Financial Reporting', verigrade: true, quickbooks: true, xero: true, zeni: true, category: 'Core' },
  
  // Advanced Features
  { name: 'Multi-Currency Support', verigrade: true, quickbooks: 'Limited', xero: true, zeni: true, category: 'Advanced' },
  { name: 'Custom Report Builder', verigrade: true, quickbooks: false, xero: false, zeni: false, category: 'Advanced' },
  { name: 'Document Management', verigrade: true, quickbooks: false, xero: false, zeni: false, category: 'Advanced' },
  { name: 'Workflow Automation', verigrade: true, quickbooks: false, xero: false, zeni: false, category: 'Advanced' },
  { name: 'Advanced Security (2FA/SSO)', verigrade: true, quickbooks: 'Basic', xero: 'Basic', zeni: true, category: 'Advanced' },
  { name: 'AI Cash Flow Forecasting', verigrade: true, quickbooks: false, xero: false, zeni: true, category: 'Advanced' },
  
  // Mobile Features
  { name: 'Mobile App', verigrade: true, quickbooks: true, xero: true, zeni: true, category: 'Mobile' },
  { name: 'Receipt Scanning', verigrade: true, quickbooks: true, xero: true, zeni: true, category: 'Mobile' },
  { name: 'Mileage Tracking', verigrade: true, quickbooks: true, xero: true, zeni: false, category: 'Mobile' },
  { name: 'Voice Notes', verigrade: true, quickbooks: false, xero: false, zeni: false, category: 'Mobile' },
  { name: 'Barcode Scanning', verigrade: true, quickbooks: false, xero: false, zeni: false, category: 'Mobile' },
  { name: 'Offline Mode', verigrade: true, quickbooks: false, xero: false, zeni: false, category: 'Mobile' },
  
  // Integrations
  { name: '500+ App Integrations', verigrade: true, quickbooks: true, xero: true, zeni: false, category: 'Integrations' },
  { name: 'Zapier Integration', verigrade: true, quickbooks: false, xero: false, zeni: false, category: 'Integrations' },
  { name: 'QuickBooks Import', verigrade: true, quickbooks: 'N/A', xero: true, zeni: false, category: 'Integrations' },
  { name: 'Xero Import', verigrade: true, quickbooks: true, xero: 'N/A', zeni: false, category: 'Integrations' },
  { name: 'E-commerce Integration', verigrade: true, quickbooks: true, xero: true, zeni: false, category: 'Integrations' },
  { name: 'Custom Webhooks', verigrade: true, quickbooks: false, xero: false, zeni: false, category: 'Integrations' },
  
  // Pricing
  { name: 'Starting Price', verigrade: '$29/mo', quickbooks: '$30/mo', xero: '$13/mo', zeni: '$399/mo', category: 'Pricing' },
  { name: 'Professional Plan', verigrade: '$79/mo', quickbooks: '$90/mo', xero: '$37/mo', zeni: '$799/mo', category: 'Pricing' },
  { name: 'Enterprise Plan', verigrade: 'Custom', quickbooks: '$200+/mo', xero: '$70+/mo', zeni: '$1299+/mo', category: 'Pricing' },
  { name: 'Free Trial', verigrade: '14 days', quickbooks: '30 days', xero: '30 days', zeni: 'No trial', category: 'Pricing' },
];

const categories = ['Core', 'Advanced', 'Mobile', 'Integrations', 'Pricing'];

export default function ComparisonTable() {
  const renderFeatureValue = (value: boolean | string) => {
    if (value === true) {
      return <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />;
    } else if (value === false) {
      return <XMarkIcon className="h-5 w-5 text-red-500 mx-auto" />;
    } else {
      return <span className="text-sm text-gray-600">{value}</span>;
    }
  };

  return (
    <div className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How VeriGrade Compares
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See why thousands of businesses choose VeriGrade over QuickBooks, Xero, and Zeni AI
          </p>
        </motion.div>

        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Features
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50">
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-blue-600">VeriGrade</span>
                        <span className="text-xs text-blue-500">You are here</span>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      QuickBooks
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Xero
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zeni AI
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category) => (
                    <React.Fragment key={category}>
                      <tr className="bg-gray-50">
                        <td colSpan={5} className="px-6 py-3 text-sm font-semibold text-gray-900">
                          {category}
                        </td>
                      </tr>
                      {features
                        .filter(feature => feature.category === category)
                        .map((feature, index) => (
                          <motion.tr
                            key={feature.name}
                            className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            viewport={{ once: true }}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {feature.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center bg-blue-50">
                              {renderFeatureValue(feature.verigrade)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              {renderFeatureValue(feature.quickbooks)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              {renderFeatureValue(feature.xero)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              {renderFeatureValue(feature.zeni)}
                            </td>
                          </motion.tr>
                        ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <motion.div 
          className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">25+</div>
            <p className="text-sm text-gray-600">More features than QuickBooks</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">60%</div>
            <p className="text-sm text-gray-600">Cheaper than Zeni AI</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">100%</div>
            <p className="text-sm text-gray-600">More AI features than Xero</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">∞</div>
            <p className="text-sm text-gray-600">Customization options</p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Ready to experience the difference?
            </h3>
            <p className="text-lg mb-6 opacity-90">
              Join thousands of businesses who've made the switch to VeriGrade
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Start Free Trial
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                View Live Demo
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
