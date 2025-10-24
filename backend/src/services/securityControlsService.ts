import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';
import logger from '../utils/logger';

export interface SecurityControl {
  id: string;
  controlId: string;
  name: string;
  description: string;
  category: 'access_control' | 'data_protection' | 'network_security' | 'incident_response' | 'monitoring';
  status: 'implemented' | 'partial' | 'not_implemented' | 'not_applicable';
  priority: 'critical' | 'high' | 'medium' | 'low';
  evidence: string[];
  lastAssessed: Date;
  nextAssessment: Date;
  assessor: string;
  notes?: string;
}

export interface SecurityIncident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'contained' | 'resolved' | 'closed';
  category: 'data_breach' | 'unauthorized_access' | 'malware' | 'phishing' | 'system_compromise' | 'other';
  reportedBy: string;
  assignedTo?: string;
  discoveredAt: Date;
  containedAt?: Date;
  resolvedAt?: Date;
  impact: string;
  rootCause?: string;
  remediation: string[];
  lessonsLearned?: string;
  metadata: any;
}

export interface AccessReview {
  id: string;
  userId: string;
  reviewerId: string;
  permissions: string[];
  status: 'pending' | 'approved' | 'rejected' | 'modified';
  reviewDate: Date;
  nextReviewDate: Date;
  justification: string;
  comments?: string;
}

export interface SecurityPolicy {
  id: string;
  name: string;
  version: string;
  category: 'access_control' | 'data_protection' | 'incident_response' | 'network_security' | 'compliance';
  content: string;
  isActive: boolean;
  effectiveDate: Date;
  reviewDate: Date;
  approvedBy: string;
  metadata: any;
}

class SecurityControlsService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
    logger.info('[SecurityControlsService] Initialized');
  }

  /**
   * Creates security control
   */
  public async createSecurityControl(
    controlId: string,
    name: string,
    description: string,
    category: SecurityControl['category'],
    priority: SecurityControl['priority'] = 'medium'
  ): Promise<SecurityControl> {
    try {
      const control = await this.prisma.securityControl.create({
        data: {
          controlId,
          name,
          description,
          category,
          status: 'not_implemented',
          priority,
          evidence: [],
          lastAssessed: new Date(),
          nextAssessment: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
          assessor: 'system'
        }
      });

      logger.info(`[SecurityControlsService] Created security control ${controlId}`);
      return control as SecurityControl;
    } catch (error: any) {
      logger.error('[SecurityControlsService] Error creating security control:', error);
      throw new Error(`Failed to create security control: ${error.message}`);
    }
  }

  /**
   * Assesses security control
   */
  public async assessSecurityControl(
    controlId: string,
    status: SecurityControl['status'],
    assessor: string,
    evidence: string[],
    notes?: string
  ): Promise<SecurityControl> {
    try {
      const control = await this.prisma.securityControl.update({
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

      logger.info(`[SecurityControlsService] Assessed security control ${controlId} as ${status}`);
      return control as SecurityControl;
    } catch (error: any) {
      logger.error('[SecurityControlsService] Error assessing security control:', error);
      throw new Error(`Failed to assess security control: ${error.message}`);
    }
  }

  /**
   * Gets security controls by category
   */
  public async getSecurityControlsByCategory(
    category: SecurityControl['category']
  ): Promise<SecurityControl[]> {
    try {
      const controls = await this.prisma.securityControl.findMany({
        where: { category },
        orderBy: { priority: 'asc' }
      });

      return controls as SecurityControl[];
    } catch (error: any) {
      logger.error(`[SecurityControlsService] Error getting security controls for category ${category}:`, error);
      throw new Error(`Failed to get security controls: ${error.message}`);
    }
  }

  /**
   * Creates security incident
   */
  public async createSecurityIncident(
    title: string,
    description: string,
    severity: SecurityIncident['severity'],
    category: SecurityIncident['category'],
    reportedBy: string,
    impact: string,
    metadata: any = {}
  ): Promise<SecurityIncident> {
    try {
      const incident = await this.prisma.securityIncident.create({
        data: {
          title,
          description,
          severity,
          category,
          status: 'open',
          reportedBy,
          discoveredAt: new Date(),
          impact,
          remediation: [],
          metadata
        }
      });

      // Send notifications for high/critical incidents
      if (severity === 'high' || severity === 'critical') {
        await this.sendIncidentNotifications(incident.id, severity);
      }

      logger.warn(`[SecurityControlsService] Created security incident ${incident.id} with severity ${severity}`);
      return incident as SecurityIncident;
    } catch (error: any) {
      logger.error('[SecurityControlsService] Error creating security incident:', error);
      throw new Error(`Failed to create security incident: ${error.message}`);
    }
  }

  /**
   * Updates security incident
   */
  public async updateSecurityIncident(
    incidentId: string,
    updates: Partial<SecurityIncident>
  ): Promise<SecurityIncident> {
    try {
      const incident = await this.prisma.securityIncident.update({
        where: { id: incidentId },
        data: updates
      });

      logger.info(`[SecurityControlsService] Updated security incident ${incidentId}`);
      return incident as SecurityIncident;
    } catch (error: any) {
      logger.error(`[SecurityControlsService] Error updating security incident ${incidentId}:`, error);
      throw new Error(`Failed to update security incident: ${error.message}`);
    }
  }

  /**
   * Gets security incidents by status
   */
  public async getSecurityIncidentsByStatus(
    status: SecurityIncident['status']
  ): Promise<SecurityIncident[]> {
    try {
      const incidents = await this.prisma.securityIncident.findMany({
        where: { status },
        orderBy: { discoveredAt: 'desc' }
      });

      return incidents as SecurityIncident[];
    } catch (error: any) {
      logger.error(`[SecurityControlsService] Error getting security incidents with status ${status}:`, error);
      throw new Error(`Failed to get security incidents: ${error.message}`);
    }
  }

  /**
   * Creates access review
   */
  public async createAccessReview(
    userId: string,
    reviewerId: string,
    permissions: string[],
    justification: string
  ): Promise<AccessReview> {
    try {
      const review = await this.prisma.accessReview.create({
        data: {
          userId,
          reviewerId,
          permissions,
          status: 'pending',
          reviewDate: new Date(),
          nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
          justification
        }
      });

      logger.info(`[SecurityControlsService] Created access review for user ${userId}`);
      return review as AccessReview;
    } catch (error: any) {
      logger.error('[SecurityControlsService] Error creating access review:', error);
      throw new Error(`Failed to create access review: ${error.message}`);
    }
  }

  /**
   * Reviews access permissions
   */
  public async reviewAccessPermissions(
    reviewId: string,
    status: AccessReview['status'],
    reviewerId: string,
    comments?: string
  ): Promise<AccessReview> {
    try {
      const review = await this.prisma.accessReview.update({
        where: { id: reviewId },
        data: {
          status,
          reviewerId,
          comments,
          reviewDate: new Date()
        }
      });

      logger.info(`[SecurityControlsService] Reviewed access permissions for review ${reviewId}`);
      return review as AccessReview;
    } catch (error: any) {
      logger.error('[SecurityControlsService] Error reviewing access permissions:', error);
      throw new Error(`Failed to review access permissions: ${error.message}`);
    }
  }

  /**
   * Gets pending access reviews
   */
  public async getPendingAccessReviews(): Promise<AccessReview[]> {
    try {
      const reviews = await this.prisma.accessReview.findMany({
        where: { status: 'pending' },
        orderBy: { reviewDate: 'asc' }
      });

      return reviews as AccessReview[];
    } catch (error: any) {
      logger.error('[SecurityControlsService] Error getting pending access reviews:', error);
      throw new Error(`Failed to get pending access reviews: ${error.message}`);
    }
  }

  /**
   * Creates security policy
   */
  public async createSecurityPolicy(
    name: string,
    version: string,
    category: SecurityPolicy['category'],
    content: string,
    approvedBy: string,
    metadata: any = {}
  ): Promise<SecurityPolicy> {
    try {
      const policy = await this.prisma.securityPolicy.create({
        data: {
          name,
          version,
          category,
          content,
          isActive: true,
          effectiveDate: new Date(),
          reviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          approvedBy,
          metadata
        }
      });

      logger.info(`[SecurityControlsService] Created security policy ${policy.id}`);
      return policy as SecurityPolicy;
    } catch (error: any) {
      logger.error('[SecurityControlsService] Error creating security policy:', error);
      throw new Error(`Failed to create security policy: ${error.message}`);
    }
  }

  /**
   * Gets security policies by category
   */
  public async getSecurityPoliciesByCategory(
    category: SecurityPolicy['category']
  ): Promise<SecurityPolicy[]> {
    try {
      const policies = await this.prisma.securityPolicy.findMany({
        where: { category, isActive: true },
        orderBy: { effectiveDate: 'desc' }
      });

      return policies as SecurityPolicy[];
    } catch (error: any) {
      logger.error(`[SecurityControlsService] Error getting security policies for category ${category}:`, error);
      throw new Error(`Failed to get security policies: ${error.message}`);
    }
  }

  /**
   * Gets security dashboard data
   */
  public async getSecurityDashboard(): Promise<{
    totalControls: number;
    implementedControls: number;
    openIncidents: number;
    criticalIncidents: number;
    pendingReviews: number;
    overdueReviews: number;
    complianceScore: number;
    recentIncidents: SecurityIncident[];
    upcomingReviews: AccessReview[];
  }> {
    try {
      const [
        controls,
        incidents,
        reviews,
        recentIncidents,
        upcomingReviews
      ] = await Promise.all([
        this.prisma.securityControl.findMany(),
        this.prisma.securityIncident.findMany(),
        this.prisma.accessReview.findMany(),
        this.prisma.securityIncident.findMany({
          orderBy: { discoveredAt: 'desc' },
          take: 5
        }),
        this.prisma.accessReview.findMany({
          where: { status: 'pending' },
          orderBy: { reviewDate: 'asc' },
          take: 5
        })
      ]);

      const totalControls = controls.length;
      const implementedControls = controls.filter(c => c.status === 'implemented').length;
      const openIncidents = incidents.filter(i => i.status === 'open').length;
      const criticalIncidents = incidents.filter(i => i.severity === 'critical').length;
      const pendingReviews = reviews.filter(r => r.status === 'pending').length;
      const overdueReviews = reviews.filter(r => 
        r.status === 'pending' && new Date(r.nextReviewDate) < new Date()
      ).length;

      const complianceScore = totalControls > 0 
        ? Math.round((implementedControls / totalControls) * 100)
        : 0;

      return {
        totalControls,
        implementedControls,
        openIncidents,
        criticalIncidents,
        pendingReviews,
        overdueReviews,
        complianceScore,
        recentIncidents: recentIncidents as SecurityIncident[],
        upcomingReviews: upcomingReviews as AccessReview[]
      };
    } catch (error: any) {
      logger.error('[SecurityControlsService] Error getting security dashboard:', error);
      throw new Error(`Failed to get security dashboard: ${error.message}`);
    }
  }

  /**
   * Generates security report
   */
  public async generateSecurityReport(): Promise<{
    reportId: string;
    generatedAt: Date;
    executiveSummary: string;
    controlsSummary: any;
    incidentsSummary: any;
    recommendations: string[];
    nextSteps: string[];
  }> {
    try {
      const reportId = crypto.randomUUID();
      const controls = await this.prisma.securityControl.findMany();
      const incidents = await this.prisma.securityIncident.findMany();
      const reviews = await this.prisma.accessReview.findMany();

      const controlsSummary = {
        total: controls.length,
        implemented: controls.filter(c => c.status === 'implemented').length,
        partial: controls.filter(c => c.status === 'partial').length,
        notImplemented: controls.filter(c => c.status === 'not_implemented').length
      };

      const incidentsSummary = {
        total: incidents.length,
        open: incidents.filter(i => i.status === 'open').length,
        resolved: incidents.filter(i => i.status === 'resolved').length,
        critical: incidents.filter(i => i.severity === 'critical').length,
        high: incidents.filter(i => i.severity === 'high').length
      };

      const executiveSummary = this.generateExecutiveSummary(controlsSummary, incidentsSummary);
      const recommendations = this.generateRecommendations(controls, incidents);
      const nextSteps = this.generateNextSteps(controls, reviews);

      logger.info(`[SecurityControlsService] Generated security report ${reportId}`);
      return {
        reportId,
        generatedAt: new Date(),
        executiveSummary,
        controlsSummary,
        incidentsSummary,
        recommendations,
        nextSteps
      };
    } catch (error: any) {
      logger.error('[SecurityControlsService] Error generating security report:', error);
      throw new Error(`Failed to generate security report: ${error.message}`);
    }
  }

  /**
   * Sends incident notifications
   */
  private async sendIncidentNotifications(incidentId: string, severity: string): Promise<void> {
    try {
      // In production, this would send actual notifications
      logger.warn(`[SecurityControlsService] Sending notifications for ${severity} incident ${incidentId}`);
      
      // This would integrate with notification services
      // await notificationService.sendSecurityAlert(incidentId, severity);
    } catch (error: any) {
      logger.error('[SecurityControlsService] Error sending incident notifications:', error);
    }
  }

  /**
   * Generates executive summary
   */
  private generateExecutiveSummary(controlsSummary: any, incidentsSummary: any): string {
    const compliancePercentage = controlsSummary.total > 0 
      ? Math.round((controlsSummary.implemented / controlsSummary.total) * 100)
      : 0;

    return `Security posture shows ${compliancePercentage}% control implementation with ${incidentsSummary.open} open incidents. ` +
           `Critical incidents: ${incidentsSummary.critical}, High severity: ${incidentsSummary.high}. ` +
           `Recommend immediate attention to ${controlsSummary.notImplemented} unimplemented controls.`;
  }

  /**
   * Generates recommendations
   */
  private generateRecommendations(controls: any[], incidents: any[]): string[] {
    const recommendations: string[] = [];

    const notImplementedControls = controls.filter(c => c.status === 'not_implemented');
    if (notImplementedControls.length > 0) {
      recommendations.push(`Implement ${notImplementedControls.length} unimplemented security controls`);
    }

    const criticalIncidents = incidents.filter(i => i.severity === 'critical' && i.status === 'open');
    if (criticalIncidents.length > 0) {
      recommendations.push(`Immediately address ${criticalIncidents.length} critical security incidents`);
    }

    const highIncidents = incidents.filter(i => i.severity === 'high' && i.status === 'open');
    if (highIncidents.length > 0) {
      recommendations.push(`Prioritize resolution of ${highIncidents.length} high-severity incidents`);
    }

    return recommendations;
  }

  /**
   * Generates next steps
   */
  private generateNextSteps(controls: any[], reviews: any[]): string[] {
    const nextSteps: string[] = [];

    const overdueReviews = reviews.filter(r => 
      r.status === 'pending' && new Date(r.nextReviewDate) < new Date()
    );
    if (overdueReviews.length > 0) {
      nextSteps.push(`Complete ${overdueReviews.length} overdue access reviews`);
    }

    const upcomingReviews = reviews.filter(r => 
      r.status === 'pending' && new Date(r.nextReviewDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    );
    if (upcomingReviews.length > 0) {
      nextSteps.push(`Schedule ${upcomingReviews.length} access reviews due within 7 days`);
    }

    nextSteps.push('Conduct quarterly security control assessments');
    nextSteps.push('Review and update security policies');
    nextSteps.push('Perform annual security risk assessment');

    return nextSteps;
  }
}

export default new SecurityControlsService();







