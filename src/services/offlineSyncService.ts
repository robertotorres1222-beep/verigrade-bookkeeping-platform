interface OfflineAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'transaction' | 'inventory' | 'customer' | 'report';
  data: any;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
}

interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingActions: number;
  lastSync: Date | null;
  errors: string[];
}

interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: string[];
}

class OfflineSyncService {
  private actions: OfflineAction[] = [];
  private status: SyncStatus = {
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingActions: 0,
    lastSync: null,
    errors: []
  };
  private listeners: Array<(status: SyncStatus) => void> = [];

  constructor() {
    this.initializeServiceWorker();
    this.setupEventListeners();
    this.loadStoredActions();
  }

  private initializeServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }

  private setupEventListeners() {
    // Online/offline status
    window.addEventListener('online', () => {
      this.status.isOnline = true;
      this.notifyListeners();
      this.syncPendingActions();
    });

    window.addEventListener('offline', () => {
      this.status.isOnline = false;
      this.notifyListeners();
    });

    // Visibility change - sync when app becomes visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.status.isOnline) {
        this.syncPendingActions();
      }
    });

    // Periodic sync
    setInterval(() => {
      if (this.status.isOnline && this.actions.length > 0) {
        this.syncPendingActions();
      }
    }, 30000); // Sync every 30 seconds
  }

  private loadStoredActions() {
    try {
      const stored = localStorage.getItem('verigrade-offline-actions');
      if (stored) {
        this.actions = JSON.parse(stored).map((action: any) => ({
          ...action,
          timestamp: new Date(action.timestamp)
        }));
        this.status.pendingActions = this.actions.length;
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to load stored actions:', error);
    }
  }

  private saveStoredActions() {
    try {
      localStorage.setItem('verigrade-offline-actions', JSON.stringify(this.actions));
    } catch (error) {
      console.error('Failed to save stored actions:', error);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.status));
  }

  // Public methods
  addAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>): string {
    const newAction: OfflineAction = {
      ...action,
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      retryCount: 0,
      maxRetries: action.maxRetries || 3
    };

    this.actions.push(newAction);
    this.status.pendingActions = this.actions.length;
    this.saveStoredActions();
    this.notifyListeners();

    // Try to sync immediately if online
    if (this.status.isOnline) {
      this.syncPendingActions();
    }

    return newAction.id;
  }

  async syncPendingActions(): Promise<SyncResult> {
    if (this.status.isSyncing || !this.status.isOnline || this.actions.length === 0) {
      return {
        success: true,
        synced: 0,
        failed: 0,
        errors: []
      };
    }

    this.status.isSyncing = true;
    this.notifyListeners();

    const result: SyncResult = {
      success: true,
      synced: 0,
      failed: 0,
      errors: []
    };

    const actionsToSync = [...this.actions];
    const syncedActions: string[] = [];

    for (const action of actionsToSync) {
      try {
        const success = await this.syncAction(action);
        
        if (success) {
          syncedActions.push(action.id);
          result.synced++;
        } else {
          action.retryCount++;
          result.failed++;
          
          if (action.retryCount >= action.maxRetries) {
            result.errors.push(`Action ${action.id} exceeded max retries`);
            syncedActions.push(action.id); // Remove from pending
          }
        }
      } catch (error) {
        action.retryCount++;
        result.failed++;
        result.errors.push(`Action ${action.id} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        
        if (action.retryCount >= action.maxRetries) {
          syncedActions.push(action.id); // Remove from pending
        }
      }
    }

    // Remove synced actions
    this.actions = this.actions.filter(action => !syncedActions.includes(action.id));
    this.status.pendingActions = this.actions.length;
    this.status.lastSync = new Date();
    this.saveStoredActions();

    this.status.isSyncing = false;
    this.notifyListeners();

    return result;
  }

  private async syncAction(action: OfflineAction): Promise<boolean> {
    try {
      let response: Response;

      switch (action.entity) {
        case 'transaction':
          response = await this.syncTransaction(action);
          break;
        case 'inventory':
          response = await this.syncInventory(action);
          break;
        case 'customer':
          response = await this.syncCustomer(action);
          break;
        case 'report':
          response = await this.syncReport(action);
          break;
        default:
          throw new Error(`Unknown entity type: ${action.entity}`);
      }

      return response.ok;
    } catch (error) {
      console.error('Failed to sync action:', error);
      return false;
    }
  }

  private async syncTransaction(action: OfflineAction): Promise<Response> {
    const { type, data } = action;
    
    switch (type) {
      case 'CREATE':
        return fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      case 'UPDATE':
        return fetch(`/api/transactions/${data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      case 'DELETE':
        return fetch(`/api/transactions/${data.id}`, {
          method: 'DELETE'
        });
      default:
        throw new Error(`Unknown action type: ${type}`);
    }
  }

  private async syncInventory(action: OfflineAction): Promise<Response> {
    const { type, data } = action;
    
    switch (type) {
      case 'CREATE':
        return fetch('/api/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      case 'UPDATE':
        return fetch(`/api/inventory/${data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      case 'DELETE':
        return fetch(`/api/inventory/${data.id}`, {
          method: 'DELETE'
        });
      default:
        throw new Error(`Unknown action type: ${type}`);
    }
  }

  private async syncCustomer(action: OfflineAction): Promise<Response> {
    const { type, data } = action;
    
    switch (type) {
      case 'CREATE':
        return fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      case 'UPDATE':
        return fetch(`/api/customers/${data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      case 'DELETE':
        return fetch(`/api/customers/${data.id}`, {
          method: 'DELETE'
        });
      default:
        throw new Error(`Unknown action type: ${type}`);
    }
  }

  private async syncReport(action: OfflineAction): Promise<Response> {
    const { type, data } = action;
    
    switch (type) {
      case 'CREATE':
        return fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      case 'UPDATE':
        return fetch(`/api/reports/${data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      case 'DELETE':
        return fetch(`/api/reports/${data.id}`, {
          method: 'DELETE'
        });
      default:
        throw new Error(`Unknown action type: ${type}`);
    }
  }

  // Convenience methods for common actions
  createTransaction(data: any): string {
    return this.addAction({
      type: 'CREATE',
      entity: 'transaction',
      data,
      maxRetries: 3
    });
  }

  updateTransaction(id: string, data: any): string {
    return this.addAction({
      type: 'UPDATE',
      entity: 'transaction',
      data: { id, ...data },
      maxRetries: 3
    });
  }

  deleteTransaction(id: string): string {
    return this.addAction({
      type: 'DELETE',
      entity: 'transaction',
      data: { id },
      maxRetries: 3
    });
  }

  createInventoryItem(data: any): string {
    return this.addAction({
      type: 'CREATE',
      entity: 'inventory',
      data,
      maxRetries: 3
    });
  }

  updateInventoryItem(id: string, data: any): string {
    return this.addAction({
      type: 'UPDATE',
      entity: 'inventory',
      data: { id, ...data },
      maxRetries: 3
    });
  }

  deleteInventoryItem(id: string): string {
    return this.addAction({
      type: 'DELETE',
      entity: 'inventory',
      data: { id },
      maxRetries: 3
    });
  }

  // Status and listeners
  getStatus(): SyncStatus {
    return { ...this.status };
  }

  addStatusListener(listener: (status: SyncStatus) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  getPendingActions(): OfflineAction[] {
    return [...this.actions];
  }

  clearPendingActions(): void {
    this.actions = [];
    this.status.pendingActions = 0;
    this.saveStoredActions();
    this.notifyListeners();
  }

  // Force sync
  async forceSync(): Promise<SyncResult> {
    return this.syncPendingActions();
  }

  // Check if action is pending
  isActionPending(actionId: string): boolean {
    return this.actions.some(action => action.id === actionId);
  }

  // Get action by ID
  getAction(actionId: string): OfflineAction | null {
    return this.actions.find(action => action.id === actionId) || null;
  }

  // Remove specific action
  removeAction(actionId: string): boolean {
    const index = this.actions.findIndex(action => action.id === actionId);
    if (index > -1) {
      this.actions.splice(index, 1);
      this.status.pendingActions = this.actions.length;
      this.saveStoredActions();
      this.notifyListeners();
      return true;
    }
    return false;
  }
}

// Export singleton instance
export const offlineSyncService = new OfflineSyncService();
export default offlineSyncService;

// Export types
export type { SyncStatus, OfflineAction, SyncResult };

