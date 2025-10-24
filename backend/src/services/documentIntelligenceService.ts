import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';
import * as Tesseract from 'tesseract.js';
import * as sharp from 'sharp';

const prisma = new PrismaClient();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ExtractedData {
  vendor: string;
  total: number;
  date: Date;
  lineItems: LineItem[];
  tax: number;
  paymentTerms: string;
  confidence: number;
  rawText: string;
  metadata: any;
}

export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category?: string;
}

export interface DocumentClassification {
  type: 'invoice' | 'receipt' | 'contract' | 'statement' | 'other';
  confidence: number;
  subType?: string;
}

export interface VendorInfo {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  taxId?: string;
  paymentTerms?: string;
  confidence: number;
}

export class DocumentIntelligenceService {
  /**
   * Extract structured data from document using AI-enhanced OCR
   */
  async extractDocumentData(
    imageBuffer: Buffer, 
    documentType?: string
  ): Promise<ExtractedData> {
    try {
      // Preprocess image for better OCR
      const processedImage = await this.preprocessImage(imageBuffer);
      
      // Perform OCR with Tesseract
      const ocrResult = await Tesseract.recognize(processedImage, 'eng', {
        logger: m => console.log(m)
      });
      
      const rawText = ocrResult.data.text;
      
      // Use AI to extract structured data from OCR text
      const extractedData = await this.extractStructuredData(rawText, documentType);
      
      return {
        ...extractedData,
        rawText,
        metadata: {
          ocrConfidence: ocrResult.data.confidence,
          processingTime: Date.now(),
          documentType
        }
      };

    } catch (error) {
      console.error('Error extracting document data:', error);
      throw new Error('Failed to extract document data');
    }
  }

  /**
   * Classify document type using AI
   */
  async classifyDocument(imageBuffer: Buffer): Promise<DocumentClassification> {
    try {
      // First, get OCR text
      const ocrResult = await Tesseract.recognize(imageBuffer, 'eng');
      const text = ocrResult.data.text;
      
      // Use AI to classify document type
      const prompt = `
Analyze this document text and classify it. Return JSON format:

{
  "type": "invoice|receipt|contract|statement|other",
  "confidence": number (0-1),
  "subType": "string (optional, e.g., 'utility_bill', 'credit_card_statement')"
}

Document text:
${text}

Classify based on:
- Keywords and phrases
- Document structure
- Common patterns
- Business document types
`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: text }
        ],
        temperature: 0.1,
        max_tokens: 200
      });

      const response = completion.choices[0].message.content;
      const classification = JSON.parse(response || '{}');

      return {
        type: classification.type || 'other',
        confidence: classification.confidence || 0.5,
        subType: classification.subType
      };

    } catch (error) {
      console.error('Error classifying document:', error);
      return {
        type: 'other',
        confidence: 0.1
      };
    }
  }

  /**
   * Extract vendor information from document
   */
  async extractVendorInfo(imageBuffer: Buffer): Promise<VendorInfo> {
    try {
      const ocrResult = await Tesseract.recognize(imageBuffer, 'eng');
      const text = ocrResult.data.text;
      
      const prompt = `
Extract vendor information from this document. Return JSON format:

{
  "name": "string",
  "address": "string (optional)",
  "phone": "string (optional)",
  "email": "string (optional)",
  "website": "string (optional)",
  "taxId": "string (optional)",
  "paymentTerms": "string (optional)",
  "confidence": number (0-1)
}

Document text:
${text}

Look for:
- Company/vendor name (usually at top)
- Contact information
- Tax ID or business registration
- Payment terms (Net 30, Due on receipt, etc.)
`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: text }
        ],
        temperature: 0.1,
        max_tokens: 300
      });

      const response = completion.choices[0].message.content;
      const vendorInfo = JSON.parse(response || '{}');

      return {
        name: vendorInfo.name || 'Unknown Vendor',
        address: vendorInfo.address,
        phone: vendorInfo.phone,
        email: vendorInfo.email,
        website: vendorInfo.website,
        taxId: vendorInfo.taxId,
        paymentTerms: vendorInfo.paymentTerms,
        confidence: vendorInfo.confidence || 0.5
      };

    } catch (error) {
      console.error('Error extracting vendor info:', error);
      return {
        name: 'Unknown Vendor',
        confidence: 0.1
      };
    }
  }

  /**
   * Extract structured data using AI
   */
  private async extractStructuredData(
    text: string, 
    documentType?: string
  ): Promise<Omit<ExtractedData, 'rawText' | 'metadata'>> {
    const prompt = `
Extract structured financial data from this document text. Return JSON format:

{
  "vendor": "string",
  "total": number,
  "date": "YYYY-MM-DD",
  "lineItems": [
    {
      "description": "string",
      "quantity": number,
      "unitPrice": number,
      "total": number,
      "category": "string (optional)"
    }
  ],
  "tax": number,
  "paymentTerms": "string",
  "confidence": number (0-1)
}

Document text:
${text}

Document type: ${documentType || 'unknown'}

Extract:
- Vendor/company name
- Total amount (look for "Total:", "Amount Due:", etc.)
- Date (invoice date, not current date)
- Line items with quantities and prices
- Tax amount
- Payment terms (Net 30, Due on receipt, etc.)
- Categorize line items (Office Supplies, Travel, Software, etc.)
`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: text }
        ],
        temperature: 0.1,
        max_tokens: 1000
      });

      const response = completion.choices[0].message.content;
      const extractedData = JSON.parse(response || '{}');

      return {
        vendor: extractedData.vendor || 'Unknown Vendor',
        total: extractedData.total || 0,
        date: new Date(extractedData.date || new Date()),
        lineItems: extractedData.lineItems || [],
        tax: extractedData.tax || 0,
        paymentTerms: extractedData.paymentTerms || '',
        confidence: extractedData.confidence || 0.5
      };

    } catch (error) {
      console.error('Error extracting structured data:', error);
      return {
        vendor: 'Unknown Vendor',
        total: 0,
        date: new Date(),
        lineItems: [],
        tax: 0,
        paymentTerms: '',
        confidence: 0.1
      };
    }
  }

  /**
   * Preprocess image for better OCR results
   */
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
      console.error('Error preprocessing image:', error);
      return imageBuffer; // Return original if preprocessing fails
    }
  }

  /**
   * Detect tables in document
   */
  async detectTables(imageBuffer: Buffer): Promise<any[]> {
    try {
      const ocrResult = await Tesseract.recognize(imageBuffer, 'eng', {
        tessedit_pageseg_mode: '6' // Assume single uniform block of text
      });
      
      const text = ocrResult.data.text;
      
      // Use AI to detect and extract table data
      const prompt = `
Detect and extract table data from this document text. Return JSON array of tables:

[
  {
    "headers": ["string"],
    "rows": [
      ["string", "string", "number"]
    ],
    "confidence": number
  }
]

Document text:
${text}

Look for:
- Tabular data with headers and rows
- Line items with quantities and prices
- Financial data in table format
`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: text }
        ],
        temperature: 0.1,
        max_tokens: 800
      });

      const response = completion.choices[0].message.content;
      return JSON.parse(response || '[]');

    } catch (error) {
      console.error('Error detecting tables:', error);
      return [];
    }
  }

  /**
   * Extract line items from document
   */
  async extractLineItems(imageBuffer: Buffer): Promise<LineItem[]> {
    try {
      const tables = await this.detectTables(imageBuffer);
      
      if (tables.length === 0) {
        return [];
      }

      const lineItems: LineItem[] = [];
      
      for (const table of tables) {
        if (table.headers && table.rows) {
          for (const row of table.rows) {
            if (row.length >= 3) {
              const description = row[0] || '';
              const quantity = parseFloat(row[1]) || 1;
              const unitPrice = parseFloat(row[2]) || 0;
              const total = quantity * unitPrice;
              
              lineItems.push({
                description,
                quantity,
                unitPrice,
                total,
                category: this.categorizeLineItem(description)
              });
            }
          }
        }
      }

      return lineItems;

    } catch (error) {
      console.error('Error extracting line items:', error);
      return [];
    }
  }

  /**
   * Categorize line item based on description
   */
  private categorizeLineItem(description: string): string {
    const lowerDesc = description.toLowerCase();
    
    const categories = {
      'Office Supplies': ['paper', 'pen', 'pencil', 'notebook', 'folder', 'stapler'],
      'Software': ['software', 'license', 'subscription', 'saas', 'app'],
      'Travel': ['flight', 'hotel', 'uber', 'lyft', 'taxi', 'rental car'],
      'Meals': ['lunch', 'dinner', 'coffee', 'restaurant', 'food'],
      'Marketing': ['advertising', 'marketing', 'promotion', 'ads'],
      'Professional Services': ['consulting', 'legal', 'accounting', 'services'],
      'Utilities': ['electric', 'water', 'internet', 'phone', 'utility'],
      'Equipment': ['computer', 'laptop', 'monitor', 'equipment', 'hardware']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerDesc.includes(keyword))) {
        return category;
      }
    }

    return 'Other';
  }

  /**
   * Validate extracted data
   */
  async validateExtractedData(data: ExtractedData): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate required fields
    if (!data.vendor || data.vendor === 'Unknown Vendor') {
      errors.push('Vendor name not found');
    }

    if (data.total <= 0) {
      errors.push('Total amount not found or invalid');
    }

    if (!data.date || isNaN(data.date.getTime())) {
      errors.push('Date not found or invalid');
    }

    // Validate line items
    if (data.lineItems.length === 0) {
      warnings.push('No line items found');
    }

    // Check for reasonable values
    if (data.total > 100000) {
      warnings.push('Total amount seems unusually high');
    }

    if (data.confidence < 0.5) {
      warnings.push('Low confidence in extracted data');
    }

    // Validate line item totals
    const calculatedTotal = data.lineItems.reduce((sum, item) => sum + item.total, 0);
    if (Math.abs(calculatedTotal - data.total) > 0.01) {
      warnings.push('Line item totals do not match document total');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get confidence score for extracted data
   */
  calculateConfidenceScore(data: ExtractedData): number {
    let score = 0;
    let factors = 0;

    // Vendor name confidence
    if (data.vendor && data.vendor !== 'Unknown Vendor') {
      score += 0.2;
    }
    factors++;

    // Total amount confidence
    if (data.total > 0) {
      score += 0.2;
    }
    factors++;

    // Date confidence
    if (data.date && !isNaN(data.date.getTime())) {
      score += 0.2;
    }
    factors++;

    // Line items confidence
    if (data.lineItems.length > 0) {
      score += 0.2;
    }
    factors++;

    // Payment terms confidence
    if (data.paymentTerms) {
      score += 0.1;
    }
    factors++;

    // OCR confidence from metadata
    if (data.metadata?.ocrConfidence) {
      score += (data.metadata.ocrConfidence / 100) * 0.1;
    }
    factors++;

    return factors > 0 ? score / factors : 0;
  }

  /**
   * Store extracted data in database
   */
  async storeExtractedData(
    userId: string, 
    documentId: string, 
    data: ExtractedData
  ): Promise<void> {
    try {
      // Store vendor information
      const vendor = await prisma.vendor.upsert({
        where: { 
          name_userId: { 
            name: data.vendor, 
            userId 
          } 
        },
        update: {
          paymentTerms: data.paymentTerms,
          lastUsed: new Date()
        },
        create: {
          name: data.vendor,
          userId,
          paymentTerms: data.paymentTerms,
          lastUsed: new Date()
        }
      });

      // Store document extraction
      await prisma.documentExtraction.create({
        data: {
          documentId,
          userId,
          vendorId: vendor.id,
          extractedData: data,
          confidence: data.confidence,
          processedAt: new Date()
        }
      });

    } catch (error) {
      console.error('Error storing extracted data:', error);
      throw new Error('Failed to store extracted data');
    }
  }

  /**
   * Get extraction history for user
   */
  async getExtractionHistory(userId: string, limit: number = 20): Promise<any[]> {
    try {
      return await prisma.documentExtraction.findMany({
        where: { userId },
        include: {
          vendor: true,
          document: true
        },
        orderBy: { processedAt: 'desc' },
        take: limit
      });

    } catch (error) {
      console.error('Error getting extraction history:', error);
      return [];
    }
  }
}

export default DocumentIntelligenceService;






