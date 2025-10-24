import React, { createContext, useContext, useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncService } from '../services/syncService';

interface SyncContextType {
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncProgress: number;
  syncError: string | null;
  startSync: () => Promise<void>;
  stopSync: () => void;
  forceSync: () => Promise<void>;
  getSyncStatus: () => string;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const useSync = () => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
};

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    loadLastSyncTime();
    
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && !isSyncing) {
        startSync();
      }
    });

    return unsubscribe;
  }, []);

  const loadLastSyncTime = async () => {
    try {
      const lastSync = await AsyncStorage.getItem('lastSyncTime');
      if (lastSync) {
        setLastSyncTime(new Date(lastSync));
      }
    } catch (error) {
      console.error('Failed to load last sync time:', error);
    }
  };

  const startSync = async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    setSyncError(null);
    setSyncProgress(0);

    try {
      await syncService.syncAll({
        onProgress: (progress) => setSyncProgress(progress),
        onError: (error) => setSyncError(error.message),
      });

      setLastSyncTime(new Date());
      await AsyncStorage.setItem('lastSyncTime', new Date().toISOString());
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const stopSync = () => {
    setIsSyncing(false);
    setSyncProgress(0);
  };

  const forceSync = async () => {
    await startSync();
  };

  const getSyncStatus = () => {
    if (isSyncing) return 'Syncing...';
    if (syncError) return 'Sync Error';
    if (lastSyncTime) return `Last sync: ${lastSyncTime.toLocaleTimeString()}`;
    return 'Not synced';
  };

  const value: SyncContextType = {
    isSyncing,
    lastSyncTime,
    syncProgress,
    syncError,
    startSync,
    stopSync,
    forceSync,
    getSyncStatus,
  };

  return (
    <SyncContext.Provider value={value}>
      {children}
    </SyncContext.Provider>
  );
};




