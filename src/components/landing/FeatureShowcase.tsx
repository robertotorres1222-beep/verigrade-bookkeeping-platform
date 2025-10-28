'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  Shield, 
  Zap, 
  TrendingUp, 
  FileText, 
  Clock, 
  CheckCircle,
  ArrowRight,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  demoSteps: DemoStep[];
  benefits: string[];
  stats?: {
    value: string;
    label: string;
  };
}

interface DemoStep {
  id: string;
  title: string;
  description: string;
  action: string;
  result: string;
  duration: number;
}

const features: Feature[] = [
  {
    id: 'ai-analysis',
    title: 'AI-Powered Financial Analysis',
    description: 'Get instant insights and recommendations powered by advanced AI that understands your business context.',
    icon: BarChart3,
    color: 'from-blue-500 to-purple-600',
    demoSteps: [
      {
        id: 'upload',
        title: 'Upload Financial Data',
        description: 'Drag and drop your financial statements or connect your accounting software',
        action: 'User uploads Q4 2024 P&L statement',
        result: 'AI processes 1,247 transactions in 2.3 seconds',
        duration: 2000
      },
      {
        id: 'analyze',
        title: 'AI Analysis',
        description: 'Advanced algorithms analyze patterns, trends, and anomalies',
        action: 'AI identifies 3 revenue optimization opportunities',
        result: 'Generated 15 actionable insights with 94% confidence',
        duration: 3000
      },
      {
        id: 'recommendations',
        title: 'Smart Recommendations',
        description: 'Get personalized recommendations based on your industry and goals',
        action: 'AI suggests expense reduction strategies',
        result: 'Potential savings: $47,500 annually identified',
        duration: 2500
      }
    ],
    benefits: [
      '94% accuracy in financial predictions',
      'Save 15+ hours per month on analysis',
      'Identify opportunities worth $50K+ annually'
    ],
    stats: {
      value: '94%',
      label: 'Prediction Accuracy'
    }
  },
  {
    id: 'collaboration',
    title: 'Real-Time Team Collaboration',
    description: 'Work seamlessly with your team, clients, and advisors in a unified workspace.',
    icon: Users,
    color: 'from-green-500 to-teal-600',
    demoSteps: [
      {
        id: 'invite',
        title: 'Invite Team Members',
        description: 'Add team members, clients, and external advisors to your workspace',
        action: 'Invite accountant, bookkeeper, and business advisor',
        result: '3 team members added with role-based permissions',
        duration: 1500
      },
      {
        id: 'collaborate',
        title: 'Real-Time Collaboration',
        description: 'See changes as they happen with live cursors and comments',
        action: 'Team reviews Q4 financial statements together',
        result: '5 simultaneous users, 12 comments, 3 approvals',
        duration: 4000
      },
      {
        id: 'approve',
        title: 'Streamlined Approvals',
        description: 'Get instant approvals with digital signatures and audit trails',
        action: 'Submit expense report for approval',
        result: 'Approved in 2 minutes with full audit trail',
        duration: 2000
      }
    ],
    benefits: [
      '50% faster approval processes',
      'Real-time collaboration for all stakeholders',
      'Complete audit trail for compliance'
    ],
    stats: {
      value: '50%',
      label: 'Faster Approvals'
    }
  },
  {
    id: 'security',
    title: 'Enterprise-Grade Security',
    description: 'Bank-level security with SOC 2 compliance, encryption, and advanced access controls.',
    icon: Shield,
    color: 'from-red-500 to-pink-600',
    demoSteps: [
      {
        id: 'encrypt',
        title: 'Data Encryption',
        description: 'All data encrypted in transit and at rest with AES-256 encryption',
        action: 'Upload sensitive financial documents',
        result: 'Documents encrypted with 256-bit encryption',
        duration: 1000
      },
      {
        id: 'authenticate',
        title: 'Multi-Factor Authentication',
        description: 'Secure access with MFA, SSO, and biometric authentication',
        action: 'Enable 2FA for all team members',
        result: 'Security score increased to 98/100',
        duration: 2000
      },
      {
        id: 'audit',
        title: 'Compliance & Auditing',
        description: 'Complete audit logs and compliance reporting for all activities',
        action: 'Generate SOC 2 compliance report',
        result: 'Audit report generated with 100% compliance',
        duration: 3000
      }
    ],
    benefits: [
      'SOC 2 Type II certified',
      '256-bit encryption for all data',
      '99.9% uptime guarantee'
    ],
    stats: {
      value: '99.9%',
      label: 'Uptime SLA'
    }
  },
  {
    id: 'automation',
    title: 'Smart Automation',
    description: 'Automate repetitive tasks with intelligent workflows and rule-based processing.',
    icon: Zap,
    color: 'from-yellow-500 to-orange-600',
    demoSteps: [
      {
        id: 'rules',
        title: 'Smart Rules Engine',
        description: 'Create intelligent rules that automatically categorize and process transactions',
        action: 'Set up auto-categorization for recurring expenses',
        result: '87% of transactions auto-categorized',
        duration: 2000
      },
      {
        id: 'workflows',
        title: 'Automated Workflows',
        description: 'Build custom workflows for approval processes and notifications',
        action: 'Create expense approval workflow',
        result: 'Workflow processes 45 transactions automatically',
        duration: 3500
      },
      {
        id: 'reports',
        title: 'Automated Reporting',
        description: 'Generate and distribute reports automatically on schedule',
        action: 'Schedule monthly financial reports',
        result: 'Reports sent to 12 stakeholders automatically',
        duration: 1500
      }
    ],
    benefits: [
      '87% reduction in manual data entry',
      'Automated workflows save 20+ hours weekly',
      'Real-time notifications and alerts'
    ],
    stats: {
      value: '87%',
      label: 'Less Manual Work'
    }
  },
  {
    id: 'insights',
    title: 'Advanced Analytics & Insights',
    description: 'Deep dive into your financial data with powerful analytics and predictive insights.',
    icon: TrendingUp,
    color: 'from-indigo-500 to-blue-600',
    demoSteps: [
      {
        id: 'dashboard',
        title: 'Interactive Dashboards',
        description: 'Create custom dashboards with real-time financial metrics',
        action: 'Build executive dashboard with KPIs',
        result: 'Dashboard shows 15 key metrics in real-time',
        duration: 2500
      },
      {
        id: 'forecasting',
        title: 'Predictive Analytics',
        description: 'AI-powered forecasting for cash flow and revenue predictions',
        action: 'Generate 12-month cash flow forecast',
        result: 'Forecast shows 23% revenue growth potential',
        duration: 4000
      },
      {
        id: 'benchmarking',
        title: 'Industry Benchmarking',
        description: 'Compare your performance against industry standards',
        action: 'Run industry benchmark analysis',
        result: 'Performance ranked in top 15% of industry',
        duration: 3000
      }
    ],
    benefits: [
      'Predictive accuracy up to 95%',
      'Industry benchmarking included',
      'Real-time KPI monitoring'
    ],
    stats: {
      value: '95%',
      label: 'Forecast Accuracy'
    }
  },
  {
    id: 'compliance',
    title: 'Tax & Compliance Management',
    description: 'Stay compliant with automated tax calculations, form generation, and deadline tracking.',
    icon: FileText,
    color: 'from-purple-500 to-violet-600',
    demoSteps: [
      {
        id: 'tax-prep',
        title: 'Automated Tax Preparation',
        description: 'AI-powered tax preparation with automatic form generation',
        action: 'Prepare Q4 tax returns for 5 entities',
        result: 'All forms generated and validated automatically',
        duration: 3000
      },
      {
        id: 'deadlines',
        title: 'Deadline Management',
        description: 'Never miss important deadlines with automated reminders',
        action: 'Set up tax deadline alerts',
        result: '15 deadlines tracked with smart reminders',
        duration: 1500
      },
      {
        id: 'audit',
        title: 'Audit Trail',
        description: 'Complete audit trail for all tax-related activities',
        action: 'Generate audit report for tax year',
        result: 'Comprehensive audit trail with 100% compliance',
        duration: 2500
      }
    ],
    benefits: [
      '100% tax compliance guarantee',
      'Automated form generation',
      'Never miss important deadlines'
    ],
    stats: {
      value: '100%',
      label: 'Compliance Rate'
    }
  }
];

const FeatureShowcase: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<Feature>(features[0]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  // Auto-play demo steps
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (currentStep < activeFeature.demoSteps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setIsPlaying(false);
        setCurrentStep(0);
      }
    }, activeFeature.demoSteps[currentStep]?.duration || 2000);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, activeFeature.demoSteps]);

  const handleFeatureClick = (feature: Feature) => {
    setActiveFeature(feature);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    if (currentStep === activeFeature.demoSteps.length - 1) {
      setCurrentStep(0);
    }
    setIsPlaying(!isPlaying);
  };

  const resetDemo = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const currentDemoStep = activeFeature.demoSteps[currentStep];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
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
              Powerful Features That Drive Results
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of financial management with our comprehensive suite of AI-powered tools and features.
            </p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Feature Navigation */}
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">
              Explore Our Features
            </h3>
            
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative cursor-pointer transition-all duration-300 ${
                  activeFeature.id === feature.id
                    ? 'transform scale-105'
                    : 'hover:transform hover:scale-102'
                }`}
                onClick={() => handleFeatureClick(feature)}
                onMouseEnter={() => setHoveredFeature(feature.id)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                  activeFeature.id === feature.id
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : hoveredFeature === feature.id
                    ? 'border-gray-300 bg-white shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}>
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${feature.color} text-white`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {feature.title}
                      </h4>
                      <p className="text-gray-600 text-sm mb-3">
                        {feature.description}
                      </p>
                      
                      {feature.stats && (
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl font-bold text-blue-600">
                            {feature.stats.value}
                          </div>
                          <div className="text-sm text-gray-500">
                            {feature.stats.label}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <ArrowRight className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${
                      activeFeature.id === feature.id ? 'rotate-90' : ''
                    }`} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Interactive Demo */}
          <div className="lg:sticky lg:top-8">
            <motion.div
              key={activeFeature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Demo Header */}
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${activeFeature.color}`}>
                      <activeFeature.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{activeFeature.title}</h3>
                      <p className="text-gray-300 text-sm">Interactive Demo</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={togglePlayPause}
                      className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      onClick={resetDemo}
                      className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                    >
                      <RotateCcw className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-white/20 rounded-full h-2">
                  <motion.div
                    className={`h-2 rounded-full bg-gradient-to-r ${activeFeature.color}`}
                    initial={{ width: 0 }}
                    animate={{ 
                      width: isPlaying 
                        ? `${((currentStep + 1) / activeFeature.demoSteps.length) * 100}%`
                        : `${(currentStep / activeFeature.demoSteps.length) * 100}%`
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Demo Content */}
              <div className="p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-center mb-8">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${activeFeature.color} text-white mb-4`}>
                        <span className="text-2xl font-bold">{currentStep + 1}</span>
                      </div>
                      <h4 className="text-2xl font-semibold text-gray-900 mb-2">
                        {currentDemoStep.title}
                      </h4>
                      <p className="text-gray-600">
                        {currentDemoStep.description}
                      </p>
                    </div>

                    {/* Demo Simulation */}
                    <div className="bg-gray-50 rounded-xl p-6 mb-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-500 ml-4">Demo Browser</span>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 border">
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-gray-700">Action:</span>
                          </div>
                          <p className="text-gray-600 text-sm mb-3">
                            {currentDemoStep.action}
                          </p>
                          
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-gray-700">Result:</span>
                          </div>
                          <p className="text-gray-600 text-sm">
                            {currentDemoStep.result}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Benefits */}
                    <div className="space-y-3">
                      <h5 className="font-semibold text-gray-900 mb-3">Key Benefits:</h5>
                      {activeFeature.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Experience These Features?
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join thousands of businesses already using VeriGrade to streamline their financial management and drive growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                Start Free Trial
              </button>
              <button className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors">
                Schedule Demo
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureShowcase;
