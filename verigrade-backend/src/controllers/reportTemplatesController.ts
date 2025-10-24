import { Request, Response } from 'express';
import { ReportSchedulingService } from '../services/reportSchedulingService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const reportSchedulingService = new ReportSchedulingService(prisma);

export class ReportTemplatesController {
  /**
   * Create a new report template
   */
  static async createTemplate(req: Request, res: Response) {
    try {
      const {
        name,
        description,
        category,
        frequency,
        query,
        parameters,
      } = req.body;

      const { organizationId, userId } = req.user;

      const template = await reportSchedulingService.createTemplate({
        name,
        description,
        category,
        frequency,
        query,
        parameters,
        organizationId,
        createdBy: userId,
      });

      res.status(201).json({
        success: true,
        data: template,
        message: 'Report template created successfully',
      });
    } catch (error) {
      console.error('Error creating report template:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create report template',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get all templates for an organization
   */
  static async getTemplates(req: Request, res: Response) {
    try {
      const { organizationId } = req.user;
      const { category, frequency, isActive } = req.query;

      let whereClause: any = { organizationId };

      if (category) {
        whereClause.category = category;
      }

      if (frequency) {
        whereClause.frequency = frequency;
      }

      if (isActive !== undefined) {
        whereClause.isActive = isActive === 'true';
      }

      const templates = await prisma.reportTemplate.findMany({
        where: whereClause,
        include: {
          createdByUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              scheduledReports: true,
              executions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: templates,
      });
    } catch (error) {
      console.error('Error fetching templates:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch templates',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get a specific template
   */
  static async getTemplate(req: Request, res: Response) {
    try {
      const { templateId } = req.params;
      const { organizationId } = req.user;

      const template = await prisma.reportTemplate.findFirst({
        where: {
          id: templateId,
          organizationId,
        },
        include: {
          createdByUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          scheduledReports: {
            where: { isActive: true },
            include: {
              createdByUser: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          executions: {
            take: 10,
            orderBy: { executedAt: 'desc' },
            include: {
              executedByUser: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Template not found',
        });
      }

      res.json({
        success: true,
        data: template,
      });
    } catch (error) {
      console.error('Error fetching template:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch template',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Update a template
   */
  static async updateTemplate(req: Request, res: Response) {
    try {
      const { templateId } = req.params;
      const { organizationId } = req.user;
      const updateData = req.body;

      // Check if template exists and belongs to organization
      const existingTemplate = await prisma.reportTemplate.findFirst({
        where: {
          id: templateId,
          organizationId,
        },
      });

      if (!existingTemplate) {
        return res.status(404).json({
          success: false,
          message: 'Template not found',
        });
      }

      const template = await reportSchedulingService.updateTemplate(templateId, updateData);

      res.json({
        success: true,
        data: template,
        message: 'Template updated successfully',
      });
    } catch (error) {
      console.error('Error updating template:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update template',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Delete a template
   */
  static async deleteTemplate(req: Request, res: Response) {
    try {
      const { templateId } = req.params;
      const { organizationId } = req.user;

      // Check if template exists and belongs to organization
      const existingTemplate = await prisma.reportTemplate.findFirst({
        where: {
          id: templateId,
          organizationId,
        },
      });

      if (!existingTemplate) {
        return res.status(404).json({
          success: false,
          message: 'Template not found',
        });
      }

      await reportSchedulingService.deleteTemplate(templateId);

      res.json({
        success: true,
        message: 'Template deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete template',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Create a scheduled report
   */
  static async createScheduledReport(req: Request, res: Response) {
    try {
      const {
        templateId,
        frequency,
        recipients,
        scheduleTime,
      } = req.body;

      const { organizationId, userId } = req.user;

      const scheduledReport = await reportSchedulingService.createScheduledReport({
        templateId,
        frequency,
        recipients,
        organizationId,
        createdBy: userId,
        scheduleTime,
      });

      res.status(201).json({
        success: true,
        data: scheduledReport,
        message: 'Scheduled report created successfully',
      });
    } catch (error) {
      console.error('Error creating scheduled report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create scheduled report',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get all scheduled reports
   */
  static async getScheduledReports(req: Request, res: Response) {
    try {
      const { organizationId } = req.user;
      const { isActive } = req.query;

      let whereClause: any = { organizationId };

      if (isActive !== undefined) {
        whereClause.isActive = isActive === 'true';
      }

      const scheduledReports = await prisma.scheduledReport.findMany({
        where: whereClause,
        include: {
          template: {
            select: {
              id: true,
              name: true,
              description: true,
              category: true,
            },
          },
          createdByUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: scheduledReports,
      });
    } catch (error) {
      console.error('Error fetching scheduled reports:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch scheduled reports',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Update a scheduled report
   */
  static async updateScheduledReport(req: Request, res: Response) {
    try {
      const { scheduledReportId } = req.params;
      const { organizationId } = req.user;
      const updateData = req.body;

      // Check if scheduled report exists and belongs to organization
      const existingScheduledReport = await prisma.scheduledReport.findFirst({
        where: {
          id: scheduledReportId,
          organizationId,
        },
      });

      if (!existingScheduledReport) {
        return res.status(404).json({
          success: false,
          message: 'Scheduled report not found',
        });
      }

      const scheduledReport = await reportSchedulingService.updateScheduledReport(
        scheduledReportId,
        updateData
      );

      res.json({
        success: true,
        data: scheduledReport,
        message: 'Scheduled report updated successfully',
      });
    } catch (error) {
      console.error('Error updating scheduled report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update scheduled report',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Cancel a scheduled report
   */
  static async cancelScheduledReport(req: Request, res: Response) {
    try {
      const { templateId } = req.params;
      const { organizationId } = req.user;

      // Check if template exists and belongs to organization
      const existingTemplate = await prisma.reportTemplate.findFirst({
        where: {
          id: templateId,
          organizationId,
        },
      });

      if (!existingTemplate) {
        return res.status(404).json({
          success: false,
          message: 'Template not found',
        });
      }

      await reportSchedulingService.cancelScheduledReport(templateId);

      res.json({
        success: true,
        message: 'Scheduled report cancelled successfully',
      });
    } catch (error) {
      console.error('Error cancelling scheduled report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel scheduled report',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Execute a report immediately
   */
  static async executeReport(req: Request, res: Response) {
    try {
      const { templateId } = req.params;
      const { userId } = req.user;

      const result = await reportSchedulingService.executeReport(templateId, userId);

      res.json({
        success: true,
        data: result,
        message: 'Report executed successfully',
      });
    } catch (error) {
      console.error('Error executing report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to execute report',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get report execution history
   */
  static async getExecutionHistory(req: Request, res: Response) {
    try {
      const { templateId } = req.params;
      const { organizationId } = req.user;
      const { page = 1, limit = 20 } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      // Check if template exists and belongs to organization
      const template = await prisma.reportTemplate.findFirst({
        where: {
          id: templateId,
          organizationId,
        },
      });

      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Template not found',
        });
      }

      const executions = await prisma.reportExecution.findMany({
        where: { templateId },
        include: {
          executedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { executedAt: 'desc' },
        skip,
        take: Number(limit),
      });

      const total = await prisma.reportExecution.count({
        where: { templateId },
      });

      res.json({
        success: true,
        data: {
          executions,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit)),
          },
        },
      });
    } catch (error) {
      console.error('Error fetching execution history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch execution history',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get template categories
   */
  static async getCategories(req: Request, res: Response) {
    try {
      const { organizationId } = req.user;

      const categories = await prisma.reportTemplate.findMany({
        where: { organizationId },
        select: { category: true },
        distinct: ['category'],
        orderBy: { category: 'asc' },
      });

      res.json({
        success: true,
        data: categories.map(c => c.category),
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch categories',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

