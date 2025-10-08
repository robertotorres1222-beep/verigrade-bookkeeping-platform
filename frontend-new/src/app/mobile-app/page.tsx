'use client';

import { useState } from 'react';
import { 
  DevicePhoneMobileIcon,
  CameraIcon,
  CloudIcon,
  ShieldCheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ChartBarIcon,
  PlusIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  PlayIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';

export default function MobileAppPage() {
  const [features] = useState([
    {
      title: 'Receipt Capture',
      description: 'Instantly capture receipts with your phone camera and extract data automatically using AI.',
      icon: CameraIcon,
      benefits: ['OCR Text Recognition', 'Automatic Data Entry', 'Smart Categorization', 'Duplicate Detection']
    },
    {
      title: 'Expense Tracking',
      description: 'Track business expenses on-the-go with real-time categorization and approval workflows.',
      icon: CurrencyDollarIcon,
      benefits: ['Real-time Tracking', 'Instant Categorization', 'Approval Workflows', 'Receipt Storage']
    },
    {
      title: 'Time Tracking',
      description: 'Track time spent on projects and clients with GPS verification and automatic billing.',
      icon: ClockIcon,
      benefits: ['GPS Verification', 'Project Tracking', 'Automatic Billing', 'Team Collaboration']
    },
    {
      title: 'Invoice Management',
      description: 'Create, send, and track invoices directly from your mobile device with professional templates.',
      icon: DocumentTextIcon,
      benefits: ['Professional Templates', 'Digital Signatures', 'Payment Tracking', 'Client Communication']
    },
    {
      title: 'Financial Dashboard',
      description: 'Monitor your business finances with real-time dashboards and key performance indicators.',
      icon: ChartBarIcon,
      benefits: ['Real-time Data', 'KPI Monitoring', 'Visual Analytics', 'Trend Analysis']
    },
    {
      title: 'Secure Cloud Sync',
      description: 'All your data is securely synced across devices with enterprise-grade security.',
      icon: CloudIcon,
      benefits: ['Cross-device Sync', 'Real-time Backup', 'Offline Access', 'Data Encryption']
    }
  ]);

  const [testimonials] = useState([
    {
      name: 'Jessica Martinez',
      company: 'Martinez Consulting',
      role: 'Owner',
      content: 'The mobile app has revolutionized how I manage my business finances. I can capture receipts and track expenses anywhere.',
      rating: 5,
      avatar: 'JM'
    },
    {
      name: 'David Kim',
      company: 'TechStart Solutions',
      role: 'CEO',
      content: 'Time tracking on mobile with GPS verification has made project billing so much more accurate and transparent.',
      rating: 5,
      avatar: 'DK'
    },
    {
      name: 'Lisa Thompson',
      company: 'Thompson Services',
      role: 'Founder',
      content: 'Creating invoices on the go has saved me hours every week. The templates are professional and easy to customize.',
      rating: 5,
      avatar: 'LT'
    }
  ]);

  const appStats = [
    { label: 'Downloads', value: '50K+', icon: DevicePhoneMobileIcon, color: 'text-blue-600' },
    { label: 'Receipts Processed', value: '1M+', icon: CameraIcon, color: 'text-green-600' },
    { label: 'Time Tracked', value: '500K+ hrs', icon: ClockIcon, color: 'text-purple-600' },
    { label: 'User Rating', value: '4.8/5', icon: ShieldCheckIcon, color: 'text-yellow-600' }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <CheckCircleIcon 
        key={i} 
        className={`h-5 w-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              VeriGrade
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> Mobile</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              Manage your business finances on-the-go with our powerful mobile app. 
              Capture receipts, track expenses, manage invoices, and monitor your business performance from anywhere.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-500 transition-colors flex items-center gap-2">
                <PlayIcon className="h-5 w-5" />
                Download Now
              </button>
              <a
                href="/contact"
                className="bg-transparent text-blue-600 border border-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors"
              >
                Watch Demo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* App Stats */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {appStats.map((stat, index) => (
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

      {/* Mobile App Preview */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Mobile App Preview</h2>
            <p className="text-lg text-gray-600">See how our mobile app transforms business financial management</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Receipt Capture Made Simple</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <CameraIcon className="h-6 w-6 mr-3" />
                    <span>Point, shoot, and done - AI extracts all data automatically</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-6 w-6 mr-3" />
                    <span>Smart categorization and duplicate detection</span>
                  </div>
                  <div className="flex items-center">
                    <CloudIcon className="h-6 w-6 mr-3" />
                    <span>Instant sync across all your devices</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Real-time Financial Insights</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <ChartBarIcon className="h-6 w-6 mr-3" />
                    <span>Monitor cash flow and profitability on-the-go</span>
                  </div>
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-6 w-6 mr-3" />
                    <span>Track expenses and income in real-time</span>
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="h-6 w-6 mr-3" />
                    <span>Time tracking with GPS verification</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 rounded-2xl p-8 text-center">
              <div className="bg-white rounded-xl shadow-lg mx-auto w-64 h-96 flex items-center justify-center">
                <div className="text-center">
                  <DevicePhoneMobileIcon className="h-24 w-24 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Mobile App</h4>
                  <p className="text-sm text-gray-600">Available for iOS and Android</p>
                  <div className="mt-4 flex justify-center gap-2">
                    <div className="bg-gray-200 rounded-lg px-3 py-1 text-xs">iOS</div>
                    <div className="bg-gray-200 rounded-lg px-3 py-1 text-xs">Android</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Mobile App Features</h2>
            <p className="text-lg text-gray-600">Everything you need to manage your business finances on-the-go</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-6">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 mb-6">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center text-sm text-gray-600">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-lg text-gray-600">Real feedback from business owners using our mobile app</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center mb-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mr-4">
                    <span className="text-sm font-semibold text-blue-600">{testimonial.avatar}</span>
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

      {/* Download Section */}
      <section className="py-16 bg-blue-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Download VeriGrade Mobile Today
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Transform how you manage your business finances. Available for iOS and Android devices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2">
              <PlayIcon className="h-5 w-5" />
              Download for iOS
            </button>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2">
              <PlayIcon className="h-5 w-5" />
              Download for Android
            </button>
          </div>
          <div className="mt-8 text-sm text-blue-100">
            <p>Scan QR code to download directly to your phone</p>
            <div className="mt-4 flex justify-center">
              <div className="bg-white p-4 rounded-lg">
                <QrCodeIcon className="h-16 w-16 text-gray-800" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
