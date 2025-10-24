import sharp from 'sharp';
import { logger } from '../utils/logger';

export interface ReceiptDetectionResult {
  isReceipt: boolean;
  confidence: number;
  receiptBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  orientation?: number;
  quality: {
    brightness: number;
    contrast: number;
    sharpness: number;
  };
  preprocessing: {
    needsRotation: boolean;
    needsBrightnessAdjustment: boolean;
    needsContrastAdjustment: boolean;
  };
}

export interface ReceiptFeatures {
  hasReceiptShape: boolean;
  hasTextBlocks: boolean;
  hasCurrencySymbols: boolean;
  hasDatePattern: boolean;
  hasTotalAmount: boolean;
  aspectRatio: number;
  textDensity: number;
}

class ReceiptDetectionService {
  /**
   * Detect if image contains a receipt
   */
  async detectReceipt(imageBuffer: Buffer): Promise<ReceiptDetectionResult> {
    try {
      logger.info('Starting receipt detection analysis');

      // Analyze image quality
      const quality = await this.analyzeImageQuality(imageBuffer);
      
      // Extract receipt features
      const features = await this.extractReceiptFeatures(imageBuffer);
      
      // Calculate confidence score
      const confidence = this.calculateReceiptConfidence(features, quality);
      
      // Determine if it's likely a receipt
      const isReceipt = confidence > 0.6;
      
      // Get receipt bounding box if detected
      const receiptBoundingBox = isReceipt ? await this.findReceiptBoundingBox(imageBuffer) : undefined;
      
      // Determine preprocessing needs
      const preprocessing = this.determinePreprocessingNeeds(quality, features);
      
      // Detect orientation
      const orientation = await this.detectOrientation(imageBuffer);

      const result: ReceiptDetectionResult = {
        isReceipt,
        confidence,
        receiptBoundingBox,
        orientation,
        quality,
        preprocessing,
      };

      logger.info(`Receipt detection completed: ${isReceipt ? 'Receipt detected' : 'Not a receipt'}, confidence: ${confidence}`);
      return result;

    } catch (error) {
      logger.error('Receipt detection failed:', error);
      return {
        isReceipt: false,
        confidence: 0,
        quality: { brightness: 0, contrast: 0, sharpness: 0 },
        preprocessing: {
          needsRotation: false,
          needsBrightnessAdjustment: false,
          needsContrastAdjustment: false,
        },
      };
    }
  }

  /**
   * Analyze image quality metrics
   */
  private async analyzeImageQuality(imageBuffer: Buffer): Promise<{
    brightness: number;
    contrast: number;
    sharpness: number;
  }> {
    try {
      const image = sharp(imageBuffer);
      const { data, info } = await image
        .grayscale()
        .raw()
        .toBuffer({ resolveWithObject: true });

      const pixels = new Uint8Array(data);
      const width = info.width;
      const height = info.height;

      // Calculate brightness (average pixel value)
      let sum = 0;
      for (let i = 0; i < pixels.length; i++) {
        sum += pixels[i];
      }
      const brightness = sum / pixels.length / 255; // Normalize to 0-1

      // Calculate contrast (standard deviation)
      let variance = 0;
      for (let i = 0; i < pixels.length; i++) {
        variance += Math.pow(pixels[i] - (sum / pixels.length), 2);
      }
      const contrast = Math.sqrt(variance / pixels.length) / 255; // Normalize to 0-1

      // Calculate sharpness (Laplacian variance)
      const sharpness = this.calculateSharpness(pixels, width, height);

      return {
        brightness: Math.round(brightness * 100) / 100,
        contrast: Math.round(contrast * 100) / 100,
        sharpness: Math.round(sharpness * 100) / 100,
      };

    } catch (error) {
      logger.error('Image quality analysis failed:', error);
      return { brightness: 0, contrast: 0, sharpness: 0 };
    }
  }

  /**
   * Calculate image sharpness using Laplacian variance
   */
  private calculateSharpness(pixels: Uint8Array, width: number, height: number): number {
    let laplacianSum = 0;
    let count = 0;

    // Apply Laplacian kernel to detect edges
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        const laplacian = 
          -pixels[idx - width] + // top
          -pixels[idx - 1] +     // left
          4 * pixels[idx] +      // center
          -pixels[idx + 1] +     // right
          -pixels[idx + width];  // bottom
        
        laplacianSum += Math.abs(laplacian);
        count++;
      }
    }

    return count > 0 ? laplacianSum / count : 0;
  }

  /**
   * Extract features that indicate a receipt
   */
  private async extractReceiptFeatures(imageBuffer: Buffer): Promise<ReceiptFeatures> {
    try {
      const image = sharp(imageBuffer);
      const metadata = await image.metadata();
      
      // Calculate aspect ratio
      const aspectRatio = metadata.width && metadata.height 
        ? metadata.width / metadata.height 
        : 1;

      // Detect text blocks using edge detection
      const textBlocks = await this.detectTextBlocks(imageBuffer);
      
      // Look for currency symbols and patterns
      const hasCurrencySymbols = await this.detectCurrencySymbols(imageBuffer);
      
      // Detect receipt-like shape (rectangular with text)
      const hasReceiptShape = this.detectReceiptShape(aspectRatio, textBlocks);
      
      // Calculate text density
      const textDensity = this.calculateTextDensity(textBlocks, metadata.width || 0, metadata.height || 0);
      
      // Detect date patterns (this would require OCR, simplified for now)
      const hasDatePattern = await this.detectDatePatterns(imageBuffer);
      
      // Detect total amount patterns
      const hasTotalAmount = await this.detectTotalAmountPatterns(imageBuffer);

      return {
        hasReceiptShape,
        hasTextBlocks: textBlocks.length > 0,
        hasCurrencySymbols,
        hasDatePattern,
        hasTotalAmount,
        aspectRatio,
        textDensity,
      };

    } catch (error) {
      logger.error('Feature extraction failed:', error);
      return {
        hasReceiptShape: false,
        hasTextBlocks: false,
        hasCurrencySymbols: false,
        hasDatePattern: false,
        hasTotalAmount: false,
        aspectRatio: 1,
        textDensity: 0,
      };
    }
  }

  /**
   * Detect text blocks using edge detection
   */
  private async detectTextBlocks(imageBuffer: Buffer): Promise<Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>> {
    try {
      // Convert to grayscale and apply edge detection
      const processedBuffer = await sharp(imageBuffer)
        .grayscale()
        .threshold(128)
        .toBuffer();

      // This is a simplified implementation
      // In a real implementation, you would use more sophisticated text detection
      const textBlocks: Array<{
        x: number;
        y: number;
        width: number;
        height: number;
      }> = [];

      // For now, return empty array - this would be implemented with proper text detection
      return textBlocks;

    } catch (error) {
      logger.error('Text block detection failed:', error);
      return [];
    }
  }

  /**
   * Detect currency symbols in the image
   */
  private async detectCurrencySymbols(imageBuffer: Buffer): Promise<boolean> {
    try {
      // This is a simplified implementation
      // In a real implementation, you would use OCR to detect currency symbols
      return false;
    } catch (error) {
      logger.error('Currency symbol detection failed:', error);
      return false;
    }
  }

  /**
   * Detect if image has receipt-like shape
   */
  private detectReceiptShape(aspectRatio: number, textBlocks: Array<any>): boolean {
    // Receipts are typically rectangular (portrait or landscape)
    const isRectangular = aspectRatio > 0.5 && aspectRatio < 2.0;
    
    // Should have text blocks
    const hasText = textBlocks.length > 0;
    
    return isRectangular && hasText;
  }

  /**
   * Calculate text density
   */
  private calculateTextDensity(textBlocks: Array<any>, width: number, height: number): number {
    if (textBlocks.length === 0 || width === 0 || height === 0) return 0;
    
    const totalTextArea = textBlocks.reduce((sum, block) => 
      sum + (block.width * block.height), 0
    );
    
    return totalTextArea / (width * height);
  }

  /**
   * Detect date patterns (simplified)
   */
  private async detectDatePatterns(imageBuffer: Buffer): Promise<boolean> {
    // This would require OCR to detect date patterns
    // For now, return false
    return false;
  }

  /**
   * Detect total amount patterns (simplified)
   */
  private async detectTotalAmountPatterns(imageBuffer: Buffer): Promise<boolean> {
    // This would require OCR to detect amount patterns
    // For now, return false
    return false;
  }

  /**
   * Calculate confidence score for receipt detection
   */
  private calculateReceiptConfidence(
    features: ReceiptFeatures, 
    quality: { brightness: number; contrast: number; sharpness: number }
  ): number {
    let confidence = 0;
    let factors = 0;

    // Receipt shape (30% weight)
    if (features.hasReceiptShape) {
      confidence += 30;
      factors++;
    }

    // Text blocks (25% weight)
    if (features.hasTextBlocks) {
      confidence += 25;
      factors++;
    }

    // Currency symbols (20% weight)
    if (features.hasCurrencySymbols) {
      confidence += 20;
      factors++;
    }

    // Date patterns (10% weight)
    if (features.hasDatePattern) {
      confidence += 10;
      factors++;
    }

    // Total amount patterns (10% weight)
    if (features.hasTotalAmount) {
      confidence += 10;
      factors++;
    }

    // Text density (5% weight)
    if (features.textDensity > 0.1) {
      confidence += 5;
      factors++;
    }

    // Image quality bonus
    if (quality.brightness > 0.3 && quality.brightness < 0.8) {
      confidence += 5;
      factors++;
    }

    if (quality.contrast > 0.3) {
      confidence += 5;
      factors++;
    }

    if (quality.sharpness > 50) {
      confidence += 5;
      factors++;
    }

    return factors > 0 ? Math.min(confidence, 100) : 0;
  }

  /**
   * Find receipt bounding box in image
   */
  private async findReceiptBoundingBox(imageBuffer: Buffer): Promise<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | undefined> {
    try {
      // This is a simplified implementation
      // In a real implementation, you would use contour detection to find the receipt boundaries
      const image = sharp(imageBuffer);
      const metadata = await image.metadata();
      
      // For now, return the full image bounds
      return {
        x: 0,
        y: 0,
        width: metadata.width || 0,
        height: metadata.height || 0,
      };

    } catch (error) {
      logger.error('Receipt bounding box detection failed:', error);
      return undefined;
    }
  }

  /**
   * Determine preprocessing needs
   */
  private determinePreprocessingNeeds(
    quality: { brightness: number; contrast: number; sharpness: number },
    features: ReceiptFeatures
  ): {
    needsRotation: boolean;
    needsBrightnessAdjustment: boolean;
    needsContrastAdjustment: boolean;
  } {
    return {
      needsRotation: features.aspectRatio < 0.5 || features.aspectRatio > 2.0,
      needsBrightnessAdjustment: quality.brightness < 0.3 || quality.brightness > 0.8,
      needsContrastAdjustment: quality.contrast < 0.3,
    };
  }

  /**
   * Detect image orientation
   */
  private async detectOrientation(imageBuffer: Buffer): Promise<number> {
    try {
      // This is a simplified implementation
      // In a real implementation, you would analyze text orientation
      return 0; // No rotation needed
    } catch (error) {
      logger.error('Orientation detection failed:', error);
      return 0;
    }
  }

  /**
   * Preprocess image for better OCR results
   */
  async preprocessForOCR(
    imageBuffer: Buffer, 
    detectionResult: ReceiptDetectionResult
  ): Promise<Buffer> {
    try {
      let processedImage = sharp(imageBuffer);

      // Apply rotation if needed
      if (detectionResult.preprocessing.needsRotation && detectionResult.orientation) {
        processedImage = processedImage.rotate(detectionResult.orientation);
      }

      // Apply brightness adjustment if needed
      if (detectionResult.preprocessing.needsBrightnessAdjustment) {
        const brightness = detectionResult.quality.brightness < 0.3 ? 1.5 : 0.8;
        processedImage = processedImage.modulate({ brightness });
      }

      // Apply contrast adjustment if needed
      if (detectionResult.preprocessing.needsContrastAdjustment) {
        processedImage = processedImage.linear(1.2, -(128 * 0.2));
      }

      // Apply receipt-specific preprocessing
      if (detectionResult.isReceipt) {
        processedImage = processedImage
          .grayscale()
          .normalize()
          .sharpen()
          .threshold(128);
      }

      return await processedImage.png().toBuffer();

    } catch (error) {
      logger.error('Image preprocessing failed:', error);
      return imageBuffer; // Return original if preprocessing fails
    }
  }
}

// Create singleton instance
export const receiptDetectionService = new ReceiptDetectionService();

export default ReceiptDetectionService;






