import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: errors.array(),
      },
    });
  }
  return next();
};

// Common validation rules
export const validateId = [
  param('id').isUUID().withMessage('Invalid ID format'),
  handleValidationErrors,
];

export const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  handleValidationErrors,
];

export const validateUserRegistration = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
  handleValidationErrors,
];

export const validateUserLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

export const validatePractice = [
  body('name').trim().isLength({ min: 1 }).withMessage('Practice name is required'),
  body('description').optional().trim(),
  body('brandColor').optional().isHexColor().withMessage('Invalid brand color format'),
  handleValidationErrors,
];

export const validateClient = [
  body('name').trim().isLength({ min: 1 }).withMessage('Client name is required'),
  body('industry').optional().trim(),
  body('size').optional().isIn(['SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE']).withMessage('Invalid size'),
  body('engagementType').optional().isIn(['BOOKKEEPING', 'TAX_PREPARATION', 'ADVISORY', 'FULL_SERVICE']).withMessage('Invalid engagement type'),
  body('monthlyFee').optional().isFloat({ min: 0 }).withMessage('Monthly fee must be a positive number'),
  handleValidationErrors,
];

export const validateTask = [
  body('title').trim().isLength({ min: 1 }).withMessage('Task title is required'),
  body('description').optional().trim(),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).withMessage('Invalid priority'),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
  body('assignedTo').isUUID().withMessage('Valid assigned user ID is required'),
  handleValidationErrors,
];

export const validateNote = [
  body('content').trim().isLength({ min: 1 }).withMessage('Note content is required'),
  body('isInternal').optional().isBoolean().withMessage('isInternal must be a boolean'),
  handleValidationErrors,
];

export const validatePromptExecution = [
  body('promptId').isUUID().withMessage('Valid prompt ID is required'),
  body('inputData').isObject().withMessage('Input data must be an object'),
  handleValidationErrors,
];