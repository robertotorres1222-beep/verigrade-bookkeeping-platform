import { parse } from 'csv-parse/sync';
import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface ImportJob {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  totalRecords: number;
  processedRecords: number;
  errors: number;
  organizationId: string;
  userId: string;
  createdAt: Date;
  completedAt?: Date;
  errorMessage?: string;
  filePath?: string;
  mappings: FieldMapping[];
}

interface FieldMapping {
  sourceField: string;
  targetField: string;
  dataType: string;
  required: boolean;
  transformation?: string;
}

interface ImportTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  fields: FieldMapping[];
  organizationId: string;
  createdAt: Date;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

class ImportService {
  private jobs: Map<string, ImportJob> = new Map();
  private templates: Map<string, ImportTemplate> = new Map();

  /**
   * Process uploaded file and extract preview data
   */
  async processFile(filePath: string, fileType: string): Promise<{
    preview: any[];
    mappings: FieldMapping[];
    totalRecords: number;
  }> {
    try {
      let data: any[] = [];
      let headers: string[] = [];

      switch (fileType.toUpperCase()) {
        case 'CSV':
          const csvData = await this.parseCSV(filePath);
          data = csvData.data;
          headers = csvData.headers;
          break;
        case 'EXCEL':
          const excelData = await this.parseExcel(filePath);
          data = excelData.data;
          headers = excelData.headers;
          break;
        case 'QBO':
          const qboData = await this.parseQBO(filePath);
          data = qboData.data;
          headers = qboData.headers;
          break;
        case 'XERO':
          const xeroData = await this.parseXero(filePath);
          data = xeroData.data;
          headers = xeroData.headers;
          break;
        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }

      // Generate field mappings based on detected headers
      const mappings = this.generateFieldMappings(headers);

      // Return preview data (first 10 rows)
      const preview = data.slice(0, 10);

      return {
        preview,
        mappings,
        totalRecords: data.length
      };
    } catch (error) {
      console.error('Error processing file:', error);
      throw new Error(`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse CSV file
   */
  private async parseCSV(filePath: string): Promise<{ data: any[]; headers: string[] }> {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });

      const headers = Object.keys(records[0] || {});
      return { data: records, headers };
    } catch (error) {
      throw new Error(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse Excel file
   */
  private async parseExcel(filePath: string): Promise<{ data: any[]; headers: string[] }> {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length === 0) {
        throw new Error('Excel file is empty');
      }

      const headers = jsonData[0] as string[];
      const data = jsonData.slice(1).map((row: any[]) => {
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] || '';
        });
        return obj;
      });

      return { data, headers };
    } catch (error) {
      throw new Error(`Failed to parse Excel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse QuickBooks Online file
   */
  private async parseQBO(filePath: string): Promise<{ data: any[]; headers: string[] }> {
    try {
      // QBO files are typically XML format
      // This is a simplified parser - in production, you'd use a proper QBO parser
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      
      // For demo purposes, treat as CSV with QBO-specific headers
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });

      const headers = Object.keys(records[0] || {});
      return { data: records, headers };
    } catch (error) {
      throw new Error(`Failed to parse QBO: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse Xero file
   */
  private async parseXero(filePath: string): Promise<{ data: any[]; headers: string[] }> {
    try {
      // Xero files are typically Excel format with specific structure
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length === 0) {
        throw new Error('Xero file is empty');
      }

      const headers = jsonData[0] as string[];
      const data = jsonData.slice(1).map((row: any[]) => {
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] || '';
        });
        return obj;
      });

      return { data, headers };
    } catch (error) {
      throw new Error(`Failed to parse Xero: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate field mappings based on detected headers
   */
  private generateFieldMappings(headers: string[]): FieldMapping[] {
    const commonMappings: Record<string, string> = {
      'amount': 'amount',
      'total': 'amount',
      'value': 'amount',
      'price': 'amount',
      'description': 'description',
      'desc': 'description',
      'memo': 'description',
      'notes': 'description',
      'date': 'date',
      'transaction_date': 'date',
      'created_date': 'date',
      'category': 'category',
      'type': 'category',
      'account': 'category',
      'customer': 'customer',
      'client': 'customer',
      'name': 'customer',
      'type': 'type',
      'transaction_type': 'type'
    };

    return headers.map(header => {
      const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const targetField = commonMappings[normalizedHeader] || '';
      
      return {
        sourceField: header,
        targetField,
        dataType: this.detectDataType(header),
        required: ['amount', 'description', 'date'].includes(targetField),
        transformation: this.getTransformation(header, targetField)
      };
    });
  }

  /**
   * Detect data type based on field name
   */
  private detectDataType(fieldName: string): string {
    const lowerField = fieldName.toLowerCase();
    
    if (lowerField.includes('amount') || lowerField.includes('total') || lowerField.includes('value')) {
      return 'number';
    } else if (lowerField.includes('date')) {
      return 'date';
    } else if (lowerField.includes('email')) {
      return 'email';
    } else if (lowerField.includes('phone')) {
      return 'phone';
    } else {
      return 'string';
    }
  }

  /**
   * Get transformation function for field
   */
  private getTransformation(sourceField: string, targetField: string): string | undefined {
    const lowerSource = sourceField.toLowerCase();
    const lowerTarget = targetField.toLowerCase();
    
    if (lowerTarget === 'amount' && !lowerSource.includes('amount')) {
      return 'parseFloat';
    } else if (lowerTarget === 'date' && !lowerSource.includes('date')) {
      return 'parseDate';
    } else if (lowerTarget === 'description' && lowerSource.includes('memo')) {
      return 'trim';
    }
    
    return undefined;
  }

  /**
   * Validate field mappings
   */
  validateMappings(mappings: FieldMapping[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    const requiredFields = ['amount', 'description', 'date'];
    const mappedFields = mappings.map(m => m.targetField).filter(Boolean);
    
    requiredFields.forEach(field => {
      if (!mappedFields.includes(field)) {
        errors.push(`Required field '${field}' is not mapped`);
      }
    });

    // Check for duplicate mappings
    const targetFields = mappings.map(m => m.targetField).filter(Boolean);
    const duplicates = targetFields.filter((field, index) => targetFields.indexOf(field) !== index);
    
    if (duplicates.length > 0) {
      errors.push(`Duplicate field mappings: ${duplicates.join(', ')}`);
    }

    // Check data types
    mappings.forEach(mapping => {
      if (mapping.targetField === 'amount' && mapping.dataType !== 'number') {
        warnings.push(`Field '${mapping.sourceField}' mapped to amount but data type is ${mapping.dataType}`);
      }
      
      if (mapping.targetField === 'date' && mapping.dataType !== 'date') {
        warnings.push(`Field '${mapping.sourceField}' mapped to date but data type is ${mapping.dataType}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Start import job
   */
  async startImport(
    name: string,
    type: string,
    filePath: string,
    mappings: FieldMapping[],
    organizationId: string,
    userId: string
  ): Promise<ImportJob> {
    const jobId = uuidv4();
    
    const job: ImportJob = {
      id: jobId,
      name,
      type,
      status: 'pending',
      progress: 0,
      totalRecords: 0,
      processedRecords: 0,
      errors: 0,
      organizationId,
      userId,
      createdAt: new Date(),
      filePath,
      mappings
    };

    this.jobs.set(jobId, job);

    // Start processing in background
    this.processImport(jobId);

    return job;
  }

  /**
   * Process import job
   */
  private async processImport(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;

    try {
      job.status = 'processing';
      
      // Get file data
      const fileData = await this.processFile(job.filePath!, job.type);
      job.totalRecords = fileData.totalRecords;

      // Process records in batches
      const batchSize = 100;
      const batches = Math.ceil(fileData.totalRecords / batchSize);
      
      for (let i = 0; i < batches; i++) {
        const start = i * batchSize;
        const end = Math.min(start + batchSize, fileData.totalRecords);
        const batch = fileData.preview.slice(start, end);
        
        // Process batch
        await this.processBatch(batch, job.mappings, job.organizationId);
        
        job.processedRecords = end;
        job.progress = Math.round((end / fileData.totalRecords) * 100);
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      job.status = 'completed';
      job.completedAt = new Date();
      
    } catch (error) {
      job.status = 'failed';
      job.errorMessage = error instanceof Error ? error.message : 'Unknown error';
    }
  }

  /**
   * Process batch of records
   */
  private async processBatch(
    records: any[],
    mappings: FieldMapping[],
    organizationId: string
  ): Promise<void> {
    for (const record of records) {
      try {
        const transformedRecord = this.transformRecord(record, mappings);
        await this.saveRecord(transformedRecord, organizationId);
      } catch (error) {
        console.error('Error processing record:', error);
        // Continue with next record
      }
    }
  }

  /**
   * Transform record based on mappings
   */
  private transformRecord(record: any, mappings: FieldMapping[]): any {
    const transformed: any = {};
    
    mappings.forEach(mapping => {
      if (mapping.targetField && record[mapping.sourceField] !== undefined) {
        let value = record[mapping.sourceField];
        
        // Apply transformations
        if (mapping.transformation) {
          value = this.applyTransformation(value, mapping.transformation);
        }
        
        transformed[mapping.targetField] = value;
      }
    });
    
    return transformed;
  }

  /**
   * Apply transformation to value
   */
  private applyTransformation(value: any, transformation: string): any {
    switch (transformation) {
      case 'parseFloat':
        return parseFloat(value) || 0;
      case 'parseDate':
        return new Date(value);
      case 'trim':
        return String(value).trim();
      default:
        return value;
    }
  }

  /**
   * Save record to database
   */
  private async saveRecord(record: any, organizationId: string): Promise<void> {
    // This would save to your actual database
    // For now, we'll just log the record
    console.log('Saving record:', record);
    
    // Example of saving a transaction
    if (record.amount && record.description && record.date) {
      await prisma.transaction.create({
        data: {
          organizationId,
          amount: record.amount,
          description: record.description,
          date: new Date(record.date),
          type: record.type || 'expense',
          category: record.category || 'Uncategorized',
          currency: record.currency || 'USD'
        }
      });
    }
  }

  /**
   * Get import job status
   */
  getImportJob(jobId: string): ImportJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Get all import jobs for organization
   */
  getImportJobs(organizationId: string): ImportJob[] {
    return Array.from(this.jobs.values())
      .filter(job => job.organizationId === organizationId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Save import template
   */
  async saveTemplate(
    name: string,
    type: string,
    description: string,
    fields: FieldMapping[],
    organizationId: string
  ): Promise<ImportTemplate> {
    const template: ImportTemplate = {
      id: uuidv4(),
      name,
      type,
      description,
      fields,
      organizationId,
      createdAt: new Date()
    };

    this.templates.set(template.id, template);
    return template;
  }

  /**
   * Get import templates
   */
  getTemplates(organizationId: string): ImportTemplate[] {
    return Array.from(this.templates.values())
      .filter(template => template.organizationId === organizationId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Delete import template
   */
  deleteTemplate(templateId: string, organizationId: string): boolean {
    const template = this.templates.get(templateId);
    if (template && template.organizationId === organizationId) {
      this.templates.delete(templateId);
      return true;
    }
    return false;
  }

  /**
   * Get import statistics
   */
  getImportStats(organizationId: string): {
    totalJobs: number;
    completedJobs: number;
    failedJobs: number;
    totalRecords: number;
    totalErrors: number;
  } {
    const jobs = this.getImportJobs(organizationId);
    
    return {
      totalJobs: jobs.length,
      completedJobs: jobs.filter(job => job.status === 'completed').length,
      failedJobs: jobs.filter(job => job.status === 'failed').length,
      totalRecords: jobs.reduce((sum, job) => sum + job.processedRecords, 0),
      totalErrors: jobs.reduce((sum, job) => sum + job.errors, 0)
    };
  }

  /**
   * Clean up old import jobs
   */
  cleanupOldJobs(daysOld: number = 30): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    for (const [jobId, job] of this.jobs.entries()) {
      if (job.createdAt < cutoffDate && job.status === 'completed') {
        this.jobs.delete(jobId);
      }
    }
  }

  /**
   * Export import results
   */
  async exportResults(jobId: string): Promise<Buffer> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error('Import job not found');
    }

    // This would generate a report of the import results
    // For now, return a simple text report
    const report = `
Import Job Report
================
Job ID: ${job.id}
Name: ${job.name}
Type: ${job.type}
Status: ${job.status}
Total Records: ${job.totalRecords}
Processed Records: ${job.processedRecords}
Errors: ${job.errors}
Created: ${job.createdAt.toISOString()}
Completed: ${job.completedAt?.toISOString() || 'N/A'}
    `.trim();

    return Buffer.from(report, 'utf-8');
  }
}

export default new ImportService();

