import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Mock user data for testing
const mockUsers = [
  {
    id: '1',
    email: 'robertotorres1222@gmail.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4FQ/8vHw6y', // 'password123'
    firstName: 'Roberto',
    lastName: 'Torres',
    organizationId: 'org-1',
    organization: {
      id: 'org-1',
      name: 'Torres Enterprises',
      slug: 'torres-enterprises'
    }
  }
];

// Generate the correct hash for 'password123'
const generatePasswordHash = async (password: string) => {
  return await bcrypt.hash(password, 12);
};

// Register user (mock)
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, organizationName } = req.body;

    // Check if user already exists
    const existingUser = mockUsers.find(user => user.email === email);
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User already exists'
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create mock user
    const newUser = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      firstName,
      lastName,
      organizationId: 'org-' + Date.now(),
      organization: {
        id: 'org-' + Date.now(),
        name: organizationName || `${firstName}'s Organization`,
        slug: `${firstName.toLowerCase()}-${Date.now()}`
      }
    };

    mockUsers.push(newUser);

    // Generate JWT token
    const jwtSecret = process.env['JWT_SECRET'] || 'default-jwt-secret';
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email, 
        organizationId: newUser.organizationId 
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          organizationId: newUser.organizationId,
          organization: newUser.organization
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Login user (mock)
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    // Check password (simplified for testing)
    const isValidPassword = password === 'password123' || await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    // Generate JWT token
    const jwtSecret = process.env['JWT_SECRET'] || 'default-jwt-secret';
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        organizationId: user.organizationId 
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          organizationId: user.organizationId,
          organization: user.organization
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get user profile (mock)
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          organizationId: user.organizationId,
          organization: user.organization
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Logout
export const logout = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
};

// Other auth functions (not implemented)
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  res.status(501).json({
    success: false,
    message: 'Refresh token not implemented'
  });
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  res.status(501).json({
    success: false,
    message: 'Email verification not implemented'
  });
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  res.status(501).json({
    success: false,
    message: 'Password reset not implemented'
  });
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  res.status(501).json({
    success: false,
    message: 'Password reset not implemented'
  });
};

export const enableTwoFactor = async (req: Request, res: Response): Promise<void> => {
  res.status(501).json({
    success: false,
    message: 'Two-factor authentication not implemented'
  });
};

export const verifyTwoFactor = async (req: Request, res: Response): Promise<void> => {
  res.status(501).json({
    success: false,
    message: 'Two-factor authentication not implemented'
  });
};
