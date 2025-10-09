import { Response } from 'express';
import { prisma } from '../index';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from './authController';

// Get all users in organization
export const getUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const users = await prisma.user.findMany({
      where: {
        organizationMemberships: {
          some: {
            organizationId: req.user.organizationId
          }
        }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.status(200).json({
      success: true,
      data: { users }
    });
  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get user by ID
export const getUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        id,
        organizationMemberships: {
          some: {
            organizationId: req.user.organizationId
          }
        }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update user
export const updateUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
      return;
    }
    
    const { firstName, lastName, role, isActive } = req.body;

    // Check if user exists and belongs to organization
    const existingUser = await prisma.user.findFirst({
      where: {
        id,
        organizationMemberships: {
          some: {
            organizationId: req.user.organizationId
          }
        }
      }
    });

    if (!existingUser) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Update user basic info
    const user = await prisma.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        isActive
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Update organization membership role if provided
    if (role) {
      await prisma.organizationMember.updateMany({
        where: {
          userId: id,
          organizationId: req.user.organizationId
        },
        data: {
          role,
          isActive
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    logger.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete user
export const deleteUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
      return;
    }

    // Check if user exists and belongs to organization
    const existingUser = await prisma.user.findFirst({
      where: {
        id,
        organizationMemberships: {
          some: {
            organizationId: req.user.organizationId
          }
        }
      }
    });

    if (!existingUser) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Don't allow deleting yourself
    if (id === req.user.id) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
      return;
    }

    // Remove from organization (soft delete by deactivating membership)
    await prisma.organizationMember.updateMany({
      where: {
        userId: id,
        organizationId: req.user.organizationId
      },
      data: {
        isActive: false
      }
    });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
