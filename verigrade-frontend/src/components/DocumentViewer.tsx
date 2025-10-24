import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  Share, 
  Bookmark, 
  MessageSquare, 
  Search, 
  FileText, 
  Image,
  Video,
  Music,
  Archive,
  File,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Settings,
  Filter,
  SortAsc,
  Grid,
  List,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Star,
  Heart,
  Tag,
  Calendar,
  User,
  Clock,
  Lock,
  Unlock,
  Copy,
  Move,
  Rename,
  Share2,
  ExternalLink,
  Info,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface Annotation {
  id: string;
  type: 'highlight' | 'note' | 'comment' | 'stamp' | 'drawing';
  page: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  content: string;
  color: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  replies?: Annotation[];
}

interface DocumentVersion {
  id: string;
  version: number;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
  changes: string;
  isCurrent: boolean;
}

interface DocumentViewerProps {
  documentId: string;
  documentUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  versions: DocumentVersion[];
  annotations: Annotation[];
  onAnnotationAdd: (annotation: Omit<Annotation, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onAnnotationUpdate: (id: string, annotation: Partial<Annotation>) => void;
  onAnnotationDelete: (id: string) => void;
  onVersionChange: (version: number) => void;
  onDownload: () => void;
  onShare: () => void;
  onBookmark: () => void;
  className?: string;
}

export function DocumentViewer({
  documentId,
  documentUrl,
  fileName,
  fileType,
  fileSize,
  versions,
  annotations,
  onAnnotationAdd,
  onAnnotationUpdate,
  onAnnotationDelete,
  onVersionChange,
  onDownload,
  onShare,
  onBookmark,
  className
}: DocumentViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [annotationMode, setAnnotationMode] = useState<'none' | 'highlight' | 'note' | 'comment' | 'stamp' | 'drawing'>('none');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAnnotations, setShowAnnotations] = useState<boolean>(true);
  const [showVersions, setShowVersions] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'single' | 'continuous' | 'two-page'>('single');
  const [sortBy, setSortBy] = useState<'date' | 'author' | 'type'>('date');
  const [filterType, setFilterType] = useState<string>('all');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle PDF load success
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
    setError(null);
  };

  // Handle PDF load error
  const onDocumentLoadError = (error: Error) => {
    setError('Failed to load document');
    setIsLoading(false);
    console.error('PDF load error:', error);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle zoom
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3.0));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  // Handle rotation
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  // Handle fullscreen toggle
  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handle annotation mode change
  const handleAnnotationModeChange = (mode: typeof annotationMode) => {
    setAnnotationMode(mode);
  };

  // Handle search
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      // Mock search implementation
      const results = [
        { page: 1, text: 'Sample text containing the search query', position: { x: 100, y: 200 } },
        { page: 2, text: 'Another occurrence of the search query', position: { x: 150, y: 300 } }
      ];
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  // Handle annotation click
  const handleAnnotationClick = (annotation: Annotation) => {
    setSelectedAnnotation(annotation.id);
    setCurrentPage(annotation.page);
  };

  // Handle annotation add
  const handleAnnotationAdd = (type: Annotation['type'], content: string, color: string) => {
    const newAnnotation: Omit<Annotation, 'id' | 'createdAt' | 'updatedAt'> = {
      type,
      page: currentPage,
      x: 100, // Mock coordinates
      y: 100,
      content,
      color,
      author: 'Current User'
    };
    onAnnotationAdd(newAnnotation);
  };

  // Get file icon based on type
  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="h-4 w-4" />;
    if (type.includes('image')) return <Image className="h-4 w-4" />;
    if (type.includes('video')) return <Video className="h-4 w-4" />;
    if (type.includes('audio')) return <Music className="h-4 w-4" />;
    if (type.includes('zip') || type.includes('rar')) return <Archive className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Filter annotations
  const filteredAnnotations = annotations.filter(annotation => {
    if (filterType === 'all') return true;
    return annotation.type === filterType;
  });

  // Sort annotations
  const sortedAnnotations = filteredAnnotations.sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'author':
        return a.author.localeCompare(b.author);
      case 'type':
        return a.type.localeCompare(b.type);
      default:
        return 0;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading document...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <span className="ml-2 text-red-500">{error}</span>
      </div>
    );
  }

  return (
    <div className={cn("flex h-full bg-background", className)}>
      {/* Sidebar */}
      <div className="w-80 border-r bg-muted/50 flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 mb-2">
            {getFileIcon(fileType)}
            <span className="font-medium truncate">{fileName}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {formatFileSize(fileSize)} • {numPages} pages
          </div>
        </div>

        <Tabs defaultValue="annotations" className="flex-1">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="annotations">Annotations</TabsTrigger>
            <TabsTrigger value="versions">Versions</TabsTrigger>
          </TabsList>

          <TabsContent value="annotations" className="flex-1 p-4">
            <div className="space-y-4">
              {/* Annotation Controls */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant={annotationMode === 'highlight' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleAnnotationModeChange('highlight')}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={annotationMode === 'note' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleAnnotationModeChange('note')}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={annotationMode === 'comment' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleAnnotationModeChange('comment')}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search annotations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="outline" size="sm">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="flex-1 px-3 py-1 text-sm border rounded-md"
                  >
                    <option value="all">All Types</option>
                    <option value="highlight">Highlights</option>
                    <option value="note">Notes</option>
                    <option value="comment">Comments</option>
                    <option value="stamp">Stamps</option>
                    <option value="drawing">Drawings</option>
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'author' | 'type')}
                    className="flex-1 px-3 py-1 text-sm border rounded-md"
                  >
                    <option value="date">Sort by Date</option>
                    <option value="author">Sort by Author</option>
                    <option value="type">Sort by Type</option>
                  </select>
                </div>
              </div>

              {/* Annotations List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {sortedAnnotations.map((annotation) => (
                  <Card
                    key={annotation.id}
                    className={cn(
                      "cursor-pointer transition-colors",
                      selectedAnnotation === annotation.id && "ring-2 ring-primary"
                    )}
                    onClick={() => handleAnnotationClick(annotation)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-xs">
                              {annotation.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Page {annotation.page}
                            </span>
                          </div>
                          <p className="text-sm line-clamp-2">{annotation.content}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span>{annotation.author}</span>
                            <span>•</span>
                            <span>{new Date(annotation.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAnnotationDelete(annotation.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="versions" className="flex-1 p-4">
            <div className="space-y-2">
              {versions.map((version) => (
                <Card
                  key={version.id}
                  className={cn(
                    "cursor-pointer transition-colors",
                    version.isCurrent && "ring-2 ring-primary"
                  )}
                  onClick={() => onVersionChange(version.version)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">Version {version.version}</span>
                          {version.isCurrent && (
                            <Badge variant="default" className="text-xs">Current</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {version.changes}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>{version.uploadedBy}</span>
                          <span>•</span>
                          <span>{new Date(version.uploadedAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{formatFileSize(version.fileSize)}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onVersionChange(version.version);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">{Math.round(scale * 100)}%</span>
              <Button variant="outline" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleRotate}>
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleFullscreen}>
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onDownload}>
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={onShare}>
                <Share className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={onBookmark}>
                <Bookmark className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              {currentPage} of {numPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
              disabled={currentPage >= numPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Document Viewer */}
        <div className="flex-1 overflow-auto p-4">
          <div className="flex justify-center">
            {fileType.includes('pdf') ? (
              <Document
                file={documentUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="flex items-center justify-center h-96">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                }
              >
                <Page
                  pageNumber={currentPage}
                  scale={scale}
                  rotate={rotation}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                />
              </Document>
            ) : (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Preview not available for this file type</p>
                  <Button className="mt-4" onClick={onDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download File
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

