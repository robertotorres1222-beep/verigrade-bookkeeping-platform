import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import importService from '../services/importService';
import { authenticateToken } from '../middleware/authMiddleware';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/imports');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.csv', '.xlsx', '.xls', '.qbo'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV, Excel, and QBO files are allowed.'));
    }
  }
});

/**
 * Process uploaded file and return preview data
 */
export const processFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { type } = req.body;
    if (!type) {
      return res.status(400).json({ error: 'Import type is required' });
    }

    const result = await importService.processFile(req.file.path, type);
    
    res.json({
      success: true,
      preview: result.preview,
      mappings: result.mappings,
      totalRecords: result.totalRecords
    });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ 
      error: 'Failed to process file',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Validate field mappings
 */
export const validateMappings = async (req: Request, res: Response) => {
  try {
    const { mappings } = req.body;
    
    if (!mappings || !Array.isArray(mappings)) {
      return res.status(400).json({ error: 'Mappings array is required' });
    }

    const validation = importService.validateMappings(mappings);
    
    res.json({
      success: true,
      validation
    });
  } catch (error) {
    console.error('Error validating mappings:', error);
    res.status(500).json({ 
      error: 'Failed to validate mappings',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Start import job
 */
export const startImport = async (req: Request, res: Response) => {
  try {
    const { name, type, filePath, mappings } = req.body;
    const organizationId = (req as any).user?.organizationId;
    const userId = (req as any).user?.id;

    if (!organizationId || !userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!name || !type || !filePath || !mappings) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const job = await importService.startImport(
      name,
      type,
      filePath,
      mappings,
      organizationId,
      userId
    );

    res.json({
      success: true,
      job
    });
  } catch (error) {
    console.error('Error starting import:', error);
    res.status(500).json({ 
      error: 'Failed to start import',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get import job status
 */
export const getImportJob = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const organizationId = (req as any).user?.organizationId;

    if (!organizationId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const job = importService.getImportJob(jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Import job not found' });
    }

    if (job.organizationId !== organizationId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      job
    });
  } catch (error) {
    console.error('Error getting import job:', error);
    res.status(500).json({ 
      error: 'Failed to get import job',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get all import jobs for organization
 */
export const getImportJobs = async (req: Request, res: Response) => {
  try {
    const organizationId = (req as any).user?.organizationId;

    if (!organizationId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const jobs = importService.getImportJobs(organizationId);
    
    res.json({
      success: true,
      jobs
    });
  } catch (error) {
    console.error('Error getting import jobs:', error);
    res.status(500).json({ 
      error: 'Failed to get import jobs',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Save import template
 */
export const saveTemplate = async (req: Request, res: Response) => {
  try {
    const { name, type, description, fields } = req.body;
    const organizationId = (req as any).user?.organizationId;

    if (!organizationId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!name || !type || !fields) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const template = await importService.saveTemplate(
      name,
      type,
      description || '',
      fields,
      organizationId
    );

    res.json({
      success: true,
      template
    });
  } catch (error) {
    console.error('Error saving template:', error);
    res.status(500).json({ 
      error: 'Failed to save template',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get import templates
 */
export const getTemplates = async (req: Request, res: Response) => {
  try {
    const organizationId = (req as any).user?.organizationId;

    if (!organizationId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const templates = importService.getTemplates(organizationId);
    
    res.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Error getting templates:', error);
    res.status(500).json({ 
      error: 'Failed to get templates',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Delete import template
 */
export const deleteTemplate = async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;
    const organizationId = (req as any).user?.organizationId;

    if (!organizationId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const deleted = importService.deleteTemplate(templateId, organizationId);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ 
      error: 'Failed to delete template',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get import statistics
 */
export const getImportStats = async (req: Request, res: Response) => {
  try {
    const organizationId = (req as any).user?.organizationId;

    if (!organizationId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const stats = importService.getImportStats(organizationId);
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error getting import stats:', error);
    res.status(500).json({ 
      error: 'Failed to get import stats',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Export import results
 */
export const exportResults = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const organizationId = (req as any).user?.organizationId;

    if (!organizationId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const job = importService.getImportJob(jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Import job not found' });
    }

    if (job.organizationId !== organizationId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const results = await importService.exportResults(jobId);
    
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="import-results-${jobId}.txt"`);
    res.send(results);
  } catch (error) {
    console.error('Error exporting results:', error);
    res.status(500).json({ 
      error: 'Failed to export results',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Clean up old import jobs
 */
export const cleanupOldJobs = async (req: Request, res: Response) => {
  try {
    const { daysOld } = req.body;
    const organizationId = (req as any).user?.organizationId;

    if (!organizationId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    importService.cleanupOldJobs(daysOld || 30);
    
    res.json({
      success: true,
      message: 'Old import jobs cleaned up successfully'
    });
  } catch (error) {
    console.error('Error cleaning up old jobs:', error);
    res.status(500).json({ 
      error: 'Failed to cleanup old jobs',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Download import template
 */
export const downloadTemplate = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const organizationId = (req as any).user?.organizationId;

    if (!organizationId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Generate template based on type
    let templateData: any[] = [];
    let headers: string[] = [];

    switch (type.toUpperCase()) {
      case 'CSV':
        headers = ['Date', 'Description', 'Amount', 'Category', 'Type', 'Customer', 'Notes'];
        templateData = [
          ['2023-10-26', 'Office Supplies', '150.00', 'Office Expenses', 'expense', 'ABC Corp', 'Purchased office supplies'],
          ['2023-10-25', 'Consulting Fee', '500.00', 'Services', 'income', 'XYZ Inc', 'Monthly consulting fee']
        ];
        break;
      case 'EXCEL':
        headers = ['Transaction Date', 'Description', 'Amount', 'Category', 'Transaction Type', 'Customer Name', 'Notes'];
        templateData = [
          ['2023-10-26', 'Office Supplies', '150.00', 'Office Expenses', 'expense', 'ABC Corp', 'Purchased office supplies'],
          ['2023-10-25', 'Consulting Fee', '500.00', 'Services', 'income', 'XYZ Inc', 'Monthly consulting fee']
        ];
        break;
      default:
        return res.status(400).json({ error: 'Unsupported template type' });
    }

    if (type.toUpperCase() === 'CSV') {
      const csvContent = [headers, ...templateData]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="import-template-${type}.csv"`);
      res.send(csvContent);
    } else {
      // For Excel, you'd use a library like xlsx to generate the file
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="import-template-${type}.xlsx"`);
      res.send('Excel template would be generated here');
    }
  } catch (error) {
    console.error('Error downloading template:', error);
    res.status(500).json({ 
      error: 'Failed to download template',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export { upload };

