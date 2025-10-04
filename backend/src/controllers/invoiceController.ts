import { Request, Response } from 'express';
import { prisma } from '../index';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { sendEmail } from '../services/emailService';
import { generateInvoiceNumber } from '../utils/invoiceUtils';

interface CreateInvoiceRequest extends Request {
  body: {
    customerId?: string;
    issueDate: string;
    dueDate?: string;
    items: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
    }>;
    notes?: string;
    terms?: string;
    taxRate?: number;
  };
}

interface UpdateInvoiceRequest extends Request {
  params: {
    id: string;
  };
  body: {
    customerId?: string;
    issueDate?: string;
    dueDate?: string;
    items?: Array<{
      id?: string;
      description: string;
      quantity: number;
      unitPrice: number;
    }>;
    notes?: string;
    terms?: string;
    taxRate?: number;
    status?: string;
  };
}

// Create invoice
export const createInvoice = async (req: CreateInvoiceRequest, res: Response): Promise<void> => {
  const { customerId, issueDate, dueDate, items, notes, terms, taxRate = 0 } = req.body;
  const organizationId = req.user!.organizationId!;

  if (!items || items.length === 0) {
    throw new CustomError('Invoice must have at least one item', 400);
  }

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const taxAmount = subtotal * (taxRate / 100);
  const totalAmount = subtotal + taxAmount;

  // Generate invoice number
  const invoiceNumber = await generateInvoiceNumber(organizationId);

  // Create invoice with items in a transaction
  const invoice = await prisma.$transaction(async (tx) => {
    // Create invoice
    const newInvoice = await tx.invoice.create({
      data: {
        organizationId,
        userId: req.user!.id,
        invoiceNumber,
        customerId: customerId || null,
        issueDate: new Date(issueDate),
        dueDate: dueDate ? new Date(dueDate) : null,
        subtotal,
        taxAmount,
        totalAmount,
        notes: notes || null,
        terms: terms || null,
        metadata: { taxRate },
      },
    });

    // Create invoice items
    const invoiceItems = await Promise.all(
      items.map((item) =>
        tx.invoiceItem.create({
          data: {
            invoiceId: newInvoice.id,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
          },
        })
      )
    );

    return { ...newInvoice, items: invoiceItems };
  });

  // Get customer details if provided
  let customer = null;
  if (customerId) {
    customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });
  }

  logger.info(`Invoice created: ${invoiceNumber} by user ${req.user!.email}`);

  res.status(201).json({
    success: true,
    message: 'Invoice created successfully',
    data: {
      invoice: {
        ...invoice,
        customer,
      },
    },
  });
};

// Get invoices
export const getInvoices = async (req: Request, res: Response): Promise<void> => {
  const organizationId = req.user!.organizationId!;
  const {
    page = 1,
    limit = 20,
    status,
    customerId,
    dateFrom,
    dateTo,
    search,
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  // Build where clause
  const where: any = {
    organizationId,
  };

  if (status) {
    where.status = status;
  }

  if (customerId) {
    where.customerId = customerId;
  }

  if (dateFrom || dateTo) {
    where.issueDate = {};
    if (dateFrom) where.issueDate.gte = new Date(dateFrom as string);
    if (dateTo) where.issueDate.lte = new Date(dateTo as string);
  }

  if (search) {
    where.OR = [
      { invoiceNumber: { contains: search as string } },
      { notes: { contains: search as string } },
      { customer: { name: { contains: search as string } } },
    ];
  }

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: {
        customer: true,
        items: true,
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
    prisma.invoice.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      invoices,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    },
  });
};

// Get single invoice
export const getInvoice = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId!;

  const invoice = await prisma.invoice.findFirst({
    where: {
      id: id!,
      organizationId,
    },
    include: {
      customer: true,
      items: true,
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

  if (!invoice) {
    throw new CustomError('Invoice not found', 404);
  }

  res.json({
    success: true,
    data: { invoice },
  });
};

// Update invoice
export const updateInvoice = async (req: UpdateInvoiceRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId!;
  const updateData = req.body;

  // Check if invoice exists and belongs to organization
  const existingInvoice = await prisma.invoice.findFirst({
    where: {
      id: id!,
      organizationId,
    },
  });

  if (!existingInvoice) {
    throw new CustomError('Invoice not found', 404);
  }

  // Prevent updates to paid invoices
  if (existingInvoice.status === 'PAID') {
    throw new CustomError('Cannot update paid invoice', 400);
  }

  // Calculate new totals if items are updated
  let updateFields: any = { ...updateData };
  if (updateData.items) {
    const subtotal = updateData.items.reduce(
      (sum: number, item: any) => sum + (item.quantity * item.unitPrice),
      0
    );
    const taxRate = updateData.taxRate || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;

    updateFields = {
      ...updateData,
      subtotal,
      taxAmount,
      totalAmount,
    };
  }

  // Update invoice in transaction
  const invoice = await prisma.$transaction(async (tx) => {
    // Update invoice
    await tx.invoice.update({
      where: { id: id! },
      data: {
        ...updateFields,
        items: undefined, // Remove items from update data
      },
    });

    // Update items if provided
    if (updateData.items) {
      // Delete existing items
      await tx.invoiceItem.deleteMany({
        where: { invoiceId: id },
      });

      // Create new items
      await Promise.all(
        updateData.items.map((item: any) =>
          tx.invoiceItem.create({
            data: {
              invoiceId: id,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.quantity * item.unitPrice,
            },
          })
        )
      );
    }

    // Get updated invoice with items
    return await tx.invoice.findUnique({
      where: { id: id! },
      include: {
        customer: true,
        items: true,
      },
    });
  });

  logger.info(`Invoice updated: ${invoice!.invoiceNumber} by user ${req.user!.email}`);

  res.json({
    success: true,
    message: 'Invoice updated successfully',
    data: { invoice },
  });
};

// Delete invoice
export const deleteInvoice = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId!;

  const invoice = await prisma.invoice.findFirst({
    where: {
      id: id!,
      organizationId,
    },
  });

  if (!invoice) {
    throw new CustomError('Invoice not found', 404);
  }

  // Prevent deletion of paid invoices
  if (invoice.status === 'PAID') {
    throw new CustomError('Cannot delete paid invoice', 400);
  }

  await prisma.invoice.delete({
    where: { id: id! },
  });

  logger.info(`Invoice deleted: ${invoice.invoiceNumber} by user ${req.user!.email}`);

  res.json({
    success: true,
    message: 'Invoice deleted successfully',
  });
};

// Send invoice
export const sendInvoice = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId!;

  const invoice = await prisma.invoice.findFirst({
    where: {
      id: id!,
      organizationId,
    },
    include: {
      customer: true,
      items: true,
      organization: true,
    },
  });

  if (!invoice) {
    throw new CustomError('Invoice not found', 404);
  }

  if (!invoice.customer?.email) {
    throw new CustomError('Customer email is required to send invoice', 400);
  }

  // Update invoice status
  await prisma.invoice.update({
    where: { id: id! },
    data: { status: 'SENT' },
  });

  // Send email
  try {
    await sendEmail({
      to: invoice.customer.email,
      subject: `Invoice ${invoice.invoiceNumber} from ${invoice.organization.name}`,
      template: 'invoice',
      data: {
        invoiceNumber: invoice.invoiceNumber,
        customerName: invoice.customer.name,
        totalAmount: invoice.totalAmount,
        dueDate: invoice.dueDate,
        organizationName: invoice.organization.name,
        invoiceUrl: `${process.env['FRONTEND_URL']}/invoices/${invoice.id}`,
      },
    });

    logger.info(`Invoice sent: ${invoice.invoiceNumber} to ${invoice.customer.email}`);
  } catch (error) {
    logger.error('Failed to send invoice email:', error);
    // Don't throw error, just log it
  }

  res.json({
    success: true,
    message: 'Invoice sent successfully',
  });
};

// Mark invoice as paid
export const markInvoicePaid = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId!;

  const invoice = await prisma.invoice.findFirst({
    where: {
      id: id!,
      organizationId,
    },
  });

  if (!invoice) {
    throw new CustomError('Invoice not found', 404);
  }

  await prisma.invoice.update({
    where: { id: id! },
    data: {
      status: 'PAID',
      paidDate: new Date(),
    },
  });

  logger.info(`Invoice marked as paid: ${invoice.invoiceNumber} by user ${req.user!.email}`);

  res.json({
    success: true,
    message: 'Invoice marked as paid successfully',
  });
};
