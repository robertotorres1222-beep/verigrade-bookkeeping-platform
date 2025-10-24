import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../config/database';

export const taxDeadlineController = {
  // Get tax deadlines
  async getTaxDeadlines(req: AuthenticatedRequest, res: Response) {
    try {
      const { year, type, status, clientId } = req.query;

      const where: any = {};

      if (year) {
        where.year = year;
      }

      if (type) {
        where.type = type;
      }

      if (status) {
        where.status = status;
      }

      if (clientId) {
        where.clientId = clientId;
      }

      // Mock tax deadlines data
      const mockDeadlines = [
        {
          id: 'deadline-1',
          title: 'Individual Tax Returns (Form 1040)',
          type: 'INDIVIDUAL',
          dueDate: '2024-04-15',
          status: 'UPCOMING',
          priority: 'HIGH',
          description: 'Deadline for filing individual tax returns',
          clientId: 'client-1',
          year: 2023,
          reminders: [
            { date: '2024-03-15', message: '30 days until deadline' },
            { date: '2024-04-01', message: '14 days until deadline' },
            { date: '2024-04-10', message: '5 days until deadline' },
          ],
        },
        {
          id: 'deadline-2',
          title: 'Corporate Tax Returns (Form 1120)',
          type: 'CORPORATE',
          dueDate: '2024-03-15',
          status: 'OVERDUE',
          priority: 'URGENT',
          description: 'Deadline for filing corporate tax returns',
          clientId: 'client-2',
          year: 2023,
          reminders: [],
        },
        {
          id: 'deadline-3',
          title: 'Quarterly Estimated Tax Payment (Q1)',
          type: 'ESTIMATED_TAX',
          dueDate: '2024-04-15',
          status: 'UPCOMING',
          priority: 'MEDIUM',
          description: 'First quarter estimated tax payment',
          clientId: 'client-3',
          year: 2024,
          reminders: [
            { date: '2024-04-01', message: '14 days until payment due' },
          ],
        },
        {
          id: 'deadline-4',
          title: 'Payroll Tax Returns (Form 941)',
          type: 'PAYROLL',
          dueDate: '2024-04-30',
          status: 'UPCOMING',
          priority: 'HIGH',
          description: 'Quarterly payroll tax return',
          clientId: 'client-1',
          year: 2024,
          reminders: [
            { date: '2024-04-15', message: '15 days until deadline' },
          ],
        },
        {
          id: 'deadline-5',
          title: 'Sales Tax Return',
          type: 'SALES_TAX',
          dueDate: '2024-04-20',
          status: 'UPCOMING',
          priority: 'MEDIUM',
          description: 'Monthly sales tax return',
          clientId: 'client-2',
          year: 2024,
          reminders: [
            { date: '2024-04-10', message: '10 days until deadline' },
          ],
        },
      ];

      const filteredDeadlines = mockDeadlines.filter(deadline => {
        if (year && deadline.year !== Number(year)) return false;
        if (type && deadline.type !== type) return false;
        if (status && deadline.status !== status) return false;
        if (clientId && deadline.clientId !== clientId) return false;
        return true;
      });

      return res.json({ deadlines: filteredDeadlines });
    } catch (error: any) {
      console.error('Get tax deadlines error:', error);
      return res.status(500).json({ error: 'Failed to get tax deadlines' });
    }
  },

  // Create tax deadline
  async createTaxDeadline(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        title,
        type,
        dueDate,
        priority = 'MEDIUM',
        description,
        clientId,
        year,
        reminders = [],
      } = req.body;

      if (!title || !type || !dueDate || !year) {
        return res.status(400).json({ error: 'Title, type, due date, and year are required' });
      }

      const deadline = await prisma.taxDeadline.create({
        data: {
          organizationId: req.user!.organizationId,
          title,
          type,
          dueDate: new Date(dueDate),
          priority,
          description,
          clientId,
          year,
          reminders,
          createdBy: req.user!.id,
        },
      });

      return res.status(201).json({
        message: 'Tax deadline created successfully',
        deadline,
      });
    } catch (error: any) {
      console.error('Create tax deadline error:', error);
      return res.status(500).json({ error: 'Failed to create tax deadline' });
    }
  },

  // Update tax deadline
  async updateTaxDeadline(req: AuthenticatedRequest, res: Response) {
    try {
      const { deadlineId } = req.params;
      const updateData = req.body;

      const deadline = await prisma.taxDeadline.update({
        where: { id: deadlineId },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
      });

      return res.json({
        message: 'Tax deadline updated successfully',
        deadline,
      });
    } catch (error: any) {
      console.error('Update tax deadline error:', error);
      return res.status(500).json({ error: 'Failed to update tax deadline' });
    }
  },

  // Mark deadline as completed
  async completeTaxDeadline(req: AuthenticatedRequest, res: Response) {
    try {
      const { deadlineId } = req.params;
      const { notes, completedAt } = req.body;

      const deadline = await prisma.taxDeadline.update({
        where: { id: deadlineId },
        data: {
          status: 'COMPLETED',
          completedAt: completedAt ? new Date(completedAt) : new Date(),
          completionNotes: notes,
        },
      });

      return res.json({
        message: 'Tax deadline marked as completed',
        deadline,
      });
    } catch (error: any) {
      console.error('Complete tax deadline error:', error);
      return res.status(500).json({ error: 'Failed to complete tax deadline' });
    }
  },

  // Get tax deadline calendar
  async getTaxDeadlineCalendar(req: AuthenticatedRequest, res: Response) {
    try {
      const { year, month } = req.query;

      const targetYear = year || new Date().getFullYear();
      const targetMonth = month || new Date().getMonth() + 1;

      // Mock calendar data
      const calendar = {
        year: Number(targetYear),
        month: Number(targetMonth),
        deadlines: [
          {
            id: 'deadline-1',
            title: 'Individual Tax Returns',
            dueDate: '2024-04-15',
            status: 'UPCOMING',
            priority: 'HIGH',
            clientId: 'client-1',
          },
          {
            id: 'deadline-2',
            title: 'Corporate Tax Returns',
            dueDate: '2024-03-15',
            status: 'OVERDUE',
            priority: 'URGENT',
            clientId: 'client-2',
          },
          {
            id: 'deadline-3',
            title: 'Quarterly Estimated Tax',
            dueDate: '2024-04-15',
            status: 'UPCOMING',
            priority: 'MEDIUM',
            clientId: 'client-3',
          },
        ],
        summary: {
          totalDeadlines: 3,
          upcoming: 2,
          overdue: 1,
          completed: 0,
        },
      };

      return res.json({ calendar });
    } catch (error: any) {
      console.error('Get tax deadline calendar error:', error);
      return res.status(500).json({ error: 'Failed to get tax deadline calendar' });
    }
  },

  // Get tax deadline statistics
  async getTaxDeadlineStatistics(req: AuthenticatedRequest, res: Response) {
    try {
      const { year, clientId } = req.query;

      // Mock statistics
      const statistics = {
        totalDeadlines: 25,
        deadlinesByStatus: {
          'UPCOMING': 15,
          'OVERDUE': 3,
          'COMPLETED': 7,
        },
        deadlinesByType: {
          'INDIVIDUAL': 8,
          'CORPORATE': 5,
          'ESTIMATED_TAX': 6,
          'PAYROLL': 4,
          'SALES_TAX': 2,
        },
        deadlinesByPriority: {
          'URGENT': 3,
          'HIGH': 8,
          'MEDIUM': 10,
          'LOW': 4,
        },
        averageCompletionTime: 5.2, // days
        onTimeRate: 85.5, // percentage
        year: year || new Date().getFullYear(),
      };

      return res.json({ statistics });
    } catch (error: any) {
      console.error('Get tax deadline statistics error:', error);
      return res.status(500).json({ error: 'Failed to get tax deadline statistics' });
    }
  },
};

