import { Request, Response } from 'express';
import GDPRService from '../services/gdprService';
import logger from '../utils/logger';

export const createDataSubject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, firstName, lastName, organizationId } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email is required'
      });
      return;
    }

    const dataSubject = await GDPRService.createDataSubject(
      email,
      firstName,
      lastName,
      organizationId
    );

    res.status(201).json({
      success: true,
      message: 'Data subject created successfully',
      dataSubject
    });
  } catch (error: any) {
    logger.error('Error creating data subject:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create data subject',
      error: error.message
    });
  }
};

export const getDataSubject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.params;

    const dataSubject = await GDPRService.getDataSubjectByEmail(email);

    if (!dataSubject) {
      res.status(404).json({
        success: false,
        message: 'Data subject not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      dataSubject
    });
  } catch (error: any) {
    logger.error('Error getting data subject:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get data subject',
      error: error.message
    });
  }
};

export const requestDataExport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dataSubjectId } = req.params;
    const { dataTypes = ['all'] } = req.body;

    const dataExport = await GDPRService.requestDataExport(dataSubjectId, dataTypes);

    res.status(201).json({
      success: true,
      message: 'Data export request created successfully',
      dataExport
    });
  } catch (error: any) {
    logger.error('Error requesting data export:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to request data export',
      error: error.message
    });
  }
};

export const getDataExport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { exportId } = req.params;

    // In production, this would retrieve the actual export from secure storage
    const dataExport = {
      id: exportId,
      status: 'completed',
      downloadUrl: `/api/gdpr/exports/${exportId}/download`,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    };

    res.status(200).json({
      success: true,
      dataExport
    });
  } catch (error: any) {
    logger.error('Error getting data export:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get data export',
      error: error.message
    });
  }
};

export const downloadDataExport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { exportId } = req.params;

    // In production, this would serve the actual export file
    const exportData = {
      message: 'This is a sample data export. In production, this would contain the actual exported data.',
      exportId,
      generatedAt: new Date().toISOString(),
      dataTypes: ['personal', 'usage', 'communication', 'financial']
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="data-export-${exportId}.json"`);
    res.status(200).json(exportData);
  } catch (error: any) {
    logger.error('Error downloading data export:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download data export',
      error: error.message
    });
  }
};

export const requestDataDeletion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dataSubjectId } = req.params;
    const { reason, legalBasis } = req.body;

    if (!reason || !legalBasis) {
      res.status(400).json({
        success: false,
        message: 'Reason and legal basis are required'
      });
      return;
    }

    const deletionRequest = await GDPRService.requestDataDeletion(
      dataSubjectId,
      reason,
      legalBasis
    );

    res.status(201).json({
      success: true,
      message: 'Data deletion request created successfully',
      deletionRequest
    });
  } catch (error: any) {
    logger.error('Error requesting data deletion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to request data deletion',
      error: error.message
    });
  }
};

export const recordConsent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dataSubjectId } = req.params;
    const { purpose, legalBasis, metadata = {} } = req.body;

    if (!purpose || !legalBasis) {
      res.status(400).json({
        success: false,
        message: 'Purpose and legal basis are required'
      });
      return;
    }

    const consentRecord = await GDPRService.recordConsent(
      dataSubjectId,
      purpose,
      legalBasis,
      metadata
    );

    res.status(201).json({
      success: true,
      message: 'Consent recorded successfully',
      consentRecord
    });
  } catch (error: any) {
    logger.error('Error recording consent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record consent',
      error: error.message
    });
  }
};

export const withdrawConsent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dataSubjectId } = req.params;
    const { purpose } = req.body;

    if (!purpose) {
      res.status(400).json({
        success: false,
        message: 'Purpose is required'
      });
      return;
    }

    const success = await GDPRService.withdrawConsent(dataSubjectId, purpose);

    if (success) {
      res.status(200).json({
        success: true,
        message: 'Consent withdrawn successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to withdraw consent'
      });
    }
  } catch (error: any) {
    logger.error('Error withdrawing consent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to withdraw consent',
      error: error.message
    });
  }
};

export const getConsentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dataSubjectId } = req.params;

    const consentRecords = await GDPRService.getConsentStatus(dataSubjectId);

    res.status(200).json({
      success: true,
      consentRecords
    });
  } catch (error: any) {
    logger.error('Error getting consent status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get consent status',
      error: error.message
    });
  }
};

export const createDataRetentionPolicy = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      dataType,
      retentionPeriod,
      autoDelete,
      anonymizeAfter,
      legalBasis,
      description
    } = req.body;

    if (!dataType || !retentionPeriod || !legalBasis) {
      res.status(400).json({
        success: false,
        message: 'Data type, retention period, and legal basis are required'
      });
      return;
    }

    const policy = await GDPRService.createDataRetentionPolicy(
      dataType,
      retentionPeriod,
      autoDelete,
      anonymizeAfter,
      legalBasis,
      description
    );

    res.status(201).json({
      success: true,
      message: 'Data retention policy created successfully',
      policy
    });
  } catch (error: any) {
    logger.error('Error creating data retention policy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create data retention policy',
      error: error.message
    });
  }
};

export const processDataRetention = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await GDPRService.processDataRetention();

    res.status(200).json({
      success: true,
      message: 'Data retention processing completed',
      result
    });
  } catch (error: any) {
    logger.error('Error processing data retention:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process data retention',
      error: error.message
    });
  }
};

export const createDataProcessingActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      purpose,
      legalBasis,
      dataTypes,
      recipients,
      retentionPeriod,
      securityMeasures
    } = req.body;

    if (!name || !purpose || !legalBasis || !dataTypes || !recipients || !retentionPeriod) {
      res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
      return;
    }

    const activity = await GDPRService.createDataProcessingActivity(
      name,
      purpose,
      legalBasis,
      dataTypes,
      recipients,
      retentionPeriod,
      securityMeasures
    );

    res.status(201).json({
      success: true,
      message: 'Data processing activity created successfully',
      activity
    });
  } catch (error: any) {
    logger.error('Error creating data processing activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create data processing activity',
      error: error.message
    });
  }
};

export const getDataProcessingActivities = async (req: Request, res: Response): Promise<void> => {
  try {
    const activities = await GDPRService.getDataProcessingActivities();

    res.status(200).json({
      success: true,
      activities
    });
  } catch (error: any) {
    logger.error('Error getting data processing activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get data processing activities',
      error: error.message
    });
  }
};










