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
  FileText, 
  Plus, 
  Download, 
  Send, 
  Eye, 
  Edit, 
  Trash2, 
  RefreshCw,
  Clock,
  DollarSign,
  User,
  Calendar,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface ServiceInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  totalHours: number;
  totalAmount: number;
  status: string;
  notes?: string;
  createdAt: string;
  client: {
    id: string;
    name: string;
    email: string;
  };
  servicePackage: {
    id: string;
    name: string;
  };
  lineItems: ServiceInvoiceLineItem[];
}

interface ServiceInvoiceLineItem {
  id: string;
  description: string;
  hours: number;
  rate: number;
  amount: number;
  date: string;
  timeEntry: {
    id: string;
    description: string;
    date: string;
  };
}

interface TimeEntry {
  id: string;
  description: string;
  hours: number;
  rate: number;
  amount: number;
  date: string;
  isBillable: boolean;
  client: {
    id: string;
    name: string;
  };
  servicePackage: {
    id: string;
    name: string;
  };
}

export default function ServiceInvoicingPage() {
  const [invoices, setInvoices] = useState<ServiceInvoice[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [showGenerateInvoice, setShowGenerateInvoice] = useState(false);
  const [selectedTimeEntries, setSelectedTimeEntries] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    status: '',
    clientId: '',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const [newInvoice, setNewInvoice] = useState({
    clientId: '',
    servicePackageId: '',
    timeEntryIds: [] as string[],
    startDate: '',
    endDate: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    loadInvoices();
    loadTimeEntries();
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.clientId) params.append('clientId', filters.clientId);

      const response = await fetch(`/api/service-billing/invoices?${params}`);
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.data.invoices || []);
      }
    } catch (error) {
      console.error('Failed to load invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTimeEntries = async () => {
    try {
      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        isBillable: 'true'
      });

      const response = await fetch(`/api/service-billing/time-entries?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTimeEntries(data.data.timeEntries || []);
      }
    } catch (error) {
      console.error('Failed to load time entries:', error);
    }
  };

  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/service-billing/invoices/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInvoice)
      });

      if (response.ok) {
        toast.success('Service invoice generated successfully');
        setNewInvoice({
          clientId: '',
          servicePackageId: '',
          timeEntryIds: [],
          startDate: '',
          endDate: '',
          invoiceDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          notes: ''
        });
        setShowGenerateInvoice(false);
        await loadInvoices();
      } else {
        throw new Error('Failed to generate invoice');
      }
    } catch (error) {
      toast.error('Failed to generate service invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvoice = async (invoiceId: string) => {
    if (!confirm('Are you sure you want to send this invoice?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/service-billing/invoices/${invoiceId}/send`, {
        method: 'POST'
      });

      if (response.ok) {
        toast.success('Invoice sent successfully');
        await loadInvoices();
      } else {
        throw new Error('Failed to send invoice');
      }
    } catch (error) {
      toast.error('Failed to send invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/service-billing/invoices/${invoiceId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Invoice deleted successfully');
        await loadInvoices();
      } else {
        throw new Error('Failed to delete invoice');
      }
    } catch (error) {
      toast.error('Failed to delete invoice');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT': return <Edit className="h-4 w-4" />;
      case 'SENT': return <Send className="h-4 w-4" />;
      case 'PAID': return <CheckCircle className="h-4 w-4" />;
      case 'OVERDUE': return <AlertCircle className="h-4 w-4" />;
      case 'CANCELLED': return <XCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'SENT': return 'bg-blue-100 text-blue-800';
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'OVERDUE': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTotalHours = () => {
    return timeEntries.reduce((sum, entry) => sum + entry.hours, 0);
  };

  const getTotalAmount = () => {
    return timeEntries.reduce((sum, entry) => sum + entry.amount, 0);
  };

  const getSelectedTimeEntries = () => {
    return timeEntries.filter(entry => selectedTimeEntries.includes(entry.id));
  };

  const getSelectedTotalHours = () => {
    return getSelectedTimeEntries().reduce((sum, entry) => sum + entry.hours, 0);
  };

  const getSelectedTotalAmount = () => {
    return getSelectedTimeEntries().reduce((sum, entry) => sum + entry.amount, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="h-6 w-6 text-blue-600" />
          <h1 className="text-3xl font-bold">Service Invoicing</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={loadInvoices}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowGenerateInvoice(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Generate Invoice
          </Button>
        </div>
      </div>

      <Tabs defaultValue="invoices" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="time-entries">Billable Time</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status-filter">Status</Label>
                  <select
                    id="status-filter"
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">All Statuses</option>
                    <option value="DRAFT">Draft</option>
                    <option value="SENT">Sent</option>
                    <option value="PAID">Paid</option>
                    <option value="OVERDUE">Overdue</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-filter">Client</Label>
                  <select
                    id="client-filter"
                    value={filters.clientId}
                    onChange={(e) => setFilters(prev => ({ ...prev, clientId: e.target.value }))}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">All Clients</option>
                    {/* Add client options here */}
                  </select>
                </div>
                <div className="flex items-end">
                  <Button onClick={loadInvoices} className="w-full">
                    Apply Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoices List */}
          <Card>
            <CardHeader>
              <CardTitle>Service Invoices</CardTitle>
              <CardDescription>
                {invoices.length} invoices found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading invoices...</span>
                </div>
              ) : invoices.length === 0 ? (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    No service invoices found. Generate your first invoice to get started.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="border rounded p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(invoice.status)}
                          <div>
                            <p className="font-medium">{invoice.invoiceNumber}</p>
                            <p className="text-sm text-muted-foreground">
                              {invoice.client.name} • {invoice.servicePackage.name}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(invoice.totalAmount)}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatTime(invoice.totalHours)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Due {new Date(invoice.dueDate).toLocaleDateString()}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{invoice.lineItems.length} line items</span>
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(invoice.status)}>
                            {invoice.status}
                          </Badge>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4" />
                            </Button>
                            {invoice.status === 'DRAFT' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSendInvoice(invoice.id)}
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteInvoice(invoice.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time-entries" className="space-y-6">
          {/* Time Entries Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Billable Time Entries</CardTitle>
              <CardDescription>
                {timeEntries.length} entries • {formatTime(getTotalHours())} total • {formatCurrency(getTotalAmount())}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={loadTimeEntries} className="w-full">
                    Load Entries
                  </Button>
                </div>
              </div>

              {timeEntries.length === 0 ? (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    No billable time entries found for the selected date range.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2">
                  {timeEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedTimeEntries.includes(entry.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTimeEntries(prev => [...prev, entry.id]);
                            } else {
                              setSelectedTimeEntries(prev => prev.filter(id => id !== entry.id));
                            }
                          }}
                          className="h-4 w-4"
                        />
                        <div>
                          <p className="font-medium">{entry.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {entry.servicePackage.name} • {entry.client.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatTime(entry.hours)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(entry.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generate Invoice Modal */}
      {showGenerateInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Generate Service Invoice</CardTitle>
              <CardDescription>
                Create an invoice from time entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerateInvoice} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoice-client">Client</Label>
                    <select
                      id="invoice-client"
                      value={newInvoice.clientId}
                      onChange={(e) => setNewInvoice(prev => ({ ...prev, clientId: e.target.value }))}
                      className="w-full p-2 border rounded"
                      required
                    >
                      <option value="">Select client</option>
                      {/* Add client options here */}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="invoice-package">Service Package</Label>
                    <select
                      id="invoice-package"
                      value={newInvoice.servicePackageId}
                      onChange={(e) => setNewInvoice(prev => ({ ...prev, servicePackageId: e.target.value }))}
                      className="w-full p-2 border rounded"
                      required
                    >
                      <option value="">Select package</option>
                      {/* Add package options here */}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoice-date">Invoice Date</Label>
                    <Input
                      id="invoice-date"
                      type="date"
                      value={newInvoice.invoiceDate}
                      onChange={(e) => setNewInvoice(prev => ({ ...prev, invoiceDate: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="due-date">Due Date</Label>
                    <Input
                      id="due-date"
                      type="date"
                      value={newInvoice.dueDate}
                      onChange={(e) => setNewInvoice(prev => ({ ...prev, dueDate: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoice-notes">Notes (Optional)</Label>
                  <textarea
                    id="invoice-notes"
                    value={newInvoice.notes}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full p-2 border rounded"
                    rows={3}
                    placeholder="Additional notes for the invoice..."
                  />
                </div>

                {selectedTimeEntries.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded">
                    <p className="font-medium">Selected Time Entries</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedTimeEntries.length} entries • {formatTime(getSelectedTotalHours())} • {formatCurrency(getSelectedTotalAmount())}
                    </p>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Generating...' : 'Generate Invoice'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowGenerateInvoice(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

