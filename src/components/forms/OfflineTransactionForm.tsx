'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Save, 
  Wifi, 
  WifiOff, 
  Clock, 
  CheckCircle,
  AlertCircle,
  DollarSign,
  Calendar,
  Tag,
  FileText,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import offlineSyncService, { SyncStatus } from '@/services/offlineSyncService';

interface TransactionFormData {
  amount: string;
  description: string;
  category: string;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  customerId?: string;
  notes: string;
}

interface OfflineTransactionFormProps {
  onSubmit: (data: TransactionFormData) => void;
  onCancel: () => void;
  initialData?: Partial<TransactionFormData>;
  className?: string;
}

export default function OfflineTransactionForm({
  onSubmit,
  onCancel,
  initialData = {},
  className = ''
}: OfflineTransactionFormProps) {
  const [formData, setFormData] = useState<TransactionFormData>({
    amount: initialData.amount || '',
    description: initialData.description || '',
    category: initialData.category || '',
    date: initialData.date || new Date().toISOString().split('T')[0],
    type: initialData.type || 'EXPENSE',
    customerId: initialData.customerId || '',
    notes: initialData.notes || '',
  });

  const [syncStatus, setSyncStatus] = useState<SyncStatus>(offlineSyncService.getStatus());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = offlineSyncService.addStatusListener(setSyncStatus);
    return unsubscribe;
  }, []);

  const handleInputChange = (field: keyof TransactionFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      if (syncStatus.isOnline) {
        // Try to submit directly to server
        try {
          const response = await fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          });

          if (response.ok) {
            toast.success('Transaction saved successfully');
            onSubmit(formData);
            return;
          }
        } catch (error) {
          console.log('Direct submission failed, falling back to offline sync');
        }
      }

      // Add to offline queue
      const newActionId = offlineSyncService.createTransaction(formData);
      setActionId(newActionId);
      
      toast.success(
        syncStatus.isOnline 
          ? 'Transaction queued for sync' 
          : 'Transaction saved offline - will sync when online'
      );
      
      onSubmit(formData);
      
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast.error('Failed to save transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActionStatus = () => {
    if (!actionId) return null;
    
    const action = offlineSyncService.getAction(actionId);
    if (!action) return null;

    return {
      isPending: offlineSyncService.isActionPending(actionId),
      retryCount: action.retryCount,
      maxRetries: action.maxRetries,
      timestamp: action.timestamp
    };
  };

  const actionStatus = getActionStatus();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Offline Status */}
      <div className="space-y-2">
        {!syncStatus.isOnline && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <WifiOff className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>You're offline</strong>
              <p className="text-sm mt-1">
                This transaction will be saved locally and synced when you're back online.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {syncStatus.isOnline && syncStatus.pendingActions > 0 && (
          <Alert className="border-blue-200 bg-blue-50">
            <Wifi className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Online with pending sync</strong>
              <p className="text-sm mt-1">
                {syncStatus.pendingActions} action{syncStatus.pendingActions !== 1 ? 's' : ''} will sync automatically.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {actionStatus && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Transaction saved</strong>
              <p className="text-sm mt-1">
                {actionStatus.isPending 
                  ? 'Queued for sync when online' 
                  : 'Successfully synced to server'
                }
              </p>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Transaction Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Transaction Details</span>
            {!syncStatus.isOnline && (
              <span className="text-sm text-yellow-600">(Offline Mode)</span>
            )}
          </CardTitle>
          <CardDescription>
            {syncStatus.isOnline 
              ? 'Enter transaction details below' 
              : 'Transaction will sync when you\'re back online'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Transaction Type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Transaction Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'INCOME' | 'EXPENSE') => handleInputChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INCOME">Income</SelectItem>
                    <SelectItem value="EXPENSE">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Description and Category */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                placeholder="Enter transaction description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                    <SelectItem value="Travel">Travel</SelectItem>
                    <SelectItem value="Meals">Meals</SelectItem>
                    <SelectItem value="Utilities">Utilities</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Software">Software</SelectItem>
                    <SelectItem value="Equipment">Equipment</SelectItem>
                    <SelectItem value="Professional Services">Professional Services</SelectItem>
                    <SelectItem value="Insurance">Insurance</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Customer */}
            <div className="space-y-2">
              <Label htmlFor="customer">Customer (Optional)</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  id="customer"
                  placeholder="Enter customer name or ID"
                  value={formData.customerId || ''}
                  onChange={(e) => handleInputChange('customerId', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes about this transaction"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>
                      {syncStatus.isOnline ? 'Save Transaction' : 'Save Offline'}
                    </span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Action Status Details */}
      {actionStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Sync Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${
                  actionStatus.isPending ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {actionStatus.isPending ? 'Pending Sync' : 'Synced'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Retry Count:</span>
                <span className="font-medium">
                  {actionStatus.retryCount}/{actionStatus.maxRetries}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium">
                  {actionStatus.timestamp.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

