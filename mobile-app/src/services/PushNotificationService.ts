import { Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
  sound?: boolean;
  badge?: number;
  priority?: 'min' | 'low' | 'default' | 'high' | 'max';
  channelId?: string;
}

export interface PushToken {
  token: string;
  type: 'expo' | 'fcm' | 'apns';
}

class PushNotificationService {
  private static instance: PushNotificationService;
  private pushToken: string | null = null;
  private notificationListener: Notifications.Subscription | null = null;
  private responseListener: Notifications.Subscription | null = null;

  private constructor() {
    this.initializeNotifications();
  }

  public static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  private async initializeNotifications(): Promise<void> {
    try {
      // Configure notification behavior
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      // Request permissions
      await this.requestPermissions();
      
      // Register for push notifications
      await this.registerForPushNotifications();
      
      // Setup notification listeners
      this.setupNotificationListeners();
    } catch (error) {
      console.error('Push notification initialization error:', error);
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Push notifications are required for important updates. Please enable them in Settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Notifications.openSettingsAsync() },
          ]
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  }

  /**
   * Register for push notifications
   */
  async registerForPushNotifications(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        console.warn('Must use physical device for push notifications');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });

      this.pushToken = token.data;
      console.log('Push token:', this.pushToken);

      // Send token to server
      await this.sendTokenToServer(this.pushToken);

      return this.pushToken;
    } catch (error) {
      console.error('Push token registration error:', error);
      return null;
    }
  }

  /**
   * Send push token to server
   */
  private async sendTokenToServer(token: string): Promise<void> {
    try {
      const response = await fetch('/api/notifications/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify({
          token,
          platform: Platform.OS,
          deviceId: await this.getDeviceId(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to register token: ${response.statusText}`);
      }

      console.log('Push token registered with server');
    } catch (error) {
      console.error('Error sending token to server:', error);
    }
  }

  /**
   * Setup notification listeners
   */
  private setupNotificationListeners(): void {
    // Listen for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        this.handleNotificationReceived(notification);
      }
    );

    // Listen for user interactions with notifications
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification response:', response);
        this.handleNotificationResponse(response);
      }
    );
  }

  /**
   * Handle notification received
   */
  private handleNotificationReceived(notification: Notifications.Notification): void {
    const { title, body, data } = notification.request.content;
    
    // Handle different notification types
    if (data?.type) {
      switch (data.type) {
        case 'expense_reminder':
          this.handleExpenseReminder(data);
          break;
        case 'invoice_due':
          this.handleInvoiceDue(data);
          break;
        case 'payment_received':
          this.handlePaymentReceived(data);
          break;
        case 'sync_complete':
          this.handleSyncComplete(data);
          break;
        default:
          console.log('Unknown notification type:', data.type);
      }
    }
  }

  /**
   * Handle notification response
   */
  private handleNotificationResponse(response: Notifications.NotificationResponse): void {
    const { data, actionIdentifier } = response;
    
    if (actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
      // User tapped the notification
      this.handleNotificationTap(data);
    } else {
      // User tapped an action button
      this.handleNotificationAction(actionIdentifier, data);
    }
  }

  /**
   * Handle notification tap
   */
  private handleNotificationTap(data: any): void {
    if (data?.screen) {
      // Navigate to specific screen
      console.log('Navigate to screen:', data.screen);
    }
  }

  /**
   * Handle notification action
   */
  private handleNotificationAction(actionId: string, data: any): void {
    switch (actionId) {
      case 'view_expense':
        console.log('View expense:', data.expenseId);
        break;
      case 'pay_invoice':
        console.log('Pay invoice:', data.invoiceId);
        break;
      case 'sync_now':
        console.log('Sync now');
        break;
      default:
        console.log('Unknown action:', actionId);
    }
  }

  /**
   * Handle expense reminder notification
   */
  private handleExpenseReminder(data: any): void {
    console.log('Expense reminder:', data);
  }

  /**
   * Handle invoice due notification
   */
  private handleInvoiceDue(data: any): void {
    console.log('Invoice due:', data);
  }

  /**
   * Handle payment received notification
   */
  private handlePaymentReceived(data: any): void {
    console.log('Payment received:', data);
  }

  /**
   * Handle sync complete notification
   */
  private handleSyncComplete(data: any): void {
    console.log('Sync complete:', data);
  }

  /**
   * Schedule local notification
   */
  async scheduleLocalNotification(notification: NotificationData): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data,
          sound: notification.sound !== false,
          badge: notification.badge,
          priority: notification.priority || 'default',
        },
        trigger: null, // Show immediately
      });

      return notificationId;
    } catch (error) {
      console.error('Schedule notification error:', error);
      throw error;
    }
  }

  /**
   * Schedule notification with delay
   */
  async scheduleDelayedNotification(
    notification: NotificationData,
    delaySeconds: number
  ): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data,
          sound: notification.sound !== false,
          badge: notification.badge,
          priority: notification.priority || 'default',
        },
        trigger: {
          seconds: delaySeconds,
        },
      });

      return notificationId;
    } catch (error) {
      console.error('Schedule delayed notification error:', error);
      throw error;
    }
  }

  /**
   * Cancel notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Cancel notification error:', error);
    }
  }

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Cancel all notifications error:', error);
    }
  }

  /**
   * Get notification history
   */
  async getNotificationHistory(): Promise<Notifications.Notification[]> {
    try {
      return await Notifications.getPresentedNotificationsAsync();
    } catch (error) {
      console.error('Get notification history error:', error);
      return [];
    }
  }

  /**
   * Clear notification badge
   */
  async clearBadge(): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error('Clear badge error:', error);
    }
  }

  /**
   * Set notification badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Set badge count error:', error);
    }
  }

  /**
   * Get push token
   */
  getPushToken(): string | null {
    return this.pushToken;
  }

  /**
   * Check if notifications are enabled
   */
  async areNotificationsEnabled(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Check notifications enabled error:', error);
      return false;
    }
  }

  /**
   * Get device ID
   */
  private async getDeviceId(): Promise<string> {
    try {
      // In a real implementation, you would use a proper device ID
      return 'device-id-placeholder';
    } catch (error) {
      console.error('Get device ID error:', error);
      return 'unknown';
    }
  }

  /**
   * Get auth token
   */
  private async getAuthToken(): Promise<string> {
    try {
      // In a real implementation, you would get the token from secure storage
      return 'auth-token-placeholder';
    } catch (error) {
      console.error('Get auth token error:', error);
      return '';
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }
}

export default PushNotificationService;






