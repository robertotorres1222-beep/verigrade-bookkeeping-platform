'use client';

import { useState } from 'react';
import { 
  QuestionMarkCircleIcon,
  BookOpenIcon,
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [categories] = useState([
    { id: 'all', name: 'All Topics', count: 45 },
    { id: 'getting-started', name: 'Getting Started', count: 12 },
    { id: 'account-setup', name: 'Account Setup', count: 8 },
    { id: 'transactions', name: 'Transactions', count: 10 },
    { id: 'invoicing', name: 'Invoicing', count: 7 },
    { id: 'reports', name: 'Reports', count: 5 },
    { id: 'integrations', name: 'Integrations', count: 3 }
  ]);

  const [faqs] = useState([
    {
      id: 'getting-started',
      question: 'How do I get started with VeriGrade?',
      answer: 'Getting started is easy! Simply sign up for an account, complete your business profile, and connect your bank accounts. Our setup wizard will guide you through the process step by step.',
      category: 'getting-started'
    },
    {
      id: 'account-setup',
      question: 'How do I connect my bank account?',
      answer: 'Go to Settings > Bank Accounts and click "Add Account". We use bank-level security to securely connect your accounts. The process takes just a few minutes and requires your online banking credentials.',
      category: 'account-setup'
    },
    {
      id: 'transactions',
      question: 'How do I categorize transactions?',
      answer: 'Transactions can be categorized automatically by our AI or manually by you. To manually categorize, click on any transaction and select the appropriate category from the dropdown menu.',
      category: 'transactions'
    },
    {
      id: 'invoicing',
      question: 'How do I create and send invoices?',
      answer: 'Navigate to the Invoicing section, click "Create Invoice", add your customer details and line items, then click "Send". Your customer will receive a professional invoice via email.',
      category: 'invoicing'
    },
    {
      id: 'reports',
      question: 'What financial reports are available?',
      answer: 'We offer comprehensive reports including Profit & Loss, Balance Sheet, Cash Flow, Tax Reports, and custom reports. All reports can be exported to PDF or Excel format.',
      category: 'reports'
    },
    {
      id: 'integrations',
      question: 'Which accounting software can I integrate with?',
      answer: 'VeriGrade integrates with QuickBooks, Xero, Sage, and other popular accounting platforms. You can also export data in standard formats for any accounting software.',
      category: 'integrations'
    }
  ]);

  const [guides] = useState([
    {
      title: 'Complete Setup Guide',
      description: 'Step-by-step guide to setting up your VeriGrade account and connecting your first bank account.',
      duration: '15 min read',
      category: 'Getting Started',
      icon: BookOpenIcon
    },
    {
      title: 'Understanding Transactions',
      description: 'Learn how to manage, categorize, and reconcile transactions effectively.',
      duration: '10 min read',
      category: 'Transactions',
      icon: DocumentTextIcon
    },
    {
      title: 'Creating Professional Invoices',
      description: 'Master the invoicing system to get paid faster and maintain professional relationships.',
      duration: '12 min read',
      category: 'Invoicing',
      icon: CheckCircleIcon
    },
    {
      title: 'Financial Reporting Basics',
      description: 'Understand your business finances with comprehensive reporting features.',
      duration: '8 min read',
      category: 'Reports',
      icon: BookOpenIcon
    }
  ]);

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Help &
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> Support</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              Find answers to your questions, learn how to use VeriGrade effectively, 
              and get the support you need to manage your business finances.
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search for help articles, guides, or FAQs..."
              className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Category</h2>
            <p className="text-lg text-gray-600">Find help topics organized by feature area</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  selectedCategory === category.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="text-sm font-medium">{category.name}</div>
                <div className="text-xs text-gray-500 mt-1">{category.count} articles</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600">Quick answers to common questions</p>
          </div>

          <div className="space-y-6">
            {filteredFaqs.map((faq) => (
              <div key={faq.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
                <div className="mt-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {categories.find(c => c.id === faq.category)?.name || faq.category}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12">
              <QuestionMarkCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No articles found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or browse by category.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Guides Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Helpful Guides</h2>
            <p className="text-lg text-gray-600">Step-by-step tutorials to master VeriGrade</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {guides.map((guide, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start mb-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mr-4">
                    <guide.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{guide.title}</h3>
                    <p className="text-gray-600 mb-3">{guide.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{guide.duration}</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {guide.category}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-500 transition-colors flex items-center justify-center gap-2">
                  Read Guide
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16 bg-blue-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Still Need Help?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Our support team is here to help you succeed. Get in touch through any of these channels.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6">
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Chat</h3>
              <p className="text-gray-600 mb-4">Get instant help from our support team</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-500 transition-colors">
                Start Chat
              </button>
            </div>
            <div className="bg-white rounded-lg p-6">
              <EnvelopeIcon className="h-8 w-8 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Support</h3>
              <p className="text-gray-600 mb-4">Send us a detailed message</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-500 transition-colors">
                Send Email
              </button>
            </div>
            <div className="bg-white rounded-lg p-6">
              <VideoCameraIcon className="h-8 w-8 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Video Call</h3>
              <p className="text-gray-600 mb-4">Schedule a screen sharing session</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-500 transition-colors">
                Schedule Call
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
