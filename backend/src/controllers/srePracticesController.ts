import { Request, Response } from 'express';
import { srePracticesService } from '../services/srePracticesService';
import logger from '../utils/logger';

export class SREPracticesController {
  // SLO Management
  async createSLO(req: Request, res: Response): Promise<void> {
    try {
      const slo = await srePracticesService.createSLO(req.body);
      res.status(201).json({
        success: true,
        data: slo,
        message: 'SLO created successfully',
      });
    } catch (error) {
      logger.error('Error creating SLO', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create SLO',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getSLOs(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        service: req.query.service as string || undefined,
        status: req.query.status as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await srePracticesService.getSLOs(filters);
      res.json({
        success: true,
        data: result,
        message: 'SLOs retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching SLOs', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch SLOs',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async updateSLO(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const slo = await srePracticesService.updateSLO(id || '', req.body);
      res.json({
        success: true,
        data: slo,
        message: 'SLO updated successfully',
      });
    } catch (error) {
      logger.error('Error updating SLO', { error, sloId: req.params.id, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to update SLO',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // SLI Management
  async recordSLI(req: Request, res: Response): Promise<void> {
    try {
      const sli = await srePracticesService.recordSLI(req.body);
      res.status(201).json({
        success: true,
        data: sli,
        message: 'SLI recorded successfully',
      });
    } catch (error) {
      logger.error('Error recording SLI', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to record SLI',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getSLIs(req: Request, res: Response): Promise<void> {
    try {
      const { sloId } = req.params;
      const filters = {
        dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
        dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await srePracticesService.getSLIs(sloId || '', filters);
      res.json({
        success: true,
        data: result,
        message: 'SLIs retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching SLIs', { error, sloId: req.params.sloId, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch SLIs',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Error Budget Management
  async getErrorBudgets(req: Request, res: Response): Promise<void> {
    try {
      const errorBudgets = await srePracticesService.getErrorBudgets();
      res.json({
        success: true,
        data: errorBudgets,
        message: 'Error budgets retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching error budgets', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch error budgets',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Chaos Engineering
  async createChaosExperiment(req: Request, res: Response): Promise<void> {
    try {
      const experiment = await srePracticesService.createChaosExperiment(req.body);
      res.status(201).json({
        success: true,
        data: experiment,
        message: 'Chaos experiment created successfully',
      });
    } catch (error) {
      logger.error('Error creating chaos experiment', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create chaos experiment',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getChaosExperiments(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        service: req.query.service as string || undefined,
        status: req.query.status as string || undefined,
        type: req.query.type as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await srePracticesService.getChaosExperiments(filters);
      res.json({
        success: true,
        data: result,
        message: 'Chaos experiments retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching chaos experiments', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch chaos experiments',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async runChaosExperiment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const experiment = await srePracticesService.runChaosExperiment(id || '');
      res.json({
        success: true,
        data: experiment,
        message: 'Chaos experiment started successfully',
      });
    } catch (error) {
      logger.error('Error running chaos experiment', { error, experimentId: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Failed to run chaos experiment',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Performance Testing
  async createPerformanceTest(req: Request, res: Response): Promise<void> {
    try {
      const test = await srePracticesService.createPerformanceTest(req.body);
      res.status(201).json({
        success: true,
        data: test,
        message: 'Performance test created successfully',
      });
    } catch (error) {
      logger.error('Error creating performance test', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create performance test',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getPerformanceTests(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        service: req.query.service as string || undefined,
        status: req.query.status as string || undefined,
        type: req.query.type as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await srePracticesService.getPerformanceTests(filters);
      res.json({
        success: true,
        data: result,
        message: 'Performance tests retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching performance tests', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch performance tests',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async runPerformanceTest(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const test = await srePracticesService.runPerformanceTest(id || '');
      res.json({
        success: true,
        data: test,
        message: 'Performance test started successfully',
      });
    } catch (error) {
      logger.error('Error running performance test', { error, testId: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Failed to run performance test',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Incident Management
  async createIncident(req: Request, res: Response): Promise<void> {
    try {
      const incident = await srePracticesService.createIncident(req.body);
      res.status(201).json({
        success: true,
        data: incident,
        message: 'Incident created successfully',
      });
    } catch (error) {
      logger.error('Error creating incident', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create incident',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getIncidents(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        service: req.query.service as string || undefined,
        status: req.query.status as string || undefined,
        severity: req.query.severity as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await srePracticesService.getIncidents(filters);
      res.json({
        success: true,
        data: result,
        message: 'Incidents retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching incidents', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch incidents',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async updateIncident(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const incident = await srePracticesService.updateIncident(id || '', req.body);
      res.json({
        success: true,
        data: incident,
        message: 'Incident updated successfully',
      });
    } catch (error) {
      logger.error('Error updating incident', { error, incidentId: req.params.id, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to update incident',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Runbook Management
  async createRunbook(req: Request, res: Response): Promise<void> {
    try {
      const runbook = await srePracticesService.createRunbook(req.body);
      res.status(201).json({
        success: true,
        data: runbook,
        message: 'Runbook created successfully',
      });
    } catch (error) {
      logger.error('Error creating runbook', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create runbook',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getRunbooks(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        service: req.query.service as string || undefined,
        category: req.query.category as string || undefined,
        status: req.query.status as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await srePracticesService.getRunbooks(filters);
      res.json({
        success: true,
        data: result,
        message: 'Runbooks retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching runbooks', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch runbooks',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Post-Mortem Management
  async createPostMortem(req: Request, res: Response): Promise<void> {
    try {
      const postMortem = await srePracticesService.createPostMortem(req.body);
      res.status(201).json({
        success: true,
        data: postMortem,
        message: 'Post-mortem created successfully',
      });
    } catch (error) {
      logger.error('Error creating post-mortem', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create post-mortem',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getPostMortems(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        status: req.query.status as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await srePracticesService.getPostMortems(filters);
      res.json({
        success: true,
        data: result,
        message: 'Post-mortems retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching post-mortems', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch post-mortems',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Toil Management
  async createToil(req: Request, res: Response): Promise<void> {
    try {
      const toil = await srePracticesService.createToil(req.body);
      res.status(201).json({
        success: true,
        data: toil,
        message: 'Toil created successfully',
      });
    } catch (error) {
      logger.error('Error creating toil', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create toil',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getToils(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        category: req.query.category as string || undefined,
        status: req.query.status as string || undefined,
        priority: req.query.priority as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await srePracticesService.getToils(filters);
      res.json({
        success: true,
        data: result,
        message: 'Toils retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching toils', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch toils',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Analytics and Reporting
  async getSREAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const analytics = await srePracticesService.getSREAnalytics();
      res.json({
        success: true,
        data: analytics,
        message: 'SRE analytics retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching SRE analytics', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch SRE analytics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export const srePracticesController = new SREPracticesController();




