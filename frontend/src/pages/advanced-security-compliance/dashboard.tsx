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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Security as SecurityIcon,
  Shield as ShieldIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  BugReport as BugReportIcon,
  Security as SecurityIcon2,
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
  Analytics as AnalyticsIcon,
  Lock as LockIcon,
  Public as PublicIcon,
  Person as PersonIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter } from 'recharts';

interface SecurityScan {
  id: string;
  name: string;
  type: string;
  status: string;
  target: string;
  tool: string;
  results?: {
    vulnerabilities: Array<{
      id: string;
      severity: string;
      title: string;
      description: string;
      cve?: string;
      cvss?: number;
    }>;
    summary: {
      totalIssues: number;
      criticalIssues: number;
      highIssues: number;
      mediumIssues: number;
      lowIssues: number;
      riskScore: number;
    };
  };
}

interface ComplianceFramework {
  id: string;
  name: string;
  type: string;
  version: string;
  status: string;
  description: string;
  requirements: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    priority: string;
    status: string;
  }>;
}

interface SecurityControl {
  id: string;
  name: string;
  category: string;
  type: string;
  status: string;
  description: string;
  effectiveness: number;
  lastTested?: string;
  nextTest?: string;
  owner: string;
}

interface SecurityIncident {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  category: string;
  reporter: string;
  assignee?: string;
  startTime: string;
  endTime?: string;
  impact: {
    usersAffected: number;
    dataCompromised: boolean;
    systemsAffected: string[];
    businessImpact: string;
  };
}

interface DataSubjectRequest {
  id: string;
  subjectId: string;
  type: string;
  status: string;
  requester: string;
  description: string;
  dataTypes: string[];
  dueDate: string;
  completedDate?: string;
}

interface PrivacyImpactAssessment {
  id: string;
  name: string;
  description: string;
  dataTypes: string[];
  riskLevel: string;
  status: string;
  approver?: string;
  approvedDate?: string;
}

interface SecurityTraining {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  duration: number;
  status: string;
}

interface SecurityTrainingRecord {
  id: string;
  trainingId: string;
  userId: string;
  status: string;
  assignedDate: string;
  completedDate?: string;
  score?: number;
  attempts: number;
  maxAttempts: number;
  dueDate: string;
}

interface SecurityComplianceAnalytics {
  securityScore: number;
  complianceScore: number;
  vulnerabilityCount: number;
  criticalVulnerabilities: number;
  openIncidents: number;
  resolvedIncidents: number;
  trainingCompletion: number;
  dataSubjectRequests: number;
  privacyAssessments: number;
  securityControls: number;
  activeControls: number;
  riskTrend: Array<{
    date: string;
    risk: number;
    vulnerabilities: number;
  }>;
  complianceTrend: Array<{
    date: string;
    score: number;
    assessments: number;
  }>;
  topVulnerabilities: Array<{
    type: string;
    count: number;
    severity: string;
  }>;
  complianceStatus: Array<{
    framework: string;
    score: number;
    status: string;
  }>;
}

const AdvancedSecurityComplianceDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [securityScans, setSecurityScans] = useState<SecurityScan[]>([]);
  const [complianceFrameworks, setComplianceFrameworks] = useState<ComplianceFramework[]>([]);
  const [securityControls, setSecurityControls] = useState<SecurityControl[]>([]);
  const [securityIncidents, setSecurityIncidents] = useState<SecurityIncident[]>([]);
  const [dataSubjectRequests, setDataSubjectRequests] = useState<DataSubjectRequest[]>([]);
  const [privacyAssessments, setPrivacyAssessments] = useState<PrivacyImpactAssessment[]>([]);
  const [securityTrainings, setSecurityTrainings] = useState<SecurityTraining[]>([]);
  const [trainingRecords, setTrainingRecords] = useState<SecurityTrainingRecord[]>([]);
  const [analytics, setAnalytics] = useState<SecurityComplianceAnalytics | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'security-scan' | 'compliance-framework' | 'security-control' | 'security-incident' | 'data-subject-request' | 'privacy-assessment' | 'security-training'>('security-scan');
  const [formData, setFormData] = useState<any>({});

  // Mock data for demonstration
  const mockSecurityScans: SecurityScan[] = [
    { id: '1', name: 'Vulnerability Scan', type: 'VULNERABILITY', status: 'COMPLETED', target: 'api-service', tool: 'Trivy', results: { vulnerabilities: [{ id: '1', severity: 'HIGH', title: 'SQL Injection', description: 'Potential SQL injection vulnerability', cve: 'CVE-2024-1234', cvss: 7.5 }], summary: { totalIssues: 5, criticalIssues: 1, highIssues: 1, mediumIssues: 2, lowIssues: 1, riskScore: 75 } } },
    { id: '2', name: 'Dependency Scan', type: 'DEPENDENCY', status: 'RUNNING', target: 'frontend-app', tool: 'Snyk' },
  ];

  const mockComplianceFrameworks: ComplianceFramework[] = [
    { id: '1', name: 'SOC 2 Type II', type: 'SOC2', version: '2024', status: 'ACTIVE', description: 'SOC 2 Type II compliance framework', requirements: [{ id: '1', title: 'Access Controls', description: 'Implement proper access controls', category: 'Security', priority: 'HIGH', status: 'COMPLETED' }] },
    { id: '2', name: 'GDPR Compliance', type: 'GDPR', version: '2018', status: 'ACTIVE', description: 'General Data Protection Regulation compliance', requirements: [{ id: '1', title: 'Data Subject Rights', description: 'Implement data subject rights', category: 'Privacy', priority: 'CRITICAL', status: 'IN_PROGRESS' }] },
  ];

  const mockSecurityControls: SecurityControl[] = [
    { id: '1', name: 'Multi-Factor Authentication', category: 'ACCESS_CONTROL', type: 'PREVENTIVE', status: 'ACTIVE', description: 'Require MFA for all user accounts', effectiveness: 95, lastTested: '2024-01-15', nextTest: '2024-04-15', owner: 'user1' },
    { id: '2', name: 'Data Encryption', category: 'DATA_PROTECTION', type: 'PREVENTIVE', status: 'ACTIVE', description: 'Encrypt data at rest and in transit', effectiveness: 90, lastTested: '2024-01-10', nextTest: '2024-04-10', owner: 'user2' },
  ];

  const mockSecurityIncidents: SecurityIncident[] = [
    { id: '1', title: 'Suspicious Login Attempts', description: 'Multiple failed login attempts detected', severity: 'MEDIUM', status: 'INVESTIGATING', category: 'UNAUTHORIZED_ACCESS', reporter: 'user1', assignee: 'user2', startTime: '2024-01-15T10:00:00Z', impact: { usersAffected: 5, dataCompromised: false, systemsAffected: ['auth-service'], businessImpact: 'Low' } },
    { id: '2', title: 'Data Breach Investigation', description: 'Potential data breach in customer database', severity: 'CRITICAL', status: 'OPEN', category: 'DATA_BREACH', reporter: 'user3', startTime: '2024-01-16T14:00:00Z', impact: { usersAffected: 1000, dataCompromised: true, systemsAffected: ['customer-db'], businessImpact: 'High' } },
  ];

  const mockDataSubjectRequests: DataSubjectRequest[] = [
    { id: '1', subjectId: 'user123', type: 'ACCESS', status: 'IN_PROGRESS', requester: 'user123', description: 'Request access to personal data', dataTypes: ['profile', 'transactions'], dueDate: '2024-02-01' },
    { id: '2', subjectId: 'user456', type: 'ERASURE', status: 'COMPLETED', requester: 'user456', description: 'Request deletion of personal data', dataTypes: ['profile', 'preferences'], dueDate: '2024-01-30', completedDate: '2024-01-28' },
  ];

  const mockPrivacyAssessments: PrivacyImpactAssessment[] = [
    { id: '1', name: 'Customer Data Processing', description: 'Assessment for customer data processing', dataTypes: ['personal', 'financial'], riskLevel: 'HIGH', status: 'APPROVED', approver: 'user1', approvedDate: '2024-01-15' },
    { id: '2', name: 'Analytics Data Collection', description: 'Assessment for analytics data collection', dataTypes: ['behavioral', 'demographic'], riskLevel: 'MEDIUM', status: 'REVIEW' },
  ];

  const mockSecurityTrainings: SecurityTraining[] = [
    { id: '1', title: 'Phishing Awareness', description: 'Training on identifying and preventing phishing attacks', type: 'ONLINE', category: 'PHISHING', duration: 30, status: 'ACTIVE' },
    { id: '2', title: 'Data Protection', description: 'Training on data protection and privacy', type: 'WORKSHOP', category: 'DATA_PROTECTION', duration: 60, status: 'ACTIVE' },
  ];

  const mockTrainingRecords: SecurityTrainingRecord[] = [
    { id: '1', trainingId: '1', userId: 'user1', status: 'COMPLETED', assignedDate: '2024-01-01', completedDate: '2024-01-05', score: 85, attempts: 1, maxAttempts: 3, dueDate: '2024-01-31' },
    { id: '2', trainingId: '2', userId: 'user2', status: 'IN_PROGRESS', assignedDate: '2024-01-15', attempts: 0, maxAttempts: 3, dueDate: '2024-02-15' },
  ];

  const mockAnalytics: SecurityComplianceAnalytics = {
    securityScore: 85.5,
    complianceScore: 92.0,
    vulnerabilityCount: 15,
    criticalVulnerabilities: 2,
    openIncidents: 3,
    resolvedIncidents: 12,
    trainingCompletion: 78.5,
    dataSubjectRequests: 8,
    privacyAssessments: 5,
    securityControls: 25,
    activeControls: 23,
    riskTrend: [
      { date: '2024-01-01', risk: 45, vulnerabilities: 3 },
      { date: '2024-01-02', risk: 42, vulnerabilities: 2 },
      { date: '2024-01-03', risk: 38, vulnerabilities: 1 },
    ],
    complianceTrend: [
      { date: '2024-01-01', score: 88, assessments: 2 },
      { date: '2024-01-02', score: 90, assessments: 1 },
      { date: '2024-01-03', score: 92, assessments: 3 },
    ],
    topVulnerabilities: [
      { type: 'SQL Injection', count: 5, severity: 'HIGH' },
      { type: 'XSS', count: 3, severity: 'MEDIUM' },
      { type: 'CSRF', count: 2, severity: 'MEDIUM' },
    ],
    complianceStatus: [
      { framework: 'SOC 2', score: 85, status: 'COMPLIANT' },
      { framework: 'GDPR', score: 92, status: 'COMPLIANT' },
      { framework: 'PCI DSS', score: 78, status: 'PARTIAL' },
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
      
      setSecurityScans(mockSecurityScans);
      setComplianceFrameworks(mockComplianceFrameworks);
      setSecurityControls(mockSecurityControls);
      setSecurityIncidents(mockSecurityIncidents);
      setDataSubjectRequests(mockDataSubjectRequests);
      setPrivacyAssessments(mockPrivacyAssessments);
      setSecurityTrainings(mockSecurityTrainings);
      setTrainingRecords(mockTrainingRecords);
      setAnalytics(mockAnalytics);
    } catch (err) {
      setError('Failed to load security compliance data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleOpenDialog = (type: 'security-scan' | 'compliance-framework' | 'security-control' | 'security-incident' | 'data-subject-request' | 'privacy-assessment' | 'security-training', item?: any) => {
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
      case 'APPROVED': return 'success';
      case 'COMPLIANT': return 'success';
      case 'RUNNING': return 'info';
      case 'IN_PROGRESS': return 'info';
      case 'INVESTIGATING': return 'warning';
      case 'REVIEW': return 'warning';
      case 'PARTIAL': return 'warning';
      case 'FAILED': return 'error';
      case 'CRITICAL': return 'error';
      case 'OPEN': return 'error';
      default: return 'default';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'error';
      case 'HIGH': return 'error';
      case 'MEDIUM': return 'warning';
      case 'LOW': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading security compliance data...</Typography>
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
          Advanced Security & Compliance
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
            onClick={() => handleOpenDialog('security-scan')}
          >
            Add Scan
          </Button>
        </Box>
      </Box>

      {/* Analytics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SecurityIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Security Score
                  </Typography>
                  <Typography variant="h4">
                    {analytics?.securityScore?.toFixed(1) || 0}%
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
                <ShieldIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Compliance Score
                  </Typography>
                  <Typography variant="h4">
                    {analytics?.complianceScore?.toFixed(1) || 0}%
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
                <BugReportIcon color="error" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Vulnerabilities
                  </Typography>
                  <Typography variant="h4">
                    {analytics?.vulnerabilityCount || 0}
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
                <WarningIcon color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Open Incidents
                  </Typography>
                  <Typography variant="h4">
                    {analytics?.openIncidents || 0}
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
            <Tab label="Security Scans" />
            <Tab label="Compliance" />
            <Tab label="Security Controls" />
            <Tab label="Incidents" />
            <Tab label="Data Privacy" />
            <Tab label="Training" />
            <Tab label="Analytics" />
          </Tabs>
        </Box>

        <CardContent>
          {/* Security Scans Tab */}
          {activeTab === 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Security Scans</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('security-scan')}
                >
                  Add Scan
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Target</TableCell>
                      <TableCell>Tool</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Risk Score</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {securityScans.map((scan) => (
                      <TableRow key={scan.id}>
                        <TableCell>{scan.name}</TableCell>
                        <TableCell>{scan.type}</TableCell>
                        <TableCell>{scan.target}</TableCell>
                        <TableCell>{scan.tool}</TableCell>
                        <TableCell>
                          <Chip
                            label={scan.status}
                            color={getStatusColor(scan.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {scan.results?.summary?.riskScore ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2">
                                {scan.results.summary.riskScore}%
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={scan.results.summary.riskScore}
                                sx={{ width: 50, height: 8 }}
                                color={scan.results.summary.riskScore > 70 ? 'error' : scan.results.summary.riskScore > 40 ? 'warning' : 'success'}
                              />
                            </Box>
                          ) : '-'}
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

          {/* Compliance Tab */}
          {activeTab === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Compliance Frameworks</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('compliance-framework')}
                >
                  Add Framework
                </Button>
              </Box>

              <Grid container spacing={2}>
                {complianceFrameworks.map((framework) => (
                  <Grid item xs={12} sm={6} md={4} key={framework.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">{framework.name}</Typography>
                          <Chip
                            label={framework.status}
                            color={getStatusColor(framework.status) as any}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {framework.description}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Type: {framework.type} v{framework.version}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Requirements: {framework.requirements.length}
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          <Button size="small" startIcon={<EditIcon />}>
                            Edit
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

          {/* Security Controls Tab */}
          {activeTab === 2 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Security Controls</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('security-control')}
                >
                  Add Control
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Effectiveness</TableCell>
                      <TableCell>Last Tested</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {securityControls.map((control) => (
                      <TableRow key={control.id}>
                        <TableCell>{control.name}</TableCell>
                        <TableCell>{control.category}</TableCell>
                        <TableCell>{control.type}</TableCell>
                        <TableCell>
                          <Chip
                            label={control.status}
                            color={getStatusColor(control.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">
                              {control.effectiveness}%
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={control.effectiveness}
                              sx={{ width: 50, height: 8 }}
                              color={control.effectiveness > 80 ? 'success' : control.effectiveness > 60 ? 'warning' : 'error'}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>{control.lastTested ? new Date(control.lastTested).toLocaleDateString() : 'Never'}</TableCell>
                        <TableCell>
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
            </Box>
          )}

          {/* Incidents Tab */}
          {activeTab === 3 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Security Incidents</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('security-incident')}
                >
                  Create Incident
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Severity</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Reporter</TableCell>
                      <TableCell>Start Time</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {securityIncidents.map((incident) => (
                      <TableRow key={incident.id}>
                        <TableCell>{incident.title}</TableCell>
                        <TableCell>
                          <Chip
                            label={incident.severity}
                            color={getSeverityColor(incident.severity) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{incident.category}</TableCell>
                        <TableCell>
                          <Chip
                            label={incident.status}
                            color={getStatusColor(incident.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{incident.reporter}</TableCell>
                        <TableCell>{new Date(incident.startTime).toLocaleString()}</TableCell>
                        <TableCell>
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
            </Box>
          )}

          {/* Data Privacy Tab */}
          {activeTab === 4 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Data Privacy</Typography>
                <Box>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog('data-subject-request')}
                    sx={{ mr: 1 }}
                  >
                    Data Request
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog('privacy-assessment')}
                  >
                    Privacy Assessment
                  </Button>
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Data Subject Requests</Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Type</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Due Date</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {dataSubjectRequests.map((request) => (
                              <TableRow key={request.id}>
                                <TableCell>{request.type}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={request.status}
                                    color={getStatusColor(request.status) as any}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>{new Date(request.dueDate).toLocaleDateString()}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Privacy Impact Assessments</Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Name</TableCell>
                              <TableCell>Risk Level</TableCell>
                              <TableCell>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {privacyAssessments.map((assessment) => (
                              <TableRow key={assessment.id}>
                                <TableCell>{assessment.name}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={assessment.riskLevel}
                                    color={getSeverityColor(assessment.riskLevel) as any}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={assessment.status}
                                    color={getStatusColor(assessment.status) as any}
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

          {/* Training Tab */}
          {activeTab === 5 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Security Training</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('security-training')}
                >
                  Add Training
                </Button>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Training Programs</Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Title</TableCell>
                              <TableCell>Type</TableCell>
                              <TableCell>Duration</TableCell>
                              <TableCell>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {securityTrainings.map((training) => (
                              <TableRow key={training.id}>
                                <TableCell>{training.title}</TableCell>
                                <TableCell>{training.type}</TableCell>
                                <TableCell>{training.duration}m</TableCell>
                                <TableCell>
                                  <Chip
                                    label={training.status}
                                    color={getStatusColor(training.status) as any}
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
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Training Records</Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>User</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Score</TableCell>
                              <TableCell>Due Date</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {trainingRecords.map((record) => (
                              <TableRow key={record.id}>
                                <TableCell>{record.userId}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={record.status}
                                    color={getStatusColor(record.status) as any}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>{record.score || '-'}</TableCell>
                                <TableCell>{new Date(record.dueDate).toLocaleDateString()}</TableCell>
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

          {/* Analytics Tab */}
          {activeTab === 6 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3 }}>Security & Compliance Analytics</Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Risk Trend</Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analytics?.riskTrend || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <RechartsTooltip />
                          <Line type="monotone" dataKey="risk" stroke="#8884d8" strokeWidth={2} />
                          <Line type="monotone" dataKey="vulnerabilities" stroke="#82ca9d" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Compliance Trend</Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={analytics?.complianceTrend || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <RechartsTooltip />
                          <Area type="monotone" dataKey="score" stackId="1" stroke="#8884d8" fill="#8884d8" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Top Vulnerabilities</Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics?.topVulnerabilities || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="type" />
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
                      <Typography variant="h6" gutterBottom>Compliance Status</Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics?.complianceStatus || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="framework" />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey="score" fill="#82ca9d" />
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
          {dialogType === 'security-scan' ? 'Add/Edit Security Scan' :
           dialogType === 'compliance-framework' ? 'Add/Edit Compliance Framework' :
           dialogType === 'security-control' ? 'Add/Edit Security Control' :
           dialogType === 'security-incident' ? 'Create/Edit Security Incident' :
           dialogType === 'data-subject-request' ? 'Create/Edit Data Subject Request' :
           dialogType === 'privacy-assessment' ? 'Add/Edit Privacy Assessment' :
           'Add/Edit Security Training'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {dialogType === 'security-scan' && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Scan Name"
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
                      <MenuItem value="VULNERABILITY">Vulnerability</MenuItem>
                      <MenuItem value="DEPENDENCY">Dependency</MenuItem>
                      <MenuItem value="SECRET">Secret</MenuItem>
                      <MenuItem value="LICENSE">License</MenuItem>
                      <MenuItem value="IAC">Infrastructure as Code</MenuItem>
                      <MenuItem value="CONTAINER">Container</MenuItem>
                      <MenuItem value="CODE_QUALITY">Code Quality</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Target"
                    value={formData.target || ''}
                    onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tool"
                    value={formData.tool || ''}
                    onChange={(e) => setFormData({ ...formData, tool: e.target.value })}
                  />
                </Grid>
              </Grid>
            )}

            {dialogType === 'security-incident' && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Title"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Severity</InputLabel>
                    <Select
                      value={formData.severity || ''}
                      onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    >
                      <MenuItem value="LOW">Low</MenuItem>
                      <MenuItem value="MEDIUM">Medium</MenuItem>
                      <MenuItem value="HIGH">High</MenuItem>
                      <MenuItem value="CRITICAL">Critical</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <MenuItem value="DATA_BREACH">Data Breach</MenuItem>
                      <MenuItem value="MALWARE">Malware</MenuItem>
                      <MenuItem value="UNAUTHORIZED_ACCESS">Unauthorized Access</MenuItem>
                      <MenuItem value="PHISHING">Phishing</MenuItem>
                      <MenuItem value="DDOS">DDoS</MenuItem>
                      <MenuItem value="INSIDER_THREAT">Insider Threat</MenuItem>
                      <MenuItem value="OTHER">Other</MenuItem>
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
        onClick={() => handleOpenDialog('security-scan')}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default AdvancedSecurityComplianceDashboard;



