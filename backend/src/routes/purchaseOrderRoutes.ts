import { Router } from 'express';
import purchaseOrderController from '../controllers/purchaseOrderController';

const router = Router();

// Purchase Order Management
router.post('/create/:userId', purchaseOrderController.createPurchaseOrder);
router.post('/submit-approval/:poId', purchaseOrderController.submitForApproval);

// PO Matching
router.post('/match-bill/:poId/:billId', purchaseOrderController.matchPOToBill);
router.post('/three-way-match/:poId/:receiptId/:billId', purchaseOrderController.performThreeWayMatching);

// Vendor Portal
router.post('/vendor-portal/:vendorId', purchaseOrderController.createVendorPortal);

// PO Templates
router.post('/template/:userId', purchaseOrderController.createPOTemplate);

// Dashboard and Analytics
router.get('/dashboard/:userId', purchaseOrderController.getPODashboard);
router.get('/analytics/:userId', purchaseOrderController.getPOAnalytics);

export default router;






