'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDownIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  CheckIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number;
  lastUpdated: Date;
  isDefault?: boolean;
}

interface CurrencySelectorProps {
  selectedCurrency: string;
  onCurrencyChange: (currency: string) => void;
  showRates?: boolean;
  className?: string;
  disabled?: boolean;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  selectedCurrency,
  onCurrencyChange,
  showRates = false,
  className = '',
  disabled = false
}) => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const fetchCurrencies = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/currencies?includeRates=true', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCurrencies(data.data);
        setLastUpdated(new Date());
      } else {
        // Fallback to static currencies
        setCurrencies(getStaticCurrencies());
      }
    } catch (error) {
      console.error('Error fetching currencies:', error);
      setCurrencies(getStaticCurrencies());
      toast.error('Failed to load currencies');
    } finally {
      setLoading(false);
    }
  };

  const getStaticCurrencies = (): Currency[] => [
    { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1, lastUpdated: new Date(), isDefault: true },
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

  const handleCurrencySelect = (currency: Currency) => {
    onCurrencyChange(currency.code);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleRefresh = async () => {
    await fetchCurrencies();
    toast.success('Currency rates updated');
  };

  const filteredCurrencies = currencies.filter(currency =>
    currency.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    currency.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCurrencyData = currencies.find(c => c.code === selectedCurrency);

  const formatRate = (rate: number) => {
    if (rate >= 1) {
      return rate.toFixed(2);
    } else {
      return rate.toFixed(4);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Selected Currency Display */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center">
          {selectedCurrencyData && (
            <>
              <span className="text-lg mr-2">{selectedCurrencyData.symbol}</span>
              <div>
                <div className="font-medium">{selectedCurrencyData.code}</div>
                <div className="text-xs text-gray-500">{selectedCurrencyData.name}</div>
              </div>
            </>
          )}
          {!selectedCurrencyData && (
            <div className="flex items-center">
              <GlobeAltIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-500">Select Currency</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {showRates && selectedCurrencyData && (
            <div className="text-sm text-gray-500">
              {formatRate(selectedCurrencyData.rate)}
            </div>
          )}
          <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-hidden"
          >
            {/* Header */}
            <div className="p-3 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900">Select Currency</h3>
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  title="Refresh rates"
                >
                  <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search currencies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Currency List */}
            <div className="max-h-60 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  <ArrowPathIcon className="h-6 w-6 animate-spin mx-auto mb-2" />
                  Loading currencies...
                </div>
              ) : filteredCurrencies.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No currencies found
                </div>
              ) : (
                filteredCurrencies.map((currency) => (
                  <button
                    key={currency.code}
                    onClick={() => handleCurrencySelect(currency)}
                    className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                  >
                    <div className="flex items-center">
                      <span className="text-lg mr-3">{currency.symbol}</span>
                      <div>
                        <div className="font-medium text-gray-900">{currency.code}</div>
                        <div className="text-sm text-gray-500">{currency.name}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {currency.isDefault && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          Default
                        </span>
                      )}
                      {showRates && (
                        <div className="text-sm text-gray-500">
                          {formatRate(currency.rate)}
                        </div>
                      )}
                      {selectedCurrency === currency.code && (
                        <CheckIcon className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            {lastUpdated && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <div className="text-xs text-gray-500 text-center">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default CurrencySelector;