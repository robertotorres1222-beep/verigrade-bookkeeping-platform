'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  SparklesIcon,
  RocketLaunchIcon,
  HeartIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon,
  LightBulbIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const values = [
  {
    icon: HeartIcon,
    title: 'Built by Founders, for Founders',
    description: 'We understand the challenges of running a startup because we\'ve been there. Every feature is designed with real founder pain points in mind.',
    color: 'from-red-500 to-pink-500'
  },
  {
    icon: SparklesIcon,
    title: 'Innovation First',
    description: 'We\'re not just another bookkeeping tool. We\'re building the future of financial management with cutting-edge AI and modern technology.',
    color: 'from-purple-500 to-indigo-500'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Transparent & Honest',
    description: 'No hidden fees, no surprise charges, no vendor lock-in. We believe in transparent pricing and giving you control of your data.',
    color: 'from-green-500 to-emerald-500'
  }
];

const milestones = [
  {
    year: '2024',
    title: 'The Vision',
    description: 'Founded by entrepreneurs who were frustrated with existing bookkeeping solutions',
    icon: LightBulbIcon
  },
  {
    year: 'Q1 2024',
    title: 'First AI Model',
    description: 'Developed our proprietary AI for receipt processing with 99.9% accuracy',
    icon: CpuChipIcon
  },
  {
    year: 'Q2 2024',
    title: 'Beta Launch',
    description: 'Launched with 50 startup founders who helped shape our product',
    icon: RocketLaunchIcon
  },
  {
    year: 'Q3 2024',
    title: 'Public Launch',
    description: 'Opened to the public with 1,000+ happy customers',
    icon: UserGroupIcon
  },
  {
    year: 'Now',
    title: 'Growing Fast',
    description: 'Serving thousands of startups with advanced AI and automation',
    icon: ChartBarIcon
  }
];

const stats = [
  {
    value: '99.9%',
    label: 'AI Accuracy',
    description: 'Receipt processing accuracy'
  },
  {
    value: '80%',
    label: 'Time Saved',
    description: 'Average time reduction'
  },
  {
    value: '50%',
    label: 'Cost Reduction',
    description: 'Compared to traditional solutions'
  },
  {
    value: '24/7',
    label: 'AI Support',
    description: 'Always-on automation'
  }
];

const WhyVeriGrade: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why VeriGrade?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're not just another bookkeeping platform. We're a movement of entrepreneurs 
              who believe financial management should be intelligent, affordable, and founder-friendly.
            </p>
          </motion.div>
        </div>

        {/* Our Story */}
        <div className="mb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Our Story
              </h3>
              <div className="space-y-4 text-lg text-gray-600">
                <p>
                  VeriGrade was born from frustration. As serial entrepreneurs, we were tired of 
                  expensive, complex bookkeeping solutions that didn't understand startup needs.
                </p>
                <p>
                  We spent months building our own AI-powered system, and when other founders 
                  saw what we'd created, they begged us to share it. That's how VeriGrade was born.
                </p>
                <p>
                  Today, we're proud to serve thousands of startups with the same solution 
                  we built for ourselves - but now it's even better.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <h4 className="text-xl font-semibold text-gray-900 mb-6">Our Journey</h4>
              <div className="space-y-6">
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${milestone.icon === LightBulbIcon ? 'from-yellow-500 to-orange-500' : milestone.icon === CpuChipIcon ? 'from-blue-500 to-purple-500' : milestone.icon === RocketLaunchIcon ? 'from-green-500 to-teal-500' : milestone.icon === UserGroupIcon ? 'from-purple-500 to-pink-500' : 'from-indigo-500 to-blue-500'} text-white`}>
                      <milestone.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-blue-600">{milestone.year}</div>
                      <div className="font-medium text-gray-900">{milestone.title}</div>
                      <div className="text-sm text-gray-600">{milestone.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h3>
            <p className="text-lg text-gray-600">
              These principles guide everything we do at VeriGrade
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${value.color} text-white mb-6`}>
                  <value.icon className="h-8 w-8" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-4">{value.title}</h4>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white"
        >
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-4">The Numbers Don't Lie</h3>
            <p className="text-blue-100 text-lg">
              See why thousands of startups choose VeriGrade
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-xl font-semibold mb-1">{stat.label}</div>
                <div className="text-blue-100 text-sm">{stat.description}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Join the Movement?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Be part of the next generation of entrepreneurs who are revolutionizing 
              how startups handle their finances.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                Start Your Journey
                <ArrowRightIcon className="h-5 w-5 ml-2" />
              </button>
              <button className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyVeriGrade;
