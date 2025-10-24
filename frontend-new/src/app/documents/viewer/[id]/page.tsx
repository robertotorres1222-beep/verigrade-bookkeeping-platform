'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Share, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Search,
  MessageSquare,
  Highlighter,
  Stamp,
  History,
  Tag,
  Calendar,
  User,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize
} from 'lucide-react';
import { toast } from 'sonner';

interface Document {
  id: string;
  name: string;
  description?: string;
  folder: string;
  tags: string[];
  size: number;
  contentType: string;
  latestVersion: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  versions: Array<{
    id: string;
    version: string;
    size: number;
    contentType: string;
    uploadedAt: string;
    uploadedBy: string;
    isLatest: boolean;
  }>;
  annotations: Array<{
    id: string;
    type: 'highlight' | 'note' | 'comment' | 'stamp';
    content: string;
    position: {
      page: number;
      x: number;
      y: number;
      width?: number;
      height?: number;
    };
    createdAt: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
}

interface DocumentViewerProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DocumentViewerPage({ params }: DocumentViewerProps) {
  const { id } = await params;
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [documentUrl, setDocumentUrl] = useState<string>('');
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('viewer');
  const [newAnnotation, setNewAnnotation] = useState({
    type: 'note' as 'highlight' | 'note' | 'comment' | 'stamp',
    content: '',
    position: { page: 1, x: 0, y: 0, width: 100, height: 50 }
  });
  const [showAnnotationForm, setShowAnnotationForm] = useState(false);
  const [ocrText, setOcrText] = useState<string>('');
  const [showOcr, setShowOcr] = useState(false);

  const viewerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    loadDocument();
  }, [id]);

  useEffect(() => {
    if (document) {
      loadDocumentUrl();
    }
  }, [document, selectedVersion]);

  const loadDocument = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/documents/${id}`);
      if (response.ok) {
        const data = await response.json();
        setDocument(data.data);
        setSelectedVersion(data.data.latestVersion);
      } else {
        throw new Error('Failed to load document');
      }
    } catch (error) {
      console.error('Failed to load document:', error);
      toast.error('Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  const loadDocumentUrl = async () => {
    if (!document) return;

    try {
      const version = selectedVersion || document.latestVersion;
      const response = await fetch(`/api/documents/${id}/url?version=${version}`);
      if (response.ok) {
        const data = await response.json();
        setDocumentUrl(data.data.url);
      } else {
        throw new Error('Failed to load document URL');
      }
    } catch (error) {
      console.error('Failed to load document URL:', error);
      toast.error('Failed to load document URL');
    }
  };

  const handleDownload = async () => {
    if (!document) return;

    try {
      const response = await fetch(`/api/documents/${id}/download?version=${selectedVersion}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = window.document.createElement('a');
        a.href = url;
        a.download = document.name;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error('Failed to download document');
      }
    } catch (error) {
      toast.error('Failed to download document');
    }
  };

  const handleShare = async () => {
    if (!document) return;

    try {
      const response = await fetch(`/api/documents/${id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expiresIn: 7 * 24 * 60 * 60 // 7 days
        })
      });

      if (response.ok) {
        const data = await response.json();
        navigator.clipboard.writeText(data.data.shareUrl);
        toast.success('Share link copied to clipboard');
      } else {
        throw new Error('Failed to create share link');
      }
    } catch (error) {
      toast.error('Failed to create share link');
    }
  };

  const handleAddAnnotation = async () => {
    if (!newAnnotation.content.trim()) {
      toast.error('Please enter annotation content');
      return;
    }

    try {
      const response = await fetch(`/api/documents/${id}/annotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAnnotation)
      });

      if (response.ok) {
        toast.success('Annotation added');
        setNewAnnotation({
          type: 'note',
          content: '',
          position: { page: 1, x: 0, y: 0, width: 100, height: 50 }
        });
        setShowAnnotationForm(false);
        await loadDocument(); // Reload to get updated annotations
      } else {
        throw new Error('Failed to add annotation');
      }
    } catch (error) {
      toast.error('Failed to add annotation');
    }
  };

  const handleDeleteAnnotation = async (annotationId: string) => {
    if (!confirm('Are you sure you want to delete this annotation?')) return;

    try {
      const response = await fetch(`/api/documents/${id}/annotations/${annotationId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Annotation deleted');
        await loadDocument(); // Reload to get updated annotations
      } else {
        throw new Error('Failed to delete annotation');
      }
    } catch (error) {
      toast.error('Failed to delete annotation');
    }
  };

  const handleOcrExtract = async () => {
    if (!document) return;

    try {
      const response = await fetch(`/api/documents/${id}/ocr`, {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        setOcrText(data.data.text);
        setShowOcr(true);
        toast.success('OCR extraction completed');
      } else {
        throw new Error('Failed to extract text');
      }
    } catch (error) {
      toast.error('Failed to extract text');
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleFullscreen = () => {
    if (!isFullscreen) {
      if (viewerRef.current?.requestFullscreen) {
        viewerRef.current.requestFullscreen();
      }
    } else {
      if (window.document.exitFullscreen) {
        window.document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getAnnotationIcon = (type: string) => {
    switch (type) {
      case 'highlight': return <Highlighter className="h-4 w-4" />;
      case 'note': return <MessageSquare className="h-4 w-4" />;
      case 'comment': return <MessageSquare className="h-4 w-4" />;
      case 'stamp': return <Stamp className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getAnnotationColor = (type: string) => {
    switch (type) {
      case 'highlight': return 'bg-yellow-100 text-yellow-800';
      case 'note': return 'bg-blue-100 text-blue-800';
      case 'comment': return 'bg-green-100 text-green-800';
      case 'stamp': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading document...</span>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            Document not found or you don't have permission to view it.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold">{document.name}</h1>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(document.size)} • {document.contentType} • 
                Version {document.latestVersion}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={handleFullscreen}>
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="viewer">Viewer</TabsTrigger>
              <TabsTrigger value="annotations">Annotations</TabsTrigger>
              <TabsTrigger value="versions">Versions</TabsTrigger>
            </TabsList>

            <TabsContent value="viewer" className="flex-1 p-4 space-y-4">
              {/* Document Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Document Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Folder: {document.folder}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Created: {new Date(document.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      By: {document.createdBy.firstName} {document.createdBy.lastName}
                    </span>
                  </div>
                  {document.tags.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm">Tags</Label>
                      <div className="flex flex-wrap gap-1">
                        {document.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Viewer Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Viewer Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Zoom</Label>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" onClick={handleZoomOut}>
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <span className="text-sm w-12 text-center">{zoom}%</span>
                      <Button size="sm" variant="outline" onClick={handleZoomIn}>
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Rotation</Label>
                    <Button size="sm" variant="outline" onClick={handleRotate}>
                      <RotateCw className="h-4 w-4 mr-2" />
                      Rotate
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Annotations</Label>
                    <Button
                      size="sm"
                      variant={showAnnotations ? "default" : "outline"}
                      onClick={() => setShowAnnotations(!showAnnotations)}
                    >
                      {showAnnotations ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* OCR */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Text Extraction</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleOcrExtract}
                    className="w-full"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Extract Text
                  </Button>
                  
                  {showOcr && ocrText && (
                    <div className="space-y-2">
                      <Label className="text-sm">Extracted Text</Label>
                      <div className="max-h-40 overflow-y-auto p-2 bg-gray-50 rounded text-sm">
                        {ocrText}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="annotations" className="flex-1 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Annotations</h3>
                <Button
                  size="sm"
                  onClick={() => setShowAnnotationForm(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>

              {document.annotations.length === 0 ? (
                <Alert>
                  <MessageSquare className="h-4 w-4" />
                  <AlertDescription>
                    No annotations found. Add your first annotation to get started.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  {document.annotations.map(annotation => (
                    <div key={annotation.id} className="border rounded p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getAnnotationIcon(annotation.type)}
                          <Badge className={getAnnotationColor(annotation.type)}>
                            {annotation.type}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteAnnotation(annotation.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm">{annotation.content}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {annotation.user.firstName} {annotation.user.lastName}
                        </span>
                        <span>
                          {new Date(annotation.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="versions" className="flex-1 p-4 space-y-4">
              <h3 className="font-medium">Version History</h3>
              
              <div className="space-y-2">
                {document.versions.map(version => (
                  <div
                    key={version.id}
                    className={`border rounded p-3 cursor-pointer ${
                      version.isLatest ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedVersion(version.version)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Version {version.version}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(version.size)} • {version.contentType}
                        </p>
                      </div>
                      {version.isLatest && (
                        <Badge variant="default">Latest</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(version.uploadedAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Viewer */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Label className="text-sm">Version:</Label>
                <select
                  value={selectedVersion}
                  onChange={(e) => setSelectedVersion(e.target.value)}
                  className="p-1 border rounded text-sm"
                >
                  {document.versions.map(version => (
                    <option key={version.id} value={version.version}>
                      Version {version.version}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm w-12 text-center">{zoom}%</span>
              <Button size="sm" variant="outline" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Document Viewer */}
          <div ref={viewerRef} className="flex-1 bg-gray-100 flex items-center justify-center overflow-auto">
            {documentUrl && (
              <div
                className="bg-white shadow-lg"
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'center'
                }}
              >
                {document.contentType.startsWith('image/') ? (
                  <img
                    src={documentUrl}
                    alt={document.name}
                    className="max-w-full max-h-full"
                  />
                ) : document.contentType === 'application/pdf' ? (
                  <iframe
                    src={documentUrl}
                    className="w-full h-full min-h-[600px]"
                    title={document.name}
                  />
                ) : (
                  <div className="p-8 text-center">
                    <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">Preview not available for this file type</p>
                    <Button onClick={handleDownload} className="mt-4">
                      <Download className="h-4 w-4 mr-2" />
                      Download to view
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Annotation Form Modal */}
      {showAnnotationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add Annotation</CardTitle>
              <CardDescription>
                Add a note, highlight, or comment to the document
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <select
                  value={newAnnotation.type}
                  onChange={(e) => setNewAnnotation(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full p-2 border rounded"
                >
                  <option value="note">Note</option>
                  <option value="highlight">Highlight</option>
                  <option value="comment">Comment</option>
                  <option value="stamp">Stamp</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Content</Label>
                <textarea
                  value={newAnnotation.content}
                  onChange={(e) => setNewAnnotation(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter your annotation..."
                  className="w-full p-2 border rounded"
                  rows={3}
                />
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleAddAnnotation} className="flex-1">
                  Add Annotation
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAnnotationForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

