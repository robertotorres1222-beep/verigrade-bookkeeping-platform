import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export interface SLO {
  id: string;
  name: string;
  description: string;
  service: string;
  sli: string; // Service Level Indicator
  target: number; // Target percentage (e.g., 99.9)
  window: string; // Time window (e.g., '30d', '7d', '24h')
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  createdAt: Date;
  updatedAt: Date;
}

export interface SLI {
  id: string;
  sloId: string;
  timestamp: Date;
  value: number; // SLI value (0-100)
  status: 'GOOD' | 'WARNING' | 'CRITICAL';
  createdAt: Date;
}

export interface ErrorBudget {
  id: string;
  sloId: string;
  totalBudget: number; // Total error budget percentage
  consumedBudget: number; // Consumed error budget percentage
  remainingBudget: number; // Remaining error budget percentage
  burnRate: number; // Error budget burn rate
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'EXHAUSTED';
  lastUpdated: Date;
  createdAt: Date;
}

export interface ChaosExperiment {
  id: string;
  name: string;
  description: string;
  service: string;
  type: 'NETWORK' | 'CPU' | 'MEMORY' | 'DISK' | 'POD' | 'CUSTOM';
  status: 'DRAFT' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  duration: number; // Duration in minutes
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  parameters: Record<string, any>;
  results?: {
    success: boolean;
    impact: string;
    lessons: string[];
    recommendations: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface PerformanceTest {
  id: string;
  name: string;
  description: string;
  service: string;
  type: 'LOAD' | 'STRESS' | 'SPIKE' | 'VOLUME' | 'ENDPOINT';
  status: 'DRAFT' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  configuration: {
    virtualUsers: number;
    duration: number; // in minutes
    rampUp: number; // in minutes
    targetEndpoint?: string;
    scenarios: Array<{
      name: string;
      weight: number;
      script: string;
    }>;
  };
  results?: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    throughput: number;
    errorRate: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'P1' | 'P2' | 'P3' | 'P4';
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';
  service: string;
  assignee?: string;
  reporter: string;
  startTime: Date;
  endTime?: Date;
  resolution?: string;
  impact: {
    usersAffected: number;
    revenueImpact: number;
    duration: number; // in minutes
  };
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Runbook {
  id: string;
  name: string;
  description: string;
  service: string;
  category: 'INCIDENT_RESPONSE' | 'DEPLOYMENT' | 'MAINTENANCE' | 'TROUBLESHOOTING';
  steps: Array<{
    id: string;
    title: string;
    description: string;
    command?: string;
    expectedOutcome: string;
    timeout: number; // in minutes
    critical: boolean;
  }>;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  createdAt: Date;
  updatedAt: Date;
}

export interface PostMortem {
  id: string;
  incidentId: string;
  title: string;
  summary: string;
  timeline: Array<{
    timestamp: Date;
    event: string;
    actor: string;
    action: string;
  }>;
  rootCause: string;
  impact: {
    usersAffected: number;
    revenueImpact: number;
    duration: number;
  };
  lessonsLearned: string[];
  actionItems: Array<{
    id: string;
    description: string;
    assignee: string;
    dueDate: Date;
    status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
  }>;
  status: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED';
  createdAt: Date;
  updatedAt: Date;
}

export interface Toil {
  id: string;
  name: string;
  description: string;
  category: 'MANUAL' | 'REPETITIVE' | 'REACTIVE' | 'OPERATIONAL';
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ON_DEMAND';
  timeSpent: number; // in minutes
  automationPotential: 'LOW' | 'MEDIUM' | 'HIGH';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'IDENTIFIED' | 'AUTOMATED' | 'ELIMINATED';
  createdAt: Date;
  updatedAt: Date;
}

export class SREPracticesService {
  // SLO Management
  async createSLO(data: Omit<SLO, 'id' | 'createdAt' | 'updatedAt'>): Promise<SLO> {
    try {
      const slo = await prisma.slo.create({
        data: {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      logger.info('SLO created successfully', { sloId: slo.id });
      return slo as SLO;
    } catch (error) {
      logger.error('Error creating SLO', { error, data });
      throw error;
    }
  }

  async getSLOs(filters?: {
    service?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ slos: SLO[]; total: number; page: number; totalPages: number }> {
    try {
      const { service, status, page = 1, limit = 10 } = filters || {};
      const skip = (page - 1) * limit;

      const where: any = {};
      if (service) where.service = service;
      if (status) where.status = status;

      const [slos, total] = await Promise.all([
        prisma.slo.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.slo.count({ where }),
      ]);

      return {
        slos: slos as SLO[],
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Error fetching SLOs', { error, filters });
      throw error;
    }
  }

  async updateSLO(id: string, data: Partial<SLO>): Promise<SLO> {
    try {
      const slo = await prisma.slo.update({
        where: { id },
        data: { ...data, updatedAt: new Date() },
      });

      logger.info('SLO updated successfully', { sloId: id });
      return slo as SLO;
    } catch (error) {
      logger.error('Error updating SLO', { error, sloId: id, data });
      throw error;
    }
  }

  // SLI Management
  async recordSLI(data: Omit<SLI, 'id' | 'createdAt'>): Promise<SLI> {
    try {
      const sli = await prisma.sli.create({
        data: {
          ...data,
          createdAt: new Date(),
        },
      });

      // Update error budget
      await this.updateErrorBudget(data.sloId, data.value);

      logger.info('SLI recorded successfully', { sliId: sli.id });
      return sli as SLI;
    } catch (error) {
      logger.error('Error recording SLI', { error, data });
      throw error;
    }
  }

  async getSLIs(sloId: string, filters?: {
    dateFrom?: Date;
    dateTo?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ slis: SLI[]; total: number; page: number; totalPages: number }> {
    try {
      const { dateFrom, dateTo, page = 1, limit = 10 } = filters || {};
      const skip = (page - 1) * limit;

      const where: any = { sloId };
      if (dateFrom || dateTo) {
        where.timestamp = {};
        if (dateFrom) where.timestamp.gte = dateFrom;
        if (dateTo) where.timestamp.lte = dateTo;
      }

      const [slis, total] = await Promise.all([
        prisma.sli.findMany({
          where,
          skip,
          take: limit,
          orderBy: { timestamp: 'desc' },
        }),
        prisma.sli.count({ where }),
      ]);

      return {
        slis: slis as SLI[],
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Error fetching SLIs', { error, sloId, filters });
      throw error;
    }
  }

  // Error Budget Management
  async updateErrorBudget(sloId: string, sliValue: number): Promise<ErrorBudget> {
    try {
      const slo = await prisma.slo.findUnique({
        where: { id: sloId },
      });

      if (!slo) {
        throw new Error('SLO not found');
      }

      const target = slo.target;
      const errorRate = Math.max(0, target - sliValue);
      const burnRate = errorRate / target;

      // Get or create error budget
      let errorBudget = await prisma.errorBudget.findUnique({
        where: { sloId },
      });

      if (!errorBudget) {
        errorBudget = await prisma.errorBudget.create({
          data: {
            sloId,
            totalBudget: 100 - target,
            consumedBudget: 0,
            remainingBudget: 100 - target,
            burnRate: 0,
            status: 'HEALTHY',
            lastUpdated: new Date(),
            createdAt: new Date(),
          },
        });
      }

      const newConsumedBudget = Math.min(100, errorBudget.consumedBudget + errorRate);
      const newRemainingBudget = Math.max(0, errorBudget.totalBudget - newConsumedBudget);

      let status: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'EXHAUSTED' = 'HEALTHY';
      if (newRemainingBudget <= 0) {
        status = 'EXHAUSTED';
      } else if (newRemainingBudget < errorBudget.totalBudget * 0.2) {
        status = 'CRITICAL';
      } else if (newRemainingBudget < errorBudget.totalBudget * 0.5) {
        status = 'WARNING';
      }

      const updatedErrorBudget = await prisma.errorBudget.update({
        where: { id: errorBudget.id },
        data: {
          consumedBudget: newConsumedBudget,
          remainingBudget: newRemainingBudget,
          burnRate,
          status,
          lastUpdated: new Date(),
        },
      });

      logger.info('Error budget updated successfully', { sloId, consumedBudget: newConsumedBudget, remainingBudget: newRemainingBudget });
      return updatedErrorBudget as ErrorBudget;
    } catch (error) {
      logger.error('Error updating error budget', { error, sloId, sliValue });
      throw error;
    }
  }

  async getErrorBudgets(): Promise<ErrorBudget[]> {
    try {
      const errorBudgets = await prisma.errorBudget.findMany({
        orderBy: { lastUpdated: 'desc' },
      });

      return errorBudgets as ErrorBudget[];
    } catch (error) {
      logger.error('Error fetching error budgets', { error });
      throw error;
    }
  }

  // Chaos Engineering
  async createChaosExperiment(data: Omit<ChaosExperiment, 'id' | 'createdAt' | 'updatedAt'>): Promise<ChaosExperiment> {
    try {
      const experiment = await prisma.chaosExperiment.create({
        data: {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      logger.info('Chaos experiment created successfully', { experimentId: experiment.id });
      return experiment as ChaosExperiment;
    } catch (error) {
      logger.error('Error creating chaos experiment', { error, data });
      throw error;
    }
  }

  async getChaosExperiments(filters?: {
    service?: string;
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<{ experiments: ChaosExperiment[]; total: number; page: number; totalPages: number }> {
    try {
      const { service, status, type, page = 1, limit = 10 } = filters || {};
      const skip = (page - 1) * limit;

      const where: any = {};
      if (service) where.service = service;
      if (status) where.status = status;
      if (type) where.type = type;

      const [experiments, total] = await Promise.all([
        prisma.chaosExperiment.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.chaosExperiment.count({ where }),
      ]);

      return {
        experiments: experiments as ChaosExperiment[],
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Error fetching chaos experiments', { error, filters });
      throw error;
    }
  }

  async runChaosExperiment(id: string): Promise<ChaosExperiment> {
    try {
      const experiment = await prisma.chaosExperiment.update({
        where: { id },
        data: {
          status: 'RUNNING',
          updatedAt: new Date(),
        },
      });

      // Simulate chaos experiment execution
      setTimeout(async () => {
        const results = {
          success: Math.random() > 0.3, // 70% success rate
          impact: 'Service degradation observed',
          lessons: ['Network latency increased', 'Database connections reduced'],
          recommendations: ['Implement circuit breakers', 'Add retry mechanisms'],
        };

        await prisma.chaosExperiment.update({
          where: { id },
          data: {
            status: 'COMPLETED',
            results,
            updatedAt: new Date(),
          },
        });
      }, experiment.duration * 60 * 1000); // Convert minutes to milliseconds

      logger.info('Chaos experiment started successfully', { experimentId: id });
      return experiment as ChaosExperiment;
    } catch (error) {
      logger.error('Error running chaos experiment', { error, experimentId: id });
      throw error;
    }
  }

  // Performance Testing
  async createPerformanceTest(data: Omit<PerformanceTest, 'id' | 'createdAt' | 'updatedAt'>): Promise<PerformanceTest> {
    try {
      const test = await prisma.performanceTest.create({
        data: {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      logger.info('Performance test created successfully', { testId: test.id });
      return test as PerformanceTest;
    } catch (error) {
      logger.error('Error creating performance test', { error, data });
      throw error;
    }
  }

  async getPerformanceTests(filters?: {
    service?: string;
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<{ tests: PerformanceTest[]; total: number; page: number; totalPages: number }> {
    try {
      const { service, status, type, page = 1, limit = 10 } = filters || {};
      const skip = (page - 1) * limit;

      const where: any = {};
      if (service) where.service = service;
      if (status) where.status = status;
      if (type) where.type = type;

      const [tests, total] = await Promise.all([
        prisma.performanceTest.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.performanceTest.count({ where }),
      ]);

      return {
        tests: tests as PerformanceTest[],
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Error fetching performance tests', { error, filters });
      throw error;
    }
  }

  async runPerformanceTest(id: string): Promise<PerformanceTest> {
    try {
      const test = await prisma.performanceTest.update({
        where: { id },
        data: {
          status: 'RUNNING',
          updatedAt: new Date(),
        },
      });

      // Simulate performance test execution
      setTimeout(async () => {
        const results = {
          totalRequests: test.configuration.virtualUsers * test.configuration.duration * 60,
          successfulRequests: Math.floor(test.configuration.virtualUsers * test.configuration.duration * 60 * 0.95),
          failedRequests: Math.floor(test.configuration.virtualUsers * test.configuration.duration * 60 * 0.05),
          averageResponseTime: Math.random() * 500 + 100,
          p95ResponseTime: Math.random() * 1000 + 200,
          p99ResponseTime: Math.random() * 2000 + 500,
          throughput: test.configuration.virtualUsers * 0.8,
          errorRate: 0.05,
        };

        await prisma.performanceTest.update({
          where: { id },
          data: {
            status: 'COMPLETED',
            results,
            updatedAt: new Date(),
          },
        });
      }, test.configuration.duration * 60 * 1000); // Convert minutes to milliseconds

      logger.info('Performance test started successfully', { testId: id });
      return test as PerformanceTest;
    } catch (error) {
      logger.error('Error running performance test', { error, testId: id });
      throw error;
    }
  }

  // Incident Management
  async createIncident(data: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>): Promise<Incident> {
    try {
      const incident = await prisma.incident.create({
        data: {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      logger.info('Incident created successfully', { incidentId: incident.id });
      return incident as Incident;
    } catch (error) {
      logger.error('Error creating incident', { error, data });
      throw error;
    }
  }

  async getIncidents(filters?: {
    service?: string;
    status?: string;
    severity?: string;
    page?: number;
    limit?: number;
  }): Promise<{ incidents: Incident[]; total: number; page: number; totalPages: number }> {
    try {
      const { service, status, severity, page = 1, limit = 10 } = filters || {};
      const skip = (page - 1) * limit;

      const where: any = {};
      if (service) where.service = service;
      if (status) where.status = status;
      if (severity) where.severity = severity;

      const [incidents, total] = await Promise.all([
        prisma.incident.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.incident.count({ where }),
      ]);

      return {
        incidents: incidents as Incident[],
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Error fetching incidents', { error, filters });
      throw error;
    }
  }

  async updateIncident(id: string, data: Partial<Incident>): Promise<Incident> {
    try {
      const incident = await prisma.incident.update({
        where: { id },
        data: { ...data, updatedAt: new Date() },
      });

      logger.info('Incident updated successfully', { incidentId: id });
      return incident as Incident;
    } catch (error) {
      logger.error('Error updating incident', { error, incidentId: id, data });
      throw error;
    }
  }

  // Runbook Management
  async createRunbook(data: Omit<Runbook, 'id' | 'createdAt' | 'updatedAt'>): Promise<Runbook> {
    try {
      const runbook = await prisma.runbook.create({
        data: {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      logger.info('Runbook created successfully', { runbookId: runbook.id });
      return runbook as Runbook;
    } catch (error) {
      logger.error('Error creating runbook', { error, data });
      throw error;
    }
  }

  async getRunbooks(filters?: {
    service?: string;
    category?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ runbooks: Runbook[]; total: number; page: number; totalPages: number }> {
    try {
      const { service, category, status, page = 1, limit = 10 } = filters || {};
      const skip = (page - 1) * limit;

      const where: any = {};
      if (service) where.service = service;
      if (category) where.category = category;
      if (status) where.status = status;

      const [runbooks, total] = await Promise.all([
        prisma.runbook.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.runbook.count({ where }),
      ]);

      return {
        runbooks: runbooks as Runbook[],
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Error fetching runbooks', { error, filters });
      throw error;
    }
  }

  // Post-Mortem Management
  async createPostMortem(data: Omit<PostMortem, 'id' | 'createdAt' | 'updatedAt'>): Promise<PostMortem> {
    try {
      const postMortem = await prisma.postMortem.create({
        data: {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      logger.info('Post-mortem created successfully', { postMortemId: postMortem.id });
      return postMortem as PostMortem;
    } catch (error) {
      logger.error('Error creating post-mortem', { error, data });
      throw error;
    }
  }

  async getPostMortems(filters?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ postMortems: PostMortem[]; total: number; page: number; totalPages: number }> {
    try {
      const { status, page = 1, limit = 10 } = filters || {};
      const skip = (page - 1) * limit;

      const where: any = {};
      if (status) where.status = status;

      const [postMortems, total] = await Promise.all([
        prisma.postMortem.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.postMortem.count({ where }),
      ]);

      return {
        postMortems: postMortems as PostMortem[],
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Error fetching post-mortems', { error, filters });
      throw error;
    }
  }

  // Toil Management
  async createToil(data: Omit<Toil, 'id' | 'createdAt' | 'updatedAt'>): Promise<Toil> {
    try {
      const toil = await prisma.toil.create({
        data: {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      logger.info('Toil created successfully', { toilId: toil.id });
      return toil as Toil;
    } catch (error) {
      logger.error('Error creating toil', { error, data });
      throw error;
    }
  }

  async getToils(filters?: {
    category?: string;
    status?: string;
    priority?: string;
    page?: number;
    limit?: number;
  }): Promise<{ toils: Toil[]; total: number; page: number; totalPages: number }> {
    try {
      const { category, status, priority, page = 1, limit = 10 } = filters || {};
      const skip = (page - 1) * limit;

      const where: any = {};
      if (category) where.category = category;
      if (status) where.status = status;
      if (priority) where.priority = priority;

      const [toils, total] = await Promise.all([
        prisma.toil.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.toil.count({ where }),
      ]);

      return {
        toils: toils as Toil[],
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Error fetching toils', { error, filters });
      throw error;
    }
  }

  // Analytics and Reporting
  async getSREAnalytics(): Promise<{
    sloCompliance: number;
    errorBudgetHealth: number;
    incidentCount: number;
    mttr: number; // Mean Time To Recovery
    mtbf: number; // Mean Time Between Failures
    toilReduction: number;
    chaosExperiments: number;
    performanceTests: number;
    topServices: Array<{ service: string; incidents: number; sloCompliance: number }>;
    trendData: Array<{ date: string; incidents: number; sloCompliance: number }>;
  }> {
    try {
      // Calculate SLO compliance
      const slos = await prisma.slo.findMany({ where: { status: 'ACTIVE' } });
      const sliData = await prisma.sli.findMany({
        where: {
          timestamp: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      });

      const sloCompliance = sliData.length > 0 
        ? sliData.reduce((sum, sli) => sum + sli.value, 0) / sliData.length 
        : 0;

      // Calculate error budget health
      const errorBudgets = await prisma.errorBudget.findMany();
      const errorBudgetHealth = errorBudgets.length > 0
        ? errorBudgets.reduce((sum, budget) => sum + (budget.remainingBudget / budget.totalBudget), 0) / errorBudgets.length * 100
        : 100;

      // Calculate incident metrics
      const incidents = await prisma.incident.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      });

      const incidentCount = incidents.length;
      const resolvedIncidents = incidents.filter(i => i.status === 'RESOLVED' || i.status === 'CLOSED');
      const mttr = resolvedIncidents.length > 0
        ? resolvedIncidents.reduce((sum, incident) => {
            const duration = incident.endTime 
              ? (incident.endTime.getTime() - incident.startTime.getTime()) / (1000 * 60) // in minutes
              : 0;
            return sum + duration;
          }, 0) / resolvedIncidents.length
        : 0;

      // Calculate MTBF
      const mtbf = incidents.length > 1 
        ? (30 * 24 * 60) / incidents.length // 30 days in minutes / number of incidents
        : 0;

      // Calculate toil reduction
      const toils = await prisma.toil.findMany();
      const automatedToils = toils.filter(t => t.status === 'AUTOMATED' || t.status === 'ELIMINATED');
      const toilReduction = toils.length > 0 ? (automatedToils.length / toils.length) * 100 : 0;

      // Count experiments and tests
      const chaosExperiments = await prisma.chaosExperiment.count();
      const performanceTests = await prisma.performanceTest.count();

      // Top services by incidents
      const serviceIncidents = incidents.reduce((acc, incident) => {
        if (!acc[incident.service]) {
          acc[incident.service] = 0;
        }
        acc[incident.service]++;
        return acc;
      }, {} as Record<string, number>);

      const topServices = Object.entries(serviceIncidents)
        .map(([service, incidents]) => ({
          service,
          incidents,
          sloCompliance: Math.random() * 20 + 80, // Mock SLO compliance
        }))
        .sort((a, b) => b.incidents - a.incidents)
        .slice(0, 5);

      // Generate trend data
      const trendData = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000);
        const dayIncidents = incidents.filter(incident => 
          incident.createdAt.toDateString() === date.toDateString()
        ).length;
        
        return {
          date: date.toISOString().split('T')[0],
          incidents: dayIncidents,
          sloCompliance: Math.random() * 10 + 90, // Mock SLO compliance
        };
      });

      return {
        sloCompliance,
        errorBudgetHealth,
        incidentCount,
        mttr,
        mtbf,
        toilReduction,
        chaosExperiments,
        performanceTests,
        topServices,
        trendData,
      };
    } catch (error) {
      logger.error('Error calculating SRE analytics', { error });
      throw error;
    }
  }
}

export const srePracticesService = new SREPracticesService();




