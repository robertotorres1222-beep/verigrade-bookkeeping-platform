import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  clientId: z.string().min(1, 'Client is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  budget: z.number().min(0, 'Budget must be positive'),
  estimatedHours: z.number().min(0, 'Estimated hours must be positive'),
  hourlyRate: z.number().min(0, 'Hourly rate must be positive')
});

const createExpenseSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().min(0, 'Amount must be positive'),
  date: z.string().min(1, 'Date is required'),
  vendor: z.string().optional(),
  isBillable: z.boolean().default(true)
});

const createLaborSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  userId: z.string().min(1, 'User is required'),
  role: z.string().min(1, 'Role is required'),
  hours: z.number().min(0, 'Hours must be positive'),
  rate: z.number().min(0, 'Rate must be positive'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(1, 'Description is required'),
  isBillable: z.boolean().default(true)
});

const createMaterialSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  itemName: z.string().min(1, 'Item name is required'),
  quantity: z.number().min(0, 'Quantity must be positive'),
  unitCost: z.number().min(0, 'Unit cost must be positive'),
  totalCost: z.number().min(0, 'Total cost must be positive'),
  supplier: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  description: z.string().optional(),
  isBillable: z.boolean().default(true)
});

// Get dashboard data
export const getDashboard = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;

    // Get all projects for organization
    const projects = await prisma.project.findMany({
      where: { organizationId },
      include: {
        expenses: true,
        laborEntries: true,
        materialEntries: true
      }
    });

    // Calculate dashboard metrics
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    
    const totalBudget = projects.reduce((sum, p) => sum + Number(p.budget), 0);
    const totalActualCost = projects.reduce((sum, p) => {
      const expenses = p.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
      const labor = p.laborEntries.reduce((sum, l) => sum + Number(l.amount), 0);
      const materials = p.materialEntries.reduce((sum, m) => sum + Number(m.totalCost), 0);
      return sum + expenses + labor + materials;
    }, 0);
    
    const totalProfit = totalBudget - totalActualCost;
    const averageProfitMargin = totalBudget > 0 ? (totalProfit / totalBudget) * 100 : 0;
    
    const onBudgetProjects = projects.filter(p => {
      const actualCost = p.expenses.reduce((sum, e) => sum + Number(e.amount), 0) +
                        p.laborEntries.reduce((sum, l) => sum + Number(l.amount), 0) +
                        p.materialEntries.reduce((sum, m) => sum + Number(m.totalCost), 0);
      return actualCost <= Number(p.budget);
    }).length;
    
    const overBudgetProjects = totalProjects - onBudgetProjects;

    res.json({
      success: true,
      data: {
        totalProjects,
        activeProjects,
        completedProjects,
        totalBudget,
        totalActualCost,
        totalProfit,
        averageProfitMargin,
        onBudgetProjects,
        overBudgetProjects
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
};

// Get all projects
export const getProjects = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { page = 1, limit = 10, search, status } = req.query;

    const where: any = {
      organizationId
    };

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (status) {
      where.status = status;
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true
          }
        },
        expenses: true,
        laborEntries: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        materialEntries: true
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    // Calculate project metrics
    const projectsWithMetrics = projects.map(project => {
      const expenses = project.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
      const labor = project.laborEntries.reduce((sum, l) => sum + Number(l.amount), 0);
      const materials = project.materialEntries.reduce((sum, m) => sum + Number(m.totalCost), 0);
      const actualCost = expenses + labor + materials;
      const profit = Number(project.budget) - actualCost;
      const margin = Number(project.budget) > 0 ? (profit / Number(project.budget)) * 100 : 0;
      const actualHours = project.laborEntries.reduce((sum, l) => sum + Number(l.hours), 0);

      return {
        ...project,
        clientName: project.client.name,
        actualCost,
        profit,
        margin,
        actualHours
      };
    });

    const total = await prisma.project.count({ where });

    res.json({
      success: true,
      data: {
        projects: projectsWithMetrics,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects'
    });
  }
};

// Create new project
export const createProject = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const validatedData = createProjectSchema.parse(req.body);

    const project = await prisma.project.create({
      data: {
        organizationId,
        name: validatedData.name,
        description: validatedData.description,
        clientId: validatedData.clientId,
        startDate: new Date(validatedData.startDate),
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        budget: validatedData.budget,
        estimatedHours: validatedData.estimatedHours,
        hourlyRate: validatedData.hourlyRate,
        status: 'planning',
        isActive: true
      },
      include: {
        client: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: { project }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }

    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project'
    });
  }
};

// Get project expenses
export const getExpenses = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { projectId, page = 1, limit = 10 } = req.query;

    const where: any = {
      project: { organizationId }
    };

    if (projectId) {
      where.projectId = projectId;
    }

    const expenses = await prisma.projectExpense.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { date: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const total = await prisma.projectExpense.count({ where });

    res.json({
      success: true,
      data: {
        expenses,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expenses'
    });
  }
};

// Create project expense
export const createExpense = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const validatedData = createExpenseSchema.parse(req.body);

    // Verify project belongs to organization
    const project = await prisma.project.findFirst({
      where: {
        id: validatedData.projectId,
        organizationId
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const expense = await prisma.projectExpense.create({
      data: {
        projectId: validatedData.projectId,
        category: validatedData.category,
        description: validatedData.description,
        amount: validatedData.amount,
        date: new Date(validatedData.date),
        vendor: validatedData.vendor,
        isBillable: validatedData.isBillable
      }
    });

    res.status(201).json({
      success: true,
      data: { expense }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }

    console.error('Create expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create expense'
    });
  }
};

// Get labor entries
export const getLaborEntries = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { projectId, page = 1, limit = 10 } = req.query;

    const where: any = {
      project: { organizationId }
    };

    if (projectId) {
      where.projectId = projectId;
    }

    const laborEntries = await prisma.laborEntry.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { date: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const total = await prisma.laborEntry.count({ where });

    res.json({
      success: true,
      data: {
        laborEntries: laborEntries.map(entry => ({
          ...entry,
          userName: `${entry.user.firstName} ${entry.user.lastName}`
        })),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get labor entries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch labor entries'
    });
  }
};

// Create labor entry
export const createLaborEntry = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const validatedData = createLaborSchema.parse(req.body);

    // Verify project belongs to organization
    const project = await prisma.project.findFirst({
      where: {
        id: validatedData.projectId,
        organizationId
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const amount = validatedData.hours * validatedData.rate;

    const laborEntry = await prisma.laborEntry.create({
      data: {
        projectId: validatedData.projectId,
        userId: validatedData.userId,
        role: validatedData.role,
        hours: validatedData.hours,
        rate: validatedData.rate,
        amount: amount,
        date: new Date(validatedData.date),
        description: validatedData.description,
        isBillable: validatedData.isBillable
      }
    });

    res.status(201).json({
      success: true,
      data: { laborEntry }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }

    console.error('Create labor entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create labor entry'
    });
  }
};

// Get material entries
export const getMaterialEntries = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { projectId, page = 1, limit = 10 } = req.query;

    const where: any = {
      project: { organizationId }
    };

    if (projectId) {
      where.projectId = projectId;
    }

    const materialEntries = await prisma.materialEntry.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { date: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const total = await prisma.materialEntry.count({ where });

    res.json({
      success: true,
      data: {
        materialEntries,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get material entries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch material entries'
    });
  }
};

// Create material entry
export const createMaterialEntry = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const validatedData = createMaterialSchema.parse(req.body);

    // Verify project belongs to organization
    const project = await prisma.project.findFirst({
      where: {
        id: validatedData.projectId,
        organizationId
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const materialEntry = await prisma.materialEntry.create({
      data: {
        projectId: validatedData.projectId,
        itemName: validatedData.itemName,
        quantity: validatedData.quantity,
        unitCost: validatedData.unitCost,
        totalCost: validatedData.totalCost,
        supplier: validatedData.supplier,
        date: new Date(validatedData.date),
        description: validatedData.description,
        isBillable: validatedData.isBillable
      }
    });

    res.status(201).json({
      success: true,
      data: { materialEntry }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }

    console.error('Create material entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create material entry'
    });
  }
};