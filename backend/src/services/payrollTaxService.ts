import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export class PayrollTaxService {
  // Payroll Tax Calculation Engine
  async calculatePayrollTaxes(userId: string, employeeId: string, payrollPeriod: any) {
    try {
      const employee = await this.getEmployeeData(employeeId);
      const taxRates = await this.getTaxRates(employee.state, employee.federalTaxStatus);
      
      const payrollTaxes = {
        employeeId,
        payrollPeriod,
        grossPay: payrollPeriod.grossPay,
        federalTaxes: await this.calculateFederalTaxes(employee, payrollPeriod, taxRates),
        stateTaxes: await this.calculateStateTaxes(employee, payrollPeriod, taxRates),
        localTaxes: await this.calculateLocalTaxes(employee, payrollPeriod, taxRates),
        ficaTaxes: await this.calculateFICATaxes(employee, payrollPeriod, taxRates),
        medicareTaxes: await this.calculateMedicareTaxes(employee, payrollPeriod, taxRates),
        unemploymentTaxes: await this.calculateUnemploymentTaxes(employee, payrollPeriod, taxRates),
        totalTaxes: 0, // Will be calculated
        netPay: 0 // Will be calculated
      };

      // Calculate totals
      payrollTaxes.totalTaxes = this.calculateTotalTaxes(payrollTaxes);
      payrollTaxes.netPay = payrollPeriod.grossPay - payrollTaxes.totalTaxes;

      // Store payroll tax calculation
      await prisma.payrollTaxCalculation.create({
        data: {
          id: uuidv4(),
          userId,
          employeeId,
          payrollPeriod: JSON.stringify(payrollPeriod),
          calculation: JSON.stringify(payrollTaxes),
          calculatedAt: new Date()
        }
      });

      return payrollTaxes;
    } catch (error) {
      throw new Error(`Failed to calculate payroll taxes: ${error.message}`);
    }
  }

  // Federal Tax Withholding
  async calculateFederalTaxes(employee: any, payrollPeriod: any, taxRates: any) {
    try {
      const federalTaxes = {
        incomeTax: this.calculateFederalIncomeTax(employee, payrollPeriod, taxRates),
        socialSecurity: this.calculateSocialSecurityTax(employee, payrollPeriod, taxRates),
        medicare: this.calculateMedicareTax(employee, payrollPeriod, taxRates),
        additionalMedicare: this.calculateAdditionalMedicareTax(employee, payrollPeriod, taxRates)
      };

      return federalTaxes;
    } catch (error) {
      throw new Error(`Failed to calculate federal taxes: ${error.message}`);
    }
  }

  // State Tax Withholding
  async calculateStateTaxes(employee: any, payrollPeriod: any, taxRates: any) {
    try {
      const stateTaxes = {
        incomeTax: this.calculateStateIncomeTax(employee, payrollPeriod, taxRates),
        disabilityInsurance: this.calculateDisabilityInsurance(employee, payrollPeriod, taxRates),
        otherStateTaxes: this.calculateOtherStateTaxes(employee, payrollPeriod, taxRates)
      };

      return stateTaxes;
    } catch (error) {
      throw new Error(`Failed to calculate state taxes: ${error.message}`);
    }
  }

  // Local Tax Withholding
  async calculateLocalTaxes(employee: any, payrollPeriod: any, taxRates: any) {
    try {
      const localTaxes = {
        cityTax: this.calculateCityTax(employee, payrollPeriod, taxRates),
        countyTax: this.calculateCountyTax(employee, payrollPeriod, taxRates),
        schoolDistrictTax: this.calculateSchoolDistrictTax(employee, payrollPeriod, taxRates),
        otherLocalTaxes: this.calculateOtherLocalTaxes(employee, payrollPeriod, taxRates)
      };

      return localTaxes;
    } catch (error) {
      throw new Error(`Failed to calculate local taxes: ${error.message}`);
    }
  }

  // FICA Tax Calculation
  async calculateFICATaxes(employee: any, payrollPeriod: any, taxRates: any) {
    try {
      const ficaTaxes = {
        socialSecurity: this.calculateSocialSecurityTax(employee, payrollPeriod, taxRates),
        medicare: this.calculateMedicareTax(employee, payrollPeriod, taxRates),
        totalFICA: 0 // Will be calculated
      };

      ficaTaxes.totalFICA = ficaTaxes.socialSecurity + ficaTaxes.medicare;

      return ficaTaxes;
    } catch (error) {
      throw new Error(`Failed to calculate FICA taxes: ${error.message}`);
    }
  }

  // Medicare Tax Calculation
  async calculateMedicareTaxes(employee: any, payrollPeriod: any, taxRates: any) {
    try {
      const medicareTaxes = {
        standardMedicare: this.calculateMedicareTax(employee, payrollPeriod, taxRates),
        additionalMedicare: this.calculateAdditionalMedicareTax(employee, payrollPeriod, taxRates),
        totalMedicare: 0 // Will be calculated
      };

      medicareTaxes.totalMedicare = medicareTaxes.standardMedicare + medicareTaxes.additionalMedicare;

      return medicareTaxes;
    } catch (error) {
      throw new Error(`Failed to calculate Medicare taxes: ${error.message}`);
    }
  }

  // Unemployment Tax Calculation
  async calculateUnemploymentTaxes(employee: any, payrollPeriod: any, taxRates: any) {
    try {
      const unemploymentTaxes = {
        federalUnemployment: this.calculateFederalUnemploymentTax(employee, payrollPeriod, taxRates),
        stateUnemployment: this.calculateStateUnemploymentTax(employee, payrollPeriod, taxRates),
        totalUnemployment: 0 // Will be calculated
      };

      unemploymentTaxes.totalUnemployment = unemploymentTaxes.federalUnemployment + unemploymentTaxes.stateUnemployment;

      return unemploymentTaxes;
    } catch (error) {
      throw new Error(`Failed to calculate unemployment taxes: ${error.message}`);
    }
  }

  // Quarterly Tax Filing Automation
  async generateQuarterlyTaxFiling(userId: string, quarter: string, year: number) {
    try {
      const quarterlyData = await this.getQuarterlyPayrollData(userId, quarter, year);
      const taxForms = await this.generateTaxForms(quarterlyData);
      
      const filing = {
        userId,
        quarter,
        year,
        forms: taxForms,
        totalWages: quarterlyData.totalWages,
        totalTaxes: quarterlyData.totalTaxes,
        employeeCount: quarterlyData.employeeCount,
        filingDeadline: this.getFilingDeadline(quarter, year),
        electronicFiling: this.supportsElectronicFiling(),
        status: 'generated'
      };

      // Store quarterly filing
      await prisma.quarterlyTaxFiling.create({
        data: {
          id: uuidv4(),
          userId,
          quarter,
          year,
          filing: JSON.stringify(filing),
          generatedAt: new Date()
        }
      });

      return filing;
    } catch (error) {
      throw new Error(`Failed to generate quarterly tax filing: ${error.message}`);
    }
  }

  // W-2 and W-3 Generation
  async generateW2Forms(userId: string, year: number) {
    try {
      const employees = await this.getEmployeesForYear(userId, year);
      const w2Forms = [];

      for (const employee of employees) {
        const w2Data = await this.generateW2Data(employee, year);
        w2Forms.push(w2Data);
      }

      const w3Summary = await this.generateW3Summary(w2Forms, year);

      const w2W3Package = {
        userId,
        year,
        w2Forms,
        w3Summary,
        totalEmployees: w2Forms.length,
        totalWages: w3Summary.totalWages,
        totalTaxes: w3Summary.totalTaxes,
        generatedAt: new Date()
      };

      // Store W-2/W-3 package
      await prisma.w2W3Package.create({
        data: {
          id: uuidv4(),
          userId,
          year,
          package: JSON.stringify(w2W3Package),
          generatedAt: new Date()
        }
      });

      return w2W3Package;
    } catch (error) {
      throw new Error(`Failed to generate W-2 forms: ${error.message}`);
    }
  }

  // State-Specific Payroll Compliance
  async checkStateCompliance(userId: string, state: string) {
    try {
      const compliance = {
        state,
        requirements: await this.getStateRequirements(state),
        currentCompliance: await this.getCurrentCompliance(userId, state),
        gaps: await this.identifyComplianceGaps(userId, state),
        recommendations: await this.getComplianceRecommendations(userId, state),
        deadlines: await this.getStateDeadlines(state),
        penalties: await this.getPotentialPenalties(userId, state)
      };

      // Store compliance check
      await prisma.stateComplianceCheck.create({
        data: {
          id: uuidv4(),
          userId,
          state,
          compliance: JSON.stringify(compliance),
          checkedAt: new Date()
        }
      });

      return compliance;
    } catch (error) {
      throw new Error(`Failed to check state compliance: ${error.message}`);
    }
  }

  // Payroll Tax Reporting Dashboard
  async getPayrollTaxDashboard(userId: string) {
    try {
      const dashboard = {
        currentQuarter: await this.getCurrentQuarterData(userId),
        yearToDate: await this.getYearToDateData(userId),
        upcomingDeadlines: await this.getUpcomingDeadlines(userId),
        complianceStatus: await this.getComplianceStatus(userId),
        taxLiability: await this.getTaxLiability(userId),
        employeeSummary: await this.getEmployeeSummary(userId),
        recommendations: await this.getDashboardRecommendations(userId)
      };

      return dashboard;
    } catch (error) {
      throw new Error(`Failed to get payroll tax dashboard: ${error.message}`);
    }
  }

  // Helper Methods
  private async getEmployeeData(employeeId: string): Promise<any> {
    // Simplified employee data retrieval
    return {
      id: employeeId,
      name: 'John Doe',
      state: 'CA',
      federalTaxStatus: 'married',
      exemptions: 2,
      salary: 60000,
      hourlyRate: 0,
      isHourly: false
    };
  }

  private async getTaxRates(state: string, federalTaxStatus: string): Promise<any> {
    // Simplified tax rates
    return {
      federal: {
        incomeTax: 0.22, // 22% bracket
        socialSecurity: 0.062,
        medicare: 0.0145,
        additionalMedicare: 0.009
      },
      state: {
        incomeTax: 0.05, // 5% state tax
        disabilityInsurance: 0.01
      },
      local: {
        cityTax: 0.01,
        countyTax: 0.005
      },
      unemployment: {
        federal: 0.006,
        state: 0.03
      }
    };
  }

  private calculateFederalIncomeTax(employee: any, payrollPeriod: any, taxRates: any): number {
    const annualSalary = employee.salary;
    const biweeklySalary = annualSalary / 26; // Assuming biweekly pay
    
    // Simplified federal tax calculation
    return biweeklySalary * taxRates.federal.incomeTax;
  }

  private calculateSocialSecurityTax(employee: any, payrollPeriod: any, taxRates: any): number {
    const grossPay = payrollPeriod.grossPay;
    const socialSecurityWageBase = 160200; // 2024 wage base
    const ytdWages = payrollPeriod.ytdWages || 0;
    
    const taxableWages = Math.min(grossPay, Math.max(0, socialSecurityWageBase - ytdWages));
    return taxableWages * taxRates.federal.socialSecurity;
  }

  private calculateMedicareTax(employee: any, payrollPeriod: any, taxRates: any): number {
    const grossPay = payrollPeriod.grossPay;
    return grossPay * taxRates.federal.medicare;
  }

  private calculateAdditionalMedicareTax(employee: any, payrollPeriod: any, taxRates: any): number {
    const grossPay = payrollPeriod.grossPay;
    const ytdWages = payrollPeriod.ytdWages || 0;
    const additionalMedicareThreshold = 250000; // For married filing jointly
    
    const excessWages = Math.max(0, (ytdWages + grossPay) - additionalMedicareThreshold);
    const currentPeriodExcess = Math.min(grossPay, excessWages);
    
    return currentPeriodExcess * taxRates.federal.additionalMedicare;
  }

  private calculateStateIncomeTax(employee: any, payrollPeriod: any, taxRates: any): number {
    const grossPay = payrollPeriod.grossPay;
    return grossPay * taxRates.state.incomeTax;
  }

  private calculateDisabilityInsurance(employee: any, payrollPeriod: any, taxRates: any): number {
    const grossPay = payrollPeriod.grossPay;
    return grossPay * taxRates.state.disabilityInsurance;
  }

  private calculateOtherStateTaxes(employee: any, payrollPeriod: any, taxRates: any): number {
    // Simplified other state taxes
    return 0;
  }

  private calculateCityTax(employee: any, payrollPeriod: any, taxRates: any): number {
    const grossPay = payrollPeriod.grossPay;
    return grossPay * taxRates.local.cityTax;
  }

  private calculateCountyTax(employee: any, payrollPeriod: any, taxRates: any): number {
    const grossPay = payrollPeriod.grossPay;
    return grossPay * taxRates.local.countyTax;
  }

  private calculateSchoolDistrictTax(employee: any, payrollPeriod: any, taxRates: any): number {
    // Simplified school district tax
    return 0;
  }

  private calculateOtherLocalTaxes(employee: any, payrollPeriod: any, taxRates: any): number {
    // Simplified other local taxes
    return 0;
  }

  private calculateFederalUnemploymentTax(employee: any, payrollPeriod: any, taxRates: any): number {
    const grossPay = payrollPeriod.grossPay;
    const federalUnemploymentWageBase = 7000;
    const ytdWages = payrollPeriod.ytdWages || 0;
    
    const taxableWages = Math.min(grossPay, Math.max(0, federalUnemploymentWageBase - ytdWages));
    return taxableWages * taxRates.unemployment.federal;
  }

  private calculateStateUnemploymentTax(employee: any, payrollPeriod: any, taxRates: any): number {
    const grossPay = payrollPeriod.grossPay;
    const stateUnemploymentWageBase = 7000;
    const ytdWages = payrollPeriod.ytdWages || 0;
    
    const taxableWages = Math.min(grossPay, Math.max(0, stateUnemploymentWageBase - ytdWages));
    return taxableWages * taxRates.unemployment.state;
  }

  private calculateTotalTaxes(payrollTaxes: any): number {
    let total = 0;
    
    // Federal taxes
    total += payrollTaxes.federalTaxes.incomeTax;
    total += payrollTaxes.federalTaxes.socialSecurity;
    total += payrollTaxes.federalTaxes.medicare;
    total += payrollTaxes.federalTaxes.additionalMedicare;
    
    // State taxes
    total += payrollTaxes.stateTaxes.incomeTax;
    total += payrollTaxes.stateTaxes.disabilityInsurance;
    total += payrollTaxes.stateTaxes.otherStateTaxes;
    
    // Local taxes
    total += payrollTaxes.localTaxes.cityTax;
    total += payrollTaxes.localTaxes.countyTax;
    total += payrollTaxes.localTaxes.schoolDistrictTax;
    total += payrollTaxes.localTaxes.otherLocalTaxes;
    
    // Unemployment taxes
    total += payrollTaxes.unemploymentTaxes.federalUnemployment;
    total += payrollTaxes.unemploymentTaxes.stateUnemployment;
    
    return total;
  }

  private async getQuarterlyPayrollData(userId: string, quarter: string, year: number): Promise<any> {
    // Simplified quarterly data retrieval
    return {
      totalWages: 150000,
      totalTaxes: 30000,
      employeeCount: 5,
      quarter,
      year
    };
  }

  private async generateTaxForms(quarterlyData: any): Promise<any[]> {
    // Simplified tax form generation
    return [
      { form: 'Form 941', description: 'Employer\'s Quarterly Federal Tax Return' },
      { form: 'Form 940', description: 'Employer\'s Annual Federal Unemployment Tax Return' }
    ];
  }

  private getFilingDeadline(quarter: string, year: number): string {
    const deadlines = {
      'Q1': `${year}-04-30`,
      'Q2': `${year}-07-31`,
      'Q3': `${year}-10-31`,
      'Q4': `${year + 1}-01-31`
    };
    
    return deadlines[quarter] || `${year}-04-30`;
  }

  private supportsElectronicFiling(): boolean {
    return true;
  }

  private async getEmployeesForYear(userId: string, year: number): Promise<any[]> {
    // Simplified employee retrieval
    return [
      { id: 'emp1', name: 'John Doe', salary: 60000 },
      { id: 'emp2', name: 'Jane Smith', salary: 70000 }
    ];
  }

  private async generateW2Data(employee: any, year: number): Promise<any> {
    // Simplified W-2 data generation
    return {
      employeeId: employee.id,
      employeeName: employee.name,
      wages: employee.salary,
      federalIncomeTax: employee.salary * 0.15,
      socialSecurityWages: employee.salary,
      socialSecurityTax: employee.salary * 0.062,
      medicareWages: employee.salary,
      medicareTax: employee.salary * 0.0145,
      year
    };
  }

  private async generateW3Summary(w2Forms: any[], year: number): Promise<any> {
    // Simplified W-3 summary generation
    const totalWages = w2Forms.reduce((sum, w2) => sum + w2.wages, 0);
    const totalTaxes = w2Forms.reduce((sum, w2) => sum + w2.federalIncomeTax, 0);
    
    return {
      year,
      totalWages,
      totalTaxes,
      employeeCount: w2Forms.length
    };
  }

  private async getStateRequirements(state: string): Promise<any> {
    // Simplified state requirements
    return {
      unemploymentInsurance: true,
      disabilityInsurance: state === 'CA',
      workersCompensation: true,
      stateIncomeTax: true
    };
  }

  private async getCurrentCompliance(userId: string, state: string): Promise<any> {
    // Simplified current compliance
    return {
      unemploymentInsurance: true,
      disabilityInsurance: true,
      workersCompensation: true,
      stateIncomeTax: true
    };
  }

  private async identifyComplianceGaps(userId: string, state: string): Promise<any[]> {
    // Simplified compliance gap identification
    return [];
  }

  private async getComplianceRecommendations(userId: string, state: string): Promise<any[]> {
    // Simplified compliance recommendations
    return [
      { type: 'filing', description: 'File quarterly unemployment insurance reports', priority: 'high' }
    ];
  }

  private async getStateDeadlines(state: string): Promise<any[]> {
    // Simplified state deadlines
    return [
      { type: 'Unemployment Insurance', dueDate: '2024-01-31', frequency: 'Quarterly' }
    ];
  }

  private async getPotentialPenalties(userId: string, state: string): Promise<any[]> {
    // Simplified penalty assessment
    return [];
  }

  // Dashboard helper methods
  private async getCurrentQuarterData(userId: string): Promise<any> {
    return { quarter: 'Q4', wages: 50000, taxes: 10000 };
  }

  private async getYearToDateData(userId: string): Promise<any> {
    return { wages: 200000, taxes: 40000 };
  }

  private async getUpcomingDeadlines(userId: string): Promise<any[]> {
    return [
      { type: 'Form 941', dueDate: '2024-01-31', status: 'upcoming' }
    ];
  }

  private async getComplianceStatus(userId: string): Promise<any> {
    return { overall: 'compliant', issues: 0 };
  }

  private async getTaxLiability(userId: string): Promise<any> {
    return { current: 5000, estimated: 20000 };
  }

  private async getEmployeeSummary(userId: string): Promise<any> {
    return { total: 5, active: 5, terminated: 0 };
  }

  private async getDashboardRecommendations(userId: string): Promise<any[]> {
    return [
      { type: 'filing', description: 'File quarterly reports on time', priority: 'medium' }
    ];
  }
}

export default new PayrollTaxService();










