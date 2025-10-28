'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  Info,
  Calculator,
  Clock,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';

interface ConversionPreviewProps {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  onRateChange?: (rate: number) => void;
  showDetails?: boolean;
  className?: string;
}

interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  timestamp: string;
}

interface ConversionResult {
  originalAmount: number;
  convertedAmount: number;
  from: string;
  to: string;
  rate: number;
  symbol: string;
  formatted: string;
}

export default function CurrencyConversionPreview({
  amount,
  fromCurrency,
  toCurrency,
  onRateChange,
  showDetails = true,
  className = ''
}: ConversionPreviewProps) {
  const [conversion, setConversion] = useState<ConversionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (amount > 0 && fromCurrency && toCurrency) {
      loadConversion();
    }
  }, [amount, fromCurrency, toCurrency]);

  const loadConversion = async () => {
    if (fromCurrency === toCurrency) {
      setConversion({
        originalAmount: amount,
        convertedAmount: amount,
        from: fromCurrency,
        to: toCurrency,
        rate: 1,
        symbol: getCurrencySymbol(toCurrency),
        formatted: formatCurrency(amount, toCurrency)
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/exchange-rates/preview?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`
      );

      if (response.ok) {
        const data = await response.json();
        setConversion(data.data);
        setLastUpdated(new Date());
        
        if (onRateChange) {
          onRateChange(data.data.rate);
        }
      } else {
        throw new Error('Failed to load conversion');
      }
    } catch (error) {
      console.error('Failed to load conversion:', error);
      setError('Failed to load exchange rate');
      toast.error('Failed to load exchange rate');
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

  const formatRate = (rate: number): string => {
    return rate.toFixed(4);
  };

  const getRateChange = (): number => {
    // This would typically come from historical data
    // For now, return a mock value
    return Math.random() * 0.02 - 0.01; // -1% to +1%
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return null;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (fromCurrency === toCurrency) {
    return (
      <div className={`bg-gray-50 p-4 rounded ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Same Currency</p>
            <p className="font-medium">{formatCurrency(amount, fromCurrency)}</p>
          </div>
          <Badge variant="outline">No Conversion</Badge>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <Info className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button
            variant="outline"
            size="sm"
            onClick={loadConversion}
            className="ml-2"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!conversion) {
    return (
      <div className={`bg-gray-50 p-4 rounded ${className}`}>
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span className="text-sm text-muted-foreground">Loading conversion...</span>
        </div>
      </div>
    );
  }

  const rateChange = getRateChange();

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Currency Conversion</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={loadConversion}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        {lastUpdated && (
          <CardDescription>
            Last updated: {lastUpdated.toLocaleString()}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Conversion Result */}
        <div className="bg-blue-50 p-4 rounded">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Converted Amount</p>
              <p className="text-2xl font-bold text-blue-600">
                {conversion.formatted}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Exchange Rate</p>
              <p className="font-medium">
                1 {fromCurrency} = {formatRate(conversion.rate)} {toCurrency}
              </p>
            </div>
          </div>
        </div>

        {/* Rate Change */}
        {rateChange !== 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Rate Change (24h)</span>
            <div className="flex items-center space-x-2">
              {getChangeIcon(rateChange)}
              <span className={`text-sm font-medium ${getChangeColor(rateChange)}`}>
                {rateChange > 0 ? '+' : ''}{(rateChange * 100).toFixed(2)}%
              </span>
            </div>
          </div>
        )}

        {/* Detailed Breakdown */}
        {showDetails && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Original Amount:</span>
                <div className="font-medium">
                  {formatCurrency(conversion.originalAmount, fromCurrency)}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Converted Amount:</span>
                <div className="font-medium">
                  {formatCurrency(conversion.convertedAmount, toCurrency)}
                </div>
              </div>
            </div>

            <div className="border-t pt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Exchange Rate:</span>
                <span className="font-medium">
                  1 {fromCurrency} = {formatRate(conversion.rate)} {toCurrency}
                </span>
              </div>
            </div>

            <div className="bg-yellow-50 p-3 rounded">
              <div className="flex items-start space-x-2">
                <Info className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">Exchange Rate Notice</p>
                  <p className="text-yellow-700">
                    Exchange rates are updated daily and may vary based on market conditions. 
                    The rate shown is for informational purposes only.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // This would typically open a calculator or detailed view
              toast.info('Calculator feature coming soon');
            }}
            className="flex-1"
          >
            <Calculator className="h-4 w-4 mr-2" />
            Calculate
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // This would typically show historical rates
              toast.info('Historical rates feature coming soon');
            }}
            className="flex-1"
          >
            <Clock className="h-4 w-4 mr-2" />
            History
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

