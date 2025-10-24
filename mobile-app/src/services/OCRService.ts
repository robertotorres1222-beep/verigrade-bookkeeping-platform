import { Platform } from 'react-native';

interface OCRResult {
  success: boolean;
  text?: string;
  confidence?: number;
  error?: string;
}

export class OCRService {
  private static readonly API_KEY = 'YOUR_OCR_API_KEY'; // Replace with actual API key
  private static readonly BASE_URL = 'https://api.ocr.space/parse/image';

  /**
   * Extract text from image using OCR
   */
  static async extractTextFromImage(imageUri: string): Promise<OCRResult> {
    try {
      const formData = new FormData();
      
      // Add image file to form data
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'receipt.jpg',
      } as any);
      
      formData.append('language', 'eng');
      formData.append('isOverlayRequired', 'true');
      formData.append('filetype', 'JPG');
      formData.append('apikey', this.API_KEY);

      const response = await fetch(this.BASE_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();

      if (result.IsErroredOnProcessing) {
        return {
          success: false,
          error: result.ErrorMessage || 'OCR processing failed',
        };
      }

      const parsedResults = result.ParsedResults[0];
      const text = parsedResults.ParsedText;
      const confidence = parsedResults.TextOverlay?.Lines?.reduce((acc: number, line: any) => 
        acc + (line.Words?.reduce((wordAcc: number, word: any) => wordAcc + word.WordConfidence, 0) || 0), 0
      ) / (parsedResults.TextOverlay?.Lines?.length || 1) || 0;

      return {
        success: true,
        text,
        confidence: confidence / 100, // Convert to 0-1 scale
      };
    } catch (error) {
      console.error('OCR processing error:', error);
      return {
        success: false,
        error: 'Failed to extract text from image',
      };
    }
  }

  /**
   * Extract text from PDF using OCR
   */
  static async extractTextFromPDF(pdfUri: string): Promise<OCRResult> {
    try {
      const formData = new FormData();
      
      formData.append('file', {
        uri: pdfUri,
        type: 'application/pdf',
        name: 'document.pdf',
      } as any);
      
      formData.append('language', 'eng');
      formData.append('isOverlayRequired', 'true');
      formData.append('filetype', 'PDF');
      formData.append('apikey', this.API_KEY);

      const response = await fetch(this.BASE_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();

      if (result.IsErroredOnProcessing) {
        return {
          success: false,
          error: result.ErrorMessage || 'PDF OCR processing failed',
        };
      }

      const parsedResults = result.ParsedResults;
      let fullText = '';
      let totalConfidence = 0;

      parsedResults.forEach((result: any, pageIndex: number) => {
        fullText += result.ParsedText + '\n';
        
        if (result.TextOverlay?.Lines) {
          const pageConfidence = result.TextOverlay.Lines.reduce((acc: number, line: any) => 
            acc + (line.Words?.reduce((wordAcc: number, word: any) => wordAcc + word.WordConfidence, 0) || 0), 0
          ) / result.TextOverlay.Lines.length;
          totalConfidence += pageConfidence;
        }
      });

      return {
        success: true,
        text: fullText.trim(),
        confidence: totalConfidence / parsedResults.length / 100,
      };
    } catch (error) {
      console.error('PDF OCR processing error:', error);
      return {
        success: false,
        error: 'Failed to extract text from PDF',
      };
    }
  }

  /**
   * Process document with OCR and return structured data
   */
  static async processDocument(fileUri: string, fileType: string): Promise<{
    extractedText: string;
    confidence: number;
    structuredData?: any;
  }> {
    try {
      let result: OCRResult;

      if (fileType === 'application/pdf') {
        result = await this.extractTextFromPDF(fileUri);
      } else if (fileType.startsWith('image/')) {
        result = await this.extractTextFromImage(fileUri);
      } else {
        return {
          extractedText: '',
          confidence: 0,
        };
      }

      if (!result.success) {
        return {
          extractedText: '',
          confidence: 0,
        };
      }

      // Extract structured data from text
      const structuredData = this.extractStructuredData(result.text || '');

      return {
        extractedText: result.text || '',
        confidence: result.confidence || 0,
        structuredData,
      };
    } catch (error) {
      console.error('Document OCR processing error:', error);
      return {
        extractedText: '',
        confidence: 0,
      };
    }
  }

  /**
   * Extract structured data from receipt text
   */
  private static extractStructuredData(text: string): any {
    try {
      // Simple regex patterns for common receipt formats
      const amountPattern = /\$?(\d+\.?\d*)/g;
      const datePattern = /(\d{1,2}\/\d{1,2}\/\d{2,4})|(\d{4}-\d{2}-\d{2})/g;
      const merchantPattern = /^([A-Z][A-Z\s&]+)/m;
      
      const amounts = text.match(amountPattern)?.map(m => parseFloat(m.replace('$', ''))) || [];
      const dates = text.match(datePattern) || [];
      const merchant = text.match(merchantPattern)?.[0]?.trim();
      
      // Find the largest amount (likely the total)
      const total = Math.max(...amounts);
      
      // Extract items (lines that don't contain amounts or dates)
      const lines = text.split('\n').filter(line => 
        line.trim().length > 0 && 
        !line.match(amountPattern) && 
        !line.match(datePattern) &&
        !line.toLowerCase().includes('total') &&
        !line.toLowerCase().includes('tax')
      );

      return {
        merchant,
        amount: total,
        date: dates[0],
        items: lines.slice(0, 5), // First 5 items
        total,
      };
    } catch (error) {
      console.error('Extract structured data error:', error);
      return {};
    }
  }

  /**
   * Search text in OCR results
   */
  static searchTextInOCR(text: string, searchTerm: string): boolean {
    const searchLower = searchTerm.toLowerCase();
    return text.toLowerCase().includes(searchLower);
  }

  /**
   * Get text confidence score
   */
  static getConfidenceScore(confidence: number): {
    level: 'high' | 'medium' | 'low';
    percentage: number;
  } {
    const percentage = Math.round(confidence * 100);
    
    let level: 'high' | 'medium' | 'low';
    if (percentage >= 80) {
      level = 'high';
    } else if (percentage >= 60) {
      level = 'medium';
    } else {
      level = 'low';
    }

    return {
      level,
      percentage,
    };
  }
}

