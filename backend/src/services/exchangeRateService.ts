import axios from 'axios';
import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';

interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  timestamp: Date;
}

interface ExchangeRateResponse {
  success: boolean;
  timestamp: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}

export class ExchangeRateService {
  private static readonly API_URL = 'https://api.exchangerate-api.com/v4/latest';
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  // Get exchange rate between two currencies
  static async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) {
      return 1;
    }

    // Check cache first
    const cachedRate = await this.getCachedRate(fromCurrency, toCurrency);
    if (cachedRate) {
      return cachedRate.rate;
    }

    // Fetch from API
    const rate = await this.fetchExchangeRate(fromCurrency, toCurrency);
    
    // Cache the rate
    await this.cacheExchangeRate(fromCurrency, toCurrency, rate);
    
    return rate;
  }

  // Get all exchange rates for a base currency
  static async getAllExchangeRates(baseCurrency: string): Promise<Record<string, number>> {
    try {
      const response = await axios.get<ExchangeRateResponse>(
        `${this.API_URL}/${baseCurrency}`
      );

      if (!response.data.success) {
        throw new AppError('Failed to fetch exchange rates', 500);
      }

      // Cache all rates
      await this.cacheAllRates(baseCurrency, response.data.rates);

      return response.data.rates;
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      throw new AppError('Failed to fetch exchange rates', 500);
    }
  }

  // Convert amount from one currency to another
  static async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> {
    const rate = await this.getExchangeRate(fromCurrency, toCurrency);
    return amount * rate;
  }

  // Get cached exchange rate
  private static async getCachedRate(
    fromCurrency: string,
    toCurrency: string
  ): Promise<ExchangeRate | null> {
    try {
      const cachedRate = await prisma.currencyConversion.findFirst({
        where: {
          fromCurrency,
          toCurrency,
          createdAt: {
            gte: new Date(Date.now() - this.CACHE_DURATION)
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      if (cachedRate) {
        return {
          from: cachedRate.fromCurrency,
          to: cachedRate.toCurrency,
          rate: Number(cachedRate.rate),
          timestamp: cachedRate.createdAt
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting cached rate:', error);
      return null;
    }
  }

  // Fetch exchange rate from API
  private static async fetchExchangeRate(
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> {
    try {
      const response = await axios.get<ExchangeRateResponse>(
        `${this.API_URL}/${fromCurrency}`
      );

      if (!response.data.success) {
        throw new AppError('Failed to fetch exchange rate', 500);
      }

      const rate = response.data.rates[toCurrency];
      if (!rate) {
        throw new AppError(`Exchange rate not found for ${toCurrency}`, 404);
      }

      return rate;
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      throw new AppError('Failed to fetch exchange rate', 500);
    }
  }

  // Cache exchange rate
  private static async cacheExchangeRate(
    fromCurrency: string,
    toCurrency: string,
    rate: number
  ): Promise<void> {
    try {
      await prisma.currencyConversion.create({
        data: {
          fromCurrency,
          toCurrency,
          rate,
          organizationId: 'system' // System-wide cache
        }
      });
    } catch (error) {
      console.error('Error caching exchange rate:', error);
      // Don't throw error for caching failures
    }
  }

  // Cache all rates for a base currency
  private static async cacheAllRates(
    baseCurrency: string,
    rates: Record<string, number>
  ): Promise<void> {
    try {
      const rateEntries = Object.entries(rates).map(([currency, rate]) => ({
        fromCurrency: baseCurrency,
        toCurrency: currency,
        rate,
        organizationId: 'system'
      }));

      await prisma.currencyConversion.createMany({
        data: rateEntries,
        skipDuplicates: true
      });
    } catch (error) {
      console.error('Error caching all rates:', error);
      // Don't throw error for caching failures
    }
  }

  // Get historical exchange rates
  static async getHistoricalRates(
    fromCurrency: string,
    toCurrency: string,
    days: number = 30
  ): Promise<Array<{ date: string; rate: number }>> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const historicalRates = await prisma.currencyConversion.findMany({
        where: {
          fromCurrency,
          toCurrency,
          createdAt: {
            gte: startDate
          }
        },
        orderBy: { createdAt: 'asc' },
        select: {
          rate: true,
          createdAt: true
        }
      });

      return historicalRates.map(rate => ({
        date: rate.createdAt.toISOString().split('T')[0],
        rate: Number(rate.rate)
      }));
    } catch (error) {
      console.error('Error getting historical rates:', error);
      return [];
    }
  }

  // Get supported currencies
  static async getSupportedCurrencies(): Promise<string[]> {
    try {
      const response = await axios.get<ExchangeRateResponse>(
        `${this.API_URL}/USD`
      );

      if (!response.data.success) {
        throw new AppError('Failed to fetch supported currencies', 500);
      }

      return Object.keys(response.data.rates);
    } catch (error) {
      console.error('Error fetching supported currencies:', error);
      throw new AppError('Failed to fetch supported currencies', 500);
    }
  }

  // Refresh exchange rates (called by cron job)
  static async refreshExchangeRates(): Promise<void> {
    try {
      const supportedCurrencies = await this.getSupportedCurrencies();
      const majorCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'];

      for (const currency of majorCurrencies) {
        if (supportedCurrencies.includes(currency)) {
          await this.getAllExchangeRates(currency);
        }
      }

      console.log('Exchange rates refreshed successfully');
    } catch (error) {
      console.error('Error refreshing exchange rates:', error);
    }
  }

  // Get exchange rate with fallback
  static async getExchangeRateWithFallback(
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> {
    try {
      return await this.getExchangeRate(fromCurrency, toCurrency);
    } catch (error) {
      console.error('Error getting exchange rate:', error);
      
      // Fallback to cached rate (even if expired)
      const fallbackRate = await prisma.currencyConversion.findFirst({
        where: {
          fromCurrency,
          toCurrency
        },
        orderBy: { createdAt: 'desc' }
      });

      if (fallbackRate) {
        return Number(fallbackRate.rate);
      }

      // Final fallback to 1:1 ratio
      console.warn(`Using 1:1 ratio for ${fromCurrency} to ${toCurrency}`);
      return 1;
    }
  }

  // Calculate currency conversion with fees
  static async convertCurrencyWithFees(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    feePercentage: number = 0
  ): Promise<{
    originalAmount: number;
    convertedAmount: number;
    fee: number;
    finalAmount: number;
    rate: number;
  }> {
    const rate = await this.getExchangeRate(fromCurrency, toCurrency);
    const convertedAmount = amount * rate;
    const fee = convertedAmount * (feePercentage / 100);
    const finalAmount = convertedAmount - fee;

    return {
      originalAmount: amount,
      convertedAmount,
      fee,
      finalAmount,
      rate
    };
  }

  // Get currency symbol
  static getCurrencySymbol(currency: string): string {
    const symbols: Record<string, string> = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'CAD': 'C$',
      'AUD': 'A$',
      'CHF': 'CHF',
      'CNY': '¥',
      'INR': '₹',
      'BRL': 'R$',
      'MXN': '$',
      'KRW': '₩',
      'SGD': 'S$',
      'HKD': 'HK$',
      'NZD': 'NZ$',
      'SEK': 'kr',
      'NOK': 'kr',
      'DKK': 'kr',
      'PLN': 'zł',
      'CZK': 'Kč',
      'HUF': 'Ft',
      'RUB': '₽',
      'TRY': '₺',
      'ZAR': 'R',
      'ILS': '₪',
      'AED': 'د.إ',
      'SAR': '﷼',
      'QAR': '﷼',
      'KWD': 'د.ك',
      'BHD': 'د.ب',
      'OMR': '﷼',
      'JOD': 'د.ا',
      'LBP': 'ل.ل',
      'EGP': '£',
      'MAD': 'د.م.',
      'TND': 'د.ت',
      'DZD': 'د.ج',
      'LYD': 'ل.د',
      'SDG': 'ج.س.',
      'ETB': 'Br',
      'KES': 'KSh',
      'UGX': 'USh',
      'TZS': 'TSh',
      'ZMW': 'ZK',
      'BWP': 'P',
      'SZL': 'L',
      'LSL': 'L',
      'NAD': 'N$',
      'AOA': 'Kz',
      'MZN': 'MT',
      'MGA': 'Ar',
      'MUR': '₨',
      'SCR': '₨',
      'KMF': 'CF',
      'DJF': 'Fdj',
      'SOS': 'S',
      'ERN': 'Nfk',
      'ETB': 'Br',
      'GMD': 'D',
      'GNF': 'FG',
      'LRD': 'L$',
      'SLL': 'Le',
      'STD': 'Db',
      'TND': 'د.ت',
      'XOF': 'CFA',
      'XAF': 'FCFA',
      'XPF': '₣'
    };

    return symbols[currency] || currency;
  }

  // Format currency amount
  static formatCurrency(amount: number, currency: string, locale: string = 'en-US'): string {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency
      }).format(amount);
    } catch (error) {
      // Fallback formatting
      const symbol = this.getCurrencySymbol(currency);
      return `${symbol}${amount.toFixed(2)}`;
    }
  }
}