import { Request, Response } from 'express';
import { prisma } from '../index';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { generatePDF } from '../services/reportService';
// ReportType enum
enum ReportType {
  INCOME_STATEMENT = 'INCOME_STATEMENT',
  BALANCE_SHEET = 'BALANCE_SHEET',
  CASH_FLOW = 'CASH_FLOW',
  AGING_REPORT = 'AGING_REPORT',
  PROFIT_LOSS = 'PROFIT_LOSS',
  EXPENSE_REPORT = 'EXPENSE_REPORT',
  INCOME_REPORT = 'INCOME_REPORT',
  TAX_REPORT = 'TAX_REPORT'
}

interface GenerateReportRequest extends Request {
  body: {
    type: ReportType;
    name: string;
    parameters: {
      dateFrom?: string;
      dateTo?: string;
      categories?: string[];
      customers?: string[];
      vendors?: string[];
      format?: 'pdf' | 'excel' | 'csv';
      includeCharts?: boolean;
    };
  };
}

// Generate report
export const generateReport = async (req: GenerateReportRequest, res: Response): Promise<void> => {
  const { type, name, parameters } = req.body;
  const organizationId = req.user!.organizationId!;
  const userId = req.user!.id;

  // Create report record
  const report = await prisma.report.create({
    data: {
      organizationId,
      userId,
      name,
      type,
      parameters,
      status: 'GENERATING',
    },
  });

  try {
    let reportData: any = {};

    // Generate report data based on type
    switch (type) {
      case 'PROFIT_LOSS':
        reportData = await generateProfitLossReport(organizationId, parameters);
        break;
      case 'BALANCE_SHEET':
        reportData = await generateBalanceSheetReport(organizationId, parameters);
        break;
      case 'CASH_FLOW':
        reportData = await generateCashFlowReport(organizationId, parameters);
        break;
      case 'AGING_REPORT':
        reportData = await generateAgingReport(organizationId, parameters);
        break;
      case 'EXPENSE_REPORT':
        reportData = await generateExpenseReport(organizationId, parameters);
        break;
      case 'INCOME_REPORT':
        reportData = await generateIncomeReport(organizationId, parameters);
        break;
      case 'TAX_REPORT':
        reportData = await generateTaxReport(organizationId, parameters);
        break;
      default:
        throw new CustomError('Invalid report type', 400);
    }

    // Generate PDF if requested
    let pdfUrl: string | undefined;
    if (parameters.format === 'pdf') {
      pdfUrl = await generatePDF(reportData, type, name);
    }

    // Update report with data
    await prisma.report.update({
      where: { id: report.id },
      data: {
        data: reportData,
        status: 'COMPLETED',
        generatedAt: new Date(),
      },
    });

    logger.info(`Report generated: ${name} (${type}) by user ${req.user!.email}`);

    res.json({
      success: true,
      message: 'Report generated successfully',
      data: {
        report: {
          ...report,
          data: reportData,
          status: 'COMPLETED',
          generatedAt: new Date(),
          pdfUrl,
        },
      },
    });
  } catch (error) {
    // Update report with error status
    await prisma.report.update({
      where: { id: report.id },
      data: {
        status: 'FAILED',
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
      },
    });

    logger.error(`Report generation failed: ${name} (${type})`, error);
    throw error;
  }
};

// Get reports
export const getReports = async (req: Request, res: Response): Promise<void> => {
  const organizationId = req.user!.organizationId!;
  const { page = 1, limit = 20, type, status } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  const where: any = { organizationId };

  if (type) {
    where.type = type;
  }

  if (status) {
    where.status = status;
  }

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
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
    prisma.report.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      reports,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    },
  });
};

// Get single report
export const getReport = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId!;

  const report = await prisma.report.findFirst({
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

  if (!report) {
    throw new CustomError('Report not found', 404);
  }

  res.json({
    success: true,
    data: { report },
  });
};

// Delete report
export const deleteReport = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId!;

  const report = await prisma.report.findFirst({
    where: {
      id: id!,
      organizationId,
    },
  });

  if (!report) {
    throw new CustomError('Report not found', 404);
  }

  await prisma.report.delete({
    where: { id: id! },
  });

  logger.info(`Report deleted: ${report.name} by user ${req.user!.email}`);

  res.json({
    success: true,
    message: 'Report deleted successfully',
  });
};

// Generate Profit & Loss Report
const generateProfitLossReport = async (organizationId: string, parameters: any) => {
  const { dateFrom, dateTo } = parameters;
  
  const where: any = { organizationId };
  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) where.date.gte = new Date(dateFrom);
    if (dateTo) where.date.lte = new Date(dateTo);
  }

  const [income, expenses] = await Promise.all([
    prisma.transaction.findMany({
      where: { ...where, type: 'INCOME' },
      select: { amount: true, category: true, date: true },
    }),
    prisma.expense.findMany({
      where: { ...where, status: 'APPROVED' },
      select: { amount: true, category: true, date: true },
    }),
  ]);

  const totalIncome = income.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const netIncome = totalIncome - totalExpenses;

  // Group by category
  const incomeByCategory = income.reduce((acc: any, item) => {
    const category = item.category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + Number(item.amount);
    return acc;
  }, {});

  const expensesByCategory = expenses.reduce((acc: any, item) => {
    const category = item.category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + Number(item.amount);
    return acc;
  }, {});

  return {
    period: { from: dateFrom, to: dateTo },
    summary: {
      totalIncome,
      totalExpenses,
      netIncome,
      grossProfit: totalIncome,
      operatingIncome: netIncome,
    },
    income: incomeByCategory,
    expenses: expensesByCategory,
    generatedAt: new Date().toISOString(),
  };
};

// Generate Balance Sheet Report
const generateBalanceSheetReport = async (organizationId: string, parameters: any) => {
  const { dateTo } = parameters;
  const asOfDate = dateTo ? new Date(dateTo) : new Date();

  // Get bank account balances
  const bankAccounts = await prisma.bankAccount.findMany({
    where: {
      organizationId,
      isActive: true,
    },
    select: { balance: true, type: true, name: true },
  });

  // Get outstanding invoices (accounts receivable)
  const accountsReceivable = await prisma.invoice.aggregate({
    where: {
      organizationId,
      status: { in: ['SENT', 'VIEWED', 'OVERDUE'] },
    },
    _sum: { totalAmount: true },
  });

  // Get unpaid expenses (accounts payable)
  const accountsPayable = await prisma.expense.aggregate({
    where: {
      organizationId,
      status: 'APPROVED',
      metadata: {
        path: ['paid'],
        equals: false,
      },
    },
    _sum: { amount: true },
  });

  const totalAssets = bankAccounts.reduce((sum, acc) => sum + Number(acc.balance), 0) + 
                     Number(accountsReceivable._sum.totalAmount || 0);
  
  const totalLiabilities = Number(accountsPayable._sum.amount || 0);
  const equity = totalAssets - totalLiabilities;

  return {
    asOfDate: asOfDate.toISOString(),
    assets: {
      current: {
        cash: bankAccounts.reduce((sum, acc) => acc.type === 'CHECKING' ? sum + Number(acc.balance) : sum, 0),
        accountsReceivable: Number(accountsReceivable._sum.totalAmount || 0),
        total: totalAssets,
      },
    },
    liabilities: {
      current: {
        accountsPayable: Number(accountsPayable._sum.amount || 0),
        total: totalLiabilities,
      },
    },
    equity: {
      retainedEarnings: equity,
      total: equity,
    },
    summary: {
      totalAssets,
      totalLiabilities,
      totalEquity: equity,
    },
    generatedAt: new Date().toISOString(),
  };
};

// Generate Cash Flow Report
const generateCashFlowReport = async (organizationId: string, parameters: any) => {
  const { dateFrom, dateTo } = parameters;
  
  const where: any = { organizationId };
  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) where.date.gte = new Date(dateFrom);
    if (dateTo) where.date.lte = new Date(dateTo);
  }

  const [income, expenses, invoices] = await Promise.all([
    prisma.transaction.findMany({
      where: { ...where, type: 'INCOME' },
      select: { amount: true, date: true },
    }),
    prisma.expense.findMany({
      where: { ...where, status: 'APPROVED' },
      select: { amount: true, date: true },
    }),
    prisma.invoice.findMany({
      where: { ...where, status: 'PAID' },
      select: { totalAmount: true, paidDate: true },
    }),
  ]);

  const operatingCashFlow = income.reduce((sum, item) => sum + Number(item.amount), 0) - 
                           expenses.reduce((sum, item) => sum + Number(item.amount), 0);

  // Group by month
  const monthlyData = [...income, ...expenses, ...invoices].reduce((acc: any, item) => {
    const date = new Date((item as any).date || (item as any).paidDate);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!acc[monthKey]) {
      acc[monthKey] = { income: 0, expenses: 0, net: 0 };
    }
    
    if ('totalAmount' in item) {
      // Invoice
      acc[monthKey].income += Number(item.totalAmount);
    } else if (Number(item.amount) > 0) {
      // Income transaction
      acc[monthKey].income += Number(item.amount);
    } else {
      // Expense
      acc[monthKey].expenses += Number(item.amount);
    }
    
    acc[monthKey].net = acc[monthKey].income - acc[monthKey].expenses;
    
    return acc;
  }, {});

  return {
    period: { from: dateFrom, to: dateTo },
    operatingCashFlow,
    monthlyData,
    summary: {
      totalIncome: income.reduce((sum, item) => sum + Number(item.amount), 0),
      totalExpenses: expenses.reduce((sum, item) => sum + Number(item.amount), 0),
      netCashFlow: operatingCashFlow,
    },
    generatedAt: new Date().toISOString(),
  };
};

// Generate Aging Report
const generateAgingReport = async (organizationId: string, _parameters: any) => {
  const invoices = await prisma.invoice.findMany({
    where: {
      organizationId,
      status: { in: ['SENT', 'VIEWED', 'OVERDUE'] },
    },
    include: {
      customer: true,
    },
    orderBy: { issueDate: 'asc' },
  });

  const now = new Date();
  const agingData = invoices.map(invoice => {
    const daysOverdue = Math.floor((now.getTime() - new Date(invoice.issueDate).getTime()) / (1000 * 60 * 60 * 24));
    
    let agingCategory = 'current';
    if (daysOverdue > 90) agingCategory = 'over90';
    else if (daysOverdue > 60) agingCategory = 'over60';
    else if (daysOverdue > 30) agingCategory = 'over30';
    else if (daysOverdue > 0) agingCategory = 'over0';

    return {
      invoiceNumber: invoice.invoiceNumber,
      customer: invoice.customer?.name || 'Unknown',
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      amount: Number(invoice.totalAmount),
      daysOverdue,
      agingCategory,
    };
  });

  const summary = agingData.reduce((acc: any, item) => {
    acc[item.agingCategory] = (acc[item.agingCategory] || 0) + item.amount;
    return acc;
  }, {});

  return {
    agingData,
    summary,
    totalOutstanding: agingData.reduce((sum, item) => sum + item.amount, 0),
    generatedAt: new Date().toISOString(),
  };
};

// Generate Expense Report
const generateExpenseReport = async (organizationId: string, parameters: any) => {
  const { dateFrom, dateTo, categories } = parameters;
  
  const where: any = { organizationId, status: 'APPROVED' };
  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) where.date.gte = new Date(dateFrom);
    if (dateTo) where.date.lte = new Date(dateTo);
  }
  if (categories && categories.length > 0) {
    where.category = { in: categories };
  }

  const expenses = await prisma.expense.findMany({
    where,
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { date: 'desc' },
  });

  const totalAmount = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const categoryBreakdown = expenses.reduce((acc: any, item) => {
    const category = item.category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + Number(item.amount);
    return acc;
  }, {});

  return {
    period: { from: dateFrom, to: dateTo },
    expenses,
    summary: {
      totalAmount,
      count: expenses.length,
      averageAmount: expenses.length > 0 ? totalAmount / expenses.length : 0,
    },
    categoryBreakdown,
    generatedAt: new Date().toISOString(),
  };
};

// Generate Income Report
const generateIncomeReport = async (organizationId: string, parameters: any) => {
  const { dateFrom, dateTo } = parameters;
  
  const where: any = { organizationId, type: 'INCOME' };
  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) where.date.gte = new Date(dateFrom);
    if (dateTo) where.date.lte = new Date(dateTo);
  }

  const [transactions, paidInvoices] = await Promise.all([
    prisma.transaction.findMany({
      where,
      select: { amount: true, description: true, date: true, category: true },
    }),
    prisma.invoice.findMany({
      where: {
        organizationId,
        status: 'PAID',
        ...(dateFrom || dateTo ? {
          paidDate: {
            ...(dateFrom && { gte: new Date(dateFrom) }),
            ...(dateTo && { lte: new Date(dateTo) }),
          },
        } : {}),
      },
      include: {
        customer: true,
      },
    }),
  ]);

  const totalAmount = transactions.reduce((sum, item) => sum + Number(item.amount), 0) +
                     paidInvoices.reduce((sum, item) => sum + Number(item.totalAmount), 0);

  const categoryBreakdown = [...transactions, ...paidInvoices.map(inv => ({
    amount: inv.totalAmount,
    category: 'Invoice Revenue',
    description: `Invoice ${inv.invoiceNumber}`,
  }))].reduce((acc: any, item) => {
    const category = item.category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + Number(item.amount);
    return acc;
  }, {});

  return {
    period: { from: dateFrom, to: dateTo },
    transactions,
    invoices: paidInvoices,
    summary: {
      totalAmount,
      transactionCount: transactions.length,
      invoiceCount: paidInvoices.length,
    },
    categoryBreakdown,
    generatedAt: new Date().toISOString(),
  };
};

// Generate Tax Report
const generateTaxReport = async (organizationId: string, parameters: any) => {
  const { dateFrom, dateTo } = parameters;
  
  const where: any = { organizationId };
  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) where.date.gte = new Date(dateFrom);
    if (dateTo) where.date.lte = new Date(dateTo);
  }

  const [taxDeductibleExpenses, sales] = await Promise.all([
    prisma.expense.findMany({
      where: { ...where, isTaxDeductible: true, status: 'APPROVED' },
      select: { amount: true, category: true, description: true, date: true },
    }),
    prisma.invoice.findMany({
      where: {
        organizationId,
        status: 'PAID',
        ...(dateFrom || dateTo ? {
          paidDate: {
            ...(dateFrom && { gte: new Date(dateFrom) }),
            ...(dateTo && { lte: new Date(dateTo) }),
          },
        } : {}),
      },
      select: { totalAmount: true, issueDate: true, customer: { select: { name: true } } },
    }),
  ]);

  const totalDeductibleExpenses = taxDeductibleExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalSales = sales.reduce((sum, item) => sum + Number(item.totalAmount), 0);

  return {
    period: { from: dateFrom, to: dateTo },
    taxDeductibleExpenses,
    sales,
    summary: {
      totalDeductibleExpenses,
      totalSales,
      taxableIncome: totalSales - totalDeductibleExpenses,
    },
    generatedAt: new Date().toISOString(),
  };
};
