'use client';

import { 
  LinkIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  CogIcon,
  CloudIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChartBarIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

export default function IntegrationsPage() {
  const categories = [
    {
      name: 'Accounting & Finance',
      icon: CurrencyDollarIcon,
      description: 'Connect with accounting software and financial tools',
      integrations: [
        { name: 'QuickBooks Online', logo: 'QB', status: 'popular', description: 'Sync transactions and financial data' },
        { name: 'Xero', logo: 'X', status: 'available', description: 'Real-time accounting integration' },
        { name: 'Sage', logo: 'SG', status: 'available', description: 'Comprehensive business accounting' },
        { name: 'FreshBooks', logo: 'FB', status: 'available', description: 'Simple invoicing and accounting' }
      ]
    },
    {
      name: 'E-commerce',
      icon: ShoppingCartIcon,
      description: 'Connect with online stores and marketplaces',
      integrations: [
        { name: 'Shopify', logo: 'SP', status: 'popular', description: 'E-commerce platform integration' },
        { name: 'WooCommerce', logo: 'WC', status: 'available', description: 'WordPress e-commerce solution' },
        { name: 'Amazon', logo: 'AM', status: 'available', description: 'Amazon marketplace integration' },
        { name: 'eBay', logo: 'EB', status: 'available', description: 'eBay seller integration' },
        { name: 'Etsy', logo: 'ET', status: 'available', description: 'Etsy marketplace connection' }
      ]
    },
    {
      name: 'Payment Processing',
      icon: CurrencyDollarIcon,
      description: 'Connect with payment gateways and processors',
      integrations: [
        { name: 'Stripe', logo: 'ST', status: 'popular', description: 'Online payment processing' },
        { name: 'PayPal', logo: 'PP', status: 'available', description: 'Global payment platform' },
        { name: 'Square', logo: 'SQ', status: 'available', description: 'Point of sale integration' },
        { name: 'Authorize.Net', logo: 'AN', status: 'available', description: 'Payment gateway solution' }
      ]
    },
    {
      name: 'CRM & Sales',
      icon: UserGroupIcon,
      description: 'Connect with customer relationship management tools',
      integrations: [
        { name: 'Salesforce', logo: 'SF', status: 'popular', description: 'Customer relationship management' },
        { name: 'HubSpot', logo: 'HS', status: 'available', description: 'Inbound marketing and sales' },
        { name: 'Pipedrive', logo: 'PD', status: 'available', description: 'Sales pipeline management' },
        { name: 'Zoho CRM', logo: 'ZC', status: 'available', description: 'Complete CRM solution' }
      ]
    },
    {
      name: 'Communication',
      icon: EnvelopeIcon,
      description: 'Connect with communication and collaboration tools',
      integrations: [
        { name: 'Slack', logo: 'SL', status: 'popular', description: 'Team communication platform' },
        { name: 'Microsoft Teams', logo: 'MT', status: 'available', description: 'Collaboration and meetings' },
        { name: 'Zoom', logo: 'ZM', status: 'available', description: 'Video conferencing solution' },
        { name: 'Gmail', logo: 'GM', status: 'available', description: 'Email integration' }
      ]
    },
    {
      name: 'Productivity',
      icon: DocumentTextIcon,
      description: 'Connect with productivity and project management tools',
      integrations: [
        { name: 'Asana', logo: 'AS', status: 'popular', description: 'Project management platform' },
        { name: 'Trello', logo: 'TR', status: 'available', description: 'Visual project management' },
        { name: 'Monday.com', logo: 'MN', status: 'available', description: 'Work operating system' },
        { name: 'Notion', logo: 'NT', status: 'available', description: 'All-in-one workspace' }
      ]
    }
  ];

  const popularIntegrations = [
    { name: 'QuickBooks Online', logo: 'QB', users: '50,000+', description: 'Most popular accounting integration' },
    { name: 'Shopify', logo: 'SP', users: '25,000+', description: 'Leading e-commerce platform' },
    { name: 'Stripe', logo: 'ST', users: '30,000+', description: 'Secure payment processing' },
    { name: 'Salesforce', logo: 'SF', users: '15,000+', description: 'Enterprise CRM solution' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'popular': return 'bg-green-100 text-green-800';
      case 'available': return 'bg-blue-100 text-blue-800';
      case 'coming-soon': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Integrations
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"> Marketplace</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              Connect VeriGrade with your favorite business tools and create a seamless workflow. 
              Over 100+ integrations to streamline your operations and boost productivity.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-indigo-600">100+</div>
              <div className="text-sm text-gray-600">Available Integrations</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-600">500K+</div>
              <div className="text-sm text-gray-600">Active Connections</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-600">99.9%</div>
              <div className="text-sm text-gray-600">Uptime Guarantee</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-600">24/7</div>
              <div className="text-sm text-gray-600">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Integrations */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Most Popular Integrations</h2>
            <p className="text-lg text-gray-600">Connect with the tools your business already uses</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {popularIntegrations.map((integration, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-indigo-600">{integration.logo}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{integration.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{integration.description}</p>
                <div className="text-xs text-indigo-600 font-medium mb-4">{integration.users} users</div>
                <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-500 transition-colors">
                  Connect
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Categories */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Category</h2>
            <p className="text-lg text-gray-600">Find the perfect integration for your business needs</p>
          </div>

          <div className="space-y-12">
            {categories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg">
                    <category.icon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                    <p className="text-gray-600">{category.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {category.integrations.map((integration, integrationIndex) => (
                    <div key={integrationIndex} className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                            <span className="text-lg font-bold text-gray-600">{integration.logo}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm">{integration.name}</h4>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`}>
                          {integration.status === 'popular' ? 'Popular' : 'Available'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-3">{integration.description}</p>
                      <button className="w-full text-indigo-600 hover:text-indigo-500 text-sm font-medium flex items-center justify-center gap-1">
                        Connect
                        <ArrowRightIcon className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How Integrations Work</h2>
            <p className="text-lg text-gray-600">Simple 3-step process to connect your tools</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mx-auto mb-4">
                <LinkIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">1. Choose Integration</h3>
              <p className="text-gray-600">Browse our marketplace and select the integration you need for your business.</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mx-auto mb-4">
                <CogIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">2. Configure Settings</h3>
              <p className="text-gray-600">Set up the integration with your account credentials and sync preferences.</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mx-auto mb-4">
                <CheckCircleIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">3. Start Syncing</h3>
              <p className="text-gray-600">Your data syncs automatically, creating a seamless workflow between tools.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Use Integrations?</h2>
              <p className="text-lg text-gray-600 mb-8">
                Integrations eliminate manual data entry, reduce errors, and create a unified view of your business. 
                Connect all your tools to work together seamlessly.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <CheckCircleIcon className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Automated Data Sync</h3>
                    <p className="text-gray-600">Eliminate manual data entry with automatic synchronization between platforms.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircleIcon className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Real-time Updates</h3>
                    <p className="text-gray-600">Keep your data current with real-time updates across all connected systems.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircleIcon className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Reduced Errors</h3>
                    <p className="text-gray-600">Minimize human errors with automated data transfer and validation.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircleIcon className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Time Savings</h3>
                    <p className="text-gray-600">Save hours of manual work with automated workflows and data synchronization.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Integration Benefits</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Data Entry Time</span>
                  <span className="text-lg font-bold text-green-600">-85%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Error Reduction</span>
                  <span className="text-lg font-bold text-blue-600">-92%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Workflow Efficiency</span>
                  <span className="text-lg font-bold text-purple-600">+150%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Data Accuracy</span>
                  <span className="text-lg font-bold text-indigo-600">99.8%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* API Documentation */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Developer Resources</h2>
            <p className="text-lg text-gray-600">Build custom integrations with our comprehensive API</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <DocumentTextIcon className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">API Documentation</h3>
              <p className="text-gray-600 mb-4">Comprehensive guides and reference materials for our REST API.</p>
              <button className="text-indigo-600 hover:text-indigo-500 font-medium">
                View Documentation →
              </button>
            </div>
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <CogIcon className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">SDKs & Libraries</h3>
              <p className="text-gray-600 mb-4">Ready-to-use SDKs for popular programming languages and frameworks.</p>
              <button className="text-indigo-600 hover:text-indigo-500 font-medium">
                Download SDKs →
              </button>
            </div>
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <CloudIcon className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sandbox Environment</h3>
              <p className="text-gray-600 mb-4">Test your integrations in our secure sandbox environment.</p>
              <button className="text-indigo-600 hover:text-indigo-500 font-medium">
                Access Sandbox →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-indigo-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Connect Your Tools?
          </h2>
          <p className="text-lg text-indigo-100 mb-8 max-w-2xl mx-auto">
            Start integrating your business tools today and create a seamless workflow that saves time and reduces errors.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Browse Integrations
            </button>
            <a
              href="/contact"
              className="bg-transparent text-white border border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors"
            >
              Need Custom Integration?
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
