import { Router } from 'express';
import { serviceBillingController } from '../controllers/serviceBillingController';
import { authenticateToken } from '../middleware/jwtAuth';
import { validateRequest } from '../middleware/validation';
import { body, param, query } from 'express-validator';

const router = Router();

// Service Packages
router.get('/packages', 
  authenticateToken,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString()
  ],
  validateRequest,
  serviceBillingController.getServicePackages
);

router.post('/packages',
  authenticateToken,
  [
    body('name').notEmpty().isString().isLength({ min: 1, max: 255 }),
    body('description').optional().isString().isLength({ max: 1000 }),
    body('hourlyRate').optional().isFloat({ min: 0 }),
    body('fixedPrice').optional().isFloat({ min: 0 }),
    body('billingType').isIn(['HOURLY', 'FIXED', 'MIXED']),
    body('isActive').optional().isBoolean()
  ],
  validateRequest,
  serviceBillingController.createServicePackage
);

router.put('/packages/:packageId',
  authenticateToken,
  [
    param('packageId').isUUID(),
    body('name').optional().isString().isLength({ min: 1, max: 255 }),
    body('description').optional().isString().isLength({ max: 1000 }),
    body('hourlyRate').optional().isFloat({ min: 0 }),
    body('fixedPrice').optional().isFloat({ min: 0 }),
    body('billingType').optional().isIn(['HOURLY', 'FIXED', 'MIXED']),
    body('isActive').optional().isBoolean()
  ],
  validateRequest,
  serviceBillingController.updateServicePackage
);

router.delete('/packages/:packageId',
  authenticateToken,
  [
    param('packageId').isUUID()
  ],
  validateRequest,
  serviceBillingController.deleteServicePackage
);

// Time Entries
router.get('/time-entries',
  authenticateToken,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('packageId').optional().isUUID(),
    query('userId').optional().isUUID()
  ],
  validateRequest,
  serviceBillingController.getTimeEntries
);

router.post('/time-entries',
  authenticateToken,
  [
    body('servicePackageId').isUUID(),
    body('clientId').isUUID(),
    body('description').notEmpty().isString().isLength({ min: 1, max: 500 }),
    body('hours').isFloat({ min: 0.01, max: 24 }),
    body('rate').isFloat({ min: 0 }),
    body('date').isISO8601(),
    body('isBillable').optional().isBoolean(),
    body('notes').optional().isString().isLength({ max: 1000 })
  ],
  validateRequest,
  serviceBillingController.createTimeEntry
);

router.put('/time-entries/:entryId',
  authenticateToken,
  [
    param('entryId').isUUID(),
    body('servicePackageId').optional().isUUID(),
    body('clientId').optional().isUUID(),
    body('description').optional().isString().isLength({ min: 1, max: 500 }),
    body('hours').optional().isFloat({ min: 0.01, max: 24 }),
    body('rate').optional().isFloat({ min: 0 }),
    body('date').optional().isISO8601(),
    body('isBillable').optional().isBoolean(),
    body('notes').optional().isString().isLength({ max: 1000 })
  ],
  validateRequest,
  serviceBillingController.updateTimeEntry
);

router.delete('/time-entries/:entryId',
  authenticateToken,
  [
    param('entryId').isUUID()
  ],
  validateRequest,
  serviceBillingController.deleteTimeEntry
);

// Time Tracking (Timer)
router.post('/timer/start',
  authenticateToken,
  [
    body('servicePackageId').isUUID(),
    body('clientId').isUUID(),
    body('description').notEmpty().isString().isLength({ min: 1, max: 500 })
  ],
  validateRequest,
  serviceBillingController.startTimer
);

router.post('/timer/stop/:entryId',
  authenticateToken,
  [
    param('entryId').isUUID()
  ],
  validateRequest,
  serviceBillingController.stopTimer
);

router.get('/timer/active',
  authenticateToken,
  serviceBillingController.getActiveTimer
);

// Service Invoicing
router.post('/invoices/generate',
  authenticateToken,
  [
    body('clientId').isUUID(),
    body('servicePackageId').isUUID(),
    body('timeEntryIds').optional().isArray(),
    body('timeEntryIds.*').optional().isUUID(),
    body('startDate').optional().isISO8601(),
    body('endDate').optional().isISO8601(),
    body('invoiceDate').isISO8601(),
    body('dueDate').isISO8601(),
    body('notes').optional().isString().isLength({ max: 1000 })
  ],
  validateRequest,
  serviceBillingController.generateServiceInvoice
);

router.get('/invoices',
  authenticateToken,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']),
    query('clientId').optional().isUUID()
  ],
  validateRequest,
  serviceBillingController.getServiceInvoices
);

// Reports
router.get('/reports/time-tracking',
  authenticateToken,
  [
    query('startDate').isISO8601(),
    query('endDate').isISO8601(),
    query('userId').optional().isUUID(),
    query('clientId').optional().isUUID(),
    query('servicePackageId').optional().isUUID()
  ],
  validateRequest,
  serviceBillingController.getTimeTrackingReport
);

export default router;