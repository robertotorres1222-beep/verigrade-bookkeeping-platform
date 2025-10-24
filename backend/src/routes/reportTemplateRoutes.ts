import express from 'express';
import {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  executeTemplate,
  getExecutionHistory,
  getPredefinedTemplates,
  scheduleTemplate,
  getScheduledTemplates,
  exportTemplate,
} from '../controllers/reportTemplateController';
import { authenticateToken } from '../middleware/auth';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation';

const router = express.Router();

// Get all templates
router.get('/', authenticateToken, getTemplates);

// Get predefined templates
router.get('/predefined', authenticateToken, getPredefinedTemplates);

// Get scheduled templates
router.get('/scheduled', authenticateToken, getScheduledTemplates);

// Get template by ID
router.get(
  '/:id',
  authenticateToken,
  [param('id').isUUID().withMessage('Invalid template ID')],
  validateRequest,
  getTemplate
);

// Create new template
router.post(
  '/',
  authenticateToken,
  [
    body('name').isString().isLength({ min: 1, max: 100 }).withMessage('Name is required'),
    body('description').isString().isLength({ min: 1, max: 500 }).withMessage('Description is required'),
    body('category').isString().isLength({ min: 1, max: 50 }).withMessage('Category is required'),
    body('query').isString().isLength({ min: 1 }).withMessage('Query is required'),
    body('parameters').optional().isObject().withMessage('Parameters must be an object'),
    body('schedule').optional().isObject().withMessage('Schedule must be an object'),
    body('delivery').optional().isObject().withMessage('Delivery must be an object'),
    body('isPublic').optional().isBoolean().withMessage('isPublic must be boolean'),
  ],
  validateRequest,
  createTemplate
);

// Update template
router.put(
  '/:id',
  authenticateToken,
  [
    param('id').isUUID().withMessage('Invalid template ID'),
    body('name').optional().isString().isLength({ min: 1, max: 100 }),
    body('description').optional().isString().isLength({ min: 1, max: 500 }),
    body('category').optional().isString().isLength({ min: 1, max: 50 }),
    body('query').optional().isString().isLength({ min: 1 }),
    body('parameters').optional().isObject(),
    body('schedule').optional().isObject(),
    body('delivery').optional().isObject(),
    body('isPublic').optional().isBoolean(),
  ],
  validateRequest,
  updateTemplate
);

// Delete template
router.delete(
  '/:id',
  authenticateToken,
  [param('id').isUUID().withMessage('Invalid template ID')],
  validateRequest,
  deleteTemplate
);

// Execute template
router.post(
  '/:id/execute',
  authenticateToken,
  [
    param('id').isUUID().withMessage('Invalid template ID'),
    body('parameters').optional().isObject().withMessage('Parameters must be an object'),
  ],
  validateRequest,
  executeTemplate
);

// Get execution history
router.get(
  '/:id/executions',
  authenticateToken,
  [
    param('id').isUUID().withMessage('Invalid template ID'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  ],
  validateRequest,
  getExecutionHistory
);

// Schedule template
router.post(
  '/:id/schedule',
  authenticateToken,
  [
    param('id').isUUID().withMessage('Invalid template ID'),
    body('schedule').isObject().withMessage('Schedule is required'),
    body('delivery').isObject().withMessage('Delivery is required'),
  ],
  validateRequest,
  scheduleTemplate
);

// Export template
router.post(
  '/:id/export',
  authenticateToken,
  [
    param('id').isUUID().withMessage('Invalid template ID'),
    body('parameters').optional().isObject().withMessage('Parameters must be an object'),
    body('format').optional().isIn(['pdf', 'excel', 'json']).withMessage('Format must be pdf, excel, or json'),
  ],
  validateRequest,
  exportTemplate
);

export default router;

