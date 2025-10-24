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
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Timer as TimerIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  PlaylistAdd as PlaylistAddIcon,
  AccountTree as AccountTreeIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  budget: number;
  hourlyRate: number;
  startDate: string;
  endDate?: string;
}

interface Task {
  id: string;
  projectId: string;
  name: string;
  status: string;
  priority: string;
  estimatedHours: number;
  actualHours: number;
}

interface TimeEntry {
  id: string;
  userId: string;
  projectId: string;
  taskId?: string;
  description: string;
  startTime: string;
  endTime?: string;
  duration: number;
  billable: boolean;
  hourlyRate: number;
  totalAmount: number;
  status: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

interface Timesheet {
  id: string;
  userId: string;
  weekStartDate: string;
  weekEndDate: string;
  totalHours: number;
  billableHours: number;
  status: string;
}

interface Resource {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  hourlyRate: number;
  skills: string[];
  status: string;
}

interface TimeTrackingAnalytics {
  totalHours: number;
  billableHours: number;
  totalRevenue: number;
  averageHourlyRate: number;
  productivityScore: number;
  topProjects: Array<{
    projectId: string;
    name: string;
    hours: number;
    revenue: number;
  }>;
  weeklyTrend: Array<{
    week: string;
    hours: number;
    revenue: number;
  }>;
  resourceUtilization: Array<{
    resourceId: string;
    name: string;
    utilization: number;
    hours: number;
  }>;
}

const EnhancedTimeTrackingDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [analytics, setAnalytics] = useState<TimeTrackingAnalytics | null>(null);
  const [currentTimeEntry, setCurrentTimeEntry] = useState<TimeEntry | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerDuration, setTimerDuration] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'project' | 'task' | 'time-entry' | 'resource'>('project');
  const [formData, setFormData] = useState<any>({});
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [idleDetection, setIdleDetection] = useState(false);

  // Mock data for demonstration
  const mockProjects: Project[] = [
    { id: '1', name: 'Website Redesign', description: 'Complete website overhaul', status: 'ACTIVE', budget: 50000, hourlyRate: 75, startDate: '2024-01-01', endDate: '2024-03-31' },
    { id: '2', name: 'Mobile App Development', description: 'iOS and Android app', status: 'ACTIVE', budget: 80000, hourlyRate: 100, startDate: '2024-02-01', endDate: '2024-06-30' },
    { id: '3', name: 'Database Migration', description: 'Legacy system migration', status: 'COMPLETED', budget: 25000, hourlyRate: 60, startDate: '2023-11-01', endDate: '2023-12-31' },
  ];

  const mockTasks: Task[] = [
    { id: '1', projectId: '1', name: 'UI Design', status: 'IN_PROGRESS', priority: 'HIGH', estimatedHours: 40, actualHours: 25 },
    { id: '2', projectId: '1', name: 'Frontend Development', status: 'PENDING', priority: 'MEDIUM', estimatedHours: 60, actualHours: 0 },
    { id: '3', projectId: '2', name: 'Backend API', status: 'IN_PROGRESS', priority: 'HIGH', estimatedHours: 80, actualHours: 45 },
  ];

  const mockTimeEntries: TimeEntry[] = [
    { id: '1', userId: 'user1', projectId: '1', taskId: '1', description: 'Working on UI design', startTime: '2024-01-15T09:00:00Z', endTime: '2024-01-15T17:00:00Z', duration: 480, billable: true, hourlyRate: 75, totalAmount: 600, status: 'COMPLETED' },
    { id: '2', userId: 'user1', projectId: '1', taskId: '1', description: 'UI design review', startTime: '2024-01-16T09:00:00Z', endTime: '2024-01-16T12:00:00Z', duration: 180, billable: true, hourlyRate: 75, totalAmount: 225, status: 'COMPLETED' },
  ];

  const mockTimesheets: Timesheet[] = [
    { id: '1', userId: 'user1', weekStartDate: '2024-01-15', weekEndDate: '2024-01-21', totalHours: 40, billableHours: 35, status: 'APPROVED' },
    { id: '2', userId: 'user1', weekStartDate: '2024-01-22', weekEndDate: '2024-01-28', totalHours: 38, billableHours: 32, status: 'SUBMITTED' },
  ];

  const mockResources: Resource[] = [
    { id: '1', userId: 'user1', name: 'John Doe', email: 'john@example.com', role: 'Developer', hourlyRate: 75, skills: ['React', 'Node.js', 'TypeScript'], status: 'ACTIVE' },
    { id: '2', userId: 'user2', name: 'Jane Smith', email: 'jane@example.com', role: 'Designer', hourlyRate: 65, skills: ['UI/UX', 'Figma', 'Adobe Creative Suite'], status: 'ACTIVE' },
  ];

  const mockAnalytics: TimeTrackingAnalytics = {
    totalHours: 320,
    billableHours: 280,
    totalRevenue: 21000,
    averageHourlyRate: 75,
    productivityScore: 87.5,
    topProjects: [
      { projectId: '1', name: 'Website Redesign', hours: 120, revenue: 9000 },
      { projectId: '2', name: 'Mobile App Development', hours: 200, revenue: 12000 },
    ],
    weeklyTrend: [
      { week: '2024-01-15', hours: 40, revenue: 3000 },
      { week: '2024-01-22', hours: 38, revenue: 2850 },
      { week: '2024-01-29', hours: 42, revenue: 3150 },
    ],
    resourceUtilization: [
      { resourceId: '1', name: 'John Doe', utilization: 95, hours: 38 },
      { resourceId: '2', name: 'Jane Smith', utilization: 88, hours: 35 },
    ],
  };

  useEffect(() => {
    loadData();
    startTimer();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProjects(mockProjects);
      setTasks(mockTasks);
      setTimeEntries(mockTimeEntries);
      setTimesheets(mockTimesheets);
      setResources(mockResources);
      setAnalytics(mockAnalytics);
    } catch (err) {
      setError('Failed to load time tracking data');
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
    const interval = setInterval(() => {
      if (timerRunning) {
        setTimerDuration(prev => prev + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleStartTimer = async () => {
    try {
      if (!selectedProject) {
        setError('Please select a project first');
        return;
      }

      const timeEntry = {
        userId: 'user1',
        projectId: selectedProject.id,
        taskId: selectedTask?.id,
        description: formData.description || 'Time tracking entry',
        startTime: new Date().toISOString(),
        billable: true,
        hourlyRate: selectedProject.hourlyRate,
      };

      setCurrentTimeEntry(timeEntry as TimeEntry);
      setTimerRunning(true);
      setTimerDuration(0);
    } catch (err) {
      setError('Failed to start timer');
    }
  };

  const handleStopTimer = async () => {
    try {
      if (currentTimeEntry) {
        const endTime = new Date();
        const duration = Math.floor((endTime.getTime() - new Date(currentTimeEntry.startTime).getTime()) / (1000 * 60));
        const totalAmount = (duration / 60) * currentTimeEntry.hourlyRate;

        const updatedEntry = {
          ...currentTimeEntry,
          endTime: endTime.toISOString(),
          duration,
          totalAmount,
          status: 'COMPLETED',
        };

        setTimeEntries(prev => [updatedEntry, ...prev]);
        setCurrentTimeEntry(null);
        setTimerRunning(false);
        setTimerDuration(0);
      }
    } catch (err) {
      setError('Failed to stop timer');
    }
  };

  const handlePauseTimer = () => {
    setTimerRunning(false);
  };

  const handleResumeTimer = () => {
    setTimerRunning(true);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOpenDialog = (type: 'project' | 'task' | 'time-entry' | 'resource', item?: any) => {
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
      case 'IN_PROGRESS': return 'warning';
      case 'PENDING': return 'default';
      case 'APPROVED': return 'success';
      case 'SUBMITTED': return 'info';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'error';
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'info';
      case 'LOW': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading time tracking data...</Typography>
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
          Enhanced Time Tracking
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
            onClick={() => handleOpenDialog('project')}
          >
            Add Project
          </Button>
        </Box>
      </Box>

      {/* Timer Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Active Timer</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <FormControlLabel
                control={<Switch checked={gpsEnabled} onChange={(e) => setGpsEnabled(e.target.checked)} />}
                label="GPS Tracking"
              />
              <FormControlLabel
                control={<Switch checked={idleDetection} onChange={(e) => setIdleDetection(e.target.checked)} />}
                label="Idle Detection"
              />
            </Box>
          </Box>
          
          {currentTimeEntry ? (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ mb: 2, fontFamily: 'monospace' }}>
                {formatTime(timerDuration)}
              </Typography>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {selectedProject?.name} - {selectedTask?.name || 'General'}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                {timerRunning ? (
                  <Button
                    variant="outlined"
                    startIcon={<PauseIcon />}
                    onClick={handlePauseTimer}
                    color="warning"
                  >
                    Pause
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    startIcon={<PlayIcon />}
                    onClick={handleResumeTimer}
                    color="success"
                  >
                    Resume
                  </Button>
                )}
                <Button
                  variant="contained"
                  startIcon={<StopIcon />}
                  onClick={handleStopTimer}
                  color="error"
                >
                  Stop
                </Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Start a new time entry
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Project</InputLabel>
                  <Select
                    value={selectedProject?.id || ''}
                    onChange={(e) => setSelectedProject(projects.find(p => p.id === e.target.value) || null)}
                  >
                    {projects.map(project => (
                      <MenuItem key={project.id} value={project.id}>
                        {project.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Task</InputLabel>
                  <Select
                    value={selectedTask?.id || ''}
                    onChange={(e) => setSelectedTask(tasks.find(t => t.id === e.target.value) || null)}
                  >
                    <MenuItem value="">General</MenuItem>
                    {tasks.filter(task => task.projectId === selectedProject?.id).map(task => (
                      <MenuItem key={task.id} value={task.id}>
                        {task.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <TextField
                fullWidth
                label="Description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                sx={{ mb: 2, maxWidth: 400 }}
              />
              <Button
                variant="contained"
                startIcon={<PlayIcon />}
                onClick={handleStartTimer}
                disabled={!selectedProject}
                size="large"
              >
                Start Timer
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Analytics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TimerIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Hours
                  </Typography>
                  <Typography variant="h4">
                    {analytics?.totalHours || 0}
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
                <TrendingUpIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Billable Hours
                  </Typography>
                  <Typography variant="h4">
                    {analytics?.billableHours || 0}
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
                <AssignmentIcon color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h4">
                    ${analytics?.totalRevenue?.toLocaleString() || 0}
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
                <AssessmentIcon color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Productivity
                  </Typography>
                  <Typography variant="h4">
                    {analytics?.productivityScore?.toFixed(1) || 0}%
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
            <Tab label="Projects" />
            <Tab label="Tasks" />
            <Tab label="Time Entries" />
            <Tab label="Timesheets" />
            <Tab label="Resources" />
            <Tab label="Analytics" />
          </Tabs>
        </Box>

        <CardContent>
          {/* Projects Tab */}
          {activeTab === 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Projects</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('project')}
                >
                  Add Project
                </Button>
              </Box>

              <Grid container spacing={2}>
                {projects.map((project) => (
                  <Grid item xs={12} sm={6} md={4} key={project.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">{project.name}</Typography>
                          <Chip
                            label={project.status}
                            color={getStatusColor(project.status) as any}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {project.description}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Budget: ${project.budget.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Rate: ${project.hourlyRate}/hour
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

          {/* Tasks Tab */}
          {activeTab === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Tasks</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('task')}
                >
                  Add Task
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Task</TableCell>
                      <TableCell>Project</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Estimated Hours</TableCell>
                      <TableCell>Actual Hours</TableCell>
                      <TableCell>Progress</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tasks.map((task) => {
                      const project = projects.find(p => p.id === task.projectId);
                      const progress = task.estimatedHours > 0 ? (task.actualHours / task.estimatedHours) * 100 : 0;
                      
                      return (
                        <TableRow key={task.id}>
                          <TableCell>{task.name}</TableCell>
                          <TableCell>{project?.name || 'Unknown'}</TableCell>
                          <TableCell>
                            <Chip
                              label={task.priority}
                              color={getPriorityColor(task.priority) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={task.status}
                              color={getStatusColor(task.status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{task.estimatedHours}h</TableCell>
                          <TableCell>{task.actualHours}h</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={Math.min(progress, 100)}
                                sx={{ flexGrow: 1 }}
                              />
                              <Typography variant="body2">
                                {progress.toFixed(1)}%
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <IconButton size="small" onClick={() => handleOpenDialog('task', task)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton size="small">
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Time Entries Tab */}
          {activeTab === 2 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Time Entries</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('time-entry')}
                >
                  Add Entry
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Description</TableCell>
                      <TableCell>Project</TableCell>
                      <TableCell>Start Time</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Billable</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {timeEntries.map((entry) => {
                      const project = projects.find(p => p.id === entry.projectId);
                      const durationHours = (entry.duration / 60).toFixed(1);
                      
                      return (
                        <TableRow key={entry.id}>
                          <TableCell>{entry.description}</TableCell>
                          <TableCell>{project?.name || 'Unknown'}</TableCell>
                          <TableCell>{new Date(entry.startTime).toLocaleString()}</TableCell>
                          <TableCell>{durationHours}h</TableCell>
                          <TableCell>
                            <Chip
                              label={entry.billable ? 'Yes' : 'No'}
                              color={entry.billable ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>${entry.totalAmount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Chip
                              label={entry.status}
                              color={getStatusColor(entry.status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton size="small">
                              <EditIcon />
                            </IconButton>
                            <IconButton size="small">
                              <ViewIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Timesheets Tab */}
          {activeTab === 3 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Timesheets</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                >
                  Create Timesheet
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Week</TableCell>
                      <TableCell>Total Hours</TableCell>
                      <TableCell>Billable Hours</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {timesheets.map((timesheet) => (
                      <TableRow key={timesheet.id}>
                        <TableCell>
                          {new Date(timesheet.weekStartDate).toLocaleDateString()} - {new Date(timesheet.weekEndDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{timesheet.totalHours}h</TableCell>
                        <TableCell>{timesheet.billableHours}h</TableCell>
                        <TableCell>
                          <Chip
                            label={timesheet.status}
                            color={getStatusColor(timesheet.status) as any}
                            size="small"
                          />
                        </TableCell>
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

          {/* Resources Tab */}
          {activeTab === 4 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Resources</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('resource')}
                >
                  Add Resource
                </Button>
              </Box>

              <Grid container spacing={2}>
                {resources.map((resource) => (
                  <Grid item xs={12} sm={6} md={4} key={resource.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">{resource.name}</Typography>
                          <Chip
                            label={resource.status}
                            color={getStatusColor(resource.status) as any}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {resource.email}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {resource.role} - ${resource.hourlyRate}/hour
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          {resource.skills.map((skill, index) => (
                            <Chip
                              key={index}
                              label={skill}
                              size="small"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </Box>
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

          {/* Analytics Tab */}
          {activeTab === 5 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3 }}>Time Tracking Analytics</Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Weekly Trend</Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={analytics?.weeklyTrend || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="week" />
                          <YAxis />
                          <RechartsTooltip />
                          <Area type="monotone" dataKey="hours" stackId="1" stroke="#8884d8" fill="#8884d8" />
                          <Area type="monotone" dataKey="revenue" stackId="2" stroke="#82ca9d" fill="#82ca9d" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Top Projects</Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics?.topProjects || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey="hours" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Resource Utilization</Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics?.resourceUtilization || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey="utilization" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Productivity Metrics</Typography>
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <CircularProgress
                          variant="determinate"
                          value={analytics?.productivityScore || 0}
                          size={120}
                          thickness={4}
                          sx={{ mb: 2 }}
                        />
                        <Typography variant="h4" gutterBottom>
                          {analytics?.productivityScore?.toFixed(1) || 0}%
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                          Productivity Score
                        </Typography>
                      </Box>
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
          {dialogType === 'project' ? 'Add/Edit Project' :
           dialogType === 'task' ? 'Add/Edit Task' :
           dialogType === 'time-entry' ? 'Add/Edit Time Entry' :
           'Add/Edit Resource'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {dialogType === 'project' && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Project Name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Budget"
                    type="number"
                    value={formData.budget || ''}
                    onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Hourly Rate"
                    type="number"
                    value={formData.hourlyRate || ''}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) })}
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
                      <MenuItem value="COMPLETED">Completed</MenuItem>
                      <MenuItem value="ON_HOLD">On Hold</MenuItem>
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

            {dialogType === 'task' && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Task Name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Project</InputLabel>
                    <Select
                      value={formData.projectId || ''}
                      onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    >
                      {projects.map(project => (
                        <MenuItem key={project.id} value={project.id}>
                          {project.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Estimated Hours"
                    type="number"
                    value={formData.estimatedHours || ''}
                    onChange={(e) => setFormData({ ...formData, estimatedHours: parseFloat(e.target.value) })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={formData.priority || 'MEDIUM'}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    >
                      <MenuItem value="LOW">Low</MenuItem>
                      <MenuItem value="MEDIUM">Medium</MenuItem>
                      <MenuItem value="HIGH">High</MenuItem>
                      <MenuItem value="URGENT">Urgent</MenuItem>
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

            {dialogType === 'resource' && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Role"
                    value={formData.role || ''}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Hourly Rate"
                    type="number"
                    value={formData.hourlyRate || ''}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Skills (comma-separated)"
                    value={formData.skills?.join(', ') || ''}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value.split(',').map(s => s.trim()) })}
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
        aria-label="start timer"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => handleOpenDialog('time-entry')}
      >
        <PlayIcon />
      </Fab>
    </Box>
  );
};

export default EnhancedTimeTrackingDashboard;



