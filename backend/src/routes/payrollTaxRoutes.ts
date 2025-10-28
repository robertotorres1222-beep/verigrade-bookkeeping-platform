import { Router } from 'express';
import payrollTaxController from '../controllers/payrollTaxController';

const router = Router();

// Payroll Tax Calculations
router.post('/calculate/:userId/:employeeId', payrollTaxController.calculatePayrollTaxes);
router.post('/federal/:userId', payrollTaxController.calculateFederalTaxes);
router.post('/state/:userId', payrollTaxController.calculateStateTaxes);
router.post('/local/:userId', payrollTaxController.calculateLocalTaxes);
router.post('/fica/:userId', payrollTaxController.calculateFICATaxes);
router.post('/medicare/:userId', payrollTaxController.calculateMedicareTaxes);
router.post('/unemployment/:userId', payrollTaxController.calculateUnemploymentTaxes);

// Tax Filing
router.post('/quarterly/:userId', payrollTaxController.generateQuarterlyTaxFiling);
router.post('/w2/:userId', payrollTaxController.generateW2Forms);

// Compliance
router.get('/state-compliance/:userId', payrollTaxController.checkStateCompliance);

// Dashboard
router.get('/dashboard/:userId', payrollTaxController.getPayrollTaxDashboard);

export default router;










