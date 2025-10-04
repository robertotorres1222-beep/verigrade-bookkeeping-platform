import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { asyncHandler, CustomError } from '../middleware/errorHandler';
import { sendEmail } from '../services/emailService';
import { logger } from '../utils/logger';

const router = Router();

// Mock Project interface
interface Project {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  clientId: string;
  status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  startDate: string;
  endDate?: string;
  budget?: number;
  actualCost?: number;
  hourlyRate?: number;
  projectManagerId: string;
  teamMembers: string[];
  createdAt: string;
  updatedAt: string;
}

// Mock Project Task interface
interface ProjectTask {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  assignedTo?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Create a new project
router.post(
  '/',
  authenticate,
  [
    body('name').isString().notEmpty(),
    body('clientId').isString().notEmpty(),
    body('projectManagerId').isString().notEmpty(),
    body('description').optional().isString(),
    body('startDate').isISO8601().toDate(),
    body('endDate').optional().isISO8601().toDate(),
    body('budget').optional().isFloat({ min: 0 }),
    body('hourlyRate').optional().isFloat({ min: 0 }),
    body('teamMembers').optional().isArray(),
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const { name, description, clientId, projectManagerId, startDate, endDate, budget, hourlyRate, teamMembers } = req.body;
    const organizationId = req.user!.organizationId;

    const projectId = `proj_${Date.now()}`;

    const newProject: Project = {
      id: projectId,
      organizationId,
      name,
      description,
      clientId,
      status: 'ACTIVE',
      startDate: new Date(startDate).toISOString(),
      endDate: endDate ? new Date(endDate).toISOString() : undefined,
      budget,
      hourlyRate,
      projectManagerId,
      teamMembers: teamMembers || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    logger.info(`New project ${projectId} created for organization ${organizationId}`);
    res.status(201).json({ success: true, data: newProject });
  })
);

// Get all projects for an organization
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: any, res: any) => {
    // Mock projects data
    const projects: Project[] = [
      {
        id: 'proj_1',
        organizationId: 'org_1',
        name: 'Website Redesign',
        description: 'Complete redesign of company website',
        clientId: 'client_A',
        status: 'ACTIVE',
        startDate: '2023-08-01T00:00:00Z',
        endDate: '2023-12-31T23:59:59Z',
        budget: 50000,
        actualCost: 25000,
        hourlyRate: 75,
        projectManagerId: 'pm_1',
        teamMembers: ['user_1', 'user_2'],
        createdAt: '2023-07-15T00:00:00Z',
        updatedAt: '2023-10-01T00:00:00Z',
      },
      {
        id: 'proj_2',
        organizationId: 'org_1',
        name: 'Mobile App Development',
        description: 'Native mobile app for iOS and Android',
        clientId: 'client_B',
        status: 'ON_HOLD',
        startDate: '2023-09-01T00:00:00Z',
        budget: 75000,
        hourlyRate: 85,
        projectManagerId: 'pm_2',
        teamMembers: ['user_3', 'user_4'],
        createdAt: '2023-08-20T00:00:00Z',
        updatedAt: '2023-09-15T00:00:00Z',
      },
    ];

    res.status(200).json({ success: true, data: projects });
  })
);

// Update project status
router.put(
  '/:id/status',
  authenticate,
  [
    param('id').isString().notEmpty(),
    body('status').isIn(['ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']),
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const { id } = req.params;
    const { status } = req.body;
    const organizationId = req.user!.organizationId;

    const updatedProject: Project = {
      id,
      organizationId,
      name: 'Updated Project',
      clientId: 'client_A',
      status,
      startDate: '2023-08-01T00:00:00Z',
      projectManagerId: 'pm_1',
      teamMembers: ['user_1'],
      createdAt: '2023-07-15T00:00:00Z',
      updatedAt: new Date().toISOString(),
    };

    // Send notification if project completed
    if (status === 'COMPLETED') {
      await sendEmail({
        to: process.env['PROJECT_EMAIL'] || 'projects@verigrade.com',
        subject: 'Project Completed - Final Review Required',
        template: 'projectCompleted',
        data: {
          projectName: updatedProject.name,
          completionDate: new Date().toLocaleDateString(),
          projectUrl: `${process.env['FRONTEND_URL']}/projects/${id}`,
        },
      });
    }

    logger.info(`Project ${id} status updated to ${status} for organization ${organizationId}`);
    res.status(200).json({ success: true, data: updatedProject });
  })
);

// Add a task to a project
router.post(
  '/:id/tasks',
  authenticate,
  [
    param('id').isString().notEmpty(),
    body('name').isString().notEmpty(),
    body('description').optional().isString(),
    body('assignedTo').optional().isString(),
    body('priority').isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
    body('estimatedHours').optional().isFloat({ min: 0 }),
    body('dueDate').optional().isISO8601().toDate(),
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const { id: projectId } = req.params;
    const { name, description, assignedTo, priority, estimatedHours, dueDate } = req.body;

    const taskId = `task_${Date.now()}`;

    const newTask: ProjectTask = {
      id: taskId,
      projectId,
      name,
      description,
      assignedTo,
      status: 'TODO',
      priority,
      estimatedHours,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Notify assigned team member
    if (assignedTo) {
      await sendEmail({
        to: process.env['TEAM_EMAIL'] || 'team@verigrade.com',
        subject: `New Task Assigned: ${name}`,
        template: 'projectMilestone',
        data: {
          taskName: name,
          projectName: 'Project Alpha',
          priority,
          dueDate: dueDate ? new Date(dueDate).toLocaleDateString() : 'No due date',
          taskUrl: `${process.env['FRONTEND_URL']}/projects/${projectId}/tasks/${taskId}`,
        },
      });
    }

    logger.info(`New task ${taskId} added to project ${projectId}`);
    res.status(201).json({ success: true, data: newTask });
  })
);

// Get all tasks for a project
router.get(
  '/:id/tasks',
  authenticate,
  asyncHandler(async (req: any, res: any) => {
    const { id: projectId } = req.params;

    const tasks: ProjectTask[] = [
      {
        id: 'task_1',
        projectId,
        name: 'Design homepage layout',
        description: 'Create wireframes and mockups for the new homepage',
        assignedTo: 'user_1',
        status: 'COMPLETED',
        priority: 'HIGH',
        estimatedHours: 16,
        actualHours: 18,
        dueDate: '2023-09-15T23:59:59Z',
        completedAt: '2023-09-14T16:30:00Z',
        createdAt: '2023-09-01T00:00:00Z',
        updatedAt: '2023-09-14T16:30:00Z',
      },
      {
        id: 'task_2',
        projectId,
        name: 'Implement responsive design',
        description: 'Code the responsive layout for all screen sizes',
        assignedTo: 'user_2',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        estimatedHours: 24,
        dueDate: '2023-10-15T23:59:59Z',
        createdAt: '2023-09-15T00:00:00Z',
        updatedAt: '2023-10-01T00:00:00Z',
      },
    ];

    res.status(200).json({ success: true, data: tasks });
  })
);

// Get project profitability reports
router.get(
  '/reports/profitability',
  authenticate,
  asyncHandler(async (req: any, res: any) => {
    const reports = {
      summary: {
        totalProjects: 15,
        activeProjects: 8,
        completedProjects: 5,
        totalRevenue: 450000,
        totalCosts: 300000,
        totalProfit: 150000,
        profitMargin: 33.33,
      },
      topPerforming: [
        { projectId: 'proj_1', name: 'Website Redesign', profit: 25000, margin: 50 },
        { projectId: 'proj_2', name: 'Mobile App', profit: 40000, margin: 53.33 },
      ],
      overBudget: [
        { projectId: 'proj_3', name: 'Legacy Migration', budget: 30000, actual: 35000, variance: -5000 },
      ],
    };

    res.status(200).json({ success: true, data: reports });
  })
);

export default router;