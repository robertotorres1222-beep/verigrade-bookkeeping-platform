import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export class GlobalTaxService {
  // Economic Nexus Threshold Monitoring
  async monitorEconomicNexus(userId: string, jurisdiction: string) {
    try {
      const nexusData = await this.getNexusData(userId, jurisdiction);
      const thresholds = await this.getNexusThresholds(jurisdiction);
      
      const analysis = {
        jurisdiction,
        currentRevenue: nexusData.revenue,
        currentTransactions: nexusData.transactionCount,
        revenueThreshold: thresholds.revenue,
        transactionThreshold: thresholds.transactions,
        isNexusTriggered: this.checkNexusTrigger(nexusData, thresholds),
        recommendations: this.generateNexusRecommendations(nexusData, thresholds)
      };

      // Store nexus monitoring
      await prisma.nexusMonitoring.create({
        data: {
          id: uuidv4(),
          userId,
          jurisdiction,
          analysis: JSON.stringify(analysis),
          monitoredAt: new Date()
        }
      });

      return analysis;
    } catch (error) {
      throw new Error(`Failed to monitor economic nexus: ${error.message}`);
    }
  }

  // Digital Services Tax (DST) Compliance
  async checkDSTCompliance(userId: string, country: string) {
    try {
      const dstRules = await this.getDSTRules(country);
      const userData = await this.getUserDSTData(userId, country);
      
      const compliance = {
        country,
        isDSTApplicable: this.isDSTApplicable(userData, dstRules),
        dstRate: dstRules.rate,
        taxableRevenue: userData.taxableRevenue,
        dstLiability: this.calculateDSTLiability(userData, dstRules),
        filingRequirements: dstRules.filingRequirements,
        deadlines: dstRules.deadlines,
        exemptions: dstRules.exemptions,
        recommendations: this.generateDSTRecommendations(userData, dstRules)
      };

      // Store DST compliance check
      await prisma.dstCompliance.create({
        data: {
          id: uuidv4(),
          userId,
          country,
          compliance: JSON.stringify(compliance),
          checkedAt: new Date()
        }
      });

      return compliance;
    } catch (error) {
      throw new Error(`Failed to check DST compliance: ${error.message}`);
    }
  }

  // Reverse Charge Mechanism Detection (EU VAT)
  async detectReverseCharge(userId: string, transaction: any) {
    try {
      const vatRules = await this.getVATRules(transaction.customerCountry);
      const isReverseCharge = this.isReverseChargeApplicable(transaction, vatRules);
      
      if (isReverseCharge) {
        const reverseChargeData = {
          transactionId: transaction.id,
          customerCountry: transaction.customerCountry,
          supplierCountry: transaction.supplierCountry,
          isReverseCharge: true,
          vatRate: vatRules.reverseChargeRate,
          vatAmount: this.calculateReverseChargeVAT(transaction, vatRules),
          reportingRequirements: vatRules.reportingRequirements,
          documentation: vatRules.documentation
        };

        // Store reverse charge record
        await prisma.reverseChargeRecord.create({
          data: {
            id: uuidv4(),
            userId,
            transactionId: transaction.id,
            reverseChargeData: JSON.stringify(reverseChargeData),
            createdAt: new Date()
          }
        });

        return reverseChargeData;
      }

      return { isReverseCharge: false };
    } catch (error) {
      throw new Error(`Failed to detect reverse charge: ${error.message}`);
    }
  }

  // VAT/GST Calculation by Customer Location
  async calculateVATByLocation(userId: string, transaction: any) {
    try {
      const customerLocation = await this.getCustomerLocation(transaction.customerId);
      const vatRules = await this.getVATRules(customerLocation.country);
      
      const vatCalculation = {
        customerCountry: customerLocation.country,
        customerState: customerLocation.state,
        vatRate: vatRules.rate,
        vatAmount: this.calculateVATAmount(transaction, vatRules),
        vatNumber: customerLocation.vatNumber,
        isVATRegistered: customerLocation.isVATRegistered,
        exemptions: this.checkVATExemptions(transaction, vatRules),
        reportingRequirements: vatRules.reportingRequirements
      };

      // Store VAT calculation
      await prisma.vatCalculation.create({
        data: {
          id: uuidv4(),
          userId,
          transactionId: transaction.id,
          calculation: JSON.stringify(vatCalculation),
          calculatedAt: new Date()
        }
      });

      return vatCalculation;
    } catch (error) {
      throw new Error(`Failed to calculate VAT by location: ${error.message}`);
    }
  }

  // Tax Optimization Suggestion Engine
  async generateTaxOptimizationSuggestions(userId: string) {
    try {
      const userTaxProfile = await this.getUserTaxProfile(userId);
      const suggestions = [];

      // Check for nexus optimization opportunities
      const nexusSuggestions = await this.getNexusOptimizationSuggestions(userId);
      suggestions.push(...nexusSuggestions);

      // Check for entity structure optimization
      const entitySuggestions = await this.getEntityStructureSuggestions(userId);
      suggestions.push(...entitySuggestions);

      // Check for transfer pricing optimization
      const transferPricingSuggestions = await this.getTransferPricingSuggestions(userId);
      suggestions.push(...transferPricingSuggestions);

      // Check for R&D tax credits
      const rndSuggestions = await this.getRNDTaxCreditSuggestions(userId);
      suggestions.push(...rndSuggestions);

      // Rank suggestions by potential savings
      const rankedSuggestions = suggestions.sort((a, b) => b.potentialSavings - a.potentialSavings);

      return {
        totalSuggestions: rankedSuggestions.length,
        totalPotentialSavings: rankedSuggestions.reduce((sum, s) => sum + s.potentialSavings, 0),
        suggestions: rankedSuggestions,
        riskLevel: this.calculateRiskLevel(rankedSuggestions)
      };
    } catch (error) {
      throw new Error(`Failed to generate tax optimization suggestions: ${error.message}`);
    }
  }

  // Sales Tax by Jurisdiction (US)
  async calculateSalesTaxByJurisdiction(userId: string, transaction: any) {
    try {
      const customerAddress = await this.getCustomerAddress(transaction.customerId);
      const taxRates = await this.getTaxRatesByJurisdiction(customerAddress);
      
      const salesTaxCalculation = {
        customerAddress,
        taxRates: {
          state: taxRates.state,
          county: taxRates.county,
          city: taxRates.city,
          special: taxRates.special
        },
        totalTaxRate: this.calculateTotalTaxRate(taxRates),
        taxAmount: this.calculateSalesTaxAmount(transaction, taxRates),
        exemptions: this.checkSalesTaxExemptions(transaction, customerAddress),
        filingRequirements: this.getFilingRequirements(customerAddress),
        dueDates: this.getTaxDueDates(customerAddress)
      };

      // Store sales tax calculation
      await prisma.salesTaxCalculation.create({
        data: {
          id: uuidv4(),
          userId,
          transactionId: transaction.id,
          calculation: JSON.stringify(salesTaxCalculation),
          calculatedAt: new Date()
        }
      });

      return salesTaxCalculation;
    } catch (error) {
      throw new Error(`Failed to calculate sales tax by jurisdiction: ${error.message}`);
    }
  }

  // Tax Filing Deadline Tracking
  async trackTaxFilingDeadlines(userId: string) {
    try {
      const deadlines = [];

      // Get all jurisdictions where user has nexus
      const jurisdictions = await this.getUserJurisdictions(userId);
      
      for (const jurisdiction of jurisdictions) {
        const jurisdictionDeadlines = await this.getJurisdictionDeadlines(jurisdiction);
        deadlines.push(...jurisdictionDeadlines);
      }

      // Sort by due date
      deadlines.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

      // Check for overdue filings
      const overdue = deadlines.filter(d => new Date(d.dueDate) < new Date());
      const upcoming = deadlines.filter(d => {
        const dueDate = new Date(d.dueDate);
        const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        return dueDate > new Date() && dueDate <= thirtyDaysFromNow;
      });

      return {
        totalDeadlines: deadlines.length,
        overdue: overdue.length,
        upcoming: upcoming.length,
        deadlines,
        alerts: this.generateDeadlineAlerts(deadlines)
      };
    } catch (error) {
      throw new Error(`Failed to track tax filing deadlines: ${error.message}`);
    }
  }

  // Automated Tax Form Generation
  async generateTaxForms(userId: string, formType: string, period: string) {
    try {
      const formData = await this.getFormData(userId, formType, period);
      const formTemplate = await this.getFormTemplate(formType);
      
      const generatedForm = {
        formType,
        period,
        formData,
        generatedAt: new Date(),
        status: 'generated',
        filingInstructions: this.getFilingInstructions(formType),
        requiredAttachments: this.getRequiredAttachments(formType),
        electronicFiling: this.supportsElectronicFiling(formType)
      };

      // Store generated form
      await prisma.taxForm.create({
        data: {
          id: uuidv4(),
          userId,
          formType,
          period,
          formData: JSON.stringify(generatedForm),
          generatedAt: new Date()
        }
      });

      return generatedForm;
    } catch (error) {
      throw new Error(`Failed to generate tax forms: ${error.message}`);
    }
  }

  // Global Tax Compliance Dashboard
  async getGlobalTaxDashboard(userId: string) {
    try {
      const dashboard = {
        nexusStatus: await this.getNexusStatus(userId),
        vatStatus: await this.getVATStatus(userId),
        salesTaxStatus: await this.getSalesTaxStatus(userId),
        dstStatus: await this.getDSTStatus(userId),
        upcomingDeadlines: await this.getUpcomingDeadlines(userId),
        complianceScore: await this.calculateComplianceScore(userId),
        recommendations: await this.getComplianceRecommendations(userId)
      };

      return dashboard;
    } catch (error) {
      throw new Error(`Failed to get global tax dashboard: ${error.message}`);
    }
  }

  // Helper Methods
  private async getNexusData(userId: string, jurisdiction: string): Promise<any> {
    // Simplified nexus data retrieval
    return {
      revenue: 50000,
      transactionCount: 100
    };
  }

  private async getNexusThresholds(jurisdiction: string): Promise<any> {
    // Simplified nexus thresholds
    const thresholds = {
      'California': { revenue: 500000, transactions: 200 },
      'New York': { revenue: 500000, transactions: 100 },
      'Texas': { revenue: 500000, transactions: 100 }
    };
    
    return thresholds[jurisdiction] || { revenue: 100000, transactions: 200 };
  }

  private checkNexusTrigger(nexusData: any, thresholds: any): boolean {
    return nexusData.revenue >= thresholds.revenue || 
           nexusData.transactionCount >= thresholds.transactions;
  }

  private generateNexusRecommendations(nexusData: any, thresholds: any): string[] {
    const recommendations = [];
    
    if (nexusData.revenue >= thresholds.revenue * 0.8) {
      recommendations.push('Approaching revenue nexus threshold - consider monitoring closely');
    }
    
    if (nexusData.transactionCount >= thresholds.transactions * 0.8) {
      recommendations.push('Approaching transaction nexus threshold - consider monitoring closely');
    }
    
    return recommendations;
  }

  private async getDSTRules(country: string): Promise<any> {
    // Simplified DST rules
    const dstRules = {
      'France': { rate: 0.03, threshold: 25000000, filingRequirements: 'Quarterly' },
      'Italy': { rate: 0.03, threshold: 5500000, filingRequirements: 'Monthly' },
      'Spain': { rate: 0.03, threshold: 3000000, filingRequirements: 'Quarterly' }
    };
    
    return dstRules[country] || { rate: 0, threshold: 0, filingRequirements: 'None' };
  }

  private async getUserDSTData(userId: string, country: string): Promise<any> {
    // Simplified user DST data
    return {
      taxableRevenue: 1000000,
      digitalServices: true
    };
  }

  private isDSTApplicable(userData: any, dstRules: any): boolean {
    return userData.taxableRevenue >= dstRules.threshold && userData.digitalServices;
  }

  private calculateDSTLiability(userData: any, dstRules: any): number {
    return userData.taxableRevenue * dstRules.rate;
  }

  private generateDSTRecommendations(userData: any, dstRules: any): string[] {
    const recommendations = [];
    
    if (this.isDSTApplicable(userData, dstRules)) {
      recommendations.push('DST is applicable - ensure compliance with filing requirements');
    }
    
    return recommendations;
  }

  private async getVATRules(country: string): Promise<any> {
    // Simplified VAT rules
    const vatRules = {
      'Germany': { rate: 0.19, reverseChargeRate: 0.19 },
      'France': { rate: 0.20, reverseChargeRate: 0.20 },
      'UK': { rate: 0.20, reverseChargeRate: 0.20 }
    };
    
    return vatRules[country] || { rate: 0, reverseChargeRate: 0 };
  }

  private isReverseChargeApplicable(transaction: any, vatRules: any): boolean {
    // Simplified reverse charge logic
    return transaction.customerCountry !== transaction.supplierCountry && 
           vatRules.reverseChargeRate > 0;
  }

  private calculateReverseChargeVAT(transaction: any, vatRules: any): number {
    return transaction.amount * vatRules.reverseChargeRate;
  }

  private async getCustomerLocation(customerId: string): Promise<any> {
    // Simplified customer location retrieval
    return {
      country: 'Germany',
      state: null,
      vatNumber: 'DE123456789',
      isVATRegistered: true
    };
  }

  private calculateVATAmount(transaction: any, vatRules: any): number {
    return transaction.amount * vatRules.rate;
  }

  private checkVATExemptions(transaction: any, vatRules: any): any[] {
    // Simplified VAT exemption check
    return [];
  }

  private async getUserTaxProfile(userId: string): Promise<any> {
    // Simplified user tax profile
    return {
      entityType: 'LLC',
      jurisdictions: ['California', 'New York'],
      revenue: 1000000
    };
  }

  private async getNexusOptimizationSuggestions(userId: string): Promise<any[]> {
    // Simplified nexus optimization suggestions
    return [
      {
        type: 'nexus_optimization',
        description: 'Consider restructuring to minimize nexus footprint',
        potentialSavings: 5000,
        riskLevel: 'medium'
      }
    ];
  }

  private async getEntityStructureSuggestions(userId: string): Promise<any[]> {
    // Simplified entity structure suggestions
    return [
      {
        type: 'entity_structure',
        description: 'Consider converting to S-Corp for tax benefits',
        potentialSavings: 10000,
        riskLevel: 'low'
      }
    ];
  }

  private async getTransferPricingSuggestions(userId: string): Promise<any[]> {
    // Simplified transfer pricing suggestions
    return [];
  }

  private async getRNDTaxCreditSuggestions(userId: string): Promise<any[]> {
    // Simplified R&D tax credit suggestions
    return [
      {
        type: 'rnd_credit',
        description: 'Qualify for R&D tax credits on software development',
        potentialSavings: 15000,
        riskLevel: 'low'
      }
    ];
  }

  private calculateRiskLevel(suggestions: any[]): string {
    const highRiskCount = suggestions.filter(s => s.riskLevel === 'high').length;
    if (highRiskCount > 0) return 'high';
    if (suggestions.length > 3) return 'medium';
    return 'low';
  }

  private async getCustomerAddress(customerId: string): Promise<any> {
    // Simplified customer address retrieval
    return {
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'US'
    };
  }

  private async getTaxRatesByJurisdiction(address: any): Promise<any> {
    // Simplified tax rates by jurisdiction
    return {
      state: 0.075,
      county: 0.01,
      city: 0.005,
      special: 0.002
    };
  }

  private calculateTotalTaxRate(taxRates: any): number {
    return taxRates.state + taxRates.county + taxRates.city + taxRates.special;
  }

  private calculateSalesTaxAmount(transaction: any, taxRates: any): number {
    const totalRate = this.calculateTotalTaxRate(taxRates);
    return transaction.amount * totalRate;
  }

  private checkSalesTaxExemptions(transaction: any, address: any): any[] {
    // Simplified sales tax exemption check
    return [];
  }

  private getFilingRequirements(address: any): any {
    // Simplified filing requirements
    return {
      frequency: 'Monthly',
      dueDate: '15th of following month'
    };
  }

  private getTaxDueDates(address: any): any[] {
    // Simplified tax due dates
    return [
      { type: 'Sales Tax', dueDate: '2024-01-15', status: 'upcoming' }
    ];
  }

  private async getUserJurisdictions(userId: string): Promise<string[]> {
    // Simplified user jurisdictions
    return ['California', 'New York', 'Texas'];
  }

  private async getJurisdictionDeadlines(jurisdiction: string): Promise<any[]> {
    // Simplified jurisdiction deadlines
    return [
      {
        jurisdiction,
        formType: 'Sales Tax Return',
        dueDate: '2024-01-15',
        status: 'upcoming'
      }
    ];
  }

  private generateDeadlineAlerts(deadlines: any[]): any[] {
    // Simplified deadline alerts
    return deadlines.filter(d => {
      const dueDate = new Date(d.dueDate);
      const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      return dueDate <= sevenDaysFromNow;
    });
  }

  private async getFormData(userId: string, formType: string, period: string): Promise<any> {
    // Simplified form data retrieval
    return {
      revenue: 100000,
      expenses: 60000,
      netIncome: 40000
    };
  }

  private async getFormTemplate(formType: string): Promise<any> {
    // Simplified form template
    return {
      fields: ['revenue', 'expenses', 'netIncome'],
      format: 'PDF'
    };
  }

  private getFilingInstructions(formType: string): string {
    // Simplified filing instructions
    return 'File electronically through the state portal';
  }

  private getRequiredAttachments(formType: string): string[] {
    // Simplified required attachments
    return ['Supporting documentation', 'Bank statements'];
  }

  private supportsElectronicFiling(formType: string): boolean {
    // Simplified electronic filing support
    return true;
  }

  // Additional helper methods for dashboard
  private async getNexusStatus(userId: string): Promise<any> {
    return { jurisdictions: ['California', 'New York'], status: 'compliant' };
  }

  private async getVATStatus(userId: string): Promise<any> {
    return { registered: true, countries: ['Germany'], status: 'compliant' };
  }

  private async getSalesTaxStatus(userId: string): Promise<any> {
    return { registered: true, states: ['CA', 'NY'], status: 'compliant' };
  }

  private async getDSTStatus(userId: string): Promise<any> {
    return { applicable: false, countries: [], status: 'not_applicable' };
  }

  private async getUpcomingDeadlines(userId: string): Promise<any[]> {
    return [
      { type: 'Sales Tax', dueDate: '2024-01-15', jurisdiction: 'California' }
    ];
  }

  private async calculateComplianceScore(userId: string): Promise<number> {
    return 0.95; // 95% compliance score
  }

  private async getComplianceRecommendations(userId: string): Promise<any[]> {
    return [
      { type: 'filing', description: 'File quarterly sales tax returns on time', priority: 'high' }
    ];
  }
}

export default new GlobalTaxService();







