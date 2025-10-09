import { prisma } from '../config/database';
import { categorizerQueue } from '../queue/categorizerWorker';
import { CategorizationRequest } from './aiCategorizerService';

export interface CreateTransactionData {
  amount: number;
  description: string;
  date?: Date;
  category?: string;
  accountId?: string;
  userId: string;
  organizationId: string;
  metadata?: Record<string, any>;
  merchant?: string;
  transactionType?: 'income' | 'expense' | 'transfer';
}

export interface UpdateTransactionData {
  amount?: number;
  description?: string;
  date?: Date;
  category?: string;
  metadata?: Record<string, any>;
  merchant?: string;
  transactionType?: 'income' | 'expense' | 'transfer';
}

export interface TransactionFilters {
  userId?: string;
  organizationId?: string;
  category?: string;
  transactionType?: 'income' | 'expense' | 'transfer';
  dateFrom?: Date;
  dateTo?: Date;
  amountMin?: number;
  amountMax?: number;
  search?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Create a new transaction
 */
export async function createTransaction(data: CreateTransactionData) {
  const transaction = await prisma.transaction.create({
    data: {
      amount: data.amount,
      description: data.description,
      date: data.date || new Date(),
      category: data.category || null,
      accountId: data.accountId,
      userId: data.userId,
      organizationId: data.organizationId,
      metadata: data.metadata || {},
      merchant: data.merchant,
      transactionType: data.transactionType || 'expense'
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true
        }
      },
      organization: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  // Auto-categorize if no category provided and OpenAI is available
  if (!data.category && process.env.OPENAI_API_KEY) {
    try {
      await categorizerQueue.add({
        transactionId: transaction.id,
        amount: data.amount,
        description: data.description,
        metadata: data.metadata,
        merchant: data.merchant,
        date: data.date?.toISOString()
      }, {
        delay: 1000, // 1 second delay to ensure transaction is fully created
        priority: 1
      });
    } catch (error) {
      console.error('Failed to queue categorization job:', error);
    }
  }

  return transaction;
}

/**
 * Get transaction by ID
 */
export async function getTransactionById(id: string, userId?: string) {
  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true
        }
      },
      organization: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  // Check if user has access to this transaction
  if (userId && transaction && transaction.userId !== userId) {
    throw new Error('Unauthorized access to transaction');
  }

  return transaction;
}

/**
 * Update a transaction
 */
export async function updateTransaction(id: string, data: UpdateTransactionData, userId?: string) {
  // First check if transaction exists and user has access
  const existingTransaction = await getTransactionById(id, userId);
  if (!existingTransaction) {
    throw new Error('Transaction not found');
  }

  const updatedTransaction = await prisma.transaction.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date()
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true
        }
      },
      organization: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  return updatedTransaction;
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(id: string, userId?: string) {
  // First check if transaction exists and user has access
  const existingTransaction = await getTransactionById(id, userId);
  if (!existingTransaction) {
    throw new Error('Transaction not found');
  }

  await prisma.transaction.delete({
    where: { id }
  });

  return { success: true };
}

/**
 * Get transactions with filtering and pagination
 */
export async function getTransactions(
  filters: TransactionFilters = {},
  pagination: PaginationOptions = {}
) {
  const {
    page = 1,
    limit = 50,
    sortBy = 'date',
    sortOrder = 'desc'
  } = pagination;

  const {
    userId,
    organizationId,
    category,
    transactionType,
    dateFrom,
    dateTo,
    amountMin,
    amountMax,
    search
  } = filters;

  // Build where clause
  const where: any = {};

  if (userId) where.userId = userId;
  if (organizationId) where.organizationId = organizationId;
  if (category) where.category = category;
  if (transactionType) where.transactionType = transactionType;

  // Date range filter
  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) where.date.gte = dateFrom;
    if (dateTo) where.date.lte = dateTo;
  }

  // Amount range filter
  if (amountMin !== undefined || amountMax !== undefined) {
    where.amount = {};
    if (amountMin !== undefined) where.amount.gte = amountMin;
    if (amountMax !== undefined) where.amount.lte = amountMax;
  }

  // Search filter
  if (search) {
    where.OR = [
      { description: { contains: search, mode: 'insensitive' } },
      { merchant: { contains: search, mode: 'insensitive' } },
      { category: { contains: search, mode: 'insensitive' } }
    ];
  }

  // Calculate offset
  const skip = (page - 1) * limit;

  // Execute queries in parallel
  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      }
    }),
    prisma.transaction.count({ where })
  ]);

  return {
    transactions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  };
}

/**
 * Get transaction statistics
 */
export async function getTransactionStats(filters: TransactionFilters = {}) {
  const {
    userId,
    organizationId,
    category,
    transactionType,
    dateFrom,
    dateTo
  } = filters;

  const where: any = {};

  if (userId) where.userId = userId;
  if (organizationId) where.organizationId = organizationId;
  if (category) where.category = category;
  if (transactionType) where.transactionType = transactionType;

  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) where.date.gte = dateFrom;
    if (dateTo) where.date.lte = dateTo;
  }

  const [
    totalCount,
    incomeTotal,
    expenseTotal,
    categoryBreakdown
  ] = await Promise.all([
    prisma.transaction.count({ where }),
    prisma.transaction.aggregate({
      where: { ...where, transactionType: 'income' },
      _sum: { amount: true }
    }),
    prisma.transaction.aggregate({
      where: { ...where, transactionType: 'expense' },
      _sum: { amount: true }
    }),
    prisma.transaction.groupBy({
      by: ['category'],
      where,
      _sum: { amount: true },
      _count: { id: true }
    })
  ]);

  return {
    totalCount,
    incomeTotal: incomeTotal._sum.amount || 0,
    expenseTotal: expenseTotal._sum.amount || 0,
    netAmount: (incomeTotal._sum.amount || 0) - (expenseTotal._sum.amount || 0),
    categoryBreakdown: categoryBreakdown.map(item => ({
      category: item.category || 'Uncategorized',
      totalAmount: item._sum.amount || 0,
      count: item._count.id
    }))
  };
}

/**
 * Bulk categorize transactions
 */
export async function bulkCategorizeTransactions(
  transactionIds: string[],
  userId?: string
) {
  // Verify all transactions exist and user has access
  const transactions = await prisma.transaction.findMany({
    where: {
      id: { in: transactionIds },
      ...(userId ? { userId } : {})
    }
  });

  if (transactions.length !== transactionIds.length) {
    throw new Error('Some transactions not found or access denied');
  }

  // Queue categorization jobs
  const jobs = transactions.map(transaction => 
    categorizerQueue.add({
      transactionId: transaction.id,
      amount: transaction.amount,
      description: transaction.description,
      metadata: transaction.metadata,
      merchant: transaction.merchant || undefined,
      date: transaction.date.toISOString()
    })
  );

  await Promise.all(jobs);

  return {
    success: true,
    queuedTransactions: transactions.length
  };
}

export default {
  createTransaction,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getTransactions,
  getTransactionStats,
  bulkCategorizeTransactions
};


