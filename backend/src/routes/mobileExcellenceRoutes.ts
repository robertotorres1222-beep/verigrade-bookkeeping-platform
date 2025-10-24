import { Router } from 'express';
import { mobileExcellenceController } from '../controllers/mobileExcellenceController';

const router = Router();

// Mobile App Management Routes
router.post('/apps', mobileExcellenceController.createMobileApp);
router.get('/apps', mobileExcellenceController.getMobileApps);

// Mobile Feature Management Routes
router.post('/features', mobileExcellenceController.createMobileFeature);
router.get('/features', mobileExcellenceController.getMobileFeatures);

// Offline Sync Management Routes
router.post('/offline-sync', mobileExcellenceController.createOfflineSync);
router.get('/offline-sync', mobileExcellenceController.getOfflineSync);

// Push Notification Management Routes
router.post('/push-notifications', mobileExcellenceController.createPushNotification);
router.get('/push-notifications', mobileExcellenceController.getPushNotifications);

// Biometric Auth Management Routes
router.post('/biometric-auth', mobileExcellenceController.createBiometricAuth);
router.get('/biometric-auth', mobileExcellenceController.getBiometricAuth);

// Camera Scanning Management Routes
router.post('/camera-scanning', mobileExcellenceController.createCameraScanning);
router.get('/camera-scanning', mobileExcellenceController.getCameraScanning);

// GPS Tracking Management Routes
router.post('/gps-tracking', mobileExcellenceController.createGPSTracking);
router.get('/gps-tracking', mobileExcellenceController.getGPSTracking);

// Voice Command Management Routes
router.post('/voice-commands', mobileExcellenceController.createVoiceCommand);
router.get('/voice-commands', mobileExcellenceController.getVoiceCommands);

// NFC Scanning Management Routes
router.post('/nfc-scanning', mobileExcellenceController.createNFCScanning);
router.get('/nfc-scanning', mobileExcellenceController.getNFCScanning);

// AR Capture Management Routes
router.post('/ar-capture', mobileExcellenceController.createARCapture);
router.get('/ar-capture', mobileExcellenceController.getARCapture);

// Watch Companion Management Routes
router.post('/watch-companion', mobileExcellenceController.createWatchCompanion);
router.get('/watch-companion', mobileExcellenceController.getWatchCompanion);

// Mobile Widget Management Routes
router.post('/widgets', mobileExcellenceController.createMobileWidget);
router.get('/widgets', mobileExcellenceController.getMobileWidgets);

// Deep Linking Management Routes
router.post('/deep-linking', mobileExcellenceController.createDeepLinking);
router.get('/deep-linking', mobileExcellenceController.getDeepLinking);

// Share Extension Management Routes
router.post('/share-extensions', mobileExcellenceController.createShareExtension);
router.get('/share-extensions', mobileExcellenceController.getShareExtensions);

// Mobile Analytics Management Routes
router.post('/analytics', mobileExcellenceController.createMobileAnalytics);
router.get('/analytics', mobileExcellenceController.getMobileAnalytics);

// Mobile Performance Management Routes
router.post('/performance', mobileExcellenceController.createMobilePerformance);
router.get('/performance', mobileExcellenceController.getMobilePerformance);

// Mobile Crash Management Routes
router.post('/crashes', mobileExcellenceController.createMobileCrash);
router.get('/crashes', mobileExcellenceController.getMobileCrashes);

// Mobile Feedback Management Routes
router.post('/feedback', mobileExcellenceController.createMobileFeedback);
router.get('/feedback', mobileExcellenceController.getMobileFeedback);

// Analytics and Reporting Routes
router.get('/analytics/overview', mobileExcellenceController.getMobileExcellenceAnalytics);

export default router;




