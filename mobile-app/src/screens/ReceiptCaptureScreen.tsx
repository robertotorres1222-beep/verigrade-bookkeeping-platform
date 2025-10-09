import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CameraType, CameraPermissionStatus } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface ReceiptData {
  amount: number;
  vendor: string;
  category: string;
  date: string;
  description: string;
  confidence: number;
}

const ReceiptCaptureScreen: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<CameraPermissionStatus | null>(null);
  const [cameraType, setCameraType] = useState(CameraType.back);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResult, setProcessingResult] = useState<ReceiptData | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const cameraRef = useRef<Camera>(null);

  React.useEffect(() => {
    getCameraPermissions();
  }, []);

  const getCameraPermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status);
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
        });
        setCapturedImage(photo.uri);
        setShowCamera(false);
      } catch (error) {
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled) {
      setCapturedImage(result.assets[0].uri);
    }
  };

  const processReceipt = async () => {
    if (!capturedImage) return;

    setIsProcessing(true);
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock processing result
      const mockResult: ReceiptData = {
        amount: 245.67,
        vendor: 'Office Depot',
        category: 'Office Supplies',
        date: new Date().toISOString().split('T')[0],
        description: 'Office supplies and stationery',
        confidence: 0.92,
      };

      setProcessingResult(mockResult);
    } catch (error) {
      Alert.alert('Error', 'Failed to process receipt');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setProcessingResult(null);
    setIsProcessing(false);
  };

  const saveTransaction = () => {
    if (processingResult) {
      Alert.alert(
        'Transaction Created',
        `Receipt processed successfully!\nAmount: $${processingResult.amount}\nVendor: ${processingResult.vendor}`,
        [
          { text: 'OK', onPress: () => resetCapture() }
        ]
      );
    }
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.message}>Requesting camera permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Icon name="camera-alt" size={64} color="#6B7280" />
          <Text style={styles.message}>Camera permission is required to capture receipts</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={getCameraPermissions}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (showCamera) {
    return (
      <SafeAreaView style={styles.container}>
        <Camera
          style={styles.camera}
          type={cameraType}
          ref={cameraRef}
        >
          <View style={styles.cameraOverlay}>
            <View style={styles.cameraHeader}>
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={() => setShowCamera(false)}
              >
                <Icon name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={() => setCameraType(
                  cameraType === CameraType.back ? CameraType.front : CameraType.back
                )}
              >
                <Icon name="flip-camera-android" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.cameraFooter}>
              <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                <Icon name="camera-alt" size={32} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </Camera>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Capture Receipt</Text>
        <Text style={styles.subtitle}>Take a photo or select from gallery</Text>
      </View>

      {!capturedImage ? (
        <View style={styles.captureOptions}>
          <TouchableOpacity
            style={styles.captureOption}
            onPress={() => setShowCamera(true)}
          >
            <Icon name="camera-alt" size={48} color="#3B82F6" />
            <Text style={styles.captureOptionTitle}>Use Camera</Text>
            <Text style={styles.captureOptionDescription}>
              Take a photo of your receipt
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.captureOption}
            onPress={pickImage}
          >
            <Icon name="photo-library" size={48} color="#3B82F6" />
            <Text style={styles.captureOptionTitle}>Select Photo</Text>
            <Text style={styles.captureOptionDescription}>
              Choose from your gallery
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.imageContainer}>
          <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
          
          <View style={styles.imageActions}>
            <TouchableOpacity
              style={styles.imageActionButton}
              onPress={resetCapture}
            >
              <Icon name="refresh" size={20} color="#6B7280" />
              <Text style={styles.imageActionText}>Retake</Text>
            </TouchableOpacity>

            {!processingResult && !isProcessing && (
              <TouchableOpacity
                style={[styles.imageActionButton, styles.processButton]}
                onPress={processReceipt}
              >
                <Icon name="auto-fix-high" size={20} color="#FFFFFF" />
                <Text style={[styles.imageActionText, styles.processButtonText]}>
                  Process with AI
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {isProcessing && (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.processingText}>Processing receipt...</Text>
              <Text style={styles.processingSubtext}>
                AI is extracting transaction details
              </Text>
            </View>
          )}

          {processingResult && (
            <View style={styles.resultContainer}>
              <View style={styles.resultHeader}>
                <Icon name="check-circle" size={24} color="#10B981" />
                <Text style={styles.resultTitle}>Receipt Processed!</Text>
              </View>

              <View style={styles.resultDetails}>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Amount:</Text>
                  <Text style={styles.resultValue}>
                    ${processingResult.amount.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Vendor:</Text>
                  <Text style={styles.resultValue}>{processingResult.vendor}</Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Category:</Text>
                  <Text style={styles.resultValue}>{processingResult.category}</Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Date:</Text>
                  <Text style={styles.resultValue}>{processingResult.date}</Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Confidence:</Text>
                  <Text style={styles.resultValue}>
                    {(processingResult.confidence * 100).toFixed(0)}%
                  </Text>
                </View>
              </View>

              <View style={styles.resultActions}>
                <TouchableOpacity
                  style={styles.resultActionButton}
                  onPress={resetCapture}
                >
                  <Text style={styles.resultActionButtonText}>Process Another</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.resultActionButton, styles.saveButton]}
                  onPress={saveTransaction}
                >
                  <Text style={[styles.resultActionButtonText, styles.saveButtonText]}>
                    Save Transaction
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  cameraButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 12,
  },
  cameraFooter: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  captureButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 40,
    padding: 20,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  captureOptions: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  captureOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  captureOptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  captureOptionDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  imageContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  capturedImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 20,
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  imageActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  imageActionText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  processButton: {
    backgroundColor: '#3B82F6',
  },
  processButtonText: {
    color: '#FFFFFF',
  },
  processingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  processingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  processingSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  resultContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 8,
  },
  resultDetails: {
    marginBottom: 20,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  resultLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  resultActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resultActionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  resultActionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButton: {
    backgroundColor: '#10B981',
  },
  saveButtonText: {
    color: '#FFFFFF',
  },
});

export default ReceiptCaptureScreen;




