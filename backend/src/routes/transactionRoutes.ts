import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import * as transactionService from '../services/transactionService';
import { categorizerQueue } from '../queue/categorizerWorker';
import { getCategorySuggestions } from '../services/aiCategorizerService';
import { authenticateToken } from '../middleware/auth';
import { errorHandler } from '../middleware/errorHandler';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * GET /api/transactions
 * Get transactions with filtering and pagination
 */
router.get('/', [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('sortBy').optional().isIn(['date', 'amount', 'createdAt']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  query('category').optional().isString(),
  query('transactionType').optional().isIn(['income', 'expense', 'transfer']),
  query('dateFrom').optional().isISO8601().toDate(),
  query('dateTo').optional().isISO8601().toDate(),
  query('amountMin').optional().isFloat({ min: 0 }).toFloat(),
  query('amountMax').optional().isFloat({ min: 0 }).toFloat(),
  query('search').optional().isString()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid query parameters', details: errors.array() }
      });
    }

    const filters = {
      userId: req.user?.id,
      organizationId: req.user?.organizationId,
      category: req.query.category as string,
      transactionType: req.query.transactionType as 'income' | 'expense' | 'transfer',
      dateFrom: req.query.dateFrom as Date,
      dateTo: req.query.dateTo as Date,
      amountMin: req.query.amountMin as number,
      amountMax: req.query.amountMax as number,
      search: req.query.search as string
    };

    const pagination = {
      page: req.query.page as number,
      limit: req.query.limit as number,
      sortBy: req.query.sortBy as string,
      sortOrder: req.query.sortOrder as 'asc' | 'desc'
    };

    const result = await transactionService.getTransactions(filters, pagination);
    
    res.json({
      success: true,
      data: result.transactions,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/transactions/stats
 * Get transaction statistics
 */
router.get('/stats', async (req, res, next) => {
  try {
    const filters = {
      userId: req.user?.id,
      organizationId: req.user?.organizationId,
      category: req.query.category as string,
      transactionType: req.query.transactionType as 'income' | 'expense' | 'transfer',
      dateFrom: req.query.dateFrom as Date,
      dateTo: req.query.dateTo as Date
    };

    const stats = await transactionService.getTransactionStats(filters);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/transactions/:id
 * Get a specific transaction
 */
router.get('/:id', [
  param('id').isUUID()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid transaction ID' }
      });
    }

    const transaction = await transactionService.getTransactionById(
      req.params.id,
      req.user?.id
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: { message: 'Transaction not found' }
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/transactions
 * Create a new transaction
 */
router.post('/', [
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('currency').optional().isString().isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code'),
  body('originalAmount').optional().isFloat({ min: 0 }).withMessage('Original amount must be positive'),
  body('originalCurrency').optional().isString().isLength({ min: 3, max: 3 }).withMessage('Original currency must be a 3-letter code'),
  body('exchangeRate').optional().isFloat({ min: 0 }).withMessage('Exchange rate must be positive'),
  body('description').isString().isLength({ min: 1, max: 500 }).withMessage('Description is required'),
  body('date').optional().isISO8601().toDate(),
  body('category').optional().isString(),
  body('accountId').optional().isUUID(),
  body('metadata').optional().isObject(),
  body('merchant').optional().isString(),
  body('transactionType').optional().isIn(['income', 'expense', 'transfer'])
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid input data', details: errors.array() }
      });
    }

    const transactionData = {
      amount: req.body.amount,
      currency: req.body.currency || 'USD',
      originalAmount: req.body.originalAmount,
      originalCurrency: req.body.originalCurrency,
      exchangeRate: req.body.exchangeRate,
      description: req.body.description,
      date: req.body.date,
      category: req.body.category,
      accountId: req.body.accountId,
      userId: req.user!.id,
      organizationId: req.user!.organizationId!,
      metadata: req.body.metadata,
      merchant: req.body.merchant,
      transactionType: req.body.transactionType
    };

    const transaction = await transactionService.createTransaction(transactionData);
    
    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/transactions/:id
 * Update a transaction
 */
router.put('/:id', [
  param('id').isUUID(),
  body('amount').optional().isFloat({ min: 0 }),
  body('description').optional().isString().isLength({ min: 1, max: 500 }),
  body('date').optional().isISO8601().toDate(),
  body('category').optional().isString(),
  body('metadata').optional().isObject(),
  body('merchant').optional().isString(),
  body('transactionType').optional().isIn(['income', 'expense', 'transfer'])
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid input data', details: errors.array() }
      });
    }

    const updateData = {
      amount: req.body.amount,
      description: req.body.description,
      date: req.body.date,
      category: req.body.category,
      metadata: req.body.metadata,
      merchant: req.body.merchant,
      transactionType: req.body.transactionType
    };

    const transaction = await transactionService.updateTransaction(
      req.params.id,
      updateData,
      req.user?.id
    );
    
    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/transactions/:id
 * Delete a transaction
 */
router.delete('/:id', [
  param('id').isUUID()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid transaction ID' }
      });
    }

    await transactionService.deleteTransaction(req.params.id, req.user?.id);
    
    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/transactions/categorize
 * Categorize a single transaction
 */
router.post('/categorize', [
  body('transactionId').isUUID().withMessage('Valid transaction ID is required'),
  body('amount').optional().isFloat({ min: 0 }),
  body('description').optional().isString(),
  body('metadata').optional().isObject(),
  body('merchant').optional().isString(),
  body('date').optional().isISO8601()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid input data', details: errors.array() }
      });
    }

    // Verify transaction exists and user has access
    const transaction = await transactionService.getTransactionById(
      req.body.transactionId,
      req.user?.id
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: { message: 'Transaction not found' }
      });
    }

    // Add to categorization queue
    const job = await categorizerQueue.add({
      transactionId: req.body.transactionId,
      amount: req.body.amount || transaction.amount,
      description: req.body.description || transaction.description,
      metadata: req.body.metadata || transaction.metadata,
      merchant: req.body.merchant || transaction.merchant || undefined,
      date: req.body.date || transaction.date.toISOString()
    }, {
      priority: 2 // Higher priority for manual categorization requests
    });

    res.json({
      success: true,
      data: {
        jobId: job.id,
        transactionId: req.body.transactionId,
        status: 'queued'
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/transactions/bulk-categorize
 * Categorize multiple transactions
 */
router.post('/bulk-categorize', [
  body('transactionIds').isArray({ min: 1, max: 50 }).withMessage('Transaction IDs array is required (1-50 items)'),
  body('transactionIds.*').isUUID().withMessage('Each transaction ID must be valid')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid input data', details: errors.array() }
      });
    }

    const result = await transactionService.bulkCategorizeTransactions(
      req.body.transactionIds,
      req.user?.id
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/transactions/suggestions/:id
 * Get category suggestions for a transaction
 */
router.get('/suggestions/:id', [
  param('id').isUUID()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid transaction ID' }
      });
    }

    const transaction = await transactionService.getTransactionById(
      req.params.id,
      req.user?.id
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: { message: 'Transaction not found' }
      });
    }

    const suggestions = getCategorySuggestions(transaction.description);
    
    res.json({
      success: true,
      data: {
        transactionId: transaction.id,
        description: transaction.description,
        suggestions
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
