import { Router } from 'express';
import { body, query } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
// import { prisma } from '../index';
import {
  categorizeTransaction,
  generateInsights,
  processNaturalLanguageQuery,
  detectAnomalies,
  predictCashFlow,
} from '../services/aiService';

const router = Router();

// AI-powered transaction categorization
router.post('/categorize-transaction',
  authenticate,
  [
    body('description').isString().notEmpty(),
    body('amount').isFloat({ min: 0 }),
    body('vendor').optional().isString(),
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const { description, amount, vendor } = req.body;
    const organizationId = req.user!.organizationId!;

    const result = await categorizeTransaction(description, amount, vendor, organizationId);

    res.json({
      success: true,
      data: result,
    });
  })
);

// Natural language query
router.post('/query',
  authenticate,
  [
    body('query').isString().notEmpty(),
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const { query } = req.body;
    const organizationId = req.user!.organizationId!;

    const result = await processNaturalLanguageQuery(query, organizationId);

    res.json({
      success: true,
      data: result,
    });
  })
);

// Generate insights
router.post('/insights',
  authenticate,
  [
    body('dataType').optional().isIn(['expenses', 'revenue', 'cashflow']),
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const { dataType = 'expenses' } = req.body;
    const organizationId = req.user!.organizationId!;

    const insights = await generateInsights(organizationId, dataType);

    res.json({
      success: true,
      data: { insights },
    });
  })
);

// Detect anomalies
router.get('/anomalies',
  authenticate,
  asyncHandler(async (req: any, res: any) => {
    const organizationId = req.user!.organizationId!;

    const anomalies = await detectAnomalies(organizationId);

    res.json({
      success: true,
      data: { anomalies },
    });
  })
);

// Predict cash flow
router.get('/cash-flow-prediction',
  authenticate,
  [
    query('months').optional().isInt({ min: 1, max: 12 }),
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const { months = 3 } = req.query;
    const organizationId = req.user!.organizationId!;

    const prediction = await predictCashFlow(organizationId, Number(months));

    res.json({
      success: true,
      data: prediction,
    });
  })
);

export default router;
