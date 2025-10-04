import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { asyncHandler, CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { sendEmail } from '../services/emailService';

const router = Router();

// Contact form submission
router.post('/',
  [
    body('name').isString().trim().isLength({ min: 1, max: 100 }),
    body('email').isEmail().normalizeEmail(),
    body('message').isString().trim().isLength({ min: 10, max: 1000 }),
    body('phone').optional().isString().trim().isLength({ max: 20 }),
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const { name, email, message, phone } = req.body;

    try {
      // Log the contact form submission
      logger.info('Contact form submission received:', {
        name,
        email,
        phone: phone || 'Not provided',
        messageLength: message.length,
        timestamp: new Date().toISOString(),
      });

      // Send email notification to admin
      try {
        await sendEmail({
          to: process.env['ADMIN_EMAIL'] || 'admin@verigrade.com',
          subject: `New Contact Form Submission from ${name}`,
          template: 'contactForm',
          data: {
            name,
            email,
            phone: phone || 'Not provided',
            message,
            timestamp: new Date().toLocaleString(),
          },
        });
        logger.info(`Contact form email sent to admin for submission from ${email}`);
      } catch (emailError) {
        logger.error('Failed to send contact form email:', emailError);
        // Don't fail the request if email sending fails
      }

      // Send auto-reply to customer
      try {
        await sendEmail({
          to: email,
          subject: 'Thank you for contacting VeriGrade Bookkeeping',
          template: 'contactAutoReply',
          data: {
            name,
            message: 'We have received your message and will get back to you within one business day.',
          },
        });
        logger.info(`Auto-reply email sent to ${email}`);
      } catch (emailError) {
        logger.error('Failed to send auto-reply email:', emailError);
        // Don't fail the request if email sending fails
      }

      res.status(200).json({
        success: true,
        message: 'Thank you for your message. We\'ll be in touch within one business day!',
      });

    } catch (error) {
      logger.error('Contact form processing error:', error);
      throw new CustomError('Failed to process contact form submission', 500);
    }
  })
);

export default router;
