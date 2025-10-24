import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import crypto from 'crypto';

const prisma = new PrismaClient();

export class AdvancedFraudService {
  /**
   * Detect ghost employees
   */
  async detectGhostEmployees(companyId: string): Promise<any> {
    try {
      const ghostEmployees = await prisma.$queryRaw`
        SELECT 
          e.id,
          e.name,
          e.email,
          e.hire_date,
          COUNT(exp.id) as expense_count,
          COUNT(ts.id) as timesheet_count,
          COUNT(comm.id) as communication_count,
          MAX(exp.created_at) as last_expense,
          MAX(ts.created_at) as last_timesheet,
          MAX(comm.created_at) as last_communication
        FROM employees e
        LEFT JOIN expenses exp ON e.id = exp.employee_id
        LEFT JOIN timesheets ts ON e.id = ts.employee_id
        LEFT JOIN communications comm ON e.id = comm.employee_id
        WHERE e.company_id = ${companyId}
        AND e.is_active = true
        AND e.hire_date < CURRENT_DATE - INTERVAL '30 days'
        GROUP BY e.id, e.name, e.email, e.hire_date
        HAVING 
          COUNT(exp.id) = 0 
          AND COUNT(ts.id) = 0 
          AND COUNT(comm.id) = 0
          OR (MAX(exp.created_at) < CURRENT_DATE - INTERVAL '90 days' 
              AND MAX(ts.created_at) < CURRENT_DATE - INTERVAL '90 days'
              AND MAX(comm.created_at) < CURRENT_DATE - INTERVAL '90 days')
      `;

      // Create fraud detection records
      for (const employee of ghostEmployees as any[]) {
        await prisma.fraudDetection.create({
          data: {
            companyId,
            fraudType: 'ghost_employee',
            entityType: 'employee',
            entityId: employee.id,
            severity: 'high',
            description: `Ghost employee detected: ${employee.name} has no activity for 90+ days`,
            fraudData: JSON.stringify({
              employeeName: employee.name,
              employeeEmail: employee.email,
              hireDate: employee.hire_date,
              lastActivity: Math.max(
                new Date(employee.last_expense || 0).getTime(),
                new Date(employee.last_timesheet || 0).getTime(),
                new Date(employee.last_communication || 0).getTime()
              ),
              riskScore: this.calculateGhostEmployeeRiskScore(employee)
            }),
            detectedAt: new Date(),
            isResolved: false
          }
        });
      }

      return ghostEmployees;
    } catch (error) {
      logger.error('Error detecting ghost employees:', error);
      throw error;
    }
  }

  /**
   * Calculate ghost employee risk score
   */
  private calculateGhostEmployeeRiskScore(employee: any): number {
    let riskScore = 0;
    
    // No expenses
    if (employee.expense_count === 0) riskScore += 30;
    
    // No timesheets
    if (employee.timesheet_count === 0) riskScore += 30;
    
    // No communications
    if (employee.communication_count === 0) riskScore += 40;
    
    // Long time since last activity
    const daysSinceLastActivity = this.getDaysSinceLastActivity(employee);
    if (daysSinceLastActivity > 90) riskScore += 20;
    if (daysSinceLastActivity > 180) riskScore += 30;
    
    return Math.min(riskScore, 100);
  }

  /**
   * Get days since last activity
   */
  private getDaysSinceLastActivity(employee: any): number {
    const lastActivity = Math.max(
      new Date(employee.last_expense || 0).getTime(),
      new Date(employee.last_timesheet || 0).getTime(),
      new Date(employee.last_communication || 0).getTime()
    );
    
    if (lastActivity === 0) return 999; // No activity ever
    
    return Math.floor((Date.now() - lastActivity) / (1000 * 60 * 60 * 24));
  }

  /**
   * Detect split transactions
   */
  async detectSplitTransactions(companyId: string): Promise<any> {
    try {
      const splitTransactions = await prisma.$queryRaw`
        WITH transaction_groups AS (
          SELECT 
            vendor_id,
            DATE(transaction_date) as transaction_date,
            SUM(amount) as total_amount,
            COUNT(*) as transaction_count,
            ARRAY_AGG(id) as transaction_ids,
            ARRAY_AGG(amount) as amounts
          FROM transactions
          WHERE company_id = ${companyId}
          AND transaction_date >= CURRENT_DATE - INTERVAL '30 days'
          GROUP BY vendor_id, DATE(transaction_date)
          HAVING COUNT(*) > 1
        )
        SELECT 
          tg.*,
          v.name as vendor_name,
          CASE 
            WHEN tg.total_amount BETWEEN 900 AND 1000 THEN 'high'
            WHEN tg.total_amount BETWEEN 800 AND 900 THEN 'medium'
            ELSE 'low'
          END as risk_level
        FROM transaction_groups tg
        JOIN vendors v ON tg.vendor_id = v.id
        WHERE tg.total_amount BETWEEN 800 AND 1000
        AND tg.transaction_count > 1
        ORDER BY tg.total_amount DESC
      `;

      // Create fraud detection records
      for (const split of splitTransactions as any[]) {
        await prisma.fraudDetection.create({
          data: {
            companyId,
            fraudType: 'split_transaction',
            entityType: 'transaction',
            entityId: split.transaction_ids[0],
            severity: split.risk_level,
            description: `Split transaction detected: ${split.transaction_count} transactions totaling $${split.total_amount} on ${split.transaction_date}`,
            fraudData: JSON.stringify({
              vendorName: split.vendor_name,
              transactionDate: split.transaction_date,
              totalAmount: split.total_amount,
              transactionCount: split.transaction_count,
              transactionIds: split.transaction_ids,
              amounts: split.amounts,
              riskScore: this.calculateSplitTransactionRiskScore(split)
            }),
            detectedAt: new Date(),
            isResolved: false
          }
        });
      }

      return splitTransactions;
    } catch (error) {
      logger.error('Error detecting split transactions:', error);
      throw error;
    }
  }

  /**
   * Calculate split transaction risk score
   */
  private calculateSplitTransactionRiskScore(split: any): number {
    let riskScore = 0;
    
    // Amount just under approval threshold
    if (split.total_amount >= 900 && split.total_amount < 1000) riskScore += 40;
    if (split.total_amount >= 800 && split.total_amount < 900) riskScore += 30;
    
    // Multiple transactions
    if (split.transaction_count >= 3) riskScore += 30;
    if (split.transaction_count >= 5) riskScore += 20;
    
    // Same day
    riskScore += 10;
    
    return Math.min(riskScore, 100);
  }

  /**
   * Detect duplicate invoices
   */
  async detectDuplicateInvoices(companyId: string): Promise<any> {
    try {
      const duplicateInvoices = await prisma.$queryRaw`
        WITH invoice_groups AS (
          SELECT 
            vendor_id,
            invoice_number,
            amount,
            COUNT(*) as duplicate_count,
            ARRAY_AGG(id) as invoice_ids,
            ARRAY_AGG(created_at) as created_dates
          FROM invoices
          WHERE company_id = ${companyId}
          AND invoice_number IS NOT NULL
          AND invoice_number != ''
          GROUP BY vendor_id, invoice_number, amount
          HAVING COUNT(*) > 1
        )
        SELECT 
          ig.*,
          v.name as vendor_name,
          CASE 
            WHEN ig.duplicate_count >= 3 THEN 'high'
            WHEN ig.duplicate_count = 2 THEN 'medium'
            ELSE 'low'
          END as risk_level
        FROM invoice_groups ig
        JOIN vendors v ON ig.vendor_id = v.id
        ORDER BY ig.duplicate_count DESC, ig.amount DESC
      `;

      // Create fraud detection records
      for (const duplicate of duplicateInvoices as any[]) {
        await prisma.fraudDetection.create({
          data: {
            companyId,
            fraudType: 'duplicate_invoice',
            entityType: 'invoice',
            entityId: duplicate.invoice_ids[0],
            severity: duplicate.risk_level,
            description: `Duplicate invoice detected: ${duplicate.duplicate_count} invoices with number ${duplicate.invoice_number} from ${duplicate.vendor_name}`,
            fraudData: JSON.stringify({
              vendorName: duplicate.vendor_name,
              invoiceNumber: duplicate.invoice_number,
              amount: duplicate.amount,
              duplicateCount: duplicate.duplicate_count,
              invoiceIds: duplicate.invoice_ids,
              createdDates: duplicate.created_dates,
              riskScore: this.calculateDuplicateInvoiceRiskScore(duplicate)
            }),
            detectedAt: new Date(),
            isResolved: false
          }
        });
      }

      return duplicateInvoices;
    } catch (error) {
      logger.error('Error detecting duplicate invoices:', error);
      throw error;
    }
  }

  /**
   * Calculate duplicate invoice risk score
   */
  private calculateDuplicateInvoiceRiskScore(duplicate: any): number {
    let riskScore = 0;
    
    // Number of duplicates
    if (duplicate.duplicate_count >= 3) riskScore += 40;
    if (duplicate.duplicate_count === 2) riskScore += 20;
    
    // High amount
    if (duplicate.amount >= 10000) riskScore += 30;
    if (duplicate.amount >= 5000) riskScore += 20;
    
    // Recent duplicates
    const daysSinceFirst = this.getDaysSinceFirstDuplicate(duplicate);
    if (daysSinceFirst <= 7) riskScore += 20;
    if (daysSinceFirst <= 30) riskScore += 10;
    
    return Math.min(riskScore, 100);
  }

  /**
   * Get days since first duplicate
   */
  private getDaysSinceFirstDuplicate(duplicate: any): number {
    const firstDate = new Date(Math.min(...duplicate.created_dates.map((d: string) => new Date(d).getTime())));
    return Math.floor((Date.now() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * Detect round number transactions
   */
  async detectRoundNumberTransactions(companyId: string): Promise<any> {
    try {
      const roundNumberTransactions = await prisma.$queryRaw`
        SELECT 
          t.id,
          t.amount,
          t.description,
          t.transaction_date,
          v.name as vendor_name,
          CASE 
            WHEN t.amount >= 10000 THEN 'high'
            WHEN t.amount >= 5000 THEN 'medium'
            ELSE 'low'
          END as risk_level
        FROM transactions t
        JOIN vendors v ON t.vendor_id = v.id
        WHERE t.company_id = ${companyId}
        AND t.transaction_date >= CURRENT_DATE - INTERVAL '30 days'
        AND t.amount >= 5000
        AND (
          t.amount::text ~ '^[0-9]+000$' OR
          t.amount::text ~ '^[0-9]+500$' OR
          t.amount::text ~ '^[0-9]+0000$'
        )
        ORDER BY t.amount DESC
      `;

      // Create fraud detection records
      for (const transaction of roundNumberTransactions as any[]) {
        await prisma.fraudDetection.create({
          data: {
            companyId,
            fraudType: 'round_number_transaction',
            entityType: 'transaction',
            entityId: transaction.id,
            severity: transaction.risk_level,
            description: `Round number transaction detected: $${transaction.amount} to ${transaction.vendor_name}`,
            fraudData: JSON.stringify({
              vendorName: transaction.vendor_name,
              amount: transaction.amount,
              description: transaction.description,
              transactionDate: transaction.transaction_date,
              riskScore: this.calculateRoundNumberRiskScore(transaction)
            }),
            detectedAt: new Date(),
            isResolved: false
          }
        });
      }

      return roundNumberTransactions;
    } catch (error) {
      logger.error('Error detecting round number transactions:', error);
      throw error;
    }
  }

  /**
   * Calculate round number transaction risk score
   */
  private calculateRoundNumberRiskScore(transaction: any): number {
    let riskScore = 0;
    
    // Amount thresholds
    if (transaction.amount >= 10000) riskScore += 40;
    if (transaction.amount >= 5000) riskScore += 20;
    
    // Round number patterns
    if (transaction.amount.toString().endsWith('0000')) riskScore += 30;
    if (transaction.amount.toString().endsWith('000')) riskScore += 20;
    if (transaction.amount.toString().endsWith('500')) riskScore += 10;
    
    return Math.min(riskScore, 100);
  }

  /**
   * Verify vendor existence
   */
  async verifyVendorExistence(companyId: string): Promise<any> {
    try {
      const suspiciousVendors = await prisma.$queryRaw`
        SELECT 
          v.id,
          v.name,
          v.email,
          v.phone,
          v.address,
          COUNT(t.id) as transaction_count,
          SUM(t.amount) as total_amount,
          MAX(t.transaction_date) as last_transaction
        FROM vendors v
        LEFT JOIN transactions t ON v.id = t.vendor_id
        WHERE v.company_id = ${companyId}
        AND (
          v.email IS NULL OR v.email = '' OR
          v.phone IS NULL OR v.phone = '' OR
          v.address IS NULL OR v.address = ''
        )
        GROUP BY v.id, v.name, v.email, v.phone, v.address
        HAVING COUNT(t.id) > 0
        ORDER BY SUM(t.amount) DESC
      `;

      // Create fraud detection records
      for (const vendor of suspiciousVendors as any[]) {
        await prisma.fraudDetection.create({
          data: {
            companyId,
            fraudType: 'suspicious_vendor',
            entityType: 'vendor',
            entityId: vendor.id,
            severity: 'medium',
            description: `Suspicious vendor detected: ${vendor.name} has incomplete information`,
            fraudData: JSON.stringify({
              vendorName: vendor.name,
              email: vendor.email,
              phone: vendor.phone,
              address: vendor.address,
              transactionCount: vendor.transaction_count,
              totalAmount: vendor.total_amount,
              lastTransaction: vendor.last_transaction,
              riskScore: this.calculateVendorRiskScore(vendor)
            }),
            detectedAt: new Date(),
            isResolved: false
          }
        });
      }

      return suspiciousVendors;
    } catch (error) {
      logger.error('Error verifying vendor existence:', error);
      throw error;
    }
  }

  /**
   * Calculate vendor risk score
   */
  private calculateVendorRiskScore(vendor: any): number {
    let riskScore = 0;
    
    // Missing email
    if (!vendor.email || vendor.email === '') riskScore += 25;
    
    // Missing phone
    if (!vendor.phone || vendor.phone === '') riskScore += 25;
    
    // Missing address
    if (!vendor.address || vendor.address === '') riskScore += 25;
    
    // High transaction amount
    if (vendor.total_amount >= 10000) riskScore += 25;
    
    return Math.min(riskScore, 100);
  }

  /**
   * Get fraud detection dashboard
   */
  async getFraudDashboard(companyId: string): Promise<any> {
    try {
      const [
        fraudStats,
        recentDetections,
        fraudSummary,
        riskAnalysis
      ] = await Promise.all([
        this.getFraudStats(companyId),
        this.getRecentDetections(companyId),
        this.getFraudSummary(companyId),
        this.getRiskAnalysis(companyId)
      ]);

      return {
        fraudStats,
        recentDetections,
        fraudSummary,
        riskAnalysis
      };
    } catch (error) {
      logger.error('Error getting fraud dashboard:', error);
      throw error;
    }
  }

  /**
   * Get fraud statistics
   */
  private async getFraudStats(companyId: string): Promise<any> {
    try {
      const stats = await prisma.$queryRaw`
        SELECT 
          COUNT(*) as total_detections,
          COUNT(CASE WHEN fraud_type = 'ghost_employee' THEN 1 END) as ghost_employees,
          COUNT(CASE WHEN fraud_type = 'split_transaction' THEN 1 END) as split_transactions,
          COUNT(CASE WHEN fraud_type = 'duplicate_invoice' THEN 1 END) as duplicate_invoices,
          COUNT(CASE WHEN fraud_type = 'round_number_transaction' THEN 1 END) as round_number_transactions,
          COUNT(CASE WHEN fraud_type = 'suspicious_vendor' THEN 1 END) as suspicious_vendors,
          COUNT(CASE WHEN severity = 'high' THEN 1 END) as high_risk,
          COUNT(CASE WHEN severity = 'medium' THEN 1 END) as medium_risk,
          COUNT(CASE WHEN severity = 'low' THEN 1 END) as low_risk,
          COUNT(CASE WHEN is_resolved THEN 1 END) as resolved,
          COUNT(CASE WHEN NOT is_resolved THEN 1 END) as unresolved
        FROM fraud_detections
        WHERE company_id = ${companyId}
        AND detected_at >= CURRENT_DATE - INTERVAL '30 days'
      `;

      return stats[0];
    } catch (error) {
      logger.error('Error getting fraud stats:', error);
      throw error;
    }
  }

  /**
   * Get recent fraud detections
   */
  private async getRecentDetections(companyId: string): Promise<any> {
    try {
      const detections = await prisma.fraudDetection.findMany({
        where: { companyId },
        orderBy: { detectedAt: 'desc' },
        take: 20,
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          vendor: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return detections;
    } catch (error) {
      logger.error('Error getting recent detections:', error);
      throw error;
    }
  }

  /**
   * Get fraud summary
   */
  private async getFraudSummary(companyId: string): Promise<any> {
    try {
      const summary = await prisma.$queryRaw`
        SELECT 
          fraud_type,
          severity,
          COUNT(*) as count,
          AVG(CAST(fraud_data->>'riskScore' AS INTEGER)) as avg_risk_score
        FROM fraud_detections
        WHERE company_id = ${companyId}
        AND detected_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY fraud_type, severity
        ORDER BY count DESC
      `;

      return summary;
    } catch (error) {
      logger.error('Error getting fraud summary:', error);
      throw error;
    }
  }

  /**
   * Get risk analysis
   */
  private async getRiskAnalysis(companyId: string): Promise<any> {
    try {
      const analysis = await prisma.$queryRaw`
        SELECT 
          DATE(detected_at) as detection_date,
          COUNT(*) as detections,
          COUNT(CASE WHEN severity = 'high' THEN 1 END) as high_risk,
          COUNT(CASE WHEN severity = 'medium' THEN 1 END) as medium_risk,
          COUNT(CASE WHEN severity = 'low' THEN 1 END) as low_risk
        FROM fraud_detections
        WHERE company_id = ${companyId}
        AND detected_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY DATE(detected_at)
        ORDER BY detection_date DESC
      `;

      return analysis;
    } catch (error) {
      logger.error('Error getting risk analysis:', error);
      throw error;
    }
  }

  /**
   * Resolve fraud detection
   */
  async resolveFraudDetection(companyId: string, detectionId: string, resolution: any): Promise<any> {
    try {
      const updatedDetection = await prisma.fraudDetection.update({
        where: { 
          id: detectionId,
          companyId 
        },
        data: {
          isResolved: true,
          resolvedAt: new Date(),
          resolutionNotes: resolution.notes,
          resolutionType: resolution.type
        }
      });

      return updatedDetection;
    } catch (error) {
      logger.error('Error resolving fraud detection:', error);
      throw error;
    }
  }

  /**
   * Run comprehensive fraud detection
   */
  async runComprehensiveFraudDetection(companyId: string): Promise<any> {
    try {
      const results = {
        ghostEmployees: await this.detectGhostEmployees(companyId),
        splitTransactions: await this.detectSplitTransactions(companyId),
        duplicateInvoices: await this.detectDuplicateInvoices(companyId),
        roundNumberTransactions: await this.detectRoundNumberTransactions(companyId),
        suspiciousVendors: await this.verifyVendorExistence(companyId)
      };

      return results;
    } catch (error) {
      logger.error('Error running comprehensive fraud detection:', error);
      throw error;
    }
  }
}