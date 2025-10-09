import { Response } from 'express';
import { prisma } from '../index';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from './authController';

// Get organization
export const getOrganization = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const organization = await prisma.organization.findUnique({
      where: { id: req.user.organizationId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    if (!organization) {
      res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { organization }
    });
  } catch (error) {
    logger.error('Get organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get organization',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update organization
export const updateOrganization = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const { name, description, website, address } = req.body;

    const organization = await prisma.organization.update({
      where: { id: req.user.organizationId },
      data: {
        name,
        description,
        website,
        address
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Organization updated successfully',
      data: { organization }
    });
  } catch (error) {
    logger.error('Update organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update organization',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get organization settings
export const getSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const organization = await prisma.organization.findUnique({
      where: { id: req.user.organizationId },
      select: {
        id: true,
        name: true,
        description: true,
        website: true,
        address: true,
        timezone: true,
        currency: true,
        isActive: true
      }
    });

    if (!organization) {
      res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { settings: organization }
    });
  } catch (error) {
    logger.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get settings',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update organization settings
export const updateSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const { timezone, currency } = req.body;

    const organization = await prisma.organization.update({
      where: { id: req.user.organizationId },
      data: {
        timezone,
        currency
      }
    });

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: { settings: organization }
    });
  } catch (error) {
    logger.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
