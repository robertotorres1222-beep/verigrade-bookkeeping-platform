import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/jwtAuth';
import { prisma } from '../config/database';
import { ResponseHandler } from '../utils/response';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { auditService } from '../services/auditService';

export const serviceBillingController = {
  // Service Packages
  getServicePackages: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const organizationId = req.user!.organizationId;
    const { page = 1, limit = 50, search } = req.query;

    const where = {
      organizationId,
      ...(search && {
        OR: [
          { name: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } }
        ]
      })
    };

    const packages = await prisma.servicePackage.findMany({
      where,
      include: {
        timeEntries: {
          where: { isActive: true },
          select: { id: true, hours: true, rate: true }
        },
        _count: {
          select: { timeEntries: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const total = await prisma.servicePackage.count({ where });

    return ResponseHandler.success(res, {
      packages,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  }),

  createServicePackage: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { name, description, hourlyRate, fixedPrice, billingType, isActive = true } = req.body;
    const organizationId = req.user!.organizationId;

    const servicePackage = await prisma.servicePackage.create({
      data: {
        name,
        description,
        hourlyRate,
        fixedPrice,
        billingType,
        isActive,
        organizationId
      }
    });

    await auditService.logAction({
      userId: req.user!.id,
      action: 'SERVICE_PACKAGE_CREATED',
      resource: 'ServicePackage',
      resourceId: servicePackage.id,
      changes: { name, billingType, hourlyRate, fixedPrice }
    });

    return ResponseHandler.success(res, servicePackage, 'Service package created successfully');
  }),

  updateServicePackage: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { packageId } = req.params;
    const { name, description, hourlyRate, fixedPrice, billingType, isActive } = req.body;
    const organizationId = req.user!.organizationId;

    const existingPackage = await prisma.servicePackage.findFirst({
      where: { id: packageId, organizationId }
    });

    if (!existingPackage) {
      throw new AppError('Service package not found', 404);
    }

    const servicePackage = await prisma.servicePackage.update({
      where: { id: packageId },
      data: {
        name,
        description,
        hourlyRate,
        fixedPrice,
        billingType,
        isActive
      }
    });

    await auditService.logAction({
      userId: req.user!.id,
      action: 'SERVICE_PACKAGE_UPDATED',
      resource: 'ServicePackage',
      resourceId: packageId,
      changes: { name, billingType, hourlyRate, fixedPrice, isActive }
    });

    return ResponseHandler.success(res, servicePackage, 'Service package updated successfully');
  }),

  deleteServicePackage: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { packageId } = req.params;
    const organizationId = req.user!.organizationId;

    const existingPackage = await prisma.servicePackage.findFirst({
      where: { id: packageId, organizationId }
    });

    if (!existingPackage) {
      throw new AppError('Service package not found', 404);
    }

    // Check if package has active time entries
    const activeEntries = await prisma.timeEntry.count({
      where: { servicePackageId: packageId, isActive: true }
    });

    if (activeEntries > 0) {
      throw new AppError('Cannot delete package with active time entries', 400);
    }

    await prisma.servicePackage.delete({
      where: { id: packageId }
    });

    await auditService.logAction({
      userId: req.user!.id,
      action: 'SERVICE_PACKAGE_DELETED',
      resource: 'ServicePackage',
      resourceId: packageId
    });

    return ResponseHandler.success(res, null, 'Service package deleted successfully');
  }),

  // Time Entries
  getTimeEntries: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const organizationId = req.user!.organizationId;
    const { page = 1, limit = 50, startDate, endDate, packageId, userId } = req.query;

    const where = {
      organizationId,
      ...(startDate && endDate && {
        date: {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        }
      }),
      ...(packageId && { servicePackageId: packageId as string }),
      ...(userId && { userId: userId as string })
    };

    const timeEntries = await prisma.timeEntry.findMany({
      where,
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true }
        },
        servicePackage: {
          select: { id: true, name: true, billingType: true, hourlyRate: true }
        },
        client: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { date: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const total = await prisma.timeEntry.count({ where });

    return ResponseHandler.success(res, {
      timeEntries,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  }),

  createTimeEntry: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const {
      servicePackageId,
      clientId,
      description,
      hours,
      rate,
      date,
      isBillable = true,
      notes
    } = req.body;
    const userId = req.user!.id;
    const organizationId = req.user!.organizationId;

    // Get service package to validate and get default rate
    const servicePackage = await prisma.servicePackage.findFirst({
      where: { id: servicePackageId, organizationId }
    });

    if (!servicePackage) {
      throw new AppError('Service package not found', 404);
    }

    const finalRate = rate || servicePackage.hourlyRate;
    const amount = hours * finalRate;

    const timeEntry = await prisma.timeEntry.create({
      data: {
        userId,
        organizationId,
        servicePackageId,
        clientId,
        description,
        hours,
        rate: finalRate,
        amount,
        date: new Date(date),
        isBillable,
        notes
      },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true }
        },
        servicePackage: {
          select: { id: true, name: true, billingType: true }
        },
        client: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    await auditService.logAction({
      userId,
      action: 'TIME_ENTRY_CREATED',
      resource: 'TimeEntry',
      resourceId: timeEntry.id,
      changes: { servicePackageId, clientId, hours, rate, amount }
    });

    return ResponseHandler.success(res, timeEntry, 'Time entry created successfully');
  }),

  updateTimeEntry: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { entryId } = req.params;
    const {
      servicePackageId,
      clientId,
      description,
      hours,
      rate,
      date,
      isBillable,
      notes
    } = req.body;
    const organizationId = req.user!.organizationId;

    const existingEntry = await prisma.timeEntry.findFirst({
      where: { id: entryId, organizationId }
    });

    if (!existingEntry) {
      throw new AppError('Time entry not found', 404);
    }

    const amount = hours * rate;

    const timeEntry = await prisma.timeEntry.update({
      where: { id: entryId },
      data: {
        servicePackageId,
        clientId,
        description,
        hours,
        rate,
        amount,
        date: new Date(date),
        isBillable,
        notes
      },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true }
        },
        servicePackage: {
          select: { id: true, name: true, billingType: true }
        },
        client: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    await auditService.logAction({
      userId: req.user!.id,
      action: 'TIME_ENTRY_UPDATED',
      resource: 'TimeEntry',
      resourceId: entryId,
      changes: { servicePackageId, clientId, hours, rate, amount }
    });

    return ResponseHandler.success(res, timeEntry, 'Time entry updated successfully');
  }),

  deleteTimeEntry: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { entryId } = req.params;
    const organizationId = req.user!.organizationId;

    const existingEntry = await prisma.timeEntry.findFirst({
      where: { id: entryId, organizationId }
    });

    if (!existingEntry) {
      throw new AppError('Time entry not found', 404);
    }

    await prisma.timeEntry.delete({
      where: { id: entryId }
    });

    await auditService.logAction({
      userId: req.user!.id,
      action: 'TIME_ENTRY_DELETED',
      resource: 'TimeEntry',
      resourceId: entryId
    });

    return ResponseHandler.success(res, null, 'Time entry deleted successfully');
  }),

  // Time Tracking (Start/Stop Timer)
  startTimer: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { servicePackageId, clientId, description } = req.body;
    const userId = req.user!.id;
    const organizationId = req.user!.organizationId;

    // Check if user already has an active timer
    const activeTimer = await prisma.timeEntry.findFirst({
      where: {
        userId,
        organizationId,
        isActive: true,
        endTime: null
      }
    });

    if (activeTimer) {
      throw new AppError('You already have an active timer running', 400);
    }

    const timeEntry = await prisma.timeEntry.create({
      data: {
        userId,
        organizationId,
        servicePackageId,
        clientId,
        description,
        startTime: new Date(),
        isActive: true,
        isBillable: true
      },
      include: {
        servicePackage: {
          select: { id: true, name: true, hourlyRate: true }
        },
        client: {
          select: { id: true, name: true }
        }
      }
    });

    await auditService.logAction({
      userId,
      action: 'TIMER_STARTED',
      resource: 'TimeEntry',
      resourceId: timeEntry.id,
      changes: { servicePackageId, clientId }
    });

    return ResponseHandler.success(res, timeEntry, 'Timer started successfully');
  }),

  stopTimer: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { entryId } = req.params;
    const userId = req.user!.id;
    const organizationId = req.user!.organizationId;

    const timeEntry = await prisma.timeEntry.findFirst({
      where: {
        id: entryId,
        userId,
        organizationId,
        isActive: true
      }
    });

    if (!timeEntry) {
      throw new AppError('Active timer not found', 404);
    }

    const endTime = new Date();
    const startTime = timeEntry.startTime!;
    const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    const amount = hours * timeEntry.rate;

    const updatedEntry = await prisma.timeEntry.update({
      where: { id: entryId },
      data: {
        endTime,
        hours,
        amount,
        isActive: false
      },
      include: {
        servicePackage: {
          select: { id: true, name: true, hourlyRate: true }
        },
        client: {
          select: { id: true, name: true }
        }
      }
    });

    await auditService.logAction({
      userId,
      action: 'TIMER_STOPPED',
      resource: 'TimeEntry',
      resourceId: entryId,
      changes: { hours, amount }
    });

    return ResponseHandler.success(res, updatedEntry, 'Timer stopped successfully');
  }),

  getActiveTimer: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const organizationId = req.user!.organizationId;

    const activeTimer = await prisma.timeEntry.findFirst({
      where: {
        userId,
        organizationId,
        isActive: true,
        endTime: null
      },
      include: {
        servicePackage: {
          select: { id: true, name: true, hourlyRate: true }
        },
        client: {
          select: { id: true, name: true }
        }
      }
    });

    if (activeTimer) {
      const now = new Date();
      const startTime = activeTimer.startTime!;
      const elapsedHours = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      
      return ResponseHandler.success(res, {
        ...activeTimer,
        elapsedHours
      });
    }

    return ResponseHandler.success(res, null);
  }),

  // Service Invoicing
  generateServiceInvoice: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const {
      clientId,
      servicePackageId,
      timeEntryIds,
      startDate,
      endDate,
      invoiceDate,
      dueDate,
      notes
    } = req.body;
    const organizationId = req.user!.organizationId;

    // Get time entries to invoice
    let timeEntries;
    if (timeEntryIds && timeEntryIds.length > 0) {
      timeEntries = await prisma.timeEntry.findMany({
        where: {
          id: { in: timeEntryIds },
          organizationId,
          isBillable: true
        },
        include: {
          servicePackage: true,
          user: {
            select: { firstName: true, lastName: true }
          }
        }
      });
    } else {
      timeEntries = await prisma.timeEntry.findMany({
        where: {
          clientId,
          servicePackageId,
          organizationId,
          isBillable: true,
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        },
        include: {
          servicePackage: true,
          user: {
            select: { firstName: true, lastName: true }
          }
        }
      });
    }

    if (timeEntries.length === 0) {
      throw new AppError('No billable time entries found', 400);
    }

    // Calculate totals
    const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0);
    const totalAmount = timeEntries.reduce((sum, entry) => sum + entry.amount, 0);

    // Create service invoice
    const serviceInvoice = await prisma.serviceInvoice.create({
      data: {
        organizationId,
        clientId,
        servicePackageId,
        invoiceNumber: `SI-${Date.now()}`,
        invoiceDate: new Date(invoiceDate),
        dueDate: new Date(dueDate),
        totalHours,
        totalAmount,
        notes,
        status: 'DRAFT'
      }
    });

    // Create invoice line items
    const lineItems = timeEntries.map(entry => ({
      serviceInvoiceId: serviceInvoice.id,
      timeEntryId: entry.id,
      description: entry.description,
      hours: entry.hours,
      rate: entry.rate,
      amount: entry.amount
    }));

    await prisma.serviceInvoiceLineItem.createMany({
      data: lineItems
    });

    await auditService.logAction({
      userId: req.user!.id,
      action: 'SERVICE_INVOICE_CREATED',
      resource: 'ServiceInvoice',
      resourceId: serviceInvoice.id,
      changes: { clientId, totalHours, totalAmount }
    });

    return ResponseHandler.success(res, serviceInvoice, 'Service invoice generated successfully');
  }),

  getServiceInvoices: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const organizationId = req.user!.organizationId;
    const { page = 1, limit = 50, status, clientId } = req.query;

    const where = {
      organizationId,
      ...(status && { status: status as string }),
      ...(clientId && { clientId: clientId as string })
    };

    const invoices = await prisma.serviceInvoice.findMany({
      where,
      include: {
        client: {
          select: { id: true, name: true, email: true }
        },
        servicePackage: {
          select: { id: true, name: true }
        },
        lineItems: {
          include: {
            timeEntry: {
              select: { id: true, description: true, date: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const total = await prisma.serviceInvoice.count({ where });

    return ResponseHandler.success(res, {
      invoices,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  }),

  // Time Tracking Reports
  getTimeTrackingReport: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const organizationId = req.user!.organizationId;
    const { startDate, endDate, userId, clientId, servicePackageId } = req.query;

    const where = {
      organizationId,
      date: {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      },
      ...(userId && { userId: userId as string }),
      ...(clientId && { clientId: clientId as string }),
      ...(servicePackageId && { servicePackageId: servicePackageId as string })
    };

    const timeEntries = await prisma.timeEntry.findMany({
      where,
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true }
        },
        servicePackage: {
          select: { id: true, name: true }
        },
        client: {
          select: { id: true, name: true }
        }
      },
      orderBy: { date: 'desc' }
    });

    // Calculate summary statistics
    const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0);
    const totalAmount = timeEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const billableHours = timeEntries
      .filter(entry => entry.isBillable)
      .reduce((sum, entry) => sum + entry.hours, 0);

    // Group by user
    const byUser = timeEntries.reduce((acc, entry) => {
      const userId = entry.userId;
      if (!acc[userId]) {
        acc[userId] = {
          user: entry.user,
          totalHours: 0,
          totalAmount: 0,
          entries: []
        };
      }
      acc[userId].totalHours += entry.hours;
      acc[userId].totalAmount += entry.amount;
      acc[userId].entries.push(entry);
      return acc;
    }, {} as any);

    // Group by client
    const byClient = timeEntries.reduce((acc, entry) => {
      const clientId = entry.clientId;
      if (!acc[clientId]) {
        acc[clientId] = {
          client: entry.client,
          totalHours: 0,
          totalAmount: 0,
          entries: []
        };
      }
      acc[clientId].totalHours += entry.hours;
      acc[clientId].totalAmount += entry.amount;
      acc[clientId].entries.push(entry);
      return acc;
    }, {} as any);

    return ResponseHandler.success(res, {
      summary: {
        totalHours,
        totalAmount,
        billableHours,
        nonBillableHours: totalHours - billableHours,
        entryCount: timeEntries.length
      },
      byUser: Object.values(byUser),
      byClient: Object.values(byClient),
      timeEntries
    });
  })
};