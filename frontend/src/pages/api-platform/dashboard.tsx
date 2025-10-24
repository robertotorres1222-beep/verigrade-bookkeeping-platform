import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Alert,
  LinearProgress,
  Tooltip,
  Fab,
  Switch,
  FormControlLabel,
  Slider,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Code,
  Link,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Api as ApiIcon,
  Webhook as WebhookIcon,
  Extension as ExtensionIcon,
  Code as CodeIcon,
  Description as DescriptionIcon,
  Analytics as AnalyticsIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Psychology as PsychologyIcon,
  Assignment as AssignmentIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  BugReport as BugReportIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Publish as PublishIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter } from 'recharts';

interface APIKey {
  id: string;
  name: string;
  key: string;
  secret: string;
  userId: string;
  permissions: string[];
  rateLimit: {
    requests: number;
    window: string;
  };
  status: string;
  lastUsed?: string;
  expiresAt?: string;
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  status: string;
  retryPolicy: {
    maxRetries: number;
    backoffMultiplier: number;
    timeout: number;
  };
  filters?: Record<string, any>;
  headers?: Record<string, string>;
}

interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: string;
  payload: Record<string, any>;
  status: string;
  attempts: number;
  maxAttempts: number;
  nextRetryAt?: string;
  deliveredAt?: string;
  response?: {
    statusCode: number;
    headers: Record<string, string>;
    body: string;
  };
  error?: string;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  provider: string;
  version: string;
  status: string;
  pricing: {
    type: string;
    price?: number;
    currency?: string;
    billingCycle?: string;
  };
  features: string[];
  requirements: string[];
  documentation: string;
  support: {
    email: string;
    documentation: string;
    community: string;
  };
  oauth?: {
    clientId: string;
    clientSecret: string;
    authUrl: string;
    tokenUrl: string;
    scope: string[];
  };
  apiEndpoints: Array<{
    method: string;
    path: string;
    description: string;
    parameters: Array<{
      name: string;
      type: string;
      required: boolean;
      description: string;
    }>;
    response: {
      statusCode: number;
      schema: Record<string, any>;
    };
  }>;
}

interface IntegrationInstallation {
  id: string;
  integrationId: string;
  userId: string;
  status: string;
  configuration: Record<string, any>;
  credentials: Record<string, any>;
  permissions: string[];
  installedAt?: string;
  lastSyncAt?: string;
  syncStatus: string;
  error?: string;
}

interface SDK {
  id: string;
  name: string;
  language: string;
  version: string;
  status: string;
  description: string;
  features: string[];
  installation: string;
  documentation: string;
  examples: Array<{
    title: string;
    description: string;
    code: string;
    language: string;
  }>;
  downloadUrl: string;
  repositoryUrl?: string;
  packageManager: string;
  dependencies: Array<{
    name: string;
    version: string;
    type: string;
  }>;
}

interface APIVersion {
  id: string;
  version: string;
  status: string;
  releaseDate: string;
  sunsetDate?: string;
  changelog: string;
  breakingChanges: string[];
  newFeatures: string[];
  improvements: string[];
  bugFixes: string[];
  documentation: string;
  migrationGuide?: string;
}

interface DeveloperPortal {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  status: string;
  tags: string[];
  author: string;
  publishedAt?: string;
  views: number;
  likes: number;
}

interface APIAnalytics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  errorRate: number;
  uniqueUsers: number;
  topEndpoints: Array<{
    endpoint: string;
    requests: number;
    averageResponseTime: number;
  }>;
  requestTrend: Array<{
    date: string;
    requests: number;
    errors: number;
  }>;
  userGrowth: Array<{
    date: string;
    newUsers: number;
    totalUsers: number;
  }>;
  integrationUsage: Array<{
    integration: string;
    installations: number;
    activeUsers: number;
  }>;
}

const APIPlatformDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [webhookDeliveries, setWebhookDeliveries] = useState<WebhookDelivery[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [integrationInstallations, setIntegrationInstallations] = useState<IntegrationInstallation[]>([]);
  const [sdks, setSdks] = useState<SDK[]>([]);
  const [apiVersions, setApiVersions] = useState<APIVersion[]>([]);
  const [developerPortal, setDeveloperPortal] = useState<DeveloperPortal[]>([]);
  const [analytics, setAnalytics] = useState<APIAnalytics | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'api-key' | 'webhook' | 'integration' | 'sdk' | 'api-version' | 'developer-portal'>('api-key');
  const [formData, setFormData] = useState<any>({});

  // Mock data for demonstration
  const mockApiKeys: APIKey[] = [
    { id: '1', name: 'Production API Key', key: 'ak_live_1234567890abcdef', secret: 'sk_live_1234567890abcdef', userId: 'user1', permissions: ['read', 'write'], rateLimit: { requests: 1000, window: '1h' }, status: 'ACTIVE', lastUsed: '2024-01-15T10:00:00Z' },
    { id: '2', name: 'Development API Key', key: 'ak_test_1234567890abcdef', secret: 'sk_test_1234567890abcdef', userId: 'user1', permissions: ['read'], rateLimit: { requests: 100, window: '1h' }, status: 'ACTIVE' },
  ];

  const mockWebhooks: Webhook[] = [
    { id: '1', name: 'Invoice Created Webhook', url: 'https://example.com/webhooks/invoice-created', events: ['invoice.created'], secret: 'whsec_1234567890abcdef', status: 'ACTIVE', retryPolicy: { maxRetries: 3, backoffMultiplier: 2, timeout: 30 } },
    { id: '2', name: 'Payment Received Webhook', url: 'https://example.com/webhooks/payment-received', events: ['payment.received'], secret: 'whsec_1234567890abcdef', status: 'ACTIVE', retryPolicy: { maxRetries: 5, backoffMultiplier: 1.5, timeout: 60 } },
  ];

  const mockWebhookDeliveries: WebhookDelivery[] = [
    { id: '1', webhookId: '1', event: 'invoice.created', payload: { invoiceId: 'inv_123', amount: 1000 }, status: 'DELIVERED', attempts: 1, maxAttempts: 3, deliveredAt: '2024-01-15T10:00:00Z', response: { statusCode: 200, headers: { 'content-type': 'application/json' }, body: 'OK' } },
    { id: '2', webhookId: '2', event: 'payment.received', payload: { paymentId: 'pay_123', amount: 1000 }, status: 'FAILED', attempts: 2, maxAttempts: 5, error: 'Connection timeout' },
  ];

  const mockIntegrations: Integration[] = [
    { id: '1', name: 'QuickBooks Integration', description: 'Sync with QuickBooks Online', category: 'ACCOUNTING', provider: 'QuickBooks', version: '1.0.0', status: 'ACTIVE', pricing: { type: 'FREE' }, features: ['sync_invoices', 'sync_customers', 'sync_items'], requirements: ['QuickBooks Online account'], documentation: 'https://docs.example.com/quickbooks', support: { email: 'support@example.com', documentation: 'https://docs.example.com', community: 'https://community.example.com' }, apiEndpoints: [] },
    { id: '2', name: 'Xero Integration', description: 'Sync with Xero accounting software', category: 'ACCOUNTING', provider: 'Xero', version: '1.0.0', status: 'ACTIVE', pricing: { type: 'FREEMIUM' }, features: ['sync_invoices', 'sync_customers'], requirements: ['Xero account'], documentation: 'https://docs.example.com/xero', support: { email: 'support@example.com', documentation: 'https://docs.example.com', community: 'https://community.example.com' }, apiEndpoints: [] },
  ];

  const mockIntegrationInstallations: IntegrationInstallation[] = [
    { id: '1', integrationId: '1', userId: 'user1', status: 'ACTIVE', configuration: { companyId: 'qb_123' }, credentials: { accessToken: 'token_123' }, permissions: ['read', 'write'], installedAt: '2024-01-15T10:00:00Z', lastSyncAt: '2024-01-15T11:00:00Z', syncStatus: 'SUCCESS' },
    { id: '2', integrationId: '2', userId: 'user1', status: 'ACTIVE', configuration: { tenantId: 'xero_123' }, credentials: { accessToken: 'token_456' }, permissions: ['read'], installedAt: '2024-01-15T10:30:00Z', lastSyncAt: '2024-01-15T11:30:00Z', syncStatus: 'SUCCESS' },
  ];

  const mockSdks: SDK[] = [
    { id: '1', name: 'VeriGrade JavaScript SDK', language: 'JAVASCRIPT', version: '1.0.0', status: 'ACTIVE', description: 'Official JavaScript SDK for VeriGrade API', features: ['authentication', 'request_handling', 'error_handling'], installation: 'npm install @verigrade/sdk', documentation: 'https://docs.example.com/javascript', examples: [{ title: 'Basic Usage', description: 'How to get started', code: 'const client = new VeriGradeClient(apiKey);', language: 'javascript' }], downloadUrl: 'https://npmjs.com/package/@verigrade/sdk', repositoryUrl: 'https://github.com/verigrade/sdk-js', packageManager: 'npm', dependencies: [{ name: 'axios', version: '^1.0.0', type: 'PRODUCTION' }] },
    { id: '2', name: 'VeriGrade Python SDK', language: 'PYTHON', version: '1.0.0', status: 'ACTIVE', description: 'Official Python SDK for VeriGrade API', features: ['authentication', 'request_handling', 'error_handling'], installation: 'pip install verigrade-sdk', documentation: 'https://docs.example.com/python', examples: [{ title: 'Basic Usage', description: 'How to get started', code: 'from verigrade import Client\nclient = Client(api_key)', language: 'python' }], downloadUrl: 'https://pypi.org/project/verigrade-sdk', repositoryUrl: 'https://github.com/verigrade/sdk-python', packageManager: 'pip', dependencies: [{ name: 'requests', version: '^2.0.0', type: 'PRODUCTION' }] },
  ];

  const mockApiVersions: APIVersion[] = [
    { id: '1', version: 'v1.0.0', status: 'STABLE', releaseDate: '2024-01-01', changelog: 'Initial release', breakingChanges: [], newFeatures: ['REST API', 'Webhooks', 'SDKs'], improvements: [], bugFixes: [], documentation: 'https://docs.example.com/v1' },
    { id: '2', version: 'v1.1.0', status: 'STABLE', releaseDate: '2024-01-15', changelog: 'Added new features', breakingChanges: [], newFeatures: ['GraphQL API', 'Real-time subscriptions'], improvements: ['Better error handling', 'Improved performance'], bugFixes: ['Fixed authentication issue', 'Fixed webhook delivery'], documentation: 'https://docs.example.com/v1.1' },
  ];

  const mockDeveloperPortal: DeveloperPortal[] = [
    { id: '1', title: 'Getting Started Guide', description: 'Learn how to get started with our API', content: 'This guide will help you get started with our API...', category: 'GUIDE', status: 'PUBLISHED', tags: ['getting-started', 'api', 'tutorial'], author: 'user1', publishedAt: '2024-01-01T00:00:00Z', views: 150, likes: 25 },
    { id: '2', title: 'Authentication Tutorial', description: 'Learn how to authenticate with our API', content: 'Authentication is required for all API requests...', category: 'TUTORIAL', status: 'PUBLISHED', tags: ['authentication', 'security', 'tutorial'], author: 'user1', publishedAt: '2024-01-05T00:00:00Z', views: 100, likes: 15 },
  ];

  const mockAnalytics: APIAnalytics = {
    totalRequests: 150000,
    successfulRequests: 142500,
    failedRequests: 7500,
    averageResponseTime: 250,
    errorRate: 5.0,
    uniqueUsers: 150,
    topEndpoints: [
      { endpoint: '/api/v1/users', requests: 50000, averageResponseTime: 200 },
      { endpoint: '/api/v1/transactions', requests: 30000, averageResponseTime: 300 },
      { endpoint: '/api/v1/reports', requests: 20000, averageResponseTime: 400 },
    ],
    requestTrend: [
      { date: '2024-01-01', requests: 5000, errors: 250 },
      { date: '2024-01-02', requests: 5500, errors: 275 },
      { date: '2024-01-03', requests: 6000, errors: 300 },
    ],
    userGrowth: [
      { date: '2024-01-01', newUsers: 10, totalUsers: 100 },
      { date: '2024-01-02', newUsers: 15, totalUsers: 115 },
      { date: '2024-01-03', newUsers: 20, totalUsers: 135 },
    ],
    integrationUsage: [
      { integration: 'QuickBooks', installations: 150, activeUsers: 120 },
      { integration: 'Xero', installations: 100, activeUsers: 85 },
      { integration: 'Shopify', installations: 75, activeUsers: 60 },
    ],
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setApiKeys(mockApiKeys);
      setWebhooks(mockWebhooks);
      setWebhookDeliveries(mockWebhookDeliveries);
      setIntegrations(mockIntegrations);
      setIntegrationInstallations(mockIntegrationInstallations);
      setSdks(mockSdks);
      setApiVersions(mockApiVersions);
      setDeveloperPortal(mockDeveloperPortal);
      setAnalytics(mockAnalytics);
    } catch (err) {
      setError('Failed to load API platform data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleOpenDialog = (type: 'api-key' | 'webhook' | 'integration' | 'sdk' | 'api-version' | 'developer-portal', item?: any) => {
    setDialogType(type);
    setFormData(item || {});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFormData({});
  };

  const handleSave = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      handleCloseDialog();
      loadData();
    } catch (err) {
      setError('Failed to save data');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'DELIVERED': return 'success';
      case 'STABLE': return 'success';
      case 'PUBLISHED': return 'success';
      case 'PENDING': return 'info';
      case 'INSTALLING': return 'info';
      case 'BETA': return 'info';
      case 'FAILED': return 'error';
      case 'REVOKED': return 'error';
      case 'DEPRECATED': return 'warning';
      case 'DRAFT': return 'default';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading API platform data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={loadData}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          API Platform Dashboard
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadData}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            sx={{ mr: 1 }}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('api-key')}
          >
            Add API Key
          </Button>
        </Box>
      </Box>

      {/* Analytics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ApiIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Requests
                  </Typography>
                  <Typography variant="h4">
                    {analytics?.totalRequests?.toLocaleString() || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircleIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Success Rate
                  </Typography>
                  <Typography variant="h4">
                    {((analytics?.successfulRequests || 0) / (analytics?.totalRequests || 1) * 100).toFixed(1)}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SpeedIcon color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Avg Response Time
                  </Typography>
                  <Typography variant="h4">
                    {analytics?.averageResponseTime || 0}ms
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Unique Users
                  </Typography>
                  <Typography variant="h4">
                    {analytics?.uniqueUsers || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="API Keys" />
            <Tab label="Webhooks" />
            <Tab label="Integrations" />
            <Tab label="SDKs" />
            <Tab label="API Versions" />
            <Tab label="Developer Portal" />
            <Tab label="Analytics" />
          </Tabs>
        </Box>

        <CardContent>
          {/* API Keys Tab */}
          {activeTab === 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">API Keys</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('api-key')}
                >
                  Add API Key
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Key</TableCell>
                      <TableCell>Permissions</TableCell>
                      <TableCell>Rate Limit</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Last Used</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {apiKeys.map((apiKey) => (
                      <TableRow key={apiKey.id}>
                        <TableCell>{apiKey.name}</TableCell>
                        <TableCell>
                          <Code>{apiKey.key}</Code>
                        </TableCell>
                        <TableCell>
                          {apiKey.permissions.map((permission) => (
                            <Chip key={permission} label={permission} size="small" sx={{ mr: 0.5 }} />
                          ))}
                        </TableCell>
                        <TableCell>
                          {apiKey.rateLimit.requests}/{apiKey.rateLimit.window}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={apiKey.status}
                            color={getStatusColor(apiKey.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {apiKey.lastUsed ? new Date(apiKey.lastUsed).toLocaleString() : 'Never'}
                        </TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small">
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Webhooks Tab */}
          {activeTab === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Webhooks</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('webhook')}
                >
                  Add Webhook
                </Button>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>URL</TableCell>
                          <TableCell>Events</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {webhooks.map((webhook) => (
                          <TableRow key={webhook.id}>
                            <TableCell>{webhook.name}</TableCell>
                            <TableCell>
                              <Link href={webhook.url} target="_blank" rel="noopener">
                                {webhook.url}
                              </Link>
                            </TableCell>
                            <TableCell>
                              {webhook.events.map((event) => (
                                <Chip key={event} label={event} size="small" sx={{ mr: 0.5 }} />
                              ))}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={webhook.status}
                                color={getStatusColor(webhook.status) as any}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton size="small">
                                <PlayIcon />
                              </IconButton>
                              <IconButton size="small">
                                <EditIcon />
                              </IconButton>
                              <IconButton size="small">
                                <ViewIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Recent Deliveries</Typography>
                      {webhookDeliveries.map((delivery) => (
                        <Box key={delivery.id} sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body2" fontWeight="bold">
                              {delivery.event}
                            </Typography>
                            <Chip
                              label={delivery.status}
                              color={getStatusColor(delivery.status) as any}
                              size="small"
                            />
                          </Box>
                          <Typography variant="body2" color="textSecondary">
                            Attempts: {delivery.attempts}/{delivery.maxAttempts}
                          </Typography>
                          {delivery.error && (
                            <Typography variant="body2" color="error">
                              Error: {delivery.error}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Integrations Tab */}
          {activeTab === 2 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Integrations</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('integration')}
                >
                  Add Integration
                </Button>
              </Box>

              <Grid container spacing={2}>
                {integrations.map((integration) => (
                  <Grid item xs={12} sm={6} md={4} key={integration.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">{integration.name}</Typography>
                          <Chip
                            label={integration.status}
                            color={getStatusColor(integration.status) as any}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {integration.description}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Provider: {integration.provider}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Category: {integration.category}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Pricing: {integration.pricing.type}
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          <Button size="small" startIcon={<EditIcon />}>
                            Edit
                          </Button>
                          <Button size="small" startIcon={<ViewIcon />}>
                            View
                          </Button>
                          <Button size="small" startIcon={<PlayIcon />}>
                            Install
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* SDKs Tab */}
          {activeTab === 3 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">SDKs</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('sdk')}
                >
                  Add SDK
                </Button>
              </Box>

              <Grid container spacing={2}>
                {sdks.map((sdk) => (
                  <Grid item xs={12} sm={6} md={4} key={sdk.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">{sdk.name}</Typography>
                          <Chip
                            label={sdk.status}
                            color={getStatusColor(sdk.status) as any}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {sdk.description}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Language: {sdk.language}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Version: {sdk.version}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Package Manager: {sdk.packageManager}
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          <Button size="small" startIcon={<DownloadIcon />}>
                            Download
                          </Button>
                          <Button size="small" startIcon={<ViewIcon />}>
                            View
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* API Versions Tab */}
          {activeTab === 4 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">API Versions</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('api-version')}
                >
                  Add Version
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Version</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Release Date</TableCell>
                      <TableCell>Sunset Date</TableCell>
                      <TableCell>New Features</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {apiVersions.map((version) => (
                      <TableRow key={version.id}>
                        <TableCell>
                          <Typography variant="body1" fontWeight="bold">
                            {version.version}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={version.status}
                            color={getStatusColor(version.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{new Date(version.releaseDate).toLocaleDateString()}</TableCell>
                        <TableCell>{version.sunsetDate ? new Date(version.sunsetDate).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>{version.newFeatures.length}</TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <ViewIcon />
                          </IconButton>
                          <IconButton size="small">
                            <EditIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Developer Portal Tab */}
          {activeTab === 5 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Developer Portal</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('developer-portal')}
                >
                  Add Content
                </Button>
              </Box>

              <Grid container spacing={2}>
                {developerPortal.map((content) => (
                  <Grid item xs={12} sm={6} md={4} key={content.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">{content.title}</Typography>
                          <Chip
                            label={content.status}
                            color={getStatusColor(content.status) as any}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {content.description}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Category: {content.category}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Views: {content.views} | Likes: {content.likes}
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          <Button size="small" startIcon={<ViewIcon />}>
                            View
                          </Button>
                          <Button size="small" startIcon={<EditIcon />}>
                            Edit
                          </Button>
                          <Button size="small" startIcon={<PublishIcon />}>
                            Publish
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Analytics Tab */}
          {activeTab === 6 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3 }}>API Analytics</Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Request Trend</Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analytics?.requestTrend || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <RechartsTooltip />
                          <Line type="monotone" dataKey="requests" stroke="#8884d8" strokeWidth={2} />
                          <Line type="monotone" dataKey="errors" stroke="#ff7300" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>User Growth</Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={analytics?.userGrowth || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <RechartsTooltip />
                          <Area type="monotone" dataKey="totalUsers" stackId="1" stroke="#8884d8" fill="#8884d8" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Top Endpoints</Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics?.topEndpoints || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="endpoint" />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey="requests" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Integration Usage</Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics?.integrationUsage || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="integration" />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey="installations" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Dialog for Add/Edit */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogType === 'api-key' ? 'Add/Edit API Key' :
           dialogType === 'webhook' ? 'Add/Edit Webhook' :
           dialogType === 'integration' ? 'Add/Edit Integration' :
           dialogType === 'sdk' ? 'Add/Edit SDK' :
           dialogType === 'api-version' ? 'Add/Edit API Version' :
           'Add/Edit Developer Portal Content'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {dialogType === 'api-key' && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="API Key Name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.status || 'ACTIVE'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <MenuItem value="ACTIVE">Active</MenuItem>
                      <MenuItem value="INACTIVE">Inactive</MenuItem>
                      <MenuItem value="REVOKED">Revoked</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Rate Limit (requests)"
                    type="number"
                    value={formData.rateLimit?.requests || ''}
                    onChange={(e) => setFormData({ ...formData, rateLimit: { ...formData.rateLimit, requests: parseInt(e.target.value) } })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Rate Limit Window</InputLabel>
                    <Select
                      value={formData.rateLimit?.window || '1h'}
                      onChange={(e) => setFormData({ ...formData, rateLimit: { ...formData.rateLimit, window: e.target.value } })}
                    >
                      <MenuItem value="1m">1 minute</MenuItem>
                      <MenuItem value="1h">1 hour</MenuItem>
                      <MenuItem value="1d">1 day</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            )}

            {dialogType === 'webhook' && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Webhook Name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Webhook URL"
                    value={formData.url || ''}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Events (comma-separated)"
                    value={formData.events?.join(',') || ''}
                    onChange={(e) => setFormData({ ...formData, events: e.target.value.split(',') })}
                  />
                </Grid>
              </Grid>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => handleOpenDialog('api-key')}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default APIPlatformDashboard;




