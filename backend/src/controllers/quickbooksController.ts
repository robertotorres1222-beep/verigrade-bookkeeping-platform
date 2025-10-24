import { Request, Response } from 'express';
import QuickBooksService from '../integrations/quickbooks/QuickBooksService';
import IntegrationFramework from '../integrations/framework/IntegrationFramework';
import logger from '../utils/logger';

export const syncCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { connectionId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const connection = IntegrationFramework.getConnection(connectionId);
    if (!connection || connection.userId !== userId) {
      res.status(403).json({ success: false, message: 'Access denied to this connection' });
      return;
    }

    const customers = await QuickBooksService.syncCustomers(connectionId);

    res.status(200).json({
      success: true,
      message: `Synced ${customers.length} customers from QuickBooks`,
      customers
    });
  } catch (error) {
    logger.error(`Error syncing QuickBooks customers for connection ${req.params.connectionId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync customers',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const syncInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { connectionId } = req.params;
    const { startDate } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const connection = IntegrationFramework.getConnection(connectionId);
    if (!connection || connection.userId !== userId) {
      res.status(403).json({ success: false, message: 'Access denied to this connection' });
      return;
    }

    const invoices = await QuickBooksService.syncInvoices(
      connectionId, 
      startDate as string
    );

    res.status(200).json({
      success: true,
      message: `Synced ${invoices.length} invoices from QuickBooks`,
      invoices
    });
  } catch (error) {
    logger.error(`Error syncing QuickBooks invoices for connection ${req.params.connectionId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync invoices',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const syncPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { connectionId } = req.params;
    const { startDate } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const connection = IntegrationFramework.getConnection(connectionId);
    if (!connection || connection.userId !== userId) {
      res.status(403).json({ success: false, message: 'Access denied to this connection' });
      return;
    }

    const payments = await QuickBooksService.syncPayments(
      connectionId, 
      startDate as string
    );

    res.status(200).json({
      success: true,
      message: `Synced ${payments.length} payments from QuickBooks`,
      payments
    });
  } catch (error) {
    logger.error(`Error syncing QuickBooks payments for connection ${req.params.connectionId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync payments',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const syncItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const { connectionId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const connection = IntegrationFramework.getConnection(connectionId);
    if (!connection || connection.userId !== userId) {
      res.status(403).json({ success: false, message: 'Access denied to this connection' });
      return;
    }

    const items = await QuickBooksService.syncItems(connectionId);

    res.status(200).json({
      success: true,
      message: `Synced ${items.length} items from QuickBooks`,
      items
    });
  } catch (error) {
    logger.error(`Error syncing QuickBooks items for connection ${req.params.connectionId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync items',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const performFullSync = async (req: Request, res: Response): Promise<void> => {
  try {
    const { connectionId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const connection = IntegrationFramework.getConnection(connectionId);
    if (!connection || connection.userId !== userId) {
      res.status(403).json({ success: false, message: 'Access denied to this connection' });
      return;
    }

    const syncResult = await QuickBooksService.performFullSync(connectionId);

    res.status(200).json({
      success: true,
      message: 'Full sync completed successfully',
      syncResult: {
        customersCount: syncResult.customers.length,
        invoicesCount: syncResult.invoices.length,
        paymentsCount: syncResult.payments.length,
        itemsCount: syncResult.items.length
      }
    });
  } catch (error) {
    logger.error(`Error performing full QuickBooks sync for connection ${req.params.connectionId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform full sync',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const createCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { connectionId } = req.params;
    const customerData = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const connection = IntegrationFramework.getConnection(connectionId);
    if (!connection || connection.userId !== userId) {
      res.status(403).json({ success: false, message: 'Access denied to this connection' });
      return;
    }

    const customer = await QuickBooksService.createCustomer(connectionId, customerData);

    res.status(201).json({
      success: true,
      message: 'Customer created successfully in QuickBooks',
      customer
    });
  } catch (error) {
    logger.error(`Error creating QuickBooks customer for connection ${req.params.connectionId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to create customer',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const createInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { connectionId } = req.params;
    const invoiceData = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const connection = IntegrationFramework.getConnection(connectionId);
    if (!connection || connection.userId !== userId) {
      res.status(403).json({ success: false, message: 'Access denied to this connection' });
      return;
    }

    const invoice = await QuickBooksService.createInvoice(connectionId, invoiceData);

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully in QuickBooks',
      invoice
    });
  } catch (error) {
    logger.error(`Error creating QuickBooks invoice for connection ${req.params.connectionId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to create invoice',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};







