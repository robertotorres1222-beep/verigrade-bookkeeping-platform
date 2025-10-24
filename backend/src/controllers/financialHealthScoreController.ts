import { Request, Response } from 'express';
import { FinancialHealthScoreService } from '../services/financialHealthScoreService';
import { z } from 'zod';

const financialHealthScoreService = new FinancialHealthScoreService();

// Validation schemas
const companyIdSchema = z.object({
  companyId: z.string().uuid()
});

/**
 * Get financial health score for a company
 */
export const getFinancialHealthScore = async (req: Request, res: Response) => {
  try {
    const { companyId } = companyIdSchema.parse(req.params);

    const healthScore = await financialHealthScoreService.calculateFinancialHealthScore(companyId);

    res.json({
      success: true,
      data: healthScore
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID',
        errors: error.errors
      });
    }

    console.error('Get financial health score error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get financial health score'
    });
  }
};

/**
 * Get health score history for a company
 */
export const getHealthScoreHistory = async (req: Request, res: Response) => {
  try {
    const { companyId } = companyIdSchema.parse(req.params);
    const { limit = 12 } = req.query;

    // Implementation to get historical health scores
    const history = await financialHealthScoreService.getHealthScoreHistory(
      companyId,
      Number(limit)
    );

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID',
        errors: error.errors
      });
    }

    console.error('Get health score history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get health score history'
    });
  }
};

/**
 * Get peer comparison data
 */
export const getPeerComparison = async (req: Request, res: Response) => {
  try {
    const { companyId } = companyIdSchema.parse(req.params);

    const peerComparison = await financialHealthScoreService.getPeerComparison(companyId);

    res.json({
      success: true,
      data: peerComparison
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID',
        errors: error.errors
      });
    }

    console.error('Get peer comparison error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get peer comparison'
    });
  }
};

/**
 * Get recommendations for improving health score
 */
export const getRecommendations = async (req: Request, res: Response) => {
  try {
    const { companyId } = companyIdSchema.parse(req.params);

    const recommendations = await financialHealthScoreService.getRecommendations(companyId);

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

    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations'
    });
  }
};





