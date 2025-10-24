import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ReceiptDetectionService } from '../../services/receiptDetectionService';

describe('ReceiptDetectionService', () => {
  let receiptDetectionService: ReceiptDetectionService;
  const mockImageBuffer = Buffer.from('mock-image-data');

  beforeEach(() => {
    receiptDetectionService = new ReceiptDetectionService();
    jest.clearAllMocks();
  });

  describe('detectReceipt', () => {
    it('should detect receipt with confidence score', async () => {
      const result = await receiptDetectionService.detectReceipt(mockImageBuffer);

      expect(result).toHaveProperty('isReceipt');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('quality');
      expect(result).toHaveProperty('preprocessing');
      expect(typeof result.isReceipt).toBe('boolean');
      expect(typeof result.confidence).toBe('number');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(100);
    });

    it('should analyze image quality', async () => {
      const result = await receiptDetectionService.detectReceipt(mockImageBuffer);

      expect(result.quality).toHaveProperty('brightness');
      expect(result.quality).toHaveProperty('contrast');
      expect(result.quality).toHaveProperty('sharpness');
      expect(typeof result.quality.brightness).toBe('number');
      expect(typeof result.quality.contrast).toBe('number');
      expect(typeof result.quality.sharpness).toBe('number');
    });

    it('should determine preprocessing needs', async () => {
      const result = await receiptDetectionService.detectReceipt(mockImageBuffer);

      expect(result.preprocessing).toHaveProperty('needsRotation');
      expect(result.preprocessing).toHaveProperty('needsBrightnessAdjustment');
      expect(result.preprocessing).toHaveProperty('needsContrastAdjustment');
      expect(typeof result.preprocessing.needsRotation).toBe('boolean');
      expect(typeof result.preprocessing.needsBrightnessAdjustment).toBe('boolean');
      expect(typeof result.preprocessing.needsContrastAdjustment).toBe('boolean');
    });

    it('should detect orientation', async () => {
      const result = await receiptDetectionService.detectReceipt(mockImageBuffer);

      expect(result.orientation).toBeDefined();
      expect(typeof result.orientation).toBe('number');
    });
  });

  describe('analyzeImageQuality', () => {
    it('should calculate brightness correctly', async () => {
      const result = await receiptDetectionService.detectReceipt(mockImageBuffer);

      expect(result.quality.brightness).toBeGreaterThanOrEqual(0);
      expect(result.quality.brightness).toBeLessThanOrEqual(1);
    });

    it('should calculate contrast correctly', async () => {
      const result = await receiptDetectionService.detectReceipt(mockImageBuffer);

      expect(result.quality.contrast).toBeGreaterThanOrEqual(0);
      expect(result.quality.contrast).toBeLessThanOrEqual(1);
    });

    it('should calculate sharpness correctly', async () => {
      const result = await receiptDetectionService.detectReceipt(mockImageBuffer);

      expect(result.quality.sharpness).toBeGreaterThanOrEqual(0);
    });
  });

  describe('extractReceiptFeatures', () => {
    it('should extract receipt features', async () => {
      const result = await receiptDetectionService.detectReceipt(mockImageBuffer);

      // The features are extracted internally, but we can verify the result
      expect(result).toBeDefined();
    });
  });

  describe('detectReceiptShape', () => {
    it('should detect rectangular shape', () => {
      const aspectRatio = 0.8; // Portrait
      const textBlocks = [{ width: 100, height: 50 }];
      const hasReceiptShape = (receiptDetectionService as any).detectReceiptShape(aspectRatio, textBlocks);

      expect(typeof hasReceiptShape).toBe('boolean');
    });

    it('should detect non-rectangular shape', () => {
      const aspectRatio = 0.1; // Very tall
      const textBlocks = [];
      const hasReceiptShape = (receiptDetectionService as any).detectReceiptShape(aspectRatio, textBlocks);

      expect(hasReceiptShape).toBe(false);
    });
  });

  describe('calculateReceiptConfidence', () => {
    it('should calculate confidence based on features', () => {
      const features = {
        hasReceiptShape: true,
        hasTextBlocks: true,
        hasCurrencySymbols: true,
        hasDatePattern: true,
        hasTotalAmount: true,
        aspectRatio: 0.8,
        textDensity: 0.5,
      };

      const quality = {
        brightness: 0.5,
        contrast: 0.6,
        sharpness: 100,
      };

      const confidence = (receiptDetectionService as any).calculateReceiptConfidence(features, quality);

      expect(confidence).toBeGreaterThan(0);
      expect(confidence).toBeLessThanOrEqual(100);
    });

    it('should return low confidence for poor features', () => {
      const features = {
        hasReceiptShape: false,
        hasTextBlocks: false,
        hasCurrencySymbols: false,
        hasDatePattern: false,
        hasTotalAmount: false,
        aspectRatio: 0.1,
        textDensity: 0.1,
      };

      const quality = {
        brightness: 0.1,
        contrast: 0.1,
        sharpness: 10,
      };

      const confidence = (receiptDetectionService as any).calculateReceiptConfidence(features, quality);

      expect(confidence).toBeLessThan(50);
    });
  });

  describe('determinePreprocessingNeeds', () => {
    it('should determine rotation needs', () => {
      const quality = { brightness: 0.5, contrast: 0.5, sharpness: 50 };
      const features = { aspectRatio: 0.1, textDensity: 0.5 };

      const preprocessing = (receiptDetectionService as any).determinePreprocessingNeeds(quality, features);

      expect(preprocessing.needsRotation).toBe(true);
    });

    it('should determine brightness adjustment needs', () => {
      const quality = { brightness: 0.1, contrast: 0.5, sharpness: 50 };
      const features = { aspectRatio: 0.8, textDensity: 0.5 };

      const preprocessing = (receiptDetectionService as any).determinePreprocessingNeeds(quality, features);

      expect(preprocessing.needsBrightnessAdjustment).toBe(true);
    });

    it('should determine contrast adjustment needs', () => {
      const quality = { brightness: 0.5, contrast: 0.1, sharpness: 50 };
      const features = { aspectRatio: 0.8, textDensity: 0.5 };

      const preprocessing = (receiptDetectionService as any).determinePreprocessingNeeds(quality, features);

      expect(preprocessing.needsContrastAdjustment).toBe(true);
    });
  });

  describe('preprocessForOCR', () => {
    it('should preprocess image for better OCR', async () => {
      const detectionResult = {
        isReceipt: true,
        confidence: 80,
        quality: { brightness: 0.3, contrast: 0.2, sharpness: 30 },
        preprocessing: {
          needsRotation: false,
          needsBrightnessAdjustment: true,
          needsContrastAdjustment: true,
        },
        orientation: 0,
      };

      const processedBuffer = await receiptDetectionService.preprocessForOCR(
        mockImageBuffer,
        detectionResult
      );

      expect(processedBuffer).toBeInstanceOf(Buffer);
      expect(processedBuffer.length).toBeGreaterThan(0);
    });

    it('should handle preprocessing errors gracefully', async () => {
      const detectionResult = {
        isReceipt: false,
        confidence: 20,
        quality: { brightness: 0.5, contrast: 0.5, sharpness: 50 },
        preprocessing: {
          needsRotation: false,
          needsBrightnessAdjustment: false,
          needsContrastAdjustment: false,
        },
        orientation: 0,
      };

      const processedBuffer = await receiptDetectionService.preprocessForOCR(
        mockImageBuffer,
        detectionResult
      );

      expect(processedBuffer).toBeInstanceOf(Buffer);
    });
  });

  describe('error handling', () => {
    it('should handle invalid image buffer', async () => {
      const invalidBuffer = Buffer.from('invalid-image-data');
      
      const result = await receiptDetectionService.detectReceipt(invalidBuffer);

      expect(result).toBeDefined();
      expect(result.isReceipt).toBe(false);
      expect(result.confidence).toBe(0);
    });

    it('should handle empty buffer', async () => {
      const emptyBuffer = Buffer.alloc(0);
      
      const result = await receiptDetectionService.detectReceipt(emptyBuffer);

      expect(result).toBeDefined();
      expect(result.isReceipt).toBe(false);
    });

    it('should handle null buffer', async () => {
      const nullBuffer = null as any;
      
      const result = await receiptDetectionService.detectReceipt(nullBuffer);

      expect(result).toBeDefined();
      expect(result.isReceipt).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle very small images', async () => {
      const smallBuffer = Buffer.alloc(100);
      
      const result = await receiptDetectionService.detectReceipt(smallBuffer);

      expect(result).toBeDefined();
    });

    it('should handle very large images', async () => {
      const largeBuffer = Buffer.alloc(10000000); // 10MB
      
      const result = await receiptDetectionService.detectReceipt(largeBuffer);

      expect(result).toBeDefined();
    });

    it('should handle images with extreme aspect ratios', async () => {
      const result = await receiptDetectionService.detectReceipt(mockImageBuffer);

      expect(result).toBeDefined();
      expect(result.preprocessing.needsRotation).toBeDefined();
    });
  });
});







