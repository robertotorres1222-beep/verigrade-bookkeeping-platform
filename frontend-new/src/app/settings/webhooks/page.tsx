'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Webhook, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Eye, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Settings,
  Activity,
  Zap,
  ExternalLink,
  Copy,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

interface WebhookData {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  createdAt: Date;
  lastTriggered?: Date;
  successCount: number;
  failureCount: number;
  secret: string;
  headers?: Record<string, string>;
  timeout: number;
  retryCount: number;
  retryDelay: number;
}

interface WebhookEvent {
  id: string;
  webhookId: string;
  event: string;
  payload: any;
  status: 'pending' | 'sent' | 'failed' | 'retrying';
  attempts: number;
  maxAttempts: number;
  nextRetryAt?: Date;
  createdAt: Date;
  sentAt?: Date;
  errorMessage?: string;
  responseCode?: number;
  responseBody?: string;
}

interface WebhookDelivery {
  id: string;
  webhookId: string;
  eventId: string;
  attempt: number;
  status: 'success' | 'failed';
  responseCode: number;
  responseBody: string;
  duration: number;
  createdAt: Date;
  errorMessage?: string;
}

export default function WebhooksPage() {
  const [activeTab, setActiveTab] = useState('webhooks');
  const [webhooks, setWebhooks] = useState<WebhookData[]>([]);
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookData | null>(null);
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const availableEvents = [
    'transaction.created',
    'transaction.updated',
    'transaction.deleted',
    'invoice.created',
    'invoice.updated',
    'invoice.deleted',
    'invoice.paid',
    'invoice.overdue',
    'customer.created',
    'customer.updated',
    'customer.deleted',
    'payment.created',
    'payment.updated',
    'payment.deleted',
    'expense.created',
    'expense.updated',
    'expense.deleted',
    'user.created',
    'user.updated',
    'user.deleted',
    'organization.updated',
    'webhook.test'
  ];

  useEffect(() => {
    loadWebhooks();
    loadStats();
  }, []);

  const loadWebhooks = async () => {
    try {
      const response = await fetch('/api/webhooks');
      if (response.ok) {
        const data = await response.json();
        setWebhooks(data.webhooks);
      }
    } catch (error) {
      console.error('Error loading webhooks:', error);
      toast.error('Failed to load webhooks');
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/webhooks/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadWebhookEvents = async (webhookId: string) => {
    try {
      const response = await fetch(`/api/webhooks/${webhookId}/events`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events);
      }
    } catch (error) {
      console.error('Error loading webhook events:', error);
      toast.error('Failed to load webhook events');
    }
  };

  const loadWebhookDeliveries = async (webhookId: string) => {
    try {
      const response = await fetch(`/api/webhooks/${webhookId}/deliveries`);
      if (response.ok) {
        const data = await response.json();
        setDeliveries(data.deliveries);
      }
    } catch (error) {
      console.error('Error loading webhook deliveries:', error);
      toast.error('Failed to load webhook deliveries');
    }
  };

  const handleCreateWebhook = async (webhookData: Partial<WebhookData>) => {
    try {
      const response = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookData)
      });

      if (response.ok) {
        toast.success('Webhook created successfully');
        loadWebhooks();
        setIsCreating(false);
      } else {
        throw new Error('Failed to create webhook');
      }
    } catch (error) {
      console.error('Error creating webhook:', error);
      toast.error('Failed to create webhook');
    }
  };

  const handleUpdateWebhook = async (webhookId: string, updates: Partial<WebhookData>) => {
    try {
      const response = await fetch(`/api/webhooks/${webhookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        toast.success('Webhook updated successfully');
        loadWebhooks();
      } else {
        throw new Error('Failed to update webhook');
      }
    } catch (error) {
      console.error('Error updating webhook:', error);
      toast.error('Failed to update webhook');
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;

    try {
      const response = await fetch(`/api/webhooks/${webhookId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Webhook deleted successfully');
        loadWebhooks();
      } else {
        throw new Error('Failed to delete webhook');
      }
    } catch (error) {
      console.error('Error deleting webhook:', error);
      toast.error('Failed to delete webhook');
    }
  };

  const handleTestWebhook = async (webhookId: string) => {
    setIsTesting(true);
    try {
      const response = await fetch(`/api/webhooks/${webhookId}/test`, {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.result.success) {
          toast.success('Webhook test successful');
        } else {
          toast.error(`Webhook test failed: ${data.result.error}`);
        }
      } else {
        throw new Error('Failed to test webhook');
      }
    } catch (error) {
      console.error('Error testing webhook:', error);
      toast.error('Failed to test webhook');
    } finally {
      setIsTesting(false);
    }
  };

  const handleRetryEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/webhooks/events/${eventId}/retry`, {
        method: 'POST'
      });

      if (response.ok) {
        toast.success('Webhook retry scheduled');
        if (selectedWebhook) {
          loadWebhookEvents(selectedWebhook.id);
        }
      } else {
        throw new Error('Failed to retry webhook');
      }
    } catch (error) {
      console.error('Error retrying webhook:', error);
      toast.error('Failed to retry webhook');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'retrying': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'retrying': return <RefreshCw className="h-4 w-4 animate-spin" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getDeliveryStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeliveryStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Webhook className="h-6 w-6 text-blue-600" />
          <h1 className="text-3xl font-bold">Webhooks</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Webhook
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Webhook className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Webhooks</p>
                  <p className="text-2xl font-bold">{stats.totalWebhooks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Active Webhooks</p>
                  <p className="text-2xl font-bold">{stats.activeWebhooks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Successful</p>
                  <p className="text-2xl font-bold">{stats.successfulDeliveries}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Failed</p>
                  <p className="text-2xl font-bold">{stats.failedDeliveries}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
        </TabsList>

        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Configuration</CardTitle>
              <CardDescription>
                Configure webhooks to receive real-time notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {webhooks.length === 0 ? (
                  <Alert>
                    <Webhook className="h-4 w-4" />
                    <AlertDescription>
                      No webhooks configured yet. Create your first webhook to get started.
                    </AlertDescription>
                  </Alert>
                ) : (
                  webhooks.map((webhook) => (
                    <div key={webhook.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium">{webhook.name}</h4>
                            <Badge className={webhook.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {webhook.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          
                          <div className="space-y-1 text-sm text-gray-600">
                            <p><strong>URL:</strong> {webhook.url}</p>
                            <p><strong>Events:</strong> {webhook.events.join(', ')}</p>
                            <p><strong>Success Rate:</strong> {webhook.successCount + webhook.failureCount > 0 
                              ? Math.round((webhook.successCount / (webhook.successCount + webhook.failureCount)) * 100) 
                              : 0}%</p>
                            <p><strong>Created:</strong> {webhook.createdAt.toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Button size="sm" variant="outline" onClick={() => handleTestWebhook(webhook.id)} disabled={isTesting}>
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => {
                            setSelectedWebhook(webhook);
                            loadWebhookEvents(webhook.id);
                            setActiveTab('events');
                          }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => {
                            setSelectedWebhook(webhook);
                            loadWebhookDeliveries(webhook.id);
                            setActiveTab('deliveries');
                          }}>
                            <Activity className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteWebhook(webhook.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Events</CardTitle>
              <CardDescription>
                Track webhook event deliveries and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.length === 0 ? (
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      No webhook events yet. Events will appear here when webhooks are triggered.
                    </AlertDescription>
                  </Alert>
                ) : (
                  events.map((event) => (
                    <div key={event.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium">{event.event}</h4>
                            <Badge className={getStatusColor(event.status)}>
                              {getStatusIcon(event.status)}
                              <span className="ml-1">{event.status}</span>
                            </Badge>
                          </div>
                          
                          <div className="space-y-1 text-sm text-gray-600">
                            <p><strong>Attempts:</strong> {event.attempts}/{event.maxAttempts}</p>
                            <p><strong>Created:</strong> {event.createdAt.toLocaleString()}</p>
                            {event.sentAt && <p><strong>Sent:</strong> {event.sentAt.toLocaleString()}</p>}
                            {event.errorMessage && <p><strong>Error:</strong> {event.errorMessage}</p>}
                            {event.responseCode && <p><strong>Response Code:</strong> {event.responseCode}</p>}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          {event.status === 'failed' && event.attempts < event.maxAttempts && (
                            <Button size="sm" variant="outline" onClick={() => handleRetryEvent(event.id)}>
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deliveries" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Deliveries</CardTitle>
              <CardDescription>
                Detailed delivery logs for webhook events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deliveries.length === 0 ? (
                  <Alert>
                    <Activity className="h-4 w-4" />
                    <AlertDescription>
                      No webhook deliveries yet. Delivery logs will appear here when webhooks are triggered.
                    </AlertDescription>
                  </Alert>
                ) : (
                  deliveries.map((delivery) => (
                    <div key={delivery.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium">Delivery #{delivery.attempt}</h4>
                            <Badge className={getDeliveryStatusColor(delivery.status)}>
                              {getDeliveryStatusIcon(delivery.status)}
                              <span className="ml-1">{delivery.status}</span>
                            </Badge>
                          </div>
                          
                          <div className="space-y-1 text-sm text-gray-600">
                            <p><strong>Response Code:</strong> {delivery.responseCode}</p>
                            <p><strong>Duration:</strong> {delivery.duration}ms</p>
                            <p><strong>Created:</strong> {delivery.createdAt.toLocaleString()}</p>
                            {delivery.errorMessage && <p><strong>Error:</strong> {delivery.errorMessage}</p>}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

