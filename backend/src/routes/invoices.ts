import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import {
  createInvoice,
  getInvoices,
  getInvoice,
  updateInvoice,
  deleteInvoice,
  sendInvoice,
  markInvoicePaid,
} from '../controllers/invoiceController';

const router = Router();

// Get invoices
router.get('/',
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['DRAFT', 'SENT', 'VIEWED', 'PAID', 'OVERDUE', 'CANCELLED']),
    query('dateFrom').optional().isISO8601(),
    query('dateTo').optional().isISO8601(),
    query('search').optional().isString(),
  ],
  validateRequest,
  asyncHandler(getInvoices)
);

// Get single invoice
router.get('/:id',
  authenticate,
  [
    param('id').isUUID(),
  ],
  validateRequest,
  asyncHandler(getInvoice)
);

// Create invoice
router.post('/',
  authenticate,
  [
    body('customerId').optional().isUUID(),
    body('issueDate').isISO8601(),
    body('dueDate').optional().isISO8601(),
    body('items').isArray({ min: 1 }),
    body('items.*.description').isString().notEmpty(),
    body('items.*.quantity').isFloat({ min: 0.01 }),
    body('items.*.unitPrice').isFloat({ min: 0 }),
    body('notes').optional().isString(),
    body('terms').optional().isString(),
    body('taxRate').optional().isFloat({ min: 0, max: 100 }),
  ],
  validateRequest,
  asyncHandler(createInvoice)
);

// Update invoice
router.put('/:id',
  authenticate,
  [
    param('id').isUUID(),
    body('customerId').optional().isUUID(),
    body('issueDate').optional().isISO8601(),
    body('dueDate').optional().isISO8601(),
    body('items').optional().isArray({ min: 1 }),
    body('items.*.description').optional().isString().notEmpty(),
    body('items.*.quantity').optional().isFloat({ min: 0.01 }),
    body('items.*.unitPrice').optional().isFloat({ min: 0 }),
    body('notes').optional().isString(),
    body('terms').optional().isString(),
    body('taxRate').optional().isFloat({ min: 0, max: 100 }),
    body('status').optional().isIn(['DRAFT', 'SENT', 'VIEWED', 'PAID', 'OVERDUE', 'CANCELLED']),
  ],
  validateRequest,
  asyncHandler(updateInvoice)
);

// Delete invoice
router.delete('/:id',
  authenticate,
  [
    param('id').isUUID(),
  ],
  validateRequest,
  asyncHandler(deleteInvoice)
);

// Send invoice
router.post('/:id/send',
  authenticate,
  [
    param('id').isUUID(),
  ],
  validateRequest,
  asyncHandler(sendInvoice)
);

// Mark invoice as paid
router.patch('/:id/paid',
  authenticate,
  [
    param('id').isUUID(),
  ],
  validateRequest,
  asyncHandler(markInvoicePaid)
);

export default router;
