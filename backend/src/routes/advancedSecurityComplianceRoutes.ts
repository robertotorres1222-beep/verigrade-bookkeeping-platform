import { Router } from 'express';
import { advancedSecurityComplianceController } from '../controllers/advancedSecurityComplianceController';

const router = Router();

// Security Scanning Routes
router.post('/security-scans', advancedSecurityComplianceController.createSecurityScan);
router.get('/security-scans', advancedSecurityComplianceController.getSecurityScans);
router.post('/security-scans/:id/run', advancedSecurityComplianceController.runSecurityScan);

// Compliance Framework Management Routes
router.post('/compliance-frameworks', advancedSecurityComplianceController.createComplianceFramework);
router.get('/compliance-frameworks', advancedSecurityComplianceController.getComplianceFrameworks);

// Compliance Assessment Management Routes
router.post('/compliance-assessments', advancedSecurityComplianceController.createComplianceAssessment);
router.get('/compliance-assessments', advancedSecurityComplianceController.getComplianceAssessments);

// Security Controls Management Routes
router.post('/security-controls', advancedSecurityComplianceController.createSecurityControl);
router.get('/security-controls', advancedSecurityComplianceController.getSecurityControls);

// Security Incident Management Routes
router.post('/security-incidents', advancedSecurityComplianceController.createSecurityIncident);
router.get('/security-incidents', advancedSecurityComplianceController.getSecurityIncidents);

// Data Subject Request Management Routes
router.post('/data-subject-requests', advancedSecurityComplianceController.createDataSubjectRequest);
router.get('/data-subject-requests', advancedSecurityComplianceController.getDataSubjectRequests);

// Privacy Impact Assessment Management Routes
router.post('/privacy-impact-assessments', advancedSecurityComplianceController.createPrivacyImpactAssessment);
router.get('/privacy-impact-assessments', advancedSecurityComplianceController.getPrivacyImpactAssessments);

// Security Training Management Routes
router.post('/security-trainings', advancedSecurityComplianceController.createSecurityTraining);
router.get('/security-trainings', advancedSecurityComplianceController.getSecurityTrainings);

// Security Training Record Management Routes
router.post('/security-training-records', advancedSecurityComplianceController.createSecurityTrainingRecord);
router.get('/security-training-records', advancedSecurityComplianceController.getSecurityTrainingRecords);

// Analytics and Reporting Routes
router.get('/analytics', advancedSecurityComplianceController.getSecurityComplianceAnalytics);

export default router;




