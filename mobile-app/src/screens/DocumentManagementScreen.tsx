import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  FlatList,
  Image,
  Share,
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { apiService } from '../services/apiService';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  category: string;
  description?: string;
  tags: string[];
  uploadedBy: string;
  uploadedAt: string;
  fileUrl: string;
  thumbnailUrl?: string;
  isPublic: boolean;
  organizationId: string;
}

interface DocumentCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  documentCount: number;
}

const DocumentManagementScreen: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadDocuments();
    loadCategories();
  }, []);

  const loadDocuments = async () => {
    try {
      const docs = await apiService.getDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const cats = await apiService.getDocumentCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const uploadDocument = async (file: any, type: 'camera' | 'gallery' | 'file') => {
    setUploading(true);
    try {
      const formData = new FormData();
      
      if (type === 'file') {
        formData.append('file', {
          uri: file.uri,
          type: file.type,
          name: file.name,
        });
      } else {
        formData.append('file', {
          uri: file.uri,
          type: 'image/jpeg',
          name: 'document.jpg',
        });
      }

      const response = await apiService.uploadDocument(formData);
      
      // Add to documents list
      setDocuments(prev => [response.document, ...prev]);
      
      Alert.alert('Success', 'Document uploaded successfully!');
      setShowUploadModal(false);
    } catch (error) {
      console.error('Upload failed:', error);
      Alert.alert('Error', 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleCameraUpload = () => {
    const options = {
      mediaType: 'photo' as const,
      quality: 0.8,
    };

    launchCamera(options, (response) => {
      if (response.assets && response.assets[0]) {
        uploadDocument(response.assets[0], 'camera');
      }
    });
  };

  const handleGalleryUpload = () => {
    const options = {
      mediaType: 'photo' as const,
      quality: 0.8,
    };

    launchImageLibrary(options, (response) => {
      if (response.assets && response.assets[0]) {
        uploadDocument(response.assets[0], 'gallery');
      }
    });
  };

  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      
      if (result[0]) {
        uploadDocument(result[0], 'file');
      }
    } catch (error) {
      if (DocumentPicker.isCancel(error)) {
        // User cancelled
      } else {
        console.error('Document picker error:', error);
        Alert.alert('Error', 'Failed to select document');
      }
    }
  };

  const handleDocumentPress = (document: Document) => {
    setSelectedDocument(document);
    setShowDocumentModal(true);
  };

  const handleShareDocument = async (document: Document) => {
    try {
      await Share.share({
        url: document.fileUrl,
        title: document.name,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteDocument(documentId);
              setDocuments(prev => prev.filter(doc => doc.id !== documentId));
              Alert.alert('Success', 'Document deleted successfully');
            } catch (error) {
              console.error('Delete failed:', error);
              Alert.alert('Error', 'Failed to delete document');
            }
          },
        },
      ]
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return 'image';
    if (type.includes('pdf')) return 'picture-as-pdf';
    if (type.includes('word')) return 'description';
    if (type.includes('excel') || type.includes('spreadsheet')) return 'table-chart';
    if (type.includes('powerpoint') || type.includes('presentation')) return 'slideshow';
    return 'insert-drive-file';
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const renderDocument = ({ item }: { item: Document }) => (
    <TouchableOpacity
      style={styles.documentCard}
      onPress={() => handleDocumentPress(item)}
    >
      <View style={styles.documentHeader}>
        <View style={styles.documentIcon}>
          <Icon name={getFileIcon(item.type)} size={24} color="#007AFF" />
        </View>
        <View style={styles.documentInfo}>
          <Text style={styles.documentName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.documentMeta}>
            {formatFileSize(item.size)} • {new Date(item.uploadedAt).toLocaleDateString()}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.documentActions}
          onPress={() => handleShareDocument(item)}
        >
          <Icon name="share" size={20} color="#666" />
        </TouchableOpacity>
      </View>
      
      {item.description && (
        <Text style={styles.documentDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}
      
      {item.tags.length > 0 && (
        <View style={styles.documentTags}>
          {item.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          {item.tags.length > 3 && (
            <Text style={styles.moreTagsText}>+{item.tags.length - 3} more</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Documents</Text>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => setShowUploadModal(true)}
        >
          <Icon name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search documents..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        <TouchableOpacity
          style={[
            styles.categoryChip,
            selectedCategory === 'all' && styles.categoryChipActive
          ]}
          onPress={() => setSelectedCategory('all')}
        >
          <Text style={[
            styles.categoryChipText,
            selectedCategory === 'all' && styles.categoryChipTextActive
          ]}>
            All ({documents.length})
          </Text>
        </TouchableOpacity>
        
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.categoryChipActive
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Icon name={category.icon} size={16} color={category.color} />
            <Text style={[
              styles.categoryChipText,
              selectedCategory === category.id && styles.categoryChipTextActive
            ]}>
              {category.name} ({category.documentCount})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Documents List */}
      <FlatList
        data={filteredDocuments}
        renderItem={renderDocument}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.documentsList}
      />

      {/* Upload Modal */}
      <Modal
        visible={showUploadModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowUploadModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Upload Document</Text>
            <View style={{ width: 60 }} />
          </View>

          <View style={styles.uploadOptions}>
            <TouchableOpacity
              style={styles.uploadOption}
              onPress={handleCameraUpload}
              disabled={uploading}
            >
              <Icon name="camera-alt" size={48} color="#007AFF" />
              <Text style={styles.uploadOptionText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.uploadOption}
              onPress={handleGalleryUpload}
              disabled={uploading}
            >
              <Icon name="photo-library" size={48} color="#34C759" />
              <Text style={styles.uploadOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.uploadOption}
              onPress={handleFileUpload}
              disabled={uploading}
            >
              <Icon name="insert-drive-file" size={48} color="#FF9500" />
              <Text style={styles.uploadOptionText}>Choose File</Text>
            </TouchableOpacity>
          </View>

          {uploading && (
            <View style={styles.uploadingOverlay}>
              <Text style={styles.uploadingText}>Uploading...</Text>
            </View>
          )}
        </View>
      </Modal>

      {/* Document Details Modal */}
      <Modal
        visible={showDocumentModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowDocumentModal(false)}>
              <Text style={styles.modalCancelText}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Document Details</Text>
            <TouchableOpacity onPress={() => selectedDocument && handleDeleteDocument(selectedDocument.id)}>
              <Text style={styles.modalDeleteText}>Delete</Text>
            </TouchableOpacity>
          </View>

          {selectedDocument && (
            <ScrollView style={styles.documentDetails}>
              <View style={styles.documentPreview}>
                <Icon name={getFileIcon(selectedDocument.type)} size={64} color="#007AFF" />
                <Text style={styles.documentPreviewName}>{selectedDocument.name}</Text>
                <Text style={styles.documentPreviewMeta}>
                  {formatFileSize(selectedDocument.size)} • {selectedDocument.type}
                </Text>
              </View>

              <View style={styles.documentDetailsSection}>
                <Text style={styles.detailLabel}>Category</Text>
                <Text style={styles.detailValue}>{selectedDocument.category}</Text>
                
                <Text style={styles.detailLabel}>Uploaded by</Text>
                <Text style={styles.detailValue}>{selectedDocument.uploadedBy}</Text>
                
                <Text style={styles.detailLabel}>Uploaded on</Text>
                <Text style={styles.detailValue}>
                  {new Date(selectedDocument.uploadedAt).toLocaleString()}
                </Text>
                
                {selectedDocument.description && (
                  <>
                    <Text style={styles.detailLabel}>Description</Text>
                    <Text style={styles.detailValue}>{selectedDocument.description}</Text>
                  </>
                )}
                
                {selectedDocument.tags.length > 0 && (
                  <>
                    <Text style={styles.detailLabel}>Tags</Text>
                    <View style={styles.documentTags}>
                      {selectedDocument.tags.map((tag, index) => (
                        <View key={index} style={styles.tag}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}
              </View>

              <View style={styles.documentActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleShareDocument(selectedDocument)}
                >
                  <Icon name="share" size={20} color="#007AFF" />
                  <Text style={styles.actionButtonText}>Share</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryChipActive: {
    backgroundColor: '#007AFF',
  },
  categoryChipText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
  },
  categoryChipTextActive: {
    color: 'white',
  },
  documentsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  documentCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  documentMeta: {
    fontSize: 12,
    color: '#666',
  },
  documentActions: {
    padding: 8,
  },
  documentDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  documentTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  tag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#1976D2',
  },
  moreTagsText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#007AFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalDeleteText: {
    fontSize: 16,
    color: '#FF3B30',
  },
  uploadOptions: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  uploadOption: {
    alignItems: 'center',
    padding: 30,
    marginBottom: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    width: '100%',
  },
  uploadOptionText: {
    fontSize: 16,
    color: '#333',
    marginTop: 12,
    fontWeight: '500',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  documentDetails: {
    flex: 1,
    padding: 20,
  },
  documentPreview: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    marginBottom: 20,
  },
  documentPreviewName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    textAlign: 'center',
  },
  documentPreviewMeta: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  documentDetailsSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    marginTop: 12,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  documentActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
});

export default DocumentManagementScreen;
