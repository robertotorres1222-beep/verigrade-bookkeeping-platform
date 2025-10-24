import { Router } from 'express';
import globalTaxController from '../controllers/globalTaxController';

const router = Router();

// Economic Nexus
router.get('/nexus/:userId', globalTaxController.monitorEconomicNexus);

// DST Compliance
router.get('/dst/:userId', globalTaxController.checkDSTCompliance);

// Reverse Charge
router.post('/reverse-charge/:userId', globalTaxController.detectReverseCharge);

// VAT Calculation
router.post('/vat/:userId', globalTaxController.calculateVATByLocation);

// Tax Optimization
router.get('/optimization/:userId', globalTaxController.generateTaxOptimizationSuggestions);

// Sales Tax
router.post('/sales-tax/:userId', globalTaxController.calculateSalesTaxByJurisdiction);

// Filing Deadlines
router.get('/deadlines/:userId', globalTaxController.trackTaxFilingDeadlines);

// Tax Forms
router.post('/forms/:userId', globalTaxController.generateTaxForms);

// Dashboard
router.get('/dashboard/:userId', globalTaxController.getGlobalTaxDashboard);

export default router;







