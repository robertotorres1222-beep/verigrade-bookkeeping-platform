import { Router } from 'express';
import vendorBillController from '../controllers/vendorBillController';

const router = Router();

// Bill Management
router.post('/capture/:userId', vendorBillController.captureBill);
router.post('/submit-approval/:billId', vendorBillController.submitBillForApproval);
router.post('/schedule-payment/:billId', vendorBillController.scheduleBillPayment);

// Payment History and Discounts
router.get('/payment-history/:vendorId', vendorBillController.getVendorPaymentHistory);
router.get('/discounts/:userId', vendorBillController.trackEarlyPaymentDiscounts);

// Reports
router.post('/aging-report/:userId', vendorBillController.generateBillAgingReport);

// Dashboard and Analytics
router.get('/dashboard/:userId', vendorBillController.getBillManagementDashboard);
router.get('/analytics/:userId', vendorBillController.getBillAnalytics);

export default router;







