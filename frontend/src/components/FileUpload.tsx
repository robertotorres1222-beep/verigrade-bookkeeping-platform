import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Alert,
  AlertTitle,
  Card,
  CardContent,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Grid,
  Tooltip,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Visibility,
  Download,
  CheckCircle,
  Error,
  Warning,
  Info,
  Image,
  Description,
  AttachFile,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useDropzone } from 'react-dropzone';

const UploadArea = styled(Paper)<{ isDragActive: boolean; isDragReject: boolean }>(({ theme, isDragActive, isDragReject }) => ({
  border: `2px dashed ${isDragReject ? theme.palette.error.main : isDragActive ? theme.palette.primary.main : theme.palette.grey[300]}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  backgroundColor: isDragActive ? theme.palette.primary.light + '20' : 'transparent',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light + '10',
  },
}));

const FilePreview = styled(Card)<{ status: 'uploading' | 'success' | 'error' | 'pending' }>(({ theme, status }) => ({
  border: `1px solid ${
    status === 'success' ? theme.palette.success.main :
    status === 'error' ? theme.palette.error.main :
    status === 'uploading' ? theme.palette.primary.main :
    theme.palette.grey[300]
  }`,
  backgroundColor: status === 'success' ? theme.palette.success.light + '20' :
                 status === 'error' ? theme.palette.error.light + '20' :
                 status === 'uploading' ? theme.palette.primary.light + '20' :
                 'transparent',
}));

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  thumbnailUrl?: string;
  status: 'uploading' | 'success' | 'error' | 'pending';
  progress: number;
  error?: string;
  metadata?: {
    width?: number;
    height?: number;
    extractedText?: string;
  };
}

interface FileUploadProps {
  onFilesUploaded?: (files: UploadedFile[]) => void;
  onFileDeleted?: (fileId: string) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  generateThumbnails?: boolean;
  extractText?: boolean;
  multiple?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesUploaded,
  onFileDeleted,
  maxFiles = 10,
  maxSize = 10,
  acceptedTypes = ['image/*', 'application/pdf', 'text/csv'],
  generateThumbnails = true,
  extractText = false,
  multiple = true,
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previewDialog, setPreviewDialog] = useState<{ open: boolean; file: UploadedFile | null }>({
    open: false,
    file: null,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      url: '',
      status: 'pending',
      progress: 0,
    }));

    setFiles(prev => [...prev, ...newFiles]);
    setUploading(true);

    try {
      const formData = new FormData();
      acceptedFiles.forEach(file => formData.append('files', file));
      formData.append('generateThumbnail', generateThumbnails.toString());
      formData.append('extractText', extractText.toString());

      const response = await fetch('/api/files/multiple', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        const uploadedFiles = data.data.map((file: any, index: number) => ({
          ...newFiles[index],
          id: file.id,
          url: file.url,
          thumbnailUrl: file.thumbnailUrl,
          status: 'success' as const,
          progress: 100,
          metadata: file.metadata,
        }));

        setFiles(prev => prev.map(file => {
          const uploaded = uploadedFiles.find(uf => uf.name === file.name);
          return uploaded || { ...file, status: 'error' as const, error: 'Upload failed' };
        }));

        if (onFilesUploaded) {
          onFilesUploaded(uploadedFiles);
        }
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setFiles(prev => prev.map(file => ({
        ...file,
        status: 'error' as const,
        error: error instanceof Error ? error.message : 'Upload failed',
      })));
    } finally {
      setUploading(false);
    }
  }, [generateThumbnails, extractText, onFilesUploaded]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxFiles,
    maxSize: maxSize * 1024 * 1024, // Convert MB to bytes
    multiple,
  });

  const handleDeleteFile = async (fileId: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setFiles(prev => prev.filter(file => file.id !== fileId));
        if (onFileDeleted) {
          onFileDeleted(fileId);
        }
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handlePreviewFile = (file: UploadedFile) => {
    setPreviewDialog({ open: true, file });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image />;
    if (type === 'application/pdf') return <Description />;
    return <AttachFile />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle color="success" />;
      case 'error':
        return <Error color="error" />;
      case 'uploading':
        return <LinearProgress />;
      default:
        return <Info color="info" />;
    }
  };

  return (
    <Box>
      <UploadArea
        {...getRootProps()}
        isDragActive={isDragActive}
        isDragReject={isDragReject}
        elevation={isDragActive ? 4 : 1}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          or click to select files
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Max {maxFiles} files, {maxSize}MB each
        </Typography>
        {isDragReject && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Some files were rejected. Please check file types and sizes.
          </Alert>
        )}
      </UploadArea>

      {files.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Uploaded Files ({files.length})
          </Typography>
          <Grid container spacing={2}>
            {files.map((file) => (
              <Grid item xs={12} sm={6} md={4} key={file.id}>
                <FilePreview status={file.status} elevation={2}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      {getFileIcon(file.type)}
                      <Typography variant="subtitle2" sx={{ ml: 1, flex: 1 }} noWrap>
                        {file.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Preview">
                          <IconButton
                            size="small"
                            onClick={() => handlePreviewFile(file)}
                            disabled={file.status !== 'success'}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteFile(file.id)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(file.size)}
                    </Typography>

                    {file.status === 'uploading' && (
                      <LinearProgress variant="determinate" value={file.progress} sx={{ mt: 1 }} />
                    )}

                    {file.status === 'error' && (
                      <Alert severity="error" sx={{ mt: 1 }}>
                        {file.error}
                      </Alert>
                    )}

                    {file.status === 'success' && file.metadata && (
                      <Box sx={{ mt: 1 }}>
                        {file.metadata.width && file.metadata.height && (
                          <Chip
                            label={`${file.metadata.width}×${file.metadata.height}`}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                        )}
                        {file.metadata.extractedText && (
                          <Chip
                            label="OCR Ready"
                            size="small"
                            color="success"
                          />
                        )}
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      {getStatusIcon(file.status)}
                      <Typography variant="caption" sx={{ ml: 1 }}>
                        {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                      </Typography>
                    </Box>
                  </CardContent>
                </FilePreview>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {uploading && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <AlertTitle>Uploading Files</AlertTitle>
          Please wait while your files are being processed...
        </Alert>
      )}

      {/* File Preview Dialog */}
      <Dialog
        open={previewDialog.open}
        onClose={() => setPreviewDialog({ open: false, file: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {previewDialog.file?.name}
        </DialogTitle>
        <DialogContent>
          {previewDialog.file && (
            <Box>
              {previewDialog.file.type.startsWith('image/') ? (
                <img
                  src={previewDialog.file.url}
                  alt={previewDialog.file.name}
                  style={{ width: '100%', height: 'auto', maxHeight: '400px', objectFit: 'contain' }}
                />
              ) : (
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  {getFileIcon(previewDialog.file.type)}
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Preview not available for this file type
                  </Typography>
                </Paper>
              )}

              {previewDialog.file.metadata?.extractedText && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Extracted Text
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {previewDialog.file.metadata.extractedText}
                    </Typography>
                  </Paper>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog({ open: false, file: null })}>
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            href={previewDialog.file?.url}
            target="_blank"
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FileUpload;










