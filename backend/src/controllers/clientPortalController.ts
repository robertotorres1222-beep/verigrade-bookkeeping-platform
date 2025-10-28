import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../config/database';

export const clientPortalController = {
  // Get client portal dashboard
  async getDashboard(req: AuthenticatedRequest, res: Response) {
    try {
      const { organizationId } = req.params;

      // Verify user has access to this organization's portal
      const portalAccess = await prisma.clientPortalAccess.findFirst({
        where: {
          userId: req.user!.id,
          clientOrganization: {
            organizationId,
          },
          isActive: true,
        },
        include: {
          clientOrganization: {
            include: {
              organization: {
                include: {
                  transactions: {
                    where: {
                      date: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Current month
                      },
                    },
                    orderBy: { date: 'desc' },
                    take: 20,
                  },
                  invoices: {
                    where: {
                      createdAt: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                      },
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                  },
                  expenses: {
                    where: {
                      date: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                      },
                    },
                    orderBy: { date: 'desc' },
                    take: 20,
                  },
                },
              },
            },
          },
        },
      });

      if (!portalAccess) {
        return res.status(403).json({ error: 'Access denied to client portal' });
      }

      const organization = portalAccess.clientOrganization.organization;

      // Calculate financial metrics
      const totalIncome = organization.transactions
        .filter((t) => t.type === 'INCOME')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const totalExpenses = organization.transactions
        .filter((t) => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const netIncome = totalIncome - totalExpenses;

      // Get outstanding invoices
      const outstandingInvoices = organization.invoices.filter(
        (invoice) => invoice.status !== 'paid'
      );

      const totalOutstanding = outstandingInvoices.reduce(
        (sum, invoice) => sum + Number(invoice.total),
        0
      );

      // Get recent activity
      const recentActivity = [
        ...organization.transactions.slice(0, 10).map((t) => ({
          type: 'transaction',
          id: t.id,
          description: t.description,
          amount: t.amount,
          date: t.date,
          category: t.category,
        })),
        ...organization.invoices.slice(0, 5).map((i) => ({
          type: 'invoice',
          id: i.id,
          description: `Invoice #${i.invoiceNumber}`,
          amount: i.total,
          date: i.createdAt,
          status: i.status,
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return res.json({
        organization: {
          id: organization.id,
          name: organization.name,
          industry: organization.industry,
        },
        metrics: {
          totalIncome,
          totalExpenses,
          netIncome,
          totalOutstanding,
          outstandingInvoicesCount: outstandingInvoices.length,
        },
        recentActivity: recentActivity.slice(0, 15),
        transactions: organization.transactions,
        invoices: organization.invoices,
        expenses: organization.expenses,
      });
    } catch (error: any) {
      console.error('Get client portal dashboard error:', error);
      return res.status(500).json({ error: 'Failed to get client portal dashboard' });
    }
  },

  // Get client documents
  async getDocuments(req: AuthenticatedRequest, res: Response) {
    try {
      const { organizationId } = req.params;
      const { type, page = 1, limit = 20 } = req.query;

      // Verify portal access
      const portalAccess = await prisma.clientPortalAccess.findFirst({
        where: {
          userId: req.user!.id,
          clientOrganization: {
            organizationId,
          },
          isActive: true,
        },
      });

      if (!portalAccess) {
        return res.status(403).json({ error: 'Access denied to client portal' });
      }

      const where: any = {
        organizationId,
      };

      if (type) {
        where.type = type;
      }

      const documents = await prisma.uploadedFile.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      const total = await prisma.uploadedFile.count({ where });

      return res.json({
        documents,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error: any) {
      console.error('Get client documents error:', error);
      return res.status(500).json({ error: 'Failed to get client documents' });
    }
  },

  // Approve/reject transaction categorization
  async approveTransaction(req: AuthenticatedRequest, res: Response) {
    try {
      const { organizationId, transactionId } = req.params;
      const { action, comments } = req.body; // action: 'approve' | 'reject'

      if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({ error: 'Invalid action. Must be approve or reject' });
      }

      // Verify portal access
      const portalAccess = await prisma.clientPortalAccess.findFirst({
        where: {
          userId: req.user!.id,
          clientOrganization: {
            organizationId,
          },
          isActive: true,
        },
      });

      if (!portalAccess) {
        return res.status(403).json({ error: 'Access denied to client portal' });
      }

      // Update transaction with client approval
      const transaction = await prisma.transaction.update({
        where: {
          id: transactionId,
          organizationId,
        },
        data: {
          metadata: {
            clientApproval: {
              action,
              approvedBy: req.user!.id,
              approvedAt: new Date(),
              comments,
            },
          },
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          organizationId,
          userId: req.user!.id,
          action: `CLIENT_${action.toUpperCase()}_TRANSACTION`,
          resource: 'Transaction',
          resourceId: transactionId,
          changes: {
            clientApproval: action,
            comments,
          },
        },
      });

      return res.json({
        message: `Transaction ${action}d successfully`,
        transaction,
      });
    } catch (error: any) {
      console.error('Approve transaction error:', error);
      return res.status(500).json({ error: 'Failed to approve transaction' });
    }
  },

  // Get client reports
  async getReports(req: AuthenticatedRequest, res: Response) {
    try {
      const { organizationId } = req.params;
      const { type, startDate, endDate } = req.query;

      // Verify portal access
      const portalAccess = await prisma.clientPortalAccess.findFirst({
        where: {
          userId: req.user!.id,
          clientOrganization: {
            organizationId,
          },
          isActive: true,
        },
      });

      if (!portalAccess) {
        return res.status(403).json({ error: 'Access denied to client portal' });
      }

      const where: any = {
        organizationId,
        status: 'COMPLETED',
      };

      if (type) {
        where.type = type;
      }

      if (startDate && endDate) {
        where.createdAt = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string),
        };
      }

      const reports = await prisma.report.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      return res.json({ reports });
    } catch (error: any) {
      console.error('Get client reports error:', error);
      return res.status(500).json({ error: 'Failed to get client reports' });
    }
  },

  // Send message to practice
  async sendMessage(req: AuthenticatedRequest, res: Response) {
    try {
      const { organizationId } = req.params;
      const { subject, content, priority = 'NORMAL' } = req.body;

      if (!subject || !content) {
        return res.status(400).json({ error: 'Subject and content are required' });
      }

      // Verify portal access
      const portalAccess = await prisma.clientPortalAccess.findFirst({
        where: {
          userId: req.user!.id,
          clientOrganization: {
            organizationId,
          },
          isActive: true,
        },
        include: {
          clientOrganization: {
            include: {
              practice: true,
            },
          },
        },
      });

      if (!portalAccess) {
        return res.status(403).json({ error: 'Access denied to client portal' });
      }

      // Create client request
      const request = await prisma.clientRequest.create({
        data: {
          organizationId,
          practiceId: portalAccess.clientOrganization.practiceId,
          requestedBy: req.user!.id,
          title: subject,
          description: content,
          type: 'CLARIFICATION',
          priority: priority.toUpperCase(),
          status: 'OPEN',
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          organizationId,
          userId: req.user!.id,
          action: 'CLIENT_MESSAGE_SENT',
          resource: 'ClientRequest',
          resourceId: request.id,
          changes: {
            subject,
            priority,
          },
        },
      });

      return res.status(201).json({
        message: 'Message sent successfully',
        request,
      });
    } catch (error: any) {
      console.error('Send message error:', error);
      return res.status(500).json({ error: 'Failed to send message' });
    }
  },

  // Get client messages/requests
  async getMessages(req: AuthenticatedRequest, res: Response) {
    try {
      const { organizationId } = req.params;
      const { status, page = 1, limit = 20 } = req.query;

      // Verify portal access
      const portalAccess = await prisma.clientPortalAccess.findFirst({
        where: {
          userId: req.user!.id,
          clientOrganization: {
            organizationId,
          },
          isActive: true,
        },
      });

      if (!portalAccess) {
        return res.status(403).json({ error: 'Access denied to client portal' });
      }

      const where: any = {
        organizationId,
        requestedBy: req.user!.id,
      };

      if (status) {
        where.status = status;
      }

      const messages = await prisma.clientRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
          assignedUser: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      const total = await prisma.clientRequest.count({ where });

      return res.json({
        messages,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error: any) {
      console.error('Get client messages error:', error);
      return res.status(500).json({ error: 'Failed to get client messages' });
    }
  },

  // Upload document to client portal
  async uploadDocument(req: AuthenticatedRequest, res: Response) {
    try {
      const { organizationId } = req.params;
      const { type = 'DOCUMENT', description } = req.body;

      // Verify portal access
      const portalAccess = await prisma.clientPortalAccess.findFirst({
        where: {
          userId: req.user!.id,
          clientOrganization: {
            organizationId,
          },
          isActive: true,
        },
      });

      if (!portalAccess) {
        return res.status(403).json({ error: 'Access denied to client portal' });
      }

      // Handle file upload (assuming multer middleware is used)
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const document = await prisma.uploadedFile.create({
        data: {
          originalName: req.file.originalname,
          fileName: req.file.filename,
          filePath: req.file.path,
          fileUrl: `/uploads/${req.file.filename}`,
          mimeType: req.file.mimetype,
          fileSize: req.file.size,
          type,
          organizationId,
          userId: req.user!.id,
        },
      });

      return res.status(201).json({
        message: 'Document uploaded successfully',
        document,
      });
    } catch (error: any) {
      console.error('Upload document error:', error);
      return res.status(500).json({ error: 'Failed to upload document' });
    }
  },
};

