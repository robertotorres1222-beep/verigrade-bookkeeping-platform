import { Router } from 'express';
import { exchangeRateController } from '../controllers/exchangeRateController';
import { authenticateToken } from '../middleware/jwtAuth';
import { validateRequest } from '../middleware/validation';
import { query, param, body } from 'express-validator';

const router = Router();

// Get exchange rate between two currencies
router.get('/rate',
  authenticateToken,
  [
    query('from').notEmpty().isString().isLength({ min: 3, max: 3 }),
    query('to').notEmpty().isString().isLength({ min: 3, max: 3 })
  ],
  validateRequest,
  exchangeRateController.getExchangeRate
);

// Get all exchange rates for a base currency
router.get('/rates',
  authenticateToken,
  [
    query('base').optional().isString().isLength({ min: 3, max: 3 })
  ],
  validateRequest,
  exchangeRateController.getAllExchangeRates
);

// Convert currency amount
router.post('/convert',
  authenticateToken,
  [
    body('amount').isFloat({ min: 0 }),
    body('from').notEmpty().isString().isLength({ min: 3, max: 3 }),
    body('to').notEmpty().isString().isLength({ min: 3, max: 3 })
  ],
  validateRequest,
  exchangeRateController.convertCurrency
);

// Convert currency with fees
router.post('/convert-with-fees',
  authenticateToken,
  [
    body('amount').isFloat({ min: 0 }),
    body('from').notEmpty().isString().isLength({ min: 3, max: 3 }),
    body('to').notEmpty().isString().isLength({ min: 3, max: 3 }),
    body('feePercentage').optional().isFloat({ min: 0, max: 100 })
  ],
  validateRequest,
  exchangeRateController.convertCurrencyWithFees
);

// Get historical exchange rates
router.get('/historical',
  authenticateToken,
  [
    query('from').notEmpty().isString().isLength({ min: 3, max: 3 }),
    query('to').notEmpty().isString().isLength({ min: 3, max: 3 }),
    query('days').optional().isInt({ min: 1, max: 365 })
  ],
  validateRequest,
  exchangeRateController.getHistoricalRates
);

// Get supported currencies
router.get('/currencies',
  authenticateToken,
  exchangeRateController.getSupportedCurrencies
);

// Get currency symbol
router.get('/symbol/:currency',
  authenticateToken,
  [
    param('currency').notEmpty().isString().isLength({ min: 3, max: 3 })
  ],
  validateRequest,
  exchangeRateController.getCurrencySymbol
);

// Format currency amount
router.post('/format',
  authenticateToken,
  [
    body('amount').isFloat({ min: 0 }),
    body('currency').notEmpty().isString().isLength({ min: 3, max: 3 }),
    body('locale').optional().isString()
  ],
  validateRequest,
  exchangeRateController.formatCurrency
);

// Refresh exchange rates (admin only)
router.post('/refresh',
  authenticateToken,
  exchangeRateController.refreshExchangeRates
);

// Get exchange rate with fallback
router.get('/rate-fallback',
  authenticateToken,
  [
    query('from').notEmpty().isString().isLength({ min: 3, max: 3 }),
    query('to').notEmpty().isString().isLength({ min: 3, max: 3 })
  ],
  validateRequest,
  exchangeRateController.getExchangeRateWithFallback
);

// Get currency conversion preview
router.get('/preview',
  authenticateToken,
  [
    query('amount').isFloat({ min: 0 }),
    query('from').notEmpty().isString().isLength({ min: 3, max: 3 }),
    query('to').notEmpty().isString().isLength({ min: 3, max: 3 })
  ],
  validateRequest,
  exchangeRateController.getConversionPreview
);

// Get currency statistics
router.get('/stats',
  authenticateToken,
  [
    query('currency').optional().isString().isLength({ min: 3, max: 3 })
  ],
  validateRequest,
  exchangeRateController.getCurrencyStats
);

export default router;

