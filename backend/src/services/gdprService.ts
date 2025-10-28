import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';
import logger from '../utils/logger';

export interface DataSubject {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  organizationId?: string;
  dataTypes: string[];
  lastActivity?: Date;
  consentGiven?: Date;
  consentWithdrawn?: Date;
}

export interface DataExport {
  id: string;
  dataSubjectId: string;
  requestDate: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  expiresAt: Date;
  dataTypes: string[];
  fileSize?: number;
  checksum?: string;
}

export interface DataRetentionPolicy {
  id: string;
  dataType: string;
  retentionPeriod: number; // in days
  autoDelete: boolean;
  anonymizeAfter: boolean;
  legalBasis: string;
  description: string;
}

export interface ConsentRecord {
  id: string;
  dataSubjectId: string;
  purpose: string;
  legalBasis: string;
  givenAt: Date;
  withdrawnAt?: Date;
  isActive: boolean;
  metadata: any;
}

export interface DataProcessingActivity {
  id: string;
  name: string;
  purpose: string;
  legalBasis: string;
  dataTypes: string[];
  recipients: string[];
  retentionPeriod: number;
  securityMeasures: string[];
  isActive: boolean;
}

class GDPRService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
    logger.info('[GDPRService] Initialized');
  }

  /**
   * Creates a data subject record
   */
  public async createDataSubject(
    email: string,
    firstName?: string,
    lastName?: string,
    organizationId?: string
  ): Promise<DataSubject> {
    try {
      const dataSubject = await this.prisma.dataSubject.create({
        data: {
          email,
          firstName,
          lastName,
          organizationId,
          dataTypes: ['personal', 'contact', 'usage'],
          consentGiven: new Date()
        }
      });

      logger.info(`[GDPRService] Created data subject ${dataSubject.id} for ${email}`);
      return dataSubject as DataSubject;
    } catch (error: any) {
      logger.error('[GDPRService] Error creating data subject:', error);
      throw new Error(`Failed to create data subject: ${error.message}`);
    }
  }

  /**
   * Gets data subject by email
   */
  public async getDataSubjectByEmail(email: string): Promise<DataSubject | null> {
    try {
      const dataSubject = await this.prisma.dataSubject.findFirst({
        where: { email }
      });

      return dataSubject as DataSubject | null;
    } catch (error: any) {
      logger.error(`[GDPRService] Error getting data subject by email ${email}:`, error);
      throw new Error(`Failed to get data subject: ${error.message}`);
    }
  }

  /**
   * Requests data export
   */
  public async requestDataExport(
    dataSubjectId: string,
    dataTypes: string[] = ['all']
  ): Promise<DataExport> {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days to download

      const dataExport = await this.prisma.dataExport.create({
        data: {
          dataSubjectId,
          requestDate: new Date(),
          status: 'pending',
          expiresAt,
          dataTypes
        }
      });

      // Start background processing
      this.processDataExport(dataExport.id);

      logger.info(`[GDPRService] Created data export request ${dataExport.id} for data subject ${dataSubjectId}`);
      return dataExport as DataExport;
    } catch (error: any) {
      logger.error('[GDPRService] Error requesting data export:', error);
      throw new Error(`Failed to request data export: ${error.message}`);
    }
  }

  /**
   * Processes data export in background
   */
  private async processDataExport(exportId: string): Promise<void> {
    try {
      // Update status to processing
      await this.prisma.dataExport.update({
        where: { id: exportId },
        data: { status: 'processing' }
      });

      const dataExport = await this.prisma.dataExport.findUnique({
        where: { id: exportId }
      });

      if (!dataExport) {
        throw new Error('Data export not found');
      }

      // Collect all data for the data subject
      const allData = await this.collectDataSubjectData(dataExport.dataSubjectId, dataExport.dataTypes);

      // Generate export file
      const exportData = {
        dataSubject: await this.prisma.dataSubject.findUnique({
          where: { id: dataExport.dataSubjectId }
        }),
        personalData: allData.personalData,
        usageData: allData.usageData,
        communicationData: allData.communicationData,
        financialData: allData.financialData,
        exportMetadata: {
          exportDate: new Date().toISOString(),
          dataTypes: dataExport.dataTypes,
          recordCount: allData.totalRecords
        }
      };

      // Save to file (in real implementation, this would be saved to secure storage)
      const fileName = `data-export-${exportId}.json`;
      const fileSize = JSON.stringify(exportData).length;
      const checksum = crypto.createHash('sha256').update(JSON.stringify(exportData)).digest('hex');

      // Update export with file information
      await this.prisma.dataExport.update({
        where: { id: exportId },
        data: {
          status: 'completed',
          downloadUrl: `/api/gdpr/exports/${exportId}/download`,
          fileSize,
          checksum
        }
      });

      logger.info(`[GDPRService] Completed data export ${exportId}`);
    } catch (error: any) {
      logger.error(`[GDPRService] Error processing data export ${exportId}:`, error);
      
      await this.prisma.dataExport.update({
        where: { id: exportId },
        data: { status: 'failed' }
      });
    }
  }

  /**
   * Collects all data for a data subject
   */
  private async collectDataSubjectData(
    dataSubjectId: string,
    dataTypes: string[]
  ): Promise<{
    personalData: any[];
    usageData: any[];
    communicationData: any[];
    financialData: any[];
    totalRecords: number;
  }> {
    const result = {
      personalData: [],
      usageData: [],
      communicationData: [],
      financialData: [],
      totalRecords: 0
    };

    try {
      // Get data subject info
      const dataSubject = await this.prisma.dataSubject.findUnique({
        where: { id: dataSubjectId }
      });

      if (dataSubject) {
        result.personalData.push({
          type: 'data_subject_record',
          data: dataSubject
        });
      }

      // Collect user data
      if (dataTypes.includes('all') || dataTypes.includes('personal')) {
        const users = await this.prisma.user.findMany({
          where: { email: dataSubject?.email }
        });
        result.personalData.push(...users.map(user => ({
          type: 'user_record',
          data: user
        })));
      }

      // Collect audit logs
      if (dataTypes.includes('all') || dataTypes.includes('usage')) {
        const auditEvents = await this.prisma.auditEvent.findMany({
          where: { userId: dataSubjectId }
        });
        result.usageData.push(...auditEvents.map(event => ({
          type: 'audit_event',
          data: event
        })));
      }

      // Collect messages
      if (dataTypes.includes('all') || dataTypes.includes('communication')) {
        const messages = await this.prisma.clientMessage.findMany({
          where: { 
            OR: [
              { fromUserId: dataSubjectId },
              { clientId: dataSubjectId }
            ]
          }
        });
        result.communicationData.push(...messages.map(message => ({
          type: 'message',
          data: message
        })));
      }

      // Collect financial data
      if (dataTypes.includes('all') || dataTypes.includes('financial')) {
        const invoices = await this.prisma.clientInvoice.findMany({
          where: { clientId: dataSubjectId }
        });
        result.financialData.push(...invoices.map(invoice => ({
          type: 'invoice',
          data: invoice
        })));
      }

      result.totalRecords = result.personalData.length + result.usageData.length + 
                           result.communicationData.length + result.financialData.length;

      return result;
    } catch (error: any) {
      logger.error('[GDPRService] Error collecting data subject data:', error);
      throw new Error(`Failed to collect data subject data: ${error.message}`);
    }
  }

  /**
   * Requests data deletion (Right to be forgotten)
   */
  public async requestDataDeletion(
    dataSubjectId: string,
    reason: string,
    legalBasis: string
  ): Promise<{
    requestId: string;
    status: string;
    estimatedCompletion: Date;
  }> {
    try {
      const requestId = crypto.randomUUID();
      const estimatedCompletion = new Date();
      estimatedCompletion.setDate(estimatedCompletion.getDate() + 7); // 7 days processing time

      // Create deletion request
      await this.prisma.dataDeletionRequest.create({
        data: {
          id: requestId,
          dataSubjectId,
          reason,
          legalBasis,
          requestDate: new Date(),
          status: 'pending',
          estimatedCompletion
        }
      });

      // Start background deletion process
      this.processDataDeletion(requestId);

      logger.info(`[GDPRService] Created data deletion request ${requestId} for data subject ${dataSubjectId}`);
      return {
        requestId,
        status: 'pending',
        estimatedCompletion
      };
    } catch (error: any) {
      logger.error('[GDPRService] Error requesting data deletion:', error);
      throw new Error(`Failed to request data deletion: ${error.message}`);
    }
  }

  /**
   * Processes data deletion in background
   */
  private async processDataDeletion(requestId: string): Promise<void> {
    try {
      const deletionRequest = await this.prisma.dataDeletionRequest.findUnique({
        where: { id: requestId }
      });

      if (!deletionRequest) {
        throw new Error('Deletion request not found');
      }

      // Update status to processing
      await this.prisma.dataDeletionRequest.update({
        where: { id: requestId },
        data: { status: 'processing' }
      });

      const dataSubjectId = deletionRequest.dataSubjectId;

      // Delete personal data
      await this.prisma.user.deleteMany({
        where: { email: { contains: dataSubjectId } }
      });

      // Anonymize audit events
      await this.prisma.auditEvent.updateMany({
        where: { userId: dataSubjectId },
        data: {
          userId: 'ANONYMIZED',
          oldValues: null,
          newValues: null,
          metadata: { anonymized: true, originalUserId: dataSubjectId }
        }
      });

      // Delete messages
      await this.prisma.clientMessage.deleteMany({
        where: { 
          OR: [
            { fromUserId: dataSubjectId },
            { clientId: dataSubjectId }
          ]
        }
      });

      // Anonymize financial data (keep for legal requirements but remove personal identifiers)
      await this.prisma.clientInvoice.updateMany({
        where: { clientId: dataSubjectId },
        data: {
          clientId: 'ANONYMIZED',
          metadata: { anonymized: true, originalClientId: dataSubjectId }
        }
      });

      // Update deletion request status
      await this.prisma.dataDeletionRequest.update({
        where: { id: requestId },
        data: {
          status: 'completed',
          completedAt: new Date()
        }
      });

      logger.info(`[GDPRService] Completed data deletion request ${requestId}`);
    } catch (error: any) {
      logger.error(`[GDPRService] Error processing data deletion ${requestId}:`, error);
      
      await this.prisma.dataDeletionRequest.update({
        where: { id: requestId },
        data: { status: 'failed' }
      });
    }
  }

  /**
   * Records consent
   */
  public async recordConsent(
    dataSubjectId: string,
    purpose: string,
    legalBasis: string,
    metadata: any = {}
  ): Promise<ConsentRecord> {
    try {
      const consentRecord = await this.prisma.consentRecord.create({
        data: {
          dataSubjectId,
          purpose,
          legalBasis,
          givenAt: new Date(),
          isActive: true,
          metadata
        }
      });

      logger.info(`[GDPRService] Recorded consent for data subject ${dataSubjectId}`);
      return consentRecord as ConsentRecord;
    } catch (error: any) {
      logger.error('[GDPRService] Error recording consent:', error);
      throw new Error(`Failed to record consent: ${error.message}`);
    }
  }

  /**
   * Withdraws consent
   */
  public async withdrawConsent(
    dataSubjectId: string,
    purpose: string
  ): Promise<boolean> {
    try {
      await this.prisma.consentRecord.updateMany({
        where: {
          dataSubjectId,
          purpose,
          isActive: true
        },
        data: {
          withdrawnAt: new Date(),
          isActive: false
        }
      });

      logger.info(`[GDPRService] Withdrawn consent for data subject ${dataSubjectId}, purpose: ${purpose}`);
      return true;
    } catch (error: any) {
      logger.error('[GDPRService] Error withdrawing consent:', error);
      return false;
    }
  }

  /**
   * Gets consent status
   */
  public async getConsentStatus(dataSubjectId: string): Promise<ConsentRecord[]> {
    try {
      const consentRecords = await this.prisma.consentRecord.findMany({
        where: { dataSubjectId },
        orderBy: { givenAt: 'desc' }
      });

      return consentRecords as ConsentRecord[];
    } catch (error: any) {
      logger.error(`[GDPRService] Error getting consent status for ${dataSubjectId}:`, error);
      throw new Error(`Failed to get consent status: ${error.message}`);
    }
  }

  /**
   * Creates data retention policy
   */
  public async createDataRetentionPolicy(
    dataType: string,
    retentionPeriod: number,
    autoDelete: boolean,
    anonymizeAfter: boolean,
    legalBasis: string,
    description: string
  ): Promise<DataRetentionPolicy> {
    try {
      const policy = await this.prisma.dataRetentionPolicy.create({
        data: {
          dataType,
          retentionPeriod,
          autoDelete,
          anonymizeAfter,
          legalBasis,
          description
        }
      });

      logger.info(`[GDPRService] Created data retention policy for ${dataType}`);
      return policy as DataRetentionPolicy;
    } catch (error: any) {
      logger.error('[GDPRService] Error creating data retention policy:', error);
      throw new Error(`Failed to create data retention policy: ${error.message}`);
    }
  }

  /**
   * Processes data retention policies
   */
  public async processDataRetention(): Promise<{
    processedRecords: number;
    deletedRecords: number;
    anonymizedRecords: number;
  }> {
    try {
      const policies = await this.prisma.dataRetentionPolicy.findMany({
        where: { isActive: true }
      });

      let processedRecords = 0;
      let deletedRecords = 0;
      let anonymizedRecords = 0;

      for (const policy of policies) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - policy.retentionPeriod);

        // Process different data types based on policy
        switch (policy.dataType) {
          case 'audit_logs':
            if (policy.autoDelete) {
              const deleted = await this.prisma.auditEvent.deleteMany({
                where: {
                  timestamp: { lt: cutoffDate }
                }
              });
              deletedRecords += deleted.count;
            }
            break;

          case 'user_sessions':
            if (policy.autoDelete) {
              const deleted = await this.prisma.userSession.deleteMany({
                where: {
                  lastActivity: { lt: cutoffDate }
                }
              });
              deletedRecords += deleted.count;
            }
            break;

          case 'communication_data':
            if (policy.anonymizeAfter) {
              const anonymized = await this.prisma.clientMessage.updateMany({
                where: {
                  createdAt: { lt: cutoffDate }
                },
                data: {
                  content: '[ANONYMIZED]',
                  metadata: { anonymized: true, anonymizedAt: new Date() }
                }
              });
              anonymizedRecords += anonymized.count;
            }
            break;
        }

        processedRecords++;
      }

      logger.info(`[GDPRService] Processed ${processedRecords} retention policies: ${deletedRecords} deleted, ${anonymizedRecords} anonymized`);
      return {
        processedRecords,
        deletedRecords,
        anonymizedRecords
      };
    } catch (error: any) {
      logger.error('[GDPRService] Error processing data retention:', error);
      throw new Error(`Failed to process data retention: ${error.message}`);
    }
  }

  /**
   * Creates data processing activity record
   */
  public async createDataProcessingActivity(
    name: string,
    purpose: string,
    legalBasis: string,
    dataTypes: string[],
    recipients: string[],
    retentionPeriod: number,
    securityMeasures: string[]
  ): Promise<DataProcessingActivity> {
    try {
      const activity = await this.prisma.dataProcessingActivity.create({
        data: {
          name,
          purpose,
          legalBasis,
          dataTypes,
          recipients,
          retentionPeriod,
          securityMeasures,
          isActive: true
        }
      });

      logger.info(`[GDPRService] Created data processing activity ${activity.id}`);
      return activity as DataProcessingActivity;
    } catch (error: any) {
      logger.error('[GDPRService] Error creating data processing activity:', error);
      throw new Error(`Failed to create data processing activity: ${error.message}`);
    }
  }

  /**
   * Gets data processing activities
   */
  public async getDataProcessingActivities(): Promise<DataProcessingActivity[]> {
    try {
      const activities = await this.prisma.dataProcessingActivity.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      });

      return activities as DataProcessingActivity[];
    } catch (error: any) {
      logger.error('[GDPRService] Error getting data processing activities:', error);
      throw new Error(`Failed to get data processing activities: ${error.message}`);
    }
  }
}

export default new GDPRService();










