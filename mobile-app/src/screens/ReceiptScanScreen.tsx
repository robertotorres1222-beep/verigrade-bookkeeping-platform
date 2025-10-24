import React, { useState, useRef } from 'react';
import { View, StyleSheet, Alert, Dimensions } from 'react-native';
import { Camera } from 'expo-camera';
import { Button, Card, Title, Paragraph, ActivityIndicator } from 'react-native-paper';
import { useOffline } from '../contexts/OfflineContext';
import { apiService } from '../services/apiService';

const { width, height } = Dimensions.get('window');

export default function ReceiptScanScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef<Camera>(null);
  const { isOfflineMode, addPendingAction } = useOffline();

  React.useEffect(() => {
    getCameraPermissions();
  }, []);

  const getCameraPermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleScan = async () => {
    if (!cameraRef.current) return;

    setIsScanning(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });

      await processReceipt(photo.uri);
    } catch (error) {
      Alert.alert('Error', 'Failed to capture receipt');
    } finally {
      setIsScanning(false);
    }
  };

  const processReceipt = async (imageUri: string) => {
    setIsProcessing(true);
    
    try {
      if (isOfflineMode) {
        // Store for later processing
        const pendingAction = {
          type: 'PROCESS_RECEIPT',
          data: { imageUri, timestamp: new Date().toISOString() },
        };
        addPendingAction(pendingAction);
        Alert.alert('Offline Mode', 'Receipt will be processed when online');
      } else {
        // Process immediately
        const result = await apiService.extractReceiptData(imageUri);
        setScannedData(result.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process receipt');
    } finally {
      setIsProcessing(false);
    }
  };

  const saveReceipt = async () => {
    if (!scannedData) return;

    try {
      const expenseData = {
        amount: scannedData.total,
        description: scannedData.vendor,
        category: 'office',
        date: new Date().toISOString(),
        receipt: scannedData.imageUrl,
      };

      if (isOfflineMode) {
        const pendingAction = {
          type: 'CREATE_EXPENSE',
          data: expenseData,
        };
        addPendingAction(pendingAction);
        Alert.alert('Offline Mode', 'Expense will be created when online');
      } else {
        await apiService.createExpense(expenseData);
        Alert.alert('Success', 'Receipt saved as expense');
      }

      setScannedData(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to save receipt');
    }
  };

  if (hasPermission === null) {
    return <View style={styles.container} />;
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Title>Camera Permission Required</Title>
          <Paragraph>Please enable camera access to scan receipts</Paragraph>
          <Button onPress={getCameraPermissions}>Grant Permission</Button>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={Camera.Constants.Type.back}
        flashMode={Camera.Constants.FlashMode.auto}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea} />
          <View style={styles.controls}>
            <Button
              mode="contained"
              onPress={handleScan}
              disabled={isScanning || isProcessing}
              style={styles.scanButton}
            >
              {isScanning ? 'Scanning...' : 'Scan Receipt'}
            </Button>
          </View>
        </View>
      </Camera>

      {isProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Paragraph style={styles.processingText}>
            Processing receipt...
          </Paragraph>
        </View>
      )}

      {scannedData && (
        <Card style={styles.resultCard}>
          <Title>Receipt Data</Title>
          <Paragraph>Vendor: {scannedData.vendor}</Paragraph>
          <Paragraph>Total: ${scannedData.total}</Paragraph>
          <Paragraph>Date: {new Date(scannedData.date).toLocaleDateString()}</Paragraph>
          <View style={styles.resultActions}>
            <Button mode="outlined" onPress={() => setScannedData(null)}>
              Cancel
            </Button>
            <Button mode="contained" onPress={saveReceipt}>
              Save as Expense
            </Button>
          </View>
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: width * 0.8,
    height: height * 0.4,
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: 'transparent',
    borderRadius: 10,
  },
  controls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  scanButton: {
    paddingHorizontal: 30,
    paddingVertical: 10,
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
  },
  processingText: {
    color: 'white',
    marginTop: 10,
  },
  resultCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    margin: 20,
    padding: 20,
  },
  resultActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  card: {
    margin: 20,
    padding: 20,
  },
});