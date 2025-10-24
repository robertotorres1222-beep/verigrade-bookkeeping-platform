import { Request, Response } from 'express';
import payrollTaxService from '../services/payrollTaxService';

export class PayrollTaxController {
  // Calculate Payroll Taxes
  async calculatePayrollTaxes(req: Request, res: Response) {
    try {
      const { userId, employeeId } = req.params;
      const payrollPeriod = req.body;

      const result = await payrollTaxService.calculatePayrollTaxes(
        userId,
        employeeId,
        payrollPeriod
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Calculate Federal Taxes
  async calculateFederalTaxes(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { employee, payrollPeriod, taxRates } = req.body;

      const result = await payrollTaxService.calculateFederalTaxes(
        employee,
        payrollPeriod,
        taxRates
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Calculate State Taxes
  async calculateStateTaxes(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { employee, payrollPeriod, taxRates } = req.body;

      const result = await payrollTaxService.calculateStateTaxes(
        employee,
        payrollPeriod,
        taxRates
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Calculate Local Taxes
  async calculateLocalTaxes(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { employee, payrollPeriod, taxRates } = req.body;

      const result = await payrollTaxService.calculateLocalTaxes(
        employee,
        payrollPeriod,
        taxRates
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Calculate FICA Taxes
  async calculateFICATaxes(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { employee, payrollPeriod, taxRates } = req.body;

      const result = await payrollTaxService.calculateFICATaxes(
        employee,
        payrollPeriod,
        taxRates
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Calculate Medicare Taxes
  async calculateMedicareTaxes(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { employee, payrollPeriod, taxRates } = req.body;

      const result = await payrollTaxService.calculateMedicareTaxes(
        employee,
        payrollPeriod,
        taxRates
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Calculate Unemployment Taxes
  async calculateUnemploymentTaxes(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { employee, payrollPeriod, taxRates } = req.body;

      const result = await payrollTaxService.calculateUnemploymentTaxes(
        employee,
        payrollPeriod,
        taxRates
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Generate Quarterly Tax Filing
  async generateQuarterlyTaxFiling(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { quarter, year } = req.body;

      const result = await payrollTaxService.generateQuarterlyTaxFiling(
        userId,
        quarter,
        year
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Generate W-2 Forms
  async generateW2Forms(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { year } = req.body;

      const result = await payrollTaxService.generateW2Forms(
        userId,
        year
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Check State Compliance
  async checkStateCompliance(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { state } = req.query;

      const result = await payrollTaxService.checkStateCompliance(
        userId,
        state as string
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get Payroll Tax Dashboard
  async getPayrollTaxDashboard(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const result = await payrollTaxService.getPayrollTaxDashboard(userId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default new PayrollTaxController();







