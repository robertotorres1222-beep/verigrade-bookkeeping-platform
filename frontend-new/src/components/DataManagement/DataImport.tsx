'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  FileSpreadsheet, 
  File, 
  CheckCircle, 
  AlertCircle,
  X,
  Database,
  Settings,
  Eye,
  Download
} from 'lucide-react';

interface ImportFormat {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  acceptedTypes: string[];
  maxSize: number; // in MB
}

interface ImportMapping {
  sourceField: string;
  targetField: string;
  required: boolean;
  dataType: string;
}

interface DataImportProps {
  isOpen: boolean;
  onClose: () => void;
  dataType: string;
}

export default function DataImport({ isOpen, onClose, dataType }: DataImportProps) {
  const [selectedFormat, setSelectedFormat] = useState<string>('csv');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [fieldMappings, setFieldMappings] = useState<ImportMapping[]>([]);
  const [importSettings, setImportSettings] = useState({
    skipFirstRow: true,
    createNewRecords: true,
    updateExisting: false,
    validateData: true
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<any>(null);

  const importFormats: ImportFormat[] = [
    {
      id: 'csv',
      name: 'CSV',
      description: 'Comma-separated values',
      icon: <FileSpreadsheet className="w-5 h-5" />,
      acceptedTypes: ['.csv', 'text/csv'],
      maxSize: 10
    },
    {
      id: 'excel',
      name: 'Excel',
      description: 'Microsoft Excel format',
      icon: <FileSpreadsheet className="w-5 h-5" />,
      acceptedTypes: ['.xlsx', '.xls', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      maxSize: 20
    },
    {
      id: 'json',
      name: 'JSON',
      description: 'JavaScript Object Notation',
      icon: <FileText className="w-5 h-5" />,
      acceptedTypes: ['.json', 'application/json'],
      maxSize: 5
    },
    {
      id: 'quickbooks',
      name: 'QuickBooks',
      description: 'QuickBooks export format',
      icon: <Database className="w-5 h-5" />,
      acceptedTypes: ['.qbo', '.qbw'],
      maxSize: 50
    }
  ];

  const handleFileUpload = useCallback((file: File) => {
    const format = importFormats.find(f => f.id === selectedFormat);
    if (!format) return;

    if (file.size > format.maxSize * 1024 * 1024) {
      alert(`File size must be less than ${format.maxSize}MB`);
      return;
    }

    setUploadedFile(file);
    parseFile(file);
  }, [selectedFormat]);

  const parseFile = async (file: File) => {
    try {
      const text = await file.text();
      let parsedData: any[] = [];

      switch (selectedFormat) {
        case 'csv':
          parsedData = parseCSV(text);
          break;
        case 'json':
          parsedData = JSON.parse(text);
          break;
        case 'excel':
          // For demo purposes, treat as CSV
          parsedData = parseCSV(text);
          break;
        default:
          parsedData = [];
      }

      setPreviewData(parsedData.slice(0, 10)); // Show first 10 rows
      generateFieldMappings(parsedData[0] || {});
    } catch (error) {
      console.error('Error parsing file:', error);
      alert('Error parsing file. Please check the format.');
    }
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });

    return data;
  };

  const generateFieldMappings = (sampleRow: any) => {
    const targetFields = getTargetFieldsForDataType(dataType);
    const mappings: ImportMapping[] = Object.keys(sampleRow).map(sourceField => ({
      sourceField,
      targetField: findBestMatch(sourceField, targetFields),
      required: targetFields.includes(findBestMatch(sourceField, targetFields)),
      dataType: 'string'
    }));

    setFieldMappings(mappings);
  };

  const getTargetFieldsForDataType = (type: string) => {
    const fieldMaps: Record<string, string[]> = {
      transactions: ['date', 'description', 'amount', 'category', 'account'],
      customers: ['name', 'email', 'phone', 'address', 'company'],
      vendors: ['name', 'email', 'phone', 'address', 'taxId'],
      invoices: ['number', 'date', 'dueDate', 'amount', 'status', 'customer']
    };
    
    return fieldMaps[type] || [];
  };

  const findBestMatch = (sourceField: string, targetFields: string[]) => {
    const source = sourceField.toLowerCase();
    return targetFields.find(target => 
      target.toLowerCase().includes(source) || 
      source.includes(target.toLowerCase())
    ) || targetFields[0] || '';
  };

  const handleImport = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    setImportProgress(0);

    try {
      // Simulate import process
      const steps = [
        'Validating data...',
        'Mapping fields...',
        'Processing records...',
        'Creating records...',
        'Finalizing import...'
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setImportProgress(((i + 1) / steps.length) * 100);
      }

      // Simulate import results
      const totalRecords = previewData.length;
      const successful = Math.floor(totalRecords * 0.9);
      const failed = totalRecords - successful;

      setImportResults({
        total: totalRecords,
        successful,
        failed,
        errors: failed > 0 ? [
          { row: 3, field: 'email', message: 'Invalid email format' },
          { row: 7, field: 'amount', message: 'Amount must be a number' }
        ] : []
      });

    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const templateData = getTargetFieldsForDataType(dataType).reduce((obj, field) => {
      obj[field] = '';
      return obj;
    }, {} as any);

    const csv = Object.keys(templateData).join(',') + '\n' + Object.values(templateData).join(',');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dataType}-template.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
          className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Upload className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Import Data</h2>
                <p className="text-sm text-gray-500">Import {dataType} data from external sources</p>
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
              <h3 className="text-lg font-medium text-gray-900 mb-3">Import Format</h3>
              <div className="grid grid-cols-2 gap-3">
                {importFormats.map((format) => (
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
                        <div className="text-xs text-gray-400">Max {format.maxSize}MB</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* File Upload */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Upload File</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                {uploadedFile ? (
                  <div className="space-y-2">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto" />
                    <div className="font-medium text-gray-900">{uploadedFile.name}</div>
                    <div className="text-sm text-gray-500">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                    <button
                      onClick={() => setUploadedFile(null)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                    <div className="font-medium text-gray-900">Drop your file here</div>
                    <div className="text-sm text-gray-500">
                      or click to browse
                    </div>
                    <input
                      type="file"
                      accept={importFormats.find(f => f.id === selectedFormat)?.acceptedTypes.join(',')}
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Field Mapping */}
            {fieldMappings.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Field Mapping</h3>
                <div className="space-y-3">
                  {fieldMappings.map((mapping, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-700">{mapping.sourceField}</div>
                        <div className="text-xs text-gray-500">Source field</div>
                      </div>
                      <div className="text-gray-400">→</div>
                      <div className="flex-1">
                        <select
                          value={mapping.targetField}
                          onChange={(e) => {
                            const newMappings = [...fieldMappings];
                            newMappings[index].targetField = e.target.value;
                            setFieldMappings(newMappings);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select target field</option>
                          {getTargetFieldsForDataType(dataType).map(field => (
                            <option key={field} value={field}>{field}</option>
                          ))}
                        </select>
                      </div>
                      {mapping.required && (
                        <div className="text-red-500 text-sm">Required</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Import Settings */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Import Settings</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={importSettings.skipFirstRow}
                    onChange={(e) => setImportSettings(prev => ({ ...prev, skipFirstRow: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Skip first row (headers)</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={importSettings.createNewRecords}
                    onChange={(e) => setImportSettings(prev => ({ ...prev, createNewRecords: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Create new records</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={importSettings.updateExisting}
                    onChange={(e) => setImportSettings(prev => ({ ...prev, updateExisting: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Update existing records</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={importSettings.validateData}
                    onChange={(e) => setImportSettings(prev => ({ ...prev, validateData: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Validate data before import</span>
                </label>
              </div>
            </div>

            {/* Data Preview */}
            {previewData.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Data Preview</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="max-h-48 overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {Object.keys(previewData[0] || {}).map((header, index) => (
                            <th key={index} className="px-3 py-2 text-left font-medium text-gray-700">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.map((row, rowIndex) => (
                          <tr key={rowIndex} className="border-t border-gray-200">
                            {Object.values(row).map((value, colIndex) => (
                              <td key={colIndex} className="px-3 py-2 text-gray-600">
                                {String(value).slice(0, 50)}
                                {String(value).length > 50 ? '...' : ''}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex space-x-3">
              <button
                onClick={downloadTemplate}
                className="flex items-center space-x-2 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Template</span>
              </button>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!uploadedFile || isProcessing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Import</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Progress Overlay */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center"
              >
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <div className="text-lg font-medium text-gray-900 mb-2">Importing Data</div>
                  <div className="w-64 bg-gray-200 rounded-full h-2 mb-2">
                    <motion.div
                      className="bg-blue-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${importProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <div className="text-sm text-gray-500">{Math.round(importProgress)}% complete</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Modal */}
          <AnimatePresence>
            {importResults && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
                >
                  <div className="text-center">
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Import Complete</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div>Total records: {importResults.total}</div>
                      <div className="text-green-600">Successful: {importResults.successful}</div>
                      {importResults.failed > 0 && (
                        <div className="text-red-600">Failed: {importResults.failed}</div>
                      )}
                    </div>
                    {importResults.errors.length > 0 && (
                      <div className="mt-4 text-left">
                        <div className="font-medium text-gray-900 mb-2">Errors:</div>
                        {importResults.errors.map((error: any, index: number) => (
                          <div key={index} className="text-sm text-red-600">
                            Row {error.row}: {error.message}
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setImportResults(null);
                        onClose();
                      }}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

