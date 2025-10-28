'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ClockIcon,
  ServerIcon,
  CircleStackIcon,
  GlobeAltIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

export default function StatusPage() {
  const [systemStatus, setSystemStatus] = useState({
    overall: 'operational',
    uptime: '99.99%',
    responseTime: '45ms',
    lastIncident: '2024-01-15'
  });

  const [services] = useState([
    {
      name: 'API Services',
      status: 'operational',
      uptime: '99.99%',
      responseTime: '42ms',
      description: 'Core API endpoints and authentication'
    },
    {
      name: 'Database',
      status: 'operational',
      uptime: '99.98%',
      responseTime: '12ms',
      description: 'Primary database and data storage'
    },
    {
      name: 'File Storage',
      status: 'operational',
      uptime: '99.97%',
      responseTime: '89ms',
      description: 'Document and receipt storage'
    },
    {
      name: 'Email Service',
      status: 'operational',
      uptime: '99.95%',
      responseTime: '156ms',
      description: 'Transaction notifications and alerts'
    },
    {
      name: 'Banking Integration',
      status: 'operational',
      uptime: '99.92%',
      responseTime: '234ms',
      description: 'Third-party banking API connections'
    },
    {
      name: 'AI Processing',
      status: 'operational',
      uptime: '99.89%',
      responseTime: '1.2s',
      description: 'Receipt processing and categorization'
    }
  ]);

  const [recentIncidents] = useState([
    {
      id: 'INC-2024-001',
      title: 'Scheduled Maintenance - Database Optimization',
      status: 'resolved',
      severity: 'minor',
      startTime: '2024-01-15 02:00 UTC',
      endTime: '2024-01-15 03:30 UTC',
      description: 'Routine database maintenance to improve query performance. All services remained operational with minimal impact.',
      affectedServices: ['Database', 'API Services']
    },
    {
      id: 'INC-2024-002',
      title: 'Banking API Rate Limit Issues',
      status: 'resolved',
      severity: 'minor',
      startTime: '2024-01-10 14:30 UTC',
      endTime: '2024-01-10 15:45 UTC',
      description: 'Temporary issues with banking partner API rate limits. Implemented improved retry logic and caching.',
      affectedServices: ['Banking Integration']
    },
    {
      id: 'INC-2024-003',
      title: 'Email Service Degradation',
      status: 'resolved',
      severity: 'minor',
      startTime: '2024-01-05 09:15 UTC',
      endTime: '2024-01-05 10:30 UTC',
      description: 'Slower email delivery due to provider issues. Switched to backup email provider.',
      affectedServices: ['Email Service']
    }
  ]);

  const [performanceMetrics] = useState([
    {
      name: 'Average Response Time',
      value: '45ms',
      trend: 'down',
      change: '-12%',
      target: '< 100ms'
    },
    {
      name: 'Error Rate',
      value: '0.01%',
      trend: 'down',
      change: '-25%',
      target: '< 0.1%'
    },
    {
      name: 'Uptime',
      value: '99.99%',
      trend: 'up',
      change: '+0.02%',
      target: '> 99.9%'
    },
    {
      name: 'Active Users',
      value: '2,847',
      trend: 'up',
      change: '+15%',
      target: 'Growing'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-600 bg-green-100';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100';
      case 'outage':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return CheckCircleIcon;
      case 'degraded':
        return ExclamationTriangleIcon;
      case 'outage':
        return XCircleIcon;
      default:
        return ClockIcon;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'major':
        return 'bg-orange-100 text-orange-800';
      case 'minor':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              System
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600"> Status</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              Real-time status of VeriGrade services and infrastructure. 
              We're committed to providing transparent, up-to-date information about our system performance.
            </p>
          </div>
        </div>
      </section>

      {/* Overall Status */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                {(() => {
                  const Icon = getStatusIcon(systemStatus.overall);
                  return <Icon className={`h-8 w-8 mr-3 ${getStatusColor(systemStatus.overall).split(' ')[0]}`} />;
                })()}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">All Systems Operational</h2>
                  <p className="text-gray-600">All services are running normally</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600">{systemStatus.uptime}</div>
                <div className="text-sm text-gray-600">Uptime (30 days)</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{systemStatus.responseTime}</div>
                <div className="text-sm text-gray-600">Average Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">0.01%</div>
                <div className="text-sm text-gray-600">Error Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{systemStatus.lastIncident}</div>
                <div className="text-sm text-gray-600">Last Incident</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Status */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Service Status</h2>
            <p className="text-lg text-gray-600">Individual service performance and availability</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => {
              const Icon = getStatusIcon(service.status);
              return (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Icon className={`h-6 w-6 mr-3 ${getStatusColor(service.status).split(' ')[0]}`} />
                      <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                      {service.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{service.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Uptime:</span>
                      <span className="font-medium text-gray-900">{service.uptime}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Response Time:</span>
                      <span className="font-medium text-gray-900">{service.responseTime}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Performance Metrics */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Performance Metrics</h2>
            <p className="text-lg text-gray-600">Key performance indicators and trends</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {performanceMetrics.map((metric, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <ChartBarIcon className="h-6 w-6 text-blue-600" />
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    metric.trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {metric.change}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
                <div className="text-sm text-gray-600 mb-2">{metric.name}</div>
                <div className="text-xs text-gray-500">Target: {metric.target}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Incidents */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Recent Incidents</h2>
            <p className="text-lg text-gray-600">Historical incidents and their resolution</p>
          </div>

          <div className="space-y-6">
            {recentIncidents.map((incident) => (
              <div key={incident.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 mr-3">{incident.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                        {incident.severity}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{incident.description}</p>
                  </div>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {incident.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Incident ID:</span>
                    <div className="font-medium text-gray-900">{incident.id}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Duration:</span>
                    <div className="font-medium text-gray-900">
                      {incident.startTime} - {incident.endTime}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Affected Services:</span>
                    <div className="font-medium text-gray-900">{incident.affectedServices.join(', ')}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subscribe to Updates */}
      <section className="py-16 bg-blue-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Subscribe to status updates and get notified immediately when there are any service issues or maintenance windows.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border-0 text-gray-900 placeholder-gray-500"
            />
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Subscribe
            </button>
          </div>
          <p className="text-sm text-blue-200 mt-4">
            You can unsubscribe at any time. We'll only send you important status updates.
          </p>
        </div>
      </section>
    </div>
  );
}
