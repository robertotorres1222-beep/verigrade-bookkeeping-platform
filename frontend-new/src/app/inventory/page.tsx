'use client';

import { useState } from 'react';
import { 
  CubeIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  TagIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';

export default function InventoryPage() {
  const [inventoryItems] = useState([
    {
      id: 'SKU-001',
      name: 'Wireless Headphones',
      category: 'Electronics',
      quantity: 45,
      lowStock: 10,
      price: 99.99,
      cost: 65.00,
      status: 'in-stock',
      lastUpdated: '2024-01-20'
    },
    {
      id: 'SKU-002',
      name: 'Office Chair',
      category: 'Furniture',
      quantity: 8,
      lowStock: 5,
      price: 299.99,
      cost: 180.00,
      status: 'low-stock',
      lastUpdated: '2024-01-18'
    },
    {
      id: 'SKU-003',
      name: 'Laptop Stand',
      category: 'Accessories',
      quantity: 0,
      lowStock: 5,
      price: 49.99,
      cost: 25.00,
      status: 'out-of-stock',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'SKU-004',
      name: 'Desk Lamp',
      category: 'Furniture',
      quantity: 23,
      lowStock: 10,
      price: 79.99,
      cost: 45.00,
      status: 'in-stock',
      lastUpdated: '2024-01-19'
    }
  ]);

  const inventoryStats = [
    { label: 'Total Products', value: '1,247', icon: CubeIcon, color: 'text-blue-600' },
    { label: 'Total Value', value: '$89,420', icon: CurrencyDollarIcon, color: 'text-green-600' },
    { label: 'Low Stock Items', value: '23', icon: ExclamationTriangleIcon, color: 'text-yellow-600' },
    { label: 'Out of Stock', value: '7', icon: TagIcon, color: 'text-red-600' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock': return 'bg-green-100 text-green-800';
      case 'low-stock': return 'bg-yellow-100 text-yellow-800';
      case 'out-of-stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in-stock': return <CheckCircleIcon className="h-4 w-4" />;
      case 'low-stock': return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'out-of-stock': return <ExclamationTriangleIcon className="h-4 w-4" />;
      default: return <CheckCircleIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Inventory
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600"> Management</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              Track inventory levels, manage stock, and optimize your supply chain with real-time inventory management. 
              Prevent stockouts and reduce carrying costs with intelligent forecasting.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {inventoryStats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mx-auto mb-4">
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Inventory Management */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Inventory Overview</h2>
              <p className="text-lg text-gray-600 mt-2">Manage your inventory with real-time tracking and alerts</p>
            </div>
            <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-500 transition-colors flex items-center gap-2">
              <PlusIcon className="h-5 w-5" />
              Add Product
            </button>
          </div>

          {/* Inventory Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Product Inventory</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inventoryItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{item.category}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CubeIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">{item.quantity}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CurrencyDollarIcon className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-900">${item.price}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CurrencyDollarIcon className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm font-medium text-gray-900">
                            ${(item.quantity * item.cost).toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {getStatusIcon(item.status)}
                          <span className="ml-1 capitalize">{item.status.replace('-', ' ')}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button className="text-blue-600 hover:text-blue-500">
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button className="text-indigo-600 hover:text-indigo-500">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-500">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Inventory Features</h2>
            <p className="text-lg text-gray-600">Everything you need to manage your inventory efficiently</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                <ChartBarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Real-time Tracking</h3>
              <p className="text-gray-600">Track inventory levels in real-time with automatic updates from sales and purchases.</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                <ExclamationTriangleIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Low Stock Alerts</h3>
              <p className="text-gray-600">Get automatic alerts when inventory levels drop below your defined thresholds.</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
                <ArrowTrendingUpIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Demand Forecasting</h3>
              <p className="text-gray-600">Predict future demand based on historical sales data and seasonal trends.</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mb-4">
                <BuildingStorefrontIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Multi-location Support</h3>
              <p className="text-gray-600">Manage inventory across multiple warehouses, stores, and locations.</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mb-4">
                <TagIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Barcode Scanning</h3>
              <p className="text-gray-600">Use barcode scanning for quick inventory updates and accurate tracking.</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mb-4">
                <CubeIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Batch Tracking</h3>
              <p className="text-gray-600">Track products by batch, lot, or serial number for better traceability.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics & Reports */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Inventory Analytics</h2>
              <p className="text-lg text-gray-600 mb-8">
                Get insights into your inventory performance with detailed analytics and reports. 
                Track turnover rates, identify slow-moving items, and optimize your stock levels.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <ChartBarIcon className="h-6 w-6 text-purple-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Turnover Analysis</h3>
                    <p className="text-gray-600">Track how quickly your inventory moves and identify optimization opportunities.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <ArrowTrendingDownIcon className="h-6 w-6 text-purple-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Slow-moving Items</h3>
                    <p className="text-gray-600">Identify products that aren't selling and create strategies to move them.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CurrencyDollarIcon className="h-6 w-6 text-purple-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Cost Analysis</h3>
                    <p className="text-gray-600">Analyze carrying costs and optimize your inventory investment.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Inventory Insights</h3>
              <div className="space-y-6">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Inventory Turnover</span>
                    <span className="text-sm text-green-600">+12%</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">4.2x</div>
                  <div className="text-xs text-gray-500">Annual turnover rate</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Carrying Cost</span>
                    <span className="text-sm text-blue-600">-8%</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">$12,400</div>
                  <div className="text-xs text-gray-500">Monthly carrying cost</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Stock Accuracy</span>
                    <span className="text-sm text-green-600">98.5%</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">98.5%</div>
                  <div className="text-xs text-gray-500">Inventory accuracy rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Seamless Integrations</h2>
            <p className="text-lg text-gray-600">Connect with your existing business systems and tools</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {[
              { name: 'Shopify', logo: 'SP' },
              { name: 'WooCommerce', logo: 'WC' },
              { name: 'Amazon', logo: 'AM' },
              { name: 'eBay', logo: 'EB' },
              { name: 'QuickBooks', logo: 'QB' },
              { name: 'Xero', logo: 'X' }
            ].map((integration, index) => (
              <div key={index} className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-gray-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-600">{integration.logo}</span>
                </div>
                <div className="text-sm font-medium text-gray-900">{integration.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-purple-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Optimize Your Inventory?
          </h2>
          <p className="text-lg text-purple-100 mb-8 max-w-2xl mx-auto">
            Take control of your inventory with real-time tracking, automated alerts, and intelligent forecasting. 
            Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Start Free Trial
            </button>
            <a
              href="/contact"
              className="bg-transparent text-white border border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors"
            >
              Schedule Demo
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
