'use client';

import { motion } from 'framer-motion';
import VeriGradeLogo from '../../components/VeriGradeLogo';
import MFAManager from '../../components/Security/MFAManager';
import SSOProvider from '../../components/Security/SSOProvider';
import AuditLogViewer from '../../components/Security/AuditLogViewer';
import { 
  ShieldCheckIcon,
  LockClosedIcon,
  KeyIcon,
  EyeIcon,
  DocumentCheckIcon,
  ServerIcon,
  CloudIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  UserGroupIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

export default function SecurityPage() {
  const securityFeatures = [
    {
      title: 'SOC 2 Type II Compliance',
      description: 'We maintain the highest standards of security with SOC 2 Type II certification, ensuring your data is protected according to industry best practices.',
      icon: ShieldCheckIcon,
      status: 'Certified',
      details: [
        'Annual third-party security audits',
        'Comprehensive security controls documentation',
        'Regular compliance monitoring',
        'Continuous improvement processes'
      ]
    },
    {
      title: 'End-to-End Encryption',
      description: 'All data is encrypted using AES-256 encryption, both in transit and at rest, providing military-grade security for your financial information.',
      icon: LockClosedIcon,
      status: 'AES-256',
      details: [
        '256-bit Advanced Encryption Standard',
        'TLS 1.3 for data in transit',
        'Encrypted database storage',
        'Secure key management system'
      ]
    },
    {
      title: 'Multi-Factor Authentication',
      description: 'Protect your account with multiple layers of authentication, including SMS, email, and authenticator app support.',
      icon: KeyIcon,
      status: 'Enabled',
      details: [
        'SMS and email verification',
        'Authenticator app integration',
        'Hardware token support',
        'Biometric authentication'
      ]
    },
    {
      title: 'Role-Based Access Control',
      description: 'Granular permissions system that ensures users only access the data and features they need for their role.',
      icon: UserGroupIcon,
      status: 'Granular',
      details: [
        'Custom role definitions',
        'Permission-based access',
        'Team member management',
        'Audit trail for all actions'
      ]
    },
    {
      title: 'Data Privacy & GDPR',
      description: 'Full compliance with GDPR and other privacy regulations, ensuring your data rights are protected and respected.',
      icon: EyeIcon,
      status: 'GDPR Compliant',
      details: [
        'Right to data portability',
        'Right to be forgotten',
        'Data processing transparency',
        'Privacy by design principles'
      ]
    },
    {
      title: 'Regular Security Audits',
      description: 'Continuous monitoring and regular penetration testing to identify and address potential security vulnerabilities.',
      icon: DocumentCheckIcon,
      status: 'Ongoing',
      details: [
        'Quarterly penetration testing',
        'Continuous vulnerability scanning',
        'Security incident response plan',
        'Regular security training for staff'
      ]
    }
  ];

  const complianceStandards = [
    { name: 'SOC 2 Type II', status: 'Certified', description: 'Security, availability, and confidentiality controls' },
    { name: 'GDPR', status: 'Compliant', description: 'General Data Protection Regulation compliance' },
    { name: 'CCPA', status: 'Compliant', description: 'California Consumer Privacy Act compliance' },
    { name: 'HIPAA', status: 'Ready', description: 'Healthcare data protection standards' },
    { name: 'ISO 27001', status: 'In Progress', description: 'Information security management system' }
  ];

  const securityMetrics = [
    { metric: 'Uptime', value: '99.9%', description: 'Service availability guarantee' },
    { metric: 'Encryption', value: 'AES-256', description: 'Industry-standard encryption' },
    { metric: 'Audit Frequency', value: 'Quarterly', description: 'Regular security assessments' },
    { metric: 'Data Retention', value: 'Configurable', description: 'Flexible data lifecycle management' }
  ];

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <VeriGradeLogo className="mx-auto h-16 w-16 text-white mb-6" />
              <h1 className="text-4xl font-bold text-white mb-4">
                Enterprise-Grade Security
              </h1>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                Your financial data is protected with bank-level security, advanced encryption, 
                and comprehensive compliance standards.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Security Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Comprehensive Security Features
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We implement multiple layers of security to protect your business data 
            and ensure compliance with industry standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {securityFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {feature.status}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4">
                {feature.description}
              </p>
              
              <ul className="space-y-2">
                {feature.details.map((detail, detailIndex) => (
                  <li key={detailIndex} className="flex items-start">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{detail}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Compliance Standards */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Compliance & Certifications
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We maintain the highest standards of compliance and security certifications 
              to ensure your data is protected according to industry best practices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {complianceStandards.map((standard, index) => (
              <motion.div
                key={standard.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white border border-gray-200 rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {standard.name}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    standard.status === 'Certified' ? 'bg-green-100 text-green-800' :
                    standard.status === 'Compliant' ? 'bg-blue-100 text-blue-800' :
                    standard.status === 'Ready' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {standard.status}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">
                  {standard.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Metrics */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Security Metrics
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our security performance speaks for itself with industry-leading metrics 
            and continuous monitoring.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {securityMetrics.map((metric, index) => (
            <motion.div
              key={metric.metric}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white border border-gray-200 rounded-lg p-6 text-center"
            >
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {metric.value}
              </div>
              <div className="text-lg font-semibold text-gray-900 mb-1">
                {metric.metric}
              </div>
              <div className="text-sm text-gray-600">
                {metric.description}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Security Management Tools */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Security Management
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Take control of your security settings with our comprehensive management tools.
            </p>
          </div>

          <div className="space-y-8">
            {/* MFA Management */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <MFAManager userId="current-user" />
            </div>

            {/* SSO Management */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <SSOProvider />
            </div>

            {/* Audit Logs */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <AuditLogViewer />
            </div>
          </div>
        </div>
      </div>

      {/* Security Best Practices */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Security Best Practices
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Follow these security best practices to keep your account and data secure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              For Administrators
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Enable MFA for all user accounts</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Regularly review and update user permissions</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Monitor audit logs for suspicious activity</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Use strong, unique passwords for all accounts</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Keep software and systems updated</span>
              </li>
            </ul>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              For Users
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Never share your login credentials</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Log out when using shared computers</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Report suspicious activity immediately</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Use secure networks when accessing sensitive data</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Keep your contact information updated</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Contact Security Team */}
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-white mb-4">
                Security Questions?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Our security team is available 24/7 to help with any security concerns 
                or questions you may have.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:security@verigrade.com"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 transition-colors duration-200"
                >
                  <ShieldCheckIcon className="h-5 w-5 mr-2" />
                  Contact Security Team
                </a>
                <a
                  href="/support"
                  className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-blue-700 transition-colors duration-200"
                >
                  <ArrowRightIcon className="h-5 w-5 mr-2" />
                  Security Documentation
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}