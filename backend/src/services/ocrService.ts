import Tesseract from 'tesseract.js';
import { createWorker } from 'tesseract.js';
import sharp from 'sharp';
import logger from '../utils/logger';

export interface OCRResult {
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
}

export interface ReceiptData {
  vendor: string;
  date: Date;
  total: number;
  tax: number;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  confidence: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  vendor: string;
  customer: string;
  date: Date;
  dueDate: Date;
  total: number;
  tax: number;
  items: Array<{
    description: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  confidence: number;
}

export class OCRService {
  private worker: Tesseract.Worker | null = null;

  async initialize(): Promise<void> {
    try {
      this.worker = await createWorker('eng', 1, {
        logger: m => logger.info('Tesseract:', m),
      });
      await this.worker.setParameters({
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,-$/()[]{}:;',
        tessedit_pageseg_mode: '6', // Uniform block of text
      });
    } catch (error) {
      logger.error('Failed to initialize OCR worker', { error });
      throw error;
    }
  }

  async extractText(imageBuffer: Buffer, options: {
    language?: string;
    psm?: number;
    oem?: number;
  } = {}): Promise<OCRResult> {
    try {
      if (!this.worker) {
        await this.initialize();
      }

      // Preprocess image for better OCR
      const processedBuffer = await this.preprocessImage(imageBuffer);

      const result = await this.worker!.recognize(processedBuffer);
      
      return {
        text: result.data.text,
        confidence: result.data.confidence,
        words: result.data.words.map(word => ({
          text: word.text,
          confidence: word.confidence,
          bbox: {
            x0: word.bbox.x0,
            y0: word.bbox.y0,
            x1: word.bbox.x1,
            y1: word.bbox.y1,
          },
        })),
        lines: result.data.lines.map(line => ({
          text: line.text,
          confidence: line.confidence,
          bbox: {
            x0: line.bbox.x0,
            y0: line.bbox.y0,
            x1: line.bbox.x1,
            y1: line.bbox.y1,
          },
        })),
        blocks: result.data.blocks.map(block => ({
          text: block.text,
          confidence: block.confidence,
          bbox: {
            x0: block.bbox.x0,
            y0: block.bbox.y0,
            x1: block.bbox.x1,
            y1: block.bbox.y1,
          },
        })),
      };
    } catch (error) {
      logger.error('OCR text extraction failed', { error });
      throw error;
    }
  }

  async extractReceiptData(imageBuffer: Buffer): Promise<ReceiptData> {
    try {
      const ocrResult = await this.extractText(imageBuffer);
      return this.parseReceiptData(ocrResult);
    } catch (error) {
      logger.error('Receipt data extraction failed', { error });
      throw error;
    }
  }

  async extractInvoiceData(imageBuffer: Buffer): Promise<InvoiceData> {
    try {
      const ocrResult = await this.extractText(imageBuffer);
      return this.parseInvoiceData(ocrResult);
    } catch (error) {
      logger.error('Invoice data extraction failed', { error });
      throw error;
    }
  }

  private async preprocessImage(imageBuffer: Buffer): Promise<Buffer> {
    try {
      return await sharp(imageBuffer)
        .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
        .grayscale()
        .normalize()
        .sharpen()
        .png()
        .toBuffer();
    } catch (error) {
      logger.error('Image preprocessing failed', { error });
      return imageBuffer;
    }
  }

  private parseReceiptData(ocrResult: OCRResult): ReceiptData {
    const text = ocrResult.text.toLowerCase();
    const lines = ocrResult.lines;

    // Extract vendor name (usually first line or line with business name)
    const vendor = this.extractVendor(lines);

    // Extract date
    const date = this.extractDate(text);

    // Extract total amount
    const total = this.extractTotal(text);

    // Extract tax amount
    const tax = this.extractTax(text);

    // Extract items
    const items = this.extractReceiptItems(lines);

    return {
      vendor,
      date,
      total,
      tax,
      items,
      confidence: ocrResult.confidence,
    };
  }

  private parseInvoiceData(ocrResult: OCRResult): InvoiceData {
    const text = ocrResult.text.toLowerCase();
    const lines = ocrResult.lines;

    // Extract invoice number
    const invoiceNumber = this.extractInvoiceNumber(text);

    // Extract vendor
    const vendor = this.extractVendor(lines);

    // Extract customer
    const customer = this.extractCustomer(lines);

    // Extract dates
    const date = this.extractDate(text);
    const dueDate = this.extractDueDate(text);

    // Extract amounts
    const total = this.extractTotal(text);
    const tax = this.extractTax(text);

    // Extract items
    const items = this.extractInvoiceItems(lines);

    return {
      invoiceNumber,
      vendor,
      customer,
      date,
      dueDate,
      total,
      tax,
      items,
      confidence: ocrResult.confidence,
    };
  }

  private extractVendor(lines: Array<{ text: string; confidence: number }>): string {
    // Look for business name patterns
    for (const line of lines) {
      const text = line.text.trim();
      if (text.length > 3 && text.length < 50 && line.confidence > 50) {
        // Check if it looks like a business name
        if (!/\d/.test(text) && !text.includes('$') && !text.includes('total')) {
          return text;
        }
      }
    }
    return 'Unknown Vendor';
  }

  private extractDate(text: string): Date {
    const datePatterns = [
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
      /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{2,4})/i,
      /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2}),?\s+(\d{2,4})/i,
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          return new Date(match[0]);
        } catch (error) {
          continue;
        }
      }
    }

    return new Date();
  }

  private extractDueDate(text: string): Date {
    const dueDatePatterns = [
      /due\s*:?\s*(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/i,
      /due\s*:?\s*(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{2,4})/i,
    ];

    for (const pattern of dueDatePatterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          return new Date(match[0]);
        } catch (error) {
          continue;
        }
      }
    }

    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default 30 days
  }

  private extractTotal(text: string): number {
    const totalPatterns = [
      /total\s*:?\s*\$?(\d+\.?\d*)/i,
      /amount\s*:?\s*\$?(\d+\.?\d*)/i,
      /\$(\d+\.?\d*)\s*$/,
    ];

    for (const pattern of totalPatterns) {
      const match = text.match(pattern);
      if (match) {
        return parseFloat(match[1]);
      }
    }

    // Look for the largest number that could be a total
    const numbers = text.match(/\$?(\d+\.?\d*)/g);
    if (numbers) {
      const parsedNumbers = numbers.map(n => parseFloat(n.replace('$', '')));
      return Math.max(...parsedNumbers);
    }

    return 0;
  }

  private extractTax(text: string): number {
    const taxPatterns = [
      /tax\s*:?\s*\$?(\d+\.?\d*)/i,
      /vat\s*:?\s*\$?(\d+\.?\d*)/i,
      /gst\s*:?\s*\$?(\d+\.?\d*)/i,
    ];

    for (const pattern of taxPatterns) {
      const match = text.match(pattern);
      if (match) {
        return parseFloat(match[1]);
      }
    }

    return 0;
  }

  private extractInvoiceNumber(text: string): string {
    const invoicePatterns = [
      /invoice\s*#?\s*:?\s*(\w+)/i,
      /inv\s*#?\s*:?\s*(\w+)/i,
      /#\s*(\w+)/,
    ];

    for (const pattern of invoicePatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return 'Unknown';
  }

  private extractCustomer(lines: Array<{ text: string; confidence: number }>): string {
    // Look for customer name patterns
    for (const line of lines) {
      const text = line.text.trim();
      if (text.length > 3 && text.length < 50 && line.confidence > 50) {
        if (!/\d/.test(text) && !text.includes('$') && !text.includes('total')) {
          return text;
        }
      }
    }
    return 'Unknown Customer';
  }

  private extractReceiptItems(lines: Array<{ text: string; confidence: number }>): Array<{
    name: string;
    price: number;
    quantity: number;
  }> {
    const items: Array<{ name: string; price: number; quantity: number }> = [];

    for (const line of lines) {
      const text = line.text.trim();
      const priceMatch = text.match(/\$(\d+\.?\d*)/);
      
      if (priceMatch && line.confidence > 50) {
        const price = parseFloat(priceMatch[1]);
        const name = text.replace(/\$(\d+\.?\d*)/, '').trim();
        
        if (name.length > 0) {
          items.push({
            name,
            price,
            quantity: 1,
          });
        }
      }
    }

    return items;
  }

  private extractInvoiceItems(lines: Array<{ text: string; confidence: number }>): Array<{
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

    for (const line of lines) {
      const text = line.text.trim();
      const priceMatch = text.match(/\$(\d+\.?\d*)/);
      
      if (priceMatch && line.confidence > 50) {
        const price = parseFloat(priceMatch[1]);
        const description = text.replace(/\$(\d+\.?\d*)/, '').trim();
        
        if (description.length > 0) {
          items.push({
            description,
            quantity: 1,
            price,
            total: price,
          });
        }
      }
    }

    return items;
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

export const ocrService = new OCRService();