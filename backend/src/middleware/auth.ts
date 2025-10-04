import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { CustomError } from './errorHandler';

export interface AuthenticatedUser {
  id: string;
  email: string;
  organizationId?: string;
  role?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authenticate = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies['token'];

    if (!token) {
      throw new CustomError('Access denied. No token provided.', 401);
    }

    const decoded = jwt.verify(token, process.env['JWT_SECRET']!) as any;
    
    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
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
                isActive: true
              }
            }
          }
        }
      }
    });

    if (!user || !user.isActive) {
      throw new CustomError('Invalid token. User not found or inactive.', 401);
    }

    // Set user info in request
    req.user = {
      id: user.id,
      email: user.email,
      organizationId: user.organizationMemberships[0]?.organizationId || '',
      role: user.organizationMemberships[0]?.role || 'MEMBER',
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new CustomError('Invalid token.', 401));
    } else {
      next(error);
    }
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new CustomError('Authentication required.', 401);
    }

    if (!req.user.role || !roles.includes(req.user.role)) {
      throw new CustomError('Insufficient permissions.', 403);
    }

    next();
  };
};

export const requireOrganization = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.user?.organizationId) {
    throw new CustomError('Organization membership required.', 403);
  }
  next();
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies['token'];

    if (token) {
      await authenticate(req, res, next);
    } else {
      next();
    }
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};
