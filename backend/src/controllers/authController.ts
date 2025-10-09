import { Request, Response } from 'express'
import { AuthenticatedRequest } from '../middleware/jwtAuth'
import * as authService from '../services/authService'
import { auditService } from '../services/auditService'
import { prisma } from '../config/database'
import bcrypt from 'bcryptjs'

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName, company, phone } = req.body

      // Validate required fields
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({
          error: 'Missing required fields: email, password, firstName, lastName'
        })
      }

      // Validate password strength
      if (password.length < 8) {
        return res.status(400).json({
          error: 'Password must be at least 8 characters long'
        })
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

      return res.status(201).json({
        message: 'User registered successfully. Please check your email to verify your account.',
        user: result.user,
        organization: result.organization
      })
    } catch (error: any) {
      console.error('Registration error:', error)
      res.status(400).json({ error: error.message })
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body

      if (!email || !password) {
        return res.status(400).json({
          error: 'Email and password are required'
        })
      }

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

      return res.json({
        message: 'Login successful',
        token: result.token,
        user: result.user,
        organization: result.organization
      })
    } catch (error: any) {
      console.error('Login error:', error)
      res.status(401).json({ error: error.message })
    }
  },

  async logout(req: AuthenticatedRequest, res: Response) {
    try {
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

      return res.json({ message: 'Logout successful' })
    } catch (error: any) {
      console.error('Logout error:', error)
      res.status(500).json({ error: 'Logout failed' })
    }
  },

  async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.body

      if (!token) {
        return res.status(400).json({ error: 'Verification token is required' })
      }

      await authService.verifyEmail(token)

      return res.json({ message: 'Email verified successfully' })
    } catch (error: any) {
      console.error('Email verification error:', error)
      res.status(400).json({ error: error.message })
    }
  },

  async refreshToken(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1]

      if (!token) {
        return res.status(401).json({ error: 'Token is required' })
      }

      const result = await authService.refreshToken(token)

      return res.json({
        message: 'Token refreshed successfully',
        token: result.token
      })
    } catch (error: any) {
      console.error('Token refresh error:', error)
      res.status(401).json({ error: error.message })
    }
  },

  async me(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' })
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
        return res.status(404).json({ error: 'User not found' })
      }

      const membership = user.organizationMemberships[0]

      return res.json({
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
    } catch (error: any) {
      console.error('Get user profile error:', error)
      res.status(500).json({ error: 'Failed to get user profile' })
    }
  },

  async changePassword(req: AuthenticatedRequest, res: Response) {
    try {
      const { currentPassword, newPassword } = req.body

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          error: 'Current password and new password are required'
        })
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          error: 'New password must be at least 8 characters long'
        })
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user!.id }
      })

      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash)
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Current password is incorrect' })
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

      return res.json({ message: 'Password changed successfully' })
    } catch (error: any) {
      console.error('Change password error:', error)
      res.status(500).json({ error: 'Failed to change password' })
    }
  }
}