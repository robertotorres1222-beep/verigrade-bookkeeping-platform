import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  Grid,
  Tooltip,
  Alert,
  AlertTitle,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Avatar,
  Badge
} from '@mui/material';
import {
  CloudUpload,
  Visibility,
  Edit,
  Check,
  Close,
  AutoAwesome,
  SmartToy,
  Warning,
  Info,
  CheckCircle,
  Compare,
  Download,
  Share,
  Delete,
  Refresh,
  ZoomIn,
  ZoomOut,
  RotateLeft,
  RotateRight,
  FilterList,
  Sort
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const DocumentContainer = styled(Box)(({ theme }) => ({
  height: '600px',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  position: 'relative',
}));

const AnnotationOverlay = styled(Box)<{ confidence: number }>(({ theme, confidence }) => ({
  position: 'absolute',
  border: `2px solid ${confidence > 0.8 ? theme.palette.success.main : confidence > 0.6 ? theme.palette.warning.main : theme.palette.error.main}`,
  backgroundColor: `${confidence > 0.8 ? theme.palette.success.main : confidence > 0.6 ? theme.palette.warning.main : theme.palette.error.main}20`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.5),
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: `${confidence > 0.8 ? theme.palette.success.main : confidence > 0.6 ? theme.palette.warning.main : theme.palette.error.main}40`,
    transform: 'scale(1.02)',
  },
}));

const ConfidenceChip = styled(Chip)<{ confidence: number }>(({ theme, confidence }) => ({
  fontWeight: 'bold',
  ...(confidence > 0.8 && {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
  }),
  ...(confidence > 0.6 && confidence <= 0.8 && {
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.warning.contrastText,
  }),
  ...(confidence <= 0.6 && {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
  }),
}));

interface ExtractedField {
  id: string;
  name: string;
  value: string;
  confidence: number;
  position: { x: number; y: number; width: number; height: number };
  type: 'text' | 'number' | 'date' | 'currency';
  isCorrected: boolean;
  originalValue?: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  extractedFields: ExtractedField[];
  aiAnalysis: {
    documentType: string;
    confidence: number;
    summary: string;
    keyPoints: string[];
  };
  processingStatus: 'processing' | 'completed' | 'error';
  createdAt: Date;
}

interface SmartDocumentViewerProps {
  documentId?: string;
  onFieldUpdate?: (fieldId: string, newValue: string) => void;
  onDocumentProcess?: (document: Document) => void;
}

const SmartDocumentViewer: React.FC<SmartDocumentViewerProps> = ({ 
  documentId, 
  onFieldUpdate, 
  onDocumentProcess 
}) => {
  const [document, setDocument] = useState<Document | null>(null);
  const [selectedField, setSelectedField] = useState<ExtractedField | null>(null);
  const [editingField, setEditingField] = useState<ExtractedField | null>(null);
  const [correctionDialog, setCorrectionDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [sortBy, setSortBy] = useState<'confidence' | 'name' | 'position'>('confidence');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (documentId) {
      fetchDocument();
    }
  }, [documentId]);

  const fetchDocument = async () => {
    if (!documentId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/ai/document/${documentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setDocument(data.document);
        if (onDocumentProcess) {
          onDocumentProcess(data.document);
        }
      }
    } catch (error) {
      console.error('Error fetching document:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldClick = (field: ExtractedField) => {
    setSelectedField(field);
    setEditingField(field);
  };

  const handleFieldCorrection = async (fieldId: string, newValue: string) => {
    try {
      await fetch(`/api/ai/document/field/${fieldId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ value: newValue })
      });

      setDocument(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          extractedFields: prev.extractedFields.map(field => 
            field.id === fieldId 
              ? { ...field, value: newValue, isCorrected: true, originalValue: field.value }
              : field
          )
        };
      });

      if (onFieldUpdate) {
        onFieldUpdate(fieldId, newValue);
      }
    } catch (error) {
      console.error('Error updating field:', error);
    }
  };

  const handleBatchProcessing = async (documents: File[]) => {
    try {
      setLoading(true);
      const formData = new FormData();
      documents.forEach(doc => formData.append('documents', doc));

      const response = await fetch('/api/ai/document/batch-process', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        // Handle batch processing results
        console.log('Batch processing completed:', data.results);
      }
    } catch (error) {
      console.error('Error in batch processing:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredFields = () => {
    if (!document) return [];
    
    let filtered = document.extractedFields;
    
    if (filter !== 'all') {
      const confidenceThreshold = filter === 'high' ? 0.8 : filter === 'medium' ? 0.6 : 0;
      filtered = filtered.filter(field => {
        if (filter === 'high') return field.confidence > 0.8;
        if (filter === 'medium') return field.confidence > 0.6 && field.confidence <= 0.8;
        if (filter === 'low') return field.confidence <= 0.6;
        return true;
      });
    }
    
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'confidence':
          return b.confidence - a.confidence;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'position':
          return a.position.y - b.position.y;
        default:
          return 0;
      }
    });
  };

  const renderDocumentViewer = () => {
    if (!document) {
      return (
        <Box sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          p: 4
        }}>
          <CloudUpload sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No document selected
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload a document to see AI-powered extraction and analysis
          </Typography>
        </Box>
      );
    }

    return (
      <DocumentContainer>
        <Box sx={{ position: 'relative', height: '100%', overflow: 'auto' }}>
          {/* Document Image/PDF Viewer */}
          <Box sx={{ 
            position: 'relative',
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transformOrigin: 'top left',
            transition: 'transform 0.3s ease'
          }}>
            <img 
              src={document.url} 
              alt={document.name}
              style={{ 
                width: '100%', 
                height: 'auto',
                display: 'block'
              }}
            />
            
            {/* AI Annotations Overlay */}
            {document.extractedFields.map((field) => (
              <AnnotationOverlay
                key={field.id}
                confidence={field.confidence}
                sx={{
                  left: field.position.x,
                  top: field.position.y,
                  width: field.position.width,
                  height: field.position.height,
                }}
                onClick={() => handleFieldClick(field)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                    {field.name}
                  </Typography>
                  <ConfidenceChip 
                    label={`${Math.round(field.confidence * 100)}%`}
                    size="small"
                    confidence={field.confidence}
                  />
                  {field.isCorrected && (
                    <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                  )}
                </Box>
              </AnnotationOverlay>
            ))}
          </Box>
        </Box>
      </DocumentContainer>
    );
  };

  const renderFieldList = () => {
    const filteredFields = getFilteredFields();
    
    return (
      <Box sx={{ height: '100%', overflow: 'auto' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" gutterBottom>
            Extracted Fields ({filteredFields.length})
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button
              size="small"
              variant={filter === 'all' ? 'contained' : 'outlined'}
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              size="small"
              variant={filter === 'high' ? 'contained' : 'outlined'}
              onClick={() => setFilter('high')}
            >
              High Confidence
            </Button>
            <Button
              size="small"
              variant={filter === 'medium' ? 'contained' : 'outlined'}
              onClick={() => setFilter('medium')}
            >
              Medium
            </Button>
            <Button
              size="small"
              variant={filter === 'low' ? 'contained' : 'outlined'}
              onClick={() => setFilter('low')}
            >
              Low Confidence
            </Button>
          </Box>
        </Box>

        <List>
          {filteredFields.map((field) => (
            <ListItem 
              key={field.id}
              button
              onClick={() => handleFieldClick(field)}
              selected={selectedField?.id === field.id}
            >
              <ListItemIcon>
                <Badge 
                  badgeContent={field.isCorrected ? 1 : 0} 
                  color="success"
                >
                  <AutoAwesome />
                </Badge>
              </ListItemIcon>
              <ListItemText
                primary={field.name}
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {field.value}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <ConfidenceChip 
                        label={`${Math.round(field.confidence * 100)}%`}
                        size="small"
                        confidence={field.confidence}
                      />
                      {field.isCorrected && (
                        <Chip 
                          label="Corrected" 
                          size="small" 
                          color="success" 
                          icon={<Check />}
                        />
                      )}
                    </Box>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </Box>
    );
  };

  const renderCorrectionDialog = () => (
    <Dialog 
      open={correctionDialog} 
      onClose={() => setCorrectionDialog(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Edit />
          <Typography variant="h6">Correct Field Value</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        {editingField && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Field: {editingField.name}
            </Typography>
            <TextField
              fullWidth
              label="Current Value"
              value={editingField.value}
              onChange={(e) => setEditingField({ ...editingField, value: e.target.value })}
              sx={{ mb: 2 }}
            />
            {editingField.originalValue && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <AlertTitle>Original Value</AlertTitle>
                {editingField.originalValue}
              </Alert>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption">AI Confidence:</Typography>
              <LinearProgress 
                variant="determinate" 
                value={editingField.confidence * 100} 
                sx={{ flex: 1 }}
              />
              <Typography variant="caption">
                {Math.round(editingField.confidence * 100)}%
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setCorrectionDialog(false)}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={() => {
            if (editingField) {
              handleFieldCorrection(editingField.id, editingField.value);
              setCorrectionDialog(false);
            }
          }}
        >
          Save Correction
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">
            Smart Document Viewer
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Zoom In">
              <IconButton onClick={() => setZoom(prev => Math.min(prev + 0.1, 3))}>
                <ZoomIn />
              </IconButton>
            </Tooltip>
            <Tooltip title="Zoom Out">
              <IconButton onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.5))}>
                <ZoomOut />
              </IconButton>
            </Tooltip>
            <Tooltip title="Rotate Left">
              <IconButton onClick={() => setRotation(prev => prev - 90)}>
                <RotateLeft />
              </IconButton>
            </Tooltip>
            <Tooltip title="Rotate Right">
              <IconButton onClick={() => setRotation(prev => prev + 90)}>
                <RotateRight />
              </IconButton>
            </Tooltip>
            <Divider orientation="vertical" flexItem />
            <Tooltip title="Refresh">
              <IconButton onClick={fetchDocument}>
                <Refresh />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download">
              <IconButton>
                <Download />
              </IconButton>
            </Tooltip>
            <Tooltip title="Share">
              <IconButton>
                <Share />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex' }}>
        {/* Document Viewer */}
        <Box sx={{ flex: 2, borderRight: 1, borderColor: 'divider' }}>
          {renderDocumentViewer()}
        </Box>

        {/* Field List */}
        <Box sx={{ flex: 1, minWidth: 300 }}>
          {renderFieldList()}
        </Box>
      </Box>

      {/* AI Analysis Summary */}
      {document && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
          <Typography variant="h6" gutterBottom>
            AI Analysis Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Document Type: {document.aiAnalysis.documentType}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Confidence: {Math.round(document.aiAnalysis.confidence * 100)}%
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Fields Extracted: {document.extractedFields.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Status: {document.processingStatus}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      )}

      {renderCorrectionDialog()}
    </Box>
  );
};

export default SmartDocumentViewer;










