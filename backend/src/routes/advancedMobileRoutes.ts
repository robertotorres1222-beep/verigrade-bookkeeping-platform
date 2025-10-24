import { Router } from 'express';
import { advancedMobileController } from '../controllers/advancedMobileController';

const router = Router();

// Offline Sync
router.post('/offline/sync', advancedMobileController.syncOfflineData);
router.get('/offline/status', advancedMobileController.getOfflineStatus);

// Mobile Payments
router.post('/payments/process', advancedMobileController.processMobilePayment);
router.get('/payments/history', advancedMobileController.getPaymentHistory);

// GPS Mileage Tracking
router.post('/mileage/track', advancedMobileController.trackMileage);
router.get('/mileage/entries', advancedMobileController.getMileageEntries);

// Voice Notes
router.post('/voice-notes', advancedMobileController.createVoiceNote);
router.get('/voice-notes', advancedMobileController.getVoiceNotes);

// Apple Watch Companion
router.get('/watch/data', advancedMobileController.getWatchData);
router.post('/watch/notifications', advancedMobileController.sendWatchNotification);

export default router;




