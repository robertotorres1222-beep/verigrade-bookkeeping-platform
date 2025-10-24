import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Camera, CameraType, FlashMode } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface ReceiptCaptureProps {
  onReceiptCaptured: (receiptData: any) => void;
  onError: (error: string) => void;
}

interface ReceiptData {
  imageUri: string;
  extractedText: string;
  vendor: string;
  total: number;
  date: string;
  confidence: number;
  items: Array<{
    description: string;
    quantity: number;
    price: number;
    total: number;
  }>;
}

const ReceiptCapture: React.FC<ReceiptCaptureProps> = ({
  onReceiptCaptured,
  onError,
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState<CameraType>(CameraType.back);
  const [flashMode, setFlashMode] = useState<FlashMode>(FlashMode.off);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  
  const cameraRef = useRef<Camera>(null);

  useEffect(() => {
    getCameraPermissions();
  }, []);

  const getCameraPermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const takePicture = async () => {
    if (cameraRef.current && !isCapturing) {
      try {
        setIsCapturing(true);
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
          skipProcessing: false,
        });
        
        setCapturedImage(photo.uri);
        setShowPreview(true);
      } catch (error) {
        console.error('Error taking picture:', error);
        onError('Failed to capture image');
      } finally {
        setIsCapturing(false);
      }
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets[0].uri);
        setShowPreview(true);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      onError('Failed to select image from gallery');
    }
  };

  const processReceipt = async (imageUri: string) => {
    try {
      setIsProcessing(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'receipt.jpg',
      } as any);
      formData.append('extractText', 'true');
      formData.append('classifyDocument', 'true');
      formData.append('extractStructuredData', 'true');

      // Upload and process the image
      const response = await fetch('/api/documents/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${await getAuthToken()}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        const processedData: ReceiptData = {
          imageUri,
          extractedText: data.data.extractedData?.text || '',
          vendor: data.data.extractedData?.vendor || 'Unknown Vendor',
          total: data.data.extractedData?.total || 0,
          date: data.data.extractedData?.date || new Date().toISOString().split('T')[0],
          confidence: data.data.confidence || 0,
          items: data.data.extractedData?.items || [],
        };

        setReceiptData(processedData);
        onReceiptCaptured(processedData);
      } else {
        throw new Error(data.message || 'Failed to process receipt');
      }
    } catch (error) {
      console.error('Error processing receipt:', error);
      onError('Failed to process receipt. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getAuthToken = async (): Promise<string> => {
    // In a real implementation, you would get the token from secure storage
    return 'mock-auth-token';
  };

  const retakePicture = () => {
    setCapturedImage(null);
    setShowPreview(false);
    setReceiptData(null);
  };

  const confirmReceipt = () => {
    if (receiptData) {
      onReceiptCaptured(receiptData);
      setShowPreview(false);
      setCapturedImage(null);
      setReceiptData(null);
    }
  };

  const toggleCameraType = () => {
    setCameraType(current => 
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  };

  const toggleFlashMode = () => {
    setFlashMode(current => 
      current === FlashMode.off ? FlashMode.on : FlashMode.off
    );
  };

  if (hasPermission === null) {
    return (
      <View style={styles.centerContainer}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No access to camera</Text>
        <TouchableOpacity style={styles.button} onPress={getCameraPermissions}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (showPreview && capturedImage) {
    return (
      <Modal visible={showPreview} animationType="slide">
        <SafeAreaView style={styles.previewContainer}>
          <View style={styles.previewHeader}>
            <TouchableOpacity onPress={retakePicture} style={styles.headerButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.previewTitle}>Receipt Preview</Text>
            <TouchableOpacity onPress={confirmReceipt} style={styles.headerButton}>
              <Ionicons name="checkmark" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.previewContent}>
            <Image source={{ uri: capturedImage }} style={styles.previewImage} />
            
            {isProcessing && (
              <View style={styles.processingOverlay}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.processingText}>Processing receipt...</Text>
              </View>
            )}

            {receiptData && (
              <View style={styles.receiptDataContainer}>
                <Text style={styles.receiptDataTitle}>Extracted Data:</Text>
                <Text style={styles.receiptDataText}>Vendor: {receiptData.vendor}</Text>
                <Text style={styles.receiptDataText}>Total: ${receiptData.total.toFixed(2)}</Text>
                <Text style={styles.receiptDataText}>Date: {receiptData.date}</Text>
                <Text style={styles.receiptDataText}>
                  Confidence: {receiptData.confidence.toFixed(1)}%
                </Text>
              </View>
            )}
          </View>

          <View style={styles.previewActions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.retakeButton]} 
              onPress={retakePicture}
            >
              <Ionicons name="camera" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Retake</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.processButton]} 
              onPress={() => processReceipt(capturedImage)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="scan" size={20} color="#fff" />
              )}
              <Text style={styles.actionButtonText}>
                {isProcessing ? 'Processing...' : 'Process'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.confirmButton]} 
              onPress={confirmReceipt}
              disabled={!receiptData}
            >
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={cameraType}
        flashMode={flashMode}
        ref={cameraRef}
      >
        <View style={styles.cameraOverlay}>
          {/* Header */}
          <View style={styles.cameraHeader}>
            <TouchableOpacity onPress={pickImageFromGallery} style={styles.headerButton}>
              <Ionicons name="images" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.cameraTitle}>Capture Receipt</Text>
            <TouchableOpacity onPress={toggleFlashMode} style={styles.headerButton}>
              <Ionicons 
                name={flashMode === FlashMode.on ? "flash" : "flash-off"} 
                size={24} 
                color="#fff" 
              />
            </TouchableOpacity>
          </View>

          {/* Receipt frame overlay */}
          <View style={styles.receiptFrame}>
            <View style={styles.frameCorner} />
            <View style={[styles.frameCorner, styles.frameCornerTopRight]} />
            <View style={[styles.frameCorner, styles.frameCornerBottomLeft]} />
            <View style={[styles.frameCorner, styles.frameCornerBottomRight]} />
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsText}>
              Position the receipt within the frame
            </Text>
            <Text style={styles.instructionsSubtext}>
              Ensure the receipt is well-lit and clearly visible
            </Text>
          </View>

          {/* Bottom controls */}
          <View style={styles.cameraControls}>
            <TouchableOpacity onPress={pickImageFromGallery} style={styles.controlButton}>
              <Ionicons name="images" size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={takePicture}
              style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
              disabled={isCapturing}
            >
              {isCapturing ? (
                <ActivityIndicator size="large" color="#fff" />
              ) : (
                <View style={styles.captureButtonInner} />
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleCameraType} style={styles.controlButton}>
              <Ionicons name="camera-reverse" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Camera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  cameraTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerButton: {
    padding: 10,
  },
  receiptFrame: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: width * 0.8,
    height: height * 0.4,
    marginLeft: -(width * 0.4),
    marginTop: -(height * 0.2),
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  frameCorner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderLeftWidth: 3,
    borderTopWidth: 3,
    borderColor: '#007AFF',
    top: -2,
    left: -2,
  },
  frameCornerTopRight: {
    borderLeftWidth: 0,
    borderRightWidth: 3,
    left: 'auto',
    right: -2,
  },
  frameCornerBottomLeft: {
    borderTopWidth: 0,
    borderBottomWidth: 3,
    top: 'auto',
    bottom: -2,
  },
  frameCornerBottomRight: {
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderRightWidth: 3,
    borderBottomWidth: 3,
    top: 'auto',
    left: 'auto',
    right: -2,
    bottom: -2,
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  instructionsText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 5,
  },
  instructionsSubtext: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
    textAlign: 'center',
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  controlButton: {
    padding: 15,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  previewTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  previewContent: {
    flex: 1,
    padding: 20,
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    resizeMode: 'contain',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  processingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
  receiptDataContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  receiptDataTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  receiptDataText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 5,
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 100,
    justifyContent: 'center',
  },
  retakeButton: {
    backgroundColor: '#FF3B30',
  },
  processButton: {
    backgroundColor: '#007AFF',
  },
  confirmButton: {
    backgroundColor: '#34C759',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReceiptCapture;







