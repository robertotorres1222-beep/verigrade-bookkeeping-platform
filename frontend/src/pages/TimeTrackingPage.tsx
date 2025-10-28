import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Tooltip,
  Fab,
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
  Chip,
  Avatar,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  Timer,
  Assignment,
  Assessment,
  TrendingUp,
  Add,
  Settings,
  Refresh,
  Download,
  FilterList,
  ViewList,
  ViewModule,
  Schedule,
  AttachMoney,
  Group,
  Business,
  Timeline,
  CheckCircle,
  Warning,
  Pause,
  PlayArrow,
  Stop,
} from '@mui/icons-material';
import { format, differenceInDays, addDays, startOfWeek, endOfWeek } from 'date-fns';

// Import components
import TimeTracker from '../components/TimeTracker';
import ProjectManager from '../components/ProjectManager';
import TimesheetManager from '../components/TimesheetManager';
import ProjectAnalytics from '../components/ProjectAnalytics';

interface Project {
  id: string;
  name: string;
  client: string;
  description: string;
  hourlyRate: number;
  budget: number;
  spent: number;
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'on-hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  teamMembers: string[];
  tags: string[];
  color: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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

const TimeTrackingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [projects, setProjects] = useState<Project[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });

  // Initialize with sample data
  useEffect(() => {
    const sampleProjects: Project[] = [
      {
        id: 'project1',
        name: 'Website Redesign',
        client: 'Acme Corp',
        description: 'Complete redesign of company website',
        hourlyRate: 75,
        budget: 15000,
        spent: 8500,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-31'),
        status: 'active',
        priority: 'high',
        teamMembers: ['John Doe', 'Jane Smith'],
        tags: ['web', 'design'],
        color: '#2196f3',
        isPublic: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      },
      {
        id: 'project2',
        name: 'Mobile App Development',
        client: 'TechStart Inc',
        description: 'iOS and Android app development',
        hourlyRate: 100,
        budget: 25000,
        spent: 12000,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-06-30'),
        status: 'active',
        priority: 'urgent',
        teamMembers: ['Mike Johnson', 'Sarah Wilson'],
        tags: ['mobile', 'development'],
        color: '#4caf50',
        isPublic: true,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date(),
      },
      {
        id: 'project3',
        name: 'E-commerce Platform',
        client: 'Retail Plus',
        description: 'Online store development',
        hourlyRate: 90,
        budget: 20000,
        spent: 20000,
        startDate: new Date('2023-10-01'),
        endDate: new Date('2024-01-31'),
        status: 'completed',
        priority: 'medium',
        teamMembers: ['Alex Brown', 'Lisa Davis'],
        tags: ['ecommerce', 'web'],
        color: '#ff9800',
        isPublic: true,
        createdAt: new Date('2023-10-01'),
        updatedAt: new Date(),
      },
    ];

    const sampleTimeEntries: TimeEntry[] = [
      {
        id: 'entry1',
        projectId: 'project1',
        projectName: 'Website Redesign',
        task: 'Homepage design',
        description: 'Creating new homepage layout',
        startTime: new Date('2024-01-15T09:00:00'),
        endTime: new Date('2024-01-15T17:00:00'),
        duration: 28800, // 8 hours
        isBillable: true,
        hourlyRate: 75,
        status: 'approved',
        tags: ['design', 'frontend'],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: 'entry2',
        projectId: 'project2',
        projectName: 'Mobile App Development',
        task: 'API integration',
        description: 'Connecting app to backend services',
        startTime: new Date('2024-02-10T10:00:00'),
        endTime: new Date('2024-02-10T18:00:00'),
        duration: 28800, // 8 hours
        isBillable: true,
        hourlyRate: 100,
        status: 'approved',
        tags: ['development', 'backend'],
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-02-10'),
      },
    ];

    const sampleTimesheets: Timesheet[] = [
      {
        id: 'timesheet1',
        userId: 'user1',
        userName: 'John Doe',
        weekStart: startOfWeek(new Date(), { weekStartsOn: 1 }),
        weekEnd: endOfWeek(new Date(), { weekStartsOn: 1 }),
        totalHours: 40,
        billableHours: 35,
        totalAmount: 2625,
        status: 'draft',
        entries: sampleTimeEntries,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    setProjects(sampleProjects);
    setTimeEntries(sampleTimeEntries);
    setTimesheets(sampleTimesheets);
  }, []);

  // Handle project creation
  const handleProjectCreate = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProject: Project = {
      ...projectData,
      id: `project_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setProjects(prev => [...prev, newProject]);
    setSnackbar({ open: true, message: 'Project created successfully', severity: 'success' });
  };

  // Handle project update
  const handleProjectUpdate = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(project => 
      project.id === id 
        ? { ...project, ...updates, updatedAt: new Date() }
        : project
    ));
    setSnackbar({ open: true, message: 'Project updated successfully', severity: 'success' });
  };

  // Handle project deletion
  const handleProjectDelete = (id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id));
    setSnackbar({ open: true, message: 'Project deleted successfully', severity: 'success' });
  };

  // Handle time entry save
  const handleTimeEntrySave = (entry: TimeEntry) => {
    setTimeEntries(prev => [...prev, entry]);
    setSnackbar({ open: true, message: 'Time entry saved successfully', severity: 'success' });
  };

  // Handle time entry update
  const handleTimeEntryUpdate = (entry: TimeEntry) => {
    setTimeEntries(prev => prev.map(e => e.id === entry.id ? entry : e));
    setSnackbar({ open: true, message: 'Time entry updated successfully', severity: 'success' });
  };

  // Handle time entry deletion
  const handleTimeEntryDelete = (id: string) => {
    setTimeEntries(prev => prev.filter(entry => entry.id !== id));
    setSnackbar({ open: true, message: 'Time entry deleted successfully', severity: 'success' });
  };

  // Handle timesheet submission
  const handleTimesheetSubmit = (timesheet: Timesheet) => {
    setTimesheets(prev => prev.map(t => t.id === timesheet.id ? timesheet : t));
    setSnackbar({ open: true, message: 'Timesheet submitted successfully', severity: 'success' });
  };

  // Handle timesheet approval
  const handleTimesheetApprove = (id: string, approvedBy: string) => {
    setTimesheets(prev => prev.map(t => 
      t.id === id 
        ? { ...t, status: 'approved', approvedAt: new Date(), approvedBy }
        : t
    ));
    setSnackbar({ open: true, message: 'Timesheet approved successfully', severity: 'success' });
  };

  // Handle timesheet rejection
  const handleTimesheetReject = (id: string, reason: string) => {
    setTimesheets(prev => prev.map(t => 
      t.id === id 
        ? { ...t, status: 'rejected', notes: reason }
        : t
    ));
    setSnackbar({ open: true, message: 'Timesheet rejected', severity: 'info' });
  };

  // Handle time entry update in timesheet
  const handleTimeEntryUpdateInTimesheet = (timesheetId: string, entryId: string, updates: Partial<TimeEntry>) => {
    setTimesheets(prev => prev.map(t => 
      t.id === timesheetId 
        ? { 
            ...t, 
            entries: t.entries.map(e => e.id === entryId ? { ...e, ...updates } : e),
            updatedAt: new Date()
          }
        : t
    ));
  };

  // Handle time entry deletion in timesheet
  const handleTimeEntryDeleteInTimesheet = (timesheetId: string, entryId: string) => {
    setTimesheets(prev => prev.map(t => 
      t.id === timesheetId 
        ? { 
            ...t, 
            entries: t.entries.filter(e => e.id !== entryId),
            updatedAt: new Date()
          }
        : t
    ));
  };

  // Handle export
  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    setSnackbar({ open: true, message: `Exporting as ${format.toUpperCase()}...`, severity: 'info' });
  };

  // Get current week timesheet
  const getCurrentWeekTimesheet = (): Timesheet | null => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    return timesheets.find(timesheet => 
      timesheet.weekStart.getTime() === weekStart.getTime() &&
      timesheet.weekEnd.getTime() === weekEnd.getTime()
    ) || null;
  };

  const currentWeekTimesheet = getCurrentWeekTimesheet();

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Time Tracking & Project Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track time, manage projects, and analyze productivity
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => setSnackbar({ open: true, message: 'Data refreshed', severity: 'info' })}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={() => handleExport('pdf')}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Projects
                  </Typography>
                  <Typography variant="h4">
                    {projects.filter(p => p.status === 'active').length}
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
                    Total Hours
                  </Typography>
                  <Typography variant="h4">
                    {timeEntries.reduce((sum, entry) => sum + (entry.duration / 3600), 0).toFixed(1)}
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
                    Billable Amount
                  </Typography>
                  <Typography variant="h4">
                    ${timeEntries
                      .filter(entry => entry.isBillable)
                      .reduce((sum, entry) => sum + (entry.duration / 3600) * (entry.hourlyRate || 0), 0)
                      .toFixed(2)}
                  </Typography>
                </Box>
                <AttachMoney color="primary" sx={{ fontSize: 40 }} />
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
                    Team Members
                  </Typography>
                  <Typography variant="h4">
                    {new Set(projects.flatMap(p => p.teamMembers)).size}
                  </Typography>
                </Box>
                <Group color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Time Tracker" icon={<Timer />} />
            <Tab label="Projects" icon={<Assignment />} />
            <Tab label="Timesheets" icon={<Schedule />} />
            <Tab label="Analytics" icon={<Assessment />} />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <TimeTracker
              projects={projects}
              onTimeEntrySave={handleTimeEntrySave}
              onTimeEntryUpdate={handleTimeEntryUpdate}
              onTimeEntryDelete={handleTimeEntryDelete}
            />
          )}

          {activeTab === 1 && (
            <ProjectManager
              projects={projects}
              onProjectCreate={handleProjectCreate}
              onProjectUpdate={handleProjectUpdate}
              onProjectDelete={handleProjectDelete}
            />
          )}

          {activeTab === 2 && (
            <TimesheetManager
              timesheets={timesheets}
              onTimesheetSubmit={handleTimesheetSubmit}
              onTimesheetApprove={handleTimesheetApprove}
              onTimesheetReject={handleTimesheetReject}
              onTimeEntryUpdate={handleTimeEntryUpdateInTimesheet}
              onTimeEntryDelete={handleTimeEntryDeleteInTimesheet}
            />
          )}

          {activeTab === 3 && (
            <ProjectAnalytics
              projects={projects}
              timeEntries={timeEntries}
              onExport={handleExport}
            />
          )}
        </Box>
      </Paper>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setSnackbar({ open: true, message: 'Quick action menu', severity: 'info' })}
      >
        <Add />
      </Fab>

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
    </Container>
  );
};

export default TimeTrackingPage;










