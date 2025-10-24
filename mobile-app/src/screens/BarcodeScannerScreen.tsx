import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';

interface ScannedItem {
  id: string;
  barcode: string;
  name: string;
  description: string;
  category: string;
  price: number;
  quantity: number;
  unit: string;
  supplier: string;
  sku: string;
  scannedAt: Date;
  imageUri?: string;
  notes?: string;
}

interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  sku: string;
  supplier: string;
  barcode: string;
  quantity: number;
  unit: string;
  imageUri?: string;
}

const { width, height } = Dimensions.get('window');

const BarcodeScannerScreen: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ScannedItem | null>(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [flashOn, setFlashOn] = useState(false);

  const cameraRef = useRef<Camera>(null);

  const categories = ['all', 'office', 'supplies', 'equipment', 'furniture', 'electronics'];

  useEffect(() => {
    requestCameraPermission();
    loadScannedItems();
    loadInventoryItems();
  }, []);

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const loadScannedItems = async () => {
    try {
      setIsLoading(true);
      // Mock data for demonstration
      const mockItems: ScannedItem[] = [
        {
          id: '1',
          barcode: '1234567890123',
          name: 'Office Chair',
          description: 'Ergonomic office chair with lumbar support',
          category: 'furniture',
          price: 299.99,
          quantity: 1,
          unit: 'piece',
          supplier: 'Office Depot',
          sku: 'OD-CHAIR-001',
          scannedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
          notes: 'For conference room'
        },
        {
          id: '2',
          barcode: '2345678901234',
          name: 'Printer Paper',
          description: 'A4 white printer paper, 500 sheets',
          category: 'supplies',
          price: 12.99,
          quantity: 5,
          unit: 'pack',
          supplier: 'Staples',
          sku: 'ST-PAPER-001',
          scannedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        },
        {
          id: '3',
          barcode: '3456789012345',
          name: 'Laptop Stand',
          description: 'Adjustable aluminum laptop stand',
          category: 'equipment',
          price: 89.99,
          quantity: 2,
          unit: 'piece',
          supplier: 'Amazon',
          sku: 'AM-STAND-001',
          scannedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
        }
      ];
      setScannedItems(mockItems);
    } catch (error) {
      console.error('Error loading scanned items:', error);
      Alert.alert('Error', 'Failed to load scanned items');
    } finally {
      setIsLoading(false);
    }
  };

  const loadInventoryItems = async () => {
    try {
      // Mock inventory data
      const mockInventory: InventoryItem[] = [
        {
          id: '1',
          name: 'Office Chair',
          description: 'Ergonomic office chair with lumbar support',
          category: 'furniture',
          price: 299.99,
          sku: 'OD-CHAIR-001',
          supplier: 'Office Depot',
          barcode: '1234567890123',
          quantity: 10,
          unit: 'piece'
        },
        {
          id: '2',
          name: 'Printer Paper',
          description: 'A4 white printer paper, 500 sheets',
          category: 'supplies',
          price: 12.99,
          sku: 'ST-PAPER-001',
          supplier: 'Staples',
          barcode: '2345678901234',
          quantity: 50,
          unit: 'pack'
        }
      ];
      setInventoryItems(mockInventory);
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  };

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (isScanning) {
      setIsScanning(false);
      
      // Check if item exists in inventory
      const existingItem = inventoryItems.find(item => item.barcode === data);
      
      if (existingItem) {
        // Item exists in inventory
        const newScannedItem: ScannedItem = {
          id: Date.now().toString(),
          barcode: data,
          name: existingItem.name,
          description: existingItem.description,
          category: existingItem.category,
          price: existingItem.price,
          quantity: 1,
          unit: existingItem.unit,
          supplier: existingItem.supplier,
          sku: existingItem.sku,
          scannedAt: new Date(),
        };
        
        setScannedItems(prev => [newScannedItem, ...prev]);
        Alert.alert('Item Found', `${existingItem.name} added to scanned items`);
      } else {
        // New item - show manual entry form
        Alert.alert(
          'New Item',
          'This barcode is not in your inventory. Would you like to add it manually?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Add Item', 
              onPress: () => {
                const newItem: ScannedItem = {
                  id: Date.now().toString(),
                  barcode: data,
                  name: '',
                  description: '',
                  category: 'office',
                  price: 0,
                  quantity: 1,
                  unit: 'piece',
                  supplier: '',
                  sku: '',
                  scannedAt: new Date(),
                };
                setSelectedItem(newItem);
                setShowItemModal(true);
              }
            }
          ]
        );
      }
    }
  };

  const startScanning = () => {
    setIsScanning(true);
  };

  const stopScanning = () => {
    setIsScanning(false);
  };

  const toggleFlash = () => {
    setFlashOn(!flashOn);
  };

  const saveScannedItem = (item: ScannedItem) => {
    setScannedItems(prev => [item, ...prev]);
    setShowItemModal(false);
    setSelectedItem(null);
    Alert.alert('Success', 'Item saved successfully');
  };

  const updateScannedItem = (itemId: string, updates: Partial<ScannedItem>) => {
    setScannedItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    ));
  };

  const deleteScannedItem = (itemId: string) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setScannedItems(prev => prev.filter(item => item.id !== itemId));
            if (selectedItem?.id === itemId) {
              setSelectedItem(null);
            }
          }
        }
      ]
    );
  };

  const exportItems = () => {
    Alert.alert('Export', 'Items exported successfully');
  };

  const filteredItems = scannedItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.barcode.includes(searchQuery) ||
                         item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'office':
        return '#3B82F6';
      case 'supplies':
        return '#10B981';
      case 'equipment':
        return '#F59E0B';
      case 'furniture':
        return '#8B5CF6';
      case 'electronics':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.message}>Requesting camera permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Icon name="camera-alt" size={64} color="#EF4444" />
          <Text style={styles.title}>Camera Permission Required</Text>
          <Text style={styles.message}>
            Please enable camera permission to scan barcodes for inventory management.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={requestCameraPermission}
          >
            <Text style={styles.buttonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Barcode Scanner</Text>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={isScanning ? stopScanning : startScanning}
        >
          <Icon 
            name={isScanning ? "stop" : "qr-code-scanner"} 
            size={24} 
            color="white" 
          />
        </TouchableOpacity>
      </View>

      {isScanning ? (
        <View style={styles.cameraContainer}>
          <Camera
            ref={cameraRef}
            style={styles.camera}
            type={Camera.Constants.Type.back}
            flashMode={flashOn ? Camera.Constants.FlashMode.torch : Camera.Constants.FlashMode.off}
            onBarCodeScanned={handleBarCodeScanned}
            barCodeScannerSettings={{
              barCodeTypes: [
                BarCodeScanner.Constants.BarCodeType.ean13,
                BarCodeScanner.Constants.BarCodeType.ean8,
                BarCodeScanner.Constants.BarCodeType.upc_a,
                BarCodeScanner.Constants.BarCodeType.upc_e,
                BarCodeScanner.Constants.BarCodeType.code128,
                BarCodeScanner.Constants.BarCodeType.code39,
                BarCodeScanner.Constants.BarCodeType.code93,
                BarCodeScanner.Constants.BarCodeType.qr,
              ],
            }}
          />
          
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerFrame} />
            <Text style={styles.scannerText}>
              Position the barcode within the frame
            </Text>
          </View>

          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={toggleFlash}
            >
              <Icon 
                name={flashOn ? "flash-on" : "flash-off"} 
                size={24} 
                color="white" 
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={stopScanning}
            >
              <Icon name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Icon name="search" size={20} color="#6B7280" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search scanned items..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          <ScrollView style={styles.categoriesContainer} horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.selectedCategoryChip
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category && styles.selectedCategoryText
                ]}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={exportItems}
            >
              <Icon name="file-download" size={20} color="#3B82F6" />
              <Text style={styles.actionButtonText}>Export</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.itemsContainer}>
            {isLoading ? (
              <ActivityIndicator size="large" color="#3B82F6" />
            ) : (
              filteredItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.itemCard}
                  onPress={() => {
                    setSelectedItem(item);
                    setShowItemModal(true);
                  }}
                >
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
                      <Text style={styles.categoryBadgeText}>{item.category}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.itemBarcode}>Barcode: {item.barcode}</Text>
                  <Text style={styles.itemSku}>SKU: {item.sku}</Text>
                  <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                  <Text style={styles.itemDate}>
                    Scanned: {format(item.scannedAt, 'MMM dd, yyyy • HH:mm')}
                  </Text>
                  
                  {item.notes && (
                    <Text style={styles.itemNotes} numberOfLines={2}>
                      {item.notes}
                    </Text>
                  )}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </>
      )}

      {/* Item Detail Modal */}
      <Modal
        visible={showItemModal && !!selectedItem}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedItem && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Item Details</Text>
              <TouchableOpacity
                onPress={() => setShowItemModal(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Item Name</Text>
                <TextInput
                  style={styles.input}
                  value={selectedItem.name}
                  onChangeText={(text) => updateScannedItem(selectedItem.id, { name: text })}
                  placeholder="Enter item name"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={selectedItem.description}
                  onChangeText={(text) => updateScannedItem(selectedItem.id, { description: text })}
                  placeholder="Enter item description"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {categories.filter(cat => cat !== 'all').map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryOption,
                        selectedItem.category === category && styles.selectedCategoryOption
                      ]}
                      onPress={() => updateScannedItem(selectedItem.id, { category })}
                    >
                      <Text style={[
                        styles.categoryOptionText,
                        selectedItem.category === category && styles.selectedCategoryOptionText
                      ]}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Price</Text>
                  <TextInput
                    style={styles.input}
                    value={selectedItem.price.toString()}
                    onChangeText={(text) => updateScannedItem(selectedItem.id, { price: parseFloat(text) || 0 })}
                    keyboardType="numeric"
                    placeholder="0.00"
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>Quantity</Text>
                  <TextInput
                    style={styles.input}
                    value={selectedItem.quantity.toString()}
                    onChangeText={(text) => updateScannedItem(selectedItem.id, { quantity: parseInt(text) || 1 })}
                    keyboardType="numeric"
                    placeholder="1"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Supplier</Text>
                <TextInput
                  style={styles.input}
                  value={selectedItem.supplier}
                  onChangeText={(text) => updateScannedItem(selectedItem.id, { supplier: text })}
                  placeholder="Enter supplier name"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>SKU</Text>
                <TextInput
                  style={styles.input}
                  value={selectedItem.sku}
                  onChangeText={(text) => updateScannedItem(selectedItem.id, { sku: text })}
                  placeholder="Enter SKU"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={selectedItem.notes || ''}
                  onChangeText={(text) => updateScannedItem(selectedItem.id, { notes: text })}
                  placeholder="Additional notes"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Summary</Text>
                <Text style={styles.summaryText}>
                  Barcode: {selectedItem.barcode}
                </Text>
                <Text style={styles.summaryText}>
                  Total Value: ${(selectedItem.price * selectedItem.quantity).toFixed(2)}
                </Text>
                <Text style={styles.summaryText}>
                  Scanned: {format(selectedItem.scannedAt, 'MMM dd, yyyy • HH:mm')}
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => {
                  deleteScannedItem(selectedItem.id);
                  setShowItemModal(false);
                }}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => {
                  if (selectedItem.name) {
                    saveScannedItem(selectedItem);
                  } else {
                    Alert.alert('Error', 'Please enter an item name');
                  }
                }}
              >
                <Text style={styles.saveButtonText}>Save Item</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        )}
      </Modal>
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
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  scanButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 4,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  scannerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 20,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 50,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: 'white',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#111827',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  selectedCategoryChip: {
    backgroundColor: '#3B82F6',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  selectedCategoryText: {
    color: 'white',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  itemsContainer: {
    flex: 1,
    padding: 16,
  },
  itemCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  itemBarcode: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  itemSku: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  itemNotes: {
    fontSize: 14,
    color: '#374151',
    fontStyle: 'italic',
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  selectedCategoryOption: {
    backgroundColor: '#3B82F6',
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  selectedCategoryOptionText: {
    color: 'white',
  },
  summaryCard: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  deleteButton: {
    flex: 1,
    padding: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#EF4444',
  },
  saveButton: {
    flex: 1,
    padding: 12,
    marginLeft: 8,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
});

export default BarcodeScannerScreen;

