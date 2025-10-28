'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Trash2, 
  CheckCircle,
  AlertCircle,
  Clock,
  Volume2,
  DollarSign,
  Calendar,
  Tag,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import VoiceRecorder from '../VoiceRecorder';

interface TransactionFormData {
  amount: string;
  description: string;
  category: string;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  customerId?: string;
  notes: string;
}

interface VoiceTransactionFormProps {
  onSubmit: (data: TransactionFormData) => void;
  onCancel: () => void;
  initialData?: Partial<TransactionFormData>;
  className?: string;
}

export default function VoiceTransactionForm({
  onSubmit,
  onCancel,
  initialData = {},
  className = ''
}: VoiceTransactionFormProps) {
  const [formData, setFormData] = useState<TransactionFormData>({
    amount: initialData.amount || '',
    description: initialData.description || '',
    category: initialData.category || '',
    date: initialData.date || new Date().toISOString().split('T')[0],
    type: initialData.type || 'EXPENSE',
    customerId: initialData.customerId || '',
    notes: initialData.notes || '',
  });

  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceConfidence, setVoiceConfidence] = useState(0);

  const handleInputChange = (field: keyof TransactionFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleVoiceTranscript = (transcript: string) => {
    setVoiceTranscript(transcript);
    setIsProcessingVoice(true);
    
    // Simulate processing the transcript to extract transaction data
    setTimeout(() => {
      const extractedData = extractTransactionData(transcript);
      
      if (extractedData.amount) {
        setFormData(prev => ({ ...prev, amount: extractedData.amount }));
      }
      
      if (extractedData.description) {
        setFormData(prev => ({ ...prev, description: extractedData.description }));
      }
      
      if (extractedData.category) {
        setFormData(prev => ({ ...prev, category: extractedData.category }));
      }
      
      if (extractedData.type) {
        setFormData(prev => ({ ...prev, type: extractedData.type }));
      }
      
      setVoiceConfidence(extractedData.confidence);
      setIsProcessingVoice(false);
      
      toast.success('Voice data processed successfully');
    }, 2000);
  };

  const extractTransactionData = (transcript: string) => {
    // Simple extraction logic - in a real app, you'd use more sophisticated NLP
    const lowerTranscript = transcript.toLowerCase();
    
    const data: any = {
      confidence: 0.8
    };
    
    // Extract amount
    const amountMatch = transcript.match(/\$?(\d+(?:\.\d{2})?)/);
    if (amountMatch) {
      data.amount = amountMatch[1];
    }
    
    // Extract description
    const descriptionKeywords = ['for', 'purchase', 'payment', 'expense', 'invoice'];
    const descriptionMatch = descriptionKeywords.find(keyword => 
      lowerTranscript.includes(keyword)
    );
    
    if (descriptionMatch) {
      const keywordIndex = lowerTranscript.indexOf(descriptionMatch);
      data.description = transcript.substring(keywordIndex).trim();
    }
    
    // Extract category
    const categoryKeywords = {
      'office supplies': ['office', 'supplies', 'stationery'],
      'travel': ['travel', 'trip', 'flight', 'hotel'],
      'meals': ['meal', 'lunch', 'dinner', 'food'],
      'utilities': ['electric', 'water', 'gas', 'internet'],
      'marketing': ['advertising', 'marketing', 'promotion'],
    };
    
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => lowerTranscript.includes(keyword))) {
        data.category = category;
        break;
      }
    }
    
    // Extract transaction type
    if (lowerTranscript.includes('income') || lowerTranscript.includes('revenue') || lowerTranscript.includes('payment received')) {
      data.type = 'INCOME';
    } else if (lowerTranscript.includes('expense') || lowerTranscript.includes('cost') || lowerTranscript.includes('purchase')) {
      data.type = 'EXPENSE';
    }
    
    return data;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    onSubmit(formData);
  };

  const categories = [
    'Office Supplies',
    'Travel',
    'Meals',
    'Utilities',
    'Marketing',
    'Software',
    'Equipment',
    'Professional Services',
    'Insurance',
    'Other'
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Voice Recorder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mic className="h-5 w-5" />
            <span>Voice Input</span>
          </CardTitle>
          <CardDescription>
            Record a voice note to automatically fill in transaction details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VoiceRecorder
            onTranscript={handleVoiceTranscript}
            maxDuration={60}
            autoTranscribe={true}
          />
          
          {voiceTranscript && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Voice Transcript</span>
                <Badge variant="outline" className="text-xs">
                  {Math.round(voiceConfidence * 100)}% confidence
                </Badge>
              </div>
              <p className="text-sm text-blue-800">{voiceTranscript}</p>
            </div>
          )}
          
          {isProcessingVoice && (
            <div className="mt-4 flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
              <span className="text-sm text-gray-600">Processing voice input...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Transaction Details</span>
          </CardTitle>
          <CardDescription>
            Review and edit the transaction information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Transaction Type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Transaction Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'INCOME' | 'EXPENSE') => handleInputChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INCOME">Income</SelectItem>
                    <SelectItem value="EXPENSE">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Description and Category */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                placeholder="Enter transaction description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Customer */}
            <div className="space-y-2">
              <Label htmlFor="customer">Customer (Optional)</Label>
              <Input
                id="customer"
                placeholder="Enter customer name or ID"
                value={formData.customerId || ''}
                onChange={(e) => handleInputChange('customerId', e.target.value)}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes about this transaction"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isProcessingVoice}>
                {isProcessingVoice ? 'Processing...' : 'Save Transaction'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Voice Processing Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Voice Input Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Say amounts clearly: "twenty five dollars" or "$25"</p>
            <p>• Include purpose: "office supplies for the office"</p>
            <p>• Mention category: "travel expense for client meeting"</p>
            <p>• Be specific: "lunch with ABC Company client"</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

