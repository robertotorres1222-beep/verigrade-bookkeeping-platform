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
  Grid,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Assessment,
  Timeline,
  AttachMoney,
  Schedule,
  Group,
  Warning,
  CheckCircle,
  Business,
  Assignment,
  FilterList,
  Download,
  Refresh,
  ExpandMore,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from 'recharts';
import { format, differenceInDays, addDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

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

interface ProjectAnalyticsProps {
  projects: Project[];
  timeEntries: TimeEntry[];
  onExport: (format: 'pdf' | 'excel' | 'csv') => void;
}

const ProjectAnalytics: React.FC<ProjectAnalyticsProps> = ({
  projects,
  timeEntries,
  onExport,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [dateRange, setDateRange] = useState('30'); // days
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });

  // Calculate project metrics
  const getProjectMetrics = (project: Project) => {
    const projectEntries = timeEntries.filter(entry => entry.projectId === project.id);
    const totalHours = projectEntries.reduce((sum, entry) => sum + (entry.duration / 3600), 0);
    const billableHours = projectEntries
      .filter(entry => entry.isBillable)
      .reduce((sum, entry) => sum + (entry.duration / 3600), 0);
    const totalAmount = projectEntries
      .filter(entry => entry.isBillable)
      .reduce((sum, entry) => sum + (entry.duration / 3600) * (entry.hourlyRate || 0), 0);
    const progress = project.budget > 0 ? (project.spent / project.budget) * 100 : 0;
    const remainingBudget = project.budget - project.spent;
    const estimatedCompletion = project.budget > 0 ? (project.budget / (project.spent / Math.max(totalHours, 1))) : 0;

    return {
      totalHours,
      billableHours,
      totalAmount,
      progress,
      remainingBudget,
      estimatedCompletion,
      entryCount: projectEntries.length,
    };
  };

  // Get overall metrics
  const getOverallMetrics = () => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const totalBudget = projects.reduce((sum, project) => sum + project.budget, 0);
    const totalSpent = projects.reduce((sum, project) => sum + project.spent, 0);
    const totalHours = timeEntries.reduce((sum, entry) => sum + (entry.duration / 3600), 0);
    const billableHours = timeEntries
      .filter(entry => entry.isBillable)
      .reduce((sum, entry) => sum + (entry.duration / 3600), 0);
    const totalAmount = timeEntries
      .filter(entry => entry.isBillable)
      .reduce((sum, entry) => sum + (entry.duration / 3600) * (entry.hourlyRate || 0), 0);

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalBudget,
      totalSpent,
      totalHours,
      billableHours,
      totalAmount,
      budgetUtilization: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
    };
  };

  // Get project performance data
  const getProjectPerformanceData = () => {
    return projects.map(project => {
      const metrics = getProjectMetrics(project);
      return {
        name: project.name,
        budget: project.budget,
        spent: project.spent,
        hours: metrics.totalHours,
        billableHours: metrics.billableHours,
        amount: metrics.totalAmount,
        progress: metrics.progress,
        status: project.status,
        priority: project.priority,
        teamSize: project.teamMembers.length,
      };
    });
  };

  // Get time tracking trends
  const getTimeTrackingTrends = () => {
    const days = parseInt(dateRange);
    const endDate = new Date();
    const startDate = addDays(endDate, -days);
    
    const dailyData = eachDayOfInterval({ start: startDate, end: endDate }).map(date => {
      const dayEntries = timeEntries.filter(entry => 
        entry.startTime >= date && entry.startTime < addDays(date, 1)
      );
      
      const totalHours = dayEntries.reduce((sum, entry) => sum + (entry.duration / 3600), 0);
      const billableHours = dayEntries
        .filter(entry => entry.isBillable)
        .reduce((sum, entry) => sum + (entry.duration / 3600), 0);
      const amount = dayEntries
        .filter(entry => entry.isBillable)
        .reduce((sum, entry) => sum + (entry.duration / 3600) * (entry.hourlyRate || 0), 0);

      return {
        date: format(date, 'MMM dd'),
        totalHours,
        billableHours,
        amount,
        entryCount: dayEntries.length,
      };
    });

    return dailyData;
  };

  // Get project profitability data
  const getProjectProfitabilityData = () => {
    return projects.map(project => {
      const metrics = getProjectMetrics(project);
      const profit = project.budget - project.spent;
      const profitMargin = project.budget > 0 ? (profit / project.budget) * 100 : 0;
      
      return {
        name: project.name,
        budget: project.budget,
        spent: project.spent,
        profit,
        profitMargin,
        hours: metrics.totalHours,
        hourlyRate: project.hourlyRate,
        status: project.status,
      };
    });
  };

  // Get team productivity data
  const getTeamProductivityData = () => {
    const teamMembers = new Map<string, { name: string; totalHours: number; billableHours: number; amount: number; projectCount: number }>();
    
    timeEntries.forEach(entry => {
      // This is a simplified approach - in reality, you'd need to track which team member worked on which entry
      const memberName = 'Team Member'; // This should come from the actual data
      if (!teamMembers.has(memberName)) {
        teamMembers.set(memberName, {
          name: memberName,
          totalHours: 0,
          billableHours: 0,
          amount: 0,
          projectCount: 0,
        });
      }
      
      const member = teamMembers.get(memberName)!;
      member.totalHours += entry.duration / 3600;
      if (entry.isBillable) {
        member.billableHours += entry.duration / 3600;
        member.amount += (entry.duration / 3600) * (entry.hourlyRate || 0);
      }
    });

    return Array.from(teamMembers.values());
  };

  const overallMetrics = getOverallMetrics();
  const performanceData = getProjectPerformanceData();
  const trendsData = getTimeTrackingTrends();
  const profitabilityData = getProjectProfitabilityData();
  const productivityData = getTeamProductivityData();

  // Chart colors
  const colors = ['#2196f3', '#4caf50', '#ff9800', '#f44336', '#9c27b0', '#00bcd4', '#795548', '#607d8b'];

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Project Analytics
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Date Range</InputLabel>
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <MenuItem value="7">Last 7 days</MenuItem>
              <MenuItem value="30">Last 30 days</MenuItem>
              <MenuItem value="90">Last 90 days</MenuItem>
              <MenuItem value="365">Last year</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={() => onExport('pdf')}
          >
            Export
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
                    Total Projects
                  </Typography>
                  <Typography variant="h4">
                    {overallMetrics.totalProjects}
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    {overallMetrics.activeProjects} active
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
                    {overallMetrics.totalHours.toFixed(1)}
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    {overallMetrics.billableHours.toFixed(1)} billable
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
                    ${overallMetrics.totalAmount.toFixed(2)}
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    ${overallMetrics.totalSpent.toFixed(2)} spent
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
                    Budget Utilization
                  </Typography>
                  <Typography variant="h4">
                    {overallMetrics.budgetUtilization.toFixed(1)}%
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    ${overallMetrics.totalBudget.toFixed(2)} total budget
                  </Typography>
                </Box>
                <TrendingUp color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Overview" />
            <Tab label="Time Tracking" />
            <Tab label="Project Performance" />
            <Tab label="Profitability" />
            <Tab label="Team Productivity" />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {/* Overview Tab */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Project Status Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Active', value: overallMetrics.activeProjects, color: '#4caf50' },
                        { name: 'Completed', value: overallMetrics.completedProjects, color: '#2196f3' },
                        { name: 'On Hold', value: overallMetrics.totalProjects - overallMetrics.activeProjects - overallMetrics.completedProjects, color: '#ff9800' },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'Active', value: overallMetrics.activeProjects, color: '#4caf50' },
                        { name: 'Completed', value: overallMetrics.completedProjects, color: '#2196f3' },
                        { name: 'On Hold', value: overallMetrics.totalProjects - overallMetrics.activeProjects - overallMetrics.completedProjects, color: '#ff9800' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Budget vs Spent
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="budget" fill="#2196f3" name="Budget" />
                    <Bar dataKey="spent" fill="#f44336" name="Spent" />
                  </BarChart>
                </ResponsiveContainer>
              </Grid>
            </Grid>
          )}

          {/* Time Tracking Tab */}
          {activeTab === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Time Tracking Trends
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={trendsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="totalHours" stroke="#2196f3" name="Total Hours" />
                    <Line type="monotone" dataKey="billableHours" stroke="#4caf50" name="Billable Hours" />
                  </LineChart>
                </ResponsiveContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Daily Revenue
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trendsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Area type="monotone" dataKey="amount" stroke="#4caf50" fill="#4caf50" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Entry Count
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trendsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="entryCount" fill="#ff9800" />
                  </BarChart>
                </ResponsiveContainer>
              </Grid>
            </Grid>
          )}

          {/* Project Performance Tab */}
          {activeTab === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Project Performance Overview
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Project</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Progress</TableCell>
                        <TableCell>Hours</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Team Size</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {performanceData.map((project, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {project.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={project.status}
                              size="small"
                              color={project.status === 'active' ? 'success' : 'default'}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ minWidth: 100 }}>
                              <LinearProgress
                                variant="determinate"
                                value={project.progress}
                                sx={{ height: 6, borderRadius: 3 }}
                              />
                              <Typography variant="caption">
                                {project.progress.toFixed(1)}%
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {project.hours.toFixed(1)}h
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {project.billableHours.toFixed(1)}h billable
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              ${project.amount.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {project.teamSize}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          )}

          {/* Profitability Tab */}
          {activeTab === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Project Profitability
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={profitabilityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="budget" fill="#2196f3" name="Budget" />
                    <Bar dataKey="spent" fill="#f44336" name="Spent" />
                    <Bar dataKey="profit" fill="#4caf50" name="Profit" />
                  </BarChart>
                </ResponsiveContainer>
              </Grid>
            </Grid>
          )}

          {/* Team Productivity Tab */}
          {activeTab === 4 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Team Productivity
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={productivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="totalHours" fill="#2196f3" name="Total Hours" />
                    <Bar dataKey="billableHours" fill="#4caf50" name="Billable Hours" />
                  </BarChart>
                </ResponsiveContainer>
              </Grid>
            </Grid>
          )}
        </Box>
      </Card>

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

export default ProjectAnalytics;






