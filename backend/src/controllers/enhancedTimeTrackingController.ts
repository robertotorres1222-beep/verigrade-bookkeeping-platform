import { Request, Response } from 'express';
import { enhancedTimeTrackingService } from '../services/enhancedTimeTrackingService';
import logger from '../utils/logger';

export class EnhancedTimeTrackingController {
  // Project Management
  async createProject(req: Request, res: Response): Promise<void> {
    try {
      const project = await enhancedTimeTrackingService.createProject(req.body);
      res.status(201).json({
        success: true,
        data: project,
        message: 'Project created successfully',
      });
    } catch (error) {
      logger.error('Error creating project', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create project',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getProjects(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        status: req.query.status as string || undefined,
        clientId: req.query.clientId as string || undefined,
        search: req.query.search as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await enhancedTimeTrackingService.getProjects(filters);
      res.json({
        success: true,
        data: result,
        message: 'Projects retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching projects', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch projects',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async updateProject(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const project = await enhancedTimeTrackingService.updateProject(id || '', req.body);
      res.json({
        success: true,
        data: project,
        message: 'Project updated successfully',
      });
    } catch (error) {
      logger.error('Error updating project', { error, projectId: req.params.id, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to update project',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Task Management
  async createTask(req: Request, res: Response): Promise<void> {
    try {
      const task = await enhancedTimeTrackingService.createTask(req.body);
      res.status(201).json({
        success: true,
        data: task,
        message: 'Task created successfully',
      });
    } catch (error) {
      logger.error('Error creating task', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create task',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getTasks(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const tasks = await enhancedTimeTrackingService.getTasks(projectId || '');
      res.json({
        success: true,
        data: tasks,
        message: 'Tasks retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching tasks', { error, projectId: req.params.projectId });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch tasks',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async updateTask(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const task = await enhancedTimeTrackingService.updateTask(id || '', req.body);
      res.json({
        success: true,
        data: task,
        message: 'Task updated successfully',
      });
    } catch (error) {
      logger.error('Error updating task', { error, taskId: req.params.id, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to update task',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Time Entry Management
  async startTimeEntry(req: Request, res: Response): Promise<void> {
    try {
      const timeEntry = await enhancedTimeTrackingService.startTimeEntry(req.body);
      res.status(201).json({
        success: true,
        data: timeEntry,
        message: 'Time entry started successfully',
      });
    } catch (error) {
      logger.error('Error starting time entry', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to start time entry',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async stopTimeEntry(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const timeEntry = await enhancedTimeTrackingService.stopTimeEntry(id || '');
      res.json({
        success: true,
        data: timeEntry,
        message: 'Time entry stopped successfully',
      });
    } catch (error) {
      logger.error('Error stopping time entry', { error, timeEntryId: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Failed to stop time entry',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async pauseTimeEntry(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const timeEntry = await enhancedTimeTrackingService.pauseTimeEntry(id || '');
      res.json({
        success: true,
        data: timeEntry,
        message: 'Time entry paused successfully',
      });
    } catch (error) {
      logger.error('Error pausing time entry', { error, timeEntryId: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Failed to pause time entry',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async resumeTimeEntry(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const timeEntry = await enhancedTimeTrackingService.resumeTimeEntry(id || '');
      res.json({
        success: true,
        data: timeEntry,
        message: 'Time entry resumed successfully',
      });
    } catch (error) {
      logger.error('Error resuming time entry', { error, timeEntryId: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Failed to resume time entry',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getTimeEntries(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        userId: req.query.userId as string || undefined,
        projectId: req.query.projectId as string || undefined,
        status: req.query.status as string || undefined,
        dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
        dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await enhancedTimeTrackingService.getTimeEntries(filters);
      res.json({
        success: true,
        data: result,
        message: 'Time entries retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching time entries', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch time entries',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Timesheet Management
  async createTimesheet(req: Request, res: Response): Promise<void> {
    try {
      const timesheet = await enhancedTimeTrackingService.createTimesheet(req.body);
      res.status(201).json({
        success: true,
        data: timesheet,
        message: 'Timesheet created successfully',
      });
    } catch (error) {
      logger.error('Error creating timesheet', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create timesheet',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getTimesheets(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const filters = {
        status: req.query.status as string || undefined,
        dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
        dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await enhancedTimeTrackingService.getTimesheets(userId || '', filters);
      res.json({
        success: true,
        data: result,
        message: 'Timesheets retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching timesheets', { error, userId: req.params.userId, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch timesheets',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async submitTimesheet(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const timesheet = await enhancedTimeTrackingService.submitTimesheet(id || '');
      res.json({
        success: true,
        data: timesheet,
        message: 'Timesheet submitted successfully',
      });
    } catch (error) {
      logger.error('Error submitting timesheet', { error, timesheetId: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Failed to submit timesheet',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async approveTimesheet(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { approvedBy } = req.body;
      const timesheet = await enhancedTimeTrackingService.approveTimesheet(id || '', approvedBy);
      res.json({
        success: true,
        data: timesheet,
        message: 'Timesheet approved successfully',
      });
    } catch (error) {
      logger.error('Error approving timesheet', { error, timesheetId: req.params.id, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to approve timesheet',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Resource Management
  async createResource(req: Request, res: Response): Promise<void> {
    try {
      const resource = await enhancedTimeTrackingService.createResource(req.body);
      res.status(201).json({
        success: true,
        data: resource,
        message: 'Resource created successfully',
      });
    } catch (error) {
      logger.error('Error creating resource', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create resource',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getResources(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        status: req.query.status as string || undefined,
        role: req.query.role as string || undefined,
        search: req.query.search as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await enhancedTimeTrackingService.getResources(filters);
      res.json({
        success: true,
        data: result,
        message: 'Resources retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching resources', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch resources',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async updateResource(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const resource = await enhancedTimeTrackingService.updateResource(id || '', req.body);
      res.json({
        success: true,
        data: resource,
        message: 'Resource updated successfully',
      });
    } catch (error) {
      logger.error('Error updating resource', { error, resourceId: req.params.id, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to update resource',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Project Costing
  async getProjectCosting(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const projectCosting = await enhancedTimeTrackingService.getProjectCosting(projectId || '');
      res.json({
        success: true,
        data: projectCosting,
        message: 'Project costing retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching project costing', { error, projectId: req.params.projectId });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch project costing',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Idle Detection
  async createIdleDetection(req: Request, res: Response): Promise<void> {
    try {
      const idleDetection = await enhancedTimeTrackingService.createIdleDetection(req.body);
      res.status(201).json({
        success: true,
        data: idleDetection,
        message: 'Idle detection created successfully',
      });
    } catch (error) {
      logger.error('Error creating idle detection', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create idle detection',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async resolveIdleDetection(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const idleDetection = await enhancedTimeTrackingService.resolveIdleDetection(id || '');
      res.json({
        success: true,
        data: idleDetection,
        message: 'Idle detection resolved successfully',
      });
    } catch (error) {
      logger.error('Error resolving idle detection', { error, idleDetectionId: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Failed to resolve idle detection',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // GPS Tracking
  async createGPSTracking(req: Request, res: Response): Promise<void> {
    try {
      const gpsTracking = await enhancedTimeTrackingService.createGPSTracking(req.body);
      res.status(201).json({
        success: true,
        data: gpsTracking,
        message: 'GPS tracking created successfully',
      });
    } catch (error) {
      logger.error('Error creating GPS tracking', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create GPS tracking',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getGPSTracking(req: Request, res: Response): Promise<void> {
    try {
      const { timeEntryId } = req.params;
      const gpsTracking = await enhancedTimeTrackingService.getGPSTracking(timeEntryId || '');
      res.json({
        success: true,
        data: gpsTracking,
        message: 'GPS tracking retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching GPS tracking', { error, timeEntryId: req.params.timeEntryId });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch GPS tracking',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Analytics and Reporting
  async getTimeTrackingAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { userId, projectId } = req.query;
      const analytics = await enhancedTimeTrackingService.getTimeTrackingAnalytics(
        userId as string || undefined,
        projectId as string || undefined
      );
      res.json({
        success: true,
        data: analytics,
        message: 'Time tracking analytics retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching time tracking analytics', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch time tracking analytics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export const enhancedTimeTrackingController = new EnhancedTimeTrackingController();







