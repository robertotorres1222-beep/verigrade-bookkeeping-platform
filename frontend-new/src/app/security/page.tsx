'use client';

import { useState } from 'react';
import { 
  ShieldCheckIcon,
  LockClosedIcon,
  ServerIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserGroupIcon,
  InformationCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState('current');

  const currentFeatures = [
    {
      title: 'Basic Encryption & HTTPS',
      description: 'Data is encrypted using HTTPS/TLS and secure database connections.',
      icon: LockClosedIcon,
      details: [
        'HTTPS/TLS encryption for data in transit',
        'Secure database connections with Prisma ORM',
        'Password hashing with bcrypt',
        'JWT token authentication'
      ],
      status: 'implemented'
    },
    {
      title: 'Authentication System',
      description: 'Secure login and registration with password protection.',
      icon: UserGroupIcon,
      details: [
        'Email/password authentication',
        'JWT token-based sessions',
        'Password strength requirements',
        'Account verification system'
      ],
      status: 'implemented'
    },
    {
      title: 'Database Security',
      description: 'Secure database storage with proper access controls.',
      icon: ServerIcon,
      details: [
        'Prisma ORM with secure queries',
        'Database access controls',
        'Input validation and sanitization',
        'Protected API endpoints'
      ],
      status: 'implemented'
    }
  ];

  const plannedFeatures = [
    {
      title: 'Multi-Factor Authentication',
      description: 'Additional security layers beyond passwords.',
      icon: UserGroupIcon,
      details: [
        'SMS verification',
        'Authenticator app support',
        'Hardware key support',
        'Biometric authentication'
      ],
      status: 'planned',
      timeline: 'Q1 2025'
    },
    {
      title: 'Advanced Encryption',
      description: 'Enterprise-grade encryption for all data.',
      icon: LockClosedIcon,
      details: [
        'AES-256 encryption at rest',
        'Enhanced key management',
        'Database encryption',
        'Field-level encryption'
      ],
      status: 'planned',
      timeline: 'Q2 2025'
    },
    {
      title: 'Automated Backups',
      description: 'Comprehensive backup and recovery system.',
      icon: ServerIcon,
      details: [
        'Daily automated backups',
        'Geographic redundancy',
        'Point-in-time recovery',
        '99.99% uptime SLA'
      ],
      status: 'planned',
      timeline: 'Q2 2025'
    },
    {
      title: 'Security Audits',
      description: 'Regular security assessments and certifications.',
      icon: ShieldCheckIcon,
      details: [
        'Annual security audits',
        'Third-party penetration testing',
        'Compliance monitoring',
        'Regular security assessments'
      ],
      status: 'planned',
      timeline: 'Q3 2025'
    }
  ];

  const complianceRoadmap = [
    {
      name: 'SOC 2 Type II',
      description: 'Security, availability, and confidentiality controls',
      status: 'Planned',
      timeline: 'Q3-Q4 2025',
      cost: '$15,000 - $25,000',
      duration: '6-12 months',
      requirements: [
        'Hire CPA firm (PwC, Deloitte, or local)',
        'Implement required security controls',
        'Complete Type I audit first, then Type II',
        'Annual audits to maintain certification'
      ]
    },
    {
      name: 'GDPR Compliant',
      description: 'European data protection regulation compliance',
      status: 'In Progress',
      timeline: 'Q2 2025',
      cost: '$5,000 - $10,000',
      duration: '3-6 months',
      requirements: [
        'Implement data privacy controls',
        'Create privacy policies',
        'Set up data subject rights management',
        'Conduct privacy impact assessments'
      ]
    },
    {
      name: 'CCPA Compliant',
      description: 'California Consumer Privacy Act compliance',
      status: 'In Progress',
      timeline: 'Q2 2025',
      cost: '$3,000 - $7,000',
      duration: '2-4 months',
      requirements: [
        'Implement privacy controls',
        'Create data processing agreements',
        'Set up consumer rights management',
        'Regular compliance monitoring'
      ]
    },
    {
      name: 'ISO 27001',
      description: 'Information security management system',
      status: 'Planned',
      timeline: 'Q4 2025',
      cost: '$20,000 - $40,000',
      duration: '12-18 months',
      requirements: [
        'Develop Information Security Management System',
        'Implement 114 security controls',
        'Hire ISO 27001 consultant',
        '3-year certification cycle'
      ]
    }
  ];

  const recentUpdates = [
    {
      date: '2025-01-15',
      title: 'Basic Security Implementation',
      description: 'Implemented core security features including authentication, HTTPS, and database security.',
      severity: 'Medium',
      status: 'Completed'
    },
    {
      date: '2025-01-10',
      title: 'Password Security Enhancement',
      description: 'Enhanced password requirements and implemented bcrypt hashing.',
      severity: 'Low',
      status: 'Completed'
    },
    {
      date: '2025-01-12',
      title: 'API Security Review',
      description: 'Reviewing and enhancing API endpoint security and validation.',
      severity: 'Medium',
      status: 'In Progress'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'implemented':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'planned':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <XCircleIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'implemented':
        return 'bg-green-100 text-green-800';
      case 'planned':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Security &
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600"> Privacy</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              Your financial data security is our top priority. We're building enterprise-grade security measures 
              to protect your sensitive business information and ensure compliance with industry standards.
            </p>
            
            {/* Transparency Notice */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-4xl mx-auto">
              <div className="flex items-center justify-center">
                <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-2" />
                <p className="text-blue-800 text-sm">
                  <strong>Transparency Notice:</strong> This page shows our current security status and roadmap. 
                  We believe in honest communication about our security posture.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="py-8 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 justify-center">
            <button
              onClick={() => setActiveTab('current')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'current'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ✅ Current Features
            </button>
            <button
              onClick={() => setActiveTab('planned')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'planned'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🚀 Coming Soon
            </button>
            <button
              onClick={() => setActiveTab('compliance')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'compliance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📋 Compliance Roadmap
            </button>
            <button
              onClick={() => setActiveTab('status')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'status'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🔍 Security Status
            </button>
          </nav>
        </div>
      </section>

      {/* Current Features Tab */}
      {activeTab === 'current' && (
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">✅ Currently Implemented</h2>
              <p className="text-lg text-gray-600">Security features that are live and protecting your data today</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentFeatures.map((feature, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border-2 border-green-200 p-8">
                  <div className="flex items-center mb-6">
                    {getStatusIcon(feature.status)}
                    <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mr-4 ml-2">
                      <feature.icon className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-center text-sm text-gray-600">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Planned Features Tab */}
      {activeTab === 'planned' && (
        <section className="py-24 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">🚀 Coming Soon</h2>
              <p className="text-lg text-gray-600">Advanced security features we're building for you</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {plannedFeatures.map((feature, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border-2 border-yellow-200 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      {getStatusIcon(feature.status)}
                      <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mr-4 ml-2">
                        <feature.icon className="h-6 w-6 text-yellow-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {feature.timeline}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-center text-sm text-gray-600">
                        <ClockIcon className="h-4 w-4 text-yellow-500 mr-2" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Compliance Tab */}
      {activeTab === 'compliance' && (
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">📋 Compliance & Certification Roadmap</h2>
              <p className="text-lg text-gray-600">Our plan to meet the highest industry standards</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {complianceRoadmap.map((item, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-6">{item.description}</p>
                  
                  <div className="space-y-3 text-sm mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Timeline:</span>
                      <span className="font-medium">{item.timeline}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Estimated Cost:</span>
                      <span className="font-medium">{item.cost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Duration:</span>
                      <span className="font-medium">{item.duration}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Key Requirements:</h4>
                    <ul className="space-y-1">
                      {item.requirements.map((req, reqIndex) => (
                        <li key={reqIndex} className="text-sm text-gray-600 flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* How to Get Certifications */}
            <div className="bg-blue-50 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-blue-900 mb-6">💡 How to Get These Certifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-blue-900 mb-3">SOC 2 Type II Process:</h4>
                  <ol className="space-y-2 text-blue-800 text-sm">
                    <li>1. Hire a CPA firm (PwC, Deloitte, or local firm)</li>
                    <li>2. Implement required security controls (6-12 months)</li>
                    <li>3. Complete Type I audit first, then Type II</li>
                    <li>4. Annual audits required to maintain certification</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-3">GDPR/CCPA Process:</h4>
                  <ol className="space-y-2 text-blue-800 text-sm">
                    <li>1. Implement data privacy controls and procedures</li>
                    <li>2. Create privacy policies and data processing agreements</li>
                    <li>3. Set up data subject rights management</li>
                    <li>4. Conduct privacy impact assessments</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-3">ISO 27001 Process:</h4>
                  <ol className="space-y-2 text-blue-800 text-sm">
                    <li>1. Develop Information Security Management System (ISMS)</li>
                    <li>2. Implement 114 security controls</li>
                    <li>3. Hire ISO 27001 consultant or certification body</li>
                    <li>4. 3-year certification cycle with annual surveillance audits</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-3">Estimated Total Investment:</h4>
                  <div className="space-y-2 text-blue-800 text-sm">
                    <div>• SOC 2: $15,000 - $25,000</div>
                    <div>• GDPR/CCPA: $8,000 - $17,000</div>
                    <div>• ISO 27001: $20,000 - $40,000</div>
                    <div className="font-semibold pt-2 border-t border-blue-200">
                      Total: $43,000 - $82,000
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Security Status Tab */}
      {activeTab === 'status' && (
        <section className="py-24 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">🔍 Current Security Status</h2>
              <p className="text-lg text-gray-600">Real-time updates on our security implementation</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Security Updates</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {recentUpdates.map((update, index) => (
                  <div key={index} className="px-6 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{update.title}</h4>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(update.severity)}`}>
                          {update.severity}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          update.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          update.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {update.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-2">{update.description}</p>
                    <p className="text-sm text-gray-500">{update.date}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Report Security Issues */}
            <div className="bg-green-600 rounded-xl p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">
                Report Security Issues
              </h3>
              <p className="text-lg text-green-100 mb-8 max-w-2xl mx-auto">
                If you discover a security vulnerability, please report it to our security team. 
                We take all security concerns seriously and respond promptly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:verigradebookkeeping+security@gmail.com"
                  className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  verigrade+security@gmail.com
                </a>
                <a
                  href="/contact"
                  className="bg-transparent text-white border border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
                >
                  Contact Security Team
                </a>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}