'use client';

import { useState } from 'react';
import { 
  UserPlusIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  StarIcon,
  ArrowRightIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

export default function PartnersPage() {
  const [partnerCategories] = useState([
    {
      title: 'Technology Partners',
      description: 'Integrate with leading technology platforms and tools.',
      partners: [
        { name: 'QuickBooks', logo: 'QB', type: 'Accounting Software', status: 'Active' },
        { name: 'Xero', logo: 'XO', type: 'Accounting Platform', status: 'Active' },
        { name: 'Sage', logo: 'SG', type: 'Business Software', status: 'Active' },
        { name: 'Stripe', logo: 'SP', type: 'Payment Processing', status: 'Active' }
      ]
    },
    {
      title: 'Accounting Firm Partners',
      description: 'Work with certified accounting professionals and firms.',
      partners: [
        { name: 'Deloitte', logo: 'DT', type: 'Big Four Firm', status: 'Active' },
        { name: 'PwC', logo: 'PC', type: 'Professional Services', status: 'Active' },
        { name: 'KPMG', logo: 'KG', type: 'Audit & Tax', status: 'Active' },
        { name: 'EY', logo: 'EY', type: 'Professional Services', status: 'Active' }
      ]
    },
    {
      title: 'Banking Partners',
      description: 'Secure banking integrations and financial services.',
      partners: [
        { name: 'Chase', logo: 'CH', type: 'Business Banking', status: 'Active' },
        { name: 'Wells Fargo', logo: 'WF', type: 'Commercial Banking', status: 'Active' },
        { name: 'Bank of America', logo: 'BA', type: 'Business Services', status: 'Active' },
        { name: 'Capital One', logo: 'CO', type: 'Credit & Banking', status: 'Active' }
      ]
    }
  ]);

  const [benefits] = useState([
    {
      title: 'Revenue Sharing',
      description: 'Earn commissions on referrals and joint customer success',
      icon: CurrencyDollarIcon,
      color: 'text-green-600'
    },
    {
      title: 'Co-Marketing',
      description: 'Joint marketing campaigns and promotional opportunities',
      icon: ChartBarIcon,
      color: 'text-blue-600'
    },
    {
      title: 'Technical Support',
      description: 'Dedicated technical resources and integration support',
      icon: ShieldCheckIcon,
      color: 'text-purple-600'
    },
    {
      title: 'Training & Certification',
      description: 'Comprehensive training programs and certification opportunities',
      icon: UserGroupIcon,
      color: 'text-indigo-600'
    }
  ]);

  const [testimonials] = useState([
    {
      name: 'Jennifer Adams',
      company: 'Adams & Associates CPA',
      role: 'Partner',
      content: 'Partnering with VeriGrade has transformed our practice. Our clients love the AI-powered bookkeeping solutions.',
      avatar: 'JA'
    },
    {
      name: 'Robert Chen',
      company: 'TechStart Solutions',
      role: 'CEO',
      content: 'The integration with VeriGrade has streamlined our financial processes and improved accuracy significantly.',
      avatar: 'RC'
    },
    {
      name: 'Maria Rodriguez',
      company: 'Rodriguez Consulting',
      role: 'Founder',
      content: 'The partnership program provides excellent support and has helped us grow our client base.',
      avatar: 'MR'
    }
  ]);

  const partnershipStats = [
    { label: 'Active Partners', value: '150+', icon: UserPlusIcon, color: 'text-blue-600' },
    { label: 'Partner Revenue', value: '$2M+', icon: CurrencyDollarIcon, color: 'text-green-600' },
    { label: 'Joint Customers', value: '5K+', icon: UserGroupIcon, color: 'text-purple-600' },
    { label: 'Partner Satisfaction', value: '4.9/5', icon: StarIcon, color: 'text-yellow-600' }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Partner
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600"> Program</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              Join our growing network of partners and help businesses transform their financial operations. 
              Together, we can deliver exceptional value to customers worldwide.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-500 transition-colors">
                Become a Partner
              </button>
              <a
                href="/contact"
                className="bg-transparent text-green-600 border border-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-600 hover:text-white transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Stats */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {partnershipStats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mx-auto mb-4">
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Categories */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Partner Network</h2>
            <p className="text-lg text-gray-600">Strategic partnerships across technology, accounting, and banking</p>
          </div>

          <div className="space-y-16">
            {partnerCategories.map((category, index) => (
              <div key={index}>
                <div className="text-center mb-12">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{category.title}</h3>
                  <p className="text-lg text-gray-600">{category.description}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {category.partners.map((partner, partnerIndex) => (
                    <div key={partnerIndex} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4">
                        <span className="text-xl font-bold text-gray-700">{partner.logo}</span>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{partner.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">{partner.type}</p>
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {partner.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Benefits */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Partner Benefits</h2>
            <p className="text-lg text-gray-600">Why partner with VeriGrade?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mx-auto mb-6">
                  <benefit.icon className={`h-8 w-8 ${benefit.color}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Testimonials */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Partners Say</h2>
            <p className="text-lg text-gray-600">Success stories from our partner network</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-8">
                <div className="flex items-center mb-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mr-4">
                    <span className="text-sm font-semibold text-green-600">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}, {testimonial.company}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-green-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Partner with VeriGrade?
          </h2>
          <p className="text-lg text-green-100 mb-8 max-w-2xl mx-auto">
            Join our partner program and help businesses transform their financial operations. 
            Together, we can achieve greater success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2">
              <UserPlusIcon className="h-5 w-5" />
              Become a Partner
            </button>
            <a
              href="/contact"
              className="bg-transparent text-white border border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
            >
              Contact Partnership Team
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
