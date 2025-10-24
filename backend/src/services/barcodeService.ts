import { zxing } from '@zxing/library';
import { createCanvas, loadImage } from 'canvas';

interface BarcodeResult {
  text: string;
  format: string;
  confidence: number;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface ProductInfo {
  name: string;
  sku: string;
  price: number;
  category: string;
  description?: string;
  imageUrl?: string;
}

class BarcodeService {
  private reader: any;

  constructor() {
    this.reader = new zxing.BrowserMultiFormatReader();
  }

  /**
   * Scan barcode from image buffer
   */
  async scanBarcode(imageBuffer: Buffer): Promise<BarcodeResult | null> {
    try {
      // Convert buffer to image
      const image = await loadImage(imageBuffer);
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);

      // Convert canvas to image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Create ImageData object for ZXing
      const source = new zxing.LuminanceSource(canvas.width, canvas.height);
      source.setMatrix(imageData.data);

      // Decode barcode
      const result = await this.reader.decodeFromImageData(imageData);
      
      if (result) {
        return {
          text: result.getText(),
          format: result.getBarcodeFormat().toString(),
          confidence: result.getResultPoints()?.length || 0,
          position: {
            x: 0,
            y: 0,
            width: canvas.width,
            height: canvas.height,
          },
        };
      }

      return null;
    } catch (error) {
      console.error('Error scanning barcode:', error);
      return null;
    }
  }

  /**
   * Scan barcode from file path
   */
  async scanBarcodeFromFile(filePath: string): Promise<BarcodeResult | null> {
    try {
      const fs = require('fs');
      const imageBuffer = fs.readFileSync(filePath);
      return await this.scanBarcode(imageBuffer);
    } catch (error) {
      console.error('Error scanning barcode from file:', error);
      return null;
    }
  }

  /**
   * Look up product information by barcode
   */
  async lookupProduct(barcode: string): Promise<ProductInfo | null> {
    try {
      // In a real implementation, this would query a product database
      // For now, we'll return mock data
      const mockProducts: Record<string, ProductInfo> = {
        '1234567890123': {
          name: 'Widget A',
          sku: 'WID-A-001',
          price: 29.99,
          category: 'Electronics',
          description: 'High-quality widget for professional use',
        },
        '2345678901234': {
          name: 'Gadget B',
          sku: 'GAD-B-002',
          price: 49.99,
          category: 'Tools',
          description: 'Multi-purpose gadget for various tasks',
        },
        '3456789012345': {
          name: 'Component C',
          sku: 'COM-C-003',
          price: 15.99,
          category: 'Hardware',
          description: 'Essential component for assembly',
        },
      };

      return mockProducts[barcode] || null;
    } catch (error) {
      console.error('Error looking up product:', error);
      return null;
    }
  }

  /**
   * Validate barcode format
   */
  validateBarcode(barcode: string): boolean {
    // Basic validation for common barcode formats
    const patterns = {
      UPC: /^\d{12}$/,
      EAN: /^\d{13}$/,
      ISBN: /^\d{10}$|^\d{13}$/,
      Code128: /^[A-Za-z0-9]+$/,
    };

    return Object.values(patterns).some(pattern => pattern.test(barcode));
  }

  /**
   * Generate barcode image
   */
  async generateBarcode(text: string, format: string = 'CODE128'): Promise<Buffer> {
    try {
      const { createCanvas } = require('canvas');
      const canvas = createCanvas(300, 100);
      const ctx = canvas.getContext('2d');

      // Simple barcode generation (in production, use a proper barcode library)
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);

      return canvas.toBuffer('image/png');
    } catch (error) {
      console.error('Error generating barcode:', error);
      throw error;
    }
  }

  /**
   * Batch scan multiple images
   */
  async batchScan(images: Buffer[]): Promise<BarcodeResult[]> {
    const results: BarcodeResult[] = [];

    for (const image of images) {
      const result = await this.scanBarcode(image);
      if (result) {
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Get supported barcode formats
   */
  getSupportedFormats(): string[] {
    return [
      'UPC_A',
      'UPC_E',
      'EAN_13',
      'EAN_8',
      'CODE_128',
      'CODE_39',
      'CODE_93',
      'CODABAR',
      'ITF',
      'RSS_14',
      'RSS_EXPANDED',
      'PDF_417',
      'QR_CODE',
      'DATA_MATRIX',
      'AZTEC',
    ];
  }

  /**
   * Get barcode format information
   */
  getFormatInfo(format: string): { name: string; description: string; maxLength: number } {
    const formatInfo: Record<string, { name: string; description: string; maxLength: number }> = {
      UPC_A: { name: 'UPC-A', description: 'Universal Product Code', maxLength: 12 },
      UPC_E: { name: 'UPC-E', description: 'Universal Product Code (compressed)', maxLength: 8 },
      EAN_13: { name: 'EAN-13', description: 'European Article Number', maxLength: 13 },
      EAN_8: { name: 'EAN-8', description: 'European Article Number (short)', maxLength: 8 },
      CODE_128: { name: 'Code 128', description: 'High-density linear barcode', maxLength: 80 },
      CODE_39: { name: 'Code 39', description: 'Alphanumeric barcode', maxLength: 43 },
      CODE_93: { name: 'Code 93', description: 'Compact alphanumeric barcode', maxLength: 43 },
      CODABAR: { name: 'Codabar', description: 'Self-checking barcode', maxLength: 20 },
      ITF: { name: 'ITF', description: 'Interleaved 2 of 5', maxLength: 14 },
      QR_CODE: { name: 'QR Code', description: 'Quick Response Code', maxLength: 4296 },
      DATA_MATRIX: { name: 'Data Matrix', description: '2D matrix barcode', maxLength: 2335 },
      PDF_417: { name: 'PDF417', description: 'Portable Data File', maxLength: 1850 },
      AZTEC: { name: 'Aztec', description: '2D matrix barcode', maxLength: 3832 },
    };

    return formatInfo[format] || { name: format, description: 'Unknown format', maxLength: 0 };
  }

  /**
   * Scan multiple barcodes from a single image
   */
  async scanMultipleBarcodes(imageBuffer: Buffer): Promise<BarcodeResult[]> {
    try {
      const results: BarcodeResult[] = [];
      
      // Try different scanning approaches
      const approaches = [
        () => this.scanBarcode(imageBuffer),
        () => this.scanBarcodeWithRotation(imageBuffer, 90),
        () => this.scanBarcodeWithRotation(imageBuffer, 180),
        () => this.scanBarcodeWithRotation(imageBuffer, 270),
      ];

      for (const approach of approaches) {
        try {
          const result = await approach();
          if (result && !results.find(r => r.text === result.text)) {
            results.push(result);
          }
        } catch (error) {
          // Continue with next approach
        }
      }

      return results;
    } catch (error) {
      console.error('Error scanning multiple barcodes:', error);
      return [];
    }
  }

  /**
   * Scan barcode with rotation
   */
  private async scanBarcodeWithRotation(imageBuffer: Buffer, rotation: number): Promise<BarcodeResult | null> {
    try {
      const image = await loadImage(imageBuffer);
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext('2d');
      
      // Apply rotation
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(image, -image.width / 2, -image.height / 2);
      
      const rotatedBuffer = canvas.toBuffer('image/png');
      return await this.scanBarcode(rotatedBuffer);
    } catch (error) {
      console.error('Error scanning barcode with rotation:', error);
      return null;
    }
  }

  /**
   * Bulk scan with progress tracking
   */
  async bulkScan(images: Buffer[], onProgress?: (completed: number, total: number) => void): Promise<{
    results: BarcodeResult[];
    errors: string[];
    summary: {
      total: number;
      successful: number;
      failed: number;
      uniqueBarcodes: number;
    };
  }> {
    const results: BarcodeResult[] = [];
    const errors: string[] = [];
    let successful = 0;
    let failed = 0;

    for (let i = 0; i < images.length; i++) {
      try {
        const result = await this.scanBarcode(images[i]);
        if (result) {
          results.push(result);
          successful++;
        } else {
          failed++;
          errors.push(`Failed to scan image ${i + 1}`);
        }
      } catch (error) {
        failed++;
        errors.push(`Error scanning image ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      if (onProgress) {
        onProgress(i + 1, images.length);
      }
    }

    const uniqueBarcodes = new Set(results.map(r => r.text)).size;

    return {
      results,
      errors,
      summary: {
        total: images.length,
        successful,
        failed,
        uniqueBarcodes,
      },
    };
  }

  /**
   * Auto-populate product information from barcode
   */
  async autoPopulateProduct(barcode: string): Promise<{
    product: ProductInfo | null;
    suggestions: ProductInfo[];
    confidence: number;
  }> {
    try {
      const product = await this.lookupProduct(barcode);
      const suggestions: ProductInfo[] = [];
      let confidence = 0;

      if (product) {
        confidence = 0.9;
        
        // Get similar products as suggestions
        suggestions.push(
          {
            name: `${product.name} (Alternative)`,
            sku: `${product.sku}-ALT`,
            price: product.price * 1.1,
            category: product.category,
            description: `Alternative version of ${product.name}`,
          },
          {
            name: `${product.name} (Bulk)`,
            sku: `${product.sku}-BULK`,
            price: product.price * 0.8,
            category: product.category,
            description: `Bulk version of ${product.name}`,
          }
        );
      } else {
        // Try to extract information from barcode format
        const barcodeInfo = this.extractBarcodeInfo(barcode);
        if (barcodeInfo) {
          suggestions.push(barcodeInfo);
          confidence = 0.3;
        }
      }

      return {
        product,
        suggestions,
        confidence,
      };
    } catch (error) {
      console.error('Error auto-populating product:', error);
      return {
        product: null,
        suggestions: [],
        confidence: 0,
      };
    }
  }

  /**
   * Extract basic information from barcode format
   */
  private extractBarcodeInfo(barcode: string): ProductInfo | null {
    try {
      // Basic extraction based on barcode format
      if (barcode.length === 12 || barcode.length === 13) {
        // UPC/EAN format
        return {
          name: `Product ${barcode}`,
          sku: barcode,
          price: 0,
          category: 'Unknown',
          description: `Product with barcode ${barcode}`,
        };
      } else if (barcode.startsWith('http')) {
        // URL barcode
        return {
          name: 'Web Product',
          sku: barcode,
          price: 0,
          category: 'Web',
          description: `Product from URL: ${barcode}`,
        };
      }

      return null;
    } catch (error) {
      console.error('Error extracting barcode info:', error);
      return null;
    }
  }

  /**
   * Generate QR code with product information
   */
  async generateProductQRCode(product: ProductInfo): Promise<Buffer> {
    try {
      const productData = {
        name: product.name,
        sku: product.sku,
        price: product.price,
        category: product.category,
        description: product.description,
        timestamp: new Date().toISOString(),
      };

      const qrData = JSON.stringify(productData);
      return await this.generateBarcode(qrData, 'QR_CODE');
    } catch (error) {
      console.error('Error generating product QR code:', error);
      throw error;
    }
  }

  /**
   * Validate and clean barcode data
   */
  cleanBarcodeData(barcode: string): {
    cleaned: string;
    isValid: boolean;
    format: string;
    warnings: string[];
  } {
    const warnings: string[] = [];
    let cleaned = barcode.trim();
    let isValid = true;
    let format = 'UNKNOWN';

    // Remove common prefixes/suffixes
    cleaned = cleaned.replace(/^[^0-9A-Za-z]+/, '').replace(/[^0-9A-Za-z]+$/, '');

    // Detect format
    if (/^\d{12}$/.test(cleaned)) {
      format = 'UPC_A';
    } else if (/^\d{13}$/.test(cleaned)) {
      format = 'EAN_13';
    } else if (/^\d{8}$/.test(cleaned)) {
      format = 'EAN_8';
    } else if (/^[A-Za-z0-9]+$/.test(cleaned)) {
      format = 'CODE_128';
    } else if (cleaned.startsWith('http')) {
      format = 'QR_CODE';
    }

    // Validation warnings
    if (cleaned.length < 3) {
      warnings.push('Barcode is too short');
      isValid = false;
    }

    if (cleaned.length > 100) {
      warnings.push('Barcode is very long');
    }

    if (!/^[A-Za-z0-9]+$/.test(cleaned) && format !== 'QR_CODE') {
      warnings.push('Barcode contains special characters');
    }

    return {
      cleaned,
      isValid,
      format,
      warnings,
    };
  }

  /**
   * Get scanning statistics
   */
  getScanningStats(): {
    totalScans: number;
    successfulScans: number;
    failedScans: number;
    averageConfidence: number;
    mostCommonFormat: string;
    formats: Record<string, number>;
  } {
    // In a real implementation, this would track actual statistics
    return {
      totalScans: 0,
      successfulScans: 0,
      failedScans: 0,
      averageConfidence: 0,
      mostCommonFormat: 'UPC_A',
      formats: {},
    };
  }
}

export default new BarcodeService();
