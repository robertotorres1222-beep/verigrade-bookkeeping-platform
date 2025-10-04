import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

export const generatePDF = async (reportData: any, reportType: string, reportName: string): Promise<string> => {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const { height } = page.getSize();
    const margin = 50;
    let yPosition = height - margin;

    // Header
    page.drawText(reportName, {
      x: margin,
      y: yPosition,
      size: 18,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    yPosition -= 30;

    page.drawText(`Generated on: ${new Date().toLocaleDateString()}`, {
      x: margin,
      y: yPosition,
      size: 10,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    });

    yPosition -= 40;

    // Report content based on type
    switch (reportType) {
      case 'PROFIT_LOSS':
        await addProfitLossContent(page, reportData, margin, yPosition, font, boldFont);
        break;
      case 'BALANCE_SHEET':
        await addBalanceSheetContent(page, reportData, margin, yPosition, font, boldFont);
        break;
      case 'CASH_FLOW':
        await addCashFlowContent(page, reportData, margin, yPosition, font, boldFont);
        break;
      default:
        await addGenericContent(page, reportData, margin, yPosition, font, boldFont);
    }

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    const fileName = `${reportName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`;
    const filePath = path.join(process.cwd(), 'uploads', 'reports', fileName);
    
    // Create directory if it doesn't exist
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, pdfBytes);

    return `uploads/reports/${fileName}`;
  } catch (error) {
    logger.error('PDF generation failed:', error);
    throw new Error('Failed to generate PDF');
  }
};

export const generateExcel = async (reportData: any, reportType: string, reportName: string): Promise<string> => {
  try {
    const workbook = XLSX.utils.book_new();

    // Create different sheets based on report type
    switch (reportType) {
      case 'PROFIT_LOSS':
        // Summary sheet
        const summaryData = [
          ['Profit & Loss Report', ''],
          ['Period', `${reportData.period.from} to ${reportData.period.to}`],
          ['', ''],
          ['Total Income', reportData.summary.totalIncome],
          ['Total Expenses', reportData.summary.totalExpenses],
          ['Net Income', reportData.summary.netIncome],
        ];
        
        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

        // Income by category
        if (reportData.income) {
          const incomeData = [['Category', 'Amount'], ...Object.entries(reportData.income)];
          const incomeSheet = XLSX.utils.aoa_to_sheet(incomeData);
          XLSX.utils.book_append_sheet(workbook, incomeSheet, 'Income by Category');
        }

        // Expenses by category
        if (reportData.expenses) {
          const expenseData = [['Category', 'Amount'], ...Object.entries(reportData.expenses)];
          const expenseSheet = XLSX.utils.aoa_to_sheet(expenseData);
          XLSX.utils.book_append_sheet(workbook, expenseSheet, 'Expenses by Category');
        }
        break;

      case 'BALANCE_SHEET':
        const balanceData = [
          ['Balance Sheet', ''],
          ['As of', reportData.asOfDate],
          ['', ''],
          ['ASSETS', ''],
          ['Current Assets', ''],
          ['Cash', reportData.assets.current.cash],
          ['Accounts Receivable', reportData.assets.current.accountsReceivable],
          ['Total Current Assets', reportData.assets.current.total],
          ['', ''],
          ['LIABILITIES', ''],
          ['Current Liabilities', ''],
          ['Accounts Payable', reportData.liabilities.current.accountsPayable],
          ['Total Current Liabilities', reportData.liabilities.current.total],
          ['', ''],
          ['EQUITY', ''],
          ['Retained Earnings', reportData.equity.retainedEarnings],
          ['Total Equity', reportData.equity.total],
        ];
        
        const balanceSheet = XLSX.utils.aoa_to_sheet(balanceData);
        XLSX.utils.book_append_sheet(workbook, balanceSheet, 'Balance Sheet');
        break;

      default:
        // Generic data export
        const genericData = Object.entries(reportData).map(([key, value]) => [key, JSON.stringify(value)]);
        const genericSheet = XLSX.utils.aoa_to_sheet(genericData);
        XLSX.utils.book_append_sheet(workbook, genericSheet, 'Report Data');
    }

    // Save Excel file
    const fileName = `${reportName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.xlsx`;
    const filePath = path.join(process.cwd(), 'uploads', 'reports', fileName);
    
    // Create directory if it doesn't exist
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    XLSX.writeFile(workbook, filePath);

    return `uploads/reports/${fileName}`;
  } catch (error) {
    logger.error('Excel generation failed:', error);
    throw new Error('Failed to generate Excel file');
  }
};

export const generateCSV = async (reportData: any, reportType: string, reportName: string): Promise<string> => {
  try {
    let csvContent = '';

    switch (reportType) {
      case 'PROFIT_LOSS':
        csvContent = 'Category,Amount\n';
        if (reportData.income) {
          csvContent += 'Income,\n';
          Object.entries(reportData.income).forEach(([category, amount]) => {
            csvContent += `${category},${amount}\n`;
          });
        }
        if (reportData.expenses) {
          csvContent += 'Expenses,\n';
          Object.entries(reportData.expenses).forEach(([category, amount]) => {
            csvContent += `${category},${amount}\n`;
          });
        }
        break;

      case 'EXPENSE_REPORT':
        csvContent = 'Date,Description,Amount,Category,Vendor\n';
        if (reportData.expenses) {
          reportData.expenses.forEach((expense: any) => {
            csvContent += `${expense.date},${expense.description},${expense.amount},${expense.category || ''},${expense.vendor || ''}\n`;
          });
        }
        break;

      default:
        csvContent = 'Key,Value\n';
        Object.entries(reportData).forEach(([key, value]) => {
          csvContent += `${key},"${JSON.stringify(value)}"\n`;
        });
    }

    // Save CSV file
    const fileName = `${reportName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.csv`;
    const filePath = path.join(process.cwd(), 'uploads', 'reports', fileName);
    
    // Create directory if it doesn't exist
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, csvContent);

    return `uploads/reports/${fileName}`;
  } catch (error) {
    logger.error('CSV generation failed:', error);
    throw new Error('Failed to generate CSV file');
  }
};

// PDF Content Helpers
const addProfitLossContent = async (
  page: any,
  data: any,
  margin: number,
  startY: number,
  font: any,
  boldFont: any
) => {
  let yPosition = startY;

  // Summary
  page.drawText('Summary', {
    x: margin,
    y: yPosition,
    size: 14,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 30;

  page.drawText(`Total Income: $${data.summary.totalIncome.toFixed(2)}`, {
    x: margin,
    y: yPosition,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
  });
  yPosition -= 20;

  page.drawText(`Total Expenses: $${data.summary.totalExpenses.toFixed(2)}`, {
    x: margin,
    y: yPosition,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
  });
  yPosition -= 20;

  page.drawText(`Net Income: $${data.summary.netIncome.toFixed(2)}`, {
    x: margin,
    y: yPosition,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 40;

  // Income breakdown
  if (data.income) {
    page.drawText('Income by Category', {
      x: margin,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 30;

    Object.entries(data.income).forEach(([category, amount]: [string, any]) => {
      if (yPosition < 100) {
        // Add new page if needed
        const newPage = page.doc.addPage();
        yPosition = newPage.getSize().height - margin;
      }

      page.drawText(`${category}: $${Number(amount).toFixed(2)}`, {
        x: margin + 20,
        y: yPosition,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      });
      yPosition -= 15;
    });

    yPosition -= 20;
  }

  // Expense breakdown
  if (data.expenses) {
    page.drawText('Expenses by Category', {
      x: margin,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 30;

    Object.entries(data.expenses).forEach(([category, amount]: [string, any]) => {
      if (yPosition < 100) {
        // Add new page if needed
        const newPage = page.doc.addPage();
        yPosition = newPage.getSize().height - margin;
      }

      page.drawText(`${category}: $${Number(amount).toFixed(2)}`, {
        x: margin + 20,
        y: yPosition,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      });
      yPosition -= 15;
    });
  }
};

const addBalanceSheetContent = async (
  page: any,
  data: any,
  margin: number,
  startY: number,
  font: any,
  boldFont: any
) => {
  let yPosition = startY;

  // Assets
  page.drawText('ASSETS', {
    x: margin,
    y: yPosition,
    size: 14,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 30;

  page.drawText(`Cash: $${data.assets.current.cash.toFixed(2)}`, {
    x: margin + 20,
    y: yPosition,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
  });
  yPosition -= 20;

  page.drawText(`Accounts Receivable: $${data.assets.current.accountsReceivable.toFixed(2)}`, {
    x: margin + 20,
    y: yPosition,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
  });
  yPosition -= 40;

  // Liabilities
  page.drawText('LIABILITIES', {
    x: margin,
    y: yPosition,
    size: 14,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 30;

  page.drawText(`Accounts Payable: $${data.liabilities.current.accountsPayable.toFixed(2)}`, {
    x: margin + 20,
    y: yPosition,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
  });
  yPosition -= 40;

  // Equity
  page.drawText('EQUITY', {
    x: margin,
    y: yPosition,
    size: 14,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 30;

  page.drawText(`Retained Earnings: $${data.equity.retainedEarnings.toFixed(2)}`, {
    x: margin + 20,
    y: yPosition,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
  });
};

const addCashFlowContent = async (
  page: any,
  data: any,
  margin: number,
  startY: number,
  font: any,
  boldFont: any
) => {
  let yPosition = startY;

  page.drawText('Cash Flow Summary', {
    x: margin,
    y: yPosition,
    size: 14,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 30;

  page.drawText(`Operating Cash Flow: $${data.operatingCashFlow.toFixed(2)}`, {
    x: margin,
    y: yPosition,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
  });
  yPosition -= 20;

  page.drawText(`Total Income: $${data.summary.totalIncome.toFixed(2)}`, {
    x: margin,
    y: yPosition,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
  });
  yPosition -= 20;

  page.drawText(`Total Expenses: $${data.summary.totalExpenses.toFixed(2)}`, {
    x: margin,
    y: yPosition,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
  });
};

const addGenericContent = async (
  page: any,
  data: any,
  margin: number,
  startY: number,
  font: any,
  boldFont: any
) => {
  let yPosition = startY;

  page.drawText('Report Data', {
    x: margin,
    y: yPosition,
    size: 14,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 30;

  Object.entries(data).forEach(([key, value]) => {
    if (yPosition < 100) {
      // Add new page if needed
      const newPage = page.doc.addPage();
      yPosition = newPage.getSize().height - margin;
    }

    page.drawText(`${key}: ${JSON.stringify(value)}`, {
      x: margin + 20,
      y: yPosition,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    });
    yPosition -= 15;
  });
};
