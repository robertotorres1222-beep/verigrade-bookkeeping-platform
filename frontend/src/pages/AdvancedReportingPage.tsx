import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Tooltip,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Chip,
  Avatar,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  Assessment,
  Schedule,
  TrendingUp,
  Compare,
  Add,
  Settings,
  Refresh,
  Download,
  FilterList,
  ViewList,
  ViewModule,
  CalendarToday,
  AttachMoney,
  Group,
  Business,
  Timeline,
  CheckCircle,
  Warning,
  Pause,
  PlayArrow,
  Stop,
  Rule,
  Automation,
  SmartToy,
} from '@mui/icons-material';
import { format, differenceInDays, addDays, startOfWeek, endOfWeek } from 'date-fns';

// Import components
import ReportBuilder from '../components/ReportBuilder';
import ScheduledReportsManager from '../components/ScheduledReportsManager';

interface ReportTemplate {
  id: string;
  userId: string;
  name: string;
  description: string;
  category: string;
  isPublic: boolean;
  fields: any[];
  filters: any[];
  groupings: any[];
  sorting: any[];
  charts: any[];
  layout: any;
  createdAt: Date;
  updatedAt: Date;
}

interface ScheduledReport {
  id: string;
  userId: string;
  templateId: string;
  name: string;
  description: string;
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    time: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
    month?: number;
  };
  recipients: Array<{
    email: string;
    name: string;
    format: 'pdf' | 'excel' | 'csv' | 'json';
  }>;
  parameters: Record<string, any>;
  isActive: boolean;
  lastRun?: Date;
  nextRun?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface ReportDelivery {
  id: string;
  scheduledReportId: string;
  status: 'pending' | 'processing' | 'sent' | 'failed';
  recipients: string[];
  format: string;
  fileSize?: number;
  sentAt?: Date;
  error?: string;
  createdAt: Date;
}

interface ReportHistory {
  id: string;
  scheduledReportId: string;
  status: 'success' | 'failed';
  recipients: string[];
  format: string;
  fileSize: number;
  sentAt: Date;
  error?: string;
}

interface ForecastData {
  id: string;
  userId: string;
  name: string;
  description: string;
  type: 'revenue' | 'expenses' | 'cash_flow' | 'custom';
  dataSource: string;
  timeRange: {
    start: Date;
    end: Date;
  };
  forecastPeriod: {
    start: Date;
    end: Date;
  };
  method: 'linear' | 'exponential' | 'seasonal' | 'arima' | 'machine_learning';
  parameters: Record<string, any>;
  results?: any;
  confidence: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ComparativeAnalysis {
  id: string;
  userId: string;
  name: string;
  description: string;
  comparisons: Array<{
    name: string;
    data: Array<{
      period: string;
      value: number;
      percentage?: number;
    }>;
  }>;
  insights: string[];
  recommendations: string[];
  createdAt: Date;
  updatedAt: Date;
}

const AdvancedReportingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [deliveries, setDeliveries] = useState<ReportDelivery[]>([]);
  const [history, setHistory] = useState<ReportHistory[]>([]);
  const [forecasts, setForecasts] = useState<ForecastData[]>([]);
  const [comparativeAnalyses, setComparativeAnalyses] = useState<ComparativeAnalysis[]>([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });

  // Initialize with sample data
  useEffect(() => {
    const sampleTemplates: ReportTemplate[] = [
      {
        id: 'template1',
        userId: 'user1',
        name: 'Monthly Financial Summary',
        description: 'Comprehensive monthly financial report',
        category: 'financial',
        isPublic: true,
        fields: [],
        filters: [],
        groupings: [],
        sorting: [],
        charts: [],
        layout: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'template2',
        userId: 'user1',
        name: 'Revenue Analysis',
        description: 'Detailed revenue breakdown and trends',
        category: 'financial',
        isPublic: false,
        fields: [],
        filters: [],
        groupings: [],
        sorting: [],
        charts: [],
        layout: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const sampleScheduledReports: ScheduledReport[] = [
      {
        id: 'scheduled1',
        userId: 'user1',
        templateId: 'template1',
        name: 'Weekly Financial Report',
        description: 'Automated weekly financial summary',
        schedule: {
          frequency: 'weekly',
          time: '09:00',
          dayOfWeek: 1,
        },
        recipients: [
          { email: 'admin@company.com', name: 'Admin', format: 'pdf' },
          { email: 'finance@company.com', name: 'Finance Team', format: 'excel' },
        ],
        parameters: {},
        isActive: true,
        lastRun: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        nextRun: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'scheduled2',
        userId: 'user1',
        templateId: 'template2',
        name: 'Monthly Revenue Report',
        description: 'Monthly revenue analysis and forecasting',
        schedule: {
          frequency: 'monthly',
          time: '10:00',
          dayOfMonth: 1,
        },
        recipients: [
          { email: 'ceo@company.com', name: 'CEO', format: 'pdf' },
        ],
        parameters: {},
        isActive: true,
        lastRun: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        nextRun: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const sampleDeliveries: ReportDelivery[] = [
      {
        id: 'delivery1',
        scheduledReportId: 'scheduled1',
        status: 'sent',
        recipients: ['admin@company.com', 'finance@company.com'],
        format: 'pdf',
        fileSize: 1024 * 1024, // 1MB
        sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'delivery2',
        scheduledReportId: 'scheduled2',
        status: 'processing',
        recipients: ['ceo@company.com'],
        format: 'pdf',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      },
    ];

    const sampleHistory: ReportHistory[] = [
      {
        id: 'history1',
        scheduledReportId: 'scheduled1',
        status: 'success',
        recipients: ['admin@company.com', 'finance@company.com'],
        format: 'pdf',
        fileSize: 1024 * 1024,
        sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'history2',
        scheduledReportId: 'scheduled2',
        status: 'failed',
        recipients: ['ceo@company.com'],
        format: 'pdf',
        fileSize: 0,
        sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        error: 'Email delivery failed',
      },
    ];

    const sampleForecasts: ForecastData[] = [
      {
        id: 'forecast1',
        userId: 'user1',
        name: 'Revenue Forecast',
        description: '12-month revenue forecasting',
        type: 'revenue',
        dataSource: 'transactions',
        timeRange: {
          start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
          end: new Date(),
        },
        forecastPeriod: {
          start: new Date(),
          end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
        method: 'linear',
        parameters: {},
        confidence: 0.85,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'forecast2',
        userId: 'user1',
        name: 'Cash Flow Forecast',
        description: '6-month cash flow prediction',
        type: 'cash_flow',
        dataSource: 'bank_transactions',
        timeRange: {
          start: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
          end: new Date(),
        },
        forecastPeriod: {
          start: new Date(),
          end: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        },
        method: 'seasonal',
        parameters: {},
        confidence: 0.78,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const sampleComparativeAnalyses: ComparativeAnalysis[] = [
      {
        id: 'analysis1',
        userId: 'user1',
        name: 'Year-over-Year Analysis',
        description: 'Compare current year performance with previous year',
        comparisons: [
          {
            name: 'Revenue',
            data: [
              { period: 'Q1 2023', value: 100000, percentage: 10 },
              { period: 'Q1 2024', value: 110000, percentage: 10 },
            ],
          },
          {
            name: 'Expenses',
            data: [
              { period: 'Q1 2023', value: 80000, percentage: 5 },
              { period: 'Q1 2024', value: 84000, percentage: 5 },
            ],
          },
        ],
        insights: [
          'Revenue increased by 10% year-over-year',
          'Expense growth was controlled at 5%',
          'Profit margin improved significantly',
        ],
        recommendations: [
          'Continue current growth strategy',
          'Monitor expense growth closely',
          'Consider expanding into new markets',
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    setTemplates(sampleTemplates);
    setScheduledReports(sampleScheduledReports);
    setDeliveries(sampleDeliveries);
    setHistory(sampleHistory);
    setForecasts(sampleForecasts);
    setComparativeAnalyses(sampleComparativeAnalyses);
  }, []);

  // Handle template operations
  const handleTemplateSave = (template: any) => {
    const newTemplate: ReportTemplate = {
      id: `template_${Date.now()}`,
      userId: 'user1',
      ...template,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTemplates(prev => [...prev, newTemplate]);
    setSnackbar({ open: true, message: 'Template saved successfully', severity: 'success' });
  };

  const handleTemplatePreview = (template: any) => {
    setSnackbar({ open: true, message: 'Report preview generated', severity: 'info' });
  };

  const handleTemplateExport = (template: any, format: string) => {
    setSnackbar({ open: true, message: `Report exported as ${format.toUpperCase()}`, severity: 'success' });
  };

  // Handle scheduled report operations
  const handleReportCreate = (report: Omit<ScheduledReport, 'id' | 'createdAt' | 'updatedAt' | 'lastRun' | 'nextRun'>) => {
    const newReport: ScheduledReport = {
      id: `scheduled_${Date.now()}`,
      ...report,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setScheduledReports(prev => [...prev, newReport]);
    setSnackbar({ open: true, message: 'Scheduled report created successfully', severity: 'success' });
  };

  const handleReportUpdate = (id: string, updates: Partial<ScheduledReport>) => {
    setScheduledReports(prev => prev.map(r => r.id === id ? { ...r, ...updates, updatedAt: new Date() } : r));
    setSnackbar({ open: true, message: 'Report updated successfully', severity: 'success' });
  };

  const handleReportDelete = (id: string) => {
    setScheduledReports(prev => prev.filter(r => r.id !== id));
    setSnackbar({ open: true, message: 'Report deleted successfully', severity: 'success' });
  };

  const handleReportPause = (id: string) => {
    setScheduledReports(prev => prev.map(r => r.id === id ? { ...r, isActive: false, updatedAt: new Date() } : r));
    setSnackbar({ open: true, message: 'Report paused successfully', severity: 'success' });
  };

  const handleReportResume = (id: string) => {
    setScheduledReports(prev => prev.map(r => r.id === id ? { ...r, isActive: true, updatedAt: new Date() } : r));
    setSnackbar({ open: true, message: 'Report resumed successfully', severity: 'success' });
  };

  const handleReportExecute = (id: string) => {
    setSnackbar({ open: true, message: 'Report execution started', severity: 'info' });
  };

  const handleDeliveryRetry = (id: string) => {
    setSnackbar({ open: true, message: 'Delivery retry started', severity: 'info' });
  };

  // Get report statistics
  const getReportStats = () => {
    const totalReports = scheduledReports.length;
    const activeReports = scheduledReports.filter(r => r.isActive).length;
    const totalDeliveries = history.length;
    const successfulDeliveries = history.filter(h => h.status === 'success').length;
    const successRate = totalDeliveries > 0 ? (successfulDeliveries / totalDeliveries) * 100 : 0;

    return {
      totalReports,
      activeReports,
      totalDeliveries,
      successfulDeliveries,
      successRate,
    };
  };

  const stats = getReportStats();

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Advanced Reporting
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Custom report builder, scheduled reports, forecasting, and comparative analysis
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => setSnackbar({ open: true, message: 'Data refreshed', severity: 'info' })}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={() => setSnackbar({ open: true, message: 'Export coming soon', severity: 'info' })}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Reports
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalReports}
                  </Typography>
                </Box>
                <Assessment color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Reports
                  </Typography>
                  <Typography variant="h4">
                    {stats.activeReports}
                  </Typography>
                </Box>
                <Schedule color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Deliveries
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalDeliveries}
                  </Typography>
                </Box>
                <Timeline color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Success Rate
                  </Typography>
                  <Typography variant="h4">
                    {stats.successRate.toFixed(1)}%
                  </Typography>
                </Box>
                <CheckCircle color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Report Builder" icon={<Assessment />} />
            <Tab label="Scheduled Reports" icon={<Schedule />} />
            <Tab label="Forecasting" icon={<TrendingUp />} />
            <Tab label="Comparative Analysis" icon={<Compare />} />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {/* Report Builder Tab */}
          {activeTab === 0 && (
            <ReportBuilder
              onSave={handleTemplateSave}
              onPreview={handleTemplatePreview}
              onExport={handleTemplateExport}
            />
          )}

          {/* Scheduled Reports Tab */}
          {activeTab === 1 && (
            <ScheduledReportsManager
              scheduledReports={scheduledReports}
              deliveries={deliveries}
              history={history}
              onReportCreate={handleReportCreate}
              onReportUpdate={handleReportUpdate}
              onReportDelete={handleReportDelete}
              onReportPause={handleReportPause}
              onReportResume={handleReportResume}
              onReportExecute={handleReportExecute}
              onDeliveryRetry={handleDeliveryRetry}
            />
          )}

          {/* Forecasting Tab */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Forecasting
              </Typography>
              <Grid container spacing={2}>
                {forecasts.map((forecast) => (
                  <Grid item xs={12} sm={6} md={4} key={forecast.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {forecast.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {forecast.description}
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Type: {forecast.type}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Method: {forecast.method}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Confidence: {(forecast.confidence * 100).toFixed(1)}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={forecast.confidence * 100}
                          sx={{ mb: 2 }}
                        />
                        <Button variant="outlined" size="small" fullWidth>
                          View Forecast
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Comparative Analysis Tab */}
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Comparative Analysis
              </Typography>
              <Grid container spacing={2}>
                {comparativeAnalyses.map((analysis) => (
                  <Grid item xs={12} sm={6} md={4} key={analysis.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {analysis.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {analysis.description}
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Comparisons: {analysis.comparisons.length}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Insights: {analysis.insights.length}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Recommendations: {analysis.recommendations.length}
                          </Typography>
                        </Box>
                        <Button variant="outlined" size="small" fullWidth>
                          View Analysis
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setSnackbar({ open: true, message: 'Quick action menu', severity: 'info' })}
      >
        <Add />
      </Fab>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdvancedReportingPage;







