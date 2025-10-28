'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DollarSign, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  Calculator,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

interface Currency {
  code: string;
  name: string;
  symbol: string;
}

interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  timestamp: string;
}

interface MultiCurrencyTransactionFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
  loading?: boolean;
}

export default function MultiCurrencyTransactionForm({
  onSubmit,
  onCancel,
  initialData,
  loading = false
}: MultiCurrencyTransactionFormProps) {
  const [formData, setFormData] = useState({
    amount: initialData?.amount || 0,
    currency: initialData?.currency || 'USD',
    description: initialData?.description || '',
    category: initialData?.category || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    type: initialData?.type || 'expense',
    exchangeRate: 1,
    baseAmount: 0,
    baseCurrency: 'USD'
  });

  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [loadingRates, setLoadingRates] = useState(false);
  const [showConversion, setShowConversion] = useState(false);

  useEffect(() => {
    loadCurrencies();
  }, []);

  useEffect(() => {
    if (formData.currency !== formData.baseCurrency && formData.amount > 0) {
      loadExchangeRate();
    }
  }, [formData.currency, formData.baseCurrency, formData.amount]);

  const loadCurrencies = async () => {
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
      }
    } catch (error) {
      console.error('Failed to load currencies:', error);
    }
  };

  const loadExchangeRate = async () => {
    if (formData.currency === formData.baseCurrency) {
      setExchangeRate({
        from: formData.baseCurrency,
        to: formData.currency,
        rate: 1,
        timestamp: new Date().toISOString()
      });
      setConvertedAmount(formData.amount);
      return;
    }

    setLoadingRates(true);
    try {
      const response = await fetch(
        `/api/exchange-rates/rate?from=${formData.baseCurrency}&to=${formData.currency}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setExchangeRate(data.data);
        setConvertedAmount(formData.amount * data.data.rate);
        setFormData(prev => ({ ...prev, exchangeRate: data.data.rate }));
      } else {
        throw new Error('Failed to load exchange rate');
      }
    } catch (error) {
      console.error('Failed to load exchange rate:', error);
      toast.error('Failed to load exchange rate');
    } finally {
      setLoadingRates(false);
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
      'NZD': 'NZ$'
    };
    return symbols[currency] || currency;
  };

  const formatCurrency = (amount: number, currency: string): string => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      }).format(amount);
    } catch (error) {
      const symbol = getCurrencySymbol(currency);
      return `${symbol}${amount.toFixed(2)}`;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const transactionData = {
      ...formData,
      exchangeRate: exchangeRate?.rate || 1,
      convertedAmount,
      baseAmount: formData.currency === formData.baseCurrency ? formData.amount : convertedAmount
    };

    onSubmit(transactionData);
  };

  const handleAmountChange = (value: string) => {
    const amount = parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, amount }));
  };

  const handleCurrencyChange = (currency: string) => {
    setFormData(prev => ({ ...prev, currency }));
  };

  const handleBaseCurrencyChange = (baseCurrency: string) => {
    setFormData(prev => ({ ...prev, baseCurrency }));
  };

  const toggleConversion = () => {
    setShowConversion(!showConversion);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5" />
          <span>Multi-Currency Transaction</span>
        </CardTitle>
        <CardDescription>
          Create a transaction with automatic currency conversion
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Transaction Type */}
          <div className="space-y-2">
            <Label>Transaction Type</Label>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant={formData.type === 'income' ? 'default' : 'outline'}
                onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
                className="flex-1"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Income
              </Button>
              <Button
                type="button"
                variant={formData.type === 'expense' ? 'default' : 'outline'}
                onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
                className="flex-1"
              >
                <TrendingDown className="h-4 w-4 mr-2" />
                Expense
              </Button>
            </div>
          </div>

          {/* Amount and Currency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0.00"
                  required
                />
                <div className="absolute right-3 top-3 text-sm text-muted-foreground">
                  {getCurrencySymbol(formData.currency)}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <select
                id="currency"
                value={formData.currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="w-full p-2 border rounded"
                required
              >
                {currencies.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Base Currency */}
          <div className="space-y-2">
            <Label htmlFor="base-currency">Base Currency (for reporting)</Label>
            <select
              id="base-currency"
              value={formData.baseCurrency}
              onChange={(e) => handleBaseCurrencyChange(e.target.value)}
              className="w-full p-2 border rounded"
              required
            >
              {currencies.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>

          {/* Exchange Rate Display */}
          {formData.currency !== formData.baseCurrency && (
            <div className="bg-blue-50 p-4 rounded space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Exchange Rate</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={loadExchangeRate}
                  disabled={loadingRates}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loadingRates ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              
              {exchangeRate && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>1 {formData.baseCurrency} =</span>
                    <span className="font-medium">
                      {exchangeRate.rate.toFixed(4)} {formData.currency}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Converted Amount:</span>
                    <span className="font-medium">
                      {formatCurrency(convertedAmount, formData.baseCurrency)}
                    </span>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Rate updated: {new Date(exchangeRate.timestamp).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Conversion Details */}
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              onClick={toggleConversion}
              className="w-full"
            >
              <Calculator className="h-4 w-4 mr-2" />
              {showConversion ? 'Hide' : 'Show'} Conversion Details
            </Button>
            
            {showConversion && (
              <div className="bg-gray-50 p-4 rounded space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Original Amount:</span>
                    <div className="font-medium">
                      {formatCurrency(formData.amount, formData.currency)}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Base Amount:</span>
                    <div className="font-medium">
                      {formatCurrency(convertedAmount, formData.baseCurrency)}
                    </div>
                  </div>
                </div>
                
                {exchangeRate && (
                  <div className="text-xs text-muted-foreground">
                    Exchange Rate: 1 {formData.baseCurrency} = {exchangeRate.rate.toFixed(4)} {formData.currency}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Transaction description"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              placeholder="Transaction category"
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>

          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This transaction will be recorded in {formData.currency} and automatically 
              converted to {formData.baseCurrency} for reporting purposes.
            </AlertDescription>
          </Alert>

          {/* Submit Buttons */}
          <div className="flex space-x-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Creating...' : 'Create Transaction'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}