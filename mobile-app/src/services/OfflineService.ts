import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';

export interface OfflineAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: string;
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingActions: number;
  lastSync: Date | null;
  syncErrors: string[];
}

class OfflineService {
  private static instance: OfflineService;
  private syncQueue: OfflineAction[] = [];
  private isOnline: boolean = true;
  private isSyncing: boolean = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private listeners: Array<(status: SyncStatus) => void> = [];

  private constructor() {
    this.initializeOfflineService();
  }

  public static getInstance(): OfflineService {
    if (!OfflineService.instance) {
      OfflineService.instance = new OfflineService();
    }
    return OfflineService.instance;
  }

  private async initializeOfflineService(): Promise<void> {
    // Load existing queue from storage
    await this.loadSyncQueue();
    
    // Setup network monitoring
    this.setupNetworkMonitoring();
    
    // Start sync interval
    this.startSyncInterval();
  }

  private setupNetworkMonitoring(): void {
    NetInfo.addEventListener(state => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected ?? false;
      
      if (!wasOnline && this.isOnline) {
        // Just came online, trigger sync
        this.sync();
      }
      
      this.notifyListeners();
    });
  }

  private startSyncInterval(): void {
    // Sync every 30 seconds when online
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.sync();
      }
    }, 30000);
  }

  /**
   * Add action to offline queue
   */
  async addAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>): Promise<string> {
    const offlineAction: OfflineAction = {
      ...action,
      id: this.generateId(),
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.syncQueue.push(offlineAction);
    await this.saveSyncQueue();
    
    // Try to sync immediately if online
    if (this.isOnline) {
      this.sync();
    }

    return offlineAction.id;
  }

  /**
   * Create entity offline
   */
  async createOffline(entity: string, data: any): Promise<string> {
    return this.addAction({
      type: 'CREATE',
      entity,
      data,
      maxRetries: 3,
    });
  }

  /**
   * Update entity offline
   */
  async updateOffline(entity: string, id: string, data: any): Promise<string> {
    return this.addAction({
      type: 'UPDATE',
      entity,
      data: { id, ...data },
      maxRetries: 3,
    });
  }

  /**
   * Delete entity offline
   */
  async deleteOffline(entity: string, id: string): Promise<string> {
    return this.addAction({
      type: 'DELETE',
      entity,
      data: { id },
      maxRetries: 3,
    });
  }

  /**
   * Sync offline actions
   */
  async sync(): Promise<void> {
    if (this.isSyncing || !this.isOnline || this.syncQueue.length === 0) {
      return;
    }

    this.isSyncing = true;
    this.notifyListeners();

    try {
      const actionsToSync = [...this.syncQueue];
      const successfulActions: string[] = [];
      const failedActions: OfflineAction[] = [];

      for (const action of actionsToSync) {
        try {
          await this.executeAction(action);
          successfulActions.push(action.id);
        } catch (error) {
          console.error(`Failed to sync action ${action.id}:`, error);
          
          action.retryCount++;
          if (action.retryCount < action.maxRetries) {
            failedActions.push(action);
          } else {
            // Max retries reached, remove from queue
            console.warn(`Action ${action.id} exceeded max retries, removing from queue`);
          }
        }
      }

      // Update queue with failed actions
      this.syncQueue = failedActions;
      await this.saveSyncQueue();

      // Remove successful actions from queue
      if (successfulActions.length > 0) {
        console.log(`Successfully synced ${successfulActions.length} actions`);
      }

    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }
  }

  /**
   * Execute a single action
   */
  private async executeAction(action: OfflineAction): Promise<void> {
    const { type, entity, data } = action;
    
    let url: string;
    let method: string;
    let body: any;

    switch (type) {
      case 'CREATE':
        url = `/api/${entity.toLowerCase()}`;
        method = 'POST';
        body = data;
        break;
      case 'UPDATE':
        url = `/api/${entity.toLowerCase()}/${data.id}`;
        method = 'PUT';
        body = data;
        break;
      case 'DELETE':
        url = `/api/${entity.toLowerCase()}/${data.id}`;
        method = 'DELETE';
        body = undefined;
        break;
      default:
        throw new Error(`Unknown action type: ${type}`);
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await this.getAuthToken()}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  /**
   * Get authentication token
   */
  private async getAuthToken(): Promise<string> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      return token || '';
    } catch (error) {
      console.error('Error getting auth token:', error);
      return '';
    }
  }

  /**
   * Load sync queue from storage
   */
  private async loadSyncQueue(): Promise<void> {
    try {
      const queueData = await AsyncStorage.getItem('sync_queue');
      if (queueData) {
        this.syncQueue = JSON.parse(queueData);
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
   * Get sync status
   */
  getSyncStatus(): SyncStatus {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      pendingActions: this.syncQueue.length,
      lastSync: null, // This would be tracked in a real implementation
      syncErrors: [], // This would be tracked in a real implementation
    };
  }

  /**
   * Add sync status listener
   */
  addSyncStatusListener(listener: (status: SyncStatus) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify listeners of status changes
   */
  private notifyListeners(): void {
    const status = this.getSyncStatus();
    this.listeners.forEach(listener => listener(status));
  }

  /**
   * Clear sync queue
   */
  async clearSyncQueue(): Promise<void> {
    this.syncQueue = [];
    await this.saveSyncQueue();
    this.notifyListeners();
  }

  /**
   * Get pending actions
   */
  getPendingActions(): OfflineAction[] {
    return [...this.syncQueue];
  }

  /**
   * Remove specific action from queue
   */
  async removeAction(actionId: string): Promise<boolean> {
    const initialLength = this.syncQueue.length;
    this.syncQueue = this.syncQueue.filter(action => action.id !== actionId);
    
    if (this.syncQueue.length < initialLength) {
      await this.saveSyncQueue();
      this.notifyListeners();
      return true;
    }
    
    return false;
  }

  /**
   * Retry failed actions
   */
  async retryFailedActions(): Promise<void> {
    const failedActions = this.syncQueue.filter(action => action.retryCount > 0);
    
    if (failedActions.length > 0) {
      console.log(`Retrying ${failedActions.length} failed actions`);
      await this.sync();
    }
  }

  /**
   * Force sync (ignore online status)
   */
  async forceSync(): Promise<void> {
    if (this.syncQueue.length === 0) {
      return;
    }

    console.log('Force syncing offline actions...');
    await this.sync();
  }

  /**
   * Check if action is pending
   */
  isActionPending(actionId: string): boolean {
    return this.syncQueue.some(action => action.id === actionId);
  }

  /**
   * Get action by ID
   */
  getAction(actionId: string): OfflineAction | undefined {
    return this.syncQueue.find(action => action.id === actionId);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.listeners = [];
  }
}

export default OfflineService;