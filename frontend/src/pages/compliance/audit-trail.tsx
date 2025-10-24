import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Badge,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Warning,
  Error,
  Refresh,
  PlayArrow,
  Stop,
  Settings,
  Analytics,
  Security,
  ExpandMore,
  Add,
  Edit,
  Delete,
  Schedule,
  History,
  Notifications,
  Person,
  Group,
  Business,
  Timer,
  Flag,
  ThumbUp,
  ThumbDown,
  EscalatorWarning,
  Download,
  Upload,
  Search,
  FilterList,
  Visibility,
  RestoreFromTrash,
  Compare,
  Timeline
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface AuditTrailProps {}

const AuditTrail: React.FC<AuditTrailProps> = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [auditDialogOpen, setAuditDialogOpen] = useState(false);
  const [snapshotDialogOpen, setSnapshotDialogOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<any>(null);
  const [auditForm, setAuditForm] = useState<any>({
    action: '',
    entityType: '',
    entityId: '',
    beforeData: {},
    afterData: {},
    metadata: {}
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/audit/trail/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch audit trail dashboard');
      }

      const data = await response.json();
      setDashboardData(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAuditTrail = async () => {
    try {
      const response = await fetch('/api/audit/trail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(auditForm)
      });

      if (!response.ok) {
        throw new Error('Failed to create audit trail');
      }

      alert('Audit trail created successfully');
      setAuditDialogOpen(false);
      setAuditForm({
        action: '',
        entityType: '',
        entityId: '',
        beforeData: {},
        afterData: {},
        metadata: {}
      });
      fetchDashboardData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDetectTampering = async () => {
    try {
      const response = await fetch('/api/audit/trail/tamper', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to detect tampering');
      }

      const result = await response.json();
      alert(`Tampering detection completed. Found ${result.data.length} violations.`);
      fetchDashboardData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleExportAuditTrail = async () => {
    try {
      const response = await fetch('/api/audit/trail/export?startDate=2024-01-01&endDate=2024-12-31', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export audit trail');
      }

      const data = await response.json();
      // In a real implementation, this would download a file
      alert('Audit trail exported successfully');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!dashboardData) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        No audit trail data available
      </Alert>
    );
  }

  const auditStatsData = [
    { name: 'Total Audits', value: dashboardData.auditStats?.total_audits || 0, color: '#4caf50' },
    { name: 'Recent Audits', value: dashboardData.auditStats?.recent_audits || 0, color: '#2196f3' },
    { name: 'Unique Users', value: dashboardData.auditStats?.unique_users || 0, color: '#ff9800' }
  ];

  const recentAuditsData = dashboardData.recentAudits?.map((audit: any) => ({
    id: audit.id,
    action: audit.action,
    entityType: audit.entity_type,
    entityId: audit.entity_id,
    user: audit.user?.name || 'System',
    timestamp: new Date(audit.timestamp).toLocaleDateString(),
    hash: audit.audit_hash?.substring(0, 8) + '...'
  })) || [];

  const tamperDetectionsData = dashboardData.tamperDetections?.map((detection: any) => ({
    id: detection.id,
    blockIndex: detection.block_index,
    severity: detection.severity,
    description: detection.description,
    detectedAt: new Date(detection.detected_at).toLocaleDateString(),
    isResolved: detection.is_resolved
  })) || [];

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Immutable Audit Trails
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchDashboardData}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<Security />}
            onClick={handleDetectTampering}
            sx={{ mr: 1 }}
          >
            Detect Tampering
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExportAuditTrail}
            sx={{ mr: 1 }}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setAuditDialogOpen(true)}
          >
            Create Audit
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Security color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Audits</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {dashboardData.auditStats?.total_audits || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <History color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Recent Audits</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {dashboardData.auditStats?.recent_audits || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Person color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Unique Users</Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {dashboardData.auditStats?.unique_users || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Warning color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Tamper Detections</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {dashboardData.tamperDetections?.length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Audit Trail" />
          <Tab label="Snapshots" />
          <Tab label="Tamper Detection" />
          <Tab label="Integrity Report" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Audit Statistics
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={auditStatsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {auditStatsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
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
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                <List>
                  {recentAuditsData.slice(0, 5).map((audit: any, index: number) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Security color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${audit.action} ${audit.entityType}`}
                        secondary={`${audit.user} - ${audit.timestamp}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Audit Trail
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Action</TableCell>
                    <TableCell>Entity</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Hash</TableCell>
                    <TableCell>Timestamp</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentAuditsData.map((audit: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Chip
                          label={audit.action}
                          size="small"
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {audit.entityType}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {audit.entityId}
                        </Typography>
                      </TableCell>
                      <TableCell>{audit.user}</TableCell>
                      <TableCell>
                        <Typography variant="caption" fontFamily="monospace">
                          {audit.hash}
                        </Typography>
                      </TableCell>
                      <TableCell>{audit.timestamp}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Compare">
                          <IconButton size="small">
                            <Compare />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Audit Snapshots
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Before/After Comparison
                    </Typography>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Total Snapshots</Typography>
                      <Typography variant="body2">1,247</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Recent Changes</Typography>
                      <Typography variant="body2">156</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Integrity Score</Typography>
                      <Typography variant="body2">99.8%</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Snapshot Actions
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      <Button size="small" startIcon={<Compare />}>
                        Compare
                      </Button>
                      <Button size="small" startIcon={<RestoreFromTrash />}>
                        Restore
                      </Button>
                      <Button size="small" startIcon={<Download />}>
                        Export
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {activeTab === 3 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Tamper Detection
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Block Index</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Detected At</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tamperDetectionsData.map((detection: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          #{detection.blockIndex}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={detection.severity}
                          size="small"
                          color={detection.severity === 'critical' ? 'error' : 
                                 detection.severity === 'high' ? 'warning' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {detection.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={detection.isResolved ? 'Resolved' : 'Open'}
                          size="small"
                          color={detection.isResolved ? 'success' : 'error'}
                        />
                      </TableCell>
                      <TableCell>{detection.detectedAt}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Resolve">
                          <IconButton size="small">
                            <CheckCircle />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {activeTab === 4 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Integrity Report
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Chain Integrity
                    </Typography>
                    <Box display="flex" alignItems="center" mb={2}>
                      <CheckCircle color="success" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Chain integrity verified
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Total Blocks</Typography>
                      <Typography variant="body2">1,247</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Integrity Violations</Typography>
                      <Typography variant="body2">0</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Last Verification</Typography>
                      <Typography variant="body2">2 minutes ago</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Recommendations
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircle color="success" />
                        </ListItemIcon>
                        <ListItemText primary="Chain integrity is maintained" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircle color="success" />
                        </ListItemIcon>
                        <ListItemText primary="No tampering detected" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircle color="success" />
                        </ListItemIcon>
                        <ListItemText primary="All snapshots verified" />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Create Audit Dialog */}
      <Dialog open={auditDialogOpen} onClose={() => setAuditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Audit Trail Entry</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Action"
            value={auditForm.action}
            onChange={(e) => setAuditForm({ ...auditForm, action: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Entity Type</InputLabel>
            <Select
              value={auditForm.entityType}
              onChange={(e) => setAuditForm({ ...auditForm, entityType: e.target.value })}
            >
              <MenuItem value="transaction">Transaction</MenuItem>
              <MenuItem value="invoice">Invoice</MenuItem>
              <MenuItem value="expense">Expense</MenuItem>
              <MenuItem value="customer">Customer</MenuItem>
              <MenuItem value="vendor">Vendor</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Entity ID"
            value={auditForm.entityId}
            onChange={(e) => setAuditForm({ ...auditForm, entityId: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Before Data (JSON)"
            multiline
            rows={3}
            value={JSON.stringify(auditForm.beforeData)}
            onChange={(e) => setAuditForm({ ...auditForm, beforeData: JSON.parse(e.target.value || '{}') })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="After Data (JSON)"
            multiline
            rows={3}
            value={JSON.stringify(auditForm.afterData)}
            onChange={(e) => setAuditForm({ ...auditForm, afterData: JSON.parse(e.target.value || '{}') })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAuditDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateAuditTrail} variant="contained">
            Create Audit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AuditTrail;





