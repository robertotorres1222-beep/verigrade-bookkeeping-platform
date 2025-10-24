import { Request, Response } from 'express';
import { advancedMobileService } from '../services/advancedMobileService';
import logger from '../utils/logger';

export class AdvancedMobileController {
  // Offline Sync
  async syncOfflineData(req: Request, res: Response): Promise<void> {
    try {
      const { userId, data } = req.body;
      const result = await advancedMobileService.syncOfflineData(userId, data);
      res.json({ success: true, data: result, message: 'Offline data synced successfully' });
    } catch (error) {
      logger.error('Error syncing offline data', { error });
      res.status(500).json({ success: false, message: 'Failed to sync offline data' });
    }
  }

  async getOfflineStatus(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.query;
      const status = await advancedMobileService.getOfflineStatus(userId as string);
      res.json({ success: true, data: status, message: 'Offline status retrieved successfully' });
    } catch (error) {
      logger.error('Error getting offline status', { error });
      res.status(500).json({ success: false, message: 'Failed to get offline status' });
    }
  }

  // Mobile Payments
  async processMobilePayment(req: Request, res: Response): Promise<void> {
    try {
      const { userId, paymentData } = req.body;
      const result = await advancedMobileService.processMobilePayment(userId, paymentData);
      res.json({ success: true, data: result, message: 'Mobile payment processed successfully' });
    } catch (error) {
      logger.error('Error processing mobile payment', { error });
      res.status(500).json({ success: false, message: 'Failed to process mobile payment' });
    }
  }

  async getPaymentHistory(req: Request, res: Response): Promise<void> {
    try {
      const { userId, page = 1, limit = 10 } = req.query;
      const history = await advancedMobileService.getPaymentHistory(
        userId as string,
        parseInt(page as string),
        parseInt(limit as string)
      );
      res.json({ success: true, data: history, message: 'Payment history retrieved successfully' });
    } catch (error) {
      logger.error('Error getting payment history', { error });
      res.status(500).json({ success: false, message: 'Failed to get payment history' });
    }
  }

  // GPS Mileage Tracking
  async trackMileage(req: Request, res: Response): Promise<void> {
    try {
      const { userId, startLocation, endLocation, purpose } = req.body;
      const mileage = await advancedMobileService.trackMileage(userId, startLocation, endLocation, purpose);
      res.json({ success: true, data: mileage, message: 'Mileage tracked successfully' });
    } catch (error) {
      logger.error('Error tracking mileage', { error });
      res.status(500).json({ success: false, message: 'Failed to track mileage' });
    }
  }

  async getMileageEntries(req: Request, res: Response): Promise<void> {
    try {
      const { userId, startDate, endDate } = req.query;
      const entries = await advancedMobileService.getMileageEntries(
        userId as string,
        startDate as string,
        endDate as string
      );
      res.json({ success: true, data: entries, message: 'Mileage entries retrieved successfully' });
    } catch (error) {
      logger.error('Error getting mileage entries', { error });
      res.status(500).json({ success: false, message: 'Failed to get mileage entries' });
    }
  }

  // Voice Notes
  async createVoiceNote(req: Request, res: Response): Promise<void> {
    try {
      const { userId, audioData, transcription } = req.body;
      const note = await advancedMobileService.createVoiceNote(userId, audioData, transcription);
      res.json({ success: true, data: note, message: 'Voice note created successfully' });
    } catch (error) {
      logger.error('Error creating voice note', { error });
      res.status(500).json({ success: false, message: 'Failed to create voice note' });
    }
  }

  async getVoiceNotes(req: Request, res: Response): Promise<void> {
    try {
      const { userId, page = 1, limit = 10 } = req.query;
      const notes = await advancedMobileService.getVoiceNotes(
        userId as string,
        parseInt(page as string),
        parseInt(limit as string)
      );
      res.json({ success: true, data: notes, message: 'Voice notes retrieved successfully' });
    } catch (error) {
      logger.error('Error getting voice notes', { error });
      res.status(500).json({ success: false, message: 'Failed to get voice notes' });
    }
  }

  // Apple Watch Companion
  async getWatchData(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.query;
      const data = await advancedMobileService.getWatchData(userId as string);
      res.json({ success: true, data, message: 'Watch data retrieved successfully' });
    } catch (error) {
      logger.error('Error getting watch data', { error });
      res.status(500).json({ success: false, message: 'Failed to get watch data' });
    }
  }

  async sendWatchNotification(req: Request, res: Response): Promise<void> {
    try {
      const { userId, notification } = req.body;
      await advancedMobileService.sendWatchNotification(userId, notification);
      res.json({ success: true, message: 'Watch notification sent successfully' });
    } catch (error) {
      logger.error('Error sending watch notification', { error });
      res.status(500).json({ success: false, message: 'Failed to send watch notification' });
    }
  }
}

export const advancedMobileController = new AdvancedMobileController();




