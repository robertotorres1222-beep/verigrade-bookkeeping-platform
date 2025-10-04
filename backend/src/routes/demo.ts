import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { asyncHandler, CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { sendEmail } from '../services/emailService';

const router = Router();

// Schedule demo
router.post('/schedule',
  [
    body('name').isString().trim().isLength({ min: 1, max: 100 }),
    body('email').isEmail().normalizeEmail(),
    body('company').isString().trim().isLength({ min: 1, max: 100 }),
    body('phone').isString().trim().isLength({ min: 10, max: 20 }),
    body('preferredDate').isISO8601().toDate(),
    body('preferredTime').isString().isIn(['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM']),
    body('message').optional().isString().trim().isLength({ max: 1000 }),
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const { name, email, company, phone, preferredDate, preferredTime, message } = req.body;

    try {
      // Log the demo scheduling request
      logger.info('Demo scheduling request:', {
        name,
        email,
        company,
        phone,
        preferredDate,
        preferredTime,
        message: message || 'Not provided',
        timestamp: new Date().toISOString(),
      });

      // In a real implementation, this would:
      // 1. Create a calendar event in Google Calendar/Outlook
      // 2. Send calendar invites to both parties
      // 3. Store the appointment in a database
      // 4. Send reminders

      // For now, we'll simulate successful scheduling
      const demoId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Send confirmation email to customer
      try {
        await sendEmail({
          to: email,
          subject: 'Demo Confirmed - VeriGrade Bookkeeping',
          template: 'demoConfirmation',
          data: {
            name,
            company,
            preferredDate: new Date(preferredDate).toLocaleDateString(),
            preferredTime,
            demoId,
            message: message || 'Not provided',
          },
        });
        logger.info(`Demo confirmation email sent to ${email}`);
      } catch (emailError) {
        logger.error('Failed to send demo confirmation email:', emailError);
        // Don't fail the request if email sending fails
      }

      // Send notification to sales team
      try {
        await sendEmail({
          to: process.env['SALES_EMAIL'] || 'sales@verigrade.com',
          subject: `New Demo Scheduled - ${name} (${company})`,
          template: 'demoNotification',
          data: {
            name,
            email,
            company,
            phone,
            preferredDate: new Date(preferredDate).toLocaleDateString(),
            preferredTime,
            demoId,
            message: message || 'Not provided',
            timestamp: new Date().toLocaleString(),
          },
        });
        logger.info(`Demo notification sent to sales team for ${email}`);
      } catch (emailError) {
        logger.error('Failed to send demo notification:', emailError);
        // Don't fail the request if email sending fails
      }

      res.status(200).json({
        success: true,
        message: 'Demo scheduled successfully! We\'ll send you a calendar invite shortly.',
        demoId,
        scheduledDate: preferredDate,
        scheduledTime: preferredTime,
      });

    } catch (error) {
      logger.error('Demo scheduling error:', error);
      throw new CustomError('Failed to schedule demo', 500);
    }
  })
);

export default router;
