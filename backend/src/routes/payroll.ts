import { Router } from 'express';
import { body, query } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { asyncHandler, CustomError } from '../middleware/errorHandler';
// // import { prisma } from '../index'; // Commented out - not used in mock implementation // Commented out - not used in mock implementation
import { sendEmail } from '../services/emailService';
import { logger } from '../utils/logger';

const router = Router();

// Employee interface
interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
  salary?: number;
  hourlyRate?: number;
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACTOR';
  payFrequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
  isActive: boolean;
  benefits?: {
    healthInsurance: boolean;
    dentalInsurance: boolean;
    visionInsurance: boolean;
    retirement401k: boolean;
    paidTimeOff: number;
  };
  taxInfo?: {
    federalTaxExemptions: number;
    stateTaxExemptions: number;
    additionalWithholding: number;
  };
  directDeposit?: {
    bankName: string;
    accountNumber: string;
    routingNumber: string;
  };
  createdAt: string;
}

// Add a new employee
router.post('/employees',
  authenticate,
  [
    body('firstName').isString().notEmpty(),
    body('lastName').isString().notEmpty(),
    body('email').isEmail(),
    body('phone').optional().isString(),
    body('position').isString().notEmpty(),
    body('department').isString().notEmpty(),
    body('salary').optional().isFloat({ min: 0 }),
    body('hourlyRate').optional().isFloat({ min: 0 }),
    body('employmentType').isIn(['FULL_TIME', 'PART_TIME', 'CONTRACTOR']),
    body('payFrequency').isIn(['WEEKLY', 'BIWEEKLY', 'MONTHLY']),
    body('benefits').optional().isObject(),
    body('taxInfo').optional().isObject(),
    body('directDeposit').optional().isObject(),
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const {
      firstName,
      lastName,
      email,
      phone,
      position,
      department,
      salary,
      hourlyRate,
      employmentType,
      payFrequency,
      benefits,
      taxInfo,
      directDeposit
    } = req.body;
    
    // const _organizationId = req.user!.organizationId; // Unused
    // const _userId = req.user!.id; // Unused

    try {
      // In a real implementation, this would create an employee record in the database
      const employeeId = `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const employee: Employee = {
        id: employeeId,
        firstName,
        lastName,
        email,
        phone,
        position,
        department,
        salary,
        hourlyRate,
        employmentType,
        payFrequency,
        isActive: true,
        benefits: benefits || {
          healthInsurance: false,
          dentalInsurance: false,
          visionInsurance: false,
          retirement401k: false,
          paidTimeOff: 0
        },
        taxInfo: taxInfo || {
          federalTaxExemptions: 1,
          stateTaxExemptions: 1,
          additionalWithholding: 0
        },
        directDeposit: directDeposit || {
          bankName: '',
          accountNumber: '',
          routingNumber: ''
        },
        createdAt: new Date().toISOString()
      };

      // Send welcome email to new employee
      await sendEmail({
        to: email,
        subject: 'Welcome to VeriGrade Payroll System',
        template: 'employeeWelcome',
        data: {
          firstName,
          lastName,
          position,
          company: req.user!.organizationName || 'VeriGrade',
          payrollPortalUrl: `${process.env['FRONTEND_URL']}/payroll`
        }
      });

      logger.info(`New employee ${employeeId} added to organization org_1`);
      res.status(201).json({ success: true, data: employee });
    } catch (error) {
      logger.error('Error adding employee:', error);
      throw new CustomError('Failed to add employee', 500);
    }
  })
);

// Get all employees for an organization
router.get('/employees',
  authenticate,
  asyncHandler(async (req: any, res: any) => {
    // const _organizationId = req.user!.organizationId; // Unused

    // Mock employee data
    const employees: Employee[] = [
      {
        id: 'emp_1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@company.com',
        phone: '+1-555-0123',
        position: 'Software Engineer',
        department: 'Engineering',
        salary: 75000,
        employmentType: 'FULL_TIME',
        payFrequency: 'BIWEEKLY',
        isActive: true,
        benefits: {
          healthInsurance: true,
          dentalInsurance: true,
          visionInsurance: false,
          retirement401k: true,
          paidTimeOff: 15
        },
        taxInfo: {
          federalTaxExemptions: 2,
          stateTaxExemptions: 1,
          additionalWithholding: 0
        },
        directDeposit: {
          bankName: 'Chase Bank',
          accountNumber: '****1234',
          routingNumber: '021000021'
        },
        createdAt: '2023-01-15T00:00:00.000Z'
      },
      {
        id: 'emp_2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@company.com',
        phone: '+1-555-0124',
        position: 'Marketing Manager',
        department: 'Marketing',
        salary: 65000,
        employmentType: 'FULL_TIME',
        payFrequency: 'BIWEEKLY',
        isActive: true,
        benefits: {
          healthInsurance: true,
          dentalInsurance: true,
          visionInsurance: true,
          retirement401k: true,
          paidTimeOff: 20
        },
        taxInfo: {
          federalTaxExemptions: 1,
          stateTaxExemptions: 1,
          additionalWithholding: 50
        },
        directDeposit: {
          bankName: 'Wells Fargo',
          accountNumber: '****5678',
          routingNumber: '121000248'
        },
        createdAt: '2023-02-01T00:00:00.000Z'
      },
      {
        id: 'emp_3',
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@company.com',
        position: 'Contractor',
        department: 'Consulting',
        hourlyRate: 75,
        employmentType: 'CONTRACTOR',
        payFrequency: 'WEEKLY',
        isActive: true,
        benefits: {
          healthInsurance: false,
          dentalInsurance: false,
          visionInsurance: false,
          retirement401k: false,
          paidTimeOff: 0
        },
        taxInfo: {
          federalTaxExemptions: 1,
          stateTaxExemptions: 1,
          additionalWithholding: 0
        },
        directDeposit: {
          bankName: 'Bank of America',
          accountNumber: '****9012',
          routingNumber: '026009593'
        },
        createdAt: '2023-03-10T00:00:00.000Z'
      }
    ];

    res.status(200).json({ success: true, data: employees });
  })
);

// Run payroll for a specific period
router.post('/run',
  authenticate,
  [
    body('payPeriodStart').isISO8601().toDate(),
    body('payPeriodEnd').isISO8601().toDate(),
    body('payDate').isISO8601().toDate(),
    body('employeeIds').optional().isArray(),
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const { payPeriodStart, payPeriodEnd, payDate, employeeIds } = req.body;
    // const _organizationId = req.user!.organizationId; // Unused

    try {
      // Mock payroll run
      const payrollRunId = `payroll_${Date.now()}`;
      const totalGrossPay = 15000;
      const totalTaxes = 3000;
      const totalNetPay = 12000;

      // Process each employee
      const payrollResults: any[] = [];
      for (const _employeeId of employeeIds || ['emp_1', 'emp_2', 'emp_3']) {
        const grossPay = Math.random() * 3000 + 2000; // Random pay between 2000-5000
        const taxes = grossPay * 0.2; // 20% tax
        const netPay = grossPay - taxes;

        payrollResults.push({
          employeeId: _employeeId,
          grossPay,
          taxes,
          netPay,
          payPeriodStart,
          payPeriodEnd,
          payDate
        });

        // Send paystub email
        await sendEmail({
          to: 'employee@company.com', // In real app, get from employee record
          subject: `Your Paystub is Ready - ${payPeriodStart.toLocaleDateString()}`,
          template: 'payrollNotification',
          data: {
            firstName: 'Employee',
            payPeriod: `${payPeriodStart.toLocaleDateString()} - ${payPeriodEnd.toLocaleDateString()}`,
            payDate: payDate.toLocaleDateString(),
            netPay: netPay.toFixed(2),
            payrollPortalUrl: `${process.env['FRONTEND_URL']}/payroll`
          }
        });
      }

      logger.info(`Payroll run ${payrollRunId} completed for organization org_1`);
      res.status(201).json({ 
        success: true, 
        data: { 
          payrollRunId, 
          totalGrossPay, 
          totalTaxes, 
          totalNetPay, 
          employeeResults: payrollResults 
        } 
      });
    } catch (error) {
      logger.error('Error running payroll:', error);
      throw new CustomError('Failed to run payroll', 500);
    }
  })
);

// Get payroll history
router.get('/history',
  authenticate,
  asyncHandler(async (req: any, res: any) => {
    // const _organizationId = req.user!.organizationId; // Unused

    // Mock payroll history
    const history = [
      {
        id: 'payroll_1',
        payPeriodStart: '2023-09-01',
        payPeriodEnd: '2023-09-15',
        payDate: '2023-09-16',
        totalGrossPay: 15000,
        totalTaxes: 3000,
        totalNetPay: 12000,
        employeeCount: 3,
        status: 'COMPLETED'
      },
      {
        id: 'payroll_2',
        payPeriodStart: '2023-08-16',
        payPeriodEnd: '2023-08-31',
        payDate: '2023-09-01',
        totalGrossPay: 15000,
        totalTaxes: 3000,
        totalNetPay: 12000,
        employeeCount: 3,
        status: 'COMPLETED'
      }
    ];

    res.status(200).json({ success: true, data: history });
  })
);

// Get payroll reports
router.get('/reports',
  authenticate,
  [
    query('reportType').optional().isString(),
    query('year').optional().isInt({ min: 2020, max: 2030 }),
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    // const _organizationId = req.user!.organizationId; // Unused
    const { reportType: _reportType = 'summary', year: _year = new Date().getFullYear() } = req.query;

    // Mock payroll reports
    const reports = {
      summary: {
        totalEmployees: 3,
        totalGrossPay: 45000,
        totalTaxes: 9000,
        totalNetPay: 36000,
        averagePay: 15000
      },
      byEmployee: [
        { employeeId: 'emp_1', name: 'John Doe', grossPay: 15000, netPay: 12000 },
        { employeeId: 'emp_2', name: 'Jane Smith', grossPay: 15000, netPay: 12000 },
        { employeeId: 'emp_3', name: 'Mike Johnson', grossPay: 15000, netPay: 12000 }
      ],
      taxBreakdown: {
        federalTax: 4500,
        stateTax: 2250,
        socialSecurity: 2250,
        medicare: 562.50
      }
    };

    res.status(200).json({ success: true, data: reports });
  })
);

export default router;
