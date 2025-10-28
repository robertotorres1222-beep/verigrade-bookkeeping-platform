import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Paper
} from '@mui/material';
import {
  AttachFile as DocumentIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';

interface Document {
  id: string;
  name: string;
  type: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  description?: string;
  tags: string[];
}

const ClientDocuments: React.FC = () => {
  const router = useRouter();
  const { clientId } = router.query;
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('');
  const [documentDescription, setDocumentDescription] = useState('');
  const [documentTags, setDocumentTags] = useState('');

  useEffect(() => {
    if (clientId) {
      fetchDocuments();
    }
  }, [clientId]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`/api/client-portal/${clientId}/documents`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setDocuments(data.documents);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const uploadDocument = async () => {
    if (!selectedFile || !documentType) return;

    try {
      // First upload the file (this would typically go to a file upload service)
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const uploadResponse = await fetch('/api/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      const uploadData = await uploadResponse.json();
      
      if (uploadData.success) {
        // Then create the document record
        const response = await fetch(`/api/client-portal/${clientId}/documents`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: selectedFile.name,
            type: documentType,
            fileUrl: uploadData.fileUrl,
            fileSize: selectedFile.size,
            mimeType: selectedFile.type,
            description: documentDescription,
            tags: documentTags.split(',').map(tag => tag.trim()).filter(tag => tag)
          })
        });
        const data = await response.json();
        
        if (data.success) {
          setUploadDialogOpen(false);
          setSelectedFile(null);
          setDocumentType('');
          setDocumentDescription('');
          setDocumentTags('');
          fetchDocuments(); // Refresh documents
          alert('Document uploaded successfully!');
        } else {
          alert(`Upload failed: ${data.error}`);
        }
      } else {
        alert(`File upload failed: ${uploadData.error}`);
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Document upload failed');
    }
  };

  const downloadDocument = async (documentId: string, fileName: string) => {
    try {
      // This would typically generate a download URL or stream the file
      const response = await fetch(`/api/files/download/${documentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Download failed');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Download failed');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'invoice': return 'primary';
      case 'receipt': return 'success';
      case 'contract': return 'warning';
      case 'statement': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading documents...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Documents
        </Typography>
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={() => setUploadDialogOpen(true)}
        >
          Upload Document
        </Button>
      </Box>

      <Grid container spacing={3}>
        {documents.map((document) => (
          <Grid item xs={12} sm={6} md={4} key={document.id}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <DocumentIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" noWrap>
                    {document.name}
                  </Typography>
                </Box>
                
                <Box mb={2}>
                  <Chip 
                    label={document.type} 
                    color={getDocumentTypeColor(document.type) as any}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="body2" color="textSecondary">
                    {formatFileSize(document.fileSize)}
                  </Typography>
                </Box>

                {document.description && (
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {document.description}
                  </Typography>
                )}

                {document.tags.length > 0 && (
                  <Box mb={2}>
                    {document.tags.map((tag, index) => (
                      <Chip 
                        key={index}
                        label={tag} 
                        size="small" 
                        variant="outlined"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                )}

                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Uploaded: {formatDate(document.createdAt)}
                </Typography>

                <Box display="flex" gap={1}>
                  <Tooltip title="View Document">
                    <IconButton size="small">
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Download Document">
                    <IconButton 
                      size="small" 
                      onClick={() => downloadDocument(document.id, document.name)}
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {documents.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <DocumentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No documents found
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Upload your first document to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => setUploadDialogOpen(true)}
          >
            Upload Document
          </Button>
        </Paper>
      )}

      {/* Upload Dialog */}
      <Dialog 
        open={uploadDialogOpen} 
        onClose={() => setUploadDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Upload Document
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <input
              type="file"
              onChange={handleFileSelect}
              style={{ marginBottom: 16 }}
            />

            {selectedFile && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </Typography>
              </Box>
            )}

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Document Type</InputLabel>
              <Select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
              >
                <MenuItem value="invoice">Invoice</MenuItem>
                <MenuItem value="receipt">Receipt</MenuItem>
                <MenuItem value="contract">Contract</MenuItem>
                <MenuItem value="statement">Statement</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Description (Optional)"
              multiline
              rows={3}
              value={documentDescription}
              onChange={(e) => setDocumentDescription(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Tags (comma-separated)"
              value={documentTags}
              onChange={(e) => setDocumentTags(e.target.value)}
              placeholder="e.g., important, 2024, tax"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={uploadDocument}
            disabled={!selectedFile || !documentType}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientDocuments;










