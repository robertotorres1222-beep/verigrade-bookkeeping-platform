import { Request, Response } from 'express';
import APIKeyService from '../services/apiKeyService';
import logger from '../utils/logger';

export const createAPIKey = async (req: Request, res: Response): Promise<void> => {
  try {
    const { organizationId } = req.params;
    const { name, permissions, rateLimit, allowedIPs, expiresAt } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const apiKey = await APIKeyService.createAPIKey(
      name,
      organizationId,
      userId,
      permissions,
      rateLimit,
      allowedIPs,
      expiresAt ? new Date(expiresAt) : undefined
    );

    res.status(201).json({
      success: true,
      message: 'API key created successfully',
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        key: apiKey.key,
        secret: apiKey.secret,
        permissions: apiKey.permissions,
        rateLimit: apiKey.rateLimit,
        allowedIPs: apiKey.allowedIPs,
        expiresAt: apiKey.expiresAt,
        isActive: apiKey.isActive,
        createdAt: apiKey.createdAt
      }
    });
  } catch (error: any) {
    logger.error(`Error creating API key for organization ${req.params.organizationId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to create API key',
      error: error.message
    });
  }
};

export const getOrganizationAPIKeys = async (req: Request, res: Response): Promise<void> => {
  try {
    const { organizationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const apiKeys = await APIKeyService.getOrganizationAPIKeys(organizationId);

    // Remove sensitive information
    const sanitizedKeys = apiKeys.map(key => ({
      id: key.id,
      name: key.name,
      permissions: key.permissions,
      rateLimit: key.rateLimit,
      allowedIPs: key.allowedIPs,
      expiresAt: key.expiresAt,
      lastUsedAt: key.lastUsedAt,
      isActive: key.isActive,
      createdAt: key.createdAt,
      updatedAt: key.updatedAt
    }));

    res.status(200).json({
      success: true,
      apiKeys: sanitizedKeys
    });
  } catch (error: any) {
    logger.error(`Error getting API keys for organization ${req.params.organizationId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to get API keys',
      error: error.message
    });
  }
};

export const getAPIKey = async (req: Request, res: Response): Promise<void> => {
  try {
    const { apiKeyId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const apiKey = await APIKeyService.getAPIKey(apiKeyId);

    if (!apiKey) {
      res.status(404).json({ success: false, message: 'API key not found' });
      return;
    }

    res.status(200).json({
      success: true,
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        permissions: apiKey.permissions,
        rateLimit: apiKey.rateLimit,
        allowedIPs: apiKey.allowedIPs,
        expiresAt: apiKey.expiresAt,
        lastUsedAt: apiKey.lastUsedAt,
        isActive: apiKey.isActive,
        createdAt: apiKey.createdAt,
        updatedAt: apiKey.updatedAt
      }
    });
  } catch (error: any) {
    logger.error(`Error getting API key ${req.params.apiKeyId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to get API key',
      error: error.message
    });
  }
};

export const updateAPIKey = async (req: Request, res: Response): Promise<void> => {
  try {
    const { apiKeyId } = req.params;
    const updates = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const apiKey = await APIKeyService.updateAPIKey(apiKeyId, updates);

    res.status(200).json({
      success: true,
      message: 'API key updated successfully',
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        permissions: apiKey.permissions,
        rateLimit: apiKey.rateLimit,
        allowedIPs: apiKey.allowedIPs,
        expiresAt: apiKey.expiresAt,
        isActive: apiKey.isActive,
        updatedAt: apiKey.updatedAt
      }
    });
  } catch (error: any) {
    logger.error(`Error updating API key ${req.params.apiKeyId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to update API key',
      error: error.message
    });
  }
};

export const deleteAPIKey = async (req: Request, res: Response): Promise<void> => {
  try {
    const { apiKeyId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const success = await APIKeyService.deleteAPIKey(apiKeyId);

    if (success) {
      res.status(200).json({
        success: true,
        message: 'API key deleted successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to delete API key'
      });
    }
  } catch (error: any) {
    logger.error(`Error deleting API key ${req.params.apiKeyId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete API key',
      error: error.message
    });
  }
};

export const regenerateSecret = async (req: Request, res: Response): Promise<void> => {
  try {
    const { apiKeyId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { key, secret } = await APIKeyService.regenerateSecret(apiKeyId);

    res.status(200).json({
      success: true,
      message: 'API key secret regenerated successfully',
      key,
      secret
    });
  } catch (error: any) {
    logger.error(`Error regenerating secret for API key ${req.params.apiKeyId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to regenerate secret',
      error: error.message
    });
  }
};

export const getAPIKeyUsage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { apiKeyId } = req.params;
    const { startDate, endDate } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const usage = await APIKeyService.getAPIKeyUsage(
      apiKeyId,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    res.status(200).json({
      success: true,
      usage
    });
  } catch (error: any) {
    logger.error(`Error getting usage for API key ${req.params.apiKeyId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to get API key usage',
      error: error.message
    });
  }
};

export const validateAPIKey = async (req: Request, res: Response): Promise<void> => {
  try {
    const { key, secret, permission, ipAddress } = req.body;

    if (!key || !secret) {
      res.status(400).json({ success: false, message: 'API key and secret are required' });
      return;
    }

    const validation = await APIKeyService.validateAPIKey(key, secret, permission, ipAddress);

    if (validation.valid) {
      res.status(200).json({
        success: true,
        message: 'API key is valid',
        apiKey: {
          id: validation.apiKey?.id,
          name: validation.apiKey?.name,
          permissions: validation.apiKey?.permissions,
          rateLimit: validation.apiKey?.rateLimit,
          allowedIPs: validation.apiKey?.allowedIPs,
          expiresAt: validation.apiKey?.expiresAt,
          isActive: validation.apiKey?.isActive
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: validation.error || 'Invalid API key'
      });
    }
  } catch (error: any) {
    logger.error('Error validating API key:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate API key',
      error: error.message
    });
  }
};

export const checkRateLimit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { apiKeyId, ipAddress } = req.body;

    if (!apiKeyId || !ipAddress) {
      res.status(400).json({ success: false, message: 'API key ID and IP address are required' });
      return;
    }

    const rateLimitCheck = await APIKeyService.checkRateLimit(apiKeyId, ipAddress);

    res.status(200).json({
      success: true,
      allowed: rateLimitCheck.allowed,
      rateLimitInfo: rateLimitCheck.rateLimitInfo
    });
  } catch (error: any) {
    logger.error('Error checking rate limit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check rate limit',
      error: error.message
    });
  }
};

export const recordUsage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { apiKeyId, endpoint, method, statusCode, responseTime, ipAddress, userAgent } = req.body;

    if (!apiKeyId || !endpoint || !method || !statusCode || !responseTime || !ipAddress) {
      res.status(400).json({ success: false, message: 'Required fields are missing' });
      return;
    }

    await APIKeyService.recordUsage(
      apiKeyId,
      endpoint,
      method,
      statusCode,
      responseTime,
      ipAddress,
      userAgent
    );

    res.status(200).json({
      success: true,
      message: 'Usage recorded successfully'
    });
  } catch (error: any) {
    logger.error('Error recording usage:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record usage',
      error: error.message
    });
  }
};







