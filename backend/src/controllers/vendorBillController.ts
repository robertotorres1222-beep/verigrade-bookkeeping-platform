import { Request, Response } from 'express';
import vendorBillService from '../services/vendorBillService';

export class VendorBillController {
  // Capture Bill
  async captureBill(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const billData = req.body;

      const result = await vendorBillService.captureBill(
        userId,
        billData
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

  // Submit Bill for Approval
  async submitBillForApproval(req: Request, res: Response) {
    try {
      const { billId } = req.params;
      const approvalData = req.body;

      const result = await vendorBillService.submitBillForApproval(
        billId,
        approvalData
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

  // Schedule Bill Payment
  async scheduleBillPayment(req: Request, res: Response) {
    try {
      const { billId } = req.params;
      const paymentData = req.body;

      const result = await vendorBillService.scheduleBillPayment(
        billId,
        paymentData
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

  // Get Vendor Payment History
  async getVendorPaymentHistory(req: Request, res: Response) {
    try {
      const { vendorId } = req.params;
      const { period } = req.query;

      const result = await vendorBillService.getVendorPaymentHistory(
        vendorId,
        period as any
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

  // Track Early Payment Discounts
  async trackEarlyPaymentDiscounts(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { period } = req.query;

      const result = await vendorBillService.trackEarlyPaymentDiscounts(
        userId,
        period as any
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

  // Generate Bill Aging Report
  async generateBillAgingReport(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const reportData = req.body;

      const result = await vendorBillService.generateBillAgingReport(
        userId,
        reportData
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

  // Get Bill Management Dashboard
  async getBillManagementDashboard(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const result = await vendorBillService.getBillManagementDashboard(userId);

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

  // Get Bill Analytics
  async getBillAnalytics(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { period } = req.query;

      const result = await vendorBillService.getBillAnalytics(
        userId,
        period as any
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
}

export default new VendorBillController();






