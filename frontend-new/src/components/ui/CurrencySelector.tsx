'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown, 
  Search, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Info
} from 'lucide-react';

interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate?: number;
  change?: number;
}

interface CurrencySelectorProps {
  value: string;
  onChange: (currency: string) => void;
  showRates?: boolean;
  className?: string;
  disabled?: boolean;
}

export default function CurrencySelector({
  value,
  onChange,
  showRates = false,
  className = '',
  disabled = false
}: CurrencySelectorProps) {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [filteredCurrencies, setFilteredCurrencies] = useState<Currency[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);

  useEffect(() => {
    loadCurrencies();
  }, []);

  useEffect(() => {
    if (value && currencies.length > 0) {
      const currency = currencies.find(c => c.code === value);
      setSelectedCurrency(currency || null);
    }
  }, [value, currencies]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = currencies.filter(currency =>
        currency.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        currency.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCurrencies(filtered);
    } else {
      setFilteredCurrencies(currencies);
    }
  }, [searchTerm, currencies]);

  const loadCurrencies = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/exchange-rates/currencies');
      if (response.ok) {
        const data = await response.json();
        const currencyList = data.data.currencies.map((code: string) => ({
          code,
          name: code,
          symbol: getCurrencySymbol(code)
        }));
        setCurrencies(currencyList);
        setFilteredCurrencies(currencyList);
      }
    } catch (error) {
      console.error('Failed to load currencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrencySymbol = (currency: string): string => {
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
      'GMD': 'D',
      'GNF': 'FG',
      'LRD': 'L$',
      'SLL': 'Le',
      'STD': 'Db',
      'XOF': 'CFA',
      'XAF': 'FCFA',
      'XPF': '₣'
    };
    return symbols[currency] || currency;
  };

  const handleCurrencySelect = (currency: Currency) => {
    onChange(currency.code);
    setSelectedCurrency(currency);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const formatRate = (rate: number): string => {
    return rate.toFixed(4);
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-3 w-3 text-green-600" />;
    if (change < 0) return <TrendingDown className="h-3 w-3 text-red-600" />;
    return null;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        type="button"
        variant="outline"
        onClick={handleToggle}
        disabled={disabled}
        className="w-full justify-between"
      >
        <div className="flex items-center space-x-2">
          {selectedCurrency ? (
            <>
              <span className="font-medium">{selectedCurrency.symbol}</span>
              <span>{selectedCurrency.code}</span>
            </>
          ) : (
            <span>Select Currency</span>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border rounded-md shadow-lg">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search currencies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Loading currencies...</span>
              </div>
            ) : filteredCurrencies.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No currencies found
              </div>
            ) : (
              <div className="py-1">
                {filteredCurrencies.map((currency) => (
                  <button
                    key={currency.code}
                    type="button"
                    onClick={() => handleCurrencySelect(currency)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-medium">{currency.symbol}</span>
                      <div>
                        <div className="font-medium">{currency.code}</div>
                        <div className="text-sm text-muted-foreground">{currency.name}</div>
                      </div>
                    </div>
                    
                    {showRates && currency.rate && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">
                          {formatRate(currency.rate)}
                        </span>
                        {currency.change !== undefined && (
                          <div className="flex items-center space-x-1">
                            {getChangeIcon(currency.change)}
                            <span className={`text-xs ${getChangeColor(currency.change)}`}>
                              {Math.abs(currency.change).toFixed(2)}%
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-2 border-t bg-gray-50">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={loadCurrencies}
              disabled={loading}
              className="w-full"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Rates
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

