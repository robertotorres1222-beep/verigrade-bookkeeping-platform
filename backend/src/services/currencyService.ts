import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

interface ExchangeRate {
  currency: string;
  rate: number;
  timestamp: Date;
}

interface CurrencyData {
  code: string;
  name: string;
  symbol: string;
  rate: number;
  lastUpdated: Date;
}

class CurrencyService {
  private apiKey: string;
  private baseUrl: string;
  private cache: Map<string, { data: CurrencyData; timestamp: number }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.apiKey = process.env.EXCHANGE_RATE_API_KEY || '';
    this.baseUrl = process.env.EXCHANGE_RATE_API_URL || 'https://api.exchangerate-api.com/v4/latest';
  }

  // Get real-time exchange rates
  async getExchangeRates(baseCurrency: string = 'USD'): Promise<CurrencyData[]> {
    try {
      // Check cache first
      const cacheKey = `rates_${baseCurrency}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        logger.info('Returning cached exchange rates');
        return [cached.data];
      }

      // Fetch from API
      const response = await axios.get(`${this.baseUrl}/${baseCurrency}`, {
        timeout: 10000,
        headers: {
          'User-Agent': 'VeriGrade/1.0'
        }
      });

      if (response.data && response.data.rates) {
        const rates = response.data.rates;
        const currencies: CurrencyData[] = [];

        // Convert to our format
        for (const [code, rate] of Object.entries(rates)) {
          currencies.push({
            code,
            name: this.getCurrencyName(code),
            symbol: this.getCurrencySymbol(code),
            rate: rate as number,
            lastUpdated: new Date()
          });
        }

        // Cache the results
        this.cache.set(cacheKey, {
          data: currencies[0], // Store first currency as representative
          timestamp: Date.now()
        });

        // Update database
        await this.updateCurrencyRates(currencies);

        logger.info(`Fetched ${currencies.length} exchange rates for ${baseCurrency}`);
        return currencies;
      }

      throw new Error('Invalid API response format');
    } catch (error) {
      logger.error('Error fetching exchange rates:', error);
      
      // Fallback to database rates
      return await this.getStoredCurrencyRates(baseCurrency);
    }
  }

  // Get specific currency rate
  async getCurrencyRate(fromCurrency: string, toCurrency: string): Promise<number> {
    try {
      if (fromCurrency === toCurrency) return 1;

      // Try to get from cache first
      const cacheKey = `rate_${fromCurrency}_${toCurrency}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data.rate;
      }

      // Fetch current rates
      const rates = await this.getExchangeRates(fromCurrency);
      const targetRate = rates.find(rate => rate.code === toCurrency);
      
      if (targetRate) {
        // Cache the result
        this.cache.set(cacheKey, {
          data: targetRate,
          timestamp: Date.now()
        });
        
        return targetRate.rate;
      }

      throw new Error(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
    } catch (error) {
      logger.error('Error getting currency rate:', error);
      throw error;
    }
  }

  // Convert amount between currencies
  async convertAmount(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    try {
      const rate = await this.getCurrencyRate(fromCurrency, toCurrency);
      return amount * rate;
    } catch (error) {
      logger.error('Error converting amount:', error);
      throw error;
    }
  }

  // Update currency rates in database
  private async updateCurrencyRates(currencies: CurrencyData[]): Promise<void> {
    try {
      for (const currency of currencies) {
        await prisma.currencyConversion.upsert({
          where: {
            fromCurrency_toCurrency: {
              fromCurrency: 'USD', // Assuming base currency is USD
              toCurrency: currency.code
            }
          },
          update: {
            rate: currency.rate,
            lastUpdated: currency.lastUpdated
          },
          create: {
            fromCurrency: 'USD',
            toCurrency: currency.code,
            rate: currency.rate,
            lastUpdated: currency.lastUpdated
          }
        });
      }
      
      logger.info(`Updated ${currencies.length} currency rates in database`);
    } catch (error) {
      logger.error('Error updating currency rates:', error);
    }
  }

  // Get stored currency rates from database
  private async getStoredCurrencyRates(baseCurrency: string): Promise<CurrencyData[]> {
    try {
      const storedRates = await prisma.currencyConversion.findMany({
        where: { fromCurrency: baseCurrency },
        orderBy: { lastUpdated: 'desc' }
      });

      return storedRates.map(rate => ({
        code: rate.toCurrency,
        name: this.getCurrencyName(rate.toCurrency),
        symbol: this.getCurrencySymbol(rate.toCurrency),
        rate: rate.rate,
        lastUpdated: rate.lastUpdated
      }));
    } catch (error) {
      logger.error('Error getting stored currency rates:', error);
      return [];
    }
  }

  // Get supported currencies
  getSupportedCurrencies(): CurrencyData[] {
    return [
      { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1, lastUpdated: new Date() },
      { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.85, lastUpdated: new Date() },
      { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.73, lastUpdated: new Date() },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 110, lastUpdated: new Date() },
      { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 1.25, lastUpdated: new Date() },
      { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.35, lastUpdated: new Date() },
      { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', rate: 0.92, lastUpdated: new Date() },
      { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rate: 6.45, lastUpdated: new Date() },
      { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 74.5, lastUpdated: new Date() },
      { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', rate: 5.2, lastUpdated: new Date() }
    ];
  }

  // Get currency name by code
  private getCurrencyName(code: string): string {
    const currencyNames: { [key: string]: string } = {
      'USD': 'US Dollar',
      'EUR': 'Euro',
      'GBP': 'British Pound',
      'JPY': 'Japanese Yen',
      'CAD': 'Canadian Dollar',
      'AUD': 'Australian Dollar',
      'CHF': 'Swiss Franc',
      'CNY': 'Chinese Yuan',
      'INR': 'Indian Rupee',
      'BRL': 'Brazilian Real',
      'MXN': 'Mexican Peso',
      'KRW': 'South Korean Won',
      'SGD': 'Singapore Dollar',
      'HKD': 'Hong Kong Dollar',
      'NZD': 'New Zealand Dollar',
      'SEK': 'Swedish Krona',
      'NOK': 'Norwegian Krone',
      'DKK': 'Danish Krone',
      'PLN': 'Polish Zloty',
      'CZK': 'Czech Koruna',
      'HUF': 'Hungarian Forint',
      'RUB': 'Russian Ruble',
      'ZAR': 'South African Rand',
      'TRY': 'Turkish Lira',
      'ILS': 'Israeli Shekel',
      'AED': 'UAE Dirham',
      'SAR': 'Saudi Riyal',
      'EGP': 'Egyptian Pound',
      'THB': 'Thai Baht',
      'MYR': 'Malaysian Ringgit',
      'IDR': 'Indonesian Rupiah',
      'PHP': 'Philippine Peso',
      'VND': 'Vietnamese Dong'
    };
    
    return currencyNames[code] || code;
  }

  // Get currency symbol by code
  private getCurrencySymbol(code: string): string {
    const currencySymbols: { [key: string]: string } = {
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
      'ZAR': 'R',
      'TRY': '₺',
      'ILS': '₪',
      'AED': 'د.إ',
      'SAR': 'ر.س',
      'EGP': '£',
      'THB': '฿',
      'MYR': 'RM',
      'IDR': 'Rp',
      'PHP': '₱',
      'VND': '₫'
    };
    
    return currencySymbols[code] || code;
  }

  // Get currency conversion history
  async getConversionHistory(fromCurrency: string, toCurrency: string, days: number = 30): Promise<any[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const history = await prisma.currencyConversion.findMany({
        where: {
          fromCurrency,
          toCurrency,
          lastUpdated: {
            gte: startDate
          }
        },
        orderBy: { lastUpdated: 'asc' }
      });

      return history.map(record => ({
        date: record.lastUpdated,
        rate: record.rate,
        fromCurrency: record.fromCurrency,
        toCurrency: record.toCurrency
      }));
    } catch (error) {
      logger.error('Error getting conversion history:', error);
      return [];
    }
  }

  // Schedule automatic rate updates
  async scheduleRateUpdates(): Promise<void> {
    try {
      // Update rates every hour
      setInterval(async () => {
        try {
          await this.getExchangeRates('USD');
          logger.info('Scheduled currency rate update completed');
        } catch (error) {
          logger.error('Scheduled currency rate update failed:', error);
        }
      }, 60 * 60 * 1000); // 1 hour

      logger.info('Currency rate update scheduler started');
    } catch (error) {
      logger.error('Error starting currency rate scheduler:', error);
    }
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
    logger.info('Currency service cache cleared');
  }
}

export default new CurrencyService();

