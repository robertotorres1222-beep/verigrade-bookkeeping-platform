import { Request, Response } from 'express';
import aiService from '../services/aiService';
import { authenticateToken } from '../middleware/auth';

export class AIController {
  // Anomaly Detection
  async detectAnomalies(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { dataType } = req.query;
      const anomalies = await aiService.detectAnomalies(userId, dataType as string);
      res.json(anomalies);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Predictive Cash Flow
  async predictCashFlow(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { days } = req.query;
      const predictions = await aiService.predictCashFlow(userId, parseInt(days as string) || 30);
      res.json(predictions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // NLP Queries
  async processNLPQuery(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { query } = req.body;
      const result = await aiService.processNLPQuery(userId, query);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Pattern Recognition
  async recognizePatterns(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { dataType } = req.query;
      const patterns = await aiService.recognizePatterns(userId, dataType as string);
      res.json(patterns);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Model Training
  async trainModel(req: Request, res: Response) {
    try {
      const { modelType, trainingData } = req.body;
      const result = await aiService.trainModel(modelType, trainingData);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new AIController();






