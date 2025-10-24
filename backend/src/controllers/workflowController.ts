import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const createWorkflowSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  trigger: z.object({
    type: z.enum(['transaction_created', 'invoice_sent', 'payment_received', 'due_date_approaching', 'user_registered', 'custom']),
    conditions: z.array(z.object({
      field: z.string(),
      operator: z.string(),
      value: z.any()
    })).optional()
  }),
  actions: z.array(z.object({
    type: z.enum(['send_email', 'create_task', 'update_status', 'webhook_call', 'send_sms', 'create_invoice', 'assign_user']),
    config: z.record(z.any())
  })).min(1, 'At least one action is required'),
  conditions: z.array(z.object({
    field: z.string(),
    operator: z.string(),
    value: z.any(),
    logic: z.enum(['AND', 'OR'])
  })).optional()
});

const updateWorkflowSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  trigger: z.object({
    type: z.enum(['transaction_created', 'invoice_sent', 'payment_received', 'due_date_approaching', 'user_registered', 'custom']),
    conditions: z.array(z.object({
      field: z.string(),
      operator: z.string(),
      value: z.any()
    })).optional()
  }).optional(),
  actions: z.array(z.object({
    type: z.enum(['send_email', 'create_task', 'update_status', 'webhook_call', 'send_sms', 'create_invoice', 'assign_user']),
    config: z.record(z.any())
  })).optional(),
  conditions: z.array(z.object({
    field: z.string(),
    operator: z.string(),
    value: z.any(),
    logic: z.enum(['AND', 'OR'])
  })).optional(),
  isActive: z.boolean().optional()
});

// Get all workflows for organization
export const getWorkflows = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { page = 1, limit = 10, search, isActive } = req.query;

    const where: any = {
      organizationId
    };

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const workflows = await prisma.workflow.findMany({
      where,
      include: {
        trigger: true,
        actions: true,
        executions: {
          orderBy: { startedAt: 'desc' },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const total = await prisma.workflow.count({ where });

    res.json({
      success: true,
      data: {
        workflows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get workflows error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch workflows'
    });
  }
};

// Get single workflow
export const getWorkflow = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user!;

    const workflow = await prisma.workflow.findFirst({
      where: {
        id,
        organizationId
      },
      include: {
        trigger: true,
        actions: true,
        executions: {
          orderBy: { startedAt: 'desc' },
          take: 10
        }
      }
    });

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found'
      });
    }

    res.json({
      success: true,
      data: { workflow }
    });
  } catch (error) {
    console.error('Get workflow error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch workflow'
    });
  }
};

// Create new workflow
export const createWorkflow = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const validatedData = createWorkflowSchema.parse(req.body);

    // Create workflow with trigger and actions
    const workflow = await prisma.workflow.create({
      data: {
        organizationId,
        name: validatedData.name,
        description: validatedData.description,
        isActive: true,
        trigger: {
          create: {
            type: validatedData.trigger.type,
            name: getTriggerName(validatedData.trigger.type),
            description: getTriggerDescription(validatedData.trigger.type),
            conditions: validatedData.trigger.conditions || [],
            isActive: true
          }
        },
        actions: {
          create: validatedData.actions.map(action => ({
            type: action.type,
            name: getActionName(action.type),
            description: getActionDescription(action.type),
            config: action.config,
            isActive: true
          }))
        },
        conditions: validatedData.conditions || []
      },
      include: {
        trigger: true,
        actions: true
      }
    });

    res.status(201).json({
      success: true,
      data: { workflow }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }

    console.error('Create workflow error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create workflow'
    });
  }
};

// Update workflow
export const updateWorkflow = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user!;
    const validatedData = updateWorkflowSchema.parse(req.body);

    // Check if workflow exists
    const existingWorkflow = await prisma.workflow.findFirst({
      where: { id, organizationId }
    });

    if (!existingWorkflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found'
      });
    }

    // Update workflow
    const updateData: any = {};
    if (validatedData.name) updateData.name = validatedData.name;
    if (validatedData.description) updateData.description = validatedData.description;
    if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive;
    if (validatedData.conditions) updateData.conditions = validatedData.conditions;

    const workflow = await prisma.workflow.update({
      where: { id },
      data: updateData,
      include: {
        trigger: true,
        actions: true
      }
    });

    // Update trigger if provided
    if (validatedData.trigger) {
      await prisma.workflowTrigger.update({
        where: { workflowId: id },
        data: {
          type: validatedData.trigger.type,
          name: getTriggerName(validatedData.trigger.type),
          description: getTriggerDescription(validatedData.trigger.type),
          conditions: validatedData.trigger.conditions || []
        }
      });
    }

    // Update actions if provided
    if (validatedData.actions) {
      // Delete existing actions
      await prisma.workflowAction.deleteMany({
        where: { workflowId: id }
      });

      // Create new actions
      await prisma.workflowAction.createMany({
        data: validatedData.actions.map(action => ({
          workflowId: id,
          type: action.type,
          name: getActionName(action.type),
          description: getActionDescription(action.type),
          config: action.config,
          isActive: true
        }))
      });
    }

    res.json({
      success: true,
      data: { workflow }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }

    console.error('Update workflow error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update workflow'
    });
  }
};

// Delete workflow
export const deleteWorkflow = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user!;

    // Check if workflow exists
    const workflow = await prisma.workflow.findFirst({
      where: { id, organizationId }
    });

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found'
      });
    }

    // Delete workflow (cascade will handle related records)
    await prisma.workflow.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Workflow deleted successfully'
    });
  } catch (error) {
    console.error('Delete workflow error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete workflow'
    });
  }
};

// Run workflow manually
export const runWorkflow = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user!;

    const workflow = await prisma.workflow.findFirst({
      where: { id, organizationId },
      include: {
        trigger: true,
        actions: true
      }
    });

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found'
      });
    }

    if (!workflow.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Workflow is not active'
      });
    }

    // Create execution record
    const execution = await prisma.workflowExecution.create({
      data: {
        workflowId: id,
        status: 'running',
        startedAt: new Date(),
        actions: workflow.actions.map(action => ({
          id: action.id,
          type: action.type,
          status: 'pending'
        }))
      }
    });

    // Execute workflow asynchronously
    executeWorkflow(workflow, execution.id);

    res.json({
      success: true,
      data: { execution },
      message: 'Workflow execution started'
    });
  } catch (error) {
    console.error('Run workflow error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to run workflow'
    });
  }
};

// Get workflow executions
export const getWorkflowExecutions = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { workflowId, page = 1, limit = 10, status } = req.query;

    const where: any = {
      workflow: { organizationId }
    };

    if (workflowId) {
      where.workflowId = workflowId;
    }

    if (status) {
      where.status = status;
    }

    const executions = await prisma.workflowExecution.findMany({
      where,
      include: {
        workflow: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { startedAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const total = await prisma.workflowExecution.count({ where });

    res.json({
      success: true,
      data: {
        executions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get workflow executions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch workflow executions'
    });
  }
};

// Execute workflow (async function)
async function executeWorkflow(workflow: any, executionId: string) {
  try {
    // Execute each action
    for (const action of workflow.actions) {
      await executeAction(action, executionId);
    }

    // Update execution status
    await prisma.workflowExecution.update({
      where: { id: executionId },
      data: {
        status: 'completed',
        completedAt: new Date()
      }
    });

    // Update workflow run count
    await prisma.workflow.update({
      where: { id: workflow.id },
      data: {
        runCount: { increment: 1 },
        lastRun: new Date()
      }
    });
  } catch (error) {
    console.error('Workflow execution error:', error);
    
    // Update execution status to failed
    await prisma.workflowExecution.update({
      where: { id: executionId },
      data: {
        status: 'failed',
        completedAt: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
}

// Execute individual action
async function executeAction(action: any, executionId: string) {
  try {
    // Update action status to running
    await prisma.workflowExecution.update({
      where: { id: executionId },
      data: {
        actions: {
          updateMany: {
            where: { id: action.id },
            data: { status: 'running', startedAt: new Date() }
          }
        }
      }
    });

    // Execute action based on type
    switch (action.type) {
      case 'send_email':
        await executeEmailAction(action);
        break;
      case 'create_task':
        await executeTaskAction(action);
        break;
      case 'update_status':
        await executeStatusAction(action);
        break;
      case 'webhook_call':
        await executeWebhookAction(action);
        break;
      case 'send_sms':
        await executeSMSAction(action);
        break;
      case 'create_invoice':
        await executeInvoiceAction(action);
        break;
      case 'assign_user':
        await executeAssignAction(action);
        break;
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }

    // Update action status to completed
    await prisma.workflowExecution.update({
      where: { id: executionId },
      data: {
        actions: {
          updateMany: {
            where: { id: action.id },
            data: { status: 'completed', completedAt: new Date() }
          }
        }
      }
    });
  } catch (error) {
    console.error(`Action execution error (${action.type}):`, error);
    
    // Update action status to failed
    await prisma.workflowExecution.update({
      where: { id: executionId },
      data: {
        actions: {
          updateMany: {
            where: { id: action.id },
            data: { 
              status: 'failed', 
              completedAt: new Date(),
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          }
        }
      }
    });
  }
}

// Action execution functions
async function executeEmailAction(action: any) {
  // Implement email sending logic
  console.log('Executing email action:', action.config);
  // TODO: Integrate with email service
}

async function executeTaskAction(action: any) {
  // Implement task creation logic
  console.log('Executing task action:', action.config);
  // TODO: Create task in database
}

async function executeStatusAction(action: any) {
  // Implement status update logic
  console.log('Executing status action:', action.config);
  // TODO: Update record status
}

async function executeWebhookAction(action: any) {
  // Implement webhook call logic
  console.log('Executing webhook action:', action.config);
  // TODO: Make HTTP request to webhook URL
}

async function executeSMSAction(action: any) {
  // Implement SMS sending logic
  console.log('Executing SMS action:', action.config);
  // TODO: Integrate with SMS service
}

async function executeInvoiceAction(action: any) {
  // Implement invoice creation logic
  console.log('Executing invoice action:', action.config);
  // TODO: Create invoice in database
}

async function executeAssignAction(action: any) {
  // Implement user assignment logic
  console.log('Executing assign action:', action.config);
  // TODO: Assign record to user
}

// Helper functions
function getTriggerName(type: string): string {
  const names: Record<string, string> = {
    transaction_created: 'Transaction Created',
    invoice_sent: 'Invoice Sent',
    payment_received: 'Payment Received',
    due_date_approaching: 'Due Date Approaching',
    user_registered: 'User Registered',
    custom: 'Custom Trigger'
  };
  return names[type] || 'Unknown Trigger';
}

function getTriggerDescription(type: string): string {
  const descriptions: Record<string, string> = {
    transaction_created: 'Triggered when a new transaction is created',
    invoice_sent: 'Triggered when an invoice is sent to a client',
    payment_received: 'Triggered when a payment is received',
    due_date_approaching: 'Triggered when an invoice due date is approaching',
    user_registered: 'Triggered when a new user registers',
    custom: 'Custom trigger based on specific conditions'
  };
  return descriptions[type] || 'Unknown trigger description';
}

function getActionName(type: string): string {
  const names: Record<string, string> = {
    send_email: 'Send Email',
    create_task: 'Create Task',
    update_status: 'Update Status',
    webhook_call: 'Webhook Call',
    send_sms: 'Send SMS',
    create_invoice: 'Create Invoice',
    assign_user: 'Assign User'
  };
  return names[type] || 'Unknown Action';
}

function getActionDescription(type: string): string {
  const descriptions: Record<string, string> = {
    send_email: 'Send an email notification',
    create_task: 'Create a new task',
    update_status: 'Update record status',
    webhook_call: 'Call external webhook',
    send_sms: 'Send SMS notification',
    create_invoice: 'Create new invoice',
    assign_user: 'Assign to specific user'
  };
  return descriptions[type] || 'Unknown action description';
}