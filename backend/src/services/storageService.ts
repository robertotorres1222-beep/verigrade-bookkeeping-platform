import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

interface UploadFileOptions {
  file: Buffer;
  fileName: string;
  mimeType: string;
  folder: string;
}

interface UploadResult {
  url: string;
  key: string;
  bucket: string;
}

class StorageService {
  private s3: AWS.S3;
  private bucketName: string;

  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1'
    });
    this.bucketName = process.env.AWS_S3_BUCKET || 'verigrade-documents';
  }

  /**
   * Upload file to S3
   */
  async uploadFile(options: UploadFileOptions): Promise<UploadResult> {
    const { file, fileName, mimeType, folder } = options;
    
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const key = `${folder}/${uniqueFileName}`;

    const uploadParams = {
      Bucket: this.bucketName,
      Key: key,
      Body: file,
      ContentType: mimeType,
      ACL: 'private' // Private by default
    };

    try {
      const result = await this.s3.upload(uploadParams).promise();
      
      return {
        url: result.Location,
        key: result.Key,
        bucket: this.bucketName
      };
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new Error('Failed to upload file');
    }
  }

  /**
   * Delete file from S3
   */
  async deleteFile(url: string): Promise<void> {
    try {
      // Extract key from URL
      const key = this.extractKeyFromUrl(url);
      
      const deleteParams = {
        Bucket: this.bucketName,
        Key: key
      };

      await this.s3.deleteObject(deleteParams).promise();
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      throw new Error('Failed to delete file');
    }
  }

  /**
   * Get file stream from S3
   */
  async getFileStream(url: string): Promise<NodeJS.ReadableStream> {
    try {
      const key = this.extractKeyFromUrl(url);
      
      const getParams = {
        Bucket: this.bucketName,
        Key: key
      };

      const result = await this.s3.getObject(getParams).promise();
      return result.Body as NodeJS.ReadableStream;
    } catch (error) {
      console.error('Error getting file stream from S3:', error);
      throw new Error('Failed to get file');
    }
  }

  /**
   * Generate signed URL for file access
   */
  async getSignedUrl(url: string, expiresIn: number = 3600): Promise<string> {
    try {
      const key = this.extractKeyFromUrl(url);
      
      const params = {
        Bucket: this.bucketName,
        Key: key,
        Expires: expiresIn
      };

      return await this.s3.getSignedUrlPromise('getObject', params);
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new Error('Failed to generate signed URL');
    }
  }

  /**
   * Copy file within S3
   */
  async copyFile(sourceUrl: string, destinationKey: string): Promise<string> {
    try {
      const sourceKey = this.extractKeyFromUrl(sourceUrl);
      
      const copyParams = {
        Bucket: this.bucketName,
        CopySource: `${this.bucketName}/${sourceKey}`,
        Key: destinationKey
      };

      await this.s3.copyObject(copyParams).promise();
      
      return `https://${this.bucketName}.s3.amazonaws.com/${destinationKey}`;
    } catch (error) {
      console.error('Error copying file in S3:', error);
      throw new Error('Failed to copy file');
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(url: string): Promise<any> {
    try {
      const key = this.extractKeyFromUrl(url);
      
      const params = {
        Bucket: this.bucketName,
        Key: key
      };

      const result = await this.s3.headObject(params).promise();
      
      return {
        size: result.ContentLength,
        mimeType: result.ContentType,
        lastModified: result.LastModified,
        etag: result.ETag
      };
    } catch (error) {
      console.error('Error getting file metadata:', error);
      throw new Error('Failed to get file metadata');
    }
  }

  /**
   * List files in folder
   */
  async listFiles(folder: string, maxKeys: number = 1000): Promise<any[]> {
    try {
      const params = {
        Bucket: this.bucketName,
        Prefix: folder,
        MaxKeys: maxKeys
      };

      const result = await this.s3.listObjectsV2(params).promise();
      
      return result.Contents?.map(item => ({
        key: item.Key,
        size: item.Size,
        lastModified: item.LastModified,
        etag: item.ETag
      })) || [];
    } catch (error) {
      console.error('Error listing files:', error);
      throw new Error('Failed to list files');
    }
  }

  /**
   * Create folder structure
   */
  async createFolder(folderPath: string): Promise<void> {
    try {
      const key = `${folderPath}/.keep`;
      
      const params = {
        Bucket: this.bucketName,
        Key: key,
        Body: '',
        ContentType: 'text/plain'
      };

      await this.s3.putObject(params).promise();
    } catch (error) {
      console.error('Error creating folder:', error);
      throw new Error('Failed to create folder');
    }
  }

  /**
   * Delete folder and all contents
   */
  async deleteFolder(folderPath: string): Promise<void> {
    try {
      const params = {
        Bucket: this.bucketName,
        Prefix: folderPath
      };

      const result = await this.s3.listObjectsV2(params).promise();
      
      if (result.Contents && result.Contents.length > 0) {
        const deleteParams = {
          Bucket: this.bucketName,
          Delete: {
            Objects: result.Contents.map(item => ({ Key: item.Key! }))
          }
        };

        await this.s3.deleteObjects(deleteParams).promise();
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
      throw new Error('Failed to delete folder');
    }
  }

  /**
   * Extract key from S3 URL
   */
  private extractKeyFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.substring(1); // Remove leading slash
    } catch (error) {
      // If it's not a full URL, assume it's already a key
      return url;
    }
  }

  /**
   * Generate unique file name
   */
  generateUniqueFileName(originalName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop();
    return `${timestamp}_${randomString}.${extension}`;
  }

  /**
   * Validate file type
   */
  validateFileType(fileName: string, allowedTypes: string[]): boolean {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return allowedTypes.includes(extension || '');
  }

  /**
   * Get file size in human readable format
   */
  formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Check if file exists
   */
  async fileExists(url: string): Promise<boolean> {
    try {
      const key = this.extractKeyFromUrl(url);
      
      const params = {
        Bucket: this.bucketName,
        Key: key
      };

      await this.s3.headObject(params).promise();
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default new StorageService();
