import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { asyncHandler, CustomError } from '../middleware/errorHandler';
import { prisma } from '../index';
import { generatePDF, generateExcel, generateCSV } from '../services/reportService';
import {
  generateReport,
  getReports,
  getReport,
  deleteReport,
} from '../controllers/reportController';

const router = Router();

// Get reports
router.get('/',
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('type').optional().isIn(['PROFIT_LOSS', 'BALANCE_SHEET', 'CASH_FLOW', 'AGING_REPORT', 'EXPENSE_REPORT', 'INCOME_REPORT', 'TAX_REPORT', 'CUSTOM']),
    query('status').optional().isIn(['PENDING', 'GENERATING', 'COMPLETED', 'FAILED']),
  ],
  validateRequest,
  asyncHandler(getReports)
);

// Get single report
router.get('/:id',
  authenticate,
  [
    param('id').isUUID(),
  ],
  validateRequest,
  asyncHandler(getReport)
);

// Generate report
router.post('/',
  authenticate,
  [
    body('type').isIn(['PROFIT_LOSS', 'BALANCE_SHEET', 'CASH_FLOW', 'AGING_REPORT', 'EXPENSE_REPORT', 'INCOME_REPORT', 'TAX_REPORT', 'CUSTOM']),
    body('name').isString().notEmpty(),
    body('parameters').isObject(),
    body('parameters.dateFrom').optional().isISO8601(),
    body('parameters.dateTo').optional().isISO8601(),
    body('parameters.format').optional().isIn(['pdf', 'excel', 'csv']),
    body('parameters.categories').optional().isArray(),
    body('parameters.includeCharts').optional().isBoolean(),
  ],
  validateRequest,
  asyncHandler(generateReport)
);

// Delete report
router.delete('/:id',
  authenticate,
  [
    param('id').isUUID(),
  ],
  validateRequest,
  asyncHandler(deleteReport)
);

// Download report file
router.get('/:id/download',
  authenticate,
  [
    param('id').isUUID(),
    query('format').isIn(['pdf', 'excel', 'csv']),
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const { id } = req.params;
    const { format } = req.query;
    const organizationId = req.user!.organizationId!;

    const report = await prisma.report.findFirst({
      where: {
        id,
        organizationId,
        status: 'COMPLETED',
      },
    });

    if (!report) {
      throw new CustomError('Report not found or not completed', 404);
    }

    let fileUrl: string;

    switch (format) {
      case 'pdf':
        fileUrl = await generatePDF(report.data, report.type, report.name);
        break;
      case 'excel':
        fileUrl = await generateExcel(report.data, report.type, report.name);
        break;
      case 'csv':
        fileUrl = await generateCSV(report.data, report.type, report.name);
        break;
      default:
        throw new CustomError('Invalid format', 400);
    }

    res.json({
      success: true,
      data: { downloadUrl: fileUrl },
    });
  })
);

export default router;
