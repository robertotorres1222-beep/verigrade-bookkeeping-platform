import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  LinearProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Tooltip,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  AttachMoney as AttachMoneyIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  Security as SecurityIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useParams, useNavigate } from 'react-router-dom';

interface ContractAnalysis {
  id: string;
  contractName: string;
  contractType: string;
  vendorName: string;
  contractValue: number;
  currency: string;
  startDate: string;
  endDate: string;
  renewalDate: string;
  contractStatus: string;
  riskScore: number;
  confidenceScore: number;
  extractedTerms: any;
  revenueRecognitionSchedule: any;
  renewalTerms: any;
  terminationClauses: any;
  autoRenewal: boolean;
  noticePeriodDays: number;
}

interface RevenueSchedule {
  period: string;
  amount: number;
  status: string;
  date: string;
}

interface RiskAssessment {
  category: string;
  level: string;
  score: number;
  description: string;
  mitigationStrategy: string;
}

interface UpsellOpportunity {
  id: string;
  opportunityType: string;
  description: string;
  potentialValue: number;
  probability: number;
  expectedCloseDate: string;
  status: string;
}

interface ContractModification {
  id: string;
  modificationType: string;
  description: string;
  effectiveDate: string;
  impact: {
    revenue: number;
    cost: number;
    risk: number;
  };
  approvalRequired: boolean;
  status: string;
}

const ContractAnalysis: React.FC = () => {
  const { contractId } = useParams<{ contractId: string }>();
  const navigate = useNavigate();
  const [contract, setContract] = useState<ContractAnalysis | null>(null);
  const [revenueSchedule, setRevenueSchedule] = useState<RevenueSchedule[]>([]);
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);
  const [upsellOpportunities, setUpsellOpportunities] = useState<UpsellOpportunity[]>([]);
  const [modifications, setModifications] = useState<ContractModification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [modificationDialogOpen, setModificationDialogOpen] = useState(false);
  const [newModification, setNewModification] = useState({
    modificationType: '',
    description: '',
    effectiveDate: '',
    impact: {
      revenue: 0,
      cost: 0,
      risk: 0
    },
    approvalRequired: true
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    if (contractId) {
      fetchContractAnalysis();
    }
  }, [contractId]);

  const fetchContractAnalysis = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/contracts/analysis/${contractId}`);
      const data = await response.json();
      
      if (data.success) {
        setContract(data.data);
        fetchRevenueSchedule();
        fetchRiskAssessments();
        fetchUpsellOpportunities();
        fetchModifications();
      } else {
        setError('Failed to fetch contract analysis');
      }
    } catch (err) {
      setError('Error fetching contract analysis');
      console.error('Fetch contract analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueSchedule = async () => {
    try {
      const response = await fetch(`/api/contracts/revenue-schedule/${contractId}`);
      const data = await response.json();
      
      if (data.success) {
        setRevenueSchedule(data.data);
      }
    } catch (err) {
      console.error('Fetch revenue schedule error:', err);
    }
  };

  const fetchRiskAssessments = async () => {
    try {
      const response = await fetch(`/api/contracts/risk-dashboard/${contractId}`);
      const data = await response.json();
      
      if (data.success) {
        setRiskAssessments(data.data.riskAssessments || []);
      }
    } catch (err) {
      console.error('Fetch risk assessments error:', err);
    }
  };

  const fetchUpsellOpportunities = async () => {
    try {
      const response = await fetch(`/api/contracts/upsell-opportunities/${contractId}`);
      const data = await response.json();
      
      if (data.success) {
        setUpsellOpportunities(data.data);
      }
    } catch (err) {
      console.error('Fetch upsell opportunities error:', err);
    }
  };

  const fetchModifications = async () => {
    try {
      const response = await fetch(`/api/contracts/modifications/${contractId}`);
      const data = await response.json();
      
      if (data.success) {
        setModifications(data.data);
      }
    } catch (err) {
      console.error('Fetch modifications error:', err);
    }
  };

  const handleAddModification = async () => {
    try {
      const response = await fetch(`/api/contracts/modification/${contractId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newModification)
      });

      const data = await response.json();
      
      if (data.success) {
        setModificationDialogOpen(false);
        setNewModification({
          modificationType: '',
          description: '',
          effectiveDate: '',
          impact: {
            revenue: 0,
            cost: 0,
            risk: 0
          },
          approvalRequired: true
        });
        fetchModifications();
      } else {
        setError('Failed to add modification');
      }
    } catch (err) {
      setError('Error adding modification');
      console.error('Add modification error:', err);
    }
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore < 30) return 'success';
    if (riskScore < 50) return 'info';
    if (riskScore < 70) return 'warning';
    return 'error';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'expired': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  if (!contract) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Contract not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1">
            {contract.contractName}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {contract.vendorName} • {contract.contractType}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchContractAnalysis}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Contract Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Contract Value</Typography>
              </Box>
              <Typography variant="h4">${contract.contractValue.toLocaleString()}</Typography>
              <Typography variant="body2" color="text.secondary">
                {contract.currency}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AssessmentIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Risk Score</Typography>
              </Box>
              <Typography variant="h4">{contract.riskScore}%</Typography>
              <Chip
                label={contract.riskScore < 30 ? 'Low Risk' : contract.riskScore < 50 ? 'Medium Risk' : contract.riskScore < 70 ? 'High Risk' : 'Critical Risk'}
                color={getRiskColor(contract.riskScore) as any}
                size="small"
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ScheduleIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Renewal Date</Typography>
              </Box>
              <Typography variant="h6">
                {new Date(contract.renewalDate).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {contract.autoRenewal ? 'Auto-renewal' : 'Manual renewal'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Status</Typography>
              </Box>
              <Chip
                label={contract.contractStatus}
                color={getStatusColor(contract.contractStatus) as any}
                size="small"
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Confidence: {Math.round(contract.confidenceScore * 100)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Analysis Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
            <Tab label="Revenue Recognition" />
            <Tab label="Risk Assessment" />
            <Tab label="Upsell Opportunities" />
            <Tab label="Modifications" />
            <Tab label="Terms Analysis" />
          </Tabs>
        </Box>

        <CardContent>
          {/* Revenue Recognition Tab */}
          {selectedTab === 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Revenue Recognition Schedule</Typography>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                >
                  Export Schedule
                </Button>
              </Box>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Period</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {revenueSchedule.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.period}</TableCell>
                        <TableCell>${item.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Chip
                            label={item.status}
                            color={item.status === 'recognized' ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Risk Assessment Tab */}
          {selectedTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Risk Assessment
              </Typography>
              <Grid container spacing={2}>
                {riskAssessments.map((assessment, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6">{assessment.category}</Typography>
                          <Chip
                            label={assessment.level}
                            color={getRiskColor(assessment.score) as any}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {assessment.description}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          Mitigation Strategy:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {assessment.mitigationStrategy}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Upsell Opportunities Tab */}
          {selectedTab === 2 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Upsell Opportunities</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                >
                  Add Opportunity
                </Button>
              </Box>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Potential Value</TableCell>
                      <TableCell>Probability</TableCell>
                      <TableCell>Expected Close</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {upsellOpportunities.map((opportunity) => (
                      <TableRow key={opportunity.id}>
                        <TableCell>{opportunity.opportunityType}</TableCell>
                        <TableCell>{opportunity.description}</TableCell>
                        <TableCell>${opportunity.potentialValue.toLocaleString()}</TableCell>
                        <TableCell>{Math.round(opportunity.probability * 100)}%</TableCell>
                        <TableCell>{new Date(opportunity.expectedCloseDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Chip
                            label={opportunity.status}
                            color={opportunity.status === 'identified' ? 'info' : 'success'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Modifications Tab */}
          {selectedTab === 3 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Contract Modifications</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setModificationDialogOpen(true)}
                >
                  Add Modification
                </Button>
              </Box>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Effective Date</TableCell>
                      <TableCell>Impact</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {modifications.map((modification) => (
                      <TableRow key={modification.id}>
                        <TableCell>{modification.modificationType}</TableCell>
                        <TableCell>{modification.description}</TableCell>
                        <TableCell>{new Date(modification.effectiveDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              Revenue: ${modification.impact.revenue.toLocaleString()}
                            </Typography>
                            <Typography variant="body2">
                              Cost: ${modification.impact.cost.toLocaleString()}
                            </Typography>
                            <Typography variant="body2">
                              Risk: {modification.impact.risk}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={modification.status}
                            color={modification.status === 'approved' ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Terms Analysis Tab */}
          {selectedTab === 4 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Contract Terms Analysis
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Extracted Terms
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemText
                            primary="Contract Type"
                            secondary={contract.contractType}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Start Date"
                            secondary={new Date(contract.startDate).toLocaleDateString()}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="End Date"
                            secondary={new Date(contract.endDate).toLocaleDateString()}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Auto Renewal"
                            secondary={contract.autoRenewal ? 'Yes' : 'No'}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Notice Period"
                            secondary={`${contract.noticePeriodDays} days`}
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Risk Factors
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemIcon>
                            <WarningIcon color="error" />
                          </ListItemIcon>
                          <ListItemText
                            primary="High Risk Score"
                            secondary={`${contract.riskScore}% risk level`}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <ScheduleIcon color="warning" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Renewal Date"
                            secondary={new Date(contract.renewalDate).toLocaleDateString()}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <SecurityIcon color="info" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Confidence Score"
                            secondary={`${Math.round(contract.confidenceScore * 100)}% confidence`}
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Add Modification Dialog */}
      <Dialog open={modificationDialogOpen} onClose={() => setModificationDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Contract Modification</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Modification Type</InputLabel>
                <Select
                  value={newModification.modificationType}
                  onChange={(e) => setNewModification({ ...newModification, modificationType: e.target.value })}
                >
                  <MenuItem value="price_change">Price Change</MenuItem>
                  <MenuItem value="term_extension">Term Extension</MenuItem>
                  <MenuItem value="scope_change">Scope Change</MenuItem>
                  <MenuItem value="termination">Termination</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Effective Date"
                type="datetime-local"
                value={newModification.effectiveDate}
                onChange={(e) => setNewModification({ ...newModification, effectiveDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={newModification.description}
                onChange={(e) => setNewModification({ ...newModification, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Revenue Impact"
                type="number"
                value={newModification.impact.revenue}
                onChange={(e) => setNewModification({ 
                  ...newModification, 
                  impact: { ...newModification.impact, revenue: Number(e.target.value) }
                })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Cost Impact"
                type="number"
                value={newModification.impact.cost}
                onChange={(e) => setNewModification({ 
                  ...newModification, 
                  impact: { ...newModification.impact, cost: Number(e.target.value) }
                })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Risk Impact (%)"
                type="number"
                value={newModification.impact.risk}
                onChange={(e) => setNewModification({ 
                  ...newModification, 
                  impact: { ...newModification.impact, risk: Number(e.target.value) }
                })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModificationDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddModification} variant="contained">
            Add Modification
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContractAnalysis;









