import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { asyncHandler, CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { sendEmail } from '../services/emailService';

const router = Router();

// Get available advisors
router.get('/',
  authenticate,
  asyncHandler(async (_req: any, res: any) => {
    // Mock advisor data - in real implementation, this would come from database
    const advisors = [
      {
        id: 'adv_1',
        name: 'Sarah Chen',
        title: 'Senior Financial Advisor',
        expertise: ['Startups', 'SaaS', 'Financial Modeling'],
        experience: '8 years',
        rating: 4.9,
        reviews: 127,
        hourlyRate: 250,
        availability: 'Mon-Fri, 9AM-6PM EST',
        bio: 'Former CFO at two successful SaaS startups. Expert in financial modeling, fundraising, and growth strategy.',
        image: '/images/advisors/sarah-chen.jpg',
        specialties: [
          'Financial Planning',
          'Fundraising Strategy',
          'Growth Metrics',
          'Unit Economics',
          'Cash Flow Management'
        ],
        certifications: ['CPA', 'CFA'],
        nextAvailable: '2024-01-20T10:00:00Z'
      },
      {
        id: 'adv_2',
        name: 'Michael Rodriguez',
        title: 'Tax & Compliance Specialist',
        expertise: ['Tax Strategy', 'Compliance', 'R&D Credits'],
        experience: '12 years',
        rating: 4.8,
        reviews: 89,
        hourlyRate: 200,
        availability: 'Mon-Fri, 8AM-7PM EST',
        bio: 'Former Big 4 tax partner specializing in technology companies. Expert in tax optimization and compliance.',
        image: '/images/advisors/michael-rodriguez.jpg',
        specialties: [
          'Tax Strategy',
          'R&D Tax Credits',
          'State Tax Optimization',
          'Audit Defense',
          'Compliance'
        ],
        certifications: ['CPA', 'EA'],
        nextAvailable: '2024-01-19T14:00:00Z'
      },
      {
        id: 'adv_3',
        name: 'Jennifer Kim',
        title: 'Fractional CFO',
        expertise: ['Scaling Operations', 'Team Building', 'Systems'],
        experience: '10 years',
        rating: 4.9,
        reviews: 156,
        hourlyRate: 300,
        availability: 'Mon-Thu, 9AM-5PM EST',
        bio: 'Helped 50+ companies scale from startup to $10M+ revenue. Expert in operational finance and team building.',
        image: '/images/advisors/jennifer-kim.jpg',
        specialties: [
          'Operational Finance',
          'Team Building',
          'Systems Implementation',
          'KPI Development',
          'Process Optimization'
        ],
        certifications: ['CPA', 'MBA'],
        nextAvailable: '2024-01-22T11:00:00Z'
      }
    ];

    res.json({
      success: true,
      data: advisors
    });
  })
);

// Book advisor session
router.post('/book',
  authenticate,
  [
    body('advisorId').isString().trim().isLength({ min: 1 }),
    body('sessionType').isIn(['consultation', 'strategy', 'review', 'emergency']),
    body('duration').isIn([30, 60, 90, 120]),
    body('preferredDate').isISO8601().toDate(),
    body('preferredTime').isString().trim(),
    body('businessGoals').optional().isString().trim(),
    body('questions').optional().isString().trim(),
    body('urgency').optional().isIn(['low', 'medium', 'high']),
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const {
      advisorId,
      sessionType,
      duration,
      preferredDate,
      preferredTime,
      businessGoals,
      questions,
      urgency = 'medium'
    } = req.body;
    
    const userId = req.user!.id;
    const userEmail = req.user!.email;

    try {
      // In a real implementation, this would:
      // 1. Check advisor availability
      // 2. Create calendar event
      // 3. Send calendar invites
      // 4. Process payment
      
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      logger.info('Advisor session booked:', {
        userId,
        advisorId,
        sessionType,
        duration,
        preferredDate,
        preferredTime,
        sessionId,
        timestamp: new Date().toISOString(),
      });

      // Get advisor details (mock)
      const advisorDetails = {
        name: 'Sarah Chen',
        hourlyRate: 250,
        email: 'sarah.chen@verigrade.com'
      };

      const totalCost = (advisorDetails.hourlyRate * duration) / 60;

      // Send confirmation to customer
      await sendEmail({
        to: userEmail,
        subject: 'Advisor Session Confirmed - VeriGrade',
        template: 'advisorSessionConfirmation',
        data: {
          advisorName: advisorDetails.name,
          sessionType,
          duration,
          preferredDate: new Date(preferredDate).toLocaleDateString(),
          preferredTime,
          totalCost,
          sessionId,
          meetingLink: `https://verigrade.com/meeting/${sessionId}`,
        },
      });

      // Send notification to advisor
      await sendEmail({
        to: advisorDetails.email,
        subject: `New Advisor Session Booked - ${req.user!.email}`,
        template: 'advisorSessionNotification',
        data: {
          clientEmail: userEmail,
          sessionType,
          duration,
          preferredDate: new Date(preferredDate).toLocaleDateString(),
          preferredTime,
          businessGoals: businessGoals || 'Not provided',
          questions: questions || 'Not provided',
          urgency,
          sessionId,
          meetingLink: `https://verigrade.com/meeting/${sessionId}`,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Advisor session booked successfully!',
        sessionId,
        totalCost,
        meetingLink: `https://verigrade.com/meeting/${sessionId}`,
        data: {
          advisorName: advisorDetails.name,
          sessionType,
          duration,
          preferredDate,
          preferredTime,
          totalCost,
          sessionId,
          status: 'confirmed'
        }
      });

    } catch (error) {
      logger.error('Advisor booking error:', error);
      throw new CustomError('Failed to book advisor session', 500);
    }
  })
);

// Get advisor session history
router.get('/sessions',
  authenticate,
  asyncHandler(async (_req: any, res: any) => {
    // const _userId = req.user!.id;

    // Mock session history
    const sessions = [
      {
        id: 'session_1',
        advisorId: 'adv_1',
        advisorName: 'Sarah Chen',
        sessionType: 'strategy',
        duration: 60,
        date: '2024-01-10T14:00:00Z',
        status: 'completed',
        cost: 250,
        rating: 5,
        notes: 'Great session on growth metrics and unit economics'
      },
      {
        id: 'session_2',
        advisorId: 'adv_2',
        advisorName: 'Michael Rodriguez',
        sessionType: 'consultation',
        duration: 30,
        date: '2024-01-15T10:00:00Z',
        status: 'scheduled',
        cost: 100,
        rating: null,
        notes: null
      }
    ];

    res.json({
      success: true,
      data: sessions
    });
  })
);

// Rate advisor session
router.post('/rate',
  authenticate,
  [
    body('sessionId').isString().trim().isLength({ min: 1 }),
    body('rating').isInt({ min: 1, max: 5 }),
    body('feedback').optional().isString().trim(),
  ],
  validateRequest,
  asyncHandler(async (_req: any, res: any) => {
    const { sessionId, rating, feedback } = _req.body;
    const userId = _req.user!.id;

    try {
      logger.info('Advisor session rated:', {
        userId,
        sessionId,
        rating,
        feedback,
        timestamp: new Date().toISOString(),
      });

      res.json({
        success: true,
        message: 'Thank you for your feedback!',
        data: {
          sessionId,
          rating,
          feedback
        }
      });

    } catch (error) {
      logger.error('Rating error:', error);
      throw new CustomError('Failed to submit rating', 500);
    }
  })
);

// Get advisor availability
router.get('/availability/:advisorId',
  authenticate,
  asyncHandler(async (req: any, res: any) => {
    const { advisorId } = req.params;
    const { date } = req.query;

    // Mock availability data
    const availability = [
      { time: '09:00', available: true },
      { time: '10:00', available: false },
      { time: '11:00', available: true },
      { time: '12:00', available: true },
      { time: '14:00', available: false },
      { time: '15:00', available: true },
      { time: '16:00', available: true },
      { time: '17:00', available: false },
    ];

    res.json({
      success: true,
      data: {
        advisorId,
        date: date || new Date().toISOString().split('T')[0],
        availability
      }
    });
  })
);

export default router;
