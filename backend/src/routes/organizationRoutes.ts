import { Router } from 'express';
import { 
  createOrganization,
  getOrganization,
  getOrganizationHierarchy,
  updateOrganizationSettings,
  updateOrganizationBranding,
  addUserToOrganization,
  getOrganizationUsers,
  createOrganizationRole,
  getOrganizationRoles,
  createInterCompanyTransaction,
  approveInterCompanyTransaction,
  getInterCompanyTransactions,
  getConsolidatedReport
} from '../controllers/organizationController';
import { authenticateToken } from '../middleware/auth';
import { requirePermission, requireRole } from '../middleware/permissions';

const router = Router();

// Create organization
router.post('/', authenticateToken, requireRole(['admin']), createOrganization);

// Get organization
router.get('/:organizationId', authenticateToken, requirePermission('organization:read'), getOrganization);

// Get organization hierarchy
router.get('/:organizationId/hierarchy', authenticateToken, requirePermission('organization:read'), getOrganizationHierarchy);

// Update organization settings
router.put('/:organizationId/settings', authenticateToken, requirePermission('organization:write'), updateOrganizationSettings);

// Update organization branding
router.put('/:organizationId/branding', authenticateToken, requirePermission('organization:branding'), updateOrganizationBranding);

// Add user to organization
router.post('/:organizationId/users', authenticateToken, requirePermission('users:write'), addUserToOrganization);

// Get organization users
router.get('/:organizationId/users', authenticateToken, requirePermission('users:read'), getOrganizationUsers);

// Create organization role
router.post('/:organizationId/roles', authenticateToken, requirePermission('users:write'), createOrganizationRole);

// Get organization roles
router.get('/:organizationId/roles', authenticateToken, requirePermission('users:read'), getOrganizationRoles);

// Create inter-company transaction
router.post('/:organizationId/inter-company', authenticateToken, requirePermission('transactions:write'), createInterCompanyTransaction);

// Approve inter-company transaction
router.post('/inter-company/:transactionId/approve', authenticateToken, requirePermission('transactions:approve'), approveInterCompanyTransaction);

// Get inter-company transactions
router.get('/:organizationId/inter-company', authenticateToken, requirePermission('transactions:read'), getInterCompanyTransactions);

// Get consolidated report
router.post('/consolidated-report', authenticateToken, requirePermission('reports:read'), getConsolidatedReport);

export default router;