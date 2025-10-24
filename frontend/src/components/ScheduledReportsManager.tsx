import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
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
  Chip,
  Grid,
  Paper,
  Divider,
  Alert,
  Snackbar,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  LinearProgress,
  Badge,
} from '@mui/material';
import {
  Schedule,
  Add,
  Edit,
  Delete,
  PlayArrow,
  Pause,
  Stop,
  Visibility,
  Download,
  Email,
  Refresh,
  Settings,
  ExpandMore,
  CheckCircle,
  Error,
  Warning,
  Info,
  CalendarToday,
  AccessTime,
  People,
  AttachFile,
} from '@mui/icons-material';
import { format, differenceInDays, addDays, startOfWeek, endOfWeek } from 'date-fns';

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

interface ScheduledReportsManagerProps {
  scheduledReports: ScheduledReport[];
  deliveries: ReportDelivery[];
  history: ReportHistory[];
  onReportCreate: (report: Omit<ScheduledReport, 'id' | 'createdAt' | 'updatedAt' | 'lastRun' | 'nextRun'>) => void;
  onReportUpdate: (id: string, updates: Partial<ScheduledReport>) => void;
  onReportDelete: (id: string) => void;
  onReportPause: (id: string) => void;
  onReportResume: (id: string) => void;
  onReportExecute: (id: string) => void;
  onDeliveryRetry: (id: string) => void;
}

const ScheduledReportsManager: React.FC<ScheduledReportsManagerProps> = ({
  scheduledReports,
  deliveries,
  history,
  onReportCreate,
  onReportUpdate,
  onReportDelete,
  onReportPause,
  onReportResume,
  onReportExecute,
  onDeliveryRetry,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [editingReport, setEditingReport] = useState<ScheduledReport | null>(null);
  const [selectedReport, setSelectedReport] = useState<ScheduledReport | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });
  
  // Form state
  const [reportForm, setReportForm] = useState({
    name: '',
    description: '',
    templateId: '',
    schedule: {
      frequency: 'weekly' as ScheduledReport['schedule']['frequency'],
      time: '09:00',
      dayOfWeek: 1,
      dayOfMonth: 1,
      month: 0,
    },
    recipients: [] as ScheduledReport['recipients'],
    parameters: {} as Record<string, any>,
    isActive: true,
  });

  const [recipientForm, setRecipientForm] = useState({
    email: '',
    name: '',
    format: 'pdf' as 'pdf' | 'excel' | 'csv' | 'json',
  });

  // Handle report operations
  const handleCreateReport = () => {
    setEditingReport(null);
    setReportForm({
      name: '',
      description: '',
      templateId: '',
      schedule: {
        frequency: 'weekly',
        time: '09:00',
        dayOfWeek: 1,
        dayOfMonth: 1,
        month: 0,
      },
      recipients: [],
      parameters: {},
      isActive: true,
    });
    setShowReportDialog(true);
  };

  const handleEditReport = (report: ScheduledReport) => {
    setEditingReport(report);
    setReportForm({
      name: report.name,
      description: report.description,
      templateId: report.templateId,
      schedule: report.schedule,
      recipients: report.recipients,
      parameters: report.parameters,
      isActive: report.isActive,
    });
    setShowReportDialog(true);
  };

  const handleSaveReport = () => {
    if (!reportForm.name || !reportForm.description || !reportForm.templateId) {
      setSnackbar({ open: true, message: 'Please fill in required fields', severity: 'warning' });
      return;
    }

    if (reportForm.recipients.length === 0) {
      setSnackbar({ open: true, message: 'Please add at least one recipient', severity: 'warning' });
      return;
    }

    if (editingReport) {
      onReportUpdate(editingReport.id, reportForm);
      setSnackbar({ open: true, message: 'Report updated successfully', severity: 'success' });
    } else {
      onReportCreate(reportForm);
      setSnackbar({ open: true, message: 'Report created successfully', severity: 'success' });
    }

    setShowReportDialog(false);
  };

  const handleDeleteReport = (report: ScheduledReport) => {
    if (window.confirm(`Are you sure you want to delete "${report.name}"?`)) {
      onReportDelete(report.id);
      setSnackbar({ open: true, message: 'Report deleted successfully', severity: 'success' });
    }
  };

  const handlePauseReport = (report: ScheduledReport) => {
    onReportPause(report.id);
    setSnackbar({ open: true, message: 'Report paused successfully', severity: 'success' });
  };

  const handleResumeReport = (report: ScheduledReport) => {
    onReportResume(report.id);
    setSnackbar({ open: true, message: 'Report resumed successfully', severity: 'success' });
  };

  const handleExecuteReport = (report: ScheduledReport) => {
    onReportExecute(report.id);
    setSnackbar({ open: true, message: 'Report execution started', severity: 'info' });
  };

  // Handle recipient operations
  const handleAddRecipient = () => {
    if (!recipientForm.email || !recipientForm.name) {
      setSnackbar({ open: true, message: 'Please fill in recipient details', severity: 'warning' });
      return;
    }

    setReportForm(prev => ({
      ...prev,
      recipients: [...prev.recipients, { ...recipientForm }],
    }));

    setRecipientForm({
      email: '',
      name: '',
      format: 'pdf',
    });
  };

  const handleRemoveRecipient = (index: number) => {
    setReportForm(prev => ({
      ...prev,
      recipients: prev.recipients.filter((_, i) => i !== index),
    }));
  };

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'success': return '#4caf50';
      case 'failed': return '#f44336';
      case 'processing': return '#ff9800';
      case 'pending': return '#2196f3';
      default: return '#757575';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle color="success" />;
      case 'failed': return <Error color="error" />;
      case 'processing': return <Refresh color="warning" />;
      case 'pending': return <Schedule color="info" />;
      default: return <Info />;
    }
  };

  // Get frequency label
  const getFrequencyLabel = (frequency: ScheduledReport['schedule']['frequency']): string => {
    const labels: Record<ScheduledReport['schedule']['frequency'], string> = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      yearly: 'Yearly',
    };
    return labels[frequency];
  };

  // Get format icon
  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return <AttachFile />;
      case 'excel': return <AttachFile />;
      case 'csv': return <AttachFile />;
      case 'json': return <AttachFile />;
      default: return <AttachFile />;
    }
  };

  // Get report statistics
  const getReportStats = (reportId: string) => {
    const reportHistory = history.filter(h => h.scheduledReportId === reportId);
    const totalDeliveries = reportHistory.length;
    const successfulDeliveries = reportHistory.filter(h => h.status === 'success').length;
    const failedDeliveries = reportHistory.filter(h => h.status === 'failed').length;
    const successRate = totalDeliveries > 0 ? (successfulDeliveries / totalDeliveries) * 100 : 0;

    return {
      totalDeliveries,
      successfulDeliveries,
      failedDeliveries,
      successRate,
    };
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Scheduled Reports
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => setSnackbar({ open: true, message: 'Refreshing data...', severity: 'info' })}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateReport}
          >
            Create Report
          </Button>
        </Box>
      </Box>

      {/* Report Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {scheduledReports.map((report) => {
          const stats = getReportStats(report.id);
          return (
            <Grid item xs={12} sm={6} md={4} key={report.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Schedule color="primary" />
                      <Typography variant="h6">
                        {report.name}
                      </Typography>
                    </Box>
                    <Chip
                      label={report.isActive ? 'Active' : 'Paused'}
                      size="small"
                      color={report.isActive ? 'success' : 'default'}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {report.description}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Frequency: {getFrequencyLabel(report.schedule.frequency)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Time: {report.schedule.time}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Recipients: {report.recipients.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Success Rate: {stats.successRate.toFixed(1)}%
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      startIcon={report.isActive ? <Pause /> : <PlayArrow />}
                      onClick={() => report.isActive ? handlePauseReport(report) : handleResumeReport(report)}
                    >
                      {report.isActive ? 'Pause' : 'Resume'}
                    </Button>
                    <Button
                      size="small"
                      startIcon={<PlayArrow />}
                      onClick={() => handleExecuteReport(report)}
                    >
                      Run Now
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => handleEditReport(report)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => handleDeleteReport(report)}
                    >
                      Delete
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="All Reports" />
            <Tab label="Active Deliveries" />
            <Tab label="History" />
            <Tab label="Statistics" />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {/* All Reports Tab */}
          {activeTab === 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Report Name</TableCell>
                    <TableCell>Schedule</TableCell>
                    <TableCell>Recipients</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Run</TableCell>
                    <TableCell>Next Run</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {scheduledReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {report.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {report.description}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {getFrequencyLabel(report.schedule.frequency)} at {report.schedule.time}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {report.recipients.length} recipients
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={report.isActive ? 'Active' : 'Paused'}
                          size="small"
                          color={report.isActive ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {report.lastRun ? format(report.lastRun, 'MMM dd, yyyy HH:mm') : 'Never'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {report.nextRun ? format(report.nextRun, 'MMM dd, yyyy HH:mm') : 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => {
                              setSelectedReport(report);
                              setShowHistoryDialog(true);
                            }}>
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => handleEditReport(report)}>
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Run Now">
                            <IconButton size="small" onClick={() => handleExecuteReport(report)}>
                              <PlayArrow fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Active Deliveries Tab */}
          {activeTab === 1 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Report</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Recipients</TableCell>
                    <TableCell>Format</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {deliveries.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell>
                        <Typography variant="body2">
                          {scheduledReports.find(r => r.id === delivery.scheduledReportId)?.name || 'Unknown'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getStatusIcon(delivery.status)}
                          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                            {delivery.status}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {delivery.recipients.length} recipients
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getFormatIcon(delivery.format)}
                          <Typography variant="body2">
                            {delivery.format.toUpperCase()}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {format(delivery.createdAt, 'MMM dd, yyyy HH:mm')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {delivery.status === 'failed' && (
                            <Tooltip title="Retry">
                              <IconButton size="small" onClick={() => onDeliveryRetry(delivery.id)}>
                                <Refresh fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* History Tab */}
          {activeTab === 2 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Report</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Recipients</TableCell>
                    <TableCell>Format</TableCell>
                    <TableCell>File Size</TableCell>
                    <TableCell>Sent At</TableCell>
                    <TableCell>Error</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <Typography variant="body2">
                          {scheduledReports.find(r => r.id === entry.scheduledReportId)?.name || 'Unknown'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getStatusIcon(entry.status)}
                          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                            {entry.status}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {entry.recipients.length} recipients
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {entry.format.toUpperCase()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {entry.fileSize ? `${(entry.fileSize / 1024).toFixed(1)} KB` : 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {format(entry.sentAt, 'MMM dd, yyyy HH:mm')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="error">
                          {entry.error || 'N/A'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Statistics Tab */}
          {activeTab === 3 && (
            <Grid container spacing={2}>
              {scheduledReports.map((report) => {
                const stats = getReportStats(report.id);
                return (
                  <Grid item xs={12} sm={6} md={4} key={report.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {report.name}
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Total Deliveries: {stats.totalDeliveries}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Successful: {stats.successfulDeliveries}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Failed: {stats.failedDeliveries}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Success Rate: {stats.successRate.toFixed(1)}%
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={stats.successRate}
                            sx={{ mt: 1 }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      </Card>

      {/* Report Dialog */}
      <Dialog
        open={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingReport ? 'Edit Scheduled Report' : 'Create Scheduled Report'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Report Name"
                  value={reportForm.name}
                  onChange={(e) => setReportForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Template ID"
                  value={reportForm.templateId}
                  onChange={(e) => setReportForm(prev => ({ ...prev, templateId: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={reportForm.description}
                  onChange={(e) => setReportForm(prev => ({ ...prev, description: e.target.value }))}
                  multiline
                  rows={2}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Frequency</InputLabel>
                  <Select
                    value={reportForm.schedule.frequency}
                    onChange={(e) => setReportForm(prev => ({ 
                      ...prev, 
                      schedule: { ...prev.schedule, frequency: e.target.value as ScheduledReport['schedule']['frequency'] }
                    }))}
                  >
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="quarterly">Quarterly</MenuItem>
                    <MenuItem value="yearly">Yearly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Time (HH:MM)"
                  value={reportForm.schedule.time}
                  onChange={(e) => setReportForm(prev => ({ 
                    ...prev, 
                    schedule: { ...prev.schedule, time: e.target.value }
                  }))}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Recipients
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    label="Email"
                    value={recipientForm.email}
                    onChange={(e) => setRecipientForm(prev => ({ ...prev, email: e.target.value }))}
                    size="small"
                  />
                  <TextField
                    label="Name"
                    value={recipientForm.name}
                    onChange={(e) => setRecipientForm(prev => ({ ...prev, name: e.target.value }))}
                    size="small"
                  />
                  <FormControl size="small">
                    <InputLabel>Format</InputLabel>
                    <Select
                      value={recipientForm.format}
                      onChange={(e) => setRecipientForm(prev => ({ ...prev, format: e.target.value as 'pdf' | 'excel' | 'csv' | 'json' }))}
                    >
                      <MenuItem value="pdf">PDF</MenuItem>
                      <MenuItem value="excel">Excel</MenuItem>
                      <MenuItem value="csv">CSV</MenuItem>
                      <MenuItem value="json">JSON</MenuItem>
                    </Select>
                  </FormControl>
                  <Button variant="outlined" onClick={handleAddRecipient}>
                    Add
                  </Button>
                </Box>
                <List>
                  {reportForm.recipients.map((recipient, index) => (
                    <ListItem key={index} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                      <ListItemText
                        primary={recipient.name}
                        secondary={`${recipient.email} - ${recipient.format.toUpperCase()}`}
                      />
                      <IconButton size="small" onClick={() => handleRemoveRecipient(index)} color="error">
                        <Delete />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={reportForm.isActive}
                      onChange={(e) => setReportForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    />
                  }
                  label="Active"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReportDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveReport} variant="contained">
            {editingReport ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* History Dialog */}
      <Dialog
        open={showHistoryDialog}
        onClose={() => setShowHistoryDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Report History - {selectedReport?.name}
        </DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Report Details
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Name: {selectedReport.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Description: {selectedReport.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Schedule: {getFrequencyLabel(selectedReport.schedule.frequency)} at {selectedReport.schedule.time}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Recipients: {selectedReport.recipients.length}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                History
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Status</TableCell>
                      <TableCell>Recipients</TableCell>
                      <TableCell>Format</TableCell>
                      <TableCell>File Size</TableCell>
                      <TableCell>Sent At</TableCell>
                      <TableCell>Error</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {history.filter(h => h.scheduledReportId === selectedReport.id).map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getStatusIcon(entry.status)}
                            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                              {entry.status}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {entry.recipients.length} recipients
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {entry.format.toUpperCase()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {entry.fileSize ? `${(entry.fileSize / 1024).toFixed(1)} KB` : 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {format(entry.sentAt, 'MMM dd, yyyy HH:mm')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="error">
                            {entry.error || 'N/A'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHistoryDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

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
    </Box>
  );
};

export default ScheduledReportsManager;







