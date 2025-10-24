import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
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
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Badge,
  Tabs,
  Tab,
  Grid,
  Divider,
  Checkbox,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Assignment,
  Person,
  AttachMoney,
  TrendingUp,
  Warning,
  CheckCircle,
  Schedule,
  Group,
  Business,
  Timeline,
  Assessment,
  Settings,
  Visibility,
  VisibilityOff,
  ExpandMore,
  FilterList,
  Download,
  Send,
  Approve,
  Reject,
} from '@mui/icons-material';
import { format, differenceInDays, addDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

interface TimeEntry {
  id: string;
  projectId: string;
  projectName: string;
  task: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  isBillable: boolean;
  hourlyRate?: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface Timesheet {
  id: string;
  userId: string;
  userName: string;
  weekStart: Date;
  weekEnd: Date;
  totalHours: number;
  billableHours: number;
  totalAmount: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  entries: TimeEntry[];
  submittedAt?: Date;
  approvedAt?: Date;
  approvedBy?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TimesheetManagerProps {
  timesheets: Timesheet[];
  onTimesheetSubmit: (timesheet: Timesheet) => void;
  onTimesheetApprove: (id: string, approvedBy: string) => void;
  onTimesheetReject: (id: string, reason: string) => void;
  onTimeEntryUpdate: (timesheetId: string, entryId: string, updates: Partial<TimeEntry>) => void;
  onTimeEntryDelete: (timesheetId: string, entryId: string) => void;
}

const TimesheetManager: React.FC<TimesheetManagerProps> = ({
  timesheets,
  onTimesheetSubmit,
  onTimesheetApprove,
  onTimesheetReject,
  onTimeEntryUpdate,
  onTimeEntryDelete,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [showEntryDialog, setShowEntryDialog] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [selectedTimesheet, setSelectedTimesheet] = useState<Timesheet | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });
  
  // Form state
  const [formData, setFormData] = useState({
    projectId: '',
    projectName: '',
    task: '',
    description: '',
    startTime: '',
    endTime: '',
    duration: 0,
    isBillable: true,
    hourlyRate: 0,
    tags: [] as string[],
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      projectId: '',
      projectName: '',
      task: '',
      description: '',
      startTime: '',
      endTime: '',
      duration: 0,
      isBillable: true,
      hourlyRate: 0,
      tags: [],
    });
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!formData.projectId || !formData.task.trim()) {
      setSnackbar({ open: true, message: 'Please fill in required fields', severity: 'warning' });
      return;
    }

    const entryData = {
      ...formData,
      id: `entry_${Date.now()}`,
      startTime: new Date(formData.startTime),
      endTime: formData.endTime ? new Date(formData.endTime) : undefined,
      status: 'draft' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (editingEntry) {
      onTimeEntryUpdate(selectedTimesheet?.id || '', editingEntry.id, entryData);
      setSnackbar({ open: true, message: 'Time entry updated successfully', severity: 'success' });
    } else {
      // Add to current timesheet
      if (selectedTimesheet) {
        const updatedTimesheet = {
          ...selectedTimesheet,
          entries: [...selectedTimesheet.entries, entryData],
          totalHours: selectedTimesheet.totalHours + (formData.duration / 3600),
          billableHours: selectedTimesheet.billableHours + (formData.isBillable ? formData.duration / 3600 : 0),
          totalAmount: selectedTimesheet.totalAmount + (formData.isBillable ? (formData.duration / 3600) * formData.hourlyRate : 0),
        };
        onTimesheetSubmit(updatedTimesheet);
      }
      setSnackbar({ open: true, message: 'Time entry added successfully', severity: 'success' });
    }

    setShowEntryDialog(false);
    setEditingEntry(null);
    resetForm();
  };

  // Handle edit
  const handleEdit = (entry: TimeEntry, timesheet: Timesheet) => {
    setEditingEntry(entry);
    setSelectedTimesheet(timesheet);
    setFormData({
      projectId: entry.projectId,
      projectName: entry.projectName,
      task: entry.task,
      description: entry.description || '',
      startTime: format(entry.startTime, 'yyyy-MM-dd\'T\'HH:mm'),
      endTime: entry.endTime ? format(entry.endTime, 'yyyy-MM-dd\'T\'HH:mm') : '',
      duration: entry.duration,
      isBillable: entry.isBillable,
      hourlyRate: entry.hourlyRate || 0,
      tags: entry.tags,
    });
    setShowEntryDialog(true);
  };

  // Handle delete
  const handleDelete = (entryId: string, timesheetId: string) => {
    if (window.confirm('Are you sure you want to delete this time entry?')) {
      onTimeEntryDelete(timesheetId, entryId);
      setSnackbar({ open: true, message: 'Time entry deleted successfully', severity: 'success' });
    }
  };

  // Handle timesheet submission
  const handleTimesheetSubmit = (timesheet: Timesheet) => {
    const submittedTimesheet = {
      ...timesheet,
      status: 'submitted' as const,
      submittedAt: new Date(),
    };
    onTimesheetSubmit(submittedTimesheet);
    setSnackbar({ open: true, message: 'Timesheet submitted successfully', severity: 'success' });
  };

  // Handle approval
  const handleApproval = (timesheet: Timesheet, approvedBy: string) => {
    onTimesheetApprove(timesheet.id, approvedBy);
    setSnackbar({ open: true, message: 'Timesheet approved successfully', severity: 'success' });
  };

  // Handle rejection
  const handleRejection = (timesheet: Timesheet, reason: string) => {
    onTimesheetReject(timesheet.id, reason);
    setSnackbar({ open: true, message: 'Timesheet rejected', severity: 'info' });
  };

  // Get status color
  const getStatusColor = (status: Timesheet['status']): string => {
    switch (status) {
      case 'draft': return '#757575';
      case 'submitted': return '#2196f3';
      case 'approved': return '#4caf50';
      case 'rejected': return '#f44336';
      default: return '#757575';
    }
  };

  // Get status icon
  const getStatusIcon = (status: Timesheet['status']) => {
    switch (status) {
      case 'draft': return <Edit color="action" />;
      case 'submitted': return <Schedule color="primary" />;
      case 'approved': return <CheckCircle color="success" />;
      case 'rejected': return <Warning color="error" />;
      default: return <Assignment />;
    }
  };

  // Filter timesheets by status
  const getFilteredTimesheets = (status?: Timesheet['status']) => {
    if (!status) return timesheets;
    return timesheets.filter(timesheet => timesheet.status === status);
  };

  // Calculate timesheet metrics
  const getTimesheetMetrics = () => {
    const totalTimesheets = timesheets.length;
    const submittedTimesheets = getFilteredTimesheets('submitted').length;
    const approvedTimesheets = getFilteredTimesheets('approved').length;
    const totalHours = timesheets.reduce((sum, timesheet) => sum + timesheet.totalHours, 0);
    const totalAmount = timesheets.reduce((sum, timesheet) => sum + timesheet.totalAmount, 0);

    return {
      total: totalTimesheets,
      submitted: submittedTimesheets,
      approved: approvedTimesheets,
      totalHours,
      totalAmount,
    };
  };

  const metrics = getTimesheetMetrics();

  // Get current week timesheet
  const getCurrentWeekTimesheet = (): Timesheet | null => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 }); // Sunday

    return timesheets.find(timesheet => 
      timesheet.weekStart.getTime() === weekStart.getTime() &&
      timesheet.weekEnd.getTime() === weekEnd.getTime()
    ) || null;
  };

  const currentWeekTimesheet = getCurrentWeekTimesheet();

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Timesheet Manager
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={() => setSnackbar({ open: true, message: 'Export feature coming soon', severity: 'info' })}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setSelectedTimesheet(currentWeekTimesheet);
              setShowEntryDialog(true);
            }}
            sx={{ bgcolor: '#2196f3' }}
          >
            Add Entry
          </Button>
        </Box>
      </Box>

      {/* Metrics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Timesheets
                  </Typography>
                  <Typography variant="h4">
                    {metrics.total}
                  </Typography>
                </Box>
                <Assignment color="primary" sx={{ fontSize: 40 }} />
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
                    Submitted
                  </Typography>
                  <Typography variant="h4" color="primary.main">
                    {metrics.submitted}
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
                    Total Hours
                  </Typography>
                  <Typography variant="h4">
                    {metrics.totalHours.toFixed(1)}
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
                    Total Amount
                  </Typography>
                  <Typography variant="h4">
                    ${metrics.totalAmount.toFixed(2)}
                  </Typography>
                </Box>
                <AttachMoney color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Current Week Timesheet */}
      {currentWeekTimesheet && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Current Week: {format(currentWeekTimesheet.weekStart, 'MMM dd')} - {format(currentWeekTimesheet.weekEnd, 'MMM dd, yyyy')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {currentWeekTimesheet.status === 'draft' && (
                  <Button
                    variant="contained"
                    startIcon={<Send />}
                    onClick={() => handleTimesheetSubmit(currentWeekTimesheet)}
                    sx={{ bgcolor: '#2196f3' }}
                  >
                    Submit
                  </Button>
                )}
                {currentWeekTimesheet.status === 'submitted' && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      startIcon={<Approve />}
                      onClick={() => handleApproval(currentWeekTimesheet, 'Current User')}
                      sx={{ bgcolor: '#4caf50' }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Reject />}
                      onClick={() => handleRejection(currentWeekTimesheet, 'Please review and resubmit')}
                      color="error"
                    >
                      Reject
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  Total Hours
                </Typography>
                <Typography variant="h6">
                  {currentWeekTimesheet.totalHours.toFixed(1)}h
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  Billable Hours
                </Typography>
                <Typography variant="h6">
                  {currentWeekTimesheet.billableHours.toFixed(1)}h
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  Total Amount
                </Typography>
                <Typography variant="h6">
                  ${currentWeekTimesheet.totalAmount.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getStatusIcon(currentWeekTimesheet.status)}
                  <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                    {currentWeekTimesheet.status}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Entries Table */}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Project</TableCell>
                    <TableCell>Task</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Billable</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentWeekTimesheet.entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {entry.projectName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {entry.task}
                        </Typography>
                        {entry.description && (
                          <Typography variant="caption" color="text.secondary">
                            {entry.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {format(entry.startTime, 'MMM dd, yyyy')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(entry.startTime, 'HH:mm')} - {entry.endTime ? format(entry.endTime, 'HH:mm') : 'Ongoing'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {(entry.duration / 3600).toFixed(1)}h
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={entry.isBillable ? 'Yes' : 'No'}
                          size="small"
                          color={entry.isBillable ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          ${entry.isBillable && entry.hourlyRate ? ((entry.duration / 3600) * entry.hourlyRate).toFixed(2) : '$0.00'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => handleEdit(entry, currentWeekTimesheet)}>
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" onClick={() => handleDelete(entry.id, currentWeekTimesheet.id)} color="error">
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="All Timesheets" />
            <Tab label="Draft" />
            <Tab label="Submitted" />
            <Tab label="Approved" />
          </Tabs>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Week</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Hours</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Submitted</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getFilteredTimesheets(
                activeTab === 0 ? undefined : 
                activeTab === 1 ? 'draft' : 
                activeTab === 2 ? 'submitted' : 'approved'
              ).map((timesheet) => (
                <TableRow key={timesheet.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: '#2196f3', width: 32, height: 32 }}>
                        {timesheet.userName.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="body2">
                        {timesheet.userName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {format(timesheet.weekStart, 'MMM dd')} - {format(timesheet.weekEnd, 'MMM dd, yyyy')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getStatusIcon(timesheet.status)}
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {timesheet.status}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {timesheet.totalHours.toFixed(1)}h
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {timesheet.billableHours.toFixed(1)}h billable
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      ${timesheet.totalAmount.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {timesheet.submittedAt ? format(timesheet.submittedAt, 'MMM dd, yyyy') : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {timesheet.status === 'submitted' && (
                        <>
                          <Tooltip title="Approve">
                            <IconButton size="small" onClick={() => handleApproval(timesheet, 'Current User')} color="success">
                              <Approve fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton size="small" onClick={() => handleRejection(timesheet, 'Please review and resubmit')} color="error">
                              <Reject fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Entry Dialog */}
      <Dialog
        open={showEntryDialog}
        onClose={() => {
          setShowEntryDialog(false);
          setEditingEntry(null);
          resetForm();
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingEntry ? 'Edit Time Entry' : 'Add Time Entry'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Project</InputLabel>
                <Select
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value, projectName: e.target.value })}
                >
                  <MenuItem value="project1">Project Alpha</MenuItem>
                  <MenuItem value="project2">Project Beta</MenuItem>
                  <MenuItem value="project3">Project Gamma</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Task"
                value={formData.task}
                onChange={(e) => setFormData({ ...formData, task: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Time"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Time"
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Duration (hours)"
                type="number"
                value={formData.duration / 3600}
                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) * 3600 })}
                inputProps={{ step: 0.25, min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hourly Rate"
                type="number"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                InputProps={{ startAdornment: '$' }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isBillable}
                    onChange={(e) => setFormData({ ...formData, isBillable: e.target.checked })}
                  />
                }
                label="Billable"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowEntryDialog(false);
            setEditingEntry(null);
            resetForm();
          }}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingEntry ? 'Update' : 'Add'}
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

export default TimesheetManager;






