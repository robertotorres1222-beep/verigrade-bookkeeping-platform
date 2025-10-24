import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export class ExpenseApprovalService {
  // Multi-level Approval Workflows
  async createApprovalWorkflow(userId: string, workflowData: any) {
    try {
      const workflow = {
        userId,
        name: workflowData.name,
        levels: workflowData.levels,
        rules: workflowData.rules,
        approvers: workflowData.approvers,
        status: 'active',
        createdAt: new Date()
      };

      // Store approval workflow
      const savedWorkflow = await prisma.expenseApprovalWorkflow.create({
        data: {
          id: uuidv4(),
          userId,
          name: workflowData.name,
          workflow: JSON.stringify(workflow),
          createdAt: new Date()
        }
      });

      return { ...workflow, id: savedWorkflow.id };
    } catch (error) {
      throw new Error(`Failed to create approval workflow: ${error.message}`);
    }
  }

  // Approval Rules Engine
  async processExpenseApproval(userId: string, expenseId: string, approvalData: any) {
    try {
      const expense = await this.getExpense(expenseId);
      const applicableWorkflow = await this.getApplicableWorkflow(userId, expense);
      
      const approval = {
        expenseId,
        workflowId: applicableWorkflow.id,
        currentLevel: 1,
        approvals: [],
        status: 'pending',
        rulesApplied: await this.applyApprovalRules(expense, applicableWorkflow),
        nextApprover: await this.getNextApprover(applicableWorkflow, 1),
        createdAt: new Date()
      };

      // Store expense approval
      const savedApproval = await prisma.expenseApproval.create({
        data: {
          id: uuidv4(),
          userId,
          expenseId,
          workflowId: applicableWorkflow.id,
          approval: JSON.stringify(approval),
          createdAt: new Date()
        }
      });

      // Send notifications
      await this.sendApprovalNotifications(approval);

      return { ...approval, id: savedApproval.id };
    } catch (error) {
      throw new Error(`Failed to process expense approval: ${error.message}`);
    }
  }

  // Approval Delegation
  async delegateApproval(userId: string, approvalId: string, delegationData: any) {
    try {
      const delegation = {
        approvalId,
        fromUserId: userId,
        toUserId: delegationData.toUserId,
        reason: delegationData.reason,
        startDate: delegationData.startDate,
        endDate: delegationData.endDate,
        status: 'active',
        createdAt: new Date()
      };

      // Store delegation
      const savedDelegation = await prisma.approvalDelegation.create({
        data: {
          id: uuidv4(),
          userId,
          approvalId,
          delegation: JSON.stringify(delegation),
          createdAt: new Date()
        }
      });

      return { ...delegation, id: savedDelegation.id };
    } catch (error) {
      throw new Error(`Failed to delegate approval: ${error.message}`);
    }
  }

  // Expense Policy Enforcement
  async enforceExpensePolicy(userId: string, expenseId: string) {
    try {
      const expense = await this.getExpense(expenseId);
      const policies = await this.getExpensePolicies(userId);
      
      const enforcement = {
        expenseId,
        policies: policies,
        violations: await this.checkPolicyViolations(expense, policies),
        recommendations: await this.generatePolicyRecommendations(expense, policies),
        compliance: await this.calculateComplianceScore(expense, policies),
        status: await this.determineEnforcementStatus(expense, policies)
      };

      // Store policy enforcement
      await prisma.expensePolicyEnforcement.create({
        data: {
          id: uuidv4(),
          userId,
          expenseId,
          enforcement: JSON.stringify(enforcement),
          enforcedAt: new Date()
        }
      });

      return enforcement;
    } catch (error) {
      throw new Error(`Failed to enforce expense policy: ${error.message}`);
    }
  }

  // Approval Notifications
  async sendApprovalNotifications(approval: any) {
    try {
      const notifications = [];

      // Send notification to next approver
      if (approval.nextApprover) {
        const notification = await this.createApprovalNotification(approval);
        notifications.push(notification);
      }

      // Send notification to expense submitter
      const submitterNotification = await this.createSubmitterNotification(approval);
      notifications.push(submitterNotification);

      return notifications;
    } catch (error) {
      throw new Error(`Failed to send approval notifications: ${error.message}`);
    }
  }

  // Expense Rejection with Reasons
  async rejectExpense(approvalId: string, rejectionData: any) {
    try {
      const rejection = {
        approvalId,
        reason: rejectionData.reason,
        comments: rejectionData.comments,
        rejectedBy: rejectionData.rejectedBy,
        rejectedAt: new Date(),
        status: 'rejected'
      };

      // Update approval status
      await prisma.expenseApproval.update({
        where: { id: approvalId },
        data: {
          status: 'rejected',
          rejection: JSON.stringify(rejection)
        }
      });

      // Send rejection notification
      await this.sendRejectionNotification(rejection);

      return rejection;
    } catch (error) {
      throw new Error(`Failed to reject expense: ${error.message}`);
    }
  }

  // Approval Dashboard
  async getApprovalDashboard(userId: string) {
    try {
      const dashboard = {
        userId,
        pendingApprovals: await this.getPendingApprovals(userId),
        myApprovals: await this.getMyApprovals(userId),
        delegatedApprovals: await this.getDelegatedApprovals(userId),
        approvalHistory: await this.getApprovalHistory(userId),
        policyViolations: await this.getPolicyViolations(userId),
        statistics: await this.getApprovalStatistics(userId),
        recommendations: await this.getApprovalRecommendations(userId),
        generatedAt: new Date()
      };

      return dashboard;
    } catch (error) {
      throw new Error(`Failed to get approval dashboard: ${error.message}`);
    }
  }

  // Bulk Approval Operations
  async bulkApproveExpenses(userId: string, expenseIds: string[], approvalData: any) {
    try {
      const results = [];

      for (const expenseId of expenseIds) {
        try {
          const approval = await this.processExpenseApproval(userId, expenseId, approvalData);
          results.push({
            expenseId,
            success: true,
            approval
          });
        } catch (error) {
          results.push({
            expenseId,
            success: false,
            error: error.message
          });
        }
      }

      return {
        totalExpenses: expenseIds.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      };
    } catch (error) {
      throw new Error(`Failed to bulk approve expenses: ${error.message}`);
    }
  }

  // Approval Analytics
  async getApprovalAnalytics(userId: string, period: any) {
    try {
      const analytics = {
        userId,
        period,
        approvalMetrics: await this.getApprovalMetrics(userId, period),
        processingTimes: await this.getProcessingTimes(userId, period),
        approvalRates: await this.getApprovalRates(userId, period),
        bottlenecks: await this.identifyBottlenecks(userId, period),
        trends: await this.getApprovalTrends(userId, period),
        insights: await this.generateApprovalInsights(userId, period),
        recommendations: await this.generateAnalyticsRecommendations(userId, period)
      };

      return analytics;
    } catch (error) {
      throw new Error(`Failed to get approval analytics: ${error.message}`);
    }
  }

  // Helper Methods
  private async getExpense(expenseId: string): Promise<any> {
    // Simplified expense retrieval
    return {
      id: expenseId,
      amount: 500,
      category: 'Travel',
      description: 'Business trip',
      date: '2024-01-15',
      submitter: 'user123'
    };
  }

  private async getApplicableWorkflow(userId: string, expense: any): Promise<any> {
    // Simplified workflow retrieval
    return {
      id: 'workflow1',
      name: 'Standard Expense Approval',
      levels: [
        { level: 1, approver: 'manager1', threshold: 1000 },
        { level: 2, approver: 'director1', threshold: 5000 }
      ]
    };
  }

  private async applyApprovalRules(expense: any, workflow: any): Promise<any[]> {
    // Simplified rule application
    const rules = [];
    
    if (expense.amount > 1000) {
      rules.push({ rule: 'High amount approval required', applied: true });
    }
    
    if (expense.category === 'Travel') {
      rules.push({ rule: 'Travel policy compliance', applied: true });
    }
    
    return rules;
  }

  private async getNextApprover(workflow: any, currentLevel: number): Promise<any> {
    // Simplified next approver retrieval
    const level = workflow.levels.find((l: any) => l.level === currentLevel);
    return level ? { id: level.approver, name: `Approver ${level.approver}` } : null;
  }

  private async sendApprovalNotifications(approval: any): Promise<void> {
    // Simplified notification sending
    console.log('Sending approval notifications...');
  }

  private async createApprovalNotification(approval: any): Promise<any> {
    // Simplified approval notification creation
    return {
      type: 'approval_required',
      recipient: approval.nextApprover.id,
      message: 'New expense requires your approval',
      priority: 'high'
    };
  }

  private async createSubmitterNotification(approval: any): Promise<any> {
    // Simplified submitter notification creation
    return {
      type: 'approval_submitted',
      recipient: approval.submitter,
      message: 'Your expense has been submitted for approval',
      priority: 'medium'
    };
  }

  private async sendRejectionNotification(rejection: any): Promise<void> {
    // Simplified rejection notification sending
    console.log('Sending rejection notification...');
  }

  private async getExpensePolicies(userId: string): Promise<any[]> {
    // Simplified expense policies retrieval
    return [
      { policy: 'Maximum meal expense', limit: 50, category: 'Meals' },
      { policy: 'Travel approval required', threshold: 1000, category: 'Travel' },
      { policy: 'Receipt required', threshold: 25, category: 'All' }
    ];
  }

  private async checkPolicyViolations(expense: any, policies: any[]): Promise<any[]> {
    // Simplified policy violation checking
    const violations = [];
    
    for (const policy of policies) {
      if (policy.category === 'All' || policy.category === expense.category) {
        if (expense.amount > policy.limit) {
          violations.push({
            policy: policy.policy,
            violation: `Amount ${expense.amount} exceeds limit ${policy.limit}`,
            severity: 'high'
          });
        }
      }
    }
    
    return violations;
  }

  private async generatePolicyRecommendations(expense: any, policies: any[]): Promise<any[]> {
    // Simplified policy recommendations
    const recommendations = [];
    
    if (expense.amount > 100) {
      recommendations.push({
        type: 'documentation',
        recommendation: 'Provide detailed receipt and business justification',
        priority: 'high'
      });
    }
    
    return recommendations;
  }

  private async calculateComplianceScore(expense: any, policies: any[]): Promise<number> {
    // Simplified compliance score calculation
    const violations = await this.checkPolicyViolations(expense, policies);
    return Math.max(0, 1 - (violations.length / policies.length));
  }

  private async determineEnforcementStatus(expense: any, policies: any[]): Promise<string> {
    // Simplified enforcement status determination
    const violations = await this.checkPolicyViolations(expense, policies);
    const highSeverityViolations = violations.filter(v => v.severity === 'high');
    
    if (highSeverityViolations.length > 0) {
      return 'blocked';
    } else if (violations.length > 0) {
      return 'warning';
    } else {
      return 'compliant';
    }
  }

  // Dashboard helper methods
  private async getPendingApprovals(userId: string): Promise<any[]> {
    // Simplified pending approvals retrieval
    return [
      { id: 'approval1', expense: 'Business trip', amount: 500, submitter: 'user123', daysPending: 2 },
      { id: 'approval2', expense: 'Office supplies', amount: 150, submitter: 'user456', daysPending: 1 }
    ];
  }

  private async getMyApprovals(userId: string): Promise<any[]> {
    // Simplified my approvals retrieval
    return [
      { id: 'approval3', expense: 'Software license', amount: 200, status: 'approved', approvedAt: '2024-01-14' }
    ];
  }

  private async getDelegatedApprovals(userId: string): Promise<any[]> {
    // Simplified delegated approvals retrieval
    return [];
  }

  private async getApprovalHistory(userId: string): Promise<any[]> {
    // Simplified approval history retrieval
    return [
      { id: 'approval4', expense: 'Training course', amount: 300, status: 'rejected', date: '2024-01-13' }
    ];
  }

  private async getPolicyViolations(userId: string): Promise<any[]> {
    // Simplified policy violations retrieval
    return [
      { expense: 'Expensive dinner', amount: 200, violation: 'Exceeds meal limit', severity: 'high' }
    ];
  }

  private async getApprovalStatistics(userId: string): Promise<any> {
    // Simplified approval statistics
    return {
      totalApprovals: 25,
      approved: 20,
      rejected: 3,
      pending: 2,
      averageProcessingTime: 2.5
    };
  }

  private async getApprovalRecommendations(userId: string): Promise<any[]> {
    // Simplified approval recommendations
    return [
      { type: 'efficiency', description: 'Consider auto-approval for small amounts', priority: 'medium' }
    ];
  }

  private async getApprovalMetrics(userId: string, period: any): Promise<any> {
    // Simplified approval metrics
    return {
      totalExpenses: 100,
      totalAmount: 50000,
      averageAmount: 500,
      approvalRate: 0.85
    };
  }

  private async getProcessingTimes(userId: string, period: any): Promise<any> {
    // Simplified processing times
    return {
      average: 2.5,
      median: 2.0,
      p95: 5.0
    };
  }

  private async getApprovalRates(userId: string, period: any): Promise<any> {
    // Simplified approval rates
    return {
      overall: 0.85,
      byCategory: {
        'Travel': 0.90,
        'Meals': 0.80,
        'Office': 0.95
      }
    };
  }

  private async identifyBottlenecks(userId: string, period: any): Promise<any[]> {
    // Simplified bottleneck identification
    return [
      { stage: 'Manager Approval', averageTime: 3.5, bottleneck: true },
      { stage: 'Director Approval', averageTime: 1.0, bottleneck: false }
    ];
  }

  private async getApprovalTrends(userId: string, period: any): Promise<any> {
    // Simplified approval trends
    return {
      volume: { trend: 'increasing', change: 0.15 },
      processingTime: { trend: 'improving', change: -0.10 }
    };
  }

  private async generateApprovalInsights(userId: string, period: any): Promise<any[]> {
    // Simplified approval insights
    return [
      { type: 'efficiency', insight: 'Manager approval is the main bottleneck', confidence: 0.9 },
      { type: 'policy', insight: 'Travel expenses have higher rejection rates', confidence: 0.8 }
    ];
  }

  private async generateAnalyticsRecommendations(userId: string, period: any): Promise<any[]> {
    // Simplified analytics recommendations
    return [
      { type: 'optimization', description: 'Implement auto-approval for low-risk expenses', priority: 'high' }
    ];
  }
}

export default new ExpenseApprovalService();







