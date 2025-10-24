'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowPathIcon,
  CalculatorIcon,
  ChartBarIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import CurrencySelector from './CurrencySelector';

interface CurrencyRate {
  from: string;
  to: string;
  rate: number;
  lastUpdated: Date;
}

interface CurrencyConverterProps {
  className?: string;
}

const CurrencyConverter: React.FC<CurrencyConverterProps> = ({ className = '' }) => {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState('');
  const [convertedAmount, setConvertedAmount] = useState('');
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [historicalRates, setHistoricalRates] = useState<{date: string, rate: number}[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (amount && fromCurrency && toCurrency) {
      convertCurrency();
    }
  }, [amount, fromCurrency, toCurrency]);

  const convertCurrency = async () => {
    if (!amount || !fromCurrency || !toCurrency) {
      setConvertedAmount('');
      setRate(null);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/currencies/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          from: fromCurrency,
          to: toCurrency,
          amount: parseFloat(amount)
        })
      });

      if (response.ok) {
        const data = await response.json();
        setConvertedAmount(data.data.convertedAmount.toFixed(2));
        setRate(data.data.rate);
        fetchHistoricalRates();
      } else {
        // Fallback calculation
        const fallbackRate = getFallbackRate(fromCurrency, toCurrency);
        const converted = parseFloat(amount) * fallbackRate;
        setConvertedAmount(converted.toFixed(2));
        setRate(fallbackRate);
      }
    } catch (error) {
      console.error('Currency conversion error:', error);
      // Fallback calculation
      const fallbackRate = getFallbackRate(fromCurrency, toCurrency);
      const converted = parseFloat(amount) * fallbackRate;
      setConvertedAmount(converted.toFixed(2));
      setRate(fallbackRate);
      toast.error('Using offline rates');
    } finally {
      setLoading(false);
    }
  };

  const getFallbackRate = (from: string, to: string): number => {
    // Simple fallback rates (in real app, these would be cached)
    const rates: { [key: string]: number } = {
      'USD_EUR': 0.85,
      'USD_GBP': 0.73,
      'USD_JPY': 110,
      'USD_CAD': 1.25,
      'USD_AUD': 1.35,
      'EUR_USD': 1.18,
      'EUR_GBP': 0.86,
      'GBP_USD': 1.37,
      'GBP_EUR': 1.16,
    };
    
    return rates[`${from}_${to}`] || 1;
  };

  const fetchHistoricalRates = async () => {
    try {
      const response = await fetch(`/api/currencies/historical?from=${fromCurrency}&to=${toCurrency}&days=7`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setHistoricalRates(data.data);
      }
    } catch (error) {
      console.error('Error fetching historical rates:', error);
    }
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const formatCurrency = (amount: string, currency: string) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return '';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <CalculatorIcon className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Currency Converter</h3>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ChartBarIcon className="h-4 w-4 mr-1" />
            {showHistory ? 'Hide' : 'Show'} History
          </button>
        </div>

        <div className="space-y-4">
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                {fromCurrency}
              </div>
            </div>
          </div>

          {/* Currency Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From
              </label>
              <CurrencySelector
                selectedCurrency={fromCurrency}
                onCurrencyChange={setFromCurrency}
                showRates={true}
                className="w-full"
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={swapCurrencies}
                className="w-full flex items-center justify-center p-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Swap currencies"
              >
                <ArrowPathIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To
              </label>
              <CurrencySelector
                selectedCurrency={toCurrency}
                onCurrencyChange={setToCurrency}
                showRates={true}
                className="w-full"
              />
            </div>
          </div>

          {/* Conversion Result */}
          {convertedAmount && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-blue-600 font-medium">Converted Amount</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {formatCurrency(convertedAmount, toCurrency)}
                  </div>
                  {rate && (
                    <div className="text-sm text-blue-600">
                      Rate: 1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
                    </div>
                  )}
                </div>
                {loading && (
                  <ArrowPathIcon className="h-6 w-6 text-blue-600 animate-spin" />
                )}
              </div>
            </motion.div>
          )}

          {/* Historical Rates Chart */}
          {showHistory && historicalRates.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-200 pt-4"
            >
              <h4 className="text-sm font-medium text-gray-900 mb-3">7-Day Rate History</h4>
              <div className="space-y-2">
                {historicalRates.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{new Date(item.date).toLocaleDateString()}</span>
                    <span className="font-medium">{item.rate.toFixed(4)}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Info */}
          <div className="flex items-start text-sm text-gray-500">
            <InformationCircleIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p>Rates are updated in real-time. Historical data shows the last 7 days.</p>
              <p className="mt-1">For large amounts, consider consulting a financial advisor.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencyConverter;

