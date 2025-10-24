import { Request, Response } from 'express';
import OrganizationService from '../models/organization';
import logger from '../utils/logger';

export const createOrganization = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, type, parentId, settings, branding } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const organization = await OrganizationService.createOrganization(
      name,
      type,
      parentId,
      settings,
      branding
    );

    res.status(201).json({
      success: true,
      message: 'Organization created successfully',
      organization
    });
  } catch (error: any) {
    logger.error('Error creating organization:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create organization',
      error: error.message
    });
  }
};

export const getOrganization = async (req: Request, res: Response): Promise<void> => {
  try {
    const { organizationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const organization = await OrganizationService.getOrganization(organizationId);

    if (!organization) {
      res.status(404).json({ success: false, message: 'Organization not found' });
      return;
    }

    res.status(200).json({
      success: true,
      organization
    });
  } catch (error: any) {
    logger.error(`Error getting organization ${req.params.organizationId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to get organization',
      error: error.message
    });
  }
};

export const getOrganizationHierarchy = async (req: Request, res: Response): Promise<void> => {
  try {
    const { organizationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const organizations = await OrganizationService.getOrganizationHierarchy(organizationId);

    res.status(200).json({
      success: true,
      organizations
    });
  } catch (error: any) {
    logger.error(`Error getting organization hierarchy for ${req.params.organizationId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to get organization hierarchy',
      error: error.message
    });
  }
};

export const updateOrganizationSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { organizationId } = req.params;
    const settings = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const organization = await OrganizationService.updateOrganizationSettings(
      organizationId,
      settings
    );

    res.status(200).json({
      success: true,
      message: 'Organization settings updated successfully',
      organization
    });
  } catch (error: any) {
    logger.error(`Error updating organization settings for ${req.params.organizationId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to update organization settings',
      error: error.message
    });
  }
};

export const updateOrganizationBranding = async (req: Request, res: Response): Promise<void> => {
  try {
    const { organizationId } = req.params;
    const branding = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const organization = await OrganizationService.updateOrganizationBranding(
      organizationId,
      branding
    );

    res.status(200).json({
      success: true,
      message: 'Organization branding updated successfully',
      organization
    });
  } catch (error: any) {
    logger.error(`Error updating organization branding for ${req.params.organizationId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to update organization branding',
      error: error.message
    });
  }
};

export const addUserToOrganization = async (req: Request, res: Response): Promise<void> => {
  try {
    const { organizationId } = req.params;
    const { userId, roleId, department, managerId } = req.body;
    const currentUserId = req.user?.id;

    if (!currentUserId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const organizationUser = await OrganizationService.addUserToOrganization(
      organizationId,
      userId,
      roleId,
      department,
      managerId
    );

    res.status(201).json({
      success: true,
      message: 'User added to organization successfully',
      organizationUser
    });
  } catch (error: any) {
    logger.error(`Error adding user to organization ${req.params.organizationId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to add user to organization',
      error: error.message
    });
  }
};

export const getOrganizationUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { organizationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const users = await OrganizationService.getOrganizationUsers(organizationId);

    res.status(200).json({
      success: true,
      users
    });
  } catch (error: any) {
    logger.error(`Error getting organization users for ${req.params.organizationId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to get organization users',
      error: error.message
    });
  }
};

export const createOrganizationRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { organizationId } = req.params;
    const { name, description, permissions, isDefault } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const role = await OrganizationService.createOrganizationRole(
      organizationId,
      name,
      description,
      permissions,
      isDefault
    );

    res.status(201).json({
      success: true,
      message: 'Organization role created successfully',
      role
    });
  } catch (error: any) {
    logger.error(`Error creating organization role for ${req.params.organizationId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to create organization role',
      error: error.message
    });
  }
};

export const getOrganizationRoles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { organizationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const roles = await OrganizationService.getOrganizationRoles(organizationId);

    res.status(200).json({
      success: true,
      roles
    });
  } catch (error: any) {
    logger.error(`Error getting organization roles for ${req.params.organizationId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to get organization roles',
      error: error.message
    });
  }
};

export const createInterCompanyTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { organizationId } = req.params;
    const { toOrganizationId, amount, currency, description, type } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const transaction = await OrganizationService.createInterCompanyTransaction(
      organizationId,
      toOrganizationId,
      amount,
      currency,
      description,
      type
    );

    res.status(201).json({
      success: true,
      message: 'Inter-company transaction created successfully',
      transaction
    });
  } catch (error: any) {
    logger.error(`Error creating inter-company transaction for ${req.params.organizationId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to create inter-company transaction',
      error: error.message
    });
  }
};

export const approveInterCompanyTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { transactionId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const transaction = await OrganizationService.approveInterCompanyTransaction(
      transactionId,
      userId
    );

    res.status(200).json({
      success: true,
      message: 'Inter-company transaction approved successfully',
      transaction
    });
  } catch (error: any) {
    logger.error(`Error approving inter-company transaction ${req.params.transactionId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve inter-company transaction',
      error: error.message
    });
  }
};

export const getInterCompanyTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { organizationId } = req.params;
    const { status } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const transactions = await OrganizationService.getInterCompanyTransactions(
      organizationId,
      status as string
    );

    res.status(200).json({
      success: true,
      transactions
    });
  } catch (error: any) {
    logger.error(`Error getting inter-company transactions for ${req.params.organizationId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to get inter-company transactions',
      error: error.message
    });
  }
};

export const getConsolidatedReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { organizationIds, startDate, endDate } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    if (!organizationIds || !Array.isArray(organizationIds) || organizationIds.length === 0) {
      res.status(400).json({ success: false, message: 'Organization IDs are required' });
      return;
    }

    const report = await OrganizationService.getConsolidatedReport(
      organizationIds,
      new Date(startDate),
      new Date(endDate)
    );

    res.status(200).json({
      success: true,
      report
    });
  } catch (error: any) {
    logger.error('Error generating consolidated report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate consolidated report',
      error: error.message
    });
  }
};