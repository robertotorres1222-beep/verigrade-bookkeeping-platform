import { ocrService, OCRResult, ReceiptData, InvoiceData } from './ocrService';
import { FileUploadService, UploadedFile } from './fileUploadService';
import { logger } from '../utils/logger';

export interface ProcessedDocument {
  id: string;
  originalFile: UploadedFile;
  documentType: 'receipt' | 'invoice' | 'contract' | 'statement' | 'other';
  extractedData: ReceiptData | InvoiceData | any;
  confidence: number;
  requiresReview: boolean;
  processedAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export interface DocumentProcessingOptions {
  generateThumbnail?: boolean;
  extractText?: boolean;
  classifyDocument?: boolean;
  extractStructuredData?: boolean;
  confidenceThreshold?: number;
}

class DocumentProcessingService {
  private fileUploadService: FileUploadService;

  constructor(fileUploadService: FileUploadService) {
    this.fileUploadService = fileUploadService;
  }

  /**
   * Process uploaded document with OCR and data extraction
   */
  async processDocument(
    file: Express.Multer.File,
    userId: string,
    options: DocumentProcessingOptions = {}
  ): Promise<ProcessedDocument> {
    const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      logger.info(`Processing document: ${file.originalname} for user: ${userId}`);

      // Upload file to storage
      const uploadedFile = await this.fileUploadService.uploadFile(file, userId, {
        generateThumbnail: options.generateThumbnail,
        extractText: options.extractText,
      });

      // Initialize processed document
      const processedDoc: ProcessedDocument = {
        id: documentId,
        originalFile: uploadedFile,
        documentType: 'other',
        extractedData: {},
        confidence: 0,
        requiresReview: false,
        processedAt: new Date(),
        status: 'processing',
      };

      // Classify document type
      if (options.classifyDocument) {
        processedDoc.documentType = await this.classifyDocumentType(file);
      }

      // Extract structured data based on document type
      if (options.extractStructuredData) {
        const extractedData = await this.extractStructuredData(file, processedDoc.documentType);
        processedDoc.extractedData = extractedData.data;
        processedDoc.confidence = extractedData.confidence;
        processedDoc.requiresReview = extractedData.confidence < (options.confidenceThreshold || 80);
      }

      processedDoc.status = 'completed';

      logger.info(`Document processed successfully: ${documentId}`);
      return processedDoc;

    } catch (error) {
      logger.error('Document processing failed:', error);
      return {
        id: documentId,
        originalFile: {} as UploadedFile,
        documentType: 'other',
        extractedData: {},
        confidence: 0,
        requiresReview: true,
        processedAt: new Date(),
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Classify document type based on content and filename
   */
  private async classifyDocumentType(file: Express.Multer.File): Promise<ProcessedDocument['documentType']> {
    const filename = file.originalname.toLowerCase();
    const mimeType = file.mimetype;

    // Check filename patterns
    if (filename.includes('receipt') || filename.includes('receipt_')) {
      return 'receipt';
    }
    if (filename.includes('invoice') || filename.includes('inv_')) {
      return 'invoice';
    }
    if (filename.includes('contract') || filename.includes('agreement')) {
      return 'contract';
    }
    if (filename.includes('statement') || filename.includes('bank_')) {
      return 'statement';
    }

    // Check MIME type
    if (mimeType === 'application/pdf') {
      // For PDFs, we might need to do OCR to determine type
      return 'other';
    }

    // Default classification
    return 'other';
  }

  /**
   * Extract structured data based on document type
   */
  private async extractStructuredData(
    file: Express.Multer.File,
    documentType: ProcessedDocument['documentType']
  ): Promise<{ data: any; confidence: number }> {
    try {
      switch (documentType) {
        case 'receipt':
          const receiptData = await ocrService.extractReceiptData(file.buffer);
          return {
            data: receiptData,
            confidence: receiptData.confidence,
          };

        case 'invoice':
          const invoiceData = await ocrService.extractInvoiceData(file.buffer);
          return {
            data: invoiceData,
            confidence: invoiceData.confidence,
          };

        case 'contract':
          const contractData = await this.extractContractData(file);
          return {
            data: contractData,
            confidence: contractData.confidence,
          };

        case 'statement':
          const statementData = await this.extractStatementData(file);
          return {
            data: statementData,
            confidence: statementData.confidence,
          };

        default:
          const ocrResult = await ocrService.extractText(file.buffer);
          return {
            data: {
              text: ocrResult.text,
              confidence: ocrResult.confidence,
            },
            confidence: ocrResult.confidence,
          };
      }
    } catch (error) {
      logger.error('Structured data extraction failed:', error);
      return {
        data: {},
        confidence: 0,
      };
    }
  }

  /**
   * Extract contract data
   */
  private async extractContractData(file: Express.Multer.File): Promise<any> {
    try {
      const ocrResult = await ocrService.extractText(file.buffer);
      
      // Extract key contract information
      const contractData = {
        parties: this.extractParties(ocrResult.text),
        startDate: this.extractDate(ocrResult.text, 'start'),
        endDate: this.extractDate(ocrResult.text, 'end'),
        paymentTerms: this.extractPaymentTerms(ocrResult.text),
        totalValue: this.extractTotalValue(ocrResult.text),
        keyClauses: this.extractKeyClauses(ocrResult.text),
        confidence: ocrResult.confidence,
      };

      return contractData;
    } catch (error) {
      logger.error('Contract data extraction failed:', error);
      return { confidence: 0 };
    }
  }

  /**
   * Extract statement data
   */
  private async extractStatementData(file: Express.Multer.File): Promise<any> {
    try {
      const ocrResult = await ocrService.extractText(file.buffer);
      
      const statementData = {
        accountNumber: this.extractAccountNumber(ocrResult.text),
        statementDate: this.extractDate(ocrResult.text, 'statement'),
        openingBalance: this.extractOpeningBalance(ocrResult.text),
        closingBalance: this.extractClosingBalance(ocrResult.text),
        transactions: this.extractTransactions(ocrResult.text),
        confidence: ocrResult.confidence,
      };

      return statementData;
    } catch (error) {
      logger.error('Statement data extraction failed:', error);
      return { confidence: 0 };
    }
  }

  /**
   * Extract parties from contract text
   */
  private extractParties(text: string): string[] {
    const partyPatterns = [
      /between\s+([^,]+)\s+and\s+([^,]+)/i,
      /party\s+one[:\s]*([^,]+)/i,
      /party\s+two[:\s]*([^,]+)/i,
    ];

    const parties: string[] = [];
    for (const pattern of partyPatterns) {
      const match = text.match(pattern);
      if (match) {
        parties.push(...match.slice(1).filter(p => p.trim()));
      }
    }

    return parties;
  }

  /**
   * Extract date from text
   */
  private extractDate(text: string, type: 'start' | 'end' | 'statement'): string {
    const datePatterns = [
      /(\d{1,2}\/\d{1,2}\/\d{2,4})/,
      /(\d{1,2}-\d{1,2}-\d{2,4})/,
      /(\d{4}-\d{1,2}-\d{1,2})/,
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return '';
  }

  /**
   * Extract payment terms
   */
  private extractPaymentTerms(text: string): string {
    const paymentPatterns = [
      /payment[:\s]*terms[:\s]*([^,]+)/i,
      /net\s+(\d+)/i,
      /due[:\s]*(\d+)\s+days/i,
    ];

    for (const pattern of paymentPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return '';
  }

  /**
   * Extract total value
   */
  private extractTotalValue(text: string): number {
    const valuePatterns = [
      /total[:\s]*\$?(\d+\.?\d*)/i,
      /amount[:\s]*\$?(\d+\.?\d*)/i,
      /\$(\d+\.?\d*)/g,
    ];

    for (const pattern of valuePatterns) {
      const match = text.match(pattern);
      if (match) {
        return parseFloat(match[1]);
      }
    }

    return 0;
  }

  /**
   * Extract key clauses
   */
  private extractKeyClauses(text: string): string[] {
    const clauseKeywords = [
      'termination',
      'renewal',
      'payment',
      'liability',
      'indemnification',
      'force majeure',
      'governing law',
    ];

    const clauses: string[] = [];
    for (const keyword of clauseKeywords) {
      const pattern = new RegExp(`${keyword}[^.]*`, 'gi');
      const match = text.match(pattern);
      if (match) {
        clauses.push(match[0]);
      }
    }

    return clauses;
  }

  /**
   * Extract account number
   */
  private extractAccountNumber(text: string): string {
    const accountPatterns = [
      /account[#:\s]*(\d+)/i,
      /acct[#:\s]*(\d+)/i,
      /(\d{4,})/,
    ];

    for (const pattern of accountPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return '';
  }

  /**
   * Extract opening balance
   */
  private extractOpeningBalance(text: string): number {
    const balancePatterns = [
      /opening[:\s]*balance[:\s]*\$?(\d+\.?\d*)/i,
      /beginning[:\s]*balance[:\s]*\$?(\d+\.?\d*)/i,
    ];

    for (const pattern of balancePatterns) {
      const match = text.match(pattern);
      if (match) {
        return parseFloat(match[1]);
      }
    }

    return 0;
  }

  /**
   * Extract closing balance
   */
  private extractClosingBalance(text: string): number {
    const balancePatterns = [
      /closing[:\s]*balance[:\s]*\$?(\d+\.?\d*)/i,
      /ending[:\s]*balance[:\s]*\$?(\d+\.?\d*)/i,
      /balance[:\s]*\$?(\d+\.?\d*)/i,
    ];

    for (const pattern of balancePatterns) {
      const match = text.match(pattern);
      if (match) {
        return parseFloat(match[1]);
      }
    }

    return 0;
  }

  /**
   * Extract transactions from statement
   */
  private extractTransactions(text: string): Array<{
    date: string;
    description: string;
    amount: number;
    type: 'debit' | 'credit';
  }> {
    const transactions: Array<{
      date: string;
      description: string;
      amount: number;
      type: 'debit' | 'credit';
    }> = [];

    // This is a simplified extraction - in production, you'd want more sophisticated parsing
    const lines = text.split('\n');
    for (const line of lines) {
      const transactionMatch = line.match(/(\d{1,2}\/\d{1,2})\s+(.+?)\s+\$?(\d+\.?\d*)/);
      if (transactionMatch) {
        transactions.push({
          date: transactionMatch[1],
          description: transactionMatch[2],
          amount: parseFloat(transactionMatch[3]),
          type: parseFloat(transactionMatch[3]) > 0 ? 'credit' : 'debit',
        });
      }
    }

    return transactions;
  }

  /**
   * Batch process multiple documents
   */
  async batchProcessDocuments(
    files: Express.Multer.File[],
    userId: string,
    options: DocumentProcessingOptions = {}
  ): Promise<ProcessedDocument[]> {
    const results: ProcessedDocument[] = [];

    for (const file of files) {
      try {
        const result = await this.processDocument(file, userId, options);
        results.push(result);
      } catch (error) {
        logger.error(`Batch processing failed for file ${file.originalname}:`, error);
        results.push({
          id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          originalFile: {} as UploadedFile,
          documentType: 'other',
          extractedData: {},
          confidence: 0,
          requiresReview: true,
          processedAt: new Date(),
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  /**
   * Get documents requiring manual review
   */
  async getDocumentsRequiringReview(userId: string): Promise<ProcessedDocument[]> {
    // In a real implementation, this would query the database
    // For now, return empty array
    return [];
  }

  /**
   * Update document review status
   */
  async updateDocumentReview(
    documentId: string,
    approved: boolean,
    corrections?: any
  ): Promise<void> {
    // In a real implementation, this would update the database
    logger.info(`Document review updated: ${documentId}, approved: ${approved}`);
  }
}

export default DocumentProcessingService;










