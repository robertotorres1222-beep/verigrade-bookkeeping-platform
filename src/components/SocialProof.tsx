'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserGroupIcon,
  StarIcon,
  CheckBadgeIcon,
  ClockIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

interface Review {
  id: string;
  name: string;
  company: string;
  rating: number;
  text: string;
  avatar: string;
  verified: boolean;
  date: string;
  helpful: number;
}

interface Stat {
  label: string;
  value: string;
  icon: React.ComponentType<any>;
  color: string;
}

const mockReviews: Review[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    company: 'TechStart Inc.',
    rating: 5,
    text: 'VeriGrade has completely transformed our bookkeeping process. The AI categorization is incredibly accurate, and we save 10+ hours per week.',
    avatar: '/avatars/sarah.jpg',
    verified: true,
    date: '2 days ago',
    helpful: 24
  },
  {
    id: '2',
    name: 'Michael Chen',
    company: 'Chen & Associates',
    rating: 5,
    text: 'The real-time analytics and predictive insights have helped us make better financial decisions. ROI increased by 35% in just 3 months.',
    avatar: '/avatars/michael.jpg',
    verified: true,
    date: '1 week ago',
    helpful: 18
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    company: 'Rodriguez Consulting',
    rating: 5,
    text: 'Finally, a bookkeeping platform that actually understands small business needs. The automation features are game-changing.',
    avatar: '/avatars/emily.jpg',
    verified: true,
    date: '2 weeks ago',
    helpful: 31
  },
  {
    id: '4',
    name: 'David Thompson',
    company: 'Thompson Enterprises',
    rating: 5,
    text: 'Switched from QuickBooks and never looked back. VeriGrade is more intuitive, more powerful, and significantly more affordable.',
    avatar: '/avatars/david.jpg',
    verified: true,
    date: '3 weeks ago',
    helpful: 27
  },
  {
    id: '5',
    name: 'Lisa Park',
    company: 'Park Financial Services',
    rating: 5,
    text: 'The AI-powered insights have helped us identify cost-saving opportunities worth $50K annually. Absolutely incredible platform.',
    avatar: '/avatars/lisa.jpg',
    verified: true,
    date: '1 month ago',
    helpful: 42
  },
  {
    id: '6',
    name: 'James Wilson',
    company: 'Wilson & Co.',
    rating: 5,
    text: 'Best bookkeeping software we\'ve ever used. The team loves the interface, and our accountant loves the detailed reports.',
    avatar: '/avatars/james.jpg',
    verified: true,
    date: '1 month ago',
    helpful: 19
  }
];

const stats: Stat[] = [
  {
    label: 'Active Users',
    value: '50,000+',
    icon: UserGroupIcon,
    color: 'text-blue-600'
  },
  {
    label: 'Companies Trust Us',
    value: '10,000+',
    icon: ShieldCheckIcon,
    color: 'text-green-600'
  },
  {
    label: 'Countries Served',
    value: '45+',
    icon: GlobeAltIcon,
    color: 'text-purple-600'
  },
  {
    label: 'Money Saved',
    value: '$2.5M+',
    icon: CurrencyDollarIcon,
    color: 'text-yellow-600'
  }
];

const generateRandomSignup = () => {
  const names = ['Alex', 'Sarah', 'Mike', 'Emma', 'David', 'Lisa', 'John', 'Anna'];
  const companies = ['TechCorp', 'StartupXYZ', 'Business Inc', 'Company Ltd', 'Enterprise Co'];
  const locations = ['New York', 'San Francisco', 'London', 'Toronto', 'Sydney'];
  
  const name = names[Math.floor(Math.random() * names.length)];
  const company = companies[Math.floor(Math.random() * companies.length)];
  const location = locations[Math.floor(Math.random() * locations.length)];
  
  return { name, company, location };
};

export default function SocialProof() {
  const [recentSignups, setRecentSignups] = useState<Array<{name: string, company: string, location: string, time: string}>>([]);
  const [currentSignupIndex, setCurrentSignupIndex] = useState(0);
  const [totalSignups, setTotalSignups] = useState(1247);

  // Generate recent signups
  useEffect(() => {
    const signups = Array.from({ length: 5 }, () => {
      const signup = generateRandomSignup();
      return {
        ...signup,
        time: `${Math.floor(Math.random() * 60)} minutes ago`
      };
    });
    setRecentSignups(signups);
  }, []);

  // Rotate through recent signups
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSignupIndex(prev => (prev + 1) % recentSignups.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [recentSignups.length]);

  // Increment total signups
  useEffect(() => {
    const interval = setInterval(() => {
      setTotalSignups(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`w-5 h-5 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <section className="py-24 sm:py-32 bg-gradient-to-br from-gray-50 to-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-base font-semibold leading-7 text-blue-600">Trusted Worldwide</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Join Thousands of Happy Customers
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            See why businesses worldwide choose VeriGrade for their bookkeeping needs.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Real-time Signup Counter */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-16">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-600">Live Activity</span>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {totalSignups.toLocaleString()}+
            </div>
            <div className="text-lg text-gray-600 mb-6">Businesses have joined VeriGrade</div>
            
            {/* Recent Signups */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-2">Recent signups:</div>
              <motion.div
                key={currentSignupIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center"
              >
                {recentSignups[currentSignupIndex] && (
                  <div className="flex items-center justify-center space-x-2">
                    <span className="font-medium text-gray-900">
                      {recentSignups[currentSignupIndex].name}
                    </span>
                    <span className="text-gray-600">from</span>
                    <span className="font-medium text-blue-600">
                      {recentSignups[currentSignupIndex].company}
                    </span>
                    <span className="text-gray-500">
                      in {recentSignups[currentSignupIndex].location}
                    </span>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">What Our Customers Say</h3>
            <div className="flex items-center justify-center space-x-1 mb-2">
              {renderStars(5)}
            </div>
            <p className="text-gray-600">4.9/5 average rating from 2,500+ reviews</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockReviews.map((review, index) => (
              <motion.div
                key={review.id}
                className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {review.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900">{review.name}</h4>
                      {review.verified && (
                        <CheckBadgeIcon className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{review.company}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1 mb-3">
                  {renderStars(review.rating)}
                </div>

                <p className="text-gray-700 mb-4 leading-relaxed">"{review.text}"</p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{review.date}</span>
                  <div className="flex items-center space-x-1">
                    <HeartIcon className="w-4 h-4" />
                    <span>{review.helpful} helpful</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Bookkeeping?</h3>
            <p className="text-blue-100 mb-8 text-lg">
              Join thousands of businesses already saving time and money with VeriGrade
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Start Free Trial
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                Watch Demo
              </button>
            </div>
            <p className="text-blue-100 text-sm mt-4">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
