import { prisma } from '../config/database';
import PDFDocument from 'pdfkit';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface CreateInvoiceData {
  clientId?: string;
  clientName: string;
  clientEmail?: string;
  clientAddress?: string;
  items: InvoiceItemData[];
  dueDate?: Date;
  notes?: string;
  userId: string;
  organizationId: string;
  currency?: string;
  taxRate?: number;
  discount?: number;
}

export interface InvoiceItemData {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
}

export interface UpdateInvoiceData {
  clientName?: string;
  clientEmail?: string;
  clientAddress?: string;
  dueDate?: Date;
  notes?: string;
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  currency?: string;
  taxRate?: number;
  discount?: number;
}

export interface InvoiceFilters {
  userId?: string;
  organizationId?: string;
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  clientId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

// Initialize S3 client if credentials are available
let s3Client: S3Client | null = null;
if (process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY) {
  s3Client = new S3Client({
    region: process.env.S3_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
  });
}

/**
 * Create a new invoice
 */
export async function createInvoice(data: CreateInvoiceData) {
  // Calculate totals
  let subtotal = 0;
  const items = data.items.map(item => {
    const itemTotal = item.quantity * item.unitPrice;
    subtotal += itemTotal;
    return {
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: itemTotal,
      taxRate: item.taxRate || 0
    };
  });

  const discountAmount = data.discount ? (subtotal * data.discount / 100) : 0;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = data.taxRate ? (taxableAmount * data.taxRate / 100) : 0;
  const total = taxableAmount + taxAmount;

  const invoice = await prisma.invoice.create({
    data: {
      clientId: data.clientId,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      clientAddress: data.clientAddress,
      subtotal,
      discountAmount,
      taxAmount,
      total,
      dueDate: data.dueDate,
      notes: data.notes,
      status: 'draft',
      currency: data.currency || 'USD',
      taxRate: data.taxRate || 0,
      discount: data.discount || 0,
      userId: data.userId,
      organizationId: data.organizationId,
      items: {
        create: items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.total,
          taxRate: item.taxRate
        }))
      }
    },
    include: {
      items: true,
      client: true,
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

  return invoice;
}

/**
 * Get invoice by ID
 */
export async function getInvoiceById(id: string, userId?: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      items: true,
      client: true,
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

  // Check if user has access to this invoice
  if (userId && invoice && invoice.userId !== userId) {
    throw new Error('Unauthorized access to invoice');
  }

  return invoice;
}

/**
 * Update an invoice
 */
export async function updateInvoice(id: string, data: UpdateInvoiceData, userId?: string) {
  // First check if invoice exists and user has access
  const existingInvoice = await getInvoiceById(id, userId);
  if (!existingInvoice) {
    throw new Error('Invoice not found');
  }

  const updatedInvoice = await prisma.invoice.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date()
    },
    include: {
      items: true,
      client: true,
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

  return updatedInvoice;
}

/**
 * Delete an invoice
 */
export async function deleteInvoice(id: string, userId?: string) {
  // First check if invoice exists and user has access
  const existingInvoice = await getInvoiceById(id, userId);
  if (!existingInvoice) {
    throw new Error('Invoice not found');
  }

  await prisma.invoice.delete({
    where: { id }
  });

  return { success: true };
}

/**
 * Get invoices with filtering and pagination
 */
export async function getInvoices(
  filters: InvoiceFilters = {},
  pagination: { page?: number; limit?: number; sortBy?: string; sortOrder?: 'asc' | 'desc' } = {}
) {
  const {
    page = 1,
    limit = 50,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = pagination;

  const {
    userId,
    organizationId,
    status,
    clientId,
    dateFrom,
    dateTo,
    search
  } = filters;

  // Build where clause
  const where: any = {};

  if (userId) where.userId = userId;
  if (organizationId) where.organizationId = organizationId;
  if (status) where.status = status;
  if (clientId) where.clientId = clientId;

  // Date range filter
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = dateFrom;
    if (dateTo) where.createdAt.lte = dateTo;
  }

  // Search filter
  if (search) {
    where.OR = [
      { invoiceNumber: { contains: search, mode: 'insensitive' } },
      { clientName: { contains: search, mode: 'insensitive' } },
      { clientEmail: { contains: search, mode: 'insensitive' } }
    ];
  }

  // Calculate offset
  const skip = (page - 1) * limit;

  // Execute queries in parallel
  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        items: true,
        client: true,
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
    prisma.invoice.count({ where })
  ]);

  return {
    invoices,
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
 * Generate PDF for an invoice
 */
export async function generateInvoicePDF(invoiceId: string, userId?: string): Promise<Buffer> {
  const invoice = await getInvoiceById(invoiceId, userId);
  if (!invoice) {
    throw new Error('Invoice not found');
  }

  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const buffers: Buffer[] = [];

  doc.on('data', buffers.push.bind(buffers));

  // Header
  doc.fontSize(24)
     .text('INVOICE', { align: 'right' })
     .moveDown();

  // Invoice details
  doc.fontSize(10)
     .text(`Invoice #: ${invoice.invoiceNumber || invoice.id}`, 50, 100)
     .text(`Date: ${invoice.createdAt.toLocaleDateString()}`, 50, 120)
     .text(`Due Date: ${invoice.dueDate ? invoice.dueDate.toLocaleDateString() : 'N/A'}`, 50, 140)
     .text(`Status: ${invoice.status.toUpperCase()}`, 50, 160);

  // Client details
  doc.text(`Bill To:`, 350, 100)
     .text(invoice.clientName, 350, 120);
  
  if (invoice.clientEmail) {
    doc.text(invoice.clientEmail, 350, 140);
  }
  
  if (invoice.clientAddress) {
    const addressLines = invoice.clientAddress.split('\n');
    addressLines.forEach((line, index) => {
      doc.text(line, 350, 160 + (index * 20));
    });
  }

  // Items table header
  const tableTop = 250;
  doc.fontSize(12)
     .text('Description', 50, tableTop)
     .text('Qty', 350, tableTop)
     .text('Price', 400, tableTop)
     .text('Total', 500, tableTop)
     .moveTo(50, tableTop + 20)
     .lineTo(550, tableTop + 20)
     .stroke();

  // Items
  let currentY = tableTop + 30;
  invoice.items.forEach(item => {
    doc.fontSize(10)
       .text(item.description, 50, currentY, { width: 280 })
       .text(item.quantity.toString(), 350, currentY)
       .text(`$${item.unitPrice.toFixed(2)}`, 400, currentY)
       .text(`$${item.total.toFixed(2)}`, 500, currentY);
    currentY += 25;
  });

  // Totals
  currentY += 20;
  doc.fontSize(10)
     .text(`Subtotal: $${invoice.subtotal.toFixed(2)}`, { align: 'right' })
     .moveDown(0.5);

  if (invoice.discount > 0) {
    doc.text(`Discount (${invoice.discount}%): -$${invoice.discountAmount.toFixed(2)}`, { align: 'right' })
       .moveDown(0.5);
  }

  if (invoice.taxRate > 0) {
    doc.text(`Tax (${invoice.taxRate}%): $${invoice.taxAmount.toFixed(2)}`, { align: 'right' })
       .moveDown(0.5);
  }

  doc.fontSize(14)
     .text(`Total: $${invoice.total.toFixed(2)}`, { align: 'right' })
     .moveDown();

  // Notes
  if (invoice.notes) {
    doc.fontSize(10)
       .text('Notes:', 50, currentY + 50)
       .text(invoice.notes, 50, currentY + 70, { width: 400 });
  }

  // Footer
  doc.fontSize(8)
     .text('Thank you for your business!', { align: 'center' }, 0, 750);

  doc.end();

  return new Promise((resolve, reject) => {
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });
    doc.on('error', reject);
  });
}

/**
 * Upload invoice PDF to S3 and return signed URL
 */
export async function uploadInvoicePDFToS3(invoiceId: string, pdfBuffer: Buffer): Promise<string> {
  if (!s3Client || !process.env.S3_BUCKET) {
    throw new Error('S3 not configured');
  }

  const key = `invoices/${invoiceId}.pdf`;
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: pdfBuffer,
    ContentType: 'application/pdf',
    ContentDisposition: `attachment; filename="invoice-${invoiceId}.pdf"`
  });

  await s3Client.send(command);

  // Generate signed URL (valid for 7 days)
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 604800 });
  
  // Update invoice with PDF URL
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { pdfUrl: signedUrl }
  });

  return signedUrl;
}

/**
 * Get invoice statistics
 */
export async function getInvoiceStats(filters: InvoiceFilters = {}) {
  const {
    userId,
    organizationId,
    status,
    dateFrom,
    dateTo
  } = filters;

  const where: any = {};

  if (userId) where.userId = userId;
  if (organizationId) where.organizationId = organizationId;
  if (status) where.status = status;

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = dateFrom;
    if (dateTo) where.createdAt.lte = dateTo;
  }

  const [
    totalCount,
    totalAmount,
    paidAmount,
    overdueAmount,
    statusBreakdown
  ] = await Promise.all([
    prisma.invoice.count({ where }),
    prisma.invoice.aggregate({
      where,
      _sum: { total: true }
    }),
    prisma.invoice.aggregate({
      where: { ...where, status: 'paid' },
      _sum: { total: true }
    }),
    prisma.invoice.aggregate({
      where: { ...where, status: 'overdue' },
      _sum: { total: true }
    }),
    prisma.invoice.groupBy({
      by: ['status'],
      where,
      _sum: { total: true },
      _count: { id: true }
    })
  ]);

  return {
    totalCount,
    totalAmount: totalAmount._sum.total || 0,
    paidAmount: paidAmount._sum.total || 0,
    overdueAmount: overdueAmount._sum.total || 0,
    outstandingAmount: (totalAmount._sum.total || 0) - (paidAmount._sum.total || 0),
    statusBreakdown: statusBreakdown.map(item => ({
      status: item.status,
      count: item._count.id,
      totalAmount: item._sum.total || 0
    }))
  };
}

export default {
  createInvoice,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  getInvoices,
  generateInvoicePDF,
  uploadInvoicePDFToS3,
  getInvoiceStats
};
