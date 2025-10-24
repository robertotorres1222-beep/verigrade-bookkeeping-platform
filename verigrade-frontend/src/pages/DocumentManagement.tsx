import React, { useState, useEffect } from 'react';
import { DocumentViewer } from '@/components/DocumentViewer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  Folder, 
  File, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Download, 
  Share, 
  Trash2, 
  Edit,
  Eye,
  MoreHorizontal,
  Plus,
  FolderPlus,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Star,
  Bookmark,
  Tag,
  Calendar,
  User,
  Clock,
  Lock,
  Unlock
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  folder: string;
  tags: string[];
  isStarred: boolean;
  isBookmarked: boolean;
  isLocked: boolean;
  version: number;
  url: string;
}

interface Folder {
  id: string;
  name: string;
  parentId?: string;
  createdAt: string;
  createdBy: string;
  documentCount: number;
}

export default function DocumentManagement() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('name');
  const [filterType, setFilterType] = useState<string>('all');
  const [currentFolder, setCurrentFolder] = useState<string>('root');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data
  useEffect(() => {
    const mockDocuments: Document[] = [
      {
        id: '1',
        name: 'Financial Report Q3 2024.pdf',
        type: 'application/pdf',
        size: 2048576,
        uploadedAt: '2024-01-15T10:30:00Z',
        uploadedBy: 'John Doe',
        folder: 'Reports',
        tags: ['financial', 'quarterly', '2024'],
        isStarred: true,
        isBookmarked: false,
        isLocked: false,
        version: 1,
        url: '/api/documents/1/download'
      },
      {
        id: '2',
        name: 'Invoice Template.docx',
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 512000,
        uploadedAt: '2024-01-14T14:20:00Z',
        uploadedBy: 'Jane Smith',
        folder: 'Templates',
        tags: ['template', 'invoice'],
        isStarred: false,
        isBookmarked: true,
        isLocked: false,
        version: 2,
        url: '/api/documents/2/download'
      }
    ];

    const mockFolders: Folder[] = [
      {
        id: '1',
        name: 'Reports',
        createdAt: '2024-01-01T00:00:00Z',
        createdBy: 'Admin',
        documentCount: 5
      },
      {
        id: '2',
        name: 'Templates',
        createdAt: '2024-01-01T00:00:00Z',
        createdBy: 'Admin',
        documentCount: 3
      }
    ];

    setDocuments(mockDocuments);
    setFolders(mockFolders);
  }, []);

  // Filter and sort documents
  const filteredDocuments = documents
    .filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || doc.type.includes(filterType);
      const matchesFolder = currentFolder === 'root' || doc.folder === currentFolder;
      return matchesSearch && matchesType && matchesFolder;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        case 'size':
          return b.size - a.size;
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

  // Get file icon
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

  // Handle document selection
  const handleDocumentSelect = (document: Document) => {
    setSelectedDocument(document);
  };

  // Handle document actions
  const handleDownload = (document: Document) => {
    // Implement download logic
    console.log('Downloading:', document.name);
  };

  const handleShare = (document: Document) => {
    // Implement share logic
    console.log('Sharing:', document.name);
  };

  const handleDelete = (document: Document) => {
    // Implement delete logic
    setDocuments(prev => prev.filter(doc => doc.id !== document.id));
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r bg-muted/50">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 mb-4">
            <Button size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
            <Button variant="outline" size="sm">
              <FolderPlus className="h-4 w-4 mr-2" />
              New Folder
            </Button>
          </div>
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />
        </div>

        <div className="p-4">
          <h3 className="font-medium mb-2">Folders</h3>
          <div className="space-y-1">
            <div
              className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                currentFolder === 'root' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
              onClick={() => setCurrentFolder('root')}
            >
              <Folder className="h-4 w-4" />
              <span>All Documents</span>
            </div>
            {folders.map(folder => (
              <div
                key={folder.id}
                className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                  currentFolder === folder.name ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
                onClick={() => setCurrentFolder(folder.name)}
              >
                <Folder className="h-4 w-4" />
                <span>{folder.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {folder.documentCount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'size' | 'type')}
                className="px-3 py-1 text-sm border rounded-md"
              >
                <option value="name">Sort by Name</option>
                <option value="date">Sort by Date</option>
                <option value="size">Sort by Size</option>
                <option value="type">Sort by Type</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-1 text-sm border rounded-md"
              >
                <option value="all">All Types</option>
                <option value="pdf">PDF</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="audio">Audio</option>
                <option value="document">Documents</option>
              </select>
            </div>
          </div>
        </div>

        {/* Document List */}
        <div className="flex-1 overflow-auto p-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredDocuments.map(document => (
                <Card
                  key={document.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleDocumentSelect(document)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {getFileIcon(document.type)}
                      <span className="font-medium truncate">{document.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {formatFileSize(document.size)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{document.uploadedBy}</span>
                      <span>•</span>
                      <span>{new Date(document.uploadedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(document);
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(document);
                        }}
                      >
                        <Share className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(document);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDocuments.map(document => (
                <Card
                  key={document.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleDocumentSelect(document)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {getFileIcon(document.type)}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{document.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatFileSize(document.size)} • {document.uploadedBy} • {new Date(document.uploadedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(document);
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(document);
                          }}
                        >
                          <Share className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(document);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 z-50 bg-background">
          <div className="h-full flex flex-col">
            <div className="border-b p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getFileIcon(selectedDocument.type)}
                  <span className="font-medium">{selectedDocument.name}</span>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedDocument(null)}
                >
                  Close
                </Button>
              </div>
            </div>
            <div className="flex-1">
              <DocumentViewer
                documentId={selectedDocument.id}
                documentUrl={selectedDocument.url}
                fileName={selectedDocument.name}
                fileType={selectedDocument.type}
                fileSize={selectedDocument.size}
                versions={[]}
                annotations={[]}
                onAnnotationAdd={() => {}}
                onAnnotationUpdate={() => {}}
                onAnnotationDelete={() => {}}
                onVersionChange={() => {}}
                onDownload={() => handleDownload(selectedDocument)}
                onShare={() => handleShare(selectedDocument)}
                onBookmark={() => {}}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

