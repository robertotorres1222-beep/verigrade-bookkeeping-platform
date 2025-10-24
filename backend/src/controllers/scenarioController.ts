import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../config/database';

export const scenarioController = {
  // Create scenario
  async createScenario(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        name,
        description,
        baseScenario,
        assumptions,
        variables,
        timeHorizon,
        isActive = true,
      } = req.body;

      if (!name || !assumptions) {
        return res.status(400).json({ error: 'Name and assumptions are required' });
      }

      const scenario = await prisma.scenario.create({
        data: {
          organizationId: req.user!.organizationId,
          practiceId: req.body.practiceId,
          name,
          description,
          baseScenario,
          assumptions,
          variables,
          timeHorizon,
          isActive,
        },
      });

      return res.status(201).json({
        message: 'Scenario created successfully',
        scenario,
      });
    } catch (error: any) {
      console.error('Create scenario error:', error);
      return res.status(500).json({ error: 'Failed to create scenario' });
    }
  },

  // Get scenarios
  async getScenarios(req: AuthenticatedRequest, res: Response) {
    try {
      const { practiceId, isActive } = req.query;

      const where: any = {};

      if (practiceId) {
        where.practiceId = practiceId;
      } else {
        where.organizationId = req.user!.organizationId;
      }

      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      const scenarios = await prisma.scenario.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      return res.json({ scenarios });
    } catch (error: any) {
      console.error('Get scenarios error:', error);
      return res.status(500).json({ error: 'Failed to get scenarios' });
    }
  },

  // Run scenario analysis
  async runScenarioAnalysis(req: AuthenticatedRequest, res: Response) {
    try {
      const { scenarioId } = req.params;
      const { variables } = req.body;

      const scenario = await prisma.scenario.findUnique({
        where: { id: scenarioId },
      });

      if (!scenario) {
        return res.status(404).json({ error: 'Scenario not found' });
      }

      // Mock scenario analysis results
      const results = {
        scenarioId: scenario.id,
        name: scenario.name,
        timeHorizon: scenario.timeHorizon,
        projections: Array.from({ length: 12 }, (_, i) => ({
          month: i + 1,
          revenue: Math.random() * 100000 + 50000,
          expenses: Math.random() * 80000 + 30000,
          profit: Math.random() * 20000 + 10000,
          cashFlow: Math.random() * 15000 + 5000,
        })),
        keyMetrics: {
          totalRevenue: Math.random() * 1200000 + 600000,
          totalExpenses: Math.random() * 960000 + 360000,
          netProfit: Math.random() * 240000 + 120000,
          profitMargin: Math.random() * 20 + 10,
          roi: Math.random() * 30 + 15,
        },
        assumptions: scenario.assumptions,
        variables: variables || scenario.variables,
        createdAt: new Date(),
      };

      return res.json({ results });
    } catch (error: any) {
      console.error('Run scenario analysis error:', error);
      return res.status(500).json({ error: 'Failed to run scenario analysis' });
    }
  },

  // Compare scenarios
  async compareScenarios(req: AuthenticatedRequest, res: Response) {
    try {
      const { scenarioIds } = req.body;

      if (!scenarioIds || scenarioIds.length < 2) {
        return res.status(400).json({ error: 'At least 2 scenarios are required for comparison' });
      }

      const scenarios = await prisma.scenario.findMany({
        where: { id: { in: scenarioIds } },
      });

      if (scenarios.length !== scenarioIds.length) {
        return res.status(404).json({ error: 'One or more scenarios not found' });
      }

      // Mock comparison results
      const comparison = scenarios.map((scenario, index) => ({
        id: scenario.id,
        name: scenario.name,
        description: scenario.description,
        metrics: {
          revenue: Math.random() * 1000000 + 500000,
          profit: Math.random() * 200000 + 100000,
          margin: Math.random() * 20 + 10,
          growth: Math.random() * 30 + 5,
        },
        ranking: index + 1,
      }));

      return res.json({ comparison });
    } catch (error: any) {
      console.error('Compare scenarios error:', error);
      return res.status(500).json({ error: 'Failed to compare scenarios' });
    }
  },

  // Get scenario templates
  async getScenarioTemplates(req: AuthenticatedRequest, res: Response) {
    try {
      const { category } = req.query;

      const where: any = { isActive: true };

      if (category) {
        where.category = category;
      }

      const templates = await prisma.scenarioTemplate.findMany({
        where,
        orderBy: { name: 'asc' },
      });

      return res.json({ templates });
    } catch (error: any) {
      console.error('Get scenario templates error:', error);
      return res.status(500).json({ error: 'Failed to get scenario templates' });
    }
  },

  // Create scenario from template
  async createScenarioFromTemplate(req: AuthenticatedRequest, res: Response) {
    try {
      const { templateId } = req.params;
      const { name, description, variables } = req.body;

      const template = await prisma.scenarioTemplate.findUnique({
        where: { id: templateId },
      });

      if (!template) {
        return res.status(404).json({ error: 'Scenario template not found' });
      }

      const scenario = await prisma.scenario.create({
        data: {
          organizationId: req.user!.organizationId,
          practiceId: req.body.practiceId,
          name: name || template.name,
          description: description || template.description,
          baseScenario: template.baseScenario,
          assumptions: template.assumptions,
          variables: variables || template.variables,
          timeHorizon: template.timeHorizon,
        },
      });

      return res.status(201).json({
        message: 'Scenario created from template successfully',
        scenario,
      });
    } catch (error: any) {
      console.error('Create scenario from template error:', error);
      return res.status(500).json({ error: 'Failed to create scenario from template' });
    }
  },
};

