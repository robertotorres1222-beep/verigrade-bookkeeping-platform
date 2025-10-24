import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Smartphone, 
  Monitor, 
  Wifi, 
  WifiOff,
  CheckCircle,
  X,
  RefreshCw,
  Cloud,
  CloudOff
} from 'lucide-react';
import { toast } from 'sonner';
import pwaService from '@/services/pwaService';

interface PWAInstallProps {
  onClose?: () => void;
  showAsModal?: boolean;
}

const PWAInstall: React.FC<PWAInstallProps> = ({ onClose, showAsModal = false }) => {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isInstalling, setIsInstalling] = useState(false);
  const [appInfo, setAppInfo] = useState({
    isInstalled: false,
    isOnline: true,
    canInstall: false,
    syncQueueLength: 0
  });

  useEffect(() => {
    // Check initial state
    updateAppInfo();

    // Listen for PWA events
    const handlePWAEvent = (event: any) => {
      switch (event.type) {
        case 'install':
          setCanInstall(true);
          break;
        case 'update':
          toast.info('App update available! Refresh to get the latest version.');
          break;
        case 'online':
          setIsOnline(true);
          toast.success('Back online! Data will sync automatically.');
          break;
        case 'offline':
          setIsOnline(false);
          toast.warning('You\'re offline. Changes will sync when you\'re back online.');
          break;
        case 'sync':
          toast.success('Offline data synced successfully!');
          break;
      }
      updateAppInfo();
    };

    pwaService.addEventListener(handlePWAEvent);

    // Check for updates periodically
    const updateInterval = setInterval(async () => {
      const hasUpdate = await pwaService.checkForUpdates();
      if (hasUpdate) {
        toast.info('App update available!');
      }
    }, 30000); // Check every 30 seconds

    return () => {
      pwaService.removeEventListener(handlePWAEvent);
      clearInterval(updateInterval);
    };
  }, []);

  const updateAppInfo = () => {
    const info = pwaService.getAppInfo();
    setAppInfo(info);
    setCanInstall(info.canInstall);
    setIsInstalled(info.isInstalled);
    setIsOnline(info.isOnline);
  };

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const success = await pwaService.showInstallPrompt();
      if (success) {
        toast.success('VeriGrade installed successfully!');
        setIsInstalled(true);
        setCanInstall(false);
        onClose?.();
      } else {
        toast.error('Installation cancelled');
      }
    } catch (error) {
      console.error('Installation failed:', error);
      toast.error('Installation failed. Please try again.');
    } finally {
      setIsInstalling(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await pwaService.updateServiceWorker();
      toast.success('App updated successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Update failed:', error);
      toast.error('Update failed. Please try again.');
    }
  };

  const handleClearCache = async () => {
    try {
      await pwaService.clearCache();
      toast.success('Cache cleared successfully!');
    } catch (error) {
      console.error('Failed to clear cache:', error);
      toast.error('Failed to clear cache.');
    }
  };

  const handleSyncNow = async () => {
    try {
      await pwaService.requestBackgroundSync('sync-transactions');
      toast.success('Sync requested. Data will sync in the background.');
    } catch (error) {
      console.error('Sync failed:', error);
      toast.error('Sync failed. Please try again.');
    }
  };

  if (showAsModal) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Install VeriGrade</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <PWAInstallContent
              canInstall={canInstall}
              isInstalled={isInstalled}
              isOnline={isOnline}
              isInstalling={isInstalling}
              appInfo={appInfo}
              onInstall={handleInstall}
              onUpdate={handleUpdate}
              onClearCache={handleClearCache}
              onSyncNow={handleSyncNow}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Install VeriGrade
        </CardTitle>
      </CardHeader>
      <CardContent>
        <PWAInstallContent
          canInstall={canInstall}
          isInstalled={isInstalled}
          isOnline={isOnline}
          isInstalling={isInstalling}
          appInfo={appInfo}
          onInstall={handleInstall}
          onUpdate={handleUpdate}
          onClearCache={handleClearCache}
          onSyncNow={handleSyncNow}
        />
      </CardContent>
    </Card>
  );
};

interface PWAInstallContentProps {
  canInstall: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  isInstalling: boolean;
  appInfo: any;
  onInstall: () => void;
  onUpdate: () => void;
  onClearCache: () => void;
  onSyncNow: () => void;
}

const PWAInstallContent: React.FC<PWAInstallContentProps> = ({
  canInstall,
  isInstalled,
  isOnline,
  isInstalling,
  appInfo,
  onInstall,
  onUpdate,
  onClearCache,
  onSyncNow
}) => {
  return (
    <div className="space-y-4">
      {/* Status indicators */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-500" />
          )}
          <span className="text-sm">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {isInstalled ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <Monitor className="h-4 w-4 text-gray-500" />
          )}
          <span className="text-sm">
            {isInstalled ? 'Installed' : 'Web App'}
          </span>
        </div>
      </div>

      {/* Sync queue indicator */}
      {appInfo.syncQueueLength > 0 && (
        <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
          <CloudOff className="h-4 w-4 text-yellow-600" />
          <span className="text-sm text-yellow-800">
            {appInfo.syncQueueLength} items waiting to sync
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={onSyncNow}
            className="ml-auto"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Sync Now
          </Button>
        </div>
      )}

      {/* Install button */}
      {canInstall && !isInstalled && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Install as App</span>
          </div>
          <p className="text-sm text-gray-600">
            Install VeriGrade on your device for a better experience with offline access.
          </p>
          <Button
            onClick={onInstall}
            disabled={isInstalling}
            className="w-full"
          >
            {isInstalling ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Installing...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Install App
              </>
            )}
          </Button>
        </div>
      )}

      {/* Installed state */}
      {isInstalled && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-green-700">
              App Installed
            </span>
          </div>
          <p className="text-sm text-gray-600">
            VeriGrade is installed and ready to use offline.
          </p>
        </div>
      )}

      {/* Features list */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Offline Features:</h4>
        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>View transactions and reports</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>Add new transactions</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>Access AI Assistant</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>View documents and receipts</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onUpdate}
          className="flex-1"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Check Updates
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onClearCache}
          className="flex-1"
        >
          <Cloud className="h-3 w-3 mr-1" />
          Clear Cache
        </Button>
      </div>

      {/* Offline indicator */}
      {!isOnline && (
        <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <WifiOff className="h-4 w-4 text-blue-600" />
          <span className="text-sm text-blue-800">
            Working offline. Changes will sync when you're back online.
          </span>
        </div>
      )}
    </div>
  );
};

export default PWAInstall;

