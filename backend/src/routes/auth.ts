import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, logout, refreshToken, verifyEmail, forgotPassword, resetPassword, enableTwoFactor, verifyTwoFactor } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Register
router.post('/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('firstName').trim().isLength({ min: 1 }),
    body('lastName').trim().isLength({ min: 1 }),
    body('organizationName').trim().isLength({ min: 1 }),
  ],
  validateRequest,
  asyncHandler(register)
);

// Login
router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  validateRequest,
  asyncHandler(login)
);

// Logout
router.post('/logout', authenticate, asyncHandler(logout));

// Refresh token
router.post('/refresh', asyncHandler(refreshToken));

// Verify email
router.get('/verify-email/:token', asyncHandler(verifyEmail));

// Forgot password
router.post('/forgot-password',
  [
    body('email').isEmail().normalizeEmail(),
  ],
  validateRequest,
  asyncHandler(forgotPassword)
);

// Reset password
router.post('/reset-password',
  [
    body('token').notEmpty(),
    body('password').isLength({ min: 8 }),
  ],
  validateRequest,
  asyncHandler(resetPassword)
);

// Enable two-factor authentication
router.post('/2fa/enable', authenticate, asyncHandler(enableTwoFactor));

// Verify two-factor authentication
router.post('/2fa/verify',
  [
    body('token').notEmpty(),
    body('code').isLength({ min: 6, max: 6 }),
  ],
  validateRequest,
  asyncHandler(verifyTwoFactor)
);

export default router;
