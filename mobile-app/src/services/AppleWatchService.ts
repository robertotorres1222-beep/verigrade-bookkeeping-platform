import { NativeModules, NativeEventEmitter } from 'react-native';

export class AppleWatchService {
  private watchConnectivity: any;
  private eventEmitter: any;

  constructor() {
    this.watchConnectivity = NativeModules.WatchConnectivity;
    this.eventEmitter = new NativeEventEmitter(this.watchConnectivity);
  }

  async isWatchConnected() {
    try {
      const isConnected = await this.watchConnectivity.isWatchConnected();
      return isConnected;
    } catch (error) {
      console.error('Failed to check watch connection:', error);
      return false;
    }
  }

  async sendMessageToWatch(message: any) {
    try {
      const isConnected = await this.isWatchConnected();
      if (!isConnected) {
        throw new Error('Apple Watch is not connected');
      }

      const result = await this.watchConnectivity.sendMessage(message);
      return result;
    } catch (error) {
      throw new Error(`Failed to send message to watch: ${error.message}`);
    }
  }

  async getWatchData() {
    try {
      const isConnected = await this.isWatchConnected();
      if (!isConnected) {
        throw new Error('Apple Watch is not connected');
      }

      const data = await this.watchConnectivity.getWatchData();
      return data;
    } catch (error) {
      throw new Error(`Failed to get watch data: ${error.message}`);
    }
  }

  async syncExpensesWithWatch(expenses: any[]) {
    try {
      const message = {
        type: 'SYNC_EXPENSES',
        data: expenses
      };

      const result = await this.sendMessageToWatch(message);
      return result;
    } catch (error) {
      throw new Error(`Failed to sync expenses with watch: ${error.message}`);
    }
  }

  async syncInvoicesWithWatch(invoices: any[]) {
    try {
      const message = {
        type: 'SYNC_INVOICES',
        data: invoices
      };

      const result = await this.sendMessageToWatch(message);
      return result;
    } catch (error) {
      throw new Error(`Failed to sync invoices with watch: ${error.message}`);
    }
  }

  async syncTransactionsWithWatch(transactions: any[]) {
    try {
      const message = {
        type: 'SYNC_TRANSACTIONS',
        data: transactions
      };

      const result = await this.sendMessageToWatch(message);
      return result;
    } catch (error) {
      throw new Error(`Failed to sync transactions with watch: ${error.message}`);
    }
  }

  async getWatchHealthData() {
    try {
      const isConnected = await this.isWatchConnected();
      if (!isConnected) {
        throw new Error('Apple Watch is not connected');
      }

      const healthData = await this.watchConnectivity.getHealthData();
      return healthData;
    } catch (error) {
      throw new Error(`Failed to get watch health data: ${error.message}`);
    }
  }

  async getWatchActivityData() {
    try {
      const isConnected = await this.isWatchConnected();
      if (!isConnected) {
        throw new Error('Apple Watch is not connected');
      }

      const activityData = await this.watchConnectivity.getActivityData();
      return activityData;
    } catch (error) {
      throw new Error(`Failed to get watch activity data: ${error.message}`);
    }
  }

  async setWatchComplicationData(data: any) {
    try {
      const isConnected = await this.isWatchConnected();
      if (!isConnected) {
        throw new Error('Apple Watch is not connected');
      }

      const message = {
        type: 'SET_COMPLICATION',
        data
      };

      const result = await this.sendMessageToWatch(message);
      return result;
    } catch (error) {
      throw new Error(`Failed to set watch complication data: ${error.message}`);
    }
  }

  async getWatchNotifications() {
    try {
      const isConnected = await this.isWatchConnected();
      if (!isConnected) {
        throw new Error('Apple Watch is not connected');
      }

      const notifications = await this.watchConnectivity.getNotifications();
      return notifications;
    } catch (error) {
      throw new Error(`Failed to get watch notifications: ${error.message}`);
    }
  }

  async sendWatchNotification(notification: any) {
    try {
      const message = {
        type: 'SEND_NOTIFICATION',
        data: notification
      };

      const result = await this.sendMessageToWatch(message);
      return result;
    } catch (error) {
      throw new Error(`Failed to send watch notification: ${error.message}`);
    }
  }

  async getWatchSettings() {
    try {
      const isConnected = await this.isWatchConnected();
      if (!isConnected) {
        throw new Error('Apple Watch is not connected');
      }

      const settings = await this.watchConnectivity.getSettings();
      return settings;
    } catch (error) {
      throw new Error(`Failed to get watch settings: ${error.message}`);
    }
  }

  async setWatchSettings(settings: any) {
    try {
      const message = {
        type: 'SET_SETTINGS',
        data: settings
      };

      const result = await this.sendMessageToWatch(message);
      return result;
    } catch (error) {
      throw new Error(`Failed to set watch settings: ${error.message}`);
    }
  }

  async getWatchBatteryLevel() {
    try {
      const isConnected = await this.isWatchConnected();
      if (!isConnected) {
        throw new Error('Apple Watch is not connected');
      }

      const batteryLevel = await this.watchConnectivity.getBatteryLevel();
      return batteryLevel;
    } catch (error) {
      throw new Error(`Failed to get watch battery level: ${error.message}`);
    }
  }

  async getWatchStorageInfo() {
    try {
      const isConnected = await this.isWatchConnected();
      if (!isConnected) {
        throw new Error('Apple Watch is not connected');
      }

      const storageInfo = await this.watchConnectivity.getStorageInfo();
      return storageInfo;
    } catch (error) {
      throw new Error(`Failed to get watch storage info: ${error.message}`);
    }
  }

  async getWatchAppInfo() {
    try {
      const isConnected = await this.isWatchConnected();
      if (!isConnected) {
        throw new Error('Apple Watch is not connected');
      }

      const appInfo = await this.watchConnectivity.getAppInfo();
      return appInfo;
    } catch (error) {
      throw new Error(`Failed to get watch app info: ${error.message}`);
    }
  }

  async getWatchVersion() {
    try {
      const isConnected = await this.isWatchConnected();
      if (!isConnected) {
        throw new Error('Apple Watch is not connected');
      }

      const version = await this.watchConnectivity.getVersion();
      return version;
    } catch (error) {
      throw new Error(`Failed to get watch version: ${error.message}`);
    }
  }

  async getWatchModel() {
    try {
      const isConnected = await this.isWatchConnected();
      if (!isConnected) {
        throw new Error('Apple Watch is not connected');
      }

      const model = await this.watchConnectivity.getModel();
      return model;
    } catch (error) {
      throw new Error(`Failed to get watch model: ${error.message}`);
    }
  }

  async getWatchSystemInfo() {
    try {
      const isConnected = await this.isWatchConnected();
      if (!isConnected) {
        throw new Error('Apple Watch is not connected');
      }

      const systemInfo = await this.watchConnectivity.getSystemInfo();
      return systemInfo;
    } catch (error) {
      throw new Error(`Failed to get watch system info: ${error.message}`);
    }
  }

  async getWatchUserInfo() {
    try {
      const isConnected = await this.isWatchConnected();
      if (!isConnected) {
        throw new Error('Apple Watch is not connected');
      }

      const userInfo = await this.watchConnectivity.getUserInfo();
      return userInfo;
    } catch (error) {
      throw new Error(`Failed to get watch user info: ${error.message}`);
    }
  }

  async setWatchUserInfo(userInfo: any) {
    try {
      const message = {
        type: 'SET_USER_INFO',
        data: userInfo
      };

      const result = await this.sendMessageToWatch(message);
      return result;
    } catch (error) {
      throw new Error(`Failed to set watch user info: ${error.message}`);
    }
  }

  async getWatchAppState() {
    try {
      const isConnected = await this.isWatchConnected();
      if (!isConnected) {
        throw new Error('Apple Watch is not connected');
      }

      const appState = await this.watchConnectivity.getAppState();
      return appState;
    } catch (error) {
      throw new Error(`Failed to get watch app state: ${error.message}`);
    }
  }

  async getWatchAppData() {
    try {
      const isConnected = await this.isWatchConnected();
      if (!isConnected) {
        throw new Error('Apple Watch is not connected');
      }

      const appData = await this.watchConnectivity.getAppData();
      return appData;
    } catch (error) {
      throw new Error(`Failed to get watch app data: ${error.message}`);
    }
  }

  async setWatchAppData(appData: any) {
    try {
      const message = {
        type: 'SET_APP_DATA',
        data: appData
      };

      const result = await this.sendMessageToWatch(message);
      return result;
    } catch (error) {
      throw new Error(`Failed to set watch app data: ${error.message}`);
    }
  }
}

export default new AppleWatchService();










