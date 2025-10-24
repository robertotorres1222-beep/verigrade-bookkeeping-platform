'use client';

import { motion } from 'framer-motion';
import { 
  ShieldCheckIcon, 
  LockClosedIcon, 
  CheckBadgeIcon,
  GlobeAltIcon,
  ServerIcon,
  DocumentCheckIcon
} from '@heroicons/react/24/outline';

interface TrustBadge {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  color: string;
}

const trustBadges: TrustBadge[] = [
  {
    icon: ShieldCheckIcon,
    title: 'SOC 2 Type II',
    description: 'Security audited',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: LockClosedIcon,
    title: '256-bit SSL',
    description: 'Bank-level encryption',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: CheckBadgeIcon,
    title: 'GDPR Compliant',
    description: 'EU data protection',
    color: 'from-purple-500 to-violet-500'
  },
  {
    icon: GlobeAltIcon,
    title: '99.9% Uptime',
    description: 'Reliable service',
    color: 'from-orange-500 to-red-500'
  },
  {
    icon: ServerIcon,
    title: 'AWS Hosted',
    description: 'Enterprise infrastructure',
    color: 'from-indigo-500 to-blue-500'
  },
  {
    icon: DocumentCheckIcon,
    title: 'ISO 27001',
    description: 'Information security',
    color: 'from-teal-500 to-green-500'
  }
];

const customerLogos = [
  { name: 'TechStart Inc', logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=40&fit=crop&crop=center' },
  { name: 'GrowthCorp', logo: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=100&h=40&fit=crop&crop=center' },
  { name: 'StartupXYZ', logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=40&fit=crop&crop=center' },
  { name: 'InnovateLab', logo: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=100&h=40&fit=crop&crop=center' },
  { name: 'ScaleUp', logo: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=100&h=40&fit=crop&crop=center' },
  { name: 'FutureTech', logo: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=100&h=40&fit=crop&crop=center' }
];

export default function TrustBadges() {
  return (
    <div className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Trust Badges */}
        <div className="text-center mb-16">
          <motion.h2 
            className="text-2xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Trusted by thousands of businesses worldwide
          </motion.h2>
          <motion.p 
            className="text-lg text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Enterprise-grade security and compliance you can trust
          </motion.p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-16">
          {trustBadges.map((badge, index) => (
            <motion.div
              key={badge.title}
              className="flex flex-col items-center text-center group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${badge.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <badge.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">{badge.title}</h3>
              <p className="text-xs text-gray-600">{badge.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Customer Logos */}
        <div className="border-t border-gray-200 pt-16">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Join 10,000+ companies already using VeriGrade
            </h3>
            <p className="text-gray-600">
              From startups to enterprise, businesses trust VeriGrade for their bookkeeping
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
            {customerLogos.map((customer, index) => (
              <motion.div
                key={customer.name}
                className="flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity duration-300"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 0.6, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ opacity: 1, scale: 1.05 }}
              >
                <img
                  src={customer.logo}
                  alt={customer.name}
                  className="h-8 w-auto filter grayscale hover:grayscale-0 transition-all duration-300"
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Real-time Stats */}
        <motion.div 
          className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <motion.div 
                className="text-3xl font-bold text-blue-600 mb-2"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                10,000+
              </motion.div>
              <p className="text-sm text-gray-600">Active Users</p>
            </div>
            <div>
              <motion.div 
                className="text-3xl font-bold text-purple-600 mb-2"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
              >
                $2.5B+
              </motion.div>
              <p className="text-sm text-gray-600">Transactions Processed</p>
            </div>
            <div>
              <motion.div 
                className="text-3xl font-bold text-green-600 mb-2"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                viewport={{ once: true }}
              >
                99.9%
              </motion.div>
              <p className="text-sm text-gray-600">Uptime SLA</p>
            </div>
            <div>
              <motion.div 
                className="text-3xl font-bold text-orange-600 mb-2"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                viewport={{ once: true }}
              >
                4.9/5
              </motion.div>
              <p className="text-sm text-gray-600">Customer Rating</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
