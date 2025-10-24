import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import enterpriseService from '../services/enterpriseService';

/**
 * Check if user has permission
 */
export const checkPermission = (resource: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      const organizationId = (req as any).user?.organizationId;

      if (!userId || !organizationId) {
        throw new AppError('User not authenticated', 401);
      }

      const hasPermission = await enterpriseService.checkPermission(
        userId,
        resource,
        action,
        organizationId
      );

      if (!hasPermission) {
        throw new AppError('Insufficient permissions', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user has any of the specified permissions
 */
export const checkAnyPermission = (permissions: Array<{ resource: string; action: string }>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      const organizationId = (req as any).user?.organizationId;

      if (!userId || !organizationId) {
        throw new AppError('User not authenticated', 401);
      }

      let hasPermission = false;

      for (const permission of permissions) {
        const hasThisPermission = await enterpriseService.checkPermission(
          userId,
          permission.resource,
          permission.action,
          organizationId
        );

        if (hasThisPermission) {
          hasPermission = true;
          break;
        }
      }

      if (!hasPermission) {
        throw new AppError('Insufficient permissions', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user has all of the specified permissions
 */
export const checkAllPermissions = (permissions: Array<{ resource: string; action: string }>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      const organizationId = (req as any).user?.organizationId;

      if (!userId || !organizationId) {
        throw new AppError('User not authenticated', 401);
      }

      for (const permission of permissions) {
        const hasPermission = await enterpriseService.checkPermission(
          userId,
          permission.resource,
          permission.action,
          organizationId
        );

        if (!hasPermission) {
          throw new AppError('Insufficient permissions', 403);
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user is super admin
 */
export const requireSuperAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const organizationId = (req as any).user?.organizationId;

    if (!userId || !organizationId) {
      throw new AppError('User not authenticated', 401);
    }

    const hasPermission = await enterpriseService.checkPermission(
      userId,
      '*',
      '*',
      organizationId
    );

    if (!hasPermission) {
      throw new AppError('Super admin access required', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user is admin
 */
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const organizationId = (req as any).user?.organizationId;

    if (!userId || !organizationId) {
      throw new AppError('User not authenticated', 401);
    }

    const hasPermission = await enterpriseService.checkPermission(
      userId,
      'users',
      'write',
      organizationId
    );

    if (!hasPermission) {
      throw new AppError('Admin access required', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user is manager
 */
export const requireManager = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const organizationId = (req as any).user?.organizationId;

    if (!userId || !organizationId) {
      throw new AppError('User not authenticated', 401);
    }

    const hasPermission = await enterpriseService.checkPermission(
      userId,
      'invoices',
      'write',
      organizationId
    );

    if (!hasPermission) {
      throw new AppError('Manager access required', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user can access resource
 */
export const checkResourceAccess = (resource: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      const organizationId = (req as any).user?.organizationId;

      if (!userId || !organizationId) {
        throw new AppError('User not authenticated', 401);
      }

      // Check if user has read access to the resource
      const hasReadPermission = await enterpriseService.checkPermission(
        userId,
        resource,
        'read',
        organizationId
      );

      if (!hasReadPermission) {
        throw new AppError('Access denied to resource', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user can modify resource
 */
export const checkResourceModify = (resource: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      const organizationId = (req as any).user?.organizationId;

      if (!userId || !organizationId) {
        throw new AppError('User not authenticated', 401);
      }

      // Check if user has write access to the resource
      const hasWritePermission = await enterpriseService.checkPermission(
        userId,
        resource,
        'write',
        organizationId
      );

      if (!hasWritePermission) {
        throw new AppError('Modification access denied to resource', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user can delete resource
 */
export const checkResourceDelete = (resource: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      const organizationId = (req as any).user?.organizationId;

      if (!userId || !organizationId) {
        throw new AppError('User not authenticated', 401);
      }

      // Check if user has delete access to the resource
      const hasDeletePermission = await enterpriseService.checkPermission(
        userId,
        resource,
        'delete',
        organizationId
      );

      if (!hasDeletePermission) {
        throw new AppError('Delete access denied to resource', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user can access organization
 */
export const checkOrganizationAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const organizationId = (req as any).user?.organizationId;
    const targetOrganizationId = req.params.organizationId || req.body.organizationId;

    if (!userId || !organizationId) {
      throw new AppError('User not authenticated', 401);
    }

    // Check if user is trying to access a different organization
    if (targetOrganizationId && targetOrganizationId !== organizationId) {
      // Check if user has cross-organization access
      const hasCrossOrgPermission = await enterpriseService.checkPermission(
        userId,
        'organizations',
        'read',
        organizationId
      );

      if (!hasCrossOrgPermission) {
        throw new AppError('Access denied to organization', 403);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user can access user management
 */
export const checkUserManagement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const organizationId = (req as any).user?.organizationId;

    if (!userId || !organizationId) {
      throw new AppError('User not authenticated', 401);
    }

    const hasUserManagementPermission = await enterpriseService.checkPermission(
      userId,
      'users',
      'write',
      organizationId
    );

    if (!hasUserManagementPermission) {
      throw new AppError('User management access required', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user can access settings
 */
export const checkSettingsAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const organizationId = (req as any).user?.organizationId;

    if (!userId || !organizationId) {
      throw new AppError('User not authenticated', 401);
    }

    const hasSettingsPermission = await enterpriseService.checkPermission(
      userId,
      'settings',
      'write',
      organizationId
    );

    if (!hasSettingsPermission) {
      throw new AppError('Settings access required', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user can access reports
 */
export const checkReportsAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const organizationId = (req as any).user?.organizationId;

    if (!userId || !organizationId) {
      throw new AppError('User not authenticated', 401);
    }

    const hasReportsPermission = await enterpriseService.checkPermission(
      userId,
      'reports',
      'read',
      organizationId
    );

    if (!hasReportsPermission) {
      throw new AppError('Reports access required', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user can access API
 */
export const checkAPIAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      throw new AppError('API key required', 401);
    }

    const validation = await enterpriseService.validateAPIKey(apiKey);

    if (!validation.valid) {
      throw new AppError('Invalid API key', 401);
    }

    // Add organization ID to request
    (req as any).organizationId = validation.organizationId;
    (req as any).apiPermissions = validation.permissions;
    (req as any).rateLimit = validation.rateLimit;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user can access specific API endpoint
 */
export const checkAPIEndpointAccess = (requiredPermission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const apiPermissions = (req as any).apiPermissions;

      if (!apiPermissions || !apiPermissions.includes(requiredPermission)) {
        throw new AppError('Insufficient API permissions', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};





