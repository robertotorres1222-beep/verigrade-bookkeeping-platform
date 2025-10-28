import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { EventEmitter } from 'events';
import logger from '../utils/logger';

export interface OfflineAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: string;
  entityId: string;
  data: any;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  error?: string;
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingActions: number;
  lastSyncTime?: Date;
  syncProgress: number;
  errors: string[];
}

export interface OfflineConfig {
  maxRetries: number;
  retryDelay: number;
  batchSize: number;
  syncInterval: number;
  conflictResolution: 'SERVER_WINS' | 'CLIENT_WINS' | 'MERGE' | 'MANUAL';
  entities: string[];
}

class OfflineManager extends EventEmitter {
  private static instance: OfflineManager;
  private isOnline: boolean = false;
  private isSyncing: boolean = false;
  private pendingActions: OfflineAction[] = [];
  private syncInterval?: NodeJS.Timeout;
  private config: OfflineConfig;
  private actionQueue: OfflineAction[] = [];
  private syncStatus: SyncStatus;

  private constructor() {
    super();
    this.config = {
      maxRetries: 3,
      retryDelay: 5000,
      batchSize: 10,
      syncInterval: 30000, // 30 seconds
      conflictResolution: 'SERVER_WINS',
      entities: ['expenses', 'invoices', 'transactions', 'users', 'organizations'],
    };
    this.syncStatus = {
      isOnline: false,
      isSyncing: false,
      pendingActions: 0,
      syncProgress: 0,
      errors: [],
    };
    this.initialize();
  }

  public static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  private async initialize(): Promise<void> {
    try {
      // Load pending actions from storage
      await this.loadPendingActions();
      
      // Set up network monitoring
      this.setupNetworkMonitoring();
      
      // Start sync interval
      this.startSyncInterval();
      
      logger.info('[OfflineManager] Initialized successfully');
    } catch (error) {
      logger.error('[OfflineManager] Initialization failed:', error);
    }
  }

  private setupNetworkMonitoring(): void {
    NetInfo.addEventListener(state => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected ?? false;
      
      if (wasOnline !== this.isOnline) {
        this.syncStatus.isOnline = this.isOnline;
        this.emit('networkStatusChanged', this.isOnline);
        
        if (this.isOnline && this.pendingActions.length > 0) {
          this.sync();
        }
      }
    });
  }

  private startSyncInterval(): void {
    this.syncInterval = setInterval(() => {
      if (this.isOnline && this.pendingActions.length > 0) {
        this.sync();
      }
    }, this.config.syncInterval);
  }

  private stopSyncInterval(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = undefined;
    }
  }

  /**
   * Add an action to the offline queue
   */
  public async addAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount' | 'status'>): Promise<string> {
    try {
      const offlineAction: OfflineAction = {
        ...action,
        id: this.generateId(),
        timestamp: new Date(),
        retryCount: 0,
        status: 'PENDING',
      };

      this.pendingActions.push(offlineAction);
      await this.savePendingActions();
      
      this.updateSyncStatus();
      this.emit('actionAdded', offlineAction);
      
      // Try to sync immediately if online
      if (this.isOnline) {
        this.sync();
      }
      
      logger.info(`[OfflineManager] Added action: ${offlineAction.type} ${offlineAction.entity}`);
      return offlineAction.id;
    } catch (error) {
      logger.error('[OfflineManager] Failed to add action:', error);
      throw error;
    }
  }

  /**
   * Update an existing action
   */
  public async updateAction(actionId: string, updates: Partial<OfflineAction>): Promise<void> {
    try {
      const index = this.pendingActions.findIndex(action => action.id === actionId);
      if (index === -1) {
        throw new Error(`Action ${actionId} not found`);
      }

      this.pendingActions[index] = {
        ...this.pendingActions[index],
        ...updates,
      };

      await this.savePendingActions();
      this.updateSyncStatus();
      this.emit('actionUpdated', this.pendingActions[index]);
      
      logger.info(`[OfflineManager] Updated action: ${actionId}`);
    } catch (error) {
      logger.error('[OfflineManager] Failed to update action:', error);
      throw error;
    }
  }

  /**
   * Remove an action from the queue
   */
  public async removeAction(actionId: string): Promise<void> {
    try {
      const index = this.pendingActions.findIndex(action => action.id === actionId);
      if (index === -1) {
        throw new Error(`Action ${actionId} not found`);
      }

      this.pendingActions.splice(index, 1);
      await this.savePendingActions();
      this.updateSyncStatus();
      this.emit('actionRemoved', actionId);
      
      logger.info(`[OfflineManager] Removed action: ${actionId}`);
    } catch (error) {
      logger.error('[OfflineManager] Failed to remove action:', error);
      throw error;
    }
  }

  /**
   * Sync pending actions with the server
   */
  public async sync(): Promise<void> {
    if (this.isSyncing || !this.isOnline || this.pendingActions.length === 0) {
      return;
    }

    this.isSyncing = true;
    this.syncStatus.isSyncing = true;
    this.emit('syncStarted');

    try {
      const actionsToSync = this.pendingActions
        .filter(action => action.status === 'PENDING' || action.status === 'FAILED')
        .sort((a, b) => this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority))
        .slice(0, this.config.batchSize);

      logger.info(`[OfflineManager] Syncing ${actionsToSync.length} actions`);

      for (let i = 0; i < actionsToSync.length; i++) {
        const action = actionsToSync[i];
        this.syncStatus.syncProgress = ((i + 1) / actionsToSync.length) * 100;
        this.emit('syncProgress', this.syncStatus.syncProgress);

        try {
          await this.syncAction(action);
          action.status = 'COMPLETED';
          action.retryCount = 0;
          this.emit('actionSynced', action);
        } catch (error) {
          action.status = 'FAILED';
          action.retryCount++;
          action.error = error instanceof Error ? error.message : 'Unknown error';
          this.emit('actionFailed', action, error);
          
          if (action.retryCount >= action.maxRetries) {
            logger.error(`[OfflineManager] Action ${action.id} failed permanently after ${action.maxRetries} retries`);
            this.syncStatus.errors.push(`Action ${action.id} failed: ${action.error}`);
          }
        }
      }

      // Remove completed actions
      this.pendingActions = this.pendingActions.filter(action => action.status !== 'COMPLETED');
      await this.savePendingActions();

      this.syncStatus.lastSyncTime = new Date();
      this.syncStatus.syncProgress = 100;
      this.updateSyncStatus();
      this.emit('syncCompleted');

      logger.info(`[OfflineManager] Sync completed. ${this.pendingActions.length} actions remaining`);
    } catch (error) {
      logger.error('[OfflineManager] Sync failed:', error);
      this.syncStatus.errors.push(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      this.emit('syncFailed', error);
    } finally {
      this.isSyncing = false;
      this.syncStatus.isSyncing = false;
    }
  }

  /**
   * Sync a single action with the server
   */
  private async syncAction(action: OfflineAction): Promise<void> {
    try {
      const { type, entity, entityId, data } = action;
      
      let response;
      switch (type) {
        case 'CREATE':
          response = await this.createEntity(entity, data);
          break;
        case 'UPDATE':
          response = await this.updateEntity(entity, entityId, data);
          break;
        case 'DELETE':
          response = await this.deleteEntity(entity, entityId);
          break;
        default:
          throw new Error(`Unknown action type: ${type}`);
      }

      // Handle conflict resolution if needed
      if (response.conflict) {
        await this.handleConflict(action, response);
      }

      logger.info(`[OfflineManager] Successfully synced action ${action.id}`);
    } catch (error) {
      logger.error(`[OfflineManager] Failed to sync action ${action.id}:`, error);
      throw error;
    }
  }

  /**
   * Handle conflicts during sync
   */
  private async handleConflict(action: OfflineAction, response: any): Promise<void> {
    switch (this.config.conflictResolution) {
      case 'SERVER_WINS':
        // Use server data, update local storage
        await this.updateLocalEntity(action.entity, action.entityId, response.data);
        break;
      case 'CLIENT_WINS':
        // Keep client data, retry with force flag
        await this.retryActionWithForce(action);
        break;
      case 'MERGE':
        // Merge client and server data
        const mergedData = this.mergeData(action.data, response.data);
        await this.updateLocalEntity(action.entity, action.entityId, mergedData);
        break;
      case 'MANUAL':
        // Emit conflict event for manual resolution
        this.emit('conflictDetected', action, response);
        break;
    }
  }

  /**
   * Get sync status
   */
  public getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * Get pending actions
   */
  public getPendingActions(): OfflineAction[] {
    return [...this.pendingActions];
  }

  /**
   * Get pending actions by entity
   */
  public getPendingActionsByEntity(entity: string): OfflineAction[] {
    return this.pendingActions.filter(action => action.entity === entity);
  }

  /**
   * Clear all pending actions
   */
  public async clearPendingActions(): Promise<void> {
    try {
      this.pendingActions = [];
      await this.savePendingActions();
      this.updateSyncStatus();
      this.emit('actionsCleared');
      
      logger.info('[OfflineManager] Cleared all pending actions');
    } catch (error) {
      logger.error('[OfflineManager] Failed to clear pending actions:', error);
      throw error;
    }
  }

  /**
   * Force sync all pending actions
   */
  public async forceSync(): Promise<void> {
    if (this.isSyncing) {
      return;
    }

    // Reset retry counts
    this.pendingActions.forEach(action => {
      action.retryCount = 0;
      action.status = 'PENDING';
    });

    await this.sync();
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<OfflineConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Restart sync interval if interval changed
    if (config.syncInterval) {
      this.stopSyncInterval();
      this.startSyncInterval();
    }
    
    this.emit('configUpdated', this.config);
    logger.info('[OfflineManager] Configuration updated');
  }

  /**
   * Destroy the offline manager
   */
  public destroy(): void {
    this.stopSyncInterval();
    this.removeAllListeners();
    logger.info('[OfflineManager] Destroyed');
  }

  // Private helper methods
  private generateId(): string {
    return `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getPriorityValue(priority: string): number {
    switch (priority) {
      case 'HIGH': return 3;
      case 'MEDIUM': return 2;
      case 'LOW': return 1;
      default: return 0;
    }
  }

  private updateSyncStatus(): void {
    this.syncStatus.pendingActions = this.pendingActions.length;
    this.emit('syncStatusChanged', this.syncStatus);
  }

  private async loadPendingActions(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('offline_actions');
      if (stored) {
        const actions = JSON.parse(stored);
        this.pendingActions = actions.map((action: any) => ({
          ...action,
          timestamp: new Date(action.timestamp),
        }));
        this.updateSyncStatus();
      }
    } catch (error) {
      logger.error('[OfflineManager] Failed to load pending actions:', error);
    }
  }

  private async savePendingActions(): Promise<void> {
    try {
      await AsyncStorage.setItem('offline_actions', JSON.stringify(this.pendingActions));
    } catch (error) {
      logger.error('[OfflineManager] Failed to save pending actions:', error);
    }
  }

  private async createEntity(entity: string, data: any): Promise<any> {
    // Implement API call to create entity
    const response = await fetch(`/api/v1/${entity}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': await this.getApiKey(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create ${entity}: ${response.statusText}`);
    }

    return response.json();
  }

  private async updateEntity(entity: string, entityId: string, data: any): Promise<any> {
    // Implement API call to update entity
    const response = await fetch(`/api/v1/${entity}/${entityId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': await this.getApiKey(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update ${entity}: ${response.statusText}`);
    }

    return response.json();
  }

  private async deleteEntity(entity: string, entityId: string): Promise<any> {
    // Implement API call to delete entity
    const response = await fetch(`/api/v1/${entity}/${entityId}`, {
      method: 'DELETE',
      headers: {
        'X-API-Key': await this.getApiKey(),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete ${entity}: ${response.statusText}`);
    }

    return response.json();
  }

  private async getApiKey(): Promise<string> {
    // Implement API key retrieval
    const stored = await AsyncStorage.getItem('api_key');
    if (!stored) {
      throw new Error('API key not found');
    }
    return stored;
  }

  private mergeData(clientData: any, serverData: any): any {
    // Implement data merging logic
    return { ...serverData, ...clientData };
  }

  private async updateLocalEntity(entity: string, entityId: string, data: any): Promise<void> {
    // Implement local storage update
    await AsyncStorage.setItem(`${entity}_${entityId}`, JSON.stringify(data));
  }

  private async retryActionWithForce(action: OfflineAction): Promise<void> {
    // Implement retry with force flag
    action.retryCount = 0;
    action.status = 'PENDING';
    await this.syncAction(action);
  }
}

export default OfflineManager;









