import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { prisma } from '../config/database'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    organizationId: string
    role: string
  }
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        organizationMemberships: {
          where: { isActive: true },
          include: { organization: true }
        }
      }
    })

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid or inactive user' })
    }

    // Get user's primary organization
    const membership = user.organizationMemberships[0]
    if (!membership) {
      return res.status(403).json({ error: 'No active organization membership' })
    }

    req.user = {
      id: user.id,
      email: user.email,
      organizationId: membership.organization.id,
      role: membership.role
    }

    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({ error: 'Invalid token' })
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(403).json({ error: 'Token expired' })
    }
    return res.status(500).json({ error: 'Authentication failed' })
  }
}

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: roles,
        current: req.user.role
      })
    }

    next()
  }
}

export const requireOrganizationAccess = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  const organizationId = req.params.organizationId || req.body.organizationId

  if (!organizationId) {
    return res.status(400).json({ error: 'Organization ID required' })
  }

  if (req.user.organizationId !== organizationId) {
    return res.status(403).json({ error: 'Access denied to organization' })
  }

  next()
}


