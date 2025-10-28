import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper
} from '@mui/material';
import {
  Add,
  Download,
  Share,
  Email,
  Schedule,
  Powerpoint,
  PictureAsPdf,
  Slideshow,
  Summary,
  Refresh,
  Edit,
  Delete,
  Visibility,
  Send
} from '@mui/icons-material';
import { api } from '../../services/api';

interface InvestorReport {
  id: string;
  companyId: string;
  reportType: 'monthly' | 'quarterly' | 'annual';
  period: string;
  slides: InvestorSlide[];
  status: 'draft' | 'generated' | 'sent';
  createdAt: string;
  sentAt?: string;
}

interface InvestorSlide {
  slideNumber: number;
  title: string;
  type: string;
  content: any;
  charts?: any[];
}

interface SlideTemplate {
  id: string;
  name: string;
  description: string;
  required: boolean;
}

const InvestorReportBuilder: React.FC = () => {
  const [reports, setReports] = useState<InvestorReport[]>([]);
  const [templates, setTemplates] = useState<SlideTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [newReport, setNewReport] = useState({
    reportType: 'monthly',
    includeSlides: [] as string[],
    excludeSlides: [] as string[],
    branding: {
      logo: '',
      primaryColor: '#2196F3',
      secondaryColor: '#4CAF50'
    }
  });

  useEffect(() => {
    fetchReports();
    fetchTemplates();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/investor-reporting/company/company-123');
      setReports(response.data.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Failed to load investor reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/api/investor-reporting/templates');
      setTemplates(response.data.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const response = await api.post('/api/investor-reporting/generate', {
        companyId: 'company-123',
        reportType: newReport.reportType,
        customizations: {
          includeSlides: newReport.includeSlides,
          excludeSlides: newReport.excludeSlides,
          branding: newReport.branding
        }
      });

      const report = response.data.data;
      setReports(prev => [report, ...prev]);
      setOpenDialog(false);
      setActiveStep(0);
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Failed to generate investor report');
    }
  };

  const handleDownloadPowerPoint = async (reportId: string) => {
    try {
      const response = await api.get(`/api/investor-reporting/${reportId}/powerpoint`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `investor-report-${reportId}.pptx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading PowerPoint:', error);
    }
  };

  const handleDownloadPDF = async (reportId: string) => {
    try {
      const response = await api.get(`/api/investor-reporting/${reportId}/pdf`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `investor-report-${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const handleGenerateGoogleSlides = async (reportId: string) => {
    try {
      const response = await api.get(`/api/investor-reporting/${reportId}/google-slides`);
      const { url } = response.data.data;
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error generating Google Slides:', error);
    }
  };

  const handleDownloadSummary = async (reportId: string) => {
    try {
      const response = await api.get(`/api/investor-reporting/${reportId}/summary`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `investor-summary-${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading summary:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generated': return 'success';
      case 'sent': return 'info';
      case 'draft': return 'warning';
      default: return 'default';
    }
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'monthly': return 'primary';
      case 'quarterly': return 'secondary';
      case 'annual': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={fetchReports}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Investor Reporting
        </Typography>
        <Box>
          <IconButton onClick={fetchReports} color="primary">
            <Refresh />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
          >
            Generate Report
          </Button>
        </Box>
      </Box>

      {/* Reports Grid */}
      <Grid container spacing={3}>
        {reports.map((report) => (
          <Grid item xs={12} md={6} lg={4} key={report.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                  <Box>
                    <Typography variant="h6" component="h2">
                      {report.period} Report
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box>
                    <Chip
                      label={report.status.toUpperCase()}
                      color={getStatusColor(report.status)}
                      size="small"
                    />
                    <Chip
                      label={report.reportType.toUpperCase()}
                      color={getReportTypeColor(report.reportType)}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" mb={2}>
                  {report.slides.length} slides generated
                </Typography>

                <Box display="flex" gap={1} flexWrap="wrap">
                  <Tooltip title="Download PowerPoint">
                    <IconButton
                      size="small"
                      onClick={() => handleDownloadPowerPoint(report.id)}
                    >
                      <Powerpoint />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Download PDF">
                    <IconButton
                      size="small"
                      onClick={() => handleDownloadPDF(report.id)}
                    >
                      <PictureAsPdf />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Google Slides">
                    <IconButton
                      size="small"
                      onClick={() => handleGenerateGoogleSlides(report.id)}
                    >
                      <Slideshow />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="One-Page Summary">
                    <IconButton
                      size="small"
                      onClick={() => handleDownloadSummary(report.id)}
                    >
                      <Summary />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Share">
                    <IconButton size="small">
                      <Share />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Send Email">
                    <IconButton size="small">
                      <Email />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Generate Report Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Generate Investor Report</DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} orientation="vertical">
            <Step>
              <StepLabel>Report Type</StepLabel>
              <StepContent>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Report Type</InputLabel>
                  <Select
                    value={newReport.reportType}
                    onChange={(e) => setNewReport(prev => ({ ...prev, reportType: e.target.value as any }))}
                    label="Report Type"
                  >
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="quarterly">Quarterly</MenuItem>
                    <MenuItem value="annual">Annual</MenuItem>
                  </Select>
                </FormControl>
                <Button onClick={() => setActiveStep(1)} variant="contained">
                  Next
                </Button>
              </StepContent>
            </Step>

            <Step>
              <StepLabel>Select Slides</StepLabel>
              <StepContent>
                <Typography variant="subtitle2" gutterBottom>
                  Choose which slides to include in your report:
                </Typography>
                <List>
                  {templates.map((template) => (
                    <ListItem key={template.id}>
                      <ListItemIcon>
                        <input
                          type="checkbox"
                          checked={newReport.includeSlides.includes(template.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewReport(prev => ({
                                ...prev,
                                includeSlides: [...prev.includeSlides, template.id]
                              }));
                            } else {
                              setNewReport(prev => ({
                                ...prev,
                                includeSlides: prev.includeSlides.filter(id => id !== template.id)
                              }));
                            }
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={template.name}
                        secondary={template.description}
                      />
                      {template.required && (
                        <Chip label="Required" size="small" color="primary" />
                      )}
                    </ListItem>
                  ))}
                </List>
                <Button onClick={() => setActiveStep(2)} variant="contained" sx={{ mt: 2 }}>
                  Next
                </Button>
              </StepContent>
            </Step>

            <Step>
              <StepLabel>Branding</StepLabel>
              <StepContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Logo URL"
                      value={newReport.branding.logo}
                      onChange={(e) => setNewReport(prev => ({
                        ...prev,
                        branding: { ...prev.branding, logo: e.target.value }
                      }))}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Primary Color"
                      type="color"
                      value={newReport.branding.primaryColor}
                      onChange={(e) => setNewReport(prev => ({
                        ...prev,
                        branding: { ...prev.branding, primaryColor: e.target.value }
                      }))}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Secondary Color"
                      type="color"
                      value={newReport.branding.secondaryColor}
                      onChange={(e) => setNewReport(prev => ({
                        ...prev,
                        branding: { ...prev.branding, secondaryColor: e.target.value }
                      }))}
                    />
                  </Grid>
                </Grid>
                <Button onClick={handleGenerateReport} variant="contained" sx={{ mt: 2 }}>
                  Generate Report
                </Button>
              </StepContent>
            </Step>
          </Stepper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default InvestorReportBuilder;









