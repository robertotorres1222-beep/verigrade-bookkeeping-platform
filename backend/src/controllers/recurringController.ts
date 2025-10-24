import { Request, Response } from 'express';
import { RecurringService } from '../services/recurringService';
import { logger } from '../utils/logger';

const recurringService = new RecurringService();

export class RecurringController {
  /**
   * Create recurring template
   */
  async createRecurringTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const templateData = req.body;

      if (!templateData.templateName || !templateData.templateType || !templateData.templateData) {
        res.status(400).json({
          success: false,
          message: 'Template name, type, and data are required'
        });
        return;
      }

      const template = await recurringService.createRecurringTemplate(companyId, templateData);

      res.json({
        success: true,
        data: template
      });
    } catch (error) {
      logger.error('Error creating recurring template:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating recurring template',
        error: error.message
      });
    }
  }

  /**
   * Update recurring template
   */
  async updateRecurringTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { templateId } = req.params;
      const updateData = req.body;

      if (!templateId) {
        res.status(400).json({
          success: false,
          message: 'Template ID is required'
        });
        return;
      }

      const template = await recurringService.updateRecurringTemplate(templateId, companyId, updateData);

      res.json({
        success: true,
        data: template
      });
    } catch (error) {
      logger.error('Error updating recurring template:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating recurring template',
        error: error.message
      });
    }
  }

  /**
   * Delete recurring template
   */
  async deleteRecurringTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { templateId } = req.params;

      if (!templateId) {
        res.status(400).json({
          success: false,
          message: 'Template ID is required'
        });
        return;
      }

      const template = await recurringService.deleteRecurringTemplate(templateId, companyId);

      res.json({
        success: true,
        data: template
      });
    } catch (error) {
      logger.error('Error deleting recurring template:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting recurring template',
        error: error.message
      });
    }
  }

  /**
   * Get recurring templates
   */
  async getRecurringTemplates(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const templates = await recurringService.getRecurringTemplates(companyId);

      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      logger.error('Error getting recurring templates:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting recurring templates',
        error: error.message
      });
    }
  }

  /**
   * Generate recurring items
   */
  async generateRecurringItems(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const generationResult = await recurringService.generateRecurringItems(companyId);

      res.json({
        success: true,
        data: generationResult
      });
    } catch (error) {
      logger.error('Error generating recurring items:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating recurring items',
        error: error.message
      });
    }
  }

  /**
   * Get recurring dashboard
   */
  async getRecurringDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const dashboard = await recurringService.getRecurringDashboard(companyId);

      res.json({
        success: true,
        data: dashboard
      });
    } catch (error) {
      logger.error('Error getting recurring dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting recurring dashboard',
        error: error.message
      });
    }
  }

  /**
   * Get template statistics
   */
  async getTemplateStats(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const dashboard = await recurringService.getRecurringDashboard(companyId);
      const templateStats = dashboard.templateStats;

      res.json({
        success: true,
        data: templateStats
      });
    } catch (error) {
      logger.error('Error getting template stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting template stats',
        error: error.message
      });
    }
  }

  /**
   * Get recent templates
   */
  async getRecentTemplates(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { limit = '10' } = req.query;

      const dashboard = await recurringService.getRecurringDashboard(companyId);
      const recentTemplates = dashboard.recentTemplates;

      res.json({
        success: true,
        data: recentTemplates
      });
    } catch (error) {
      logger.error('Error getting recent templates:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting recent templates',
        error: error.message
      });
    }
  }

  /**
   * Get generation logs
   */
  async getGenerationLogs(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const dashboard = await recurringService.getRecurringDashboard(companyId);
      const generationLogs = dashboard.generationLogs;

      res.json({
        success: true,
        data: generationLogs
      });
    } catch (error) {
      logger.error('Error getting generation logs:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting generation logs',
        error: error.message
      });
    }
  }

  /**
   * Get upcoming items
   */
  async getUpcomingItems(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const dashboard = await recurringService.getRecurringDashboard(companyId);
      const upcomingItems = dashboard.upcomingItems;

      res.json({
        success: true,
        data: upcomingItems
      });
    } catch (error) {
      logger.error('Error getting upcoming items:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting upcoming items',
        error: error.message
      });
    }
  }

  /**
   * Get recurring analytics
   */
  async getRecurringAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const analytics = await recurringService.getRecurringAnalytics(companyId);

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      logger.error('Error getting recurring analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting recurring analytics',
        error: error.message
      });
    }
  }

  /**
   * Get template by ID
   */
  async getRecurringTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { templateId } = req.params;

      if (!templateId) {
        res.status(400).json({
          success: false,
          message: 'Template ID is required'
        });
        return;
      }

      const templates = await recurringService.getRecurringTemplates(companyId);
      const template = templates.find(t => t.id === templateId);

      if (!template) {
        res.status(404).json({
          success: false,
          message: 'Template not found'
        });
        return;
      }

      res.json({
        success: true,
        data: template
      });
    } catch (error) {
      logger.error('Error getting recurring template:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting recurring template',
        error: error.message
      });
    }
  }

  /**
   * Test recurring template
   */
  async testRecurringTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { templateId } = req.params;

      if (!templateId) {
        res.status(400).json({
          success: false,
          message: 'Template ID is required'
        });
        return;
      }

      const templates = await recurringService.getRecurringTemplates(companyId);
      const template = templates.find(t => t.id === templateId);

      if (!template) {
        res.status(404).json({
          success: false,
          message: 'Template not found'
        });
        return;
      }

      // Test generation logic
      const shouldGenerate = recurringService['shouldGenerateItem'](template);
      const nextGeneration = recurringService['calculateNextGeneration'](template);

      res.json({
        success: true,
        data: {
          shouldGenerate,
          nextGeneration,
          template
        }
      });
    } catch (error) {
      logger.error('Error testing recurring template:', error);
      res.status(500).json({
        success: false,
        message: 'Error testing recurring template',
        error: error.message
      });
    }
  }

  /**
   * Get recurring insights
   */
  async getRecurringInsights(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const dashboard = await recurringService.getRecurringDashboard(companyId);
      const insights = this.generateRecurringInsights(dashboard);

      res.json({
        success: true,
        data: insights
      });
    } catch (error) {
      logger.error('Error getting recurring insights:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting recurring insights',
        error: error.message
      });
    }
  }

  /**
   * Generate recurring insights
   */
  private generateRecurringInsights(dashboard: any): any[] {
    const insights = [];

    // Template efficiency insight
    if (dashboard.templateStats.active_templates < dashboard.templateStats.total_templates) {
      insights.push({
        type: 'template_efficiency',
        priority: 'low',
        title: 'Inactive Templates Detected',
        description: `${dashboard.templateStats.inactive_templates} templates are inactive. Consider cleaning up unused templates.`,
        action: 'Review and clean up inactive templates',
        impact: 'Low - affects template management efficiency'
      });
    }

    // Generation efficiency insight
    if (dashboard.generationLogs && dashboard.generationLogs.length > 0) {
      const recentLog = dashboard.generationLogs[0];
      if (recentLog.skipped_items > recentLog.generated_items) {
        insights.push({
          type: 'generation_efficiency',
          priority: 'medium',
          title: 'High Skip Rate in Generation',
          description: `${recentLog.skipped_items} items were skipped in the last generation. Review template configurations.`,
          action: 'Review template configurations and generation logic',
          impact: 'Medium - affects automation efficiency'
        });
      }
    }

    // Upcoming items insight
    if (dashboard.upcomingItems && dashboard.upcomingItems.length > 0) {
      const urgentItems = dashboard.upcomingItems.filter((item: any) => item.daysUntilNext <= 1);
      if (urgentItems.length > 0) {
        insights.push({
          type: 'upcoming_items',
          priority: 'medium',
          title: 'Items Due for Generation',
          description: `${urgentItems.length} items are due for generation within 1 day.`,
          action: 'Review and prepare for upcoming generations',
          impact: 'Medium - affects business operations'
        });
      }
    }

    // Template distribution insight
    if (dashboard.templateStats.invoice_templates === 0 && dashboard.templateStats.expense_templates === 0) {
      insights.push({
        type: 'template_distribution',
        priority: 'low',
        title: 'No Active Templates',
        description: 'No active templates found. Consider creating recurring templates for common transactions.',
        action: 'Create recurring templates for common transactions',
        impact: 'Low - affects automation potential'
      });
    }

    return insights;
  }
}