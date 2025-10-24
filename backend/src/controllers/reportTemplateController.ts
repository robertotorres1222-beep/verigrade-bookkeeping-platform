import { Request, Response } from 'express';
import reportTemplateService from '../services/reportTemplateService';
import { prisma } from '../lib/prisma';

/**
 * Get all report templates
 */
export const getTemplates = async (req: Request, res: Response) => {
  try {
    const { includePublic = 'true' } = req.query;
    const organizationId = req.user!.organizationId!;

    const templates = await reportTemplateService.getTemplates(
      organizationId,
      includePublic === 'true'
    );

    res.json({
      success: true,
      templates,
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch templates',
    });
  }
};

/**
 * Get template by ID
 */
export const getTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const template = await reportTemplateService.getTemplate(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found',
      });
    }

    res.json({
      success: true,
      template,
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch template',
    });
  }
};

/**
 * Create new template
 */
export const createTemplate = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      category,
      query,
      parameters,
      schedule,
      delivery,
      isPublic = false,
    } = req.body;

    const template = await reportTemplateService.createTemplate({
      name,
      description,
      category,
      query,
      parameters,
      schedule,
      delivery,
      isPublic,
      createdBy: req.user!.id,
      organizationId: req.user!.organizationId!,
    });

    res.status(201).json({
      success: true,
      template,
    });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create template',
    });
  }
};

/**
 * Update template
 */
export const updateTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const template = await reportTemplateService.updateTemplate(id, updateData);

    res.json({
      success: true,
      template,
    });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update template',
    });
  }
};

/**
 * Delete template
 */
export const deleteTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await reportTemplateService.deleteTemplate(id);

    res.json({
      success: true,
      message: 'Template deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete template',
    });
  }
};

/**
 * Execute template
 */
export const executeTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { parameters = {} } = req.body;

    const execution = await reportTemplateService.executeTemplate(id, parameters);

    res.json({
      success: true,
      execution,
    });
  } catch (error) {
    console.error('Error executing template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute template',
    });
  }
};

/**
 * Get execution history
 */
export const getExecutionHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { limit = 50 } = req.query;

    const executions = await reportTemplateService.getExecutionHistory(
      id,
      Number(limit)
    );

    res.json({
      success: true,
      executions,
    });
  } catch (error) {
    console.error('Error fetching execution history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch execution history',
    });
  }
};

/**
 * Get predefined templates
 */
export const getPredefinedTemplates = async (req: Request, res: Response) => {
  try {
    const templates = reportTemplateService.getPredefinedTemplates();

    res.json({
      success: true,
      templates,
    });
  } catch (error) {
    console.error('Error fetching predefined templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch predefined templates',
    });
  }
};

/**
 * Schedule template execution
 */
export const scheduleTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { schedule, delivery } = req.body;

    const template = await reportTemplateService.updateTemplate(id, {
      schedule,
      delivery,
    });

    res.json({
      success: true,
      template,
    });
  } catch (error) {
    console.error('Error scheduling template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to schedule template',
    });
  }
};

/**
 * Get scheduled templates
 */
export const getScheduledTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await reportTemplateService.getScheduledTemplates();

    res.json({
      success: true,
      templates,
    });
  } catch (error) {
    console.error('Error fetching scheduled templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scheduled templates',
    });
  }
};

/**
 * Export template as PDF
 */
export const exportTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { parameters = {}, format = 'pdf' } = req.body;

    const execution = await reportTemplateService.executeTemplate(id, parameters);
    
    if (format === 'pdf') {
      // Generate PDF using a PDF library
      // This would integrate with a PDF generation service
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="report.pdf"');
      // Return PDF buffer
      res.send('PDF content would go here');
    } else if (format === 'excel') {
      // Generate Excel file
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="report.xlsx"');
      // Return Excel buffer
      res.send('Excel content would go here');
    } else {
      res.json({
        success: true,
        data: execution.result,
      });
    }
  } catch (error) {
    console.error('Error exporting template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export template',
    });
  }
};

