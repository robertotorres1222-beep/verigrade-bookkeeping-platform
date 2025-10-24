import { Router } from 'express';
import salesTaxController from '../controllers/salesTaxController';

const router = Router();

// Sales Tax Calculation
router.post('/calculate/:userId', salesTaxController.calculateSalesTax);
router.post('/rates-by-address', salesTaxController.getTaxRatesByAddress);

// Product Taxability
router.get('/product-rules/:productId', salesTaxController.getProductTaxabilityRules);

// Tax Exemptions
router.post('/exemption/:userId', salesTaxController.processTaxExemption);

// Tax Liability and Filing
router.post('/liability/:userId', salesTaxController.trackTaxLiability);
router.post('/filing/:userId', salesTaxController.automateSalesTaxFiling);

// Dashboard and Analytics
router.get('/dashboard/:userId', salesTaxController.getSalesTaxDashboard);
router.get('/analytics/:userId', salesTaxController.getSalesTaxAnalytics);

export default router;