import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export const auditLogController = {
  // Get audit logs with filtering and pagination
  getAuditLogs: async (req: Request, res: Response) => {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        severity = '',
        status = '',
        dateFrom = '',
        dateTo = '',
        action = ''
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      // Build where clause
      const where: any = {};

      if (search) {
        where.OR = [
          { action: { contains: search, mode: 'insensitive' } },
          { resource: { contains: search, mode: 'insensitive' } },
          { user: { email: { contains: search, mode: 'insensitive' } } }
        ];
      }

      if (severity) {
        where.severity = severity;
      }

      if (status) {
        where.status = status;
      }

      if (action) {
        where.action = action;
      }

      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) {
          where.createdAt.gte = new Date(dateFrom as string);
        }
        if (dateTo) {
          where.createdAt.lte = new Date(dateTo as string);
        }
      }

      // Get total count
      const totalCount = await prisma.auditLog.count({ where });

      // Get audit logs
      const auditLogs = await prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      });

      const totalPages = Math.ceil(totalCount / limitNum);

      res.json({
        success: true,
        data: {
          logs: auditLogs,
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalCount,
            hasNext: pageNum < totalPages,
            hasPrev: pageNum > 1
          }
        }
      });
    } catch (error) {
      logger.error('Error fetching audit logs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch audit logs'
      });
    }
  },

  // Get audit log by ID
  getAuditLogById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const auditLog = await prisma.auditLog.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      if (!auditLog) {
        return res.status(404).json({
          success: false,
          message: 'Audit log not found'
        });
      }

      res.json({
        success: true,
        data: auditLog
      });
    } catch (error) {
      logger.error('Error fetching audit log:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch audit log'
      });
    }
  },

  // Export audit logs to CSV
  exportAuditLogs: async (req: Request, res: Response) => {
    try {
      const {
        search = '',
        severity = '',
        status = '',
        dateFrom = '',
        dateTo = '',
        action = ''
      } = req.query;

      // Build where clause (same as getAuditLogs)
      const where: any = {};

      if (search) {
        where.OR = [
          { action: { contains: search, mode: 'insensitive' } },
          { resource: { contains: search, mode: 'insensitive' } },
          { user: { email: { contains: search, mode: 'insensitive' } } }
        ];
      }

      if (severity) {
        where.severity = severity;
      }

      if (status) {
        where.status = status;
      }

      if (action) {
        where.action = action;
      }

      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) {
          where.createdAt.gte = new Date(dateFrom as string);
        }
        if (dateTo) {
          where.createdAt.lte = new Date(dateTo as string);
        }
      }

      // Get all audit logs matching filters
      const auditLogs = await prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Convert to CSV
      const csvHeader = 'Timestamp,User,Action,Resource,Severity,Status,IP Address,User Agent,Details\n';
      const csvRows = auditLogs.map(log => {
        const timestamp = new Date(log.createdAt).toISOString();
        const user = `${log.user.firstName} ${log.user.lastName} (${log.user.email})`;
        const details = JSON.stringify(log.details).replace(/"/g, '""');
        
        return `"${timestamp}","${user}","${log.action}","${log.resource}","${log.severity}","${log.status}","${log.ipAddress}","${log.userAgent}","${details}"`;
      }).join('\n');

      const csv = csvHeader + csvRows;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csv);
    } catch (error) {
      logger.error('Error exporting audit logs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export audit logs'
      });
    }
  },

  // Get audit log statistics
  getAuditLogStats: async (req: Request, res: Response) => {
    try {
      const { period = '7d' } = req.query;

      let dateFilter: Date;
      switch (period) {
        case '24h':
          dateFilter = new Date(Date.now() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      }

      // Get statistics
      const [
        totalLogs,
        severityStats,
        statusStats,
        actionStats,
        recentLogs
      ] = await Promise.all([
        prisma.auditLog.count({
          where: { createdAt: { gte: dateFilter } }
        }),
        prisma.auditLog.groupBy({
          by: ['severity'],
          where: { createdAt: { gte: dateFilter } },
          _count: { severity: true }
        }),
        prisma.auditLog.groupBy({
          by: ['status'],
          where: { createdAt: { gte: dateFilter } },
          _count: { status: true }
        }),
        prisma.auditLog.groupBy({
          by: ['action'],
          where: { createdAt: { gte: dateFilter } },
          _count: { action: true },
          orderBy: { _count: { action: 'desc' } },
          take: 10
        }),
        prisma.auditLog.findMany({
          where: { createdAt: { gte: dateFilter } },
          include: {
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        })
      ]);

      res.json({
        success: true,
        data: {
          totalLogs,
          severityStats,
          statusStats,
          actionStats,
          recentLogs,
          period
        }
      });
    } catch (error) {
      logger.error('Error fetching audit log stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch audit log statistics'
      });
    }
  },

  // Create audit log entry (internal use)
  createAuditLog: async (req: Request, res: Response) => {
    try {
      const {
        userId,
        action,
        resource,
        resourceId,
        details,
        severity = 'low',
        status = 'success',
        ipAddress,
        userAgent
      } = req.body;

      const auditLog = await prisma.auditLog.create({
        data: {
          userId,
          action,
          resource,
          resourceId,
          details,
          severity,
          status,
          ipAddress,
          userAgent
        }
      });

      res.status(201).json({
        success: true,
        data: auditLog
      });
    } catch (error) {
      logger.error('Error creating audit log:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create audit log'
      });
    }
  }
};

