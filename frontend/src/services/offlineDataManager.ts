interface OfflineTransaction {
  id: string;
  type: 'create' | 'update' | 'delete';
  endpoint: string;
  method: string;
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

interface OfflineDocument {
  id: string;
  name: string;
  content: string;
  type: string;
  size: number;
  timestamp: number;
}

class OfflineDataManager {
  private readonly STORAGE_KEYS = {
    TRANSACTIONS: 'verigrade-offline-transactions',
    DOCUMENTS: 'verigrade-offline-documents',
    CACHE: 'verigrade-offline-cache'
  };

  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 5000; // 5 seconds

  /**
   * Add transaction to offline queue
   */
  async addTransaction(transaction: Omit<OfflineTransaction, 'id' | 'timestamp' | 'retryCount'>): Promise<string> {
    const offlineTransaction: OfflineTransaction = {
      ...transaction,
      id: this.generateId(),
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: this.MAX_RETRIES
    };

    const transactions = await this.getOfflineTransactions();
    transactions.push(offlineTransaction);
    await this.saveOfflineTransactions(transactions);

    // Try to sync immediately if online
    if (navigator.onLine) {
      this.syncTransaction(offlineTransaction);
    }

    return offlineTransaction.id;
  }

  /**
   * Get all offline transactions
   */
  async getOfflineTransactions(): Promise<OfflineTransaction[]> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.TRANSACTIONS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get offline transactions:', error);
      return [];
    }
  }

  /**
   * Remove transaction from offline queue
   */
  async removeTransaction(id: string): Promise<void> {
    const transactions = await this.getOfflineTransactions();
    const filtered = transactions.filter(t => t.id !== id);
    await this.saveOfflineTransactions(filtered);
  }

  /**
   * Sync a single transaction
   */
  private async syncTransaction(transaction: OfflineTransaction): Promise<boolean> {
    try {
      const response = await fetch(transaction.endpoint, {
        method: transaction.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(transaction.data)
      });

      if (response.ok) {
        await this.removeTransaction(transaction.id);
        console.log('Transaction synced successfully:', transaction.id);
        return true;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to sync transaction:', transaction.id, error);
      
      // Increment retry count
      const transactions = await this.getOfflineTransactions();
      const updated = transactions.map(t => 
        t.id === transaction.id 
          ? { ...t, retryCount: t.retryCount + 1 }
          : t
      );
      await this.saveOfflineTransactions(updated);

      return false;
    }
  }

  /**
   * Sync all offline transactions
   */
  async syncAllTransactions(): Promise<{ success: number; failed: number }> {
    if (!navigator.onLine) {
      console.log('Device is offline, cannot sync transactions');
      return { success: 0, failed: 0 };
    }

    const transactions = await this.getOfflineTransactions();
    let success = 0;
    let failed = 0;

    for (const transaction of transactions) {
      if (transaction.retryCount >= transaction.maxRetries) {
        console.log('Transaction exceeded max retries, skipping:', transaction.id);
        failed++;
        continue;
      }

      const synced = await this.syncTransaction(transaction);
      if (synced) {
        success++;
      } else {
        failed++;
      }

      // Add delay between requests to avoid overwhelming the server
      await this.delay(1000);
    }

    console.log(`Sync completed: ${success} successful, ${failed} failed`);
    return { success, failed };
  }

  /**
   * Add document to offline storage
   */
  async addDocument(document: OfflineDocument): Promise<string> {
    const documents = await this.getOfflineDocuments();
    documents.push(document);
    await this.saveOfflineDocuments(documents);
    return document.id;
  }

  /**
   * Get all offline documents
   */
  async getOfflineDocuments(): Promise<OfflineDocument[]> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.DOCUMENTS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get offline documents:', error);
      return [];
    }
  }

  /**
   * Remove document from offline storage
   */
  async removeDocument(id: string): Promise<void> {
    const documents = await this.getOfflineDocuments();
    const filtered = documents.filter(d => d.id !== id);
    await this.saveOfflineDocuments(filtered);
  }

  /**
   * Cache data for offline access
   */
  async cacheData(key: string, data: any, ttl: number = 24 * 60 * 60 * 1000): Promise<void> {
    const cacheData = {
      data,
      timestamp: Date.now(),
      ttl
    };

    try {
      const cache = await this.getCache();
      cache[key] = cacheData;
      await this.saveCache(cache);
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  }

  /**
   * Get cached data
   */
  async getCachedData(key: string): Promise<any> {
    try {
      const cache = await this.getCache();
      const cached = cache[key];
      
      if (!cached) {
        return null;
      }

      // Check if data has expired
      if (Date.now() - cached.timestamp > cached.ttl) {
        delete cache[key];
        await this.saveCache(cache);
        return null;
      }

      return cached.data;
    } catch (error) {
      console.error('Failed to get cached data:', error);
      return null;
    }
  }

  /**
   * Clear expired cache
   */
  async clearExpiredCache(): Promise<void> {
    try {
      const cache = await this.getCache();
      const now = Date.now();
      let hasExpired = false;

      for (const key in cache) {
        if (now - cache[key].timestamp > cache[key].ttl) {
          delete cache[key];
          hasExpired = true;
        }
      }

      if (hasExpired) {
        await this.saveCache(cache);
        console.log('Expired cache cleared');
      }
    } catch (error) {
      console.error('Failed to clear expired cache:', error);
    }
  }

  /**
   * Get cache size in bytes
   */
  async getCacheSize(): Promise<number> {
    try {
      const cache = await this.getCache();
      return JSON.stringify(cache).length;
    } catch (error) {
      console.error('Failed to get cache size:', error);
      return 0;
    }
  }

  /**
   * Clear all offline data
   */
  async clearAllOfflineData(): Promise<void> {
    try {
      localStorage.removeItem(this.STORAGE_KEYS.TRANSACTIONS);
      localStorage.removeItem(this.STORAGE_KEYS.DOCUMENTS);
      localStorage.removeItem(this.STORAGE_KEYS.CACHE);
      console.log('All offline data cleared');
    } catch (error) {
      console.error('Failed to clear offline data:', error);
    }
  }

  /**
   * Get offline data statistics
   */
  async getOfflineStats(): Promise<{
    transactionCount: number;
    documentCount: number;
    cacheSize: number;
    oldestTransaction?: Date;
    newestTransaction?: Date;
  }> {
    const transactions = await this.getOfflineTransactions();
    const documents = await this.getOfflineDocuments();
    const cacheSize = await this.getCacheSize();

    const timestamps = transactions.map(t => t.timestamp);
    const oldestTransaction = timestamps.length > 0 ? new Date(Math.min(...timestamps)) : undefined;
    const newestTransaction = timestamps.length > 0 ? new Date(Math.max(...timestamps)) : undefined;

    return {
      transactionCount: transactions.length,
      documentCount: documents.length,
      cacheSize,
      oldestTransaction,
      newestTransaction
    };
  }

  /**
   * Save offline transactions to localStorage
   */
  private async saveOfflineTransactions(transactions: OfflineTransaction[]): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (error) {
      console.error('Failed to save offline transactions:', error);
    }
  }

  /**
   * Save offline documents to localStorage
   */
  private async saveOfflineDocuments(documents: OfflineDocument[]): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
    } catch (error) {
      console.error('Failed to save offline documents:', error);
    }
  }

  /**
   * Get cache from localStorage
   */
  private async getCache(): Promise<Record<string, any>> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.CACHE);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to get cache:', error);
      return {};
    }
  }

  /**
   * Save cache to localStorage
   */
  private async saveCache(cache: Record<string, any>): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEYS.CACHE, JSON.stringify(cache));
    } catch (error) {
      console.error('Failed to save cache:', error);
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Initialize offline data manager
   */
  async initialize(): Promise<void> {
    // Clear expired cache on initialization
    await this.clearExpiredCache();

    // Set up online/offline event listeners
    window.addEventListener('online', () => {
      console.log('Device came online, syncing offline data...');
      this.syncAllTransactions();
    });

    // Periodic sync when online
    setInterval(async () => {
      if (navigator.onLine) {
        await this.syncAllTransactions();
      }
    }, 30000); // Sync every 30 seconds when online
  }
}

// Create singleton instance
export const offlineDataManager = new OfflineDataManager();
export default offlineDataManager;

