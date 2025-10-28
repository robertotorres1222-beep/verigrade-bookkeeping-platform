import { Request, Response } from 'express';
import { CollectionsService } from '../services/collectionsService';
import { DunningService } from '../services/dunningService';
import { z } from 'zod';

const collectionsService = new CollectionsService();
const dunningService = new DunningService();

// Validation schemas
const companyIdSchema = z.object({
  companyId: z.string().uuid()
});

const customerIdSchema = z.object({
  companyId: z.string().uuid(),
  customerId: z.string().uuid()
});

const dunningProcessSchema = z.object({
  companyId: z.string().uuid()
});

/**
 * Get collections dashboard
 */
export const getCollectionsDashboard = async (req: Request, res: Response) => {
  try {
    const { companyId } = companyIdSchema.parse(req.params);

    const dashboard = await collectionsService.getCollectionsDashboard(companyId);

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

    console.error('Get collections dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get collections dashboard'
    });
  }
};

/**
 * Get AR aging report
 */
export const getARAgingReport = async (req: Request, res: Response) => {
  try {
    const { companyId } = companyIdSchema.parse(req.params);

    const agingBuckets = await collectionsService.getARAgingBuckets(companyId);

    res.json({
      success: true,
      data: agingBuckets
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID',
        errors: error.errors
      });
    }

    console.error('Get AR aging report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AR aging report'
    });
  }
};

/**
 * Get customer priorities
 */
export const getCustomerPriorities = async (req: Request, res: Response) => {
  try {
    const { companyId } = companyIdSchema.parse(req.params);

    const priorities = await collectionsService.getCustomerPriorities(companyId);

    res.json({
      success: true,
      data: priorities
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID',
        errors: error.errors
      });
    }

    console.error('Get customer priorities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get customer priorities'
    });
  }
};

/**
 * Get DSO (Days Sales Outstanding)
 */
export const getDSO = async (req: Request, res: Response) => {
  try {
    const { companyId } = companyIdSchema.parse(req.params);

    const dso = await collectionsService.calculateDSO(companyId);

    res.json({
      success: true,
      data: { dso }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID',
        errors: error.errors
      });
    }

    console.error('Get DSO error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get DSO'
    });
  }
};

/**
 * Get collection rate
 */
export const getCollectionRate = async (req: Request, res: Response) => {
  try {
    const { companyId } = companyIdSchema.parse(req.params);

    const collectionRate = await collectionsService.calculateCollectionRate(companyId);

    res.json({
      success: true,
      data: { collectionRate }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID',
        errors: error.errors
      });
    }

    console.error('Get collection rate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get collection rate'
    });
  }
};

/**
 * Get bad debt rate
 */
export const getBadDebtRate = async (req: Request, res: Response) => {
  try {
    const { companyId } = companyIdSchema.parse(req.params);

    const badDebtRate = await collectionsService.calculateBadDebtRate(companyId);

    res.json({
      success: true,
      data: { badDebtRate }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID',
        errors: error.errors
      });
    }

    console.error('Get bad debt rate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get bad debt rate'
    });
  }
};

/**
 * Process dunning sequence
 */
export const processDunningSequence = async (req: Request, res: Response) => {
  try {
    const { companyId } = dunningProcessSchema.parse(req.body);

    await dunningService.processDunningSequence(companyId);

    res.json({
      success: true,
      message: 'Dunning sequence processed successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: error.errors
      });
    }

    console.error('Process dunning sequence error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process dunning sequence'
    });
  }
};

/**
 * Get dunning templates
 */
export const getDunningTemplates = async (req: Request, res: Response) => {
  try {
    const templates = {
      day0: {
        subject: 'Thank you for your business - Invoice #{invoiceNumber}',
        priority: 'low'
      },
      day5: {
        subject: 'Friendly reminder - Invoice #{invoiceNumber} due in 25 days',
        priority: 'low'
      },
      day25: {
        subject: 'Invoice #{invoiceNumber} due in 5 days',
        priority: 'medium'
      },
      day31: {
        subject: 'Payment Overdue - Invoice #{invoiceNumber}',
        priority: 'medium'
      },
      day40: {
        subject: 'URGENT: Payment 10 Days Overdue - Invoice #{invoiceNumber}',
        priority: 'high'
      },
      day60: {
        subject: 'FINAL NOTICE: Payment 30 Days Overdue - Invoice #{invoiceNumber}',
        priority: 'high'
      },
      day90: {
        subject: 'SERVICE SUSPENDED - Account Turned Over to Collections',
        priority: 'high'
      }
    };

    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Get dunning templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dunning templates'
    });
  }
};

/**
 * Get recent collections activity
 */
export const getRecentActivity = async (req: Request, res: Response) => {
  try {
    const { companyId } = companyIdSchema.parse(req.params);
    const { limit = 20 } = req.query;

    const activities = await collectionsService.getRecentActivity(companyId);

    res.json({
      success: true,
      data: activities.slice(0, Number(limit))
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID',
        errors: error.errors
      });
    }

    console.error('Get recent activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recent activity'
    });
  }
};

/**
 * Get success metrics
 */
export const getSuccessMetrics = async (req: Request, res: Response) => {
  try {
    const { companyId } = companyIdSchema.parse(req.params);

    const metrics = await collectionsService.getSuccessMetrics(companyId);

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID',
        errors: error.errors
      });
    }

    console.error('Get success metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get success metrics'
    });
  }
};









