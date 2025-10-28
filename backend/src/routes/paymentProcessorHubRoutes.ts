import { Router } from 'express';
import paymentProcessorHubController from '../controllers/paymentProcessorHubController';

const router = Router();

// Payment Processor Processing
router.post('/stripe/:userId', paymentProcessorHubController.processStripeTransactions);
router.post('/paypal/:userId', paymentProcessorHubController.processPayPalTransactions);
router.post('/square/:userId', paymentProcessorHubController.processSquareTransactions);
router.post('/braintree/:userId', paymentProcessorHubController.processBraintreeTransactions);

// Dashboard and Analytics
router.get('/dashboard/:userId', paymentProcessorHubController.getPaymentProcessorDashboard);
router.get('/analytics/:userId', paymentProcessorHubController.getProcessorAnalytics);

// Fee Reconciliation
router.post('/reconcile-fees/:userId', paymentProcessorHubController.reconcileProcessorFees);

// Multi-Processor Matching
router.post('/match/:userId', paymentProcessorHubController.matchMultiProcessorTransactions);

export default router;










