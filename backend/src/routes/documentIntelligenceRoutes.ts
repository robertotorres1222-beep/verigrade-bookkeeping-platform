import express from 'express';
import documentIntelligenceController from '../controllers/documentIntelligenceController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route POST /api/ai/document/extract
 * @desc Extract data from document using AI
 * @access Private
 */
router.post('/extract', documentIntelligenceController.extractDocumentData);

/**
 * @route POST /api/ai/document/classify
 * @desc Classify document type
 * @access Private
 */
router.post('/classify', documentIntelligenceController.classifyDocument);

/**
 * @route POST /api/ai/document/vendor-info
 * @desc Extract vendor information from document
 * @access Private
 */
router.post('/vendor-info', documentIntelligenceController.extractVendorInfo);

/**
 * @route POST /api/ai/contract/analyze
 * @desc Analyze contract for revenue recognition
 * @access Private
 */
router.post('/contract/analyze', documentIntelligenceController.analyzeContract);

/**
 * @route POST /api/ai/contract/performance-obligations
 * @desc Extract performance obligations from contract
 * @access Private
 */
router.post('/contract/performance-obligations', documentIntelligenceController.extractPerformanceObligations);

/**
 * @route POST /api/ai/contract/modifications
 * @desc Detect contract modifications
 * @access Private
 */
router.post('/contract/modifications', documentIntelligenceController.detectContractModifications);

/**
 * @route POST /api/ai/contract/renewal-terms
 * @desc Identify renewal terms in contract
 * @access Private
 */
router.post('/contract/renewal-terms', documentIntelligenceController.identifyRenewalTerms);

/**
 * @route POST /api/ai/contract/flag-terms
 * @desc Flag non-standard contract terms
 * @access Private
 */
router.post('/contract/flag-terms', documentIntelligenceController.flagNonStandardTerms);

/**
 * @route POST /api/ai/vendor/details
 * @desc Extract vendor details from document
 * @access Private
 */
router.post('/vendor/details', documentIntelligenceController.extractVendorDetails);

/**
 * @route POST /api/ai/vendor/payment-terms
 * @desc Detect payment terms from document
 * @access Private
 */
router.post('/vendor/payment-terms', documentIntelligenceController.detectPaymentTerms);

/**
 * @route GET /api/ai/vendor/relationships/:userId
 * @desc Analyze vendor relationships
 * @access Private
 */
router.get('/vendor/relationships/:userId', documentIntelligenceController.analyzeVendorRelationships);

/**
 * @route POST /api/ai/vendor/enrich
 * @desc Enrich vendor profile with external data
 * @access Private
 */
router.post('/vendor/enrich', documentIntelligenceController.enrichVendorProfile);

/**
 * @route GET /api/ai/vendor/recommendations/:userId
 * @desc Get vendor recommendations
 * @access Private
 */
router.get('/vendor/recommendations/:userId', documentIntelligenceController.getVendorRecommendations);

/**
 * @route GET /api/ai/document/history/:userId
 * @desc Get document extraction history
 * @access Private
 */
router.get('/document/history/:userId', documentIntelligenceController.getExtractionHistory);

/**
 * @route GET /api/ai/contract/history/:userId
 * @desc Get contract analysis history
 * @access Private
 */
router.get('/contract/history/:userId', documentIntelligenceController.getContractAnalysisHistory);

export default router;






