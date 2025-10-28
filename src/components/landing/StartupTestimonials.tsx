'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  StarIcon,
  ArrowRightIcon,
  PlayIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  quote: string;
  rating: number;
  metrics: {
    timeSaved: string;
    costReduction: string;
    setupTime: string;
  };
  videoUrl?: string;
  featured: boolean;
}

const testimonials: Testimonial[] = [
  {
    id: 'sarah-chen',
    name: 'Sarah Chen',
    role: 'Founder & CEO',
    company: 'TechFlow',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    quote: 'VeriGrade transformed our financial management. We went from spending 20 hours a week on bookkeeping to just 2 hours. The AI is incredibly accurate and the interface is so intuitive.',
    rating: 5,
    metrics: {
      timeSaved: '18 hours/week',
      costReduction: '60%',
      setupTime: '5 minutes'
    },
    featured: true
  },
  {
    id: 'marcus-rodriguez',
    name: 'Marcus Rodriguez',
    role: 'Co-founder',
    company: 'GrowthLab',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    quote: 'Finally, a bookkeeping tool that actually understands startups. The pricing is fair, the features are powerful, and the support team really gets it.',
    rating: 5,
    metrics: {
      timeSaved: '15 hours/week',
      costReduction: '50%',
      setupTime: '10 minutes'
    },
    featured: true
  },
  {
    id: 'emily-watson',
    name: 'Emily Watson',
    role: 'Founder',
    company: 'InnovateCo',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    quote: 'The setup was incredibly easy. We were up and running in minutes, not weeks. The AI categorization is spot-on and saves us so much time.',
    rating: 5,
    metrics: {
      timeSaved: '12 hours/week',
      costReduction: '40%',
      setupTime: '3 minutes'
    },
    featured: false
  },
  {
    id: 'david-kim',
    name: 'David Kim',
    role: 'CEO',
    company: 'DataVault',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    quote: 'VeriGrade\'s AI is like having a financial analyst on your team 24/7. The insights and predictions have helped us make better business decisions.',
    rating: 5,
    metrics: {
      timeSaved: '25 hours/week',
      costReduction: '70%',
      setupTime: '8 minutes'
    },
    featured: true
  },
  {
    id: 'lisa-patel',
    name: 'Lisa Patel',
    role: 'Co-founder',
    company: 'EcoTech',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    quote: 'The real-time analytics and forecasting features are game-changers. We can see our financial health at a glance and plan accordingly.',
    rating: 5,
    metrics: {
      timeSaved: '10 hours/week',
      costReduction: '35%',
      setupTime: '6 minutes'
    },
    featured: false
  },
  {
    id: 'alex-thompson',
    name: 'Alex Thompson',
    role: 'Founder',
    company: 'CloudScale',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    quote: 'Best investment we\'ve made for our startup. The ROI is incredible - we\'re saving thousands per month while getting better insights.',
    rating: 5,
    metrics: {
      timeSaved: '22 hours/week',
      costReduction: '65%',
      setupTime: '4 minutes'
    },
    featured: true
  }
];

const companyLogos = [
  { name: 'TechFlow', logo: 'TF' },
  { name: 'GrowthLab', logo: 'GL' },
  { name: 'InnovateCo', logo: 'IC' },
  { name: 'DataVault', logo: 'DV' },
  { name: 'EcoTech', logo: 'ET' },
  { name: 'CloudScale', logo: 'CS' },
  { name: 'StartupXYZ', logo: 'SX' },
  { name: 'NextGen', logo: 'NG' }
];

const stats = [
  {
    icon: UserGroupIcon,
    value: '1,000+',
    label: 'Happy Customers',
    description: 'Startups using VeriGrade'
  },
  {
    icon: ClockIcon,
    value: '80%',
    label: 'Time Saved',
    description: 'Average reduction'
  },
  {
    icon: CurrencyDollarIcon,
    value: '50%',
    label: 'Cost Reduction',
    description: 'Compared to alternatives'
  },
  {
    icon: ChartBarIcon,
    value: '99.9%',
    label: 'AI Accuracy',
    description: 'Receipt processing'
  }
];

const StartupTestimonials: React.FC = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const featuredTestimonials = testimonials.filter(t => t.featured);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % featuredTestimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, featuredTestimonials.length]);

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
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
              Join the Movement
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Thousands of startup founders have already made the switch to VeriGrade. 
              See what they're saying about their experience.
            </p>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                <stat.icon className="h-8 w-8" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
              <div className="text-lg font-semibold text-gray-700 mb-1">{stat.label}</div>
              <div className="text-sm text-gray-500">{stat.description}</div>
            </motion.div>
          ))}
        </div>

        {/* Featured Testimonials */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Featured Stories</h3>
            <p className="text-lg text-gray-600">
              Real founders sharing their VeriGrade experience
            </p>
          </motion.div>

          <div className="relative">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTestimonial}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <div className="flex justify-center mb-6">
                    {[...Array(featuredTestimonials[currentTestimonial].rating)].map((_, i) => (
                      <StarIcon key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  <ChatBubbleLeftRightIcon className="h-12 w-12 text-blue-100 mx-auto mb-6" />
                  
                  <blockquote className="text-xl md:text-2xl text-gray-700 mb-8 max-w-4xl mx-auto">
                    "{featuredTestimonials[currentTestimonial].quote}"
                  </blockquote>
                  
                  <div className="flex items-center justify-center space-x-4 mb-8">
                    <img
                      src={featuredTestimonials[currentTestimonial].avatar}
                      alt={featuredTestimonials[currentTestimonial].name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="text-left">
                      <div className="font-semibold text-gray-900 text-lg">
                        {featuredTestimonials[currentTestimonial].name}
                      </div>
                      <div className="text-gray-600">
                        {featuredTestimonials[currentTestimonial].role}, {featuredTestimonials[currentTestimonial].company}
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {featuredTestimonials[currentTestimonial].metrics.timeSaved}
                      </div>
                      <div className="text-sm text-green-700">Time Saved</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {featuredTestimonials[currentTestimonial].metrics.costReduction}
                      </div>
                      <div className="text-sm text-blue-700">Cost Reduction</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {featuredTestimonials[currentTestimonial].metrics.setupTime}
                      </div>
                      <div className="text-sm text-purple-700">Setup Time</div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Controls */}
              <div className="flex justify-center mt-8 space-x-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  {isPlaying ? (
                    <div className="w-4 h-4 bg-gray-600 rounded-sm"></div>
                  ) : (
                    <PlayIcon className="h-4 w-4 text-gray-600" />
                  )}
                </button>
                
                <div className="flex space-x-2">
                  {featuredTestimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentTestimonial(index);
                        setIsPlaying(false);
                      }}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentTestimonial ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* All Testimonials Grid */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-4">More Success Stories</h3>
            <p className="text-lg text-gray-600">
              See what other founders are saying about VeriGrade
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-600 mb-6 italic">"{testimonial.quote}"</p>
                
                <div className="flex items-center space-x-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}, {testimonial.company}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Company Logos */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Trusted by Leading Startups</h3>
            <p className="text-gray-600">
              Join these innovative companies using VeriGrade
            </p>
          </motion.div>

          <div className="grid grid-cols-4 md:grid-cols-8 gap-8 items-center">
            {companyLogos.map((company, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg font-bold text-gray-600">{company.logo}</span>
                </div>
                <div className="text-sm text-gray-500">{company.name}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-3xl font-bold mb-4">Ready to Join Them?</h3>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Start your free trial today and see why thousands of startup founders 
              have made the switch to VeriGrade.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center">
                Start Free Trial
                <ArrowRightIcon className="h-5 w-5 ml-2" />
              </button>
              <button className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors">
                Watch Demo
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StartupTestimonials;
