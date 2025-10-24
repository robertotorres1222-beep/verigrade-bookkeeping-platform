import express from 'express';
import {
  trainModels,
  generateRevenueForecast,
  generateExpenseForecast,
  generateCashFlowForecast,
  predictCustomerChurn,
  performCustomerSegmentation,
  detectAnomalies,
  getModelPerformance,
  retrainModels,
  getPredictionsDashboard,
  getPredictionInsights,
  exportPredictionData
} from '../controllers/predictiveAnalyticsController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @swagger
 * /api/predictive-analytics/{companyId}/train:
 *   post:
 *     summary: Train ML models for predictions
 *     tags: [Predictive Analytics]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               modelIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Specific model IDs to train (optional)
 *     responses:
 *       200:
 *         description: Models trained successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       type:
 *                         type: string
 *                       status:
 *                         type: string
 *                       accuracy:
 *                         type: number
 *                       lastTrained:
 *                         type: string
 *                       version:
 *                         type: string
 *                       features:
 *                         type: array
 *                         items:
 *                           type: string
 *                       hyperparameters:
 *                         type: object
 *                 message:
 *                   type: string
 */
router.post('/:companyId/train', trainModels);

/**
 * @swagger
 * /api/predictive-analytics/{companyId}/forecast/revenue:
 *   get:
 *     summary: Generate revenue forecast
 *     tags: [Predictive Analytics]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: periods
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Number of periods to forecast
 *     responses:
 *       200:
 *         description: Revenue forecast generated successfully
 */
router.get('/:companyId/forecast/revenue', generateRevenueForecast);

/**
 * @swagger
 * /api/predictive-analytics/{companyId}/forecast/expenses:
 *   get:
 *     summary: Generate expense forecast
 *     tags: [Predictive Analytics]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: periods
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Number of periods to forecast
 *     responses:
 *       200:
 *         description: Expense forecast generated successfully
 */
router.get('/:companyId/forecast/expenses', generateExpenseForecast);

/**
 * @swagger
 * /api/predictive-analytics/{companyId}/forecast/cashflow:
 *   get:
 *     summary: Generate cash flow forecast
 *     tags: [Predictive Analytics]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: periods
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Number of periods to forecast
 *     responses:
 *       200:
 *         description: Cash flow forecast generated successfully
 */
router.get('/:companyId/forecast/cashflow', generateCashFlowForecast);

/**
 * @swagger
 * /api/predictive-analytics/{companyId}/churn:
 *   get:
 *     summary: Predict customer churn
 *     tags: [Predictive Analytics]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer churn predictions generated successfully
 */
router.get('/:companyId/churn', predictCustomerChurn);

/**
 * @swagger
 * /api/predictive-analytics/{companyId}/segmentation:
 *   get:
 *     summary: Perform customer segmentation
 *     tags: [Predictive Analytics]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer segmentation completed successfully
 */
router.get('/:companyId/segmentation', performCustomerSegmentation);

/**
 * @swagger
 * /api/predictive-analytics/{companyId}/anomalies:
 *   get:
 *     summary: Detect anomalies in financial data
 *     tags: [Predictive Analytics]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: metric
 *         required: true
 *         schema:
 *           type: string
 *         description: Metric to analyze for anomalies
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days to analyze
 *     responses:
 *       200:
 *         description: Anomalies detected successfully
 *       400:
 *         description: Metric parameter is required
 */
router.get('/:companyId/anomalies', detectAnomalies);

/**
 * @swagger
 * /api/predictive-analytics/{companyId}/performance:
 *   get:
 *     summary: Get model performance metrics
 *     tags: [Predictive Analytics]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Model performance metrics retrieved successfully
 */
router.get('/:companyId/performance', getModelPerformance);

/**
 * @swagger
 * /api/predictive-analytics/{companyId}/retrain:
 *   post:
 *     summary: Retrain ML models
 *     tags: [Predictive Analytics]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               modelIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Specific model IDs to retrain (optional)
 *     responses:
 *       200:
 *         description: Models retrained successfully
 */
router.post('/:companyId/retrain', retrainModels);

/**
 * @swagger
 * /api/predictive-analytics/{companyId}/dashboard:
 *   get:
 *     summary: Get comprehensive predictions dashboard
 *     tags: [Predictive Analytics]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: periods
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Number of periods to forecast
 *     responses:
 *       200:
 *         description: Predictions dashboard retrieved successfully
 */
router.get('/:companyId/dashboard', getPredictionsDashboard);

/**
 * @swagger
 * /api/predictive-analytics/{companyId}/insights:
 *   get:
 *     summary: Get prediction insights and recommendations
 *     tags: [Predictive Analytics]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Prediction insights retrieved successfully
 */
router.get('/:companyId/insights', getPredictionInsights);

/**
 * @swagger
 * /api/predictive-analytics/{companyId}/export:
 *   get:
 *     summary: Export prediction data
 *     tags: [Predictive Analytics]
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
 *           enum: [json, csv]
 *           default: json
 *         description: Export format
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [all, forecasts, predictions, anomalies]
 *           default: all
 *         description: Type of data to export
 *     responses:
 *       200:
 *         description: Data exported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *           text/csv:
 *             schema:
 *               type: string
 */
router.get('/:companyId/export', exportPredictionData);

export default router;