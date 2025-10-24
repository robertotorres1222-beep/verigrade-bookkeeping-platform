import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export class BudgetActualService {
  // Comprehensive Budgeting System
  async createBudget(userId: string, budgetData: any) {
    try {
      const budget = {
        userId,
        name: budgetData.name,
        period: budgetData.period,
        categories: budgetData.categories,
        totalBudget: this.calculateTotalBudget(budgetData.categories),
        status: 'draft',
        createdAt: new Date()
      };

      // Store budget
      const savedBudget = await prisma.budget.create({
        data: {
          id: uuidv4(),
          userId,
          name: budgetData.name,
          period: JSON.stringify(budgetData.period),
          budget: JSON.stringify(budget),
          createdAt: new Date()
        }
      });

      return { ...budget, id: savedBudget.id };
    } catch (error) {
      throw new Error(`Failed to create budget: ${error.message}`);
    }
  }

  // Variance Analysis (Budget vs Actual)
  async analyzeVariance(userId: string, budgetId: string, period: any) {
    try {
      const budget = await this.getBudget(budgetId);
      const actuals = await this.getActuals(userId, period);
      
      const variance = {
        budgetId,
        period,
        categories: await this.calculateCategoryVariances(budget, actuals),
        totalVariance: await this.calculateTotalVariance(budget, actuals),
        variancePercentage: await this.calculateVariancePercentage(budget, actuals),
        significantVariances: await this.identifySignificantVariances(budget, actuals),
        recommendations: await this.generateVarianceRecommendations(budget, actuals)
      };

      // Store variance analysis
      await prisma.varianceAnalysis.create({
        data: {
          id: uuidv4(),
          userId,
          budgetId,
          period: JSON.stringify(period),
          analysis: JSON.stringify(variance),
          analyzedAt: new Date()
        }
      });

      return variance;
    } catch (error) {
      throw new Error(`Failed to analyze variance: ${error.message}`);
    }
  }

  // Budget Templates by Industry
  async getBudgetTemplates(industry: string) {
    try {
      const templates = {
        'technology': {
          name: 'Technology Startup Budget',
          categories: [
            { name: 'Salaries', percentage: 60, subcategories: ['Engineering', 'Sales', 'Marketing'] },
            { name: 'Marketing', percentage: 20, subcategories: ['Digital', 'Events', 'Content'] },
            { name: 'Operations', percentage: 15, subcategories: ['Office', 'Software', 'Utilities'] },
            { name: 'R&D', percentage: 5, subcategories: ['Research', 'Development'] }
          ]
        },
        'retail': {
          name: 'Retail Business Budget',
          categories: [
            { name: 'Cost of Goods', percentage: 50, subcategories: ['Inventory', 'Shipping'] },
            { name: 'Salaries', percentage: 25, subcategories: ['Store Staff', 'Management'] },
            { name: 'Rent', percentage: 15, subcategories: ['Store Rent', 'Warehouse'] },
            { name: 'Marketing', percentage: 10, subcategories: ['Advertising', 'Promotions'] }
          ]
        },
        'consulting': {
          name: 'Consulting Firm Budget',
          categories: [
            { name: 'Salaries', percentage: 70, subcategories: ['Partners', 'Associates', 'Support'] },
            { name: 'Travel', percentage: 15, subcategories: ['Client Travel', 'Training'] },
            { name: 'Office', percentage: 10, subcategories: ['Rent', 'Utilities', 'Supplies'] },
            { name: 'Marketing', percentage: 5, subcategories: ['Business Development', 'Events'] }
          ]
        }
      };

      return templates[industry] || templates['technology'];
    } catch (error) {
      throw new Error(`Failed to get budget templates: ${error.message}`);
    }
  }

  // Rolling Forecasts
  async createRollingForecast(userId: string, forecastData: any) {
    try {
      const forecast = {
        userId,
        name: forecastData.name,
        startDate: forecastData.startDate,
        endDate: forecastData.endDate,
        frequency: forecastData.frequency, // monthly, quarterly
        categories: forecastData.categories,
        assumptions: forecastData.assumptions,
        scenarios: await this.generateForecastScenarios(forecastData),
        confidence: await this.calculateForecastConfidence(forecastData),
        createdAt: new Date()
      };

      // Store rolling forecast
      const savedForecast = await prisma.rollingForecast.create({
        data: {
          id: uuidv4(),
          userId,
          name: forecastData.name,
          forecast: JSON.stringify(forecast),
          createdAt: new Date()
        }
      });

      return { ...forecast, id: savedForecast.id };
    } catch (error) {
      throw new Error(`Failed to create rolling forecast: ${error.message}`);
    }
  }

  // Budget Approval Workflows
  async createBudgetApprovalWorkflow(userId: string, workflowData: any) {
    try {
      const workflow = {
        userId,
        budgetId: workflowData.budgetId,
        approvers: workflowData.approvers,
        approvalLevels: workflowData.approvalLevels,
        status: 'pending',
        currentLevel: 1,
        approvals: [],
        createdAt: new Date()
      };

      // Store approval workflow
      const savedWorkflow = await prisma.budgetApprovalWorkflow.create({
        data: {
          id: uuidv4(),
          userId,
          budgetId: workflowData.budgetId,
          workflow: JSON.stringify(workflow),
          createdAt: new Date()
        }
      });

      return { ...workflow, id: savedWorkflow.id };
    } catch (error) {
      throw new Error(`Failed to create budget approval workflow: ${error.message}`);
    }
  }

  // Budget Alert System
  async setupBudgetAlerts(userId: string, alertData: any) {
    try {
      const alerts = {
        userId,
        budgetId: alertData.budgetId,
        alertTypes: alertData.alertTypes,
        thresholds: alertData.thresholds,
        notifications: alertData.notifications,
        status: 'active',
        createdAt: new Date()
      };

      // Store budget alerts
      const savedAlerts = await prisma.budgetAlerts.create({
        data: {
          id: uuidv4(),
          userId,
          budgetId: alertData.budgetId,
          alerts: JSON.stringify(alerts),
          createdAt: new Date()
        }
      });

      return { ...alerts, id: savedAlerts.id };
    } catch (error) {
      throw new Error(`Failed to setup budget alerts: ${error.message}`);
    }
  }

  // Budget vs Actual Dashboard
  async getBudgetActualDashboard(userId: string) {
    try {
      const dashboard = {
        userId,
        budgets: await this.getUserBudgets(userId),
        currentPeriod: await this.getCurrentPeriod(),
        varianceSummary: await this.getVarianceSummary(userId),
        alerts: await this.getActiveAlerts(userId),
        trends: await this.getBudgetTrends(userId),
        recommendations: await this.getBudgetRecommendations(userId),
        generatedAt: new Date()
      };

      return dashboard;
    } catch (error) {
      throw new Error(`Failed to get budget actual dashboard: ${error.message}`);
    }
  }

  // Budget Performance Analytics
  async getBudgetPerformanceAnalytics(userId: string, period: any) {
    try {
      const analytics = {
        userId,
        period,
        performance: await this.calculateBudgetPerformance(userId, period),
        trends: await this.analyzeBudgetTrends(userId, period),
        forecasts: await this.generateBudgetForecasts(userId, period),
        insights: await this.generateBudgetInsights(userId, period),
        recommendations: await this.generatePerformanceRecommendations(userId, period)
      };

      return analytics;
    } catch (error) {
      throw new Error(`Failed to get budget performance analytics: ${error.message}`);
    }
  }

  // Helper Methods
  private calculateTotalBudget(categories: any[]): number {
    return categories.reduce((sum, category) => sum + category.amount, 0);
  }

  private async getBudget(budgetId: string): Promise<any> {
    const budget = await prisma.budget.findUnique({
      where: { id: budgetId }
    });
    
    if (!budget) {
      throw new Error('Budget not found');
    }
    
    return JSON.parse(budget.budget);
  }

  private async getActuals(userId: string, period: any): Promise<any> {
    // Simplified actuals retrieval
    return {
      total: 55000,
      categories: {
        'Salaries': 35000,
        'Marketing': 12000,
        'Operations': 8000
      }
    };
  }

  private async calculateCategoryVariances(budget: any, actuals: any): Promise<any[]> {
    const variances = [];
    
    for (const budgetCategory of budget.categories) {
      const actualAmount = actuals.categories[budgetCategory.name] || 0;
      const variance = actualAmount - budgetCategory.amount;
      const variancePercentage = (variance / budgetCategory.amount) * 100;
      
      variances.push({
        category: budgetCategory.name,
        budgeted: budgetCategory.amount,
        actual: actualAmount,
        variance,
        variancePercentage,
        status: this.getVarianceStatus(variancePercentage)
      });
    }
    
    return variances;
  }

  private getVarianceStatus(variancePercentage: number): string {
    if (Math.abs(variancePercentage) <= 5) return 'on_track';
    if (Math.abs(variancePercentage) <= 10) return 'attention';
    return 'critical';
  }

  private async calculateTotalVariance(budget: any, actuals: any): Promise<number> {
    return actuals.total - budget.totalBudget;
  }

  private async calculateVariancePercentage(budget: any, actuals: any): Promise<number> {
    const totalVariance = await this.calculateTotalVariance(budget, actuals);
    return (totalVariance / budget.totalBudget) * 100;
  }

  private async identifySignificantVariances(budget: any, actuals: any): Promise<any[]> {
    const variances = await this.calculateCategoryVariances(budget, actuals);
    return variances.filter(v => Math.abs(v.variancePercentage) > 10);
  }

  private async generateVarianceRecommendations(budget: any, actuals: any): Promise<any[]> {
    const recommendations = [];
    const variances = await this.calculateCategoryVariances(budget, actuals);
    
    for (const variance of variances) {
      if (variance.status === 'critical') {
        recommendations.push({
          category: variance.category,
          recommendation: `Review ${variance.category} spending - ${variance.variancePercentage.toFixed(1)}% variance`,
          priority: 'high'
        });
      }
    }
    
    return recommendations;
  }

  private async generateForecastScenarios(forecastData: any): Promise<any> {
    // Simplified forecast scenarios
    return {
      optimistic: { growth: 0.20, confidence: 0.3 },
      realistic: { growth: 0.10, confidence: 0.5 },
      pessimistic: { growth: 0.05, confidence: 0.2 }
    };
  }

  private async calculateForecastConfidence(forecastData: any): Promise<number> {
    // Simplified forecast confidence calculation
    return 0.8;
  }

  private async getUserBudgets(userId: string): Promise<any[]> {
    // Simplified user budgets retrieval
    return [
      { id: 'budget1', name: 'Q1 2024 Budget', status: 'active' },
      { id: 'budget2', name: 'Q2 2024 Budget', status: 'draft' }
    ];
  }

  private async getCurrentPeriod(): Promise<any> {
    // Simplified current period retrieval
    return {
      year: 2024,
      quarter: 1,
      month: 1
    };
  }

  private async getVarianceSummary(userId: string): Promise<any> {
    // Simplified variance summary
    return {
      totalVariance: -5000,
      variancePercentage: -8.3,
      status: 'attention'
    };
  }

  private async getActiveAlerts(userId: string): Promise<any[]> {
    // Simplified active alerts retrieval
    return [
      { type: 'overspend', category: 'Marketing', amount: 2000, threshold: 10000 }
    ];
  }

  private async getBudgetTrends(userId: string): Promise<any> {
    // Simplified budget trends
    return {
      spending: { trend: 'increasing', change: 0.05 },
      accuracy: { trend: 'improving', change: 0.02 }
    };
  }

  private async getBudgetRecommendations(userId: string): Promise<any[]> {
    // Simplified budget recommendations
    return [
      { type: 'optimization', description: 'Review marketing spend', priority: 'medium' }
    ];
  }

  private async calculateBudgetPerformance(userId: string, period: any): Promise<any> {
    // Simplified budget performance calculation
    return {
      accuracy: 0.85,
      adherence: 0.90,
      efficiency: 0.88
    };
  }

  private async analyzeBudgetTrends(userId: string, period: any): Promise<any> {
    // Simplified budget trend analysis
    return {
      spending: { trend: 'stable', change: 0.02 },
      accuracy: { trend: 'improving', change: 0.05 }
    };
  }

  private async generateBudgetForecasts(userId: string, period: any): Promise<any> {
    // Simplified budget forecast generation
    return {
      nextPeriod: { projected: 60000, confidence: 0.8 },
      yearEnd: { projected: 700000, confidence: 0.7 }
    };
  }

  private async generateBudgetInsights(userId: string, period: any): Promise<any[]> {
    // Simplified budget insight generation
    return [
      { type: 'spending', insight: 'Marketing spend is 15% above budget', confidence: 0.9 },
      { type: 'efficiency', insight: 'Operations are running efficiently', confidence: 0.8 }
    ];
  }

  private async generatePerformanceRecommendations(userId: string, period: any): Promise<any[]> {
    // Simplified performance recommendations
    return [
      { type: 'optimization', description: 'Implement stricter budget controls', priority: 'high' }
    ];
  }
}

export default new BudgetActualService();






