import { Request, Response } from 'express';
import { advancedSecurityComplianceService } from '../services/advancedSecurityComplianceService';
import logger from '../utils/logger';

export class AdvancedSecurityComplianceController {
  // Security Scanning
  async createSecurityScan(req: Request, res: Response): Promise<void> {
    try {
      const scan = await advancedSecurityComplianceService.createSecurityScan(req.body);
      res.status(201).json({
        success: true,
        data: scan,
        message: 'Security scan created successfully',
      });
    } catch (error) {
      logger.error('Error creating security scan', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create security scan',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getSecurityScans(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        type: req.query.type as string || undefined,
        status: req.query.status as string || undefined,
        tool: req.query.tool as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await advancedSecurityComplianceService.getSecurityScans(filters);
      res.json({
        success: true,
        data: result,
        message: 'Security scans retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching security scans', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch security scans',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async runSecurityScan(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const scan = await advancedSecurityComplianceService.runSecurityScan(id || '');
      res.json({
        success: true,
        data: scan,
        message: 'Security scan started successfully',
      });
    } catch (error) {
      logger.error('Error running security scan', { error, scanId: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Failed to run security scan',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Compliance Framework Management
  async createComplianceFramework(req: Request, res: Response): Promise<void> {
    try {
      const framework = await advancedSecurityComplianceService.createComplianceFramework(req.body);
      res.status(201).json({
        success: true,
        data: framework,
        message: 'Compliance framework created successfully',
      });
    } catch (error) {
      logger.error('Error creating compliance framework', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create compliance framework',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getComplianceFrameworks(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        type: req.query.type as string || undefined,
        status: req.query.status as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await advancedSecurityComplianceService.getComplianceFrameworks(filters);
      res.json({
        success: true,
        data: result,
        message: 'Compliance frameworks retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching compliance frameworks', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch compliance frameworks',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Compliance Assessment Management
  async createComplianceAssessment(req: Request, res: Response): Promise<void> {
    try {
      const assessment = await advancedSecurityComplianceService.createComplianceAssessment(req.body);
      res.status(201).json({
        success: true,
        data: assessment,
        message: 'Compliance assessment created successfully',
      });
    } catch (error) {
      logger.error('Error creating compliance assessment', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create compliance assessment',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getComplianceAssessments(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        frameworkId: req.query.frameworkId as string || undefined,
        status: req.query.status as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await advancedSecurityComplianceService.getComplianceAssessments(filters);
      res.json({
        success: true,
        data: result,
        message: 'Compliance assessments retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching compliance assessments', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch compliance assessments',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Security Controls Management
  async createSecurityControl(req: Request, res: Response): Promise<void> {
    try {
      const control = await advancedSecurityComplianceService.createSecurityControl(req.body);
      res.status(201).json({
        success: true,
        data: control,
        message: 'Security control created successfully',
      });
    } catch (error) {
      logger.error('Error creating security control', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create security control',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getSecurityControls(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        category: req.query.category as string || undefined,
        status: req.query.status as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await advancedSecurityComplianceService.getSecurityControls(filters);
      res.json({
        success: true,
        data: result,
        message: 'Security controls retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching security controls', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch security controls',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Security Incident Management
  async createSecurityIncident(req: Request, res: Response): Promise<void> {
    try {
      const incident = await advancedSecurityComplianceService.createSecurityIncident(req.body);
      res.status(201).json({
        success: true,
        data: incident,
        message: 'Security incident created successfully',
      });
    } catch (error) {
      logger.error('Error creating security incident', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create security incident',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getSecurityIncidents(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        severity: req.query.severity as string || undefined,
        status: req.query.status as string || undefined,
        category: req.query.category as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await advancedSecurityComplianceService.getSecurityIncidents(filters);
      res.json({
        success: true,
        data: result,
        message: 'Security incidents retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching security incidents', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch security incidents',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Data Subject Request Management
  async createDataSubjectRequest(req: Request, res: Response): Promise<void> {
    try {
      const request = await advancedSecurityComplianceService.createDataSubjectRequest(req.body);
      res.status(201).json({
        success: true,
        data: request,
        message: 'Data subject request created successfully',
      });
    } catch (error) {
      logger.error('Error creating data subject request', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create data subject request',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getDataSubjectRequests(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        type: req.query.type as string || undefined,
        status: req.query.status as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await advancedSecurityComplianceService.getDataSubjectRequests(filters);
      res.json({
        success: true,
        data: result,
        message: 'Data subject requests retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching data subject requests', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch data subject requests',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Privacy Impact Assessment Management
  async createPrivacyImpactAssessment(req: Request, res: Response): Promise<void> {
    try {
      const assessment = await advancedSecurityComplianceService.createPrivacyImpactAssessment(req.body);
      res.status(201).json({
        success: true,
        data: assessment,
        message: 'Privacy impact assessment created successfully',
      });
    } catch (error) {
      logger.error('Error creating privacy impact assessment', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create privacy impact assessment',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getPrivacyImpactAssessments(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        status: req.query.status as string || undefined,
        riskLevel: req.query.riskLevel as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await advancedSecurityComplianceService.getPrivacyImpactAssessments(filters);
      res.json({
        success: true,
        data: result,
        message: 'Privacy impact assessments retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching privacy impact assessments', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch privacy impact assessments',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Security Training Management
  async createSecurityTraining(req: Request, res: Response): Promise<void> {
    try {
      const training = await advancedSecurityComplianceService.createSecurityTraining(req.body);
      res.status(201).json({
        success: true,
        data: training,
        message: 'Security training created successfully',
      });
    } catch (error) {
      logger.error('Error creating security training', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create security training',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getSecurityTrainings(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        type: req.query.type as string || undefined,
        category: req.query.category as string || undefined,
        status: req.query.status as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await advancedSecurityComplianceService.getSecurityTrainings(filters);
      res.json({
        success: true,
        data: result,
        message: 'Security trainings retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching security trainings', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch security trainings',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Security Training Record Management
  async createSecurityTrainingRecord(req: Request, res: Response): Promise<void> {
    try {
      const record = await advancedSecurityComplianceService.createSecurityTrainingRecord(req.body);
      res.status(201).json({
        success: true,
        data: record,
        message: 'Security training record created successfully',
      });
    } catch (error) {
      logger.error('Error creating security training record', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create security training record',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getSecurityTrainingRecords(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        userId: req.query.userId as string || undefined,
        trainingId: req.query.trainingId as string || undefined,
        status: req.query.status as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await advancedSecurityComplianceService.getSecurityTrainingRecords(filters);
      res.json({
        success: true,
        data: result,
        message: 'Security training records retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching security training records', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch security training records',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Analytics and Reporting
  async getSecurityComplianceAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const analytics = await advancedSecurityComplianceService.getSecurityComplianceAnalytics();
      res.json({
        success: true,
        data: analytics,
        message: 'Security compliance analytics retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching security compliance analytics', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch security compliance analytics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export const advancedSecurityComplianceController = new AdvancedSecurityComplianceController();




