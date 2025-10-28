import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  LinearProgress,
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
} from '@mui/icons-material';
import { format, differenceInDays, addDays } from 'date-fns';

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

interface ProjectManagerProps {
  projects: Project[];
  onProjectCreate: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onProjectUpdate: (id: string, updates: Partial<Project>) => void;
  onProjectDelete: (id: string) => void;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({
  projects,
  onProjectCreate,
  onProjectUpdate,
  onProjectDelete,
}) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    description: '',
    hourlyRate: 0,
    budget: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'active' as Project['status'],
    priority: 'medium' as Project['priority'],
    teamMembers: [] as string[],
    tags: [] as string[],
    color: '#2196f3',
    isPublic: false,
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      client: '',
      description: '',
      hourlyRate: 0,
      budget: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      status: 'active',
      priority: 'medium',
      teamMembers: [],
      tags: [],
      color: '#2196f3',
      isPublic: false,
    });
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.client.trim()) {
      setSnackbar({ open: true, message: 'Please fill in required fields', severity: 'warning' });
      return;
    }

    const projectData = {
      ...formData,
      spent: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (editingProject) {
      onProjectUpdate(editingProject.id, projectData);
      setSnackbar({ open: true, message: 'Project updated successfully', severity: 'success' });
    } else {
      onProjectCreate(projectData);
      setSnackbar({ open: true, message: 'Project created successfully', severity: 'success' });
    }

    setShowCreateDialog(false);
    setShowEditDialog(false);
    setEditingProject(null);
    resetForm();
  };

  // Handle edit
  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      client: project.client,
      description: project.description,
      hourlyRate: project.hourlyRate,
      budget: project.budget,
      startDate: format(project.startDate, 'yyyy-MM-dd'),
      endDate: project.endDate ? format(project.endDate, 'yyyy-MM-dd') : '',
      status: project.status,
      priority: project.priority,
      teamMembers: project.teamMembers,
      tags: project.tags,
      color: project.color,
      isPublic: project.isPublic,
    });
    setShowEditDialog(true);
  };

  // Handle delete
  const handleDelete = (project: Project) => {
    if (window.confirm(`Are you sure you want to delete "${project.name}"?`)) {
      onProjectDelete(project.id);
      setSnackbar({ open: true, message: 'Project deleted successfully', severity: 'success' });
    }
  };

  // Get project progress
  const getProjectProgress = (project: Project): number => {
    if (project.budget === 0) return 0;
    return Math.min((project.spent / project.budget) * 100, 100);
  };

  // Get project status color
  const getProjectStatusColor = (project: Project): string => {
    const progress = getProjectProgress(project);
    if (progress >= 100) return '#f44336'; // Red
    if (progress >= 80) return '#ff9800'; // Orange
    if (progress >= 60) return '#ffc107'; // Yellow
    return '#4caf50'; // Green
  };

  // Get priority color
  const getPriorityColor = (priority: Project['priority']): string => {
    switch (priority) {
      case 'urgent': return '#f44336';
      case 'high': return '#ff9800';
      case 'medium': return '#2196f3';
      case 'low': return '#4caf50';
      default: return '#757575';
    }
  };

  // Get status icon
  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'active': return <CheckCircle color="success" />;
      case 'on-hold': return <Schedule color="warning" />;
      case 'completed': return <CheckCircle color="primary" />;
      case 'cancelled': return <Warning color="error" />;
      default: return <Assignment />;
    }
  };

  // Filter projects by status
  const getFilteredProjects = (status?: Project['status']) => {
    if (!status) return projects;
    return projects.filter(project => project.status === status);
  };

  // Calculate project metrics
  const getProjectMetrics = () => {
    const activeProjects = getFilteredProjects('active');
    const completedProjects = getFilteredProjects('completed');
    const totalBudget = projects.reduce((sum, project) => sum + project.budget, 0);
    const totalSpent = projects.reduce((sum, project) => sum + project.spent, 0);
    const averageProgress = projects.length > 0 
      ? projects.reduce((sum, project) => sum + getProjectProgress(project), 0) / projects.length 
      : 0;

    return {
      total: projects.length,
      active: activeProjects.length,
      completed: completedProjects.length,
      totalBudget,
      totalSpent,
      averageProgress,
    };
  };

  const metrics = getProjectMetrics();

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Project Manager
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setShowCreateDialog(true)}
          sx={{ bgcolor: '#2196f3' }}
        >
          New Project
        </Button>
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
                    Active Projects
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {metrics.active}
                  </Typography>
                </Box>
                <CheckCircle color="success" sx={{ fontSize: 40 }} />
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
                    Total Budget
                  </Typography>
                  <Typography variant="h4">
                    ${metrics.totalBudget.toLocaleString()}
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
                    Average Progress
                  </Typography>
                  <Typography variant="h4">
                    {metrics.averageProgress.toFixed(1)}%
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
            <Tab label="All Projects" />
            <Tab label="Active" />
            <Tab label="On Hold" />
            <Tab label="Completed" />
          </Tabs>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Project</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell>Budget</TableCell>
                <TableCell>Team</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getFilteredProjects(
                activeTab === 0 ? undefined : 
                activeTab === 1 ? 'active' : 
                activeTab === 2 ? 'on-hold' : 'completed'
              ).map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: project.color, width: 32, height: 32 }}>
                        {project.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {project.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {project.description}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {project.client}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getStatusIcon(project.status)}
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {project.status.replace('-', ' ')}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={project.priority}
                      size="small"
                      sx={{
                        bgcolor: getPriorityColor(project.priority),
                        color: 'white',
                        textTransform: 'capitalize',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ minWidth: 100 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption">
                          {getProjectProgress(project).toFixed(1)}%
                        </Typography>
                        <Typography variant="caption">
                          ${project.spent.toFixed(0)} / ${project.budget.toFixed(0)}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={getProjectProgress(project)}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: 'rgba(0,0,0,0.1)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getProjectStatusColor(project),
                          },
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      ${project.budget.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ${project.hourlyRate}/hr
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Group fontSize="small" color="action" />
                      <Typography variant="body2">
                        {project.teamMembers.length}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleEdit(project)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDelete(project)} color="error">
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
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog
        open={showCreateDialog || showEditDialog}
        onClose={() => {
          setShowCreateDialog(false);
          setShowEditDialog(false);
          setEditingProject(null);
          resetForm();
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingProject ? 'Edit Project' : 'Create New Project'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Project Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Client"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
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
                label="Hourly Rate"
                type="number"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                InputProps={{ startAdornment: '$' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Budget"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                InputProps={{ startAdornment: '$' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Project['status'] })}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="on-hold">On Hold</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as Project['priority'] })}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  />
                }
                label="Public Project"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowCreateDialog(false);
            setShowEditDialog(false);
            setEditingProject(null);
            resetForm();
          }}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingProject ? 'Update' : 'Create'}
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

export default ProjectManager;










