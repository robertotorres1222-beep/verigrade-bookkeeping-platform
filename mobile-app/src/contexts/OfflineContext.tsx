import React, { createContext, useContext, useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncService } from '../services/syncService';

interface OfflineContextType {
  isOnline: boolean;
  isOfflineMode: boolean;
  pendingActions: any[];
  syncStatus: 'idle' | 'syncing' | 'error' | 'success';
  enableOfflineMode: () => void;
  disableOfflineMode: () => void;
  addPendingAction: (action: any) => void;
  clearPendingActions: () => void;
  syncPendingActions: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [pendingActions, setPendingActions] = useState<any[]>([]);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error' | 'success'>('idle');

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
      
      if (state.isConnected && isOfflineMode) {
        syncPendingActions();
      }
    });

    loadOfflineData();

    return unsubscribe;
  }, []);

  const loadOfflineData = async () => {
    try {
      const storedActions = await AsyncStorage.getItem('pendingActions');
      if (storedActions) {
        setPendingActions(JSON.parse(storedActions));
      }
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  };

  const enableOfflineMode = () => {
    setIsOfflineMode(true);
  };

  const disableOfflineMode = () => {
    setIsOfflineMode(false);
  };

  const addPendingAction = (action: any) => {
    const newAction = {
      ...action,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    
    setPendingActions(prev => {
      const updated = [...prev, newAction];
      AsyncStorage.setItem('pendingActions', JSON.stringify(updated));
      return updated;
    });
  };

  const clearPendingActions = () => {
    setPendingActions([]);
    AsyncStorage.removeItem('pendingActions');
  };

  const syncPendingActions = async () => {
    if (pendingActions.length === 0) return;

    setSyncStatus('syncing');
    
    try {
      await syncService.syncPendingActions(pendingActions);
      clearPendingActions();
      setSyncStatus('success');
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
    }
  };

  const value: OfflineContextType = {
    isOnline,
    isOfflineMode,
    pendingActions,
    syncStatus,
    enableOfflineMode,
    disableOfflineMode,
    addPendingAction,
    clearPendingActions,
    syncPendingActions,
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
};



