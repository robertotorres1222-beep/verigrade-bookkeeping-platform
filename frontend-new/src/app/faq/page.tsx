'use client';

import { useState } from 'react';
import { 
  ChevronDownIcon,
  ChevronUpIcon,
  QuestionMarkCircleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(item => item !== index)
        : [...prev, index]
    );
  };

  const faqCategories = [
    {
      title: "Getting Started",
      icon: "🚀",
      questions: [
        {
          q: "How do I get started with VeriGrade?",
          a: "Getting started is easy! Simply sign up for a free 14-day trial, connect your bank accounts, and our AI will begin processing your transactions. No credit card required."
        },
        {
          q: "What information do I need to provide during setup?",
          a: "You'll need basic business information, bank account details for connection, and any existing financial records you'd like to import."
        },
        {
          q: "How long does the setup process take?",
          a: "Most businesses are up and running within 24-48 hours. The initial setup takes about 15 minutes, followed by automated processing."
        },
        {
          q: "Can I import data from other accounting software?",
          a: "Yes! We support imports from QuickBooks, Xero, Sage, and most major accounting platforms. Our team can help with the migration process."
        }
      ]
    },
    {
      title: "Pricing & Billing",
      icon: "💳",
      questions: [
        {
          q: "What's included in the free trial?",
          a: "The free trial includes full access to all features for 14 days. You can process unlimited transactions, access all reports, and use our mobile app."
        },
        {
          q: "How does billing work?",
          a: "We offer flexible monthly and annual billing options. Annual plans include a 20% discount. You can upgrade or downgrade at any time."
        },
        {
          q: "Are there any hidden fees?",
          a: "No hidden fees! Our pricing is transparent. The only additional costs are for premium integrations or custom development services."
        },
        {
          q: "Can I cancel anytime?",
          a: "Yes, you can cancel your subscription at any time. There are no cancellation fees, and you'll retain access until the end of your billing period."
        }
      ]
    },
    {
      title: "Features & Functionality",
      icon: "⚡",
      questions: [
        {
          q: "How accurate is the AI bookkeeping?",
          a: "Our AI achieves 95%+ accuracy in transaction categorization and receipt processing. All entries are reviewed and can be manually adjusted."
        },
        {
          q: "What types of receipts can I capture?",
          a: "You can capture any receipt type including paper receipts, digital receipts, invoices, bills, and expense documents using our mobile app or web interface."
        },
        {
          q: "Does VeriGrade integrate with my bank?",
          a: "Yes, we integrate with over 10,000 banks and financial institutions through secure, bank-grade connections. Your data is encrypted and secure."
        },
        {
          q: "Can I generate financial reports?",
          a: "Absolutely! We provide real-time P&L statements, balance sheets, cash flow reports, and custom analytics dashboards."
        },
        {
          q: "Is there a mobile app?",
          a: "Yes, our mobile app is available for iOS and Android. You can capture receipts, view reports, and manage your finances on the go."
        }
      ]
    },
    {
      title: "Security & Compliance",
      icon: "🔒",
      questions: [
        {
          q: "How secure is my financial data?",
          a: "We use bank-grade security with 256-bit SSL encryption, SOC 2 Type II compliance, and regular security audits. Your data is protected with enterprise-level security."
        },
        {
          q: "Is VeriGrade compliant with accounting standards?",
          a: "Yes, we follow GAAP (Generally Accepted Accounting Principles) and are compliant with tax regulations in all supported countries."
        },
        {
          q: "Who can access my financial data?",
          a: "Only you and authorized team members you invite can access your data. Our staff cannot view your financial information without explicit permission."
        },
        {
          q: "What happens to my data if I cancel?",
          a: "You can export all your data before cancellation. We retain your data for 30 days after cancellation, then permanently delete it according to our privacy policy."
        }
      ]
    },
    {
      title: "Support & Training",
      icon: "🎓",
      questions: [
        {
          q: "What support options are available?",
          a: "We offer 24/7 chat support, email support, phone support for enterprise customers, and comprehensive help documentation."
        },
        {
          q: "Do you provide training?",
          a: "Yes! We offer free onboarding sessions, video tutorials, webinars, and personalized training for enterprise customers."
        },
        {
          q: "How quickly do you respond to support requests?",
          a: "Chat support is available 24/7 with immediate response. Email support typically responds within 2-4 hours during business hours."
        },
        {
          q: "Is there a user community or forum?",
          a: "Yes, we have an active user community where customers can share tips, ask questions, and connect with other VeriGrade users."
        }
      ]
    },
    {
      title: "Integrations & API",
      icon: "🔗",
      questions: [
        {
          q: "What third-party tools integrate with VeriGrade?",
          a: "We integrate with over 100 popular business tools including Stripe, PayPal, Shopify, Salesforce, HubSpot, and many more."
        },
        {
          q: "Do you have an API?",
          a: "Yes, we offer a RESTful API for enterprise customers who need custom integrations or want to build their own solutions."
        },
        {
          q: "Can I sync with my existing accounting software?",
          a: "Yes, we offer two-way sync with QuickBooks, Xero, and Sage to ensure your data stays consistent across platforms."
        },
        {
          q: "How do I set up integrations?",
          a: "Most integrations can be set up in minutes through our integrations dashboard. Our support team can help with complex setups."
        }
      ]
    }
  ];

  const allQuestions = faqCategories.flatMap((category, categoryIndex) =>
    category.questions.map((question, questionIndex) => ({
      ...question,
      category: category.title,
      categoryIcon: category.icon,
      globalIndex: categoryIndex * 100 + questionIndex
    }))
  );

  const filteredQuestions = allQuestions.filter(item =>
    item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.a.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-indigo-50 via-white to-blue-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Frequently Asked
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600"> Questions</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              Find quick answers to common questions about VeriGrade's AI-powered bookkeeping platform.
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search FAQ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
            />
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {searchTerm ? (
            // Search Results
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Search Results ({filteredQuestions.length} found)
              </h2>
              <div className="space-y-4">
                {filteredQuestions.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleItem(item.globalIndex)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{item.categoryIcon}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">{item.q}</h3>
                          <p className="text-sm text-gray-500">{item.category}</p>
                        </div>
                      </div>
                      {openItems.includes(item.globalIndex) ? (
                        <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    {openItems.includes(item.globalIndex) && (
                      <div className="px-6 pb-4">
                        <p className="text-gray-600">{item.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Categories
            <div className="space-y-12">
              {faqCategories.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <span className="text-3xl">{category.icon}</span>
                    {category.title}
                  </h2>
                  <div className="space-y-4">
                    {category.questions.map((item, questionIndex) => {
                      const globalIndex = categoryIndex * 100 + questionIndex;
                      return (
                        <div key={questionIndex} className="border border-gray-200 rounded-lg">
                          <button
                            onClick={() => toggleItem(globalIndex)}
                            className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                          >
                            <h3 className="font-semibold text-gray-900">{item.q}</h3>
                            {openItems.includes(globalIndex) ? (
                              <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                          {openItems.includes(globalIndex) && (
                            <div className="px-6 pb-4">
                              <p className="text-gray-600">{item.a}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <QuestionMarkCircleIcon className="h-16 w-16 text-indigo-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Still Have Questions?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-500 transition-colors"
            >
              Contact Support
            </a>
            <a
              href="/guides"
              className="bg-white text-indigo-600 border border-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
            >
              Browse Guides
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
