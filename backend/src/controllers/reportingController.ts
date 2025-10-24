import { Request, Response } from 'express';
import { reportingService } from '../services/reportingService';
import logger from '../utils/logger';

export class ReportingController {
  // Custom Report Builder
  async createCustomReport(req: Request, res: Response): Promise<void> {
    try {
      const report = await reportingService.createCustomReport(req.body);

      res.status(201).json({
        success: true,
        data: report,
        message: 'Custom report created successfully',
      });
    } catch (error) {
      logger.error('Error creating custom report', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to create custom report',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getReports(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, type } = req.query;
      const reports = await reportingService.getReports({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        type: type as string,
      });

      res.json({
        success: true,
        data: reports,
        message: 'Reports retrieved successfully',
      });
    } catch (error) {
      logger.error('Error retrieving reports', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve reports',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getReport(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const report = await reportingService.getReport(id);

      if (!report) {
        res.status(404).json({
          success: false,
          message: 'Report not found',
        });
        return;
      }

      res.json({
        success: true,
        data: report,
        message: 'Report retrieved successfully',
      });
    } catch (error) {
      logger.error('Error retrieving report', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve report',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async updateReport(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const report = await reportingService.updateReport(id, req.body);

      res.json({
        success: true,
        data: report,
        message: 'Report updated successfully',
      });
    } catch (error) {
      logger.error('Error updating report', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to update report',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async deleteReport(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await reportingService.deleteReport(id);

      res.json({
        success: true,
        message: 'Report deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting report', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to delete report',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Scheduled Reports
  async scheduleReport(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { schedule } = req.body;
      await reportingService.scheduleReport(id, schedule);

      res.json({
        success: true,
        message: 'Report scheduled successfully',
      });
    } catch (error) {
      logger.error('Error scheduling report', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to schedule report',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getReportSchedule(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const schedule = await reportingService.getReportSchedule(id);

      res.json({
        success: true,
        data: schedule,
        message: 'Report schedule retrieved successfully',
      });
    } catch (error) {
      logger.error('Error retrieving report schedule', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve report schedule',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Forecasting
  async generateForecast(req: Request, res: Response): Promise<void> {
    try {
      const forecast = await reportingService.generateForecast(req.body);

      res.json({
        success: true,
        data: forecast,
        message: 'Forecast generated successfully',
      });
    } catch (error) {
      logger.error('Error generating forecast', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to generate forecast',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getForecast(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const forecast = await reportingService.getForecast(id);

      res.json({
        success: true,
        data: forecast,
        message: 'Forecast retrieved successfully',
      });
    } catch (error) {
      logger.error('Error retrieving forecast', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve forecast',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Comparative Analysis
  async performComparativeAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const { periods } = req.body;
      const analysis = await reportingService.performComparativeAnalysis(periods);

      res.json({
        success: true,
        data: analysis,
        message: 'Comparative analysis completed successfully',
      });
    } catch (error) {
      logger.error('Error performing comparative analysis', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to perform comparative analysis',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export const reportingController = new ReportingController();



