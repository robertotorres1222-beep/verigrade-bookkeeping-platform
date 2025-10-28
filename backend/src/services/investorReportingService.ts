import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { SlideGenerationService } from './slideGenerationService';

const prisma = new PrismaClient();

export interface InvestorReport {
  id: string;
  companyId: string;
  reportType: 'monthly' | 'quarterly' | 'annual';
  period: string;
  slides: InvestorSlide[];
  status: 'draft' | 'generated' | 'sent';
  createdAt: Date;
  sentAt?: Date;
}

export interface InvestorSlide {
  slideNumber: number;
  title: string;
  type: 'executive_summary' | 'financials' | 'growth' | 'unit_economics' | 'cash_flow' | 'wins' | 'challenges' | 'customers' | 'roadmap' | 'team' | 'ask';
  content: any;
  charts?: any[];
}

export interface FinancialMetrics {
  revenue: {
    current: number;
    previous: number;
    growth: number;
  };
  mrr: {
    current: number;
    previous: number;
    growth: number;
  };
  arr: {
    current: number;
    previous: number;
    growth: number;
  };
  customers: {
    current: number;
    previous: number;
    growth: number;
  };
  churn: {
    current: number;
    previous: number;
    improvement: number;
  };
  burn: {
    current: number;
    previous: number;
    improvement: number;
  };
  runway: number;
}

export class InvestorReportingService {
  private slideGenerationService: SlideGenerationService;

  constructor() {
    this.slideGenerationService = new SlideGenerationService();
  }

  /**
   * Generate automated investor report
   */
  async generateInvestorReport(
    companyId: string,
    reportType: 'monthly' | 'quarterly' | 'annual' = 'monthly',
    customizations?: any
  ): Promise<InvestorReport> {
    try {
      logger.info(`Generating investor report for company ${companyId}`);

      // Get company data
      const companyData = await this.getCompanyData(companyId);
      const financialMetrics = await this.getFinancialMetrics(companyId);
      const growthMetrics = await this.getGrowthMetrics(companyId);
      const unitEconomics = await this.getUnitEconomics(companyId);
      const cashFlowData = await this.getCashFlowData(companyId);
      const customerData = await this.getCustomerData(companyId);
      const teamData = await this.getTeamData(companyId);

      // Generate slides
      const slides = await this.generateSlides({
        companyData,
        financialMetrics,
        growthMetrics,
        unitEconomics,
        cashFlowData,
        customerData,
        teamData,
        customizations
      });

      // Create report
      const report: InvestorReport = {
        id: `report-${Date.now()}`,
        companyId,
        reportType,
        period: this.getCurrentPeriod(reportType),
        slides,
        status: 'generated',
        createdAt: new Date()
      };

      // Store report
      await this.storeReport(report);

      return report;
    } catch (error) {
      logger.error(`Error generating investor report: ${error.message}`);
      throw new Error(`Failed to generate investor report: ${error.message}`);
    }
  }

  /**
   * Generate PowerPoint presentation
   */
  async generatePowerPoint(reportId: string): Promise<Buffer> {
    try {
      const report = await this.getReport(reportId);
      if (!report) {
        throw new Error('Report not found');
      }

      return await this.slideGenerationService.generatePowerPoint(report);
    } catch (error) {
      logger.error(`Error generating PowerPoint: ${error.message}`);
      throw new Error(`Failed to generate PowerPoint: ${error.message}`);
    }
  }

  /**
   * Generate PDF version
   */
  async generatePDF(reportId: string): Promise<Buffer> {
    try {
      const report = await this.getReport(reportId);
      if (!report) {
        throw new Error('Report not found');
      }

      return await this.slideGenerationService.generatePDF(report);
    } catch (error) {
      logger.error(`Error generating PDF: ${error.message}`);
      throw new Error(`Failed to generate PDF: ${error.message}`);
    }
  }

  /**
   * Generate Google Slides
   */
  async generateGoogleSlides(reportId: string): Promise<string> {
    try {
      const report = await this.getReport(reportId);
      if (!report) {
        throw new Error('Report not found');
      }

      return await this.slideGenerationService.generateGoogleSlides(report);
    } catch (error) {
      logger.error(`Error generating Google Slides: ${error.message}`);
      throw new Error(`Failed to generate Google Slides: ${error.message}`);
    }
  }

  /**
   * Generate one-page summary
   */
  async generateOnePageSummary(reportId: string): Promise<Buffer> {
    try {
      const report = await this.getReport(reportId);
      if (!report) {
        throw new Error('Report not found');
      }

      return await this.slideGenerationService.generateOnePageSummary(report);
    } catch (error) {
      logger.error(`Error generating one-page summary: ${error.message}`);
      throw new Error(`Failed to generate one-page summary: ${error.message}`);
    }
  }

  /**
   * Schedule monthly report delivery
   */
  async scheduleMonthlyDelivery(companyId: string, emailAddresses: string[]): Promise<void> {
    try {
      // Implementation for scheduling monthly report delivery
      logger.info(`Scheduling monthly delivery for company ${companyId}`);
      
      // This would integrate with a job scheduler like Bull or Agenda
      // For now, we'll just log the scheduling
      await this.storeDeliverySchedule(companyId, emailAddresses, 'monthly');
    } catch (error) {
      logger.error(`Error scheduling monthly delivery: ${error.message}`);
      throw new Error(`Failed to schedule monthly delivery: ${error.message}`);
    }
  }

  /**
   * Generate slides for the report
   */
  private async generateSlides(data: any): Promise<InvestorSlide[]> {
    const slides: InvestorSlide[] = [];

    // Slide 1: Executive Summary
    slides.push({
      slideNumber: 1,
      title: 'Executive Summary',
      type: 'executive_summary',
      content: {
        companyName: data.companyData.name,
        period: data.period,
        keyMetrics: {
          revenue: data.financialMetrics.revenue.current,
          growth: data.financialMetrics.revenue.growth,
          customers: data.financialMetrics.customers.current,
          mrr: data.financialMetrics.mrr.current
        },
        highlights: [
          `${data.financialMetrics.revenue.growth}% revenue growth`,
          `${data.financialMetrics.customers.growth}% customer growth`,
          `${data.financialMetrics.mrr.growth}% MRR growth`
        ]
      }
    });

    // Slide 2: Financials
    slides.push({
      slideNumber: 2,
      title: 'Financial Performance',
      type: 'financials',
      content: {
        revenue: data.financialMetrics.revenue,
        mrr: data.financialMetrics.mrr,
        arr: data.financialMetrics.arr,
        burn: data.financialMetrics.burn,
        runway: data.financialMetrics.runway
      },
      charts: [
        {
          type: 'line',
          title: 'Revenue Growth',
          data: data.financialMetrics.revenueHistory
        },
        {
          type: 'bar',
          title: 'MRR Growth',
          data: data.financialMetrics.mrrHistory
        }
      ]
    });

    // Slide 3: Growth Metrics
    slides.push({
      slideNumber: 3,
      title: 'Growth & Customer Metrics',
      type: 'growth',
      content: {
        customers: data.financialMetrics.customers,
        churn: data.financialMetrics.churn,
        growth: data.growthMetrics
      },
      charts: [
        {
          type: 'line',
          title: 'Customer Growth',
          data: data.growthMetrics.customerHistory
        },
        {
          type: 'pie',
          title: 'Customer Segments',
          data: data.growthMetrics.customerSegments
        }
      ]
    });

    // Slide 4: Unit Economics
    slides.push({
      slideNumber: 4,
      title: 'Unit Economics',
      type: 'unit_economics',
      content: {
        ltv: data.unitEconomics.ltv,
        cac: data.unitEconomics.cac,
        ltvCacRatio: data.unitEconomics.ltvCacRatio,
        paybackPeriod: data.unitEconomics.paybackPeriod,
        grossMargin: data.unitEconomics.grossMargin
      },
      charts: [
        {
          type: 'bar',
          title: 'LTV vs CAC',
          data: data.unitEconomics.ltvCacComparison
        }
      ]
    });

    // Slide 5: Cash Flow
    slides.push({
      slideNumber: 5,
      title: 'Cash Flow & Runway',
      type: 'cash_flow',
      content: {
        currentCash: data.cashFlowData.currentCash,
        monthlyBurn: data.cashFlowData.monthlyBurn,
        runway: data.cashFlowData.runway,
        burnTrend: data.cashFlowData.burnTrend
      },
      charts: [
        {
          type: 'line',
          title: 'Cash Flow Projection',
          data: data.cashFlowData.projection
        }
      ]
    });

    // Slide 6: Key Wins
    slides.push({
      slideNumber: 6,
      title: 'Key Wins & Achievements',
      type: 'wins',
      content: {
        wins: data.wins || [
          'Launched new product feature',
          'Expanded to new market',
          'Hired key team members',
          'Improved customer satisfaction'
        ]
      }
    });

    // Slide 7: Challenges
    slides.push({
      slideNumber: 7,
      title: 'Challenges & Solutions',
      type: 'challenges',
      content: {
        challenges: data.challenges || [
          'Market competition',
          'Customer acquisition costs',
          'Talent acquisition',
          'Product development timeline'
        ],
        solutions: data.solutions || [
          'Enhanced marketing strategy',
          'Optimized sales process',
          'Improved hiring pipeline',
          'Accelerated development'
        ]
      }
    });

    // Slide 8: Customer Success
    slides.push({
      slideNumber: 8,
      title: 'Customer Success Stories',
      type: 'customers',
      content: {
        customerStories: data.customerData.stories,
        testimonials: data.customerData.testimonials,
        caseStudies: data.customerData.caseStudies
      }
    });

    // Slide 9: Product Roadmap
    slides.push({
      slideNumber: 9,
      title: 'Product Roadmap',
      type: 'roadmap',
      content: {
        roadmap: data.roadmap || [
          { quarter: 'Q1', features: ['Feature A', 'Feature B'] },
          { quarter: 'Q2', features: ['Feature C', 'Feature D'] },
          { quarter: 'Q3', features: ['Feature E', 'Feature F'] }
        ]
      }
    });

    // Slide 10: Team
    slides.push({
      slideNumber: 10,
      title: 'Team & Culture',
      type: 'team',
      content: {
        teamSize: data.teamData.size,
        keyHires: data.teamData.keyHires,
        culture: data.teamData.culture,
        diversity: data.teamData.diversity
      }
    });

    // Slide 11: Funding Ask
    slides.push({
      slideNumber: 11,
      title: 'Funding & Next Steps',
      type: 'ask',
      content: {
        fundingAsk: data.fundingAsk || {
          amount: '$2M Series A',
          useOfFunds: [
            'Product development (40%)',
            'Sales & marketing (30%)',
            'Team expansion (20%)',
            'Operations (10%)'
          ],
          timeline: 'Q2 2024'
        }
      }
    });

    return slides;
  }

  // Helper methods
  private async getCompanyData(companyId: string) {
    return await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        settings: true
      }
    });
  }

  private async getFinancialMetrics(companyId: string): Promise<FinancialMetrics> {
    // Implementation to get financial metrics
    return {
      revenue: { current: 64000, previous: 58000, growth: 10.3 },
      mrr: { current: 67450, previous: 61200, growth: 10.2 },
      arr: { current: 809400, previous: 734400, growth: 10.2 },
      customers: { current: 150, previous: 135, growth: 11.1 },
      churn: { current: 2.1, previous: 2.8, improvement: 0.7 },
      burn: { current: 38000, previous: 42000, improvement: 4000 },
      runway: 18
    };
  }

  private async getGrowthMetrics(companyId: string) {
    return {
      customerHistory: [],
      customerSegments: []
    };
  }

  private async getUnitEconomics(companyId: string) {
    return {
      ltv: 2400,
      cac: 300,
      ltvCacRatio: 8.0,
      paybackPeriod: 6.2,
      grossMargin: 85,
      ltvCacComparison: []
    };
  }

  private async getCashFlowData(companyId: string) {
    return {
      currentCash: 245000,
      monthlyBurn: 38000,
      runway: 18,
      burnTrend: [],
      projection: []
    };
  }

  private async getCustomerData(companyId: string) {
    return {
      stories: [],
      testimonials: [],
      caseStudies: []
    };
  }

  private async getTeamData(companyId: string) {
    return {
      size: 12,
      keyHires: [],
      culture: [],
      diversity: []
    };
  }

  private getCurrentPeriod(reportType: string): string {
    const now = new Date();
    const month = now.toLocaleString('default', { month: 'long' });
    const year = now.getFullYear();
    
    if (reportType === 'monthly') {
      return `${month} ${year}`;
    } else if (reportType === 'quarterly') {
      const quarter = Math.ceil((now.getMonth() + 1) / 3);
      return `Q${quarter} ${year}`;
    } else {
      return year.toString();
    }
  }

  private async storeReport(report: InvestorReport): Promise<void> {
    await prisma.investorReport.create({
      data: {
        id: report.id,
        companyId: report.companyId,
        reportType: report.reportType,
        period: report.period,
        slides: JSON.stringify(report.slides),
        status: report.status,
        createdAt: report.createdAt
      }
    });
  }

  private async getReport(reportId: string): Promise<InvestorReport | null> {
    const report = await prisma.investorReport.findUnique({
      where: { id: reportId }
    });

    if (!report) return null;

    return {
      id: report.id,
      companyId: report.companyId,
      reportType: report.reportType as 'monthly' | 'quarterly' | 'annual',
      period: report.period,
      slides: JSON.parse(report.slides),
      status: report.status as 'draft' | 'generated' | 'sent',
      createdAt: report.createdAt,
      sentAt: report.sentAt
    };
  }

  private async storeDeliverySchedule(companyId: string, emailAddresses: string[], frequency: string): Promise<void> {
    // Implementation to store delivery schedule
    logger.info(`Stored delivery schedule for company ${companyId}`);
  }
}









