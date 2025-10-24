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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  QrCode as QrCodeIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface SerialNumber {
  id: string;
  productId: string;
  serialNumber: string;
  lotNumber?: string;
  batchNumber?: string;
  status: 'available' | 'allocated' | 'sold' | 'returned' | 'defective' | 'recalled';
  location?: string;
  binLocation?: string;
  warehouseId?: string;
  purchaseDate?: string;
  cost?: number;
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  expirationDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  soldTo?: string;
  soldDate?: string;
  invoiceId?: string;
  returnReason?: string;
  returnDate?: string;
  recallReason?: string;
  recallDate?: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
}

interface Warehouse {
  id: string;
  name: string;
  code: string;
}

const SerialTrackingPage: React.FC = () => {
  const { t } = useTranslation();
  const [serialNumbers, setSerialNumbers] = useState<SerialNumber[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSerialNumbers, setSelectedSerialNumbers] = useState<string[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSerialNumber, setSelectedSerialNumber] = useState<SerialNumber | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'add' | 'edit' | 'view' | 'allocate' | 'return'>('add');
  const [formData, setFormData] = useState<Partial<SerialNumber>>({});
  const [tabValue, setTabValue] = useState(0);

  // Load data on component mount
  useEffect(() => {
    loadSerialNumbers();
    loadProducts();
    loadWarehouses();
  }, [currentPage, searchTerm, statusFilter, productFilter, warehouseFilter]);

  const loadSerialNumbers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(productFilter !== 'all' && { productId: productFilter }),
        ...(warehouseFilter !== 'all' && { warehouseId: warehouseFilter }),
      });

      const response = await fetch(`/api/inventory/serial-numbers?${params}`);
      if (!response.ok) throw new Error('Failed to load serial numbers');

      const data = await response.json();
      setSerialNumbers(data.data);
      setTotalPages(Math.ceil(data.total / 20));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load serial numbers');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/inventory/products');
      if (!response.ok) throw new Error('Failed to load products');

      const data = await response.json();
      setProducts(data.data);
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  };

  const loadWarehouses = async () => {
    try {
      const response = await fetch('/api/inventory/warehouses');
      if (!response.ok) throw new Error('Failed to load warehouses');

      const data = await response.json();
      setWarehouses(data.data);
    } catch (err) {
      console.error('Failed to load warehouses:', err);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (event: React.ChangeEvent<{ value: unknown }>) => {
    setStatusFilter(event.target.value as string);
    setCurrentPage(1);
  };

  const handleProductFilter = (event: React.ChangeEvent<{ value: unknown }>) => {
    setProductFilter(event.target.value as string);
    setCurrentPage(1);
  };

  const handleWarehouseFilter = (event: React.ChangeEvent<{ value: unknown }>) => {
    setWarehouseFilter(event.target.value as string);
    setCurrentPage(1);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, serialNumber: SerialNumber) => {
    setAnchorEl(event.currentTarget);
    setSelectedSerialNumber(serialNumber);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSerialNumber(null);
  };

  const handleDialogOpen = (type: typeof dialogType, serialNumber?: SerialNumber) => {
    setDialogType(type);
    setSelectedSerialNumber(serialNumber || null);
    setFormData(serialNumber || {});
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedSerialNumber(null);
    setFormData({});
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      let response;
      const url = dialogType === 'add' ? '/api/inventory/serial-numbers' : `/api/inventory/serial-numbers/${selectedSerialNumber?.id}`;
      const method = dialogType === 'add' ? 'POST' : 'PUT';

      if (dialogType === 'allocate') {
        response = await fetch(`/api/inventory/serial-numbers/${selectedSerialNumber?.id}/allocate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerId: formData.soldTo,
            invoiceId: formData.invoiceId,
          }),
        });
      } else if (dialogType === 'return') {
        response = await fetch(`/api/inventory/serial-numbers/${selectedSerialNumber?.id}/return`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            returnReason: formData.returnReason,
            condition: 'good',
          }),
        });
      } else {
        response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }

      if (!response.ok) throw new Error('Failed to save serial number');

      setSuccess(t('Serial number saved successfully'));
      handleDialogClose();
      loadSerialNumbers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save serial number');
    }
  };

  const handleBulkAction = async (action: string) => {
    try {
      const response = await fetch('/api/inventory/serial-numbers/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          serialNumberIds: selectedSerialNumbers,
        }),
      });

      if (!response.ok) throw new Error('Failed to perform bulk action');

      setSuccess(t('Bulk action completed successfully'));
      setSelectedSerialNumbers([]);
      loadSerialNumbers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform bulk action');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      available: 'success',
      allocated: 'warning',
      sold: 'info',
      returned: 'secondary',
      defective: 'error',
      recalled: 'error',
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      available: <CheckCircleIcon />,
      allocated: <AssignmentIcon />,
      sold: <CheckCircleIcon />,
      returned: <CancelIcon />,
      defective: <WarningIcon />,
      recalled: <WarningIcon />,
    };
    return icons[status as keyof typeof icons] || <CheckCircleIcon />;
  };

  const filteredSerialNumbers = serialNumbers.filter(sn => {
    const matchesSearch = !searchTerm || 
      sn.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sn.lotNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sn.batchNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || sn.status === statusFilter;
    const matchesProduct = productFilter === 'all' || sn.productId === productFilter;
    const matchesWarehouse = warehouseFilter === 'all' || sn.warehouseId === warehouseFilter;

    return matchesSearch && matchesStatus && matchesProduct && matchesWarehouse;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {t('Serial Number Tracking')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleDialogOpen('add')}
        >
          {t('Add Serial Number')}
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
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
              <FormControl fullWidth>
                <InputLabel>{t('Status')}</InputLabel>
                <Select value={statusFilter} onChange={handleStatusFilter}>
                  <MenuItem value="all">{t('All Status')}</MenuItem>
                  <MenuItem value="available">{t('Available')}</MenuItem>
                  <MenuItem value="allocated">{t('Allocated')}</MenuItem>
                  <MenuItem value="sold">{t('Sold')}</MenuItem>
                  <MenuItem value="returned">{t('Returned')}</MenuItem>
                  <MenuItem value="defective">{t('Defective')}</MenuItem>
                  <MenuItem value="recalled">{t('Recalled')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>{t('Product')}</InputLabel>
                <Select value={productFilter} onChange={handleProductFilter}>
                  <MenuItem value="all">{t('All Products')}</MenuItem>
                  {products.map(product => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>{t('Warehouse')}</InputLabel>
                <Select value={warehouseFilter} onChange={handleWarehouseFilter}>
                  <MenuItem value="all">{t('All Warehouses')}</MenuItem>
                  {warehouses.map(warehouse => (
                    <MenuItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
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
                  startIcon={<DownloadIcon />}
                  onClick={() => {/* Implement export */}}
                >
                  {t('Export')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedSerialNumbers.length > 0 && (
        <Card sx={{ mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body1">
                {t('{{count}} serial numbers selected', { count: selectedSerialNumbers.length })}
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleBulkAction('allocate')}
              >
                {t('Allocate')}
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleBulkAction('return')}
              >
                {t('Return')}
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleBulkAction('export')}
              >
                {t('Export Selected')}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Serial Numbers Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <input
                      type="checkbox"
                      checked={selectedSerialNumbers.length === filteredSerialNumbers.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSerialNumbers(filteredSerialNumbers.map(sn => sn.id));
                        } else {
                          setSelectedSerialNumbers([]);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>{t('Serial Number')}</TableCell>
                  <TableCell>{t('Product')}</TableCell>
                  <TableCell>{t('Lot/Batch')}</TableCell>
                  <TableCell>{t('Status')}</TableCell>
                  <TableCell>{t('Location')}</TableCell>
                  <TableCell>{t('Purchase Date')}</TableCell>
                  <TableCell>{t('Warranty')}</TableCell>
                  <TableCell>{t('Actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSerialNumbers.map((serialNumber) => (
                  <TableRow key={serialNumber.id}>
                    <TableCell padding="checkbox">
                      <input
                        type="checkbox"
                        checked={selectedSerialNumbers.includes(serialNumber.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSerialNumbers([...selectedSerialNumbers, serialNumber.id]);
                          } else {
                            setSelectedSerialNumbers(selectedSerialNumbers.filter(id => id !== serialNumber.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {serialNumber.serialNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {products.find(p => p.id === serialNumber.productId)?.name || 'Unknown Product'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        {serialNumber.lotNumber && (
                          <Typography variant="caption" display="block">
                            Lot: {serialNumber.lotNumber}
                          </Typography>
                        )}
                        {serialNumber.batchNumber && (
                          <Typography variant="caption" display="block">
                            Batch: {serialNumber.batchNumber}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(serialNumber.status)}
                        label={t(serialNumber.status)}
                        color={getStatusColor(serialNumber.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        {serialNumber.location && (
                          <Typography variant="body2">
                            {serialNumber.location}
                          </Typography>
                        )}
                        {serialNumber.binLocation && (
                          <Typography variant="caption" color="text.secondary">
                            Bin: {serialNumber.binLocation}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {serialNumber.purchaseDate && (
                        <Typography variant="body2">
                          {new Date(serialNumber.purchaseDate).toLocaleDateString()}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {serialNumber.warrantyEndDate && (
                        <Typography variant="body2">
                          {new Date(serialNumber.warrantyEndDate).toLocaleDateString()}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={(e) => handleMenuClick(e, serialNumber)}
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

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleDialogOpen('view', selectedSerialNumber!)}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('View Details')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleDialogOpen('edit', selectedSerialNumber!)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('Edit')}</ListItemText>
        </MenuItem>
        {selectedSerialNumber?.status === 'available' && (
          <MenuItem onClick={() => handleDialogOpen('allocate', selectedSerialNumber!)}>
            <ListItemIcon>
              <AssignmentIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('Allocate')}</ListItemText>
          </MenuItem>
        )}
        {selectedSerialNumber?.status === 'sold' && (
          <MenuItem onClick={() => handleDialogOpen('return', selectedSerialNumber!)}>
            <ListItemIcon>
              <CancelIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('Return')}</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => {/* Implement print */}}>
          <ListItemIcon>
            <PrintIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('Print Label')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {/* Implement QR code */}}>
          <ListItemIcon>
            <QrCodeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('Generate QR Code')}</ListItemText>
        </MenuItem>
      </Menu>

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogType === 'add' && t('Add Serial Number')}
          {dialogType === 'edit' && t('Edit Serial Number')}
          {dialogType === 'view' && t('Serial Number Details')}
          {dialogType === 'allocate' && t('Allocate Serial Number')}
          {dialogType === 'return' && t('Return Serial Number')}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleFormSubmit}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('Serial Number')}
                  value={formData.serialNumber || ''}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  required
                  disabled={dialogType === 'view'}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>{t('Product')}</InputLabel>
                  <Select
                    value={formData.productId || ''}
                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                    disabled={dialogType === 'view'}
                  >
                    {products.map(product => (
                      <MenuItem key={product.id} value={product.id}>
                        {product.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('Lot Number')}
                  value={formData.lotNumber || ''}
                  onChange={(e) => setFormData({ ...formData, lotNumber: e.target.value })}
                  disabled={dialogType === 'view'}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('Batch Number')}
                  value={formData.batchNumber || ''}
                  onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                  disabled={dialogType === 'view'}
                />
              </Grid>
              {dialogType === 'allocate' && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={t('Customer ID')}
                      value={formData.soldTo || ''}
                      onChange={(e) => setFormData({ ...formData, soldTo: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={t('Invoice ID')}
                      value={formData.invoiceId || ''}
                      onChange={(e) => setFormData({ ...formData, invoiceId: e.target.value })}
                    />
                  </Grid>
                </>
              )}
              {dialogType === 'return' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t('Return Reason')}
                    value={formData.returnReason || ''}
                    onChange={(e) => setFormData({ ...formData, returnReason: e.target.value })}
                    required
                    multiline
                    rows={3}
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('Notes')}
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  disabled={dialogType === 'view'}
                  multiline
                  rows={3}
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

export default SerialTrackingPage;





