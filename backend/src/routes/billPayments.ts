import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { asyncHandler, CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { sendEmail } from '../services/emailService';

const router = Router();

// Bill Payment Management
interface Bill {
  id: string;
  vendor: string;
  vendorEmail: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  description: string;
  category: string;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'OVERDUE' | 'DISPUTED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  approvalWorkflow: {
    requiresApproval: boolean;
    approvers: string[];
    currentApprover?: string;
    approvedBy?: string;
    approvedAt?: string;
  };
  paymentMethod: 'ACH' | 'WIRE' | 'CHECK' | 'CREDIT_CARD';
  paymentDate?: string;
  paymentReference?: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

interface ExpenseReimbursement {
  id: string;
  employeeId: string;
  employeeName: string;
  expenseDate: string;
  amount: number;
  category: string;
  description: string;
  merchant: string;
  receiptUrl: string;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED';
  approvalWorkflow: {
    requiresApproval: boolean;
    approvers: string[];
    currentApprover?: string;
    approvedBy?: string;
    approvedAt?: string;
    rejectionReason?: string;
  };
  paymentMethod: 'ACH' | 'CHECK' | 'PAYPAL';
  paymentDate?: string;
  paymentReference?: string;
  createdAt: string;
  updatedAt: string;
}

// Create a new bill
router.post(
  '/bills',
  authenticate,
  [
    body('vendor').isString().notEmpty(),
    body('vendorEmail').isEmail(),
    body('invoiceNumber').isString().notEmpty(),
    body('invoiceDate').isISO8601().toDate(),
    body('dueDate').isISO8601().toDate(),
    body('amount').isFloat({ min: 0 }),
    body('description').isString().notEmpty(),
    body('category').isString().notEmpty(),
    body('priority').isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
    body('paymentMethod').isIn(['ACH', 'WIRE', 'CHECK', 'CREDIT_CARD']),
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const {
      vendor,
      vendorEmail,
      invoiceNumber,
      invoiceDate,
      dueDate,
      amount,
      description,
      category,
      priority,
      paymentMethod,
    } = req.body;
    const organizationId = req.user!.organizationId;
    // const _userId = req.user!.id; // Unused

    try {
      const approvers = ['manager@company.com', 'finance@company.com'];

      const bill: Bill = {
        id: `bill_${Date.now()}`,
        vendor,
        vendorEmail,
        invoiceNumber,
        invoiceDate: new Date(invoiceDate).toISOString(),
        dueDate: new Date(dueDate).toISOString(),
        amount,
        description,
        category,
        status: 'PENDING',
        priority,
        approvalWorkflow: {
          requiresApproval: true,
          approvers,
          currentApprover: approvers[0],
        },
        paymentMethod,
        attachments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Send approval request email
      await sendEmail({
        to: bill.approvalWorkflow.approvers[0] || 'manager@company.com',
        subject: `Bill Approval Required - ${vendor} - $${amount}`,
        template: 'billApprovalRequired',
        data: {
          vendor,
          amount,
          dueDate: new Date(dueDate).toLocaleDateString(),
          invoiceNumber,
          description,
          approvalUrl: `${process.env['FRONTEND_URL']}/bill-approvals/${bill.id}`,
        },
      });

      logger.info(`New bill ${bill.id} created for organization ${organizationId}`);
      res.status(201).json({ success: true, data: bill });
    } catch (error) {
      logger.error('Error creating bill:', error);
      throw new CustomError('Failed to create bill', 500);
    }
  })
);

// Get all bills for an organization
router.get(
  '/bills',
  authenticate,
  asyncHandler(async (req: any, res: any) => {
    // const _organizationId = req.user!.organizationId; // Unused

    // Mock bills data
    const bills: Bill[] = [
      {
        id: 'bill_1',
        vendor: 'Office Supplies Inc',
        vendorEmail: 'billing@officesupplies.com',
        invoiceNumber: 'INV-2023-001',
        invoiceDate: '2023-09-01T00:00:00Z',
        dueDate: '2023-10-01T00:00:00Z',
        amount: 245.50,
        description: 'Office supplies for Q4',
        category: 'Office Expenses',
        status: 'PENDING',
        priority: 'MEDIUM',
        approvalWorkflow: {
          requiresApproval: true,
          approvers: ['manager@company.com'],
          currentApprover: 'manager@company.com',
        },
        paymentMethod: 'ACH',
        attachments: ['invoice_001.pdf'],
        createdAt: '2023-09-01T00:00:00Z',
        updatedAt: '2023-09-01T00:00:00Z',
      },
    ];

    res.status(200).json({ success: true, data: bills });
  })
);

// Approve a bill
router.post(
  '/bills/:id/approve',
  authenticate,
  asyncHandler(async (req: any, res: any) => {
    const { id } = req.params;
    const organizationId = req.user!.organizationId;

    try {
      // In a real app, update bill status in database
      const approvedBill: Bill = {
        id,
        vendor: 'Office Supplies Inc',
        vendorEmail: 'billing@officesupplies.com',
        invoiceNumber: 'INV-2023-001',
        invoiceDate: '2023-09-01T00:00:00Z',
        dueDate: '2023-10-01T00:00:00Z',
        amount: 245.50,
        description: 'Office supplies for Q4',
        category: 'Office Expenses',
        status: 'APPROVED',
        priority: 'MEDIUM',
        approvalWorkflow: {
          requiresApproval: true,
          approvers: ['manager@company.com'],
          approvedBy: 'manager@company.com',
          approvedAt: new Date().toISOString(),
        },
        paymentMethod: 'ACH',
        attachments: ['invoice_001.pdf'],
        createdAt: '2023-09-01T00:00:00Z',
        updatedAt: new Date().toISOString(),
      };

      // Send notification email
      await sendEmail({
        to: process.env['FINANCE_EMAIL'] || 'finance@verigrade.com',
        subject: `Bill Approved - ${approvedBill.vendor}`,
        template: 'billApprovalNotification',
        data: {
          vendor: approvedBill.vendor,
          amount: approvedBill.amount,
          approvedBy: req.user!.firstName + ' ' + req.user!.lastName,
          paymentUrl: `${process.env['FRONTEND_URL']}/payments/${id}`,
        },
      });

      logger.info(`Bill ${id} approved for organization ${organizationId}`);
      res.status(200).json({ success: true, data: approvedBill });
    } catch (error) {
      logger.error('Error approving bill:', error);
      throw new CustomError('Failed to approve bill', 500);
    }
  })
);

// Create an expense reimbursement request
router.post(
  '/reimbursements',
  authenticate,
  [
    body('employeeId').isString().notEmpty(),
    body('employeeName').isString().notEmpty(),
    body('expenseDate').isISO8601().toDate(),
    body('amount').isFloat({ min: 0 }),
    body('category').isString().notEmpty(),
    body('description').isString().notEmpty(),
    body('merchant').isString().notEmpty(),
    body('receiptUrl').isString().notEmpty(),
    body('paymentMethod').isIn(['ACH', 'CHECK', 'PAYPAL']),
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const {
      employeeId,
      employeeName,
      expenseDate,
      amount,
      category,
      description,
      merchant,
      receiptUrl,
      paymentMethod,
    } = req.body;
    const organizationId = req.user!.organizationId;
    // const _userId = req.user!.id; // Unused

    try {
      const approvers = ['manager@company.com', 'hr@company.com'];

      const reimbursement: ExpenseReimbursement = {
        id: `reimb_${Date.now()}`,
        employeeId,
        employeeName,
        expenseDate: new Date(expenseDate).toISOString(),
        amount,
        category,
        description,
        merchant,
        receiptUrl,
        status: 'PENDING',
        approvalWorkflow: {
          requiresApproval: true,
          approvers,
          currentApprover: approvers[0],
        },
        paymentMethod,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Send approval request email
      await sendEmail({
        to: reimbursement.approvalWorkflow.approvers[0] || 'manager@company.com',
        subject: `Reimbursement Approval Required - ${employeeName} - $${amount}`,
        template: 'reimbursementApprovalRequired',
        data: {
          employeeName,
          amount,
          expenseDate: new Date(expenseDate).toLocaleDateString(),
          merchant,
          description,
          approvalUrl: `${process.env['FRONTEND_URL']}/reimbursement-approvals/${reimbursement.id}`,
        },
      });

      logger.info(`New reimbursement ${reimbursement.id} created for organization ${organizationId}`);
      res.status(201).json({ success: true, data: reimbursement });
    } catch (error) {
      logger.error('Error creating reimbursement:', error);
      throw new CustomError('Failed to create reimbursement', 500);
    }
  })
);

// Get all reimbursements for an organization
router.get(
  '/reimbursements',
  authenticate,
  asyncHandler(async (req: any, res: any) => {
    // const _organizationId = req.user!.organizationId; // Unused

    // Mock reimbursements data
    const reimbursements: ExpenseReimbursement[] = [
      {
        id: 'reimb_1',
        employeeId: 'emp_1',
        employeeName: 'John Doe',
        expenseDate: '2023-09-15T00:00:00Z',
        amount: 125.75,
        category: 'Travel',
        description: 'Business trip to client site',
        merchant: 'Hilton Hotel',
        receiptUrl: 'receipt_001.jpg',
        status: 'PENDING',
        approvalWorkflow: {
          requiresApproval: true,
          approvers: ['manager@company.com'],
          currentApprover: 'manager@company.com',
        },
        paymentMethod: 'ACH',
        createdAt: '2023-09-15T00:00:00Z',
        updatedAt: '2023-09-15T00:00:00Z',
      },
    ];

    res.status(200).json({ success: true, data: reimbursements });
  })
);

// Approve a reimbursement
router.post(
  '/reimbursements/:id/approve',
  authenticate,
  asyncHandler(async (req: any, res: any) => {
    const { id } = req.params;
    const organizationId = req.user!.organizationId;

    try {
      // In a real app, update reimbursement status in database
      const approvedReimbursement: ExpenseReimbursement = {
        id,
        employeeId: 'emp_1',
        employeeName: 'John Doe',
        expenseDate: '2023-09-15T00:00:00Z',
        amount: 125.75,
        category: 'Travel',
        description: 'Business trip to client site',
        merchant: 'Hilton Hotel',
        receiptUrl: 'receipt_001.jpg',
        status: 'APPROVED',
        approvalWorkflow: {
          requiresApproval: true,
          approvers: ['manager@company.com'],
          approvedBy: 'manager@company.com',
          approvedAt: new Date().toISOString(),
        },
        paymentMethod: 'ACH',
        createdAt: '2023-09-15T00:00:00Z',
        updatedAt: new Date().toISOString(),
      };

      // Send notification email to employee
      await sendEmail({
        to: 'john.doe@company.com',
        subject: 'Reimbursement Approved',
        template: 'billApprovalNotification',
        data: {
          employeeName: approvedReimbursement.employeeName,
          amount: approvedReimbursement.amount,
          approvedBy: req.user!.firstName + ' ' + req.user!.lastName,
          paymentUrl: `${process.env['FRONTEND_URL']}/payments/${id}`,
        },
      });

      logger.info(`Reimbursement ${id} approved for organization ${organizationId}`);
      res.status(200).json({ success: true, data: approvedReimbursement });
    } catch (error) {
      logger.error('Error approving reimbursement:', error);
      throw new CustomError('Failed to approve reimbursement', 500);
    }
  })
);

// Get payment history
router.get(
  '/payments',
  authenticate,
  asyncHandler(async (req: any, res: any) => {
    // const _organizationId = req.user!.organizationId; // Unused

    // Mock payment history
    const payments = [
      {
        id: 'payment_1',
        type: 'BILL',
        vendor: 'Office Supplies Inc',
        amount: 245.50,
        paymentMethod: 'ACH',
        paymentDate: '2023-09-15T00:00:00Z',
        status: 'COMPLETED',
        reference: 'ACH-001',
      },
      {
        id: 'payment_2',
        type: 'REIMBURSEMENT',
        employee: 'John Doe',
        amount: 125.75,
        paymentMethod: 'ACH',
        paymentDate: '2023-09-20T00:00:00Z',
        status: 'COMPLETED',
        reference: 'ACH-002',
      },
    ];

    res.status(200).json({ success: true, data: payments });
  })
);

export default router;
