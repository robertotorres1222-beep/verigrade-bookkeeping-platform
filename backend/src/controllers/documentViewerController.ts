import { Request, Response } from 'express';
import documentService from '../services/documentService';
import ocrService from '../services/ocrService';
import { prisma } from '../lib/prisma';

/**
 * Get document for viewing
 */
export const getDocumentForViewing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { version } = req.query;

    const document = await documentService.getDocument(id, req.user!.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
      });
    }

    const targetVersion = version ? parseInt(version as string) : document.currentVersion;
    const documentVersion = document.versions.find(v => v.version === targetVersion);
    
    if (!documentVersion) {
      return res.status(404).json({
        success: false,
        error: 'Document version not found',
      });
    }

    // Get document URL
    const documentUrl = await documentService.getDocumentUrl(id, targetVersion, req.user!.id);

    res.json({
      success: true,
      document: {
        ...document,
        currentVersion: targetVersion,
        documentUrl,
      },
    });
  } catch (error) {
    console.error('Error getting document for viewing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get document for viewing',
    });
  }
};

/**
 * Process document with OCR
 */
export const processDocumentOCR = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { version } = req.query;

    const document = await documentService.getDocument(id, req.user!.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
      });
    }

    const targetVersion = version ? parseInt(version as string) : document.currentVersion;
    const documentVersion = document.versions.find(v => v.version === targetVersion);
    
    if (!documentVersion) {
      return res.status(404).json({
        success: false,
        error: 'Document version not found',
      });
    }

    // Get file from S3
    const s3Service = require('../services/s3Service').default;
    const fileBuffer = await s3Service.getFile(documentVersion.s3Key);

    // Process with OCR
    const ocrResult = await ocrService.processDocument(
      fileBuffer,
      documentVersion.fileName,
      documentVersion.contentType
    );

    // Store OCR result in database
    await prisma.documentOCR.create({
      data: {
        documentId: id,
        version: targetVersion,
        extractedText: ocrResult.extractedText,
        confidence: ocrResult.confidence,
        boundingBoxes: ocrResult.boundingBoxes,
        metadata: ocrResult.metadata,
        processedBy: req.user!.id,
      },
    });

    res.json({
      success: true,
      ocrResult,
    });
  } catch (error) {
    console.error('Error processing document OCR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process document OCR',
    });
  }
};

/**
 * Get document annotations
 */
export const getDocumentAnnotations = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { version } = req.query;

    const targetVersion = version ? parseInt(version as string) : undefined;

    const annotations = await prisma.documentAnnotation.findMany({
      where: {
        documentId: id,
        ...(targetVersion && { version: targetVersion }),
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      annotations,
    });
  } catch (error) {
    console.error('Error getting document annotations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get document annotations',
    });
  }
};

/**
 * Create document annotation
 */
export const createDocumentAnnotation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      type,
      content,
      position,
      page,
      color,
      style,
    } = req.body;

    const annotation = await prisma.documentAnnotation.create({
      data: {
        documentId: id,
        type,
        content,
        position,
        page,
        color,
        style,
        createdBy: req.user!.id,
      },
    });

    res.status(201).json({
      success: true,
      annotation,
    });
  } catch (error) {
    console.error('Error creating document annotation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create document annotation',
    });
  }
};

/**
 * Update document annotation
 */
export const updateDocumentAnnotation = async (req: Request, res: Response) => {
  try {
    const { id, annotationId } = req.params;
    const updates = req.body;

    const annotation = await prisma.documentAnnotation.update({
      where: {
        id: annotationId,
        documentId: id,
        createdBy: req.user!.id,
      },
      data: updates,
    });

    res.json({
      success: true,
      annotation,
    });
  } catch (error) {
    console.error('Error updating document annotation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update document annotation',
    });
  }
};

/**
 * Delete document annotation
 */
export const deleteDocumentAnnotation = async (req: Request, res: Response) => {
  try {
    const { id, annotationId } = req.params;

    await prisma.documentAnnotation.delete({
      where: {
        id: annotationId,
        documentId: id,
        createdBy: req.user!.id,
      },
    });

    res.json({
      success: true,
      message: 'Annotation deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting document annotation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete document annotation',
    });
  }
};

/**
 * Search text in document
 */
export const searchDocumentText = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { q, version } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required',
      });
    }

    const targetVersion = version ? parseInt(version as string) : undefined;

    // Get OCR result
    const ocrResult = await prisma.documentOCR.findFirst({
      where: {
        documentId: id,
        ...(targetVersion && { version: targetVersion }),
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!ocrResult) {
      return res.status(404).json({
        success: false,
        error: 'Document not processed with OCR yet',
      });
    }

    // Search in extracted text
    const searchResults = ocrService.searchTextInOCR(
      {
        text: ocrResult.extractedText,
        confidence: ocrResult.confidence,
        boundingBoxes: ocrResult.boundingBoxes as any[],
        metadata: ocrResult.metadata as any,
      },
      q as string
    );

    res.json({
      success: true,
      searchResults,
      totalMatches: searchResults.length,
    });
  } catch (error) {
    console.error('Error searching document text:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search document text',
    });
  }
};

/**
 * Get document OCR result
 */
export const getDocumentOCR = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { version } = req.query;

    const targetVersion = version ? parseInt(version as string) : undefined;

    const ocrResult = await prisma.documentOCR.findFirst({
      where: {
        documentId: id,
        ...(targetVersion && { version: targetVersion }),
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!ocrResult) {
      return res.status(404).json({
        success: false,
        error: 'Document not processed with OCR yet',
      });
    }

    res.json({
      success: true,
      ocrResult,
    });
  } catch (error) {
    console.error('Error getting document OCR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get document OCR',
    });
  }
};

/**
 * Get document confidence score
 */
export const getDocumentConfidence = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { version } = req.query;

    const targetVersion = version ? parseInt(version as string) : undefined;

    const ocrResult = await prisma.documentOCR.findFirst({
      where: {
        documentId: id,
        ...(targetVersion && { version: targetVersion }),
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!ocrResult) {
      return res.status(404).json({
        success: false,
        error: 'Document not processed with OCR yet',
      });
    }

    const confidenceScore = ocrService.getConfidenceScore({
      text: ocrResult.extractedText,
      confidence: ocrResult.confidence,
      boundingBoxes: ocrResult.boundingBoxes as any[],
      metadata: ocrResult.metadata as any,
    });

    res.json({
      success: true,
      confidenceScore,
    });
  } catch (error) {
    console.error('Error getting document confidence:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get document confidence',
    });
  }
};

/**
 * Export document with annotations
 */
export const exportDocumentWithAnnotations = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { format = 'pdf' } = req.query;

    const document = await documentService.getDocument(id, req.user!.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
      });
    }

    const annotations = await prisma.documentAnnotation.findMany({
      where: { documentId: id },
      orderBy: { createdAt: 'desc' },
    });

    // This would integrate with a PDF generation library
    // For now, return the data structure
    res.json({
      success: true,
      document,
      annotations,
      exportFormat: format,
      message: 'Document export with annotations would be generated here',
    });
  } catch (error) {
    console.error('Error exporting document with annotations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export document with annotations',
    });
  }
};

