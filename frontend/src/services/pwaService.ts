interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAEvent {
  type: 'install' | 'update' | 'offline' | 'online' | 'sync';
  data?: any;
}

class PWAService {
  private installPrompt: PWAInstallPrompt | null = null;
  private isInstalled = false;
  private isOnline = navigator.onLine;
  private eventListeners: ((event: PWAEvent) => void)[] = [];
  private syncQueue: any[] = [];

  constructor() {
    this.initializeServiceWorker();
    this.setupEventListeners();
    this.checkInstallStatus();
  }

  /**
   * Initialize the service worker
   */
  private async initializeServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.emitEvent({ type: 'update' });
              }
            });
          }
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  /**
   * Setup event listeners for online/offline status
   */
  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.emitEvent({ type: 'online' });
      this.syncOfflineData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.emitEvent({ type: 'offline' });
    });

    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPrompt = e as any;
      this.emitEvent({ type: 'install' });
    });

    // Listen for appinstalled event
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.installPrompt = null;
      console.log('PWA installed successfully');
    });
  }

  /**
   * Check if PWA is already installed
   */
  private checkInstallStatus(): void {
    // Check if running in standalone mode (installed)
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true) {
      this.isInstalled = true;
    }
  }

  /**
   * Show install prompt if available
   */
  async showInstallPrompt(): Promise<boolean> {
    if (!this.installPrompt) {
      return false;
    }

    try {
      await this.installPrompt.prompt();
      const choiceResult = await this.installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        this.isInstalled = true;
        this.installPrompt = null;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error showing install prompt:', error);
      return false;
    }
  }

  /**
   * Check if PWA can be installed
   */
  canInstall(): boolean {
    return this.installPrompt !== null && !this.isInstalled;
  }

  /**
   * Check if PWA is installed
   */
  isPWAInstalled(): boolean {
    return this.isInstalled;
  }

  /**
   * Check if device is online
   */
  isDeviceOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Add data to sync queue for offline sync
   */
  addToSyncQueue(data: any): void {
    this.syncQueue.push({
      ...data,
      timestamp: Date.now(),
      id: Math.random().toString(36).substr(2, 9)
    });
    
    // Store in localStorage for persistence
    localStorage.setItem('verigrade-sync-queue', JSON.stringify(this.syncQueue));
  }

  /**
   * Get sync queue
   */
  getSyncQueue(): any[] {
    const stored = localStorage.getItem('verigrade-sync-queue');
    if (stored) {
      this.syncQueue = JSON.parse(stored);
    }
    return this.syncQueue;
  }

  /**
   * Clear sync queue
   */
  clearSyncQueue(): void {
    this.syncQueue = [];
    localStorage.removeItem('verigrade-sync-queue');
  }

  /**
   * Sync offline data when back online
   */
  private async syncOfflineData(): Promise<void> {
    if (!this.isOnline) return;

    const queue = this.getSyncQueue();
    if (queue.length === 0) return;

    console.log('Syncing offline data...', queue.length, 'items');

    for (const item of queue) {
      try {
        await this.syncItem(item);
        console.log('Synced item:', item.id);
      } catch (error) {
        console.error('Failed to sync item:', item.id, error);
      }
    }

    this.clearSyncQueue();
    this.emitEvent({ type: 'sync' });
  }

  /**
   * Sync individual item
   */
  private async syncItem(item: any): Promise<void> {
    const { type, data, endpoint, method = 'POST' } = item;

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Sync failed for item:', item.id, error);
      throw error;
    }
  }

  /**
   * Cache data for offline use
   */
  async cacheData(key: string, data: any): Promise<void> {
    try {
      const cache = await caches.open('verigrade-data-cache');
      const response = new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' }
      });
      await cache.put(key, response);
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  }

  /**
   * Get cached data
   */
  async getCachedData(key: string): Promise<any> {
    try {
      const cache = await caches.open('verigrade-data-cache');
      const response = await cache.match(key);
      
      if (response) {
        return await response.json();
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get cached data:', error);
      return null;
    }
  }

  /**
   * Clear cache
   */
  async clearCache(): Promise<void> {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('Cache cleared');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  /**
   * Request background sync
   */
  async requestBackgroundSync(tag: string): Promise<void> {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register(tag);
        console.log('Background sync registered:', tag);
      } catch (error) {
        console.error('Failed to register background sync:', error);
      }
    }
  }

  /**
   * Add event listener
   */
  addEventListener(callback: (event: PWAEvent) => void): void {
    this.eventListeners.push(callback);
  }

  /**
   * Remove event listener
   */
  removeEventListener(callback: (event: PWAEvent) => void): void {
    this.eventListeners = this.eventListeners.filter(listener => listener !== callback);
  }

  /**
   * Emit event to listeners
   */
  private emitEvent(event: PWAEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in event listener:', error);
      }
    });
  }

  /**
   * Get app info
   */
  getAppInfo(): {
    isInstalled: boolean;
    isOnline: boolean;
    canInstall: boolean;
    syncQueueLength: number;
  } {
    return {
      isInstalled: this.isInstalled,
      isOnline: this.isOnline,
      canInstall: this.canInstall(),
      syncQueueLength: this.syncQueue.length
    };
  }

  /**
   * Update service worker
   */
  async updateServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
          console.log('Service Worker updated');
        }
      } catch (error) {
        console.error('Failed to update service worker:', error);
      }
    }
  }

  /**
   * Check for updates
   */
  async checkForUpdates(): Promise<boolean> {
    try {
      const response = await fetch('/sw.js', { cache: 'no-cache' });
      const newContent = await response.text();
      
      // Simple check - in production, you'd want more sophisticated version checking
      const currentVersion = localStorage.getItem('sw-version');
      const newVersion = btoa(newContent).substr(0, 10);
      
      if (currentVersion !== newVersion) {
        localStorage.setItem('sw-version', newVersion);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to check for updates:', error);
      return false;
    }
  }
}

// Create singleton instance
export const pwaService = new PWAService();
export default pwaService;

