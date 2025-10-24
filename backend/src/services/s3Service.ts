import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../middleware/errorHandler';

interface S3Config {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucket: string;
}

interface UploadResult {
  key: string;
  url: string;
  etag: string;
  size: number;
  contentType: string;
}

interface DocumentVersion {
  id: string;
  key: string;
  version: string;
  size: number;
  contentType: string;
  uploadedAt: Date;
  uploadedBy: string;
  isLatest: boolean;
}

export class S3Service {
  private s3: AWS.S3;
  private bucket: string;

  constructor(config: S3Config) {
    AWS.config.update({
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      region: config.region
    });

    this.s3 = new AWS.S3();
    this.bucket = config.bucket;
  }

  // Upload file to S3
  async uploadFile(
    file: Buffer,
    fileName: string,
    contentType: string,
    organizationId: string,
    folder: string = 'documents'
  ): Promise<UploadResult> {
    try {
      const key = `${organizationId}/${folder}/${uuidv4()}-${fileName}`;
      
      const params = {
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: contentType,
        ACL: 'private',
        Metadata: {
          organizationId,
          originalName: fileName,
          uploadedAt: new Date().toISOString()
        }
      };

      const result = await this.s3.upload(params).promise();

      return {
        key: result.Key,
        url: result.Location,
        etag: result.ETag,
        size: file.length,
        contentType
      };
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new AppError('Failed to upload file to S3', 500);
    }
  }

  // Upload file with versioning
  async uploadFileWithVersioning(
    file: Buffer,
    fileName: string,
    contentType: string,
    organizationId: string,
    documentId: string,
    uploadedBy: string,
    folder: string = 'documents'
  ): Promise<DocumentVersion> {
    try {
      const version = Date.now().toString();
      const key = `${organizationId}/${folder}/${documentId}/v${version}-${fileName}`;
      
      const params = {
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: contentType,
        ACL: 'private',
        Metadata: {
          organizationId,
          documentId,
          version,
          originalName: fileName,
          uploadedBy,
          uploadedAt: new Date().toISOString()
        }
      };

      const result = await this.s3.upload(params).promise();

      return {
        id: uuidv4(),
        key: result.Key,
        version,
        size: file.length,
        contentType,
        uploadedAt: new Date(),
        uploadedBy,
        isLatest: true
      };
    } catch (error) {
      console.error('S3 versioned upload error:', error);
      throw new AppError('Failed to upload file version to S3', 500);
    }
  }

  // Get file from S3
  async getFile(key: string): Promise<Buffer> {
    try {
      const params = {
        Bucket: this.bucket,
        Key: key
      };

      const result = await this.s3.getObject(params).promise();
      return result.Body as Buffer;
    } catch (error) {
      console.error('S3 get file error:', error);
      throw new AppError('Failed to retrieve file from S3', 500);
    }
  }

  // Get file metadata
  async getFileMetadata(key: string): Promise<any> {
    try {
      const params = {
        Bucket: this.bucket,
        Key: key
      };

      const result = await this.s3.headObject(params).promise();
      return {
        size: result.ContentLength,
        contentType: result.ContentType,
        lastModified: result.LastModified,
        etag: result.ETag,
        metadata: result.Metadata
      };
    } catch (error) {
      console.error('S3 get metadata error:', error);
      throw new AppError('Failed to retrieve file metadata from S3', 500);
    }
  }

  // Generate presigned URL for file access
  async generatePresignedUrl(
    key: string,
    expiresIn: number = 3600,
    operation: 'getObject' | 'putObject' = 'getObject'
  ): Promise<string> {
    try {
      const params = {
        Bucket: this.bucket,
        Key: key,
        Expires: expiresIn
      };

      const url = await this.s3.getSignedUrlPromise(operation, params);
      return url;
    } catch (error) {
      console.error('S3 presigned URL error:', error);
      throw new AppError('Failed to generate presigned URL', 500);
    }
  }

  // Delete file from S3
  async deleteFile(key: string): Promise<void> {
    try {
      const params = {
        Bucket: this.bucket,
        Key: key
      };

      await this.s3.deleteObject(params).promise();
    } catch (error) {
      console.error('S3 delete file error:', error);
      throw new AppError('Failed to delete file from S3', 500);
    }
  }

  // Delete multiple files
  async deleteFiles(keys: string[]): Promise<void> {
    try {
      const params = {
        Bucket: this.bucket,
        Delete: {
          Objects: keys.map(key => ({ Key: key }))
        }
      };

      await this.s3.deleteObjects(params).promise();
    } catch (error) {
      console.error('S3 delete files error:', error);
      throw new AppError('Failed to delete files from S3', 500);
    }
  }

  // List files in folder
  async listFiles(
    organizationId: string,
    folder: string = 'documents',
    prefix?: string
  ): Promise<any[]> {
    try {
      const params = {
        Bucket: this.bucket,
        Prefix: `${organizationId}/${folder}/${prefix || ''}`,
        MaxKeys: 1000
      };

      const result = await this.s3.listObjectsV2(params).promise();
      return result.Contents || [];
    } catch (error) {
      console.error('S3 list files error:', error);
      throw new AppError('Failed to list files from S3', 500);
    }
  }

  // Copy file
  async copyFile(
    sourceKey: string,
    destinationKey: string,
    metadata?: Record<string, string>
  ): Promise<void> {
    try {
      const params = {
        Bucket: this.bucket,
        CopySource: `${this.bucket}/${sourceKey}`,
        Key: destinationKey,
        Metadata: metadata,
        MetadataDirective: metadata ? 'REPLACE' : 'COPY'
      };

      await this.s3.copyObject(params).promise();
    } catch (error) {
      console.error('S3 copy file error:', error);
      throw new AppError('Failed to copy file in S3', 500);
    }
  }

  // Get file versions
  async getFileVersions(key: string): Promise<any[]> {
    try {
      const params = {
        Bucket: this.bucket,
        Prefix: key,
        MaxKeys: 1000
      };

      const result = await this.s3.listObjectVersions(params).promise();
      return result.Versions || [];
    } catch (error) {
      console.error('S3 get file versions error:', error);
      throw new AppError('Failed to get file versions from S3', 500);
    }
  }

  // Restore file version
  async restoreFileVersion(key: string, versionId: string): Promise<void> {
    try {
      const params = {
        Bucket: this.bucket,
        Key: key,
        VersionId: versionId
      };

      await this.s3.copyObject({
        Bucket: this.bucket,
        CopySource: `${this.bucket}/${key}?versionId=${versionId}`,
        Key: key
      }).promise();
    } catch (error) {
      console.error('S3 restore file version error:', error);
      throw new AppError('Failed to restore file version in S3', 500);
    }
  }

  // Generate thumbnail for image
  async generateThumbnail(
    key: string,
    width: number = 200,
    height: number = 200
  ): Promise<string> {
    try {
      // This would typically use AWS Lambda or ImageMagick
      // For now, return the original key
      return key;
    } catch (error) {
      console.error('S3 generate thumbnail error:', error);
      throw new AppError('Failed to generate thumbnail', 500);
    }
  }

  // Get storage usage for organization
  async getStorageUsage(organizationId: string): Promise<{
    totalSize: number;
    fileCount: number;
    breakdown: Array<{ folder: string; size: number; count: number }>;
  }> {
    try {
      const files = await this.listFiles(organizationId);
      
      let totalSize = 0;
      let fileCount = 0;
      const breakdown: Record<string, { size: number; count: number }> = {};

      files.forEach(file => {
        totalSize += file.Size || 0;
        fileCount += 1;
        
        const folder = file.Key?.split('/')[2] || 'unknown';
        if (!breakdown[folder]) {
          breakdown[folder] = { size: 0, count: 0 };
        }
        breakdown[folder].size += file.Size || 0;
        breakdown[folder].count += 1;
      });

      return {
        totalSize,
        fileCount,
        breakdown: Object.entries(breakdown).map(([folder, data]) => ({
          folder,
          size: data.size,
          count: data.count
        }))
      };
    } catch (error) {
      console.error('S3 storage usage error:', error);
      throw new AppError('Failed to get storage usage', 500);
    }
  }

  // Clean up old versions
  async cleanupOldVersions(
    organizationId: string,
    daysToKeep: number = 30
  ): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const files = await this.listFiles(organizationId);
      const filesToDelete: string[] = [];

      for (const file of files) {
        if (file.LastModified && file.LastModified < cutoffDate) {
          filesToDelete.push(file.Key!);
        }
      }

      if (filesToDelete.length > 0) {
        await this.deleteFiles(filesToDelete);
      }

      return filesToDelete.length;
    } catch (error) {
      console.error('S3 cleanup error:', error);
      throw new AppError('Failed to cleanup old versions', 500);
    }
  }
}