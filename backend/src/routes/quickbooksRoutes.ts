import { Router } from 'express';
import { 
  syncCustomers, 
  syncInvoices, 
  syncPayments, 
  syncItems, 
  performFullSync, 
  createCustomer, 
  createInvoice 
} from '../controllers/quickbooksController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Sync customers from QuickBooks
router.get('/connections/:connectionId/sync/customers', authenticateToken, syncCustomers);

// Sync invoices from QuickBooks
router.get('/connections/:connectionId/sync/invoices', authenticateToken, syncInvoices);

// Sync payments from QuickBooks
router.get('/connections/:connectionId/sync/payments', authenticateToken, syncPayments);

// Sync items from QuickBooks
router.get('/connections/:connectionId/sync/items', authenticateToken, syncItems);

// Perform full sync
router.post('/connections/:connectionId/sync/full', authenticateToken, performFullSync);

// Create customer in QuickBooks
router.post('/connections/:connectionId/customers', authenticateToken, createCustomer);

// Create invoice in QuickBooks
router.post('/connections/:connectionId/invoices', authenticateToken, createInvoice);

export default router;






