'use client';

import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle,
  Clock,
  X,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import offlineSyncService, { SyncStatus } from '@/services/offlineSyncService';

interface OfflineStatusProps {
  className?: string;
  showDetails?: boolean;
  compact?: boolean;
}

export default function OfflineStatus({ 
  className = '', 
  showDetails = false, 
  compact = false 
}: OfflineStatusProps) {
  const [status, setStatus] = useState<SyncStatus>(offlineSyncService.getStatus());
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const unsubscribe = offlineSyncService.addStatusListener(setStatus);
    return unsubscribe;
  }, []);

  const handleForceSync = async () => {
    try {
      const result = await offlineSyncService.forceSync();
      
      if (result.success) {
        if (result.synced > 0) {
          toast.success(`Synced ${result.synced} actions successfully`);
        } else {
          toast.info('No pending actions to sync');
        }
      } else {
        toast.error(`Sync failed: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      console.error('Force sync failed:', error);
      toast.error('Failed to sync offline actions');
    }
  };

  const handleClearPending = () => {
    offlineSyncService.clearPendingActions();
    toast.success('Pending actions cleared');
  };

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {status.isOnline ? (
          <div className="flex items-center space-x-1 text-green-600">
            <Wifi className="h-4 w-4" />
            {status.pendingActions > 0 && (
              <Badge variant="outline" className="text-xs">
                {status.pendingActions}
              </Badge>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-1 text-red-600">
            <WifiOff className="h-4 w-4" />
            <Badge variant="destructive" className="text-xs">
              Offline
            </Badge>
          </div>
        )}
      </div>
    );
  }

  if (!status.isOnline) {
    return (
      <Alert className={`border-red-200 bg-red-50 ${className}`}>
        <WifiOff className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <div className="flex items-center justify-between">
            <div>
              <strong>You're offline</strong>
              <p className="text-sm mt-1">
                Some features may be limited. Changes will sync when you're back online.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.location.reload()}
              className="ml-4"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (status.pendingActions === 0 && !showDetails) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Pending Actions Alert */}
      {status.pendingActions > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <div className="flex items-center justify-between">
              <div>
                <strong>{status.pendingActions} action{status.pendingActions !== 1 ? 's' : ''} pending sync</strong>
                <p className="text-sm mt-1">
                  {status.isSyncing ? 'Syncing...' : 'Will sync automatically when online'}
                </p>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleForceSync}
                  disabled={status.isSyncing}
                >
                  {status.isSyncing ? (
                    <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4 mr-1" />
                  )}
                  {status.isSyncing ? 'Syncing...' : 'Sync Now'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleClearPending}
                  disabled={status.isSyncing}
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Sync Status */}
      {status.isSyncing && (
        <Alert className="border-blue-200 bg-blue-50">
          <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
          <AlertDescription className="text-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <strong>Syncing offline actions...</strong>
                <p className="text-sm mt-1">
                  Please wait while your changes are synchronized.
                </p>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {status.lastSync && status.pendingActions === 0 && !status.isSyncing && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="flex items-center justify-between">
              <div>
                <strong>All actions synced</strong>
                <p className="text-sm mt-1">
                  Last sync: {status.lastSync.toLocaleString()}
                </p>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Error Messages */}
      {status.errors.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div>
              <strong>Sync errors occurred</strong>
              <div className="mt-2 space-y-1">
                {status.errors.map((error, index) => (
                  <p key={index} className="text-sm">{error}</p>
                ))}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Status */}
      {showDetails && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Sync Status</h4>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Hide' : 'Show'} Details
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Status:</span>
              <span className={`ml-2 font-medium ${
                status.isOnline ? 'text-green-600' : 'text-red-600'
              }`}>
                {status.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Pending:</span>
              <span className="ml-2 font-medium">{status.pendingActions}</span>
            </div>
            <div>
              <span className="text-gray-600">Syncing:</span>
              <span className={`ml-2 font-medium ${
                status.isSyncing ? 'text-blue-600' : 'text-gray-600'
              }`}>
                {status.isSyncing ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Last Sync:</span>
              <span className="ml-2 font-medium">
                {status.lastSync ? status.lastSync.toLocaleString() : 'Never'}
              </span>
            </div>
          </div>

          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h5 className="font-medium text-gray-900 mb-2">Pending Actions</h5>
              {offlineSyncService.getPendingActions().length === 0 ? (
                <p className="text-sm text-gray-600">No pending actions</p>
              ) : (
                <div className="space-y-2">
                  {offlineSyncService.getPendingActions().map((action) => (
                    <div key={action.id} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div>
                        <span className="font-medium">{action.type}</span>
                        <span className="text-gray-600 ml-2">{action.entity}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {action.retryCount}/{action.maxRetries}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {action.timestamp.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

