import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

interface ClientProfitability {
  clientId: string;
  clientName: string;
  totalRevenue: number;
  totalCosts: number;
  grossProfit: number;
  grossProfitMargin: number;
  netProfit: number;
  netProfitMargin: number;
  projectCount: number;
  averageProjectValue: number;
  averageProjectProfit: number;
  lastProjectDate?: Date;
  paymentHistory: {
    onTime: number;
    late: number;
    overdue: number;
  };
  riskScore: number;
  recommendations: string[];
}

interface ServiceProfitability {
  serviceId: string;
  serviceName: string;
  totalRevenue: number;
  totalCosts: number;
  grossProfit: number;
  grossProfitMargin: number;
  netProfit: number;
  netProfitMargin: number;
  projectCount: number;
  averageProjectValue: number;
  averageProjectProfit: number;
  utilizationRate: number;
  efficiencyScore: number;
  recommendations: string[];
}

interface ProfitabilityMetrics {
  totalRevenue: number;
  totalCosts: number;
  grossProfit: number;
  grossProfitMargin: number;
  netProfit: number;
  netProfitMargin: number;
  clientCount: number;
  averageClientValue: number;
  topPerformingClients: ClientProfitability[];
  topPerformingServices: ServiceProfitability[];
  trends: {
    revenue: number[];
    costs: number[];
    profit: number[];
    periods: string[];
  };
  benchmarks: {
    industryAverage: number;
    competitorAverage: number;
    targetMargin: number;
  };
}

interface ProfitabilityReport {
  period: {
    start: Date;
    end: Date;
  };
  metrics: ProfitabilityMetrics;
  clients: ClientProfitability[];
  services: ServiceProfitability[];
  insights: string[];
  recommendations: string[];
}

class ProfitabilityAnalyticsService {
  /**
   * Calculate client profitability
   */
  async calculateClientProfitability(
    clientId: string,
    organizationId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ClientProfitability> {
    const whereClause: any = {
      organizationId,
      clientId
    };

    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: startDate,
        lte: endDate
      };
    }

    // Get all projects for the client
    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        expenses: true,
        laborEntries: true,
        materialEntries: true,
        invoices: {
          include: {
            lineItems: true
          }
        }
      }
    });

    // Calculate financial metrics
    const totalRevenue = projects.reduce((sum, project) => {
      return sum + project.invoices.reduce((invoiceSum, invoice) => {
        return invoiceSum + invoice.lineItems.reduce((lineSum, line) => {
          return lineSum + line.amount.toNumber();
        }, 0);
      }, 0);
    }, 0);

    const totalCosts = projects.reduce((sum, project) => {
      const projectCosts = project.expenses.reduce((expenseSum, expense) => {
        return expenseSum + expense.amount.toNumber();
      }, 0);

      const laborCosts = project.laborEntries.reduce((laborSum, labor) => {
        return laborSum + (labor.hours * labor.rate);
      }, 0);

      const materialCosts = project.materialEntries.reduce((materialSum, material) => {
        return materialSum + (material.quantity * material.unitCost);
      }, 0);

      return sum + projectCosts + laborCosts + materialCosts;
    }, 0);

    const grossProfit = totalRevenue - totalCosts;
    const grossProfitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    // Calculate payment history
    const invoices = projects.flatMap(p => p.invoices);
    const paymentHistory = {
      onTime: 0,
      late: 0,
      overdue: 0
    };

    invoices.forEach(invoice => {
      if (invoice.status === 'PAID') {
        if (invoice.paidAt && invoice.dueDate && invoice.paidAt <= invoice.dueDate) {
          paymentHistory.onTime++;
        } else {
          paymentHistory.late++;
        }
      } else if (invoice.status === 'OVERDUE') {
        paymentHistory.overdue++;
      }
    });

    // Calculate risk score
    const riskScore = this.calculateRiskScore(paymentHistory, grossProfitMargin);

    // Generate recommendations
    const recommendations = this.generateClientRecommendations(
      grossProfitMargin,
      paymentHistory,
      riskScore,
      projects.length
    );

    const client = await prisma.customer.findUnique({
      where: { id: clientId }
    });

    return {
      clientId,
      clientName: client?.name || 'Unknown Client',
      totalRevenue,
      totalCosts,
      grossProfit,
      grossProfitMargin,
      netProfit: grossProfit, // Simplified for now
      netProfitMargin: grossProfitMargin,
      projectCount: projects.length,
      averageProjectValue: projects.length > 0 ? totalRevenue / projects.length : 0,
      averageProjectProfit: projects.length > 0 ? grossProfit / projects.length : 0,
      lastProjectDate: projects.length > 0 ? projects[0].createdAt : undefined,
      paymentHistory,
      riskScore,
      recommendations
    };
  }

  /**
   * Calculate service profitability
   */
  async calculateServiceProfitability(
    serviceId: string,
    organizationId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ServiceProfitability> {
    const whereClause: any = {
      organizationId,
      serviceId
    };

    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: startDate,
        lte: endDate
      };
    }

    // Get all projects for the service
    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        expenses: true,
        laborEntries: true,
        materialEntries: true,
        invoices: {
          include: {
            lineItems: true
          }
        }
      }
    });

    // Calculate financial metrics
    const totalRevenue = projects.reduce((sum, project) => {
      return sum + project.invoices.reduce((invoiceSum, invoice) => {
        return invoiceSum + invoice.lineItems.reduce((lineSum, line) => {
          return lineSum + line.amount.toNumber();
        }, 0);
      }, 0);
    }, 0);

    const totalCosts = projects.reduce((sum, project) => {
      const projectCosts = project.expenses.reduce((expenseSum, expense) => {
        return expenseSum + expense.amount.toNumber();
      }, 0);

      const laborCosts = project.laborEntries.reduce((laborSum, labor) => {
        return laborSum + (labor.hours * labor.rate);
      }, 0);

      const materialCosts = project.materialEntries.reduce((materialSum, material) => {
        return materialSum + (material.quantity * material.unitCost);
      }, 0);

      return sum + projectCosts + laborCosts + materialCosts;
    }, 0);

    const grossProfit = totalRevenue - totalCosts;
    const grossProfitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    // Calculate utilization rate (simplified)
    const utilizationRate = this.calculateUtilizationRate(projects);

    // Calculate efficiency score
    const efficiencyScore = this.calculateEfficiencyScore(grossProfitMargin, utilizationRate);

    // Generate recommendations
    const recommendations = this.generateServiceRecommendations(
      grossProfitMargin,
      utilizationRate,
      efficiencyScore,
      projects.length
    );

    const service = await prisma.servicePackage.findUnique({
      where: { id: serviceId }
    });

    return {
      serviceId,
      serviceName: service?.name || 'Unknown Service',
      totalRevenue,
      totalCosts,
      grossProfit,
      grossProfitMargin,
      netProfit: grossProfit, // Simplified for now
      netProfitMargin: grossProfitMargin,
      projectCount: projects.length,
      averageProjectValue: projects.length > 0 ? totalRevenue / projects.length : 0,
      averageProjectProfit: projects.length > 0 ? grossProfit / projects.length : 0,
      utilizationRate,
      efficiencyScore,
      recommendations
    };
  }

  /**
   * Generate comprehensive profitability report
   */
  async generateProfitabilityReport(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ProfitabilityReport> {
    // Get all clients and services
    const clients = await prisma.customer.findMany({
      where: { organizationId }
    });

    const services = await prisma.servicePackage.findMany({
      where: { organizationId }
    });

    // Calculate profitability for each client
    const clientProfitabilities = await Promise.all(
      clients.map(client => 
        this.calculateClientProfitability(client.id, organizationId, startDate, endDate)
      )
    );

    // Calculate profitability for each service
    const serviceProfitabilities = await Promise.all(
      services.map(service => 
        this.calculateServiceProfitability(service.id, organizationId, startDate, endDate)
      )
    );

    // Calculate overall metrics
    const totalRevenue = clientProfitabilities.reduce((sum, client) => sum + client.totalRevenue, 0);
    const totalCosts = clientProfitabilities.reduce((sum, client) => sum + client.totalCosts, 0);
    const grossProfit = totalRevenue - totalCosts;
    const grossProfitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    // Get trends (simplified - would need historical data)
    const trends = await this.calculateTrends(organizationId, startDate, endDate);

    // Get benchmarks
    const benchmarks = await this.getBenchmarks();

    // Generate insights and recommendations
    const insights = this.generateInsights(clientProfitabilities, serviceProfitabilities);
    const recommendations = this.generateRecommendations(clientProfitabilities, serviceProfitabilities);

    return {
      period: { start: startDate, end: endDate },
      metrics: {
        totalRevenue,
        totalCosts,
        grossProfit,
        grossProfitMargin,
        netProfit: grossProfit,
        netProfitMargin: grossProfitMargin,
        clientCount: clients.length,
        averageClientValue: clients.length > 0 ? totalRevenue / clients.length : 0,
        topPerformingClients: clientProfitabilities
          .sort((a, b) => b.grossProfit - a.grossProfit)
          .slice(0, 5),
        topPerformingServices: serviceProfitabilities
          .sort((a, b) => b.grossProfit - a.grossProfit)
          .slice(0, 5),
        trends,
        benchmarks
      },
      clients: clientProfitabilities,
      services: serviceProfitabilities,
      insights,
      recommendations
    };
  }

  /**
   * Calculate risk score for client
   */
  private calculateRiskScore(
    paymentHistory: { onTime: number; late: number; overdue: number },
    profitMargin: number
  ): number {
    const totalPayments = paymentHistory.onTime + paymentHistory.late + paymentHistory.overdue;
    if (totalPayments === 0) return 50; // Neutral risk if no payment history

    const onTimeRate = paymentHistory.onTime / totalPayments;
    const lateRate = paymentHistory.late / totalPayments;
    const overdueRate = paymentHistory.overdue / totalPayments;

    // Risk factors
    let riskScore = 0;
    
    // Payment history risk
    riskScore += overdueRate * 40; // High risk for overdue payments
    riskScore += lateRate * 20; // Medium risk for late payments
    riskScore += (1 - onTimeRate) * 30; // Risk based on on-time rate

    // Profit margin risk
    if (profitMargin < 10) riskScore += 20; // High risk for low margins
    else if (profitMargin < 20) riskScore += 10; // Medium risk for moderate margins

    return Math.min(100, Math.max(0, riskScore));
  }

  /**
   * Calculate utilization rate
   */
  private calculateUtilizationRate(projects: any[]): number {
    // Simplified calculation - in reality would need more detailed time tracking
    const totalHours = projects.reduce((sum, project) => {
      return sum + project.laborEntries.reduce((laborSum, labor) => {
        return laborSum + labor.hours;
      }, 0);
    }, 0);

    const availableHours = projects.length * 40 * 4; // 40 hours/week * 4 weeks per project (simplified)
    return availableHours > 0 ? (totalHours / availableHours) * 100 : 0;
  }

  /**
   * Calculate efficiency score
   */
  private calculateEfficiencyScore(profitMargin: number, utilizationRate: number): number {
    // Weighted score based on profit margin and utilization
    const profitScore = Math.min(100, profitMargin * 2); // Convert margin to 0-100 scale
    const utilizationScore = Math.min(100, utilizationRate);
    
    return (profitScore * 0.7 + utilizationScore * 0.3);
  }

  /**
   * Generate client recommendations
   */
  private generateClientRecommendations(
    profitMargin: number,
    paymentHistory: { onTime: number; late: number; overdue: number },
    riskScore: number,
    projectCount: number
  ): string[] {
    const recommendations: string[] = [];

    if (profitMargin < 15) {
      recommendations.push('Consider increasing pricing or reducing costs to improve profitability');
    }

    if (paymentHistory.overdue > 0) {
      recommendations.push('Implement stricter payment terms and follow-up procedures');
    }

    if (riskScore > 70) {
      recommendations.push('This client poses a high risk - consider requiring advance payments');
    }

    if (projectCount === 0) {
      recommendations.push('No recent projects - consider reaching out to re-engage');
    }

    if (profitMargin > 30 && projectCount > 5) {
      recommendations.push('This is a high-value client - consider expanding the relationship');
    }

    return recommendations;
  }

  /**
   * Generate service recommendations
   */
  private generateServiceRecommendations(
    profitMargin: number,
    utilizationRate: number,
    efficiencyScore: number,
    projectCount: number
  ): string[] {
    const recommendations: string[] = [];

    if (profitMargin < 15) {
      recommendations.push('Consider increasing service pricing or optimizing delivery costs');
    }

    if (utilizationRate < 50) {
      recommendations.push('Low utilization - consider marketing this service more aggressively');
    }

    if (efficiencyScore < 60) {
      recommendations.push('Service efficiency is low - review processes and resource allocation');
    }

    if (projectCount === 0) {
      recommendations.push('No recent projects - consider discontinuing or rebranding this service');
    }

    if (profitMargin > 30 && utilizationRate > 80) {
      recommendations.push('High-performing service - consider expanding capacity');
    }

    return recommendations;
  }

  /**
   * Calculate trends
   */
  private async calculateTrends(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{ revenue: number[]; costs: number[]; profit: number[]; periods: string[] }> {
    // Simplified trend calculation
    // In reality, would query historical data
    const periods = ['Q1', 'Q2', 'Q3', 'Q4'];
    const revenue = [100000, 120000, 110000, 130000];
    const costs = [80000, 90000, 85000, 95000];
    const profit = revenue.map((r, i) => r - costs[i]);

    return { revenue, costs, profit, periods };
  }

  /**
   * Get industry benchmarks
   */
  private async getBenchmarks(): Promise<{
    industryAverage: number;
    competitorAverage: number;
    targetMargin: number;
  }> {
    // Simplified benchmarks
    return {
      industryAverage: 15,
      competitorAverage: 18,
      targetMargin: 20
    };
  }

  /**
   * Generate insights
   */
  private generateInsights(
    clients: ClientProfitability[],
    services: ServiceProfitability[]
  ): string[] {
    const insights: string[] = [];

    const totalClients = clients.length;
    const profitableClients = clients.filter(c => c.grossProfit > 0).length;
    const clientProfitabilityRate = totalClients > 0 ? (profitableClients / totalClients) * 100 : 0;

    if (clientProfitabilityRate < 50) {
      insights.push(`${clientProfitabilityRate.toFixed(1)}% of clients are profitable - consider client selection criteria`);
    }

    const totalServices = services.length;
    const profitableServices = services.filter(s => s.grossProfit > 0).length;
    const serviceProfitabilityRate = totalServices > 0 ? (profitableServices / totalServices) * 100 : 0;

    if (serviceProfitabilityRate < 50) {
      insights.push(`${serviceProfitabilityRate.toFixed(1)}% of services are profitable - review service portfolio`);
    }

    const averageClientValue = clients.reduce((sum, c) => sum + c.totalRevenue, 0) / totalClients;
    if (averageClientValue > 50000) {
      insights.push('High average client value - focus on client retention');
    }

    return insights;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    clients: ClientProfitability[],
    services: ServiceProfitability[]
  ): string[] {
    const recommendations: string[] = [];

    const unprofitableClients = clients.filter(c => c.grossProfit < 0);
    if (unprofitableClients.length > 0) {
      recommendations.push(`Review ${unprofitableClients.length} unprofitable clients for pricing or cost optimization`);
    }

    const unprofitableServices = services.filter(s => s.grossProfit < 0);
    if (unprofitableServices.length > 0) {
      recommendations.push(`Consider discontinuing ${unprofitableServices.length} unprofitable services`);
    }

    const highRiskClients = clients.filter(c => c.riskScore > 70);
    if (highRiskClients.length > 0) {
      recommendations.push(`Implement risk mitigation strategies for ${highRiskClients.length} high-risk clients`);
    }

    const lowUtilizationServices = services.filter(s => s.utilizationRate < 50);
    if (lowUtilizationServices.length > 0) {
      recommendations.push(`Improve marketing for ${lowUtilizationServices.length} underutilized services`);
    }

    return recommendations;
  }

  /**
   * Get profitability dashboard data
   */
  async getProfitabilityDashboard(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    summary: ProfitabilityMetrics;
    topClients: ClientProfitability[];
    topServices: ServiceProfitability[];
    alerts: string[];
  }> {
    const report = await this.generateProfitabilityReport(organizationId, startDate, endDate);
    
    const alerts: string[] = [];
    
    // Generate alerts based on metrics
    if (report.metrics.grossProfitMargin < 15) {
      alerts.push('Low profit margin - review pricing and costs');
    }
    
    if (report.metrics.clientCount < 5) {
      alerts.push('Limited client base - consider expanding marketing efforts');
    }
    
    const unprofitableClients = report.clients.filter(c => c.grossProfit < 0);
    if (unprofitableClients.length > 0) {
      alerts.push(`${unprofitableClients.length} clients are unprofitable`);
    }
    
    return {
      summary: report.metrics,
      topClients: report.metrics.topPerformingClients,
      topServices: report.metrics.topPerformingServices,
      alerts
    };
  }
}

export default new ProfitabilityAnalyticsService();

