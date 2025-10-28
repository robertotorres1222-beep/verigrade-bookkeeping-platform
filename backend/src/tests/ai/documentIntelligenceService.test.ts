import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import * as documentIntelligenceService from '../../services/documentIntelligenceService';

describe('Document Intelligence Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('extractDocumentData', () => {
    it('should extract data from image documents', async () => {
      const mockBuffer = Buffer.from('mock image data');
      const mimeType = 'image/jpeg';
      
      const result = await documentIntelligenceService.extractDocumentData(mockBuffer, mimeType);
      
      expect(result).toHaveProperty('documentType');
      expect(result).toHaveProperty('extractedFields');
      expect(result).toHaveProperty('fullText');
      expect(result).toHaveProperty('confidence');
      expect(result.documentType).toBe('Receipt/Invoice');
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should extract data from PDF documents', async () => {
      const mockBuffer = Buffer.from('mock pdf data');
      const mimeType = 'application/pdf';
      
      const result = await documentIntelligenceService.extractDocumentData(mockBuffer, mimeType);
      
      expect(result.documentType).toBe('Receipt/Invoice');
      expect(result.extractedFields).toHaveProperty('vendorName');
      expect(result.extractedFields).toHaveProperty('totalAmount');
      expect(result.extractedFields).toHaveProperty('date');
    });

    it('should handle unknown document types', async () => {
      const mockBuffer = Buffer.from('mock data');
      const mimeType = 'text/plain';
      
      const result = await documentIntelligenceService.extractDocumentData(mockBuffer, mimeType);
      
      expect(result.documentType).toBe('Unknown');
      expect(result.confidence).toBe(0.85);
    });
  });

  describe('analyzeContract', () => {
    it('should analyze standard service agreements', async () => {
      const contractText = 'This is a service agreement between Company A and Company B...';
      
      const result = await documentIntelligenceService.analyzeContract(contractText);
      
      expect(result).toHaveProperty('contractType');
      expect(result).toHaveProperty('parties');
      expect(result).toHaveProperty('startDate');
      expect(result).toHaveProperty('endDate');
      expect(result).toHaveProperty('paymentTerms');
      expect(result).toHaveProperty('revenueRecognitionImpact');
      expect(result.contractType).toBe('Service Agreement');
    });

    it('should analyze lease agreements', async () => {
      const contractText = 'This is a lease agreement for office space...';
      
      const result = await documentIntelligenceService.analyzeContract(contractText);
      
      expect(result.contractType).toBe('Lease Agreement');
      expect(result.revenueRecognitionImpact).toContain('ASC 842');
    });
  });

  describe('extractVendorInfo', () => {
    it('should extract vendor information from documents', async () => {
      const documentText = 'Invoice from Global Supplies Co. for $500...';
      
      const result = await documentIntelligenceService.extractVendorInfo(documentText);
      
      expect(result).toHaveProperty('vendorName');
      expect(result).toHaveProperty('address');
      expect(result).toHaveProperty('taxId');
      expect(result).toHaveProperty('contactEmail');
      expect(result).toHaveProperty('phone');
      expect(result).toHaveProperty('paymentTerms');
      expect(result).toHaveProperty('confidence');
      expect(result.vendorName).toBe('Global Supplies Co.');
    });

    it('should handle tech solutions vendor', async () => {
      const documentText = 'Invoice from Tech Solutions Inc. for software services...';
      
      const result = await documentIntelligenceService.extractVendorInfo(documentText);
      
      expect(result.vendorName).toBe('Tech Solutions Inc.');
      expect(result.contactEmail).toBe('support@techsolutions.com');
    });
  });
});










