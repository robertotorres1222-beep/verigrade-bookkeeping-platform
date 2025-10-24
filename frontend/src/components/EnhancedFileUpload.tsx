import React, { useState, useCallback, useRef, useEffect } from 'react';
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
  CircularProgress,
  Fade,
  Zoom,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
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
  Scan,
  AutoFixHigh,
  Speed,
  Psychology,
  Receipt,
  Description as Invoice,
  Gavel,
  Assessment,
  ExpandMore,
  Edit,
  Save,
  Cancel,
  Refresh,
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
  ocrResult?: {
    text: string;
    confidence: number;
    documentType: string;
    structuredData?: any;
  };
  requiresReview?: boolean;
  reviewReason?: string;
}

interface EnhancedFileUploadProps {
  onFilesUploaded?: (files: UploadedFile[]) => void;
  onFileDeleted?: (fileId: string) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  generateThumbnails?: boolean;
  extractText?: boolean;
  classifyDocuments?: boolean;
  extractStructuredData?: boolean;
  confidenceThreshold?: number;
  enableReceiptDetection?: boolean;
  enablePreprocessing?: boolean;
  batchProcessing?: boolean;
}

const EnhancedFileUpload: React.FC<EnhancedFileUploadProps> = ({
  onFilesUploaded,
  onFileDeleted,
  maxFiles = 10,
  maxSize = 10,
  acceptedTypes = ['image/*', 'application/pdf', 'text/csv'],
  generateThumbnails = true,
  extractText = true,
  classifyDocuments = true,
  extractStructuredData = true,
  confidenceThreshold = 80,
  enableReceiptDetection = true,
  enablePreprocessing = true,
  batchProcessing = true,
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [batchJobId, setBatchJobId] = useState<string | null>(null);
  const [batchStatus, setBatchStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle');
  const [previewDialog, setPreviewDialog] = useState<{ open: boolean; file: UploadedFile | null }>({
    open: false,
    file: null,
  });
  const [processingOptions, setProcessingOptions] = useState({
    generateThumbnails,
    extractText,
    classifyDocuments,
    extractStructuredData,
    confidenceThreshold,
    enableReceiptDetection,
    enablePreprocessing,
  });
  const [activeStep, setActiveStep] = useState(0);
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
      if (batchProcessing && acceptedFiles.length > 1) {
        await processBatchFiles(acceptedFiles, newFiles);
      } else {
        await processFilesSequentially(acceptedFiles, newFiles);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setFiles(prev => prev.map(file => {
        const newFile = newFiles.find(nf => nf.name === file.name);
        return newFile ? { ...file, status: 'error' as const, error: 'Upload failed' } : file;
      }));
    } finally {
      setUploading(false);
    }
  }, [batchProcessing, processingOptions]);

  const processBatchFiles = async (acceptedFiles: File[], newFiles: UploadedFile[]) => {
    try {
      const formData = new FormData();
      acceptedFiles.forEach(file => formData.append('files', file));
      
      // Add processing options
      Object.entries(processingOptions).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      const response = await fetch('/api/documents/batch-process', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setBatchJobId(data.data.id);
        setBatchStatus('processing');
        
        // Poll for batch job status
        pollBatchStatus(data.data.id, newFiles);
      } else {
        throw new Error(data.message || 'Batch processing failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const processFilesSequentially = async (acceptedFiles: File[], newFiles: UploadedFile[]) => {
    const uploadPromises = acceptedFiles.map(async (file, index) => {
      const formData = new FormData();
      formData.append('file', file);
      
      // Add processing options
      Object.entries(processingOptions).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      const response = await fetch('/api/documents/process', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        const uploadedFile = {
          ...newFiles[index],
          id: data.data.id,
          url: data.data.originalFile.url,
          thumbnailUrl: data.data.originalFile.thumbnailUrl,
          status: 'success' as const,
          progress: 100,
          metadata: data.data.originalFile.metadata,
          ocrResult: {
            text: data.data.extractedData?.text || '',
            confidence: data.data.confidence,
            documentType: data.data.documentType,
            structuredData: data.data.extractedData,
          },
          requiresReview: data.data.requiresReview,
          reviewReason: data.data.requiresReview ? 'Low confidence score' : undefined,
        };

        return uploadedFile;
      } else {
        throw new Error(data.message || 'Processing failed');
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      setFiles(prev => prev.map(file => {
        const result = results.find(r => r.name === file.name);
        return result || { ...file, status: 'error' as const, error: 'Processing failed' };
      }));

      if (onFilesUploaded) {
        onFilesUploaded(results);
      }
    } catch (error) {
      throw error;
    }
  };

  const pollBatchStatus = async (jobId: string, newFiles: UploadedFile[]) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/documents/batch-status/${jobId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const data = await response.json();

        if (data.success) {
          const job = data.data;
          
          if (job.status === 'completed') {
            clearInterval(pollInterval);
            setBatchStatus('completed');
            
            // Update files with results
            setFiles(prev => prev.map(file => {
              const result = job.results.find((r: any) => r.fileName === file.name);
              if (result) {
                return {
                  ...file,
                  id: result.fileId,
                  url: result.extractedData?.url || '',
                  status: result.status === 'success' ? 'success' : 'error',
                  progress: 100,
                  ocrResult: result.extractedData ? {
                    text: result.extractedData.text || '',
                    confidence: result.confidence,
                    documentType: result.documentType,
                    structuredData: result.extractedData,
                  } : undefined,
                  error: result.error,
                };
              }
              return file;
            }));

            if (onFilesUploaded) {
              const successfulFiles = job.results
                .filter((r: any) => r.status === 'success')
                .map((r: any) => ({
                  id: r.fileId,
                  name: r.fileName,
                  size: 0,
                  type: '',
                  url: r.extractedData?.url || '',
                  status: 'success' as const,
                  progress: 100,
                  ocrResult: r.extractedData ? {
                    text: r.extractedData.text || '',
                    confidence: r.confidence,
                    documentType: r.documentType,
                    structuredData: r.extractedData,
                  } : undefined,
                }));
              onFilesUploaded(successfulFiles);
            }
          } else if (job.status === 'failed') {
            clearInterval(pollInterval);
            setBatchStatus('failed');
          }
        }
      } catch (error) {
        console.error('Error polling batch status:', error);
        clearInterval(pollInterval);
        setBatchStatus('failed');
      }
    }, 2000); // Poll every 2 seconds
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxFiles,
    maxSize: maxSize * 1024 * 1024,
    multiple: true,
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

  const handleEditStructuredData = (fileId: string, newData: any) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { 
            ...file, 
            ocrResult: { 
              ...file.ocrResult, 
              structuredData: newData 
            } 
          }
        : file
    ));
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

  const getDocumentTypeIcon = (documentType: string) => {
    switch (documentType) {
      case 'receipt':
        return <Receipt />;
      case 'invoice':
        return <Invoice />;
      case 'contract':
        return <Gavel />;
      case 'statement':
        return <Assessment />;
      default:
        return <Description />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle color="success" />;
      case 'error':
        return <Error color="error" />;
      case 'uploading':
        return <CircularProgress size={20} />;
      default:
        return <Info color="info" />;
    }
  };

  const steps = [
    'Upload Files',
    'Processing Options',
    'Review Results',
    'Confirm & Save',
  ];

  return (
    <Box>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mt: 3 }}>
        {activeStep === 0 && (
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
        )}

        {activeStep === 1 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Processing Options
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={processingOptions.generateThumbnails}
                        onChange={(e) => setProcessingOptions(prev => ({
                          ...prev,
                          generateThumbnails: e.target.checked
                        }))}
                      />
                    }
                    label="Generate Thumbnails"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={processingOptions.extractText}
                        onChange={(e) => setProcessingOptions(prev => ({
                          ...prev,
                          extractText: e.target.checked
                        }))}
                      />
                    }
                    label="Extract Text (OCR)"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={processingOptions.classifyDocuments}
                        onChange={(e) => setProcessingOptions(prev => ({
                          ...prev,
                          classifyDocuments: e.target.checked
                        }))}
                      />
                    }
                    label="Classify Documents"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={processingOptions.extractStructuredData}
                        onChange={(e) => setProcessingOptions(prev => ({
                          ...prev,
                          extractStructuredData: e.target.checked
                        }))}
                      />
                    }
                    label="Extract Structured Data"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={processingOptions.enableReceiptDetection}
                        onChange={(e) => setProcessingOptions(prev => ({
                          ...prev,
                          enableReceiptDetection: e.target.checked
                        }))}
                      />
                    }
                    label="Receipt Detection"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={processingOptions.enablePreprocessing}
                        onChange={(e) => setProcessingOptions(prev => ({
                          ...prev,
                          enablePreprocessing: e.target.checked
                        }))}
                      />
                    }
                    label="Image Preprocessing"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Confidence Threshold</InputLabel>
                    <Select
                      value={processingOptions.confidenceThreshold}
                      onChange={(e) => setProcessingOptions(prev => ({
                        ...prev,
                        confidenceThreshold: e.target.value as number
                      }))}
                    >
                      <MenuItem value={60}>60% - Low</MenuItem>
                      <MenuItem value={70}>70% - Medium</MenuItem>
                      <MenuItem value={80}>80% - High</MenuItem>
                      <MenuItem value={90}>90% - Very High</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {activeStep === 2 && files.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Processing Results ({files.length} files)
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

                      {file.ocrResult && (
                        <Box sx={{ mt: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            {getDocumentTypeIcon(file.ocrResult.documentType)}
                            <Typography variant="caption" sx={{ ml: 1 }}>
                              {file.ocrResult.documentType}
                            </Typography>
                            <Chip
                              label={`${file.ocrResult.confidence.toFixed(1)}%`}
                              size="small"
                              color={file.ocrResult.confidence > 80 ? 'success' : 'warning'}
                              sx={{ ml: 1 }}
                            />
                          </Box>
                          
                          {file.requiresReview && (
                            <Chip
                              label="Review Required"
                              size="small"
                              color="warning"
                              icon={<Warning />}
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

        {activeStep === 3 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Summary
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {files.filter(f => f.status === 'success').length} files processed successfully
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {files.filter(f => f.requiresReview).length} files require review
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          disabled={activeStep === 0}
          onClick={() => setActiveStep(prev => prev - 1)}
        >
          Back
        </Button>
        <Button
          variant="contained"
          disabled={activeStep === steps.length - 1}
          onClick={() => setActiveStep(prev => prev + 1)}
        >
          {activeStep === steps.length - 1 ? 'Complete' : 'Next'}
        </Button>
      </Box>

      {uploading && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <AlertTitle>Processing Files</AlertTitle>
          {batchStatus === 'processing' ? 'Batch processing in progress...' : 'Please wait while your files are being processed...'}
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

              {previewDialog.file.ocrResult && (
                <Accordion sx={{ mt: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6">OCR Results</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                      {previewDialog.file.ocrResult.text}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Document Type: {previewDialog.file.ocrResult.documentType}
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom>
                      Confidence: {previewDialog.file.ocrResult.confidence.toFixed(1)}%
                    </Typography>
                  </AccordionDetails>
                </Accordion>
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

export default EnhancedFileUpload;






