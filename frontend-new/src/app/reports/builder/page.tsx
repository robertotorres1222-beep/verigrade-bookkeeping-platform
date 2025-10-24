'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Plus, 
  Save, 
  Play, 
  Download, 
  Settings, 
  Trash2, 
  Edit,
  Copy,
  RefreshCw,
  Database,
  Filter,
  SortAsc,
  Group,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  PieChart,
  LineChart,
  BarChart,
  Table
} from 'lucide-react';
import { toast } from 'sonner';

interface QueryField {
  id: string;
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  table: string;
  label: string;
  description?: string;
}

interface QueryCondition {
  id: string;
  field: string;
  operator: string;
  value: any;
  logic: 'AND' | 'OR';
}

interface QueryGroupBy {
  id: string;
  field: string;
  order: 'ASC' | 'DESC';
}

interface QueryOrderBy {
  id: string;
  field: string;
  order: 'ASC' | 'DESC';
}

interface QueryAggregation {
  id: string;
  field: string;
  function: 'SUM' | 'COUNT' | 'AVG' | 'MIN' | 'MAX';
  alias: string;
}

interface ReportBuilder {
  id?: string;
  name: string;
  description: string;
  table: string;
  fields: string[];
  conditions: QueryCondition[];
  groupBy: QueryGroupBy[];
  orderBy: QueryOrderBy[];
  aggregations: QueryAggregation[];
  limit: number;
  chartType?: 'table' | 'bar' | 'line' | 'pie';
  chartConfig?: any;
}

export default function ReportBuilderPage() {
  const [report, setReport] = useState<ReportBuilder>({
    name: '',
    description: '',
    table: '',
    fields: [],
    conditions: [],
    groupBy: [],
    orderBy: [],
    aggregations: [],
    limit: 100
  });

  const [availableFields, setAvailableFields] = useState<QueryField[]>([]);
  const [availableTables, setAvailableTables] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const fieldTypes = [
    { value: 'string', label: 'Text', icon: FileText },
    { value: 'number', label: 'Number', icon: DollarSign },
    { value: 'date', label: 'Date', icon: Calendar },
    { value: 'boolean', label: 'Boolean', icon: Settings }
  ];

  const operators = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Not Contains' },
    { value: 'starts_with', label: 'Starts With' },
    { value: 'ends_with', label: 'Ends With' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'greater_equal', label: 'Greater or Equal' },
    { value: 'less_equal', label: 'Less or Equal' },
    { value: 'between', label: 'Between' },
    { value: 'in', label: 'In' },
    { value: 'not_in', label: 'Not In' },
    { value: 'is_null', label: 'Is Null' },
    { value: 'is_not_null', label: 'Is Not Null' }
  ];

  const aggregationFunctions = [
    { value: 'SUM', label: 'Sum' },
    { value: 'COUNT', label: 'Count' },
    { value: 'AVG', label: 'Average' },
    { value: 'MIN', label: 'Minimum' },
    { value: 'MAX', label: 'Maximum' }
  ];

  const chartTypes = [
    { value: 'table', label: 'Table', icon: Table },
    { value: 'bar', label: 'Bar Chart', icon: BarChart },
    { value: 'line', label: 'Line Chart', icon: LineChart },
    { value: 'pie', label: 'Pie Chart', icon: PieChart }
  ];

  useEffect(() => {
    loadAvailableFields();
    loadAvailableTables();
  }, []);

  const loadAvailableFields = async () => {
    try {
      const response = await fetch('/api/reports/fields');
      if (response.ok) {
        const data = await response.json();
        setAvailableFields(data.data.fields || []);
      }
    } catch (error) {
      console.error('Failed to load fields:', error);
    }
  };

  const loadAvailableTables = async () => {
    try {
      const response = await fetch('/api/reports/tables');
      if (response.ok) {
        const data = await response.json();
        setAvailableTables(data.data.tables || []);
      }
    } catch (error) {
      console.error('Failed to load tables:', error);
    }
  };

  const handleAddField = (fieldId: string) => {
    if (!report.fields.includes(fieldId)) {
      setReport(prev => ({
        ...prev,
        fields: [...prev.fields, fieldId]
      }));
    }
  };

  const handleRemoveField = (fieldId: string) => {
    setReport(prev => ({
      ...prev,
      fields: prev.fields.filter(id => id !== fieldId)
    }));
  };

  const handleAddCondition = () => {
    const newCondition: QueryCondition = {
      id: Date.now().toString(),
      field: '',
      operator: 'equals',
      value: '',
      logic: 'AND'
    };
    setReport(prev => ({
      ...prev,
      conditions: [...prev.conditions, newCondition]
    }));
  };

  const handleUpdateCondition = (id: string, updates: Partial<QueryCondition>) => {
    setReport(prev => ({
      ...prev,
      conditions: prev.conditions.map(condition =>
        condition.id === id ? { ...condition, ...updates } : condition
      )
    }));
  };

  const handleRemoveCondition = (id: string) => {
    setReport(prev => ({
      ...prev,
      conditions: prev.conditions.filter(condition => condition.id !== id)
    }));
  };

  const handleAddGroupBy = () => {
    const newGroupBy: QueryGroupBy = {
      id: Date.now().toString(),
      field: '',
      order: 'ASC'
    };
    setReport(prev => ({
      ...prev,
      groupBy: [...prev.groupBy, newGroupBy]
    }));
  };

  const handleUpdateGroupBy = (id: string, updates: Partial<QueryGroupBy>) => {
    setReport(prev => ({
      ...prev,
      groupBy: prev.groupBy.map(groupBy =>
        groupBy.id === id ? { ...groupBy, ...updates } : groupBy
      )
    }));
  };

  const handleRemoveGroupBy = (id: string) => {
    setReport(prev => ({
      ...prev,
      groupBy: prev.groupBy.filter(groupBy => groupBy.id !== id)
    }));
  };

  const handleAddOrderBy = () => {
    const newOrderBy: QueryOrderBy = {
      id: Date.now().toString(),
      field: '',
      order: 'ASC'
    };
    setReport(prev => ({
      ...prev,
      orderBy: [...prev.orderBy, newOrderBy]
    }));
  };

  const handleUpdateOrderBy = (id: string, updates: Partial<QueryOrderBy>) => {
    setReport(prev => ({
      ...prev,
      orderBy: prev.orderBy.map(orderBy =>
        orderBy.id === id ? { ...orderBy, ...updates } : orderBy
      )
    }));
  };

  const handleRemoveOrderBy = (id: string) => {
    setReport(prev => ({
      ...prev,
      orderBy: prev.orderBy.filter(orderBy => orderBy.id !== id)
    }));
  };

  const handleAddAggregation = () => {
    const newAggregation: QueryAggregation = {
      id: Date.now().toString(),
      field: '',
      function: 'SUM',
      alias: ''
    };
    setReport(prev => ({
      ...prev,
      aggregations: [...prev.aggregations, newAggregation]
    }));
  };

  const handleUpdateAggregation = (id: string, updates: Partial<QueryAggregation>) => {
    setReport(prev => ({
      ...prev,
      aggregations: prev.aggregations.map(aggregation =>
        aggregation.id === id ? { ...aggregation, ...updates } : aggregation
      )
    }));
  };

  const handleRemoveAggregation = (id: string) => {
    setReport(prev => ({
      ...prev,
      aggregations: prev.aggregations.filter(aggregation => aggregation.id !== id)
    }));
  };

  const handlePreview = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/reports/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      });

      if (response.ok) {
        const data = await response.json();
        setPreviewData(data.data.results || []);
        setShowPreview(true);
        toast.success('Report preview generated');
      } else {
        throw new Error('Failed to generate preview');
      }
    } catch (error) {
      toast.error('Failed to generate preview');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!report.name || !report.table) {
      toast.error('Please provide a name and select a table');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      });

      if (response.ok) {
        toast.success('Report saved successfully');
      } else {
        throw new Error('Failed to save report');
      }
    } catch (error) {
      toast.error('Failed to save report');
    } finally {
      setLoading(false);
    }
  };

  const getFieldById = (fieldId: string) => {
    return availableFields.find(field => field.id === fieldId);
  };

  const getFieldTypeIcon = (type: string) => {
    const fieldType = fieldTypes.find(ft => ft.value === type);
    return fieldType ? fieldType.icon : FileText;
  };

  const getChartTypeIcon = (type: string) => {
    const chartType = chartTypes.find(ct => ct.value === type);
    return chartType ? chartType.icon : Table;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          <h1 className="text-3xl font-bold">Report Builder</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handlePreview}
            disabled={loading}
          >
            <Play className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="builder" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="builder">Query Builder</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="chart">Chart</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Report Information</CardTitle>
              <CardDescription>
                Configure the basic settings for your report
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="report-name">Report Name</Label>
                  <Input
                    id="report-name"
                    value={report.name}
                    onChange={(e) => setReport(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter report name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="report-table">Data Source</Label>
                  <select
                    id="report-table"
                    value={report.table}
                    onChange={(e) => setReport(prev => ({ ...prev, table: e.target.value }))}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select data source</option>
                    {availableTables.map(table => (
                      <option key={table} value={table}>
                        {table}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="report-description">Description</Label>
                <textarea
                  id="report-description"
                  value={report.description}
                  onChange={(e) => setReport(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this report shows"
                  className="w-full p-2 border rounded"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Fields Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Fields</CardTitle>
              <CardDescription>
                Choose which fields to include in your report
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Available Fields</Label>
                  <div className="max-h-60 overflow-y-auto border rounded p-2 space-y-1">
                    {availableFields.map(field => (
                      <div
                        key={field.id}
                        className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-2">
                          {React.createElement(getFieldTypeIcon(field.type), { className: "h-4 w-4" })}
                          <div>
                            <p className="font-medium">{field.label}</p>
                            <p className="text-sm text-muted-foreground">{field.table}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddField(field.id)}
                          disabled={report.fields.includes(field.id)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Selected Fields</Label>
                  <div className="max-h-60 overflow-y-auto border rounded p-2 space-y-1">
                    {report.fields.map(fieldId => {
                      const field = getFieldById(fieldId);
                      if (!field) return null;
                      return (
                        <div
                          key={fieldId}
                          className="flex items-center justify-between p-2 border rounded bg-blue-50"
                        >
                          <div className="flex items-center space-x-2">
                            {React.createElement(getFieldTypeIcon(field.type), { className: "h-4 w-4" })}
                            <div>
                              <p className="font-medium">{field.label}</p>
                              <p className="text-sm text-muted-foreground">{field.table}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveField(fieldId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conditions */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>
                Add conditions to filter your data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {report.conditions.map((condition, index) => (
                <div key={condition.id} className="flex items-center space-x-2 p-3 border rounded">
                  {index > 0 && (
                    <select
                      value={condition.logic}
                      onChange={(e) => handleUpdateCondition(condition.id, { logic: e.target.value as 'AND' | 'OR' })}
                      className="p-1 border rounded"
                    >
                      <option value="AND">AND</option>
                      <option value="OR">OR</option>
                    </select>
                  )}
                  
                  <select
                    value={condition.field}
                    onChange={(e) => handleUpdateCondition(condition.id, { field: e.target.value })}
                    className="p-2 border rounded"
                  >
                    <option value="">Select field</option>
                    {availableFields.map(field => (
                      <option key={field.id} value={field.id}>
                        {field.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={condition.operator}
                    onChange={(e) => handleUpdateCondition(condition.id, { operator: e.target.value })}
                    className="p-2 border rounded"
                  >
                    {operators.map(op => (
                      <option key={op.value} value={op.value}>
                        {op.label}
                      </option>
                    ))}
                  </select>

                  <Input
                    value={condition.value}
                    onChange={(e) => handleUpdateCondition(condition.id, { value: e.target.value })}
                    placeholder="Value"
                    className="flex-1"
                  />

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveCondition(condition.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button
                variant="outline"
                onClick={handleAddCondition}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Filter
              </Button>
            </CardContent>
          </Card>

          {/* Group By */}
          <Card>
            <CardHeader>
              <CardTitle>Group By</CardTitle>
              <CardDescription>
                Group your data by specific fields
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {report.groupBy.map(groupBy => (
                <div key={groupBy.id} className="flex items-center space-x-2 p-3 border rounded">
                  <select
                    value={groupBy.field}
                    onChange={(e) => handleUpdateGroupBy(groupBy.id, { field: e.target.value })}
                    className="p-2 border rounded flex-1"
                  >
                    <option value="">Select field</option>
                    {availableFields.map(field => (
                      <option key={field.id} value={field.id}>
                        {field.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={groupBy.order}
                    onChange={(e) => handleUpdateGroupBy(groupBy.id, { order: e.target.value as 'ASC' | 'DESC' })}
                    className="p-2 border rounded"
                  >
                    <option value="ASC">Ascending</option>
                    <option value="DESC">Descending</option>
                  </select>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveGroupBy(groupBy.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button
                variant="outline"
                onClick={handleAddGroupBy}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Group By
              </Button>
            </CardContent>
          </Card>

          {/* Order By */}
          <Card>
            <CardHeader>
              <CardTitle>Sort Order</CardTitle>
              <CardDescription>
                Define how your data should be sorted
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {report.orderBy.map(orderBy => (
                <div key={orderBy.id} className="flex items-center space-x-2 p-3 border rounded">
                  <select
                    value={orderBy.field}
                    onChange={(e) => handleUpdateOrderBy(orderBy.id, { field: e.target.value })}
                    className="p-2 border rounded flex-1"
                  >
                    <option value="">Select field</option>
                    {availableFields.map(field => (
                      <option key={field.id} value={field.id}>
                        {field.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={orderBy.order}
                    onChange={(e) => handleUpdateOrderBy(orderBy.id, { order: e.target.value as 'ASC' | 'DESC' })}
                    className="p-2 border rounded"
                  >
                    <option value="ASC">Ascending</option>
                    <option value="DESC">Descending</option>
                  </select>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveOrderBy(orderBy.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button
                variant="outline"
                onClick={handleAddOrderBy}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Sort
              </Button>
            </CardContent>
          </Card>

          {/* Aggregations */}
          <Card>
            <CardHeader>
              <CardTitle>Aggregations</CardTitle>
              <CardDescription>
                Add calculations to your report
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {report.aggregations.map(aggregation => (
                <div key={aggregation.id} className="flex items-center space-x-2 p-3 border rounded">
                  <select
                    value={aggregation.function}
                    onChange={(e) => handleUpdateAggregation(aggregation.id, { function: e.target.value as any })}
                    className="p-2 border rounded"
                  >
                    {aggregationFunctions.map(func => (
                      <option key={func.value} value={func.value}>
                        {func.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={aggregation.field}
                    onChange={(e) => handleUpdateAggregation(aggregation.id, { field: e.target.value })}
                    className="p-2 border rounded flex-1"
                  >
                    <option value="">Select field</option>
                    {availableFields.map(field => (
                      <option key={field.id} value={field.id}>
                        {field.label}
                      </option>
                    ))}
                  </select>

                  <Input
                    value={aggregation.alias}
                    onChange={(e) => handleUpdateAggregation(aggregation.id, { alias: e.target.value })}
                    placeholder="Alias"
                    className="flex-1"
                  />

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveAggregation(aggregation.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button
                variant="outline"
                onClick={handleAddAggregation}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Aggregation
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Preview</CardTitle>
              <CardDescription>
                Preview your report data
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Generating preview...</span>
                </div>
              ) : previewData.length === 0 ? (
                <Alert>
                  <BarChart3 className="h-4 w-4" />
                  <AlertDescription>
                    No preview data available. Click "Preview" to generate a preview of your report.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {previewData.length} rows found
                    </p>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          {Object.keys(previewData[0] || {}).map(key => (
                            <th key={key} className="text-left p-2 font-medium">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.slice(0, 10).map((row, index) => (
                          <tr key={index} className="border-b">
                            {Object.values(row).map((value, cellIndex) => (
                              <td key={cellIndex} className="p-2">
                                {String(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {previewData.length > 10 && (
                    <p className="text-sm text-muted-foreground text-center">
                      Showing first 10 rows of {previewData.length} total rows
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chart" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chart Configuration</CardTitle>
              <CardDescription>
                Configure how your data should be visualized
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Chart Type</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {chartTypes.map(chartType => (
                    <Button
                      key={chartType.value}
                      variant={report.chartType === chartType.value ? 'default' : 'outline'}
                      onClick={() => setReport(prev => ({ ...prev, chartType: chartType.value as any }))}
                      className="flex flex-col items-center space-y-2 h-auto py-4"
                    >
                      {React.createElement(chartType.icon, { className: "h-6 w-6" })}
                      <span>{chartType.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {report.chartType && report.chartType !== 'table' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>X-Axis Field</Label>
                      <select
                        value={report.chartConfig?.xAxis || ''}
                        onChange={(e) => setReport(prev => ({
                          ...prev,
                          chartConfig: { ...prev.chartConfig, xAxis: e.target.value }
                        }))}
                        className="w-full p-2 border rounded"
                      >
                        <option value="">Select field</option>
                        {report.fields.map(fieldId => {
                          const field = getFieldById(fieldId);
                          return field ? (
                            <option key={fieldId} value={fieldId}>
                              {field.label}
                            </option>
                          ) : null;
                        })}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>Y-Axis Field</Label>
                      <select
                        value={report.chartConfig?.yAxis || ''}
                        onChange={(e) => setReport(prev => ({
                          ...prev,
                          chartConfig: { ...prev.chartConfig, yAxis: e.target.value }
                        }))}
                        className="w-full p-2 border rounded"
                      >
                        <option value="">Select field</option>
                        {report.fields.map(fieldId => {
                          const field = getFieldById(fieldId);
                          return field ? (
                            <option key={fieldId} value={fieldId}>
                              {field.label}
                            </option>
                          ) : null;
                        })}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Chart Title</Label>
                    <Input
                      value={report.chartConfig?.title || ''}
                      onChange={(e) => setReport(prev => ({
                        ...prev,
                        chartConfig: { ...prev.chartConfig, title: e.target.value }
                      }))}
                      placeholder="Enter chart title"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}