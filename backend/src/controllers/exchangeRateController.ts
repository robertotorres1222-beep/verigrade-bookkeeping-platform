import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/jwtAuth';
import { ResponseHandler } from '../utils/response';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { ExchangeRateService } from '../services/exchangeRateService';

export const exchangeRateController = {
  // Get exchange rate between two currencies
  getExchangeRate: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { from, to } = req.query;

    if (!from || !to) {
      throw new AppError('From and to currencies are required', 400);
    }

    const rate = await ExchangeRateService.getExchangeRate(
      from as string,
      to as string
    );

    return ResponseHandler.success(res, {
      from: from as string,
      to: to as string,
      rate,
      timestamp: new Date()
    });
  }),

  // Get all exchange rates for a base currency
  getAllExchangeRates: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { base = 'USD' } = req.query;

    const rates = await ExchangeRateService.getAllExchangeRates(base as string);

    return ResponseHandler.success(res, {
      base: base as string,
      rates,
      timestamp: new Date()
    });
  }),

  // Convert currency amount
  convertCurrency: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { amount, from, to } = req.body;

    if (!amount || !from || !to) {
      throw new AppError('Amount, from, and to currencies are required', 400);
    }

    if (amount <= 0) {
      throw new AppError('Amount must be greater than 0', 400);
    }

    const convertedAmount = await ExchangeRateService.convertCurrency(
      Number(amount),
      from,
      to
    );

    const rate = await ExchangeRateService.getExchangeRate(from, to);

    return ResponseHandler.success(res, {
      originalAmount: Number(amount),
      convertedAmount,
      from,
      to,
      rate,
      timestamp: new Date()
    });
  }),

  // Convert currency with fees
  convertCurrencyWithFees: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { amount, from, to, feePercentage = 0 } = req.body;

    if (!amount || !from || !to) {
      throw new AppError('Amount, from, and to currencies are required', 400);
    }

    if (amount <= 0) {
      throw new AppError('Amount must be greater than 0', 400);
    }

    if (feePercentage < 0 || feePercentage > 100) {
      throw new AppError('Fee percentage must be between 0 and 100', 400);
    }

    const result = await ExchangeRateService.convertCurrencyWithFees(
      Number(amount),
      from,
      to,
      Number(feePercentage)
    );

    return ResponseHandler.success(res, {
      ...result,
      from,
      to,
      timestamp: new Date()
    });
  }),

  // Get historical exchange rates
  getHistoricalRates: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { from, to, days = 30 } = req.query;

    if (!from || !to) {
      throw new AppError('From and to currencies are required', 400);
    }

    const daysNumber = Number(days);
    if (daysNumber < 1 || daysNumber > 365) {
      throw new AppError('Days must be between 1 and 365', 400);
    }

    const historicalRates = await ExchangeRateService.getHistoricalRates(
      from as string,
      to as string,
      daysNumber
    );

    return ResponseHandler.success(res, {
      from: from as string,
      to: to as string,
      days: daysNumber,
      rates: historicalRates
    });
  }),

  // Get supported currencies
  getSupportedCurrencies: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const currencies = await ExchangeRateService.getSupportedCurrencies();

    return ResponseHandler.success(res, {
      currencies,
      count: currencies.length
    });
  }),

  // Get currency symbol
  getCurrencySymbol: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { currency } = req.params;

    if (!currency) {
      throw new AppError('Currency is required', 400);
    }

    const symbol = ExchangeRateService.getCurrencySymbol(currency);

    return ResponseHandler.success(res, {
      currency,
      symbol
    });
  }),

  // Format currency amount
  formatCurrency: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { amount, currency, locale = 'en-US' } = req.body;

    if (!amount || !currency) {
      throw new AppError('Amount and currency are required', 400);
    }

    if (amount <= 0) {
      throw new AppError('Amount must be greater than 0', 400);
    }

    const formatted = ExchangeRateService.formatCurrency(
      Number(amount),
      currency,
      locale
    );

    return ResponseHandler.success(res, {
      amount: Number(amount),
      currency,
      locale,
      formatted
    });
  }),

  // Refresh exchange rates (admin only)
  refreshExchangeRates: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Check if user has admin permissions
    if (req.user!.role !== 'ADMIN') {
      throw new AppError('Admin permissions required', 403);
    }

    // Run in background
    ExchangeRateService.refreshExchangeRates().catch(error => {
      console.error('Error refreshing exchange rates:', error);
    });

    return ResponseHandler.success(res, {
      message: 'Exchange rates refresh initiated'
    });
  }),

  // Get exchange rate with fallback
  getExchangeRateWithFallback: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { from, to } = req.query;

    if (!from || !to) {
      throw new AppError('From and to currencies are required', 400);
    }

    const rate = await ExchangeRateService.getExchangeRateWithFallback(
      from as string,
      to as string
    );

    return ResponseHandler.success(res, {
      from: from as string,
      to: to as string,
      rate,
      timestamp: new Date()
    });
  }),

  // Get currency conversion preview
  getConversionPreview: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { amount, from, to } = req.query;

    if (!amount || !from || !to) {
      throw new AppError('Amount, from, and to currencies are required', 400);
    }

    const amountNumber = Number(amount);
    if (amountNumber <= 0) {
      throw new AppError('Amount must be greater than 0', 400);
    }

    const rate = await ExchangeRateService.getExchangeRateWithFallback(
      from as string,
      to as string
    );

    const convertedAmount = amountNumber * rate;
    const symbol = ExchangeRateService.getCurrencySymbol(to as string);

    return ResponseHandler.success(res, {
      originalAmount: amountNumber,
      convertedAmount,
      from: from as string,
      to: to as string,
      rate,
      symbol,
      formatted: ExchangeRateService.formatCurrency(convertedAmount, to as string)
    });
  }),

  // Get currency statistics
  getCurrencyStats: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { currency = 'USD' } = req.query;

    const supportedCurrencies = await ExchangeRateService.getSupportedCurrencies();
    const allRates = await ExchangeRateService.getAllExchangeRates(currency as string);

    // Calculate statistics
    const rates = Object.values(allRates);
    const minRate = Math.min(...rates);
    const maxRate = Math.max(...rates);
    const avgRate = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;

    return ResponseHandler.success(res, {
      baseCurrency: currency as string,
      supportedCurrencies: supportedCurrencies.length,
      totalRates: rates.length,
      statistics: {
        minRate,
        maxRate,
        avgRate
      },
      timestamp: new Date()
    });
  })
};

