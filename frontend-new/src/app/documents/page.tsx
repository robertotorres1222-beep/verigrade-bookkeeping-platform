'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  DocumentIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ViewColumnsIcon,
  ListBulletIcon,
  ShareIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  CloudArrowUpIcon,
  TagIcon,
  CalendarIcon,
  UserIcon,
  ArrowUpTrayIcon,
  DocumentDuplicateIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';

interface Document {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  folderId?: string;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  uploadedByUser: {
    id: string;
    name: string;
    email: string;
  };
  folder?: {
    id: string;
    name: string;
    path: string;
  };
  versions: Array<{
    id: string;
    version: number;
    url: string;
    size: number;
    createdAt: string;
    uploadedBy: string;
  }>;
}

interface Folder {
  id: string;
  name: string;
  path: string;
  parentId?: string;
  createdAt: string;
  documentCount: number;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockDocuments: Document[] = [
      {
        id: '1',
        name: 'Invoice_2024_001.pdf',
        originalName: 'Invoice_2024_001.pdf',
        mimeType: 'application/pdf',
        size: 245760,
        url: '/documents/invoice_2024_001.pdf',
        folderId: '1',
        tags: ['invoice', '2024', 'client-a'],
        isPublic: false,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        uploadedByUser: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com'
        },
        folder: {
          id: '1',
          name: 'Invoices',
          path: '/Invoices'
        },
        versions: []
      },
      {
        id: '2',
        name: 'Receipt_Starbucks_Jan15.jpg',
        originalName: 'Receipt_Starbucks_Jan15.jpg',
        mimeType: 'image/jpeg',
        size: 1024000,
        url: '/documents/receipt_starbucks.jpg',
        folderId: '2',
        tags: ['receipt', 'expense', 'coffee'],
        isPublic: false,
        createdAt: '2024-01-15T14:20:00Z',
        updatedAt: '2024-01-15T14:20:00Z',
        uploadedByUser: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com'
        },
        folder: {
          id: '2',
          name: 'Receipts',
          path: '/Receipts'
        },
        versions: []
      },
      {
        id: '3',
        name: 'Contract_Client_B_2024.docx',
        originalName: 'Contract_Client_B_2024.docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 512000,
        url: '/documents/contract_client_b.docx',
        folderId: '3',
        tags: ['contract', 'client-b', 'legal'],
        isPublic: false,
        createdAt: '2024-01-14T09:15:00Z',
        updatedAt: '2024-01-14T09:15:00Z',
        uploadedByUser: {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com'
        },
        folder: {
          id: '3',
          name: 'Contracts',
          path: '/Contracts'
        },
        versions: []
      }
    ];

    const mockFolders: Folder[] = [
      {
        id: '1',
        name: 'Invoices',
        path: '/Invoices',
        createdAt: '2024-01-01T00:00:00Z',
        documentCount: 15
      },
      {
        id: '2',
        name: 'Receipts',
        path: '/Receipts',
        createdAt: '2024-01-01T00:00:00Z',
        documentCount: 8
      },
      {
        id: '3',
        name: 'Contracts',
        path: '/Contracts',
        createdAt: '2024-01-01T00:00:00Z',
        documentCount: 3
      }
    ];

    setTimeout(() => {
      setDocuments(mockDocuments);
      setFolders(mockFolders);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.originalName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => doc.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'date':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'size':
        comparison = a.size - b.size;
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📈';
    return '📁';
  };

  const handleDocumentSelect = (documentId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId) 
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDocuments.length === sortedDocuments.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(sortedDocuments.map(doc => doc.id));
    }
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} on documents:`, selectedDocuments);
    setSelectedDocuments([]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
              <p className="mt-2 text-gray-600">
                Manage and organize your business documents
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                Upload Files
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="size">Sort by Size</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <ArrowUpTrayIcon className={`h-4 w-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
              </button>

              <div className="flex border border-gray-300 rounded-md">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-500'}`}
                >
                  <ViewColumnsIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-500'}`}
                >
                  <ListBulletIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedDocuments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                {selectedDocuments.length} document(s) selected
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBulkAction('download')}
                  className="inline-flex items-center px-3 py-1 border border-blue-300 rounded text-sm text-blue-700 hover:bg-blue-100"
                >
                  <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                  Download
                </button>
                <button
                  onClick={() => handleBulkAction('move')}
                  className="inline-flex items-center px-3 py-1 border border-blue-300 rounded text-sm text-blue-700 hover:bg-blue-100"
                >
                  <FolderIcon className="h-4 w-4 mr-1" />
                  Move
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="inline-flex items-center px-3 py-1 border border-red-300 rounded text-sm text-red-700 hover:bg-red-100"
                >
                  <TrashIcon className="h-4 w-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Documents Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedDocuments.map((document) => (
              <motion.div
                key={document.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-lg shadow-sm border-2 p-4 cursor-pointer transition-all duration-200 ${
                  selectedDocuments.includes(document.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
                onClick={() => handleDocumentSelect(document.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{getFileIcon(document.mimeType)}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {document.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(document.size)}
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedDocuments.includes(document.id)}
                    onChange={() => handleDocumentSelect(document.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>

                <div className="space-y-2">
                  {document.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {document.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {tag}
                        </span>
                      ))}
                      {document.tags.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{document.tags.length - 2} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{new Date(document.createdAt).toLocaleDateString()}</span>
                    <span>{document.uploadedByUser.name}</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex space-x-1">
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <ShareIcon className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <DocumentArrowDownIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedDocuments.length === sortedDocuments.length && sortedDocuments.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                />
                <div className="flex-1 grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="col-span-4">Name</div>
                  <div className="col-span-2">Size</div>
                  <div className="col-span-2">Modified</div>
                  <div className="col-span-2">Uploaded By</div>
                  <div className="col-span-2">Actions</div>
                </div>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {sortedDocuments.map((document) => (
                <motion.div
                  key={document.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-6 py-4 hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedDocuments.includes(document.id)}
                      onChange={() => handleDocumentSelect(document.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                    />
                    <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-4 flex items-center">
                        <span className="text-lg mr-3">{getFileIcon(document.mimeType)}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{document.name}</div>
                          <div className="text-xs text-gray-500">{document.folder?.name}</div>
                        </div>
                      </div>
                      <div className="col-span-2 text-sm text-gray-900">
                        {formatFileSize(document.size)}
                      </div>
                      <div className="col-span-2 text-sm text-gray-500">
                        {new Date(document.createdAt).toLocaleDateString()}
                      </div>
                      <div className="col-span-2 text-sm text-gray-500">
                        {document.uploadedByUser.name}
                      </div>
                      <div className="col-span-2 flex items-center space-x-2">
                        <button className="text-gray-400 hover:text-gray-600">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <ShareIcon className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <DocumentArrowDownIcon className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {sortedDocuments.length === 0 && (
          <div className="text-center py-12">
            <DocumentIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery ? 'Try adjusting your search terms' : 'Upload your first document to get started'}
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <CloudArrowUpIcon className="h-4 w-4 mr-2" />
              Upload Documents
            </button>
          </div>
        )}
      </div>
    </div>
  );
}