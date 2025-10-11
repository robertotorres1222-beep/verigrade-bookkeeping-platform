import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../config/database'
import { sendEmail } from './emailService'

const SALT_ROUNDS = 12
const JWT_SECRET = process.env.JWT_SECRET!
const JWT_EXPIRES_IN = '7d'

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  company?: string
  phone?: string
}

export interface LoginData {
  email: string
  password: string
}

export const registerUser = async (data: RegisterData) => {
  const { email, password, firstName, lastName, company, phone } = data

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  })

  if (existingUser) {
    throw new Error('User with this email already exists')
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

  // Create user and organization
  const result = await prisma.$transaction(async (tx) => {
    // Create user
    const user = await tx.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        phone,
        isActive: true,
        emailVerified: false
      }
    })

    // Create organization
    const organization = await tx.organization.create({
      data: {
        name: company || `${firstName} ${lastName}'s Organization`,
        slug: `${firstName.toLowerCase()}-${lastName.toLowerCase()}-${Date.now()}`,
        ownerId: user.id,
        currency: 'USD',
        timezone: 'UTC'
      }
    })

    // Create organization membership
    await tx.organizationMember.create({
      data: {
        organizationId: organization.id,
        userId: user.id,
        role: 'OWNER',
        joinedAt: new Date()
      }
    })

    return { user, organization }
  })

  // Generate verification token
  const verificationToken = jwt.sign(
    { userId: result.user.id, type: 'email_verification' },
    JWT_SECRET,
    { expiresIn: '24h' }
  )

  // Send verification email
  await sendEmail({
    to: result.user.email,
    subject: 'Verify your VeriGrade account',
    template: 'email-verification',
    data: {
      firstName: result.user.firstName,
      verificationLink: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`
    }
  })

  return {
    user: {
      id: result.user.id,
      email: result.user.email,
      firstName: result.user.firstName,
      lastName: result.user.lastName,
      isActive: result.user.isActive,
      emailVerified: result.user.emailVerified
    },
    organization: result.organization
  }
}

export const loginUser = async (data: LoginData) => {
  const { email, password } = data

  // Find user with organization
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: {
      organizationMemberships: {
        where: { isActive: true },
        include: { organization: true }
      }
    }
  })

  if (!user || !user.isActive) {
    throw new Error('Invalid credentials')
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.passwordHash)
  if (!isValidPassword) {
    throw new Error('Invalid credentials')
  }

  // Get primary organization
  const membership = user.organizationMemberships[0]
  if (!membership) {
    throw new Error('No active organization membership')
  }

  // Generate JWT token
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      organizationId: membership.organization.id,
      role: membership.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )

  // Create session
  await prisma.session.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }
  })

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  })

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      emailVerified: user.emailVerified
    },
    organization: membership.organization
  }
}

export const verifyEmail = async (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    
    if (decoded.type !== 'email_verification') {
      throw new Error('Invalid token type')
    }

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { emailVerified: true }
    })

    return { success: true }
  } catch (error) {
    throw new Error('Invalid or expired verification token')
  }
}

export const logoutUser = async (token: string) => {
  await prisma.session.deleteMany({
    where: { token }
  })
}

export const refreshToken = async (token: string) => {
  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: {
        include: {
          organizationMemberships: {
            where: { isActive: true },
            include: { organization: true }
          }
        }
      }
    }
  })

  if (!session || session.expiresAt < new Date()) {
    throw new Error('Invalid or expired session')
  }

  const membership = session.user.organizationMemberships[0]
  if (!membership) {
    throw new Error('No active organization membership')
  }

  // Generate new token
  const newToken = jwt.sign(
    {
      userId: session.user.id,
      email: session.user.email,
      organizationId: membership.organization.id,
      role: membership.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )

  // Update session
  await prisma.session.update({
    where: { id: session.id },
    data: {
      token: newToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  })

  return { token: newToken }
}




