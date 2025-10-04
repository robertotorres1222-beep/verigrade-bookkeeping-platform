import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { upload } from '../services/fileService';
import {
  createExpense,
  getExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
  approveExpense,
  rejectExpense,
  getExpenseStats,
} from '../controllers/expenseController';

const router = Router();

// Get expenses
router.get('/',
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['PENDING', 'APPROVED', 'REJECTED', 'PAID']),
    query('category').optional().isString(),
    query('dateFrom').optional().isISO8601(),
    query('dateTo').optional().isISO8601(),
    query('search').optional().isString(),
    query('isReimbursable').optional().isBoolean(),
    query('isTaxDeductible').optional().isBoolean(),
  ],
  validateRequest,
  asyncHandler(getExpenses)
);

// Get expense statistics
router.get('/stats',
  authenticate,
  [
    query('dateFrom').optional().isISO8601(),
    query('dateTo').optional().isISO8601(),
  ],
  validateRequest,
  asyncHandler(getExpenseStats)
);

// Get single expense
router.get('/:id',
  authenticate,
  [
    param('id').isUUID(),
  ],
  validateRequest,
  asyncHandler(getExpense)
);

// Create expense
router.post('/',
  authenticate,
  upload.single('receipt'),
  [
    body('amount').isFloat({ min: 0.01 }),
    body('description').isString().notEmpty(),
    body('category').optional().isString(),
    body('subcategory').optional().isString(),
    body('date').isISO8601(),
    body('vendor').optional().isString(),
    body('isReimbursable').isBoolean(),
    body('isTaxDeductible').isBoolean(),
    body('notes').optional().isString(),
  ],
  validateRequest,
  asyncHandler(createExpense)
);

// Update expense
router.put('/:id',
  authenticate,
  upload.single('receipt'),
  [
    param('id').isUUID(),
    body('amount').optional().isFloat({ min: 0.01 }),
    body('description').optional().isString().notEmpty(),
    body('category').optional().isString(),
    body('subcategory').optional().isString(),
    body('date').optional().isISO8601(),
    body('vendor').optional().isString(),
    body('isReimbursable').optional().isBoolean(),
    body('isTaxDeductible').optional().isBoolean(),
    body('notes').optional().isString(),
    body('status').optional().isIn(['PENDING', 'APPROVED', 'REJECTED', 'PAID']),
  ],
  validateRequest,
  asyncHandler(updateExpense)
);

// Delete expense
router.delete('/:id',
  authenticate,
  [
    param('id').isUUID(),
  ],
  validateRequest,
  asyncHandler(deleteExpense)
);

// Approve expense
router.patch('/:id/approve',
  authenticate,
  [
    param('id').isUUID(),
  ],
  validateRequest,
  asyncHandler(approveExpense)
);

// Reject expense
router.patch('/:id/reject',
  authenticate,
  [
    param('id').isUUID(),
    body('reason').optional().isString(),
  ],
  validateRequest,
  asyncHandler(rejectExpense)
);

export default router;
