'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  File, 
  Calendar,
  Database,
  Settings,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';

interface ExportFormat {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  extension: string;
  mimeType: string;
}

interface ExportOption {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: string;
}

interface DataExportProps {
  isOpen: boolean;
  onClose: () => void;
  dataType: string;
  data: any[];
}

export default function DataExport({ isOpen, onClose, dataType, data }: DataExportProps) {
  const [selectedFormat, setSelectedFormat] = useState<string>('csv');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const exportFormats: ExportFormat[] = [
    {
      id: 'csv',
      name: 'CSV',
      description: 'Comma-separated values for Excel',
      icon: <FileSpreadsheet className="w-5 h-5" />,
      extension: 'csv',
      mimeType: 'text/csv'
    },
    {
      id: 'excel',
      name: 'Excel',
      description: 'Microsoft Excel format',
      icon: <FileSpreadsheet className="w-5 h-5" />,
      extension: 'xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    },
    {
      id: 'json',
      name: 'JSON',
      description: 'JavaScript Object Notation',
      icon: <FileText className="w-5 h-5" />,
      extension: 'json',
      mimeType: 'application/json'
    },
    {
      id: 'pdf',
      name: 'PDF',
      description: 'Portable Document Format',
      icon: <File className="w-5 h-5" />,
      extension: 'pdf',
      mimeType: 'application/pdf'
    }
  ];

  const exportOptions: ExportOption[] = [
    {
      id: 'includeHeaders',
      name: 'Include Headers',
      description: 'Add column headers to the export',
      enabled: true,
      category: 'Formatting'
    },
    {
      id: 'includeMetadata',
      name: 'Include Metadata',
      description: 'Add creation date and user info',
      enabled: true,
      category: 'Formatting'
    },
    {
      id: 'includeTotals',
      name: 'Include Totals',
      description: 'Add summary rows with totals',
      enabled: false,
      category: 'Formatting'
    },
    {
      id: 'includeCharts',
      name: 'Include Charts',
      description: 'Embed charts in Excel/PDF exports',
      enabled: false,
      category: 'Visual'
    },
    {
      id: 'groupByCategory',
      name: 'Group by Category',
      description: 'Organize data by categories',
      enabled: false,
      category: 'Organization'
    },
    {
      id: 'sortByDate',
      name: 'Sort by Date',
      description: 'Sort records chronologically',
      enabled: true,
      category: 'Organization'
    }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simulate export process with progress
      const steps = [
        'Preparing data...',
        'Applying filters...',
        'Formatting data...',
        'Generating file...',
        'Finalizing export...'
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setExportProgress(((i + 1) / steps.length) * 100);
      }

      // Generate the actual file
      const format = exportFormats.find(f => f.id === selectedFormat);
      if (!format) return;

      const exportData = generateExportData(data, selectedOptions, dateRange);
      const blob = createBlob(exportData, format);
      
      // Download the file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${dataType}-export-${new Date().toISOString().split('T')[0]}.${format.extension}`;
      a.click();
      URL.revokeObjectURL(url);

      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const generateExportData = (data: any[], options: string[], dateRange: any) => {
    let processedData = [...data];

    // Apply date range filter
    if (dateRange.start && dateRange.end) {
      processedData = processedData.filter(item => {
        const itemDate = new Date(item.date || item.createdAt);
        return itemDate >= new Date(dateRange.start) && itemDate <= new Date(dateRange.end);
      });
    }

    // Apply sorting
    if (options.includes('sortByDate')) {
      processedData.sort((a, b) => new Date(a.date || a.createdAt).getTime() - new Date(b.date || b.createdAt).getTime());
    }

    // Apply grouping
    if (options.includes('groupByCategory')) {
      const grouped = processedData.reduce((acc, item) => {
        const category = item.category || 'Uncategorized';
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
      }, {} as Record<string, any[]>);
      
      processedData = Object.entries(grouped).flatMap(([category, items]) => [
        { category, isGroupHeader: true },
        ...(items as any[])
      ]);
    }

    return processedData;
  };

  const createBlob = (data: any[], format: ExportFormat) => {
    let content: string;
    let mimeType = format.mimeType;

    switch (format.id) {
      case 'csv':
        content = convertToCSV(data);
        break;
      case 'json':
        content = JSON.stringify(data, null, 2);
        break;
      case 'excel':
        // For Excel, we'll create a CSV that Excel can open
        content = convertToCSV(data);
        mimeType = 'text/csv';
        break;
      case 'pdf':
        // For PDF, we'll create a simple text representation
        content = convertToText(data);
        mimeType = 'text/plain';
        break;
      default:
        content = JSON.stringify(data, null, 2);
    }

    return new Blob([content], { type: mimeType });
  };

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  };

  const convertToText = (data: any[]) => {
    return data.map((item, index) => 
      `${index + 1}. ${JSON.stringify(item, null, 2)}`
    ).join('\n\n');
  };

  const toggleOption = (optionId: string) => {
    setSelectedOptions(prev => 
      prev.includes(optionId) 
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Download className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Export Data</h2>
                <p className="text-sm text-gray-500">Export {dataType} data in your preferred format</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            {/* Format Selection */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Export Format</h3>
              <div className="grid grid-cols-2 gap-3">
                {exportFormats.map((format) => (
                  <button
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedFormat === format.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        selectedFormat === format.id ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        {format.icon}
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-gray-900">{format.name}</div>
                        <div className="text-sm text-gray-500">{format.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Date Range</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Export Options</h3>
              <div className="space-y-3">
                {exportOptions.map((option) => (
                  <label key={option.id} className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedOptions.includes(option.id)}
                      onChange={() => toggleOption(option.id)}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{option.name}</div>
                      <div className="text-sm text-gray-500">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500">
              {data.length} records will be exported
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Progress Overlay */}
          <AnimatePresence>
            {isExporting && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center"
              >
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <div className="text-lg font-medium text-gray-900 mb-2">Exporting Data</div>
                  <div className="w-64 bg-gray-200 rounded-full h-2 mb-2">
                    <motion.div
                      className="bg-blue-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${exportProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <div className="text-sm text-gray-500">{Math.round(exportProgress)}% complete</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

