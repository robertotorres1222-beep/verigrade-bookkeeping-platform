import express from 'express';
import aiController from '../controllers/aiController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Anomaly Detection
router.get('/anomalies/:userId', authenticateToken, aiController.detectAnomalies);

// Predictive Cash Flow
router.get('/predict-cash-flow/:userId', authenticateToken, aiController.predictCashFlow);

// NLP Queries
router.post('/nlp-query/:userId', authenticateToken, aiController.processNLPQuery);

// Pattern Recognition
router.get('/patterns/:userId', authenticateToken, aiController.recognizePatterns);

// Model Training
router.post('/train-model', authenticateToken, aiController.trainModel);

export default router;










