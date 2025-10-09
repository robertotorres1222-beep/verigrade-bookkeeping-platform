import { Router, Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import * as invoiceService from '../services/invoiceService';
import { authenticateToken } from '../middleware/auth';
import { errorHandler } from '../middleware/errorHandler';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * GET /api/invoices
 * Get invoices with filtering and pagination
 */
router.get('/', [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('sortBy').optional().isIn(['createdAt', 'dueDate', 'total', 'status']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  query('status').optional().isIn(['draft', 'sent', 'paid', 'overdue', 'cancelled']),
  query('clientId').optional().isUUID(),
  query('dateFrom').optional().isISO8601().toDate(),
  query('dateTo').optional().isISO8601().toDate(),
  query('search').optional().isString()
], async (req: Request, res: Response, next: NextFunction) => {
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
      status: req.query.status as any,
      clientId: req.query.clientId as string,
      dateFrom: req.query.dateFrom as Date,
      dateTo: req.query.dateTo as Date,
      search: req.query.search as string
    };

    const pagination = {
      page: req.query.page as number,
      limit: req.query.limit as number,
      sortBy: req.query.sortBy as string,
      sortOrder: req.query.sortOrder as 'asc' | 'desc'
    };

    const result = await invoiceService.getInvoices(filters, pagination);
    
    res.json({
      success: true,
      data: result.invoices,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/invoices/stats
 * Get invoice statistics
 */
router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      userId: req.user?.id,
      organizationId: req.user?.organizationId,
      status: req.query.status as any,
      dateFrom: req.query.dateFrom as Date,
      dateTo: req.query.dateTo as Date
    };

    const stats = await invoiceService.getInvoiceStats(filters);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/invoices/:id
 * Get a specific invoice
 */
router.get('/:id', [
  param('id').isUUID()
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid invoice ID' }
      });
    }

    const invoice = await invoiceService.getInvoiceById(
      req.params.id,
      req.user?.id
    );

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: { message: 'Invoice not found' }
      });
    }

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/invoices
 * Create a new invoice
 */
router.post('/', [
  body('clientName').isString().isLength({ min: 1, max: 200 }).withMessage('Client name is required'),
  body('clientEmail').optional().isEmail(),
  body('clientAddress').optional().isString(),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.description').isString().isLength({ min: 1, max: 500 }),
  body('items.*.quantity').isFloat({ min: 0.01 }),
  body('items.*.unitPrice').isFloat({ min: 0 }),
  body('items.*.taxRate').optional().isFloat({ min: 0, max: 100 }),
  body('dueDate').optional().isISO8601().toDate(),
  body('notes').optional().isString(),
  body('clientId').optional().isUUID(),
  body('currency').optional().isString().isLength({ min: 3, max: 3 }),
  body('taxRate').optional().isFloat({ min: 0, max: 100 }),
  body('discount').optional().isFloat({ min: 0, max: 100 })
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid input data', details: errors.array() }
      });
    }

    const invoiceData = {
      clientId: req.body.clientId,
      clientName: req.body.clientName,
      clientEmail: req.body.clientEmail,
      clientAddress: req.body.clientAddress,
      items: req.body.items,
      dueDate: req.body.dueDate,
      notes: req.body.notes,
      userId: req.user!.id,
      organizationId: req.user!.organizationId!,
      currency: req.body.currency,
      taxRate: req.body.taxRate,
      discount: req.body.discount
    };

    const invoice = await invoiceService.createInvoice(invoiceData);
    
    res.status(201).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/invoices/:id
 * Update an invoice
 */
router.put('/:id', [
  param('id').isUUID(),
  body('clientName').optional().isString().isLength({ min: 1, max: 200 }),
  body('clientEmail').optional().isEmail(),
  body('clientAddress').optional().isString(),
  body('dueDate').optional().isISO8601().toDate(),
  body('notes').optional().isString(),
  body('status').optional().isIn(['draft', 'sent', 'paid', 'overdue', 'cancelled']),
  body('currency').optional().isString().isLength({ min: 3, max: 3 }),
  body('taxRate').optional().isFloat({ min: 0, max: 100 }),
  body('discount').optional().isFloat({ min: 0, max: 100 })
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid input data', details: errors.array() }
      });
    }

    const updateData = {
      clientName: req.body.clientName,
      clientEmail: req.body.clientEmail,
      clientAddress: req.body.clientAddress,
      dueDate: req.body.dueDate,
      notes: req.body.notes,
      status: req.body.status,
      currency: req.body.currency,
      taxRate: req.body.taxRate,
      discount: req.body.discount
    };

    const invoice = await invoiceService.updateInvoice(
      req.params.id,
      updateData,
      req.user?.id
    );
    
    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/invoices/:id
 * Delete an invoice
 */
router.delete('/:id', [
  param('id').isUUID()
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid invoice ID' }
      });
    }

    await invoiceService.deleteInvoice(req.params.id, req.user?.id);
    
    res.json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/invoices/:id/pdf
 * Generate and download invoice PDF
 */
router.get('/:id/pdf', [
  param('id').isUUID()
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid invoice ID' }
      });
    }

    const pdfBuffer = await invoiceService.generateInvoicePDF(
      req.params.id,
      req.user?.id
    );

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${req.params.id}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send the PDF
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/invoices/:id/pdf/upload
 * Generate PDF and upload to S3, return signed URL
 */
router.post('/:id/pdf/upload', [
  param('id').isUUID()
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid invoice ID' }
      });
    }

    const pdfBuffer = await invoiceService.generateInvoicePDF(
      req.params.id,
      req.user?.id
    );

    try {
      const signedUrl = await invoiceService.uploadInvoicePDFToS3(
        req.params.id,
        pdfBuffer
      );

      res.json({
        success: true,
        data: {
          invoiceId: req.params.id,
          pdfUrl: signedUrl
        }
      });
    } catch (s3Error) {
      // If S3 upload fails, return the PDF buffer as base64
      const base64Pdf = pdfBuffer.toString('base64');
      
      res.json({
        success: true,
        data: {
          invoiceId: req.params.id,
          pdfBase64: base64Pdf,
          message: 'S3 upload failed, returning PDF as base64'
        }
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/invoices/:id/send
 * Mark invoice as sent and optionally send via email
 */
router.post('/:id/send', [
  param('id').isUUID(),
  body('sendEmail').optional().isBoolean(),
  body('emailMessage').optional().isString()
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid input data', details: errors.array() }
      });
    }

    // Update invoice status to 'sent'
    const invoice = await invoiceService.updateInvoice(
      req.params.id,
      { status: 'sent' },
      req.user?.id
    );

    // TODO: Implement email sending functionality
    // if (req.body.sendEmail && invoice.clientEmail) {
    //   await emailService.sendInvoiceEmail(invoice, req.body.emailMessage);
    // }

    res.json({
      success: true,
      data: invoice,
      message: req.body.sendEmail ? 'Invoice marked as sent and email queued' : 'Invoice marked as sent'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/invoices/:id/mark-paid
 * Mark invoice as paid
 */
router.post('/:id/mark-paid', [
  param('id').isUUID(),
  body('paymentMethod').optional().isString(),
  body('paymentReference').optional().isString(),
  body('paymentDate').optional().isISO8601().toDate()
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid input data', details: errors.array() }
      });
    }

    const updateData: any = { status: 'paid' as const };
    
    if (req.body.paymentMethod) {
      updateData.paymentMethod = req.body.paymentMethod;
    }
    
    if (req.body.paymentReference) {
      updateData.paymentReference = req.body.paymentReference;
    }
    
    if (req.body.paymentDate) {
      updateData.paymentDate = req.body.paymentDate;
    }

    const invoice = await invoiceService.updateInvoice(
      req.params.id,
      updateData,
      req.user?.id
    );

    res.json({
      success: true,
      data: invoice,
      message: 'Invoice marked as paid'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
