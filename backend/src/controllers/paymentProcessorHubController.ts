import { Request, Response } from 'express';
import paymentProcessorHubService from '../services/paymentProcessorHubService';

export class PaymentProcessorHubController {
  // Process Stripe Transactions
  async processStripeTransactions(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const stripeData = req.body;

      const result = await paymentProcessorHubService.processStripeTransactions(
        userId,
        stripeData
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

  // Process PayPal Transactions
  async processPayPalTransactions(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const paypalData = req.body;

      const result = await paymentProcessorHubService.processPayPalTransactions(
        userId,
        paypalData
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

  // Process Square Transactions
  async processSquareTransactions(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const squareData = req.body;

      const result = await paymentProcessorHubService.processSquareTransactions(
        userId,
        squareData
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

  // Process Braintree Transactions
  async processBraintreeTransactions(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const braintreeData = req.body;

      const result = await paymentProcessorHubService.processBraintreeTransactions(
        userId,
        braintreeData
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

  // Get Payment Processor Dashboard
  async getPaymentProcessorDashboard(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const result = await paymentProcessorHubService.getPaymentProcessorDashboard(userId);

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

  // Reconcile Processor Fees
  async reconcileProcessorFees(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { period } = req.body;

      const result = await paymentProcessorHubService.reconcileProcessorFees(
        userId,
        period
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

  // Match Multi-Processor Transactions
  async matchMultiProcessorTransactions(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { transactions } = req.body;

      const result = await paymentProcessorHubService.matchMultiProcessorTransactions(
        userId,
        transactions
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

  // Get Processor Analytics
  async getProcessorAnalytics(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { period } = req.query;

      const result = await paymentProcessorHubService.getProcessorAnalytics(
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

export default new PaymentProcessorHubController();






