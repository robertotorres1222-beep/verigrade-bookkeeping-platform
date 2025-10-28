import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';

const prisma = new PrismaClient();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface StaffingRecommendation {
  id: string;
  userId: string;
  recommendationType: 'hire' | 'promote' | 'restructure' | 'outsource' | 'optimize';
  title: string;
  description: string;
  department: string;
  role: string;
  currentHeadcount: number;
  recommendedHeadcount: number;
  costImpact: number;
  revenueImpact: number;
  roi: number;
  confidence: number;
  reasoning: string[];
  actionItems: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedImplementationTime: string;
  createdAt: Date;
}

export interface StaffingAnalysis {
  totalHeadcount: number;
  revenuePerEmployee: number;
  costPerEmployee: number;
  productivityScore: number;
  turnoverRate: number;
  hiringVelocity: number;
  departmentBreakdown: Array<{
    department: string;
    headcount: number;
    revenuePerEmployee: number;
    costPerEmployee: number;
    productivityScore: number;
  }>;
}

export interface HiringTimeline {
  role: string;
  department: string;
  urgency: 'immediate' | '3_months' | '6_months' | '12_months';
  estimatedCost: number;
  expectedROI: number;
  hiringDifficulty: 'easy' | 'medium' | 'hard';
  keyRequirements: string[];
  recommendedSalary: number;
}

export class StaffingRecommendationService {
  /**
   * Generate staffing recommendations
   */
  async generateStaffingRecommendations(userId: string): Promise<StaffingRecommendation[]> {
    try {
      const recommendations: StaffingRecommendation[] = [];
      
      // Get staffing analysis
      const staffingAnalysis = await this.analyzeStaffing(userId);
      
      // Generate hiring recommendations
      const hiringRecommendations = await this.analyzeHiringNeeds(userId, staffingAnalysis);
      recommendations.push(...hiringRecommendations);
      
      // Generate optimization recommendations
      const optimizationRecommendations = await this.analyzeStaffingOptimization(userId, staffingAnalysis);
      recommendations.push(...optimizationRecommendations);
      
      // Generate restructuring recommendations
      const restructuringRecommendations = await this.analyzeRestructuring(userId, staffingAnalysis);
      recommendations.push(...restructuringRecommendations);
      
      // Sort by ROI
      return recommendations.sort((a, b) => b.roi - a.roi);

    } catch (error) {
      console.error('Error generating staffing recommendations:', error);
      return [];
    }
  }

  /**
   * Analyze current staffing
   */
  private async analyzeStaffing(userId: string): Promise<StaffingAnalysis> {
    try {
      // Get company data (simplified - in real implementation, this would query actual data)
      const totalHeadcount = 25; // Mock data
      const totalRevenue = 2000000; // Mock annual revenue
      const totalCosts = 1500000; // Mock annual costs
      
      const revenuePerEmployee = totalRevenue / totalHeadcount;
      const costPerEmployee = totalCosts / totalHeadcount;
      const productivityScore = this.calculateProductivityScore(revenuePerEmployee, costPerEmployee);
      
      const departmentBreakdown = [
        {
          department: 'Engineering',
          headcount: 8,
          revenuePerEmployee: 35000,
          costPerEmployee: 28000,
          productivityScore: 85
        },
        {
          department: 'Sales',
          headcount: 5,
          revenuePerEmployee: 45000,
          costPerEmployee: 32000,
          productivityScore: 90
        },
        {
          department: 'Marketing',
          headcount: 3,
          revenuePerEmployee: 25000,
          costPerEmployee: 20000,
          productivityScore: 75
        },
        {
          department: 'Operations',
          headcount: 4,
          revenuePerEmployee: 20000,
          costPerEmployee: 18000,
          productivityScore: 80
        },
        {
          department: 'Support',
          headcount: 5,
          revenuePerEmployee: 15000,
          costPerEmployee: 15000,
          productivityScore: 70
        }
      ];
      
      return {
        totalHeadcount,
        revenuePerEmployee,
        costPerEmployee,
        productivityScore,
        turnoverRate: 15, // Mock turnover rate
        hiringVelocity: 2, // Mock hiring velocity (months)
        departmentBreakdown
      };

    } catch (error) {
      console.error('Error analyzing staffing:', error);
      return {
        totalHeadcount: 0,
        revenuePerEmployee: 0,
        costPerEmployee: 0,
        productivityScore: 0,
        turnoverRate: 0,
        hiringVelocity: 0,
        departmentBreakdown: []
      };
    }
  }

  /**
   * Analyze hiring needs
   */
  private async analyzeHiringNeeds(userId: string, analysis: StaffingAnalysis): Promise<StaffingRecommendation[]> {
    const recommendations: StaffingRecommendation[] = [];
    
    // Analyze each department for hiring needs
    for (const dept of analysis.departmentBreakdown) {
      // High-performing departments might need expansion
      if (dept.productivityScore > 85 && dept.revenuePerEmployee > 30000) {
        const additionalHeadcount = Math.ceil(dept.headcount * 0.25); // 25% growth
        const additionalRevenue = additionalHeadcount * dept.revenuePerEmployee;
        const additionalCost = additionalHeadcount * dept.costPerEmployee;
        const roi = ((additionalRevenue - additionalCost) / additionalCost) * 100;
        
        recommendations.push({
          id: `hire_${dept.department}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId,
          recommendationType: 'hire',
          title: `Hire ${additionalHeadcount} ${dept.department} team members`,
          description: `Expand ${dept.department} team to capitalize on high productivity`,
          department: dept.department,
          role: 'Team Member',
          currentHeadcount: dept.headcount,
          recommendedHeadcount: dept.headcount + additionalHeadcount,
          costImpact: additionalCost,
          revenueImpact: additionalRevenue,
          roi,
          confidence: 0.8,
          reasoning: [
            `${dept.department} has high productivity score (${dept.productivityScore})`,
            `Revenue per employee: $${dept.revenuePerEmployee.toLocaleString()}`,
            `ROI: ${roi.toFixed(1)}%`
          ],
          actionItems: [
            `Create job descriptions for ${dept.department} roles`,
            'Post job openings on relevant platforms',
            'Conduct interviews and assessments',
            'Onboard new team members'
          ],
          priority: roi > 50 ? 'high' : 'medium',
          estimatedImplementationTime: '2-3 months',
          createdAt: new Date()
        });
      }
      
      // Underperforming departments might need optimization
      if (dept.productivityScore < 70) {
        recommendations.push({
          id: `optimize_${dept.department}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId,
          recommendationType: 'optimize',
          title: `Optimize ${dept.department} team performance`,
          description: `Improve productivity in ${dept.department} before considering expansion`,
          department: dept.department,
          role: 'Team Optimization',
          currentHeadcount: dept.headcount,
          recommendedHeadcount: dept.headcount,
          costImpact: -dept.costPerEmployee * 0.1, // 10% cost reduction
          revenueImpact: dept.revenuePerEmployee * dept.headcount * 0.2, // 20% revenue increase
          roi: 200, // High ROI for optimization
          confidence: 0.7,
          reasoning: [
            `${dept.department} has low productivity score (${dept.productivityScore})`,
            `Focus on optimization before expansion`,
            `Potential for significant improvement`
          ],
          actionItems: [
            'Conduct performance reviews',
            'Identify training needs',
            'Implement productivity improvements',
            'Set performance metrics and goals'
          ],
          priority: 'high',
          estimatedImplementationTime: '1-2 months',
          createdAt: new Date()
        });
      }
    }
    
    return recommendations;
  }

  /**
   * Analyze staffing optimization
   */
  private async analyzeStaffingOptimization(userId: string, analysis: StaffingAnalysis): Promise<StaffingRecommendation[]> {
    const recommendations: StaffingRecommendation[] = [];
    
    // Overall company optimization
    if (analysis.productivityScore < 80) {
      recommendations.push({
        id: `company_optimization_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        recommendationType: 'optimize',
        title: 'Company-wide productivity optimization',
        description: 'Implement company-wide productivity improvements',
        department: 'All',
        role: 'Productivity Optimization',
        currentHeadcount: analysis.totalHeadcount,
        recommendedHeadcount: analysis.totalHeadcount,
        costImpact: -analysis.costPerEmployee * analysis.totalHeadcount * 0.05, // 5% cost reduction
        revenueImpact: analysis.revenuePerEmployee * analysis.totalHeadcount * 0.15, // 15% revenue increase
        roi: 300, // Very high ROI
        confidence: 0.8,
        reasoning: [
          `Overall productivity score: ${analysis.productivityScore}`,
          'Company-wide optimization opportunity',
          'High potential for improvement'
        ],
        actionItems: [
          'Implement productivity tracking systems',
          'Provide training and development programs',
          'Optimize workflows and processes',
          'Set clear performance expectations'
        ],
        priority: 'high',
        estimatedImplementationTime: '3-6 months',
        createdAt: new Date()
      });
    }
    
    return recommendations;
  }

  /**
   * Analyze restructuring needs
   */
  private async analyzeRestructuring(userId: string, analysis: StaffingAnalysis): Promise<StaffingRecommendation[]> {
    const recommendations: StaffingRecommendation[] = [];
    
    // High turnover rate indicates restructuring needs
    if (analysis.turnoverRate > 20) {
      recommendations.push({
        id: `restructure_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        recommendationType: 'restructure',
        title: 'Address high turnover rate',
        description: `High turnover rate (${analysis.turnoverRate}%) indicates restructuring needs`,
        department: 'All',
        role: 'Organizational Restructuring',
        currentHeadcount: analysis.totalHeadcount,
        recommendedHeadcount: analysis.totalHeadcount,
        costImpact: -analysis.costPerEmployee * analysis.totalHeadcount * 0.1, // 10% cost reduction
        revenueImpact: analysis.revenuePerEmployee * analysis.totalHeadcount * 0.1, // 10% revenue increase
        roi: 100,
        confidence: 0.6,
        reasoning: [
          `Turnover rate: ${analysis.turnoverRate}% (high)`,
          'High turnover indicates organizational issues',
          'Restructuring can improve retention'
        ],
        actionItems: [
          'Conduct employee satisfaction surveys',
          'Review compensation and benefits',
          'Improve management practices',
          'Implement retention strategies'
        ],
        priority: 'high',
        estimatedImplementationTime: '4-6 months',
        createdAt: new Date()
      });
    }
    
    return recommendations;
  }

  /**
   * Calculate productivity score
   */
  private calculateProductivityScore(revenuePerEmployee: number, costPerEmployee: number): number {
    const efficiency = revenuePerEmployee / costPerEmployee;
    return Math.min(efficiency * 20, 100); // Scale to 0-100
  }

  /**
   * Generate hiring timeline
   */
  async generateHiringTimeline(userId: string): Promise<HiringTimeline[]> {
    try {
      const timeline: HiringTimeline[] = [];
      
      // Mock hiring timeline data
      timeline.push({
        role: 'Senior Software Engineer',
        department: 'Engineering',
        urgency: '3_months',
        estimatedCost: 120000,
        expectedROI: 150,
        hiringDifficulty: 'medium',
        keyRequirements: ['5+ years experience', 'Full-stack development', 'Team leadership'],
        recommendedSalary: 120000
      });
      
      timeline.push({
        role: 'Sales Manager',
        department: 'Sales',
        urgency: 'immediate',
        estimatedCost: 100000,
        expectedROI: 200,
        hiringDifficulty: 'hard',
        keyRequirements: ['Sales management experience', 'B2B sales', 'Team building'],
        recommendedSalary: 100000
      });
      
      timeline.push({
        role: 'Marketing Specialist',
        department: 'Marketing',
        urgency: '6_months',
        estimatedCost: 80000,
        expectedROI: 120,
        hiringDifficulty: 'easy',
        keyRequirements: ['Digital marketing', 'Content creation', 'Analytics'],
        recommendedSalary: 80000
      });
      
      return timeline;

    } catch (error) {
      console.error('Error generating hiring timeline:', error);
      return [];
    }
  }

  /**
   * Get staffing recommendation dashboard
   */
  async getStaffingRecommendationDashboard(userId: string): Promise<{
    recommendations: StaffingRecommendation[];
    analysis: StaffingAnalysis;
    hiringTimeline: HiringTimeline[];
    insights: {
      totalRecommendations: number;
      highPriorityRecommendations: number;
      potentialCostSavings: number;
      potentialRevenueIncrease: number;
      averageROI: number;
    };
  }> {
    try {
      const recommendations = await this.generateStaffingRecommendations(userId);
      const analysis = await this.analyzeStaffing(userId);
      const hiringTimeline = await this.generateHiringTimeline(userId);
      
      const highPriorityRecommendations = recommendations.filter(r => r.priority === 'high' || r.priority === 'critical').length;
      const potentialCostSavings = recommendations.reduce((sum, r) => sum + Math.abs(r.costImpact), 0);
      const potentialRevenueIncrease = recommendations.reduce((sum, r) => sum + r.revenueImpact, 0);
      const averageROI = recommendations.length > 0 
        ? recommendations.reduce((sum, r) => sum + r.roi, 0) / recommendations.length 
        : 0;
      
      const insights = {
        totalRecommendations: recommendations.length,
        highPriorityRecommendations,
        potentialCostSavings,
        potentialRevenueIncrease,
        averageROI
      };
      
      return {
        recommendations,
        analysis,
        hiringTimeline,
        insights
      };

    } catch (error) {
      console.error('Error getting staffing recommendation dashboard:', error);
      return {
        recommendations: [],
        analysis: {
          totalHeadcount: 0,
          revenuePerEmployee: 0,
          costPerEmployee: 0,
          productivityScore: 0,
          turnoverRate: 0,
          hiringVelocity: 0,
          departmentBreakdown: []
        },
        hiringTimeline: [],
        insights: {
          totalRecommendations: 0,
          highPriorityRecommendations: 0,
          potentialCostSavings: 0,
          potentialRevenueIncrease: 0,
          averageROI: 0
        }
      };
    }
  }
}

export default StaffingRecommendationService;










