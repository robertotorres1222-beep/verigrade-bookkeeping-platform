import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  Slider,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Alert,
  AlertTitle,
  Grid,
  Paper,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip
} from '@mui/material';
import {
  Settings,
  SmartToy,
  Notifications,
  Security,
  Analytics,
  Download,
  Upload,
  Refresh,
  Info,
  Warning,
  CheckCircle,
  AutoAwesome,
  TrendingUp,
  Speed,
  Memory,
  Storage,
  NetworkCheck
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const SettingsCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '&:last-child': {
    marginBottom: 0,
  },
}));

const MetricCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
}));

interface AISettings {
  // Chatbot Settings
  chatbotEnabled: boolean;
  voiceInputEnabled: boolean;
  autoSuggestions: boolean;
  confidenceThreshold: number;
  
  // Document Intelligence
  documentProcessing: boolean;
  autoCategorization: boolean;
  ocrConfidenceThreshold: number;
  manualReviewThreshold: number;
  
  // Anomaly Detection
  fraudDetection: boolean;
  spendingAlerts: boolean;
  duplicateDetection: boolean;
  priceMonitoring: boolean;
  
  // Recommendations
  vendorOptimization: boolean;
  billingOptimization: boolean;
  cashFlowOptimization: boolean;
  staffingRecommendations: boolean;
  
  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  notificationFrequency: 'immediate' | 'daily' | 'weekly';
  
  // Privacy & Security
  dataRetention: number; // days
  anonymizeData: boolean;
  shareInsights: boolean;
  modelTraining: boolean;
}

interface AIMetrics {
  totalQueries: number;
  accuracyRate: number;
  responseTime: number;
  userSatisfaction: number;
  modelPerformance: {
    chatbot: number;
    documentIntelligence: number;
    anomalyDetection: number;
    recommendations: number;
  };
  systemHealth: {
    cpuUsage: number;
    memoryUsage: number;
    storageUsage: number;
    networkLatency: number;
  };
}

interface AISettingsPanelProps {
  userId: string;
  onSettingsChange?: (settings: AISettings) => void;
}

const AISettingsPanel: React.FC<AISettingsPanelProps> = ({ userId, onSettingsChange }) => {
  const [settings, setSettings] = useState<AISettings>({
    chatbotEnabled: true,
    voiceInputEnabled: true,
    autoSuggestions: true,
    confidenceThreshold: 0.7,
    documentProcessing: true,
    autoCategorization: true,
    ocrConfidenceThreshold: 0.8,
    manualReviewThreshold: 0.6,
    fraudDetection: true,
    spendingAlerts: true,
    duplicateDetection: true,
    priceMonitoring: true,
    vendorOptimization: true,
    billingOptimization: true,
    cashFlowOptimization: true,
    staffingRecommendations: true,
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    notificationFrequency: 'daily',
    dataRetention: 365,
    anonymizeData: false,
    shareInsights: true,
    modelTraining: true,
  });

  const [metrics, setMetrics] = useState<AIMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [exportDialog, setExportDialog] = useState(false);
  const [importDialog, setImportDialog] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchMetrics();
  }, [userId]);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`/api/ai/settings/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching AI settings:', error);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await fetch(`/api/ai/metrics/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setMetrics(data.metrics);
      }
    } catch (error) {
      console.error('Error fetching AI metrics:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<AISettings>) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ai/settings/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newSettings)
      });
      
      const data = await response.json();
      if (data.success) {
        setSettings(prev => ({ ...prev, ...newSettings }));
        if (onSettingsChange) {
          onSettingsChange({ ...settings, ...newSettings });
        }
      }
    } catch (error) {
      console.error('Error updating AI settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: keyof AISettings, value: any) => {
    updateSettings({ [key]: value });
  };

  const handleExportData = async () => {
    try {
      const response = await fetch(`/api/ai/export/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-training-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const handleImportData = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`/api/ai/import/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      const data = await response.json();
      if (data.success) {
        // Refresh settings and metrics
        fetchSettings();
        fetchMetrics();
      }
    } catch (error) {
      console.error('Error importing data:', error);
    }
  };

  const renderChatbotSettings = () => (
    <SettingsCard>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          <SmartToy sx={{ mr: 1, verticalAlign: 'middle' }} />
          Chatbot Settings
        </Typography>
        
        <List>
          <ListItem>
            <ListItemText 
              primary="Enable AI Chatbot" 
              secondary="Allow AI-powered conversations for expense entry and financial queries"
            />
            <ListItemSecondaryAction>
              <Switch
                checked={settings.chatbotEnabled}
                onChange={(e) => handleSettingChange('chatbotEnabled', e.target.checked)}
              />
            </ListItemSecondaryAction>
          </ListItem>
          
          <ListItem>
            <ListItemText 
              primary="Voice Input" 
              secondary="Enable voice commands and speech-to-text"
            />
            <ListItemSecondaryAction>
              <Switch
                checked={settings.voiceInputEnabled}
                onChange={(e) => handleSettingChange('voiceInputEnabled', e.target.checked)}
                disabled={!settings.chatbotEnabled}
              />
            </ListItemSecondaryAction>
          </ListItem>
          
          <ListItem>
            <ListItemText 
              primary="Auto Suggestions" 
              secondary="Show intelligent suggestions based on context"
            />
            <ListItemSecondaryAction>
              <Switch
                checked={settings.autoSuggestions}
                onChange={(e) => handleSettingChange('autoSuggestions', e.target.checked)}
                disabled={!settings.chatbotEnabled}
              />
            </ListItemSecondaryAction>
          </ListItem>
          
          <ListItem>
            <ListItemText 
              primary="Confidence Threshold" 
              secondary={`Only show responses with ${Math.round(settings.confidenceThreshold * 100)}%+ confidence`}
            />
            <ListItemSecondaryAction>
              <Box sx={{ width: 200 }}>
                <Slider
                  value={settings.confidenceThreshold}
                  onChange={(_, value) => handleSettingChange('confidenceThreshold', value)}
                  min={0.1}
                  max={1}
                  step={0.1}
                  marks={[
                    { value: 0.1, label: '10%' },
                    { value: 0.5, label: '50%' },
                    { value: 0.8, label: '80%' },
                    { value: 1, label: '100%' }
                  ]}
                  disabled={!settings.chatbotEnabled}
                />
              </Box>
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </CardContent>
    </SettingsCard>
  );

  const renderDocumentIntelligenceSettings = () => (
    <SettingsCard>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          <AutoAwesome sx={{ mr: 1, verticalAlign: 'middle' }} />
          Document Intelligence
        </Typography>
        
        <List>
          <ListItem>
            <ListItemText 
              primary="Auto Document Processing" 
              secondary="Automatically extract data from uploaded documents"
            />
            <ListItemSecondaryAction>
              <Switch
                checked={settings.documentProcessing}
                onChange={(e) => handleSettingChange('documentProcessing', e.target.checked)}
              />
            </ListItemSecondaryAction>
          </ListItem>
          
          <ListItem>
            <ListItemText 
              primary="Auto Categorization" 
              secondary="Automatically categorize expenses and transactions"
            />
            <ListItemSecondaryAction>
              <Switch
                checked={settings.autoCategorization}
                onChange={(e) => handleSettingChange('autoCategorization', e.target.checked)}
                disabled={!settings.documentProcessing}
              />
            </ListItemSecondaryAction>
          </ListItem>
          
          <ListItem>
            <ListItemText 
              primary="OCR Confidence Threshold" 
              secondary={`Require ${Math.round(settings.ocrConfidenceThreshold * 100)}%+ confidence for OCR results`}
            />
            <ListItemSecondaryAction>
              <Box sx={{ width: 200 }}>
                <Slider
                  value={settings.ocrConfidenceThreshold}
                  onChange={(_, value) => handleSettingChange('ocrConfidenceThreshold', value)}
                  min={0.1}
                  max={1}
                  step={0.1}
                  disabled={!settings.documentProcessing}
                />
              </Box>
            </ListItemSecondaryAction>
          </ListItem>
          
          <ListItem>
            <ListItemText 
              primary="Manual Review Threshold" 
              secondary={`Send items with ${Math.round(settings.manualReviewThreshold * 100)}%- confidence for manual review`}
            />
            <ListItemSecondaryAction>
              <Box sx={{ width: 200 }}>
                <Slider
                  value={settings.manualReviewThreshold}
                  onChange={(_, value) => handleSettingChange('manualReviewThreshold', value)}
                  min={0.1}
                  max={1}
                  step={0.1}
                  disabled={!settings.documentProcessing}
                />
              </Box>
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </CardContent>
    </SettingsCard>
  );

  const renderAnomalyDetectionSettings = () => (
    <SettingsCard>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
          Anomaly Detection
        </Typography>
        
        <List>
          <ListItem>
            <ListItemText 
              primary="Fraud Detection" 
              secondary="Monitor transactions for suspicious activity"
            />
            <ListItemSecondaryAction>
              <Switch
                checked={settings.fraudDetection}
                onChange={(e) => handleSettingChange('fraudDetection', e.target.checked)}
              />
            </ListItemSecondaryAction>
          </ListItem>
          
          <ListItem>
            <ListItemText 
              primary="Spending Alerts" 
              secondary="Get notified of unusual spending patterns"
            />
            <ListItemSecondaryAction>
              <Switch
                checked={settings.spendingAlerts}
                onChange={(e) => handleSettingChange('spendingAlerts', e.target.checked)}
              />
            </ListItemSecondaryAction>
          </ListItem>
          
          <ListItem>
            <ListItemText 
              primary="Duplicate Detection" 
              secondary="Identify potential duplicate transactions"
            />
            <ListItemSecondaryAction>
              <Switch
                checked={settings.duplicateDetection}
                onChange={(e) => handleSettingChange('duplicateDetection', e.target.checked)}
              />
            </ListItemSecondaryAction>
          </ListItem>
          
          <ListItem>
            <ListItemText 
              primary="Price Monitoring" 
              secondary="Track price changes and vendor pricing"
            />
            <ListItemSecondaryAction>
              <Switch
                checked={settings.priceMonitoring}
                onChange={(e) => handleSettingChange('priceMonitoring', e.target.checked)}
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </CardContent>
    </SettingsCard>
  );

  const renderNotificationSettings = () => (
    <SettingsCard>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          <Notifications sx={{ mr: 1, verticalAlign: 'middle' }} />
          Notifications
        </Typography>
        
        <List>
          <ListItem>
            <ListItemText 
              primary="Email Notifications" 
              secondary="Receive AI insights via email"
            />
            <ListItemSecondaryAction>
              <Switch
                checked={settings.emailNotifications}
                onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
              />
            </ListItemSecondaryAction>
          </ListItem>
          
          <ListItem>
            <ListItemText 
              primary="Push Notifications" 
              secondary="Get real-time alerts on mobile"
            />
            <ListItemSecondaryAction>
              <Switch
                checked={settings.pushNotifications}
                onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
              />
            </ListItemSecondaryAction>
          </ListItem>
          
          <ListItem>
            <ListItemText 
              primary="SMS Notifications" 
              secondary="Receive critical alerts via SMS"
            />
            <ListItemSecondaryAction>
              <Switch
                checked={settings.smsNotifications}
                onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
              />
            </ListItemSecondaryAction>
          </ListItem>
          
          <ListItem>
            <ListItemText 
              primary="Notification Frequency" 
              secondary="How often to receive AI insights"
            />
            <ListItemSecondaryAction>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={settings.notificationFrequency}
                  onChange={(e) => handleSettingChange('notificationFrequency', e.target.value)}
                >
                  <MenuItem value="immediate">Immediate</MenuItem>
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                </Select>
              </FormControl>
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </CardContent>
    </SettingsCard>
  );

  const renderPrivacySettings = () => (
    <SettingsCard>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
          Privacy & Security
        </Typography>
        
        <List>
          <ListItem>
            <ListItemText 
              primary="Data Retention" 
              secondary={`Keep AI training data for ${settings.dataRetention} days`}
            />
            <ListItemSecondaryAction>
              <Box sx={{ width: 200 }}>
                <Slider
                  value={settings.dataRetention}
                  onChange={(_, value) => handleSettingChange('dataRetention', value)}
                  min={30}
                  max={1095}
                  step={30}
                  marks={[
                    { value: 30, label: '30d' },
                    { value: 365, label: '1y' },
                    { value: 1095, label: '3y' }
                  ]}
                />
              </Box>
            </ListItemSecondaryAction>
          </ListItem>
          
          <ListItem>
            <ListItemText 
              primary="Anonymize Data" 
              secondary="Remove personally identifiable information from training data"
            />
            <ListItemSecondaryAction>
              <Switch
                checked={settings.anonymizeData}
                onChange={(e) => handleSettingChange('anonymizeData', e.target.checked)}
              />
            </ListItemSecondaryAction>
          </ListItem>
          
          <ListItem>
            <ListItemText 
              primary="Share Insights" 
              secondary="Allow sharing of anonymized insights for model improvement"
            />
            <ListItemSecondaryAction>
              <Switch
                checked={settings.shareInsights}
                onChange={(e) => handleSettingChange('shareInsights', e.target.checked)}
              />
            </ListItemSecondaryAction>
          </ListItem>
          
          <ListItem>
            <ListItemText 
              primary="Model Training" 
              secondary="Use your data to improve AI models"
            />
            <ListItemSecondaryAction>
              <Switch
                checked={settings.modelTraining}
                onChange={(e) => handleSettingChange('modelTraining', e.target.checked)}
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </CardContent>
    </SettingsCard>
  );

  const renderMetrics = () => {
    if (!metrics) return null;

    return (
      <SettingsCard>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <Analytics sx={{ mr: 1, verticalAlign: 'middle' }} />
            AI Performance Metrics
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={3}>
              <MetricCard>
                <Typography variant="h4" color="primary">
                  {metrics.totalQueries.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Queries
                </Typography>
              </MetricCard>
            </Grid>
            <Grid item xs={6} sm={3}>
              <MetricCard>
                <Typography variant="h4" color="success.main">
                  {Math.round(metrics.accuracyRate * 100)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Accuracy Rate
                </Typography>
              </MetricCard>
            </Grid>
            <Grid item xs={6} sm={3}>
              <MetricCard>
                <Typography variant="h4" color="info.main">
                  {metrics.responseTime}ms
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Avg Response Time
                </Typography>
              </MetricCard>
            </Grid>
            <Grid item xs={6} sm={3}>
              <MetricCard>
                <Typography variant="h4" color="warning.main">
                  {Math.round(metrics.userSatisfaction * 100)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  User Satisfaction
                </Typography>
              </MetricCard>
            </Grid>
          </Grid>

          <Typography variant="subtitle1" gutterBottom>
            Model Performance
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Model</TableCell>
                  <TableCell align="right">Performance</TableCell>
                  <TableCell align="right">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Chatbot</TableCell>
                  <TableCell align="right">
                    <LinearProgress 
                      variant="determinate" 
                      value={metrics.modelPerformance.chatbot * 100} 
                      sx={{ width: 100 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Chip 
                      label={metrics.modelPerformance.chatbot > 0.8 ? 'Excellent' : 'Good'} 
                      color={metrics.modelPerformance.chatbot > 0.8 ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Document Intelligence</TableCell>
                  <TableCell align="right">
                    <LinearProgress 
                      variant="determinate" 
                      value={metrics.modelPerformance.documentIntelligence * 100} 
                      sx={{ width: 100 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Chip 
                      label={metrics.modelPerformance.documentIntelligence > 0.8 ? 'Excellent' : 'Good'} 
                      color={metrics.modelPerformance.documentIntelligence > 0.8 ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Anomaly Detection</TableCell>
                  <TableCell align="right">
                    <LinearProgress 
                      variant="determinate" 
                      value={metrics.modelPerformance.anomalyDetection * 100} 
                      sx={{ width: 100 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Chip 
                      label={metrics.modelPerformance.anomalyDetection > 0.8 ? 'Excellent' : 'Good'} 
                      color={metrics.modelPerformance.anomalyDetection > 0.8 ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Recommendations</TableCell>
                  <TableCell align="right">
                    <LinearProgress 
                      variant="determinate" 
                      value={metrics.modelPerformance.recommendations * 100} 
                      sx={{ width: 100 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Chip 
                      label={metrics.modelPerformance.recommendations > 0.8 ? 'Excellent' : 'Good'} 
                      color={metrics.modelPerformance.recommendations > 0.8 ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </SettingsCard>
    );
  };

  const renderDataManagement = () => (
    <SettingsCard>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          <Storage sx={{ mr: 1, verticalAlign: 'middle' }} />
          Data Management
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={() => setExportDialog(true)}
          >
            Export Training Data
          </Button>
          <Button
            variant="outlined"
            startIcon={<Upload />}
            onClick={() => setImportDialog(true)}
          >
            Import Data
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchMetrics}
          >
            Refresh Metrics
          </Button>
        </Box>
        
        <Alert severity="info" sx={{ mb: 2 }}>
          <AlertTitle>Data Export</AlertTitle>
          Export your AI training data to improve model performance or for backup purposes.
        </Alert>
        
        <Alert severity="warning">
          <AlertTitle>Data Import</AlertTitle>
          Importing data will retrain AI models. This process may take several minutes.
        </Alert>
      </CardContent>
    </SettingsCard>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        <Settings sx={{ mr: 1, verticalAlign: 'middle' }} />
        AI Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Configure AI features and manage your intelligent bookkeeping experience
      </Typography>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {renderChatbotSettings()}
      {renderDocumentIntelligenceSettings()}
      {renderAnomalyDetectionSettings()}
      {renderNotificationSettings()}
      {renderPrivacySettings()}
      {renderMetrics()}
      {renderDataManagement()}

      {/* Export Dialog */}
      <Dialog open={exportDialog} onClose={() => setExportDialog(false)}>
        <DialogTitle>Export AI Training Data</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This will export all your AI training data including:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Chat conversations" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Document extractions" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="User feedback" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Model performance data" />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleExportData}>
            Export Data
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialog} onClose={() => setImportDialog(false)}>
        <DialogTitle>Import AI Training Data</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select a JSON file containing AI training data:
          </Typography>
          <TextField
            type="file"
            inputProps={{ accept: '.json' }}
            onChange={(e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) {
                handleImportData(file);
                setImportDialog(false);
              }
            }}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AISettingsPanel;










