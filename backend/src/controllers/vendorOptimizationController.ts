import { Request, Response } from 'express';
import { VendorOptimizationService } from '../services/vendorOptimizationService';
import { SavingsOpportunityService } from '../services/savingsOpportunityService';
import { z } from 'zod';

const vendorOptimizationService = new VendorOptimizationService();
const savingsOpportunityService = new SavingsOpportunityService();

// Validation schemas
const companyIdSchema = z.object({
  companyId: z.string().uuid()
});

const vendorIdSchema = z.object({
  vendorId: z.string().uuid()
});

const opportunityIdSchema = z.object({
  opportunityId: z.string().uuid()
});

const createOpportunitySchema = z.object({
  companyId: z.string().uuid(),
  vendorId: z.string().uuid(),
  opportunityType: z.enum(['reserved_instances', 'duplicate_subscriptions', 'unused_licenses', 'annual_prepay', 'negotiation', 'consolidation']),
  title: z.string().min(1),
  description: z.string().min(1),
  currentCost: z.number().positive(),
  potentialSavings: z.number().positive(),
  savingsPercentage: z.number().min(0).max(100),
  implementationSteps: z.array(z.string()),
  timeline: z.string().min(1),
  riskLevel: z.enum(['low', 'medium', 'high']),
  dependencies: z.array(z.string()),
  priority: z.enum(['high', 'medium', 'low']),
  estimatedROI: z.number(),
  category: z.string().min(1)
});

const updateStatusSchema = z.object({
  status: z.enum(['identified', 'in_progress', 'completed', 'cancelled'])
});

const startTrackingSchema = z.object({
  originalSavings: z.number().positive(),
  implementationCost: z.number().min(0).default(0)
});

const updateTrackingSchema = z.object({
  actualSavings: z.number().min(0),
  notes: z.string().optional()
});

/**
 * Get vendor analysis
 */
export const getVendorAnalysis = async (req: Request, res: Response) => {
  try {
    const { companyId } = companyIdSchema.parse(req.params);

    const analysis = await vendorOptimizationService.getVendorAnalysis(companyId);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID',
        errors: error.errors
      });
    }

    console.error('Get vendor analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get vendor analysis'
    });
  }
};

/**
 * Get vendor optimization opportunities
 */
export const getVendorOptimization = async (req: Request, res: Response) => {
  try {
    const { vendorId } = vendorIdSchema.parse(req.params);

    const opportunities = await vendorOptimizationService.getVendorOptimization(vendorId);

    res.json({
      success: true,
      data: opportunities
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vendor ID',
        errors: error.errors
      });
    }

    console.error('Get vendor optimization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get vendor optimization'
    });
  }
};

/**
 * Get savings opportunities
 */
export const getSavingsOpportunities = async (req: Request, res: Response) => {
  try {
    const { companyId } = companyIdSchema.parse(req.params);

    const opportunities = await savingsOpportunityService.getSavingsOpportunities(companyId);

    res.json({
      success: true,
      data: opportunities
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID',
        errors: error.errors
      });
    }

    console.error('Get savings opportunities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get savings opportunities'
    });
  }
};

/**
 * Create savings opportunity
 */
export const createSavingsOpportunity = async (req: Request, res: Response) => {
  try {
    const opportunityData = createOpportunitySchema.parse(req.body);

    const opportunity = await savingsOpportunityService.createSavingsOpportunity(
      opportunityData.companyId,
      opportunityData
    );

    res.json({
      success: true,
      data: opportunity
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: error.errors
      });
    }

    console.error('Create savings opportunity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create savings opportunity'
    });
  }
};

/**
 * Update opportunity status
 */
export const updateOpportunityStatus = async (req: Request, res: Response) => {
  try {
    const { opportunityId } = opportunityIdSchema.parse(req.params);
    const { status } = updateStatusSchema.parse(req.body);

    await savingsOpportunityService.updateOpportunityStatus(opportunityId, status);

    res.json({
      success: true,
      message: 'Opportunity status updated successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: error.errors
      });
    }

    console.error('Update opportunity status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update opportunity status'
    });
  }
};

/**
 * Start savings tracking
 */
export const startSavingsTracking = async (req: Request, res: Response) => {
  try {
    const { opportunityId } = opportunityIdSchema.parse(req.params);
    const { originalSavings, implementationCost } = startTrackingSchema.parse(req.body);

    const tracking = await savingsOpportunityService.startSavingsTracking(
      opportunityId,
      originalSavings,
      implementationCost
    );

    res.json({
      success: true,
      data: tracking
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: error.errors
      });
    }

    console.error('Start savings tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start savings tracking'
    });
  }
};

/**
 * Update savings tracking
 */
export const updateSavingsTracking = async (req: Request, res: Response) => {
  try {
    const { opportunityId } = opportunityIdSchema.parse(req.params);
    const { actualSavings, notes } = updateTrackingSchema.parse(req.body);

    await savingsOpportunityService.updateSavingsTracking(opportunityId, actualSavings, notes);

    res.json({
      success: true,
      message: 'Savings tracking updated successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: error.errors
      });
    }

    console.error('Update savings tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update savings tracking'
    });
  }
};

/**
 * Complete savings tracking
 */
export const completeSavingsTracking = async (req: Request, res: Response) => {
  try {
    const { opportunityId } = opportunityIdSchema.parse(req.params);
    const { finalSavings, completionNotes } = req.body;

    await savingsOpportunityService.completeSavingsTracking(
      opportunityId,
      finalSavings,
      completionNotes
    );

    res.json({
      success: true,
      message: 'Savings tracking completed successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: error.errors
      });
    }

    console.error('Complete savings tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete savings tracking'
    });
  }
};

/**
 * Get savings tracking
 */
export const getSavingsTracking = async (req: Request, res: Response) => {
  try {
    const { opportunityId } = opportunityIdSchema.parse(req.params);

    const tracking = await savingsOpportunityService.getSavingsTracking(opportunityId);

    if (!tracking) {
      return res.status(404).json({
        success: false,
        message: 'Savings tracking not found'
      });
    }

    res.json({
      success: true,
      data: tracking
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid opportunity ID',
        errors: error.errors
      });
    }

    console.error('Get savings tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get savings tracking'
    });
  }
};

/**
 * Get savings summary
 */
export const getSavingsSummary = async (req: Request, res: Response) => {
  try {
    const { companyId } = companyIdSchema.parse(req.params);

    const summary = await savingsOpportunityService.getSavingsSummary(companyId);

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID',
        errors: error.errors
      });
    }

    console.error('Get savings summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get savings summary'
    });
  }
};

/**
 * Get negotiation triggers
 */
export const getNegotiationTriggers = async (req: Request, res: Response) => {
  try {
    const { companyId } = companyIdSchema.parse(req.params);

    const triggers = await savingsOpportunityService.getNegotiationTriggers(companyId);

    res.json({
      success: true,
      data: triggers
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID',
        errors: error.errors
      });
    }

    console.error('Get negotiation triggers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get negotiation triggers'
    });
  }
};









