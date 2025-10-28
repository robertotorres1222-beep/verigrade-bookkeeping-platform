'use client';

import { useState } from 'react';
import { 
  StarIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function TestimonialsPage() {
  const [testimonials] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      company: 'TechStart Solutions',
      role: 'CEO',
      image: '/api/placeholder/80/80',
      rating: 5,
      quote: 'VeriGrade has completely transformed how we handle our finances. The AI-powered categorization saves us hours every week, and the real-time insights help us make better business decisions.',
      industry: 'Technology',
      companySize: '10-50 employees',
      useCase: 'Automated bookkeeping and financial reporting'
    },
    {
      id: 2,
      name: 'Michael Chen',
      company: 'Creative Agency Co.',
      role: 'Finance Director',
      image: '/api/placeholder/80/80',
      rating: 5,
      quote: 'The bank reconciliation feature is a game-changer. What used to take our team days now happens automatically. We can focus on growing the business instead of managing spreadsheets.',
      industry: 'Marketing',
      companySize: '50-100 employees',
      useCase: 'Bank reconciliation and expense management'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      company: 'Green Energy Corp',
      role: 'CFO',
      image: '/api/placeholder/80/80',
      rating: 5,
      quote: 'VeriGrade\'s reporting capabilities are exceptional. The financial insights and forecasting features have helped us secure two major funding rounds. It\'s like having a financial analyst on our team.',
      industry: 'Energy',
      companySize: '100+ employees',
      useCase: 'Financial reporting and investor relations'
    },
    {
      id: 4,
      name: 'David Park',
      company: 'Local Restaurant Group',
      role: 'Owner',
      image: '/api/placeholder/80/80',
      rating: 5,
      quote: 'Running multiple restaurant locations was a nightmare before VeriGrade. Now I can see all our financials in one place, track expenses across locations, and make data-driven decisions about menu pricing.',
      industry: 'Restaurant',
      companySize: '5-10 employees',
      useCase: 'Multi-location financial management'
    },
    {
      id: 5,
      name: 'Lisa Thompson',
      company: 'Consulting Firm LLC',
      role: 'Managing Partner',
      image: '/api/placeholder/80/80',
      rating: 5,
      quote: 'The invoicing system is incredibly professional and easy to use. Our clients love the clean, branded invoices, and we get paid faster. The time tracking integration is perfect for our billable hours.',
      industry: 'Consulting',
      companySize: '10-25 employees',
      useCase: 'Professional invoicing and time tracking'
    },
    {
      id: 6,
      name: 'James Wilson',
      company: 'E-commerce Store',
      role: 'Founder',
      image: '/api/placeholder/80/80',
      rating: 5,
      quote: 'As a solo entrepreneur, VeriGrade gives me the financial oversight I need without the complexity. The mobile app lets me manage finances on the go, and the tax preparation features save me thousands in accounting fees.',
      industry: 'E-commerce',
      companySize: '1-5 employees',
      useCase: 'Solo entrepreneur financial management'
    }
  ]);

  const [stats] = useState([
    { label: 'Customer Satisfaction', value: '98%', icon: StarIcon },
    { label: 'Time Saved Per Month', value: '40+ hours', icon: CheckCircleIcon },
    { label: 'Average Rating', value: '4.9/5', icon: StarIcon },
    { label: 'Customer Retention', value: '95%', icon: UserIcon }
  ]);

  const [industries] = useState([
    'Technology', 'Healthcare', 'Finance', 'E-commerce', 'Consulting', 
    'Manufacturing', 'Real Estate', 'Education', 'Non-profit', 'Retail'
  ]);

  const [companySizes] = useState([
    'Solo Entrepreneurs', 'Small Teams (2-10)', 'Growing Companies (10-50)', 
    'Established Businesses (50-200)', 'Enterprise (200+)'
  ]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-5 w-5 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Customer
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600"> Success Stories</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              See how businesses like yours are transforming their financial management 
              with VeriGrade. From startups to enterprises, discover the impact we're making.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
                  <stat.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-lg text-gray-600">Real feedback from real businesses using VeriGrade</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-gray-600" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center">
                      <h4 className="text-lg font-semibold text-gray-900">{testimonial.name}</h4>
                      <div className="ml-2 flex">
                        {renderStars(testimonial.rating)}
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-500 mb-2" />
                  <p className="text-gray-700 italic">"{testimonial.quote}"</p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {testimonial.industry}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {testimonial.companySize}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{testimonial.useCase}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted Across Industries</h2>
            <p className="text-lg text-gray-600">VeriGrade works for businesses of all types and sizes</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {industries.map((industry, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-sm font-medium text-gray-900">{industry}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Sizes Section */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Perfect for Every Business Size</h2>
            <p className="text-lg text-gray-600">From solo entrepreneurs to large enterprises</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {companySizes.map((size, index) => (
              <div key={index} className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">{size}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Join Thousands of Happy Customers
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            See why businesses choose VeriGrade for their financial management needs. 
            Start your free trial today and experience the difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              Start Free Trial
              <ArrowRightIcon className="h-5 w-5" />
            </a>
            <a
              href="/contact"
              className="bg-transparent text-white border border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Talk to Sales
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
