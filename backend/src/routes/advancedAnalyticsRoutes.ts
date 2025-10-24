import express from 'express';
import {
  getAnalyticsMetrics,
  getTimeSeriesData,
  getCohortAnalysis,
  getPredictiveInsights,
  getBusinessIntelligence,
  executeCustomQuery,
  exportAnalyticsData,
  getDashboardSummary,
  getRealTimeUpdates,
  getAnalyticsPerformance
} from '../controllers/advancedAnalyticsController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @swagger
 * /api/advanced-analytics/{companyId}/metrics:
 *   get:
 *     summary: Get comprehensive analytics metrics
 *     tags: [Advanced Analytics]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 12m, 24m]
 *           default: 30d
 *         description: Time period for analytics
 *     responses:
 *       200:
 *         description: Analytics metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     revenue:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         monthly:
 *                           type: number
 *                         growth:
 *                           type: number
 *                         trend:
 *                           type: string
 *                           enum: [up, down, stable]
 *                     expenses:
 *                       type: object
 *                     profit:
 *                       type: object
 *                     customers:
 *                       type: object
 *                     cashFlow:
 *                       type: object
 */
router.get('/:companyId/metrics', getAnalyticsMetrics);

/**
 * @swagger
 * /api/advanced-analytics/{companyId}/time-series:
 *   get:
 *     summary: Get time series data for charts
 *     tags: [Advanced Analytics]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 12m, 24m]
 *           default: 12m
 *     responses:
 *       200:
 *         description: Time series data retrieved successfully
 */
router.get('/:companyId/time-series', getTimeSeriesData);

/**
 * @swagger
 * /api/advanced-analytics/{companyId}/cohort-analysis:
 *   get:
 *     summary: Get cohort analysis
 *     tags: [Advanced Analytics]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           default: 12m
 *     responses:
 *       200:
 *         description: Cohort analysis retrieved successfully
 */
router.get('/:companyId/cohort-analysis', getCohortAnalysis);

/**
 * @swagger
 * /api/advanced-analytics/{companyId}/predictive-insights:
 *   get:
 *     summary: Get predictive insights using ML models
 *     tags: [Advanced Analytics]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Predictive insights retrieved successfully
 */
router.get('/:companyId/predictive-insights', getPredictiveInsights);

/**
 * @swagger
 * /api/advanced-analytics/{companyId}/business-intelligence:
 *   get:
 *     summary: Get business intelligence insights
 *     tags: [Advanced Analytics]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Business intelligence retrieved successfully
 */
router.get('/:companyId/business-intelligence', getBusinessIntelligence);

/**
 * @swagger
 * /api/advanced-analytics/{companyId}/custom-query:
 *   post:
 *     summary: Execute custom analytics query
 *     tags: [Advanced Analytics]
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
 *         description: Custom query executed successfully
 *       400:
 *         description: Invalid query
 *       500:
 *         description: Query execution failed
 */
router.post('/:companyId/custom-query', executeCustomQuery);

/**
 * @swagger
 * /api/advanced-analytics/{companyId}/export:
 *   post:
 *     summary: Export analytics data
 *     tags: [Advanced Analytics]
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
 *               format:
 *                 type: string
 *                 enum: [csv, excel, json]
 *                 default: json
 *               filters:
 *                 type: object
 *                 description: Export filters
 *     responses:
 *       200:
 *         description: Data exported successfully
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 */
router.post('/:companyId/export', exportAnalyticsData);

/**
 * @swagger
 * /api/advanced-analytics/{companyId}/dashboard:
 *   get:
 *     summary: Get complete analytics dashboard summary
 *     tags: [Advanced Analytics]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           default: 30d
 *     responses:
 *       200:
 *         description: Dashboard summary retrieved successfully
 */
router.get('/:companyId/dashboard', getDashboardSummary);

/**
 * @swagger
 * /api/advanced-analytics/{companyId}/real-time:
 *   get:
 *     summary: Get real-time analytics updates
 *     tags: [Advanced Analytics]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Real-time updates retrieved successfully
 */
router.get('/:companyId/real-time', getRealTimeUpdates);

/**
 * @swagger
 * /api/advanced-analytics/{companyId}/performance:
 *   get:
 *     summary: Get analytics performance metrics
 *     tags: [Advanced Analytics]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Performance metrics retrieved successfully
 */
router.get('/:companyId/performance', getAnalyticsPerformance);

export default router;





