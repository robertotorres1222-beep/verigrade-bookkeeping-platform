import { Router } from 'express';
import { aiMlPlatformController } from '../controllers/aiMlPlatformController';

const router = Router();

// ML Model Management Routes
router.post('/models', aiMlPlatformController.createMLModel);
router.get('/models', aiMlPlatformController.getMLModels);

// Model Training Management Routes
router.post('/training', aiMlPlatformController.startModelTraining);
router.get('/training', aiMlPlatformController.getModelTrainings);

// Model Deployment Management Routes
router.post('/deployments', aiMlPlatformController.deployModel);
router.get('/deployments', aiMlPlatformController.getModelDeployments);

// Model Prediction Management Routes
router.post('/models/:modelId/predict', aiMlPlatformController.makePrediction);
router.get('/predictions', aiMlPlatformController.getModelPredictions);

// Model Monitoring Management Routes
router.get('/monitoring', aiMlPlatformController.getModelMonitoring);

// Model Drift Detection Routes
router.get('/drift', aiMlPlatformController.getModelDrift);

// Model Performance Analytics Routes
router.get('/performance', aiMlPlatformController.getModelPerformance);

// Model Experiment Management Routes
router.post('/experiments', aiMlPlatformController.createModelExperiment);
router.get('/experiments', aiMlPlatformController.getModelExperiments);

// Model Registry Management Routes
router.post('/registry', aiMlPlatformController.createModelRegistry);
router.get('/registry', aiMlPlatformController.getModelRegistry);

// Model Serving Management Routes
router.get('/serving', aiMlPlatformController.getModelServing);

// Model Feature Store Management Routes
router.post('/feature-store', aiMlPlatformController.createModelFeatureStore);
router.get('/feature-store', aiMlPlatformController.getModelFeatureStore);

// Model Pipeline Management Routes
router.post('/pipelines', aiMlPlatformController.createModelPipeline);
router.get('/pipelines', aiMlPlatformController.getModelPipelines);

// Analytics and Reporting Routes
router.get('/analytics', aiMlPlatformController.getAIMLAnalytics);

export default router;




