import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/jwtAuth';
import { prisma } from '../config/database';
import { ResponseHandler } from '../utils/response';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { auditService } from '../services/auditService';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';

export const mfaController = {
  // Get MFA status and methods
  getMFAStatus: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;

    const mfaMethods = await prisma.mFAMethod.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    const backupCodes = await prisma.mFABackupCode.findMany({
      where: { userId, isUsed: false },
      orderBy: { createdAt: 'desc' }
    });

    return ResponseHandler.success(res, {
      methods: mfaMethods,
      backupCodes: backupCodes.map(code => ({
        id: code.id,
        isUsed: code.isUsed,
        usedAt: code.usedAt
      }))
    });
  }),

  // Setup MFA method
  setupMFA: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { method } = req.body;
    const userId = req.user!.id;

    if (!['authenticator', 'sms', 'email'].includes(method)) {
      throw new AppError('Invalid MFA method', 400);
    }

    if (method === 'authenticator') {
      // Generate secret for authenticator app
      const secret = speakeasy.generateSecret({
        name: 'VeriGrade',
        account: req.user!.email,
        length: 32
      });

      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

      return ResponseHandler.success(res, {
        qrCode: qrCodeUrl,
        secretKey: secret.base32,
        manualEntryKey: secret.base32
      });
    } else if (method === 'sms') {
      // For SMS, we would typically send a verification code
      // For now, return a mock response
      return ResponseHandler.success(res, {
        message: 'SMS verification code sent'
      });
    } else if (method === 'email') {
      // For email, we would send a verification code
      return ResponseHandler.success(res, {
        message: 'Email verification code sent'
      });
    }
  }),

  // Verify and enable MFA
  verifyMFA: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { method, code, phoneNumber, email } = req.body;
    const userId = req.user!.id;

    if (method === 'authenticator') {
      // Verify TOTP code
      const userSecret = await prisma.mFAMethod.findFirst({
        where: { userId, type: 'authenticator', isActive: false }
      });

      if (!userSecret) {
        throw new AppError('No pending authenticator setup found', 400);
      }

      const verified = speakeasy.totp.verify({
        secret: userSecret.secret,
        encoding: 'base32',
        token: code,
        window: 2
      });

      if (!verified) {
        throw new AppError('Invalid verification code', 400);
      }

      // Activate the MFA method
      await prisma.mFAMethod.update({
        where: { id: userSecret.id },
        data: { isActive: true, isVerified: true }
      });

      // Generate backup codes
      const backupCodes = Array.from({ length: 10 }, () => 
        crypto.randomBytes(4).toString('hex').toUpperCase()
      );

      await prisma.mFABackupCode.createMany({
        data: backupCodes.map(code => ({
          userId,
          code,
          isUsed: false
        }))
      });

      // Log MFA setup
      await auditService.logAction({
        userId,
        action: 'MFA_ENABLED',
        resource: 'MFA',
        resourceId: userSecret.id,
        changes: { method: 'authenticator' }
      });

      return ResponseHandler.success(res, {
        backupCodes
      });
    } else if (method === 'sms') {
      // Verify SMS code (mock implementation)
      if (code !== '123456') {
        throw new AppError('Invalid SMS code', 400);
      }

      // Create SMS MFA method
      const mfaMethod = await prisma.mFAMethod.create({
        data: {
          userId,
          type: 'sms',
          secret: phoneNumber,
          isActive: true,
          isVerified: true
        }
      });

      await auditService.logAction({
        userId,
        action: 'MFA_ENABLED',
        resource: 'MFA',
        resourceId: mfaMethod.id,
        changes: { method: 'sms', phoneNumber }
      });

      return ResponseHandler.success(res, {
        message: 'SMS MFA enabled successfully'
      });
    } else if (method === 'email') {
      // Verify email code (mock implementation)
      if (code !== '123456') {
        throw new AppError('Invalid email code', 400);
      }

      // Create email MFA method
      const mfaMethod = await prisma.mFAMethod.create({
        data: {
          userId,
          type: 'email',
          secret: email,
          isActive: true,
          isVerified: true
        }
      });

      await auditService.logAction({
        userId,
        action: 'MFA_ENABLED',
        resource: 'MFA',
        resourceId: mfaMethod.id,
        changes: { method: 'email', email }
      });

      return ResponseHandler.success(res, {
        message: 'Email MFA enabled successfully'
      });
    }
  }),

  // Disable MFA method
  disableMFA: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { methodId } = req.params;
    const { password } = req.body;
    const userId = req.user!.id;

    // Verify password
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new AppError('Invalid password', 400);
    }

    // Disable MFA method
    await prisma.mFAMethod.update({
      where: { id: methodId, userId },
      data: { isActive: false }
    });

    // Log MFA disable
    await auditService.logAction({
      userId,
      action: 'MFA_DISABLED',
      resource: 'MFA',
      resourceId: methodId,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    return ResponseHandler.success(res, null, 'MFA method disabled successfully');
  }),

  // Generate new backup codes
  generateBackupCodes: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;

    // Invalidate existing backup codes
    await prisma.mFABackupCode.updateMany({
      where: { userId, isUsed: false },
      data: { isUsed: true }
    });

    // Generate new backup codes
    const backupCodes = Array.from({ length: 10 }, () => 
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );

    await prisma.mFABackupCode.createMany({
      data: backupCodes.map(code => ({
        userId,
        code,
        isUsed: false
      }))
    });

    await auditService.logAction({
      userId,
      action: 'MFA_BACKUP_CODES_GENERATED',
      resource: 'MFA',
      changes: { count: backupCodes.length }
    });

    return ResponseHandler.success(res, {
      backupCodes
    });
  }),

  // Verify MFA code during login
  verifyMFACode: asyncHandler(async (req: Request, res: Response) => {
    const { userId, code } = req.body;

    if (!userId || !code) {
      throw new AppError('User ID and code are required', 400);
    }

    // Check if user has MFA enabled
    const mfaMethods = await prisma.mFAMethod.findMany({
      where: { userId, isActive: true, isVerified: true }
    });

    if (mfaMethods.length === 0) {
      throw new AppError('No MFA methods found for user', 400);
    }

    // Check backup codes first
    const backupCode = await prisma.mFABackupCode.findFirst({
      where: { userId, code, isUsed: false }
    });

    if (backupCode) {
      // Mark backup code as used
      await prisma.mFABackupCode.update({
        where: { id: backupCode.id },
        data: { isUsed: true, usedAt: new Date() }
      });

      await auditService.logAction({
        userId,
        action: 'MFA_BACKUP_CODE_USED',
        resource: 'MFA',
        resourceId: backupCode.id
      });

      return ResponseHandler.success(res, {
        verified: true,
        method: 'backup_code'
      });
    }

    // Check authenticator codes
    for (const method of mfaMethods) {
      if (method.type === 'authenticator') {
        const verified = speakeasy.totp.verify({
          secret: method.secret,
          encoding: 'base32',
          token: code,
          window: 2
        });

        if (verified) {
          await auditService.logAction({
            userId,
            action: 'MFA_VERIFIED',
            resource: 'MFA',
            resourceId: method.id,
            changes: { method: 'authenticator' }
          });

          return ResponseHandler.success(res, {
            verified: true,
            method: 'authenticator'
          });
        }
      }
    }

    throw new AppError('Invalid MFA code', 400);
  })
};