// Data Export Service (CSV, Excel, QuickBooks format)
import { Parser } from 'json2csv';
import * as XLSX from 'xlsx';
import { prisma } from '../config/database';

export class ExportService {
  /**
   * Export transactions to CSV
   */
  async exportTransactionsToCSV(organizationId: string, filters?: any) {
    const transactions = await prisma.transaction.findMany({
      where: {
        organizationId,
        ...(filters?.startDate && {
          date: {
            gte: new Date(filters.startDate),
            ...(filters?.endDate && { lte: new Date(filters.endDate) }),
          },
        }),
        ...(filters?.type && { type: filters.type }),
        ...(filters?.category && { category: filters.category }),
      },
      orderBy: { date: 'desc' },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    const csvData = transactions.map((t) => ({
      Date: t.date.toISOString().split('T')[0],
      Description: t.description,
      Type: t.type,
      Category: t.category || 'Uncategorized',
      Subcategory: t.subcategory || '',
      Amount: t.amount.toNumber(),
      Balance: t.balance?.toNumber() || 0,
      Reference: t.reference || '',
      'Created By': `${t.user.firstName} ${t.user.lastName}`,
      'Payment Method': t.metadata && typeof t.metadata === 'object' && 'paymentMethod' in t.metadata 
        ? String(t.metadata.paymentMethod) 
        : '',
      Tags: t.tags?.join(', ') || '',
    }));

    const parser = new Parser();
    return parser.parse(csvData);
  }

  /**
   * Export invoices to CSV
   */
  async exportInvoicesToCSV(organizationId: string, filters?: any) {
    const invoices = await prisma.invoice.findMany({
      where: {
        organizationId,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.startDate && {
          issueDate: {
            gte: new Date(filters.startDate),
            ...(filters?.endDate && { lte: new Date(filters.endDate) }),
          },
        }),
      },
      orderBy: { issueDate: 'desc' },
      include: {
        client: true,
        items: true,
      },
    });

    const csvData = invoices.map((inv) => ({
      'Invoice Number': inv.invoiceNumber,
      'Client Name': inv.clientName,
      'Client Email': inv.clientEmail || '',
      'Issue Date': inv.issueDate.toISOString().split('T')[0],
      'Due Date': inv.dueDate?.toISOString().split('T')[0] || '',
      Status: inv.status.toUpperCase(),
      Subtotal: inv.subtotal.toNumber(),
      'Tax Amount': inv.taxAmount.toNumber(),
      'Discount Amount': inv.discountAmount.toNumber(),
      Total: inv.total.toNumber(),
      Currency: inv.currency,
      'Paid Date': inv.paidDate?.toISOString().split('T')[0] || '',
      Notes: inv.notes || '',
    }));

    const parser = new Parser();
    return parser.parse(csvData);
  }

  /**
   * Export expenses to CSV
   */
  async exportExpensesToCSV(organizationId: string, filters?: any) {
    const expenses = await prisma.expense.findMany({
      where: {
        organizationId,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.startDate && {
          date: {
            gte: new Date(filters.startDate),
            ...(filters?.endDate && { lte: new Date(filters.endDate) }),
          },
        }),
      },
      orderBy: { date: 'desc' },
      include: {
        vendor: true,
        category: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    const csvData = expenses.map((exp) => ({
      Date: exp.date.toISOString().split('T')[0],
      Description: exp.description,
      Amount: exp.amount.toNumber(),
      Category: exp.category?.name || 'Uncategorized',
      Vendor: exp.vendor?.name || exp.vendorName || '',
      'Receipt URL': exp.receiptUrl || '',
      Status: exp.status.toUpperCase(),
      'Tax Deductible': exp.isTaxDeductible ? 'Yes' : 'No',
      'Reimbursable': exp.isReimbursable ? 'Yes' : 'No',
      'Created By': `${exp.user.firstName} ${exp.user.lastName}`,
      'Payment Method': exp.paymentMethod || '',
      Notes: exp.notes || '',
    }));

    const parser = new Parser();
    return parser.parse(csvData);
  }

  /**
   * Export to Excel (XLSX)
   */
  async exportToExcel(organizationId: string, dataType: 'transactions' | 'invoices' | 'expenses', filters?: any) {
    let data: any[];

    switch (dataType) {
      case 'transactions':
        data = await prisma.transaction.findMany({
          where: { organizationId, ...filters },
          include: { user: { select: { firstName: true, lastName: true } } },
        });
        break;

      case 'invoices':
        data = await prisma.invoice.findMany({
          where: { organizationId, ...filters },
          include: { items: true, client: true },
        });
        break;

      case 'expenses':
        data = await prisma.expense.findMany({
          where: { organizationId, ...filters },
          include: { vendor: true, category: true },
        });
        break;

      default:
        throw new Error('Invalid data type');
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, dataType);

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * Export to QuickBooks IIF format
   */
  async exportToQuickBooks(organizationId: string, startDate: Date, endDate: Date) {
    const transactions = await prisma.transaction.findMany({
      where: {
        organizationId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });

    // QuickBooks IIF format
    let iif = '!TRNS\tTRNSID\tTRNSTYPE\tDATE\tACCNT\tNAME\tCLASS\tAMOUNT\tMEMO\n';
    iif += '!SPL\tSPLID\tTRNSTYPE\tDATE\tACCNT\tNAME\tCLASS\tAMOUNT\tMEMO\n';
    iif += '!ENDTRNS\n';

    transactions.forEach((t) => {
      const amount = t.amount.toNumber();
      const type = t.type === 'INCOME' ? 'DEPOSIT' : 'CHECK';
      const account = t.category || 'Uncategorized';

      iif += `TRNS\t${t.id}\t${type}\t${t.date.toLocaleDateString('en-US')}\t${account}\t\t\t${amount}\t${t.description}\n`;
      iif += `SPL\t${t.id}\t${type}\t${t.date.toLocaleDateString('en-US')}\t${account}\t\t\t${-amount}\t${t.description}\n`;
      iif += `ENDTRNS\n`;
    });

    return iif;
  }

  /**
   * Export to Xero format
   */
  async exportToXero(organizationId: string, startDate: Date, endDate: Date) {
    const transactions = await prisma.transaction.findMany({
      where: {
        organizationId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });

    // Xero CSV format
    const csvData = transactions.map((t) => ({
      '*ContactName': '',
      '*InvoiceNumber': t.reference || t.id,
      '*InvoiceDate': t.date.toISOString().split('T')[0],
      '*DueDate': t.date.toISOString().split('T')[0],
      InventoryItemCode: '',
      '*Description': t.description,
      '*Quantity': 1,
      '*UnitAmount': t.amount.toNumber(),
      Discount: 0,
      '*AccountCode': t.category || '200',
      '*TaxType': 'Tax Exempt',
      TaxAmount: 0,
      TrackingName1: '',
      TrackingOption1: '',
      TrackingName2: '',
      TrackingOption2: '',
      Currency: 'USD',
    }));

    const parser = new Parser();
    return parser.parse(csvData);
  }
}

export const exportService = new ExportService();

