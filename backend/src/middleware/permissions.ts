import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  conditions?: string[];
  description: string;
}

export interface Role {
  id: string;
  name: string;
  organizationId: string;
  permissions: string[];
  isSystemRole: boolean;
  isDefault: boolean;
  description: string;
}

export interface UserPermissions {
  userId: string;
  organizationId: string;
  roles: string[];
  permissions: string[];
  resourcePermissions: { [resource: string]: string[] };
}

class PermissionService {
  private prisma: PrismaClient;
  private permissions: Map<string, Permission> = new Map();
  private roles: Map<string, Role> = new Map();

  constructor() {
    this.prisma = new PrismaClient();
    this.initializePermissions();
    this.initializeDefaultRoles();
    logger.info('[PermissionService] Initialized');
  }

  private initializePermissions() {
    const systemPermissions: Permission[] = [
      // User Management
      { id: 'users:read', name: 'Read Users', resource: 'users', action: 'read', description: 'View user information' },
      { id: 'users:write', name: 'Write Users', resource: 'users', action: 'write', description: 'Create and edit users' },
      { id: 'users:delete', name: 'Delete Users', resource: 'users', action: 'delete', description: 'Delete users' },
      { id: 'users:invite', name: 'Invite Users', resource: 'users', action: 'invite', description: 'Invite new users' },

      // Organization Management
      { id: 'organization:read', name: 'Read Organization', resource: 'organization', action: 'read', description: 'View organization settings' },
      { id: 'organization:write', name: 'Write Organization', resource: 'organization', action: 'write', description: 'Edit organization settings' },
      { id: 'organization:branding', name: 'Manage Branding', resource: 'organization', action: 'branding', description: 'Customize organization branding' },

      // Financial Data
      { id: 'transactions:read', name: 'Read Transactions', resource: 'transactions', action: 'read', description: 'View financial transactions' },
      { id: 'transactions:write', name: 'Write Transactions', resource: 'transactions', action: 'write', description: 'Create and edit transactions' },
      { id: 'transactions:delete', name: 'Delete Transactions', resource: 'transactions', action: 'delete', description: 'Delete transactions' },
      { id: 'transactions:approve', name: 'Approve Transactions', resource: 'transactions', action: 'approve', description: 'Approve pending transactions' },

      // Invoices
      { id: 'invoices:read', name: 'Read Invoices', resource: 'invoices', action: 'read', description: 'View invoices' },
      { id: 'invoices:write', name: 'Write Invoices', resource: 'invoices', action: 'write', description: 'Create and edit invoices' },
      { id: 'invoices:delete', name: 'Delete Invoices', resource: 'invoices', action: 'delete', description: 'Delete invoices' },
      { id: 'invoices:send', name: 'Send Invoices', resource: 'invoices', action: 'send', description: 'Send invoices to clients' },

      // Reports
      { id: 'reports:read', name: 'Read Reports', resource: 'reports', action: 'read', description: 'View financial reports' },
      { id: 'reports:create', name: 'Create Reports', resource: 'reports', action: 'create', description: 'Create custom reports' },
      { id: 'reports:export', name: 'Export Reports', resource: 'reports', action: 'export', description: 'Export reports to various formats' },

      // Integrations
      { id: 'integrations:read', name: 'Read Integrations', resource: 'integrations', action: 'read', description: 'View integration settings' },
      { id: 'integrations:write', name: 'Write Integrations', resource: 'integrations', action: 'write', description: 'Configure integrations' },
      { id: 'integrations:sync', name: 'Sync Integrations', resource: 'integrations', action: 'sync', description: 'Sync data with external services' },

      // API Access
      { id: 'api:read', name: 'API Read Access', resource: 'api', action: 'read', description: 'Read API access' },
      { id: 'api:write', name: 'API Write Access', resource: 'api', action: 'write', description: 'Write API access' },
      { id: 'api:admin', name: 'API Admin Access', resource: 'api', action: 'admin', description: 'Full API access' },

      // Settings
      { id: 'settings:read', name: 'Read Settings', resource: 'settings', action: 'read', description: 'View system settings' },
      { id: 'settings:write', name: 'Write Settings', resource: 'settings', action: 'write', description: 'Modify system settings' },

      // Audit
      { id: 'audit:read', name: 'Read Audit Logs', resource: 'audit', action: 'read', description: 'View audit logs' },
      { id: 'audit:export', name: 'Export Audit Logs', resource: 'audit', action: 'export', description: 'Export audit logs' }
    ];

    systemPermissions.forEach(permission => {
      this.permissions.set(permission.id, permission);
    });
  }

  private initializeDefaultRoles() {
    const defaultRoles: Role[] = [
      {
        id: 'admin',
        name: 'Administrator',
        organizationId: 'system',
        permissions: Array.from(this.permissions.keys()),
        isSystemRole: true,
        isDefault: false,
        description: 'Full system access'
      },
      {
        id: 'manager',
        name: 'Manager',
        organizationId: 'system',
        permissions: [
          'users:read', 'users:invite',
          'organization:read',
          'transactions:read', 'transactions:write', 'transactions:approve',
          'invoices:read', 'invoices:write', 'invoices:send',
          'reports:read', 'reports:create', 'reports:export',
          'integrations:read', 'integrations:write',
          'settings:read'
        ],
        isSystemRole: true,
        isDefault: false,
        description: 'Management access with approval rights'
      },
      {
        id: 'accountant',
        name: 'Accountant',
        organizationId: 'system',
        permissions: [
          'transactions:read', 'transactions:write',
          'invoices:read', 'invoices:write', 'invoices:send',
          'reports:read', 'reports:create', 'reports:export',
          'integrations:read', 'integrations:sync'
        ],
        isSystemRole: true,
        isDefault: false,
        description: 'Financial data management'
      },
      {
        id: 'user',
        name: 'User',
        organizationId: 'system',
        permissions: [
          'transactions:read',
          'invoices:read',
          'reports:read'
        ],
        isSystemRole: true,
        isDefault: true,
        description: 'Basic user access'
      }
    ];

    defaultRoles.forEach(role => {
      this.roles.set(role.id, role);
    });
  }

  /**
   * Checks if user has specific permission
   */
  public async hasPermission(
    userId: string,
    organizationId: string,
    permission: string,
    resource?: string
  ): Promise<boolean> {
    try {
      const userPermissions = await this.getUserPermissions(userId, organizationId);
      
      // Check direct permission
      if (userPermissions.permissions.includes(permission)) {
        return true;
      }

      // Check resource-specific permission
      if (resource && userPermissions.resourcePermissions[resource]?.includes(permission)) {
        return true;
      }

      // Check wildcard permissions
      const [resourceName, action] = permission.split(':');
      if (userPermissions.permissions.includes(`${resourceName}:*`)) {
        return true;
      }

      return false;
    } catch (error: any) {
      logger.error(`[PermissionService] Error checking permission ${permission} for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Gets user permissions
   */
  public async getUserPermissions(userId: string, organizationId: string): Promise<UserPermissions> {
    try {
      const user = await this.prisma.organizationUser.findFirst({
        where: {
          userId,
          organizationId,
          isActive: true
        },
        include: {
          role: true
        }
      });

      if (!user) {
        return {
          userId,
          organizationId,
          roles: [],
          permissions: [],
          resourcePermissions: {}
        };
      }

      const permissions = new Set<string>();
      const resourcePermissions: { [resource: string]: string[] } = {};

      // Add role permissions
      if (user.role) {
        user.role.permissions.forEach(permissionId => {
          permissions.add(permissionId);
          
          const permission = this.permissions.get(permissionId);
          if (permission) {
            if (!resourcePermissions[permission.resource]) {
              resourcePermissions[permission.resource] = [];
            }
            resourcePermissions[permission.resource].push(permission.action);
          }
        });
      }

      // Add direct user permissions
      user.permissions.forEach(permissionId => {
        permissions.add(permissionId);
      });

      return {
        userId,
        organizationId,
        roles: user.role ? [user.role.name] : [],
        permissions: Array.from(permissions),
        resourcePermissions
      };
    } catch (error: any) {
      logger.error(`[PermissionService] Error getting user permissions:`, error);
      throw new Error(`Failed to get user permissions: ${error.message}`);
    }
  }

  /**
   * Creates custom role
   */
  public async createRole(
    organizationId: string,
    name: string,
    description: string,
    permissions: string[]
  ): Promise<Role> {
    try {
      // Validate permissions
      for (const permissionId of permissions) {
        if (!this.permissions.has(permissionId)) {
          throw new Error(`Invalid permission: ${permissionId}`);
        }
      }

      const role = await this.prisma.organizationRole.create({
        data: {
          organizationId,
          name,
          description,
          permissions,
          isSystemRole: false,
          isDefault: false
        }
      });

      const newRole: Role = {
        id: role.id,
        name: role.name,
        organizationId: role.organizationId,
        permissions: role.permissions,
        isSystemRole: role.isSystemRole,
        isDefault: role.isDefault,
        description: role.description
      };

      this.roles.set(role.id, newRole);
      logger.info(`[PermissionService] Created role ${role.id} for organization ${organizationId}`);
      return newRole;
    } catch (error: any) {
      logger.error('[PermissionService] Error creating role:', error);
      throw new Error(`Failed to create role: ${error.message}`);
    }
  }

  /**
   * Updates role permissions
   */
  public async updateRolePermissions(
    roleId: string,
    permissions: string[]
  ): Promise<Role> {
    try {
      // Validate permissions
      for (const permissionId of permissions) {
        if (!this.permissions.has(permissionId)) {
          throw new Error(`Invalid permission: ${permissionId}`);
        }
      }

      const role = await this.prisma.organizationRole.update({
        where: { id: roleId },
        data: { permissions }
      });

      const updatedRole: Role = {
        id: role.id,
        name: role.name,
        organizationId: role.organizationId,
        permissions: role.permissions,
        isSystemRole: role.isSystemRole,
        isDefault: role.isDefault,
        description: role.description
      };

      this.roles.set(roleId, updatedRole);
      logger.info(`[PermissionService] Updated permissions for role ${roleId}`);
      return updatedRole;
    } catch (error: any) {
      logger.error('[PermissionService] Error updating role permissions:', error);
      throw new Error(`Failed to update role permissions: ${error.message}`);
    }
  }

  /**
   * Gets all available permissions
   */
  public getAllPermissions(): Permission[] {
    return Array.from(this.permissions.values());
  }

  /**
   * Gets permissions by resource
   */
  public getPermissionsByResource(resource: string): Permission[] {
    return Array.from(this.permissions.values()).filter(p => p.resource === resource);
  }

  /**
   * Gets organization roles
   */
  public async getOrganizationRoles(organizationId: string): Promise<Role[]> {
    try {
      const roles = await this.prisma.organizationRole.findMany({
        where: { organizationId },
        orderBy: { name: 'asc' }
      });

      return roles.map(role => ({
        id: role.id,
        name: role.name,
        organizationId: role.organizationId,
        permissions: role.permissions,
        isSystemRole: role.isSystemRole,
        isDefault: role.isDefault,
        description: role.description
      }));
    } catch (error: any) {
      logger.error(`[PermissionService] Error getting organization roles:`, error);
      throw new Error(`Failed to get organization roles: ${error.message}`);
    }
  }
}

// Middleware for permission checking
export const requirePermission = (permission: string, resource?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const organizationId = req.user?.organizationId;

      if (!userId || !organizationId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const permissionService = new PermissionService();
      const hasPermission = await permissionService.hasPermission(userId, organizationId, permission, resource);

      if (!hasPermission) {
        res.status(403).json({ 
          success: false, 
          message: `Permission denied: ${permission}`,
          requiredPermission: permission
        });
        return;
      }

      next();
    } catch (error: any) {
      logger.error(`[PermissionMiddleware] Error checking permission ${permission}:`, error);
      res.status(500).json({ success: false, message: 'Permission check failed' });
    }
  };
};

// Middleware for role checking
export const requireRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const organizationId = req.user?.organizationId;

      if (!userId || !organizationId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const permissionService = new PermissionService();
      const userPermissions = await permissionService.getUserPermissions(userId, organizationId);
      
      const hasRequiredRole = roles.some(role => userPermissions.roles.includes(role));

      if (!hasRequiredRole) {
        res.status(403).json({ 
          success: false, 
          message: `Role required: ${roles.join(' or ')}`,
          requiredRoles: roles
        });
        return;
      }

      next();
    } catch (error: any) {
      logger.error(`[RoleMiddleware] Error checking roles ${roles.join(', ')}:`, error);
      res.status(500).json({ success: false, message: 'Role check failed' });
    }
  };
};

export default new PermissionService();






