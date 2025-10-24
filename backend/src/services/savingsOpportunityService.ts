import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface SavingsOpportunity {
  id: string;
  vendorId: string;
  opportunityType: 'reserved_instances' | 'duplicate_subscriptions' | 'unused_licenses' | 'annual_prepay' | 'negotiation' | 'consolidation';
  title: string;
  description: string;
  currentCost: number;
  potentialSavings: number;
  savingsPercentage: number;
  implementationSteps: string[];
  timeline: string;
  riskLevel: 'low' | 'medium' | 'high';
  dependencies: string[];
  priority: 'high' | 'medium' | 'low';
  estimatedROI: number;
  vendorName: string;
  category: string;
  status: 'identified' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface SavingsTracking {
  opportunityId: string;
  originalSavings: number;
  actualSavings: number;
  implementationCost: number;
  netSavings: number;
  roi: number;
  status: 'tracking' | 'completed' | 'failed';
  startDate: Date;
  completionDate?: Date;
  notes: string[];
}

export class SavingsOpportunityService {
  /**
   * Get all savings opportunities for a company
   */
  async getSavingsOpportunities(companyId: string): Promise<SavingsOpportunity[]> {
    try {
      logger.info(`Getting savings opportunities for company ${companyId}`);

      const opportunities = await prisma.savingsOpportunity.findMany({
        where: { companyId },
        include: {
          vendor: true
        },
        orderBy: { priority: 'desc' }
      });

      return opportunities.map(opp => ({
        id: opp.id,
        vendorId: opp.vendorId,
        opportunityType: opp.opportunityType as any,
        title: opp.title,
        description: opp.description,
        currentCost: opp.currentCost,
        potentialSavings: opp.potentialSavings,
        savingsPercentage: opp.savingsPercentage,
        implementationSteps: JSON.parse(opp.implementationSteps),
        timeline: opp.timeline,
        riskLevel: opp.riskLevel as any,
        dependencies: JSON.parse(opp.dependencies),
        priority: opp.priority as any,
        estimatedROI: opp.estimatedROI,
        vendorName: opp.vendor.name,
        category: opp.category,
        status: opp.status as any,
        createdAt: opp.createdAt,
        updatedAt: opp.updatedAt
      }));
    } catch (error) {
      logger.error(`Error getting savings opportunities: ${error.message}`);
      throw new Error(`Failed to get savings opportunities: ${error.message}`);
    }
  }

  /**
   * Create a new savings opportunity
   */
  async createSavingsOpportunity(
    companyId: string,
    opportunityData: Omit<SavingsOpportunity, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<SavingsOpportunity> {
    try {
      logger.info(`Creating savings opportunity for company ${companyId}`);

      const opportunity = await prisma.savingsOpportunity.create({
        data: {
          companyId,
          vendorId: opportunityData.vendorId,
          opportunityType: opportunityData.opportunityType,
          title: opportunityData.title,
          description: opportunityData.description,
          currentCost: opportunityData.currentCost,
          potentialSavings: opportunityData.potentialSavings,
          savingsPercentage: opportunityData.savingsPercentage,
          implementationSteps: JSON.stringify(opportunityData.implementationSteps),
          timeline: opportunityData.timeline,
          riskLevel: opportunityData.riskLevel,
          dependencies: JSON.stringify(opportunityData.dependencies),
          priority: opportunityData.priority,
          estimatedROI: opportunityData.estimatedROI,
          category: opportunityData.category,
          status: opportunityData.status
        },
        include: {
          vendor: true
        }
      });

      return {
        id: opportunity.id,
        vendorId: opportunity.vendorId,
        opportunityType: opportunity.opportunityType as any,
        title: opportunity.title,
        description: opportunity.description,
        currentCost: opportunity.currentCost,
        potentialSavings: opportunity.potentialSavings,
        savingsPercentage: opportunity.savingsPercentage,
        implementationSteps: JSON.parse(opportunity.implementationSteps),
        timeline: opportunity.timeline,
        riskLevel: opportunity.riskLevel as any,
        dependencies: JSON.parse(opportunity.dependencies),
        priority: opportunity.priority as any,
        estimatedROI: opportunity.estimatedROI,
        vendorName: opportunity.vendor.name,
        category: opportunity.category,
        status: opportunity.status as any,
        createdAt: opportunity.createdAt,
        updatedAt: opportunity.updatedAt
      };
    } catch (error) {
      logger.error(`Error creating savings opportunity: ${error.message}`);
      throw new Error(`Failed to create savings opportunity: ${error.message}`);
    }
  }

  /**
   * Update savings opportunity status
   */
  async updateOpportunityStatus(
    opportunityId: string,
    status: 'identified' | 'in_progress' | 'completed' | 'cancelled'
  ): Promise<void> {
    try {
      await prisma.savingsOpportunity.update({
        where: { id: opportunityId },
        data: { 
          status,
          updatedAt: new Date()
        }
      });

      logger.info(`Updated opportunity ${opportunityId} status to ${status}`);
    } catch (error) {
      logger.error(`Error updating opportunity status: ${error.message}`);
      throw new Error(`Failed to update opportunity status: ${error.message}`);
    }
  }

  /**
   * Start tracking savings implementation
   */
  async startSavingsTracking(
    opportunityId: string,
    originalSavings: number,
    implementationCost: number = 0
  ): Promise<SavingsTracking> {
    try {
      const tracking = await prisma.savingsTracking.create({
        data: {
          opportunityId,
          originalSavings,
          actualSavings: 0,
          implementationCost,
          netSavings: -implementationCost,
          roi: 0,
          status: 'tracking',
          startDate: new Date(),
          notes: JSON.stringify([])
        }
      });

      return {
        opportunityId: tracking.opportunityId,
        originalSavings: tracking.originalSavings,
        actualSavings: tracking.actualSavings,
        implementationCost: tracking.implementationCost,
        netSavings: tracking.netSavings,
        roi: tracking.roi,
        status: tracking.status as any,
        startDate: tracking.startDate,
        completionDate: tracking.completionDate,
        notes: JSON.parse(tracking.notes)
      };
    } catch (error) {
      logger.error(`Error starting savings tracking: ${error.message}`);
      throw new Error(`Failed to start savings tracking: ${error.message}`);
    }
  }

  /**
   * Update savings tracking
   */
  async updateSavingsTracking(
    opportunityId: string,
    actualSavings: number,
    notes?: string
  ): Promise<void> {
    try {
      const tracking = await prisma.savingsTracking.findUnique({
        where: { opportunityId }
      });

      if (!tracking) {
        throw new Error('Savings tracking not found');
      }

      const netSavings = actualSavings - tracking.implementationCost;
      const roi = tracking.implementationCost > 0 ? (netSavings / tracking.implementationCost) * 100 : 0;

      const updatedNotes = notes 
        ? [...JSON.parse(tracking.notes), notes]
        : JSON.parse(tracking.notes);

      await prisma.savingsTracking.update({
        where: { opportunityId },
        data: {
          actualSavings,
          netSavings,
          roi,
          notes: JSON.stringify(updatedNotes),
          updatedAt: new Date()
        }
      });

      logger.info(`Updated savings tracking for opportunity ${opportunityId}`);
    } catch (error) {
      logger.error(`Error updating savings tracking: ${error.message}`);
      throw new Error(`Failed to update savings tracking: ${error.message}`);
    }
  }

  /**
   * Complete savings tracking
   */
  async completeSavingsTracking(
    opportunityId: string,
    finalSavings: number,
    completionNotes?: string
  ): Promise<void> {
    try {
      const tracking = await prisma.savingsTracking.findUnique({
        where: { opportunityId }
      });

      if (!tracking) {
        throw new Error('Savings tracking not found');
      }

      const netSavings = finalSavings - tracking.implementationCost;
      const roi = tracking.implementationCost > 0 ? (netSavings / tracking.implementationCost) * 100 : 0;

      const updatedNotes = completionNotes 
        ? [...JSON.parse(tracking.notes), `Completed: ${completionNotes}`]
        : JSON.parse(tracking.notes);

      await prisma.savingsTracking.update({
        where: { opportunityId },
        data: {
          actualSavings: finalSavings,
          netSavings,
          roi,
          status: 'completed',
          completionDate: new Date(),
          notes: JSON.stringify(updatedNotes),
          updatedAt: new Date()
        }
      });

      // Update opportunity status
      await this.updateOpportunityStatus(opportunityId, 'completed');

      logger.info(`Completed savings tracking for opportunity ${opportunityId}`);
    } catch (error) {
      logger.error(`Error completing savings tracking: ${error.message}`);
      throw new Error(`Failed to complete savings tracking: ${error.message}`);
    }
  }

  /**
   * Get savings tracking for an opportunity
   */
  async getSavingsTracking(opportunityId: string): Promise<SavingsTracking | null> {
    try {
      const tracking = await prisma.savingsTracking.findUnique({
        where: { opportunityId }
      });

      if (!tracking) return null;

      return {
        opportunityId: tracking.opportunityId,
        originalSavings: tracking.originalSavings,
        actualSavings: tracking.actualSavings,
        implementationCost: tracking.implementationCost,
        netSavings: tracking.netSavings,
        roi: tracking.roi,
        status: tracking.status as any,
        startDate: tracking.startDate,
        completionDate: tracking.completionDate,
        notes: JSON.parse(tracking.notes)
      };
    } catch (error) {
      logger.error(`Error getting savings tracking: ${error.message}`);
      throw new Error(`Failed to get savings tracking: ${error.message}`);
    }
  }

  /**
   * Get savings summary for a company
   */
  async getSavingsSummary(companyId: string) {
    try {
      const [
        totalOpportunities,
        completedOpportunities,
        totalPotentialSavings,
        totalActualSavings,
        avgROI
      ] = await Promise.all([
        prisma.savingsOpportunity.count({
          where: { companyId }
        }),
        prisma.savingsOpportunity.count({
          where: { companyId, status: 'completed' }
        }),
        prisma.savingsOpportunity.aggregate({
          where: { companyId },
          _sum: { potentialSavings: true }
        }),
        prisma.savingsTracking.aggregate({
          where: {
            opportunity: { companyId }
          },
          _sum: { actualSavings: true }
        }),
        prisma.savingsTracking.aggregate({
          where: {
            opportunity: { companyId },
            status: 'completed'
          },
          _avg: { roi: true }
        })
      ]);

      return {
        totalOpportunities,
        completedOpportunities,
        completionRate: totalOpportunities > 0 ? (completedOpportunities / totalOpportunities) * 100 : 0,
        totalPotentialSavings: totalPotentialSavings._sum.potentialSavings || 0,
        totalActualSavings: totalActualSavings._sum.actualSavings || 0,
        avgROI: avgROI._avg.roi || 0
      };
    } catch (error) {
      logger.error(`Error getting savings summary: ${error.message}`);
      throw new Error(`Failed to get savings summary: ${error.message}`);
    }
  }

  /**
   * Get negotiation triggers
   */
  async getNegotiationTriggers(companyId: string) {
    try {
      const vendors = await prisma.vendor.findMany({
        where: { companyId },
        include: {
          spend: true,
          contracts: {
            where: {
              renewalDate: {
                lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
              }
            }
          }
        }
      });

      const triggers = vendors
        .filter(vendor => vendor.contracts.length > 0 || vendor.spend.length > 0)
        .map(vendor => ({
          vendorId: vendor.id,
          vendorName: vendor.name,
          triggerType: vendor.contracts.length > 0 ? 'renewal_approaching' : 'high_spend',
          renewalDate: vendor.contracts[0]?.renewalDate,
          currentSpend: vendor.spend.reduce((sum, s) => sum + s.amount, 0),
          recommendedActions: this.getRecommendedNegotiationActions(vendor)
        }));

      return triggers;
    } catch (error) {
      logger.error(`Error getting negotiation triggers: ${error.message}`);
      throw new Error(`Failed to get negotiation triggers: ${error.message}`);
    }
  }

  private getRecommendedNegotiationActions(vendor: any): string[] {
    const actions: string[] = [];
    
    if (vendor.contracts.length > 0) {
      actions.push('Prepare renewal negotiation strategy');
      actions.push('Research market rates for comparison');
      actions.push('Identify leverage points (volume, contract length)');
    }
    
    if (vendor.spend.length > 0) {
      const totalSpend = vendor.spend.reduce((sum: number, s: any) => sum + s.amount, 0);
      if (totalSpend > 10000) {
        actions.push('Request volume discounts');
        actions.push('Negotiate better terms based on spend level');
      }
    }
    
    actions.push('Prepare alternative vendor options');
    actions.push('Set up negotiation timeline');
    
    return actions;
  }
}





