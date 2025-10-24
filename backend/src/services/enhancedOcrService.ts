import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import { logger } from '../utils/logger';

export interface EnhancedOCRResult {
  text: string;
  confidence: number;
  words: Array<{
    text: string;
    confidence: number;
    bbox: {
      x0: number;
      y0: number;
      x1: number;
      y1: number;
    };
  }>;
  lines: Array<{
    text: string;
    confidence: number;
    bbox: {
      x0: number;
      y0: number;
      x1: number;
      y1: number;
    };
  }>;
  blocks: Array<{
    text: string;
    confidence: number;
    bbox: {
      x0: number;
      y0: number;
      x1: number;
      y1: number;
    };
  }>;
  receiptData?: ReceiptData;
  invoiceData?: InvoiceData;
  documentType: 'receipt' | 'invoice' | 'contract' | 'statement' | 'other';
  preprocessing: {
    originalSize: { width: number; height: number };
    processedSize: { width: number; height: number };
    enhancements: string[];
  };
}

export interface ReceiptData {
  vendor: string;
  total: number;
  date: string;
  items: Array<{
    description: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  tax: number;
  subtotal: number;
  confidence: number;
  location?: string;
  paymentMethod?: string;
  receiptNumber?: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  vendor: string;
  date: string;
  dueDate: string;
  total: number;
  subtotal: number;
  tax: number;
  items: Array<{
    description: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  confidence: number;
  customerInfo?: {
    name: string;
    address: string;
    email: string;
  };
  paymentTerms?: string;
}

class EnhancedOCRService {
  private worker: Tesseract.Worker | null = null;

  /**
   * Initialize Tesseract worker with optimized settings
   */
  private async initializeWorker(): Promise<Tesseract.Worker> {
    if (!this.worker) {
      this.worker = await Tesseract.createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            logger.debug(`Enhanced OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      });
      await this.worker.load();
      await this.worker.loadLanguage('eng');
      await this.worker.initialize('eng');
      
      // Set OCR parameters for better accuracy
      await this.worker.setParameters({
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,-$/()[]{}@#%&*+=<>:;"\'\\|~`!?',
        tessedit_pageseg_mode: '6', // Uniform block of text
        tessedit_ocr_engine_mode: '3', // Default, based on what is available
      });
    }
    return this.worker;
  }

  /**
   * Advanced image preprocessing for better OCR results
   */
  private async preprocessImage(buffer: Buffer, documentType: string): Promise<Buffer> {
    try {
      const image = sharp(buffer);
      const metadata = await image.metadata();
      
      logger.info(`Preprocessing image: ${metadata.width}x${metadata.height}, format: ${metadata.format}`);

      let processedImage = image;

      // Convert to grayscale for better OCR
      processedImage = processedImage.grayscale();

      // Enhance contrast
      processedImage = processedImage.normalize();

      // Sharpen the image
      processedImage = processedImage.sharpen();

      // Apply different preprocessing based on document type
      if (documentType === 'receipt') {
        // For receipts, enhance text contrast
        processedImage = processedImage.threshold(128);
      } else if (documentType === 'invoice') {
        // For invoices, preserve more detail
        processedImage = processedImage.modulate({
          brightness: 1.1,
          saturation: 0,
          hue: 0,
        });
      } else {
        // General preprocessing
        processedImage = processedImage.linear(1.2, -(128 * 0.2));
      }

      // Resize if image is too large (OCR works better on smaller images)
      if (metadata.width && metadata.width > 2000) {
        const scale = 2000 / metadata.width;
        processedImage = processedImage.resize(Math.round(metadata.width * scale));
      }

      // Convert to PNG for consistent format
      return await processedImage.png().toBuffer();

    } catch (error) {
      logger.error('Image preprocessing failed:', error);
      return buffer; // Return original if preprocessing fails
    }
  }

  /**
   * Detect document type based on content analysis
   */
  private detectDocumentType(text: string, filename?: string): string {
    const lowerText = text.toLowerCase();
    const lowerFilename = filename?.toLowerCase() || '';

    // Check for receipt indicators
    const receiptIndicators = [
      'receipt', 'total', 'subtotal', 'tax', 'change', 'cash', 'card',
      'thank you', 'visit again', 'receipt #', 'transaction'
    ];
    
    // Check for invoice indicators
    const invoiceIndicators = [
      'invoice', 'bill to', 'ship to', 'due date', 'payment terms',
      'invoice number', 'invoice date', 'amount due', 'net 30'
    ];

    // Check for contract indicators
    const contractIndicators = [
      'agreement', 'contract', 'terms and conditions', 'party',
      'whereas', 'hereby', 'effective date', 'termination'
    ];

    // Check for statement indicators
    const statementIndicators = [
      'statement', 'account balance', 'previous balance', 'current balance',
      'minimum payment', 'payment due', 'account number'
    ];

    const receiptScore = receiptIndicators.filter(indicator => 
      lowerText.includes(indicator) || lowerFilename.includes(indicator)
    ).length;

    const invoiceScore = invoiceIndicators.filter(indicator => 
      lowerText.includes(indicator) || lowerFilename.includes(indicator)
    ).length;

    const contractScore = contractIndicators.filter(indicator => 
      lowerText.includes(indicator) || lowerFilename.includes(indicator)
    ).length;

    const statementScore = statementIndicators.filter(indicator => 
      lowerText.includes(indicator) || lowerFilename.includes(indicator)
    ).length;

    const scores = {
      receipt: receiptScore,
      invoice: invoiceScore,
      contract: contractScore,
      statement: statementScore,
    };

    const maxScore = Math.max(...Object.values(scores));
    const detectedType = Object.keys(scores).find(key => scores[key] === maxScore);

    return detectedType || 'other';
  }

  /**
   * Extract text with enhanced preprocessing
   */
  async extractTextWithPreprocessing(
    imageBuffer: Buffer, 
    filename?: string
  ): Promise<EnhancedOCRResult> {
    try {
      const worker = await this.initializeWorker();
      
      // Detect document type first
      const documentType = this.detectDocumentType('', filename);
      
      // Preprocess image based on document type
      const processedBuffer = await this.preprocessImage(imageBuffer, documentType);
      
      // Get original image metadata
      const originalImage = sharp(imageBuffer);
      const originalMetadata = await originalImage.metadata();
      
      // Get processed image metadata
      const processedImage = sharp(processedBuffer);
      const processedMetadata = await processedImage.metadata();
      
      // Perform OCR
      const { data } = await worker.recognize(processedBuffer);
      
      // Detect document type from extracted text
      const finalDocumentType = this.detectDocumentType(data.text, filename);
      
      const result: EnhancedOCRResult = {
        text: data.text,
        confidence: data.confidence,
        words: data.words.map(word => ({
          text: word.text,
          confidence: word.confidence,
          bbox: {
            x0: word.bbox.x0,
            y0: word.bbox.y0,
            x1: word.bbox.x1,
            y1: word.bbox.y1,
          },
        })),
        lines: data.lines.map(line => ({
          text: line.text,
          confidence: line.confidence,
          bbox: {
            x0: line.bbox.x0,
            y0: line.bbox.y0,
            x1: line.bbox.x1,
            y1: line.bbox.y1,
          },
        })),
        blocks: data.blocks.map(block => ({
          text: block.text,
          confidence: block.confidence,
          bbox: {
            x0: block.bbox.x0,
            y0: block.bbox.y0,
            x1: block.bbox.x1,
            y1: block.bbox.y1,
          },
        })),
        documentType: finalDocumentType as any,
        preprocessing: {
          originalSize: {
            width: originalMetadata.width || 0,
            height: originalMetadata.height || 0,
          },
          processedSize: {
            width: processedMetadata.width || 0,
            height: processedMetadata.height || 0,
          },
          enhancements: ['grayscale', 'contrast', 'sharpen', 'resize'],
        },
      };

      // Extract structured data based on document type
      if (finalDocumentType === 'receipt') {
        result.receiptData = await this.extractReceiptData(data.text);
      } else if (finalDocumentType === 'invoice') {
        result.invoiceData = await this.extractInvoiceData(data.text);
      }

      logger.info(`Enhanced OCR completed: ${finalDocumentType}, confidence: ${data.confidence}%`);
      return result;

    } catch (error) {
      logger.error('Enhanced OCR extraction failed:', error);
      throw new Error(`Enhanced OCR extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract receipt data with enhanced parsing
   */
  private async extractReceiptData(text: string): Promise<ReceiptData> {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    // Enhanced vendor extraction
    const vendor = this.extractVendorName(lines);
    
    // Enhanced total extraction with multiple patterns
    const total = this.extractTotalAmount(text);
    
    // Enhanced date extraction
    const date = this.extractDate(text);
    
    // Extract items with better parsing
    const items = this.extractItems(lines);
    
    // Extract additional receipt information
    const location = this.extractLocation(text);
    const paymentMethod = this.extractPaymentMethod(text);
    const receiptNumber = this.extractReceiptNumber(text);
    
    // Calculate subtotal and tax
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = total - subtotal;
    
    const confidence = this.calculateConfidence(text, { vendor, total, date, items });

    return {
      vendor,
      total,
      date,
      items,
      tax,
      subtotal,
      confidence,
      location,
      paymentMethod,
      receiptNumber,
    };
  }

  /**
   * Extract invoice data with enhanced parsing
   */
  private async extractInvoiceData(text: string): Promise<InvoiceData> {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    const invoiceNumber = this.extractInvoiceNumber(text);
    const vendor = this.extractVendorName(lines);
    const date = this.extractDate(text);
    const dueDate = this.extractDueDate(text);
    const total = this.extractTotalAmount(text);
    const items = this.extractItems(lines);
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = total - subtotal;
    
    // Extract customer information
    const customerInfo = this.extractCustomerInfo(text);
    const paymentTerms = this.extractPaymentTerms(text);
    
    const confidence = this.calculateConfidence(text, { 
      invoiceNumber, vendor, total, date, items 
    });

    return {
      invoiceNumber,
      vendor,
      date,
      dueDate,
      total,
      subtotal,
      tax,
      items,
      confidence,
      customerInfo,
      paymentTerms,
    };
  }

  /**
   * Enhanced vendor name extraction
   */
  private extractVendorName(lines: string[]): string {
    // Look for business name patterns with more sophisticated matching
    const businessPatterns = [
      /^[A-Z][a-zA-Z\s&]+(?:Inc|LLC|Corp|Company|Ltd|Co|LLP|LP)\.?$/,
      /^[A-Z][a-zA-Z\s&]+(?:Restaurant|Store|Shop|Market|Center|Mall)$/,
      /^[A-Z][a-zA-Z\s&]+$/,
    ];

    // Check first few lines more carefully
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].trim();
      if (line.length > 3 && line.length < 50) {
        for (const pattern of businessPatterns) {
          if (pattern.test(line)) {
            return line;
          }
        }
      }
    }

    // Fallback to first non-empty line
    return lines[0]?.trim() || 'Unknown Vendor';
  }

  /**
   * Enhanced total amount extraction
   */
  private extractTotalAmount(text: string): number {
    const totalPatterns = [
      /total[:\s]*\$?(\d+\.?\d{2})/i,
      /amount[:\s]*\$?(\d+\.?\d{2})/i,
      /balance[:\s]*\$?(\d+\.?\d{2})/i,
      /due[:\s]*\$?(\d+\.?\d{2})/i,
      /\$(\d+\.?\d{2})\s*(?:total|amount|balance|due)/i,
      /grand\s+total[:\s]*\$?(\d+\.?\d{2})/i,
    ];

    for (const pattern of totalPatterns) {
      const match = text.match(pattern);
      if (match) {
        return parseFloat(match[1]);
      }
    }

    // Look for currency amounts and return the largest
    const currencyPattern = /\$(\d+\.?\d{2})/g;
    const amounts: number[] = [];
    let match;
    while ((match = currencyPattern.exec(text)) !== null) {
      amounts.push(parseFloat(match[1]));
    }

    return amounts.length > 0 ? Math.max(...amounts) : 0;
  }

  /**
   * Enhanced date extraction
   */
  private extractDate(text: string): string {
    const datePatterns = [
      /(\d{1,2}\/\d{1,2}\/\d{2,4})/,
      /(\d{1,2}-\d{1,2}-\d{2,4})/,
      /(\d{4}-\d{1,2}-\d{1,2})/,
      /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}/i,
      /(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/i,
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return new Date().toISOString().split('T')[0];
  }

  /**
   * Extract due date from text
   */
  private extractDueDate(text: string): string {
    const dueDatePatterns = [
      /due[:\s]*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
      /due[:\s]*(\d{1,2}-\d{1,2}-\d{2,4})/i,
      /payment[:\s]*due[:\s]*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
      /net\s+(\d+)/i, // Net 30, Net 15, etc.
    ];

    for (const pattern of dueDatePatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return '';
  }

  /**
   * Extract invoice number
   */
  private extractInvoiceNumber(text: string): string {
    const invoicePatterns = [
      /invoice[#:\s]*(\w+)/i,
      /inv[#:\s]*(\w+)/i,
      /#(\w+)/,
      /bill[#:\s]*(\w+)/i,
    ];

    for (const pattern of invoicePatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return '';
  }

  /**
   * Extract location from receipt
   */
  private extractLocation(text: string): string {
    const locationPatterns = [
      /location[:\s]*([^,\n]+)/i,
      /address[:\s]*([^,\n]+)/i,
      /(\d+\s+[A-Za-z\s]+(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard))/i,
    ];

    for (const pattern of locationPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return '';
  }

  /**
   * Extract payment method
   */
  private extractPaymentMethod(text: string): string {
    const paymentMethods = ['cash', 'card', 'credit', 'debit', 'check', 'paypal'];
    const lowerText = text.toLowerCase();
    
    for (const method of paymentMethods) {
      if (lowerText.includes(method)) {
        return method.charAt(0).toUpperCase() + method.slice(1);
      }
    }

    return '';
  }

  /**
   * Extract receipt number
   */
  private extractReceiptNumber(text: string): string {
    const receiptPatterns = [
      /receipt[#:\s]*(\w+)/i,
      /trans[#:\s]*(\w+)/i,
      /ref[#:\s]*(\w+)/i,
    ];

    for (const pattern of receiptPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return '';
  }

  /**
   * Extract customer information
   */
  private extractCustomerInfo(text: string): { name: string; address: string; email: string } {
    const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
    const emailMatch = text.match(emailPattern);
    
    return {
      name: '',
      address: '',
      email: emailMatch ? emailMatch[1] : '',
    };
  }

  /**
   * Extract payment terms
   */
  private extractPaymentTerms(text: string): string {
    const termsPatterns = [
      /payment[:\s]*terms[:\s]*([^,\n]+)/i,
      /net\s+(\d+)/i,
      /due[:\s]*(\d+)\s+days/i,
    ];

    for (const pattern of termsPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return '';
  }

  /**
   * Enhanced items extraction
   */
  private extractItems(lines: string[]): Array<{
    description: string;
    quantity: number;
    price: number;
    total: number;
  }> {
    const items: Array<{
      description: string;
      quantity: number;
      price: number;
      total: number;
    }> = [];

    // Enhanced item patterns
    const itemPatterns = [
      /^(.+?)\s+(\d+)\s+\$?(\d+\.?\d*)\s+\$?(\d+\.?\d*)$/,
      /^(.+?)\s+\$?(\d+\.?\d*)$/,
    ];

    for (const line of lines) {
      for (const pattern of itemPatterns) {
        const match = line.match(pattern);
        if (match) {
          if (match.length === 5) {
            // Full pattern with quantity
            items.push({
              description: match[1].trim(),
              quantity: parseInt(match[2]),
              price: parseFloat(match[3]),
              total: parseFloat(match[4]),
            });
          } else if (match.length === 3) {
            // Simple pattern without quantity
            items.push({
              description: match[1].trim(),
              quantity: 1,
              price: parseFloat(match[2]),
              total: parseFloat(match[2]),
            });
          }
          break;
        }
      }
    }

    return items;
  }

  /**
   * Calculate confidence score based on extracted data
   */
  private calculateConfidence(text: string, extractedData: any): number {
    let confidence = 0;
    let factors = 0;

    // Check if we have basic required fields
    if (extractedData.vendor && extractedData.vendor !== 'Unknown Vendor') {
      confidence += 20;
      factors++;
    }

    if (extractedData.total && extractedData.total > 0) {
      confidence += 20;
      factors++;
    }

    if (extractedData.date) {
      confidence += 15;
      factors++;
    }

    if (extractedData.items && extractedData.items.length > 0) {
      confidence += 15;
      factors++;
    }

    // Check text quality
    if (text.length > 50) {
      confidence += 10;
      factors++;
    }

    // Check for currency symbols
    if (text.includes('$')) {
      confidence += 10;
      factors++;
    }

    // Check for numbers (likely amounts)
    if (/\d+\.\d{2}/.test(text)) {
      confidence += 10;
      factors++;
    }

    return factors > 0 ? Math.min(confidence, 100) : 0;
  }

  /**
   * Clean up worker resources
   */
  async cleanup(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

// Create singleton instance
export const enhancedOcrService = new EnhancedOCRService();

export default EnhancedOCRService;







