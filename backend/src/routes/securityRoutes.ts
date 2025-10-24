import { Router } from 'express';
import { securityController } from '../controllers/securityController';

const router = Router();

// SOC 2 Documentation
router.get('/soc2/docs', securityController.generateSOC2Docs);
router.post('/soc2/evidence', securityController.collectSOC2Evidence);

// GDPR Tools
router.post('/gdpr/implement', securityController.implementGDPRTools);
router.get('/gdpr/status', securityController.getGDPRStatus);

// PCI Compliance
router.post('/pci/ensure', securityController.ensurePCICompliance);
router.get('/pci/status', securityController.getPCIStatus);

// Penetration Testing
router.post('/penetration-test', securityController.runPenetrationTest);
router.get('/penetration-test/results', securityController.getPenetrationTestResults);

// Audit Trails
router.post('/audit-trail', securityController.createAuditTrail);
router.get('/audit-trail', securityController.getAuditTrails);

export default router;