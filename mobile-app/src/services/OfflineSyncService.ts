import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export class OfflineSyncService {
  private syncQueue: any[] = [];
  private isOnline: boolean = true;

  constructor() {
    this.initializeNetworkListener();
  }

  private initializeNetworkListener() {
    NetInfo.addEventListener(state => {
      this.isOnline = state.isConnected || false;
      
      if (this.isOnline) {
        this.processSyncQueue();
      }
    });
  }

  async addToSyncQueue(action: string, data: any) {
    try {
      const syncItem = {
        id: Date.now().toString(),
        action,
        data,
        timestamp: new Date().toISOString(),
        retryCount: 0
      };

      this.syncQueue.push(syncItem);
      await this.saveSyncQueue();

      if (this.isOnline) {
        await this.processSyncQueue();
      }

      return syncItem;
    } catch (error) {
      throw new Error(`Failed to add to sync queue: ${error.message}`);
    }
  }

  async processSyncQueue() {
    if (!this.isOnline || this.syncQueue.length === 0) {
      return;
    }

    const itemsToSync = [...this.syncQueue];
    this.syncQueue = [];

    for (const item of itemsToSync) {
      try {
        await this.syncItem(item);
        await this.removeFromSyncQueue(item.id);
      } catch (error) {
        item.retryCount++;
        if (item.retryCount < 3) {
          this.syncQueue.push(item);
        }
      }
    }

    await this.saveSyncQueue();
  }

  private async syncItem(item: any) {
    const { action, data } = item;

    switch (action) {
      case 'CREATE_TRANSACTION':
        await this.syncCreateTransaction(data);
        break;
      case 'UPDATE_TRANSACTION':
        await this.syncUpdateTransaction(data);
        break;
      case 'DELETE_TRANSACTION':
        await this.syncDeleteTransaction(data);
        break;
      case 'CREATE_INVOICE':
        await this.syncCreateInvoice(data);
        break;
      case 'UPDATE_INVOICE':
        await this.syncUpdateInvoice(data);
        break;
      default:
        throw new Error(`Unknown sync action: ${action}`);
    }
  }

  private async syncCreateTransaction(data: any) {
    // Sync transaction creation with backend
    const response = await fetch('/api/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.token}`
      },
      body: JSON.stringify(data.transaction)
    });

    if (!response.ok) {
      throw new Error('Failed to sync transaction creation');
    }
  }

  private async syncUpdateTransaction(data: any) {
    // Sync transaction update with backend
    const response = await fetch(`/api/transactions/${data.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.token}`
      },
      body: JSON.stringify(data.transaction)
    });

    if (!response.ok) {
      throw new Error('Failed to sync transaction update');
    }
  }

  private async syncDeleteTransaction(data: any) {
    // Sync transaction deletion with backend
    const response = await fetch(`/api/transactions/${data.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${data.token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to sync transaction deletion');
    }
  }

  private async syncCreateInvoice(data: any) {
    // Sync invoice creation with backend
    const response = await fetch('/api/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.token}`
      },
      body: JSON.stringify(data.invoice)
    });

    if (!response.ok) {
      throw new Error('Failed to sync invoice creation');
    }
  }

  private async syncUpdateInvoice(data: any) {
    // Sync invoice update with backend
    const response = await fetch(`/api/invoices/${data.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.token}`
      },
      body: JSON.stringify(data.invoice)
    });

    if (!response.ok) {
      throw new Error('Failed to sync invoice update');
    }
  }

  private async saveSyncQueue() {
    try {
      await AsyncStorage.setItem('syncQueue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Failed to save sync queue:', error);
    }
  }

  private async loadSyncQueue() {
    try {
      const queueData = await AsyncStorage.getItem('syncQueue');
      if (queueData) {
        this.syncQueue = JSON.parse(queueData);
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error);
    }
  }

  private async removeFromSyncQueue(itemId: string) {
    this.syncQueue = this.syncQueue.filter(item => item.id !== itemId);
    await this.saveSyncQueue();
  }

  async getSyncStatus() {
    return {
      isOnline: this.isOnline,
      queueLength: this.syncQueue.length,
      queue: this.syncQueue
    };
  }

  async clearSyncQueue() {
    this.syncQueue = [];
    await AsyncStorage.removeItem('syncQueue');
  }
}

export default new OfflineSyncService();










