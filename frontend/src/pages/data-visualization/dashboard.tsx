import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Chip,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Slider,
  ColorPicker
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Preview as PreviewIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Insights as InsightsIcon,
  TrendingUp as TrendingUpIcon,
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  ScatterPlot as ScatterPlotIcon,
  ShowChart as ShowChartIcon,
  ExpandMore as ExpandMoreIcon,
  Palette as PaletteIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon
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
  Scatter
} from 'recharts';

interface ChartConfig {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'heatmap' | 'gauge' | 'funnel' | 'sankey' | 'treemap';
  title: string;
  description: string;
  dataSource: string;
  query: string;
  xAxis: any;
  yAxis: any;
  series: any[];
  colors: string[];
  legend: any;
  tooltip: any;
  animation: any;
  responsive: boolean;
  interactive: boolean;
  exportable: boolean;
  shareable: boolean;
}

interface Dashboard {
  id: string;
  name: string;
  description: string;
  layout: any;
  charts: ChartConfig[];
  filters: any[];
  permissions: any;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

const DataVisualizationDashboard: React.FC = () => {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [chartConfigs, setChartConfigs] = useState<ChartConfig[]>([]);
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isChartDialogOpen, setIsChartDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [newDashboard, setNewDashboard] = useState({
    name: '',
    description: '',
    isPublic: false
  });
  const [newChart, setNewChart] = useState({
    type: 'line',
    title: '',
    description: '',
    dataSource: '',
    query: ''
  });

  const chartTypes = [
    { type: 'line', label: 'Line Chart', icon: <LineChartIcon /> },
    { type: 'bar', label: 'Bar Chart', icon: <BarChartIcon /> },
    { type: 'pie', label: 'Pie Chart', icon: <PieChartIcon /> },
    { type: 'area', label: 'Area Chart', icon: <ShowChartIcon /> },
    { type: 'scatter', label: 'Scatter Plot', icon: <ScatterPlotIcon /> }
  ];

  const sampleData = [
    { name: 'Jan', value: 400, value2: 240 },
    { name: 'Feb', value: 300, value2: 139 },
    { name: 'Mar', value: 200, value2: 980 },
    { name: 'Apr', value: 278, value2: 390 },
    { name: 'May', value: 189, value2: 480 },
    { name: 'Jun', value: 239, value2: 380 }
  ];

  useEffect(() => {
    fetchDashboards();
    fetchChartConfigs();
  }, []);

  const fetchDashboards = async () => {
    try {
      const response = await fetch('/api/data-visualization/companies/1/dashboards');
      const data = await response.json();
      if (data.success) {
        setDashboards(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboards:', error);
    }
  };

  const fetchChartConfigs = async () => {
    try {
      const response = await fetch('/api/data-visualization/companies/1/charts');
      const data = await response.json();
      if (data.success) {
        setChartConfigs(data.data);
      }
    } catch (error) {
      console.error('Error fetching chart configs:', error);
    }
  };

  const handleCreateDashboard = async () => {
    try {
      const response = await fetch('/api/data-visualization/companies/1/dashboards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDashboard)
      });
      
      if (response.ok) {
        fetchDashboards();
        setIsCreateDialogOpen(false);
        setNewDashboard({ name: '', description: '', isPublic: false });
      }
    } catch (error) {
      console.error('Error creating dashboard:', error);
    }
  };

  const handleCreateChart = async () => {
    try {
      const response = await fetch('/api/data-visualization/companies/1/charts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newChart)
      });
      
      if (response.ok) {
        fetchChartConfigs();
        setIsChartDialogOpen(false);
        setNewChart({ type: 'line', title: '', description: '', dataSource: '', query: '' });
      }
    } catch (error) {
      console.error('Error creating chart:', error);
    }
  };

  const handlePreview = async () => {
    if (!selectedDashboard) return;

    try {
      const response = await fetch(`/api/data-visualization/dashboards/${selectedDashboard.id}/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parameters: {} })
      });
      
      if (response.ok) {
        setIsPreviewDialogOpen(true);
      }
    } catch (error) {
      console.error('Error generating preview:', error);
    }
  };

  const handleExport = async (format: string) => {
    if (!selectedDashboard) return;

    try {
      const response = await fetch(`/api/data-visualization/dashboards/${selectedDashboard.id}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format, parameters: {} })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting dashboard:', error);
    }
  };

  const renderChart = (chart: ChartConfig) => {
    const commonProps = {
      width: 400,
      height: 300,
      data: sampleData
    };

    switch (chart.type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sampleData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
              <Line type="monotone" dataKey="value2" stroke="#82ca9d" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sampleData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
              <Bar dataKey="value2" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sampleData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {sampleData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`#${Math.floor(Math.random()*16777215).toString(16)}`} />
                ))}
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={sampleData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Area type="monotone" dataKey="value" stackId="1" stroke="#8884d8" fill="#8884d8" />
              <Area type="monotone" dataKey="value2" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={sampleData}>
              <CartesianGrid />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Scatter dataKey="value" fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        );
      default:
        return (
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              {chart.type} Chart
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Data Visualization Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Create interactive charts and dashboards with real-time data
      </Typography>

      <Grid container spacing={3}>
        {/* Dashboards List */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Dashboards</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsCreateDialogOpen(true)}
              >
                New Dashboard
              </Button>
            </Box>
            
            {dashboards.map((dashboard) => (
              <Card 
                key={dashboard.id} 
                sx={{ 
                  mb: 1, 
                  cursor: 'pointer',
                  border: selectedDashboard?.id === dashboard.id ? 2 : 1,
                  borderColor: selectedDashboard?.id === dashboard.id ? 'primary.main' : 'divider'
                }}
                onClick={() => setSelectedDashboard(dashboard)}
              >
                <CardContent>
                  <Typography variant="h6">{dashboard.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {dashboard.description}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip 
                      label={`${dashboard.charts.length} charts`} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                    {dashboard.isPublic && (
                      <Chip 
                        label="Public" 
                        size="small" 
                        color="success" 
                        variant="outlined"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Paper>
        </Grid>

        {/* Dashboard Editor */}
        <Grid item xs={12} md={8}>
          {selectedDashboard ? (
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">{selectedDashboard.name}</Typography>
                <Box>
                  <Button
                    variant="outlined"
                    startIcon={<PreviewIcon />}
                    onClick={handlePreview}
                    sx={{ mr: 1 }}
                  >
                    Preview
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleExport('pdf')}
                    sx={{ mr: 1 }}
                  >
                    Export
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ShareIcon />}
                    sx={{ mr: 1 }}
                  >
                    Share
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<InsightsIcon />}
                  >
                    Analytics
                  </Button>
                </Box>
              </Box>

              <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
                <Tab label="Charts" />
                <Tab label="Layout" />
                <Tab label="Filters" />
                <Tab label="Settings" />
              </Tabs>

              {activeTab === 0 && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Charts</Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setIsChartDialogOpen(true)}
                    >
                      Add Chart
                    </Button>
                  </Box>
                  
                  <Grid container spacing={2}>
                    {selectedDashboard.charts.map((chart) => (
                      <Grid item xs={12} sm={6} md={4} key={chart.id}>
                        <Card sx={{ height: '100%' }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="h6">{chart.title}</Typography>
                              <Box>
                                <Tooltip title="Edit">
                                  <IconButton size="small">
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton size="small" color="error">
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {chart.description}
                            </Typography>
                            {renderChart(chart)}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {activeTab === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Dashboard Layout
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Drag and drop to rearrange charts
                  </Typography>
                </Box>
              )}

              {activeTab === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Dashboard Filters
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Configure filters for your dashboard
                  </Typography>
                </Box>
              )}

              {activeTab === 3 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Dashboard Settings
                  </Typography>
                  <FormControlLabel
                    control={<Switch checked={selectedDashboard.isPublic} />}
                    label="Public Dashboard"
                  />
                </Box>
              )}
            </Paper>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                Select a dashboard to start editing
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Create Dashboard Dialog */}
      <Dialog open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Dashboard</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={newDashboard.name}
            onChange={(e) => setNewDashboard({ ...newDashboard, name: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            label="Description"
            value={newDashboard.description}
            onChange={(e) => setNewDashboard({ ...newDashboard, description: e.target.value })}
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={newDashboard.isPublic}
                onChange={(e) => setNewDashboard({ ...newDashboard, isPublic: e.target.checked })}
              />
            }
            label="Public Dashboard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateDashboard} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Create Chart Dialog */}
      <Dialog open={isChartDialogOpen} onClose={() => setIsChartDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Chart</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Chart Type</InputLabel>
                <Select
                  value={newChart.type}
                  onChange={(e) => setNewChart({ ...newChart, type: e.target.value })}
                >
                  {chartTypes.map((type) => (
                    <MenuItem key={type.type} value={type.type}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {type.icon}
                        <Typography sx={{ ml: 1 }}>{type.label}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Data Source"
                value={newChart.dataSource}
                onChange={(e) => setNewChart({ ...newChart, dataSource: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={newChart.title}
                onChange={(e) => setNewChart({ ...newChart, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={newChart.description}
                onChange={(e) => setNewChart({ ...newChart, description: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="SQL Query"
                value={newChart.query}
                onChange={(e) => setNewChart({ ...newChart, query: e.target.value })}
                multiline
                rows={4}
                placeholder="SELECT * FROM your_table WHERE..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsChartDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateChart} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DataVisualizationDashboard;





