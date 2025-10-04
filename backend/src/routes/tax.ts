import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { asyncHandler, CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { sendEmail } from '../services/emailService';

const router = Router();

// Get tax documents and status
router.get('/status',
  authenticate,
  asyncHandler(async (req: any, res: any) => {
    // const _userId = req.user!.id;
    const { year = new Date().getFullYear() - 1 } = req.query;

    // Mock tax status data
    const taxStatus = {
      year: parseInt(year),
      status: 'ready_to_file', // 'preparing', 'ready_to_file', 'filed', 'accepted', 'rejected'
      filingType: 'business_return',
      dueDate: `2024-03-15`,
      daysUntilDue: 45,
      documents: [
        {
          id: 'doc_1',
          name: 'Form 1120 - Corporate Tax Return',
          status: 'ready',
          uploadedDate: '2024-01-15T10:00:00Z',
          size: '2.3 MB',
          type: 'tax_return'
        },
        {
          id: 'doc_2',
          name: 'W-2 Forms (All Employees)',
          status: 'ready',
          uploadedDate: '2024-01-20T14:30:00Z',
          size: '1.1 MB',
          type: 'payroll_documents'
        },
        {
          id: 'doc_3',
          name: '1099 Forms (Contractors)',
          status: 'ready',
          uploadedDate: '2024-01-22T09:15:00Z',
          size: '856 KB',
          type: 'contractor_documents'
        },
        {
          id: 'doc_4',
          name: 'Financial Statements',
          status: 'ready',
          uploadedDate: '2024-01-25T16:45:00Z',
          size: '3.2 MB',
          type: 'financial_statements'
        }
      ],
      estimatedRefund: 15420.00,
      estimatedTaxOwed: 0.00,
      credits: [
        {
          name: 'R&D Tax Credit',
          amount: 12500.00,
          status: 'qualified'
        },
        {
          name: 'Employee Retention Credit',
          amount: 2920.00,
          status: 'qualified'
        }
      ],
      deductions: [
        {
          name: 'Business Expenses',
          amount: 45230.00,
          category: 'ordinary_and_necessary'
        },
        {
          name: 'Depreciation',
          amount: 12850.00,
          category: 'asset_depreciation'
        },
        {
          name: 'Home Office',
          amount: 3200.00,
          category: 'home_office'
        }
      ]
    };

    res.json({
      success: true,
      data: taxStatus
    });
  })
);

// Upload tax documents
router.post('/upload',
  authenticate,
  [
    body('documentType').isIn(['tax_return', 'payroll_documents', 'contractor_documents', 'financial_statements', 'receipts', 'other']),
    body('description').optional().isString().trim(),
    body('taxYear').isInt({ min: 2020, max: new Date().getFullYear() }),
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const { documentType, description, taxYear } = req.body;
    // const _userId = req.user!.id;

    try {
      // In a real implementation, this would handle file upload
      const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      logger.info('Tax document uploaded:', {
        // _userId,
        documentId,
        documentType,
        description,
        taxYear,
        timestamp: new Date().toISOString(),
      });

      // Send notification to tax team
      await sendEmail({
        to: process.env['TAX_EMAIL'] || 'tax@verigrade.com',
        subject: `New Tax Document Uploaded - ${req.user!.email}`,
        template: 'taxDocumentUploaded',
        data: {
          clientEmail: req.user!.email,
          documentType,
          description: description || 'No description provided',
          taxYear,
          documentId,
          uploadDate: new Date().toLocaleString(),
        },
      });

      res.status(201).json({
        success: true,
        message: 'Document uploaded successfully',
        documentId,
        data: {
          documentId,
          documentType,
          description,
          taxYear,
          uploadDate: new Date().toISOString(),
          status: 'processing'
        }
      });

    } catch (error) {
      logger.error('Tax document upload error:', error);
      throw new CustomError('Failed to upload document', 500);
    }
  })
);

// Request tax filing
router.post('/file',
  authenticate,
  [
    body('filingType').isIn(['business_return', 'personal_return', 'partnership', 's_corp']),
    body('taxYear').isInt({ min: 2020, max: new Date().getFullYear() }),
    body('preferredFilingDate').optional().isISO8601().toDate(),
    body('notes').optional().isString().trim(),
    body('includeExtensions').optional().isBoolean(),
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const { filingType, taxYear, preferredFilingDate, notes, includeExtensions = false } = req.body;
    // const _userId = req.user!.id;

    try {
      const filingId = `filing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      logger.info('Tax filing requested:', {
        // _userId,
        filingId,
        filingType,
        taxYear,
        preferredFilingDate,
        includeExtensions,
        timestamp: new Date().toISOString(),
      });

      // Send confirmation to customer
      await sendEmail({
        to: req.user!.email,
        subject: 'Tax Filing Request Confirmed - VeriGrade',
        template: 'taxFilingConfirmation',
        data: {
          filingId,
          filingType,
          taxYear,
          preferredFilingDate: preferredFilingDate ? new Date(preferredFilingDate).toLocaleDateString() : 'As soon as possible',
          estimatedCompletionTime: '5-7 business days',
          includeExtensions,
          notes: notes || 'No additional notes',
        },
      });

      // Send notification to tax team
      await sendEmail({
        to: process.env['TAX_EMAIL'] || 'tax@verigrade.com',
        subject: `New Tax Filing Request - ${req.user!.email}`,
        template: 'taxFilingRequest',
        data: {
          clientEmail: req.user!.email,
          filingId,
          filingType,
          taxYear,
          preferredFilingDate: preferredFilingDate ? new Date(preferredFilingDate).toLocaleDateString() : 'As soon as possible',
          includeExtensions,
          notes: notes || 'No additional notes',
          requestDate: new Date().toLocaleString(),
        },
      });

      res.status(201).json({
        success: true,
        message: 'Tax filing request submitted successfully',
        filingId,
        estimatedCompletionTime: '5-7 business days',
        data: {
          filingId,
          filingType,
          taxYear,
          status: 'in_progress',
          requestedDate: new Date().toISOString(),
          estimatedCompletionTime: '5-7 business days'
        }
      });

    } catch (error) {
      logger.error('Tax filing request error:', error);
      throw new CustomError('Failed to submit tax filing request', 500);
    }
  })
);

// Get R&D tax credit analysis
router.get('/rd-credit',
  authenticate,
  asyncHandler(async (req: any, res: any) => {
    // const _userId = req.user!.id;
    const { year = new Date().getFullYear() - 1 } = req.query;

    // Mock R&D credit analysis
    const rdCreditAnalysis = {
      year: parseInt(year),
      qualifiedResearchExpenses: 125000.00,
      baseAmount: 75000.00,
      creditPercentage: 20,
      estimatedCredit: 10000.00,
      qualifiedActivities: [
        {
          activity: 'Software Development',
          expenses: 45000.00,
          percentage: 36,
          description: 'Development of proprietary software platform'
        },
        {
          activity: 'Product Research',
          expenses: 32000.00,
          percentage: 25.6,
          description: 'Research and development of new product features'
        },
        {
          activity: 'Process Improvement',
          expenses: 28000.00,
          percentage: 22.4,
          description: 'Development of automated business processes'
        },
        {
          activity: 'Technical Consulting',
          expenses: 20000.00,
          percentage: 16,
          description: 'Consulting fees for technical expertise'
        }
      ],
      supportingDocuments: [
        'Employee timesheets',
        'Project documentation',
        'Technical specifications',
        'Research reports',
        'Consultant invoices'
      ],
      status: 'qualified',
      nextSteps: [
        'Gather supporting documentation',
        'Complete Form 6765',
        'File with tax return',
        'Maintain records for audit'
      ]
    };

    res.json({
      success: true,
      data: rdCreditAnalysis
    });
  })
);

// Get tax calendar
router.get('/calendar',
  authenticate,
  asyncHandler(async (_req: any, res: any) => {
    const currentYear = new Date().getFullYear();
    
    const taxCalendar = [
      {
        date: `${currentYear}-01-31`,
        deadline: 'W-2 and 1099 Forms Due',
        description: 'Send W-2 forms to employees and 1099 forms to contractors',
        status: 'upcoming',
        priority: 'high'
      },
      {
        date: `${currentYear}-03-15`,
        deadline: 'Corporate Tax Returns Due',
        description: 'File Form 1120 for C-Corporations',
        status: 'upcoming',
        priority: 'high'
      },
      {
        date: `${currentYear}-04-15`,
        deadline: 'Individual Tax Returns Due',
        description: 'File personal tax returns (Form 1040)',
        status: 'upcoming',
        priority: 'high'
      },
      {
        date: `${currentYear}-06-15`,
        deadline: 'Quarterly Estimated Taxes Due',
        description: 'Pay estimated taxes for Q2',
        status: 'upcoming',
        priority: 'medium'
      },
      {
        date: `${currentYear}-09-15`,
        deadline: 'Quarterly Estimated Taxes Due',
        description: 'Pay estimated taxes for Q3',
        status: 'upcoming',
        priority: 'medium'
      },
      {
        date: `${currentYear}-12-15`,
        deadline: 'Quarterly Estimated Taxes Due',
        description: 'Pay estimated taxes for Q4',
        status: 'upcoming',
        priority: 'medium'
      }
    ];

    res.json({
      success: true,
      data: taxCalendar
    });
  })
);

// Calculate estimated taxes
router.post('/calculate',
  authenticate,
  [
    body('taxYear').isInt({ min: 2020, max: new Date().getFullYear() }),
    body('grossIncome').isFloat({ min: 0 }),
    body('businessExpenses').optional().isFloat({ min: 0 }),
    body('deductions').optional().isFloat({ min: 0 }),
    body('credits').optional().isFloat({ min: 0 }),
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const { taxYear, grossIncome, businessExpenses = 0, deductions = 0, credits = 0 } = req.body;
    // const _userId = req.user!.id;

    try {
      // Simplified tax calculation (in real implementation, this would be more complex)
      const taxableIncome = Math.max(0, grossIncome - businessExpenses - deductions);
      const estimatedTax = taxableIncome * 0.25; // Simplified 25% rate
      const finalTax = Math.max(0, estimatedTax - credits);

      const calculation = {
        taxYear,
        grossIncome,
        businessExpenses,
        deductions,
        credits,
        taxableIncome,
        estimatedTax,
        finalTax,
        refundOrOwed: credits > estimatedTax ? credits - estimatedTax : finalTax,
        effectiveTaxRate: grossIncome > 0 ? (finalTax / grossIncome) * 100 : 0,
        calculationDate: new Date().toISOString(),
        notes: 'This is an estimate. Actual tax liability may vary based on specific circumstances.'
      };

      res.json({
        success: true,
        data: calculation
      });

    } catch (error) {
      logger.error('Tax calculation error:', error);
      throw new CustomError('Failed to calculate estimated taxes', 500);
    }
  })
);

export default router;
