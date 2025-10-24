'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign, 
  Clock, 
  RefreshCw,
  Search,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';

interface ServicePackage {
  id: string;
  name: string;
  description?: string;
  hourlyRate?: number;
  fixedPrice?: number;
  billingType: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    timeEntries: number;
  };
}

export default function ServicePackagesPage() {
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddPackage, setShowAddPackage] = useState(false);
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null);

  const [newPackage, setNewPackage] = useState({
    name: '',
    description: '',
    hourlyRate: 0,
    fixedPrice: 0,
    billingType: 'HOURLY',
    isActive: true
  });

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/service-billing/packages');
      if (response.ok) {
        const data = await response.json();
        setPackages(data.data.packages || []);
      }
    } catch (error) {
      console.error('Failed to load packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/service-billing/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPackage)
      });

      if (response.ok) {
        toast.success('Service package created');
        setNewPackage({
          name: '',
          description: '',
          hourlyRate: 0,
          fixedPrice: 0,
          billingType: 'HOURLY',
          isActive: true
        });
        setShowAddPackage(false);
        await loadPackages();
      } else {
        throw new Error('Failed to create package');
      }
    } catch (error) {
      toast.error('Failed to create service package');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackage) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/service-billing/packages/${editingPackage.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPackage)
      });

      if (response.ok) {
        toast.success('Service package updated');
        setEditingPackage(null);
        setNewPackage({
          name: '',
          description: '',
          hourlyRate: 0,
          fixedPrice: 0,
          billingType: 'HOURLY',
          isActive: true
        });
        await loadPackages();
      } else {
        throw new Error('Failed to update package');
      }
    } catch (error) {
      toast.error('Failed to update service package');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePackage = async (packageId: string) => {
    if (!confirm('Are you sure you want to delete this service package?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/service-billing/packages/${packageId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Service package deleted');
        await loadPackages();
      } else {
        throw new Error('Failed to delete package');
      }
    } catch (error) {
      toast.error('Failed to delete service package');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPackage = (pkg: ServicePackage) => {
    setEditingPackage(pkg);
    setNewPackage({
      name: pkg.name,
      description: pkg.description || '',
      hourlyRate: pkg.hourlyRate || 0,
      fixedPrice: pkg.fixedPrice || 0,
      billingType: pkg.billingType,
      isActive: pkg.isActive
    });
    setShowAddPackage(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getBillingTypeColor = (type: string) => {
    switch (type) {
      case 'HOURLY': return 'bg-blue-100 text-blue-800';
      case 'FIXED': return 'bg-green-100 text-green-800';
      case 'MIXED': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPackages = packages.filter(pkg =>
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pkg.description && pkg.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Package className="h-6 w-6 text-blue-600" />
          <h1 className="text-3xl font-bold">Service Packages</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={loadPackages}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowAddPackage(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Package
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search packages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Packages Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading service packages...</span>
        </div>
      ) : filteredPackages.length === 0 ? (
        <Alert>
          <Package className="h-4 w-4" />
          <AlertDescription>
            {searchTerm ? 'No packages found matching your search.' : 'No service packages found. Create your first package to get started.'}
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => (
            <Card key={pkg.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{pkg.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant={pkg.isActive ? 'default' : 'secondary'}>
                      {pkg.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditPackage(pkg)}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {pkg.description || 'No description provided'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Billing Type</span>
                  <Badge className={getBillingTypeColor(pkg.billingType)}>
                    {pkg.billingType}
                  </Badge>
                </div>

                {pkg.billingType === 'HOURLY' && pkg.hourlyRate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Hourly Rate</span>
                    <span className="font-medium">{formatCurrency(pkg.hourlyRate)}</span>
                  </div>
                )}

                {pkg.billingType === 'FIXED' && pkg.fixedPrice && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Fixed Price</span>
                    <span className="font-medium">{formatCurrency(pkg.fixedPrice)}</span>
                  </div>
                )}

                {pkg.billingType === 'MIXED' && (
                  <div className="space-y-2">
                    {pkg.hourlyRate && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Hourly Rate</span>
                        <span className="font-medium">{formatCurrency(pkg.hourlyRate)}</span>
                      </div>
                    )}
                    {pkg.fixedPrice && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Fixed Price</span>
                        <span className="font-medium">{formatCurrency(pkg.fixedPrice)}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Time Entries</span>
                  <span className="font-medium">{pkg._count.timeEntries}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Created {new Date(pkg.createdAt).toLocaleDateString()}</span>
                  <span>Updated {new Date(pkg.updatedAt).toLocaleDateString()}</span>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditPackage(pkg)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeletePackage(pkg.id)}
                    className="flex-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Package Modal */}
      {showAddPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {editingPackage ? 'Edit Service Package' : 'Add Service Package'}
              </CardTitle>
              <CardDescription>
                {editingPackage ? 'Update the service package details' : 'Create a new service package for billing'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={editingPackage ? handleUpdatePackage : handleAddPackage} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="package-name">Package Name</Label>
                  <Input
                    id="package-name"
                    value={newPackage.name}
                    onChange={(e) => setNewPackage(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Bookkeeping Services"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="package-description">Description</Label>
                  <textarea
                    id="package-description"
                    value={newPackage.description}
                    onChange={(e) => setNewPackage(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this package includes..."
                    className="w-full p-2 border rounded"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billing-type">Billing Type</Label>
                  <select
                    id="billing-type"
                    value={newPackage.billingType}
                    onChange={(e) => setNewPackage(prev => ({ ...prev, billingType: e.target.value }))}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="HOURLY">Hourly</option>
                    <option value="FIXED">Fixed Price</option>
                    <option value="MIXED">Mixed (Hourly + Fixed)</option>
                  </select>
                </div>

                {(newPackage.billingType === 'HOURLY' || newPackage.billingType === 'MIXED') && (
                  <div className="space-y-2">
                    <Label htmlFor="hourly-rate">Hourly Rate ($)</Label>
                    <Input
                      id="hourly-rate"
                      type="number"
                      step="0.01"
                      min="0"
                      value={newPackage.hourlyRate}
                      onChange={(e) => setNewPackage(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                    />
                  </div>
                )}

                {(newPackage.billingType === 'FIXED' || newPackage.billingType === 'MIXED') && (
                  <div className="space-y-2">
                    <Label htmlFor="fixed-price">Fixed Price ($)</Label>
                    <Input
                      id="fixed-price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={newPackage.fixedPrice}
                      onChange={(e) => setNewPackage(prev => ({ ...prev, fixedPrice: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <input
                    id="is-active"
                    type="checkbox"
                    checked={newPackage.isActive}
                    onChange={(e) => setNewPackage(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="is-active">Active</Label>
                </div>

                <div className="flex space-x-2">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Saving...' : (editingPackage ? 'Update Package' : 'Create Package')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddPackage(false);
                      setEditingPackage(null);
                      setNewPackage({
                        name: '',
                        description: '',
                        hourlyRate: 0,
                        fixedPrice: 0,
                        billingType: 'HOURLY',
                        isActive: true
                      });
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

