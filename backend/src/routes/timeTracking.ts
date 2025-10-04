import { Router } from 'express';
import { body, query } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { asyncHandler, CustomError } from '../middleware/errorHandler';
import { sendEmail } from '../services/emailService';
import { logger } from '../utils/logger';

const router = Router();

// Mock Time Entry interface
interface TimeEntry {
  id: string;
  organizationId: string;
  userId: string;
  projectId?: string;
  clientId?: string;
  date: string;
  hours: number;
  description: string;
  billable: boolean;
  ratePerHour?: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

// Mock Timesheet interface
interface Timesheet {
  id: string;
  organizationId: string;
  userId: string;
  startDate: string;
  endDate: string;
  totalHours: number;
  totalBillableHours: number;
  totalAmountDue?: number;
  status: 'OPEN' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  submittedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Log a new time entry
router.post(
  '/entries',
  authenticate,
  [
    body('date').isISO8601().toDate(),
    body('hours').isFloat({ min: 0.01 }),
    body('description').isString().notEmpty(),
    body('billable').isBoolean(),
    body('projectId').optional().isString(),
    body('clientId').optional().isString(),
    body('ratePerHour').optional().isFloat({ min: 0 }),
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const { date, hours, description, billable, projectId, clientId, ratePerHour } = req.body;
    const organizationId = req.user!.organizationId;
    const userId = req.user!.id;

    const entryId = `te_${Date.now()}`;

    const newEntry: TimeEntry = {
      id: entryId,
      organizationId,
      userId,
      projectId,
      clientId,
      date: new Date(date).toISOString(),
      hours,
      description,
      billable,
      ratePerHour,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    logger.info(`New time entry ${entryId} created for user ${userId}`);
    res.status(201).json({ success: true, data: newEntry });
  })
);

// Get time entries for a user/organization
router.get(
  '/entries',
  authenticate,
  asyncHandler(async (req: any, res: any) => {
    // Mock time entries data
    const entries: TimeEntry[] = [
      {
        id: 'te_1',
        organizationId: 'org_1',
        userId: 'user_1',
        projectId: 'proj_1',
        date: '2023-10-01T09:00:00Z',
        hours: 8,
        description: 'Worked on feature X for Project Alpha',
        billable: true,
        ratePerHour: 75,
        status: 'APPROVED',
        createdAt: '2023-10-01T17:00:00Z',
        updatedAt: '2023-10-02T10:00:00Z',
      },
      {
        id: 'te_2',
        organizationId: 'org_1',
        userId: 'user_1',
        clientId: 'client_A',
        date: '2023-10-02T10:00:00Z',
        hours: 4.5,
        description: 'Client meeting and follow-up for Client A',
        billable: true,
        ratePerHour: 75,
        status: 'PENDING',
        createdAt: '2023-10-02T14:30:00Z',
        updatedAt: '2023-10-02T14:30:00Z',
      },
    ];

    res.status(200).json({ success: true, data: entries });
  })
);

// Submit a timesheet for approval
router.post(
  '/timesheets',
  authenticate,
  [
    body('startDate').isISO8601().toDate(),
    body('endDate').isISO8601().toDate(),
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const { startDate, endDate } = req.body;
    const organizationId = req.user!.organizationId;
    const userId = req.user!.id;

    const totalHours = 40;
    const totalBillableHours = 35;
    const totalAmountDue = totalBillableHours * 75;

    const timesheetId = `ts_${Date.now()}`;

    const newTimesheet: Timesheet = {
      id: timesheetId,
      organizationId,
      userId,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      totalHours,
      totalBillableHours,
      totalAmountDue,
      status: 'SUBMITTED',
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Notify approvers
    await sendEmail({
      to: process.env['MANAGER_EMAIL'] || 'manager@verigrade.com',
      subject: `Timesheet Submitted for ${req.user!.firstName} ${req.user!.lastName}`,
      template: 'billApprovalRequired',
      data: {
        employeeName: `${req.user!.firstName} ${req.user!.lastName}`,
        startDate: new Date(startDate).toLocaleDateString(),
        endDate: new Date(endDate).toLocaleDateString(),
        totalHours,
        approvalUrl: `${process.env['FRONTEND_URL']}/timesheet-approvals/${timesheetId}`,
      },
    });

    logger.info(`Timesheet ${timesheetId} submitted by user ${userId}`);
    res.status(201).json({ success: true, data: newTimesheet });
  })
);

// Get timesheets for an organization/user
router.get(
  '/timesheets',
  authenticate,
  asyncHandler(async (req: any, res: any) => {
    const timesheets: Timesheet[] = [
      {
        id: 'ts_1',
        organizationId: 'org_1',
        userId: 'user_1',
        startDate: '2023-09-25T00:00:00Z',
        endDate: '2023-10-01T23:59:59Z',
        totalHours: 40,
        totalBillableHours: 35,
        totalAmountDue: 2625,
        status: 'APPROVED',
        submittedAt: '2023-10-02T09:00:00Z',
        approvedBy: 'manager_1',
        approvedAt: '2023-10-02T14:00:00Z',
        createdAt: '2023-10-02T09:00:00Z',
        updatedAt: '2023-10-02T14:00:00Z',
      },
    ];

    res.status(200).json({ success: true, data: timesheets });
  })
);

// Get time tracking reports
router.get(
  '/reports',
  authenticate,
  asyncHandler(async (req: any, res: any) => {
    const reports = {
      summary: {
        totalHoursLogged: 320,
        billableHours: 280,
        nonBillableHours: 40,
        totalRevenue: 21000,
        averageHourlyRate: 75,
      },
      byProject: [
        { projectId: 'proj_1', name: 'Project Alpha', hours: 120, revenue: 9000 },
        { projectId: 'proj_2', name: 'Project Beta', hours: 80, revenue: 6000 },
      ],
      byUser: [
        { userId: 'user_1', name: 'John Doe', hours: 160, revenue: 12000 },
        { userId: 'user_2', name: 'Jane Smith', hours: 120, revenue: 9000 },
      ],
      weeklyTrend: [
        { week: '2023-09-25', hours: 40, billableHours: 35 },
        { week: '2023-10-02', hours: 45, billableHours: 40 },
        { week: '2023-10-09', hours: 38, billableHours: 32 },
      ],
    };

    res.status(200).json({ success: true, data: reports });
  })
);

export default router;