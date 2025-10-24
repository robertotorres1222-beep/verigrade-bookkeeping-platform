import { Request, Response } from 'express';
import { timeTrackingService } from '../services/timeTrackingService';
import logger from '../utils/logger';

export class TimeTrackingController {
  // Timer Management
  async startTimer(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, taskId, description } = req.body;
      const userId = req.user?.id;

      const timer = await timeTrackingService.startTimer(userId!, {
        projectId,
        taskId,
        description,
      });

      res.status(201).json({
        success: true,
        data: timer,
        message: 'Timer started successfully',
      });
    } catch (error) {
      logger.error('Error starting timer', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to start timer',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async stopTimer(req: Request, res: Response): Promise<void> {
    try {
      const { timerId } = req.params;
      const userId = req.user?.id;

      const timeEntry = await timeTrackingService.stopTimer(timerId, userId!);

      res.json({
        success: true,
        data: timeEntry,
        message: 'Timer stopped successfully',
      });
    } catch (error) {
      logger.error('Error stopping timer', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to stop timer',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async pauseTimer(req: Request, res: Response): Promise<void> {
    try {
      const { timerId } = req.params;
      const userId = req.user?.id;

      const timer = await timeTrackingService.pauseTimer(timerId, userId!);

      res.json({
        success: true,
        data: timer,
        message: 'Timer paused successfully',
      });
    } catch (error) {
      logger.error('Error pausing timer', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to pause timer',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async resumeTimer(req: Request, res: Response): Promise<void> {
    try {
      const { timerId } = req.params;
      const userId = req.user?.id;

      const timer = await timeTrackingService.resumeTimer(timerId, userId!);

      res.json({
        success: true,
        data: timer,
        message: 'Timer resumed successfully',
      });
    } catch (error) {
      logger.error('Error resuming timer', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to resume timer',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Time Entries
  async createTimeEntry(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const timeEntry = await timeTrackingService.createTimeEntry(userId!, req.body);

      res.status(201).json({
        success: true,
        data: timeEntry,
        message: 'Time entry created successfully',
      });
    } catch (error) {
      logger.error('Error creating time entry', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to create time entry',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getTimeEntries(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, projectId, startDate, endDate } = req.query;
      const userId = req.user?.id;

      const timeEntries = await timeTrackingService.getTimeEntries(userId!, {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        projectId: projectId as string,
        startDate: startDate as string,
        endDate: endDate as string,
      });

      res.json({
        success: true,
        data: timeEntries,
        message: 'Time entries retrieved successfully',
      });
    } catch (error) {
      logger.error('Error retrieving time entries', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve time entries',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async updateTimeEntry(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const timeEntry = await timeTrackingService.updateTimeEntry(id, userId!, req.body);

      res.json({
        success: true,
        data: timeEntry,
        message: 'Time entry updated successfully',
      });
    } catch (error) {
      logger.error('Error updating time entry', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to update time entry',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async deleteTimeEntry(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      await timeTrackingService.deleteTimeEntry(id, userId!);

      res.json({
        success: true,
        message: 'Time entry deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting time entry', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to delete time entry',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Project Management
  async createProject(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const project = await timeTrackingService.createProject(userId!, req.body);

      res.status(201).json({
        success: true,
        data: project,
        message: 'Project created successfully',
      });
    } catch (error) {
      logger.error('Error creating project', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to create project',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getProjects(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const userId = req.user?.id;

      const projects = await timeTrackingService.getProjects(userId!, {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        status: status as string,
      });

      res.json({
        success: true,
        data: projects,
        message: 'Projects retrieved successfully',
      });
    } catch (error) {
      logger.error('Error retrieving projects', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve projects',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async updateProject(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const project = await timeTrackingService.updateProject(id, userId!, req.body);

      res.json({
        success: true,
        data: project,
        message: 'Project updated successfully',
      });
    } catch (error) {
      logger.error('Error updating project', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to update project',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Timesheet Management
  async getTimesheet(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      const userId = req.user?.id;

      const timesheet = await timeTrackingService.getTimesheet(userId!, {
        startDate: startDate as string,
        endDate: endDate as string,
      });

      res.json({
        success: true,
        data: timesheet,
        message: 'Timesheet retrieved successfully',
      });
    } catch (error) {
      logger.error('Error retrieving timesheet', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve timesheet',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async submitTimesheet(req: Request, res: Response): Promise<void> {
    try {
      const { timesheetId } = req.params;
      const userId = req.user?.id;

      const timesheet = await timeTrackingService.submitTimesheet(timesheetId, userId!);

      res.json({
        success: true,
        data: timesheet,
        message: 'Timesheet submitted successfully',
      });
    } catch (error) {
      logger.error('Error submitting timesheet', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to submit timesheet',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async approveTimesheet(req: Request, res: Response): Promise<void> {
    try {
      const { timesheetId } = req.params;
      const { approved, notes } = req.body;
      const userId = req.user?.id;

      const timesheet = await timeTrackingService.approveTimesheet(timesheetId, userId!, {
        approved,
        notes,
      });

      res.json({
        success: true,
        data: timesheet,
        message: 'Timesheet approval processed successfully',
      });
    } catch (error) {
      logger.error('Error approving timesheet', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to approve timesheet',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Project Analytics
  async getProjectAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const userId = req.user?.id;

      const analytics = await timeTrackingService.getProjectAnalytics(projectId, userId!);

      res.json({
        success: true,
        data: analytics,
        message: 'Project analytics retrieved successfully',
      });
    } catch (error) {
      logger.error('Error retrieving project analytics', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve project analytics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export const timeTrackingController = new TimeTrackingController();