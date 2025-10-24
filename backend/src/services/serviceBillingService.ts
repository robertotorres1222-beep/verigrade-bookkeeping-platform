import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class ServiceBillingService {
  // Calculate billing rates based on client and service type
  static async calculateBillingRate(
    servicePackageId: string,
    clientId: string,
    organizationId: string
  ): Promise<number> {
    const servicePackage = await prisma.servicePackage.findFirst({
      where: { id: servicePackageId, organizationId }
    });

    if (!servicePackage) {
      throw new AppError('Service package not found', 404);
    }

    // Check for client-specific rates
    const clientRate = await prisma.clientRate.findFirst({
      where: {
        clientId,
        servicePackageId,
        organizationId,
        isActive: true
      }
    });

    if (clientRate) {
      return clientRate.rate;
    }

    // Check for user-specific rates
    const userRate = await prisma.userRate.findFirst({
      where: {
        servicePackageId,
        organizationId,
        isActive: true
      }
    });

    if (userRate) {
      return userRate.rate;
    }

    // Return default package rate
    return servicePackage.hourlyRate;
  }

  // Generate time tracking summary for dashboard
  static async getTimeTrackingSummary(
    organizationId: string,
    userId?: string,
    startDate?: Date,
    endDate?: Date
  ) {
    const where = {
      organizationId,
      ...(userId && { userId }),
      ...(startDate && endDate && {
        date: {
          gte: startDate,
          lte: endDate
        }
      })
    };

    const timeEntries = await prisma.timeEntry.findMany({
      where,
      include: {
        servicePackage: {
          select: { name: true, billingType: true }
        },
        client: {
          select: { name: true }
        }
      }
    });

    const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0);
    const totalAmount = timeEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const billableHours = timeEntries
      .filter(entry => entry.isBillable)
      .reduce((sum, entry) => sum + entry.hours, 0);

    // Group by service package
    const byPackage = timeEntries.reduce((acc, entry) => {
      const packageId = entry.servicePackageId;
      if (!acc[packageId]) {
        acc[packageId] = {
          package: entry.servicePackage,
          totalHours: 0,
          totalAmount: 0,
          entryCount: 0
        };
      }
      acc[packageId].totalHours += entry.hours;
      acc[packageId].totalAmount += entry.amount;
      acc[packageId].entryCount += 1;
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
          entryCount: 0
        };
      }
      acc[clientId].totalHours += entry.hours;
      acc[clientId].totalAmount += entry.amount;
      acc[clientId].entryCount += 1;
      return acc;
    }, {} as any);

    return {
      summary: {
        totalHours,
        totalAmount,
        billableHours,
        nonBillableHours: totalHours - billableHours,
        entryCount: timeEntries.length
      },
      byPackage: Object.values(byPackage),
      byClient: Object.values(byClient)
    };
  }

  // Generate service invoice with line items
  static async generateServiceInvoice(
    organizationId: string,
    clientId: string,
    servicePackageId: string,
    timeEntryIds: string[],
    invoiceData: {
      invoiceDate: Date;
      dueDate: Date;
      notes?: string;
    }
  ) {
    // Get time entries
    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        id: { in: timeEntryIds },
        organizationId,
        clientId,
        servicePackageId,
        isBillable: true
      },
      include: {
        servicePackage: true,
        user: {
          select: { firstName: true, lastName: true }
        }
      }
    });

    if (timeEntries.length === 0) {
      throw new AppError('No billable time entries found', 400);
    }

    // Calculate totals
    const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0);
    const totalAmount = timeEntries.reduce((sum, entry) => sum + entry.amount, 0);

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber(organizationId);

    // Create service invoice
    const serviceInvoice = await prisma.serviceInvoice.create({
      data: {
        organizationId,
        clientId,
        servicePackageId,
        invoiceNumber,
        invoiceDate: invoiceData.invoiceDate,
        dueDate: invoiceData.dueDate,
        totalHours,
        totalAmount,
        notes: invoiceData.notes,
        status: 'DRAFT'
      }
    });

    // Create line items
    const lineItems = timeEntries.map(entry => ({
      serviceInvoiceId: serviceInvoice.id,
      timeEntryId: entry.id,
      description: entry.description,
      hours: entry.hours,
      rate: entry.rate,
      amount: entry.amount,
      date: entry.date
    }));

    await prisma.serviceInvoiceLineItem.createMany({
      data: lineItems
    });

    return serviceInvoice;
  }

  // Generate unique invoice number
  static async generateInvoiceNumber(organizationId: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `SI-${year}`;
    
    const lastInvoice = await prisma.serviceInvoice.findFirst({
      where: {
        organizationId,
        invoiceNumber: {
          startsWith: prefix
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    let sequence = 1;
    if (lastInvoice) {
      const lastSequence = parseInt(lastInvoice.invoiceNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }

    return `${prefix}-${sequence.toString().padStart(4, '0')}`;
  }

  // Calculate project profitability
  static async calculateProjectProfitability(
    organizationId: string,
    servicePackageId: string,
    startDate?: Date,
    endDate?: Date
  ) {
    const where = {
      organizationId,
      servicePackageId,
      ...(startDate && endDate && {
        date: {
          gte: startDate,
          lte: endDate
        }
      })
    };

    const timeEntries = await prisma.timeEntry.findMany({
      where,
      include: {
        servicePackage: true,
        client: true
      }
    });

    const totalRevenue = timeEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0);
    const averageRate = totalHours > 0 ? totalRevenue / totalHours : 0;

    // Calculate costs (this would be enhanced with actual cost tracking)
    const estimatedCosts = totalHours * 25; // Example: $25/hour cost
    const profit = totalRevenue - estimatedCosts;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalHours,
      averageRate,
      estimatedCosts,
      profit,
      profitMargin,
      timeEntries: timeEntries.length
    };
  }

  // Get time tracking analytics
  static async getTimeTrackingAnalytics(
    organizationId: string,
    period: 'week' | 'month' | 'quarter' | 'year' = 'month'
  ) {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        organizationId,
        date: {
          gte: startDate,
          lte: now
        }
      },
      include: {
        servicePackage: true,
        client: true,
        user: {
          select: { firstName: true, lastName: true }
        }
      }
    });

    // Daily breakdown
    const dailyBreakdown = timeEntries.reduce((acc, entry) => {
      const date = entry.date.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, hours: 0, amount: 0, entries: 0 };
      }
      acc[date].hours += entry.hours;
      acc[date].amount += entry.amount;
      acc[date].entries += 1;
      return acc;
    }, {} as any);

    // Top performers
    const byUser = timeEntries.reduce((acc, entry) => {
      const userId = entry.userId;
      if (!acc[userId]) {
        acc[userId] = {
          user: entry.user,
          totalHours: 0,
          totalAmount: 0,
          entries: 0
        };
      }
      acc[userId].totalHours += entry.hours;
      acc[userId].totalAmount += entry.amount;
      acc[userId].entries += 1;
      return acc;
    }, {} as any);

    const topPerformers = Object.values(byUser)
      .sort((a: any, b: any) => b.totalHours - a.totalHours)
      .slice(0, 5);

    // Most profitable clients
    const byClient = timeEntries.reduce((acc, entry) => {
      const clientId = entry.clientId;
      if (!acc[clientId]) {
        acc[clientId] = {
          client: entry.client,
          totalHours: 0,
          totalAmount: 0,
          entries: 0
        };
      }
      acc[clientId].totalHours += entry.hours;
      acc[clientId].totalAmount += entry.amount;
      acc[clientId].entries += 1;
      return acc;
    }, {} as any);

    const topClients = Object.values(byClient)
      .sort((a: any, b: any) => b.totalAmount - a.totalAmount)
      .slice(0, 5);

    return {
      period,
      startDate,
      endDate: now,
      summary: {
        totalHours: timeEntries.reduce((sum, entry) => sum + entry.hours, 0),
        totalAmount: timeEntries.reduce((sum, entry) => sum + entry.amount, 0),
        totalEntries: timeEntries.length,
        averageRate: timeEntries.length > 0 
          ? timeEntries.reduce((sum, entry) => sum + entry.amount, 0) / 
            timeEntries.reduce((sum, entry) => sum + entry.hours, 0)
          : 0
      },
      dailyBreakdown: Object.values(dailyBreakdown),
      topPerformers,
      topClients
    };
  }

  // Validate time entry
  static async validateTimeEntry(
    organizationId: string,
    timeEntryData: {
      servicePackageId: string;
      clientId: string;
      hours: number;
      rate: number;
      date: Date;
    }
  ) {
    // Check if service package exists and is active
    const servicePackage = await prisma.servicePackage.findFirst({
      where: {
        id: timeEntryData.servicePackageId,
        organizationId,
        isActive: true
      }
    });

    if (!servicePackage) {
      throw new AppError('Service package not found or inactive', 404);
    }

    // Check if client exists
    const client = await prisma.client.findFirst({
      where: {
        id: timeEntryData.clientId,
        organizationId
      }
    });

    if (!client) {
      throw new AppError('Client not found', 404);
    }

    // Validate hours
    if (timeEntryData.hours <= 0) {
      throw new AppError('Hours must be greater than 0', 400);
    }

    if (timeEntryData.hours > 24) {
      throw new AppError('Hours cannot exceed 24 per day', 400);
    }

    // Validate rate
    if (timeEntryData.rate <= 0) {
      throw new AppError('Rate must be greater than 0', 400);
    }

    // Check for overlapping time entries
    const startOfDay = new Date(timeEntryData.date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(timeEntryData.date);
    endOfDay.setHours(23, 59, 59, 999);

    const overlappingEntries = await prisma.timeEntry.findMany({
      where: {
        organizationId,
        clientId: timeEntryData.clientId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    if (overlappingEntries.length > 0) {
      // Check for actual time overlaps (this would require start/end times)
      console.warn('Potential time overlap detected');
    }

    return true;
  }
}

