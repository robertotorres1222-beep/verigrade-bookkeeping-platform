'use client';

import { useState } from 'react';
import { 
  DocumentTextIcon,
  PhotoIcon,
  CloudArrowUpIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  ShareIcon,
  PlusIcon,
  TagIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

export default function DocumentsPage() {
  const [documents] = useState([
    {
      id: 'DOC001',
      name: 'Invoice_2024_001.pdf',
      type: 'PDF',
      category: 'Invoices',
      size: '2.4 MB',
      uploaded: '2024-01-15',
      tags: ['invoice', 'client', '2024'],
      status: 'processed'
    },
    {
      id: 'DOC002',
      name: 'Receipt_Office_Supplies.jpg',
      type: 'Image',
      category: 'Receipts',
      size: '1.8 MB',
      uploaded: '2024-01-14',
      tags: ['receipt', 'office', 'expenses'],
      status: 'processed'
    },
    {
      id: 'DOC003',
      name: 'Contract_ABC_Corp.pdf',
      type: 'PDF',
      category: 'Contracts',
      size: '3.2 MB',
      uploaded: '2024-01-13',
      tags: ['contract', 'client', 'legal'],
      status: 'processed'
    },
    {
      id: 'DOC004',
      name: 'Bank_Statement_Jan.pdf',
      type: 'PDF',
      category: 'Bank Statements',
      size: '4.1 MB',
      uploaded: '2024-01-12',
      tags: ['bank', 'statement', 'january'],
      status: 'processing'
    }
  ]);

  const [categories] = useState([
    { name: 'All Documents', count: 247, icon: DocumentTextIcon },
    { name: 'Receipts', count: 89, icon: PhotoIcon },
    { name: 'Invoices', count: 56, icon: DocumentTextIcon },
    { name: 'Bank Statements', count: 34, icon: FolderIcon },
    { name: 'Contracts', count: 23, icon: DocumentTextIcon },
    { name: 'Tax Documents', count: 18, icon: DocumentTextIcon },
    { name: 'Other', count: 27, icon: FolderIcon }
  ]);

  const [recentActivity] = useState([
    {
      id: 'ACT001',
      action: 'Document uploaded',
      document: 'Receipt_Office_Supplies.jpg',
      user: 'John Smith',
      timestamp: '2024-01-15 10:30 AM',
      type: 'upload'
    },
    {
      id: 'ACT002',
      action: 'Document processed',
      document: 'Invoice_2024_001.pdf',
      user: 'System',
      timestamp: '2024-01-15 09:45 AM',
      type: 'process'
    },
    {
      id: 'ACT003',
      action: 'Document shared',
      document: 'Contract_ABC_Corp.pdf',
      user: 'Sarah Johnson',
      timestamp: '2024-01-14 03:20 PM',
      type: 'share'
    }
  ]);

  const [storageStats] = useState({
    totalDocuments: 247,
    totalSize: '2.4 GB',
    usedStorage: '1.8 GB',
    availableStorage: '8.2 GB',
    lastBackup: '2024-01-15 06:00 AM'
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Documents');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All Documents' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'PDF':
        return 'bg-red-100 text-red-800';
      case 'Image':
        return 'bg-blue-100 text-blue-800';
      case 'Excel':
        return 'bg-green-100 text-green-800';
      case 'Word':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Document
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600"> Management</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              Organize, store, and manage all your business documents in one secure place. 
              Upload receipts, invoices, contracts, and more with intelligent categorization and search.
            </p>
          </div>
        </div>
      </section>

      {/* Storage Overview */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mr-4">
                  <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Documents</p>
                  <p className="text-2xl font-bold text-gray-900">{storageStats.totalDocuments}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mr-4">
                  <CloudArrowUpIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Storage Used</p>
                  <p className="text-2xl font-bold text-gray-900">{storageStats.usedStorage}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mr-4">
                  <FolderIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Available Storage</p>
                  <p className="text-2xl font-bold text-gray-900">{storageStats.availableStorage}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mr-4">
                  <CalendarIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Backup</p>
                  <p className="text-sm font-bold text-gray-900">{storageStats.lastBackup}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Document Controls */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search documents..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="md:w-64">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map((category) => (
                    <option key={category.name} value={category.name}>
                      {category.name} ({category.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Upload Button */}
              <div>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-500 transition-colors flex items-center gap-2">
                  <CloudArrowUpIcon className="h-5 w-5" />
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Sidebar & Documents Grid */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Categories Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.name}
                        onClick={() => setSelectedCategory(category.name)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                          selectedCategory === category.name
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center">
                          <Icon className="h-5 w-5 mr-3" />
                          <span className="text-sm font-medium">{category.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">{category.count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Documents Grid */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Documents ({filteredDocuments.length})
                    </h3>
                    <div className="flex items-center space-x-2">
                      {selectedDocuments.length > 0 && (
                        <span className="text-sm text-gray-600">
                          {selectedDocuments.length} selected
                        </span>
                      )}
                      <button className="text-gray-600 hover:text-gray-500 p-2">
                        <FunnelIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {filteredDocuments.map((document) => (
                    <div key={document.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedDocuments.includes(document.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDocuments([...selectedDocuments, document.id]);
                              } else {
                                setSelectedDocuments(selectedDocuments.filter(id => id !== document.id));
                              }
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-4"
                          />
                          <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg mr-4">
                            <DocumentTextIcon className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">{document.name}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>{document.category}</span>
                              <span>•</span>
                              <span>{document.size}</span>
                              <span>•</span>
                              <span>{document.uploaded}</span>
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                              {document.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                >
                                  <TagIcon className="h-3 w-3 mr-1" />
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFileTypeColor(document.type)}`}>
                              {document.type}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                              {document.status}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="text-gray-600 hover:text-gray-500 p-2">
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-500 p-2">
                              <ArrowDownTrayIcon className="h-4 w-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-500 p-2">
                              <ShareIcon className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-500 p-2">
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            <p className="text-lg text-gray-600">Track document uploads, processing, and sharing activities</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Document Activity Log</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mr-4">
                        <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{activity.action}</h4>
                        <p className="text-sm text-gray-600">
                          {activity.document} • {activity.user} • {activity.timestamp}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {activity.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Document Features */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Document Management Features</h2>
            <p className="text-lg text-gray-600">Powerful tools for organizing and managing your business documents</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                <CloudArrowUpIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Upload</h3>
              <p className="text-gray-600 mb-4">Drag and drop or click to upload documents with automatic categorization.</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Bulk upload support</li>
                <li>• Automatic categorization</li>
                <li>• OCR text extraction</li>
                <li>• File format validation</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                <MagnifyingGlassIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced Search</h3>
              <p className="text-gray-600 mb-4">Find documents quickly with powerful search and filtering capabilities.</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Full-text search</li>
                <li>• Tag-based filtering</li>
                <li>• Date range filtering</li>
                <li>• File type filtering</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
                <ShareIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Sharing</h3>
              <p className="text-gray-600 mb-4">Share documents securely with team members and external parties.</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Password-protected links</li>
                <li>• Expiration dates</li>
                <li>• Access permissions</li>
                <li>• Audit trails</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Organize Your Business Documents
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Store, organize, and manage all your business documents in one secure place. 
            Smart categorization, powerful search, and seamless collaboration.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Free Trial
            </a>
            <a
              href="/contact"
              className="bg-transparent text-white border border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Talk to Document Expert
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

