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
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
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
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  FileUpload as FileUploadIcon,
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
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';

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
  autoRenewal: boolean;
  noticePeriodDays: number;
}

interface ContractMetrics {
  totalContracts: number;
  totalValue: number;
  activeContracts: number;
  expiringSoon: number;
  highRiskContracts: number;
  averageRiskScore: number;
  renewalRate: number;
}

interface RenewalData {
  month: string;
  count: number;
  value: number;
}

interface RiskDistribution {
  level: string;
  count: number;
  color: string;
}

const ContractDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<ContractAnalysis[]>([]);
  const [metrics, setMetrics] = useState<ContractMetrics | null>(null);
  const [renewalData, setRenewalData] = useState<RenewalData[]>([]);
  const [riskDistribution, setRiskDistribution] = useState<RiskDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedContract, setSelectedContract] = useState<ContractAnalysis | null>(null);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    fetchContractData();
  }, []);

  const fetchContractData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/contracts/company/company-id');
      const data = await response.json();
      
      if (data.success) {
        setContracts(data.data);
        calculateMetrics(data.data);
        generateRenewalData(data.data);
        generateRiskDistribution(data.data);
      } else {
        setError('Failed to fetch contract data');
      }
    } catch (err) {
      setError('Error fetching contract data');
      console.error('Fetch contract data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (contracts: ContractAnalysis[]) => {
    const totalContracts = contracts.length;
    const totalValue = contracts.reduce((sum, contract) => sum + contract.contractValue, 0);
    const activeContracts = contracts.filter(c => c.contractStatus === 'active').length;
    const expiringSoon = contracts.filter(c => {
      const renewalDate = new Date(c.renewalDate);
      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
      return renewalDate <= threeMonthsFromNow;
    }).length;
    const highRiskContracts = contracts.filter(c => c.riskScore >= 70).length;
    const averageRiskScore = contracts.reduce((sum, contract) => sum + contract.riskScore, 0) / totalContracts;
    const renewalRate = contracts.filter(c => c.autoRenewal).length / totalContracts * 100;

    setMetrics({
      totalContracts,
      totalValue,
      activeContracts,
      expiringSoon,
      highRiskContracts,
      averageRiskScore,
      renewalRate
    });
  };

  const generateRenewalData = (contracts: ContractAnalysis[]) => {
    const monthlyData: { [key: string]: { count: number; value: number } } = {};
    
    contracts.forEach(contract => {
      const renewalDate = new Date(contract.renewalDate);
      const month = renewalDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (!monthlyData[month]) {
        monthlyData[month] = { count: 0, value: 0 };
      }
      monthlyData[month].count += 1;
      monthlyData[month].value += contract.contractValue;
    });

    const data = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      count: data.count,
      value: data.value
    }));

    setRenewalData(data);
  };

  const generateRiskDistribution = (contracts: ContractAnalysis[]) => {
    const distribution: { [key: string]: number } = {
      'Low Risk': 0,
      'Medium Risk': 0,
      'High Risk': 0,
      'Critical Risk': 0
    };

    contracts.forEach(contract => {
      if (contract.riskScore < 30) distribution['Low Risk']++;
      else if (contract.riskScore < 50) distribution['Medium Risk']++;
      else if (contract.riskScore < 70) distribution['High Risk']++;
      else distribution['Critical Risk']++;
    });

    const data = Object.entries(distribution).map(([level, count], index) => ({
      level,
      count,
      color: COLORS[index % COLORS.length]
    }));

    setRiskDistribution(data);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('pdf', selectedFile);

      const response = await fetch('/api/contracts/parse-pdf/company-id', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        setUploadDialogOpen(false);
        setSelectedFile(null);
        fetchContractData();
      } else {
        setError('Failed to upload contract');
      }
    } catch (err) {
      setError('Error uploading contract');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, contract: ContractAnalysis) => {
    setAnchorEl(event.currentTarget);
    setSelectedContract(contract);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedContract(null);
  };

  const handleViewContract = () => {
    if (selectedContract) {
      navigate(`/contracts/${selectedContract.id}`);
    }
    handleMenuClose();
  };

  const handleEditContract = () => {
    if (selectedContract) {
      navigate(`/contracts/${selectedContract.id}/edit`);
    }
    handleMenuClose();
  };

  const handleDeleteContract = async () => {
    if (selectedContract) {
      try {
        const response = await fetch(`/api/contracts/analysis/${selectedContract.id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          fetchContractData();
        } else {
          setError('Failed to delete contract');
        }
      } catch (err) {
        setError('Error deleting contract');
        console.error('Delete error:', err);
      }
    }
    handleMenuClose();
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

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Contract Management Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setUploadDialogOpen(true)}
        >
          Upload Contract
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Metrics Cards */}
      {metrics && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <DescriptionIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Total Contracts</Typography>
                </Box>
                <Typography variant="h4">{metrics.totalContracts}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AttachMoneyIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6">Total Value</Typography>
                </Box>
                <Typography variant="h4">${metrics.totalValue.toLocaleString()}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6">Active Contracts</Typography>
                </Box>
                <Typography variant="h4">{metrics.activeContracts}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <WarningIcon color="warning" sx={{ mr: 1 }} />
                  <Typography variant="h6">Expiring Soon</Typography>
                </Box>
                <Typography variant="h4">{metrics.expiringSoon}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Contract Renewals by Month
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={renewalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Risk Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ level, count }) => `${level}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Contracts Table */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Contracts</Typography>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchContractData}
            >
              Refresh
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Contract Name</TableCell>
                  <TableCell>Vendor</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Risk Score</TableCell>
                  <TableCell>Renewal Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">{contract.contractName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {contract.contractType}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{contract.vendorName}</TableCell>
                    <TableCell>
                      ${contract.contractValue.toLocaleString()} {contract.currency}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={contract.contractStatus}
                        color={getStatusColor(contract.contractStatus) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${contract.riskScore}%`}
                        color={getRiskColor(contract.riskScore) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(contract.renewalDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={(e) => handleMenuClick(e, contract)}
                        size="small"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Contract PDF</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              style={{ display: 'none' }}
              id="contract-upload"
            />
            <label htmlFor="contract-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<FileUploadIcon />}
                fullWidth
                sx={{ mb: 2 }}
              >
                Choose PDF File
              </Button>
            </label>
            {selectedFile && (
              <Typography variant="body2" color="text.secondary">
                Selected: {selectedFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleFileUpload}
            variant="contained"
            disabled={!selectedFile || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Contract Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewContract}>
          <VisibilityIcon sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleEditContract}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Contract
        </MenuItem>
        <MenuItem onClick={handleDeleteContract} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Contract
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ContractDashboard;






