import { Request, Response } from 'express';
import { ContractParsingService } from '../services/contractParsingService';
import { ContractAnalysisService } from '../services/contractAnalysisService';
import { z } from 'zod';
import multer from 'multer';

const contractParsingService = new ContractParsingService();
const contractAnalysisService = new ContractAnalysisService();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/contracts/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Validation schemas
const contractIdSchema = z.object({
  contractId: z.string()
});

const companyIdSchema = z.object({
  companyId: z.string().uuid()
});

const modificationSchema = z.object({
  modificationType: z.enum(['price_change', 'term_extension', 'scope_change', 'termination']),
  description: z.string().min(1),
  effectiveDate: z.string().datetime(),
  impact: z.object({
    revenue: z.number(),
    cost: z.number(),
    risk: z.number()
  }),
  approvalRequired: z.boolean().default(true)
});

/**
 * Parse contract PDF
 */
export const parseContractPDF = async (req: Request, res: Response) => {
  try {
    const { companyId } = companyIdSchema.parse(req.params);
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'PDF file is required'
      });
    }

    const analysis = await contractParsingService.parseContractPDF(
      req.file.path,
      companyId
    );

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request parameters',
        errors: error.errors
      });
    }

    console.error('Parse contract PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to parse contract PDF'
    });
  }
};

/**
 * Get contract analysis
 */
export const getContractAnalysis = async (req: Request, res: Response) => {
  try {
    const { contractId } = contractIdSchema.parse(req.params);

    const analysis = await contractParsingService.getContractAnalysis(contractId);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Contract analysis not found'
      });
    }

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid contract ID',
        errors: error.errors
      });
    }

    console.error('Get contract analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get contract analysis'
    });
  }
};

/**
 * Get company contracts
 */
export const getCompanyContracts = async (req: Request, res: Response) => {
  try {
    const { companyId } = companyIdSchema.parse(req.params);

    const contracts = await contractParsingService.getCompanyContracts(companyId);

    res.json({
      success: true,
      data: contracts
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID',
        errors: error.errors
      });
    }

    console.error('Get company contracts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get company contracts'
    });
  }
};

/**
 * Analyze contract terms
 */
export const analyzeContractTerms = async (req: Request, res: Response) => {
  try {
    const { contractId } = contractIdSchema.parse(req.params);

    const analysis = await contractAnalysisService.analyzeContractTerms(contractId);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid contract ID',
        errors: error.errors
      });
    }

    console.error('Analyze contract terms error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze contract terms'
    });
  }
};

/**
 * Generate revenue recognition schedule
 */
export const generateRevenueRecognitionSchedule = async (req: Request, res: Response) => {
  try {
    const { contractId } = contractIdSchema.parse(req.params);

    const schedule = await contractAnalysisService.generateRevenueRecognitionSchedule(contractId);

    res.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid contract ID',
        errors: error.errors
      });
    }

    console.error('Generate revenue recognition schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate revenue recognition schedule'
    });
  }
};

/**
 * Track contract modification
 */
export const trackContractModification = async (req: Request, res: Response) => {
  try {
    const { contractId } = contractIdSchema.parse(req.params);
    const modificationData = modificationSchema.parse(req.body);

    const modification = await contractAnalysisService.trackContractModification(
      contractId,
      modificationData
    );

    res.json({
      success: true,
      data: modification
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: error.errors
      });
    }

    console.error('Track contract modification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track contract modification'
    });
  }
};

/**
 * Identify upsell opportunities
 */
export const identifyUpsellOpportunities = async (req: Request, res: Response) => {
  try {
    const { contractId } = contractIdSchema.parse(req.params);

    const opportunities = await contractAnalysisService.identifyUpsellOpportunities(contractId);

    res.json({
      success: true,
      data: opportunities
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid contract ID',
        errors: error.errors
      });
    }

    console.error('Identify upsell opportunities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to identify upsell opportunities'
    });
  }
};

/**
 * Get renewal calendar
 */
export const getRenewalCalendar = async (req: Request, res: Response) => {
  try {
    const { companyId } = companyIdSchema.parse(req.params);
    const { months = 12 } = req.query;

    const calendar = await contractAnalysisService.getRenewalCalendar(
      companyId,
      Number(months)
    );

    res.json({
      success: true,
      data: calendar
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID',
        errors: error.errors
      });
    }

    console.error('Get renewal calendar error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get renewal calendar'
    });
  }
};

/**
 * Get contract risk dashboard
 */
export const getContractRiskDashboard = async (req: Request, res: Response) => {
  try {
    const { companyId } = companyIdSchema.parse(req.params);

    const dashboard = await contractAnalysisService.getContractRiskDashboard(companyId);

    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID',
        errors: error.errors
      });
    }

    console.error('Get contract risk dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get contract risk dashboard'
    });
  }
};

/**
 * Get upcoming renewals
 */
export const getUpcomingRenewals = async (req: Request, res: Response) => {
  try {
    const { companyId } = companyIdSchema.parse(req.params);
    const { days = 90 } = req.query;

    const renewals = await contractParsingService.getUpcomingRenewals(
      companyId,
      Number(days)
    );

    res.json({
      success: true,
      data: renewals
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID',
        errors: error.errors
      });
    }

    console.error('Get upcoming renewals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get upcoming renewals'
    });
  }
};

/**
 * Update contract analysis
 */
export const updateContractAnalysis = async (req: Request, res: Response) => {
  try {
    const { contractId } = contractIdSchema.parse(req.params);
    const updates = req.body;

    await contractParsingService.updateContractAnalysis(contractId, updates);

    res.json({
      success: true,
      message: 'Contract analysis updated successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid contract ID',
        errors: error.errors
      });
    }

    console.error('Update contract analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contract analysis'
    });
  }
};

// Export multer middleware for file uploads
export { upload };









