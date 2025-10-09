import { Router } from 'express';
import {
  register,
  login,
  logout,
  getProfile,
  refreshToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  enableTwoFactor,
  verifyTwoFactor
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/enable-2fa', authenticate, enableTwoFactor);
router.post('/verify-2fa', authenticate, verifyTwoFactor);

// Protected routes
router.get('/profile', authenticate, (req, res) => getProfile(req as any, res));

export default router;
