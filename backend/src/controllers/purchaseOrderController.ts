import { Request, Response } from 'express';
import purchaseOrderService from '../services/purchaseOrderService';

export class PurchaseOrderController {
  // Create Purchase Order
  async createPurchaseOrder(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const poData = req.body;

      const result = await purchaseOrderService.createPurchaseOrder(
        userId,
        poData
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

  // Submit for Approval
  async submitForApproval(req: Request, res: Response) {
    try {
      const { poId } = req.params;
      const approvalData = req.body;

      const result = await purchaseOrderService.submitForApproval(
        poId,
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

  // Match PO to Bill
  async matchPOToBill(req: Request, res: Response) {
    try {
      const { poId, billId } = req.params;

      const result = await purchaseOrderService.matchPOToBill(
        poId,
        billId
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

  // Create Vendor Portal
  async createVendorPortal(req: Request, res: Response) {
    try {
      const { vendorId } = req.params;
      const portalData = req.body;

      const result = await purchaseOrderService.createVendorPortal(
        vendorId,
        portalData
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

  // Create PO Template
  async createPOTemplate(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const templateData = req.body;

      const result = await purchaseOrderService.createPOTemplate(
        userId,
        templateData
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

  // Perform Three-way Matching
  async performThreeWayMatching(req: Request, res: Response) {
    try {
      const { poId, receiptId, billId } = req.params;

      const result = await purchaseOrderService.performThreeWayMatching(
        poId,
        receiptId,
        billId
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

  // Get PO Dashboard
  async getPODashboard(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const result = await purchaseOrderService.getPODashboard(userId);

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

  // Get PO Analytics
  async getPOAnalytics(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { period } = req.query;

      const result = await purchaseOrderService.getPOAnalytics(
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

export default new PurchaseOrderController();










