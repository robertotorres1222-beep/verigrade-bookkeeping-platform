import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Camera, 
  Upload, 
  Search, 
  Package, 
  Plus, 
  Minus,
  QrCode,
  Scan,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface BarcodeResult {
  text: string;
  format: string;
  confidence: number;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface ProductInfo {
  name: string;
  sku: string;
  price: number;
  category: string;
  description?: string;
  imageUrl?: string;
}

interface InventoryItem {
  id: string;
  barcode: string;
  name: string;
  sku: string;
  price: number;
  category: string;
  description?: string;
  quantity: number;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

const BarcodeScanner: React.FC = () => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scannedResult, setScannedResult] = useState<BarcodeResult | null>(null);
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [manualBarcode, setManualBarcode] = useState<string>('');
  const [isAddingProduct, setIsAddingProduct] = useState<boolean>(false);
  const [newProduct, setNewProduct] = useState<Partial<InventoryItem>>({});
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [supportedFormats, setSupportedFormats] = useState<any[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize camera
  const initializeCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsScanning(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Failed to access camera');
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsScanning(false);
  }, [cameraStream]);

  // Scan barcode from camera
  const scanFromCamera = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);

    // Convert canvas to blob and send to API
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const formData = new FormData();
      formData.append('image', blob, 'scan.jpg');

      try {
        const response = await fetch('/api/barcode/scan', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();

        if (data.success) {
          setScannedResult(data.barcode);
          setProductInfo(data.product);
          toast.success('Barcode scanned successfully');
        } else {
          toast.error(data.error || 'Failed to scan barcode');
        }
      } catch (error) {
        console.error('Error scanning barcode:', error);
        toast.error('Failed to scan barcode');
      }
    }, 'image/jpeg');
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/barcode/scan', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (data.success) {
        setScannedResult(data.barcode);
        setProductInfo(data.product);
        toast.success('Barcode scanned successfully');
      } else {
        toast.error(data.error || 'Failed to scan barcode');
      }
    } catch (error) {
      console.error('Error scanning barcode:', error);
      toast.error('Failed to scan barcode');
    }
  }, []);

  // Look up product by barcode
  const lookupProduct = useCallback(async (barcode: string) => {
    try {
      const response = await fetch(`/api/barcode/lookup/${barcode}`);
      const data = await response.json();

      if (data.success) {
        setProductInfo(data.product);
        toast.success('Product found');
      } else {
        setProductInfo(null);
        toast.error(data.error || 'Product not found');
      }
    } catch (error) {
      console.error('Error looking up product:', error);
      toast.error('Failed to lookup product');
    }
  }, []);

  // Add product to inventory
  const addProductToInventory = useCallback(async () => {
    if (!scannedResult || !newProduct.name || !newProduct.sku || !newProduct.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/barcode/inventory/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          barcode: scannedResult.text,
          name: newProduct.name,
          sku: newProduct.sku,
          price: newProduct.price,
          category: newProduct.category || 'General',
          description: newProduct.description,
          quantity: newProduct.quantity || 0,
          location: newProduct.location,
        }),
      });
      const data = await response.json();

      if (data.success) {
        toast.success('Product added to inventory');
        setNewProduct({});
        setIsAddingProduct(false);
        loadInventoryItems();
      } else {
        toast.error(data.error || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    }
  }, [scannedResult, newProduct]);

  // Load inventory items
  const loadInventoryItems = useCallback(async () => {
    try {
      const response = await fetch('/api/barcode/inventory');
      const data = await response.json();

      if (data.success) {
        setInventoryItems(data.items);
      }
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  }, []);

  // Load supported formats
  const loadSupportedFormats = useCallback(async () => {
    try {
      const response = await fetch('/api/barcode/formats');
      const data = await response.json();

      if (data.success) {
        setSupportedFormats(data.formats);
      }
    } catch (error) {
      console.error('Error loading formats:', error);
    }
  }, []);

  // Update inventory quantity
  const updateQuantity = useCallback(async (itemId: string, quantity: number, operation: string) => {
    try {
      const response = await fetch(`/api/barcode/inventory/${itemId}/quantity`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity, operation }),
      });
      const data = await response.json();

      if (data.success) {
        toast.success('Quantity updated');
        loadInventoryItems();
      } else {
        toast.error(data.error || 'Failed to update quantity');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  }, [loadInventoryItems]);

  // Load data on component mount
  React.useEffect(() => {
    loadInventoryItems();
    loadSupportedFormats();
  }, [loadInventoryItems, loadSupportedFormats]);

  // Cleanup camera on unmount
  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Barcode Scanner</h1>
        <div className="flex items-center space-x-2">
          <Button
            onClick={isScanning ? stopCamera : initializeCamera}
            variant={isScanning ? "destructive" : "default"}
          >
            {isScanning ? (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Stop Camera
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 mr-2" />
                Start Camera
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="scanner" className="space-y-4">
        <TabsList>
          <TabsTrigger value="scanner">Scanner</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="formats">Formats</TabsTrigger>
        </TabsList>

        <TabsContent value="scanner" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scanner Interface */}
            <Card>
              <CardHeader>
                <CardTitle>Barcode Scanner</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isScanning ? (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-64 bg-black rounded-lg"
                    />
                    <canvas
                      ref={canvasRef}
                      className="hidden"
                    />
                    <Button
                      onClick={scanFromCamera}
                      className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
                    >
                      <Scan className="h-4 w-4 mr-2" />
                      Scan Now
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Camera className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500 mb-4">Camera not active</p>
                      <Button onClick={initializeCamera}>
                        <Camera className="h-4 w-4 mr-2" />
                        Start Camera
                      </Button>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-2">Or upload an image</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Image
                      </Button>
                    </div>
                  </div>
                )}

                {/* Manual Barcode Entry */}
                <div className="space-y-2">
                  <Label htmlFor="manual-barcode">Manual Barcode Entry</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="manual-barcode"
                      value={manualBarcode}
                      onChange={(e) => setManualBarcode(e.target.value)}
                      placeholder="Enter barcode manually"
                    />
                    <Button
                      onClick={() => {
                        if (manualBarcode) {
                          lookupProduct(manualBarcode);
                        }
                      }}
                      disabled={!manualBarcode}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scan Results */}
            <Card>
              <CardHeader>
                <CardTitle>Scan Results</CardTitle>
              </CardHeader>
              <CardContent>
                {scannedResult ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center mb-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <span className="font-medium text-green-800">Barcode Scanned</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Code:</span> {scannedResult.text}
                        </div>
                        <div>
                          <span className="font-medium">Format:</span> {scannedResult.format}
                        </div>
                        <div>
                          <span className="font-medium">Confidence:</span> {Math.round(scannedResult.confidence * 100)}%
                        </div>
                      </div>
                    </div>

                    {productInfo ? (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Package className="h-5 w-5 text-blue-600 mr-2" />
                          <span className="font-medium text-blue-800">Product Found</span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Name:</span> {productInfo.name}
                          </div>
                          <div>
                            <span className="font-medium">SKU:</span> {productInfo.sku}
                          </div>
                          <div>
                            <span className="font-medium">Price:</span> ${productInfo.price}
                          </div>
                          <div>
                            <span className="font-medium">Category:</span> {productInfo.category}
                          </div>
                          {productInfo.description && (
                            <div>
                              <span className="font-medium">Description:</span> {productInfo.description}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center mb-2">
                          <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                          <span className="font-medium text-yellow-800">Product Not Found</span>
                        </div>
                        <p className="text-sm text-yellow-700">
                          This barcode is not in our database. You can add it to inventory.
                        </p>
                        <Button
                          onClick={() => setIsAddingProduct(true)}
                          className="mt-2"
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add to Inventory
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <QrCode className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No barcode scanned yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Add Product Form */}
          {isAddingProduct && (
            <Card>
              <CardHeader>
                <CardTitle>Add Product to Inventory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="product-name">Product Name *</Label>
                    <Input
                      id="product-name"
                      value={newProduct.name || ''}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      placeholder="Enter product name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="product-sku">SKU *</Label>
                    <Input
                      id="product-sku"
                      value={newProduct.sku || ''}
                      onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                      placeholder="Enter SKU"
                    />
                  </div>
                  <div>
                    <Label htmlFor="product-price">Price *</Label>
                    <Input
                      id="product-price"
                      type="number"
                      step="0.01"
                      value={newProduct.price || ''}
                      onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                      placeholder="Enter price"
                    />
                  </div>
                  <div>
                    <Label htmlFor="product-category">Category</Label>
                    <Input
                      id="product-category"
                      value={newProduct.category || ''}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      placeholder="Enter category"
                    />
                  </div>
                  <div>
                    <Label htmlFor="product-quantity">Initial Quantity</Label>
                    <Input
                      id="product-quantity"
                      type="number"
                      value={newProduct.quantity || 0}
                      onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) })}
                      placeholder="Enter quantity"
                    />
                  </div>
                  <div>
                    <Label htmlFor="product-location">Location</Label>
                    <Input
                      id="product-location"
                      value={newProduct.location || ''}
                      onChange={(e) => setNewProduct({ ...newProduct, location: e.target.value })}
                      placeholder="Enter location"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="product-description">Description</Label>
                  <Input
                    id="product-description"
                    value={newProduct.description || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    placeholder="Enter description"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={addProductToInventory}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddingProduct(false);
                      setNewProduct({});
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Inventory Management</h2>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Search inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
              <Button onClick={loadInventoryItems}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inventoryItems.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <Badge variant="outline">{item.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">SKU:</span> {item.sku}
                    </div>
                    <div>
                      <span className="font-medium">Barcode:</span> {item.barcode}
                    </div>
                    <div>
                      <span className="font-medium">Price:</span> ${item.price}
                    </div>
                    <div>
                      <span className="font-medium">Quantity:</span> {item.quantity}
                    </div>
                    {item.location && (
                      <div>
                        <span className="font-medium">Location:</span> {item.location}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      onClick={() => updateQuantity(item.id, 1, 'add')}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.id, 1, 'subtract')}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="formats" className="space-y-4">
          <h2 className="text-2xl font-semibold">Supported Barcode Formats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {supportedFormats.map((format) => (
              <Card key={format.format}>
                <CardHeader>
                  <CardTitle className="text-lg">{format.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-2">{format.description}</p>
                  <div className="text-xs text-gray-500">
                    Max Length: {format.maxLength} characters
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BarcodeScanner;

