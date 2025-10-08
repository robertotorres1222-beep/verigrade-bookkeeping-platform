'use client';

import { useState } from 'react';
import { 
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  StarIcon,
  ArrowRightIcon,
  CalculatorIcon,
  BanknotesIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';

export default function FractionalCFOPage() {
  const [services] = useState([
    {
      title: 'Financial Strategy & Planning',
      description: 'Develop comprehensive financial strategies and long-term planning to drive business growth.',
      features: ['Budgeting & Forecasting', 'Financial Modeling', 'Strategic Planning', 'Growth Planning'],
      icon: ChartBarIcon,
      price: '$2,500/month'
    },
    {
      title: 'Cash Flow Management',
      description: 'Optimize cash flow, manage working capital, and implement cash management strategies.',
      features: ['Cash Flow Analysis', 'Working Capital Optimization', 'Payment Terms Negotiation', 'Credit Management'],
      icon: CurrencyDollarIcon,
      price: '$1,800/month'
    },
    {
      title: 'Financial Reporting & Analytics',
      description: 'Create detailed financial reports and provide actionable insights for decision making.',
      features: ['Monthly Financial Reports', 'KPI Dashboard', 'Variance Analysis', 'Performance Metrics'],
      icon: DocumentTextIcon,
      price: '$1,200/month'
    },
    {
      title: 'Fundraising & Investor Relations',
      description: 'Prepare for fundraising, manage investor relations, and create compelling financial narratives.',
      features: ['Pitch Deck Creation', 'Financial Due Diligence', 'Investor Presentations', 'Valuation Analysis'],
      icon: ArrowTrendingUpIcon,
      price: '$3,000/month'
    }
  ]);

  const [testimonials] = useState([
    {
      name: 'Sarah Johnson',
      company: 'TechStart Inc',
      role: 'CEO',
      content: 'VeriGrade\'s fractional CFO service transformed our financial operations. We went from reactive to proactive financial management.',
      rating: 5,
      avatar: 'SJ'
    },
    {
      name: 'Michael Chen',
      company: 'Growth Ventures',
      role: 'Founder',
      content: 'The financial modeling and forecasting helped us secure our Series A funding. Incredible expertise and support.',
      rating: 5,
      avatar: 'MC'
    },
    {
      name: 'Emily Rodriguez',
      company: 'E-commerce Solutions',
      role: 'COO',
      content: 'Our cash flow improved by 40% within 3 months. The strategic guidance was invaluable for our growth.',
      rating: 5,
      avatar: 'ER'
    }
  ]);

  const cfoStats = [
    { label: 'Years Experience', value: '15+', icon: ClockIcon, color: 'text-blue-600' },
    { label: 'Companies Helped', value: '200+', icon: UserGroupIcon, color: 'text-green-600' },
    { label: 'Funds Raised', value: '$50M+', icon: CurrencyDollarIcon, color: 'text-purple-600' },
    { label: 'Client Satisfaction', value: '98%', icon: StarIcon, color: 'text-yellow-600' }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon 
        key={i} 
        className={`h-5 w-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Fractional
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"> CFO</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              Get expert CFO services without the full-time cost. Strategic financial guidance, 
              reporting, and analysis to drive your business growth and profitability.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-500 transition-colors">
                Get Started Today
              </button>
              <a
                href="/contact"
                className="bg-transparent text-indigo-600 border border-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-600 hover:text-white transition-colors"
              >
                Schedule Consultation
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CFO Stats */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {cfoStats.map((stat, index) => (
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

      {/* Services */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Fractional CFO Services</h2>
            <p className="text-lg text-gray-600">Comprehensive financial leadership tailored to your business needs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-start mb-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mr-4">
                    <service.icon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">What's Included:</h4>
                  <ul className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-indigo-600">{service.price}</span>
                  <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-500 transition-colors flex items-center gap-2">
                    Learn More
                    <ArrowRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Our Fractional CFO */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Fractional CFO?</h2>
            <p className="text-lg text-gray-600">Expert financial leadership without the overhead</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-6">
                <CalculatorIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Cost Effective</h3>
              <p className="text-gray-600">Get CFO-level expertise at a fraction of the cost of hiring a full-time executive. Pay only for what you need.</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-6">
                <UserGroupIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Proven Experience</h3>
              <p className="text-gray-600">Work with CFOs who have successfully guided 200+ companies through growth, fundraising, and scaling challenges.</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mx-auto mb-6">
                <ScaleIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Flexible Engagement</h3>
              <p className="text-gray-600">Scale up or down based on your needs. From monthly check-ins to full strategic planning sessions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Clients Say</h2>
            <p className="text-lg text-gray-600">Success stories from companies we've helped grow</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center mb-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mr-4">
                    <span className="text-sm font-semibold text-indigo-600">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}, {testimonial.company}</p>
                  </div>
                </div>
                <div className="flex items-center mb-4">
                  {renderStars(testimonial.rating)}
                </div>
                <p className="text-gray-600 italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Simple process to get started with your fractional CFO</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Initial Consultation</h3>
              <p className="text-gray-600">We assess your current financial situation and identify areas for improvement.</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Custom Strategy</h3>
              <p className="text-gray-600">Develop a tailored financial strategy based on your business goals and challenges.</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Implementation</h3>
              <p className="text-gray-600">Begin implementing financial systems, processes, and reporting frameworks.</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mx-auto mb-6">
                <span className="text-2xl font-bold text-white">4</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Ongoing Support</h3>
              <p className="text-gray-600">Provide continuous guidance, monitoring, and strategic financial advice.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-indigo-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Financial Operations?
          </h2>
          <p className="text-lg text-indigo-100 mb-8 max-w-2xl mx-auto">
            Get expert CFO guidance without the full-time cost. Let's discuss how our fractional CFO services 
            can drive your business growth and profitability.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Schedule Consultation
            </button>
            <a
              href="/contact"
              className="bg-transparent text-white border border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors"
            >
              Get Started Today
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
