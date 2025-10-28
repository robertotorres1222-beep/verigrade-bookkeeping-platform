'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronUp, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Star,
  Award,
  Target,
  Zap,
  Shield,
  DollarSign,
  Users,
  Calendar,
  BarChart3
} from 'lucide-react';

interface ComparisonItem {
  id: string;
  name: string;
  description?: string;
  category?: string;
  image?: string;
  features: Record<string, any>;
  metadata?: {
    price?: number;
    rating?: number;
    status?: 'active' | 'inactive' | 'pending' | 'recommended';
    tags?: string[];
    [key: string]: any;
  };
}

interface ComparisonTableProps {
  items: ComparisonItem[];
  features: Array<{
    key: string;
    label: string;
    type: 'text' | 'boolean' | 'number' | 'rating' | 'status' | 'badge' | 'trend';
    description?: string;
    weight?: number;
  }>;
  showFilters?: boolean;
  showSearch?: boolean;
  showSorting?: boolean;
  showExport?: boolean;
  maxItems?: number;
  className?: string;
}

export default function ComparisonTable({
  items,
  features,
  showFilters = true,
  showSearch = true,
  showSorting = true,
  showExport = true,
  maxItems = 10,
  className = ''
}: ComparisonTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedFeatures, setExpandedFeatures] = useState<Set<string>>(new Set());
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    if (sortBy) {
      filtered.sort((a, b) => {
        const aValue = a.features[sortBy];
        const bValue = b.features[sortBy];
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        const aStr = String(aValue || '').toLowerCase();
        const bStr = String(bValue || '').toLowerCase();
        return sortOrder === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
      });
    }

    return filtered.slice(0, maxItems);
  }, [items, searchTerm, selectedCategory, sortBy, sortOrder, maxItems]);

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(items.map(item => item.category).filter(Boolean))];
    return uniqueCategories;
  }, [items]);

  // Get feature statistics
  const featureStats = useMemo(() => {
    const stats: Record<string, { min: number; max: number; avg: number }> = {};
    
    features.forEach(feature => {
      if (feature.type === 'number') {
        const values = filteredAndSortedItems
          .map(item => item.features[feature.key])
          .filter(value => typeof value === 'number');
        
        if (values.length > 0) {
          stats[feature.key] = {
            min: Math.min(...values),
            max: Math.max(...values),
            avg: values.reduce((sum, val) => sum + val, 0) / values.length
          };
        }
      }
    });
    
    return stats;
  }, [features, filteredAndSortedItems]);

  const toggleFeatureExpansion = (featureKey: string) => {
    const newExpanded = new Set(expandedFeatures);
    if (newExpanded.has(featureKey)) {
      newExpanded.delete(featureKey);
    } else {
      newExpanded.add(featureKey);
    }
    setExpandedFeatures(newExpanded);
  };

  const toggleItemSelection = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const selectAllItems = () => {
    if (selectedItems.size === filteredAndSortedItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredAndSortedItems.map(item => item.id)));
    }
  };

  const handleSort = (featureKey: string) => {
    if (sortBy === featureKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(featureKey);
      setSortOrder('asc');
    }
  };

  const getFeatureValue = (item: ComparisonItem, feature: any) => {
    const value = item.features[feature.key];
    
    switch (feature.type) {
      case 'boolean':
        return value ? (
          <CheckCircle className="w-5 h-5 text-green-600" />
        ) : (
          <XCircle className="w-5 h-5 text-red-600" />
        );
      
      case 'rating':
        const rating = Number(value) || 0;
        return (
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
              />
            ))}
            <span className="ml-1 text-sm text-gray-600">{rating}</span>
          </div>
        );
      
      case 'status':
        const status = String(value || '');
        const statusColors = {
          active: 'bg-green-100 text-green-800',
          inactive: 'bg-red-100 text-red-800',
          pending: 'bg-yellow-100 text-yellow-800',
          recommended: 'bg-blue-100 text-blue-800'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
            {status}
          </span>
        );
      
      case 'badge':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {String(value || '')}
          </span>
        );
      
      case 'trend':
        const trendValue = Number(value) || 0;
        const isPositive = trendValue > 0;
        const isNegative = trendValue < 0;
        return (
          <div className="flex items-center space-x-1">
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : isNegative ? (
              <TrendingDown className="w-4 h-4 text-red-600" />
            ) : (
              <Minus className="w-4 h-4 text-gray-400" />
            )}
            <span className={`text-sm font-medium ${
              isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'
            }`}>
              {Math.abs(trendValue)}%
            </span>
          </div>
        );
      
      case 'number':
        const numValue = Number(value) || 0;
        const stats = featureStats[feature.key];
        if (stats) {
          const isHigh = numValue >= stats.avg;
          const isLow = numValue <= stats.min;
          return (
            <div className="flex items-center space-x-2">
              <span className={`font-medium ${isHigh ? 'text-green-600' : isLow ? 'text-red-600' : 'text-gray-900'}`}>
                {numValue.toLocaleString()}
              </span>
              {isHigh && <Award className="w-4 h-4 text-green-600" />}
            </div>
          );
        }
        return <span className="font-medium">{numValue.toLocaleString()}</span>;
      
      default:
        return <span className="text-gray-900">{String(value || '')}</span>;
    }
  };

  const exportData = () => {
    const csvData = [
      ['Name', ...features.map(f => f.label)],
      ...filteredAndSortedItems.map(item => [
        item.name,
        ...features.map(f => String(item.features[f.key] || ''))
      ])
    ];
    
    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'comparison.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Comparison Table</h3>
            <p className="text-sm text-gray-500">
              Compare {filteredAndSortedItems.length} items across {features.length} features
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {showExport && (
              <button
                onClick={exportData}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Export CSV
              </button>
            )}
          </div>
        </div>

        {/* Filters and Search */}
        {(showSearch || showFilters) && (
          <div className="flex flex-wrap gap-4">
            {showSearch && (
              <div className="flex-1 min-w-64">
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
            
            {showFilters && categories.length > 0 && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === filteredAndSortedItems.length && filteredAndSortedItems.length > 0}
                    onChange={selectAllItems}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Select All</span>
                </label>
              </th>
              
              {filteredAndSortedItems.map((item) => (
                <th key={item.id} className="px-4 py-3 text-center">
                  <div className="flex flex-col items-center space-y-2">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div className="text-center">
                      <div className="font-medium text-gray-900">{item.name}</div>
                      {item.description && (
                        <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                      )}
                      {item.metadata?.price && (
                        <div className="text-sm font-semibold text-green-600 mt-1">
                          ${item.metadata.price}
                        </div>
                      )}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-200">
            {features.map((feature) => (
              <motion.tr
                key={feature.key}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-gray-50"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleFeatureExpansion(feature.key)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      {expandedFeatures.has(feature.key) ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    <div>
                      <div className="font-medium text-gray-900">{feature.label}</div>
                      {feature.description && (
                        <div className="text-xs text-gray-500">{feature.description}</div>
                      )}
                    </div>
                    {showSorting && (
                      <button
                        onClick={() => handleSort(feature.key)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        <BarChart3 className="w-4 h-4 text-gray-400" />
                      </button>
                    )}
                  </div>
                </td>
                
                {filteredAndSortedItems.map((item) => (
                  <td key={item.id} className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center">
                      {getFeatureValue(item, feature)}
                    </div>
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selected Items Summary */}
      {selectedItems.size > 0 && (
        <div className="p-4 bg-blue-50 border-t border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">
              {selectedItems.size} item{selectedItems.size > 1 ? 's' : ''} selected
            </span>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                Compare Selected
              </button>
              <button className="px-3 py-1 bg-white text-blue-600 border border-blue-600 rounded text-sm hover:bg-blue-50 transition-colors">
                Export Selected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

