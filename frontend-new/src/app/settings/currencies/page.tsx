'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CurrencySelector from '@/components/CurrencySelector';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
  GlobeAltIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  isDefault: boolean;
  isActive: boolean;
  exchangeRate?: number;
  lastUpdated?: string;
}

export default function CurrencyManagementPage() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingRates, setIsUpdatingRates] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [newCurrency, setNewCurrency] = useState({
    code: '',
    name: '',
    symbol: '',
    isDefault: false
  });

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockCurrencies: Currency[] = [
      {
        id: '1',
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        isDefault: true,
        isActive: true,
        exchangeRate: 1,
        lastUpdated: new Date().toISOString()
      },
      {
        id: '2',
        code: 'EUR',
        name: 'Euro',
        symbol: '€',
        isDefault: false,
        isActive: true,
        exchangeRate: 0.85,
        lastUpdated: new Date().toISOString()
      },
      {
        id: '3',
        code: 'GBP',
        name: 'British Pound',
        symbol: '£',
        isDefault: false,
        isActive: true,
        exchangeRate: 0.73,
        lastUpdated: new Date().toISOString()
      },
      {
        id: '4',
        code: 'JPY',
        name: 'Japanese Yen',
        symbol: '¥',
        isDefault: false,
        isActive: true,
        exchangeRate: 110.25,
        lastUpdated: new Date().toISOString()
      }
    ];

    setTimeout(() => {
      setCurrencies(mockCurrencies);
      setIsLoading(false);
    }, 500);
  }, []);

  const handleAddCurrency = () => {
    if (!newCurrency.code || !newCurrency.name || !newCurrency.symbol) {
      alert('Please fill in all fields');
      return;
    }

    const currency: Currency = {
      id: Date.now().toString(),
      code: newCurrency.code.toUpperCase(),
      name: newCurrency.name,
      symbol: newCurrency.symbol,
      isDefault: newCurrency.isDefault,
      isActive: true,
      exchangeRate: newCurrency.isDefault ? 1 : undefined
    };

    setCurrencies(prev => [...prev, currency]);
    setNewCurrency({ code: '', name: '', symbol: '', isDefault: false });
    setShowAddForm(false);
  };

  const handleEditCurrency = (currency: Currency) => {
    setEditingCurrency(currency);
  };

  const handleUpdateCurrency = () => {
    if (!editingCurrency) return;

    setCurrencies(prev => 
      prev.map(c => 
        c.id === editingCurrency.id 
          ? { ...c, ...editingCurrency }
          : c
      )
    );
    setEditingCurrency(null);
  };

  const handleDeleteCurrency = (currency: Currency) => {
    if (currency.isDefault) {
      alert('Cannot delete default currency');
      return;
    }

    if (confirm(`Are you sure you want to delete ${currency.code}?`)) {
      setCurrencies(prev => prev.filter(c => c.id !== currency.id));
    }
  };

  const handleSetDefault = (currency: Currency) => {
    setCurrencies(prev => 
      prev.map(c => ({
        ...c,
        isDefault: c.id === currency.id
      }))
    );
  };

  const handleUpdateExchangeRates = async () => {
    setIsUpdatingRates(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update exchange rates (mock)
    setCurrencies(prev => 
      prev.map(c => ({
        ...c,
        exchangeRate: c.isDefault ? 1 : Math.random() * 2,
        lastUpdated: new Date().toISOString()
      }))
    );
    
    setIsUpdatingRates(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading currencies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Currency Management</h1>
              <p className="mt-2 text-gray-600">
                Manage your organization's currencies and exchange rates
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleUpdateExchangeRates}
                disabled={isUpdatingRates}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <ArrowPathIcon className={`h-4 w-4 mr-2 ${isUpdatingRates ? 'animate-spin' : ''}`} />
                {isUpdatingRates ? 'Updating...' : 'Update Rates'}
              </button>
              
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Currency
              </button>
            </div>
          </div>
        </div>

        {/* Add Currency Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Currency</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency Code
                </label>
                <input
                  type="text"
                  value={newCurrency.code}
                  onChange={(e) => setNewCurrency({ ...newCurrency, code: e.target.value })}
                  placeholder="USD"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency Name
                </label>
                <input
                  type="text"
                  value={newCurrency.name}
                  onChange={(e) => setNewCurrency({ ...newCurrency, name: e.target.value })}
                  placeholder="US Dollar"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Symbol
                </label>
                <input
                  type="text"
                  value={newCurrency.symbol}
                  onChange={(e) => setNewCurrency({ ...newCurrency, symbol: e.target.value })}
                  placeholder="$"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                id="isDefault"
                checked={newCurrency.isDefault}
                onChange={(e) => setNewCurrency({ ...newCurrency, isDefault: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                Set as default currency
              </label>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCurrency}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Add Currency
              </button>
            </div>
          </motion.div>
        )}

        {/* Currencies List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Currencies</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {currencies.map((currency) => (
              <motion.div
                key={currency.id}
                className="px-6 py-4 hover:bg-gray-50"
                whileHover={{ x: 4 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                      <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">
                            {currency.code}
                          </span>
                          {currency.isDefault && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <StarIcon className="h-3 w-3 mr-1" />
                              Default
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {currency.name} ({currency.symbol})
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {currency.exchangeRate && !currency.isDefault && (
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {currency.exchangeRate.toFixed(4)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {currency.lastUpdated && new Date(currency.lastUpdated).toLocaleTimeString()}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      {!currency.isDefault && (
                        <button
                          onClick={() => handleSetDefault(currency)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Set Default
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleEditCurrency(currency)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      
                      {!currency.isDefault && (
                        <button
                          onClick={() => handleDeleteCurrency(currency)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Exchange Rate Info */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <div className="flex items-start">
            <CheckCircleIcon className="h-5 w-5 text-blue-400 mt-0.5 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">Exchange Rate Information</h4>
              <p className="mt-1 text-sm text-blue-700">
                Exchange rates are updated automatically every 5 minutes. You can manually refresh rates using the "Update Rates" button above.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
