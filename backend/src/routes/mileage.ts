import { Router } from 'express';
import { body, query } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { asyncHandler, CustomError } from '../middleware/errorHandler';
import { sendEmail } from '../services/emailService';
import { logger } from '../utils/logger';

const router = Router();

// Mock Mileage Entry interface
interface MileageEntry {
  id: string;
  organizationId: string;
  userId: string;
  date: string;
  startLocation: string;
  endLocation: string;
  distance: number;
  purpose: string;
  ratePerMile: number;
  totalAmount: number;
  vehicleType: 'PERSONAL' | 'COMPANY';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  receiptImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Create a new mileage entry
router.post(
  '/entries',
  authenticate,
  [
    body('date').isISO8601().toDate(),
    body('startLocation').isString().notEmpty(),
    body('endLocation').isString().notEmpty(),
    body('distance').isFloat({ min: 0.01 }),
    body('purpose').isString().notEmpty(),
    body('vehicleType').isIn(['PERSONAL', 'COMPANY']),
    body('receiptImageUrl').optional().isString(),
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const { date, startLocation, endLocation, distance, purpose, vehicleType, receiptImageUrl } = req.body;
    const organizationId = req.user!.organizationId;
    const userId = req.user!.id;

    const ratePerMile = 0.655; // 2023 IRS standard mileage rate
    const totalAmount = distance * ratePerMile;

    const entryId = `mile_${Date.now()}`;

    const newEntry: MileageEntry = {
      id: entryId,
      organizationId,
      userId,
      date: new Date(date).toISOString(),
      startLocation,
      endLocation,
      distance,
      purpose,
      ratePerMile,
      totalAmount,
      vehicleType,
      status: 'PENDING',
      receiptImageUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    logger.info(`New mileage entry ${entryId} created for user ${userId}`);
    res.status(201).json({ success: true, data: newEntry });
  })
);

// Get mileage entries for a user/organization
router.get(
  '/entries',
  authenticate,
  asyncHandler(async (req: any, res: any) => {
    // Mock mileage entries data
    const entries: MileageEntry[] = [
      {
        id: 'mile_1',
        organizationId: 'org_1',
        userId: 'user_1',
        date: '2023-10-01T09:00:00Z',
        startLocation: '123 Main St, City, State',
        endLocation: '456 Business Ave, City, State',
        distance: 25.5,
        purpose: 'Client meeting with ABC Corp',
        ratePerMile: 0.655,
        totalAmount: 16.70,
        vehicleType: 'PERSONAL',
        status: 'APPROVED',
        createdAt: '2023-10-01T17:00:00Z',
        updatedAt: '2023-10-02T10:00:00Z',
      },
      {
        id: 'mile_2',
        organizationId: 'org_1',
        userId: 'user_1',
        date: '2023-10-02T14:00:00Z',
        startLocation: '456 Business Ave, City, State',
        endLocation: '789 Office Plaza, City, State',
        distance: 12.3,
        purpose: 'Site visit for Project Alpha',
        ratePerMile: 0.655,
        totalAmount: 8.06,
        vehicleType: 'PERSONAL',
        status: 'PENDING',
        createdAt: '2023-10-02T16:30:00Z',
        updatedAt: '2023-10-02T16:30:00Z',
      },
    ];

    res.status(200).json({ success: true, data: entries });
  })
);

// Update mileage entry status
router.put(
  '/entries/:id/status',
  authenticate,
  [
    body('status').isIn(['PENDING', 'APPROVED', 'REJECTED']),
    body('rejectionReason').optional().isString(),
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    const organizationId = req.user!.organizationId;

    const updatedEntry: MileageEntry = {
      id,
      organizationId,
      userId: 'user_1',
      date: '2023-10-01T09:00:00Z',
      startLocation: '123 Main St, City, State',
      endLocation: '456 Business Ave, City, State',
      distance: 25.5,
      purpose: 'Client meeting with ABC Corp',
      ratePerMile: 0.655,
      totalAmount: 16.70,
      vehicleType: 'PERSONAL',
      status,
      createdAt: '2023-10-01T17:00:00Z',
      updatedAt: new Date().toISOString(),
    };

    // Notify employee of status change
    await sendEmail({
      to: process.env['EMPLOYEE_EMAIL'] || 'employee@verigrade.com',
      subject: `Mileage Entry ${status.toLowerCase()}`,
      template: status === 'APPROVED' ? 'projectCompleted' : 'billApprovalRequired',
      data: {
        entryId: id,
        status,
        amount: updatedEntry.totalAmount,
        rejectionReason,
        mileageUrl: `${process.env['FRONTEND_URL']}/mileage`,
      },
    });

    logger.info(`Mileage entry ${id} status updated to ${status} for organization ${organizationId}`);
    res.status(200).json({ success: true, data: updatedEntry });
  })
);

// Submit mileage entries for approval
router.post(
  '/submit',
  authenticate,
  [
    body('entryIds').isArray().notEmpty(),
    body('entryIds.*').isString(),
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const { entryIds } = req.body;
    const organizationId = req.user!.organizationId;
    const userId = req.user!.id;

    const totalAmount = entryIds.length * 16.70; // Mock calculation

    // Notify manager for approval
    await sendEmail({
      to: process.env['MANAGER_EMAIL'] || 'manager@verigrade.com',
      subject: `Mileage Reimbursement Request - ${req.user!.firstName} ${req.user!.lastName}`,
      template: 'mileageApprovalRequired',
      data: {
        employeeName: `${req.user!.firstName} ${req.user!.lastName}`,
        entryCount: entryIds.length,
        totalAmount,
        approvalUrl: `${process.env['FRONTEND_URL']}/mileage-approvals`,
      },
    });

    logger.info(`Mileage entries submitted for approval by user ${userId}: ${entryIds.join(', ')}`);
    res.status(200).json({ 
      success: true, 
      data: { 
        message: 'Mileage entries submitted for approval',
        entryIds,
        totalAmount 
      } 
    });
  })
);

// Get mileage reports
router.get(
  '/reports',
  authenticate,
  asyncHandler(async (req: any, res: any) => {
    const reports = {
      summary: {
        totalEntries: 45,
        totalMiles: 1250,
        totalAmount: 818.75,
        averageMilesPerTrip: 27.78,
        approvedEntries: 40,
        pendingEntries: 5,
      },
      byMonth: [
        { month: '2023-08', entries: 12, miles: 320, amount: 209.60 },
        { month: '2023-09', entries: 18, miles: 450, amount: 294.75 },
        { month: '2023-10', entries: 15, miles: 480, amount: 314.40 },
      ],
      topPurposes: [
        { purpose: 'Client meetings', entries: 20, miles: 520, amount: 340.60 },
        { purpose: 'Site visits', entries: 15, miles: 380, amount: 248.90 },
        { purpose: 'Business travel', entries: 10, miles: 350, amount: 229.25 },
      ],
      byUser: [
        { userId: 'user_1', name: 'John Doe', entries: 25, miles: 650, amount: 425.75 },
        { userId: 'user_2', name: 'Jane Smith', entries: 20, miles: 600, amount: 393.00 },
      ],
    };

    res.status(200).json({ success: true, data: reports });
  })
);

export default router;