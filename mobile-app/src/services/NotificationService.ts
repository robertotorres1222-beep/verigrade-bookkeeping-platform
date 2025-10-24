import PushNotification from 'react-native-push-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationData {
  title: string;
  message: string;
  data?: any;
  sound?: string;
  badge?: number;
}

export class NotificationService {
  private static readonly TOKEN_STORAGE_KEY = 'push_token';
  private static readonly NOTIFICATION_CHANNEL_ID = 'verigrade_channel';

  /**
   * Initialize push notifications
   */
  static initialize(): void {
    PushNotification.configure({
      onRegister: function (token) {
        console.log('TOKEN:', token);
        NotificationService.registerToken(token.token);
      },
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
        NotificationService.handleNotification(notification);
      },
      onAction: function (notification) {
        console.log('ACTION:', notification.action);
        console.log('NOTIFICATION:', notification);
      },
      onRegistrationError: function(err) {
        console.error(err.message, err);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });

    // Create notification channel for Android
    this.createNotificationChannel();
  }

  /**
   * Register push token with server
   */
  static async registerToken(token: string): Promise<boolean> {
    try {
      await AsyncStorage.setItem(this.TOKEN_STORAGE_KEY, token);
      
      // Send token to server
      const authToken = await AsyncStorage.getItem('authToken');
      if (authToken) {
        const response = await fetch('/api/notifications/register-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({ token }),
        });

        return response.ok;
      }
      
      return false;
    } catch (error) {
      console.error('Register token error:', error);
      return false;
    }
  }

  /**
   * Handle incoming notification
   */
  static handleNotification(notification: any): void {
    // Handle different notification types
    if (notification.data) {
      const { type, action } = notification.data;
      
      switch (type) {
        case 'receipt_processed':
          this.handleReceiptProcessed(notification);
          break;
        case 'expense_approved':
          this.handleExpenseApproved(notification);
          break;
        case 'invoice_paid':
          this.handleInvoicePaid(notification);
          break;
        case 'time_reminder':
          this.handleTimeReminder(notification);
          break;
        case 'sync_complete':
          this.handleSyncComplete(notification);
          break;
        default:
          console.log('Unknown notification type:', type);
      }
    }
  }

  /**
   * Create notification channel for Android
   */
  private static createNotificationChannel(): void {
    PushNotification.createChannel(
      {
        channelId: this.NOTIFICATION_CHANNEL_ID,
        channelName: 'VeriGrade Notifications',
        channelDescription: 'Notifications for VeriGrade app',
        playSound: true,
        soundName: 'default',
        importance: 4,
        vibrate: true,
      },
      (created) => console.log(`createChannel returned '${created}'`)
    );
  }

  /**
   * Send local notification
   */
  static sendLocalNotification(data: NotificationData): void {
    PushNotification.localNotification({
      channelId: this.NOTIFICATION_CHANNEL_ID,
      title: data.title,
      message: data.message,
      data: data.data,
      sound: data.sound || 'default',
      badge: data.badge,
      playSound: true,
      vibrate: true,
    });
  }

  /**
   * Schedule notification
   */
  static scheduleNotification(data: NotificationData, date: Date): void {
    PushNotification.localNotificationSchedule({
      channelId: this.NOTIFICATION_CHANNEL_ID,
      title: data.title,
      message: data.message,
      data: data.data,
      date: date,
      sound: data.sound || 'default',
      playSound: true,
      vibrate: true,
    });
  }

  /**
   * Cancel all notifications
   */
  static cancelAllNotifications(): void {
    PushNotification.cancelAllLocalNotifications();
  }

  /**
   * Cancel specific notification
   */
  static cancelNotification(id: string): void {
    PushNotification.cancelLocalNotifications({ id });
  }

  /**
   * Handle receipt processed notification
   */
  private static handleReceiptProcessed(notification: any): void {
    // Navigate to receipts screen or show receipt details
    console.log('Receipt processed:', notification.data);
  }

  /**
   * Handle expense approved notification
   */
  private static handleExpenseApproved(notification: any): void {
    // Navigate to expenses screen
    console.log('Expense approved:', notification.data);
  }

  /**
   * Handle invoice paid notification
   */
  private static handleInvoicePaid(notification: any): void {
    // Navigate to invoices screen
    console.log('Invoice paid:', notification.data);
  }

  /**
   * Handle time reminder notification
   */
  private static handleTimeReminder(notification: any): void {
    // Navigate to time tracking screen
    console.log('Time reminder:', notification.data);
  }

  /**
   * Handle sync complete notification
   */
  private static handleSyncComplete(notification: any): void {
    // Show sync success message
    console.log('Sync complete:', notification.data);
  }

  /**
   * Send receipt processed notification
   */
  static sendReceiptProcessedNotification(receiptData: any): void {
    this.sendLocalNotification({
      title: 'Receipt Processed',
      message: `Receipt from ${receiptData.merchant} for $${receiptData.amount} has been processed`,
      data: {
        type: 'receipt_processed',
        receiptId: receiptData.id,
      },
    });
  }

  /**
   * Send expense approved notification
   */
  static sendExpenseApprovedNotification(expenseData: any): void {
    this.sendLocalNotification({
      title: 'Expense Approved',
      message: `Expense for $${expenseData.amount} has been approved`,
      data: {
        type: 'expense_approved',
        expenseId: expenseData.id,
      },
    });
  }

  /**
   * Send invoice paid notification
   */
  static sendInvoicePaidNotification(invoiceData: any): void {
    this.sendLocalNotification({
      title: 'Invoice Paid',
      message: `Invoice #${invoiceData.invoiceNumber} has been paid`,
      data: {
        type: 'invoice_paid',
        invoiceId: invoiceData.id,
      },
    });
  }

  /**
   * Send time tracking reminder
   */
  static sendTimeTrackingReminder(): void {
    this.sendLocalNotification({
      title: 'Time Tracking Reminder',
      message: 'Don\'t forget to log your time for today',
      data: {
        type: 'time_reminder',
      },
    });
  }

  /**
   * Send sync complete notification
   */
  static sendSyncCompleteNotification(syncedCount: number): void {
    this.sendLocalNotification({
      title: 'Sync Complete',
      message: `Successfully synced ${syncedCount} items`,
      data: {
        type: 'sync_complete',
        syncedCount,
      },
    });
  }

  /**
   * Schedule daily time tracking reminder
   */
  static scheduleDailyTimeReminder(): void {
    const now = new Date();
    const reminderTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 0, 0); // 5 PM
    
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    this.scheduleNotification({
      title: 'Daily Time Tracking',
      message: 'Time to log your work hours for today',
      data: { type: 'time_reminder' },
    }, reminderTime);
  }

  /**
   * Get notification settings
   */
  static async getNotificationSettings(): Promise<{
    enabled: boolean;
    receipts: boolean;
    expenses: boolean;
    invoices: boolean;
    timeTracking: boolean;
  }> {
    try {
      const settings = await AsyncStorage.getItem('notification_settings');
      return settings ? JSON.parse(settings) : {
        enabled: true,
        receipts: true,
        expenses: true,
        invoices: true,
        timeTracking: true,
      };
    } catch (error) {
      console.error('Get notification settings error:', error);
      return {
        enabled: true,
        receipts: true,
        expenses: true,
        invoices: true,
        timeTracking: true,
      };
    }
  }

  /**
   * Update notification settings
   */
  static async updateNotificationSettings(settings: any): Promise<boolean> {
    try {
      await AsyncStorage.setItem('notification_settings', JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('Update notification settings error:', error);
      return false;
    }
  }
}

