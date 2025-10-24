'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload,
  MapPin,
  Hash,
  Calendar,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Settings
} from 'lucide-react';

interface InventoryItem {
  id: string;
  barcode: string;
  name: string;
  sku: string;
  price: number;
  category: string;
  description?: string;
  quantity: number;
  location?: string;
  trackSerialNumbers: boolean;
  trackBatches: boolean;
  hasExpiryDate: boolean;
  minStockLevel?: number;
  maxStockLevel?: number;
  reorderPoint?: number;
  supplier?: {
    id: string;
    name: string;
  };
  cost?: number;
  weight?: number;
  dimensions?: string;
  images: string[];
  tags: string[];
  locations: InventoryLocation[];
  serialNumbers: InventorySerialNumber[];
  batches: InventoryBatch[];
}

interface InventoryLocation {
  id: string;
  locationName: string;
  quantity: number;
  minQuantity?: number;
  maxQuantity?: number;
}

interface InventorySerialNumber {
  id: string;
  serialNumber: string;
  status: 'available' | 'sold' | 'returned' | 'defective' | 'lost';
  locationId?: string;
  batchNumber?: string;
  purchaseDate?: string;
  soldDate?: string;
  warrantyExpiry?: string;
  notes?: string;
}

interface InventoryBatch {
  id: string;
  batchNumber: string;
  quantity: number;
  remainingQuantity: number;
  expiryDate?: string;
  purchaseDate?: string;
  cost?: number;
  supplierId?: string;
  locationId?: string;
  status: 'active' | 'expired' | 'depleted';
  notes?: string;
}

interface Supplier {
  id: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  website?: string;
  notes?: string;
}

export default function EnhancedInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [expiringBatches, setExpiringBatches] = useState<InventoryBatch[]>([]);

  useEffect(() => {
    fetchInventoryData();
    fetchSuppliers();
    fetchAnalytics();
    fetchExpiringBatches();
  }, []);

  const fetchInventoryData = async () => {
    try {
      const response = await fetch('/api/enhanced-inventory/items');
      const data = await response.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/enhanced-inventory/suppliers');
      const data = await response.json();
      if (data.success) {
        setSuppliers(data.data);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/enhanced-inventory/analytics');
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchExpiringBatches = async () => {
    try {
      const response = await fetch('/api/enhanced-inventory/expiring-batches?daysAhead=30');
      const data = await response.json();
      if (data.success) {
        setExpiringBatches(data.data);
      }
    } catch (error) {
      console.error('Error fetching expiring batches:', error);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.barcode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    const matchesLowStock = !showLowStock || (item.reorderPoint && item.quantity <= item.reorderPoint);
    
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const categories = [...new Set(items.map(item => item.category))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enhanced Inventory</h1>
          <p className="text-gray-600">Manage inventory with serial numbers, batches, and multi-location tracking</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold">{analytics.totalItems}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Low Stock</p>
                  <p className="text-2xl font-bold text-orange-600">{analytics.lowStockItems}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold">${analytics.totalValue.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Expiring Soon</p>
                  <p className="text-2xl font-bold text-red-600">{expiringBatches.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search items by name, SKU, or barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              variant={showLowStock ? "default" : "outline"}
              onClick={() => setShowLowStock(!showLowStock)}
              className="flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Low Stock
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Expiring Batches Alert */}
      {expiringBatches.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>{expiringBatches.length} batches</strong> are expiring within 30 days. 
            <Button variant="link" className="p-0 h-auto text-orange-800 underline">
              View details
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Inventory Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Inventory Items ({filteredItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600">SKU: {item.sku} | Barcode: {item.barcode}</p>
                      </div>
                      <Badge variant="secondary">{item.category}</Badge>
                      {item.trackSerialNumbers && (
                        <Badge variant="outline" className="text-blue-600">
                          <Hash className="h-3 w-3 mr-1" />
                          Serial
                        </Badge>
                      )}
                      {item.trackBatches && (
                        <Badge variant="outline" className="text-green-600">
                          <Calendar className="h-3 w-3 mr-1" />
                          Batch
                        </Badge>
                      )}
                    </div>
                    
                    <div className="mt-2 flex items-center space-x-6 text-sm text-gray-600">
                      <span>Quantity: <strong>{item.quantity}</strong></span>
                      <span>Price: <strong>${item.price.toFixed(2)}</strong></span>
                      {item.supplier && (
                        <span>Supplier: <strong>{item.supplier.name}</strong></span>
                      )}
                      {item.reorderPoint && item.quantity <= item.reorderPoint && (
                        <Badge variant="destructive" className="text-xs">
                          Low Stock
                        </Badge>
                      )}
                    </div>
                    
                    {item.locations.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">Locations:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.locations.map((location) => (
                            <Badge key={location.id} variant="outline" className="text-xs">
                              <MapPin className="h-3 w-3 mr-1" />
                              {location.locationName} ({location.quantity})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

