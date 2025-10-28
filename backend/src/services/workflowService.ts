import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface Workflow {
  id: string;
  userId: string;
  name: string;
  description: string;
  type: 'approval' | 'notification' | 'automation' | 'escalation';
  isActive: boolean;
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  conditions: WorkflowCondition[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowStep {
  id: string;
  type: 'approval' | 'notification' | 'action' | 'condition' | 'delay';
  name: string;
  description: string;
  order: number;
  config: any;
  isRequired: boolean;
  timeout?: number; // in hours
  escalation?: WorkflowEscalation;
}

export interface WorkflowTrigger {
  id: string;
  type: 'event' | 'schedule' | 'condition';
  eventType?: string;
  schedule?: string; // cron expression
  conditions?: WorkflowCondition[];
  isActive: boolean;
}

export interface WorkflowCondition {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface WorkflowEscalation {
  type: 'email' | 'sms' | 'slack' | 'escalate';
  recipients: string[];
  message: string;
  delay: number; // in hours
}

export interface WorkflowInstance {
  id: string;
  workflowId: string;
  entityId: string; // ID of the entity being processed
  entityType: string; // Type of entity (invoice, expense, etc.)
  status: 'pending' | 'in_progress' | 'completed' | 'rejected' | 'cancelled' | 'escalated';
  currentStep: number;
  startedAt: Date;
  completedAt?: Date;
  assignedTo?: string;
  comments: WorkflowComment[];
  history: WorkflowHistory[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowComment {
  id: string;
  userId: string;
  userName: string;
  comment: string;
  timestamp: Date;
}

export interface WorkflowHistory {
  id: string;
  stepId: string;
  stepName: string;
  action: 'started' | 'completed' | 'rejected' | 'escalated' | 'skipped';
  userId: string;
  userName: string;
  timestamp: Date;
  comment?: string;
}

export interface WorkflowAction {
  id: string;
  type: 'approve' | 'reject' | 'comment' | 'escalate' | 'skip';
  userId: string;
  comment?: string;
  timestamp: Date;
}

export interface WorkflowStats {
  totalInstances: number;
  completed: number;
  pending: number;
  rejected: number;
  escalated: number;
  averageCompletionTime: number; // in hours
  successRate: number;
}

class WorkflowService {
  private workflows: Map<string, Workflow> = new Map();
  private instances: Map<string, WorkflowInstance> = new Map();
  private activeInstances: Map<string, WorkflowInstance> = new Map();

  constructor() {
    this.initializeWorkflowEngine();
  }

  /**
   * Initialize the workflow engine
   */
  private initializeWorkflowEngine(): void {
    logger.info('Initializing workflow engine...');
    
    // Check for overdue workflows every 5 minutes
    setInterval(() => {
      this.processOverdueWorkflows();
    }, 5 * 60 * 1000);
  }

  /**
   * Create a new workflow
   */
  public async createWorkflow(
    userId: string,
    workflowData: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Workflow> {
    try {
      const workflow: Workflow = {
        id: uuidv4(),
        ...workflowData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Validate workflow
      this.validateWorkflow(workflow);

      // Store workflow
      this.workflows.set(workflow.id, workflow);

      logger.info(`Created workflow: ${workflow.name}`);
      return workflow;
    } catch (error) {
      logger.error('Error creating workflow:', error);
      throw error;
    }
  }

  /**
   * Validate workflow configuration
   */
  private validateWorkflow(workflow: Workflow): void {
    if (!workflow.steps || workflow.steps.length === 0) {
      throw new Error('Workflow must have at least one step');
    }

    if (!workflow.triggers || workflow.triggers.length === 0) {
      throw new Error('Workflow must have at least one trigger');
    }

    // Validate steps
    for (const step of workflow.steps) {
      if (!step.name || !step.type) {
        throw new Error('All workflow steps must have a name and type');
      }
    }

    // Validate triggers
    for (const trigger of workflow.triggers) {
      if (!trigger.type) {
        throw new Error('All workflow triggers must have a type');
      }
    }
  }

  /**
   * Start a workflow instance
   */
  public async startWorkflow(
    workflowId: string,
    entityId: string,
    entityType: string,
    assignedTo?: string
  ): Promise<WorkflowInstance> {
    try {
      const workflow = this.workflows.get(workflowId);
      if (!workflow) {
        throw new Error('Workflow not found');
      }

      if (!workflow.isActive) {
        throw new Error('Workflow is not active');
      }

      const instance: WorkflowInstance = {
        id: uuidv4(),
        workflowId,
        entityId,
        entityType,
        status: 'pending',
        currentStep: 0,
        startedAt: new Date(),
        assignedTo,
        comments: [],
        history: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Store instance
      this.instances.set(instance.id, instance);
      this.activeInstances.set(instance.id, instance);

      // Start first step
      await this.executeStep(instance, 0);

      logger.info(`Started workflow instance: ${instance.id}`);
      return instance;
    } catch (error) {
      logger.error('Error starting workflow:', error);
      throw error;
    }
  }

  /**
   * Execute a workflow step
   */
  private async executeStep(instance: WorkflowInstance, stepIndex: number): Promise<void> {
    const workflow = this.workflows.get(instance.workflowId);
    if (!workflow) return;

    const step = workflow.steps[stepIndex];
    if (!step) return;

    try {
      // Update instance status
      instance.status = 'in_progress';
      instance.currentStep = stepIndex;
      instance.updatedAt = new Date();

      // Add to history
      instance.history.push({
        id: uuidv4(),
        stepId: step.id,
        stepName: step.name,
        action: 'started',
        userId: 'system',
        userName: 'System',
        timestamp: new Date(),
      });

      // Execute step based on type
      switch (step.type) {
        case 'approval':
          await this.executeApprovalStep(instance, step);
          break;
        case 'notification':
          await this.executeNotificationStep(instance, step);
          break;
        case 'action':
          await this.executeActionStep(instance, step);
          break;
        case 'condition':
          await this.executeConditionStep(instance, step);
          break;
        case 'delay':
          await this.executeDelayStep(instance, step);
          break;
      }

      // Check if step is complete
      if (step.type === 'approval') {
        // Approval steps require user action
        return;
      }

      // Move to next step
      await this.moveToNextStep(instance);

    } catch (error) {
      logger.error(`Error executing step ${stepIndex}:`, error);
      await this.handleStepError(instance, step, error);
    }
  }

  /**
   * Execute approval step
   */
  private async executeApprovalStep(instance: WorkflowInstance, step: WorkflowStep): Promise<void> {
    // Approval steps require user interaction
    // The step will be completed when a user takes action
    logger.info(`Approval step started: ${step.name}`);
  }

  /**
   * Execute notification step
   */
  private async executeNotificationStep(instance: WorkflowInstance, step: WorkflowStep): Promise<void> {
    try {
      const config = step.config;
      const recipients = config.recipients || [];
      const message = config.message || 'Workflow notification';

      // Send notifications
      for (const recipient of recipients) {
        await this.sendNotification(recipient, message, instance);
      }

      logger.info(`Notification sent for step: ${step.name}`);
    } catch (error) {
      logger.error('Error sending notification:', error);
    }
  }

  /**
   * Execute action step
   */
  private async executeActionStep(instance: WorkflowInstance, step: WorkflowStep): Promise<void> {
    try {
      const config = step.config;
      const actionType = config.actionType;

      switch (actionType) {
        case 'update_status':
          // Update entity status
          break;
        case 'send_email':
          // Send email
          break;
        case 'create_task':
          // Create task
          break;
        case 'update_field':
          // Update entity field
          break;
      }

      logger.info(`Action executed for step: ${step.name}`);
    } catch (error) {
      logger.error('Error executing action:', error);
    }
  }

  /**
   * Execute condition step
   */
  private async executeConditionStep(instance: WorkflowInstance, step: WorkflowStep): Promise<void> {
    try {
      const config = step.config;
      const conditions = config.conditions || [];
      const entityData = await this.getEntityData(instance.entityId, instance.entityType);

      let result = true;
      for (const condition of conditions) {
        const fieldValue = this.getFieldValue(entityData, condition.field);
        const conditionResult = this.evaluateCondition(fieldValue, condition.operator, condition.value);
        
        if (condition.logicalOperator === 'OR') {
          result = result || conditionResult;
        } else {
          result = result && conditionResult;
        }
      }

      if (result) {
        // Condition met, continue to next step
        logger.info(`Condition met for step: ${step.name}`);
      } else {
        // Condition not met, skip to alternative step
        const alternativeStep = config.alternativeStep;
        if (alternativeStep) {
          await this.executeStep(instance, alternativeStep);
        }
      }
    } catch (error) {
      logger.error('Error executing condition:', error);
    }
  }

  /**
   * Execute delay step
   */
  private async executeDelayStep(instance: WorkflowInstance, step: WorkflowStep): Promise<void> {
    try {
      const config = step.config;
      const delayHours = config.delayHours || 0;

      // Schedule the next step after delay
      setTimeout(async () => {
        await this.moveToNextStep(instance);
      }, delayHours * 60 * 60 * 1000);

      logger.info(`Delay scheduled for step: ${step.name} (${delayHours} hours)`);
    } catch (error) {
      logger.error('Error executing delay:', error);
    }
  }

  /**
   * Move to next step
   */
  private async moveToNextStep(instance: WorkflowInstance): Promise<void> {
    const workflow = this.workflows.get(instance.workflowId);
    if (!workflow) return;

    const nextStepIndex = instance.currentStep + 1;
    
    if (nextStepIndex >= workflow.steps.length) {
      // Workflow completed
      await this.completeWorkflow(instance);
    } else {
      // Execute next step
      await this.executeStep(instance, nextStepIndex);
    }
  }

  /**
   * Complete workflow
   */
  private async completeWorkflow(instance: WorkflowInstance): Promise<void> {
    instance.status = 'completed';
    instance.completedAt = new Date();
    instance.updatedAt = new Date();

    // Remove from active instances
    this.activeInstances.delete(instance.id);

    logger.info(`Workflow completed: ${instance.id}`);
  }

  /**
   * Handle step error
   */
  private async handleStepError(instance: WorkflowInstance, step: WorkflowStep, error: any): Promise<void> {
    // Add error to history
    instance.history.push({
      id: uuidv4(),
      stepId: step.id,
      stepName: step.name,
      action: 'escalated',
      userId: 'system',
      userName: 'System',
      timestamp: new Date(),
      comment: `Error: ${error.message}`,
    });

    // Check for escalation
    if (step.escalation) {
      await this.handleEscalation(instance, step);
    }
  }

  /**
   * Handle escalation
   */
  private async handleEscalation(instance: WorkflowInstance, step: WorkflowStep): Promise<void> {
    const escalation = step.escalation!;
    
    try {
      for (const recipient of escalation.recipients) {
        await this.sendNotification(recipient, escalation.message, instance);
      }

      instance.status = 'escalated';
      instance.updatedAt = new Date();

      logger.info(`Workflow escalated: ${instance.id}`);
    } catch (error) {
      logger.error('Error handling escalation:', error);
    }
  }

  /**
   * Process workflow action
   */
  public async processAction(
    instanceId: string,
    action: WorkflowAction
  ): Promise<WorkflowInstance> {
    try {
      const instance = this.instances.get(instanceId);
      if (!instance) {
        throw new Error('Workflow instance not found');
      }

      const workflow = this.workflows.get(instance.workflowId);
      if (!workflow) {
        throw new Error('Workflow not found');
      }

      const currentStep = workflow.steps[instance.currentStep];
      if (!currentStep) {
        throw new Error('Current step not found');
      }

      // Add action to history
      instance.history.push({
        id: uuidv4(),
        stepId: currentStep.id,
        stepName: currentStep.name,
        action: action.type,
        userId: action.userId,
        userName: 'User', // In production, get from user service
        timestamp: action.timestamp,
        comment: action.comment,
      });

      // Add comment if provided
      if (action.comment) {
        instance.comments.push({
          id: uuidv4(),
          userId: action.userId,
          userName: 'User',
          comment: action.comment,
          timestamp: action.timestamp,
        });
      }

      // Handle action
      switch (action.type) {
        case 'approve':
          await this.moveToNextStep(instance);
          break;
        case 'reject':
          instance.status = 'rejected';
          instance.completedAt = new Date();
          this.activeInstances.delete(instanceId);
          break;
        case 'escalate':
          await this.handleEscalation(instance, currentStep);
          break;
        case 'skip':
          await this.moveToNextStep(instance);
          break;
      }

      instance.updatedAt = new Date();
      this.instances.set(instanceId, instance);

      logger.info(`Processed action ${action.type} for instance ${instanceId}`);
      return instance;
    } catch (error) {
      logger.error('Error processing workflow action:', error);
      throw error;
    }
  }

  /**
   * Get entity data
   */
  private async getEntityData(entityId: string, entityType: string): Promise<any> {
    // In production, this would fetch from the appropriate service
    return { id: entityId, type: entityType };
  }

  /**
   * Get field value from entity
   */
  private getFieldValue(entity: any, field: string): any {
    const fieldMap: Record<string, string> = {
      'amount': 'amount',
      'status': 'status',
      'category': 'category',
      'vendor': 'vendor',
    };

    const actualField = fieldMap[field] || field;
    return entity[actualField];
  }

  /**
   * Evaluate condition
   */
  private evaluateCondition(fieldValue: any, operator: string, value: any): boolean {
    switch (operator) {
      case 'equals':
        return fieldValue === value;
      case 'not_equals':
        return fieldValue !== value;
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(value).toLowerCase());
      case 'greater_than':
        return Number(fieldValue) > Number(value);
      case 'less_than':
        return Number(fieldValue) < Number(value);
      case 'in':
        return Array.isArray(value) && value.includes(fieldValue);
      case 'not_in':
        return Array.isArray(value) && !value.includes(fieldValue);
      default:
        return false;
    }
  }

  /**
   * Send notification
   */
  private async sendNotification(recipient: string, message: string, instance: WorkflowInstance): Promise<void> {
    // In production, this would send actual notifications
    logger.info(`Notification sent to ${recipient}: ${message}`);
  }

  /**
   * Process overdue workflows
   */
  private async processOverdueWorkflows(): Promise<void> {
    const now = new Date();
    
    for (const [instanceId, instance] of this.activeInstances) {
      const workflow = this.workflows.get(instance.workflowId);
      if (!workflow) continue;

      const currentStep = workflow.steps[instance.currentStep];
      if (!currentStep) continue;

      // Check if step has timed out
      if (currentStep.timeout) {
        const stepStartTime = instance.history.find(h => h.stepId === currentStep.id && h.action === 'started')?.timestamp;
        if (stepStartTime) {
          const timeElapsed = now.getTime() - stepStartTime.getTime();
          const timeoutMs = currentStep.timeout * 60 * 60 * 1000;
          
          if (timeElapsed > timeoutMs) {
            await this.handleStepTimeout(instance, currentStep);
          }
        }
      }
    }
  }

  /**
   * Handle step timeout
   */
  private async handleStepTimeout(instance: WorkflowInstance, step: WorkflowStep): Promise<void> {
    // Add timeout to history
    instance.history.push({
      id: uuidv4(),
      stepId: step.id,
      stepName: step.name,
      action: 'escalated',
      userId: 'system',
      userName: 'System',
      timestamp: new Date(),
      comment: 'Step timed out',
    });

    // Handle escalation if configured
    if (step.escalation) {
      await this.handleEscalation(instance, step);
    } else {
      // Move to next step
      await this.moveToNextStep(instance);
    }
  }

  /**
   * Get workflow statistics
   */
  public async getWorkflowStats(workflowId: string): Promise<WorkflowStats> {
    const instances = Array.from(this.instances.values()).filter(i => i.workflowId === workflowId);
    
    const stats: WorkflowStats = {
      totalInstances: instances.length,
      completed: instances.filter(i => i.status === 'completed').length,
      pending: instances.filter(i => i.status === 'pending' || i.status === 'in_progress').length,
      rejected: instances.filter(i => i.status === 'rejected').length,
      escalated: instances.filter(i => i.status === 'escalated').length,
      averageCompletionTime: 0,
      successRate: 0,
    };

    // Calculate average completion time
    const completedInstances = instances.filter(i => i.status === 'completed' && i.completedAt);
    if (completedInstances.length > 0) {
      const totalTime = completedInstances.reduce((sum, instance) => {
        return sum + (instance.completedAt!.getTime() - instance.startedAt.getTime());
      }, 0);
      stats.averageCompletionTime = totalTime / completedInstances.length / (1000 * 60 * 60); // Convert to hours
    }

    // Calculate success rate
    if (stats.totalInstances > 0) {
      stats.successRate = (stats.completed / stats.totalInstances) * 100;
    }

    return stats;
  }

  /**
   * Get active workflows for user
   */
  public async getActiveWorkflows(userId: string): Promise<WorkflowInstance[]> {
    return Array.from(this.activeInstances.values()).filter(instance => {
      return instance.assignedTo === userId || instance.status === 'in_progress';
    });
  }

  /**
   * Cancel workflow instance
   */
  public async cancelWorkflow(instanceId: string, userId: string, reason?: string): Promise<void> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error('Workflow instance not found');
    }

    instance.status = 'cancelled';
    instance.completedAt = new Date();
    instance.updatedAt = new Date();

    // Add cancellation to history
    instance.history.push({
      id: uuidv4(),
      stepId: 'system',
      stepName: 'Cancellation',
      action: 'cancelled',
      userId,
      userName: 'User',
      timestamp: new Date(),
      comment: reason || 'Workflow cancelled',
    });

    this.activeInstances.delete(instanceId);
    logger.info(`Workflow cancelled: ${instanceId}`);
  }
}

export default new WorkflowService();










