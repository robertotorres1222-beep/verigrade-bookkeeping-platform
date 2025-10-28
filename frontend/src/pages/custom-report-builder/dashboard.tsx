import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
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
  AccordionDetails
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Preview as PreviewIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Schedule as ScheduleIcon,
  BarChart as BarChartIcon,
  TableChart as TableChartIcon,
  ShowChart as ShowChartIcon,
  TextFields as TextFieldsIcon,
  Image as ImageIcon,
  FilterList as FilterListIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';

interface ReportElement {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'text' | 'image' | 'filter';
  title: string;
  position: { x: number; y: number; width: number; height: number };
  config: any;
  dataSource: string;
  query: string;
  filters: any[];
  styling: any;
}

interface ReportBuilder {
  id: string;
  name: string;
  description: string;
  layout: any;
  elements: ReportElement[];
  dataSources: string[];
  filters: any[];
  parameters: any[];
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface DataSource {
  id: string;
  name: string;
  type: 'database' | 'api' | 'file' | 'calculated';
  connection: any;
  schema: any;
  tables: any[];
  isActive: boolean;
  lastSync: string;
}

const CustomReportBuilderDashboard: React.FC = () => {
  const [reportBuilders, setReportBuilders] = useState<ReportBuilder[]>([]);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [selectedBuilder, setSelectedBuilder] = useState<ReportBuilder | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [newBuilder, setNewBuilder] = useState({
    name: '',
    description: '',
    category: 'financial'
  });

  const elementTypes = [
    { type: 'chart', label: 'Chart', icon: <BarChartIcon /> },
    { type: 'table', label: 'Table', icon: <TableChartIcon /> },
    { type: 'metric', label: 'Metric', icon: <ShowChartIcon /> },
    { type: 'text', label: 'Text', icon: <TextFieldsIcon /> },
    { type: 'image', label: 'Image', icon: <ImageIcon /> },
    { type: 'filter', label: 'Filter', icon: <FilterListIcon /> }
  ];

  useEffect(() => {
    fetchReportBuilders();
    fetchDataSources();
  }, []);

  const fetchReportBuilders = async () => {
    try {
      const response = await fetch('/api/custom-report-builder/companies/1/builders');
      const data = await response.json();
      if (data.success) {
        setReportBuilders(data.data);
      }
    } catch (error) {
      console.error('Error fetching report builders:', error);
    }
  };

  const fetchDataSources = async () => {
    try {
      const response = await fetch('/api/custom-report-builder/companies/1/data-sources');
      const data = await response.json();
      if (data.success) {
        setDataSources(data.data);
      }
    } catch (error) {
      console.error('Error fetching data sources:', error);
    }
  };

  const handleCreateBuilder = async () => {
    try {
      const response = await fetch('/api/custom-report-builder/companies/1/builders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBuilder)
      });
      
      if (response.ok) {
        fetchReportBuilders();
        setIsCreateDialogOpen(false);
        setNewBuilder({ name: '', description: '', category: 'financial' });
      }
    } catch (error) {
      console.error('Error creating report builder:', error);
    }
  };

  const handleAddElement = (type: string) => {
    if (!selectedBuilder) return;

    const newElement: ReportElement = {
      id: `element_${Date.now()}`,
      type: type as any,
      title: `New ${type}`,
      position: { x: 0, y: 0, width: 4, height: 3 },
      config: {},
      dataSource: '',
      query: '',
      filters: [],
      styling: {}
    };

    const updatedBuilder = {
      ...selectedBuilder,
      elements: [...selectedBuilder.elements, newElement]
    };

    setSelectedBuilder(updatedBuilder);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination || !selectedBuilder) return;

    const elements = Array.from(selectedBuilder.elements);
    const [reorderedElement] = elements.splice(result.source.index, 1);
    elements.splice(result.destination.index, 0, reorderedElement);

    setSelectedBuilder({
      ...selectedBuilder,
      elements
    });
  };

  const handleElementUpdate = (elementId: string, updates: Partial<ReportElement>) => {
    if (!selectedBuilder) return;

    const updatedElements = selectedBuilder.elements.map(element =>
      element.id === elementId ? { ...element, ...updates } : element
    );

    setSelectedBuilder({
      ...selectedBuilder,
      elements: updatedElements
    });
  };

  const handleDeleteElement = (elementId: string) => {
    if (!selectedBuilder) return;

    const updatedElements = selectedBuilder.elements.filter(element => element.id !== elementId);
    setSelectedBuilder({
      ...selectedBuilder,
      elements: updatedElements
    });
  };

  const handlePreview = async () => {
    if (!selectedBuilder) return;

    try {
      const response = await fetch(`/api/custom-report-builder/builders/${selectedBuilder.id}/preview`, {
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
    if (!selectedBuilder) return;

    try {
      const response = await fetch(`/api/custom-report-builder/builders/${selectedBuilder.id}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format, parameters: {} })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const renderElement = (element: ReportElement) => {
    switch (element.type) {
      case 'chart':
        return (
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom>
                {element.title}
              </Typography>
              <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChartIcon sx={{ fontSize: 48, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        );
      case 'table':
        return (
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom>
                {element.title}
              </Typography>
              <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TableChartIcon sx={{ fontSize: 48, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        );
      case 'metric':
        return (
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                {element.title}
              </Typography>
              <Typography variant="h3" color="primary">
                $0
              </Typography>
            </CardContent>
          </Card>
        );
      case 'text':
        return (
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom>
                {element.title}
              </Typography>
              <Typography variant="body1">
                Sample text content
              </Typography>
            </CardContent>
          </Card>
        );
      default:
        return (
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom>
                {element.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {element.type} element
              </Typography>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Custom Report Builder
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Create custom reports with drag-and-drop interface
      </Typography>

      <Grid container spacing={3}>
        {/* Report Builders List */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Report Builders</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsCreateDialogOpen(true)}
              >
                New Builder
              </Button>
            </Box>
            
            {reportBuilders.map((builder) => (
              <Card 
                key={builder.id} 
                sx={{ 
                  mb: 1, 
                  cursor: 'pointer',
                  border: selectedBuilder?.id === builder.id ? 2 : 1,
                  borderColor: selectedBuilder?.id === builder.id ? 'primary.main' : 'divider'
                }}
                onClick={() => setSelectedBuilder(builder)}
              >
                <CardContent>
                  <Typography variant="h6">{builder.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {builder.description}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip 
                      label={`${builder.elements.length} elements`} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Paper>
        </Grid>

        {/* Report Builder Editor */}
        <Grid item xs={12} md={8}>
          {selectedBuilder ? (
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">{selectedBuilder.name}</Typography>
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
                    onClick={() => setIsExportDialogOpen(true)}
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
                    startIcon={<ScheduleIcon />}
                  >
                    Schedule
                  </Button>
                </Box>
              </Box>

              <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
                <Tab label="Design" />
                <Tab label="Data Sources" />
                <Tab label="Filters" />
                <Tab label="Settings" />
              </Tabs>

              {activeTab === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Drag & Drop Elements
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    {elementTypes.map((elementType) => (
                      <Button
                        key={elementType.type}
                        variant="outlined"
                        startIcon={elementType.icon}
                        onClick={() => handleAddElement(elementType.type)}
                        sx={{ mr: 1, mb: 1 }}
                      >
                        Add {elementType.label}
                      </Button>
                    ))}
                  </Box>

                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="report-elements">
                      {(provided) => (
                        <Grid container spacing={2} {...provided.droppableProps} ref={provided.innerRef}>
                          {selectedBuilder.elements.map((element, index) => (
                            <Draggable key={element.id} draggableId={element.id} index={index}>
                              {(provided, snapshot) => (
                                <Grid 
                                  item 
                                  xs={12} 
                                  sm={6} 
                                  md={4} 
                                  lg={3}
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <Box sx={{ position: 'relative' }}>
                                    {renderElement(element)}
                                    <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                                      <Tooltip title="Edit">
                                        <IconButton size="small" color="primary">
                                          <EditIcon />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="Delete">
                                        <IconButton 
                                          size="small" 
                                          color="error"
                                          onClick={() => handleDeleteElement(element.id)}
                                        >
                                          <DeleteIcon />
                                        </IconButton>
                                      </Tooltip>
                                    </Box>
                                  </Box>
                                </Grid>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </Grid>
                      )}
                    </Droppable>
                  </DragDropContext>
                </Box>
              )}

              {activeTab === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Data Sources
                  </Typography>
                  {dataSources.map((source) => (
                    <Accordion key={source.id}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>{source.name}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" color="text.secondary">
                          Type: {source.type}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Tables: {source.tables.length}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              )}

              {activeTab === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Report Filters
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Configure filters for your report
                  </Typography>
                </Box>
              )}

              {activeTab === 3 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Report Settings
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Configure report settings and permissions
                  </Typography>
                </Box>
              )}
            </Paper>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                Select a report builder to start editing
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Create Report Builder Dialog */}
      <Dialog open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Report Builder</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={newBuilder.name}
            onChange={(e) => setNewBuilder({ ...newBuilder, name: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            label="Description"
            value={newBuilder.description}
            onChange={(e) => setNewBuilder({ ...newBuilder, description: e.target.value })}
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={newBuilder.category}
              onChange={(e) => setNewBuilder({ ...newBuilder, category: e.target.value })}
            >
              <MenuItem value="financial">Financial</MenuItem>
              <MenuItem value="operational">Operational</MenuItem>
              <MenuItem value="customer">Customer</MenuItem>
              <MenuItem value="inventory">Inventory</MenuItem>
              <MenuItem value="custom">Custom</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateBuilder} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onClose={() => setIsExportDialogOpen(false)}>
        <DialogTitle>Export Report</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Choose export format:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Button variant="outlined" onClick={() => handleExport('pdf')}>PDF</Button>
            <Button variant="outlined" onClick={() => handleExport('excel')}>Excel</Button>
            <Button variant="outlined" onClick={() => handleExport('csv')}>CSV</Button>
            <Button variant="outlined" onClick={() => handleExport('json')}>JSON</Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsExportDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomReportBuilderDashboard;








