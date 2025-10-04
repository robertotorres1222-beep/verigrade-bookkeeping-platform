import { prisma } from '../index';

export const generateInvoiceNumber = async (organizationId: string): Promise<string> => {
  // Get organization settings for invoice numbering
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { settings: true },
  });

  const settings = organization?.settings as any;
  const invoiceSettings = settings?.invoiceNumbering || {
    prefix: 'INV',
    startNumber: 1,
    padding: 4,
  };

  // Get the last invoice number for this organization
  const lastInvoice = await prisma.invoice.findFirst({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
    select: { invoiceNumber: true },
  });

  let nextNumber = invoiceSettings.startNumber;

  if (lastInvoice?.invoiceNumber) {
    // Extract number from last invoice
    const lastNumber = parseInt(lastInvoice.invoiceNumber.replace(invoiceSettings.prefix, ''));
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  // Format the number with padding
  const paddedNumber = nextNumber.toString().padStart(invoiceSettings.padding, '0');
  
  return `${invoiceSettings.prefix}-${paddedNumber}`;
};

export const calculateInvoiceTotals = (items: Array<{
  quantity: number;
  unitPrice: number;
}>, taxRate: number = 0) => {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const taxAmount = subtotal * (taxRate / 100);
  const totalAmount = subtotal + taxAmount;

  return {
    subtotal,
    taxAmount,
    totalAmount,
  };
};

export const validateInvoiceData = (data: any): string[] => {
  const errors: string[] = [];

  if (!data.items || data.items.length === 0) {
    errors.push('Invoice must have at least one item');
  }

  if (data.items) {
    data.items.forEach((item: any, index: number) => {
      if (!item.description || item.description.trim() === '') {
        errors.push(`Item ${index + 1}: Description is required`);
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
      }
      if (!item.unitPrice || item.unitPrice <= 0) {
        errors.push(`Item ${index + 1}: Unit price must be greater than 0`);
      }
    });
  }

  if (data.issueDate && new Date(data.issueDate) > new Date()) {
    errors.push('Issue date cannot be in the future');
  }

  if (data.dueDate && data.issueDate && new Date(data.dueDate) < new Date(data.issueDate)) {
    errors.push('Due date cannot be before issue date');
  }

  if (data.taxRate && (data.taxRate < 0 || data.taxRate > 100)) {
    errors.push('Tax rate must be between 0 and 100');
  }

  return errors;
};
