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
  Badge,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Publish as PublishIcon,
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
  Refresh as RefreshIcon,
  Science as ScienceIcon,
  Psychology as PsychologyIcon,
  Memory as MemoryIcon,
  Speed as SpeedIcon,
  Analytics as AnalyticsIcon,
  Assessment as AssessmentIcon,
  BarChart as BarChartIcon,
  ShowChart as ShowChartIcon,
  ScatterPlot as ScatterPlotIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon2,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  CompareArrows as CompareArrowsIcon,
  AutoGraph as AutoGraphIcon,
  ModelTraining as ModelTrainingIcon,
  SmartToy as SmartToyIcon,
  Biotech as BiotechIcon,
  DataObject as DataObjectIcon,
  Functions as FunctionsIcon,
  Calculate as CalculateIcon,
  AccountTree as AccountTreeIcon,
  Schema as SchemaIcon,
  Storage as StorageIcon,
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
  Sync as SyncIcon,
  Schedule as ScheduleIcon,
  PlayCircleOutline as PlayCircleOutlineIcon,
  PauseCircleOutline as PauseCircleOutlineIcon,
  StopCircleOutline as StopCircleOutlineIcon,
  RestartAlt as RestartAltIcon,
  Settings as SettingsIcon,
  Tune as TuneIcon,
  Build as BuildIcon,
  Construction as ConstructionIcon,
  Engineering as EngineeringIcon,
  PrecisionManufacturing as PrecisionManufacturingIcon,
  PsychologyAlt as PsychologyAltIcon,
  BiotechAlt as BiotechAltIcon,
  ScienceAlt as ScienceAltIcon,
  MemoryAlt as MemoryAltIcon,
  SpeedAlt as SpeedAltIcon,
  AnalyticsAlt as AnalyticsAltIcon,
  AssessmentAlt as AssessmentAltIcon,
  BarChartAlt as BarChartAltIcon,
  ShowChartAlt as ShowChartAltIcon,
  ScatterPlotAlt as ScatterPlotAltIcon,
  PieChartAlt as PieChartAltIcon,
  TimelineAlt as TimelineAltIcon2,
  TrendingDownAlt as TrendingDownAltIcon,
  TrendingFlatAlt as TrendingFlatAltIcon,
  CompareArrowsAlt as CompareArrowsAltIcon,
  AutoGraphAlt as AutoGraphAltIcon,
  ModelTrainingAlt as ModelTrainingAltIcon,
  SmartToyAlt as SmartToyAltIcon,
  BiotechAlt2 as BiotechAlt2Icon,
  DataObjectAlt as DataObjectAltIcon,
  FunctionsAlt as FunctionsAltIcon,
  CalculateAlt as CalculateAltIcon,
  AccountTreeAlt as AccountTreeAltIcon,
  SchemaAlt as SchemaAltIcon,
  StorageAlt as StorageAltIcon,
  CloudUploadAlt as CloudUploadAltIcon,
  CloudDownloadAlt as CloudDownloadAltIcon,
  SyncAlt as SyncAltIcon,
  ScheduleAlt as ScheduleAltIcon,
  PlayCircleOutlineAlt as PlayCircleOutlineAltIcon,
  PauseCircleOutlineAlt as PauseCircleOutlineAltIcon,
  StopCircleOutlineAlt as StopCircleOutlineAltIcon,
  RestartAltAlt as RestartAltAltIcon,
  SettingsAlt as SettingsAltIcon,
  TuneAlt as TuneAltIcon,
  BuildAlt as BuildAltIcon,
  ConstructionAlt as ConstructionAltIcon,
  EngineeringAlt as EngineeringAltIcon,
  PrecisionManufacturingAlt as PrecisionManufacturingAltIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart } from 'recharts';

interface MLModel {
  id: string;
  name: string;
  type: string;
  algorithm: string;
  version: string;
  status: string;
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  trainingData: {
    size: number;
    features: string[];
    target: string;
    split: {
      train: number;
      validation: number;
      test: number;
    };
  };
  hyperparameters: Record<string, any>;
  modelPath: string;
  metrics: Record<string, number>;
}

interface ModelTraining {
  id: string;
  modelId: string;
  status: string;
  trainingData: Record<string, any>;
  hyperparameters: Record<string, any>;
  metrics: Record<string, number>;
  startTime: string;
  endTime?: string;
  duration?: number;
  error?: string;
  logs: string[];
}

interface ModelDeployment {
  id: string;
  modelId: string;
  environment: string;
  status: string;
  endpoint: string;
  version: string;
  replicas: number;
  resources: {
    cpu: string;
    memory: string;
    gpu?: string;
  };
  healthCheck: {
    endpoint: string;
    interval: number;
    timeout: number;
    retries: number;
  };
  monitoring: {
    enabled: boolean;
    metrics: string[];
    alerts: Array<{
      metric: string;
      threshold: number;
      operator: string;
    }>;
  };
  deployedAt?: string;
}

interface ModelPrediction {
  id: string;
  modelId: string;
  input: Record<string, any>;
  output: Record<string, any>;
  confidence: number;
  processingTime: number;
  status: string;
  error?: string;
}

interface ModelMonitoring {
  id: string;
  modelId: string;
  metric: string;
  value: number;
  threshold?: number;
  status: string;
  timestamp: string;
  metadata: Record<string, any>;
}

interface ModelDrift {
  id: string;
  modelId: string;
  feature: string;
  driftScore: number;
  pValue: number;
  threshold: number;
  status: string;
  baselineData: Record<string, any>;
  currentData: Record<string, any>;
  detectedAt: string;
}

interface ModelPerformance {
  id: string;
  modelId: string;
  metric: string;
  value: number;
  baseline: number;
  change: number;
  changePercent: number;
  period: string;
  timestamp: string;
}

interface ModelExperiment {
  id: string;
  name: string;
  description: string;
  status: string;
  models: string[];
  metrics: Record<string, number>;
  bestModel?: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  results: Array<{
    modelId: string;
    metrics: Record<string, number>;
    rank: number;
  }>;
}

interface ModelRegistry {
  id: string;
  name: string;
  description: string;
  version: string;
  stage: string;
  tags: string[];
  metadata: Record<string, any>;
  modelId: string;
}

interface ModelServing {
  id: string;
  modelId: string;
  endpoint: string;
  status: string;
  requests: number;
  latency: number;
  throughput: number;
  errorRate: number;
  lastRequest?: string;
}

interface ModelFeatureStore {
  id: string;
  name: string;
  description: string;
  type: string;
  dataType: string;
  schema: Record<string, any>;
  source: string;
  transformations: Array<{
    name: string;
    parameters: Record<string, any>;
  }>;
  validation: {
    rules: Array<{
      name: string;
      condition: string;
      action: string;
    }>;
  };
}

interface ModelPipeline {
  id: string;
  name: string;
  description: string;
  status: string;
  steps: Array<{
    id: string;
    name: string;
    type: string;
    config: Record<string, any>;
    dependencies: string[];
  }>;
  schedule?: {
    type: string;
    cron?: string;
    events?: string[];
  };
  triggers: Array<{
    type: string;
    config: Record<string, any>;
  }>;
}

interface AIMLAnalytics {
  totalModels: number;
  activeModels: number;
  trainingJobs: number;
  deployments: number;
  predictions: number;
  modelTypes: Array<{
    type: string;
    count: number;
  }>;
  modelStatus: Array<{
    status: string;
    count: number;
  }>;
  performanceTrend: Array<{
    date: string;
    accuracy: number;
    latency: number;
    throughput: number;
  }>;
  driftDetection: Array<{
    modelId: string;
    driftScore: number;
    status: string;
  }>;
  experimentResults: Array<{
    experimentId: string;
    bestModel: string;
    accuracy: number;
    status: string;
  }>;
}

const AIMLPlatformDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [models, setModels] = useState<MLModel[]>([]);
  const [trainings, setTrainings] = useState<ModelTraining[]>([]);
  const [deployments, setDeployments] = useState<ModelDeployment[]>([]);
  const [predictions, setPredictions] = useState<ModelPrediction[]>([]);
  const [monitoring, setMonitoring] = useState<ModelMonitoring[]>([]);
  const [drift, setDrift] = useState<ModelDrift[]>([]);
  const [performance, setPerformance] = useState<ModelPerformance[]>([]);
  const [experiments, setExperiments] = useState<ModelExperiment[]>([]);
  const [registry, setRegistry] = useState<ModelRegistry[]>([]);
  const [serving, setServing] = useState<ModelServing[]>([]);
  const [featureStore, setFeatureStore] = useState<ModelFeatureStore[]>([]);
  const [pipelines, setPipelines] = useState<ModelPipeline[]>([]);
  const [analytics, setAnalytics] = useState<AIMLAnalytics | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'model' | 'training' | 'deployment' | 'experiment' | 'pipeline' | 'feature-store'>('model');
  const [formData, setFormData] = useState<any>({});

  // Mock data for demonstration
  const mockModels: MLModel[] = [
    { id: '1', name: 'Fraud Detection Model', type: 'CLASSIFICATION', algorithm: 'Random Forest', version: '1.0.0', status: 'DEPLOYED', accuracy: 0.92, precision: 0.89, recall: 0.91, f1Score: 0.90, trainingData: { size: 10000, features: ['amount', 'time', 'location'], target: 'fraud', split: { train: 0.7, validation: 0.15, test: 0.15 } }, hyperparameters: { n_estimators: 100, max_depth: 10 }, modelPath: '/models/fraud_detection_v1.pkl', metrics: { accuracy: 0.92, precision: 0.89, recall: 0.91, f1_score: 0.90 } },
    { id: '2', name: 'Customer Churn Model', type: 'CLASSIFICATION', algorithm: 'XGBoost', version: '1.1.0', status: 'TRAINED', accuracy: 0.88, precision: 0.85, recall: 0.87, f1Score: 0.86, trainingData: { size: 5000, features: ['usage', 'billing', 'support'], target: 'churn', split: { train: 0.8, validation: 0.1, test: 0.1 } }, hyperparameters: { learning_rate: 0.1, max_depth: 6 }, modelPath: '/models/churn_prediction_v1.pkl', metrics: { accuracy: 0.88, precision: 0.85, recall: 0.87, f1_score: 0.86 } },
  ];

  const mockTrainings: ModelTraining[] = [
    { id: '1', modelId: '1', status: 'COMPLETED', trainingData: { size: 10000 }, hyperparameters: { n_estimators: 100 }, metrics: { accuracy: 0.92 }, startTime: '2024-01-15T10:00:00Z', endTime: '2024-01-15T11:30:00Z', duration: 5400, logs: ['Training started', 'Epoch 1/10 completed', 'Training completed successfully'] },
    { id: '2', modelId: '2', status: 'RUNNING', trainingData: { size: 5000 }, hyperparameters: { learning_rate: 0.1 }, metrics: {}, startTime: '2024-01-15T12:00:00Z', logs: ['Training started', 'Epoch 1/10 in progress'] },
  ];

  const mockDeployments: ModelDeployment[] = [
    { id: '1', modelId: '1', environment: 'PRODUCTION', status: 'DEPLOYED', endpoint: 'https://api.example.com/models/fraud-detection', version: '1.0.0', replicas: 3, resources: { cpu: '2', memory: '4Gi', gpu: '1' }, healthCheck: { endpoint: '/health', interval: 30, timeout: 10, retries: 3 }, monitoring: { enabled: true, metrics: ['accuracy', 'latency'], alerts: [{ metric: 'accuracy', threshold: 0.8, operator: 'LT' }] }, deployedAt: '2024-01-15T11:30:00Z' },
    { id: '2', modelId: '2', environment: 'STAGING', status: 'DEPLOYING', endpoint: 'https://staging-api.example.com/models/churn-prediction', version: '1.1.0', replicas: 1, resources: { cpu: '1', memory: '2Gi' }, healthCheck: { endpoint: '/health', interval: 30, timeout: 10, retries: 3 }, monitoring: { enabled: true, metrics: ['accuracy'], alerts: [] } },
  ];

  const mockPredictions: ModelPrediction[] = [
    { id: '1', modelId: '1', input: { amount: 1000, time: '2024-01-15T10:00:00Z', location: 'US' }, output: { prediction: 'fraud', confidence: 0.95 }, confidence: 0.95, processingTime: 150, status: 'SUCCESS' },
    { id: '2', modelId: '1', input: { amount: 50, time: '2024-01-15T10:05:00Z', location: 'US' }, output: { prediction: 'legitimate', confidence: 0.88 }, confidence: 0.88, processingTime: 120, status: 'SUCCESS' },
  ];

  const mockMonitoring: ModelMonitoring[] = [
    { id: '1', modelId: '1', metric: 'accuracy', value: 0.92, threshold: 0.8, status: 'NORMAL', timestamp: '2024-01-15T10:00:00Z', metadata: {} },
    { id: '2', modelId: '1', metric: 'latency', value: 150, threshold: 200, status: 'NORMAL', timestamp: '2024-01-15T10:00:00Z', metadata: {} },
    { id: '3', modelId: '1', metric: 'throughput', value: 100, threshold: 50, status: 'NORMAL', timestamp: '2024-01-15T10:00:00Z', metadata: {} },
  ];

  const mockDrift: ModelDrift[] = [
    { id: '1', modelId: '1', feature: 'amount', driftScore: 0.15, pValue: 0.05, threshold: 0.1, status: 'DRIFT_DETECTED', baselineData: { mean: 1000, std: 500 }, currentData: { mean: 1200, std: 600 }, detectedAt: '2024-01-15T10:00:00Z' },
    { id: '2', modelId: '2', feature: 'usage', driftScore: 0.05, pValue: 0.3, threshold: 0.1, status: 'NORMAL', baselineData: { mean: 50, std: 20 }, currentData: { mean: 52, std: 22 }, detectedAt: '2024-01-15T10:00:00Z' },
  ];

  const mockPerformance: ModelPerformance[] = [
    { id: '1', modelId: '1', metric: 'accuracy', value: 0.92, baseline: 0.90, change: 0.02, changePercent: 2.22, period: 'DAILY', timestamp: '2024-01-15T10:00:00Z' },
    { id: '2', modelId: '1', metric: 'latency', value: 150, baseline: 200, change: -50, changePercent: -25.0, period: 'DAILY', timestamp: '2024-01-15T10:00:00Z' },
  ];

  const mockExperiments: ModelExperiment[] = [
    { id: '1', name: 'Fraud Detection Experiment', description: 'Testing different algorithms for fraud detection', status: 'COMPLETED', models: ['model_1', 'model_2', 'model_3'], metrics: { accuracy: 0.92, precision: 0.89 }, bestModel: 'model_1', startTime: '2024-01-15T09:00:00Z', endTime: '2024-01-15T11:00:00Z', duration: 7200, results: [{ modelId: 'model_1', metrics: { accuracy: 0.92 }, rank: 1 }, { modelId: 'model_2', metrics: { accuracy: 0.88 }, rank: 2 }] },
    { id: '2', name: 'Churn Prediction Experiment', description: 'Testing different features for churn prediction', status: 'RUNNING', models: ['model_4', 'model_5'], metrics: {}, startTime: '2024-01-15T12:00:00Z', results: [] },
  ];

  const mockRegistry: ModelRegistry[] = [
    { id: '1', name: 'Fraud Detection Model', description: 'Production fraud detection model', version: '1.0.0', stage: 'PRODUCTION', tags: ['fraud', 'classification', 'production'], metadata: { accuracy: 0.92 }, modelId: '1' },
    { id: '2', name: 'Churn Prediction Model', description: 'Staging churn prediction model', version: '1.1.0', stage: 'STAGING', tags: ['churn', 'classification', 'staging'], metadata: { accuracy: 0.88 }, modelId: '2' },
  ];

  const mockServing: ModelServing[] = [
    { id: '1', modelId: '1', endpoint: 'https://api.example.com/models/fraud-detection', status: 'ACTIVE', requests: 1000, latency: 150, throughput: 100, errorRate: 0.5, lastRequest: '2024-01-15T10:00:00Z' },
    { id: '2', modelId: '2', endpoint: 'https://staging-api.example.com/models/churn-prediction', status: 'ACTIVE', requests: 500, latency: 200, throughput: 50, errorRate: 1.0, lastRequest: '2024-01-15T09:30:00Z' },
  ];

  const mockFeatureStore: ModelFeatureStore[] = [
    { id: '1', name: 'Transaction Amount', description: 'Transaction amount feature', type: 'NUMERICAL', dataType: 'float', schema: { type: 'float', min: 0, max: 1000000 }, source: 'transactions', transformations: [{ name: 'normalize', parameters: { method: 'minmax' } }], validation: { rules: [{ name: 'range_check', condition: 'value >= 0', action: 'ERROR' }] } },
    { id: '2', name: 'Customer Location', description: 'Customer location feature', type: 'CATEGORICAL', dataType: 'string', schema: { type: 'string', categories: ['US', 'EU', 'APAC'] }, source: 'customers', transformations: [{ name: 'one_hot_encode', parameters: {} }], validation: { rules: [{ name: 'category_check', condition: 'value in categories', action: 'ERROR' }] } },
  ];

  const mockPipelines: ModelPipeline[] = [
    { id: '1', name: 'Fraud Detection Pipeline', description: 'End-to-end fraud detection pipeline', status: 'ACTIVE', steps: [{ id: 'step_1', name: 'Data Ingestion', type: 'DATA_INGESTION', config: { source: 'kafka' }, dependencies: [] }, { id: 'step_2', name: 'Feature Engineering', type: 'FEATURE_ENGINEERING', config: { features: ['amount', 'time'] }, dependencies: ['step_1'] }, { id: 'step_3', name: 'Model Prediction', type: 'MODEL_DEPLOYMENT', config: { model_id: '1' }, dependencies: ['step_2'] }], schedule: { type: 'SCHEDULED', cron: '0 */5 * * * *' }, triggers: [{ type: 'SCHEDULED', config: { cron: '0 */5 * * * *' } }] },
    { id: '2', name: 'Churn Prediction Pipeline', description: 'End-to-end churn prediction pipeline', status: 'DRAFT', steps: [{ id: 'step_1', name: 'Data Ingestion', type: 'DATA_INGESTION', config: { source: 'database' }, dependencies: [] }], triggers: [{ type: 'MANUAL', config: {} }] },
  ];

  const mockAnalytics: AIMLAnalytics = {
    totalModels: 25,
    activeModels: 15,
    trainingJobs: 8,
    deployments: 12,
    predictions: 50000,
    modelTypes: [
      { type: 'CLASSIFICATION', count: 15 },
      { type: 'REGRESSION', count: 8 },
      { type: 'CLUSTERING', count: 2 },
    ],
    modelStatus: [
      { status: 'DEPLOYED', count: 15 },
      { status: 'TRAINED', count: 8 },
      { status: 'TRAINING', count: 2 },
    ],
    performanceTrend: [
      { date: '2024-01-01', accuracy: 0.92, latency: 150, throughput: 100 },
      { date: '2024-01-02', accuracy: 0.93, latency: 140, throughput: 110 },
      { date: '2024-01-03', accuracy: 0.91, latency: 160, throughput: 95 },
    ],
    driftDetection: [
      { modelId: '1', driftScore: 0.15, status: 'DRIFT_DETECTED' },
      { modelId: '2', driftScore: 0.05, status: 'NORMAL' },
    ],
    experimentResults: [
      { experimentId: '1', bestModel: 'model_1', accuracy: 0.92, status: 'COMPLETED' },
      { experimentId: '2', bestModel: 'model_4', accuracy: 0.88, status: 'RUNNING' },
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
      
      setModels(mockModels);
      setTrainings(mockTrainings);
      setDeployments(mockDeployments);
      setPredictions(mockPredictions);
      setMonitoring(mockMonitoring);
      setDrift(mockDrift);
      setPerformance(mockPerformance);
      setExperiments(mockExperiments);
      setRegistry(mockRegistry);
      setServing(mockServing);
      setFeatureStore(mockFeatureStore);
      setPipelines(mockPipelines);
      setAnalytics(mockAnalytics);
    } catch (err) {
      setError('Failed to load AI/ML platform data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleOpenDialog = (type: 'model' | 'training' | 'deployment' | 'experiment' | 'pipeline' | 'feature-store', item?: any) => {
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
      case 'DEPLOYED': return 'success';
      case 'TRAINED': return 'success';
      case 'COMPLETED': return 'success';
      case 'ACTIVE': return 'success';
      case 'NORMAL': return 'success';
      case 'TRAINING': return 'info';
      case 'RUNNING': return 'info';
      case 'DEPLOYING': return 'info';
      case 'PENDING': return 'info';
      case 'STAGING': return 'info';
      case 'FAILED': return 'error';
      case 'ERROR': return 'error';
      case 'DRIFT_DETECTED': return 'warning';
      case 'WARNING': return 'warning';
      case 'CRITICAL': return 'error';
      case 'DRAFT': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DEPLOYED': return <CheckCircleIcon />;
      case 'TRAINED': return <CheckCircleIcon />;
      case 'COMPLETED': return <CheckCircleIcon />;
      case 'ACTIVE': return <PlayIcon />;
      case 'TRAINING': return <ModelTrainingIcon />;
      case 'RUNNING': return <PlayIcon />;
      case 'DEPLOYING': return <CloudUploadIcon />;
      case 'FAILED': return <ErrorIcon />;
      case 'ERROR': return <ErrorIcon />;
      case 'DRIFT_DETECTED': return <WarningIcon />;
      case 'WARNING': return <WarningIcon />;
      case 'CRITICAL': return <ErrorIcon />;
      default: return <InfoIcon />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading AI/ML platform data...</Typography>
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
          AI & ML Platform Dashboard
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
            onClick={() => handleOpenDialog('model')}
          >
            Add Model
          </Button>
        </Box>
      </Box>

      {/* Analytics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ScienceIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Models
                  </Typography>
                  <Typography variant="h4">
                    {analytics?.totalModels || 0}
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
                    Active Models
                  </Typography>
                  <Typography variant="h4">
                    {analytics?.activeModels || 0}
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
                <ModelTrainingIcon color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Training Jobs
                  </Typography>
                  <Typography variant="h4">
                    {analytics?.trainingJobs || 0}
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
                    Predictions
                  </Typography>
                  <Typography variant="h4">
                    {analytics?.predictions?.toLocaleString() || 0}
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
            <Tab label="Models" />
            <Tab label="Training" />
            <Tab label="Deployments" />
            <Tab label="Monitoring" />
            <Tab label="Experiments" />
            <Tab label="Pipelines" />
            <Tab label="Analytics" />
          </Tabs>
        </Box>

        <CardContent>
          {/* Models Tab */}
          {activeTab === 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">ML Models</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('model')}
                >
                  Add Model
                </Button>
              </Box>

              <Grid container spacing={2}>
                {models.map((model) => (
                  <Grid item xs={12} sm={6} md={4} key={model.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">{model.name}</Typography>
                          <Chip
                            label={model.status}
                            color={getStatusColor(model.status) as any}
                            size="small"
                            icon={getStatusIcon(model.status)}
                          />
                        </Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Algorithm: {model.algorithm}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Version: {model.version}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Type: {model.type}
                        </Typography>
                        {model.accuracy && (
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            Accuracy: {(model.accuracy * 100).toFixed(1)}%
                          </Typography>
                        )}
                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          <Button size="small" startIcon={<PlayIcon />}>
                            Train
                          </Button>
                          <Button size="small" startIcon={<PublishIcon />}>
                            Deploy
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

          {/* Training Tab */}
          {activeTab === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Model Training</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('training')}
                >
                  Start Training
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Model</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Start Time</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Metrics</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {trainings.map((training) => (
                      <TableRow key={training.id}>
                        <TableCell>{training.modelId}</TableCell>
                        <TableCell>
                          <Chip
                            label={training.status}
                            color={getStatusColor(training.status) as any}
                            size="small"
                            icon={getStatusIcon(training.status)}
                          />
                        </TableCell>
                        <TableCell>{new Date(training.startTime).toLocaleString()}</TableCell>
                        <TableCell>
                          {training.duration ? `${Math.floor(training.duration / 60)}m ${training.duration % 60}s` : '-'}
                        </TableCell>
                        <TableCell>
                          {Object.entries(training.metrics).map(([key, value]) => (
                            <Chip key={key} label={`${key}: ${value}`} size="small" sx={{ mr: 0.5 }} />
                          ))}
                        </TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <ViewIcon />
                          </IconButton>
                          <IconButton size="small">
                            <StopIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Deployments Tab */}
          {activeTab === 2 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Model Deployments</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('deployment')}
                >
                  Deploy Model
                </Button>
              </Box>

              <Grid container spacing={2}>
                {deployments.map((deployment) => (
                  <Grid item xs={12} sm={6} md={4} key={deployment.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">Model {deployment.modelId}</Typography>
                          <Chip
                            label={deployment.status}
                            color={getStatusColor(deployment.status) as any}
                            size="small"
                            icon={getStatusIcon(deployment.status)}
                          />
                        </Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Environment: {deployment.environment}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Version: {deployment.version}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Replicas: {deployment.replicas}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Endpoint: {deployment.endpoint}
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          <Button size="small" startIcon={<ViewIcon />}>
                            View
                          </Button>
                          <Button size="small" startIcon={<StopIcon />}>
                            Stop
                          </Button>
                          <Button size="small" startIcon={<SettingsIcon />}>
                            Configure
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Monitoring Tab */}
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Model Monitoring</Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Model Performance</Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analytics?.performanceTrend || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <RechartsTooltip />
                          <Line type="monotone" dataKey="accuracy" stroke="#8884d8" strokeWidth={2} />
                          <Line type="monotone" dataKey="latency" stroke="#ff7300" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Model Drift Detection</Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Model</TableCell>
                              <TableCell>Drift Score</TableCell>
                              <TableCell>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {analytics?.driftDetection.map((drift) => (
                              <TableRow key={drift.modelId}>
                                <TableCell>{drift.modelId}</TableCell>
                                <TableCell>{drift.driftScore.toFixed(3)}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={drift.status}
                                    color={getStatusColor(drift.status) as any}
                                    size="small"
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Experiments Tab */}
          {activeTab === 4 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Model Experiments</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('experiment')}
                >
                  Create Experiment
                </Button>
              </Box>

              <Grid container spacing={2}>
                {experiments.map((experiment) => (
                  <Grid item xs={12} sm={6} md={4} key={experiment.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">{experiment.name}</Typography>
                          <Chip
                            label={experiment.status}
                            color={getStatusColor(experiment.status) as any}
                            size="small"
                            icon={getStatusIcon(experiment.status)}
                          />
                        </Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {experiment.description}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Models: {experiment.models.length}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Best Model: {experiment.bestModel || 'N/A'}
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          <Button size="small" startIcon={<ViewIcon />}>
                            View
                          </Button>
                          <Button size="small" startIcon={<PlayIcon />}>
                            Run
                          </Button>
                          <Button size="small" startIcon={<DownloadIcon />}>
                            Export
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Pipelines Tab */}
          {activeTab === 5 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Model Pipelines</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('pipeline')}
                >
                  Create Pipeline
                </Button>
              </Box>

              <Grid container spacing={2}>
                {pipelines.map((pipeline) => (
                  <Grid item xs={12} sm={6} md={4} key={pipeline.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">{pipeline.name}</Typography>
                          <Chip
                            label={pipeline.status}
                            color={getStatusColor(pipeline.status) as any}
                            size="small"
                            icon={getStatusIcon(pipeline.status)}
                          />
                        </Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {pipeline.description}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Steps: {pipeline.steps.length}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Schedule: {pipeline.schedule?.type || 'Manual'}
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          <Button size="small" startIcon={<PlayIcon />}>
                            Run
                          </Button>
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

          {/* Analytics Tab */}
          {activeTab === 6 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3 }}>AI/ML Analytics</Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Model Types Distribution</Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={analytics?.modelTypes || []}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {analytics?.modelTypes.map((entry, index) => (
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
                      <Typography variant="h6" gutterBottom>Model Status Distribution</Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics?.modelStatus || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="status" />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey="count" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Performance Trend</Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={analytics?.performanceTrend || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <RechartsTooltip />
                          <Area type="monotone" dataKey="accuracy" stackId="1" stroke="#8884d8" fill="#8884d8" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Experiment Results</Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Experiment</TableCell>
                              <TableCell>Best Model</TableCell>
                              <TableCell>Accuracy</TableCell>
                              <TableCell>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {analytics?.experimentResults.map((result) => (
                              <TableRow key={result.experimentId}>
                                <TableCell>{result.experimentId}</TableCell>
                                <TableCell>{result.bestModel}</TableCell>
                                <TableCell>{(result.accuracy * 100).toFixed(1)}%</TableCell>
                                <TableCell>
                                  <Chip
                                    label={result.status}
                                    color={getStatusColor(result.status) as any}
                                    size="small"
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
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
          {dialogType === 'model' ? 'Add/Edit ML Model' :
           dialogType === 'training' ? 'Start Model Training' :
           dialogType === 'deployment' ? 'Deploy Model' :
           dialogType === 'experiment' ? 'Create Experiment' :
           dialogType === 'pipeline' ? 'Create Pipeline' :
           'Add/Edit Feature Store'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {dialogType === 'model' && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Model Name"
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
                      <MenuItem value="CLASSIFICATION">Classification</MenuItem>
                      <MenuItem value="REGRESSION">Regression</MenuItem>
                      <MenuItem value="CLUSTERING">Clustering</MenuItem>
                      <MenuItem value="DEEP_LEARNING">Deep Learning</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Algorithm"
                    value={formData.algorithm || ''}
                    onChange={(e) => setFormData({ ...formData, algorithm: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Version"
                    value={formData.version || ''}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  />
                </Grid>
              </Grid>
            )}

            {dialogType === 'training' && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Model</InputLabel>
                    <Select
                      value={formData.modelId || ''}
                      onChange={(e) => setFormData({ ...formData, modelId: e.target.value })}
                    >
                      {models.map((model) => (
                        <MenuItem key={model.id} value={model.id}>
                          {model.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Training Data Size"
                    type="number"
                    value={formData.trainingData?.size || ''}
                    onChange={(e) => setFormData({ ...formData, trainingData: { ...formData.trainingData, size: parseInt(e.target.value) } })}
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
        onClick={() => handleOpenDialog('model')}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default AIMLPlatformDashboard;




