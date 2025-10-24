import AWS from 'aws-sdk';
import logger from '../utils/logger';

export interface SecretConfig {
  databaseUrl: string;
  redisUrl: string;
  jwtSecret: string;
  jwtRefreshSecret: string;
  awsAccessKeyId: string;
  awsSecretAccessKey: string;
  stripeSecretKey: string;
  stripePublishableKey: string;
  plaidClientId: string;
  plaidSecret: string;
  sentryDsn: string;
  newRelicLicenseKey: string;
  encryptionKey: string;
  apiKeySecret: string;
  googleClientId: string;
  googleClientSecret: string;
  microsoftClientId: string;
  microsoftClientSecret: string;
  webhookSecret: string;
  backupEncryptionKey: string;
}

class SecretsManager {
  private secrets: SecretConfig | null = null;
  private secretsManager: AWS.SecretsManager;
  private isInitialized = false;

  constructor() {
    this.secretsManager = new AWS.SecretsManager({
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
  }

  /**
   * Initialize secrets from AWS Secrets Manager or environment variables
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Try to get secrets from AWS Secrets Manager first
      if (process.env.AWS_SECRETS_MANAGER_SECRET_NAME) {
        await this.loadFromAWSSecretsManager();
      } else {
        // Fallback to environment variables
        this.loadFromEnvironment();
      }

      this.isInitialized = true;
      logger.info('[SecretsManager] Secrets initialized successfully');
    } catch (error) {
      logger.error('[SecretsManager] Failed to initialize secrets:', error);
      throw new Error('Failed to initialize secrets');
    }
  }

  /**
   * Load secrets from AWS Secrets Manager
   */
  private async loadFromAWSSecretsManager(): Promise<void> {
    const secretName = process.env.AWS_SECRETS_MANAGER_SECRET_NAME!;
    
    try {
      const result = await this.secretsManager.getSecretValue({
        SecretId: secretName,
      }).promise();

      if (!result.SecretString) {
        throw new Error('Secret string is empty');
      }

      const secrets = JSON.parse(result.SecretString);
      this.secrets = {
        databaseUrl: secrets.DATABASE_URL,
        redisUrl: secrets.REDIS_URL,
        jwtSecret: secrets.JWT_SECRET,
        jwtRefreshSecret: secrets.JWT_REFRESH_SECRET,
        awsAccessKeyId: secrets.AWS_ACCESS_KEY_ID,
        awsSecretAccessKey: secrets.AWS_SECRET_ACCESS_KEY,
        stripeSecretKey: secrets.STRIPE_SECRET_KEY,
        stripePublishableKey: secrets.STRIPE_PUBLISHABLE_KEY,
        plaidClientId: secrets.PLAID_CLIENT_ID,
        plaidSecret: secrets.PLAID_SECRET,
        sentryDsn: secrets.SENTRY_DSN,
        newRelicLicenseKey: secrets.NEW_RELIC_LICENSE_KEY,
        encryptionKey: secrets.ENCRYPTION_KEY,
        apiKeySecret: secrets.API_KEY_SECRET,
        googleClientId: secrets.GOOGLE_CLIENT_ID,
        googleClientSecret: secrets.GOOGLE_CLIENT_SECRET,
        microsoftClientId: secrets.MICROSOFT_CLIENT_ID,
        microsoftClientSecret: secrets.MICROSOFT_CLIENT_SECRET,
        webhookSecret: secrets.WEBHOOK_SECRET,
        backupEncryptionKey: secrets.BACKUP_ENCRYPTION_KEY,
      };

      logger.info('[SecretsManager] Secrets loaded from AWS Secrets Manager');
    } catch (error) {
      logger.error('[SecretsManager] Failed to load secrets from AWS:', error);
      throw error;
    }
  }

  /**
   * Load secrets from environment variables
   */
  private loadFromEnvironment(): void {
    this.secrets = {
      databaseUrl: process.env.DATABASE_URL!,
      redisUrl: process.env.REDIS_URL!,
      jwtSecret: process.env.JWT_SECRET!,
      jwtRefreshSecret: process.env.JWT_REFRESH_SECRET!,
      awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      stripeSecretKey: process.env.STRIPE_SECRET_KEY!,
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY!,
      plaidClientId: process.env.PLAID_CLIENT_ID!,
      plaidSecret: process.env.PLAID_SECRET!,
      sentryDsn: process.env.SENTRY_DSN!,
      newRelicLicenseKey: process.env.NEW_RELIC_LICENSE_KEY!,
      encryptionKey: process.env.ENCRYPTION_KEY!,
      apiKeySecret: process.env.API_KEY_SECRET!,
      googleClientId: process.env.GOOGLE_CLIENT_ID!,
      googleClientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      microsoftClientId: process.env.MICROSOFT_CLIENT_ID!,
      microsoftClientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      webhookSecret: process.env.WEBHOOK_SECRET!,
      backupEncryptionKey: process.env.BACKUP_ENCRYPTION_KEY!,
    };

    logger.info('[SecretsManager] Secrets loaded from environment variables');
  }

  /**
   * Get all secrets
   */
  getSecrets(): SecretConfig {
    if (!this.secrets) {
      throw new Error('Secrets not initialized. Call initialize() first.');
    }
    return this.secrets;
  }

  /**
   * Get a specific secret
   */
  getSecret<K extends keyof SecretConfig>(key: K): SecretConfig[K] {
    if (!this.secrets) {
      throw new Error('Secrets not initialized. Call initialize() first.');
    }
    return this.secrets[key];
  }

  /**
   * Rotate a secret in AWS Secrets Manager
   */
  async rotateSecret(secretName: string, newValue: string): Promise<void> {
    try {
      await this.secretsManager.updateSecret({
        SecretId: secretName,
        SecretString: newValue,
      }).promise();

      logger.info(`[SecretsManager] Secret ${secretName} rotated successfully`);
    } catch (error) {
      logger.error(`[SecretsManager] Failed to rotate secret ${secretName}:`, error);
      throw error;
    }
  }

  /**
   * Create a new secret in AWS Secrets Manager
   */
  async createSecret(secretName: string, secretValue: string, description?: string): Promise<void> {
    try {
      await this.secretsManager.createSecret({
        Name: secretName,
        SecretString: secretValue,
        Description: description,
      }).promise();

      logger.info(`[SecretsManager] Secret ${secretName} created successfully`);
    } catch (error) {
      logger.error(`[SecretsManager] Failed to create secret ${secretName}:`, error);
      throw error;
    }
  }

  /**
   * Delete a secret from AWS Secrets Manager
   */
  async deleteSecret(secretName: string): Promise<void> {
    try {
      await this.secretsManager.deleteSecret({
        SecretId: secretName,
        ForceDeleteWithoutRecovery: true,
      }).promise();

      logger.info(`[SecretsManager] Secret ${secretName} deleted successfully`);
    } catch (error) {
      logger.error(`[SecretsManager] Failed to delete secret ${secretName}:`, error);
      throw error;
    }
  }

  /**
   * List all secrets
   */
  async listSecrets(): Promise<AWS.SecretsManager.SecretListEntry[]> {
    try {
      const result = await this.secretsManager.listSecrets().promise();
      return result.SecretList || [];
    } catch (error) {
      logger.error('[SecretsManager] Failed to list secrets:', error);
      throw error;
    }
  }

  /**
   * Check if secrets are valid
   */
  validateSecrets(): boolean {
    if (!this.secrets) {
      return false;
    }

    const requiredSecrets = [
      'databaseUrl',
      'redisUrl',
      'jwtSecret',
      'jwtRefreshSecret',
      'awsAccessKeyId',
      'awsSecretAccessKey',
      'stripeSecretKey',
      'plaidClientId',
      'plaidSecret',
    ];

    for (const secret of requiredSecrets) {
      if (!this.secrets[secret as keyof SecretConfig]) {
        logger.error(`[SecretsManager] Missing required secret: ${secret}`);
        return false;
      }
    }

    return true;
  }

  /**
   * Refresh secrets from AWS Secrets Manager
   */
  async refreshSecrets(): Promise<void> {
    if (process.env.AWS_SECRETS_MANAGER_SECRET_NAME) {
      await this.loadFromAWSSecretsManager();
      logger.info('[SecretsManager] Secrets refreshed from AWS Secrets Manager');
    } else {
      this.loadFromEnvironment();
      logger.info('[SecretsManager] Secrets refreshed from environment variables');
    }
  }
}

export default new SecretsManager();





