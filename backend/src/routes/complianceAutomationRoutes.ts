import { Router } from 'express';
import complianceAutomationController from '../controllers/complianceAutomationController';

const router = Router();

// Industry Compliance
router.get('/industry/:userId', complianceAutomationController.checkIndustryCompliance);

// Compliance Reports
router.post('/report/:userId', complianceAutomationController.generateComplianceReport);

// Regulatory Tracking
router.post('/regulatory/:userId', complianceAutomationController.trackRegulatoryChanges);

// Compliance Scorecard
router.get('/scorecard/:userId', complianceAutomationController.generateComplianceScorecard);

// Audit Preparation
router.post('/audit/:userId', complianceAutomationController.prepareAuditMaterials);

// Specific Compliance Standards
router.get('/soc2/:userId', complianceAutomationController.checkSOC2Compliance);
router.get('/gdpr/:userId', complianceAutomationController.checkGDPRCompliance);
router.get('/pci/:userId', complianceAutomationController.checkPCIDSSCompliance);

// Dashboard
router.get('/dashboard/:userId', complianceAutomationController.getComplianceDashboard);

export default router;







