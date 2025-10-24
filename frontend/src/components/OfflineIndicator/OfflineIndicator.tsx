import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Cloud, 
  CloudOff,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import pwaService from '@/services/pwaService';
import offlineDataManager from '@/services/offlineDataManager';

interface OfflineIndicatorProps {
  showDetails?: boolean;
  position?: 'top' | 'bottom';
  className?: string;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ 
  showDetails = false, 
  position = 'top',
  className = ''
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStats, setSyncStats] = useState({
    transactionCount: 0,
    documentCount: 0,
    cacheSize: 0
  });

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online! Data will sync automatically.');
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('You\'re offline. Changes will sync when you\'re back online.');
    };

    const handlePWAEvent = (event: any) => {
      if (event.type === 'sync') {
        setIsSyncing(false);
        updateSyncStats();
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    pwaService.addEventListener(handlePWAEvent);

    // Initial stats update
    updateSyncStats();

    // Update stats periodically
    const interval = setInterval(updateSyncStats, 10000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      pwaService.removeEventListener(handlePWAEvent);
      clearInterval(interval);
    };
  }, []);

  const updateSyncStats = async () => {
    try {
      const stats = await offlineDataManager.getOfflineStats();
      setSyncStats({
        transactionCount: stats.transactionCount,
        documentCount: stats.documentCount,
        cacheSize: stats.cacheSize
      });
    } catch (error) {
      console.error('Failed to update sync stats:', error);
    }
  };

  const handleSyncNow = async () => {
    if (!isOnline) {
      toast.error('Cannot sync while offline');
      return;
    }

    setIsSyncing(true);
    try {
      const result = await offlineDataManager.syncAllTransactions();
      if (result.success > 0) {
        toast.success(`${result.success} items synced successfully`);
      }
      if (result.failed > 0) {
        toast.warning(`${result.failed} items failed to sync`);
      }
      if (result.success === 0 && result.failed === 0) {
        toast.info('No offline data to sync');
      }
      updateSyncStats();
    } catch (error) {
      console.error('Sync failed:', error);
      toast.error('Sync failed. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearCache = async () => {
    try {
      await offlineDataManager.clearAllOfflineData();
      toast.success('Offline data cleared');
      updateSyncStats();
    } catch (error) {
      console.error('Failed to clear cache:', error);
      toast.error('Failed to clear cache');
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = () => {
    if (isOnline) {
      return syncStats.transactionCount > 0 ? 'bg-yellow-500' : 'bg-green-500';
    }
    return 'bg-red-500';
  };

  const getStatusIcon = () => {
    if (isOnline) {
      return syncStats.transactionCount > 0 ? <CloudOff className="h-3 w-3" /> : <Wifi className="h-3 w-3" />;
    }
    return <WifiOff className="h-3 w-3" />;
  };

  const getStatusText = () => {
    if (isOnline) {
      return syncStats.transactionCount > 0 ? 'Syncing...' : 'Online';
    }
    return 'Offline';
  };

  if (!showDetails) {
    return (
      <div className={`fixed ${position === 'top' ? 'top-4' : 'bottom-4'} right-4 z-50 ${className}`}>
        <Badge 
          variant="secondary" 
          className={`${getStatusColor()} text-white border-0 flex items-center gap-1`}
        >
          {getStatusIcon()}
          <span className="text-xs">{getStatusText()}</span>
        </Badge>
      </div>
    );
  }

  return (
    <div className={`fixed ${position === 'top' ? 'top-4' : 'bottom-4'} right-4 z-50 ${className}`}>
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[200px]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm font-medium">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          
          {isOnline && syncStats.transactionCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="h-6 px-2 text-xs"
            >
              {isSyncing ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <Cloud className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>

        {syncStats.transactionCount > 0 && (
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3 text-yellow-500" />
              <span>{syncStats.transactionCount} transactions pending</span>
            </div>
            <div className="flex items-center gap-1">
              <CloudOff className="h-3 w-3 text-blue-500" />
              <span>{syncStats.documentCount} documents cached</span>
            </div>
            <div className="flex items-center gap-1">
              <span>Cache: {formatBytes(syncStats.cacheSize)}</span>
            </div>
          </div>
        )}

        {isOnline && syncStats.transactionCount === 0 && (
          <div className="flex items-center gap-1 text-xs text-green-600">
            <CheckCircle className="h-3 w-3" />
            <span>All data synced</span>
          </div>
        )}

        {!isOnline && (
          <div className="text-xs text-gray-600">
            <div className="flex items-center gap-1 mb-1">
              <WifiOff className="h-3 w-3" />
              <span>Working offline</span>
            </div>
            <div className="text-xs text-gray-500">
              Changes will sync when you're back online
            </div>
          </div>
        )}

        {syncStats.transactionCount > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClearCache}
              className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
            >
              Clear Cache
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;

