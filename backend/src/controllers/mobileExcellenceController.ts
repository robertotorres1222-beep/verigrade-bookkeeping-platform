import { Request, Response } from 'express';
import { mobileExcellenceService } from '../services/mobileExcellenceService';
import logger from '../utils/logger';

export class MobileExcellenceController {
  // Mobile App Management
  async createMobileApp(req: Request, res: Response): Promise<void> {
    try {
      const app = await mobileExcellenceService.createMobileApp(req.body);
      res.status(201).json({
        success: true,
        data: app,
        message: 'Mobile app created successfully',
      });
    } catch (error) {
      logger.error('Error creating mobile app', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create mobile app',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getMobileApps(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        platform: req.query.platform as string || undefined,
        status: req.query.status as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await mobileExcellenceService.getMobileApps(filters);
      res.json({
        success: true,
        data: result,
        message: 'Mobile apps retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching mobile apps', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch mobile apps',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Mobile Feature Management
  async createMobileFeature(req: Request, res: Response): Promise<void> {
    try {
      const feature = await mobileExcellenceService.createMobileFeature(req.body);
      res.status(201).json({
        success: true,
        data: feature,
        message: 'Mobile feature created successfully',
      });
    } catch (error) {
      logger.error('Error creating mobile feature', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create mobile feature',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getMobileFeatures(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        type: req.query.type as string || undefined,
        platform: req.query.platform as string || undefined,
        enabled: req.query.enabled ? req.query.enabled === 'true' : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await mobileExcellenceService.getMobileFeatures(filters);
      res.json({
        success: true,
        data: result,
        message: 'Mobile features retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching mobile features', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch mobile features',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Offline Sync Management
  async createOfflineSync(req: Request, res: Response): Promise<void> {
    try {
      const sync = await mobileExcellenceService.createOfflineSync(req.body);
      res.status(201).json({
        success: true,
        data: sync,
        message: 'Offline sync created successfully',
      });
    } catch (error) {
      logger.error('Error creating offline sync', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create offline sync',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getOfflineSync(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        userId: req.query.userId as string || undefined,
        entityType: req.query.entityType as string || undefined,
        synced: req.query.synced ? req.query.synced === 'true' : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await mobileExcellenceService.getOfflineSync(filters);
      res.json({
        success: true,
        data: result,
        message: 'Offline sync retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching offline sync', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch offline sync',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Push Notification Management
  async createPushNotification(req: Request, res: Response): Promise<void> {
    try {
      const notification = await mobileExcellenceService.createPushNotification(req.body);
      res.status(201).json({
        success: true,
        data: notification,
        message: 'Push notification created successfully',
      });
    } catch (error) {
      logger.error('Error creating push notification', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create push notification',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getPushNotifications(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        userId: req.query.userId as string || undefined,
        type: req.query.type as string || undefined,
        status: req.query.status as string || undefined,
        platform: req.query.platform as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await mobileExcellenceService.getPushNotifications(filters);
      res.json({
        success: true,
        data: result,
        message: 'Push notifications retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching push notifications', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch push notifications',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Biometric Auth Management
  async createBiometricAuth(req: Request, res: Response): Promise<void> {
    try {
      const auth = await mobileExcellenceService.createBiometricAuth(req.body);
      res.status(201).json({
        success: true,
        data: auth,
        message: 'Biometric auth created successfully',
      });
    } catch (error) {
      logger.error('Error creating biometric auth', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create biometric auth',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getBiometricAuth(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        userId: req.query.userId as string || undefined,
        type: req.query.type as string || undefined,
        platform: req.query.platform as string || undefined,
        enabled: req.query.enabled ? req.query.enabled === 'true' : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await mobileExcellenceService.getBiometricAuth(filters);
      res.json({
        success: true,
        data: result,
        message: 'Biometric auth retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching biometric auth', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch biometric auth',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Camera Scanning Management
  async createCameraScanning(req: Request, res: Response): Promise<void> {
    try {
      const scanning = await mobileExcellenceService.createCameraScanning(req.body);
      res.status(201).json({
        success: true,
        data: scanning,
        message: 'Camera scanning created successfully',
      });
    } catch (error) {
      logger.error('Error creating camera scanning', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create camera scanning',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getCameraScanning(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        userId: req.query.userId as string || undefined,
        type: req.query.type as string || undefined,
        status: req.query.status as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await mobileExcellenceService.getCameraScanning(filters);
      res.json({
        success: true,
        data: result,
        message: 'Camera scanning retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching camera scanning', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch camera scanning',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // GPS Tracking Management
  async createGPSTracking(req: Request, res: Response): Promise<void> {
    try {
      const tracking = await mobileExcellenceService.createGPSTracking(req.body);
      res.status(201).json({
        success: true,
        data: tracking,
        message: 'GPS tracking created successfully',
      });
    } catch (error) {
      logger.error('Error creating GPS tracking', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create GPS tracking',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getGPSTracking(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        userId: req.query.userId as string || undefined,
        purpose: req.query.purpose as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await mobileExcellenceService.getGPSTracking(filters);
      res.json({
        success: true,
        data: result,
        message: 'GPS tracking retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching GPS tracking', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch GPS tracking',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Voice Command Management
  async createVoiceCommand(req: Request, res: Response): Promise<void> {
    try {
      const command = await mobileExcellenceService.createVoiceCommand(req.body);
      res.status(201).json({
        success: true,
        data: command,
        message: 'Voice command created successfully',
      });
    } catch (error) {
      logger.error('Error creating voice command', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create voice command',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getVoiceCommands(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        userId: req.query.userId as string || undefined,
        intent: req.query.intent as string || undefined,
        language: req.query.language as string || undefined,
        platform: req.query.platform as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await mobileExcellenceService.getVoiceCommands(filters);
      res.json({
        success: true,
        data: result,
        message: 'Voice commands retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching voice commands', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch voice commands',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // NFC Scanning Management
  async createNFCScanning(req: Request, res: Response): Promise<void> {
    try {
      const scanning = await mobileExcellenceService.createNFCScanning(req.body);
      res.status(201).json({
        success: true,
        data: scanning,
        message: 'NFC scanning created successfully',
      });
    } catch (error) {
      logger.error('Error creating NFC scanning', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create NFC scanning',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getNFCScanning(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        userId: req.query.userId as string || undefined,
        tagType: req.query.tagType as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await mobileExcellenceService.getNFCScanning(filters);
      res.json({
        success: true,
        data: result,
        message: 'NFC scanning retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching NFC scanning', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch NFC scanning',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // AR Capture Management
  async createARCapture(req: Request, res: Response): Promise<void> {
    try {
      const capture = await mobileExcellenceService.createARCapture(req.body);
      res.status(201).json({
        success: true,
        data: capture,
        message: 'AR capture created successfully',
      });
    } catch (error) {
      logger.error('Error creating AR capture', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create AR capture',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getARCapture(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        userId: req.query.userId as string || undefined,
        type: req.query.type as string || undefined,
        status: req.query.status as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await mobileExcellenceService.getARCapture(filters);
      res.json({
        success: true,
        data: result,
        message: 'AR capture retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching AR capture', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch AR capture',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Watch Companion Management
  async createWatchCompanion(req: Request, res: Response): Promise<void> {
    try {
      const companion = await mobileExcellenceService.createWatchCompanion(req.body);
      res.status(201).json({
        success: true,
        data: companion,
        message: 'Watch companion created successfully',
      });
    } catch (error) {
      logger.error('Error creating watch companion', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create watch companion',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getWatchCompanion(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        userId: req.query.userId as string || undefined,
        platform: req.query.platform as string || undefined,
        status: req.query.status as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await mobileExcellenceService.getWatchCompanion(filters);
      res.json({
        success: true,
        data: result,
        message: 'Watch companion retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching watch companion', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch watch companion',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Mobile Widget Management
  async createMobileWidget(req: Request, res: Response): Promise<void> {
    try {
      const widget = await mobileExcellenceService.createMobileWidget(req.body);
      res.status(201).json({
        success: true,
        data: widget,
        message: 'Mobile widget created successfully',
      });
    } catch (error) {
      logger.error('Error creating mobile widget', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create mobile widget',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getMobileWidgets(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        userId: req.query.userId as string || undefined,
        type: req.query.type as string || undefined,
        platform: req.query.platform as string || undefined,
        enabled: req.query.enabled ? req.query.enabled === 'true' : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await mobileExcellenceService.getMobileWidgets(filters);
      res.json({
        success: true,
        data: result,
        message: 'Mobile widgets retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching mobile widgets', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch mobile widgets',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Deep Linking Management
  async createDeepLinking(req: Request, res: Response): Promise<void> {
    try {
      const linking = await mobileExcellenceService.createDeepLinking(req.body);
      res.status(201).json({
        success: true,
        data: linking,
        message: 'Deep linking created successfully',
      });
    } catch (error) {
      logger.error('Error creating deep linking', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create deep linking',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getDeepLinking(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        platform: req.query.platform as string || undefined,
        target: req.query.target as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await mobileExcellenceService.getDeepLinking(filters);
      res.json({
        success: true,
        data: result,
        message: 'Deep linking retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching deep linking', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch deep linking',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Share Extension Management
  async createShareExtension(req: Request, res: Response): Promise<void> {
    try {
      const extension = await mobileExcellenceService.createShareExtension(req.body);
      res.status(201).json({
        success: true,
        data: extension,
        message: 'Share extension created successfully',
      });
    } catch (error) {
      logger.error('Error creating share extension', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create share extension',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getShareExtensions(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        userId: req.query.userId as string || undefined,
        type: req.query.type as string || undefined,
        processed: req.query.processed ? req.query.processed === 'true' : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await mobileExcellenceService.getShareExtensions(filters);
      res.json({
        success: true,
        data: result,
        message: 'Share extensions retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching share extensions', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch share extensions',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Mobile Analytics Management
  async createMobileAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const analytics = await mobileExcellenceService.createMobileAnalytics(req.body);
      res.status(201).json({
        success: true,
        data: analytics,
        message: 'Mobile analytics created successfully',
      });
    } catch (error) {
      logger.error('Error creating mobile analytics', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create mobile analytics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getMobileAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        userId: req.query.userId as string || undefined,
        event: req.query.event as string || undefined,
        platform: req.query.platform as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await mobileExcellenceService.getMobileAnalytics(filters);
      res.json({
        success: true,
        data: result,
        message: 'Mobile analytics retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching mobile analytics', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch mobile analytics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Mobile Performance Management
  async createMobilePerformance(req: Request, res: Response): Promise<void> {
    try {
      const performance = await mobileExcellenceService.createMobilePerformance(req.body);
      res.status(201).json({
        success: true,
        data: performance,
        message: 'Mobile performance created successfully',
      });
    } catch (error) {
      logger.error('Error creating mobile performance', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create mobile performance',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getMobilePerformance(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        userId: req.query.userId as string || undefined,
        metric: req.query.metric as string || undefined,
        platform: req.query.platform as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await mobileExcellenceService.getMobilePerformance(filters);
      res.json({
        success: true,
        data: result,
        message: 'Mobile performance retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching mobile performance', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch mobile performance',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Mobile Crash Management
  async createMobileCrash(req: Request, res: Response): Promise<void> {
    try {
      const crash = await mobileExcellenceService.createMobileCrash(req.body);
      res.status(201).json({
        success: true,
        data: crash,
        message: 'Mobile crash created successfully',
      });
    } catch (error) {
      logger.error('Error creating mobile crash', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create mobile crash',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getMobileCrashes(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        userId: req.query.userId as string || undefined,
        platform: req.query.platform as string || undefined,
        resolved: req.query.resolved ? req.query.resolved === 'true' : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await mobileExcellenceService.getMobileCrashes(filters);
      res.json({
        success: true,
        data: result,
        message: 'Mobile crashes retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching mobile crashes', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch mobile crashes',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Mobile Feedback Management
  async createMobileFeedback(req: Request, res: Response): Promise<void> {
    try {
      const feedback = await mobileExcellenceService.createMobileFeedback(req.body);
      res.status(201).json({
        success: true,
        data: feedback,
        message: 'Mobile feedback created successfully',
      });
    } catch (error) {
      logger.error('Error creating mobile feedback', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create mobile feedback',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getMobileFeedback(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        userId: req.query.userId as string || undefined,
        type: req.query.type as string || undefined,
        status: req.query.status as string || undefined,
        priority: req.query.priority as string || undefined,
        platform: req.query.platform as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await mobileExcellenceService.getMobileFeedback(filters);
      res.json({
        success: true,
        data: result,
        message: 'Mobile feedback retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching mobile feedback', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch mobile feedback',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Analytics and Reporting
  async getMobileExcellenceAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const analytics = await mobileExcellenceService.getMobileExcellenceAnalytics();
      res.json({
        success: true,
        data: analytics,
        message: 'Mobile excellence analytics retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching mobile excellence analytics', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch mobile excellence analytics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export const mobileExcellenceController = new MobileExcellenceController();



