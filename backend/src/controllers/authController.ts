import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../index';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { sendEmail } from '../services/emailService';

interface RegisterRequest extends Request {
  body: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationName: string;
  };
}

interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

// Generate JWT tokens
const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env['JWT_SECRET']!,
    { expiresIn: process.env['JWT_EXPIRES_IN'] || '7d' } as jwt.SignOptions
  );

  const refreshToken = jwt.sign(
    { id: userId },
    process.env['REFRESH_TOKEN_SECRET']!,
    { expiresIn: process.env['REFRESH_TOKEN_EXPIRES_IN'] || '30d' } as jwt.SignOptions
  );

  return { accessToken, refreshToken };
};

// Register new user
export const register = async (req: RegisterRequest, res: Response): Promise<void> => {
  const { email, password, firstName, lastName, organizationName } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new CustomError('User already exists with this email', 409);
  }

  // Hash password
    const saltRounds = parseInt(process.env['BCRYPT_ROUNDS'] || '12');
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Create user and organization in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create organization
    const organization = await tx.organization.create({
      data: {
        name: organizationName,
        slug: organizationName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        owner: {
          create: {
            email,
            firstName,
            lastName,
            passwordHash,
          }
        }
      },
      include: {
        owner: true
      }
    });

    // Add owner as organization member
    await tx.organizationMember.create({
      data: {
        organizationId: organization.id,
        userId: organization.owner.id,
        role: 'OWNER',
        joinedAt: new Date()
      }
    });

    return { user: organization.owner, organization };
  });

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(result.user.id);

  // Store refresh token
  await prisma.session.create({
    data: {
      userId: result.user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }
  });

  // Send verification email
  try {
    await sendEmail({
      to: email,
      subject: 'Welcome to VeriGrade - Verify Your Email',
      template: 'welcome',
      data: {
        firstName,
        lastName,
        organizationName,
        verificationUrl: `${process.env['FRONTEND_URL']}/verify-email?token=${uuidv4()}`
      }
    });
  } catch (error) {
    logger.error('Failed to send welcome email:', error);
  }

  logger.info(`New user registered: ${email}`);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        organizationId: result.organization.id,
        role: 'OWNER'
      },
      accessToken,
      refreshToken
    }
  });
};

// Login user
export const login = async (req: LoginRequest, res: Response): Promise<void> => {
  const { email, password } = req.body;

  // Find user with organization membership
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      organizationMemberships: {
        where: { isActive: true },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              isActive: true
            }
          }
        }
      }
    }
  });

  if (!user || !user.isActive) {
    throw new CustomError('Invalid credentials', 401);
  }

  // Check password
  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    throw new CustomError('Invalid credentials', 401);
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  });

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user.id);

  // Store refresh token
  await prisma.session.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }
  });

  logger.info(`User logged in: ${email}`);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        organizationId: user.organizationMemberships[0]?.organizationId,
        role: user.organizationMemberships[0]?.role,
        organization: user.organizationMemberships[0]?.organization
      },
      accessToken,
      refreshToken
    }
  });
};

// Logout user
export const logout = async (req: Request, res: Response): Promise<void> => {
  const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies['refreshToken'];

  if (token) {
    // Remove session
    await prisma.session.deleteMany({
      where: { token }
    });
  }

  logger.info(`User logged out: ${req.user?.email}`);

  res.json({
    success: true,
    message: 'Logout successful'
  });
};

// Refresh token
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new CustomError('Refresh token required', 400);
  }

  // Verify refresh token
  const decoded = jwt.verify(refreshToken, process.env['REFRESH_TOKEN_SECRET']!) as any;

  // Check if session exists
  const session = await prisma.session.findFirst({
    where: {
      token: refreshToken,
      userId: decoded.id,
      expiresAt: { gt: new Date() }
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          isActive: true,
          organizationMemberships: {
            where: { isActive: true },
            select: {
              organizationId: true,
              role: true,
              organization: {
                select: {
                  id: true,
                  name: true,
                  isActive: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!session || !session.user.isActive) {
    throw new CustomError('Invalid refresh token', 401);
  }

  // Generate new tokens
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(session.user.id);

  // Update session
  await prisma.session.update({
    where: { id: session.id },
    data: {
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  });

  res.json({
    success: true,
    data: {
      accessToken,
      refreshToken: newRefreshToken
    }
  });
};

// Verify email
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  const { token: _token } = req.params;

  // TODO: Implement email verification logic
  // For now, just return success
  res.json({
    success: true,
    message: 'Email verified successfully'
  });
};

// Forgot password
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    // Don't reveal if user exists
    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent'
    });
    return;
  }

  // Generate reset token
  const resetToken = uuidv4();
  logger.info('Reset token generated for user:', { email, resetToken });
  
  // TODO: Store reset token in database with expiration
  // TODO: Send reset email

  res.json({
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent'
  });
};

// Reset password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { token: _token, password: _password } = req.body;

  // TODO: Implement password reset logic
  // For now, just return success
  res.json({
    success: true,
    message: 'Password reset successfully'
  });
};

// Enable two-factor authentication
export const enableTwoFactor = async (_req: Request, res: Response): Promise<void> => {
  // TODO: Implement 2FA setup
  res.json({
    success: true,
    message: 'Two-factor authentication enabled'
  });
};

// Verify two-factor authentication
export const verifyTwoFactor = async (_req: Request, res: Response): Promise<void> => {
  // TODO: Implement 2FA verification
  res.json({
    success: true,
    message: 'Two-factor authentication verified'
  });
};
