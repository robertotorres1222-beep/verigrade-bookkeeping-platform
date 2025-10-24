import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Repeat, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  Filter,
  Download,
  Eye,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  Calendar,
  Clock
} from 'lucide-react';

interface RecurringDashboardProps {
  companyId: string;
}

interface TemplateStats {
  totalTemplates: number;
  activeTemplates: number;
  inactiveTemplates: number;
  invoiceTemplates: number;
  expenseTemplates: number;
  paymentTemplates: number;
  recentTemplates: number;
}

interface RecurringTemplate {
  id: string;
  templateName: string;
  templateDescription: string;
  templateType: string;
  recurrencePattern: string;
  recurrenceInterval: number;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  lastGeneratedAt?: string;
  createdAt: string;
}

interface GenerationLog {
  id: string;
  totalTemplates: number;
  generatedItems: number;
  skippedItems: number;
  errors: any[];
  generatedAt: string;
}

interface UpcomingItem {
  templateId: string;
  templateName: string;
  templateType: string;
  nextGeneration: string;
  daysUntilNext: number;
}

const RecurringDashboard: React.FC<RecurringDashboardProps> = ({ companyId }) => {
  const [templateStats, setTemplateStats] = useState<TemplateStats | null>(null);
  const [recentTemplates, setRecentTemplates] = useState<RecurringTemplate[]>([]);
  const [generationLogs, setGenerationLogs] = useState<GenerationLog[]>([]);
  const [upcomingItems, setUpcomingItems] = useState<UpcomingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadRecurringData();
  }, [companyId]);

  const loadRecurringData = async () => {
    try {
      setLoading(true);
      const [statsResponse, templatesResponse, logsResponse, upcomingResponse] = await Promise.all([
        fetch(`/api/recurring/stats`),
        fetch(`/api/recurring/recent`),
        fetch(`/api/recurring/logs`),
        fetch(`/api/recurring/upcoming`)
      ]);

      if (!statsResponse.ok || !templatesResponse.ok || !logsResponse.ok || !upcomingResponse.ok) {
        throw new Error('Failed to load recurring data');
      }

      const [statsData, templatesData, logsData, upcomingData] = await Promise.all([
        statsResponse.json(),
        templatesResponse.json(),
        logsResponse.json(),
        upcomingResponse.json()
      ]);

      setTemplateStats(statsData.data);
      setRecentTemplates(templatesData.data);
      setGenerationLogs(logsData.data);
      setUpcomingItems(upcomingData.data);
    } catch (error) {
      console.error('Error loading recurring data:', error);
      setError('Failed to load recurring data');
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'invoice': return 'bg-blue-500';
      case 'expense': return 'bg-red-500';
      case 'payment': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'invoice': return <BarChart3 className="h-4 w-4" />;
      case 'expense': return <TrendingDown className="h-4 w-4" />;
      case 'payment': return <TrendingUp className="h-4 w-4" />;
      default: return <Repeat className="h-4 w-4" />;
    }
  };

  const getPatternColor = (pattern: string) => {
    switch (pattern) {
      case 'daily': return 'bg-green-500';
      case 'weekly': return 'bg-blue-500';
      case 'monthly': return 'bg-purple-500';
      case 'yearly': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString();
  };

  const generateRecurringItems = async () => {
    try {
      const response = await fetch('/api/recurring/generate', {
        method: 'POST'
      });

      if (response.ok) {
        // Reload data to reflect changes
        loadRecurringData();
      }
    } catch (error) {
      console.error('Error generating recurring items:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading recurring data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Recurring Templates Dashboard</h1>
          <p className="text-gray-600">Automated recurring invoices, expenses, and payments</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={generateRecurringItems} variant="outline">
            <Play className="h-4 w-4 mr-2" />
            Generate Items
          </Button>
          <Button onClick={loadRecurringData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Template Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
                <Repeat className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{templateStats?.totalTemplates || 0}</div>
                <p className="text-xs text-muted-foreground">
                  All templates
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Templates</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{templateStats?.activeTemplates || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Currently active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Invoice Templates</CardTitle>
                <BarChart3 className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{templateStats?.invoiceTemplates || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Recurring invoices
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expense Templates</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{templateStats?.expenseTemplates || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Recurring expenses
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Template Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Template Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4 text-blue-500" />
                      <span>Invoices</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={templateStats ? (templateStats.invoiceTemplates / templateStats.totalTemplates) * 100 : 0} className="w-20" />
                      <span className="text-sm font-medium">{templateStats?.invoiceTemplates || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      <span>Expenses</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={templateStats ? (templateStats.expenseTemplates / templateStats.totalTemplates) * 100 : 0} className="w-20" />
                      <span className="text-sm font-medium">{templateStats?.expenseTemplates || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span>Payments</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={templateStats ? (templateStats.paymentTemplates / templateStats.totalTemplates) * 100 : 0} className="w-20" />
                      <span className="text-sm font-medium">{templateStats?.paymentTemplates || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Template Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Active</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={templateStats ? (templateStats.activeTemplates / templateStats.totalTemplates) * 100 : 0} className="w-20" />
                      <span className="text-sm font-medium">{templateStats?.activeTemplates || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      <span>Inactive</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={templateStats ? (templateStats.inactiveTemplates / templateStats.totalTemplates) * 100 : 0} className="w-20" />
                      <span className="text-sm font-medium">{templateStats?.inactiveTemplates || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recurring Templates</CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTemplates.length === 0 ? (
                  <div className="text-center py-8">
                    <Repeat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No recurring templates</p>
                    <Button className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Template
                    </Button>
                  </div>
                ) : (
                  recentTemplates.map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge variant="outline" className={getTypeColor(template.templateType)}>
                            {getTypeIcon(template.templateType)}
                            <span className="ml-1">{template.templateType.toUpperCase()}</span>
                          </Badge>
                          <span className="font-medium">{template.templateName}</span>
                          <Badge variant={template.isActive ? 'default' : 'secondary'}>
                            {template.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline" className={getPatternColor(template.recurrencePattern)}>
                            {template.recurrencePattern.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{template.templateDescription}</p>
                        <div className="text-sm text-gray-600">
                          <p><strong>Start Date:</strong> {formatDate(template.startDate)}</p>
                          {template.endDate && <p><strong>End Date:</strong> {formatDate(template.endDate)}</p>}
                          {template.lastGeneratedAt && <p><strong>Last Generated:</strong> {formatDateTime(template.lastGeneratedAt)}</p>}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generation Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {generationLogs.length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No generation logs</p>
                  </div>
                ) : (
                  generationLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-medium">Generation Run</span>
                          <Badge variant="outline">
                            {log.totalTemplates} templates
                          </Badge>
                          <Badge variant="outline">
                            {log.generatedItems} generated
                          </Badge>
                          <Badge variant="outline">
                            {log.skippedItems} skipped
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p><strong>Generated:</strong> {formatDateTime(log.generatedAt)}</p>
                          {log.errors && log.errors.length > 0 && (
                            <p><strong>Errors:</strong> {log.errors.length} errors occurred</p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No upcoming items</p>
                  </div>
                ) : (
                  upcomingItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge variant="outline" className={getTypeColor(item.templateType)}>
                            {getTypeIcon(item.templateType)}
                            <span className="ml-1">{item.templateType.toUpperCase()}</span>
                          </Badge>
                          <span className="font-medium">{item.templateName}</span>
                          <Badge variant={item.daysUntilNext <= 1 ? 'destructive' : 'secondary'}>
                            {item.daysUntilNext <= 1 ? 'Due Soon' : `${item.daysUntilNext} days`}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p><strong>Next Generation:</strong> {formatDate(item.nextGeneration)}</p>
                          <p><strong>Days Until Next:</strong> {item.daysUntilNext} days</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Clock className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
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
};

export default RecurringDashboard;