import { Request, Response } from 'express';
import { aiMlPlatformService } from '../services/aiMlPlatformService';
import logger from '../utils/logger';

export class AIMLPlatformController {
  // ML Model Management
  async createMLModel(req: Request, res: Response): Promise<void> {
    try {
      const model = await aiMlPlatformService.createMLModel(req.body);
      res.status(201).json({
        success: true,
        data: model,
        message: 'ML model created successfully',
      });
    } catch (error) {
      logger.error('Error creating ML model', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create ML model',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getMLModels(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        type: req.query.type as string || undefined,
        status: req.query.status as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await aiMlPlatformService.getMLModels(filters);
      res.json({
        success: true,
        data: result,
        message: 'ML models retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching ML models', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch ML models',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Model Training Management
  async startModelTraining(req: Request, res: Response): Promise<void> {
    try {
      const training = await aiMlPlatformService.startModelTraining(req.body);
      res.status(201).json({
        success: true,
        data: training,
        message: 'Model training started successfully',
      });
    } catch (error) {
      logger.error('Error starting model training', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to start model training',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getModelTrainings(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        modelId: req.query.modelId as string || undefined,
        status: req.query.status as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await aiMlPlatformService.getModelTrainings(filters);
      res.json({
        success: true,
        data: result,
        message: 'Model trainings retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching model trainings', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch model trainings',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Model Deployment Management
  async deployModel(req: Request, res: Response): Promise<void> {
    try {
      const deployment = await aiMlPlatformService.deployModel(req.body);
      res.status(201).json({
        success: true,
        data: deployment,
        message: 'Model deployment started successfully',
      });
    } catch (error) {
      logger.error('Error deploying model', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to deploy model',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getModelDeployments(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        modelId: req.query.modelId as string || undefined,
        environment: req.query.environment as string || undefined,
        status: req.query.status as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await aiMlPlatformService.getModelDeployments(filters);
      res.json({
        success: true,
        data: result,
        message: 'Model deployments retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching model deployments', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch model deployments',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Model Prediction Management
  async makePrediction(req: Request, res: Response): Promise<void> {
    try {
      const { modelId } = req.params;
      const { input } = req.body;
      const prediction = await aiMlPlatformService.makePrediction(modelId || '', input);
      res.json({
        success: true,
        data: prediction,
        message: 'Model prediction completed successfully',
      });
    } catch (error) {
      logger.error('Error making model prediction', { error, modelId: req.params.modelId, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to make model prediction',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getModelPredictions(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        modelId: req.query.modelId as string || undefined,
        status: req.query.status as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await aiMlPlatformService.getModelPredictions(filters);
      res.json({
        success: true,
        data: result,
        message: 'Model predictions retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching model predictions', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch model predictions',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Model Monitoring Management
  async getModelMonitoring(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        modelId: req.query.modelId as string || undefined,
        metric: req.query.metric as string || undefined,
        status: req.query.status as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await aiMlPlatformService.getModelMonitoring(filters);
      res.json({
        success: true,
        data: result,
        message: 'Model monitoring retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching model monitoring', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch model monitoring',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Model Drift Detection
  async getModelDrift(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        modelId: req.query.modelId as string || undefined,
        status: req.query.status as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await aiMlPlatformService.getModelDrift(filters);
      res.json({
        success: true,
        data: result,
        message: 'Model drift retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching model drift', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch model drift',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Model Performance Analytics
  async getModelPerformance(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        modelId: req.query.modelId as string || undefined,
        metric: req.query.metric as string || undefined,
        period: req.query.period as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await aiMlPlatformService.getModelPerformance(filters);
      res.json({
        success: true,
        data: result,
        message: 'Model performance retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching model performance', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch model performance',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Model Experiment Management
  async createModelExperiment(req: Request, res: Response): Promise<void> {
    try {
      const experiment = await aiMlPlatformService.createModelExperiment(req.body);
      res.status(201).json({
        success: true,
        data: experiment,
        message: 'Model experiment created successfully',
      });
    } catch (error) {
      logger.error('Error creating model experiment', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create model experiment',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getModelExperiments(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        status: req.query.status as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await aiMlPlatformService.getModelExperiments(filters);
      res.json({
        success: true,
        data: result,
        message: 'Model experiments retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching model experiments', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch model experiments',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Model Registry Management
  async createModelRegistry(req: Request, res: Response): Promise<void> {
    try {
      const registry = await aiMlPlatformService.createModelRegistry(req.body);
      res.status(201).json({
        success: true,
        data: registry,
        message: 'Model registry created successfully',
      });
    } catch (error) {
      logger.error('Error creating model registry', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create model registry',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getModelRegistry(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        stage: req.query.stage as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await aiMlPlatformService.getModelRegistry(filters);
      res.json({
        success: true,
        data: result,
        message: 'Model registry retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching model registry', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch model registry',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Model Serving Management
  async getModelServing(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        modelId: req.query.modelId as string || undefined,
        status: req.query.status as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await aiMlPlatformService.getModelServing(filters);
      res.json({
        success: true,
        data: result,
        message: 'Model serving retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching model serving', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch model serving',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Model Feature Store Management
  async createModelFeatureStore(req: Request, res: Response): Promise<void> {
    try {
      const featureStore = await aiMlPlatformService.createModelFeatureStore(req.body);
      res.status(201).json({
        success: true,
        data: featureStore,
        message: 'Model feature store created successfully',
      });
    } catch (error) {
      logger.error('Error creating model feature store', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create model feature store',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getModelFeatureStore(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        type: req.query.type as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await aiMlPlatformService.getModelFeatureStore(filters);
      res.json({
        success: true,
        data: result,
        message: 'Model feature store retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching model feature store', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch model feature store',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Model Pipeline Management
  async createModelPipeline(req: Request, res: Response): Promise<void> {
    try {
      const pipeline = await aiMlPlatformService.createModelPipeline(req.body);
      res.status(201).json({
        success: true,
        data: pipeline,
        message: 'Model pipeline created successfully',
      });
    } catch (error) {
      logger.error('Error creating model pipeline', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create model pipeline',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getModelPipelines(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        status: req.query.status as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await aiMlPlatformService.getModelPipelines(filters);
      res.json({
        success: true,
        data: result,
        message: 'Model pipelines retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching model pipelines', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch model pipelines',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Analytics and Reporting
  async getAIMLAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const analytics = await aiMlPlatformService.getAIMLAnalytics();
      res.json({
        success: true,
        data: analytics,
        message: 'AI/ML analytics retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching AI/ML analytics', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch AI/ML analytics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export const aiMlPlatformController = new AIMLPlatformController();







