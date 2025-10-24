import { Router } from 'express';
import { ZapierController } from '../controllers/zapierController';

const router = Router();
const zapierController = new ZapierController();

// Authentication
router.post('/oauth/token', (req, res) => {
  zapierController.authenticate(req, res);
});

// Test connection
router.post('/test', (req, res) => {
  zapierController.testConnection(req, res);
});

// Triggers
router.post('/triggers/new-transaction', (req, res) => {
  zapierController.newTransactionTrigger(req, res);
});

router.post('/triggers/new-customer', (req, res) => {
  zapierController.newCustomerTrigger(req, res);
});

router.post('/triggers/invoice-sent', (req, res) => {
  zapierController.invoiceSentTrigger(req, res);
});

router.post('/triggers/payment-received', (req, res) => {
  zapierController.paymentReceivedTrigger(req, res);
});

// Searches
router.post('/searches/find-transaction', (req, res) => {
  zapierController.findTransaction(req, res);
});

router.post('/searches/find-customer', (req, res) => {
  zapierController.findCustomer(req, res);
});

// Creates
router.post('/creates/create-transaction', (req, res) => {
  zapierController.createTransaction(req, res);
});

router.post('/creates/create-customer', (req, res) => {
  zapierController.createCustomer(req, res);
});

router.post('/creates/create-invoice', (req, res) => {
  zapierController.createInvoice(req, res);
});

router.post('/creates/send-invoice', (req, res) => {
  zapierController.sendInvoice(req, res);
});

export default router;

