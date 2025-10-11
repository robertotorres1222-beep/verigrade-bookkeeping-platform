import { prisma } from '../config/database'

export interface AuditLogData {
  userId?: string
  organizationId?: string
  action: string
  resource: string
  resourceId?: string
  changes?: any
  ipAddress?: string
  userAgent?: string
  metadata?: any
}

export const auditService = {
  async logAction(data: AuditLogData) {
    try {
      await prisma.auditLog.create({
        data: {
          userId: data.userId,
          organizationId: data.organizationId,
          action: data.action,
          resource: data.resource,
          resourceId: data.resourceId,
          changes: data.changes,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          metadata: data.metadata
        }
      })
    } catch (error) {
      console.error('Failed to log audit action:', error)
      // Don't throw error to avoid breaking the main operation
    }
  },

  async getAuditLogs(organizationId: string, options: {
    page?: number
    limit?: number
    userId?: string
    action?: string
    resource?: string
    startDate?: Date
    endDate?: Date
  } = {}) {
    const {
      page = 1,
      limit = 50,
      userId,
      action,
      resource,
      startDate,
      endDate
    } = options

    const where: any = {
      organizationId
    }

    if (userId) where.userId = userId
    if (action) where.action = action
    if (resource) where.resource = resource
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = startDate
      if (endDate) where.createdAt.lte = endDate
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
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
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.auditLog.count({ where })
    ])

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  },

  async getAuditStats(organizationId: string, days: number = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const [
      totalActions,
      actionsByUser,
      actionsByType,
      recentActions
    ] = await Promise.all([
      // Total actions in period
      prisma.auditLog.count({
        where: {
          organizationId,
          createdAt: { gte: startDate }
        }
      }),

      // Actions by user
      prisma.auditLog.groupBy({
        by: ['userId'],
        where: {
          organizationId,
          createdAt: { gte: startDate }
        },
        _count: true,
        orderBy: { _count: { userId: 'desc' } },
        take: 10
      }),

      // Actions by type
      prisma.auditLog.groupBy({
        by: ['action'],
        where: {
          organizationId,
          createdAt: { gte: startDate }
        },
        _count: true,
        orderBy: { _count: { action: 'desc' } }
      }),

      // Recent actions
      prisma.auditLog.findMany({
        where: {
          organizationId,
          createdAt: { gte: startDate }
        },
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
        take: 20
      })
    ])

    return {
      totalActions,
      actionsByUser,
      actionsByType,
      recentActions,
      period: { days, startDate, endDate: new Date() }
    }
  }
}




