import { Request, Response } from 'express'
import { AuthenticatedRequest } from '../middleware/jwtAuth'
import * as authService from '../services/authService'
import { auditService } from '../services/auditService'
import { prisma } from '../config/database'
import bcrypt from 'bcryptjs'
import { ResponseHandler } from '../utils/response'
import { asyncHandler, AppError } from '../middleware/errorHandler'
import { validateUserRegistration, validateUserLogin } from '../middleware/validation'

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const { email, password, firstName, lastName, company, phone } = req.body

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      throw new AppError('User with this email already exists', 409)
    }

    const result = await authService.registerUser({
      email,
      password,
      firstName,
      lastName,
      company,
      phone
    })

    // Log registration
    await auditService.logAction({
      userId: result.user.id,
      action: 'USER_REGISTERED',
      resource: 'User',
      resourceId: result.user.id,
      changes: { email, firstName, lastName }
    })

    return ResponseHandler.created(res, {
      user: result.user,
      organization: result.organization
    }, 'User registered successfully. Please check your email to verify your account.')
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body

    const result = await authService.loginUser({ email, password })

    // Log login
    await auditService.logAction({
      userId: result.user.id,
      action: 'USER_LOGIN',
      resource: 'User',
      resourceId: result.user.id,
      ipAddress: req.ip || undefined,
      userAgent: req.get('User-Agent') || undefined
    })

    return ResponseHandler.success(res, {
      token: result.token,
      user: result.user,
      organization: result.organization
    }, 'Login successful')
  }),

  logout: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const token = req.headers.authorization?.split(' ')[1]
    
    if (token) {
      await authService.logoutUser(token)
    }

    // Log logout
    if (req.user) {
      await auditService.logAction({
        userId: req.user.id,
        action: 'USER_LOGOUT',
        resource: 'User',
        resourceId: req.user.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      })
    }

    return ResponseHandler.success(res, null, 'Logout successful')
  }),

  verifyEmail: asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.body

    if (!token) {
      throw new AppError('Verification token is required', 400)
    }

    await authService.verifyEmail(token)

    return ResponseHandler.success(res, null, 'Email verified successfully')
  }),

  refreshToken: asyncHandler(async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      throw new AppError('Token is required', 401)
    }

    const result = await authService.refreshToken(token)

    return ResponseHandler.success(res, {
      token: result.token
    }, 'Token refreshed successfully')
  }),

  me: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('Not authenticated', 401)
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        organizationMemberships: {
          where: { isActive: true },
          include: { organization: true }
        }
      }
    })

    if (!user) {
      throw new AppError('User not found', 404)
    }

    const membership = user.organizationMemberships[0]

    return ResponseHandler.success(res, {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt
      },
      organization: membership?.organization,
      role: membership?.role
    })
  }),

  changePassword: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      throw new AppError('Current password and new password are required', 400)
    }

    if (newPassword.length < 8) {
      throw new AppError('New password must be at least 8 characters long', 400)
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    })

    if (!user) {
      throw new AppError('User not found', 404)
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isValidPassword) {
      throw new AppError('Current password is incorrect', 400)
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12)

    // Update password
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { passwordHash }
    })

    // Log password change
    await auditService.logAction({
      userId: req.user!.id,
      action: 'PASSWORD_CHANGED',
      resource: 'User',
      resourceId: req.user!.id,
      ipAddress: req.ip || undefined,
      userAgent: req.get('User-Agent') || undefined
    })

    return ResponseHandler.success(res, null, 'Password changed successfully')
  })
}