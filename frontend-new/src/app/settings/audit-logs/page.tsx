'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Search, 
  Filter, 
  Download, 
  Calendar,
  User,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
}

interface AuditLogFilters {
  dateRange: {
    start: string;
    end: string;
  };
  users: string[];
  actions: string[];
  resources: string[];
  search: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<AuditLogFilters>({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    users: [],
    actions: [],
    resources: [],
    search: ''
  });
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const actionTypes = [
    'LOGIN', 'LOGOUT', 'PASSWORD_CHANGE', 'MFA_ENABLED', 'MFA_DISABLED',
    'USER_CREATED', 'USER_UPDATED', 'USER_DELETED', 'ROLE_CHANGED',
    'INVOICE_CREATED', 'INVOICE_UPDATED', 'INVOICE_DELETED',
    'TRANSACTION_CREATED', 'TRANSACTION_UPDATED', 'TRANSACTION_DELETED',
    'SETTINGS_CHANGED', 'DATA_EXPORTED', 'DATA_IMPORTED'
  ];

  const resourceTypes = [
    'USER', 'INVOICE', 'TRANSACTION', 'CUSTOMER', 'PRODUCT',
    'SETTINGS', 'MFA', 'SSO', 'AUDIT_LOG'
  ];

  useEffect(() => {
    loadAuditLogs();
  }, [filters, page]);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(filters.dateRange.start && { startDate: filters.dateRange.start }),
        ...(filters.dateRange.end && { endDate: filters.dateRange.end }),
        ...(filters.search && { search: filters.search }),
        ...(filters.users.length > 0 && { users: filters.users.join(',') }),
        ...(filters.actions.length > 0 && { actions: filters.actions.join(',') }),
        ...(filters.resources.length > 0 && { resources: filters.resources.join(',') })
      });

      const response = await fetch(`/api/audit-logs?${params}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.data.logs || []);
        setTotalPages(data.data.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const params = new URLSearchParams({
        format,
        ...(filters.dateRange.start && { startDate: filters.dateRange.start }),
        ...(filters.dateRange.end && { endDate: filters.dateRange.end }),
        ...(filters.search && { search: filters.search }),
        ...(filters.users.length > 0 && { users: filters.users.join(',') }),
        ...(filters.actions.length > 0 && { actions: filters.actions.join(',') }),
        ...(filters.resources.length > 0 && { resources: filters.resources.join(',') })
      });

      const response = await fetch(`/api/audit-logs/export?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success(`Audit logs exported as ${format.toUpperCase()}`);
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      toast.error('Failed to export audit logs');
    }
  };

  const handleRefresh = () => {
    loadAuditLogs();
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'LOGIN': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'LOGOUT': return <Clock className="h-4 w-4 text-gray-600" />;
      case 'PASSWORD_CHANGE': return <Shield className="h-4 w-4 text-blue-600" />;
      case 'MFA_ENABLED': return <Shield className="h-4 w-4 text-green-600" />;
      case 'MFA_DISABLED': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'USER_CREATED': return <User className="h-4 w-4 text-green-600" />;
      case 'USER_DELETED': return <User className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'LOGIN':
      case 'MFA_ENABLED':
      case 'USER_CREATED':
        return 'bg-green-100 text-green-800';
      case 'LOGOUT':
      case 'PASSWORD_CHANGE':
        return 'bg-blue-100 text-blue-800';
      case 'MFA_DISABLED':
      case 'USER_DELETED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <h1 className="text-3xl font-bold">Audit Logs</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('csv')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('json')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, start: e.target.value }
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, end: e.target.value }
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search logs..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Actions</Label>
              <select
                multiple
                className="w-full p-2 border rounded"
                value={filters.actions}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  actions: Array.from(e.target.selectedOptions, option => option.value)
                }))}
              >
                {actionTypes.map(action => (
                  <option key={action} value={action}>
                    {formatAction(action)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
          <CardDescription>
            {logs.length} logs found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading audit logs...</span>
            </div>
          ) : logs.length === 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No audit logs found for the selected criteria.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="border rounded p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getActionIcon(log.action)}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{log.userEmail}</span>
                          <Badge className={getActionColor(log.action)}>
                            {formatAction(log.action)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {log.resource} {log.resourceId && `(${log.resourceId})`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatTimestamp(log.timestamp)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {log.ipAddress}
                      </p>
                    </div>
                  </div>

                  {log.changes && Object.keys(log.changes).length > 0 && (
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm font-medium mb-2">Changes:</p>
                      <div className="space-y-1">
                        {Object.entries(log.changes).map(([key, value]) => (
                          <div key={key} className="text-sm">
                            <span className="font-medium">{key}:</span>{' '}
                            <span className="text-muted-foreground">
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-sm font-medium mb-2">Metadata:</p>
                      <div className="space-y-1">
                        {Object.entries(log.metadata).map(([key, value]) => (
                          <div key={key} className="text-sm">
                            <span className="font-medium">{key}:</span>{' '}
                            <span className="text-muted-foreground">
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>User Agent: {log.userAgent}</span>
                    <span>ID: {log.id}</span>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}