import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';
import logger from '../utils/logger';

export interface PCIToken {
  id: string;
  token: string;
  maskedValue: string;
  tokenType: 'card' | 'bank_account' | 'ach';
  expiryMonth?: number;
  expiryYear?: number;
  brand?: string;
  lastFour: string;
  isActive: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface PCIAuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  success: boolean;
  failureReason?: string;
  metadata: any;
}

export interface PCIVulnerabilityScan {
  id: string;
  scanDate: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
  vulnerabilities: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    cve?: string;
    remediation: string;
  }>;
  score: number;
  reportUrl?: string;
}

export interface PCIControl {
  id: string;
  controlId: string;
  name: string;
  description: string;
  category: 'network' | 'system' | 'application' | 'process';
  status: 'compliant' | 'non_compliant' | 'not_applicable' | 'under_review';
  evidence: string[];
  lastAssessed: Date;
  nextAssessment: Date;
  assessor: string;
  notes?: string;
}

class PCIComplianceService {
  private prisma: PrismaClient;
  private tokenizationKey: string;

  constructor() {
    this.prisma = new PrismaClient();
    this.tokenizationKey = process.env.PCI_TOKENIZATION_KEY || 'default-key-change-in-production';
    logger.info('[PCIComplianceService] Initialized');
  }

  /**
   * Tokenizes sensitive payment data
   */
  public async tokenizePaymentData(
    cardNumber: string,
    expiryMonth?: number,
    expiryYear?: number,
    brand?: string
  ): Promise<PCIToken> {
    try {
      // Generate secure token
      const token = this.generateSecureToken();
      const maskedValue = this.maskCardNumber(cardNumber);
      const lastFour = cardNumber.slice(-4);

      // Store token (in production, this would be in a secure, encrypted database)
      const pciToken = await this.prisma.pciToken.create({
        data: {
          token,
          maskedValue,
          tokenType: 'card',
          expiryMonth,
          expiryYear,
          brand,
          lastFour,
          isActive: true,
          expiresAt: expiryYear ? new Date(expiryYear, expiryMonth! - 1) : undefined
        }
      });

      // Log tokenization event
      await this.logPCIAuditEvent(
        'tokenize',
        'payment_data',
        pciToken.id,
        undefined,
        { tokenType: 'card', brand, lastFour }
      );

      logger.info(`[PCIComplianceService] Tokenized payment data with token ${token}`);
      return pciToken as PCIToken;
    } catch (error: any) {
      logger.error('[PCIComplianceService] Error tokenizing payment data:', error);
      throw new Error(`Failed to tokenize payment data: ${error.message}`);
    }
  }

  /**
   * Detokenizes payment data (only for authorized operations)
   */
  public async detokenizePaymentData(
    token: string,
    userId: string,
    operation: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Verify user has permission to detokenize
      const hasPermission = await this.verifyDetokenizationPermission(userId, operation);
      if (!hasPermission) {
        await this.logPCIAuditEvent(
          'detokenize_denied',
          'payment_data',
          token,
          userId,
          { reason: 'insufficient_permissions' }
        );
        return { success: false, error: 'Insufficient permissions' };
      }

      const pciToken = await this.prisma.pciToken.findFirst({
        where: { token, isActive: true }
      });

      if (!pciToken) {
        await this.logPCIAuditEvent(
          'detokenize_failed',
          'payment_data',
          token,
          userId,
          { reason: 'token_not_found' }
        );
        return { success: false, error: 'Token not found' };
      }

      // In production, this would retrieve the actual sensitive data from secure storage
      // For this implementation, we'll return the masked value
      const detokenizedData = {
        maskedValue: pciToken.maskedValue,
        lastFour: pciToken.lastFour,
        brand: pciToken.brand,
        expiryMonth: pciToken.expiryMonth,
        expiryYear: pciToken.expiryYear
      };

      await this.logPCIAuditEvent(
        'detokenize_success',
        'payment_data',
        token,
        userId,
        { operation, lastFour: pciToken.lastFour }
      );

      logger.info(`[PCIComplianceService] Detokenized payment data for user ${userId}`);
      return { success: true, data: detokenizedData };
    } catch (error: any) {
      logger.error('[PCIComplianceService] Error detokenizing payment data:', error);
      return { success: false, error: 'Detokenization failed' };
    }
  }

  /**
   * Logs PCI audit events
   */
  public async logPCIAuditEvent(
    action: string,
    resource: string,
    resourceId: string,
    userId?: string,
    metadata: any = {},
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      await this.prisma.pciAuditLog.create({
        data: {
          action,
          resource,
          resourceId,
          userId,
          ipAddress,
          userAgent,
          timestamp: new Date(),
          success: true,
          metadata
        }
      });

      logger.debug(`[PCIComplianceService] Logged PCI audit event: ${action} on ${resource}`);
    } catch (error: any) {
      logger.error('[PCIComplianceService] Error logging PCI audit event:', error);
    }
  }

  /**
   * Logs PCI audit failure
   */
  public async logPCIAuditFailure(
    action: string,
    resource: string,
    resourceId: string,
    failureReason: string,
    userId?: string,
    metadata: any = {},
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      await this.prisma.pciAuditLog.create({
        data: {
          action,
          resource,
          resourceId,
          userId,
          ipAddress,
          userAgent,
          timestamp: new Date(),
          success: false,
          failureReason,
          metadata
        }
      });

      logger.warn(`[PCIComplianceService] Logged PCI audit failure: ${action} on ${resource} - ${failureReason}`);
    } catch (error: any) {
      logger.error('[PCIComplianceService] Error logging PCI audit failure:', error);
    }
  }

  /**
   * Runs vulnerability scan
   */
  public async runVulnerabilityScan(): Promise<PCIVulnerabilityScan> {
    try {
      const scan = await this.prisma.pciVulnerabilityScan.create({
        data: {
          scanDate: new Date(),
          status: 'running',
          vulnerabilities: [],
          score: 0
        }
      });

      // Start background scan process
      this.processVulnerabilityScan(scan.id);

      logger.info(`[PCIComplianceService] Started vulnerability scan ${scan.id}`);
      return scan as PCIVulnerabilityScan;
    } catch (error: any) {
      logger.error('[PCIComplianceService] Error starting vulnerability scan:', error);
      throw new Error(`Failed to start vulnerability scan: ${error.message}`);
    }
  }

  /**
   * Processes vulnerability scan in background
   */
  private async processVulnerabilityScan(scanId: string): Promise<void> {
    try {
      // Simulate vulnerability scanning (in production, this would use actual security tools)
      const vulnerabilities = [
        {
          severity: 'medium' as const,
          title: 'Outdated SSL/TLS Configuration',
          description: 'SSL/TLS configuration may be using outdated protocols',
          remediation: 'Update SSL/TLS configuration to use TLS 1.2 or higher'
        },
        {
          severity: 'low' as const,
          title: 'Missing Security Headers',
          description: 'Some security headers are not configured',
          remediation: 'Configure security headers (HSTS, CSP, etc.)'
        }
      ];

      const score = this.calculateSecurityScore(vulnerabilities);

      await this.prisma.pciVulnerabilityScan.update({
        where: { id: scanId },
        data: {
          status: 'completed',
          vulnerabilities,
          score,
          reportUrl: `/api/pci/security-scans/${scanId}/report`
        }
      });

      logger.info(`[PCIComplianceService] Completed vulnerability scan ${scanId} with score ${score}`);
    } catch (error: any) {
      logger.error(`[PCIComplianceService] Error processing vulnerability scan ${scanId}:`, error);
      
      await this.prisma.pciVulnerabilityScan.update({
        where: { id: scanId },
        data: { status: 'failed' }
      });
    }
  }

  /**
   * Creates PCI control
   */
  public async createPCIControl(
    controlId: string,
    name: string,
    description: string,
    category: PCIControl['category']
  ): Promise<PCIControl> {
    try {
      const control = await this.prisma.pciControl.create({
        data: {
          controlId,
          name,
          description,
          category,
          status: 'under_review',
          lastAssessed: new Date(),
          nextAssessment: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
          assessor: 'system'
        }
      });

      logger.info(`[PCIComplianceService] Created PCI control ${controlId}`);
      return control as PCIControl;
    } catch (error: any) {
      logger.error('[PCIComplianceService] Error creating PCI control:', error);
      throw new Error(`Failed to create PCI control: ${error.message}`);
    }
  }

  /**
   * Assesses PCI control
   */
  public async assessPCIControl(
    controlId: string,
    status: PCIControl['status'],
    assessor: string,
    evidence: string[],
    notes?: string
  ): Promise<PCIControl> {
    try {
      const control = await this.prisma.pciControl.update({
        where: { controlId },
        data: {
          status,
          lastAssessed: new Date(),
          nextAssessment: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
          assessor,
          evidence,
          notes
        }
      });

      logger.info(`[PCIComplianceService] Assessed PCI control ${controlId} as ${status}`);
      return control as PCIControl;
    } catch (error: any) {
      logger.error('[PCIComplianceService] Error assessing PCI control:', error);
      throw new Error(`Failed to assess PCI control: ${error.message}`);
    }
  }

  /**
   * Gets PCI compliance status
   */
  public async getPCIComplianceStatus(): Promise<{
    overallScore: number;
    controlsByStatus: { [status: string]: number };
    recentScans: PCIVulnerabilityScan[];
    criticalIssues: number;
    lastAssessment: Date;
  }> {
    try {
      const controls = await this.prisma.pciControl.findMany();
      const recentScans = await this.prisma.pciVulnerabilityScan.findMany({
        orderBy: { scanDate: 'desc' },
        take: 5
      });

      const controlsByStatus: { [status: string]: number } = {};
      controls.forEach(control => {
        controlsByStatus[control.status] = (controlsByStatus[control.status] || 0) + 1;
      });

      const overallScore = this.calculateOverallScore(controls, recentScans);
      const criticalIssues = recentScans.reduce((sum, scan) => 
        sum + scan.vulnerabilities.filter(v => v.severity === 'critical').length, 0
      );

      const lastAssessment = controls.length > 0 
        ? new Date(Math.max(...controls.map(c => c.lastAssessed.getTime())))
        : new Date();

      return {
        overallScore,
        controlsByStatus,
        recentScans: recentScans as PCIVulnerabilityScan[],
        criticalIssues,
        lastAssessment
      };
    } catch (error: any) {
      logger.error('[PCIComplianceService] Error getting PCI compliance status:', error);
      throw new Error(`Failed to get PCI compliance status: ${error.message}`);
    }
  }

  /**
   * Generates PCI compliance report
   */
  public async generatePCIReport(): Promise<{
    reportId: string;
    generatedAt: Date;
    overallScore: number;
    controls: PCIControl[];
    vulnerabilities: any[];
    recommendations: string[];
    nextSteps: string[];
  }> {
    try {
      const reportId = crypto.randomUUID();
      const controls = await this.prisma.pciControl.findMany();
      const recentScans = await this.prisma.pciVulnerabilityScan.findMany({
        orderBy: { scanDate: 'desc' },
        take: 3
      });

      const overallScore = this.calculateOverallScore(controls, recentScans);
      const allVulnerabilities = recentScans.flatMap(scan => scan.vulnerabilities);
      const recommendations = this.generateRecommendations(controls, allVulnerabilities);
      const nextSteps = this.generateNextSteps(controls, recentScans);

      logger.info(`[PCIComplianceService] Generated PCI compliance report ${reportId}`);
      return {
        reportId,
        generatedAt: new Date(),
        overallScore,
        controls: controls as PCIControl[],
        vulnerabilities: allVulnerabilities,
        recommendations,
        nextSteps
      };
    } catch (error: any) {
      logger.error('[PCIComplianceService] Error generating PCI compliance report:', error);
      throw new Error(`Failed to generate PCI compliance report: ${error.message}`);
    }
  }

  /**
   * Generates secure token
   */
  private generateSecureToken(): string {
    const randomBytes = crypto.randomBytes(32);
    return crypto.createHash('sha256').update(randomBytes).digest('hex');
  }

  /**
   * Masks card number
   */
  private maskCardNumber(cardNumber: string): string {
    if (cardNumber.length < 8) return '****';
    return cardNumber.slice(0, 4) + '****' + cardNumber.slice(-4);
  }

  /**
   * Verifies detokenization permission
   */
  private async verifyDetokenizationPermission(userId: string, operation: string): Promise<boolean> {
    // In production, this would check user roles and permissions
    // For now, we'll allow detokenization for payment processing operations
    const allowedOperations = ['payment_processing', 'refund_processing', 'dispute_handling'];
    return allowedOperations.includes(operation);
  }

  /**
   * Calculates security score
   */
  private calculateSecurityScore(vulnerabilities: any[]): number {
    const severityWeights = { critical: 10, high: 7, medium: 4, low: 1 };
    const totalWeight = vulnerabilities.reduce((sum, vuln) => 
      sum + severityWeights[vuln.severity], 0
    );
    
    // Score out of 100, higher is better
    return Math.max(0, 100 - totalWeight);
  }

  /**
   * Calculates overall compliance score
   */
  private calculateOverallScore(controls: any[], scans: any[]): number {
    const controlScore = controls.length > 0 
      ? (controls.filter(c => c.status === 'compliant').length / controls.length) * 50
      : 0;
    
    const scanScore = scans.length > 0
      ? scans.reduce((sum, scan) => sum + scan.score, 0) / scans.length * 0.5
      : 50;

    return Math.round(controlScore + scanScore);
  }

  /**
   * Generates recommendations
   */
  private generateRecommendations(controls: any[], vulnerabilities: any[]): string[] {
    const recommendations: string[] = [];

    // Control-based recommendations
    const nonCompliantControls = controls.filter(c => c.status === 'non_compliant');
    if (nonCompliantControls.length > 0) {
      recommendations.push(`Address ${nonCompliantControls.length} non-compliant PCI controls`);
    }

    // Vulnerability-based recommendations
    const criticalVulns = vulnerabilities.filter(v => v.severity === 'critical');
    if (criticalVulns.length > 0) {
      recommendations.push(`Immediately address ${criticalVulns.length} critical vulnerabilities`);
    }

    const highVulns = vulnerabilities.filter(v => v.severity === 'high');
    if (highVulns.length > 0) {
      recommendations.push(`Prioritize remediation of ${highVulns.length} high-severity vulnerabilities`);
    }

    return recommendations;
  }

  /**
   * Generates next steps
   */
  private generateNextSteps(controls: any[], scans: any[]): string[] {
    const nextSteps: string[] = [];

    // Upcoming assessments
    const upcomingAssessments = controls.filter(c => 
      new Date(c.nextAssessment) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    );
    if (upcomingAssessments.length > 0) {
      nextSteps.push(`Schedule assessments for ${upcomingAssessments.length} controls due within 30 days`);
    }

    // Regular scans
    nextSteps.push('Schedule quarterly vulnerability scans');
    nextSteps.push('Review and update PCI controls documentation');
    nextSteps.push('Conduct annual PCI compliance assessment');

    return nextSteps;
  }
}

export default new PCIComplianceService();










