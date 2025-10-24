import { Request, Response } from 'express';
import documentService from '../services/documentService';
import multer from 'multer';

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow all file types for now
    cb(null, true);
  },
});

/**
 * Upload document
 */
export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided',
      });
    }

    const {
      description,
      category = 'general',
      tags = [],
      folder,
    } = req.body;

    const document = await documentService.uploadDocument(
      {
        fileName: file.originalname,
        fileSize: file.size,
        contentType: file.mimetype,
        fileBuffer: file.buffer,
        folder,
        metadata: {
          description,
          category,
          tags: tags.split(',').map((tag: string) => tag.trim()),
        },
      },
      req.user!.organizationId!,
      req.user!.id
    );

    res.status(201).json({
      success: true,
      document,
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload document',
    });
  }
};

/**
 * Get document by ID
 */
export const getDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const document = await documentService.getDocument(id, req.user!.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
      });
    }

    res.json({
      success: true,
      document,
    });
  } catch (error) {
    console.error('Error getting document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get document',
    });
  }
};

/**
 * Get documents
 */
export const getDocuments = async (req: Request, res: Response) => {
  try {
    const {
      category,
      tags,
      search,
      isPublic,
    } = req.query;

    const filters: any = {};
    if (category) filters.category = category as string;
    if (tags) filters.tags = (tags as string).split(',');
    if (search) filters.search = search as string;
    if (isPublic !== undefined) filters.isPublic = isPublic === 'true';

    const documents = await documentService.getDocuments(
      req.user!.organizationId!,
      req.user!.id,
      filters
    );

    res.json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error('Error getting documents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get documents',
    });
  }
};

/**
 * Update document
 */
export const updateDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const document = await documentService.updateDocument(
      id,
      updates,
      req.user!.id
    );

    res.json({
      success: true,
      document,
    });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update document',
    });
  }
};

/**
 * Delete document
 */
export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await documentService.deleteDocument(id, req.user!.id);

    res.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete document',
    });
  }
};

/**
 * Upload new version
 */
export const uploadNewVersion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided',
      });
    }

    const {
      description,
      category,
      tags,
      folder,
    } = req.body;

    const version = await documentService.uploadNewVersion(
      id,
      {
        fileName: file.originalname,
        fileSize: file.size,
        contentType: file.mimetype,
        fileBuffer: file.buffer,
        folder,
        metadata: {
          description,
          category,
          tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : [],
        },
      },
      req.user!.id
    );

    res.status(201).json({
      success: true,
      version,
    });
  } catch (error) {
    console.error('Error uploading new version:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload new version',
    });
  }
};

/**
 * Get document version
 */
export const getDocumentVersion = async (req: Request, res: Response) => {
  try {
    const { id, version } = req.params;
    const versionNumber = parseInt(version);

    const documentVersion = await documentService.getDocumentVersion(
      id,
      versionNumber,
      req.user!.id
    );

    if (!documentVersion) {
      return res.status(404).json({
        success: false,
        error: 'Document version not found',
      });
    }

    res.json({
      success: true,
      version: documentVersion,
    });
  } catch (error) {
    console.error('Error getting document version:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get document version',
    });
  }
};

/**
 * Get document URL
 */
export const getDocumentUrl = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { version } = req.query;

    const url = await documentService.getDocumentUrl(
      id,
      version ? parseInt(version as string) : undefined,
      req.user!.id
    );

    res.json({
      success: true,
      url,
    });
  } catch (error) {
    console.error('Error getting document URL:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get document URL',
    });
  }
};

/**
 * Get document download URL
 */
export const getDocumentDownloadUrl = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { version } = req.query;

    const url = await documentService.getDocumentDownloadUrl(
      id,
      version ? parseInt(version as string) : undefined,
      req.user!.id
    );

    res.json({
      success: true,
      url,
    });
  } catch (error) {
    console.error('Error getting document download URL:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get document download URL',
    });
  }
};

/**
 * Search documents
 */
export const searchDocuments = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required',
      });
    }

    const documents = await documentService.searchDocuments(
      req.user!.organizationId!,
      req.user!.id,
      q as string
    );

    res.json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error('Error searching documents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search documents',
    });
  }
};

/**
 * Get document statistics
 */
export const getDocumentStats = async (req: Request, res: Response) => {
  try {
    const stats = await documentService.getDocumentStats(req.user!.organizationId!);

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Error getting document stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get document stats',
    });
  }
};

/**
 * Get presigned upload URL
 */
export const getPresignedUploadUrl = async (req: Request, res: Response) => {
  try {
    const { fileName, contentType, folder } = req.body;

    if (!fileName || !contentType) {
      return res.status(400).json({
        success: false,
        error: 'fileName and contentType are required',
      });
    }

    const s3Service = require('../services/s3Service').default;
    const key = `${folder || 'documents'}/${req.user!.id}/${Date.now()}-${fileName}`;
    
    const presignedUrl = await s3Service.getPresignedUploadUrl(
      key,
      contentType,
      3600
    );

    res.json({
      success: true,
      presignedUrl: JSON.parse(presignedUrl),
      key,
    });
  } catch (error) {
    console.error('Error getting presigned upload URL:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get presigned upload URL',
    });
  }
};

export { upload };