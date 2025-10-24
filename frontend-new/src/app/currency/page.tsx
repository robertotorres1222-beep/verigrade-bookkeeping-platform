'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  ChartBarIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import CurrencySelector from '../../components/CurrencySelector';
import CurrencyConverter from '../../components/CurrencyConverter';

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  rate: number;
  isDefault: boolean;
  isActive: boolean;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface CurrencyManagementProps {}

const CurrencyManagement: React.FC<CurrencyManagementProps> = () => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [newCurrency, setNewCurrency] = useState({
    code: '',
    name: '',
    symbol: '',
    rate: 1,
    isDefault: false
  });

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const fetchCurrencies = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/currencies', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCurrencies(data.data);
      } else {
        // Fallback data
        setCurrencies(getFallbackCurrencies());
      }
    } catch (error) {
      console.error('Error fetching currencies:', error);
      setCurrencies(getFallbackCurrencies());
      toast.error('Failed to load currencies');
    } finally {
      setLoading(false);
    }
  };

  const getFallbackCurrencies = (): Currency[] => [
    {
      id: '1',
      code: 'USD',
      name: 'US Dollar',
      symbol: '$',
      rate: 1,
      isDefault: true,
      isActive: true,
      lastUpdated: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      code: 'EUR',
      name: 'Euro',
      symbol: '€',
      rate: 0.85,
      isDefault: false,
      isActive: true,
      lastUpdated: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      code: 'GBP',
      name: 'British Pound',
      symbol: '£',
      rate: 0.73,
      isDefault: false,
      isActive: true,
      lastUpdated: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const handleAddCurrency = async () => {
    try {
      const response = await fetch('/api/currencies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(newCurrency)
      });

      if (response.ok) {
        toast.success('Currency added successfully');
        setShowAddModal(false);
        setNewCurrency({ code: '', name: '', symbol: '', rate: 1, isDefault: false });
        fetchCurrencies();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to add currency');
      }
    } catch (error) {
      console.error('Error adding currency:', error);
      toast.error('Failed to add currency');
    }
  };

  const handleEditCurrency = async () => {
    if (!editingCurrency) return;

    try {
      const response = await fetch(`/api/currencies/${editingCurrency.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(editingCurrency)
      });

      if (response.ok) {
        toast.success('Currency updated successfully');
        setShowEditModal(false);
        setEditingCurrency(null);
        fetchCurrencies();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to update currency');
      }
    } catch (error) {
      console.error('Error updating currency:', error);
      toast.error('Failed to update currency');
    }
  };

  const handleDeleteCurrency = async (id: string) => {
    if (!confirm('Are you sure you want to delete this currency?')) return;

    try {
      const response = await fetch(`/api/currencies/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        toast.success('Currency deleted successfully');
        fetchCurrencies();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to delete currency');
      }
    } catch (error) {
      console.error('Error deleting currency:', error);
      toast.error('Failed to delete currency');
    }
  };

  const handleRefreshRates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/currencies/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        toast.success('Currency rates refreshed');
        fetchCurrencies();
      } else {
        toast.error('Failed to refresh rates');
      }
    } catch (error) {
      console.error('Error refreshing rates:', error);
      toast.error('Failed to refresh rates');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const response = await fetch(`/api/currencies/${id}/set-default`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        toast.success('Default currency updated');
        fetchCurrencies();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to set default currency');
      }
    } catch (error) {
      console.error('Error setting default currency:', error);
      toast.error('Failed to set default currency');
    }
  };

  const formatRate = (rate: number) => {
    if (rate >= 1) {
      return rate.toFixed(2);
    } else {
      return rate.toFixed(4);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Currency Management</h1>
          <p className="text-gray-600">Manage currencies and exchange rates</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleRefreshRates}
            disabled={loading}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Rates
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Currency
          </button>
        </div>
      </div>

      {/* Currency Converter */}
      <CurrencyConverter className="mb-6" />

      {/* Currencies List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Supported Currencies</h3>
            <div className="text-sm text-gray-500">
              {currencies.length} currencies
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <ArrowPathIcon className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Loading currencies...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Currency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currencies.map((currency) => (
                    <tr key={currency.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-lg mr-3">{currency.symbol}</span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {currency.code}
                              {currency.isDefault && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Default
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{currency.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatRate(currency.rate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          currency.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {currency.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {currency.lastUpdated.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {!currency.isDefault && (
                            <button
                              onClick={() => handleSetDefault(currency.id)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Set as default"
                            >
                              <GlobeAltIcon className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditingCurrency(currency);
                              setShowEditModal(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit currency"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          {!currency.isDefault && (
                            <button
                              onClick={() => handleDeleteCurrency(currency.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete currency"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Currency Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Currency</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency Code
                </label>
                <input
                  type="text"
                  value={newCurrency.code}
                  onChange={(e) => setNewCurrency({...newCurrency, code: e.target.value.toUpperCase()})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="USD"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency Name
                </label>
                <input
                  type="text"
                  value={newCurrency.name}
                  onChange={(e) => setNewCurrency({...newCurrency, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="US Dollar"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Symbol
                </label>
                <input
                  type="text"
                  value={newCurrency.symbol}
                  onChange={(e) => setNewCurrency({...newCurrency, symbol: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="$"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exchange Rate
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={newCurrency.rate}
                  onChange={(e) => setNewCurrency({...newCurrency, rate: parseFloat(e.target.value) || 0})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1.0000"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={newCurrency.isDefault}
                  onChange={(e) => setNewCurrency({...newCurrency, isDefault: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-900">
                  Set as default currency
                </label>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAddCurrency}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Add Currency
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Currency Modal */}
      {showEditModal && editingCurrency && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Currency</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency Code
                </label>
                <input
                  type="text"
                  value={editingCurrency.code}
                  onChange={(e) => setEditingCurrency({...editingCurrency, code: e.target.value.toUpperCase()})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency Name
                </label>
                <input
                  type="text"
                  value={editingCurrency.name}
                  onChange={(e) => setEditingCurrency({...editingCurrency, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Symbol
                </label>
                <input
                  type="text"
                  value={editingCurrency.symbol}
                  onChange={(e) => setEditingCurrency({...editingCurrency, symbol: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exchange Rate
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={editingCurrency.rate}
                  onChange={(e) => setEditingCurrency({...editingCurrency, rate: parseFloat(e.target.value) || 0})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="editIsDefault"
                  checked={editingCurrency.isDefault}
                  onChange={(e) => setEditingCurrency({...editingCurrency, isDefault: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="editIsDefault" className="ml-2 block text-sm text-gray-900">
                  Set as default currency
                </label>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleEditCurrency}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Update Currency
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingCurrency(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencyManagement;