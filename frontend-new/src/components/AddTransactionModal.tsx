'use client';

import { useState } from 'react';
import { CalendarIcon, CurrencyDollarIcon, DocumentTextIcon, TagIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import InteractiveModal from './InteractiveModal';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: any) => void;
  initialData?: any;
}

export default function AddTransactionModal({ isOpen, onClose, onSave, initialData }: AddTransactionModalProps) {
  const [formData, setFormData] = useState({
    description: initialData?.description || '',
    amount: initialData?.amount || '',
    category: initialData?.category || '',
    subcategory: initialData?.subcategory || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    vendor: initialData?.vendor || '',
    account: initialData?.account || '',
    type: initialData?.type || 'expense',
    notes: initialData?.notes || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'Office Supplies', 'Travel', 'Marketing', 'Software', 'Meals',
    'Utilities', 'Rent', 'Professional Services', 'Insurance', 'Other'
  ];

  const accounts = [
    'Business Checking', 'Business Savings', 'Business Credit Card',
    'Petty Cash', 'Accounts Payable', 'Accounts Receivable'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const transaction = {
        ...formData,
        id: Date.now(),
        amount: parseFloat(formData.amount),
        createdAt: new Date().toISOString(),
        status: 'pending'
      };

      onSave(transaction);
      onClose();
      
      // Reset form
      setFormData({
        description: '',
        amount: '',
        category: '',
        subcategory: '',
        date: new Date().toISOString().split('T')[0],
        vendor: '',
        account: '',
        type: 'expense',
        notes: '',
      });
    } catch (error) {
      console.error('Error saving transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <InteractiveModal isOpen={isOpen} onClose={onClose} title="Add New Transaction" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Transaction Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="expense"
                checked={formData.type === 'expense'}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="mr-2"
              />
              Expense
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="income"
                checked={formData.type === 'income'}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="mr-2"
              />
              Income
            </label>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DocumentTextIcon className="inline h-4 w-4 mr-1" />
            Description
          </label>
          <input
            type="text"
            required
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter transaction description"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <CurrencyDollarIcon className="inline h-4 w-4 mr-1" />
            Amount
          </label>
          <input
            type="number"
            required
            step="0.01"
            value={formData.amount}
            onChange={(e) => handleInputChange('amount', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0.00"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <CalendarIcon className="inline h-4 w-4 mr-1" />
            Date
          </label>
          <input
            type="date"
            required
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <TagIcon className="inline h-4 w-4 mr-1" />
            Category
          </label>
          <select
            required
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Vendor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <BuildingOfficeIcon className="inline h-4 w-4 mr-1" />
            Vendor/Client
          </label>
          <input
            type="text"
            value={formData.vendor}
            onChange={(e) => handleInputChange('vendor', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter vendor or client name"
          />
        </div>

        {/* Account */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Account</label>
          <select
            value={formData.account}
            onChange={(e) => handleInputChange('account', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select an account</option>
            {accounts.map(account => (
              <option key={account} value={account}>{account}</option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Additional notes (optional)"
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Transaction'}
          </button>
        </div>
      </form>
    </InteractiveModal>
  );
}




