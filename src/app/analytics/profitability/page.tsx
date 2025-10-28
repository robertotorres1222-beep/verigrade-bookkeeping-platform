'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Package, 
  AlertTriangle,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

interface ProfitabilityMetrics {
  totalRevenue: number;
  totalCosts: number;
  grossProfit: number;
  grossProfitMargin: number;
  netProfit: number;
  netProfitMargin: number;
  clientCount: number;
  averageClientValue: number;
  topPerformingClients: ClientProfitability[];
  topPerformingServices: ServiceProfitability[];
  trends: {
    revenue: number[];
    costs: number[];
    profit: number[];
    periods: string[];
  };
  benchmarks: {
    industryAverage: number;
    competitorAverage: number;
    targetMargin: number;
  };
}

interface ClientProfitability {
  clientId: string;
  clientName: string;
  totalRevenue: number;
  totalCosts: number;
  grossProfit: number;
  grossProfitMargin: number;
  netProfit: number;
  netProfitMargin: number;
  projectCount: number;
  averageProjectValue: number;
  averageProjectProfit: number;
  lastProjectDate?: Date;
  paymentHistory: {
    onTime: number;
    late: number;
    overdue: number;
  };
  riskScore: number;
  recommendations: string[];
}

interface ServiceProfitability {
  serviceId: string;
  serviceName: string;
  totalRevenue: number;
  totalCosts: number;
  grossProfit: number;
  grossProfitMargin: number;
  netProfit: number;
  netProfitMargin: number;
  projectCount: number;
  averageProjectValue: number;
  averageProjectProfit: number;
  utilizationRate: number;
  efficiencyScore: number;
  recommendations: string[];
}

export default function ProfitabilityAnalyticsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboard, setDashboard] = useState<any>(null);
  const [selectedClient, setSelectedClient] = useState<ClientProfitability | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceProfitability | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadDashboard();
  }, [dateRange]);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/analytics/profitability/dashboard?startDate=${dateRange.start}&endDate=${dateRange.end}`);
      if (response.ok) {
        const data = await response.json();
        setDashboard(data.dashboard);
      } else {
        throw new Error('Failed to load dashboard');
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load profitability dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const loadClientDetails = async (clientId: string) => {
    try {
      const response = await fetch(`/api/analytics/profitability/clients/${clientId}?startDate=${dateRange.start}&endDate=${dateRange.end}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedClient(data.profitability);
        setActiveTab('clients');
      } else {
        throw new Error('Failed to load client details');
      }
    } catch (error) {
      console.error('Error loading client details:', error);
      toast.error('Failed to load client details');
    }
  };

  const loadServiceDetails = async (serviceId: string) => {
    try {
      const response = await fetch(`/api/analytics/profitability/services/${serviceId}?startDate=${dateRange.start}&endDate=${dateRange.end}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedService(data.profitability);
        setActiveTab('services');
      } else {
        throw new Error('Failed to load service details');
      }
    } catch (error) {
      console.error('Error loading service details:', error);
      toast.error('Failed to load service details');
    }
  };

  const exportReport = async () => {
    try {
      const response = await fetch('/api/analytics/profitability/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: dateRange.start,
          endDate: dateRange.end,
          format: 'csv'
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `profitability-report-${dateRange.start}-${dateRange.end}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Report exported successfully');
      } else {
        throw new Error('Failed to export report');
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    }
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 70) return 'bg-red-100 text-red-800';
    if (riskScore >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getRiskLabel = (riskScore: number) => {
    if (riskScore >= 70) return 'High Risk';
    if (riskScore >= 40) return 'Medium Risk';
    return 'Low Risk';
  };

  const getMarginColor = (margin: number) => {
    if (margin >= 20) return 'text-green-600';
    if (margin >= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading profitability data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-6 w-6 text-blue-600" />
          <h1 className="text-3xl font-bold">Profitability Analytics</h1>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="border rounded px-2 py-1 text-sm"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
          <Button variant="outline" onClick={loadDashboard}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {dashboard?.alerts && dashboard.alerts.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <div className="space-y-1">
              {dashboard.alerts.map((alert: string, index: number) => (
                <div key={index}>{alert}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      {dashboard?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">${dashboard.summary.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Gross Profit</p>
                  <p className="text-2xl font-bold">${dashboard.summary.grossProfit.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Profit Margin</p>
                  <p className={`text-2xl font-bold ${getMarginColor(dashboard.summary.grossProfitMargin)}`}>
                    {dashboard.summary.grossProfitMargin.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Active Clients</p>
                  <p className="text-2xl font-bold">{dashboard.summary.clientCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performing Clients */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Clients</CardTitle>
                <CardDescription>
                  Clients with highest profitability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboard?.topClients?.map((client: ClientProfitability, index: number) => (
                    <div key={client.clientId} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{client.clientName}</h4>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                            <span>Revenue: ${client.totalRevenue.toLocaleString()}</span>
                            <span className={getMarginColor(client.grossProfitMargin)}>
                              Margin: {client.grossProfitMargin.toFixed(1)}%
                            </span>
                            <span>Projects: {client.projectCount}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getRiskColor(client.riskScore)}>
                            {getRiskLabel(client.riskScore)}
                          </Badge>
                          <Button size="sm" variant="outline" onClick={() => loadClientDetails(client.clientId)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Performing Services */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Services</CardTitle>
                <CardDescription>
                  Services with highest profitability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboard?.topServices?.map((service: ServiceProfitability, index: number) => (
                    <div key={service.serviceId} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{service.serviceName}</h4>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                            <span>Revenue: ${service.totalRevenue.toLocaleString()}</span>
                            <span className={getMarginColor(service.grossProfitMargin)}>
                              Margin: {service.grossProfitMargin.toFixed(1)}%
                            </span>
                            <span>Utilization: {service.utilizationRate.toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={service.efficiencyScore >= 70 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {service.efficiencyScore >= 70 ? 'High Efficiency' : 'Medium Efficiency'}
                          </Badge>
                          <Button size="sm" variant="outline" onClick={() => loadServiceDetails(service.serviceId)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Profitability Analysis</CardTitle>
              <CardDescription>
                Detailed analysis of client profitability and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedClient ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">Financial Summary</h4>
                      <div className="space-y-1 text-sm">
                        <p>Revenue: ${selectedClient.totalRevenue.toLocaleString()}</p>
                        <p>Costs: ${selectedClient.totalCosts.toLocaleString()}</p>
                        <p>Profit: ${selectedClient.grossProfit.toLocaleString()}</p>
                        <p className={getMarginColor(selectedClient.grossProfitMargin)}>
                          Margin: {selectedClient.grossProfitMargin.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">Project Metrics</h4>
                      <div className="space-y-1 text-sm">
                        <p>Projects: {selectedClient.projectCount}</p>
                        <p>Avg Value: ${selectedClient.averageProjectValue.toLocaleString()}</p>
                        <p>Avg Profit: ${selectedClient.averageProjectProfit.toLocaleString()}</p>
                        <p>Last Project: {selectedClient.lastProjectDate?.toLocaleDateString() || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">Payment History</h4>
                      <div className="space-y-1 text-sm">
                        <p>On Time: {selectedClient.paymentHistory.onTime}</p>
                        <p>Late: {selectedClient.paymentHistory.late}</p>
                        <p>Overdue: {selectedClient.paymentHistory.overdue}</p>
                        <p>Risk Score: {selectedClient.riskScore}</p>
                      </div>
                    </div>
                  </div>
                  
                  {selectedClient.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Recommendations</h4>
                      <ul className="space-y-1">
                        {selectedClient.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start">
                            <span className="mr-2">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Select a client to view detailed analysis</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Profitability Analysis</CardTitle>
              <CardDescription>
                Detailed analysis of service profitability and efficiency
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedService ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">Financial Summary</h4>
                      <div className="space-y-1 text-sm">
                        <p>Revenue: ${selectedService.totalRevenue.toLocaleString()}</p>
                        <p>Costs: ${selectedService.totalCosts.toLocaleString()}</p>
                        <p>Profit: ${selectedService.grossProfit.toLocaleString()}</p>
                        <p className={getMarginColor(selectedService.grossProfitMargin)}>
                          Margin: {selectedService.grossProfitMargin.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">Performance Metrics</h4>
                      <div className="space-y-1 text-sm">
                        <p>Projects: {selectedService.projectCount}</p>
                        <p>Avg Value: ${selectedService.averageProjectValue.toLocaleString()}</p>
                        <p>Avg Profit: ${selectedService.averageProjectProfit.toLocaleString()}</p>
                        <p>Utilization: {selectedService.utilizationRate.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">Efficiency</h4>
                      <div className="space-y-1 text-sm">
                        <p>Efficiency Score: {selectedService.efficiencyScore.toFixed(1)}</p>
                        <p>Status: {selectedService.efficiencyScore >= 70 ? 'High' : 'Medium'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {selectedService.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Recommendations</h4>
                      <ul className="space-y-1">
                        {selectedService.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start">
                            <span className="mr-2">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Select a service to view detailed analysis</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profitability Trends</CardTitle>
              <CardDescription>
                Historical trends and performance analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Trend analysis charts would be displayed here</p>
                <p className="text-sm text-gray-500 mt-2">
                  Revenue, costs, and profit trends over time
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

