import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../config/database';

export const kpiController = {
  // Create custom KPI
  async createKPI(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        name,
        description,
        formula,
        category,
        targetValue,
        unit,
        frequency,
        isActive = true,
      } = req.body;

      if (!name || !formula) {
        return res.status(400).json({ error: 'Name and formula are required' });
      }

      const kpi = await prisma.kpi.create({
        data: {
          organizationId: req.user!.organizationId,
          practiceId: req.body.practiceId,
          name,
          description,
          formula,
          category,
          targetValue,
          unit,
          frequency,
          isActive,
        },
      });

      return res.status(201).json({
        message: 'KPI created successfully',
        kpi,
      });
    } catch (error: any) {
      console.error('Create KPI error:', error);
      return res.status(500).json({ error: 'Failed to create KPI' });
    }
  },

  // Get KPIs
  async getKPIs(req: AuthenticatedRequest, res: Response) {
    try {
      const { category, isActive, practiceId } = req.query;

      const where: any = {};

      if (practiceId) {
        where.practiceId = practiceId;
      } else {
        where.organizationId = req.user!.organizationId;
      }

      if (category) {
        where.category = category;
      }

      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      const kpis = await prisma.kpi.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      return res.json({ kpis });
    } catch (error: any) {
      console.error('Get KPIs error:', error);
      return res.status(500).json({ error: 'Failed to get KPIs' });
    }
  },

  // Update KPI
  async updateKPI(req: AuthenticatedRequest, res: Response) {
    try {
      const { kpiId } = req.params;
      const updateData = req.body;

      const kpi = await prisma.kpi.update({
        where: { id: kpiId },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
      });

      return res.json({
        message: 'KPI updated successfully',
        kpi,
      });
    } catch (error: any) {
      console.error('Update KPI error:', error);
      return res.status(500).json({ error: 'Failed to update KPI' });
    }
  },

  // Calculate KPI value
  async calculateKPI(req: AuthenticatedRequest, res: Response) {
    try {
      const { kpiId } = req.params;
      const { startDate, endDate } = req.query;

      const kpi = await prisma.kpi.findUnique({
        where: { id: kpiId },
      });

      if (!kpi) {
        return res.status(404).json({ error: 'KPI not found' });
      }

      // Mock calculation - in real implementation, this would parse the formula
      // and calculate based on actual financial data
      const mockValue = Math.random() * 100;
      const targetAchievement = kpi.targetValue ? (mockValue / kpi.targetValue) * 100 : null;

      const result = {
        kpiId: kpi.id,
        name: kpi.name,
        currentValue: mockValue,
        targetValue: kpi.targetValue,
        targetAchievement,
        unit: kpi.unit,
        calculatedAt: new Date(),
        period: {
          startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: endDate || new Date(),
        },
      };

      return res.json({ result });
    } catch (error: any) {
      console.error('Calculate KPI error:', error);
      return res.status(500).json({ error: 'Failed to calculate KPI' });
    }
  },

  // Get KPI dashboard
  async getKPIDashboard(req: AuthenticatedRequest, res: Response) {
    try {
      const { practiceId, organizationId } = req.query;

      const where: any = { isActive: true };

      if (practiceId) {
        where.practiceId = practiceId;
      } else if (organizationId) {
        where.organizationId = organizationId;
      }

      const kpis = await prisma.kpi.findMany({
        where,
        orderBy: { category: 'asc' },
      });

      // Group KPIs by category
      const kpisByCategory = kpis.reduce((acc, kpi) => {
        if (!acc[kpi.category]) {
          acc[kpi.category] = [];
        }
        acc[kpi.category].push(kpi);
        return acc;
      }, {} as Record<string, any[]>);

      // Calculate summary statistics
      const summary = {
        totalKPIs: kpis.length,
        activeKPIs: kpis.filter(kpi => kpi.isActive).length,
        categories: Object.keys(kpisByCategory).length,
        averageTargetAchievement: 85.5, // Mock data
      };

      return res.json({
        kpis,
        kpisByCategory,
        summary,
      });
    } catch (error: any) {
      console.error('Get KPI dashboard error:', error);
      return res.status(500).json({ error: 'Failed to get KPI dashboard' });
    }
  },

  // Get KPI trends
  async getKPITrends(req: AuthenticatedRequest, res: Response) {
    try {
      const { kpiId, period = '30d' } = req.query;

      if (!kpiId) {
        return res.status(400).json({ error: 'KPI ID is required' });
      }

      // Mock trend data
      const days = period === '30d' ? 30 : period === '90d' ? 90 : 7;
      const trends = Array.from({ length: days }, (_, i) => ({
        date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000),
        value: Math.random() * 100,
      }));

      return res.json({ trends });
    } catch (error: any) {
      console.error('Get KPI trends error:', error);
      return res.status(500).json({ error: 'Failed to get KPI trends' });
    }
  },
};

