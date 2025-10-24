import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'condition' | 'action' | 'delay';
  name: string;
  config: any;
  position: { x: number; y: number };
  connections: string[];
}

interface ExecutionContext {
  organizationId: string;
  userId: string;
  data: any;
  variables: Record<string, any>;
}

interface ExecutionResult {
  success: boolean;
  output: any;
  error?: string;
  startedAt: Date;
  completedAt: Date;
  executedNodes: string[];
}

export class WorkflowEngine {
  /**
   * Execute a workflow with given nodes and input data
   */
  static async execute(
    workflowId: string,
    nodes: WorkflowNode[],
    inputData: any,
    context: { organizationId: string; userId: string }
  ): Promise<ExecutionResult> {
    const startedAt = new Date();
    const executedNodes: string[] = [];
    const executionContext: ExecutionContext = {
      organizationId: context.organizationId,
      userId: context.userId,
      data: inputData,
      variables: {}
    };

    try {
      logger.info(`Starting workflow execution for workflow ${workflowId}`);

      // Find trigger nodes (entry points)
      const triggerNodes = nodes.filter(node => node.type === 'trigger');
      if (triggerNodes.length === 0) {
        throw new Error('No trigger nodes found in workflow');
      }

      // Execute workflow starting from trigger nodes
      for (const triggerNode of triggerNodes) {
        await this.executeNode(triggerNode, executionContext, executedNodes, nodes);
      }

      const completedAt = new Date();
      logger.info(`Workflow execution completed for workflow ${workflowId}`);

      return {
        success: true,
        output: executionContext.data,
        startedAt,
        completedAt,
        executedNodes
      };
    } catch (error: any) {
      logger.error(`Workflow execution failed for workflow ${workflowId}: ${error.message}`);
      
      return {
        success: false,
        output: executionContext.data,
        error: error.message,
        startedAt,
        completedAt: new Date(),
        executedNodes
      };
    }
  }

  /**
   * Execute a single workflow node
   */
  private static async executeNode(
    node: WorkflowNode,
    context: ExecutionContext,
    executedNodes: string[],
    allNodes: WorkflowNode[]
  ): Promise<void> {
    if (executedNodes.includes(node.id)) {
      return; // Prevent infinite loops
    }

    executedNodes.push(node.id);
    logger.info(`Executing node ${node.id} of type ${node.type}`);

    try {
      switch (node.type) {
        case 'trigger':
          await this.executeTriggerNode(node, context);
          break;
        case 'condition':
          await this.executeConditionNode(node, context);
          break;
        case 'action':
          await this.executeActionNode(node, context);
          break;
        case 'delay':
          await this.executeDelayNode(node, context);
          break;
        default:
          throw new Error(`Unknown node type: ${node.type}`);
      }

      // Execute connected nodes
      for (const connectionId of node.connections) {
        const connectedNode = allNodes.find(n => n.id === connectionId);
        if (connectedNode) {
          await this.executeNode(connectedNode, context, executedNodes, allNodes);
        }
      }
    } catch (error: any) {
      logger.error(`Node execution failed for ${node.id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Execute trigger node
   */
  private static async executeTriggerNode(node: WorkflowNode, context: ExecutionContext): Promise<void> {
    const config = node.config;
    
    switch (config.triggerType) {
      case 'event':
        // Event triggers are handled by the system, just pass through
        logger.info(`Event trigger ${config.event} activated`);
        break;
      case 'schedule':
        // Schedule triggers are handled by the system, just pass through
        logger.info(`Schedule trigger activated`);
        break;
      case 'manual':
        // Manual triggers are handled by the API call
        logger.info(`Manual trigger activated`);
        break;
      default:
        throw new Error(`Unknown trigger type: ${config.triggerType}`);
    }
  }

  /**
   * Execute condition node
   */
  private static async executeConditionNode(node: WorkflowNode, context: ExecutionContext): Promise<void> {
    const config = node.config;
    const { field, operator, value } = config;
    
    let conditionResult = false;
    const fieldValue = this.getFieldValue(context.data, field);

    switch (operator) {
      case 'equals':
        conditionResult = fieldValue === value;
        break;
      case 'not_equals':
        conditionResult = fieldValue !== value;
        break;
      case 'greater_than':
        conditionResult = Number(fieldValue) > Number(value);
        break;
      case 'less_than':
        conditionResult = Number(fieldValue) < Number(value);
        break;
      case 'greater_than_or_equal':
        conditionResult = Number(fieldValue) >= Number(value);
        break;
      case 'less_than_or_equal':
        conditionResult = Number(fieldValue) <= Number(value);
        break;
      case 'contains':
        conditionResult = String(fieldValue).includes(String(value));
        break;
      case 'not_contains':
        conditionResult = !String(fieldValue).includes(String(value));
        break;
      case 'is_empty':
        conditionResult = !fieldValue || fieldValue === '';
        break;
      case 'is_not_empty':
        conditionResult = fieldValue && fieldValue !== '';
        break;
      default:
        throw new Error(`Unknown operator: ${operator}`);
    }

    logger.info(`Condition ${node.id} evaluated to: ${conditionResult}`);
    
    // Store condition result in context for use by connected nodes
    context.variables[`${node.id}_result`] = conditionResult;
  }

  /**
   * Execute action node
   */
  private static async executeActionNode(node: WorkflowNode, context: ExecutionContext): Promise<void> {
    const config = node.config;
    
    switch (config.actionType) {
      case 'send_email':
        await this.sendEmail(config, context);
        break;
      case 'update_status':
        await this.updateStatus(config, context);
        break;
      case 'assign_task':
        await this.assignTask(config, context);
        break;
      case 'create_record':
        await this.createRecord(config, context);
        break;
      case 'update_record':
        await this.updateRecord(config, context);
        break;
      case 'generate_report':
        await this.generateReport(config, context);
        break;
      case 'call_webhook':
        await this.callWebhook(config, context);
        break;
      case 'set_variable':
        await this.setVariable(config, context);
        break;
      default:
        throw new Error(`Unknown action type: ${config.actionType}`);
    }
  }

  /**
   * Execute delay node
   */
  private static async executeDelayNode(node: WorkflowNode, context: ExecutionContext): Promise<void> {
    const config = node.config;
    const delayMs = this.parseDelay(config.delay);
    
    logger.info(`Delaying execution for ${delayMs}ms`);
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  /**
   * Send email action
   */
  private static async sendEmail(config: any, context: ExecutionContext): Promise<void> {
    logger.info(`Sending email with template: ${config.template}`);
    
    // In a real implementation, this would integrate with an email service
    // For now, we'll just log the action
    const emailData = {
      template: config.template,
      recipients: this.resolveValue(config.recipients, context),
      subject: this.resolveValue(config.subject, context),
      data: context.data
    };
    
    logger.info(`Email would be sent:`, emailData);
  }

  /**
   * Update status action
   */
  private static async updateStatus(config: any, context: ExecutionContext): Promise<void> {
    logger.info(`Updating status to: ${config.status}`);
    
    // In a real implementation, this would update the record in the database
    context.data.status = config.status;
  }

  /**
   * Assign task action
   */
  private static async assignTask(config: any, context: ExecutionContext): Promise<void> {
    logger.info(`Assigning task to: ${config.assignee}`);
    
    // In a real implementation, this would create a task record
    const taskData = {
      assignee: this.resolveValue(config.assignee, context),
      title: this.resolveValue(config.title, context),
      description: this.resolveValue(config.description, context),
      dueDate: config.dueDate ? new Date(config.dueDate) : null
    };
    
    logger.info(`Task would be created:`, taskData);
  }

  /**
   * Create record action
   */
  private static async createRecord(config: any, context: ExecutionContext): Promise<void> {
    logger.info(`Creating ${config.recordType} record`);
    
    // In a real implementation, this would create a record in the database
    const recordData = {
      type: config.recordType,
      data: this.resolveValue(config.data, context)
    };
    
    logger.info(`Record would be created:`, recordData);
  }

  /**
   * Update record action
   */
  private static async updateRecord(config: any, context: ExecutionContext): Promise<void> {
    logger.info(`Updating ${config.recordType} record`);
    
    // In a real implementation, this would update a record in the database
    const recordData = {
      type: config.recordType,
      id: this.resolveValue(config.recordId, context),
      data: this.resolveValue(config.data, context)
    };
    
    logger.info(`Record would be updated:`, recordData);
  }

  /**
   * Generate report action
   */
  private static async generateReport(config: any, context: ExecutionContext): Promise<void> {
    logger.info(`Generating ${config.reportType} report`);
    
    // In a real implementation, this would generate a report
    const reportData = {
      type: config.reportType,
      parameters: this.resolveValue(config.parameters, context)
    };
    
    logger.info(`Report would be generated:`, reportData);
  }

  /**
   * Call webhook action
   */
  private static async callWebhook(config: any, context: ExecutionContext): Promise<void> {
    logger.info(`Calling webhook: ${config.url}`);
    
    // In a real implementation, this would make an HTTP request
    const webhookData = {
      url: config.url,
      method: config.method || 'POST',
      headers: config.headers || {},
      body: this.resolveValue(config.body, context)
    };
    
    logger.info(`Webhook would be called:`, webhookData);
  }

  /**
   * Set variable action
   */
  private static async setVariable(config: any, context: ExecutionContext): Promise<void> {
    const variableName = config.variableName;
    const variableValue = this.resolveValue(config.variableValue, context);
    
    context.variables[variableName] = variableValue;
    logger.info(`Set variable ${variableName} = ${variableValue}`);
  }

  /**
   * Get field value from data using dot notation
   */
  private static getFieldValue(data: any, field: string): any {
    return field.split('.').reduce((obj, key) => obj?.[key], data);
  }

  /**
   * Resolve value from context (supports variable substitution)
   */
  private static resolveValue(value: any, context: ExecutionContext): any {
    if (typeof value === 'string') {
      // Replace variables in the format {{variableName}}
      return value.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
        return context.variables[variableName] || context.data[variableName] || match;
      });
    }
    return value;
  }

  /**
   * Parse delay string (e.g., "5m", "1h", "30s")
   */
  private static parseDelay(delay: string): number {
    const match = delay.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error(`Invalid delay format: ${delay}`);
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        throw new Error(`Unknown delay unit: ${unit}`);
    }
  }

  /**
   * Validate workflow structure
   */
  static validateWorkflow(nodes: WorkflowNode[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for at least one trigger node
    const triggerNodes = nodes.filter(node => node.type === 'trigger');
    if (triggerNodes.length === 0) {
      errors.push('Workflow must have at least one trigger node');
    }

    // Check for orphaned nodes (nodes with no connections)
    const connectedNodes = new Set<string>();
    nodes.forEach(node => {
      node.connections.forEach(connectionId => {
        connectedNodes.add(connectionId);
      });
    });

    const orphanedNodes = nodes.filter(node => 
      node.type !== 'trigger' && !connectedNodes.has(node.id)
    );

    if (orphanedNodes.length > 0) {
      errors.push(`Orphaned nodes found: ${orphanedNodes.map(n => n.id).join(', ')}`);
    }

    // Check for circular references
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) {
        return true;
      }
      if (visited.has(nodeId)) {
        return false;
      }

      visited.add(nodeId);
      recursionStack.add(nodeId);

      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        for (const connectionId of node.connections) {
          if (hasCycle(connectionId)) {
            return true;
          }
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const node of nodes) {
      if (hasCycle(node.id)) {
        errors.push('Circular reference detected in workflow');
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
