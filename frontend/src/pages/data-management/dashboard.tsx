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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Storage as StorageIcon,
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
  Transform as TransformIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  Folder as FolderIcon,
  Security as SecurityIcon,
  Backup as BackupIcon,
  Restore as RestoreIcon,
  Analytics as AnalyticsIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Publish as PublishIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

interface DataWarehouse {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  lastSync?: string;
  syncStatus: string;
  error?: string;
}

interface DataSource {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  lastSync?: string;
  syncStatus: string;
  error?: string;
}

interface DataTransformation {
  id: string;
  name: string;
  description: string;
  sourceId: string;
  targetId: string;
  sql: string;
  schedule: {
    type: string;
    cron?: string;
    events?: string[];
  };
  status: string;
  lastRun?: string;
  runStatus: string;
  error?: string;
}

interface DataQuality {
  id: string;
  name: string;
  description: string;
  sourceId: string;
  rules: Array<{
    name: string;
    type: string;
    condition: string;
    threshold: number;
    severity: string;
  }>;
  status: string;
  lastRun?: string;
  runStatus: string;
  error?: string;
}

interface DataLineage {
  id: string;
  sourceId: string;
  targetId: string;
  transformationId?: string;
  lineage: Array<{
    step: string;
    input: string;
    output: string;
    operation: string;
    timestamp: string;
  }>;
}

interface DataCatalog {
  id: string;
  name: string;
  description: string;
  type: string;
  schema: string;
  table: string;
  column?: string;
  dataType?: string;
  tags: string[];
  owner: string;
  businessOwner: string;
  classification: string;
  sensitivity: string;
  retention: {
    period: number;
    unit: string;
    action: string;
  };
}

interface DataGovernance {
  id: string;
  name: string;
  description: string;
  policies: Array<{
    name: string;
    description: string;
    type: string;
    rules: Array<{
      condition: string;
      action: string;
      severity: string;
    }>;
  }>;
  status: string;
}

interface DataImport {
  id: string;
  name: string;
  description: string;
  source: {
    type: string;
    connection: Record<string, any>;
  };
  target: {
    type: string;
    connection: Record<string, any>;
  };
  mapping: Array<{
    source: string;
    target: string;
    transformation?: string;
  }>;
  schedule: {
    type: string;
    cron?: string;
    events?: string[];
  };
  status: string;
  lastRun?: string;
  runStatus: string;
  error?: string;
}

interface DataExport {
  id: string;
  name: string;
  description: string;
  source: {
    type: string;
    connection: Record<string, any>;
  };
  target: {
    type: string;
    connection: Record<string, any>;
  };
  format: string;
  query: string;
  schedule: {
    type: string;
    cron?: string;
    events?: string[];
  };
  status: string;
  lastRun?: string;
  runStatus: string;
  error?: string;
}

interface DataMigration {
  id: string;
  name: string;
  description: string;
  source: {
    type: string;
    connection: Record<string, any>;
  };
  target: {
    type: string;
    connection: Record<string, any>;
  };
  mapping: Array<{
    source: string;
    target: string;
    transformation?: string;
  }>;
  status: string;
  progress: number;
  totalRecords: number;
  processedRecords: number;
  failedRecords: number;
  startTime?: string;
  endTime?: string;
  error?: string;
}

interface DataBackup {
  id: string;
  name: string;
  description: string;
  source: {
    type: string;
    connection: Record<string, any>;
  };
  target: {
    type: string;
    connection: Record<string, any>;
  };
  schedule: {
    type: string;
    cron?: string;
    events?: string[];
  };
  retention: {
    period: number;
    unit: string;
  };
  compression: boolean;
  encryption: boolean;
  status: string;
  lastRun?: string;
  runStatus: string;
  error?: string;
}

interface DataRestore {
  id: string;
  name: string;
  description: string;
  source: {
    type: string;
    connection: Record<string, any>;
  };
  target: {
    type: string;
    connection: Record<string, any>;
  };
  pointInTime: string;
  status: string;
  progress: number;
  startTime?: string;
  endTime?: string;
  error?: string;
}

interface DataAnalytics {
  id: string;
  name: string;
  description: string;
  query: string;
  parameters: Record<string, any>;
  schedule: {
    type: string;
    cron?: string;
    events?: string[];
  };
  status: string;
  lastRun?: string;
  runStatus: string;
  error?: string;
}

interface DataManagementAnalytics {
  totalWarehouses: number;
  totalSources: number;
  totalTransformations: number;
  totalImports: number;
  totalExports: number;
  totalMigrations: number;
  totalBackups: number;
  totalRestores: number;
  dataVolume: number;
  dataQuality: number;
  dataGovernance: number;
  dataLineage: number;
  dataCatalog: number;
  dataAnalytics: number;
  warehouseTypes: Array<{
    type: string;
    count: number;
  }>;
  sourceTypes: Array<{
    type: string;
    count: number;
  }>;
  importFormats: Array<{
    format: string;
    count: number;
  }>;
  exportFormats: Array<{
    format: string;
    count: number;
  }>;
  migrationSources: Array<{
    source: string;
    count: number;
  }>;
  dataTrends: Array<{
    date: string;
    volume: number;
    quality: number;
    governance: number;
  }>;
  qualityMetrics: Array<{
    metric: string;
    value: number;
    threshold: number;
    status: string;
  }>;
  governancePolicies: Array<{
    policy: string;
    violations: number;
    compliance: number;
  }>;
}

const DataManagementDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [warehouses, setWarehouses] = useState<DataWarehouse[]>([]);
  const [sources, setSources] = useState<DataSource[]>([]);
  const [transformations, setTransformations] = useState<DataTransformation[]>([]);
  const [quality, setQuality] = useState<DataQuality[]>([]);
  const [lineage, setLineage] = useState<DataLineage[]>([]);
  const [catalog, setCatalog] = useState<DataCatalog[]>([]);
  const [governance, setGovernance] = useState<DataGovernance[]>([]);
  const [imports, setImports] = useState<DataImport[]>([]);
  const [exports, setExports] = useState<DataExport[]>([]);
  const [migrations, setMigrations] = useState<DataMigration[]>([]);
  const [backups, setBackups] = useState<DataBackup[]>([]);
  const [restores, setRestores] = useState<DataRestore[]>([]);
  const [analytics, setAnalytics] = useState<DataAnalytics[]>([]);
  const [managementAnalytics, setManagementAnalytics] = useState<DataManagementAnalytics | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'warehouse' | 'source' | 'transformation' | 'quality' | 'catalog' | 'governance' | 'import' | 'export' | 'migration' | 'backup' | 'restore' | 'analytics'>('warehouse');
  const [formData, setFormData] = useState<any>({});

  // Mock data for demonstration
  const mockWarehouses: DataWarehouse[] = [
    { id: '1', name: 'Snowflake Warehouse', description: 'Main data warehouse', type: 'SNOWFLAKE', status: 'ACTIVE', lastSync: '2024-01-15T10:00:00Z', syncStatus: 'SUCCESS' },
    { id: '2', name: 'BigQuery Warehouse', description: 'Analytics warehouse', type: 'BIGQUERY', status: 'ACTIVE', lastSync: '2024-01-15T09:30:00Z', syncStatus: 'SUCCESS' },
  ];

  const mockSources: DataSource[] = [
    { id: '1', name: 'PostgreSQL Source', description: 'Main database', type: 'DATABASE', status: 'ACTIVE', lastSync: '2024-01-15T10:00:00Z', syncStatus: 'SUCCESS' },
    { id: '2', name: 'API Source', description: 'External API', type: 'API', status: 'ACTIVE', lastSync: '2024-01-15T09:30:00Z', syncStatus: 'SUCCESS' },
  ];

  const mockTransformations: DataTransformation[] = [
    { id: '1', name: 'ETL Transformation', description: 'Extract, transform, load', sourceId: '1', targetId: '2', sql: 'SELECT * FROM source_table', schedule: { type: 'SCHEDULED', cron: '0 */5 * * * *' }, status: 'ACTIVE', lastRun: '2024-01-15T10:00:00Z', runStatus: 'SUCCESS' },
    { id: '2', name: 'Data Cleaning', description: 'Clean and validate data', sourceId: '2', targetId: '1', sql: 'SELECT cleaned_data FROM raw_data', schedule: { type: 'ON_DEMAND' }, status: 'ACTIVE', lastRun: '2024-01-15T09:30:00Z', runStatus: 'SUCCESS' },
  ];

  const mockQuality: DataQuality[] = [
    { id: '1', name: 'Data Quality Rules', description: 'Quality validation rules', sourceId: '1', rules: [{ name: 'Completeness Check', type: 'COMPLETENESS', condition: 'NOT NULL', threshold: 95, severity: 'HIGH' }], status: 'ACTIVE', lastRun: '2024-01-15T10:00:00Z', runStatus: 'SUCCESS' },
    { id: '2', name: 'Accuracy Rules', description: 'Data accuracy validation', sourceId: '2', rules: [{ name: 'Range Check', type: 'ACCURACY', condition: 'BETWEEN 0 AND 100', threshold: 90, severity: 'MEDIUM' }], status: 'ACTIVE', lastRun: '2024-01-15T09:30:00Z', runStatus: 'SUCCESS' },
  ];

  const mockLineage: DataLineage[] = [
    { id: '1', sourceId: '1', targetId: '2', transformationId: '1', lineage: [{ step: 'extract', input: 'source_table', output: 'raw_data', operation: 'SELECT', timestamp: '2024-01-15T10:00:00Z' }] },
    { id: '2', sourceId: '2', targetId: '1', transformationId: '2', lineage: [{ step: 'transform', input: 'raw_data', output: 'cleaned_data', operation: 'CLEAN', timestamp: '2024-01-15T09:30:00Z' }] },
  ];

  const mockCatalog: DataCatalog[] = [
    { id: '1', name: 'customers', description: 'Customer data table', type: 'TABLE', schema: 'public', table: 'customers', tags: ['customer', 'data'], owner: 'admin', businessOwner: 'sales', classification: 'INTERNAL', sensitivity: 'MEDIUM', retention: { period: 7, unit: 'YEARS', action: 'ARCHIVE' } },
    { id: '2', name: 'orders', description: 'Order data table', type: 'TABLE', schema: 'public', table: 'orders', tags: ['order', 'transaction'], owner: 'admin', businessOwner: 'sales', classification: 'INTERNAL', sensitivity: 'HIGH', retention: { period: 10, unit: 'YEARS', action: 'ARCHIVE' } },
  ];

  const mockGovernance: DataGovernance[] = [
    { id: '1', name: 'Data Governance Policy', description: 'Main governance policy', policies: [{ name: 'Access Control', description: 'Control data access', type: 'ACCESS_CONTROL', rules: [{ condition: 'role = admin', action: 'allow', severity: 'HIGH' }] }], status: 'ACTIVE' },
    { id: '2', name: 'Privacy Policy', description: 'Privacy protection policy', policies: [{ name: 'Data Classification', description: 'Classify data sensitivity', type: 'DATA_CLASSIFICATION', rules: [{ condition: 'contains PII', action: 'classify as sensitive', severity: 'CRITICAL' }] }], status: 'ACTIVE' },
  ];

  const mockImports: DataImport[] = [
    { id: '1', name: 'CSV Import', description: 'Import CSV files', source: { type: 'FILE', connection: { path: '/data/imports' } }, target: { type: 'TABLE', connection: { table: 'imported_data' } }, mapping: [{ source: 'column1', target: 'field1' }], schedule: { type: 'SCHEDULED', cron: '0 0 * * *' }, status: 'ACTIVE', lastRun: '2024-01-15T00:00:00Z', runStatus: 'SUCCESS' },
    { id: '2', name: 'API Import', description: 'Import from API', source: { type: 'API', connection: { url: 'https://api.example.com' } }, target: { type: 'TABLE', connection: { table: 'api_data' } }, mapping: [{ source: 'data', target: 'content' }], schedule: { type: 'ON_DEMAND' }, status: 'ACTIVE', lastRun: '2024-01-15T10:00:00Z', runStatus: 'SUCCESS' },
  ];

  const mockExports: DataExport[] = [
    { id: '1', name: 'CSV Export', description: 'Export to CSV', source: { type: 'TABLE', connection: { table: 'export_data' } }, target: { type: 'FILE', connection: { path: '/data/exports' } }, format: 'CSV', query: 'SELECT * FROM export_data', schedule: { type: 'SCHEDULED', cron: '0 0 * * *' }, status: 'ACTIVE', lastRun: '2024-01-15T00:00:00Z', runStatus: 'SUCCESS' },
    { id: '2', name: 'JSON Export', description: 'Export to JSON', source: { type: 'TABLE', connection: { table: 'json_data' } }, target: { type: 'FILE', connection: { path: '/data/json' } }, format: 'JSON', query: 'SELECT * FROM json_data', schedule: { type: 'ON_DEMAND' }, status: 'ACTIVE', lastRun: '2024-01-15T10:00:00Z', runStatus: 'SUCCESS' },
  ];

  const mockMigrations: DataMigration[] = [
    { id: '1', name: 'QuickBooks Migration', description: 'Migrate from QuickBooks', source: { type: 'QUICKBOOKS', connection: { companyId: 'qb_123' } }, target: { type: 'DATABASE', connection: { table: 'qb_data' } }, mapping: [{ source: 'customer', target: 'customer_name' }], status: 'COMPLETED', progress: 100, totalRecords: 1000, processedRecords: 1000, failedRecords: 0, startTime: '2024-01-15T08:00:00Z', endTime: '2024-01-15T10:00:00Z' },
    { id: '2', name: 'Xero Migration', description: 'Migrate from Xero', source: { type: 'XERO', connection: { tenantId: 'xero_123' } }, target: { type: 'DATABASE', connection: { table: 'xero_data' } }, mapping: [{ source: 'contact', target: 'contact_name' }], status: 'IN_PROGRESS', progress: 75, totalRecords: 500, processedRecords: 375, failedRecords: 0, startTime: '2024-01-15T09:00:00Z' },
  ];

  const mockBackups: DataBackup[] = [
    { id: '1', name: 'Daily Backup', description: 'Daily database backup', source: { type: 'DATABASE', connection: { database: 'main_db' } }, target: { type: 'S3', connection: { bucket: 'backups' } }, schedule: { type: 'SCHEDULED', cron: '0 2 * * *' }, retention: { period: 30, unit: 'DAYS' }, compression: true, encryption: true, status: 'ACTIVE', lastRun: '2024-01-15T02:00:00Z', runStatus: 'SUCCESS' },
    { id: '2', name: 'Weekly Backup', description: 'Weekly full backup', source: { type: 'DATABASE', connection: { database: 'main_db' } }, target: { type: 'S3', connection: { bucket: 'backups' } }, schedule: { type: 'SCHEDULED', cron: '0 3 * * 0' }, retention: { period: 12, unit: 'MONTHS' }, compression: true, encryption: true, status: 'ACTIVE', lastRun: '2024-01-14T03:00:00Z', runStatus: 'SUCCESS' },
  ];

  const mockRestores: DataRestore[] = [
    { id: '1', name: 'Point-in-Time Restore', description: 'Restore to specific time', source: { type: 'S3', connection: { bucket: 'backups' } }, target: { type: 'DATABASE', connection: { database: 'restore_db' } }, pointInTime: '2024-01-15T10:00:00Z', status: 'COMPLETED', progress: 100, startTime: '2024-01-15T11:00:00Z', endTime: '2024-01-15T11:30:00Z' },
    { id: '2', name: 'Full Restore', description: 'Full database restore', source: { type: 'S3', connection: { bucket: 'backups' } }, target: { type: 'DATABASE', connection: { database: 'restore_db' } }, pointInTime: '2024-01-14T00:00:00Z', status: 'IN_PROGRESS', progress: 60, startTime: '2024-01-15T12:00:00Z' },
  ];

  const mockAnalytics: DataAnalytics[] = [
    { id: '1', name: 'Revenue Analytics', description: 'Revenue analysis query', query: 'SELECT SUM(amount) FROM transactions', parameters: {}, schedule: { type: 'SCHEDULED', cron: '0 0 * * *' }, status: 'ACTIVE', lastRun: '2024-01-15T00:00:00Z', runStatus: 'SUCCESS' },
    { id: '2', name: 'Customer Analytics', description: 'Customer analysis query', query: 'SELECT COUNT(*) FROM customers', parameters: {}, schedule: { type: 'ON_DEMAND' }, status: 'ACTIVE', lastRun: '2024-01-15T10:00:00Z', runStatus: 'SUCCESS' },
  ];

  const mockManagementAnalytics: DataManagementAnalytics = {
    totalWarehouses: 5,
    totalSources: 12,
    totalTransformations: 8,
    totalImports: 15,
    totalExports: 10,
    totalMigrations: 3,
    totalBackups: 7,
    totalRestores: 2,
    dataVolume: 1000000,
    dataQuality: 95.5,
    dataGovernance: 88.2,
    dataLineage: 92.1,
    dataCatalog: 87.3,
    dataAnalytics: 91.7,
    warehouseTypes: [
      { type: 'SNOWFLAKE', count: 2 },
      { type: 'BIGQUERY', count: 2 },
      { type: 'REDSHIFT', count: 1 },
    ],
    sourceTypes: [
      { type: 'DATABASE', count: 6 },
      { type: 'API', count: 4 },
      { type: 'FILE', count: 2 },
    ],
    importFormats: [
      { format: 'CSV', count: 8 },
      { format: 'JSON', count: 5 },
      { format: 'XML', count: 2 },
    ],
    exportFormats: [
      { format: 'CSV', count: 6 },
      { format: 'JSON', count: 3 },
      { format: 'XML', count: 1 },
    ],
    migrationSources: [
      { source: 'QUICKBOOKS', count: 2 },
      { source: 'XERO', count: 1 },
    ],
    dataTrends: [
      { date: '2024-01-01', volume: 1000000, quality: 95, governance: 88 },
      { date: '2024-01-02', volume: 1050000, quality: 96, governance: 89 },
      { date: '2024-01-03', volume: 1100000, quality: 97, governance: 90 },
    ],
    qualityMetrics: [
      { metric: 'Completeness', value: 95.2, threshold: 90, status: 'GOOD' },
      { metric: 'Accuracy', value: 92.8, threshold: 90, status: 'GOOD' },
      { metric: 'Consistency', value: 88.5, threshold: 85, status: 'GOOD' },
    ],
    governancePolicies: [
      { policy: 'Access Control', violations: 5, compliance: 95 },
      { policy: 'Data Classification', violations: 3, compliance: 97 },
      { policy: 'Retention', violations: 8, compliance: 92 },
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
      
      setWarehouses(mockWarehouses);
      setSources(mockSources);
      setTransformations(mockTransformations);
      setQuality(mockQuality);
      setLineage(mockLineage);
      setCatalog(mockCatalog);
      setGovernance(mockGovernance);
      setImports(mockImports);
      setExports(mockExports);
      setMigrations(mockMigrations);
      setBackups(mockBackups);
      setRestores(mockRestores);
      setAnalytics(mockAnalytics);
      setManagementAnalytics(mockManagementAnalytics);
    } catch (err) {
      setError('Failed to load data management data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleOpenDialog = (type: 'warehouse' | 'source' | 'transformation' | 'quality' | 'catalog' | 'governance' | 'import' | 'export' | 'migration' | 'backup' | 'restore' | 'analytics', item?: any) => {
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
      case 'COMPLETED': return 'success';
      case 'SUCCESS': return 'success';
      case 'IN_PROGRESS': return 'info';
      case 'PENDING': return 'info';
      case 'FAILED': return 'error';
      case 'ERROR': return 'error';
      case 'CANCELLED': return 'warning';
      case 'INACTIVE': return 'default';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading data management data...</Typography>
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
          Data Management Dashboard
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
            onClick={() => handleOpenDialog('warehouse')}
          >
            Add Warehouse
          </Button>
        </Box>
      </Box>

      {/* Analytics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <StorageIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Data Warehouses
                  </Typography>
                  <Typography variant="h4">
                    {managementAnalytics?.totalWarehouses || 0}
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
                <TransformIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Data Sources
                  </Typography>
                  <Typography variant="h4">
                    {managementAnalytics?.totalSources || 0}
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
                <AssessmentIcon color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Data Quality
                  </Typography>
                  <Typography variant="h4">
                    {managementAnalytics?.dataQuality || 0}%
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
                <SecurityIcon color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Data Governance
                  </Typography>
                  <Typography variant="h4">
                    {managementAnalytics?.dataGovernance || 0}%
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
            <Tab label="Warehouses" />
            <Tab label="Sources" />
            <Tab label="Transformations" />
            <Tab label="Quality" />
            <Tab label="Catalog" />
            <Tab label="Governance" />
            <Tab label="Imports" />
            <Tab label="Exports" />
            <Tab label="Migrations" />
            <Tab label="Backups" />
            <Tab label="Restores" />
            <Tab label="Analytics" />
          </Tabs>
        </Box>

        <CardContent>
          {/* Warehouses Tab */}
          {activeTab === 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Data Warehouses</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('warehouse')}
                >
                  Add Warehouse
                </Button>
              </Box>

              <Grid container spacing={2}>
                {warehouses.map((warehouse) => (
                  <Grid item xs={12} sm={6} md={4} key={warehouse.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">{warehouse.name}</Typography>
                          <Chip
                            label={warehouse.status}
                            color={getStatusColor(warehouse.status) as any}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {warehouse.description}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Type: {warehouse.type}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Last Sync: {warehouse.lastSync ? new Date(warehouse.lastSync).toLocaleString() : 'Never'}
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          <Button size="small" startIcon={<ViewIcon />}>
                            View
                          </Button>
                          <Button size="small" startIcon={<EditIcon />}>
                            Edit
                          </Button>
                          <Button size="small" startIcon={<PlayIcon />}>
                            Sync
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Sources Tab */}
          {activeTab === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Data Sources</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('source')}
                >
                  Add Source
                </Button>
              </Box>

              <Grid container spacing={2}>
                {sources.map((source) => (
                  <Grid item xs={12} sm={6} md={4} key={source.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">{source.name}</Typography>
                          <Chip
                            label={source.status}
                            color={getStatusColor(source.status) as any}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {source.description}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Type: {source.type}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Last Sync: {source.lastSync ? new Date(source.lastSync).toLocaleString() : 'Never'}
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          <Button size="small" startIcon={<ViewIcon />}>
                            View
                          </Button>
                          <Button size="small" startIcon={<EditIcon />}>
                            Edit
                          </Button>
                          <Button size="small" startIcon={<PlayIcon />}>
                            Sync
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Transformations Tab */}
          {activeTab === 2 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Data Transformations</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('transformation')}
                >
                  Add Transformation
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Source</TableCell>
                      <TableCell>Target</TableCell>
                      <TableCell>Schedule</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Last Run</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transformations.map((transformation) => (
                      <TableRow key={transformation.id}>
                        <TableCell>{transformation.name}</TableCell>
                        <TableCell>{transformation.sourceId}</TableCell>
                        <TableCell>{transformation.targetId}</TableCell>
                        <TableCell>{transformation.schedule.type}</TableCell>
                        <TableCell>
                          <Chip
                            label={transformation.status}
                            color={getStatusColor(transformation.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {transformation.lastRun ? new Date(transformation.lastRun).toLocaleString() : 'Never'}
                        </TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <ViewIcon />
                          </IconButton>
                          <IconButton size="small">
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small">
                            <PlayIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Quality Tab */}
          {activeTab === 3 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Data Quality</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('quality')}
                >
                  Add Quality Rules
                </Button>
              </Box>

              <Grid container spacing={2}>
                {quality.map((q) => (
                  <Grid item xs={12} sm={6} md={4} key={q.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">{q.name}</Typography>
                          <Chip
                            label={q.status}
                            color={getStatusColor(q.status) as any}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {q.description}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Rules: {q.rules.length}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Last Run: {q.lastRun ? new Date(q.lastRun).toLocaleString() : 'Never'}
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          <Button size="small" startIcon={<ViewIcon />}>
                            View
                          </Button>
                          <Button size="small" startIcon={<EditIcon />}>
                            Edit
                          </Button>
                          <Button size="small" startIcon={<PlayIcon />}>
                            Run
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Catalog Tab */}
          {activeTab === 4 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Data Catalog</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('catalog')}
                >
                  Add Catalog Entry
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Schema</TableCell>
                      <TableCell>Table</TableCell>
                      <TableCell>Classification</TableCell>
                      <TableCell>Owner</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {catalog.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.type}</TableCell>
                        <TableCell>{item.schema}</TableCell>
                        <TableCell>{item.table}</TableCell>
                        <TableCell>
                          <Chip
                            label={item.classification}
                            color={item.classification === 'PUBLIC' ? 'success' : item.classification === 'INTERNAL' ? 'info' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{item.owner}</TableCell>
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

          {/* Governance Tab */}
          {activeTab === 5 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Data Governance</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('governance')}
                >
                  Add Policy
                </Button>
              </Box>

              <Grid container spacing={2}>
                {governance.map((policy) => (
                  <Grid item xs={12} sm={6} md={4} key={policy.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">{policy.name}</Typography>
                          <Chip
                            label={policy.status}
                            color={getStatusColor(policy.status) as any}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {policy.description}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Policies: {policy.policies.length}
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          <Button size="small" startIcon={<ViewIcon />}>
                            View
                          </Button>
                          <Button size="small" startIcon={<EditIcon />}>
                            Edit
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Imports Tab */}
          {activeTab === 6 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Data Imports</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('import')}
                >
                  Add Import
                </Button>
              </Box>

              <Grid container spacing={2}>
                {imports.map((import_) => (
                  <Grid item xs={12} sm={6} md={4} key={import_.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">{import_.name}</Typography>
                          <Chip
                            label={import_.status}
                            color={getStatusColor(import_.status) as any}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {import_.description}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Source: {import_.source.type}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Target: {import_.target.type}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Last Run: {import_.lastRun ? new Date(import_.lastRun).toLocaleString() : 'Never'}
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          <Button size="small" startIcon={<ViewIcon />}>
                            View
                          </Button>
                          <Button size="small" startIcon={<EditIcon />}>
                            Edit
                          </Button>
                          <Button size="small" startIcon={<PlayIcon />}>
                            Run
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Exports Tab */}
          {activeTab === 7 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Data Exports</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('export')}
                >
                  Add Export
                </Button>
              </Box>

              <Grid container spacing={2}>
                {exports.map((export_) => (
                  <Grid item xs={12} sm={6} md={4} key={export_.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">{export_.name}</Typography>
                          <Chip
                            label={export_.status}
                            color={getStatusColor(export_.status) as any}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {export_.description}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Format: {export_.format}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Last Run: {export_.lastRun ? new Date(export_.lastRun).toLocaleString() : 'Never'}
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          <Button size="small" startIcon={<ViewIcon />}>
                            View
                          </Button>
                          <Button size="small" startIcon={<EditIcon />}>
                            Edit
                          </Button>
                          <Button size="small" startIcon={<PlayIcon />}>
                            Run
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Migrations Tab */}
          {activeTab === 8 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Data Migrations</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('migration')}
                >
                  Add Migration
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Source</TableCell>
                      <TableCell>Target</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Progress</TableCell>
                      <TableCell>Records</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {migrations.map((migration) => (
                      <TableRow key={migration.id}>
                        <TableCell>{migration.name}</TableCell>
                        <TableCell>{migration.source.type}</TableCell>
                        <TableCell>{migration.target.type}</TableCell>
                        <TableCell>
                          <Chip
                            label={migration.status}
                            color={getStatusColor(migration.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: '100%', mr: 1 }}>
                              <LinearProgress variant="determinate" value={migration.progress} />
                            </Box>
                            <Typography variant="body2" color="textSecondary">
                              {migration.progress}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {migration.processedRecords}/{migration.totalRecords}
                        </TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <ViewIcon />
                          </IconButton>
                          <IconButton size="small">
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small">
                            <PlayIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Backups Tab */}
          {activeTab === 9 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Data Backups</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('backup')}
                >
                  Add Backup
                </Button>
              </Box>

              <Grid container spacing={2}>
                {backups.map((backup) => (
                  <Grid item xs={12} sm={6} md={4} key={backup.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">{backup.name}</Typography>
                          <Chip
                            label={backup.status}
                            color={getStatusColor(backup.status) as any}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {backup.description}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Source: {backup.source.type}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Target: {backup.target.type}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Last Run: {backup.lastRun ? new Date(backup.lastRun).toLocaleString() : 'Never'}
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          <Button size="small" startIcon={<ViewIcon />}>
                            View
                          </Button>
                          <Button size="small" startIcon={<EditIcon />}>
                            Edit
                          </Button>
                          <Button size="small" startIcon={<PlayIcon />}>
                            Run
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Restores Tab */}
          {activeTab === 10 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Data Restores</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('restore')}
                >
                  Add Restore
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Source</TableCell>
                      <TableCell>Target</TableCell>
                      <TableCell>Point in Time</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Progress</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {restores.map((restore) => (
                      <TableRow key={restore.id}>
                        <TableCell>{restore.name}</TableCell>
                        <TableCell>{restore.source.type}</TableCell>
                        <TableCell>{restore.target.type}</TableCell>
                        <TableCell>{new Date(restore.pointInTime).toLocaleString()}</TableCell>
                        <TableCell>
                          <Chip
                            label={restore.status}
                            color={getStatusColor(restore.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: '100%', mr: 1 }}>
                              <LinearProgress variant="determinate" value={restore.progress} />
                            </Box>
                            <Typography variant="body2" color="textSecondary">
                              {restore.progress}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <ViewIcon />
                          </IconButton>
                          <IconButton size="small">
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small">
                            <PlayIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Analytics Tab */}
          {activeTab === 11 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3 }}>Data Analytics</Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Data Volume Trends</Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={managementAnalytics?.dataTrends || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <RechartsTooltip />
                          <Line type="monotone" dataKey="volume" stroke="#8884d8" strokeWidth={2} />
                          <Line type="monotone" dataKey="quality" stroke="#82ca9d" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Data Quality Metrics</Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={managementAnalytics?.qualityMetrics || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="metric" />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey="value" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Warehouse Types</Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={managementAnalytics?.warehouseTypes || []}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {managementAnalytics?.warehouseTypes.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={`#${Math.floor(Math.random()*16777215).toString(16)}`} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Source Types</Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={managementAnalytics?.sourceTypes || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="type" />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey="count" fill="#82ca9d" />
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
          {dialogType === 'warehouse' ? 'Add/Edit Data Warehouse' :
           dialogType === 'source' ? 'Add/Edit Data Source' :
           dialogType === 'transformation' ? 'Add/Edit Data Transformation' :
           dialogType === 'quality' ? 'Add/Edit Data Quality' :
           dialogType === 'catalog' ? 'Add/Edit Data Catalog' :
           dialogType === 'governance' ? 'Add/Edit Data Governance' :
           dialogType === 'import' ? 'Add/Edit Data Import' :
           dialogType === 'export' ? 'Add/Edit Data Export' :
           dialogType === 'migration' ? 'Add/Edit Data Migration' :
           dialogType === 'backup' ? 'Add/Edit Data Backup' :
           dialogType === 'restore' ? 'Add/Edit Data Restore' :
           'Add/Edit Data Analytics'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {dialogType === 'warehouse' && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Warehouse Name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={formData.type || ''}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <MenuItem value="SNOWFLAKE">Snowflake</MenuItem>
                      <MenuItem value="BIGQUERY">BigQuery</MenuItem>
                      <MenuItem value="REDSHIFT">Redshift</MenuItem>
                      <MenuItem value="POSTGRESQL">PostgreSQL</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </Grid>
              </Grid>
            )}

            {dialogType === 'source' && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Source Name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={formData.type || ''}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <MenuItem value="DATABASE">Database</MenuItem>
                      <MenuItem value="API">API</MenuItem>
                      <MenuItem value="FILE">File</MenuItem>
                      <MenuItem value="STREAM">Stream</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
        onClick={() => handleOpenDialog('warehouse')}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default DataManagementDashboard;







