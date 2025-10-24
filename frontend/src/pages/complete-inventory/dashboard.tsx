import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
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
  Tabs,
  Tab,
  Alert,
  LinearProgress,
  Tooltip,
  Fab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Inventory as InventoryIcon,
  Warehouse as WarehouseIcon,
  ShoppingCart as ShoppingCartIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  cost: number;
  status: string;
}

interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
  status: string;
}

interface InventoryItem {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  cost: number;
  product: Product;
  warehouse: Warehouse;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  status: string;
  orderDate: string;
  totalAmount: number;
}

interface InventoryAnalytics {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  topProducts: Array<{
    productId: string;
    name: string;
    quantity: number;
    value: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    count: number;
    value: number;
  }>;
}

const CompleteInventoryDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [analytics, setAnalytics] = useState<InventoryAnalytics | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'product' | 'warehouse' | 'inventory' | 'purchase-order'>('product');
  const [formData, setFormData] = useState<any>({});

  // Mock data for demonstration
  const mockProducts: Product[] = [
    { id: '1', name: 'Laptop', sku: 'LAP-001', category: 'Electronics', quantity: 50, cost: 999.99, status: 'ACTIVE' },
    { id: '2', name: 'Mouse', sku: 'MOU-001', category: 'Electronics', quantity: 200, cost: 29.99, status: 'ACTIVE' },
    { id: '3', name: 'Keyboard', sku: 'KEY-001', category: 'Electronics', quantity: 150, cost: 79.99, status: 'ACTIVE' },
    { id: '4', name: 'Monitor', sku: 'MON-001', category: 'Electronics', quantity: 75, cost: 299.99, status: 'ACTIVE' },
    { id: '5', name: 'Desk', sku: 'DES-001', category: 'Furniture', quantity: 25, cost: 199.99, status: 'ACTIVE' },
  ];

  const mockWarehouses: Warehouse[] = [
    { id: '1', name: 'Main Warehouse', code: 'MAIN', address: '123 Main St', status: 'ACTIVE' },
    { id: '2', name: 'Secondary Warehouse', code: 'SEC', address: '456 Oak Ave', status: 'ACTIVE' },
  ];

  const mockInventory: InventoryItem[] = [
    {
      id: '1',
      productId: '1',
      warehouseId: '1',
      quantity: 50,
      reservedQuantity: 5,
      availableQuantity: 45,
      cost: 999.99,
      product: mockProducts[0],
      warehouse: mockWarehouses[0],
    },
    {
      id: '2',
      productId: '2',
      warehouseId: '1',
      quantity: 200,
      reservedQuantity: 10,
      availableQuantity: 190,
      cost: 29.99,
      product: mockProducts[1],
      warehouse: mockWarehouses[0],
    },
  ];

  const mockPurchaseOrders: PurchaseOrder[] = [
    { id: '1', poNumber: 'PO-001', vendorId: 'V1', status: 'PENDING', orderDate: '2024-01-15', totalAmount: 5000 },
    { id: '2', poNumber: 'PO-002', vendorId: 'V2', status: 'RECEIVED', orderDate: '2024-01-10', totalAmount: 3000 },
  ];

  const mockAnalytics: InventoryAnalytics = {
    totalProducts: 5,
    totalValue: 125000,
    lowStockItems: 2,
    outOfStockItems: 0,
    topProducts: [
      { productId: '1', name: 'Laptop', quantity: 50, value: 49999.5 },
      { productId: '2', name: 'Mouse', quantity: 200, value: 5998 },
    ],
    categoryBreakdown: [
      { category: 'Electronics', count: 4, value: 100000 },
      { category: 'Furniture', count: 1, value: 25000 },
    ],
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProducts(mockProducts);
      setWarehouses(mockWarehouses);
      setInventory(mockInventory);
      setPurchaseOrders(mockPurchaseOrders);
      setAnalytics(mockAnalytics);
    } catch (err) {
      setError('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleOpenDialog = (type: 'product' | 'warehouse' | 'inventory' | 'purchase-order', item?: any) => {
    setDialogType(type);
    setSelectedProduct(item || null);
    setFormData(item || {});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedProduct(null);
    setFormData({});
  };

  const handleSave = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      handleCloseDialog();
      loadData();
    } catch (err) {
      setError('Failed to save data');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'PENDING': return 'warning';
      case 'RECEIVED': return 'success';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircleIcon />;
      case 'PENDING': return <WarningIcon />;
      case 'RECEIVED': return <CheckCircleIcon />;
      default: return <WarningIcon />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading inventory data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={loadData}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Complete Inventory Management
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadData}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            sx={{ mr: 1 }}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('product')}
          >
            Add Product
          </Button>
        </Box>
      </Box>

      {/* Analytics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <InventoryIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Products
                  </Typography>
                  <Typography variant="h4">
                    {analytics?.totalProducts || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Value
                  </Typography>
                  <Typography variant="h4">
                    ${analytics?.totalValue?.toLocaleString() || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <WarningIcon color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Low Stock Items
                  </Typography>
                  <Typography variant="h4">
                    {analytics?.lowStockItems || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ShoppingCartIcon color="error" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Out of Stock
                  </Typography>
                  <Typography variant="h4">
                    {analytics?.outOfStockItems || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Products" />
            <Tab label="Warehouses" />
            <Tab label="Inventory" />
            <Tab label="Purchase Orders" />
            <Tab label="Analytics" />
          </Tabs>
        </Box>

        <CardContent>
          {/* Products Tab */}
          {activeTab === 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Products</Typography>
                <Box>
                  <TextField
                    size="small"
                    placeholder="Search products..."
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                    sx={{ mr: 2, width: 250 }}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<FilterIcon />}
                    sx={{ mr: 1 }}
                  >
                    Filter
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog('product')}
                  >
                    Add Product
                  </Button>
                </Box>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>SKU</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Cost</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.sku}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>{product.quantity}</TableCell>
                        <TableCell>${product.cost}</TableCell>
                        <TableCell>
                          <Chip
                            label={product.status}
                            color={getStatusColor(product.status) as any}
                            size="small"
                            icon={getStatusIcon(product.status)}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => handleOpenDialog('product', product)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small">
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Warehouses Tab */}
          {activeTab === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Warehouses</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('warehouse')}
                >
                  Add Warehouse
                </Button>
              </Box>

              <Grid container spacing={2}>
                {warehouses.map((warehouse) => (
                  <Grid item xs={12} sm={6} md={4} key={warehouse.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">{warehouse.name}</Typography>
                          <Chip
                            label={warehouse.status}
                            color={getStatusColor(warehouse.status) as any}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Code: {warehouse.code}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {warehouse.address}
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          <Button size="small" startIcon={<EditIcon />}>
                            Edit
                          </Button>
                          <Button size="small" startIcon={<ViewIcon />}>
                            View
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Inventory Tab */}
          {activeTab === 2 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Inventory</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('inventory')}
                >
                  Add Inventory
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>Warehouse</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Reserved</TableCell>
                      <TableCell>Available</TableCell>
                      <TableCell>Cost</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inventory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.product.name}</TableCell>
                        <TableCell>{item.warehouse.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.reservedQuantity}</TableCell>
                        <TableCell>{item.availableQuantity}</TableCell>
                        <TableCell>${item.cost}</TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small">
                            <ViewIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Purchase Orders Tab */}
          {activeTab === 3 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Purchase Orders</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('purchase-order')}
                >
                  Create PO
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>PO Number</TableCell>
                      <TableCell>Vendor</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Order Date</TableCell>
                      <TableCell>Total Amount</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {purchaseOrders.map((po) => (
                      <TableRow key={po.id}>
                        <TableCell>{po.poNumber}</TableCell>
                        <TableCell>Vendor {po.vendorId}</TableCell>
                        <TableCell>
                          <Chip
                            label={po.status}
                            color={getStatusColor(po.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{new Date(po.orderDate).toLocaleDateString()}</TableCell>
                        <TableCell>${po.totalAmount}</TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small">
                            <ViewIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Analytics Tab */}
          {activeTab === 4 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3 }}>Inventory Analytics</Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Top Products by Value</Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics?.topProducts || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey="value" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Category Breakdown</Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={analytics?.categoryBreakdown || []}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {(analytics?.categoryBreakdown || []).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Dialog for Add/Edit */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogType === 'product' ? 'Add/Edit Product' :
           dialogType === 'warehouse' ? 'Add/Edit Warehouse' :
           dialogType === 'inventory' ? 'Add/Edit Inventory' :
           'Create Purchase Order'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {dialogType === 'product' && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Product Name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="SKU"
                    value={formData.sku || ''}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Category"
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Cost"
                    type="number"
                    value={formData.cost || ''}
                    onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Quantity"
                    type="number"
                    value={formData.quantity || ''}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.status || 'ACTIVE'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <MenuItem value="ACTIVE">Active</MenuItem>
                      <MenuItem value="INACTIVE">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            )}

            {dialogType === 'warehouse' && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Warehouse Name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Code"
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </Grid>
              </Grid>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => handleOpenDialog('product')}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default CompleteInventoryDashboard;




