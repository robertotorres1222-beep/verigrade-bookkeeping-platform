import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';
import { API_BASE_URL } from '../config/api';

export interface SyncItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  data: any;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  error?: string;
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime?: number;
  pendingItems: number;
  failedItems: number;
  syncProgress: number;
}

export interface ConflictResolution {
  id: string;
  localData: any;
  serverData: any;
  resolution: 'local' | 'server' | 'merge';
  mergedData?: any;
}

class SyncService {
  private static instance: SyncService;
  private syncQueue: SyncItem[] = [];
  private isOnline: boolean = true;
  private isSyncing: boolean = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private listeners: ((status: SyncStatus) => void)[] = [];

  private constructor() {
    this.initializeSync();
  }

  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  private async initializeSync(): Promise<void> {
    // Load existing sync queue from storage
    await this.loadSyncQueue();
    
    // Set up network monitoring
    this.setupNetworkMonitoring();
    
    // Start periodic sync
    this.startPeriodicSync();
    
    // Initial sync if online
    if (this.isOnline) {
      this.sync();
    }
  }

  private setupNetworkMonitoring(): void {
    NetInfo.addEventListener(state => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected ?? false;
      
      if (!wasOnline && this.isOnline) {
        // Network came back online, start sync
        this.sync();
      }
      
      this.notifyListeners();
    });
  }

  private startPeriodicSync(): void {
    // Sync every 30 seconds when online
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.sync();
      }
    }, 30000);
  }

  private stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Add item to sync queue
   */
  public async addToSyncQueue(
    type: 'create' | 'update' | 'delete',
    entity: string,
    data: any
  ): Promise<string> {
    const syncItem: SyncItem = {
      id: `${entity}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      entity,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending'
    };

    this.syncQueue.push(syncItem);
    await this.saveSyncQueue();
    this.notifyListeners();

    // Try to sync immediately if online
    if (this.isOnline) {
      this.sync();
    }

    return syncItem.id;
  }

  /**
   * Remove item from sync queue
   */
  public async removeFromSyncQueue(id: string): Promise<void> {
    this.syncQueue = this.syncQueue.filter(item => item.id !== id);
    await this.saveSyncQueue();
    this.notifyListeners();
  }

  /**
   * Get sync status
   */
  public getSyncStatus(): SyncStatus {
    const pendingItems = this.syncQueue.filter(item => item.status === 'pending').length;
    const failedItems = this.syncQueue.filter(item => item.status === 'failed').length;
    const totalItems = this.syncQueue.length;
    const completedItems = this.syncQueue.filter(item => item.status === 'completed').length;
    
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      lastSyncTime: this.getLastSyncTime(),
      pendingItems,
      failedItems,
      syncProgress: totalItems > 0 ? (completedItems / totalItems) * 100 : 100
    };
  }

  /**
   * Start sync process
   */
  public async sync(): Promise<void> {
    if (!this.isOnline || this.isSyncing) {
      return;
    }

    this.isSyncing = true;
    this.notifyListeners();

    try {
      const pendingItems = this.syncQueue.filter(item => item.status === 'pending');
      
      for (const item of pendingItems) {
        await this.syncItem(item);
      }

      // Clean up completed items
      this.syncQueue = this.syncQueue.filter(item => item.status !== 'completed');
      await this.saveSyncQueue();
      
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }
  }

  /**
   * Sync individual item
   */
  private async syncItem(item: SyncItem): Promise<void> {
    try {
      item.status = 'syncing';
      this.notifyListeners();

      let response;
      const url = `${API_BASE_URL}/api/${item.entity}`;

      switch (item.type) {
        case 'create':
            response = await this.makeRequest('POST', url, item.data);
            break;
        case 'update':
            response = await this.makeRequest('PUT', `${url}/${item.data.id}`, item.data);
            break;
        case 'delete':
            response = await this.makeRequest('DELETE', `${url}/${item.data.id}`);
            break;
      }

      if (response.ok) {
        item.status = 'completed';
        item.data = await response.json();
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

    } catch (error: any) {
      item.status = 'failed';
      item.error = error.message;
      item.retryCount++;

      // Remove item if it has failed too many times
      if (item.retryCount >= 3) {
        this.syncQueue = this.syncQueue.filter(syncItem => syncItem.id !== item.id);
        Alert.alert(
          'Sync Failed',
          `Failed to sync ${item.entity} after 3 attempts. The item has been removed from the sync queue.`
        );
      }
    }

    this.notifyListeners();
  }

  /**
   * Make HTTP request with retry logic
   */
  private async makeRequest(
    method: string,
    url: string,
    data?: any
  ): Promise<Response> {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await this.getAuthToken()}`
      }
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  }

  /**
   * Get authentication token
   */
  private async getAuthToken(): Promise<string> {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return token;
  }

  /**
   * Handle sync conflicts
   */
  public async handleConflict(conflict: ConflictResolution): Promise<void> {
    const { id, localData, serverData, resolution, mergedData } = conflict;
    
    let finalData;
    switch (resolution) {
      case 'local':
        finalData = localData;
        break;
      case 'server':
        finalData = serverData;
        break;
      case 'merge':
        finalData = mergedData;
        break;
    }

    // Update local data
    await this.updateLocalData(id, finalData);
    
    // Remove from sync queue if it was a pending update
    this.syncQueue = this.syncQueue.filter(item => item.id !== id);
    await this.saveSyncQueue();
  }

  /**
   * Update local data after conflict resolution
   */
  private async updateLocalData(id: string, data: any): Promise<void> {
    // This would update the local database/cache
    // Implementation depends on your data storage solution
    console.log('Updating local data:', id, data);
  }

  /**
   * Get sync logs
   */
  public getSyncLogs(): SyncItem[] {
    return [...this.syncQueue];
  }

  /**
   * Clear sync logs
   */
  public async clearSyncLogs(): Promise<void> {
    this.syncQueue = [];
    await this.saveSyncQueue();
    this.notifyListeners();
  }

  /**
   * Force sync specific entity
   */
  public async forceSyncEntity(entity: string): Promise<void> {
    const entityItems = this.syncQueue.filter(item => item.entity === entity);
    
    for (const item of entityItems) {
      if (item.status === 'pending' || item.status === 'failed') {
        item.status = 'pending';
        item.retryCount = 0;
        item.error = undefined;
      }
    }

    await this.saveSyncQueue();
    await this.sync();
  }

  /**
   * Selective sync - only sync specific items
   */
  public async selectiveSync(itemIds: string[]): Promise<void> {
    if (!this.isOnline || this.isSyncing) {
      return;
    }

    this.isSyncing = true;
    this.notifyListeners();

    try {
      const itemsToSync = this.syncQueue.filter(item => 
        itemIds.includes(item.id) && item.status === 'pending'
      );

      for (const item of itemsToSync) {
        await this.syncItem(item);
      }

    } catch (error) {
      console.error('Selective sync error:', error);
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }
  }

  /**
   * Background sync - lightweight sync when app is backgrounded
   */
  public async backgroundSync(): Promise<void> {
    if (!this.isOnline) {
      return;
    }

    // Only sync critical items in background
    const criticalItems = this.syncQueue.filter(item => 
      item.entity === 'expenses' || item.entity === 'invoices'
    );

    for (const item of criticalItems) {
      if (item.status === 'pending') {
        try {
          await this.syncItem(item);
        } catch (error) {
          console.error('Background sync error:', error);
        }
      }
    }
  }

  /**
   * Add sync status listener
   */
  public addSyncStatusListener(listener: (status: SyncStatus) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners of sync status change
   */
  private notifyListeners(): void {
    const status = this.getSyncStatus();
    this.listeners.forEach(listener => listener(status));
  }

  /**
   * Get last sync time
   */
  private getLastSyncTime(): number | undefined {
    const completedItems = this.syncQueue.filter(item => item.status === 'completed');
    if (completedItems.length === 0) {
      return undefined;
    }
    
    return Math.max(...completedItems.map(item => item.timestamp));
  }

  /**
   * Load sync queue from storage
   */
  private async loadSyncQueue(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('sync_queue');
      if (stored) {
        this.syncQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading sync queue:', error);
    }
  }

  /**
   * Save sync queue to storage
   */
  private async saveSyncQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Error saving sync queue:', error);
    }
  }

  /**
   * Cleanup
   */
  public destroy(): void {
    this.stopPeriodicSync();
    this.listeners = [];
  }
}

export default SyncService;





import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';
import { API_BASE_URL } from '../config/api';

export interface SyncItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  data: any;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  error?: string;
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime?: number;
  pendingItems: number;
  failedItems: number;
  syncProgress: number;
}

export interface ConflictResolution {
  id: string;
  localData: any;
  serverData: any;
  resolution: 'local' | 'server' | 'merge';
  mergedData?: any;
}

class SyncService {
  private static instance: SyncService;
  private syncQueue: SyncItem[] = [];
  private isOnline: boolean = true;
  private isSyncing: boolean = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private listeners: ((status: SyncStatus) => void)[] = [];

  private constructor() {
    this.initializeSync();
  }

  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  private async initializeSync(): Promise<void> {
    // Load existing sync queue from storage
    await this.loadSyncQueue();
    
    // Set up network monitoring
    this.setupNetworkMonitoring();
    
    // Start periodic sync
    this.startPeriodicSync();
    
    // Initial sync if online
    if (this.isOnline) {
      this.sync();
    }
  }

  private setupNetworkMonitoring(): void {
    NetInfo.addEventListener(state => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected ?? false;
      
      if (!wasOnline && this.isOnline) {
        // Network came back online, start sync
        this.sync();
      }
      
      this.notifyListeners();
    });
  }

  private startPeriodicSync(): void {
    // Sync every 30 seconds when online
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.sync();
      }
    }, 30000);
  }

  private stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Add item to sync queue
   */
  public async addToSyncQueue(
    type: 'create' | 'update' | 'delete',
    entity: string,
    data: any
  ): Promise<string> {
    const syncItem: SyncItem = {
      id: `${entity}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      entity,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending'
    };

    this.syncQueue.push(syncItem);
    await this.saveSyncQueue();
    this.notifyListeners();

    // Try to sync immediately if online
    if (this.isOnline) {
      this.sync();
    }

    return syncItem.id;
  }

  /**
   * Remove item from sync queue
   */
  public async removeFromSyncQueue(id: string): Promise<void> {
    this.syncQueue = this.syncQueue.filter(item => item.id !== id);
    await this.saveSyncQueue();
    this.notifyListeners();
  }

  /**
   * Get sync status
   */
  public getSyncStatus(): SyncStatus {
    const pendingItems = this.syncQueue.filter(item => item.status === 'pending').length;
    const failedItems = this.syncQueue.filter(item => item.status === 'failed').length;
    const totalItems = this.syncQueue.length;
    const completedItems = this.syncQueue.filter(item => item.status === 'completed').length;
    
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      lastSyncTime: this.getLastSyncTime(),
      pendingItems,
      failedItems,
      syncProgress: totalItems > 0 ? (completedItems / totalItems) * 100 : 100
    };
  }

  /**
   * Start sync process
   */
  public async sync(): Promise<void> {
    if (!this.isOnline || this.isSyncing) {
      return;
    }

    this.isSyncing = true;
    this.notifyListeners();

    try {
      const pendingItems = this.syncQueue.filter(item => item.status === 'pending');
      
      for (const item of pendingItems) {
        await this.syncItem(item);
      }

      // Clean up completed items
      this.syncQueue = this.syncQueue.filter(item => item.status !== 'completed');
      await this.saveSyncQueue();
      
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }
  }

  /**
   * Sync individual item
   */
  private async syncItem(item: SyncItem): Promise<void> {
    try {
      item.status = 'syncing';
      this.notifyListeners();

      let response;
      const url = `${API_BASE_URL}/api/${item.entity}`;

      switch (item.type) {
        case 'create':
            response = await this.makeRequest('POST', url, item.data);
            break;
        case 'update':
            response = await this.makeRequest('PUT', `${url}/${item.data.id}`, item.data);
            break;
        case 'delete':
            response = await this.makeRequest('DELETE', `${url}/${item.data.id}`);
            break;
      }

      if (response.ok) {
        item.status = 'completed';
        item.data = await response.json();
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

    } catch (error: any) {
      item.status = 'failed';
      item.error = error.message;
      item.retryCount++;

      // Remove item if it has failed too many times
      if (item.retryCount >= 3) {
        this.syncQueue = this.syncQueue.filter(syncItem => syncItem.id !== item.id);
        Alert.alert(
          'Sync Failed',
          `Failed to sync ${item.entity} after 3 attempts. The item has been removed from the sync queue.`
        );
      }
    }

    this.notifyListeners();
  }

  /**
   * Make HTTP request with retry logic
   */
  private async makeRequest(
    method: string,
    url: string,
    data?: any
  ): Promise<Response> {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await this.getAuthToken()}`
      }
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  }

  /**
   * Get authentication token
   */
  private async getAuthToken(): Promise<string> {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return token;
  }

  /**
   * Handle sync conflicts
   */
  public async handleConflict(conflict: ConflictResolution): Promise<void> {
    const { id, localData, serverData, resolution, mergedData } = conflict;
    
    let finalData;
    switch (resolution) {
      case 'local':
        finalData = localData;
        break;
      case 'server':
        finalData = serverData;
        break;
      case 'merge':
        finalData = mergedData;
        break;
    }

    // Update local data
    await this.updateLocalData(id, finalData);
    
    // Remove from sync queue if it was a pending update
    this.syncQueue = this.syncQueue.filter(item => item.id !== id);
    await this.saveSyncQueue();
  }

  /**
   * Update local data after conflict resolution
   */
  private async updateLocalData(id: string, data: any): Promise<void> {
    // This would update the local database/cache
    // Implementation depends on your data storage solution
    console.log('Updating local data:', id, data);
  }

  /**
   * Get sync logs
   */
  public getSyncLogs(): SyncItem[] {
    return [...this.syncQueue];
  }

  /**
   * Clear sync logs
   */
  public async clearSyncLogs(): Promise<void> {
    this.syncQueue = [];
    await this.saveSyncQueue();
    this.notifyListeners();
  }

  /**
   * Force sync specific entity
   */
  public async forceSyncEntity(entity: string): Promise<void> {
    const entityItems = this.syncQueue.filter(item => item.entity === entity);
    
    for (const item of entityItems) {
      if (item.status === 'pending' || item.status === 'failed') {
        item.status = 'pending';
        item.retryCount = 0;
        item.error = undefined;
      }
    }

    await this.saveSyncQueue();
    await this.sync();
  }

  /**
   * Selective sync - only sync specific items
   */
  public async selectiveSync(itemIds: string[]): Promise<void> {
    if (!this.isOnline || this.isSyncing) {
      return;
    }

    this.isSyncing = true;
    this.notifyListeners();

    try {
      const itemsToSync = this.syncQueue.filter(item => 
        itemIds.includes(item.id) && item.status === 'pending'
      );

      for (const item of itemsToSync) {
        await this.syncItem(item);
      }

    } catch (error) {
      console.error('Selective sync error:', error);
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }
  }

  /**
   * Background sync - lightweight sync when app is backgrounded
   */
  public async backgroundSync(): Promise<void> {
    if (!this.isOnline) {
      return;
    }

    // Only sync critical items in background
    const criticalItems = this.syncQueue.filter(item => 
      item.entity === 'expenses' || item.entity === 'invoices'
    );

    for (const item of criticalItems) {
      if (item.status === 'pending') {
        try {
          await this.syncItem(item);
        } catch (error) {
          console.error('Background sync error:', error);
        }
      }
    }
  }

  /**
   * Add sync status listener
   */
  public addSyncStatusListener(listener: (status: SyncStatus) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners of sync status change
   */
  private notifyListeners(): void {
    const status = this.getSyncStatus();
    this.listeners.forEach(listener => listener(status));
  }

  /**
   * Get last sync time
   */
  private getLastSyncTime(): number | undefined {
    const completedItems = this.syncQueue.filter(item => item.status === 'completed');
    if (completedItems.length === 0) {
      return undefined;
    }
    
    return Math.max(...completedItems.map(item => item.timestamp));
  }

  /**
   * Load sync queue from storage
   */
  private async loadSyncQueue(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('sync_queue');
      if (stored) {
        this.syncQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading sync queue:', error);
    }
  }

  /**
   * Save sync queue to storage
   */
  private async saveSyncQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Error saving sync queue:', error);
    }
  }

  /**
   * Cleanup
   */
  public destroy(): void {
    this.stopPeriodicSync();
    this.listeners = [];
  }
}

export default SyncService;



