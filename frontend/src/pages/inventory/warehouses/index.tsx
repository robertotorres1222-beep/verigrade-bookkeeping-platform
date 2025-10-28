import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  LocationOn as LocationIcon,
  Storage as StorageIcon,
  TrendingUp as TrendingUpIcon,
  ExpandMore as ExpandMoreIcon,
  Map as MapIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface Warehouse {
  id: string;
  name: string;
  code: string;
  type: 'main' | 'satellite' | 'virtual' | 'consignment';
  status: 'active' | 'inactive' | 'maintenance';
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  capacity: {
    totalSpace: number;
    usedSpace: number;
    maxWeight: number;
    currentWeight: number;
  };
  operatingHours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  settings: {
    allowNegativeInventory: boolean;
    requireBinLocation: boolean;
    autoAllocate: boolean;
    fifoEnabled: boolean;
    lotTrackingEnabled: boolean;
    serialTrackingEnabled: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

interface BinLocation {
  id: string;
  warehouseId: string;
  zone: string;
  aisle: string;
  rack: string;
  shelf: string;
  bin: string;
  fullCode: string;
  type: 'storage' | 'picking' | 'receiving' | 'shipping' | 'quarantine' | 'damaged';
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  capacity: {
    maxWeight: number;
    maxVolume: number;
    currentWeight: number;
    currentVolume: number;
  };
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  temperatureZone?: string;
  hazardClass?: string;
  notes?: string;
}

const WarehousesPage: React.FC = () => {
  const { t } = useTranslation();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [binLocations, setBinLocations] = useState<BinLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'add' | 'edit' | 'view' | 'bins'>('add');
  const [formData, setFormData] = useState<Partial<Warehouse>>({});
  const [tabValue, setTabValue] = useState(0);
  const [expandedWarehouse, setExpandedWarehouse] = useState<string | false>(false);

  // Load data on component mount
  useEffect(() => {
    loadWarehouses();
  }, []);

  const loadWarehouses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/inventory/warehouses');
      if (!response.ok) throw new Error('Failed to load warehouses');

      const data = await response.json();
      setWarehouses(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load warehouses');
    } finally {
      setLoading(false);
    }
  };

  const loadBinLocations = async (warehouseId: string) => {
    try {
      const response = await fetch(`/api/inventory/warehouses/${warehouseId}/bin-locations`);
      if (!response.ok) throw new Error('Failed to load bin locations');

      const data = await response.json();
      setBinLocations(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bin locations');
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusFilter = (event: React.ChangeEvent<{ value: unknown }>) => {
    setStatusFilter(event.target.value as string);
  };

  const handleTypeFilter = (event: React.ChangeEvent<{ value: unknown }>) => {
    setTypeFilter(event.target.value as string);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, warehouse: Warehouse) => {
    setAnchorEl(event.currentTarget);
    setSelectedWarehouse(warehouse);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedWarehouse(null);
  };

  const handleDialogOpen = (type: typeof dialogType, warehouse?: Warehouse) => {
    setDialogType(type);
    setSelectedWarehouse(warehouse || null);
    setFormData(warehouse || {});
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedWarehouse(null);
    setFormData({});
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const url = dialogType === 'add' ? '/api/inventory/warehouses' : `/api/inventory/warehouses/${selectedWarehouse?.id}`;
      const method = dialogType === 'add' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save warehouse');

      setSuccess(t('Warehouse saved successfully'));
      handleDialogClose();
      loadWarehouses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save warehouse');
    }
  };

  const handleWarehouseExpand = async (warehouseId: string) => {
    if (expandedWarehouse === warehouseId) {
      setExpandedWarehouse(false);
    } else {
      setExpandedWarehouse(warehouseId);
      await loadBinLocations(warehouseId);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'success',
      inactive: 'default',
      maintenance: 'warning',
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getTypeColor = (type: string) => {
    const colors = {
      main: 'primary',
      satellite: 'secondary',
      virtual: 'info',
      consignment: 'warning',
    };
    return colors[type as keyof typeof colors] || 'default';
  };

  const getBinTypeColor = (type: string) => {
    const colors = {
      storage: 'primary',
      picking: 'success',
      receiving: 'info',
      shipping: 'warning',
      quarantine: 'error',
      damaged: 'error',
    };
    return colors[type as keyof typeof colors] || 'default';
  };

  const filteredWarehouses = warehouses.filter(warehouse => {
    const matchesSearch = !searchTerm || 
      warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warehouse.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warehouse.address.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || warehouse.status === statusFilter;
    const matchesType = typeFilter === 'all' || warehouse.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const calculateCapacityUtilization = (warehouse: Warehouse) => {
    const spaceUtilization = (warehouse.capacity.usedSpace / warehouse.capacity.totalSpace) * 100;
    const weightUtilization = (warehouse.capacity.currentWeight / warehouse.capacity.maxWeight) * 100;
    return { spaceUtilization, weightUtilization };
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {t('Warehouse Management')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleDialogOpen('add')}
        >
          {t('Add Warehouse')}
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label={t('Search')}
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                select
                label={t('Status')}
                value={statusFilter}
                onChange={handleStatusFilter}
              >
                <option value="all">{t('All Status')}</option>
                <option value="active">{t('Active')}</option>
                <option value="inactive">{t('Inactive')}</option>
                <option value="maintenance">{t('Maintenance')}</option>
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                select
                label={t('Type')}
                value={typeFilter}
                onChange={handleTypeFilter}
              >
                <option value="all">{t('All Types')}</option>
                <option value="main">{t('Main')}</option>
                <option value="satellite">{t('Satellite')}</option>
                <option value="virtual">{t('Virtual')}</option>
                <option value="consignment">{t('Consignment')}</option>
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={() => {/* Implement advanced filters */}}
                >
                  {t('Advanced Filters')}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<MapIcon />}
                  onClick={() => {/* Implement warehouse map */}}
                >
                  {t('Warehouse Map')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Warehouses List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {filteredWarehouses.map((warehouse) => {
          const { spaceUtilization, weightUtilization } = calculateCapacityUtilization(warehouse);
          
          return (
            <Card key={warehouse.id}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" component="h2">
                      {warehouse.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {warehouse.code} • {warehouse.address.city}, {warehouse.address.state}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Chip
                        label={t(warehouse.status)}
                        color={getStatusColor(warehouse.status) as any}
                        size="small"
                      />
                      <Chip
                        label={t(warehouse.type)}
                        color={getTypeColor(warehouse.type) as any}
                        size="small"
                      />
                    </Box>
                  </Box>
                  <IconButton
                    onClick={(e) => handleMenuClick(e, warehouse)}
                    size="small"
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>

                {/* Capacity Utilization */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    {t('Capacity Utilization')}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption">{t('Space')}</Typography>
                        <Typography variant="caption">{spaceUtilization.toFixed(1)}%</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={spaceUtilization}
                        color={spaceUtilization > 80 ? 'error' : spaceUtilization > 60 ? 'warning' : 'success'}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption">{t('Weight')}</Typography>
                        <Typography variant="caption">{weightUtilization.toFixed(1)}%</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={weightUtilization}
                        color={weightUtilization > 80 ? 'error' : weightUtilization > 60 ? 'warning' : 'success'}
                      />
                    </Box>
                  </Box>
                </Box>

                {/* Warehouse Details */}
                <Accordion
                  expanded={expandedWarehouse === warehouse.id}
                  onChange={() => handleWarehouseExpand(warehouse.id)}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">
                      {t('Warehouse Details')}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom>
                          {t('Contact Information')}
                        </Typography>
                        <Typography variant="body2">
                          {warehouse.contact.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {warehouse.contact.email}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {warehouse.contact.phone}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom>
                          {t('Address')}
                        </Typography>
                        <Typography variant="body2">
                          {warehouse.address.street}
                        </Typography>
                        <Typography variant="body2">
                          {warehouse.address.city}, {warehouse.address.state} {warehouse.address.zipCode}
                        </Typography>
                        <Typography variant="body2">
                          {warehouse.address.country}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                          {t('Operating Hours')}
                        </Typography>
                        <Grid container spacing={1}>
                          {Object.entries(warehouse.operatingHours).map(([day, hours]) => (
                            <Grid item xs={6} sm={4} md={3} key={day}>
                              <Typography variant="caption" display="block">
                                {t(day)}: {hours.closed ? t('Closed') : `${hours.open} - ${hours.close}`}
                              </Typography>
                            </Grid>
                          ))}
                        </Grid>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                          {t('Settings')}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {Object.entries(warehouse.settings).map(([key, value]) => (
                            <Chip
                              key={key}
                              label={`${t(key)}: ${value ? t('Yes') : t('No')}`}
                              size="small"
                              color={value ? 'success' : 'default'}
                            />
                          ))}
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Bin Locations */}
                    {expandedWarehouse === warehouse.id && binLocations.length > 0 && (
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          {t('Bin Locations')} ({binLocations.length})
                        </Typography>
                        <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>{t('Code')}</TableCell>
                                <TableCell>{t('Type')}</TableCell>
                                <TableCell>{t('Status')}</TableCell>
                                <TableCell>{t('Capacity')}</TableCell>
                                <TableCell>{t('Temperature Zone')}</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {binLocations.map((bin) => (
                                <TableRow key={bin.id}>
                                  <TableCell>
                                    <Typography variant="body2" fontFamily="monospace">
                                      {bin.fullCode}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={t(bin.type)}
                                      color={getBinTypeColor(bin.type) as any}
                                      size="small"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={t(bin.status)}
                                      color={bin.status === 'available' ? 'success' : 'default'}
                                      size="small"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2">
                                      {bin.capacity.currentWeight.toFixed(1)} / {bin.capacity.maxWeight} kg
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2">
                                      {bin.temperatureZone || '-'}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    )}
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleDialogOpen('view', selectedWarehouse!)}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('View Details')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleDialogOpen('edit', selectedWarehouse!)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('Edit')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleDialogOpen('bins', selectedWarehouse!)}>
          <ListItemIcon>
            <LocationIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('Manage Bin Locations')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {/* Implement capacity report */}}>
          <ListItemIcon>
            <TrendingUpIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('Capacity Report')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {/* Implement settings */}}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('Settings')}</ListItemText>
        </MenuItem>
      </Menu>

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogType === 'add' && t('Add Warehouse')}
          {dialogType === 'edit' && t('Edit Warehouse')}
          {dialogType === 'view' && t('Warehouse Details')}
          {dialogType === 'bins' && t('Manage Bin Locations')}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleFormSubmit}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('Warehouse Name')}
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={dialogType === 'view'}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('Warehouse Code')}
                  value={formData.code || ''}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                  disabled={dialogType === 'view'}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label={t('Type')}
                  value={formData.type || ''}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  required
                  disabled={dialogType === 'view'}
                >
                  <MenuItem value="main">{t('Main')}</MenuItem>
                  <MenuItem value="satellite">{t('Satellite')}</MenuItem>
                  <MenuItem value="virtual">{t('Virtual')}</MenuItem>
                  <MenuItem value="consignment">{t('Consignment')}</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label={t('Status')}
                  value={formData.status || ''}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  required
                  disabled={dialogType === 'view'}
                >
                  <MenuItem value="active">{t('Active')}</MenuItem>
                  <MenuItem value="inactive">{t('Inactive')}</MenuItem>
                  <MenuItem value="maintenance">{t('Maintenance')}</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('Address')}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('Street Address')}
                  value={formData.address?.street || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address!, street: e.target.value }
                  })}
                  required
                  disabled={dialogType === 'view'}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={t('City')}
                  value={formData.address?.city || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address!, city: e.target.value }
                  })}
                  required
                  disabled={dialogType === 'view'}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={t('State')}
                  value={formData.address?.state || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address!, state: e.target.value }
                  })}
                  required
                  disabled={dialogType === 'view'}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={t('ZIP Code')}
                  value={formData.address?.zipCode || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address!, zipCode: e.target.value }
                  })}
                  required
                  disabled={dialogType === 'view'}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('Contact Information')}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={t('Contact Name')}
                  value={formData.contact?.name || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    contact: { ...formData.contact!, name: e.target.value }
                  })}
                  required
                  disabled={dialogType === 'view'}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={t('Email')}
                  type="email"
                  value={formData.contact?.email || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    contact: { ...formData.contact!, email: e.target.value }
                  })}
                  required
                  disabled={dialogType === 'view'}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={t('Phone')}
                  value={formData.contact?.phone || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    contact: { ...formData.contact!, phone: e.target.value }
                  })}
                  required
                  disabled={dialogType === 'view'}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('Capacity')}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('Total Space (cubic feet)')}
                  type="number"
                  value={formData.capacity?.totalSpace || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    capacity: { ...formData.capacity!, totalSpace: Number(e.target.value) }
                  })}
                  required
                  disabled={dialogType === 'view'}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('Max Weight (pounds)')}
                  type="number"
                  value={formData.capacity?.maxWeight || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    capacity: { ...formData.capacity!, maxWeight: Number(e.target.value) }
                  })}
                  required
                  disabled={dialogType === 'view'}
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>
            {dialogType === 'view' ? t('Close') : t('Cancel')}
          </Button>
          {dialogType !== 'view' && (
            <Button onClick={handleFormSubmit} variant="contained">
              {dialogType === 'add' ? t('Add') : t('Save')}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WarehousesPage;









