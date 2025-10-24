import { PrismaClient } from '@prisma/client';
import * as csv from 'csv-parser';
import * as fs from 'fs';
import { Readable } from 'stream';
import logger from '../utils/logger';

export interface StatementImport {
  id: string;
  accountId: string;
  userId: string;
  fileName: string;
  fileFormat: 'csv' | 'ofx' | 'qfx';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalRecords: number;
  importedRecords: number;
  duplicateRecords: number;
  errorRecords: number;
  errors: string[];
  createdAt: Date;
  completedAt?: Date;
}

export interface ImportPreview {
  totalRecords: number;
  sampleRecords: any[];
  fieldMapping: { [key: string]: string };
  detectedFormat: string;
  validationErrors: string[];
}

export interface StatementRecord {
  date: Date;
  amount: number;
  description: string;
  reference?: string;
  type: 'debit' | 'credit';
  balance?: number;
  metadata: any;
}

class StatementImportService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
    logger.info('[StatementImportService] Initialized');
  }

  /**
   * Detects statement format from file
   */
  public async detectStatementFormat(fileBuffer: Buffer, fileName: string): Promise<{
    format: 'csv' | 'ofx' | 'qfx' | 'unknown';
    confidence: number;
    sample: string;
  }> {
    try {
      const content = fileBuffer.toString('utf8');
      const sample = content.substring(0, 1000);

      // Check for OFX format
      if (content.includes('<OFX>') || content.includes('<OFXHEADER>')) {
        return { format: 'ofx', confidence: 0.9, sample };
      }

      // Check for QFX format
      if (content.includes('<QFX>') || content.includes('<QUICKEN>')) {
        return { format: 'qfx', confidence: 0.9, sample };
      }

      // Check for CSV format
      if (content.includes(',') && content.includes('\n')) {
        const lines = content.split('\n');
        if (lines.length > 1) {
          const firstLine = lines[0];
          const secondLine = lines[1];
          
          // Check if first line looks like headers
          if (firstLine.includes('date') || firstLine.includes('amount') || firstLine.includes('description')) {
            return { format: 'csv', confidence: 0.8, sample };
          }
          
          // Check if second line looks like data
          if (secondLine.includes(',') && !isNaN(parseFloat(secondLine.split(',')[1]))) {
            return { format: 'csv', confidence: 0.7, sample };
          }
        }
      }

      return { format: 'unknown', confidence: 0, sample };
    } catch (error: any) {
      logger.error('[StatementImportService] Error detecting statement format:', error);
      return { format: 'unknown', confidence: 0, sample: '' };
    }
  }

  /**
   * Creates import preview
   */
  public async createImportPreview(
    fileBuffer: Buffer,
    format: 'csv' | 'ofx' | 'qfx',
    fieldMapping?: { [key: string]: string }
  ): Promise<ImportPreview> {
    try {
      let records: StatementRecord[] = [];
      let fieldMappingResult: { [key: string]: string } = {};

      switch (format) {
        case 'csv':
          const csvResult = await this.parseCSVPreview(fileBuffer, fieldMapping);
          records = csvResult.records;
          fieldMappingResult = csvResult.fieldMapping;
          break;
        case 'ofx':
          const ofxResult = await this.parseOFXPreview(fileBuffer);
          records = ofxResult.records;
          fieldMappingResult = ofxResult.fieldMapping;
          break;
        case 'qfx':
          const qfxResult = await this.parseQFXPreview(fileBuffer);
          records = qfxResult.records;
          fieldMappingResult = qfxResult.fieldMapping;
          break;
      }

      const validationErrors = this.validateRecords(records);
      const sampleRecords = records.slice(0, 5);

      return {
        totalRecords: records.length,
        sampleRecords,
        fieldMapping: fieldMappingResult,
        detectedFormat: format,
        validationErrors
      };
    } catch (error: any) {
      logger.error('[StatementImportService] Error creating import preview:', error);
      throw new Error(`Failed to create import preview: ${error.message}`);
    }
  }

  /**
   * Starts statement import
   */
  public async startStatementImport(
    accountId: string,
    userId: string,
    fileName: string,
    fileFormat: 'csv' | 'ofx' | 'qfx',
    fileBuffer: Buffer,
    fieldMapping: { [key: string]: string }
  ): Promise<StatementImport> {
    try {
      const importRecord = await this.prisma.statementImport.create({
        data: {
          accountId,
          userId,
          fileName,
          fileFormat,
          status: 'pending',
          totalRecords: 0,
          importedRecords: 0,
          duplicateRecords: 0,
          errorRecords: 0,
          errors: []
        }
      });

      // Start background processing
      this.processStatementImport(importRecord.id, fileBuffer, fieldMapping);

      logger.info(`[StatementImportService] Started statement import ${importRecord.id} for account ${accountId}`);
      return importRecord as StatementImport;
    } catch (error: any) {
      logger.error('[StatementImportService] Error starting statement import:', error);
      throw new Error(`Failed to start statement import: ${error.message}`);
    }
  }

  /**
   * Processes statement import in background
   */
  private async processStatementImport(
    importId: string,
    fileBuffer: Buffer,
    fieldMapping: { [key: string]: string }
  ): Promise<void> {
    try {
      // Update status to processing
      await this.prisma.statementImport.update({
        where: { id: importId },
        data: { status: 'processing' }
      });

      const importRecord = await this.prisma.statementImport.findUnique({
        where: { id: importId }
      });

      if (!importRecord) {
        throw new Error('Import record not found');
      }

      let records: StatementRecord[] = [];
      let totalRecords = 0;
      let importedRecords = 0;
      let duplicateRecords = 0;
      let errorRecords = 0;
      const errors: string[] = [];

      // Parse records based on format
      switch (importRecord.fileFormat) {
        case 'csv':
          records = await this.parseCSVRecords(fileBuffer, fieldMapping);
          break;
        case 'ofx':
          records = await this.parseOFXRecords(fileBuffer);
          break;
        case 'qfx':
          records = await this.parseQFXRecords(fileBuffer);
          break;
      }

      totalRecords = records.length;

      // Import records
      for (const record of records) {
        try {
          // Check for duplicates
          const existing = await this.prisma.bankTransaction.findFirst({
            where: {
              accountId: importRecord.accountId,
              amount: record.amount,
              date: record.date,
              description: record.description
            }
          });

          if (existing) {
            duplicateRecords++;
            continue;
          }

          // Create transaction
          await this.prisma.bankTransaction.create({
            data: {
              accountId: importRecord.accountId,
              externalId: record.reference || `import-${Date.now()}-${Math.random()}`,
              date: record.date,
              amount: record.amount,
              description: record.description,
              type: record.type,
              status: 'posted',
              isReconciled: false,
              metadata: record.metadata
            }
          });

          importedRecords++;
        } catch (error: any) {
          errorRecords++;
          errors.push(`Failed to import record: ${error.message}`);
        }
      }

      // Update import record with results
      await this.prisma.statementImport.update({
        where: { id: importId },
        data: {
          status: 'completed',
          totalRecords,
          importedRecords,
          duplicateRecords,
          errorRecords,
          errors,
          completedAt: new Date()
        }
      });

      logger.info(`[StatementImportService] Completed statement import ${importId}: ${importedRecords} imported, ${duplicateRecords} duplicates, ${errorRecords} errors`);
    } catch (error: any) {
      logger.error(`[StatementImportService] Error processing statement import ${importId}:`, error);
      
      await this.prisma.statementImport.update({
        where: { id: importId },
        data: {
          status: 'failed',
          errors: [error.message]
        }
      });
    }
  }

  /**
   * Gets import status
   */
  public async getImportStatus(importId: string, userId: string): Promise<StatementImport | null> {
    try {
      const importRecord = await this.prisma.statementImport.findFirst({
        where: { id: importId, userId }
      });

      return importRecord as StatementImport | null;
    } catch (error: any) {
      logger.error(`[StatementImportService] Error getting import status for ${importId}:`, error);
      throw new Error(`Failed to get import status: ${error.message}`);
    }
  }

  /**
   * Gets import history for account
   */
  public async getImportHistory(
    accountId: string,
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<StatementImport[]> {
    try {
      const imports = await this.prisma.statementImport.findMany({
        where: { accountId, userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      });

      return imports as StatementImport[];
    } catch (error: any) {
      logger.error(`[StatementImportService] Error getting import history for account ${accountId}:`, error);
      throw new Error(`Failed to get import history: ${error.message}`);
    }
  }

  /**
   * Parses CSV preview
   */
  private async parseCSVPreview(
    fileBuffer: Buffer,
    fieldMapping?: { [key: string]: string }
  ): Promise<{
    records: StatementRecord[];
    fieldMapping: { [key: string]: string };
  }> {
    const records: StatementRecord[] = [];
    const fieldMapping: { [key: string]: string } = {};

    return new Promise((resolve, reject) => {
      const stream = Readable.from(fileBuffer.toString());
      
      stream
        .pipe(csv())
        .on('data', (row) => {
          if (records.length < 10) { // Only parse first 10 rows for preview
            const record = this.mapCSVRow(row, fieldMapping);
            if (record) records.push(record);
          }
        })
        .on('end', () => {
          resolve({ records, fieldMapping });
        })
        .on('error', reject);
    });
  }

  /**
   * Parses CSV records
   */
  private async parseCSVRecords(
    fileBuffer: Buffer,
    fieldMapping: { [key: string]: string }
  ): Promise<StatementRecord[]> {
    const records: StatementRecord[] = [];

    return new Promise((resolve, reject) => {
      const stream = Readable.from(fileBuffer.toString());
      
      stream
        .pipe(csv())
        .on('data', (row) => {
          const record = this.mapCSVRow(row, fieldMapping);
          if (record) records.push(record);
        })
        .on('end', () => {
          resolve(records);
        })
        .on('error', reject);
    });
  }

  /**
   * Maps CSV row to statement record
   */
  private mapCSVRow(row: any, fieldMapping: { [key: string]: string }): StatementRecord | null {
    try {
      const dateField = fieldMapping.date || 'date';
      const amountField = fieldMapping.amount || 'amount';
      const descriptionField = fieldMapping.description || 'description';
      const referenceField = fieldMapping.reference || 'reference';

      const date = new Date(row[dateField]);
      const amount = parseFloat(row[amountField]);
      const description = row[descriptionField] || '';
      const reference = row[referenceField] || '';

      if (isNaN(date.getTime()) || isNaN(amount)) {
        return null;
      }

      return {
        date,
        amount,
        description,
        reference,
        type: amount > 0 ? 'credit' : 'debit',
        metadata: { originalRow: row }
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Parses OFX preview
   */
  private async parseOFXPreview(fileBuffer: Buffer): Promise<{
    records: StatementRecord[];
    fieldMapping: { [key: string]: string };
  }> {
    // Simplified OFX parsing for preview
    const content = fileBuffer.toString();
    const records: StatementRecord[] = [];
    const fieldMapping = {
      date: 'DTPOSTED',
      amount: 'TRNAMT',
      description: 'NAME',
      reference: 'FITID'
    };

    // Extract sample transactions
    const transactionMatches = content.match(/<STMTTRN>[\s\S]*?<\/STMTTRN>/g);
    if (transactionMatches) {
      for (let i = 0; i < Math.min(5, transactionMatches.length); i++) {
        const transaction = transactionMatches[i];
        const record = this.parseOFXTransaction(transaction);
        if (record) records.push(record);
      }
    }

    return { records, fieldMapping };
  }

  /**
   * Parses OFX records
   */
  private async parseOFXRecords(fileBuffer: Buffer): Promise<StatementRecord[]> {
    const content = fileBuffer.toString();
    const records: StatementRecord[] = [];

    const transactionMatches = content.match(/<STMTTRN>[\s\S]*?<\/STMTTRN>/g);
    if (transactionMatches) {
      for (const transaction of transactionMatches) {
        const record = this.parseOFXTransaction(transaction);
        if (record) records.push(record);
      }
    }

    return records;
  }

  /**
   * Parses OFX transaction
   */
  private parseOFXTransaction(transaction: string): StatementRecord | null {
    try {
      const dateMatch = transaction.match(/<DTPOSTED>(\d{8})/);
      const amountMatch = transaction.match(/<TRNAMT>([+-]?\d+\.?\d*)/);
      const descriptionMatch = transaction.match(/<NAME>([^<]+)/);
      const referenceMatch = transaction.match(/<FITID>([^<]+)/);

      if (!dateMatch || !amountMatch || !descriptionMatch) {
        return null;
      }

      const date = new Date(
        dateMatch[1].substring(0, 4) + '-' +
        dateMatch[1].substring(4, 6) + '-' +
        dateMatch[1].substring(6, 8)
      );
      const amount = parseFloat(amountMatch[1]);
      const description = descriptionMatch[1];
      const reference = referenceMatch ? referenceMatch[1] : '';

      return {
        date,
        amount,
        description,
        reference,
        type: amount > 0 ? 'credit' : 'debit',
        metadata: { originalTransaction: transaction }
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Parses QFX preview
   */
  private async parseQFXPreview(fileBuffer: Buffer): Promise<{
    records: StatementRecord[];
    fieldMapping: { [key: string]: string };
  }> {
    // QFX is similar to OFX but with Quicken-specific extensions
    return this.parseOFXPreview(fileBuffer);
  }

  /**
   * Parses QFX records
   */
  private async parseQFXRecords(fileBuffer: Buffer): Promise<StatementRecord[]> {
    // QFX parsing is similar to OFX
    return this.parseOFXRecords(fileBuffer);
  }

  /**
   * Validates records
   */
  private validateRecords(records: StatementRecord[]): string[] {
    const errors: string[] = [];

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      
      if (isNaN(record.date.getTime())) {
        errors.push(`Record ${i + 1}: Invalid date`);
      }
      
      if (isNaN(record.amount)) {
        errors.push(`Record ${i + 1}: Invalid amount`);
      }
      
      if (!record.description || record.description.trim() === '') {
        errors.push(`Record ${i + 1}: Missing description`);
      }
    }

    return errors;
  }
}

export default new StatementImportService();







