import { Request, Response } from 'express';
import exchangeRateService from '../services/exchangeRateService';
import { prisma } from '../lib/prisma';

interface CurrencyConversionRequest {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
}

interface CurrencySettingsRequest {
  defaultCurrency: string;
  displayCurrency: string;
  autoUpdateRates: boolean;
}

/**
 * Get current exchange rates
 */
export const getExchangeRates = async (req: Request, res: Response) => {
  try {
    const { base = 'USD' } = req.query;
    const rates = await exchangeRateService.getExchangeRates(base as string);
    
    res.json({
      success: true,
      base,
      rates,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch exchange rates',
    });
  }
};

/**
 * Convert currency amount
 */
export const convertCurrency = async (req: Request, res: Response) => {
  try {
    const { amount, fromCurrency, toCurrency }: CurrencyConversionRequest = req.body;

    if (!amount || !fromCurrency || !toCurrency) {
      return res.status(400).json({
        success: false,
        error: 'Amount, fromCurrency, and toCurrency are required',
      });
    }

    if (amount < 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be positive',
      });
    }

    const convertedAmount = await exchangeRateService.convertCurrency(
      amount,
      fromCurrency,
      toCurrency
    );

    res.json({
      success: true,
      originalAmount: amount,
      fromCurrency,
      toCurrency,
      convertedAmount,
      rate: convertedAmount / amount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error converting currency:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to convert currency',
    });
  }
};

/**
 * Get exchange rate between two currencies
 */
export const getExchangeRate = async (req: Request, res: Response) => {
  try {
    const { fromCurrency, toCurrency } = req.params;

    if (!fromCurrency || !toCurrency) {
      return res.status(400).json({
        success: false,
        error: 'fromCurrency and toCurrency are required',
      });
    }

    const rate = await exchangeRateService.getExchangeRate(fromCurrency, toCurrency);

    res.json({
      success: true,
      fromCurrency,
      toCurrency,
      rate,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error getting exchange rate:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get exchange rate',
    });
  }
};

/**
 * Get supported currencies
 */
export const getSupportedCurrencies = async (req: Request, res: Response) => {
  try {
    const currencies = exchangeRateService.getSupportedCurrencies();
    
    res.json({
      success: true,
      currencies,
    });
  } catch (error) {
    console.error('Error getting supported currencies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get supported currencies',
    });
  }
};

/**
 * Get user's currency settings
 */
export const getCurrencySettings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        defaultCurrency: true,
        displayCurrency: true,
        autoUpdateRates: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      settings: {
        defaultCurrency: user.defaultCurrency || 'USD',
        displayCurrency: user.displayCurrency || 'USD',
        autoUpdateRates: user.autoUpdateRates || false,
      },
    });
  } catch (error) {
    console.error('Error getting currency settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get currency settings',
    });
  }
};

/**
 * Update user's currency settings
 */
export const updateCurrencySettings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { defaultCurrency, displayCurrency, autoUpdateRates }: CurrencySettingsRequest = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    if (!defaultCurrency || !displayCurrency) {
      return res.status(400).json({
        success: false,
        error: 'defaultCurrency and displayCurrency are required',
      });
    }

    // Validate currencies
    const supportedCurrencies = exchangeRateService.getSupportedCurrencies();
    if (!supportedCurrencies.includes(defaultCurrency)) {
      return res.status(400).json({
        success: false,
        error: `Unsupported default currency: ${defaultCurrency}`,
      });
    }

    if (!supportedCurrencies.includes(displayCurrency)) {
      return res.status(400).json({
        success: false,
        error: `Unsupported display currency: ${displayCurrency}`,
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        defaultCurrency,
        displayCurrency,
        autoUpdateRates: autoUpdateRates ?? false,
      },
      select: {
        defaultCurrency: true,
        displayCurrency: true,
        autoUpdateRates: true,
      },
    });

    res.json({
      success: true,
      settings: updatedUser,
    });
  } catch (error) {
    console.error('Error updating currency settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update currency settings',
    });
  }
};

/**
 * Get cache status
 */
export const getCacheStatus = async (req: Request, res: Response) => {
  try {
    const cacheStatus = exchangeRateService.getCacheStatus();
    
    res.json({
      success: true,
      cache: cacheStatus,
    });
  } catch (error) {
    console.error('Error getting cache status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get cache status',
    });
  }
};

/**
 * Clear exchange rate cache
 */
export const clearCache = async (req: Request, res: Response) => {
  try {
    exchangeRateService.clearCache();
    
    res.json({
      success: true,
      message: 'Cache cleared successfully',
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache',
    });
  }
};

/**
 * Get currency history for a specific currency pair
 */
export const getCurrencyHistory = async (req: Request, res: Response) => {
  try {
    const { fromCurrency, toCurrency } = req.params;
    const { days = 30 } = req.query;

    if (!fromCurrency || !toCurrency) {
      return res.status(400).json({
        success: false,
        error: 'fromCurrency and toCurrency are required',
      });
    }

    // This would typically fetch historical data from a database
    // For now, we'll return a mock response
    const history = Array.from({ length: Number(days) }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Mock historical rates with some variation
      const baseRate = 1.0; // This would be the actual historical rate
      const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
      
      return {
        date: date.toISOString().split('T')[0],
        rate: baseRate + variation,
      };
    }).reverse();

    res.json({
      success: true,
      fromCurrency,
      toCurrency,
      history,
    });
  } catch (error) {
    console.error('Error getting currency history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get currency history',
    });
  }
};