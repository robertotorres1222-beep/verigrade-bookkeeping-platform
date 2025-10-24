import AWS from 'aws-sdk';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import logger from '../utils/logger';
import secretsManager from '../config/secrets';

const execAsync = promisify(exec);

export interface BackupConfig {
  databaseUrl: string;
  s3Bucket: string;
  s3Region: string;
  encryptionKey: string;
  retentionDays: number;
  schedule: string;
}

export interface BackupResult {
  id: string;
  type: 'database' | 'files' | 'config' | 'secrets';
  status: 'success' | 'failed' | 'in_progress';
  size: number;
  checksum: string;
  createdAt: Date;
  expiresAt: Date;
  s3Key: string;
  error?: string;
}

export interface BackupMetadata {
  id: string;
  type: string;
  timestamp: Date;
  size: number;
  checksum: string;
  version: string;
  environment: string;
  tags: Record<string, string>;
}

class BackupService {
  private s3: AWS.S3;
  private config: BackupConfig;
  private isInitialized = false;

  constructor() {
    this.s3 = new AWS.S3({
      region: process.env.AWS_REGION || 'us-east-1',
    });
    this.config = {
      databaseUrl: '',
      s3Bucket: process.env.AWS_S3_BUCKET || 'verigrade-backups',
      s3Region: process.env.AWS_REGION || 'us-east-1',
      encryptionKey: '',
      retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '30'),
      schedule: process.env.BACKUP_SCHEDULE || '0 2 * * *', // Daily at 2 AM
    };
  }

  /**
   * Initialize backup service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      const secrets = secretsManager.getSecrets();
      this.config.databaseUrl = secrets.databaseUrl;
      this.config.encryptionKey = secrets.backupEncryptionKey;

      // Ensure S3 bucket exists
      await this.ensureS3BucketExists();

      this.isInitialized = true;
      logger.info('[BackupService] Backup service initialized successfully');
    } catch (error) {
      logger.error('[BackupService] Failed to initialize backup service:', error);
      throw error;
    }
  }

  /**
   * Ensure S3 bucket exists
   */
  private async ensureS3BucketExists(): Promise<void> {
    try {
      await this.s3.headBucket({ Bucket: this.config.s3Bucket }).promise();
    } catch (error) {
      if ((error as any).statusCode === 404) {
        // Bucket doesn't exist, create it
        await this.s3.createBucket({
          Bucket: this.config.s3Bucket,
          CreateBucketConfiguration: {
            LocationConstraint: this.config.s3Region,
          },
        }).promise();

        // Enable versioning
        await this.s3.putBucketVersioning({
          Bucket: this.config.s3Bucket,
          VersioningConfiguration: {
            Status: 'Enabled',
          },
        }).promise();

        // Set lifecycle policy
        await this.s3.putBucketLifecycleConfiguration({
          Bucket: this.config.s3Bucket,
          LifecycleConfiguration: {
            Rules: [
              {
                ID: 'backup-lifecycle',
                Status: 'Enabled',
                Transitions: [
                  {
                    Days: 30,
                    StorageClass: 'STANDARD_IA',
                  },
                  {
                    Days: 90,
                    StorageClass: 'GLACIER',
                  },
                  {
                    Days: 365,
                    StorageClass: 'DEEP_ARCHIVE',
                  },
                ],
                Expiration: {
                  Days: this.config.retentionDays * 2, // Keep for 2x retention period
                },
              },
            ],
          },
        }).promise();

        logger.info(`[BackupService] Created S3 bucket: ${this.config.s3Bucket}`);
      } else {
        throw error;
      }
    }
  }

  /**
   * Create database backup
   */
  async createDatabaseBackup(): Promise<BackupResult> {
    const backupId = `db-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const fileName = `database-backup-${backupId}.sql`;
    const tempPath = `/tmp/${fileName}`;
    const compressedPath = `${tempPath}.gz`;
    const encryptedPath = `${compressedPath}.enc`;

    try {
      logger.info(`[BackupService] Starting database backup: ${backupId}`);

      // Create database dump
      const dumpCommand = `pg_dump "${this.config.databaseUrl}" --verbose --clean --no-owner --no-privileges --format=custom`;
      await execAsync(dumpCommand, { stdio: 'pipe' });

      // Compress the backup
      await execAsync(`gzip -c ${tempPath} > ${compressedPath}`);

      // Encrypt the backup
      await this.encryptFile(compressedPath, encryptedPath);

      // Get file stats
      const stats = await fs.stat(encryptedPath);
      const checksum = await this.calculateChecksum(encryptedPath);

      // Upload to S3
      const s3Key = `database/${timestamp}/${fileName}.gz.enc`;
      await this.uploadToS3(encryptedPath, s3Key);

      // Clean up temporary files
      await fs.unlink(tempPath).catch(() => {});
      await fs.unlink(compressedPath).catch(() => {});
      await fs.unlink(encryptedPath).catch(() => {});

      const result: BackupResult = {
        id: backupId,
        type: 'database',
        status: 'success',
        size: stats.size,
        checksum,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + this.config.retentionDays * 24 * 60 * 60 * 1000),
        s3Key,
      };

      logger.info(`[BackupService] Database backup completed: ${backupId}`);
      return result;
    } catch (error) {
      logger.error(`[BackupService] Database backup failed: ${backupId}`, error);
      
      // Clean up on error
      await fs.unlink(tempPath).catch(() => {});
      await fs.unlink(compressedPath).catch(() => {});
      await fs.unlink(encryptedPath).catch(() => {});

      return {
        id: backupId,
        type: 'database',
        status: 'failed',
        size: 0,
        checksum: '',
        createdAt: new Date(),
        expiresAt: new Date(),
        s3Key: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create files backup
   */
  async createFilesBackup(): Promise<BackupResult> {
    const backupId = `files-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const fileName = `files-backup-${backupId}.tar.gz`;
    const tempPath = `/tmp/${fileName}`;
    const encryptedPath = `${tempPath}.enc`;

    try {
      logger.info(`[BackupService] Starting files backup: ${backupId}`);

      // Create tar archive of uploads directory
      await execAsync(`tar -czf ${tempPath} -C /app uploads`);

      // Encrypt the backup
      await this.encryptFile(tempPath, encryptedPath);

      // Get file stats
      const stats = await fs.stat(encryptedPath);
      const checksum = await this.calculateChecksum(encryptedPath);

      // Upload to S3
      const s3Key = `files/${timestamp}/${fileName}.enc`;
      await this.uploadToS3(encryptedPath, s3Key);

      // Clean up temporary files
      await fs.unlink(tempPath).catch(() => {});
      await fs.unlink(encryptedPath).catch(() => {});

      const result: BackupResult = {
        id: backupId,
        type: 'files',
        status: 'success',
        size: stats.size,
        checksum,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + this.config.retentionDays * 24 * 60 * 60 * 1000),
        s3Key,
      };

      logger.info(`[BackupService] Files backup completed: ${backupId}`);
      return result;
    } catch (error) {
      logger.error(`[BackupService] Files backup failed: ${backupId}`, error);
      
      // Clean up on error
      await fs.unlink(tempPath).catch(() => {});
      await fs.unlink(encryptedPath).catch(() => {});

      return {
        id: backupId,
        type: 'files',
        status: 'failed',
        size: 0,
        checksum: '',
        createdAt: new Date(),
        expiresAt: new Date(),
        s3Key: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create configuration backup
   */
  async createConfigBackup(): Promise<BackupResult> {
    const backupId = `config-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const fileName = `config-backup-${backupId}.json`;
    const tempPath = `/tmp/${fileName}`;
    const encryptedPath = `${tempPath}.enc`;

    try {
      logger.info(`[BackupService] Starting config backup: ${backupId}`);

      // Collect configuration data
      const configData = {
        environment: process.env.NODE_ENV,
        version: process.env.npm_package_version || '1.0.0',
        timestamp: new Date().toISOString(),
        database: {
          host: process.env.DATABASE_HOST,
          port: process.env.DATABASE_PORT,
          name: process.env.DATABASE_NAME,
        },
        redis: {
          host: process.env.REDIS_HOST,
          port: process.env.REDIS_PORT,
        },
        aws: {
          region: process.env.AWS_REGION,
          s3Bucket: process.env.AWS_S3_BUCKET,
        },
        features: {
          aiCategorization: process.env.FEATURES_AI_CATEGORIZATION,
          bankIntegration: process.env.FEATURES_BANK_INTEGRATION,
          mobileApp: process.env.FEATURES_MOBILE_APP,
          apiAccess: process.env.FEATURES_API_ACCESS,
          whiteLabel: process.env.FEATURES_WHITE_LABEL,
        },
      };

      // Write config to file
      await fs.writeFile(tempPath, JSON.stringify(configData, null, 2));

      // Encrypt the backup
      await this.encryptFile(tempPath, encryptedPath);

      // Get file stats
      const stats = await fs.stat(encryptedPath);
      const checksum = await this.calculateChecksum(encryptedPath);

      // Upload to S3
      const s3Key = `config/${timestamp}/${fileName}.enc`;
      await this.uploadToS3(encryptedPath, s3Key);

      // Clean up temporary files
      await fs.unlink(tempPath).catch(() => {});
      await fs.unlink(encryptedPath).catch(() => {});

      const result: BackupResult = {
        id: backupId,
        type: 'config',
        status: 'success',
        size: stats.size,
        checksum,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + this.config.retentionDays * 24 * 60 * 60 * 1000),
        s3Key,
      };

      logger.info(`[BackupService] Config backup completed: ${backupId}`);
      return result;
    } catch (error) {
      logger.error(`[BackupService] Config backup failed: ${backupId}`, error);
      
      // Clean up on error
      await fs.unlink(tempPath).catch(() => {});
      await fs.unlink(encryptedPath).catch(() => {});

      return {
        id: backupId,
        type: 'config',
        status: 'failed',
        size: 0,
        checksum: '',
        createdAt: new Date(),
        expiresAt: new Date(),
        s3Key: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create full backup (all types)
   */
  async createFullBackup(): Promise<BackupResult[]> {
    logger.info('[BackupService] Starting full backup');
    
    const results: BackupResult[] = [];
    
    // Create all backup types in parallel
    const [dbResult, filesResult, configResult] = await Promise.allSettled([
      this.createDatabaseBackup(),
      this.createFilesBackup(),
      this.createConfigBackup(),
    ]);

    if (dbResult.status === 'fulfilled') {
      results.push(dbResult.value);
    }
    if (filesResult.status === 'fulfilled') {
      results.push(filesResult.value);
    }
    if (configResult.status === 'fulfilled') {
      results.push(configResult.value);
    }

    logger.info(`[BackupService] Full backup completed: ${results.length} backups created`);
    return results;
  }

  /**
   * Restore from backup
   */
  async restoreFromBackup(s3Key: string, targetPath: string): Promise<void> {
    try {
      logger.info(`[BackupService] Starting restore from: ${s3Key}`);

      // Download from S3
      const tempPath = `/tmp/restore-${Date.now()}`;
      await this.downloadFromS3(s3Key, tempPath);

      // Decrypt the backup
      const decryptedPath = `${tempPath}.dec`;
      await this.decryptFile(tempPath, decryptedPath);

      // Extract/restore based on file type
      if (s3Key.includes('database')) {
        await this.restoreDatabase(decryptedPath);
      } else if (s3Key.includes('files')) {
        await this.restoreFiles(decryptedPath, targetPath);
      } else if (s3Key.includes('config')) {
        await this.restoreConfig(decryptedPath);
      }

      // Clean up
      await fs.unlink(tempPath).catch(() => {});
      await fs.unlink(decryptedPath).catch(() => {});

      logger.info(`[BackupService] Restore completed: ${s3Key}`);
    } catch (error) {
      logger.error(`[BackupService] Restore failed: ${s3Key}`, error);
      throw error;
    }
  }

  /**
   * List all backups
   */
  async listBackups(type?: string): Promise<BackupResult[]> {
    try {
      const prefix = type ? `${type}/` : '';
      const result = await this.s3.listObjectsV2({
        Bucket: this.config.s3Bucket,
        Prefix: prefix,
      }).promise();

      const backups: BackupResult[] = [];

      for (const object of result.Contents || []) {
        if (object.Key && object.LastModified) {
          const metadata = await this.getBackupMetadata(object.Key);
          if (metadata) {
            backups.push({
              id: metadata.id,
              type: metadata.type as any,
              status: 'success',
              size: object.Size || 0,
              checksum: metadata.checksum,
              createdAt: object.LastModified,
              expiresAt: new Date(object.LastModified.getTime() + this.config.retentionDays * 24 * 60 * 60 * 1000),
              s3Key: object.Key,
            });
          }
        }
      }

      return backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      logger.error('[BackupService] Failed to list backups:', error);
      throw error;
    }
  }

  /**
   * Delete old backups
   */
  async cleanupOldBackups(): Promise<number> {
    try {
      const backups = await this.listBackups();
      const cutoffDate = new Date(Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000);
      let deletedCount = 0;

      for (const backup of backups) {
        if (backup.createdAt < cutoffDate) {
          await this.s3.deleteObject({
            Bucket: this.config.s3Bucket,
            Key: backup.s3Key,
          }).promise();
          deletedCount++;
        }
      }

      logger.info(`[BackupService] Cleaned up ${deletedCount} old backups`);
      return deletedCount;
    } catch (error) {
      logger.error('[BackupService] Failed to cleanup old backups:', error);
      throw error;
    }
  }

  // Private helper methods
  private async encryptFile(inputPath: string, outputPath: string): Promise<void> {
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(this.config.encryptionKey, 'salt', 32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(algorithm, key);
    cipher.setAAD(Buffer.from('verigrade-backup'));
    
    const input = await fs.readFile(inputPath);
    const encrypted = Buffer.concat([cipher.update(input), cipher.final()]);
    const authTag = cipher.getAuthTag();
    
    const result = Buffer.concat([iv, authTag, encrypted]);
    await fs.writeFile(outputPath, result);
  }

  private async decryptFile(inputPath: string, outputPath: string): Promise<void> {
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(this.config.encryptionKey, 'salt', 32);
    
    const input = await fs.readFile(inputPath);
    const iv = input.subarray(0, 16);
    const authTag = input.subarray(16, 32);
    const encrypted = input.subarray(32);
    
    const decipher = crypto.createDecipher(algorithm, key);
    decipher.setAAD(Buffer.from('verigrade-backup'));
    decipher.setAuthTag(authTag);
    
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    await fs.writeFile(outputPath, decrypted);
  }

  private async calculateChecksum(filePath: string): Promise<string> {
    const data = await fs.readFile(filePath);
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private async uploadToS3(filePath: string, s3Key: string): Promise<void> {
    const fileContent = await fs.readFile(filePath);
    
    await this.s3.upload({
      Bucket: this.config.s3Bucket,
      Key: s3Key,
      Body: fileContent,
      ServerSideEncryption: 'AES256',
      Metadata: {
        'backup-type': s3Key.split('/')[0],
        'backup-timestamp': new Date().toISOString(),
        'backup-version': process.env.npm_package_version || '1.0.0',
      },
    }).promise();
  }

  private async downloadFromS3(s3Key: string, localPath: string): Promise<void> {
    const result = await this.s3.getObject({
      Bucket: this.config.s3Bucket,
      Key: s3Key,
    }).promise();

    if (result.Body) {
      await fs.writeFile(localPath, result.Body as Buffer);
    }
  }

  private async getBackupMetadata(s3Key: string): Promise<BackupMetadata | null> {
    try {
      const result = await this.s3.headObject({
        Bucket: this.config.s3Bucket,
        Key: s3Key,
      }).promise();

      return {
        id: result.Metadata?.['backup-id'] || '',
        type: result.Metadata?.['backup-type'] || '',
        timestamp: result.LastModified || new Date(),
        size: result.ContentLength || 0,
        checksum: result.Metadata?.['backup-checksum'] || '',
        version: result.Metadata?.['backup-version'] || '1.0.0',
        environment: result.Metadata?.['backup-environment'] || 'production',
        tags: result.Metadata || {},
      };
    } catch (error) {
      return null;
    }
  }

  private async restoreDatabase(filePath: string): Promise<void> {
    await execAsync(`psql "${this.config.databaseUrl}" < ${filePath}`);
  }

  private async restoreFiles(filePath: string, targetPath: string): Promise<void> {
    await execAsync(`tar -xzf ${filePath} -C ${targetPath}`);
  }

  private async restoreConfig(filePath: string): Promise<void> {
    const configData = JSON.parse(await fs.readFile(filePath, 'utf8'));
    // Restore configuration logic here
    logger.info('[BackupService] Config restored:', configData);
  }
}

export default new BackupService();





