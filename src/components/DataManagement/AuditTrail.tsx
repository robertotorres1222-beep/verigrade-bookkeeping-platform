'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, 
  User, 
  Clock, 
  Eye, 
  Filter, 
  Search, 
  Download,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Info,
  Trash2,
  Edit,
  Plus,
  X,
  Database
} from 'lucide-react';

interface AuditLogEntry {
  id: string;
  timestamp: Date;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  action: string;
  resource: string;
  resourceId: string;
  details: {
    before?: any;
    after?: any;
    changes?: Record<string, any>;
  };
  ipAddress?: string;
  userAgent?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'import' | 'system';
}

interface AuditTrailProps {
  isOpen: boolean;
  onClose: () => void;
  resourceType?: string;
  resourceId?: string;
}

export default function AuditTrail({ isOpen, onClose, resourceType, resourceId }: AuditTrailProps) {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    user: '',
    action: '',
    category: '',
    severity: '',
    dateRange: { start: '', end: '' }
  });
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());

  // Mock data - in real app, this would come from API
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        const mockLogs: AuditLogEntry[] = [
          {
            id: '1',
            timestamp: new Date('2024-01-15T10:30:00Z'),
            user: { id: '1', name: 'John Doe', email: 'john@example.com' },
            action: 'Created',
            resource: 'Transaction',
            resourceId: 'txn_123',
            details: {
              after: { amount: 1500, description: 'Office supplies', category: 'Expenses' }
            },
            ipAddress: '192.168.1.100',
            severity: 'low',
            category: 'create'
          },
          {
            id: '2',
            timestamp: new Date('2024-01-15T09:15:00Z'),
            user: { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
            action: 'Updated',
            resource: 'Customer',
            resourceId: 'cust_456',
            details: {
              before: { name: 'ABC Corp', email: 'old@abc.com' },
              after: { name: 'ABC Corporation', email: 'new@abc.com' },
              changes: { name: 'ABC Corporation', email: 'new@abc.com' }
            },
            ipAddress: '192.168.1.101',
            severity: 'medium',
            category: 'update'
          },
          {
            id: '3',
            timestamp: new Date('2024-01-15T08:45:00Z'),
            user: { id: '1', name: 'John Doe', email: 'john@example.com' },
            action: 'Deleted',
            resource: 'Invoice',
            resourceId: 'inv_789',
            details: {
              before: { number: 'INV-001', amount: 2500, status: 'Draft' }
            },
            ipAddress: '192.168.1.100',
            severity: 'high',
            category: 'delete'
          },
          {
            id: '4',
            timestamp: new Date('2024-01-15T08:00:00Z'),
            user: { id: '3', name: 'Admin User', email: 'admin@example.com' },
            action: 'Logged in',
            resource: 'System',
            resourceId: 'auth_001',
            details: {},
            ipAddress: '192.168.1.102',
            severity: 'low',
            category: 'login'
          },
          {
            id: '5',
            timestamp: new Date('2024-01-15T07:30:00Z'),
            user: { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
            action: 'Exported',
            resource: 'Financial Report',
            resourceId: 'report_001',
            details: {
              after: { format: 'CSV', records: 1250, dateRange: '2024-01-01 to 2024-01-15' }
            },
            ipAddress: '192.168.1.101',
            severity: 'medium',
            category: 'export'
          }
        ];
        setAuditLogs(mockLogs);
        setFilteredLogs(mockLogs);
        setIsLoading(false);
      }, 1000);
    }
  }, [isOpen, resourceType, resourceId]);

  // Filter logs based on current filters
  useEffect(() => {
    let filtered = [...auditLogs];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(log =>
        log.action.toLowerCase().includes(searchLower) ||
        log.resource.toLowerCase().includes(searchLower) ||
        log.user.name.toLowerCase().includes(searchLower) ||
        log.user.email.toLowerCase().includes(searchLower)
      );
    }

    if (filters.user) {
      filtered = filtered.filter(log => log.user.id === filters.user);
    }

    if (filters.action) {
      filtered = filtered.filter(log => log.action.toLowerCase().includes(filters.action.toLowerCase()));
    }

    if (filters.category) {
      filtered = filtered.filter(log => log.category === filters.category);
    }

    if (filters.severity) {
      filtered = filtered.filter(log => log.severity === filters.severity);
    }

    if (filters.dateRange.start) {
      filtered = filtered.filter(log => log.timestamp >= new Date(filters.dateRange.start));
    }

    if (filters.dateRange.end) {
      filtered = filtered.filter(log => log.timestamp <= new Date(filters.dateRange.end));
    }

    setFilteredLogs(filtered);
  }, [auditLogs, filters]);

  const toggleExpanded = (entryId: string) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedEntries(newExpanded);
  };

  const toggleSelection = (entryId: string) => {
    const newSelected = new Set(selectedEntries);
    if (newSelected.has(entryId)) {
      newSelected.delete(entryId);
    } else {
      newSelected.add(entryId);
    }
    setSelectedEntries(newSelected);
  };

  const selectAll = () => {
    if (selectedEntries.size === filteredLogs.length) {
      setSelectedEntries(new Set());
    } else {
      setSelectedEntries(new Set(filteredLogs.map(log => log.id)));
    }
  };

  const exportAuditLog = () => {
    const selectedLogs = filteredLogs.filter(log => selectedEntries.has(log.id));
    const csv = convertToCSV(selectedLogs);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const convertToCSV = (logs: AuditLogEntry[]) => {
    const headers = ['Timestamp', 'User', 'Action', 'Resource', 'Details', 'IP Address', 'Severity'];
    const rows = logs.map(log => [
      log.timestamp.toISOString(),
      log.user.name,
      log.action,
      log.resource,
      JSON.stringify(log.details),
      log.ipAddress || '',
      log.severity
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'create': return <Plus className="w-4 h-4" />;
      case 'update': return <Edit className="w-4 h-4" />;
      case 'delete': return <Trash2 className="w-4 h-4" />;
      case 'export': return <Download className="w-4 h-4" />;
      case 'import': return <Database className="w-4 h-4" />;
      case 'login': return <CheckCircle className="w-4 h-4" />;
      case 'logout': return <AlertCircle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <History className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Audit Trail</h2>
                <p className="text-sm text-gray-500">Track all system activities and changes</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                <select
                  value={filters.action}
                  onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Actions</option>
                  <option value="created">Created</option>
                  <option value="updated">Updated</option>
                  <option value="deleted">Deleted</option>
                  <option value="exported">Exported</option>
                  <option value="imported">Imported</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  <option value="create">Create</option>
                  <option value="update">Update</option>
                  <option value="delete">Delete</option>
                  <option value="export">Export</option>
                  <option value="import">Import</option>
                  <option value="login">Login</option>
                  <option value="logout">Logout</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                <select
                  value={filters.severity}
                  onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Severities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    dateRange: { ...prev.dateRange, start: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    dateRange: { ...prev.dateRange, end: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[50vh] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Bulk Actions */}
                {filteredLogs.length > 0 && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedEntries.size === filteredLogs.length}
                          onChange={selectAll}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Select All</span>
                      </label>
                      {selectedEntries.size > 0 && (
                        <button
                          onClick={exportAuditLog}
                          className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Download className="w-4 h-4" />
                          <span>Export Selected ({selectedEntries.size})</span>
                        </button>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {filteredLogs.length} entries found
                    </div>
                  </div>
                )}

                {/* Audit Log Entries */}
                {filteredLogs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedEntries.has(log.id)}
                        onChange={() => toggleSelection(log.id)}
                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${getSeverityColor(log.severity)}`}>
                              {getCategoryIcon(log.category)}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {log.user.name} {log.action} {log.resource}
                              </div>
                              <div className="text-sm text-gray-500">
                                {log.timestamp.toLocaleString()} • {log.ipAddress}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(log.severity)}`}>
                              {log.severity}
                            </span>
                            <button
                              onClick={() => toggleExpanded(log.id)}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                            >
                              {expandedEntries.has(log.id) ? (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </div>

                        <AnimatePresence>
                          {expandedEntries.has(log.id) && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4 pt-4 border-t border-gray-200"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">User Details</h4>
                                  <div className="text-sm text-gray-600 space-y-1">
                                    <div>Name: {log.user.name}</div>
                                    <div>Email: {log.user.email}</div>
                                    <div>IP: {log.ipAddress}</div>
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">Action Details</h4>
                                  <div className="text-sm text-gray-600 space-y-1">
                                    <div>Resource: {log.resource}</div>
                                    <div>Resource ID: {log.resourceId}</div>
                                    <div>Category: {log.category}</div>
                                  </div>
                                </div>
                              </div>

                              {Object.keys(log.details).length > 0 && (
                                <div className="mt-4">
                                  <h4 className="font-medium text-gray-900 mb-2">Change Details</h4>
                                  <pre className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 overflow-x-auto">
                                    {JSON.stringify(log.details, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {filteredLogs.length === 0 && !isLoading && (
                  <div className="text-center py-12">
                    <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No audit logs found</h3>
                    <p className="text-gray-500">Try adjusting your filters to see more results.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

