import logger from '../utils/logger';
import crypto from 'crypto';

export class MFAService {
  // Generate backup codes for authenticator app
  generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric codes
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  // Generate SMS verification code
  generateSMSCode(): string {
    // Generate 6-digit numeric code
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send SMS code (mock implementation - replace with real SMS service)
  async sendSMSCode(phone: string, code: string): Promise<void> {
    logger.info(`SMS Code for ${phone}: ${code}`);
    
    // In a real implementation, you would integrate with a service like:
    // - Twilio
    // - AWS SNS
    // - SendGrid
    // - MessageBird
    
    // Example Twilio integration:
    /*
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);

    try {
      await client.messages.create({
        body: `Your VeriGrade verification code is: ${code}. This code expires in 10 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone
      });
    } catch (error) {
      logger.error('Failed to send SMS:', error);
      throw new Error('Failed to send SMS code');
    }
    */

    // For development/testing, we'll just log the code
    console.log(`[DEV] SMS Code for ${phone}: ${code}`);
  }

  // Verify SMS code (mock implementation)
  async verifySMSCode(phone: string, code: string): Promise<boolean> {
    // In a real implementation, you would:
    // 1. Store the code in Redis/database with expiration
    // 2. Verify the code against stored value
    // 3. Check expiration time
    
    // For now, we'll accept any 6-digit code for development
    return /^\d{6}$/.test(code);
  }

  // Generate QR code data URL for authenticator app
  async generateQRCode(secret: string, email: string): Promise<string> {
    const QRCode = require('qrcode');
    const otpauthUrl = `otpauth://totp/VeriGrade:${email}?secret=${secret}&issuer=VeriGrade`;
    
    try {
      return await QRCode.toDataURL(otpauthUrl);
    } catch (error) {
      logger.error('Failed to generate QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  // Validate authenticator code
  validateAuthenticatorCode(secret: string, code: string): boolean {
    const speakeasy = require('speakeasy');
    
    try {
      return speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: code,
        window: 2 // Allow 2 time steps (60 seconds) of tolerance
      });
    } catch (error) {
      logger.error('Failed to validate authenticator code:', error);
      return false;
    }
  }

  // Check if user has MFA enabled
  async hasMFAEnabled(userId: string): Promise<boolean> {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    try {
      const mfaFactors = await prisma.mfaFactor.findMany({
        where: { userId, isActive: true }
      });
      
      return mfaFactors.length > 0;
    } catch (error) {
      logger.error('Failed to check MFA status:', error);
      return false;
    } finally {
      await prisma.$disconnect();
    }
  }

  // Get user's MFA methods
  async getUserMFAMethods(userId: string): Promise<any[]> {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    try {
      const mfaFactors = await prisma.mfaFactor.findMany({
        where: { userId, isActive: true },
        select: {
          id: true,
          method: true,
          createdAt: true,
          lastUsed: true
        }
      });
      
      return mfaFactors;
    } catch (error) {
      logger.error('Failed to get MFA methods:', error);
      return [];
    } finally {
      await prisma.$disconnect();
    }
  }

  // Clean up expired MFA setups
  async cleanupExpiredMFASetups(): Promise<void> {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    try {
      // Delete MFA setups that are older than 24 hours and not activated
      const expiredDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      await prisma.mfaFactor.deleteMany({
        where: {
          isActive: false,
          createdAt: {
            lt: expiredDate
          }
        }
      });
      
      logger.info('Cleaned up expired MFA setups');
    } catch (error) {
      logger.error('Failed to cleanup expired MFA setups:', error);
    } finally {
      await prisma.$disconnect();
    }
  }
}

export const mfaService = new MFAService();
