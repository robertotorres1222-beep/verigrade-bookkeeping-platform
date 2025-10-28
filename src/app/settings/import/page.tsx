'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  BarChart3,
  Users,
  DollarSign,
  Settings,
  RefreshCw,
  X,
  Plus,
  Edit,
  Trash2,
  Eye,
  Play,
  Pause
} from 'lucide-react';
import { toast } from 'sonner';

interface ImportJob {
  id: string;
  name: string;
  type: 'CSV' | 'QBO' | 'XERO' | 'EXCEL';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  totalRecords: number;
  processedRecords: number;
  errors: number;
  createdAt: Date;
  completedAt?: Date;
  errorMessage?: string;
}

interface FieldMapping {
  sourceField: string;
  targetField: string;
  dataType: string;
  required: boolean;
  transformation?: string;
}

interface ImportTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  fields: FieldMapping[];
  createdAt: Date;
}

export default function ImportWizardPage() {
  const [activeTab, setActiveTab] = useState('wizard');
  const [importJobs, setImportJobs] = useState<ImportJob[]>([]);
  const [templates, setTemplates] = useState<ImportTemplate[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<string>('');
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const importTypes = [
    {
      id: 'CSV',
      name: 'CSV File',
      description: 'Import data from a CSV file',
      icon: <FileText className="h-8 w-8" />,
      supportedFormats: ['.csv'],
      maxSize: '10MB'
    },
    {
      id: 'QBO',
      name: 'QuickBooks Online',
      description: 'Import from QuickBooks Online',
      icon: <BarChart3 className="h-8 w-8" />,
      supportedFormats: ['.qbo'],
      maxSize: '50MB'
    },
    {
      id: 'XERO',
      name: 'Xero',
      description: 'Import from Xero accounting software',
      icon: <DollarSign className="h-8 w-8" />,
      supportedFormats: ['.xlsx', '.csv'],
      maxSize: '25MB'
    },
    {
      id: 'EXCEL',
      name: 'Excel File',
      description: 'Import data from an Excel spreadsheet',
      icon: <FileText className="h-8 w-8" />,
      supportedFormats: ['.xlsx', '.xls'],
      maxSize: '20MB'
    }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setCurrentStep(2);
      toast.success('File selected successfully');
    }
  };

  const handleImportTypeSelect = (type: string) => {
    setImportType(type);
    setCurrentStep(2);
  };

  const processFile = async () => {
    if (!selectedFile || !importType) return;

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', importType);

      const response = await fetch('/api/import/process', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setPreviewData(data.preview);
        setFieldMappings(data.mappings);
        setCurrentStep(3);
        toast.success('File processed successfully');
      } else {
        throw new Error('Failed to process file');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  };

  const validateMappings = () => {
    const errors: string[] = [];
    
    fieldMappings.forEach((mapping, index) => {
      if (mapping.required && !mapping.targetField) {
        errors.push(`Field ${index + 1}: Required field must be mapped`);
      }
    });

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const startImport = async () => {
    if (!validateMappings()) {
      toast.error('Please fix validation errors before importing');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/import/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: selectedFile?.name,
          type: importType,
          mappings: fieldMappings
        })
      });

      if (response.ok) {
        const job = await response.json();
        setImportJobs(prev => [job, ...prev]);
        setCurrentStep(4);
        toast.success('Import job started');
      } else {
        throw new Error('Failed to start import');
      }
    } catch (error) {
      console.error('Error starting import:', error);
      toast.error('Failed to start import');
    } finally {
      setIsProcessing(false);
    }
  };

  const updateFieldMapping = (index: number, field: keyof FieldMapping, value: string) => {
    setFieldMappings(prev => prev.map((mapping, i) => 
      i === index ? { ...mapping, [field]: value } : mapping
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'processing': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'failed': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Upload className="h-6 w-6 text-blue-600" />
          <h1 className="text-3xl font-bold">Import Wizard</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="wizard">Import Wizard</TabsTrigger>
          <TabsTrigger value="jobs">Import Jobs</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="wizard" className="space-y-6">
          {/* Step 1: Select Import Type */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 1: Select Import Type</CardTitle>
                <CardDescription>
                  Choose the type of data you want to import
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {importTypes.map((type) => (
                    <div
                      key={type.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        importType === type.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleImportTypeSelect(type.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-blue-600">{type.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-medium">{type.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>Max size: {type.maxSize}</span>
                            <span>Formats: {type.supportedFormats.join(', ')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Upload File */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 2: Upload File</CardTitle>
                <CardDescription>
                  Upload your {importType} file to import
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {selectedFile ? selectedFile.name : 'Click to upload file'}
                    </h3>
                    <p className="text-gray-600">
                      {selectedFile 
                        ? 'File selected successfully' 
                        : 'Drag and drop your file here, or click to browse'
                      }
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={importTypes.find(t => t.id === importType)?.supportedFormats.join(',')}
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>

                  {selectedFile && (
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="font-medium">{selectedFile.name}</p>
                          <p className="text-sm text-gray-600">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button onClick={processFile} disabled={isProcessing}>
                        {isProcessing ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4 mr-2" />
                        )}
                        {isProcessing ? 'Processing...' : 'Process File'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Field Mapping */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 3: Field Mapping</CardTitle>
                <CardDescription>
                  Map your file fields to VeriGrade fields
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Field Mappings */}
                    <div>
                      <h4 className="font-medium mb-4">Field Mappings</h4>
                      <div className="space-y-3">
                        {fieldMappings.map((mapping, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <div className="flex-1">
                              <label className="text-sm font-medium text-gray-700">
                                {mapping.sourceField}
                              </label>
                              <select
                                value={mapping.targetField}
                                onChange={(e) => updateFieldMapping(index, 'targetField', e.target.value)}
                                className="w-full mt-1 p-2 border rounded-md"
                              >
                                <option value="">Select target field</option>
                                <option value="amount">Amount</option>
                                <option value="description">Description</option>
                                <option value="date">Date</option>
                                <option value="category">Category</option>
                                <option value="customer">Customer</option>
                                <option value="type">Type</option>
                                <option value="notes">Notes</option>
                              </select>
                            </div>
                            <div className="flex items-center space-x-2">
                              <label className="flex items-center space-x-1">
                                <input
                                  type="checkbox"
                                  checked={mapping.required}
                                  onChange={(e) => updateFieldMapping(index, 'required', e.target.checked.toString())}
                                />
                                <span className="text-sm">Required</span>
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Data Preview */}
                    <div>
                      <h4 className="font-medium mb-4">Data Preview</h4>
                      <div className="border rounded-lg overflow-hidden">
                        <div className="max-h-64 overflow-y-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                {fieldMappings.map((mapping, index) => (
                                  <th key={index} className="p-2 text-left font-medium">
                                    {mapping.sourceField}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {previewData.slice(0, 5).map((row, rowIndex) => (
                                <tr key={rowIndex} className="border-t">
                                  {fieldMappings.map((mapping, colIndex) => (
                                    <td key={colIndex} className="p-2">
                                      {row[mapping.sourceField] || '-'}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Validation Errors */}
                  {validationErrors.length > 0 && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        <div>
                          <strong>Validation Errors:</strong>
                          <ul className="mt-2 space-y-1">
                            {validationErrors.map((error, index) => (
                              <li key={index} className="text-sm">{error}</li>
                            ))}
                          </ul>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4">
                    <Button variant="outline" onClick={() => setCurrentStep(2)}>
                      Back
                    </Button>
                    <Button onClick={startImport} disabled={isProcessing}>
                      {isProcessing ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      {isProcessing ? 'Starting Import...' : 'Start Import'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Import Progress */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 4: Import Progress</CardTitle>
                <CardDescription>
                  Your import is being processed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <RefreshCw className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Importing Data</h3>
                    <p className="text-gray-600">
                      Please wait while your data is being imported...
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>0%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: '0%' }} />
                    </div>
                  </div>

                  <div className="text-center">
                    <Button variant="outline" onClick={() => setCurrentStep(1)}>
                      Start New Import
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="jobs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Import Jobs</CardTitle>
              <CardDescription>
                Track the status of your import jobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {importJobs.length === 0 ? (
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      No import jobs yet. Start an import to see jobs here.
                    </AlertDescription>
                  </Alert>
                ) : (
                  importJobs.map((job) => (
                    <div key={job.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium">{job.name}</h4>
                            <Badge className={getStatusColor(job.status)}>
                              {getStatusIcon(job.status)}
                              <span className="ml-1">{job.status}</span>
                            </Badge>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>Type: {job.type}</span>
                            <span>Records: {job.processedRecords}/{job.totalRecords}</span>
                            <span>Errors: {job.errors}</span>
                            <span>Created: {job.createdAt.toLocaleString()}</span>
                          </div>
                          
                          {job.status === 'processing' && (
                            <div className="mt-2">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progress</span>
                                <span>{Math.round((job.processedRecords / job.totalRecords) * 100)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${(job.processedRecords / job.totalRecords) * 100}%` }}
                                />
                              </div>
                            </div>
                          )}
                          
                          {job.errorMessage && (
                            <Alert className="mt-2 border-red-200 bg-red-50">
                              <AlertCircle className="h-4 w-4 text-red-600" />
                              <AlertDescription className="text-red-800">
                                {job.errorMessage}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Import Templates</CardTitle>
              <CardDescription>
                Save and reuse field mappings for common import types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.length === 0 ? (
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      No templates saved yet. Create templates to speed up future imports.
                    </AlertDescription>
                  </Alert>
                ) : (
                  templates.map((template) => (
                    <div key={template.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{template.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>Type: {template.type}</span>
                            <span>Fields: {template.fields.length}</span>
                            <span>Created: {template.createdAt.toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

