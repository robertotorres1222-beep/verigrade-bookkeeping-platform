import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';

const prisma = new PrismaClient();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface RegulatoryUpdate {
  id: string;
  userId: string;
  regulationType: 'tax' | 'compliance' | 'privacy' | 'financial' | 'industry_specific';
  title: string;
  description: string;
  effectiveDate: Date;
  deadline: Date;
  impact: 'low' | 'medium' | 'high' | 'critical';
  jurisdiction: string;
  source: string;
  url: string;
  actionRequired: boolean;
  actionItems: string[];
  complianceSteps: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
}

export interface ComplianceCalendar {
  id: string;
  userId: string;
  eventType: 'filing' | 'payment' | 'review' | 'audit' | 'renewal';
  title: string;
  description: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'upcoming' | 'due_soon' | 'overdue' | 'completed';
  regulatoryBody: string;
  requirements: string[];
  reminders: Date[];
  createdAt: Date;
}

export interface RegulatoryImpact {
  regulationId: string;
  businessImpact: 'low' | 'medium' | 'high' | 'critical';
  implementationCost: number;
  complianceCost: number;
  riskMitigation: string[];
  opportunities: string[];
  timeline: string;
  resources: string[];
}

export class RegulatoryMonitorService {
  /**
   * Get regulatory updates for user
   */
  async getRegulatoryUpdates(userId: string): Promise<RegulatoryUpdate[]> {
    try {
      // Get user business data
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          businessType: true,
          industry: true,
          location: true,
          employeeCount: true
        }
      });
      
      // Get relevant regulatory updates
      const updates = await this.fetchRelevantUpdates(user?.industry || 'Services', user?.location || 'US');
      
      // Filter updates based on business characteristics
      const relevantUpdates = this.filterUpdatesForBusiness(updates, user);
      
      return relevantUpdates;

    } catch (error) {
      console.error('Error getting regulatory updates:', error);
      return [];
    }
  }

  /**
   * Fetch relevant regulatory updates
   */
  private async fetchRelevantUpdates(industry: string, location: string): Promise<RegulatoryUpdate[]> {
    // Mock regulatory updates - in real implementation, this would fetch from regulatory APIs
    const updates: RegulatoryUpdate[] = [
      {
        id: `update_tax_2024_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: '',
        regulationType: 'tax',
        title: 'New Tax Filing Requirements for 2024',
        description: 'Updated tax filing requirements for small businesses',
        effectiveDate: new Date('2024-01-01'),
        deadline: new Date('2024-04-15'),
        impact: 'medium',
        jurisdiction: location,
        source: 'IRS',
        url: 'https://irs.gov/new-requirements-2024',
        actionRequired: true,
        actionItems: [
          'Update tax filing procedures',
          'Train staff on new requirements',
          'Update software systems'
        ],
        complianceSteps: [
          'Review new tax forms',
          'Update accounting procedures',
          'File updated tax returns'
        ],
        riskLevel: 'medium',
        createdAt: new Date()
      },
      {
        id: `update_privacy_2024_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: '',
        regulationType: 'privacy',
        title: 'Enhanced Data Privacy Requirements',
        description: 'New data privacy requirements for businesses',
        effectiveDate: new Date('2024-03-01'),
        deadline: new Date('2024-06-01'),
        impact: 'high',
        jurisdiction: location,
        source: 'Privacy Commission',
        url: 'https://privacy.gov/enhanced-requirements',
        actionRequired: true,
        actionItems: [
          'Update privacy policies',
          'Implement data protection measures',
          'Conduct privacy impact assessment'
        ],
        complianceSteps: [
          'Review data processing activities',
          'Update privacy notices',
          'Implement technical safeguards'
        ],
        riskLevel: 'high',
        createdAt: new Date()
      },
      {
        id: `update_financial_2024_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: '',
        regulationType: 'financial',
        title: 'Updated Financial Reporting Standards',
        description: 'New financial reporting requirements for businesses',
        effectiveDate: new Date('2024-07-01'),
        deadline: new Date('2024-12-31'),
        impact: 'medium',
        jurisdiction: location,
        source: 'Financial Standards Board',
        url: 'https://fsb.gov/updated-standards',
        actionRequired: true,
        actionItems: [
          'Update financial reporting procedures',
          'Train accounting staff',
          'Update reporting systems'
        ],
        complianceSteps: [
          'Review new reporting standards',
          'Update accounting procedures',
          'Implement new reporting formats'
        ],
        riskLevel: 'medium',
        createdAt: new Date()
      }
    ];
    
    return updates;
  }

  /**
   * Filter updates for business
   */
  private filterUpdatesForBusiness(updates: RegulatoryUpdate[], user: any): RegulatoryUpdate[] {
    return updates.filter(update => {
      // Filter based on business type
      if (update.regulationType === 'tax' && user?.businessType === 'Non-Profit') {
        return false; // Non-profits may have different tax requirements
      }
      
      // Filter based on industry
      if (update.regulationType === 'industry_specific') {
        return this.isRelevantToIndustry(update, user?.industry);
      }
      
      // Filter based on employee count
      if (update.regulationType === 'compliance' && user?.employeeCount < 50) {
        return update.impact !== 'low'; // Small businesses may not need low-impact updates
      }
      
      return true;
    });
  }

  /**
   * Check if update is relevant to industry
   */
  private isRelevantToIndustry(update: RegulatoryUpdate, industry: string): boolean {
    const industryRelevance: { [key: string]: string[] } = {
      'Healthcare': ['privacy', 'compliance'],
      'Financial': ['financial', 'compliance'],
      'Technology': ['privacy', 'compliance'],
      'Manufacturing': ['compliance', 'industry_specific']
    };
    
    const relevantTypes = industryRelevance[industry] || [];
    return relevantTypes.includes(update.regulationType);
  }

  /**
   * Get compliance calendar
   */
  async getComplianceCalendar(userId: string): Promise<ComplianceCalendar[]> {
    try {
      const calendar: ComplianceCalendar[] = [];
      
      // Tax filing deadlines
      const taxDeadlines = this.getTaxDeadlines();
      calendar.push(...taxDeadlines);
      
      // Regulatory review deadlines
      const regulatoryDeadlines = this.getRegulatoryDeadlines();
      calendar.push(...regulatoryDeadlines);
      
      // Audit deadlines
      const auditDeadlines = this.getAuditDeadlines();
      calendar.push(...auditDeadlines);
      
      // License renewal deadlines
      const licenseDeadlines = this.getLicenseDeadlines();
      calendar.push(...licenseDeadlines);
      
      // Sort by due date
      return calendar.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

    } catch (error) {
      console.error('Error getting compliance calendar:', error);
      return [];
    }
  }

  /**
   * Get tax deadlines
   */
  private getTaxDeadlines(): ComplianceCalendar[] {
    const currentYear = new Date().getFullYear();
    
    return [
      {
        id: `tax_quarterly_${currentYear}_q1`,
        userId: '',
        eventType: 'filing',
        title: 'Q1 Tax Filing',
        description: 'Quarterly tax filing for Q1',
        dueDate: new Date(currentYear, 3, 15), // April 15
        priority: 'high',
        status: 'upcoming',
        regulatoryBody: 'IRS',
        requirements: ['Form 941', 'State tax forms'],
        reminders: [
          new Date(currentYear, 3, 1), // April 1
          new Date(currentYear, 3, 10) // April 10
        ],
        createdAt: new Date()
      },
      {
        id: `tax_quarterly_${currentYear}_q2`,
        userId: '',
        eventType: 'filing',
        title: 'Q2 Tax Filing',
        description: 'Quarterly tax filing for Q2',
        dueDate: new Date(currentYear, 6, 15), // July 15
        priority: 'high',
        status: 'upcoming',
        regulatoryBody: 'IRS',
        requirements: ['Form 941', 'State tax forms'],
        reminders: [
          new Date(currentYear, 6, 1), // July 1
          new Date(currentYear, 6, 10) // July 10
        ],
        createdAt: new Date()
      },
      {
        id: `tax_annual_${currentYear}`,
        userId: '',
        eventType: 'filing',
        title: 'Annual Tax Filing',
        description: 'Annual tax return filing',
        dueDate: new Date(currentYear + 1, 2, 15), // March 15 next year
        priority: 'critical',
        status: 'upcoming',
        regulatoryBody: 'IRS',
        requirements: ['Form 1120', 'State tax returns'],
        reminders: [
          new Date(currentYear + 1, 1, 1), // February 1
          new Date(currentYear + 1, 2, 1) // March 1
        ],
        createdAt: new Date()
      }
    ];
  }

  /**
   * Get regulatory deadlines
   */
  private getRegulatoryDeadlines(): ComplianceCalendar[] {
    const currentYear = new Date().getFullYear();
    
    return [
      {
        id: `regulatory_review_${currentYear}`,
        userId: '',
        eventType: 'review',
        title: 'Annual Regulatory Review',
        description: 'Annual review of regulatory compliance',
        dueDate: new Date(currentYear, 11, 31), // December 31
        priority: 'medium',
        status: 'upcoming',
        regulatoryBody: 'Various',
        requirements: ['Compliance checklist', 'Documentation review'],
        reminders: [
          new Date(currentYear, 10, 1), // November 1
          new Date(currentYear, 11, 15) // December 15
        ],
        createdAt: new Date()
      }
    ];
  }

  /**
   * Get audit deadlines
   */
  private getAuditDeadlines(): ComplianceCalendar[] {
    const currentYear = new Date().getFullYear();
    
    return [
      {
        id: `audit_preparation_${currentYear}`,
        userId: '',
        eventType: 'audit',
        title: 'Audit Preparation',
        description: 'Prepare for annual audit',
        dueDate: new Date(currentYear, 11, 1), // December 1
        priority: 'high',
        status: 'upcoming',
        regulatoryBody: 'Auditor',
        requirements: ['Financial statements', 'Supporting documentation'],
        reminders: [
          new Date(currentYear, 9, 1), // October 1
          new Date(currentYear, 10, 15) // October 15
        ],
        createdAt: new Date()
      }
    ];
  }

  /**
   * Get license deadlines
   */
  private getLicenseDeadlines(): ComplianceCalendar[] {
    const currentYear = new Date().getFullYear();
    
    return [
      {
        id: `license_renewal_${currentYear}`,
        userId: '',
        eventType: 'renewal',
        title: 'Business License Renewal',
        description: 'Annual business license renewal',
        dueDate: new Date(currentYear, 11, 31), // December 31
        priority: 'medium',
        status: 'upcoming',
        regulatoryBody: 'Local Government',
        requirements: ['License application', 'Fee payment'],
        reminders: [
          new Date(currentYear, 10, 1), // November 1
          new Date(currentYear, 11, 15) // December 15
        ],
        createdAt: new Date()
      }
    ];
  }

  /**
   * Analyze regulatory impact
   */
  async analyzeRegulatoryImpact(userId: string, regulationId: string): Promise<RegulatoryImpact> {
    try {
      // Mock impact analysis - in real implementation, this would analyze actual business data
      const impact: RegulatoryImpact = {
        regulationId,
        businessImpact: 'medium',
        implementationCost: 10000,
        complianceCost: 5000,
        riskMitigation: [
          'Update policies and procedures',
          'Train staff on new requirements',
          'Implement monitoring systems'
        ],
        opportunities: [
          'Improve operational efficiency',
          'Enhance compliance posture',
          'Reduce regulatory risk'
        ],
        timeline: '6 months',
        resources: [
          'Legal team',
          'Compliance team',
          'IT team',
          'External consultant'
        ]
      };
      
      return impact;

    } catch (error) {
      console.error('Error analyzing regulatory impact:', error);
      return {
        regulationId,
        businessImpact: 'low',
        implementationCost: 0,
        complianceCost: 0,
        riskMitigation: [],
        opportunities: [],
        timeline: '0 months',
        resources: []
      };
    }
  }

  /**
   * Get regulatory monitoring dashboard
   */
  async getRegulatoryMonitoringDashboard(userId: string): Promise<{
    updates: RegulatoryUpdate[];
    calendar: ComplianceCalendar[];
    impactAnalysis: RegulatoryImpact[];
    insights: {
      totalUpdates: number;
      criticalUpdates: number;
      upcomingDeadlines: number;
      complianceScore: number;
    };
  }> {
    try {
      const updates = await this.getRegulatoryUpdates(userId);
      const calendar = await this.getComplianceCalendar(userId);
      
      const impactAnalysis: RegulatoryImpact[] = [];
      for (const update of updates) {
        const impact = await this.analyzeRegulatoryImpact(userId, update.id);
        impactAnalysis.push(impact);
      }
      
      const criticalUpdates = updates.filter(u => u.impact === 'critical').length;
      const upcomingDeadlines = calendar.filter(c => c.status === 'upcoming').length;
      const complianceScore = this.calculateComplianceScore(updates, calendar);
      
      const insights = {
        totalUpdates: updates.length,
        criticalUpdates,
        upcomingDeadlines,
        complianceScore
      };
      
      return {
        updates,
        calendar,
        impactAnalysis,
        insights
      };

    } catch (error) {
      console.error('Error getting regulatory monitoring dashboard:', error);
      return {
        updates: [],
        calendar: [],
        impactAnalysis: [],
        insights: {
          totalUpdates: 0,
          criticalUpdates: 0,
          upcomingDeadlines: 0,
          complianceScore: 0
        }
      };
    }
  }

  /**
   * Calculate compliance score
   */
  private calculateComplianceScore(updates: RegulatoryUpdate[], calendar: ComplianceCalendar[]): number {
    const totalUpdates = updates.length;
    const criticalUpdates = updates.filter(u => u.impact === 'critical').length;
    const highUpdates = updates.filter(u => u.impact === 'high').length;
    const mediumUpdates = updates.filter(u => u.impact === 'medium').length;
    const lowUpdates = updates.filter(u => u.impact === 'low').length;
    
    const overdueItems = calendar.filter(c => c.status === 'overdue').length;
    const dueSoonItems = calendar.filter(c => c.status === 'due_soon').length;
    
    const score = 100 - (criticalUpdates * 20 + highUpdates * 10 + mediumUpdates * 5 + lowUpdates * 2 + overdueItems * 15 + dueSoonItems * 5);
    return Math.max(0, score);
  }
}

export default RegulatoryMonitorService;










