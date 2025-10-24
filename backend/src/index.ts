import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/node';

// Import routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import transactionRoutes from './routes/transactionRoutes';
import invoiceRoutes from './routes/invoiceRoutes';
import clientRoutes from './routes/clientRoutes';
import reportRoutes from './routes/reportRoutes';
// Core Routes
import fileUploadRoutes from './routes/fileUploadRoutes';
import documentProcessingRoutes from './routes/documentProcessingRoutes';
import batchProcessingRoutes from './routes/batchProcessingRoutes';
import ocrRoutes from './routes/ocrRoutes';
import performanceRoutes from './routes/performanceRoutes';

// AI & Analytics Routes
import aiChatbotRoutes from './routes/aiChatbotRoutes';
import documentIntelligenceRoutes from './routes/documentIntelligenceRoutes';
import anomalyDetectionRoutes from './routes/anomalyDetectionRoutes';
import recommendationsRoutes from './routes/recommendationsRoutes';
import aiFinancialAdvisorRoutes from './routes/aiFinancialAdvisorRoutes';
import aiCoPilotRoutes from './routes/aiCoPilotRoutes';
import churnPreventionRoutes from './routes/churnPreventionRoutes';
import mlCategorizationRoutes from './routes/mlCategorizationRoutes';
import advancedAnalyticsRoutes from './routes/advancedAnalyticsRoutes';
import predictiveAnalyticsRoutes from './routes/predictiveAnalyticsRoutes';
import businessIntelligenceRoutes from './routes/businessIntelligenceRoutes';
import customReportBuilderRoutes from './routes/customReportBuilderRoutes';
import dataVisualizationRoutes from './routes/dataVisualizationRoutes';

// Integration Routes
import integrationRoutes from './routes/integrationRoutes';
import quickbooksRoutes from './routes/quickbooksRoutes';
import slackRoutes from './routes/slackRoutes';
import webhookRoutes from './routes/webhookRoutes';

// Enterprise Routes
import organizationRoutes from './routes/organizationRoutes';
import ssoRoutes from './routes/ssoRoutes';
import brandingRoutes from './routes/brandingRoutes';
import apiKeyRoutes from './routes/apiKeyRoutes';
import enterpriseRoutes from './routes/enterpriseRoutes';

// Client & Portal Routes
import clientPortalRoutes from './routes/clientPortalRoutes';
import paymentRoutes from './routes/paymentRoutes';

// Security & Compliance Routes
import auditRoutes from './routes/auditRoutes';
import gdprRoutes from './routes/gdprRoutes';
import securityRoutes from './routes/securityRoutes';
import advancedSecurityComplianceRoutes from './routes/advancedSecurityComplianceRoutes';

// Banking & Financial Routes
import bankingRoutes from './routes/bankingRoutes';
import bankFeedProcessingRoutes from './routes/bankFeedProcessingRoutes';
import recurringRoutes from './routes/recurringRoutes';
import approvalWorkflowRoutes from './routes/approvalWorkflowRoutes';
import financialHealthScoreRoutes from './routes/financialHealthScoreRoutes';
import collectionsRoutes from './routes/collectionsRoutes';
import investorReportingRoutes from './routes/investorReportingRoutes';
import vendorOptimizationRoutes from './routes/vendorOptimizationRoutes';
import pricingRoutes from './routes/pricingRoutes';
import contractRoutes from './routes/contractRoutes';
import fraudRoutes from './routes/fraudRoutes';
import hiringRoutes from './routes/hiringRoutes';

// UX & Internationalization Routes
import uxRoutes from './routes/uxRoutes';
import i18nRoutes from './routes/i18nRoutes';
import documentationRoutes from './routes/documentationRoutes';

// Analytics Routes
import analyticsRoutes from './routes/analyticsRoutes';

// Infrastructure Routes
import productionInfrastructureRoutes from './routes/productionInfrastructureRoutes';
import backupDisasterRecoveryRoutes from './routes/backupDisasterRecoveryRoutes';
import advancedMonitoringRoutes from './routes/advancedMonitoringRoutes';
import srePracticesRoutes from './routes/srePracticesRoutes';

// Inventory & Time Tracking Routes
import inventoryRoutes from './routes/inventoryRoutes';
import timeTrackingRoutes from './routes/timeTrackingRoutes';
import completeInventoryRoutes from './routes/completeInventoryRoutes';
import enhancedTimeTrackingRoutes from './routes/enhancedTimeTrackingRoutes';

// Platform Routes
import apiPlatformRoutes from './routes/apiPlatformRoutes';
import aiMlPlatformRoutes from './routes/aiMlPlatformRoutes';
import dataManagementRoutes from './routes/dataManagementRoutes';
import mobileExcellenceRoutes from './routes/mobileExcellenceRoutes';
import advancedMobileRoutes from './routes/advancedMobileRoutes';

// Automation & Reporting Routes
import automationRoutes from './routes/automationRoutes';
import reportingRoutes from './routes/reportingRoutes';
import { setupSwagger } from './swagger/swaggerConfig';

// Import monitoring
import { healthCheck, readinessCheck, livenessCheck } from './monitoring/healthCheck';
import { getMetrics, resetMetrics, collectRequestMetrics, recordError } from './monitoring/metrics';
import logger from './monitoring/logger';
import morganStream from './monitoring/logger';

// Load environment variables
config();

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN || undefined,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: 1.0,
});

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Prisma
const prisma = new PrismaClient();

// Trust proxy for rate limiting and IP detection
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Compression middleware
app.use(compression());

// Request logging
app.use(morgan('combined', { stream: morganStream }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request metrics collection
app.use(collectRequestMetrics);

// Health check endpoints
app.get('/health', healthCheck);
app.get('/ready', readinessCheck);
app.get('/live', livenessCheck);
app.get('/metrics', getMetrics);
app.post('/metrics/reset', resetMetrics);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/files', fileUploadRoutes);
app.use('/api/documents', documentProcessingRoutes);
app.use('/api/batch', batchProcessingRoutes);
app.use('/api/ai/chat', aiChatbotRoutes);
app.use('/api/ai/document', documentIntelligenceRoutes);
app.use('/api/ai/anomaly', anomalyDetectionRoutes);
app.use('/api/ai/recommendations', recommendationsRoutes);
app.use('/api/ai/advisor', aiFinancialAdvisorRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/integrations/quickbooks', quickbooksRoutes);
app.use('/api/integrations/slack', slackRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/sso', ssoRoutes);
app.use('/api/branding', brandingRoutes);
app.use('/api/api-keys', apiKeyRoutes);
app.use('/api/client-portal', clientPortalRoutes);
app.use('/api/payments', paymentRoutes);
// Security & Compliance Routes
app.use('/api/audit', auditRoutes);
app.use('/api/gdpr', gdprRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/advanced-security-compliance', advancedSecurityComplianceRoutes);

// Banking & Financial Routes
app.use('/api/banking', bankingRoutes);
app.use('/api/bank-feed-processing', bankFeedProcessingRoutes);
app.use('/api/financial-health-score', financialHealthScoreRoutes);
app.use('/api/collections', collectionsRoutes);
app.use('/api/investor-reporting', investorReportingRoutes);
app.use('/api/vendor-optimization', vendorOptimizationRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/fraud', fraudRoutes);
app.use('/api/hiring', hiringRoutes);
app.use('/api/recurring', recurringRoutes);
app.use('/api/approval-workflows', approvalWorkflowRoutes);

// AI & Analytics Routes
app.use('/api/ai-copilot', aiCoPilotRoutes);
app.use('/api/churn-prevention', churnPreventionRoutes);
app.use('/api/anomaly-detection', anomalyDetectionRoutes);
app.use('/api/ml-categorization', mlCategorizationRoutes);
app.use('/api/advanced-analytics', advancedAnalyticsRoutes);
app.use('/api/predictive-analytics', predictiveAnalyticsRoutes);
app.use('/api/business-intelligence', businessIntelligenceRoutes);
app.use('/api/custom-report-builder', customReportBuilderRoutes);
app.use('/api/data-visualization', dataVisualizationRoutes);
app.use('/api/analytics', analyticsRoutes);

// UX & Internationalization Routes
app.use('/api/ux', uxRoutes);
app.use('/api/i18n', i18nRoutes);
app.use('/api/documentation', documentationRoutes);

// Infrastructure Routes
app.use('/api/production-infrastructure', productionInfrastructureRoutes);
app.use('/api/backup-disaster-recovery', backupDisasterRecoveryRoutes);
app.use('/api/advanced-monitoring', advancedMonitoringRoutes);
app.use('/api/sre-practices', srePracticesRoutes);

// Inventory & Time Tracking Routes
app.use('/api/complete-inventory', completeInventoryRoutes);
app.use('/api/enhanced-time-tracking', enhancedTimeTrackingRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/time-tracking', timeTrackingRoutes);

// Platform Routes
app.use('/api/api-platform', apiPlatformRoutes);
app.use('/api/ai-ml-platform', aiMlPlatformRoutes);
app.use('/api/data-management', dataManagementRoutes);
app.use('/api/mobile-excellence', mobileExcellenceRoutes);
app.use('/api/advanced-mobile', advancedMobileRoutes);

// Core Routes
app.use('/api/file-upload', fileUploadRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/performance', performanceRoutes);

// Automation & Reporting Routes
app.use('/api/automation', automationRoutes);
app.use('/api/reporting', reportingRoutes);

// Setup Swagger documentation
setupSwagger(app);

// Root endpoint
app.get('/', (req, res) => {
      res.json({
        success: true,
    message: 'VeriGrade Bookkeeping Platform API',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
    res.json({
      success: true,
    message: 'VeriGrade Bookkeeping Platform API',
    version: process.env.npm_package_version || '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      transactions: '/api/transactions',
      invoices: '/api/invoices',
      clients: '/api/clients',
      reports: '/api/reports',
      files: '/api/files',
      documents: '/api/documents',
      batch: '/api/batch',
      ai: {
        chatbot: '/api/ai/chat',
        document: '/api/ai/document',
        anomaly: '/api/ai/anomaly',
        recommendations: '/api/ai/recommendations',
        advisor: '/api/ai/advisor',
      },
      integrations: {
        general: '/api/integrations',
        quickbooks: '/api/integrations/quickbooks',
        slack: '/api/integrations/slack',
      },
      webhooks: '/api/webhooks',
      organizations: '/api/organizations',
      sso: '/api/sso',
      branding: '/api/branding',
      apiKeys: '/api/api-keys',
      clientPortal: '/api/client-portal',
      payments: '/api/payments',
      audit: '/api/audit',
      gdpr: '/api/gdpr',
      security: '/api/security',
      banking: '/api/banking',
      ux: '/api/ux',
      i18n: '/api/i18n',
      analytics: '/api/analytics',
      financialHealthScore: '/api/financial-health-score',
      collections: '/api/collections',
      investorReporting: '/api/investor-reporting',
      vendorOptimization: '/api/vendor-optimization',
      pricing: '/api/pricing',
      contracts: '/api/contracts',
      fraud: '/api/fraud',
      hiring: '/api/hiring',
      aiCopilot: '/api/ai-copilot',
      churnPrevention: '/api/churn-prevention',
      anomalyDetection: '/api/anomaly-detection',
      mlCategorization: '/api/ml-categorization',
      bankFeedProcessing: '/api/bank-feed-processing',
      recurring: '/api/recurring',
      approvalWorkflows: '/api/approval-workflows',
      audit: '/api/audit',
      advancedAnalytics: '/api/advanced-analytics',
      predictiveAnalytics: '/api/predictive-analytics',
      businessIntelligence: '/api/business-intelligence',
      customReportBuilder: '/api/custom-report-builder',
      dataVisualization: '/api/data-visualization',
      productionInfrastructure: '/api/production-infrastructure',
      backupDisasterRecovery: '/api/backup-disaster-recovery',
      advancedMonitoring: '/api/advanced-monitoring',
      completeInventory: '/api/complete-inventory',
      enhancedTimeTracking: '/api/enhanced-time-tracking',
      srePractices: '/api/sre-practices',
      advancedSecurityCompliance: '/api/advanced-security-compliance',
      apiPlatform: '/api/api-platform',
      aiMlPlatform: '/api/ai-ml-platform',
      dataManagement: '/api/data-management',
      mobileExcellence: '/api/mobile-excellence',
      fileUpload: '/api/file-upload',
      ocr: '/api/ocr',
      performance: '/api/performance',
      inventory: '/api/inventory',
      timeTracking: '/api/time-tracking',
      automation: '/api/automation',
      reporting: '/api/reporting',
      integrations: '/api/integrations',
      enterprise: '/api/enterprise',
      clientPortal: '/api/client-portal',
      security: '/api/security',
      banking: '/api/banking',
      ux: '/api/ux',
      documentation: '/api/documentation',
      i18n: '/api/i18n',
      advancedMobile: '/api/advanced-mobile',
        apiDocs: '/api-docs',
    },
    health: '/health',
    metrics: '/metrics',
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Global error handler
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Record error in metrics
  recordError(error, req);

  // Log error
  logger.error('Unhandled error:', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Send error to Sentry
  Sentry.captureException(error);

  // Send response
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
  logger.info(`Metrics: http://localhost:${PORT}/metrics`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  Sentry.captureException(error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  Sentry.captureException(reason);
  process.exit(1);
});

export default app;