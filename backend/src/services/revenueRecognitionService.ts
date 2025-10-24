import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export class RevenueRecognitionService {
  // ASC 606 Compliant Revenue Recognition System
  async recognizeRevenue(contractId: string, recognitionData: any) {
    try {
      const contract = await prisma.contract.findUnique({
        where: { id: contractId },
        include: {
          performanceObligations: true,
          customer: true
        }
      });

      if (!contract) {
        throw new Error('Contract not found');
      }

      // Calculate total contract value
      const totalContractValue = contract.performanceObligations.reduce(
        (sum, po) => sum + po.allocatedAmount, 0
      );

      // Create revenue recognition schedule
      const recognitionSchedule = await this.createRecognitionSchedule(
        contractId,
        totalContractValue,
        contract.performanceObligations
      );

      // Generate journal entries
      const journalEntries = await this.generateJournalEntries(
        contractId,
        totalContractValue,
        recognitionSchedule
      );

      return {
        contractId,
        totalContractValue,
        recognitionSchedule,
        journalEntries,
        recognizedAt: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to recognize revenue: ${error.message}`);
    }
  }

  // Automatic Deferred Revenue Scheduling
  async createRecognitionSchedule(contractId: string, totalValue: number, performanceObligations: any[]) {
    try {
      const schedule = [];

      for (const po of performanceObligations) {
        const recognitionMethod = po.recognitionMethod || 'time_based';
        
        switch (recognitionMethod) {
          case 'time_based':
            schedule.push(...await this.createTimeBasedSchedule(contractId, po));
            break;
          case 'milestone_based':
            schedule.push(...await this.createMilestoneBasedSchedule(contractId, po));
            break;
          case 'usage_based':
            schedule.push(...await this.createUsageBasedSchedule(contractId, po));
            break;
          case 'point_in_time':
            schedule.push(...await this.createPointInTimeSchedule(contractId, po));
            break;
        }
      }

      // Store recognition schedule
      await prisma.revenueRecognitionSchedule.createMany({
        data: schedule
      });

      return schedule;
    } catch (error) {
      throw new Error(`Failed to create recognition schedule: ${error.message}`);
    }
  }

  // Performance Obligation Tracking
  async trackPerformanceObligation(obligationId: string, completionData: any) {
    try {
      const obligation = await prisma.performanceObligation.findUnique({
        where: { id: obligationId }
      });

      if (!obligation) {
        throw new Error('Performance obligation not found');
      }

      // Update completion status
      const updatedObligation = await prisma.performanceObligation.update({
        where: { id: obligationId },
        data: {
          completionPercentage: completionData.completionPercentage,
          status: completionData.status,
          completedAt: completionData.completedAt,
          notes: completionData.notes
        }
      });

      // Trigger revenue recognition if milestone reached
      if (completionData.status === 'completed') {
        await this.triggerRevenueRecognition(obligationId);
      }

      return updatedObligation;
    } catch (error) {
      throw new Error(`Failed to track performance obligation: ${error.message}`);
    }
  }

  // Contract Modification Handler
  async handleContractModification(contractId: string, modificationData: any) {
    try {
      const contract = await prisma.contract.findUnique({
        where: { id: contractId },
        include: { performanceObligations: true }
      });

      if (!contract) {
        throw new Error('Contract not found');
      }

      // Calculate modification impact
      const originalValue = contract.performanceObligations.reduce(
        (sum, po) => sum + po.allocatedAmount, 0
      );
      const newValue = modificationData.newTotalValue;
      const valueChange = newValue - originalValue;

      // Create modification record
      const modification = await prisma.contractModification.create({
        data: {
          id: uuidv4(),
          contractId,
          modificationType: modificationData.type,
          originalValue,
          newValue,
          valueChange,
          effectiveDate: modificationData.effectiveDate,
          reason: modificationData.reason,
          approvedBy: modificationData.approvedBy,
          createdAt: new Date()
        }
      });

      // Update contract value
      await prisma.contract.update({
        where: { id: contractId },
        data: {
          totalValue: newValue,
          lastModifiedAt: new Date()
        }
      });

      // Adjust revenue recognition schedule
      if (valueChange !== 0) {
        await this.adjustRecognitionSchedule(contractId, valueChange, modificationData.effectiveDate);
      }

      return modification;
    } catch (error) {
      throw new Error(`Failed to handle contract modification: ${error.message}`);
    }
  }

  // Multi-Element Arrangement Support
  async handleMultiElementArrangement(contractId: string, elements: any[]) {
    try {
      const contract = await prisma.contract.findUnique({
        where: { id: contractId }
      });

      if (!contract) {
        throw new Error('Contract not found');
      }

      // Calculate standalone selling prices
      const standalonePrices = await this.calculateStandalonePrices(elements);
      
      // Allocate contract value to elements
      const allocations = await this.allocateContractValue(
        contract.totalValue,
        elements,
        standalonePrices
      );

      // Create performance obligations for each element
      const performanceObligations = [];
      for (const [index, element] of elements.entries()) {
        const obligation = await prisma.performanceObligation.create({
          data: {
            id: uuidv4(),
            contractId,
            elementName: element.name,
            elementType: element.type,
            allocatedAmount: allocations[index],
            standalonePrice: standalonePrices[index],
            recognitionMethod: element.recognitionMethod,
            recognitionTimeline: element.recognitionTimeline,
            createdAt: new Date()
          }
        });
        performanceObligations.push(obligation);
      }

      return performanceObligations;
    } catch (error) {
      throw new Error(`Failed to handle multi-element arrangement: ${error.message}`);
    }
  }

  // Usage-Based Billing Recognition
  async recognizeUsageBasedRevenue(contractId: string, usageData: any) {
    try {
      const contract = await prisma.contract.findUnique({
        where: { id: contractId },
        include: { performanceObligations: true }
      });

      if (!contract) {
        throw new Error('Contract not found');
      }

      // Find usage-based performance obligations
      const usageObligations = contract.performanceObligations.filter(
        po => po.recognitionMethod === 'usage_based'
      );

      const recognitionEntries = [];

      for (const obligation of usageObligations) {
        // Calculate revenue based on usage
        const usageRevenue = this.calculateUsageRevenue(obligation, usageData);
        
        if (usageRevenue > 0) {
          const entry = await prisma.revenueRecognitionEntry.create({
            data: {
              id: uuidv4(),
              contractId,
              performanceObligationId: obligation.id,
              amount: usageRevenue,
              recognitionDate: new Date(),
              recognitionType: 'usage_based',
              usageUnits: usageData.units,
              unitPrice: usageData.unitPrice,
              createdAt: new Date()
            }
          });
          recognitionEntries.push(entry);
        }
      }

      return recognitionEntries;
    } catch (error) {
      throw new Error(`Failed to recognize usage-based revenue: ${error.message}`);
    }
  }

  // Revenue Waterfall Reports
  async generateRevenueWaterfallReport(contractId: string, startDate: Date, endDate: Date) {
    try {
      const contract = await prisma.contract.findUnique({
        where: { id: contractId },
        include: {
          performanceObligations: true,
          revenueRecognitionEntries: {
            where: {
              recognitionDate: {
                gte: startDate,
                lte: endDate
              }
            }
          }
        }
      });

      if (!contract) {
        throw new Error('Contract not found');
      }

      // Calculate waterfall
      const waterfall = {
        totalContractValue: contract.totalValue,
        totalRecognized: contract.revenueRecognitionEntries.reduce(
          (sum, entry) => sum + entry.amount, 0
        ),
        remainingDeferred: contract.totalValue - contract.revenueRecognitionEntries.reduce(
          (sum, entry) => sum + entry.amount, 0
        ),
        byObligation: contract.performanceObligations.map(po => ({
          obligationName: po.elementName,
          allocatedAmount: po.allocatedAmount,
          recognizedAmount: contract.revenueRecognitionEntries
            .filter(entry => entry.performanceObligationId === po.id)
            .reduce((sum, entry) => sum + entry.amount, 0),
          remainingAmount: po.allocatedAmount - contract.revenueRecognitionEntries
            .filter(entry => entry.performanceObligationId === po.id)
            .reduce((sum, entry) => sum + entry.amount, 0)
        }))
      };

      return waterfall;
    } catch (error) {
      throw new Error(`Failed to generate revenue waterfall report: ${error.message}`);
    }
  }

  // Automated Journal Entry Generation
  async generateJournalEntries(contractId: string, totalValue: number, recognitionSchedule: any[]) {
    try {
      const journalEntries = [];

      for (const scheduleItem of recognitionSchedule) {
        // Create journal entry for revenue recognition
        const journalEntry = await prisma.journalEntry.create({
          data: {
            id: uuidv4(),
            contractId,
            entryDate: scheduleItem.recognitionDate,
            description: `Revenue recognition - ${scheduleItem.obligationName}`,
            totalAmount: scheduleItem.amount,
            status: 'posted',
            createdAt: new Date()
          }
        });

        // Create debit entry (Revenue)
        await prisma.journalEntryLine.create({
          data: {
            id: uuidv4(),
            journalEntryId: journalEntry.id,
            accountId: 'revenue_account_id', // Would be actual account ID
            debitAmount: scheduleItem.amount,
            creditAmount: 0,
            description: `Revenue recognition - ${scheduleItem.obligationName}`
          }
        });

        // Create credit entry (Deferred Revenue)
        await prisma.journalEntryLine.create({
          data: {
            id: uuidv4(),
            journalEntryId: journalEntry.id,
            accountId: 'deferred_revenue_account_id', // Would be actual account ID
            debitAmount: 0,
            creditAmount: scheduleItem.amount,
            description: `Deferred revenue recognition - ${scheduleItem.obligationName}`
          }
        });

        journalEntries.push(journalEntry);
      }

      return journalEntries;
    } catch (error) {
      throw new Error(`Failed to generate journal entries: ${error.message}`);
    }
  }

  // Renewal Alerts (60/90 days before)
  async checkRenewalAlerts(userId: string) {
    try {
      const alerts = [];
      const now = new Date();
      const sixtyDaysFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
      const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

      // Find contracts expiring in 60-90 days
      const expiringContracts = await prisma.contract.findMany({
        where: {
          userId,
          endDate: {
            gte: sixtyDaysFromNow,
            lte: ninetyDaysFromNow
          },
          status: 'active'
        },
        include: {
          customer: true,
          performanceObligations: true
        }
      });

      for (const contract of expiringContracts) {
        const daysUntilExpiry = Math.ceil(
          (contract.endDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
        );

        const alert = await prisma.renewalAlert.create({
          data: {
            id: uuidv4(),
            userId,
            contractId: contract.id,
            customerId: contract.customerId,
            alertType: daysUntilExpiry <= 60 ? 'urgent' : 'warning',
            daysUntilExpiry,
            contractValue: contract.totalValue,
            customerName: contract.customer.name,
            createdAt: new Date()
          }
        });

        alerts.push(alert);
      }

      return alerts;
    } catch (error) {
      throw new Error(`Failed to check renewal alerts: ${error.message}`);
    }
  }

  // Helper Methods
  private async createTimeBasedSchedule(contractId: string, performanceObligation: any) {
    const schedule = [];
    const totalAmount = performanceObligation.allocatedAmount;
    const recognitionTimeline = performanceObligation.recognitionTimeline;
    
    // Calculate monthly recognition amount
    const monthlyAmount = totalAmount / recognitionTimeline;
    
    for (let i = 0; i < recognitionTimeline; i++) {
      const recognitionDate = new Date();
      recognitionDate.setMonth(recognitionDate.getMonth() + i);
      
      schedule.push({
        id: uuidv4(),
        contractId,
        performanceObligationId: performanceObligation.id,
        obligationName: performanceObligation.elementName,
        amount: monthlyAmount,
        recognitionDate,
        recognitionType: 'time_based',
        createdAt: new Date()
      });
    }
    
    return schedule;
  }

  private async createMilestoneBasedSchedule(contractId: string, performanceObligation: any) {
    const schedule = [];
    const milestones = performanceObligation.milestones || [];
    
    for (const milestone of milestones) {
      schedule.push({
        id: uuidv4(),
        contractId,
        performanceObligationId: performanceObligation.id,
        obligationName: performanceObligation.elementName,
        amount: milestone.amount,
        recognitionDate: milestone.expectedDate,
        recognitionType: 'milestone_based',
        milestoneName: milestone.name,
        createdAt: new Date()
      });
    }
    
    return schedule;
  }

  private async createUsageBasedSchedule(contractId: string, performanceObligation: any) {
    // Usage-based revenue is recognized as usage occurs
    // This creates a template for future usage recognition
    return [{
      id: uuidv4(),
      contractId,
      performanceObligationId: performanceObligation.id,
      obligationName: performanceObligation.elementName,
      amount: 0, // Will be calculated when usage occurs
      recognitionDate: new Date(),
      recognitionType: 'usage_based',
      createdAt: new Date()
    }];
  }

  private async createPointInTimeSchedule(contractId: string, performanceObligation: any) {
    return [{
      id: uuidv4(),
      contractId,
      performanceObligationId: performanceObligation.id,
      obligationName: performanceObligation.elementName,
      amount: performanceObligation.allocatedAmount,
      recognitionDate: performanceObligation.recognitionDate,
      recognitionType: 'point_in_time',
      createdAt: new Date()
    }];
  }

  private async triggerRevenueRecognition(obligationId: string) {
    // Implementation for triggering revenue recognition when milestone is reached
    const obligation = await prisma.performanceObligation.findUnique({
      where: { id: obligationId }
    });

    if (obligation && obligation.recognitionMethod === 'milestone_based') {
      // Create revenue recognition entry
      await prisma.revenueRecognitionEntry.create({
        data: {
          id: uuidv4(),
          contractId: obligation.contractId,
          performanceObligationId: obligation.id,
          amount: obligation.allocatedAmount,
          recognitionDate: new Date(),
          recognitionType: 'milestone_based',
          createdAt: new Date()
        }
      });
    }
  }

  private async adjustRecognitionSchedule(contractId: string, valueChange: number, effectiveDate: Date) {
    // Implementation for adjusting recognition schedule after contract modification
    const remainingSchedule = await prisma.revenueRecognitionSchedule.findMany({
      where: {
        contractId,
        recognitionDate: { gte: effectiveDate }
      }
    });

    if (remainingSchedule.length > 0) {
      const adjustmentPerPeriod = valueChange / remainingSchedule.length;
      
      for (const scheduleItem of remainingSchedule) {
        await prisma.revenueRecognitionSchedule.update({
          where: { id: scheduleItem.id },
          data: {
            amount: scheduleItem.amount + adjustmentPerPeriod
          }
        });
      }
    }
  }

  private async calculateStandalonePrices(elements: any[]): Promise<number[]> {
    // Implementation for calculating standalone selling prices
    // This would typically involve market research or historical data
    return elements.map(element => element.estimatedPrice || 0);
  }

  private async allocateContractValue(
    totalValue: number,
    elements: any[],
    standalonePrices: number[]
  ): Promise<number[]> {
    const totalStandalonePrice = standalonePrices.reduce((sum, price) => sum + price, 0);
    
    if (totalStandalonePrice === 0) {
      // Equal allocation if no standalone prices
      return elements.map(() => totalValue / elements.length);
    }
    
    // Allocate based on standalone prices
    return standalonePrices.map(price => (price / totalStandalonePrice) * totalValue);
  }

  private calculateUsageRevenue(obligation: any, usageData: any): number {
    return usageData.units * usageData.unitPrice;
  }
}

export default new RevenueRecognitionService();







