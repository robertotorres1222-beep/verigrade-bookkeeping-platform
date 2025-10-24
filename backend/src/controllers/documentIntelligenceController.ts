import { Request, Response } from 'express';
import DocumentIntelligenceService from '../services/documentIntelligenceService';
import ContractIntelligenceService from '../services/contractIntelligenceService';
import VendorIntelligenceService from '../services/vendorIntelligenceService';

const documentIntelligenceService = new DocumentIntelligenceService();
const contractIntelligenceService = new ContractIntelligenceService();
const vendorIntelligenceService = new VendorIntelligenceService();

/**
 * Extract data from document
 */
export const extractDocumentData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { imageData, documentType } = req.body;

    if (!imageData) {
      res.status(400).json({ error: 'Image data is required' });
      return;
    }

    // Convert base64 image data to buffer
    const imageBuffer = Buffer.from(imageData, 'base64');
    
    // Extract document data
    const extractedData = await documentIntelligenceService.extractDocumentData(
      imageBuffer, 
      documentType
    );

    // Validate extracted data
    const validation = await documentIntelligenceService.validateExtractedData(extractedData);
    
    // Calculate confidence score
    const confidenceScore = documentIntelligenceService.calculateConfidenceScore(extractedData);

    res.json({
      extractedData,
      validation,
      confidenceScore,
      success: true
    });

  } catch (error) {
    console.error('Error extracting document data:', error);
    res.status(500).json({ 
      error: 'Failed to extract document data',
      success: false 
    });
  }
};

/**
 * Classify document type
 */
export const classifyDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { imageData } = req.body;

    if (!imageData) {
      res.status(400).json({ error: 'Image data is required' });
      return;
    }

    const imageBuffer = Buffer.from(imageData, 'base64');
    const classification = await documentIntelligenceService.classifyDocument(imageBuffer);

    res.json({
      classification,
      success: true
    });

  } catch (error) {
    console.error('Error classifying document:', error);
    res.status(500).json({ 
      error: 'Failed to classify document',
      success: false 
    });
  }
};

/**
 * Extract vendor information from document
 */
export const extractVendorInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { imageData } = req.body;

    if (!imageData) {
      res.status(400).json({ error: 'Image data is required' });
      return;
    }

    const imageBuffer = Buffer.from(imageData, 'base64');
    const vendorInfo = await documentIntelligenceService.extractVendorInfo(imageBuffer);

    res.json({
      vendorInfo,
      success: true
    });

  } catch (error) {
    console.error('Error extracting vendor info:', error);
    res.status(500).json({ 
      error: 'Failed to extract vendor info',
      success: false 
    });
  }
};

/**
 * Analyze contract
 */
export const analyzeContract = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { contractText, contractType } = req.body;

    if (!contractText) {
      res.status(400).json({ error: 'Contract text is required' });
      return;
    }

    const analysis = await contractIntelligenceService.analyzeContract(
      contractText, 
      contractType
    );

    // Store analysis in database
    await contractIntelligenceService.storeContractAnalysis(
      userId,
      analysis.contractId,
      analysis
    );

    // Generate revenue recognition schedule
    const revenueSchedule = await contractIntelligenceService.generateRevenueRecognitionSchedule(analysis);

    // Calculate risk and compliance scores
    const riskScore = contractIntelligenceService.calculateRiskScore(analysis);
    const complianceScore = contractIntelligenceService.calculateComplianceScore(analysis);

    res.json({
      analysis,
      revenueSchedule,
      riskScore,
      complianceScore,
      success: true
    });

  } catch (error) {
    console.error('Error analyzing contract:', error);
    res.status(500).json({ 
      error: 'Failed to analyze contract',
      success: false 
    });
  }
};

/**
 * Extract performance obligations from contract
 */
export const extractPerformanceObligations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { contractText } = req.body;

    if (!contractText) {
      res.status(400).json({ error: 'Contract text is required' });
      return;
    }

    const obligations = await contractIntelligenceService.extractPerformanceObligations(contractText);

    res.json({
      obligations,
      success: true
    });

  } catch (error) {
    console.error('Error extracting performance obligations:', error);
    res.status(500).json({ 
      error: 'Failed to extract performance obligations',
      success: false 
    });
  }
};

/**
 * Detect contract modifications
 */
export const detectContractModifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const { originalContract, modifiedContract } = req.body;

    if (!originalContract || !modifiedContract) {
      res.status(400).json({ error: 'Both original and modified contract text are required' });
      return;
    }

    const modifications = await contractIntelligenceService.detectContractModifications(
      originalContract,
      modifiedContract
    );

    res.json({
      modifications,
      success: true
    });

  } catch (error) {
    console.error('Error detecting contract modifications:', error);
    res.status(500).json({ 
      error: 'Failed to detect contract modifications',
      success: false 
    });
  }
};

/**
 * Identify renewal terms in contract
 */
export const identifyRenewalTerms = async (req: Request, res: Response): Promise<void> => {
  try {
    const { contractText } = req.body;

    if (!contractText) {
      res.status(400).json({ error: 'Contract text is required' });
      return;
    }

    const renewalTerms = await contractIntelligenceService.identifyRenewalTerms(contractText);

    res.json({
      renewalTerms,
      success: true
    });

  } catch (error) {
    console.error('Error identifying renewal terms:', error);
    res.status(500).json({ 
      error: 'Failed to identify renewal terms',
      success: false 
    });
  }
};

/**
 * Flag non-standard contract terms
 */
export const flagNonStandardTerms = async (req: Request, res: Response): Promise<void> => {
  try {
    const { contractText } = req.body;

    if (!contractText) {
      res.status(400).json({ error: 'Contract text is required' });
      return;
    }

    const flaggedTerms = await contractIntelligenceService.flagNonStandardTerms(contractText);

    res.json({
      flaggedTerms,
      success: true
    });

  } catch (error) {
    console.error('Error flagging non-standard terms:', error);
    res.status(500).json({ 
      error: 'Failed to flag non-standard terms',
      success: false 
    });
  }
};

/**
 * Extract vendor details from document
 */
export const extractVendorDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { documentText } = req.body;

    if (!documentText) {
      res.status(400).json({ error: 'Document text is required' });
      return;
    }

    const vendorDetails = await vendorIntelligenceService.extractVendorDetails(documentText);

    res.json({
      vendorDetails,
      success: true
    });

  } catch (error) {
    console.error('Error extracting vendor details:', error);
    res.status(500).json({ 
      error: 'Failed to extract vendor details',
      success: false 
    });
  }
};

/**
 * Detect payment terms from document
 */
export const detectPaymentTerms = async (req: Request, res: Response): Promise<void> => {
  try {
    const { documentText } = req.body;

    if (!documentText) {
      res.status(400).json({ error: 'Document text is required' });
      return;
    }

    const paymentTerms = await vendorIntelligenceService.detectPaymentTerms(documentText);

    res.json({
      paymentTerms,
      success: true
    });

  } catch (error) {
    console.error('Error detecting payment terms:', error);
    res.status(500).json({ 
      error: 'Failed to detect payment terms',
      success: false 
    });
  }
};

/**
 * Analyze vendor relationships
 */
export const analyzeVendorRelationships = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const relationships = await vendorIntelligenceService.analyzeVendorRelationships(userId);

    res.json({
      relationships,
      success: true
    });

  } catch (error) {
    console.error('Error analyzing vendor relationships:', error);
    res.status(500).json({ 
      error: 'Failed to analyze vendor relationships',
      success: false 
    });
  }
};

/**
 * Enrich vendor profile
 */
export const enrichVendorProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { vendorName } = req.body;

    if (!vendorName) {
      res.status(400).json({ error: 'Vendor name is required' });
      return;
    }

    const enrichment = await vendorIntelligenceService.enrichVendorProfile(vendorName);

    res.json({
      enrichment,
      success: true
    });

  } catch (error) {
    console.error('Error enriching vendor profile:', error);
    res.status(500).json({ 
      error: 'Failed to enrich vendor profile',
      success: false 
    });
  }
};

/**
 * Get vendor recommendations
 */
export const getVendorRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const recommendations = await vendorIntelligenceService.getVendorRecommendations(userId);

    res.json({
      recommendations,
      success: true
    });

  } catch (error) {
    console.error('Error getting vendor recommendations:', error);
    res.status(500).json({ 
      error: 'Failed to get vendor recommendations',
      success: false 
    });
  }
};

/**
 * Get extraction history
 */
export const getExtractionHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { limit = 20 } = req.query;

    const history = await documentIntelligenceService.getExtractionHistory(
      userId, 
      parseInt(limit as string)
    );

    res.json({
      history,
      success: true
    });

  } catch (error) {
    console.error('Error getting extraction history:', error);
    res.status(500).json({ 
      error: 'Failed to get extraction history',
      success: false 
    });
  }
};

/**
 * Get contract analysis history
 */
export const getContractAnalysisHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { limit = 20 } = req.query;

    const history = await contractIntelligenceService.getContractAnalysisHistory(
      userId, 
      parseInt(limit as string)
    );

    res.json({
      history,
      success: true
    });

  } catch (error) {
    console.error('Error getting contract analysis history:', error);
    res.status(500).json({ 
      error: 'Failed to get contract analysis history',
      success: false 
    });
  }
};

export default {
  extractDocumentData,
  classifyDocument,
  extractVendorInfo,
  analyzeContract,
  extractPerformanceObligations,
  detectContractModifications,
  identifyRenewalTerms,
  flagNonStandardTerms,
  extractVendorDetails,
  detectPaymentTerms,
  analyzeVendorRelationships,
  enrichVendorProfile,
  getVendorRecommendations,
  getExtractionHistory,
  getContractAnalysisHistory
};







