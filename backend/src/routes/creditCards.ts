import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { asyncHandler, CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { sendEmail } from '../services/emailService';

const router = Router();

// Credit Card Management
interface CreditCard {
  id: string;
  cardNumber: string; // Masked
  cardHolderName: string;
  expiryDate: string;
  cardType: 'VISA' | 'MASTERCARD' | 'AMEX' | 'DISCOVER';
  creditLimit: number;
  availableCredit: number;
  currentBalance: number;
  minimumPayment: number;
  dueDate: string;
  cashbackRate: number;
  annualFee: number;
  status: 'ACTIVE' | 'SUSPENDED' | 'CLOSED' | 'PENDING';
  isPrimary: boolean;
  employeeId?: string; // If assigned to employee
  createdAt: string;
  updatedAt: string;
}

interface CreditCardTransaction {
  id: string;
  cardId: string;
  merchant: string;
  amount: number;
  category: string;
  subcategory: string;
  date: string;
  description: string;
  location?: {
    city: string;
    state: string;
    country: string;
  };
  cashbackEarned: number;
  status: 'PENDING' | 'POSTED' | 'DISPUTED' | 'REFUNDED';
  receiptUrl?: string;
  isBusinessExpense: boolean;
  employeeId?: string;
}

// Apply for business credit card
router.post('/apply',
  authenticate,
  [
    body('businessName').isString().trim().isLength({ min: 1, max: 100 }),
    body('businessType').isString().trim().isLength({ min: 1, max: 50 }),
    body('annualRevenue').isFloat({ min: 0 }),
    body('yearsInBusiness').isInt({ min: 0, max: 50 }),
    body('numberOfEmployees').isInt({ min: 1, max: 10000 }),
    body('requestedCreditLimit').isFloat({ min: 1000, max: 1000000 }),
    body('primaryContact').isObject(),
    body('businessAddress').isObject(),
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const {
      businessName,
      businessType,
      annualRevenue,
      yearsInBusiness,
      numberOfEmployees,
      requestedCreditLimit,
      primaryContact,
      businessAddress,
      additionalCards = 1
    } = req.body;
    
    // const _organizationId = req.user!.organizationId; // Unused
    // const _userId = req.user!.id; // Unused

    try {
      const applicationId = `cc_app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Mock credit card application processing
      const application = {
        id: applicationId,
        organizationId: "org_1",
        businessName,
        businessType,
        annualRevenue,
        yearsInBusiness,
        numberOfEmployees,
        requestedCreditLimit,
        approvedCreditLimit: requestedCreditLimit * 0.8, // Mock approval at 80% of request
        primaryContact,
        businessAddress,
        additionalCards,
        status: 'PENDING',
        submittedAt: new Date().toISOString(),
        estimatedDecisionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      };

      logger.info('Credit card application submitted:', {
        applicationId,
        organizationId: "org_1",
        businessName,
        requestedCreditLimit,
      });

      // Send confirmation email
      await sendEmail({
        to: req.user!.email,
        subject: 'Business Credit Card Application Received - VeriGrade',
        template: 'creditCardApplication',
        data: {
          businessName,
          applicationId,
          requestedCreditLimit,
          estimatedDecisionDate: application.estimatedDecisionDate,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Credit card application submitted successfully',
        data: application
      });

    } catch (error) {
      logger.error('Credit card application error:', error);
      throw new CustomError('Failed to submit credit card application', 500);
    }
  })
);

// Get credit cards
router.get('/',
  authenticate,
  asyncHandler(async (req: any, res: any) => {
    // const _organizationId = req.user!.organizationId; // Unused

    // Mock credit card data
    const creditCards: CreditCard[] = [
      {
        id: 'cc_1',
        cardNumber: '**** **** **** 1234',
        cardHolderName: 'VeriGrade Inc.',
        expiryDate: '12/26',
        cardType: 'VISA',
        creditLimit: 50000.00,
        availableCredit: 32500.00,
        currentBalance: 17500.00,
        minimumPayment: 350.00,
        dueDate: '2024-02-15',
        cashbackRate: 2.0,
        annualFee: 0.00,
        status: 'ACTIVE',
        isPrimary: true,
        createdAt: '2023-06-01T00:00:00Z',
        updatedAt: '2023-06-01T00:00:00Z',
      },
      {
        id: 'cc_2',
        cardNumber: '**** **** **** 5678',
        cardHolderName: 'John Smith',
        expiryDate: '08/26',
        cardType: 'MASTERCARD',
        creditLimit: 25000.00,
        availableCredit: 18000.00,
        currentBalance: 7000.00,
        minimumPayment: 140.00,
        dueDate: '2024-02-20',
        cashbackRate: 1.5,
        annualFee: 95.00,
        status: 'ACTIVE',
        isPrimary: false,
        employeeId: 'emp_1',
        createdAt: '2023-08-15T00:00:00Z',
        updatedAt: '2023-08-15T00:00:00Z',
      }
    ];

    res.json({
      success: true,
      data: creditCards
    });
  })
);

// Get credit card transactions
router.get('/:cardId/transactions',
  authenticate,
  asyncHandler(async (req: any, res: any) => {
    const { cardId } = req.params;
    const { page = 1, limit = 50, startDate: _startDate, endDate: _endDate } = req.query;
    // const _organizationId = req.user!.organizationId; // Unused

    // Mock transaction data
    const transactions: CreditCardTransaction[] = [
      {
        id: 'txn_1',
        cardId,
        merchant: 'Amazon Business',
        amount: 245.67,
        category: 'Office Supplies',
        subcategory: 'Technology',
        date: '2024-01-15T10:30:00Z',
        description: 'Laptop accessories and software licenses',
        location: {
          city: 'Seattle',
          state: 'WA',
          country: 'USA'
        },
        cashbackEarned: 4.91,
        status: 'POSTED',
        receiptUrl: 'https://receipts.verigrade.com/txn_1.pdf',
        isBusinessExpense: true,
        employeeId: 'emp_1',
      },
      {
        id: 'txn_2',
        cardId,
        merchant: 'Starbucks',
        amount: 12.45,
        category: 'Meals & Entertainment',
        subcategory: 'Business Meals',
        date: '2024-01-14T14:15:00Z',
        description: 'Client meeting coffee',
        location: {
          city: 'San Francisco',
          state: 'CA',
          country: 'USA'
        },
        cashbackEarned: 0.25,
        status: 'POSTED',
        isBusinessExpense: true,
        employeeId: 'emp_2',
      },
      {
        id: 'txn_3',
        cardId,
        merchant: 'Uber',
        amount: 28.50,
        category: 'Transportation',
        subcategory: 'Business Travel',
        date: '2024-01-13T09:20:00Z',
        description: 'Airport to office',
        location: {
          city: 'San Francisco',
          state: 'CA',
          country: 'USA'
        },
        cashbackEarned: 0.57,
        status: 'POSTED',
        isBusinessExpense: true,
        employeeId: 'emp_1',
      }
    ];

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: transactions.length,
          pages: Math.ceil(transactions.length / limit)
        }
      }
    });
  })
);

// Get cashback summary
router.get('/cashback/summary',
  authenticate,
  asyncHandler(async (req: any, res: any) => {
    // const _organizationId = req.user!.organizationId; // Unused
    const { year: _year = new Date().getFullYear(), month: _month } = req.query;

    // Mock cashback data
    const cashbackSummary = {
      currentMonth: {
        totalEarned: 125.50,
        totalSpent: 6275.00,
        effectiveRate: 2.0,
        transactions: 45,
      },
      yearToDate: {
        totalEarned: 1250.75,
        totalSpent: 62537.50,
        effectiveRate: 2.0,
        transactions: 425,
      },
      byCategory: [
        {
          category: 'Office Supplies',
          spent: 2450.00,
          earned: 49.00,
          rate: 2.0,
        },
        {
          category: 'Travel',
          spent: 1800.00,
          earned: 36.00,
          rate: 2.0,
        },
        {
          category: 'Meals & Entertainment',
          spent: 1200.00,
          earned: 24.00,
          rate: 2.0,
        },
        {
          category: 'Technology',
          spent: 825.50,
          earned: 16.51,
          rate: 2.0,
        }
      ],
      redemptionHistory: [
        {
          date: '2024-01-01',
          amount: 500.00,
          method: 'STATEMENT_CREDIT',
          status: 'COMPLETED',
        },
        {
          date: '2023-12-01',
          amount: 250.00,
          method: 'DIRECT_DEPOSIT',
          status: 'COMPLETED',
        }
      ]
    };

    res.json({
      success: true,
      data: cashbackSummary
    });
  })
);

// Request credit limit increase
router.post('/:cardId/limit-increase',
  authenticate,
  [
    body('requestedLimit').isFloat({ min: 1000 }),
    body('reason').isString().trim().isLength({ min: 10, max: 500 }),
    body('annualRevenue').isFloat({ min: 0 }),
    body('businessGrowth').isString().trim().isLength({ min: 10, max: 500 }),
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const { cardId } = req.params;
    const { requestedLimit, reason, annualRevenue, businessGrowth } = req.body;
    // const _organizationId = req.user!.organizationId; // Unused

    try {
      const requestId = `limit_req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const limitRequest = {
        id: requestId,
        cardId,
        organizationId: "org_1",
        currentLimit: 50000.00,
        requestedLimit,
        approvedLimit: requestedLimit * 0.9, // Mock approval at 90% of request
        reason,
        annualRevenue,
        businessGrowth,
        status: 'PENDING',
        submittedAt: new Date().toISOString(),
        estimatedDecisionDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days
      };

      logger.info('Credit limit increase requested:', {
        requestId,
        cardId,
        organizationId: "org_1",
        currentLimit: limitRequest.currentLimit,
        requestedLimit,
      });

      await sendEmail({
        to: req.user!.email,
        subject: 'Credit Limit Increase Request Received - VeriGrade',
        template: 'creditLimitIncrease',
        data: {
          cardNumber: '****1234',
          currentLimit: limitRequest.currentLimit,
          requestedLimit,
          estimatedDecisionDate: limitRequest.estimatedDecisionDate,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Credit limit increase request submitted successfully',
        data: limitRequest
      });

    } catch (error) {
      logger.error('Credit limit increase request error:', error);
      throw new CustomError('Failed to submit credit limit increase request', 500);
    }
  })
);

// Get credit card analytics
router.get('/analytics',
  authenticate,
  asyncHandler(async (req: any, res: any) => {
    // const _organizationId = req.user!.organizationId; // Unused
    const { period: _period = '30d' } = req.query;

    // Mock analytics data
    const analytics = {
      spendingTrends: {
        totalSpent: 12500.00,
        averageTransaction: 125.00,
        transactionsCount: 100,
        topCategories: [
          { category: 'Office Supplies', amount: 3500.00, percentage: 28.0 },
          { category: 'Travel', amount: 2800.00, percentage: 22.4 },
          { category: 'Meals & Entertainment', amount: 2200.00, percentage: 17.6 },
          { category: 'Technology', amount: 1800.00, percentage: 14.4 },
          { category: 'Marketing', amount: 1200.00, percentage: 9.6 },
          { category: 'Other', amount: 1000.00, percentage: 8.0 },
        ]
      },
      utilizationRate: 35.0,
      paymentHistory: {
        onTimePayments: 12,
        totalPayments: 12,
        averagePaymentAmount: 2500.00,
        lastPaymentDate: '2024-01-15',
      },
      rewardsEarned: {
        currentMonth: 250.00,
        yearToDate: 1250.75,
        lifetime: 3500.25,
        pendingRedemption: 125.50,
      },
      spendingInsights: [
        {
          type: 'SPENDING_INCREASE',
          category: 'Office Supplies',
          change: '+25%',
          message: 'Office supplies spending increased 25% this month',
        },
        {
          type: 'CASHBACK_OPPORTUNITY',
          category: 'Travel',
          message: 'Consider using your business card for travel to earn 2% cashback',
        }
      ]
    };

    res.json({
      success: true,
      data: analytics
    });
  })
);

export default router;
