import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';
import logger from '../utils/logger';

export interface APIKey {
  id: string;
  name: string;
  key: string;
  secret: string;
  organizationId: string;
  userId: string;
  permissions: string[];
  rateLimit: {
    requests: number;
    window: number; // in seconds
  };
  allowedIPs?: string[];
  expiresAt?: Date;
  lastUsedAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface APIKeyUsage {
  id: string;
  apiKeyId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  ipAddress: string;
  userAgent?: string;
  timestamp: Date;
}

export interface RateLimitInfo {
  key: string;
  requests: number;
  window: number;
  remaining: number;
  resetTime: Date;
}

class APIKeyService {
  private prisma: PrismaClient;
  private rateLimitCache: Map<string, RateLimitInfo> = new Map();

  constructor() {
    this.prisma = new PrismaClient();
    logger.info('[APIKeyService] Initialized');
  }

  /**
   * Creates a new API key
   */
  public async createAPIKey(
    name: string,
    organizationId: string,
    userId: string,
    permissions: string[],
    rateLimit: { requests: number; window: number },
    allowedIPs?: string[],
    expiresAt?: Date
  ): Promise<APIKey> {
    try {
      const key = this.generateAPIKey();
      const secret = this.generateSecret();

      const apiKey = await this.prisma.apiKey.create({
        data: {
          name,
          key,
          secret,
          organizationId,
          userId,
          permissions,
          rateLimit,
          allowedIPs,
          expiresAt,
          isActive: true
        }
      });

      logger.info(`[APIKeyService] Created API key ${apiKey.id} for organization ${organizationId}`);
      return apiKey as APIKey;
    } catch (error: any) {
      logger.error('[APIKeyService] Error creating API key:', error);
      throw new Error(`Failed to create API key: ${error.message}`);
    }
  }

  /**
   * Validates API key and checks permissions
   */
  public async validateAPIKey(
    key: string,
    secret: string,
    requiredPermission?: string,
    ipAddress?: string
  ): Promise<{ valid: boolean; apiKey?: APIKey; error?: string }> {
    try {
      const apiKey = await this.prisma.apiKey.findFirst({
        where: {
          key,
          secret,
          isActive: true
        }
      });

      if (!apiKey) {
        return { valid: false, error: 'Invalid API key or secret' };
      }

      // Check expiration
      if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
        return { valid: false, error: 'API key has expired' };
      }

      // Check IP restrictions
      if (apiKey.allowedIPs && ipAddress && !apiKey.allowedIPs.includes(ipAddress)) {
        return { valid: false, error: 'IP address not allowed' };
      }

      // Check permissions
      if (requiredPermission && !apiKey.permissions.includes(requiredPermission)) {
        return { valid: false, error: 'Insufficient permissions' };
      }

      // Update last used timestamp
      await this.prisma.apiKey.update({
        where: { id: apiKey.id },
        data: { lastUsedAt: new Date() }
      });

      logger.info(`[APIKeyService] Validated API key ${apiKey.id}`);
      return { valid: true, apiKey: apiKey as APIKey };
    } catch (error: any) {
      logger.error('[APIKeyService] Error validating API key:', error);
      return { valid: false, error: 'API key validation failed' };
    }
  }

  /**
   * Checks rate limit for API key
   */
  public async checkRateLimit(apiKeyId: string, ipAddress: string): Promise<{
    allowed: boolean;
    rateLimitInfo?: RateLimitInfo;
  }> {
    try {
      const apiKey = await this.prisma.apiKey.findUnique({
        where: { id: apiKeyId }
      });

      if (!apiKey) {
        return { allowed: false };
      }

      const cacheKey = `${apiKeyId}:${ipAddress}`;
      const now = new Date();
      const windowStart = new Date(now.getTime() - (apiKey.rateLimit.window * 1000));

      // Get current usage from cache or database
      let rateLimitInfo = this.rateLimitCache.get(cacheKey);
      
      if (!rateLimitInfo || rateLimitInfo.resetTime < now) {
        // Reset or initialize rate limit
        rateLimitInfo = {
          key: cacheKey,
          requests: 0,
          window: apiKey.rateLimit.window,
          remaining: apiKey.rateLimit.requests,
          resetTime: new Date(now.getTime() + (apiKey.rateLimit.window * 1000))
        };
      }

      // Check if limit exceeded
      if (rateLimitInfo.requests >= apiKey.rateLimit.requests) {
        return { allowed: false, rateLimitInfo };
      }

      // Increment request count
      rateLimitInfo.requests++;
      rateLimitInfo.remaining = apiKey.rateLimit.requests - rateLimitInfo.requests;
      this.rateLimitCache.set(cacheKey, rateLimitInfo);

      logger.debug(`[APIKeyService] Rate limit check passed for API key ${apiKeyId}: ${rateLimitInfo.requests}/${apiKey.rateLimit.requests}`);
      return { allowed: true, rateLimitInfo };
    } catch (error: any) {
      logger.error('[APIKeyService] Error checking rate limit:', error);
      return { allowed: false };
    }
  }

  /**
   * Records API key usage
   */
  public async recordUsage(
    apiKeyId: string,
    endpoint: string,
    method: string,
    statusCode: number,
    responseTime: number,
    ipAddress: string,
    userAgent?: string
  ): Promise<void> {
    try {
      await this.prisma.apiKeyUsage.create({
        data: {
          apiKeyId,
          endpoint,
          method,
          statusCode,
          responseTime,
          ipAddress,
          userAgent,
          timestamp: new Date()
        }
      });

      logger.debug(`[APIKeyService] Recorded usage for API key ${apiKeyId}: ${method} ${endpoint}`);
    } catch (error: any) {
      logger.error('[APIKeyService] Error recording usage:', error);
    }
  }

  /**
   * Gets API keys for organization
   */
  public async getOrganizationAPIKeys(organizationId: string): Promise<APIKey[]> {
    try {
      const apiKeys = await this.prisma.apiKey.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' }
      });

      return apiKeys as APIKey[];
    } catch (error: any) {
      logger.error(`[APIKeyService] Error getting API keys for organization ${organizationId}:`, error);
      throw new Error(`Failed to get API keys: ${error.message}`);
    }
  }

  /**
   * Gets API key usage statistics
   */
  public async getAPIKeyUsage(
    apiKeyId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    topEndpoints: Array<{ endpoint: string; count: number }>;
    usageByDay: Array<{ date: string; requests: number }>;
  }> {
    try {
      const where: any = { apiKeyId };
      if (startDate && endDate) {
        where.timestamp = {
          gte: startDate,
          lte: endDate
        };
      }

      const usage = await this.prisma.apiKeyUsage.findMany({
        where,
        orderBy: { timestamp: 'desc' }
      });

      const totalRequests = usage.length;
      const successfulRequests = usage.filter(u => u.statusCode >= 200 && u.statusCode < 300).length;
      const failedRequests = totalRequests - successfulRequests;
      const averageResponseTime = usage.reduce((sum, u) => sum + u.responseTime, 0) / totalRequests;

      // Top endpoints
      const endpointCounts: { [key: string]: number } = {};
      usage.forEach(u => {
        endpointCounts[u.endpoint] = (endpointCounts[u.endpoint] || 0) + 1;
      });
      const topEndpoints = Object.entries(endpointCounts)
        .map(([endpoint, count]) => ({ endpoint, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Usage by day
      const usageByDay: { [key: string]: number } = {};
      usage.forEach(u => {
        const date = u.timestamp.toISOString().split('T')[0];
        usageByDay[date] = (usageByDay[date] || 0) + 1;
      });
      const usageByDayArray = Object.entries(usageByDay)
        .map(([date, requests]) => ({ date, requests }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return {
        totalRequests,
        successfulRequests,
        failedRequests,
        averageResponseTime,
        topEndpoints,
        usageByDay: usageByDayArray
      };
    } catch (error: any) {
      logger.error(`[APIKeyService] Error getting API key usage:`, error);
      throw new Error(`Failed to get API key usage: ${error.message}`);
    }
  }

  /**
   * Updates API key
   */
  public async updateAPIKey(
    apiKeyId: string,
    updates: Partial<Pick<APIKey, 'name' | 'permissions' | 'rateLimit' | 'allowedIPs' | 'expiresAt' | 'isActive'>>
  ): Promise<APIKey> {
    try {
      const apiKey = await this.prisma.apiKey.update({
        where: { id: apiKeyId },
        data: updates
      });

      logger.info(`[APIKeyService] Updated API key ${apiKeyId}`);
      return apiKey as APIKey;
    } catch (error: any) {
      logger.error('[APIKeyService] Error updating API key:', error);
      throw new Error(`Failed to update API key: ${error.message}`);
    }
  }

  /**
   * Deletes API key
   */
  public async deleteAPIKey(apiKeyId: string): Promise<boolean> {
    try {
      await this.prisma.apiKey.delete({
        where: { id: apiKeyId }
      });

      logger.info(`[APIKeyService] Deleted API key ${apiKeyId}`);
      return true;
    } catch (error: any) {
      logger.error('[APIKeyService] Error deleting API key:', error);
      throw new Error(`Failed to delete API key: ${error.message}`);
    }
  }

  /**
   * Regenerates API key secret
   */
  public async regenerateSecret(apiKeyId: string): Promise<{ key: string; secret: string }> {
    try {
      const newSecret = this.generateSecret();
      
      await this.prisma.apiKey.update({
        where: { id: apiKeyId },
        data: { secret: newSecret }
      });

      const apiKey = await this.prisma.apiKey.findUnique({
        where: { id: apiKeyId }
      });

      logger.info(`[APIKeyService] Regenerated secret for API key ${apiKeyId}`);
      return {
        key: apiKey?.key || '',
        secret: newSecret
      };
    } catch (error: any) {
      logger.error('[APIKeyService] Error regenerating secret:', error);
      throw new Error(`Failed to regenerate secret: ${error.message}`);
    }
  }

  /**
   * Generates API key
   */
  private generateAPIKey(): string {
    const prefix = 'vg_';
    const randomBytes = crypto.randomBytes(32);
    return prefix + randomBytes.toString('hex');
  }

  /**
   * Generates secret
   */
  private generateSecret(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  /**
   * Gets API key by ID
   */
  public async getAPIKey(apiKeyId: string): Promise<APIKey | null> {
    try {
      const apiKey = await this.prisma.apiKey.findUnique({
        where: { id: apiKeyId }
      });

      return apiKey as APIKey | null;
    } catch (error: any) {
      logger.error(`[APIKeyService] Error getting API key ${apiKeyId}:`, error);
      throw new Error(`Failed to get API key: ${error.message}`);
    }
  }
}

export default new APIKeyService();










