import express from 'express';
import {
  createReport,
  getReports,
  createDashboard,
  getDashboards,
  addWidget,
  executeQuery,
  generateKPIs,
  createAnalysis,
  getAnalyses,
  createAlert,
  getAlerts,
  checkAlerts,
  generateInsights,
  exportBIData,
  getDashboardSummary,
  getBIPerformance
} from '../controllers/businessIntelligenceController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @swagger
 * /api/business-intelligence/{companyId}/reports:
 *   post:
 *     summary: Create a new BI report
 *     tags: [Business Intelligence]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Report name
 *               description:
 *                 type: string
 *                 description: Report description
 *               category:
 *                 type: string
 *                 description: Report category
 *               type:
 *                 type: string
 *                 enum: [dashboard, report, analysis]
 *                 description: Report type
 *               data:
 *                 type: object
 *                 description: Report data
 *               filters:
 *                 type: object
 *                 description: Report filters
 *               isPublic:
 *                 type: boolean
 *                 description: Whether report is public
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Report tags
 *     responses:
 *       200:
 *         description: BI report created successfully
 */
router.post('/:companyId/reports', createReport);

/**
 * @swagger
 * /api/business-intelligence/{companyId}/reports:
 *   get:
 *     summary: Get BI reports
 *     tags: [Business Intelligence]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by type
 *       - in: query
 *         name: isPublic
 *         schema:
 *           type: boolean
 *         description: Filter by public status
 *     responses:
 *       200:
 *         description: BI reports retrieved successfully
 */
router.get('/:companyId/reports', getReports);

/**
 * @swagger
 * /api/business-intelligence/{companyId}/dashboards:
 *   post:
 *     summary: Create a BI dashboard
 *     tags: [Business Intelligence]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               layout:
 *                 type: object
 *               filters:
 *                 type: object
 *               refreshInterval:
 *                 type: number
 *               isPublic:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: BI dashboard created successfully
 */
router.post('/:companyId/dashboards', createDashboard);

/**
 * @swagger
 * /api/business-intelligence/{companyId}/dashboards:
 *   get:
 *     summary: Get BI dashboards
 *     tags: [Business Intelligence]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: BI dashboards retrieved successfully
 */
router.get('/:companyId/dashboards', getDashboards);

/**
 * @swagger
 * /api/business-intelligence/dashboards/{dashboardId}/widgets:
 *   post:
 *     summary: Add widget to dashboard
 *     tags: [Business Intelligence]
 *     parameters:
 *       - in: path
 *         name: dashboardId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [chart, table, metric, kpi, gauge, map]
 *               title:
 *                 type: string
 *               dataSource:
 *                 type: string
 *               query:
 *                 type: string
 *               config:
 *                 type: object
 *               position:
 *                 type: object
 *               refreshInterval:
 *                 type: number
 *     responses:
 *       200:
 *         description: Widget added successfully
 */
router.post('/dashboards/:dashboardId/widgets', addWidget);

/**
 * @swagger
 * /api/business-intelligence/{companyId}/query:
 *   post:
 *     summary: Execute custom BI query
 *     tags: [Business Intelligence]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *                 description: SQL query to execute
 *               parameters:
 *                 type: array
 *                 items:
 *                   type: any
 *                 description: Query parameters
 *     responses:
 *       200:
 *         description: Query executed successfully
 *       400:
 *         description: Invalid query
 */
router.post('/:companyId/query', executeQuery);

/**
 * @swagger
 * /api/business-intelligence/{companyId}/kpis:
 *   get:
 *     summary: Generate KPI metrics
 *     tags: [Business Intelligence]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: KPIs generated successfully
 */
router.get('/:companyId/kpis', generateKPIs);

/**
 * @swagger
 * /api/business-intelligence/{companyId}/analyses:
 *   post:
 *     summary: Create BI analysis
 *     tags: [Business Intelligence]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [trend, comparison, correlation, forecast, segmentation]
 *               data:
 *                 type: object
 *               insights:
 *                 type: array
 *                 items:
 *                   type: string
 *               recommendations:
 *                 type: array
 *                 items:
 *                   type: string
 *               confidence:
 *                 type: number
 *               methodology:
 *                 type: string
 *     responses:
 *       200:
 *         description: BI analysis created successfully
 */
router.post('/:companyId/analyses', createAnalysis);

/**
 * @swagger
 * /api/business-intelligence/{companyId}/analyses:
 *   get:
 *     summary: Get BI analyses
 *     tags: [Business Intelligence]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by analysis type
 *     responses:
 *       200:
 *         description: BI analyses retrieved successfully
 */
router.get('/:companyId/analyses', getAnalyses);

/**
 * @swagger
 * /api/business-intelligence/{companyId}/alerts:
 *   post:
 *     summary: Create BI alert
 *     tags: [Business Intelligence]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               condition:
 *                 type: string
 *               threshold:
 *                 type: number
 *               operator:
 *                 type: string
 *                 enum: [>, <, =, >=, <=, !=]
 *               severity:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               message:
 *                 type: string
 *               action:
 *                 type: string
 *     responses:
 *       200:
 *         description: BI alert created successfully
 */
router.post('/:companyId/alerts', createAlert);

/**
 * @swagger
 * /api/business-intelligence/{companyId}/alerts:
 *   get:
 *     summary: Get BI alerts
 *     tags: [Business Intelligence]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: BI alerts retrieved successfully
 */
router.get('/:companyId/alerts', getAlerts);

/**
 * @swagger
 * /api/business-intelligence/{companyId}/alerts/check:
 *   post:
 *     summary: Check and trigger alerts
 *     tags: [Business Intelligence]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Alerts checked successfully
 */
router.post('/:companyId/alerts/check', checkAlerts);

/**
 * @swagger
 * /api/business-intelligence/{companyId}/insights:
 *   get:
 *     summary: Generate comprehensive BI insights
 *     tags: [Business Intelligence]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: BI insights generated successfully
 */
router.get('/:companyId/insights', generateInsights);

/**
 * @swagger
 * /api/business-intelligence/{companyId}/export:
 *   get:
 *     summary: Export BI data
 *     tags: [Business Intelligence]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, excel, json]
 *           default: json
 *         description: Export format
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [reports, dashboards, kpis, analyses, alerts, insights]
 *           default: insights
 *         description: Type of data to export
 *     responses:
 *       200:
 *         description: Data exported successfully
 */
router.get('/:companyId/export', exportBIData);

/**
 * @swagger
 * /api/business-intelligence/{companyId}/dashboard:
 *   get:
 *     summary: Get BI dashboard summary
 *     tags: [Business Intelligence]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: BI dashboard summary retrieved successfully
 */
router.get('/:companyId/dashboard', getDashboardSummary);

/**
 * @swagger
 * /api/business-intelligence/{companyId}/performance:
 *   get:
 *     summary: Get BI performance metrics
 *     tags: [Business Intelligence]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: BI performance metrics retrieved successfully
 */
router.get('/:companyId/performance', getBIPerformance);

export default router;





