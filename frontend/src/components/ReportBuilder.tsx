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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  FormControlLabel,
  Switch,
  Slider,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Save,
  Preview,
  Download,
  Share,
  FilterList,
  Sort,
  Group,
  BarChart,
  LineChart,
  PieChart,
  TableChart,
  ExpandMore,
  DragIndicator,
  Visibility,
  Settings,
  Refresh,
  PlayArrow,
  Stop,
  CheckCircle,
  Error,
  Warning,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface ReportField {
  id: string;
  name: string;
  type: 'string' | 'number' | 'date' | 'currency' | 'percentage' | 'boolean';
  source: string;
  expression?: string;
  format?: string;
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'distinct';
}

interface ReportFilter {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in' | 'is_null' | 'is_not_null';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

interface ReportGrouping {
  id: string;
  field: string;
  order: 'asc' | 'desc';
  level: number;
}

interface ReportSorting {
  id: string;
  field: string;
  order: 'asc' | 'desc';
  priority: number;
}

interface ReportChart {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'table';
  title: string;
  xAxis?: string;
  yAxis?: string;
  series?: string[];
  config: any;
}

interface ReportBuilderProps {
  onSave: (report: any) => void;
  onPreview: (report: any) => void;
  onExport: (report: any, format: string) => void;
  initialReport?: any;
}

const ReportBuilder: React.FC<ReportBuilderProps> = ({
  onSave,
  onPreview,
  onExport,
  initialReport,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [showFieldDialog, setShowFieldDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showChartDialog, setShowChartDialog] = useState(false);
  const [editingField, setEditingField] = useState<ReportField | null>(null);
  const [editingFilter, setEditingFilter] = useState<ReportFilter | null>(null);
  const [editingChart, setEditingChart] = useState<ReportChart | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });
  
  // Report state
  const [report, setReport] = useState({
    name: '',
    description: '',
    category: '',
    fields: [] as ReportField[],
    filters: [] as ReportFilter[],
    groupings: [] as ReportGrouping[],
    sorting: [] as ReportSorting[],
    charts: [] as ReportChart[],
  });

  // Form state
  const [fieldForm, setFieldForm] = useState({
    name: '',
    type: 'string' as ReportField['type'],
    source: '',
    expression: '',
    format: '',
    aggregation: undefined as ReportField['aggregation'],
  });

  const [filterForm, setFilterForm] = useState({
    field: '',
    operator: 'equals' as ReportFilter['operator'],
    value: '',
    logicalOperator: 'AND' as ReportFilter['logicalOperator'],
  });

  const [chartForm, setChartForm] = useState({
    type: 'bar' as ReportChart['type'],
    title: '',
    xAxis: '',
    yAxis: '',
    series: [] as string[],
  });

  // Initialize with initial report if provided
  useEffect(() => {
    if (initialReport) {
      setReport(initialReport);
    }
  }, [initialReport]);

  // Handle field operations
  const handleAddField = () => {
    setEditingField(null);
    setFieldForm({
      name: '',
      type: 'string',
      source: '',
      expression: '',
      format: '',
      aggregation: undefined,
    });
    setShowFieldDialog(true);
  };

  const handleEditField = (field: ReportField) => {
    setEditingField(field);
    setFieldForm({
      name: field.name,
      type: field.type,
      source: field.source,
      expression: field.expression || '',
      format: field.format || '',
      aggregation: field.aggregation,
    });
    setShowFieldDialog(true);
  };

  const handleSaveField = () => {
    if (!fieldForm.name || !fieldForm.type || !fieldForm.source) {
      setSnackbar({ open: true, message: 'Please fill in required fields', severity: 'warning' });
      return;
    }

    const newField: ReportField = {
      id: editingField?.id || `field_${Date.now()}`,
      name: fieldForm.name,
      type: fieldForm.type,
      source: fieldForm.source,
      expression: fieldForm.expression,
      format: fieldForm.format,
      aggregation: fieldForm.aggregation,
    };

    if (editingField) {
      setReport(prev => ({
        ...prev,
        fields: prev.fields.map(f => f.id === editingField.id ? newField : f),
      }));
    } else {
      setReport(prev => ({
        ...prev,
        fields: [...prev.fields, newField],
      }));
    }

    setShowFieldDialog(false);
    setSnackbar({ open: true, message: 'Field saved successfully', severity: 'success' });
  };

  const handleDeleteField = (fieldId: string) => {
    setReport(prev => ({
      ...prev,
      fields: prev.fields.filter(f => f.id !== fieldId),
    }));
    setSnackbar({ open: true, message: 'Field deleted successfully', severity: 'success' });
  };

  // Handle filter operations
  const handleAddFilter = () => {
    setEditingFilter(null);
    setFilterForm({
      field: '',
      operator: 'equals',
      value: '',
      logicalOperator: 'AND',
    });
    setShowFilterDialog(true);
  };

  const handleEditFilter = (filter: ReportFilter) => {
    setEditingFilter(filter);
    setFilterForm({
      field: filter.field,
      operator: filter.operator,
      value: filter.value,
      logicalOperator: filter.logicalOperator || 'AND',
    });
    setShowFilterDialog(true);
  };

  const handleSaveFilter = () => {
    if (!filterForm.field || !filterForm.operator) {
      setSnackbar({ open: true, message: 'Please fill in required fields', severity: 'warning' });
      return;
    }

    const newFilter: ReportFilter = {
      id: editingFilter?.id || `filter_${Date.now()}`,
      field: filterForm.field,
      operator: filterForm.operator,
      value: filterForm.value,
      logicalOperator: filterForm.logicalOperator,
    };

    if (editingFilter) {
      setReport(prev => ({
        ...prev,
        filters: prev.filters.map(f => f.id === editingFilter.id ? newFilter : f),
      }));
    } else {
      setReport(prev => ({
        ...prev,
        filters: [...prev.filters, newFilter],
      }));
    }

    setShowFilterDialog(false);
    setSnackbar({ open: true, message: 'Filter saved successfully', severity: 'success' });
  };

  const handleDeleteFilter = (filterId: string) => {
    setReport(prev => ({
      ...prev,
      filters: prev.filters.filter(f => f.id !== filterId),
    }));
    setSnackbar({ open: true, message: 'Filter deleted successfully', severity: 'success' });
  };

  // Handle chart operations
  const handleAddChart = () => {
    setEditingChart(null);
    setChartForm({
      type: 'bar',
      title: '',
      xAxis: '',
      yAxis: '',
      series: [],
    });
    setShowChartDialog(true);
  };

  const handleEditChart = (chart: ReportChart) => {
    setEditingChart(chart);
    setChartForm({
      type: chart.type,
      title: chart.title,
      xAxis: chart.xAxis || '',
      yAxis: chart.yAxis || '',
      series: chart.series || [],
    });
    setShowChartDialog(true);
  };

  const handleSaveChart = () => {
    if (!chartForm.title) {
      setSnackbar({ open: true, message: 'Please enter a chart title', severity: 'warning' });
      return;
    }

    const newChart: ReportChart = {
      id: editingChart?.id || `chart_${Date.now()}`,
      type: chartForm.type,
      title: chartForm.title,
      xAxis: chartForm.xAxis,
      yAxis: chartForm.yAxis,
      series: chartForm.series,
      config: {},
    };

    if (editingChart) {
      setReport(prev => ({
        ...prev,
        charts: prev.charts.map(c => c.id === editingChart.id ? newChart : c),
      }));
    } else {
      setReport(prev => ({
        ...prev,
        charts: [...prev.charts, newChart],
      }));
    }

    setShowChartDialog(false);
    setSnackbar({ open: true, message: 'Chart saved successfully', severity: 'success' });
  };

  const handleDeleteChart = (chartId: string) => {
    setReport(prev => ({
      ...prev,
      charts: prev.charts.filter(c => c.id !== chartId),
    }));
    setSnackbar({ open: true, message: 'Chart deleted successfully', severity: 'success' });
  };

  // Handle report operations
  const handleSaveReport = () => {
    if (!report.name) {
      setSnackbar({ open: true, message: 'Please enter a report name', severity: 'warning' });
      return;
    }

    onSave(report);
    setSnackbar({ open: true, message: 'Report saved successfully', severity: 'success' });
  };

  const handlePreviewReport = () => {
    if (report.fields.length === 0) {
      setSnackbar({ open: true, message: 'Please add at least one field', severity: 'warning' });
      return;
    }

    onPreview(report);
    setSnackbar({ open: true, message: 'Report preview generated', severity: 'info' });
  };

  const handleExportReport = (format: string) => {
    if (report.fields.length === 0) {
      setSnackbar({ open: true, message: 'Please add at least one field', severity: 'warning' });
      return;
    }

    onExport(report, format);
    setSnackbar({ open: true, message: `Report exported as ${format.toUpperCase()}`, severity: 'success' });
  };

  // Get field type icon
  const getFieldTypeIcon = (type: ReportField['type']) => {
    switch (type) {
      case 'string': return <TableChart />;
      case 'number': return <BarChart />;
      case 'date': return <LineChart />;
      case 'currency': return <BarChart />;
      case 'percentage': return <PieChart />;
      case 'boolean': return <CheckCircle />;
      default: return <TableChart />;
    }
  };

  // Get aggregation label
  const getAggregationLabel = (aggregation?: ReportField['aggregation']) => {
    if (!aggregation) return 'None';
    return aggregation.charAt(0).toUpperCase() + aggregation.slice(1);
  };

  // Get operator label
  const getOperatorLabel = (operator: ReportFilter['operator']) => {
    const labels: Record<ReportFilter['operator'], string> = {
      equals: 'Equals',
      not_equals: 'Not Equals',
      contains: 'Contains',
      not_contains: 'Not Contains',
      greater_than: 'Greater Than',
      less_than: 'Less Than',
      between: 'Between',
      in: 'In',
      not_in: 'Not In',
      is_null: 'Is Null',
      is_not_null: 'Is Not Null',
    };
    return labels[operator];
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Report Builder
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Preview />}
            onClick={handlePreviewReport}
          >
            Preview
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSaveReport}
          >
            Save Report
          </Button>
        </Box>
      </Box>

      {/* Report Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Report Name"
                value={report.name}
                onChange={(e) => setReport(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={report.category}
                  onChange={(e) => setReport(prev => ({ ...prev, category: e.target.value }))}
                >
                  <MenuItem value="financial">Financial</MenuItem>
                  <MenuItem value="operational">Operational</MenuItem>
                  <MenuItem value="custom">Custom</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={report.description}
                onChange={(e) => setReport(prev => ({ ...prev, description: e.target.value }))}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Fields" />
            <Tab label="Filters" />
            <Tab label="Grouping" />
            <Tab label="Sorting" />
            <Tab label="Charts" />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {/* Fields Tab */}
          {activeTab === 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Report Fields
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAddField}
                >
                  Add Field
                </Button>
              </Box>

              <List>
                {report.fields.map((field) => (
                  <ListItem key={field.id} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                    <ListItemIcon>
                      {getFieldTypeIcon(field.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={field.name}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Type: {field.type} | Source: {field.source}
                          </Typography>
                          {field.aggregation && (
                            <Chip label={getAggregationLabel(field.aggregation)} size="small" />
                          )}
                        </Box>
                      }
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton size="small" onClick={() => handleEditField(field)}>
                        <Edit />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteField(field.id)} color="error">
                        <Delete />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Filters Tab */}
          {activeTab === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Report Filters
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAddFilter}
                >
                  Add Filter
                </Button>
              </Box>

              <List>
                {report.filters.map((filter) => (
                  <ListItem key={filter.id} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                    <ListItemIcon>
                      <FilterList />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${filter.field} ${getOperatorLabel(filter.operator)} ${filter.value}`}
                      secondary={`Logical Operator: ${filter.logicalOperator}`}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton size="small" onClick={() => handleEditFilter(filter)}>
                        <Edit />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteFilter(filter.id)} color="error">
                        <Delete />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Grouping Tab */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Grouping
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Grouping functionality will be implemented here
              </Typography>
            </Box>
          )}

          {/* Sorting Tab */}
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Sorting
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sorting functionality will be implemented here
              </Typography>
            </Box>
          )}

          {/* Charts Tab */}
          {activeTab === 4 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Charts
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAddChart}
                >
                  Add Chart
                </Button>
              </Box>

              <Grid container spacing={2}>
                {report.charts.map((chart) => (
                  <Grid item xs={12} sm={6} md={4} key={chart.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">
                            {chart.title}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton size="small" onClick={() => handleEditChart(chart)}>
                              <Edit />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDeleteChart(chart.id)} color="error">
                              <Delete />
                            </IconButton>
                          </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Type: {chart.type}
                        </Typography>
                        {chart.xAxis && (
                          <Typography variant="body2" color="text.secondary">
                            X-Axis: {chart.xAxis}
                          </Typography>
                        )}
                        {chart.yAxis && (
                          <Typography variant="body2" color="text.secondary">
                            Y-Axis: {chart.yAxis}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
      </Card>

      {/* Export Options */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Export Options
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={() => handleExportReport('pdf')}
            >
              Export PDF
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={() => handleExportReport('excel')}
            >
              Export Excel
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={() => handleExportReport('csv')}
            >
              Export CSV
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={() => handleExportReport('json')}
            >
              Export JSON
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Field Dialog */}
      <Dialog
        open={showFieldDialog}
        onClose={() => setShowFieldDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingField ? 'Edit Field' : 'Add Field'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Field Name"
              value={fieldForm.name}
              onChange={(e) => setFieldForm(prev => ({ ...prev, name: e.target.value }))}
              required
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Field Type</InputLabel>
              <Select
                value={fieldForm.type}
                onChange={(e) => setFieldForm(prev => ({ ...prev, type: e.target.value as ReportField['type'] }))}
              >
                <MenuItem value="string">String</MenuItem>
                <MenuItem value="number">Number</MenuItem>
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="currency">Currency</MenuItem>
                <MenuItem value="percentage">Percentage</MenuItem>
                <MenuItem value="boolean">Boolean</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Data Source"
              value={fieldForm.source}
              onChange={(e) => setFieldForm(prev => ({ ...prev, source: e.target.value }))}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Expression (Optional)"
              value={fieldForm.expression}
              onChange={(e) => setFieldForm(prev => ({ ...prev, expression: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Aggregation</InputLabel>
              <Select
                value={fieldForm.aggregation || ''}
                onChange={(e) => setFieldForm(prev => ({ ...prev, aggregation: e.target.value as ReportField['aggregation'] }))}
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="sum">Sum</MenuItem>
                <MenuItem value="avg">Average</MenuItem>
                <MenuItem value="count">Count</MenuItem>
                <MenuItem value="min">Min</MenuItem>
                <MenuItem value="max">Max</MenuItem>
                <MenuItem value="distinct">Distinct</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Format (Optional)"
              value={fieldForm.format}
              onChange={(e) => setFieldForm(prev => ({ ...prev, format: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFieldDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveField} variant="contained">
            {editingField ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog
        open={showFilterDialog}
        onClose={() => setShowFilterDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingFilter ? 'Edit Filter' : 'Add Filter'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Field"
              value={filterForm.field}
              onChange={(e) => setFilterForm(prev => ({ ...prev, field: e.target.value }))}
              required
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Operator</InputLabel>
              <Select
                value={filterForm.operator}
                onChange={(e) => setFilterForm(prev => ({ ...prev, operator: e.target.value as ReportFilter['operator'] }))}
              >
                <MenuItem value="equals">Equals</MenuItem>
                <MenuItem value="not_equals">Not Equals</MenuItem>
                <MenuItem value="contains">Contains</MenuItem>
                <MenuItem value="not_contains">Not Contains</MenuItem>
                <MenuItem value="greater_than">Greater Than</MenuItem>
                <MenuItem value="less_than">Less Than</MenuItem>
                <MenuItem value="between">Between</MenuItem>
                <MenuItem value="in">In</MenuItem>
                <MenuItem value="not_in">Not In</MenuItem>
                <MenuItem value="is_null">Is Null</MenuItem>
                <MenuItem value="is_not_null">Is Not Null</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Value"
              value={filterForm.value}
              onChange={(e) => setFilterForm(prev => ({ ...prev, value: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth>
              <InputLabel>Logical Operator</InputLabel>
              <Select
                value={filterForm.logicalOperator}
                onChange={(e) => setFilterForm(prev => ({ ...prev, logicalOperator: e.target.value as ReportFilter['logicalOperator'] }))}
              >
                <MenuItem value="AND">AND</MenuItem>
                <MenuItem value="OR">OR</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFilterDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveFilter} variant="contained">
            {editingFilter ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Chart Dialog */}
      <Dialog
        open={showChartDialog}
        onClose={() => setShowChartDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingChart ? 'Edit Chart' : 'Add Chart'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Chart Title"
              value={chartForm.title}
              onChange={(e) => setChartForm(prev => ({ ...prev, title: e.target.value }))}
              required
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Chart Type</InputLabel>
              <Select
                value={chartForm.type}
                onChange={(e) => setChartForm(prev => ({ ...prev, type: e.target.value as ReportChart['type'] }))}
              >
                <MenuItem value="line">Line Chart</MenuItem>
                <MenuItem value="bar">Bar Chart</MenuItem>
                <MenuItem value="pie">Pie Chart</MenuItem>
                <MenuItem value="area">Area Chart</MenuItem>
                <MenuItem value="scatter">Scatter Chart</MenuItem>
                <MenuItem value="table">Table</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="X-Axis Field"
              value={chartForm.xAxis}
              onChange={(e) => setChartForm(prev => ({ ...prev, xAxis: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Y-Axis Field"
              value={chartForm.yAxis}
              onChange={(e) => setChartForm(prev => ({ ...prev, yAxis: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowChartDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveChart} variant="contained">
            {editingChart ? 'Update' : 'Add'}
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

export default ReportBuilder;







