'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Trash2, 
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  Volume2,
  FileText,
  DollarSign,
  Calendar,
  Tag,
  Users,
  BarChart3,
  PieChart,
  LineChart,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import VoiceRecorder from '@/components/VoiceRecorder';
import VoiceTransactionForm from '@/components/forms/VoiceTransactionForm';

interface VoiceNote {
  id: string;
  title: string;
  content: string;
  transcript: string;
  confidence: number;
  duration: number;
  createdAt: Date;
  tags: string[];
  category: string;
  isProcessed: boolean;
}

interface TransactionData {
  amount: string;
  description: string;
  category: string;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  customerId?: string;
  notes: string;
}

export default function VoiceNotesPage() {
  const [activeTab, setActiveTab] = useState('recorder');
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [selectedNote, setSelectedNote] = useState<VoiceNote | null>(null);

  const handleVoiceTranscript = (transcript: string) => {
    // Create a new voice note from the transcript
    const newNote: VoiceNote = {
      id: `note_${Date.now()}`,
      title: `Voice Note ${voiceNotes.length + 1}`,
      content: transcript,
      transcript: transcript,
      confidence: 0.85,
      duration: 0,
      createdAt: new Date(),
      tags: [],
      category: 'General',
      isProcessed: true
    };

    setVoiceNotes(prev => [newNote, ...prev]);
    toast.success('Voice note created successfully');
  };

  const handleTransactionSubmit = (data: TransactionData) => {
    setTransactions(prev => [data, ...prev]);
    toast.success('Transaction saved successfully');
  };

  const deleteVoiceNote = (noteId: string) => {
    setVoiceNotes(prev => prev.filter(note => note.id !== noteId));
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
    }
    toast.success('Voice note deleted');
  };

  const updateVoiceNote = (noteId: string, updates: Partial<VoiceNote>) => {
    setVoiceNotes(prev => prev.map(note => 
      note.id === noteId ? { ...note, ...updates } : note
    ));
    
    if (selectedNote?.id === noteId) {
      setSelectedNote(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      'General': 'bg-gray-100 text-gray-800',
      'Business': 'bg-blue-100 text-blue-800',
      'Personal': 'bg-green-100 text-green-800',
      'Meeting': 'bg-purple-100 text-purple-800',
      'Expense': 'bg-red-100 text-red-800',
      'Income': 'bg-yellow-100 text-yellow-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Mic className="h-6 w-6 text-blue-600" />
          <h1 className="text-3xl font-bold">Voice Notes</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recorder">Recorder</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="recorder" className="space-y-6">
          <VoiceRecorder
            onTranscript={handleVoiceTranscript}
            maxDuration={300}
            autoTranscribe={true}
          />
        </TabsContent>

        <TabsContent value="notes" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Notes List */}
            <Card>
              <CardHeader>
                <CardTitle>Voice Notes</CardTitle>
                <CardDescription>
                  {voiceNotes.length} note{voiceNotes.length !== 1 ? 's' : ''} recorded
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {voiceNotes.length === 0 ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        No voice notes yet. Start recording to create your first note.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    voiceNotes.map((note) => (
                      <div
                        key={note.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedNote?.id === note.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedNote(note)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{note.title}</h4>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {note.content}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge className={getCategoryColor(note.category)}>
                                {note.category}
                              </Badge>
                              <span className={`text-xs ${getConfidenceColor(note.confidence)}`}>
                                {Math.round(note.confidence * 100)}% confidence
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(note.createdAt)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 ml-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteVoiceNote(note.id);
                              }}
                            >
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

            {/* Note Details */}
            <Card>
              <CardHeader>
                <CardTitle>Note Details</CardTitle>
                <CardDescription>
                  {selectedNote ? 'View and edit note details' : 'Select a note to view details'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedNote ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Title</label>
                      <input
                        type="text"
                        value={selectedNote.title}
                        onChange={(e) => updateVoiceNote(selectedNote.id, { title: e.target.value })}
                        className="w-full mt-1 p-2 border rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Content</label>
                      <textarea
                        value={selectedNote.content}
                        onChange={(e) => updateVoiceNote(selectedNote.id, { content: e.target.value })}
                        className="w-full mt-1 p-2 border rounded-md"
                        rows={4}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Category</label>
                      <select
                        value={selectedNote.category}
                        onChange={(e) => updateVoiceNote(selectedNote.id, { category: e.target.value })}
                        className="w-full mt-1 p-2 border rounded-md"
                      >
                        <option value="General">General</option>
                        <option value="Business">Business</option>
                        <option value="Personal">Personal</option>
                        <option value="Meeting">Meeting</option>
                        <option value="Expense">Expense</option>
                        <option value="Income">Income</option>
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Confidence</label>
                        <div className="mt-1">
                          <span className={`text-sm ${getConfidenceColor(selectedNote.confidence)}`}>
                            {Math.round(selectedNote.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Created</label>
                        <div className="mt-1 text-sm text-gray-600">
                          {formatDate(selectedNote.createdAt)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Original Transcript</h5>
                      <div className="p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-600">{selectedNote.transcript}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Select a note to view details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Transaction Form */}
            <Card>
              <CardHeader>
                <CardTitle>Voice Transaction</CardTitle>
                <CardDescription>
                  Create transactions using voice input
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VoiceTransactionForm
                  onSubmit={handleTransactionSubmit}
                  onCancel={() => {}}
                />
              </CardContent>
            </Card>

            {/* Transaction List */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                  {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} created
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.length === 0 ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        No transactions created yet. Use the voice form to create your first transaction.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    transactions.slice(0, 10).map((transaction, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{transaction.description}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {transaction.category} • {transaction.date}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${
                              transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.type === 'INCOME' ? '+' : '-'}${transaction.amount}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {transaction.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{voiceNotes.length}</div>
                <p className="text-xs text-muted-foreground">
                  Voice notes recorded
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{transactions.length}</div>
                <p className="text-xs text-muted-foreground">
                  Transactions created
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Confidence</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {voiceNotes.length > 0 
                    ? Math.round((voiceNotes.reduce((sum, note) => sum + note.confidence, 0) / voiceNotes.length) * 100)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Transcription accuracy
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Note Categories</CardTitle>
                <CardDescription>
                  Distribution of voice notes by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['General', 'Business', 'Personal', 'Meeting', 'Expense', 'Income'].map((category) => {
                    const count = voiceNotes.filter(note => note.category === category).length;
                    const percentage = voiceNotes.length > 0 ? (count / voiceNotes.length) * 100 : 0;
                    
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge className={getCategoryColor(category)}>
                            {category}
                          </Badge>
                          <span className="text-sm">{count}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {percentage.toFixed(1)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transaction Types</CardTitle>
                <CardDescription>
                  Distribution of transactions by type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['INCOME', 'EXPENSE'].map((type) => {
                    const count = transactions.filter(t => t.type === type).length;
                    const percentage = transactions.length > 0 ? (count / transactions.length) * 100 : 0;
                    
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">
                            {type}
                          </Badge>
                          <span className="text-sm">{count}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {percentage.toFixed(1)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

