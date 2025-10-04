import { Request, Response } from 'express';
import { prisma } from '../index';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { uploadFile, deleteFile } from '../services/fileService';
import { categorizeExpense } from '../services/aiService';

interface CreateExpenseRequest extends Request {
  body: {
    amount: number;
    description: string;
    category?: string;
    subcategory?: string;
    date: string;
    vendor?: string;
    isReimbursable: boolean;
    isTaxDeductible: boolean;
    notes?: string;
  };
  file?: Express.Multer.File;
}

interface UpdateExpenseRequest extends Request {
  params: {
    id: string;
  };
  body: {
    amount?: number;
    description?: string;
    category?: string;
    subcategory?: string;
    date?: string;
    vendor?: string;
    isReimbursable?: boolean;
    isTaxDeductible?: boolean;
    notes?: string;
      status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
  };
  file?: Express.Multer.File;
}

// Create expense
export const createExpense = async (req: CreateExpenseRequest, res: Response): Promise<void> => {
  const {
    amount,
    description,
    category,
    subcategory,
    date,
    vendor,
    isReimbursable,
    isTaxDeductible,
    notes,
  } = req.body;
  const organizationId = req.user!.organizationId!;

  let receiptUrl: string | undefined;

  // Handle file upload if provided
  if (req.file) {
    try {
      receiptUrl = await uploadFile(req.file, 'expenses');
    } catch (error) {
      logger.error('Failed to upload receipt:', error);
      throw new CustomError('Failed to upload receipt', 500);
    }
  }

  // Use AI to categorize if no category provided
  let finalCategory = category;
  let finalSubcategory = subcategory;

  if (!category && process.env['ENABLE_AI_FEATURES'] === 'true') {
    try {
      const aiResult = await categorizeExpense(description, amount, vendor);
      if (aiResult.confidence > 0.7) {
        finalCategory = aiResult.category;
        finalSubcategory = aiResult.subcategory;
      }
    } catch (error) {
      logger.error('AI categorization failed:', error);
      // Continue without AI categorization
    }
  }

  const expense = await prisma.expense.create({
    data: {
      organizationId,
      userId: req.user!.id,
      amount,
      description,
      category: finalCategory || null,
      subcategory: finalSubcategory || null,
      date: new Date(date),
      receipt: receiptUrl || null,
      vendor: vendor || null,
      isReimbursable,
      isTaxDeductible,
      status: 'PENDING',
      metadata: {
        aiCategorized: !category && finalCategory,
        notes: notes || null,
      },
    },
  });

  logger.info(`Expense created: ${expense.id} by user ${req.user!.email}`);

  res.status(201).json({
    success: true,
    message: 'Expense created successfully',
    data: { expense },
  });
};

// Get expenses
export const getExpenses = async (req: Request, res: Response): Promise<void> => {
  const organizationId = req.user!.organizationId!;
  const {
    page = 1,
    limit = 20,
    status,
    category,
    dateFrom,
    dateTo,
    search,
    isReimbursable,
    isTaxDeductible,
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  // Build where clause
  const where: any = {
    organizationId,
  };

  if (status) {
    where.status = status;
  }

  if (category) {
    where.category = category;
  }

  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) where.date.gte = new Date(dateFrom as string);
    if (dateTo) where.date.lte = new Date(dateTo as string);
  }

  if (search) {
    where.OR = [
      { description: { contains: search as string } },
      { vendor: { contains: search as string } },
      { notes: { contains: search as string } },
    ];
  }

  if (isReimbursable !== undefined) {
    where.isReimbursable = isReimbursable === 'true';
  }

  if (isTaxDeductible !== undefined) {
    where.isTaxDeductible = isTaxDeductible === 'true';
  }

  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.expense.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      expenses,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    },
  });
};

// Get single expense
export const getExpense = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId!;

  const expense = await prisma.expense.findFirst({
    where: {
      id: id!,
      organizationId,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  if (!expense) {
    throw new CustomError('Expense not found', 404);
  }

  res.json({
    success: true,
    data: { expense },
  });
};

// Update expense
export const updateExpense = async (req: UpdateExpenseRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId!;
  const updateData = req.body;

  // Check if expense exists and belongs to organization
  const existingExpense = await prisma.expense.findFirst({
    where: {
      id: id!,
      organizationId,
    },
  });

  if (!existingExpense) {
    throw new CustomError('Expense not found', 404);
  }

  // Prevent updates to approved expenses (unless admin)
  if (existingExpense.status === 'APPROVED' && req.user!.role !== 'ADMIN') {
    throw new CustomError('Cannot update approved expense', 400);
  }

  // Handle new file upload if provided
  let receiptUrl = existingExpense.receipt;
  if (req.file) {
    try {
      // Delete old receipt if exists
      if (receiptUrl) {
        await deleteFile(receiptUrl);
      }
      
      // Upload new receipt
      receiptUrl = await uploadFile(req.file, 'expenses');
      (updateData as any).receipt = receiptUrl;
    } catch (error) {
      logger.error('Failed to update receipt:', error);
      throw new CustomError('Failed to update receipt', 500);
    }
  }

  const expense = await prisma.expense.update({
    where: { id: id! },
    data: {
      ...updateData,
      receipt: receiptUrl || null,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  logger.info(`Expense updated: ${expense.id} by user ${req.user!.email}`);

  res.json({
    success: true,
    message: 'Expense updated successfully',
    data: { expense },
  });
};

// Delete expense
export const deleteExpense = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId!;

  const expense = await prisma.expense.findFirst({
    where: {
      id: id!,
      organizationId,
    },
  });

  if (!expense) {
    throw new CustomError('Expense not found', 404);
  }

  // Prevent deletion of approved expenses (unless admin)
  if (expense.status === 'APPROVED' && req.user!.role !== 'ADMIN') {
    throw new CustomError('Cannot delete approved expense', 400);
  }

  // Delete receipt file if exists
  if (expense.receipt) {
    try {
      await deleteFile(expense.receipt);
    } catch (error) {
      logger.error('Failed to delete receipt file:', error);
      // Continue with expense deletion
    }
  }

  await prisma.expense.delete({
    where: { id: id! },
  });

  logger.info(`Expense deleted: ${expense.id} by user ${req.user!.email}`);

  res.json({
    success: true,
    message: 'Expense deleted successfully',
  });
};

// Approve expense
export const approveExpense = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId!;

  const expense = await prisma.expense.findFirst({
    where: {
      id: id!,
      organizationId,
    },
  });

  if (!expense) {
    throw new CustomError('Expense not found', 404);
  }

  if (expense.status !== 'PENDING') {
    throw new CustomError('Only pending expenses can be approved', 400);
  }

  const updatedExpense = await prisma.expense.update({
    where: { id: id! },
    data: {
      status: 'APPROVED',
      approvedBy: req.user!.id,
      approvedAt: new Date(),
    },
  });

  logger.info(`Expense approved: ${expense.id} by user ${req.user!.email}`);

  res.json({
    success: true,
    message: 'Expense approved successfully',
    data: { expense: updatedExpense },
  });
};

// Reject expense
export const rejectExpense = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId!;
  const { reason } = req.body;

  const expense = await prisma.expense.findFirst({
    where: {
      id: id!,
      organizationId,
    },
  });

  if (!expense) {
    throw new CustomError('Expense not found', 404);
  }

  if (expense.status !== 'PENDING') {
    throw new CustomError('Only pending expenses can be rejected', 400);
  }

  const updatedExpense = await prisma.expense.update({
    where: { id: id! },
    data: {
      status: 'REJECTED',
      approvedBy: req.user!.id,
      approvedAt: new Date(),
      metadata: {
        ...(expense.metadata as any),
        rejectionReason: reason,
      },
    },
  });

  logger.info(`Expense rejected: ${expense.id} by user ${req.user!.email}`);

  res.json({
    success: true,
    message: 'Expense rejected successfully',
    data: { expense: updatedExpense },
  });
};

// Get expense statistics
export const getExpenseStats = async (req: Request, res: Response): Promise<void> => {
  const organizationId = req.user!.organizationId!;
  const { dateFrom, dateTo } = req.query;

  const where: any = { organizationId };

  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) where.date.gte = new Date(dateFrom as string);
    if (dateTo) where.date.lte = new Date(dateTo as string);
  }

  const [
    totalExpenses,
    pendingExpenses,
    approvedExpenses,
    categoryStats,
    monthlyStats,
  ] = await Promise.all([
    // Total expenses
    prisma.expense.aggregate({
      where,
      _sum: { amount: true },
      _count: true,
    }),
    
    // Pending expenses
    prisma.expense.aggregate({
      where: { ...where, status: 'PENDING' },
      _sum: { amount: true },
      _count: true,
    }),
    
    // Approved expenses
    prisma.expense.aggregate({
      where: { ...where, status: 'APPROVED' },
      _sum: { amount: true },
      _count: true,
    }),
    
    // Category statistics
    prisma.expense.groupBy({
      by: ['category'],
      where,
      _sum: { amount: true },
      _count: true,
      orderBy: { _sum: { amount: 'desc' } },
      take: 10,
    }),
    
    // Monthly statistics (last 12 months)
    prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', date) as month,
        SUM(amount) as total,
        COUNT(*) as count
      FROM "expenses" 
      WHERE "organizationId" = ${organizationId}
        ${dateFrom ? `AND date >= ${new Date(dateFrom as string)}` : ''}
        ${dateTo ? `AND date <= ${new Date(dateTo as string)}` : ''}
      GROUP BY DATE_TRUNC('month', date)
      ORDER BY month DESC
      LIMIT 12
    `,
  ]);

  res.json({
    success: true,
    data: {
      total: {
        amount: totalExpenses._sum.amount || 0,
        count: totalExpenses._count,
      },
      pending: {
        amount: pendingExpenses._sum.amount || 0,
        count: pendingExpenses._count,
      },
      approved: {
        amount: approvedExpenses._sum.amount || 0,
        count: approvedExpenses._count,
      },
      categories: categoryStats,
      monthly: monthlyStats,
    },
  });
};
