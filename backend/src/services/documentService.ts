import { prisma } from '../config/database';
import { S3Service } from './s3Service';
import { AppError } from '../middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';

interface DocumentUpload {
  file: Buffer;
  fileName: string;
  contentType: string;
  organizationId: string;
  uploadedBy: string;
  folder?: string;
  tags?: string[];
  description?: string;
}

interface DocumentVersion {
  id: string;
  documentId: string;
  version: string;
  key: string;
  size: number;
  contentType: string;
  uploadedAt: Date;
  uploadedBy: string;
  isLatest: boolean;
  changeLog?: string;
}

interface DocumentAnnotation {
  id: string;
  documentId: string;
  userId: string;
  type: 'highlight' | 'note' | 'comment' | 'stamp';
  content: string;
  position: {
    page: number;
    x: number;
    y: number;
    width?: number;
    height?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class DocumentService {
  private s3Service: S3Service;

  constructor(s3Service: S3Service) {
    this.s3Service = s3Service;
  }

  // Upload document with versioning
  async uploadDocument(upload: DocumentUpload): Promise<{
    document: any;
    version: DocumentVersion;
  }> {
    try {
      // Create or find document
      let document = await prisma.document.findFirst({
        where: {
          organizationId: upload.organizationId,
          name: upload.fileName
        }
      });

      if (!document) {
        document = await prisma.document.create({
          data: {
            id: uuidv4(),
            organizationId: upload.organizationId,
            name: upload.fileName,
            description: upload.description,
            folder: upload.folder || 'documents',
            tags: upload.tags || [],
            createdBy: upload.uploadedBy,
            updatedBy: upload.uploadedBy
          }
        });
      }

      // Upload to S3 with versioning
      const s3Result = await this.s3Service.uploadFileWithVersioning(
        upload.file,
        upload.fileName,
        upload.contentType,
        upload.organizationId,
        document.id,
        upload.uploadedBy,
        upload.folder
      );

      // Create version record
      const version = await prisma.documentVersion.create({
        data: {
          id: s3Result.id,
          documentId: document.id,
          version: s3Result.version,
          key: s3Result.key,
          size: s3Result.size,
          contentType: s3Result.contentType,
          uploadedAt: s3Result.uploadedAt,
          uploadedBy: s3Result.uploadedBy,
          isLatest: s3Result.isLatest
        }
      });

      // Update document with latest version info
      await prisma.document.update({
        where: { id: document.id },
        data: {
          latestVersion: version.version,
          size: s3Result.size,
          updatedAt: new Date(),
          updatedBy: upload.uploadedBy
        }
      });

      // Mark previous versions as not latest
      await prisma.documentVersion.updateMany({
        where: {
          documentId: document.id,
          id: { not: version.id }
        },
        data: { isLatest: false }
      });

      return { document, version };
    } catch (error) {
      console.error('Document upload error:', error);
      throw new AppError('Failed to upload document', 500);
    }
  }

  // Get document with latest version
  async getDocument(documentId: string, organizationId: string): Promise<any> {
    try {
      const document = await prisma.document.findFirst({
        where: {
          id: documentId,
          organizationId
        },
        include: {
          versions: {
            where: { isLatest: true },
            take: 1
          },
          annotations: {
            include: {
              user: {
                select: { id: true, firstName: true, lastName: true, email: true }
              }
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!document) {
        throw new AppError('Document not found', 404);
      }

      return document;
    } catch (error) {
      console.error('Get document error:', error);
      throw new AppError('Failed to get document', 500);
    }
  }

  // Get document version
  async getDocumentVersion(
    documentId: string,
    version: string,
    organizationId: string
  ): Promise<any> {
    try {
      const documentVersion = await prisma.documentVersion.findFirst({
        where: {
          documentId,
          version,
          document: { organizationId }
        },
        include: {
          document: true
        }
      });

      if (!documentVersion) {
        throw new AppError('Document version not found', 404);
      }

      return documentVersion;
    } catch (error) {
      console.error('Get document version error:', error);
      throw new AppError('Failed to get document version', 500);
    }
  }

  // List document versions
  async getDocumentVersions(documentId: string, organizationId: string): Promise<DocumentVersion[]> {
    try {
      const versions = await prisma.documentVersion.findMany({
        where: {
          documentId,
          document: { organizationId }
        },
        orderBy: { uploadedAt: 'desc' }
      });

      return versions;
    } catch (error) {
      console.error('Get document versions error:', error);
      throw new AppError('Failed to get document versions', 500);
    }
  }

  // Get document content
  async getDocumentContent(
    documentId: string,
    version?: string,
    organizationId?: string
  ): Promise<Buffer> {
    try {
      let documentVersion;

      if (version) {
        documentVersion = await prisma.documentVersion.findFirst({
          where: {
            documentId,
            version
          }
        });
      } else {
        documentVersion = await prisma.documentVersion.findFirst({
          where: {
            documentId,
            isLatest: true
          }
        });
      }

      if (!documentVersion) {
        throw new AppError('Document version not found', 404);
      }

      return await this.s3Service.getFile(documentVersion.key);
    } catch (error) {
      console.error('Get document content error:', error);
      throw new AppError('Failed to get document content', 500);
    }
  }

  // Generate document access URL
  async generateDocumentUrl(
    documentId: string,
    version?: string,
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      let documentVersion;

      if (version) {
        documentVersion = await prisma.documentVersion.findFirst({
          where: {
            documentId,
            version
          }
        });
      } else {
        documentVersion = await prisma.documentVersion.findFirst({
          where: {
            documentId,
            isLatest: true
          }
        });
      }

      if (!documentVersion) {
        throw new AppError('Document version not found', 404);
      }

      return await this.s3Service.generatePresignedUrl(
        documentVersion.key,
        expiresIn
      );
    } catch (error) {
      console.error('Generate document URL error:', error);
      throw new AppError('Failed to generate document URL', 500);
    }
  }

  // Add document annotation
  async addAnnotation(
    documentId: string,
    userId: string,
    annotation: Omit<DocumentAnnotation, 'id' | 'documentId' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<DocumentAnnotation> {
    try {
      const newAnnotation = await prisma.documentAnnotation.create({
        data: {
          id: uuidv4(),
          documentId,
          userId,
          type: annotation.type,
          content: annotation.content,
          position: annotation.position,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      return newAnnotation;
    } catch (error) {
      console.error('Add annotation error:', error);
      throw new AppError('Failed to add annotation', 500);
    }
  }

  // Update document annotation
  async updateAnnotation(
    annotationId: string,
    userId: string,
    updates: Partial<Pick<DocumentAnnotation, 'content' | 'position'>>
  ): Promise<DocumentAnnotation> {
    try {
      const annotation = await prisma.documentAnnotation.findFirst({
        where: {
          id: annotationId,
          userId
        }
      });

      if (!annotation) {
        throw new AppError('Annotation not found', 404);
      }

      const updatedAnnotation = await prisma.documentAnnotation.update({
        where: { id: annotationId },
        data: {
          ...updates,
          updatedAt: new Date()
        }
      });

      return updatedAnnotation;
    } catch (error) {
      console.error('Update annotation error:', error);
      throw new AppError('Failed to update annotation', 500);
    }
  }

  // Delete document annotation
  async deleteAnnotation(annotationId: string, userId: string): Promise<void> {
    try {
      const annotation = await prisma.documentAnnotation.findFirst({
        where: {
          id: annotationId,
          userId
        }
      });

      if (!annotation) {
        throw new AppError('Annotation not found', 404);
      }

      await prisma.documentAnnotation.delete({
        where: { id: annotationId }
      });
    } catch (error) {
      console.error('Delete annotation error:', error);
      throw new AppError('Failed to delete annotation', 500);
    }
  }

  // Get document annotations
  async getDocumentAnnotations(documentId: string): Promise<DocumentAnnotation[]> {
    try {
      const annotations = await prisma.documentAnnotation.findMany({
        where: { documentId },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true }
          }
        },
        orderBy: { createdAt: 'asc' }
      });

      return annotations;
    } catch (error) {
      console.error('Get document annotations error:', error);
      throw new AppError('Failed to get document annotations', 500);
    }
  }

  // Restore document version
  async restoreDocumentVersion(
    documentId: string,
    version: string,
    userId: string,
    organizationId: string
  ): Promise<void> {
    try {
      const document = await prisma.document.findFirst({
        where: {
          id: documentId,
          organizationId
        }
      });

      if (!document) {
        throw new AppError('Document not found', 404);
      }

      const targetVersion = await prisma.documentVersion.findFirst({
        where: {
          documentId,
          version
        }
      });

      if (!targetVersion) {
        throw new AppError('Document version not found', 404);
      }

      // Mark current latest version as not latest
      await prisma.documentVersion.updateMany({
        where: {
          documentId,
          isLatest: true
        },
        data: { isLatest: false }
      });

      // Mark target version as latest
      await prisma.documentVersion.update({
        where: { id: targetVersion.id },
        data: { isLatest: true }
      });

      // Update document with restored version info
      await prisma.document.update({
        where: { id: documentId },
        data: {
          latestVersion: version,
          size: targetVersion.size,
          updatedAt: new Date(),
          updatedBy: userId
        }
      });
    } catch (error) {
      console.error('Restore document version error:', error);
      throw new AppError('Failed to restore document version', 500);
    }
  }

  // Delete document
  async deleteDocument(documentId: string, organizationId: string): Promise<void> {
    try {
      const document = await prisma.document.findFirst({
        where: {
          id: documentId,
          organizationId
        },
        include: {
          versions: true
        }
      });

      if (!document) {
        throw new AppError('Document not found', 404);
      }

      // Delete all versions from S3
      const keys = document.versions.map(version => version.key);
      if (keys.length > 0) {
        await this.s3Service.deleteFiles(keys);
      }

      // Delete document and related records
      await prisma.documentAnnotation.deleteMany({
        where: { documentId }
      });

      await prisma.documentVersion.deleteMany({
        where: { documentId }
      });

      await prisma.document.delete({
        where: { id: documentId }
      });
    } catch (error) {
      console.error('Delete document error:', error);
      throw new AppError('Failed to delete document', 500);
    }
  }

  // Search documents
  async searchDocuments(
    organizationId: string,
    query: string,
    filters?: {
      folder?: string;
      tags?: string[];
      contentType?: string;
      dateRange?: {
        start: Date;
        end: Date;
      };
    }
  ): Promise<any[]> {
    try {
      const where: any = {
        organizationId,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { tags: { hasSome: [query] } }
        ]
      };

      if (filters?.folder) {
        where.folder = filters.folder;
      }

      if (filters?.tags && filters.tags.length > 0) {
        where.tags = { hasSome: filters.tags };
      }

      if (filters?.contentType) {
        where.versions = {
          some: {
            contentType: { contains: filters.contentType }
          }
        };
      }

      if (filters?.dateRange) {
        where.createdAt = {
          gte: filters.dateRange.start,
          lte: filters.dateRange.end
        };
      }

      const documents = await prisma.document.findMany({
        where,
        include: {
          versions: {
            where: { isLatest: true },
            take: 1
          },
          _count: {
            select: {
              versions: true,
              annotations: true
            }
          }
        },
        orderBy: { updatedAt: 'desc' }
      });

      return documents;
    } catch (error) {
      console.error('Search documents error:', error);
      throw new AppError('Failed to search documents', 500);
    }
  }

  // Get document statistics
  async getDocumentStats(organizationId: string): Promise<{
    totalDocuments: number;
    totalSize: number;
    totalVersions: number;
    totalAnnotations: number;
    byFolder: Array<{ folder: string; count: number; size: number }>;
    byType: Array<{ type: string; count: number }>;
  }> {
    try {
      const [
        totalDocuments,
        totalVersions,
        totalAnnotations,
        documents
      ] = await Promise.all([
        prisma.document.count({ where: { organizationId } }),
        prisma.documentVersion.count({
          where: { document: { organizationId } }
        }),
        prisma.documentAnnotation.count({
          where: { document: { organizationId } }
        }),
        prisma.document.findMany({
          where: { organizationId },
          include: {
            versions: {
              where: { isLatest: true },
              take: 1
            }
          }
        })
      ]);

      const totalSize = documents.reduce((sum, doc) => {
        const latestVersion = doc.versions[0];
        return sum + (latestVersion?.size || 0);
      }, 0);

      // Group by folder
      const byFolder: Record<string, { count: number; size: number }> = {};
      documents.forEach(doc => {
        const folder = doc.folder;
        if (!byFolder[folder]) {
          byFolder[folder] = { count: 0, size: 0 };
        }
        byFolder[folder].count += 1;
        const latestVersion = doc.versions[0];
        byFolder[folder].size += latestVersion?.size || 0;
      });

      // Group by content type
      const byType: Record<string, number> = {};
      documents.forEach(doc => {
        const latestVersion = doc.versions[0];
        if (latestVersion) {
          const type = latestVersion.contentType.split('/')[0];
          byType[type] = (byType[type] || 0) + 1;
        }
      });

      return {
        totalDocuments,
        totalSize,
        totalVersions,
        totalAnnotations,
        byFolder: Object.entries(byFolder).map(([folder, data]) => ({
          folder,
          count: data.count,
          size: data.size
        })),
        byType: Object.entries(byType).map(([type, count]) => ({
          type,
          count
        }))
      };
    } catch (error) {
      console.error('Get document stats error:', error);
      throw new AppError('Failed to get document statistics', 500);
    }
  }
}