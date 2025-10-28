'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Factory, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Calculator,
  Package,
  Settings,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Download,
  Filter,
  Search,
  Layers,
  Wrench,
  Target
} from 'lucide-react';
import { toast } from 'sonner';

interface BOM {
  id: string;
  name: string;
  description?: string;
  version: string;
  isActive: boolean;
  product: {
    id: string;
    name: string;
    sku: string;
  };
  items: BOMItem[];
  createdAt: string;
  updatedAt: string;
}

interface BOMItem {
  id: string;
  componentId: string;
  quantity: number;
  unit: string;
  cost: number;
  isRequired: boolean;
  notes?: string;
  component: {
    id: string;
    name: string;
    sku: string;
    cost: number;
  };
}

interface ProductionOrder {
  id: string;
  productId: string;
  bomId: string;
  quantity: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  startDate: string;
  dueDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  completedQuantity: number;
  estimatedCost: number;
  actualCost?: number;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  product: {
    id: string;
    name: string;
    sku: string;
  };
  bom: {
    id: string;
    name: string;
    version: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ProductionDashboard {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  totalBOMs: number;
  totalProducts: number;
  recentOrders: ProductionOrder[];
}

export default function ManufacturingPage() {
  const [boms, setBOMs] = useState<BOM[]>([]);
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>([]);
  const [dashboard, setDashboard] = useState<ProductionDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreateBOM, setShowCreateBOM] = useState(false);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [selectedBOM, setSelectedBOM] = useState<BOM | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);

  const [newBOM, setNewBOM] = useState({
    productId: '',
    name: '',
    description: '',
    version: '1.0'
  });

  const [newBOMItem, setNewBOMItem] = useState({
    componentId: '',
    quantity: 0,
    unit: '',
    cost: 0,
    isRequired: true,
    notes: ''
  });

  const [newOrder, setNewOrder] = useState({
    productId: '',
    bomId: '',
    quantity: 0,
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
    startDate: '',
    dueDate: '',
    notes: ''
  });

  useEffect(() => {
    loadDashboard();
    loadBOMs();
    loadProductionOrders();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await fetch('/api/manufacturing/dashboard');
      if (response.ok) {
        const data = await response.json();
        setDashboard(data.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    }
  };

  const loadBOMs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/manufacturing/boms');
      if (response.ok) {
        const data = await response.json();
        setBOMs(data.data.boms || []);
      }
    } catch (error) {
      console.error('Failed to load BOMs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProductionOrders = async () => {
    try {
      const response = await fetch('/api/manufacturing/production-orders');
      if (response.ok) {
        const data = await response.json();
        setProductionOrders(data.data.productionOrders || []);
      }
    } catch (error) {
      console.error('Failed to load production orders:', error);
    }
  };

  const handleCreateBOM = async () => {
    if (!newBOM.productId || !newBOM.name.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/manufacturing/boms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBOM)
      });

      if (response.ok) {
        toast.success('BOM created successfully');
        setNewBOM({
          productId: '',
          name: '',
          description: '',
          version: '1.0'
        });
        setShowCreateBOM(false);
        await loadBOMs();
        await loadDashboard();
      } else {
        throw new Error('Failed to create BOM');
      }
    } catch (error) {
      toast.error('Failed to create BOM');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBOMItem = async () => {
    if (!newBOMItem.componentId || newBOMItem.quantity <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/manufacturing/boms/${selectedBOM?.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBOMItem)
      });

      if (response.ok) {
        toast.success('BOM item added successfully');
        setNewBOMItem({
          componentId: '',
          quantity: 0,
          unit: '',
          cost: 0,
          isRequired: true,
          notes: ''
        });
        await loadBOMs();
      } else {
        throw new Error('Failed to add BOM item');
      }
    } catch (error) {
      toast.error('Failed to add BOM item');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    if (!newOrder.productId || !newOrder.bomId || newOrder.quantity <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/manufacturing/production-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });

      if (response.ok) {
        toast.success('Production order created successfully');
        setNewOrder({
          productId: '',
          bomId: '',
          quantity: 0,
          priority: 'MEDIUM',
          startDate: '',
          dueDate: '',
          notes: ''
        });
        setShowCreateOrder(false);
        await loadProductionOrders();
        await loadDashboard();
      } else {
        throw new Error('Failed to create production order');
      }
    } catch (error) {
      toast.error('Failed to create production order');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNED': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PLANNED': return <Clock className="h-4 w-4" />;
      case 'IN_PROGRESS': return <Settings className="h-4 w-4" />;
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />;
      case 'CANCELLED': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'bg-gray-100 text-gray-800';
      case 'MEDIUM': return 'bg-blue-100 text-blue-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'URGENT': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Factory className="h-6 w-6 text-blue-600" />
          <h1 className="text-3xl font-bold">Manufacturing & Production</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              loadDashboard();
              loadBOMs();
              loadProductionOrders();
            }}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateBOM(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New BOM
          </Button>
          <Button onClick={() => setShowCreateOrder(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="boms">BOMs</TabsTrigger>
          <TabsTrigger value="orders">Production Orders</TabsTrigger>
          <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {dashboard ? (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    <Factory className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboard.totalOrders}</div>
                    <p className="text-xs text-muted-foreground">
                      {dashboard.activeOrders} active
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                    <Settings className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">
                      {dashboard.activeOrders}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      In production
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completed</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {dashboard.completedOrders}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Finished orders
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">BOMs</CardTitle>
                    <Layers className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboard.totalBOMs}</div>
                    <p className="text-xs text-muted-foreground">
                      Active BOMs
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Products</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboard.totalProducts}</div>
                    <p className="text-xs text-muted-foreground">
                      Total products
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Production Orders</CardTitle>
                  <CardDescription>
                    Latest production orders and their status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboard.recentOrders.length === 0 ? (
                    <Alert>
                      <Factory className="h-4 w-4" />
                      <AlertDescription>
                        No production orders found. Create your first order to start manufacturing.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-4">
                      {dashboard.recentOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 border rounded">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(order.status)}
                            <div>
                              <p className="font-medium">{order.product.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Quantity: {order.quantity} | BOM: {order.bom.name}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.replace('_', ' ')}
                            </Badge>
                            <Badge className={getPriorityColor(order.priority)}>
                              {order.priority}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading dashboard...</span>
            </div>
          )}
        </TabsContent>

        <TabsContent value="boms" className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading BOMs...</span>
            </div>
          ) : boms.length === 0 ? (
            <Alert>
              <Layers className="h-4 w-4" />
              <AlertDescription>
                No BOMs found. Create your first Bill of Materials to start manufacturing.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {boms.map((bom) => (
                <Card key={bom.id} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{bom.name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant={bom.isActive ? 'default' : 'secondary'}>
                          {bom.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedBOM(bom)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      {bom.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Product */}
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Product</Label>
                      <p className="text-sm">{bom.product.name} ({bom.product.sku})</p>
                    </div>

                    {/* Version */}
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Version</Label>
                      <p className="text-sm">{bom.version}</p>
                    </div>

                    {/* Items */}
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Components ({bom.items.length})</Label>
                      <div className="space-y-1">
                        {bom.items.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.component.name}</span>
                            <span>{item.quantity} {item.unit}</span>
                          </div>
                        ))}
                        {bom.items.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{bom.items.length - 3} more components
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedBOM(bom)}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedBOM(bom)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading production orders...</span>
            </div>
          ) : productionOrders.length === 0 ? (
            <Alert>
              <Factory className="h-4 w-4" />
              <AlertDescription>
                No production orders found. Create your first order to start manufacturing.
              </AlertDescription>
            </Alert>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left p-4">Product</th>
                        <th className="text-left p-4">BOM</th>
                        <th className="text-left p-4">Quantity</th>
                        <th className="text-left p-4">Priority</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Start Date</th>
                        <th className="text-left p-4">Due Date</th>
                        <th className="text-left p-4">Progress</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productionOrders.map((order) => (
                        <tr key={order.id} className="border-b">
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{order.product.name}</p>
                              <p className="text-sm text-muted-foreground">{order.product.sku}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{order.bom.name}</p>
                              <p className="text-sm text-muted-foreground">v{order.bom.version}</p>
                            </div>
                          </td>
                          <td className="p-4">{order.quantity}</td>
                          <td className="p-4">
                            <Badge className={getPriorityColor(order.priority)}>
                              {order.priority}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(order.status)}
                              <Badge className={getStatusColor(order.status)}>
                                {order.status.replace('_', ' ')}
                              </Badge>
                            </div>
                          </td>
                          <td className="p-4">
                            {new Date(order.startDate).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            {order.dueDate ? new Date(order.dueDate).toLocaleDateString() : '-'}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${(order.completedQuantity / order.quantity) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-sm">
                                {Math.round((order.completedQuantity / order.quantity) * 100)}%
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="costs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cost Analysis</CardTitle>
              <CardDescription>
                Analyze production costs and profitability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Calculator className="h-4 w-4" />
                <AlertDescription>
                  Cost analysis features coming soon. This will include BOM cost calculations, 
                  production cost tracking, and profitability analysis.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create BOM Modal */}
      {showCreateBOM && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Create Bill of Materials</CardTitle>
              <CardDescription>
                Define the components and quantities needed to manufacture a product
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bom-product">Product</Label>
                  <select
                    id="bom-product"
                    value={newBOM.productId}
                    onChange={(e) => setNewBOM(prev => ({ ...prev, productId: e.target.value }))}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select product</option>
                    {/* TODO: Load products from API */}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bom-version">Version</Label>
                  <Input
                    id="bom-version"
                    value={newBOM.version}
                    onChange={(e) => setNewBOM(prev => ({ ...prev, version: e.target.value }))}
                    placeholder="1.0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bom-name">BOM Name</Label>
                  <Input
                    id="bom-name"
                    value={newBOM.name}
                    onChange={(e) => setNewBOM(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter BOM name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bom-description">Description</Label>
                <textarea
                  id="bom-description"
                  value={newBOM.description}
                  onChange={(e) => setNewBOM(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter BOM description"
                  className="w-full p-2 border rounded"
                  rows={3}
                />
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleCreateBOM} disabled={loading} className="flex-1">
                  {loading ? 'Creating...' : 'Create BOM'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateBOM(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Production Order Modal */}
      {showCreateOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Create Production Order</CardTitle>
              <CardDescription>
                Start a new production order for manufacturing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order-product">Product</Label>
                  <select
                    id="order-product"
                    value={newOrder.productId}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, productId: e.target.value }))}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select product</option>
                    {/* TODO: Load products from API */}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order-bom">BOM</Label>
                  <select
                    id="order-bom"
                    value={newOrder.bomId}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, bomId: e.target.value }))}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select BOM</option>
                    {boms.map(bom => (
                      <option key={bom.id} value={bom.id}>
                        {bom.name} (v{bom.version})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order-quantity">Quantity</Label>
                  <Input
                    id="order-quantity"
                    type="number"
                    value={newOrder.quantity}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order-priority">Priority</Label>
                  <select
                    id="order-priority"
                    value={newOrder.priority}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full p-2 border rounded"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order-start-date">Start Date</Label>
                  <Input
                    id="order-start-date"
                    type="date"
                    value={newOrder.startDate}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order-due-date">Due Date (Optional)</Label>
                  <Input
                    id="order-due-date"
                    type="date"
                    value={newOrder.dueDate}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="order-notes">Notes (Optional)</Label>
                <textarea
                  id="order-notes"
                  value={newOrder.notes}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Enter production notes"
                  className="w-full p-2 border rounded"
                  rows={3}
                />
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleCreateOrder} disabled={loading} className="flex-1">
                  {loading ? 'Creating...' : 'Create Order'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateOrder(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

