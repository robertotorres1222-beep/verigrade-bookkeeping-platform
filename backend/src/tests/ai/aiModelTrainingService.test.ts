import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import AIModelTrainingService from '../../services/aiModelTrainingService';

describe('AI Model Training Service', () => {
  let trainingService: AIModelTrainingService;

  beforeEach(() => {
    trainingService = new AIModelTrainingService();
    jest.clearAllMocks();
  });

  describe('startModelTraining', () => {
    it('should start a new training job', async () => {
      const modelType = 'chatbot';
      const trainingData = { samples: 1000, features: 50 };
      
      const result = await trainingService.startModelTraining(modelType, trainingData);
      
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('modelType');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('progress');
      expect(result).toHaveProperty('startTime');
      expect(result).toHaveProperty('trainingData');
      expect(result).toHaveProperty('modelVersion');
      expect(result).toHaveProperty('performance');
      expect(result.modelType).toBe(modelType);
      expect(result.status).toBe('pending');
      expect(result.progress).toBe(0);
    });

    it('should generate unique job IDs', async () => {
      const modelType = 'chatbot';
      const trainingData = { samples: 1000 };
      
      const job1 = await trainingService.startModelTraining(modelType, trainingData);
      const job2 = await trainingService.startModelTraining(modelType, trainingData);
      
      expect(job1.id).not.toBe(job2.id);
    });

    it('should generate model versions', async () => {
      const modelType = 'document_intelligence';
      const trainingData = { samples: 500 };
      
      const result = await trainingService.startModelTraining(modelType, trainingData);
      
      expect(result.modelVersion).toContain(modelType);
      expect(result.modelVersion).toContain('_v');
    });
  });

  describe('getAllTrainingJobs', () => {
    it('should return all training jobs', async () => {
      const jobs = await trainingService.getAllTrainingJobs();
      
      expect(Array.isArray(jobs)).toBe(true);
      expect(jobs.length).toBeGreaterThan(0);
      
      jobs.forEach(job => {
        expect(job).toHaveProperty('id');
        expect(job).toHaveProperty('modelType');
        expect(job).toHaveProperty('status');
        expect(job).toHaveProperty('progress');
        expect(job).toHaveProperty('startTime');
        expect(job).toHaveProperty('modelVersion');
        expect(job).toHaveProperty('performance');
      });
    });

    it('should include completed jobs', async () => {
      const jobs = await trainingService.getAllTrainingJobs();
      const completedJobs = jobs.filter(job => job.status === 'completed');
      
      expect(completedJobs.length).toBeGreaterThan(0);
      completedJobs.forEach(job => {
        expect(job).toHaveProperty('endTime');
        expect(job.performance.accuracy).toBeGreaterThan(0);
      });
    });
  });

  describe('getModelVersions', () => {
    it('should return all model versions', async () => {
      const versions = await trainingService.getModelVersions();
      
      expect(Array.isArray(versions)).toBe(true);
      expect(versions.length).toBeGreaterThan(0);
      
      versions.forEach(version => {
        expect(version).toHaveProperty('version');
        expect(version).toHaveProperty('modelType');
        expect(version).toHaveProperty('createdAt');
        expect(version).toHaveProperty('performance');
        expect(version).toHaveProperty('isActive');
        expect(version).toHaveProperty('trainingDataSize');
        expect(version).toHaveProperty('features');
      });
    });

    it('should filter by model type', async () => {
      const chatbotVersions = await trainingService.getModelVersions('chatbot');
      
      expect(Array.isArray(chatbotVersions)).toBe(true);
      chatbotVersions.forEach(version => {
        expect(version.modelType).toBe('chatbot');
      });
    });

    it('should include performance metrics', async () => {
      const versions = await trainingService.getModelVersions();
      
      versions.forEach(version => {
        expect(version.performance).toHaveProperty('accuracy');
        expect(version.performance).toHaveProperty('precision');
        expect(version.performance).toHaveProperty('recall');
        expect(version.performance).toHaveProperty('f1Score');
        expect(version.performance.accuracy).toBeGreaterThan(0);
        expect(version.performance.accuracy).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('deployModelVersion', () => {
    it('should deploy a model version', async () => {
      const version = 'chatbot_v20240101120000';
      
      const result = await trainingService.deployModelVersion(version);
      
      expect(result).toBe(true);
    });

    it('should handle deployment errors', async () => {
      // Mock deployment failure
      jest.spyOn(console, 'log').mockImplementation(() => {
        throw new Error('Deployment failed');
      });
      
      const version = 'invalid_version';
      
      const result = await trainingService.deployModelVersion(version);
      
      expect(result).toBe(false);
    });
  });

  describe('rollbackModelVersion', () => {
    it('should rollback to a previous version', async () => {
      const version = 'chatbot_v20240101100000';
      
      const result = await trainingService.rollbackModelVersion(version);
      
      expect(result).toBe(true);
    });
  });

  describe('startABTest', () => {
    it('should start an A/B test', async () => {
      const versionA = 'chatbot_v20240101120000';
      const versionB = 'chatbot_v20240101130000';
      const trafficSplit = 0.5;
      
      const testId = await trainingService.startABTest(versionA, versionB, trafficSplit);
      
      expect(testId).toContain('ab_test_');
      expect(testId.length).toBeGreaterThan(10);
    });

    it('should use default traffic split', async () => {
      const versionA = 'chatbot_v1';
      const versionB = 'chatbot_v2';
      
      const testId = await trainingService.startABTest(versionA, versionB);
      
      expect(testId).toContain('ab_test_');
    });
  });

  describe('getABTestResults', () => {
    it('should return A/B test results', async () => {
      const testId = 'ab_test_123';
      
      const results = await trainingService.getABTestResults(testId);
      
      expect(results).toHaveProperty('testId');
      expect(results).toHaveProperty('status');
      expect(results).toHaveProperty('results');
      expect(results).toHaveProperty('recommendation');
      expect(results.testId).toBe(testId);
      expect(results.results).toHaveProperty('versionA');
      expect(results.results).toHaveProperty('versionB');
    });
  });

  describe('getTrainingDataPipeline', () => {
    it('should return training data pipeline information', async () => {
      const pipeline = await trainingService.getTrainingDataPipeline();
      
      expect(pipeline).toHaveProperty('dataSources');
      expect(pipeline).toHaveProperty('processingSteps');
      expect(pipeline).toHaveProperty('qualityMetrics');
      expect(pipeline).toHaveProperty('lastUpdated');
      expect(Array.isArray(pipeline.dataSources)).toBe(true);
      expect(Array.isArray(pipeline.processingSteps)).toBe(true);
      expect(pipeline.qualityMetrics).toHaveProperty('completeness');
      expect(pipeline.qualityMetrics).toHaveProperty('accuracy');
      expect(pipeline.qualityMetrics).toHaveProperty('consistency');
    });
  });

  describe('triggerAutoRetraining', () => {
    it('should trigger auto-retraining for performance degradation', async () => {
      const modelType = 'chatbot';
      const trigger = 'performance_degradation';
      
      const result = await trainingService.triggerAutoRetraining(modelType, trigger);
      
      expect(result).toBe(true);
    });

    it('should trigger auto-retraining for data drift', async () => {
      const modelType = 'document_intelligence';
      const trigger = 'data_drift';
      
      const result = await trainingService.triggerAutoRetraining(modelType, trigger);
      
      expect(result).toBe(true);
    });

    it('should trigger auto-retraining on schedule', async () => {
      const modelType = 'anomaly_detection';
      const trigger = 'scheduled';
      
      const result = await trainingService.triggerAutoRetraining(modelType, trigger);
      
      expect(result).toBe(true);
    });
  });
});







