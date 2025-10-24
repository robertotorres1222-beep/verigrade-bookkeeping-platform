'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  Plus, 
  Settings, 
  Play, 
  Pause, 
  Trash2, 
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock,
  BarChart3,
  Users,
  DollarSign,
  FileText,
  Mail,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';

interface ZapierZap {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'error';
  trigger: {
    app: string;
    event: string;
  };
  action: {
    app: string;
    event: string;
  };
  lastRun?: Date;
  runCount: number;
  errorCount: number;
}

interface ZapierApp {
  name: string;
  description: string;
  logo: string;
  category: string;
  isConnected: boolean;
  connectionCount: number;
}

export default function ZapierIntegrationPage() {
  const [zaps, setZaps] = useState<ZapierZap[]>([]);
  const [apps, setApps] = useState<ZapierApp[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedZap, setSelectedZap] = useState<ZapierZap | null>(null);

  useEffect(() => {
    loadZaps();
    loadApps();
  }, []);

  const loadZaps = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would fetch from your backend
      const mockZaps: ZapierZap[] = [
        {
          id: 'zap_1',
          name: 'New Transaction → Slack Notification',
          description: 'Send a Slack message when a new transaction is created',
          status: 'active',
          trigger: { app: 'VeriGrade', event: 'New Transaction' },
          action: { app: 'Slack', event: 'Send Message' },
          lastRun: new Date('2023-12-15T10:30:00Z'),
          runCount: 45,
          errorCount: 2
        },
        {
          id: 'zap_2',
          name: 'New Customer → Google Sheets Row',
          description: 'Add new customers to a Google Sheets spreadsheet',
          status: 'active',
          trigger: { app: 'VeriGrade', event: 'New Customer' },
          action: { app: 'Google Sheets', event: 'Create Row' },
          lastRun: new Date('2023-12-14T15:20:00Z'),
          runCount: 12,
          errorCount: 0
        },
        {
          id: 'zap_3',
          name: 'Payment Received → Email',
          description: 'Send email notification when payment is received',
          status: 'paused',
          trigger: { app: 'VeriGrade', event: 'Payment Received' },
          action: { app: 'Gmail', event: 'Send Email' },
          runCount: 8,
          errorCount: 1
        }
      ];
      
      setZaps(mockZaps);
    } catch (error) {
      console.error('Failed to load zaps:', error);
      toast.error('Failed to load zaps');
    } finally {
      setIsLoading(false);
    }
  };

  const loadApps = async () => {
    try {
      // In a real app, this would fetch from your backend
      const mockApps: ZapierApp[] = [
        {
          name: 'Slack',
          description: 'Team communication and collaboration',
          logo: '/apps/slack.png',
          category: 'Communication',
          isConnected: true,
          connectionCount: 3
        },
        {
          name: 'Google Sheets',
          description: 'Spreadsheet and data management',
          logo: '/apps/google-sheets.png',
          category: 'Productivity',
          isConnected: true,
          connectionCount: 2
        },
        {
          name: 'Gmail',
          description: 'Email communication',
          logo: '/apps/gmail.png',
          category: 'Communication',
          isConnected: true,
          connectionCount: 1
        },
        {
          name: 'HubSpot',
          description: 'CRM and marketing automation',
          logo: '/apps/hubspot.png',
          category: 'Marketing',
          isConnected: false,
          connectionCount: 0
        },
        {
          name: 'Mailchimp',
          description: 'Email marketing platform',
          logo: '/apps/mailchimp.png',
          category: 'Marketing',
          isConnected: false,
          connectionCount: 0
        }
      ];
      
      setApps(mockApps);
    } catch (error) {
      console.error('Failed to load apps:', error);
      toast.error('Failed to load apps');
    }
  };

  const toggleZapStatus = async (zapId: string) => {
    try {
      setZaps(prev => prev.map(zap => 
        zap.id === zapId 
          ? { ...zap, status: zap.status === 'active' ? 'paused' : 'active' }
          : zap
      ));
      
      toast.success('Zap status updated');
    } catch (error) {
      console.error('Failed to toggle zap status:', error);
      toast.error('Failed to update zap status');
    }
  };

  const deleteZap = async (zapId: string) => {
    try {
      setZaps(prev => prev.filter(zap => zap.id !== zapId));
      toast.success('Zap deleted');
    } catch (error) {
      console.error('Failed to delete zap:', error);
      toast.error('Failed to delete zap');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Zap className="h-6 w-6 text-purple-600" />
          <h1 className="text-3xl font-bold">Zapier Integration</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Zap
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="zaps">Zaps</TabsTrigger>
          <TabsTrigger value="apps">Apps</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Zaps</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{zaps.length}</div>
                <p className="text-xs text-muted-foreground">
                  {zaps.filter(z => z.status === 'active').length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Connected Apps</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {apps.filter(a => a.isConnected).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {apps.length} total available
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {zaps.reduce((sum, zap) => sum + zap.runCount, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {zaps.length > 0 
                    ? Math.round((zaps.reduce((sum, zap) => sum + zap.errorCount, 0) / zaps.reduce((sum, zap) => sum + zap.runCount, 1)) * 100)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Success rate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest zap executions and events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {zaps.slice(0, 5).map((zap) => (
                  <div key={zap.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={getStatusColor(zap.status)}>
                        {getStatusIcon(zap.status)}
                      </div>
                      <div>
                        <p className="font-medium">{zap.name}</p>
                        <p className="text-sm text-gray-600">
                          {zap.trigger.app} → {zap.action.app}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {zap.runCount} runs
                      </p>
                      {zap.lastRun && (
                        <p className="text-xs text-gray-500">
                          {zap.lastRun.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="zaps" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Zaps</CardTitle>
              <CardDescription>
                Automate your workflows with Zapier integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {zaps.length === 0 ? (
                  <Alert>
                    <Zap className="h-4 w-4" />
                    <AlertDescription>
                      No zaps created yet. Create your first zap to get started.
                    </AlertDescription>
                  </Alert>
                ) : (
                  zaps.map((zap) => (
                    <div key={zap.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium">{zap.name}</h4>
                            <Badge className={getStatusColor(zap.status)}>
                              {zap.status}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3">{zap.description}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <span>{zap.trigger.app}</span>
                              <span>→</span>
                              <span>{zap.action.app}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <BarChart3 className="h-4 w-4" />
                              <span>{zap.runCount} runs</span>
                            </div>
                            {zap.errorCount > 0 && (
                              <div className="flex items-center space-x-1 text-red-600">
                                <AlertCircle className="h-4 w-4" />
                                <span>{zap.errorCount} errors</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleZapStatus(zap.id)}
                          >
                            {zap.status === 'active' ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedZap(zap)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteZap(zap.id)}
                          >
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

        <TabsContent value="apps" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Connected Apps</CardTitle>
              <CardDescription>
                Manage your app connections and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {apps.map((app) => (
                  <div key={app.name} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-lg font-bold text-gray-600">
                            {app.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium">{app.name}</h4>
                          <p className="text-sm text-gray-600">{app.category}</p>
                        </div>
                      </div>
                      <Badge variant={app.isConnected ? 'default' : 'outline'}>
                        {app.isConnected ? 'Connected' : 'Not Connected'}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{app.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {app.connectionCount} connection{app.connectionCount !== 1 ? 's' : ''}
                      </span>
                      <Button
                        size="sm"
                        variant={app.isConnected ? 'outline' : 'default'}
                      >
                        {app.isConnected ? 'Manage' : 'Connect'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Zapier Settings</CardTitle>
              <CardDescription>
                Configure your Zapier integration settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">API Access</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Manage your API keys and access tokens for Zapier integration.
                  </p>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage API Keys
                  </Button>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Webhook URLs</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Configure webhook endpoints for real-time data synchronization.
                  </p>
                  <Button variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Configure Webhooks
                  </Button>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Data Sync</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Control how often your data syncs with Zapier.
                  </p>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input type="radio" name="sync" value="realtime" defaultChecked />
                      <span className="text-sm">Real-time</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="radio" name="sync" value="hourly" />
                      <span className="text-sm">Hourly</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="radio" name="sync" value="daily" />
                      <span className="text-sm">Daily</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Error Handling</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Configure how errors are handled in your zaps.
                  </p>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Retry failed zaps automatically</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Send error notifications</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" />
                      <span className="text-sm">Pause zaps on repeated errors</span>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

