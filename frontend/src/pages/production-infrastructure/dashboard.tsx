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
  LinearProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  Cloud as CloudIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  Monitor as MonitorIcon,
  Backup as BackupIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';

interface KubernetesCluster {
  id: string;
  name: string;
  provider: 'aws' | 'gcp' | 'azure' | 'on-premise';
  region: string;
  version: string;
  nodeCount: number;
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  config: any;
  createdAt: string;
  updatedAt: string;
}

interface HelmChart {
  id: string;
  name: string;
  version: string;
  repository: string;
  namespace: string;
  values: any;
  status: 'deployed' | 'pending' | 'failed' | 'upgrading';
  deployedAt: string;
  updatedAt: string;
}

interface Secret {
  id: string;
  name: string;
  namespace: string;
  type: 'kubernetes' | 'aws-secrets-manager' | 'vault' | 'azure-key-vault';
  data: any;
  encrypted: boolean;
  rotationEnabled: boolean;
  lastRotated: string;
  nextRotation: string;
  createdAt: string;
  updatedAt: string;
}

const ProductionInfrastructureDashboard: React.FC = () => {
  const [clusters, setClusters] = useState<KubernetesCluster[]>([]);
  const [helmCharts, setHelmCharts] = useState<HelmChart[]>([]);
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<KubernetesCluster | null>(null);
  const [isCreateClusterDialogOpen, setIsCreateClusterDialogOpen] = useState(false);
  const [isCreateChartDialogOpen, setIsCreateChartDialogOpen] = useState(false);
  const [isCreateSecretDialogOpen, setIsCreateSecretDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [newCluster, setNewCluster] = useState({
    name: '',
    provider: 'aws',
    region: '',
    version: '1.28',
    nodeCount: 3
  });
  const [newChart, setNewChart] = useState({
    name: '',
    version: '',
    repository: '',
    namespace: 'default'
  });
  const [newSecret, setNewSecret] = useState({
    name: '',
    namespace: 'default',
    type: 'kubernetes',
    data: {}
  });

  const providers = [
    { value: 'aws', label: 'Amazon Web Services', icon: <CloudIcon /> },
    { value: 'gcp', label: 'Google Cloud Platform', icon: <CloudIcon /> },
    { value: 'azure', label: 'Microsoft Azure', icon: <CloudIcon /> },
    { value: 'on-premise', label: 'On-Premise', icon: <StorageIcon /> }
  ];

  const secretTypes = [
    { value: 'kubernetes', label: 'Kubernetes Secret' },
    { value: 'aws-secrets-manager', label: 'AWS Secrets Manager' },
    { value: 'vault', label: 'HashiCorp Vault' },
    { value: 'azure-key-vault', label: 'Azure Key Vault' }
  ];

  useEffect(() => {
    fetchClusters();
    fetchHelmCharts();
    fetchSecrets();
  }, []);

  const fetchClusters = async () => {
    try {
      const response = await fetch('/api/production-infrastructure/companies/1/clusters');
      const data = await response.json();
      if (data.success) {
        setClusters(data.data);
      }
    } catch (error) {
      console.error('Error fetching clusters:', error);
    }
  };

  const fetchHelmCharts = async () => {
    try {
      const response = await fetch('/api/production-infrastructure/companies/1/helm-charts');
      const data = await response.json();
      if (data.success) {
        setHelmCharts(data.data);
      }
    } catch (error) {
      console.error('Error fetching Helm charts:', error);
    }
  };

  const fetchSecrets = async () => {
    try {
      const response = await fetch('/api/production-infrastructure/companies/1/secrets');
      const data = await response.json();
      if (data.success) {
        setSecrets(data.data);
      }
    } catch (error) {
      console.error('Error fetching secrets:', error);
    }
  };

  const handleCreateCluster = async () => {
    try {
      const response = await fetch('/api/production-infrastructure/companies/1/clusters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCluster)
      });
      
      if (response.ok) {
        fetchClusters();
        setIsCreateClusterDialogOpen(false);
        setNewCluster({ name: '', provider: 'aws', region: '', version: '1.28', nodeCount: 3 });
      }
    } catch (error) {
      console.error('Error creating cluster:', error);
    }
  };

  const handleCreateChart = async () => {
    try {
      const response = await fetch('/api/production-infrastructure/companies/1/helm-charts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newChart)
      });
      
      if (response.ok) {
        fetchHelmCharts();
        setIsCreateChartDialogOpen(false);
        setNewChart({ name: '', version: '', repository: '', namespace: 'default' });
      }
    } catch (error) {
      console.error('Error creating Helm chart:', error);
    }
  };

  const handleCreateSecret = async () => {
    try {
      const response = await fetch('/api/production-infrastructure/companies/1/secrets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSecret)
      });
      
      if (response.ok) {
        fetchSecrets();
        setIsCreateSecretDialogOpen(false);
        setNewSecret({ name: '', namespace: 'default', type: 'kubernetes', data: {} });
      }
    } catch (error) {
      console.error('Error creating secret:', error);
    }
  };

  const handleRotateSecret = async (secretId: string) => {
    try {
      const response = await fetch(`/api/production-infrastructure/secrets/${secretId}/rotate`, {
        method: 'POST'
      });
      
      if (response.ok) {
        fetchSecrets();
      }
    } catch (error) {
      console.error('Error rotating secret:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'deployed':
        return <CheckCircleIcon color="success" />;
      case 'error':
      case 'failed':
        return <ErrorIcon color="error" />;
      case 'pending':
      case 'upgrading':
        return <WarningIcon color="warning" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'deployed':
        return 'success';
      case 'error':
      case 'failed':
        return 'error';
      case 'pending':
      case 'upgrading':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Production Infrastructure
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage Kubernetes clusters, Helm charts, secrets, and infrastructure components
      </Typography>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Clusters" />
        <Tab label="Helm Charts" />
        <Tab label="Secrets" />
        <Tab label="Load Balancers" />
        <Tab label="Auto-scaling" />
        <Tab label="Monitoring" />
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Kubernetes Clusters</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsCreateClusterDialogOpen(true)}
              >
                Create Cluster
              </Button>
            </Box>
            
            <Grid container spacing={2}>
              {clusters.map((cluster) => (
                <Grid item xs={12} sm={6} md={4} key={cluster.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      border: selectedCluster?.id === cluster.id ? 2 : 1,
                      borderColor: selectedCluster?.id === cluster.id ? 'primary.main' : 'divider'
                    }}
                    onClick={() => setSelectedCluster(cluster)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6">{cluster.name}</Typography>
                        {getStatusIcon(cluster.status)}
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {providers.find(p => p.value === cluster.provider)?.label} • {cluster.region}
                      </Typography>
                      <Box sx={{ mb: 1 }}>
                        <Chip 
                          label={cluster.status} 
                          size="small" 
                          color={getStatusColor(cluster.status) as any}
                          variant="outlined"
                        />
                        <Chip 
                          label={`${cluster.nodeCount} nodes`} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                          sx={{ ml: 1 }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Version: {cluster.version}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Helm Charts</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsCreateChartDialogOpen(true)}
              >
                Deploy Chart
              </Button>
            </Box>
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Version</TableCell>
                    <TableCell>Repository</TableCell>
                    <TableCell>Namespace</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Deployed</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {helmCharts.map((chart) => (
                    <TableRow key={chart.id}>
                      <TableCell>{chart.name}</TableCell>
                      <TableCell>{chart.version}</TableCell>
                      <TableCell>{chart.repository}</TableCell>
                      <TableCell>{chart.namespace}</TableCell>
                      <TableCell>
                        <Chip 
                          label={chart.status} 
                          size="small" 
                          color={getStatusColor(chart.status) as any}
                          icon={getStatusIcon(chart.status)}
                        />
                      </TableCell>
                      <TableCell>
                        {chart.deployedAt ? new Date(chart.deployedAt).toLocaleDateString() : 'Not deployed'}
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Secrets Management</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsCreateSecretDialogOpen(true)}
              >
                Create Secret
              </Button>
            </Box>
            
            <Grid container spacing={2}>
              {secrets.map((secret) => (
                <Grid item xs={12} sm={6} md={4} key={secret.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6">{secret.name}</Typography>
                        <SecurityIcon color="primary" />
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {secret.namespace} • {secretTypes.find(t => t.value === secret.type)?.label}
                      </Typography>
                      <Box sx={{ mb: 1 }}>
                        <Chip 
                          label={secret.encrypted ? 'Encrypted' : 'Plain'} 
                          size="small" 
                          color={secret.encrypted ? 'success' : 'warning'}
                          variant="outlined"
                        />
                        {secret.rotationEnabled && (
                          <Chip 
                            label="Auto-rotate" 
                            size="small" 
                            color="info" 
                            variant="outlined"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Last rotated: {secret.lastRotated ? new Date(secret.lastRotated).toLocaleDateString() : 'Never'}
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<RefreshIcon />}
                        onClick={() => handleRotateSecret(secret.id)}
                      >
                        Rotate
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      )}

      {activeTab === 3 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Load Balancers
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure and manage load balancers for your infrastructure
          </Typography>
        </Box>
      )}

      {activeTab === 4 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Auto-scaling Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Set up horizontal and vertical pod autoscaling
          </Typography>
        </Box>
      )}

      {activeTab === 5 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Monitoring & Observability
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure Prometheus, Grafana, Jaeger, and Elasticsearch
          </Typography>
        </Box>
      )}

      {/* Create Cluster Dialog */}
      <Dialog open={isCreateClusterDialogOpen} onClose={() => setIsCreateClusterDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Kubernetes Cluster</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Cluster Name"
                value={newCluster.name}
                onChange={(e) => setNewCluster({ ...newCluster, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Provider</InputLabel>
                <Select
                  value={newCluster.provider}
                  onChange={(e) => setNewCluster({ ...newCluster, provider: e.target.value })}
                >
                  {providers.map((provider) => (
                    <MenuItem key={provider.value} value={provider.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {provider.icon}
                        <Typography sx={{ ml: 1 }}>{provider.label}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Region"
                value={newCluster.region}
                onChange={(e) => setNewCluster({ ...newCluster, region: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Kubernetes Version"
                value={newCluster.version}
                onChange={(e) => setNewCluster({ ...newCluster, version: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Node Count"
                type="number"
                value={newCluster.nodeCount}
                onChange={(e) => setNewCluster({ ...newCluster, nodeCount: parseInt(e.target.value) })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateClusterDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateCluster} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Create Helm Chart Dialog */}
      <Dialog open={isCreateChartDialogOpen} onClose={() => setIsCreateChartDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Deploy Helm Chart</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Chart Name"
                value={newChart.name}
                onChange={(e) => setNewChart({ ...newChart, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Version"
                value={newChart.version}
                onChange={(e) => setNewChart({ ...newChart, version: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Repository"
                value={newChart.repository}
                onChange={(e) => setNewChart({ ...newChart, repository: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Namespace"
                value={newChart.namespace}
                onChange={(e) => setNewChart({ ...newChart, namespace: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateChartDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateChart} variant="contained">Deploy</Button>
        </DialogActions>
      </Dialog>

      {/* Create Secret Dialog */}
      <Dialog open={isCreateSecretDialogOpen} onClose={() => setIsCreateSecretDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Secret</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Secret Name"
                value={newSecret.name}
                onChange={(e) => setNewSecret({ ...newSecret, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Namespace"
                value={newSecret.namespace}
                onChange={(e) => setNewSecret({ ...newSecret, namespace: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Secret Type</InputLabel>
                <Select
                  value={newSecret.type}
                  onChange={(e) => setNewSecret({ ...newSecret, type: e.target.value })}
                >
                  {secretTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateSecretDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateSecret} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductionInfrastructureDashboard;




