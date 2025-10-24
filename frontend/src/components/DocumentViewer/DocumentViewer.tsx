import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Download, 
  FileText, 
  MessageSquare, 
  Eye, 
  Edit3, 
  Trash2,
  Plus,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface DocumentViewerProps {
  documentId: string;
  onClose?: () => void;
}

interface Annotation {
  id: string;
  type: 'highlight' | 'note' | 'comment';
  content: string;
  position: { x: number; y: number; width: number; height: number };
  page: number;
  color: string;
  style: Record<string, any>;
  createdAt: string;
  createdBy: string;
}

interface OCRResult {
  extractedText: string;
  confidence: number;
  boundingBoxes: Array<{
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: number;
  }>;
  metadata: Record<string, any>;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ documentId, onClose }) => {
  const [document, setDocument] = useState<any>(null);
  const [documentUrl, setDocumentUrl] = useState<string>('');
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isProcessingOCR, setIsProcessingOCR] = useState<boolean>(false);
  const [showAnnotations, setShowAnnotations] = useState<boolean>(true);
  const [newAnnotation, setNewAnnotation] = useState<Partial<Annotation>>({
    type: 'highlight',
    content: '',
    color: '#ffff00',
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawingStart, setDrawingStart] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    loadDocument();
    loadAnnotations();
    loadOCRResult();
  }, [documentId]);

  const loadDocument = async () => {
    try {
      const response = await fetch(`/api/document-viewer/${documentId}`);
      const data = await response.json();
      
      if (data.success) {
        setDocument(data.document);
        setDocumentUrl(data.document.documentUrl);
      } else {
        toast.error('Failed to load document');
      }
    } catch (error) {
      console.error('Error loading document:', error);
      toast.error('Failed to load document');
    }
  };

  const loadAnnotations = async () => {
    try {
      const response = await fetch(`/api/document-viewer/${documentId}/annotations`);
      const data = await response.json();
      
      if (data.success) {
        setAnnotations(data.annotations);
      }
    } catch (error) {
      console.error('Error loading annotations:', error);
    }
  };

  const loadOCRResult = async () => {
    try {
      const response = await fetch(`/api/document-viewer/${documentId}/ocr`);
      const data = await response.json();
      
      if (data.success) {
        setOcrResult(data.ocrResult);
      }
    } catch (error) {
      console.error('Error loading OCR result:', error);
    }
  };

  const processOCR = async () => {
    setIsProcessingOCR(true);
    try {
      const response = await fetch(`/api/document-viewer/${documentId}/ocr`, {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success) {
        setOcrResult(data.ocrResult);
        toast.success('Document processed with OCR');
      } else {
        toast.error('Failed to process document with OCR');
      }
    } catch (error) {
      console.error('Error processing OCR:', error);
      toast.error('Failed to process document with OCR');
    } finally {
      setIsProcessingOCR(false);
    }
  };

  const searchText = async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(`/api/document-viewer/${documentId}/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.searchResults);
        toast.success(`Found ${data.totalMatches} matches`);
      }
    } catch (error) {
      console.error('Error searching text:', error);
      toast.error('Failed to search text');
    }
  };

  const createAnnotation = async () => {
    if (!newAnnotation.content?.trim()) return;

    try {
      const response = await fetch(`/api/document-viewer/${documentId}/annotations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newAnnotation,
          position: drawingStart || { x: 0, y: 0, width: 100, height: 20 },
          page: currentPage,
        }),
      });
      const data = await response.json();
      
      if (data.success) {
        setAnnotations([data.annotation, ...annotations]);
        setNewAnnotation({ type: 'highlight', content: '', color: '#ffff00' });
        setDrawingStart(null);
        toast.success('Annotation created');
      } else {
        toast.error('Failed to create annotation');
      }
    } catch (error) {
      console.error('Error creating annotation:', error);
      toast.error('Failed to create annotation');
    }
  };

  const deleteAnnotation = async (annotationId: string) => {
    try {
      const response = await fetch(`/api/document-viewer/${documentId}/annotations/${annotationId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (data.success) {
        setAnnotations(annotations.filter(a => a.id !== annotationId));
        toast.success('Annotation deleted');
      } else {
        toast.error('Failed to delete annotation');
      }
    } catch (error) {
      console.error('Error deleting annotation:', error);
      toast.error('Failed to delete annotation');
    }
  };

  const exportDocument = async () => {
    try {
      const response = await fetch(`/api/document-viewer/${documentId}/export?format=pdf`);
      const data = await response.json();
      
      if (data.success) {
        // In a real implementation, this would download the file
        toast.success('Document export initiated');
      } else {
        toast.error('Failed to export document');
      }
    } catch (error) {
      console.error('Error exporting document:', error);
      toast.error('Failed to export document');
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const onPageClick = (event: React.MouseEvent) => {
    if (isDrawing) {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      if (!drawingStart) {
        setDrawingStart({ x, y });
      } else {
        // Complete the drawing
        setDrawingStart(null);
      }
    }
  };

  const startDrawing = () => {
    setIsDrawing(true);
    setDrawingStart(null);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  if (!document) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">{document.name}</h1>
            <Badge variant="outline">Version {document.currentVersion}</Badge>
            {ocrResult && (
              <Badge variant="secondary">
                OCR: {Math.round(ocrResult.confidence * 100)}% confidence
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={exportDocument}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r flex flex-col">
          <Tabs defaultValue="annotations" className="flex-1">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="annotations">Annotations</TabsTrigger>
              <TabsTrigger value="ocr">OCR</TabsTrigger>
              <TabsTrigger value="search">Search</TabsTrigger>
            </TabsList>

            <TabsContent value="annotations" className="flex-1 p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Annotations</h3>
                  <Button size="sm" onClick={startDrawing}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>

                {annotations.map((annotation) => (
                  <Card key={annotation.id} className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {annotation.type}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            Page {annotation.page}
                          </span>
                        </div>
                        <p className="text-sm">{annotation.content}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteAnnotation(annotation.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}

                {isDrawing && (
                  <Card className="p-3 border-dashed">
                    <h4 className="font-medium mb-2">New Annotation</h4>
                    <div className="space-y-2">
                      <Select
                        value={newAnnotation.type}
                        onValueChange={(value) => setNewAnnotation({ ...newAnnotation, type: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="highlight">Highlight</SelectItem>
                          <SelectItem value="note">Note</SelectItem>
                          <SelectItem value="comment">Comment</SelectItem>
                        </SelectContent>
                      </Select>
                      <Textarea
                        placeholder="Enter annotation content..."
                        value={newAnnotation.content || ''}
                        onChange={(e) => setNewAnnotation({ ...newAnnotation, content: e.target.value })}
                      />
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={createAnnotation}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={stopDrawing}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="ocr" className="flex-1 p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">OCR Results</h3>
                  <Button
                    size="sm"
                    onClick={processOCR}
                    disabled={isProcessingOCR}
                  >
                    {isProcessingOCR ? 'Processing...' : 'Process OCR'}
                  </Button>
                </div>

                {ocrResult ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        {Math.round(ocrResult.confidence * 100)}% confidence
                      </Badge>
                      <Badge variant="outline">
                        {ocrResult.boundingBoxes.length} text blocks
                      </Badge>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      <pre className="text-xs bg-gray-100 p-2 rounded">
                        {ocrResult.extractedText}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No OCR results available. Click "Process OCR" to extract text.
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="search" className="flex-1 p-4">
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Search in document..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchText()}
                  />
                  <Button size="sm" onClick={searchText}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>

                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Search Results</h4>
                    {searchResults.map((result, index) => (
                      <Card key={index} className="p-2">
                        <p className="text-sm">{result.text}</p>
                        <p className="text-xs text-gray-500">
                          Page {result.page} - {Math.round(result.confidence * 100)}% confidence
                        </p>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="bg-white border-b p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">{Math.round(scale * 100)}%</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setScale(Math.min(3.0, scale + 0.1))}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setRotation(rotation - 90)}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setRotation(rotation + 90)}
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  Page {currentPage} of {numPages}
                </span>
              </div>
            </div>
          </div>

          {/* Document viewer */}
          <div className="flex-1 overflow-auto bg-gray-100 p-4">
            <div className="flex justify-center">
              <Document
                file={documentUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                className="shadow-lg"
              >
                <Page
                  pageNumber={currentPage}
                  scale={scale}
                  rotate={rotation}
                  onClick={onPageClick}
                  className="cursor-crosshair"
                />
              </Document>
            </div>
          </div>

          {/* Page navigation */}
          <div className="bg-white border-t p-2">
            <div className="flex items-center justify-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                {currentPage} / {numPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
                disabled={currentPage >= numPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;

