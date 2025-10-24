import { Request, Response } from 'express';
import { clientPortalService } from '../services/clientPortalService';
import logger from '../utils/logger';

export class ClientPortalController {
  // Client Dashboard
  async getClientDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { clientId } = req.params;
      const dashboard = await clientPortalService.getClientDashboard(clientId);
      res.json({ success: true, data: dashboard, message: 'Client dashboard retrieved successfully' });
    } catch (error) {
      logger.error('Error retrieving client dashboard', { error });
      res.status(500).json({ success: false, message: 'Failed to retrieve client dashboard' });
    }
  }

  // Invoice Management
  async getInvoices(req: Request, res: Response): Promise<void> {
    try {
      const { clientId } = req.query;
      const invoices = await clientPortalService.getInvoices(clientId as string);
      res.json({ success: true, data: invoices, message: 'Invoices retrieved successfully' });
    } catch (error) {
      logger.error('Error retrieving invoices', { error });
      res.status(500).json({ success: false, message: 'Failed to retrieve invoices' });
    }
  }

  async getInvoice(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const invoice = await clientPortalService.getInvoice(id);
      res.json({ success: true, data: invoice, message: 'Invoice retrieved successfully' });
    } catch (error) {
      logger.error('Error retrieving invoice', { error });
      res.status(500).json({ success: false, message: 'Failed to retrieve invoice' });
    }
  }

  async payInvoice(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { paymentData } = req.body;
      const result = await clientPortalService.payInvoice(id, paymentData);
      res.json({ success: true, data: result, message: 'Invoice payment processed successfully' });
    } catch (error) {
      logger.error('Error processing invoice payment', { error });
      res.status(500).json({ success: false, message: 'Failed to process invoice payment' });
    }
  }

  // Document Upload
  async uploadDocument(req: Request, res: Response): Promise<void> {
    try {
      const { clientId } = req.body;
      const document = await clientPortalService.uploadDocument(clientId, req.file);
      res.json({ success: true, data: document, message: 'Document uploaded successfully' });
    } catch (error) {
      logger.error('Error uploading document', { error });
      res.status(500).json({ success: false, message: 'Failed to upload document' });
    }
  }

  async getDocuments(req: Request, res: Response): Promise<void> {
    try {
      const { clientId } = req.query;
      const documents = await clientPortalService.getDocuments(clientId as string);
      res.json({ success: true, data: documents, message: 'Documents retrieved successfully' });
    } catch (error) {
      logger.error('Error retrieving documents', { error });
      res.status(500).json({ success: false, message: 'Failed to retrieve documents' });
    }
  }

  // Communication
  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { clientId, message } = req.body;
      await clientPortalService.sendMessage(clientId, message);
      res.json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
      logger.error('Error sending message', { error });
      res.status(500).json({ success: false, message: 'Failed to send message' });
    }
  }

  async getMessages(req: Request, res: Response): Promise<void> {
    try {
      const { clientId } = req.query;
      const messages = await clientPortalService.getMessages(clientId as string);
      res.json({ success: true, data: messages, message: 'Messages retrieved successfully' });
    } catch (error) {
      logger.error('Error retrieving messages', { error });
      res.status(500).json({ success: false, message: 'Failed to retrieve messages' });
    }
  }
}

export const clientPortalController = new ClientPortalController();