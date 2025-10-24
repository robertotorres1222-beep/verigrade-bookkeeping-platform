import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { EnhancedOCRService } from '../../services/enhancedOcrService';

describe('EnhancedOCRService', () => {
  let enhancedOcrService: EnhancedOCRService;
  const mockImageBuffer = Buffer.from('mock-image-data');

  beforeEach(() => {
    enhancedOcrService = new EnhancedOCRService();
    jest.clearAllMocks();
  });

  describe('extractTextWithPreprocessing', () => {
    it('should extract text with enhanced preprocessing', async () => {
      const result = await enhancedOcrService.extractTextWithPreprocessing(
        mockImageBuffer,
        'receipt.jpg'
      );

      expect(result).toHaveProperty('text');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('documentType');
      expect(result).toHaveProperty('preprocessing');
      expect(result.preprocessing).toHaveProperty('originalSize');
      expect(result.preprocessing).toHaveProperty('processedSize');
      expect(result.preprocessing).toHaveProperty('enhancements');
    });

    it('should detect receipt document type', async () => {
      const result = await enhancedOcrService.extractTextWithPreprocessing(
        mockImageBuffer,
        'receipt.jpg'
      );

      expect(result.documentType).toBe('receipt');
    });

    it('should detect invoice document type', async () => {
      const result = await enhancedOcrService.extractTextWithPreprocessing(
        mockImageBuffer,
        'invoice.pdf'
      );

      expect(result.documentType).toBe('invoice');
    });

    it('should extract receipt data for receipt documents', async () => {
      const result = await enhancedOcrService.extractTextWithPreprocessing(
        mockImageBuffer,
        'receipt.jpg'
      );

      if (result.documentType === 'receipt') {
        expect(result.receiptData).toBeDefined();
        expect(result.receiptData).toHaveProperty('vendor');
        expect(result.receiptData).toHaveProperty('total');
        expect(result.receiptData).toHaveProperty('date');
        expect(result.receiptData).toHaveProperty('items');
        expect(result.receiptData).toHaveProperty('confidence');
      }
    });

    it('should extract invoice data for invoice documents', async () => {
      const result = await enhancedOcrService.extractTextWithPreprocessing(
        mockImageBuffer,
        'invoice.pdf'
      );

      if (result.documentType === 'invoice') {
        expect(result.invoiceData).toBeDefined();
        expect(result.invoiceData).toHaveProperty('invoiceNumber');
        expect(result.invoiceData).toHaveProperty('vendor');
        expect(result.invoiceData).toHaveProperty('total');
        expect(result.invoiceData).toHaveProperty('date');
        expect(result.invoiceData).toHaveProperty('items');
        expect(result.invoiceData).toHaveProperty('confidence');
      }
    });
  });

  describe('detectDocumentType', () => {
    it('should detect receipt from filename', () => {
      const receiptText = 'Total: $25.50\nThank you for your visit!';
      const documentType = (enhancedOcrService as any).detectDocumentType(receiptText, 'receipt.jpg');
      expect(documentType).toBe('receipt');
    });

    it('should detect invoice from filename', () => {
      const invoiceText = 'Invoice #12345\nDue Date: 30 days';
      const documentType = (enhancedOcrService as any).detectDocumentType(invoiceText, 'invoice.pdf');
      expect(documentType).toBe('invoice');
    });

    it('should detect contract from content', () => {
      const contractText = 'This agreement is between Party A and Party B. Terms and conditions apply.';
      const documentType = (enhancedOcrService as any).detectDocumentType(contractText);
      expect(documentType).toBe('contract');
    });

    it('should detect statement from content', () => {
      const statementText = 'Account Balance: $1,234.56\nPrevious Balance: $1,000.00\nPayment Due: $234.56';
      const documentType = (enhancedOcrService as any).detectDocumentType(statementText);
      expect(documentType).toBe('statement');
    });

    it('should default to other for unknown content', () => {
      const unknownText = 'Some random text without clear indicators';
      const documentType = (enhancedOcrService as any).detectDocumentType(unknownText);
      expect(documentType).toBe('other');
    });
  });

  describe('extractReceiptData', () => {
    it('should extract vendor name from receipt text', async () => {
      const receiptText = 'STARBUCKS COFFEE\n123 Main St\nTotal: $4.50\nThank you!';
      const receiptData = await (enhancedOcrService as any).extractReceiptData(receiptText);
      
      expect(receiptData.vendor).toBe('STARBUCKS COFFEE');
    });

    it('should extract total amount from receipt text', async () => {
      const receiptText = 'Total: $25.50\nSubtotal: $23.00\nTax: $2.50';
      const receiptData = await (enhancedOcrService as any).extractReceiptData(receiptText);
      
      expect(receiptData.total).toBe(25.50);
    });

    it('should extract date from receipt text', async () => {
      const receiptText = 'Date: 12/25/2023\nTotal: $25.50';
      const receiptData = await (enhancedOcrService as any).extractReceiptData(receiptText);
      
      expect(receiptData.date).toBe('12/25/2023');
    });

    it('should extract items from receipt text', async () => {
      const receiptText = 'Coffee $3.50\nSandwich $8.00\nTotal $11.50';
      const receiptData = await (enhancedOcrService as any).extractReceiptData(receiptText);
      
      expect(receiptData.items).toBeDefined();
      expect(Array.isArray(receiptData.items)).toBe(true);
    });

    it('should calculate confidence score', async () => {
      const receiptText = 'STARBUCKS COFFEE\nTotal: $25.50\nDate: 12/25/2023\nThank you!';
      const receiptData = await (enhancedOcrService as any).extractReceiptData(receiptText);
      
      expect(receiptData.confidence).toBeGreaterThan(0);
      expect(receiptData.confidence).toBeLessThanOrEqual(100);
    });
  });

  describe('extractInvoiceData', () => {
    it('should extract invoice number', async () => {
      const invoiceText = 'Invoice #INV-12345\nBill To: John Doe\nTotal: $500.00';
      const invoiceData = await (enhancedOcrService as any).extractInvoiceData(invoiceText);
      
      expect(invoiceData.invoiceNumber).toBe('INV-12345');
    });

    it('should extract vendor information', async () => {
      const invoiceText = 'ABC Company Inc.\n123 Business St\nInvoice #12345';
      const invoiceData = await (enhancedOcrService as any).extractInvoiceData(invoiceText);
      
      expect(invoiceData.vendor).toBe('ABC Company Inc.');
    });

    it('should extract due date', async () => {
      const invoiceText = 'Due Date: 01/15/2024\nNet 30 days\nTotal: $500.00';
      const invoiceData = await (enhancedOcrService as any).extractInvoiceData(invoiceText);
      
      expect(invoiceData.dueDate).toBe('01/15/2024');
    });

    it('should extract payment terms', async () => {
      const invoiceText = 'Payment Terms: Net 30\nDue Date: 01/15/2024';
      const invoiceData = await (enhancedOcrService as any).extractInvoiceData(invoiceText);
      
      expect(invoiceData.paymentTerms).toBe('Net 30');
    });
  });

  describe('preprocessing', () => {
    it('should apply receipt-specific preprocessing', async () => {
      const result = await enhancedOcrService.extractTextWithPreprocessing(
        mockImageBuffer,
        'receipt.jpg'
      );

      expect(result.preprocessing.enhancements).toContain('grayscale');
      expect(result.preprocessing.enhancements).toContain('contrast');
      expect(result.preprocessing.enhancements).toContain('sharpen');
    });

    it('should resize large images', async () => {
      // Mock a large image buffer
      const largeImageBuffer = Buffer.alloc(5000000); // 5MB
      
      const result = await enhancedOcrService.extractTextWithPreprocessing(
        largeImageBuffer,
        'large-receipt.jpg'
      );

      expect(result.preprocessing.processedSize.width).toBeLessThanOrEqual(2000);
    });
  });

  describe('error handling', () => {
    it('should handle invalid image buffer', async () => {
      const invalidBuffer = Buffer.from('invalid-image-data');
      
      await expect(
        enhancedOcrService.extractTextWithPreprocessing(invalidBuffer, 'test.jpg')
      ).rejects.toThrow();
    });

    it('should handle empty filename', async () => {
      const result = await enhancedOcrService.extractTextWithPreprocessing(
        mockImageBuffer,
        ''
      );

      expect(result.documentType).toBe('other');
    });

    it('should handle null filename', async () => {
      const result = await enhancedOcrService.extractTextWithPreprocessing(
        mockImageBuffer,
        undefined as any
      );

      expect(result.documentType).toBe('other');
    });
  });

  describe('cleanup', () => {
    it('should cleanup worker resources', async () => {
      await enhancedOcrService.cleanup();
      // This test ensures the cleanup method doesn't throw errors
      expect(true).toBe(true);
    });
  });
});







