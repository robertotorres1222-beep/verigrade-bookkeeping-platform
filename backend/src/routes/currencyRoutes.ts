import express from 'express';
import {
  getExchangeRates,
  convertCurrency,
  getExchangeRate,
  getSupportedCurrencies,
  getCurrencySettings,
  updateCurrencySettings,
  getCacheStatus,
  clearCache,
  getCurrencyHistory,
} from '../controllers/currencyController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Public routes (no authentication required)
router.get('/rates', getExchangeRates);
router.get('/supported', getSupportedCurrencies);
router.get('/rate/:fromCurrency/:toCurrency', getExchangeRate);
router.get('/history/:fromCurrency/:toCurrency', getCurrencyHistory);
router.get('/cache/status', getCacheStatus);

// Protected routes (authentication required)
router.post('/convert', authenticateToken, convertCurrency);
router.get('/settings', authenticateToken, getCurrencySettings);
router.put('/settings', authenticateToken, updateCurrencySettings);
router.delete('/cache', authenticateToken, clearCache);

export default router;

