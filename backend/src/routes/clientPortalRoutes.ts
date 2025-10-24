import { Router } from 'express';
import { clientPortalController } from '../controllers/clientPortalController';

const router = Router();

// Client Dashboard
router.get('/dashboard', clientPortalController.getClientDashboard);
router.get('/dashboard/:clientId', clientPortalController.getClientDashboard);

// Invoice Management
router.get('/invoices', clientPortalController.getInvoices);
router.get('/invoices/:id', clientPortalController.getInvoice);
router.post('/invoices/:id/pay', clientPortalController.payInvoice);

// Document Upload
router.post('/documents/upload', clientPortalController.uploadDocument);
router.get('/documents', clientPortalController.getDocuments);

// Communication
router.post('/messages', clientPortalController.sendMessage);
router.get('/messages', clientPortalController.getMessages);

export default router;