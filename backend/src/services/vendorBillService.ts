import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export class VendorBillService {
  // Bill Capture and OCR
  async captureBill(userId: string, billData: any) {
    try {
      const bill = {
        userId,
        billNumber: billData.billNumber,
        vendor: billData.vendor,
        items: billData.items,
        totalAmount: this.calculateTotalAmount(billData.items),
        dueDate: billData.dueDate,
        status: 'captured',
        ocrData: await this.performOCR(billData.image),
        capturedAt: new Date()
      };

      // Store bill
      const savedBill = await prisma.vendorBill.create({
        data: {
          id: uuidv4(),
          userId,
          billNumber: bill.billNumber,
          bill: JSON.stringify(bill),
          createdAt: new Date()
        }
      });

      return { ...bill, id: savedBill.id };
    } catch (error) {
      throw new Error(`Failed to capture bill: ${error.message}`);
    }
  }

  // Bill Approval Workflows
  async submitBillForApproval(billId: string, approvalData: any) {
    try {
      const bill = await this.getBill(billId);
      const workflow = await this.getApprovalWorkflow(bill.userId, bill);
      
      const approval = {
        billId,
        workflowId: workflow.id,
        currentLevel: 1,
        approvals: [],
        status: 'pending',
        submittedAt: new Date(),
        nextApprover: await this.getNextApprover(workflow, 1)
      };

      // Store bill approval
      const savedApproval = await prisma.billApproval.create({
        data: {
          id: uuidv4(),
          billId,
          workflowId: workflow.id,
          approval: JSON.stringify(approval),
          createdAt: new Date()
        }
      });

      // Send notifications
      await this.sendApprovalNotifications(approval);

      return { ...approval, id: savedApproval.id };
    } catch (error) {
      throw new Error(`Failed to submit bill for approval: ${error.message}`);
    }
  }

  // Bill Payment Scheduling
  async scheduleBillPayment(billId: string, paymentData: any) {
    try {
      const bill = await this.getBill(billId);
      
      const paymentSchedule = {
        billId,
        paymentDate: paymentData.paymentDate,
        paymentMethod: paymentData.paymentMethod,
        amount: bill.totalAmount,
        status: 'scheduled',
        scheduledAt: new Date()
      };

      // Store payment schedule
      const savedSchedule = await prisma.billPaymentSchedule.create({
        data: {
          id: uuidv4(),
          billId,
          schedule: JSON.stringify(paymentSchedule),
          createdAt: new Date()
        }
      });

      return { ...paymentSchedule, id: savedSchedule.id };
    } catch (error) {
      throw new Error(`Failed to schedule bill payment: ${error.message}`);
    }
  }

  // Vendor Payment History
  async getVendorPaymentHistory(vendorId: string, period: any) {
    try {
      const history = {
        vendorId,
        period,
        payments: await this.getVendorPayments(vendorId, period),
        totalPaid: await this.getTotalPaid(vendorId, period),
        averagePaymentTime: await this.getAveragePaymentTime(vendorId, period),
        paymentTrends: await this.getPaymentTrends(vendorId, period),
        outstandingBills: await this.getOutstandingBills(vendorId),
        creditScore: await this.calculateVendorCreditScore(vendorId)
      };

      return history;
    } catch (error) {
      throw new Error(`Failed to get vendor payment history: ${error.message}`);
    }
  }

  // Early Payment Discount Tracking
  async trackEarlyPaymentDiscounts(userId: string, period: any) {
    try {
      const discounts = {
        userId,
        period,
        availableDiscounts: await this.getAvailableDiscounts(userId, period),
        capturedDiscounts: await this.getCapturedDiscounts(userId, period),
        missedDiscounts: await this.getMissedDiscounts(userId, period),
        totalSavings: await this.getTotalSavings(userId, period),
        recommendations: await this.generateDiscountRecommendations(userId, period)
      };

      return discounts;
    } catch (error) {
      throw new Error(`Failed to track early payment discounts: ${error.message}`);
    }
  }

  // Bill Aging Reports
  async generateBillAgingReport(userId: string, reportData: any) {
    try {
      const agingReport = {
        userId,
        reportDate: reportData.reportDate,
        agingBuckets: await this.calculateAgingBuckets(userId, reportData.reportDate),
        totalOutstanding: await this.getTotalOutstanding(userId),
        overdueBills: await this.getOverdueBills(userId),
        agingTrends: await this.getAgingTrends(userId, reportData.reportDate),
        recommendations: await this.generateAgingRecommendations(userId)
      };

      // Store aging report
      await prisma.billAgingReport.create({
        data: {
          id: uuidv4(),
          userId,
          reportDate: reportData.reportDate,
          report: JSON.stringify(agingReport),
          generatedAt: new Date()
        }
      });

      return agingReport;
    } catch (error) {
      throw new Error(`Failed to generate bill aging report: ${error.message}`);
    }
  }

  // Bill Management Dashboard
  async getBillManagementDashboard(userId: string) {
    try {
      const dashboard = {
        userId,
        activeBills: await this.getActiveBills(userId),
        pendingApprovals: await this.getPendingBillApprovals(userId),
        upcomingPayments: await this.getUpcomingPayments(userId),
        overdueBills: await this.getOverdueBills(userId),
        vendorSummary: await this.getVendorBillSummary(userId),
        spending: await this.getBillSpending(userId),
        trends: await this.getBillTrends(userId),
        recommendations: await this.getBillRecommendations(userId),
        generatedAt: new Date()
      };

      return dashboard;
    } catch (error) {
      throw new Error(`Failed to get bill management dashboard: ${error.message}`);
    }
  }

  // Bill Analytics
  async getBillAnalytics(userId: string, period: any) {
    try {
      const analytics = {
        userId,
        period,
        metrics: await this.getBillMetrics(userId, period),
        vendorAnalysis: await this.getBillVendorAnalysis(userId, period),
        spendingAnalysis: await this.getBillSpendingAnalysis(userId, period),
        paymentAnalysis: await this.getPaymentAnalysis(userId, period),
        trends: await this.getBillAnalyticsTrends(userId, period),
        insights: await this.generateBillInsights(userId, period),
        recommendations: await this.generateBillAnalyticsRecommendations(userId, period)
      };

      return analytics;
    } catch (error) {
      throw new Error(`Failed to get bill analytics: ${error.message}`);
    }
  }

  // Helper Methods
  private calculateTotalAmount(items: any[]): number {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  }

  private async performOCR(imageData: any): Promise<any> {
    // Simplified OCR processing
    return {
      confidence: 0.95,
      extractedText: 'Office Supplies Invoice',
      vendor: 'Vendor A',
      amount: 250.00,
      date: '2024-01-15'
    };
  }

  private async getBill(billId: string): Promise<any> {
    // Simplified bill retrieval
    return {
      id: billId,
      billNumber: 'BILL-001',
      vendor: 'Vendor A',
      items: [
        { description: 'Office Supplies', quantity: 10, unitPrice: 25.00 }
      ],
      totalAmount: 250.00,
      dueDate: '2024-02-15',
      status: 'pending'
    };
  }

  private async getApprovalWorkflow(userId: string, bill: any): Promise<any> {
    // Simplified approval workflow retrieval
    return {
      id: 'workflow1',
      name: 'Standard Bill Approval',
      levels: [
        { level: 1, approver: 'manager1', threshold: 1000 },
        { level: 2, approver: 'director1', threshold: 5000 }
      ]
    };
  }

  private async getNextApprover(workflow: any, currentLevel: number): Promise<any> {
    // Simplified next approver retrieval
    const level = workflow.levels.find((l: any) => l.level === currentLevel);
    return level ? { id: level.approver, name: `Approver ${level.approver}` } : null;
  }

  private async sendApprovalNotifications(approval: any): Promise<void> {
    // Simplified notification sending
    console.log('Sending bill approval notifications...');
  }

  private async getVendorPayments(vendorId: string, period: any): Promise<any[]> {
    // Simplified vendor payments retrieval
    return [
      { id: 'payment1', amount: 1000, date: '2024-01-10', status: 'completed' },
      { id: 'payment2', amount: 500, date: '2024-01-15', status: 'completed' }
    ];
  }

  private async getTotalPaid(vendorId: string, period: any): Promise<number> {
    // Simplified total paid calculation
    return 1500;
  }

  private async getAveragePaymentTime(vendorId: string, period: any): Promise<number> {
    // Simplified average payment time calculation
    return 15; // days
  }

  private async getPaymentTrends(vendorId: string, period: any): Promise<any> {
    // Simplified payment trends
    return {
      volume: { trend: 'stable', change: 0.02 },
      timing: { trend: 'improving', change: -0.05 }
    };
  }

  private async getOutstandingBills(vendorId: string): Promise<any[]> {
    // Simplified outstanding bills retrieval
    return [
      { id: 'bill1', amount: 750, dueDate: '2024-02-01', daysOverdue: 0 }
    ];
  }

  private async calculateVendorCreditScore(vendorId: string): Promise<number> {
    // Simplified vendor credit score calculation
    return 85;
  }

  private async getAvailableDiscounts(userId: string, period: any): Promise<any[]> {
    // Simplified available discounts retrieval
    return [
      { billId: 'bill1', discount: 0.02, deadline: '2024-01-20', savings: 15.00 }
    ];
  }

  private async getCapturedDiscounts(userId: string, period: any): Promise<any[]> {
    // Simplified captured discounts retrieval
    return [
      { billId: 'bill2', discount: 0.02, captured: 10.00, date: '2024-01-15' }
    ];
  }

  private async getMissedDiscounts(userId: string, period: any): Promise<any[]> {
    // Simplified missed discounts retrieval
    return [
      { billId: 'bill3', discount: 0.02, missed: 20.00, deadline: '2024-01-10' }
    ];
  }

  private async getTotalSavings(userId: string, period: any): Promise<number> {
    // Simplified total savings calculation
    return 10.00;
  }

  private async generateDiscountRecommendations(userId: string, period: any): Promise<any[]> {
    // Simplified discount recommendations
    return [
      { type: 'timing', description: 'Pay bills within discount period', priority: 'high' }
    ];
  }

  private async calculateAgingBuckets(userId: string, reportDate: any): Promise<any> {
    // Simplified aging buckets calculation
    return {
      '0-30': { count: 5, amount: 2500 },
      '31-60': { count: 3, amount: 1500 },
      '61-90': { count: 2, amount: 1000 },
      '90+': { count: 1, amount: 500 }
    };
  }

  private async getTotalOutstanding(userId: string): Promise<number> {
    // Simplified total outstanding calculation
    return 5500;
  }

  private async getOverdueBills(userId: string): Promise<any[]> {
    // Simplified overdue bills retrieval
    return [
      { id: 'bill4', amount: 300, daysOverdue: 5, vendor: 'Vendor B' }
    ];
  }

  private async getAgingTrends(userId: string, reportDate: any): Promise<any> {
    // Simplified aging trends
    return {
      trend: 'improving',
      change: -0.10
    };
  }

  private async generateAgingRecommendations(userId: string): Promise<any[]> {
    // Simplified aging recommendations
    return [
      { type: 'payment', description: 'Prioritize overdue bills', priority: 'high' }
    ];
  }

  // Dashboard helper methods
  private async getActiveBills(userId: string): Promise<any[]> {
    // Simplified active bills retrieval
    return [
      { id: 'bill1', vendor: 'Vendor A', amount: 1000, dueDate: '2024-02-01', status: 'pending' },
      { id: 'bill2', vendor: 'Vendor B', amount: 500, dueDate: '2024-02-15', status: 'approved' }
    ];
  }

  private async getPendingBillApprovals(userId: string): Promise<any[]> {
    // Simplified pending bill approvals retrieval
    return [
      { id: 'approval1', bill: 'BILL-003', amount: 750, daysPending: 2 }
    ];
  }

  private async getUpcomingPayments(userId: string): Promise<any[]> {
    // Simplified upcoming payments retrieval
    return [
      { id: 'payment1', bill: 'BILL-001', amount: 1000, dueDate: '2024-02-01' }
    ];
  }

  private async getVendorBillSummary(userId: string): Promise<any> {
    // Simplified vendor bill summary
    return {
      totalVendors: 20,
      activeVendors: 15,
      totalBills: 50,
      totalAmount: 25000
    };
  }

  private async getBillSpending(userId: string): Promise<any> {
    // Simplified bill spending
    return {
      currentMonth: 12000,
      lastMonth: 10000,
      change: 0.20
    };
  }

  private async getBillTrends(userId: string): Promise<any> {
    // Simplified bill trends
    return {
      volume: { trend: 'increasing', change: 0.15 },
      spending: { trend: 'stable', change: 0.02 }
    };
  }

  private async getBillRecommendations(userId: string): Promise<any[]> {
    // Simplified bill recommendations
    return [
      { type: 'efficiency', description: 'Automate bill approval for small amounts', priority: 'medium' }
    ];
  }

  private async getBillMetrics(userId: string, period: any): Promise<any> {
    // Simplified bill metrics
    return {
      totalBills: 100,
      totalAmount: 50000,
      averageAmount: 500,
      approvalRate: 0.85
    };
  }

  private async getBillVendorAnalysis(userId: string, period: any): Promise<any> {
    // Simplified bill vendor analysis
    return {
      topVendors: [
        { vendor: 'Vendor A', amount: 15000, percentage: 0.30 },
        { vendor: 'Vendor B', amount: 10000, percentage: 0.20 }
      ]
    };
  }

  private async getBillSpendingAnalysis(userId: string, period: any): Promise<any> {
    // Simplified bill spending analysis
    return {
      byCategory: {
        'Office Supplies': 20000,
        'Software': 15000,
        'Services': 10000
      }
    };
  }

  private async getPaymentAnalysis(userId: string, period: any): Promise<any> {
    // Simplified payment analysis
    return {
      averagePaymentTime: 20,
      onTimePaymentRate: 0.90,
      earlyPaymentRate: 0.15
    };
  }

  private async getBillAnalyticsTrends(userId: string, period: any): Promise<any> {
    // Simplified bill analytics trends
    return {
      volume: { trend: 'increasing', change: 0.25 },
      efficiency: { trend: 'improving', change: 0.10 }
    };
  }

  private async generateBillInsights(userId: string, period: any): Promise<any[]> {
    // Simplified bill insights
    return [
      { type: 'spending', insight: 'Office supplies spending increased 30%', confidence: 0.9 },
      { type: 'efficiency', insight: 'Payment processing time improved by 20%', confidence: 0.8 }
    ];
  }

  private async generateBillAnalyticsRecommendations(userId: string, period: any): Promise<any[]> {
    // Simplified bill analytics recommendations
    return [
      { type: 'optimization', description: 'Implement automated bill processing', priority: 'high' }
    ];
  }
}

export default new VendorBillService();










