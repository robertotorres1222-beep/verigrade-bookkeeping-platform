import { Router } from 'express';
import { body, query } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import {
  createLinkToken,
  exchangePublicToken,
  getAccounts,
  getTransactions,
  syncTransactions,
  removeBankConnection,
  getAccountBalance,
} from '../services/plaidService';

const router = Router();

// Create link token for Plaid Link
router.post('/link-token',
  authenticate,
  asyncHandler(async (req: any, res: any) => {
    const linkToken = await createLinkToken(req.user!.id);
    
    res.json({
      success: true,
      data: { linkToken },
    });
  })
);

// Exchange public token for access token
router.post('/connect',
  authenticate,
  [
    body('publicToken').isString().notEmpty(),
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const { publicToken } = req.body;
    const organizationId = req.user!.organizationId!;
    
    const accessToken = await exchangePublicToken(publicToken, organizationId);
    
    res.json({
      success: true,
      message: 'Bank account connected successfully',
      data: { accessToken },
    });
  })
);

// Get connected bank accounts
router.get('/accounts',
  authenticate,
  asyncHandler(async (req: any, res: any) => {
    const organizationId = req.user!.organizationId!;
    const accounts = await getAccounts(organizationId);
    
    res.json({
      success: true,
      data: { accounts },
    });
  })
);

// Get transactions
router.get('/transactions',
  authenticate,
  [
    query('startDate').isISO8601(),
    query('endDate').isISO8601(),
    query('accountIds').optional().isArray(),
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const { startDate, endDate, accountIds } = req.query;
    const organizationId = req.user!.organizationId!;
    
    const transactions = await getTransactions(
      organizationId,
      startDate as string,
      endDate as string,
      accountIds as string[]
    );
    
    res.json({
      success: true,
      data: { transactions },
    });
  })
);

// Sync transactions
router.post('/sync',
  authenticate,
  asyncHandler(async (req: any, res: any) => {
    const organizationId = req.user!.organizationId!;
    const syncedCount = await syncTransactions(organizationId);
    
    res.json({
      success: true,
      message: `${syncedCount} transactions synced successfully`,
      data: { syncedCount },
    });
  })
);

// Get account balance
router.get('/balance/:accountId',
  authenticate,
  asyncHandler(async (req: any, res: any) => {
    const { accountId } = req.params;
    const organizationId = req.user!.organizationId!;
    
    const balance = await getAccountBalance(accountId, organizationId);
    
    res.json({
      success: true,
      data: { balance },
    });
  })
);

// Remove bank connection
router.delete('/disconnect/:itemId',
  authenticate,
  asyncHandler(async (req: any, res: any) => {
    const { itemId } = req.params;
    const organizationId = req.user!.organizationId!;
    
    await removeBankConnection(itemId, organizationId);
    
    res.json({
      success: true,
      message: 'Bank connection removed successfully',
    });
  })
);

export default router;
