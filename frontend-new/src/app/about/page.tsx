'use client';

import { motion } from 'framer-motion';
import VeriGradeLogo from '../../components/VeriGradeLogo';
import { 
  LightBulbIcon,
  RocketLaunchIcon,
  HeartIcon,
  GlobeAltIcon,
  ChartBarIcon,
  UsersIcon,
  StarIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function AboutPage() {
  const milestones = [
    {
      year: '2020',
      title: 'Company Founded',
      description: 'VeriGrade was founded with a vision to revolutionize bookkeeping through AI technology.',
      icon: RocketLaunchIcon
    },
    {
      year: '2021',
      title: 'First AI Model',
      description: 'Launched our first AI-powered transaction categorization system with 95% accuracy.',
      icon: LightBulbIcon
    },
    {
      year: '2022',
      title: 'Series A Funding',
      description: 'Raised $10M in Series A funding to accelerate product development and team growth.',
      icon: ChartBarIcon
    },
    {
      year: '2023',
      title: 'Enterprise Launch',
      description: 'Launched enterprise solutions and achieved SOC 2 Type II certification.',
      icon: GlobeAltIcon
    },
    {
      year: '2024',
      title: 'Global Expansion',
      description: 'Expanded to serve customers in 50+ countries with multi-currency support.',
      icon: UsersIcon
    }
  ];

  const values = [
    {
      title: 'Innovation',
      description: 'We constantly push the boundaries of what\'s possible in bookkeeping technology, using cutting-edge AI and machine learning.',
      icon: LightBulbIcon,
      color: 'from-yellow-400 to-orange-500'
    },
    {
      title: 'Customer Success',
      description: 'Our customers\' success is our success. We build features and solutions that directly impact their bottom line.',
      icon: HeartIcon,
      color: 'from-red-400 to-pink-500'
    },
    {
      title: 'Transparency',
      description: 'We believe in open communication, honest feedback, and transparent business practices with all our stakeholders.',
      icon: GlobeAltIcon,
      color: 'from-blue-400 to-cyan-500'
    },
    {
      title: 'Excellence',
      description: 'We strive for excellence in everything we do, from our code quality to our customer support interactions.',
      icon: StarIcon,
      color: 'from-purple-400 to-indigo-500'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Businesses Served', description: 'Growing customer base worldwide' },
    { number: '$50B+', label: 'Transactions Processed', description: 'Billions in transaction volume' },
    { number: '99.9%', label: 'Accuracy Rate', description: 'AI-powered categorization accuracy' },
    { number: '50+', label: 'Countries', description: 'Global presence and support' }
  ];

  const testimonials = [
    {
      quote: "VeriGrade has transformed our bookkeeping process. What used to take hours now takes minutes with their AI.",
      author: "Sarah Johnson",
      role: "CFO, TechStart Inc",
      company: "TechStart Inc"
    },
    {
      quote: "The accuracy of their AI categorization is incredible. We've saved thousands of dollars in bookkeeping costs.",
      author: "Michael Chen",
      role: "Founder, GrowthCorp",
      company: "GrowthCorp"
    },
    {
      quote: "Finally, a bookkeeping platform that actually understands modern business needs and scales with us.",
      author: "Emily Rodriguez",
      role: "CEO, StartupXYZ",
      company: "StartupXYZ"
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
              <a href="/about" className="text-blue-600 font-semibold">About</a>
              <a href="/contact" className="text-gray-600 hover:text-gray-900">Contact</a>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl"
            >
              About{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                VeriGrade
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto"
            >
              We're on a mission to revolutionize bookkeeping by making advanced AI technology accessible to businesses of all sizes. Founded in 2020, VeriGrade has grown from a startup idea to a global platform serving thousands of businesses worldwide.
            </motion.p>
          </div>
        </div>
      </div>

      {/* Our Story */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-6">
                Our Story
              </h2>
              <div className="space-y-6 text-gray-600">
                <p>
                  VeriGrade was born from a simple observation: bookkeeping was stuck in the past. While other industries embraced AI and automation, small and medium businesses were still manually categorizing transactions and reconciling accounts.
                </p>
                <p>
                  Our founders, Sarah Chen and Marcus Rodriguez, combined their expertise in fintech and AI to create a platform that could understand business transactions as well as a human bookkeeper, but with the speed and accuracy of artificial intelligence.
                </p>
                <p>
                  Today, VeriGrade processes billions of dollars in transactions annually, helping businesses save time, reduce errors, and make better financial decisions. But we're just getting started.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-8 text-white"
            >
              <RocketLaunchIcon className="h-16 w-16 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-blue-100 mb-6">
                To democratize access to advanced bookkeeping technology, making it possible for any business to have enterprise-grade financial management tools.
              </p>
              <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
              <p className="text-blue-100">
                A world where bookkeeping is completely automated, accurate, and insightful, allowing business owners to focus on what they do best.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Company Stats */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              By the Numbers
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Our impact on businesses worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center bg-white rounded-2xl shadow-lg p-8"
              >
                <div className="text-4xl font-bold text-blue-600 mb-4">{stat.number}</div>
                <div className="text-lg font-semibold text-gray-900 mb-2">{stat.label}</div>
                <div className="text-sm text-gray-600">{stat.description}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Timeline */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Our Journey
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Key milestones in our company's growth and development.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
            
            <div className="space-y-16">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
                          <milestone.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-blue-600">{milestone.year}</div>
                          <h3 className="text-xl font-bold text-gray-900">{milestone.title}</h3>
                        </div>
                      </div>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                  
                  <div className="w-16 h-16 bg-white border-4 border-blue-500 rounded-full flex items-center justify-center z-10 shadow-lg">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                  </div>
                  
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pl-8' : 'pr-8'}`}></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Our Values
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              The principles that guide everything we do.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
              >
                <div className="flex items-start">
                  <div className={`w-12 h-12 bg-gradient-to-r ${value.color} rounded-xl flex items-center justify-center mr-6 flex-shrink-0`}>
                    <value.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              What Our Customers Say
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Hear from businesses that have transformed their bookkeeping with VeriGrade.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
              >
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-gray-600 mb-6">
                  "{testimonial.quote}"
                </blockquote>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.author}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                  <div className="text-sm text-blue-600">{testimonial.company}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-white mb-6">
              Join the VeriGrade Revolution
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Be part of the future of bookkeeping. Start your free trial today and experience the power of AI-driven financial management.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/register"
                className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-blue-600 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                Start Free Trial
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </a>
              <a
                href="/contact"
                className="inline-flex items-center px-8 py-4 border-2 border-white text-lg font-medium rounded-xl text-white hover:bg-white hover:text-blue-600 transition-colors duration-200"
              >
                Contact Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-center">
            <VeriGradeLogo size="md" variant="full" />
            <p className="text-sm text-gray-500">
              © 2024 VeriGrade, Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}