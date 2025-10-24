import { Request, Response } from 'express';
import { PricingAnalysisService } from '../services/pricingAnalysisService';
import { WillingnessToPayService } from '../services/willingnessToPayService';
import { z } from 'zod';

const pricingAnalysisService = new PricingAnalysisService();
const wtpService = new WillingnessToPayService();

// Validation schemas
const companyIdSchema = z.object({
  companyId: z.string().uuid()
});

const segmentSchema = z.object({
  companyId: z.string().uuid(),
  segment: z.string().min(1)
});

const featureSchema = z.object({
  companyId: z.string().uuid(),
  feature: z.string().min(1)
});

const trendsSchema = z.object({
  companyId: z.string().uuid(),
  months: z.number().min(1).max(24).default(12)
});

/**
 * Get comprehensive pricing analysis
 */
export const getPricingAnalysis = async (req: Request, res: Response) => {
  try {
    const { companyId } = companyIdSchema.parse(req.params);

    const analysis = await pricingAnalysisService.getPricingAnalysis(companyId);

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

    console.error('Get pricing analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pricing analysis'
    });
  }
};

/**
 * Get willingness to pay analysis
 */
export const getWillingnessToPay = async (req: Request, res: Response) => {
  try {
    const { companyId } = companyIdSchema.parse(req.params);

    const wtpAnalysis = await wtpService.analyzeWillingnessToPay(companyId);

    res.json({
      success: true,
      data: wtpAnalysis
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID',
        errors: error.errors
      });
    }

    console.error('Get willingness to pay error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get willingness to pay analysis'
    });
  }
};

/**
 * Get WTP recommendations
 */
export const getWTPRecommendations = async (req: Request, res: Response) => {
  try {
    const { companyId } = companyIdSchema.parse(req.params);

    const recommendations = await wtpService.generateWTPRecommendations(companyId);

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID',
        errors: error.errors
      });
    }

    console.error('Get WTP recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get WTP recommendations'
    });
  }
};

/**
 * Get segment WTP
 */
export const getSegmentWTP = async (req: Request, res: Response) => {
  try {
    const { companyId, segment } = segmentSchema.parse(req.params);

    const wtp = await wtpService.calculateSegmentWTP(companyId, segment);

    res.json({
      success: true,
      data: { segment, wtp }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request parameters',
        errors: error.errors
      });
    }

    console.error('Get segment WTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get segment WTP'
    });
  }
};

/**
 * Get feature WTP
 */
export const getFeatureWTP = async (req: Request, res: Response) => {
  try {
    const { companyId, feature } = featureSchema.parse(req.params);

    const wtp = await wtpService.calculateFeatureWTP(companyId, feature);

    res.json({
      success: true,
      data: { feature, wtp }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request parameters',
        errors: error.errors
      });
    }

    console.error('Get feature WTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get feature WTP'
    });
  }
};

/**
 * Get WTP trends
 */
export const getWTPTrends = async (req: Request, res: Response) => {
  try {
    const { companyId, months } = trendsSchema.parse({ ...req.params, ...req.query });

    const trends = await wtpService.getWTPTrends(companyId, months);

    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request parameters',
        errors: error.errors
      });
    }

    console.error('Get WTP trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get WTP trends'
    });
  }
};

/**
 * Get value-based pricing recommendations
 */
export const getValueBasedPricing = async (req: Request, res: Response) => {
  try {
    const { companyId } = companyIdSchema.parse(req.params);

    const analysis = await pricingAnalysisService.getPricingAnalysis(companyId);
    const valueBasedPricing = analysis.valueBasedPricing;

    res.json({
      success: true,
      data: valueBasedPricing
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID',
        errors: error.errors
      });
    }

    console.error('Get value-based pricing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get value-based pricing'
    });
  }
};

/**
 * Get annual discount optimization
 */
export const getAnnualDiscountOptimization = async (req: Request, res: Response) => {
  try {
    const { companyId } = companyIdSchema.parse(req.params);

    const analysis = await pricingAnalysisService.getPricingAnalysis(companyId);
    const optimization = analysis.annualDiscountOptimization;

    res.json({
      success: true,
      data: optimization
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID',
        errors: error.errors
      });
    }

    console.error('Get annual discount optimization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get annual discount optimization'
    });
  }
};

/**
 * Get grandfather pricing risk assessment
 */
export const getGrandfatherPricingRisk = async (req: Request, res: Response) => {
  try {
    const { companyId } = companyIdSchema.parse(req.params);

    const analysis = await pricingAnalysisService.getPricingAnalysis(companyId);
    const riskAssessment = analysis.grandfatherPricingRisk;

    res.json({
      success: true,
      data: riskAssessment
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID',
        errors: error.errors
      });
    }

    console.error('Get grandfather pricing risk error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get grandfather pricing risk'
    });
  }
};

/**
 * Get usage-based pricing analysis
 */
export const getUsageBasedPricing = async (req: Request, res: Response) => {
  try {
    const { companyId } = companyIdSchema.parse(req.params);

    const analysis = await pricingAnalysisService.getPricingAnalysis(companyId);
    const usageBasedPricing = analysis.usageBasedPricing;

    res.json({
      success: true,
      data: usageBasedPricing
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID',
        errors: error.errors
      });
    }

    console.error('Get usage-based pricing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get usage-based pricing'
    });
  }
};

/**
 * Get price elasticity analysis
 */
export const getPriceElasticity = async (req: Request, res: Response) => {
  try {
    const { companyId } = companyIdSchema.parse(req.params);

    const analysis = await pricingAnalysisService.getPricingAnalysis(companyId);
    const priceElasticity = analysis.priceElasticity;

    res.json({
      success: true,
      data: priceElasticity
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID',
        errors: error.errors
      });
    }

    console.error('Get price elasticity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get price elasticity'
    });
  }
};

/**
 * Get A/B test recommendations
 */
export const getABTestRecommendations = async (req: Request, res: Response) => {
  try {
    const { companyId } = companyIdSchema.parse(req.params);

    const analysis = await pricingAnalysisService.getPricingAnalysis(companyId);
    const abTestRecommendations = analysis.abTestRecommendations;

    res.json({
      success: true,
      data: abTestRecommendations
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID',
        errors: error.errors
      });
    }

    console.error('Get A/B test recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get A/B test recommendations'
    });
  }
};






