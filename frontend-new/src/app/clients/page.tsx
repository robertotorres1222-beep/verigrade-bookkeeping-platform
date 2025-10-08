'use client';

import { useState } from 'react';
import { 
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const clients = [
    { 
      id: 1, 
      name: 'ABC Corporation', 
      email: 'contact@abccorp.com', 
      phone: '+1 (555) 123-4567',
      status: 'active', 
      revenue: '$12,500', 
      lastActivity: '2 days ago',
      totalInvoices: 15,
      pendingInvoices: 2,
      location: 'New York, NY',
      industry: 'Technology'
    },
    { 
      id: 2, 
      name: 'XYZ Industries', 
      email: 'billing@xyzind.com', 
      phone: '+1 (555) 987-6543',
      status: 'active', 
      revenue: '$8,750', 
      lastActivity: '1 week ago',
      totalInvoices: 8,
      pendingInvoices: 1,
      location: 'Los Angeles, CA',
      industry: 'Manufacturing'
    },
    { 
      id: 3, 
      name: 'TechStart LLC', 
      email: 'admin@techstart.com', 
      phone: '+1 (555) 456-7890',
      status: 'pending', 
      revenue: '$3,200', 
      lastActivity: '3 days ago',
      totalInvoices: 3,
      pendingInvoices: 0,
      location: 'San Francisco, CA',
      industry: 'Startup'
    },
    { 
      id: 4, 
      name: 'Global Solutions Inc', 
      email: 'finance@globalsol.com', 
      phone: '+1 (555) 321-9876',
      status: 'active', 
      revenue: '$25,000', 
      lastActivity: '1 day ago',
      totalInvoices: 22,
      pendingInvoices: 5,
      location: 'Chicago, IL',
      industry: 'Consulting'
    }
  ];

  const handleAddClient = () => {
    setShowAddModal(true);
    alert('Add New Client:\nName: [Enter client name]\nEmail: [Enter email]\nPhone: [Enter phone]\nIndustry: [Select industry]');
  };

  const handleViewClient = (id: number) => {
    const client = clients.find(c => c.id === id);
    alert(`Client Details:\nName: ${client?.name}\nEmail: ${client?.email}\nPhone: ${client?.phone}\nRevenue: ${client?.revenue}\nStatus: ${client?.status}\nLast Activity: ${client?.lastActivity}`);
  };

  const handleEditClient = (id: number) => {
    const client = clients.find(c => c.id === id);
    alert(`Edit Client: ${client?.name}\nUpdate contact information, billing details, and preferences`);
  };

  const handleDeleteClient = (id: number) => {
    if (confirm('Are you sure you want to delete this client?')) {
      alert(`Client ${id} deleted successfully`);
    }
  };

  const handleSendInvoice = (id: number) => {
    const client = clients.find(c => c.id === id);
    alert(`Send Invoice to: ${client?.name}\nEmail: ${client?.email}\nInvoice will be sent via email`);
  };

  const handleViewInvoices = (id: number) => {
    const client = clients.find(c => c.id === id);
    alert(`Invoices for ${client?.name}:\nTotal Invoices: ${client?.totalInvoices}\nPending: ${client?.pendingInvoices}\nView detailed invoice history`);
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || client.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <UserGroupIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
                <p className="text-sm text-gray-500">Manage your clients and their financial data</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleAddClient}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Client
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Search and Filter */}
          <div className="mb-6 bg-white p-4 rounded-lg shadow">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search clients by name or email..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Client Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center">
                <UserGroupIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Clients</p>
                  <p className="text-2xl font-semibold text-gray-900">{clients.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Active Clients</p>
                  <p className="text-2xl font-semibold text-gray-900">{clients.filter(c => c.status === 'active').length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center">
                <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">$49,450</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center">
                <ClockIcon className="h-8 w-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Pending Invoices</p>
                  <p className="text-2xl font-semibold text-gray-900">{clients.reduce((sum, c) => sum + c.pendingInvoices, 0)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Clients List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Client Directory</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage all your clients and their financial data</p>
            </div>
            <ul className="divide-y divide-gray-200">
              {filteredClients.map((client) => (
                <li key={client.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">{client.name}</div>
                          <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                            client.status === 'active' ? 'bg-green-100 text-green-800' :
                            client.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {client.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          <div className="flex items-center">
                            <EnvelopeIcon className="h-4 w-4 mr-1" />
                            {client.email}
                          </div>
                          <div className="flex items-center mt-1">
                            <PhoneIcon className="h-4 w-4 mr-1" />
                            {client.phone}
                          </div>
                          <div className="flex items-center mt-1">
                            <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                            Revenue: {client.revenue} • {client.totalInvoices} invoices • {client.pendingInvoices} pending
                          </div>
                          <div className="flex items-center mt-1">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            Last activity: {client.lastActivity}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{client.revenue}</div>
                        <div className="text-sm text-gray-500">{client.industry}</div>
                      </div>
                      <div className="flex space-x-1">
                        <button 
                          onClick={() => handleViewClient(client.id)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleViewInvoices(client.id)}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                          title="View Invoices"
                        >
                          <DocumentTextIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleSendInvoice(client.id)}
                          className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                          title="Send Invoice"
                        >
                          <EnvelopeIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEditClient(client.id)}
                          className="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClient(client.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
