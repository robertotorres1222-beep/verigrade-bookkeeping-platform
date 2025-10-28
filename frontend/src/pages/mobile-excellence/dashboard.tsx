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
  Rating,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  PhoneAndroid as PhoneAndroidIcon,
  Apple as AppleIcon,
  Web as WebIcon,
  Desktop as DesktopIcon,
  Sync as SyncIcon,
  Notifications as NotificationsIcon,
  Fingerprint as FingerprintIcon,
  CameraAlt as CameraAltIcon,
  LocationOn as LocationOnIcon,
  Mic as MicIcon,
  Nfc as NfcIcon,
  ViewInAr as ViewInArIcon,
  Watch as WatchIcon,
  Widgets as WidgetsIcon,
  Link as LinkIcon,
  Share as ShareIcon,
  Analytics as AnalyticsIcon,
  Speed as SpeedIcon,
  BugReport as BugReportIcon,
  Feedback as FeedbackIcon,
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter } from 'recharts';

interface MobileApp {
  id: string;
  name: string;
  description: string;
  platform: string;
  version: string;
  buildNumber: string;
  bundleId: string;
  status: string;
  features: string[];
  permissions: string[];
  minOsVersion: string;
  targetOsVersion: string;
  size: number;
  downloadUrl: string;
  releaseNotes: string;
}

interface MobileFeature {
  id: string;
  name: string;
  description: string;
  type: string;
  platform: string;
  enabled: boolean;
  configuration: Record<string, any>;
  dependencies: string[];
}

interface OfflineSync {
  id: string;
  userId: string;
  entityType: string;
  entityId: string;
  operation: string;
  data: Record<string, any>;
  timestamp: string;
  synced: boolean;
  syncTimestamp?: string;
  conflictResolution: string;
}

interface PushNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  data: Record<string, any>;
  type: string;
  priority: string;
  scheduledAt?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  clickedAt?: string;
  status: string;
  deviceToken: string;
  platform: string;
}

interface BiometricAuth {
  id: string;
  userId: string;
  type: string;
  enabled: boolean;
  deviceId: string;
  platform: string;
  registeredAt: string;
  lastUsedAt?: string;
}

interface CameraScanning {
  id: string;
  userId: string;
  type: string;
  imageUrl: string;
  extractedData: Record<string, any>;
  confidence: number;
  processingTime: number;
  status: string;
  error?: string;
}

interface GPSTracking {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  timestamp: string;
  purpose: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

interface VoiceCommand {
  id: string;
  userId: string;
  command: string;
  intent: string;
  parameters: Record<string, any>;
  response: string;
  confidence: number;
  language: string;
  platform: string;
  processedAt: string;
}

interface NFCScanning {
  id: string;
  userId: string;
  tagId: string;
  tagType: string;
  data: Record<string, any>;
  scannedAt: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

interface ARCapture {
  id: string;
  userId: string;
  type: string;
  imageUrl: string;
  arData: Record<string, any>;
  confidence: number;
  processingTime: number;
  status: string;
  error?: string;
}

interface WatchCompanion {
  id: string;
  userId: string;
  deviceId: string;
  platform: string;
  complications: string[];
  quickActions: string[];
  notifications: string[];
  lastSyncAt: string;
  status: string;
}

interface MobileWidget {
  id: string;
  userId: string;
  type: string;
  platform: string;
  configuration: Record<string, any>;
  enabled: boolean;
  position: number;
  size: string;
  lastUpdatedAt: string;
}

interface DeepLinking {
  id: string;
  url: string;
  scheme: string;
  path: string;
  parameters: Record<string, any>;
  platform: string;
  target: string;
  fallbackUrl?: string;
}

interface ShareExtension {
  id: string;
  userId: string;
  type: string;
  data: Record<string, any>;
  sourceApp: string;
  targetApp: string;
  processed: boolean;
  processedAt?: string;
}

interface MobileAnalytics {
  id: string;
  userId: string;
  event: string;
  properties: Record<string, any>;
  platform: string;
  version: string;
  timestamp: string;
  sessionId: string;
  deviceInfo: Record<string, any>;
}

interface MobilePerformance {
  id: string;
  userId: string;
  metric: string;
  value: number;
  unit: string;
  platform: string;
  version: string;
  timestamp: string;
  deviceInfo: Record<string, any>;
}

interface MobileCrash {
  id: string;
  userId: string;
  error: string;
  stackTrace: string;
  platform: string;
  version: string;
  deviceInfo: Record<string, any>;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
}

interface MobileFeedback {
  id: string;
  userId: string;
  type: string;
  title: string;
  description: string;
  rating?: number;
  platform: string;
  version: string;
  deviceInfo: Record<string, any>;
  status: string;
  priority: string;
  assignedTo?: string;
  resolvedAt?: string;
}

interface MobileExcellenceAnalytics {
  totalApps: number;
  totalFeatures: number;
  totalOfflineSync: number;
  totalPushNotifications: number;
  totalBiometricAuth: number;
  totalCameraScanning: number;
  totalGPSTracking: number;
  totalVoiceCommands: number;
  totalNFCScanning: number;
  totalARCapture: number;
  totalWatchCompanion: number;
  totalMobileWidgets: number;
  totalDeepLinking: number;
  totalShareExtensions: number;
  totalMobileAnalytics: number;
  totalMobilePerformance: number;
  totalMobileCrashes: number;
  totalMobileFeedback: number;
  platformDistribution: Array<{
    platform: string;
    count: number;
  }>;
  featureUsage: Array<{
    feature: string;
    count: number;
  }>;
  performanceMetrics: Array<{
    metric: string;
    value: number;
    unit: string;
  }>;
  crashAnalysis: Array<{
    platform: string;
    crashCount: number;
    resolutionRate: number;
  }>;
  userEngagement: Array<{
    date: string;
    activeUsers: number;
    sessions: number;
    retention: number;
  }>;
  feedbackAnalysis: Array<{
    type: string;
    count: number;
    averageRating: number;
  }>;
}

const MobileExcellenceDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [apps, setApps] = useState<MobileApp[]>([]);
  const [features, setFeatures] = useState<MobileFeature[]>([]);
  const [offlineSync, setOfflineSync] = useState<OfflineSync[]>([]);
  const [pushNotifications, setPushNotifications] = useState<PushNotification[]>([]);
  const [biometricAuth, setBiometricAuth] = useState<BiometricAuth[]>([]);
  const [cameraScanning, setCameraScanning] = useState<CameraScanning[]>([]);
  const [gpsTracking, setGpsTracking] = useState<GPSTracking[]>([]);
  const [voiceCommands, setVoiceCommands] = useState<VoiceCommand[]>([]);
  const [nfcScanning, setNfcScanning] = useState<NFCScanning[]>([]);
  const [arCapture, setArCapture] = useState<ARCapture[]>([]);
  const [watchCompanion, setWatchCompanion] = useState<WatchCompanion[]>([]);
  const [mobileWidgets, setMobileWidgets] = useState<MobileWidget[]>([]);
  const [deepLinking, setDeepLinking] = useState<DeepLinking[]>([]);
  const [shareExtensions, setShareExtensions] = useState<ShareExtension[]>([]);
  const [mobileAnalytics, setMobileAnalytics] = useState<MobileAnalytics[]>([]);
  const [mobilePerformance, setMobilePerformance] = useState<MobilePerformance[]>([]);
  const [mobileCrashes, setMobileCrashes] = useState<MobileCrash[]>([]);
  const [mobileFeedback, setMobileFeedback] = useState<MobileFeedback[]>([]);
  const [excellenceAnalytics, setExcellenceAnalytics] = useState<MobileExcellenceAnalytics | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'app' | 'feature' | 'sync' | 'notification' | 'auth' | 'scanning' | 'tracking' | 'command' | 'nfc' | 'ar' | 'watch' | 'widget' | 'linking' | 'extension' | 'analytics' | 'performance' | 'crash' | 'feedback'>('app');
  const [formData, setFormData] = useState<any>({});

  // Mock data for demonstration
  const mockApps: MobileApp[] = [
    { id: '1', name: 'VeriGrade iOS', description: 'iOS mobile app', platform: 'IOS', version: '1.0.0', buildNumber: '1', bundleId: 'com.verigrade.ios', status: 'ACTIVE', features: ['OFFLINE_SYNC', 'PUSH_NOTIFICATIONS', 'BIOMETRIC_AUTH'], permissions: ['CAMERA', 'LOCATION', 'MICROPHONE'], minOsVersion: '14.0', targetOsVersion: '17.0', size: 50000000, downloadUrl: 'https://apps.apple.com/app/verigrade', releaseNotes: 'Initial release' },
    { id: '2', name: 'VeriGrade Android', description: 'Android mobile app', platform: 'ANDROID', version: '1.0.0', buildNumber: '1', bundleId: 'com.verigrade.android', status: 'ACTIVE', features: ['OFFLINE_SYNC', 'PUSH_NOTIFICATIONS', 'BIOMETRIC_AUTH'], permissions: ['CAMERA', 'LOCATION', 'MICROPHONE'], minOsVersion: '8.0', targetOsVersion: '14.0', size: 45000000, downloadUrl: 'https://play.google.com/store/apps/details?id=com.verigrade.android', releaseNotes: 'Initial release' },
  ];

  const mockFeatures: MobileFeature[] = [
    { id: '1', name: 'Offline Sync', description: 'Sync data offline', type: 'OFFLINE_SYNC', platform: 'BOTH', enabled: true, configuration: { syncInterval: 300, conflictResolution: 'SERVER_WINS' }, dependencies: [] },
    { id: '2', name: 'Push Notifications', description: 'Send push notifications', type: 'PUSH_NOTIFICATIONS', platform: 'BOTH', enabled: true, configuration: { maxNotifications: 100, priority: 'HIGH' }, dependencies: [] },
    { id: '3', name: 'Biometric Auth', description: 'Biometric authentication', type: 'BIOMETRIC_AUTH', platform: 'BOTH', enabled: true, configuration: { fallbackToPin: true, timeout: 30 }, dependencies: [] },
  ];

  const mockOfflineSync: OfflineSync[] = [
    { id: '1', userId: 'user1', entityType: 'invoice', entityId: 'inv_123', operation: 'CREATE', data: { amount: 100, customer: 'John Doe' }, timestamp: '2024-01-15T10:00:00Z', synced: false, conflictResolution: 'SERVER_WINS' },
    { id: '2', userId: 'user1', entityType: 'expense', entityId: 'exp_456', operation: 'UPDATE', data: { amount: 50, category: 'Office' }, timestamp: '2024-01-15T09:30:00Z', synced: true, syncTimestamp: '2024-01-15T09:35:00Z', conflictResolution: 'SERVER_WINS' },
  ];

  const mockPushNotifications: PushNotification[] = [
    { id: '1', userId: 'user1', title: 'Invoice Paid', body: 'Invoice #123 has been paid', data: { invoiceId: 'inv_123' }, type: 'SUCCESS', priority: 'NORMAL', status: 'DELIVERED', deviceToken: 'token123', platform: 'IOS' },
    { id: '2', userId: 'user1', title: 'Expense Reminder', body: 'Don\'t forget to submit your expenses', data: { reminderType: 'expense' }, type: 'REMINDER', priority: 'LOW', status: 'PENDING', deviceToken: 'token456', platform: 'ANDROID' },
  ];

  const mockBiometricAuth: BiometricAuth[] = [
    { id: '1', userId: 'user1', type: 'FACE_ID', enabled: true, deviceId: 'device123', platform: 'IOS', registeredAt: '2024-01-15T10:00:00Z', lastUsedAt: '2024-01-15T11:00:00Z' },
    { id: '2', userId: 'user1', type: 'FINGERPRINT', enabled: true, deviceId: 'device456', platform: 'ANDROID', registeredAt: '2024-01-15T09:30:00Z', lastUsedAt: '2024-01-15T10:30:00Z' },
  ];

  const mockCameraScanning: CameraScanning[] = [
    { id: '1', userId: 'user1', type: 'RECEIPT', imageUrl: 'https://example.com/receipt1.jpg', extractedData: { amount: 25.50, vendor: 'Starbucks', date: '2024-01-15' }, confidence: 95.5, processingTime: 1500, status: 'COMPLETED' },
    { id: '2', userId: 'user1', type: 'INVOICE', imageUrl: 'https://example.com/invoice1.jpg', extractedData: { amount: 500.00, vendor: 'Office Supplies', date: '2024-01-15' }, confidence: 88.2, processingTime: 2000, status: 'COMPLETED' },
  ];

  const mockGpsTracking: GPSTracking[] = [
    { id: '1', userId: 'user1', latitude: 40.7128, longitude: -74.0060, accuracy: 5.0, timestamp: '2024-01-15T10:00:00Z', purpose: 'MILEAGE_TRACKING', address: '123 Main St', city: 'New York', state: 'NY', country: 'USA', postalCode: '10001' },
    { id: '2', userId: 'user1', latitude: 40.7589, longitude: -73.9851, accuracy: 3.0, timestamp: '2024-01-15T11:00:00Z', purpose: 'TIME_TRACKING', address: '456 Broadway', city: 'New York', state: 'NY', country: 'USA', postalCode: '10013' },
  ];

  const mockVoiceCommands: VoiceCommand[] = [
    { id: '1', userId: 'user1', command: 'Create invoice for John Doe', intent: 'CREATE_INVOICE', parameters: { customer: 'John Doe' }, response: 'Invoice created successfully', confidence: 92.5, language: 'en-US', platform: 'IOS', processedAt: '2024-01-15T10:00:00Z' },
    { id: '2', userId: 'user1', command: 'Show my expenses', intent: 'SHOW_EXPENSES', parameters: {}, response: 'Here are your recent expenses', confidence: 88.7, language: 'en-US', platform: 'ANDROID', processedAt: '2024-01-15T09:30:00Z' },
  ];

  const mockNfcScanning: NFCScanning[] = [
    { id: '1', userId: 'user1', tagId: 'tag123', tagType: 'NDEF', data: { text: 'Office Supplies', amount: 25.50 }, scannedAt: '2024-01-15T10:00:00Z', location: { latitude: 40.7128, longitude: -74.0060, accuracy: 5.0 } },
    { id: '2', userId: 'user1', tagId: 'tag456', tagType: 'MIFARE', data: { text: 'Gas Station', amount: 45.00 }, scannedAt: '2024-01-15T09:30:00Z' },
  ];

  const mockArCapture: ARCapture[] = [
    { id: '1', userId: 'user1', type: 'RECEIPT_CAPTURE', imageUrl: 'https://example.com/ar_receipt1.jpg', arData: { detectedText: 'Starbucks $25.50', confidence: 95.5 }, confidence: 95.5, processingTime: 2500, status: 'COMPLETED' },
    { id: '2', userId: 'user1', type: 'INVOICE_CAPTURE', imageUrl: 'https://example.com/ar_invoice1.jpg', arData: { detectedText: 'Office Supplies $500.00', confidence: 88.2 }, confidence: 88.2, processingTime: 3000, status: 'COMPLETED' },
  ];

  const mockWatchCompanion: WatchCompanion[] = [
    { id: '1', userId: 'user1', deviceId: 'watch123', platform: 'APPLE_WATCH', complications: ['QUICK_ACTIONS', 'RECENT_TRANSACTIONS'], quickActions: ['CREATE_INVOICE', 'ADD_EXPENSE'], notifications: ['PAYMENT_RECEIVED', 'EXPENSE_REMINDER'], lastSyncAt: '2024-01-15T10:00:00Z', status: 'CONNECTED' },
    { id: '2', userId: 'user1', deviceId: 'watch456', platform: 'WEAR_OS', complications: ['TIME_TRACKING', 'NOTIFICATIONS'], quickActions: ['START_TIMER', 'VIEW_DASHBOARD'], notifications: ['INVOICE_DUE', 'EXPENSE_APPROVED'], lastSyncAt: '2024-01-15T09:30:00Z', status: 'CONNECTED' },
  ];

  const mockMobileWidgets: MobileWidget[] = [
    { id: '1', userId: 'user1', type: 'QUICK_ACTIONS', platform: 'IOS', configuration: { actions: ['CREATE_INVOICE', 'ADD_EXPENSE'] }, enabled: true, position: 1, size: 'MEDIUM', lastUpdatedAt: '2024-01-15T10:00:00Z' },
    { id: '2', userId: 'user1', type: 'RECENT_TRANSACTIONS', platform: 'ANDROID', configuration: { limit: 5, showAmount: true }, enabled: true, position: 2, size: 'LARGE', lastUpdatedAt: '2024-01-15T09:30:00Z' },
  ];

  const mockDeepLinking: DeepLinking[] = [
    { id: '1', url: 'verigrade://invoice/123', scheme: 'verigrade', path: '/invoice/123', parameters: { invoiceId: '123' }, platform: 'IOS', target: 'INVOICE_DETAIL' },
    { id: '2', url: 'verigrade://expense/456', scheme: 'verigrade', path: '/expense/456', parameters: { expenseId: '456' }, platform: 'ANDROID', target: 'EXPENSE_DETAIL' },
  ];

  const mockShareExtensions: ShareExtension[] = [
    { id: '1', userId: 'user1', type: 'RECEIPT', data: { imageUrl: 'https://example.com/receipt.jpg', amount: 25.50 }, sourceApp: 'Photos', targetApp: 'VeriGrade', processed: true, processedAt: '2024-01-15T10:00:00Z' },
    { id: '2', userId: 'user1', type: 'LINK', data: { url: 'https://example.com/invoice', title: 'Invoice #123' }, sourceApp: 'Safari', targetApp: 'VeriGrade', processed: false },
  ];

  const mockMobileAnalytics: MobileAnalytics[] = [
    { id: '1', userId: 'user1', event: 'app_launch', properties: { screen: 'dashboard' }, platform: 'IOS', version: '1.0.0', timestamp: '2024-01-15T10:00:00Z', sessionId: 'session123', deviceInfo: { model: 'iPhone 14', os: 'iOS 17.0' } },
    { id: '2', userId: 'user1', event: 'feature_used', properties: { feature: 'camera_scanning' }, platform: 'ANDROID', version: '1.0.0', timestamp: '2024-01-15T09:30:00Z', sessionId: 'session456', deviceInfo: { model: 'Pixel 7', os: 'Android 14' } },
  ];

  const mockMobilePerformance: MobilePerformance[] = [
    { id: '1', userId: 'user1', metric: 'app_launch_time', value: 1.2, unit: 'seconds', platform: 'IOS', version: '1.0.0', timestamp: '2024-01-15T10:00:00Z', deviceInfo: { model: 'iPhone 14', os: 'iOS 17.0' } },
    { id: '2', userId: 'user1', metric: 'memory_usage', value: 45.6, unit: 'MB', platform: 'ANDROID', version: '1.0.0', timestamp: '2024-01-15T09:30:00Z', deviceInfo: { model: 'Pixel 7', os: 'Android 14' } },
  ];

  const mockMobileCrashes: MobileCrash[] = [
    { id: '1', userId: 'user1', error: 'NullPointerException', stackTrace: 'at com.verigrade.MainActivity.onCreate(MainActivity.java:123)', platform: 'ANDROID', version: '1.0.0', deviceInfo: { model: 'Pixel 7', os: 'Android 14' }, timestamp: '2024-01-15T10:00:00Z', resolved: false },
    { id: '2', userId: 'user1', error: 'OutOfMemoryError', stackTrace: 'at com.verigrade.ImageProcessor.process(ImageProcessor.java:456)', platform: 'IOS', version: '1.0.0', deviceInfo: { model: 'iPhone 14', os: 'iOS 17.0' }, timestamp: '2024-01-15T09:30:00Z', resolved: true, resolvedAt: '2024-01-15T11:00:00Z' },
  ];

  const mockMobileFeedback: MobileFeedback[] = [
    { id: '1', userId: 'user1', type: 'FEATURE_REQUEST', title: 'Dark Mode Support', description: 'Please add dark mode support', rating: 5, platform: 'IOS', version: '1.0.0', deviceInfo: { model: 'iPhone 14', os: 'iOS 17.0' }, status: 'PENDING', priority: 'MEDIUM' },
    { id: '2', userId: 'user1', type: 'BUG_REPORT', title: 'App Crashes on Launch', description: 'App crashes when opening camera', rating: 2, platform: 'ANDROID', version: '1.0.0', deviceInfo: { model: 'Pixel 7', os: 'Android 14' }, status: 'IN_PROGRESS', priority: 'HIGH', assignedTo: 'dev@verigrade.com' },
  ];

  const mockExcellenceAnalytics: MobileExcellenceAnalytics = {
    totalApps: 2,
    totalFeatures: 12,
    totalOfflineSync: 150,
    totalPushNotifications: 500,
    totalBiometricAuth: 75,
    totalCameraScanning: 200,
    totalGPSTracking: 300,
    totalVoiceCommands: 50,
    totalNFCScanning: 25,
    totalARCapture: 30,
    totalWatchCompanion: 10,
    totalMobileWidgets: 20,
    totalDeepLinking: 15,
    totalShareExtensions: 40,
    totalMobileAnalytics: 1000,
    totalMobilePerformance: 500,
    totalMobileCrashes: 5,
    totalMobileFeedback: 25,
    platformDistribution: [
      { platform: 'IOS', count: 60 },
      { platform: 'ANDROID', count: 40 },
    ],
    featureUsage: [
      { feature: 'OFFLINE_SYNC', count: 150 },
      { feature: 'PUSH_NOTIFICATIONS', count: 500 },
      { feature: 'BIOMETRIC_AUTH', count: 75 },
      { feature: 'CAMERA_SCANNING', count: 200 },
      { feature: 'GPS_TRACKING', count: 300 },
    ],
    performanceMetrics: [
      { metric: 'App Launch Time', value: 1.2, unit: 'seconds' },
      { metric: 'Memory Usage', value: 45.6, unit: 'MB' },
      { metric: 'Battery Usage', value: 12.3, unit: '%' },
      { metric: 'Network Requests', value: 156, unit: 'requests/min' },
      { metric: 'Crash Rate', value: 0.05, unit: '%' },
    ],
    crashAnalysis: [
      { platform: 'IOS', crashCount: 2, resolutionRate: 100 },
      { platform: 'ANDROID', crashCount: 3, resolutionRate: 67 },
    ],
    userEngagement: [
      { date: '2024-01-01', activeUsers: 1000, sessions: 2000, retention: 0.85 },
      { date: '2024-01-02', activeUsers: 1050, sessions: 2100, retention: 0.87 },
      { date: '2024-01-03', activeUsers: 1100, sessions: 2200, retention: 0.89 },
    ],
    feedbackAnalysis: [
      { type: 'BUG_REPORT', count: 10, averageRating: 2.1 },
      { type: 'FEATURE_REQUEST', count: 8, averageRating: 4.5 },
      { type: 'GENERAL_FEEDBACK', count: 5, averageRating: 3.8 },
      { type: 'RATING', count: 2, averageRating: 4.5 },
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
      
      setApps(mockApps);
      setFeatures(mockFeatures);
      setOfflineSync(mockOfflineSync);
      setPushNotifications(mockPushNotifications);
      setBiometricAuth(mockBiometricAuth);
      setCameraScanning(mockCameraScanning);
      setGpsTracking(mockGpsTracking);
      setVoiceCommands(mockVoiceCommands);
      setNfcScanning(mockNfcScanning);
      setArCapture(mockArCapture);
      setWatchCompanion(mockWatchCompanion);
      setMobileWidgets(mockMobileWidgets);
      setDeepLinking(mockDeepLinking);
      setShareExtensions(mockShareExtensions);
      setMobileAnalytics(mockMobileAnalytics);
      setMobilePerformance(mockMobilePerformance);
      setMobileCrashes(mockMobileCrashes);
      setMobileFeedback(mockMobileFeedback);
      setExcellenceAnalytics(mockExcellenceAnalytics);
    } catch (err) {
      setError('Failed to load mobile excellence data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleOpenDialog = (type: 'app' | 'feature' | 'sync' | 'notification' | 'auth' | 'scanning' | 'tracking' | 'command' | 'nfc' | 'ar' | 'watch' | 'widget' | 'linking' | 'extension' | 'analytics' | 'performance' | 'crash' | 'feedback', item?: any) => {
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
      case 'DELIVERED': return 'success';
      case 'CONNECTED': return 'success';
      case 'IN_PROGRESS': return 'info';
      case 'PENDING': return 'info';
      case 'SYNCING': return 'info';
      case 'PROCESSING': return 'info';
      case 'FAILED': return 'error';
      case 'ERROR': return 'error';
      case 'DISCONNECTED': return 'error';
      case 'CANCELLED': return 'warning';
      case 'INACTIVE': return 'default';
      default: return 'default';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'IOS': return <AppleIcon />;
      case 'ANDROID': return <PhoneAndroidIcon />;
      case 'WEB': return <WebIcon />;
      case 'DESKTOP': return <DesktopIcon />;
      default: return <PhoneAndroidIcon />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading mobile excellence data...</Typography>
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
          Mobile Excellence Dashboard
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
            onClick={() => handleOpenDialog('app')}
          >
            Add App
          </Button>
        </Box>
      </Box>

      {/* Analytics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PhoneAndroidIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Mobile Apps
                  </Typography>
                  <Typography variant="h4">
                    {excellenceAnalytics?.totalApps || 0}
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
                <SyncIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Offline Sync
                  </Typography>
                  <Typography variant="h4">
                    {excellenceAnalytics?.totalOfflineSync || 0}
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
                <NotificationsIcon color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Push Notifications
                  </Typography>
                  <Typography variant="h4">
                    {excellenceAnalytics?.totalPushNotifications || 0}
                  </Typography>
                </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CameraAltIcon color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Camera Scanning
                  </Typography>
                  <Typography variant="h4">
                    {excellenceAnalytics?.totalCameraScanning || 0}
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
            <Tab label="Apps" />
            <Tab label="Features" />
            <Tab label="Offline Sync" />
            <Tab label="Notifications" />
            <Tab label="Biometric Auth" />
            <Tab label="Camera Scanning" />
            <Tab label="GPS Tracking" />
            <Tab label="Voice Commands" />
            <Tab label="NFC Scanning" />
            <Tab label="AR Capture" />
            <Tab label="Watch Companion" />
            <Tab label="Widgets" />
            <Tab label="Deep Linking" />
            <Tab label="Share Extensions" />
            <Tab label="Analytics" />
            <Tab label="Performance" />
            <Tab label="Crashes" />
            <Tab label="Feedback" />
          </Tabs>
        </Box>

        <CardContent>
          {/* Apps Tab */}
          {activeTab === 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Mobile Apps</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('app')}
                >
                  Add App
                </Button>
              </Box>

              <Grid container spacing={2}>
                {apps.map((app) => (
                  <Grid item xs={12} sm={6} md={4} key={app.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">{app.name}</Typography>
                          <Chip
                            label={app.status}
                            color={getStatusColor(app.status) as any}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {app.description}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          {getPlatformIcon(app.platform)}
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {app.platform}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Version: {app.version} ({app.buildNumber})
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Size: {(app.size / 1024 / 1024).toFixed(1)} MB
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          <Button size="small" startIcon={<ViewIcon />}>
                            View
                          </Button>
                          <Button size="small" startIcon={<EditIcon />}>
                            Edit
                          </Button>
                          <Button size="small" startIcon={<DownloadIcon />}>
                            Download
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Features Tab */}
          {activeTab === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Mobile Features</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('feature')}
                >
                  Add Feature
                </Button>
              </Box>

              <Grid container spacing={2}>
                {features.map((feature) => (
                  <Grid item xs={12} sm={6} md={4} key={feature.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">{feature.name}</Typography>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={feature.enabled}
                                onChange={(e) => {
                                  // Handle feature toggle
                                }}
                              />
                            }
                            label=""
                          />
                        </Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {feature.description}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Type: {feature.type}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Platform: {feature.platform}
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

          {/* Offline Sync Tab */}
          {activeTab === 2 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Offline Sync</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('sync')}
                >
                  Add Sync
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Entity</TableCell>
                      <TableCell>Operation</TableCell>
                      <TableCell>Synced</TableCell>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {offlineSync.map((sync) => (
                      <TableRow key={sync.id}>
                        <TableCell>{sync.userId}</TableCell>
                        <TableCell>{sync.entityType}</TableCell>
                        <TableCell>{sync.operation}</TableCell>
                        <TableCell>
                          <Chip
                            label={sync.synced ? 'Yes' : 'No'}
                            color={sync.synced ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(sync.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <ViewIcon />
                          </IconButton>
                          <IconButton size="small">
                            <SyncIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Notifications Tab */}
          {activeTab === 3 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Push Notifications</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('notification')}
                >
                  Send Notification
                </Button>
              </Box>

              <Grid container spacing={2}>
                {pushNotifications.map((notification) => (
                  <Grid item xs={12} sm={6} md={4} key={notification.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">{notification.title}</Typography>
                          <Chip
                            label={notification.status}
                            color={getStatusColor(notification.status) as any}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {notification.body}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Type: {notification.type}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Priority: {notification.priority}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Platform: {notification.platform}
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

          {/* Biometric Auth Tab */}
          {activeTab === 4 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Biometric Authentication</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('auth')}
                >
                  Add Auth
                </Button>
              </Box>

              <Grid container spacing={2}>
                {biometricAuth.map((auth) => (
                  <Grid item xs={12} sm={6} md={4} key={auth.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">{auth.type}</Typography>
                          <Chip
                            label={auth.enabled ? 'Enabled' : 'Disabled'}
                            color={auth.enabled ? 'success' : 'default'}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Device: {auth.deviceId}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Platform: {auth.platform}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Registered: {new Date(auth.registeredAt).toLocaleString()}
                        </Typography>
                        {auth.lastUsedAt && (
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            Last Used: {new Date(auth.lastUsedAt).toLocaleString()}
                          </Typography>
                        )}
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

          {/* Camera Scanning Tab */}
          {activeTab === 5 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Camera Scanning</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('scanning')}
                >
                  Add Scan
                </Button>
              </Box>

              <Grid container spacing={2}>
                {cameraScanning.map((scanning) => (
                  <Grid item xs={12} sm={6} md={4} key={scanning.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">{scanning.type}</Typography>
                          <Chip
                            label={scanning.status}
                            color={getStatusColor(scanning.status) as any}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Confidence: {scanning.confidence}%
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Processing Time: {scanning.processingTime}ms
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Extracted Data: {JSON.stringify(scanning.extractedData)}
                        </Typography>
                        {scanning.error && (
                          <Typography variant="body2" color="error" gutterBottom>
                            Error: {scanning.error}
                          </Typography>
                        )}
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

          {/* GPS Tracking Tab */}
          {activeTab === 6 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">GPS Tracking</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('tracking')}
                >
                  Add Tracking
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Purpose</TableCell>
                      <TableCell>Accuracy</TableCell>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {gpsTracking.map((tracking) => (
                      <TableRow key={tracking.id}>
                        <TableCell>{tracking.userId}</TableCell>
                        <TableCell>
                          {tracking.latitude.toFixed(4)}, {tracking.longitude.toFixed(4)}
                        </TableCell>
                        <TableCell>{tracking.purpose}</TableCell>
                        <TableCell>{tracking.accuracy}m</TableCell>
                        <TableCell>
                          {new Date(tracking.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <ViewIcon />
                          </IconButton>
                          <IconButton size="small">
                            <LocationOnIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Voice Commands Tab */}
          {activeTab === 7 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Voice Commands</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('command')}
                >
                  Add Command
                </Button>
              </Box>

              <Grid container spacing={2}>
                {voiceCommands.map((command) => (
                  <Grid item xs={12} sm={6} md={4} key={command.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {command.command}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Intent: {command.intent}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Response: {command.response}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Confidence: {command.confidence}%
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Language: {command.language}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Platform: {command.platform}
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

          {/* NFC Scanning Tab */}
          {activeTab === 8 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">NFC Scanning</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('nfc')}
                >
                  Add NFC Scan
                </Button>
              </Box>

              <Grid container spacing={2}>
                {nfcScanning.map((scanning) => (
                  <Grid item xs={12} sm={6} md={4} key={scanning.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Tag ID: {scanning.tagId}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Type: {scanning.tagType}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Data: {JSON.stringify(scanning.data)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Scanned: {new Date(scanning.scannedAt).toLocaleString()}
                        </Typography>
                        {scanning.location && (
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            Location: {scanning.location.latitude.toFixed(4)}, {scanning.location.longitude.toFixed(4)}
                          </Typography>
                        )}
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

          {/* AR Capture Tab */}
          {activeTab === 9 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">AR Capture</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('ar')}
                >
                  Add AR Capture
                </Button>
              </Box>

              <Grid container spacing={2}>
                {arCapture.map((capture) => (
                  <Grid item xs={12} sm={6} md={4} key={capture.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">{capture.type}</Typography>
                          <Chip
                            label={capture.status}
                            color={getStatusColor(capture.status) as any}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Confidence: {capture.confidence}%
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Processing Time: {capture.processingTime}ms
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          AR Data: {JSON.stringify(capture.arData)}
                        </Typography>
                        {capture.error && (
                          <Typography variant="body2" color="error" gutterBottom>
                            Error: {capture.error}
                          </Typography>
                        )}
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

          {/* Watch Companion Tab */}
          {activeTab === 10 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Watch Companion</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('watch')}
                >
                  Add Watch
                </Button>
              </Box>

              <Grid container spacing={2}>
                {watchCompanion.map((companion) => (
                  <Grid item xs={12} sm={6} md={4} key={companion.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">{companion.platform}</Typography>
                          <Chip
                            label={companion.status}
                            color={getStatusColor(companion.status) as any}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Device: {companion.deviceId}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Complications: {companion.complications.join(', ')}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Quick Actions: {companion.quickActions.join(', ')}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Last Sync: {new Date(companion.lastSyncAt).toLocaleString()}
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

          {/* Widgets Tab */}
          {activeTab === 11 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Mobile Widgets</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('widget')}
                >
                  Add Widget
                </Button>
              </Box>

              <Grid container spacing={2}>
                {mobileWidgets.map((widget) => (
                  <Grid item xs={12} sm={6} md={4} key={widget.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">{widget.type}</Typography>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={widget.enabled}
                                onChange={(e) => {
                                  // Handle widget toggle
                                }}
                              />
                            }
                            label=""
                          />
                        </Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Platform: {widget.platform}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Position: {widget.position}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Size: {widget.size}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Last Updated: {new Date(widget.lastUpdatedAt).toLocaleString()}
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

          {/* Deep Linking Tab */}
          {activeTab === 12 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Deep Linking</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('linking')}
                >
                  Add Link
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>URL</TableCell>
                      <TableCell>Scheme</TableCell>
                      <TableCell>Path</TableCell>
                      <TableCell>Platform</TableCell>
                      <TableCell>Target</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {deepLinking.map((linking) => (
                      <TableRow key={linking.id}>
                        <TableCell>{linking.url}</TableCell>
                        <TableCell>{linking.scheme}</TableCell>
                        <TableCell>{linking.path}</TableCell>
                        <TableCell>{linking.platform}</TableCell>
                        <TableCell>{linking.target}</TableCell>
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

          {/* Share Extensions Tab */}
          {activeTab === 13 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Share Extensions</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('extension')}
                >
                  Add Extension
                </Button>
              </Box>

              <Grid container spacing={2}>
                {shareExtensions.map((extension) => (
                  <Grid item xs={12} sm={6} md={4} key={extension.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">{extension.type}</Typography>
                          <Chip
                            label={extension.processed ? 'Processed' : 'Pending'}
                            color={extension.processed ? 'success' : 'default'}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Source: {extension.sourceApp}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Target: {extension.targetApp}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Data: {JSON.stringify(extension.data)}
                        </Typography>
                        {extension.processedAt && (
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            Processed: {new Date(extension.processedAt).toLocaleString()}
                          </Typography>
                        )}
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

          {/* Analytics Tab */}
          {activeTab === 14 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3 }}>Mobile Analytics</Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>User Engagement</Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={excellenceAnalytics?.userEngagement || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <RechartsTooltip />
                          <Line type="monotone" dataKey="activeUsers" stroke="#8884d8" strokeWidth={2} />
                          <Line type="monotone" dataKey="sessions" stroke="#82ca9d" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Platform Distribution</Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={excellenceAnalytics?.platformDistribution || []}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ platform, count }) => `${platform} ${count}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {excellenceAnalytics?.platformDistribution.map((entry, index) => (
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
                      <Typography variant="h6" gutterBottom>Feature Usage</Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={excellenceAnalytics?.featureUsage || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="feature" />
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
                      <Typography variant="h6" gutterBottom>Performance Metrics</Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={excellenceAnalytics?.performanceMetrics || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="metric" />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey="value" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Performance Tab */}
          {activeTab === 15 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Mobile Performance</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('performance')}
                >
                  Add Performance
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Metric</TableCell>
                      <TableCell>Value</TableCell>
                      <TableCell>Unit</TableCell>
                      <TableCell>Platform</TableCell>
                      <TableCell>Version</TableCell>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mobilePerformance.map((performance) => (
                      <TableRow key={performance.id}>
                        <TableCell>{performance.userId}</TableCell>
                        <TableCell>{performance.metric}</TableCell>
                        <TableCell>{performance.value}</TableCell>
                        <TableCell>{performance.unit}</TableCell>
                        <TableCell>{performance.platform}</TableCell>
                        <TableCell>{performance.version}</TableCell>
                        <TableCell>
                          {new Date(performance.timestamp).toLocaleString()}
                        </TableCell>
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

          {/* Crashes Tab */}
          {activeTab === 16 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Mobile Crashes</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('crash')}
                >
                  Add Crash
                </Button>
              </Box>

              <Grid container spacing={2}>
                {mobileCrashes.map((crash) => (
                  <Grid item xs={12} sm={6} md={4} key={crash.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">{crash.error}</Typography>
                          <Chip
                            label={crash.resolved ? 'Resolved' : 'Open'}
                            color={crash.resolved ? 'success' : 'error'}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Platform: {crash.platform}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Version: {crash.version}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Timestamp: {new Date(crash.timestamp).toLocaleString()}
                        </Typography>
                        {crash.resolvedAt && (
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            Resolved: {new Date(crash.resolvedAt).toLocaleString()}
                          </Typography>
                        )}
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

          {/* Feedback Tab */}
          {activeTab === 17 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Mobile Feedback</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('feedback')}
                >
                  Add Feedback
                </Button>
              </Box>

              <Grid container spacing={2}>
                {mobileFeedback.map((feedback) => (
                  <Grid item xs={12} sm={6} md={4} key={feedback.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">{feedback.title}</Typography>
                          <Chip
                            label={feedback.status}
                            color={getStatusColor(feedback.status) as any}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {feedback.description}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Type: {feedback.type}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Platform: {feedback.platform}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Priority: {feedback.priority}
                        </Typography>
                        {feedback.rating && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <Rating value={feedback.rating} readOnly size="small" />
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              {feedback.rating}/5
                            </Typography>
                          </Box>
                        )}
                        {feedback.assignedTo && (
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            Assigned to: {feedback.assignedTo}
                          </Typography>
                        )}
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
        </CardContent>
      </Card>

      {/* Dialog for Add/Edit */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogType === 'app' ? 'Add/Edit Mobile App' :
           dialogType === 'feature' ? 'Add/Edit Mobile Feature' :
           dialogType === 'sync' ? 'Add/Edit Offline Sync' :
           dialogType === 'notification' ? 'Add/Edit Push Notification' :
           dialogType === 'auth' ? 'Add/Edit Biometric Auth' :
           dialogType === 'scanning' ? 'Add/Edit Camera Scanning' :
           dialogType === 'tracking' ? 'Add/Edit GPS Tracking' :
           dialogType === 'command' ? 'Add/Edit Voice Command' :
           dialogType === 'nfc' ? 'Add/Edit NFC Scanning' :
           dialogType === 'ar' ? 'Add/Edit AR Capture' :
           dialogType === 'watch' ? 'Add/Edit Watch Companion' :
           dialogType === 'widget' ? 'Add/Edit Mobile Widget' :
           dialogType === 'linking' ? 'Add/Edit Deep Linking' :
           dialogType === 'extension' ? 'Add/Edit Share Extension' :
           dialogType === 'analytics' ? 'Add/Edit Mobile Analytics' :
           dialogType === 'performance' ? 'Add/Edit Mobile Performance' :
           dialogType === 'crash' ? 'Add/Edit Mobile Crash' :
           'Add/Edit Mobile Feedback'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {dialogType === 'app' && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="App Name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Platform</InputLabel>
                    <Select
                      value={formData.platform || ''}
                      onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    >
                      <MenuItem value="IOS">iOS</MenuItem>
                      <MenuItem value="ANDROID">Android</MenuItem>
                      <MenuItem value="WEB">Web</MenuItem>
                      <MenuItem value="DESKTOP">Desktop</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Version"
                    value={formData.version || ''}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Build Number"
                    value={formData.buildNumber || ''}
                    onChange={(e) => setFormData({ ...formData, buildNumber: e.target.value })}
                  />
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

            {dialogType === 'feature' && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Feature Name"
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
                      <MenuItem value="OFFLINE_SYNC">Offline Sync</MenuItem>
                      <MenuItem value="PUSH_NOTIFICATIONS">Push Notifications</MenuItem>
                      <MenuItem value="BIOMETRIC_AUTH">Biometric Auth</MenuItem>
                      <MenuItem value="CAMERA_SCANNING">Camera Scanning</MenuItem>
                      <MenuItem value="GPS_TRACKING">GPS Tracking</MenuItem>
                      <MenuItem value="VOICE_COMMANDS">Voice Commands</MenuItem>
                      <MenuItem value="NFC_SCANNING">NFC Scanning</MenuItem>
                      <MenuItem value="AR_CAPTURE">AR Capture</MenuItem>
                      <MenuItem value="WATCH_COMPANION">Watch Companion</MenuItem>
                      <MenuItem value="WIDGETS">Widgets</MenuItem>
                      <MenuItem value="DEEP_LINKING">Deep Linking</MenuItem>
                      <MenuItem value="SHARE_EXTENSION">Share Extension</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Platform</InputLabel>
                    <Select
                      value={formData.platform || ''}
                      onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    >
                      <MenuItem value="IOS">iOS</MenuItem>
                      <MenuItem value="ANDROID">Android</MenuItem>
                      <MenuItem value="BOTH">Both</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.enabled || false}
                        onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                      />
                    }
                    label="Enabled"
                  />
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
        onClick={() => handleOpenDialog('app')}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default MobileExcellenceDashboard;







