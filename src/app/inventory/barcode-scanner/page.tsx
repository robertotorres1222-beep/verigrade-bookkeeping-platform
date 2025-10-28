'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Camera, 
  QrCode, 
  Scan, 
  Upload, 
  Download,
  CheckCircle,
  AlertCircle,
  Clock,
  BarChart3,
  Package,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Zap,
  Settings,
  History,
  TrendingUp
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

interface ScanSession {
  id: string;
  name: string;
  startTime: Date;
  endTime?: Date;
  totalScans: number;
  successfulScans: number;
  failedScans: number;
  results: BarcodeResult[];
  status: 'active' | 'completed' | 'paused';
}

export default function BarcodeScannerPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<BarcodeResult[]>([]);
  const [productInfo, setProductInfo] = useState<Record<string, ProductInfo>>({});
  const [scanSessions, setScanSessions] = useState<ScanSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ScanSession | null>(null);
  const [bulkScanProgress, setBulkScanProgress] = useState(0);
  const [isBulkScanning, setIsBulkScanning] = useState(false);
  const [activeTab, setActiveTab] = useState('scanner');
  const [scanningStats, setScanningStats] = useState({
    totalScans: 0,
    successfulScans: 0,
    failedScans: 0,
    averageConfidence: 0,
    mostCommonFormat: 'UPC_A',
    formats: {} as Record<string, number>
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    loadScanningStats();
    loadScanSessions();
  }, []);

  const loadScanningStats = async () => {
    try {
      const response = await fetch('/api/barcode/stats');
      if (response.ok) {
        const data = await response.json();
        setScanningStats(data.data);
      }
    } catch (error) {
      console.error('Failed to load scanning stats:', error);
    }
  };

  const loadScanSessions = async () => {
    try {
      const response = await fetch('/api/barcode/sessions');
      if (response.ok) {
        const data = await response.json();
        setScanSessions(data.data);
      }
    } catch (error) {
      console.error('Failed to load scan sessions:', error);
    }
  };

  const startScanSession = () => {
    const session: ScanSession = {
      id: `session_${Date.now()}`,
      name: `Scan Session ${scanSessions.length + 1}`,
      startTime: new Date(),
      totalScans: 0,
      successfulScans: 0,
      failedScans: 0,
      results: [],
      status: 'active'
    };

    setCurrentSession(session);
    setScanSessions(prev => [session, ...prev]);
    toast.success('Scan session started');
  };

  const stopScanSession = () => {
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        endTime: new Date(),
        status: 'completed' as const
      };
      
      setScanSessions(prev => prev.map(s => 
        s.id === currentSession.id ? updatedSession : s
      ));
      setCurrentSession(null);
      toast.success('Scan session completed');
    }
  };

  const startCameraScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
        
        if (!currentSession) {
          startScanSession();
        }
      }
    } catch (error) {
      console.error('Error starting camera:', error);
      toast.error('Failed to start camera. Please check permissions.');
    }
  };

  const stopCameraScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsBulkScanning(true);
    setBulkScanProgress(0);

    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch('/api/barcode/bulk-scan', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setScanResults(prev => [...prev, ...data.data.results]);
        
        // Update current session
        if (currentSession) {
          const updatedSession = {
            ...currentSession,
            totalScans: currentSession.totalScans + data.data.summary.total,
            successfulScans: currentSession.successfulScans + data.data.summary.successful,
            failedScans: currentSession.failedScans + data.data.summary.failed,
            results: [...currentSession.results, ...data.data.results]
          };
          setCurrentSession(updatedSession);
        }

        toast.success(`Bulk scan completed: ${data.data.summary.successful} successful, ${data.data.summary.failed} failed`);
      } else {
        toast.error('Bulk scan failed');
      }
    } catch (error) {
      console.error('Error during bulk scan:', error);
      toast.error('Bulk scan failed');
    } finally {
      setIsBulkScanning(false);
      setBulkScanProgress(0);
    }
  };

  const scanBarcode = async (barcode: string) => {
    try {
      const response = await fetch('/api/barcode/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode })
      });

      if (response.ok) {
        const data = await response.json();
        const result = data.data.result;
        
        setScanResults(prev => [result, ...prev]);
        
        // Look up product information
        if (result) {
          const productResponse = await fetch('/api/barcode/lookup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ barcode: result.text })
          });
          
          if (productResponse.ok) {
            const productData = await productResponse.json();
            if (productData.data.product) {
              setProductInfo(prev => ({
                ...prev,
                [result.text]: productData.data.product
              }));
            }
          }
        }

        // Update current session
        if (currentSession) {
          const updatedSession = {
            ...currentSession,
            totalScans: currentSession.totalScans + 1,
            successfulScans: currentSession.successfulScans + (result ? 1 : 0),
            failedScans: currentSession.failedScans + (result ? 0 : 1),
            results: result ? [result, ...currentSession.results] : currentSession.results
          };
          setCurrentSession(updatedSession);
        }

        return result;
      }
    } catch (error) {
      console.error('Error scanning barcode:', error);
      toast.error('Failed to scan barcode');
    }
  };

  const generateBarcode = async (text: string, format: string = 'CODE128') => {
    try {
      const response = await fetch('/api/barcode/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, format })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `barcode_${text}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success('Barcode generated and downloaded');
      }
    } catch (error) {
      console.error('Error generating barcode:', error);
      toast.error('Failed to generate barcode');
    }
  };

  const deleteScanResult = (index: number) => {
    setScanResults(prev => prev.filter((_, i) => i !== index));
    toast.success('Scan result deleted');
  };

  const clearAllResults = () => {
    setScanResults([]);
    setProductInfo({});
    toast.success('All results cleared');
  };

  const exportResults = () => {
    const data = {
      timestamp: new Date().toISOString(),
      totalScans: scanResults.length,
      results: scanResults.map(result => ({
        barcode: result.text,
        format: result.format,
        confidence: result.confidence,
        product: productInfo[result.text] || null
      }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `barcode_scan_results_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Results exported');
  };

  const formatConfidence = (confidence: number): string => {
    return `${Math.round(confidence * 100)}%`;
  };

  const getFormatColor = (format: string): string => {
    const colors: Record<string, string> = {
      'UPC_A': 'bg-blue-100 text-blue-800',
      'EAN_13': 'bg-green-100 text-green-800',
      'CODE_128': 'bg-purple-100 text-purple-800',
      'QR_CODE': 'bg-orange-100 text-orange-800',
      'DATA_MATRIX': 'bg-pink-100 text-pink-800',
    };
    return colors[format] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Scan className="h-6 w-6 text-blue-600" />
          <h1 className="text-3xl font-bold">Barcode Scanner</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isBulkScanning}
          >
            <Upload className="h-4 w-4 mr-2" />
            Bulk Scan
          </Button>
          <Button variant="outline" onClick={exportResults}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scanner">Scanner</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="scanner" className="space-y-6">
          {/* Scanner Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Scanner Controls</CardTitle>
              <CardDescription>
                Start scanning barcodes using your camera or upload images
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={isScanning ? stopCameraScanning : startCameraScanning}
                    variant={isScanning ? "destructive" : "default"}
                    size="lg"
                  >
                    {isScanning ? (
                      <>
                        <Camera className="h-4 w-4 mr-2" />
                        Stop Camera
                      </>
                    ) : (
                      <>
                        <Camera className="h-4 w-4 mr-2" />
                        Start Camera
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={currentSession ? stopScanSession : startScanSession}
                    variant={currentSession ? "destructive" : "outline"}
                  >
                    {currentSession ? (
                      <>
                        <Clock className="h-4 w-4 mr-2" />
                        End Session
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        New Session
                      </>
                    )}
                  </Button>
                </div>

                {/* Current Session Status */}
                {currentSession && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-blue-900">{currentSession.name}</h4>
                        <p className="text-sm text-blue-700">
                          Started {currentSession.startTime.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-900">
                          {currentSession.totalScans}
                        </div>
                        <div className="text-sm text-blue-700">Total Scans</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          {currentSession.successfulScans}
                        </div>
                        <div className="text-sm text-green-700">Successful</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600">
                          {currentSession.failedScans}
                        </div>
                        <div className="text-sm text-red-700">Failed</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Camera Preview */}
                {isScanning && (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-64 bg-gray-100 rounded-lg object-cover"
                    />
                    <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none">
                      <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-blue-500" />
                      <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-blue-500" />
                      <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-blue-500" />
                      <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-blue-500" />
                    </div>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg">
                        <Scan className="h-4 w-4 inline mr-2" />
                        Point camera at barcode
                      </div>
                    </div>
                  </div>
                )}

                {/* Bulk Scan Progress */}
                {isBulkScanning && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Bulk Scanning...</span>
                      <span className="text-sm text-gray-600">{bulkScanProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${bulkScanProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Generate barcodes and perform common tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Generate Barcode</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Enter text to encode"
                      className="flex-1 px-3 py-2 border rounded-md"
                      id="barcodeText"
                    />
                    <Button
                      onClick={() => {
                        const text = (document.getElementById('barcodeText') as HTMLInputElement)?.value;
                        if (text) generateBarcode(text);
                      }}
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      Generate
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Manual Barcode Entry</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Enter barcode manually"
                      className="flex-1 px-3 py-2 border rounded-md"
                      id="manualBarcode"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const barcode = (e.target as HTMLInputElement).value;
                          if (barcode) scanBarcode(barcode);
                        }
                      }}
                    />
                    <Button
                      onClick={() => {
                        const barcode = (document.getElementById('manualBarcode') as HTMLInputElement)?.value;
                        if (barcode) scanBarcode(barcode);
                      }}
                    >
                      <Scan className="h-4 w-4 mr-2" />
                      Scan
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Scan Results</CardTitle>
                  <CardDescription>
                    {scanResults.length} barcode{scanResults.length !== 1 ? 's' : ''} scanned
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" onClick={clearAllResults}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scanResults.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No barcodes scanned yet. Start scanning to see results here.
                    </AlertDescription>
                  </Alert>
                ) : (
                  scanResults.map((result, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium">{result.text}</h4>
                            <Badge className={getFormatColor(result.format)}>
                              {result.format}
                            </Badge>
                            <Badge variant="outline">
                              {formatConfidence(result.confidence)}
                            </Badge>
                          </div>
                          
                          {productInfo[result.text] && (
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                              <h5 className="font-medium text-gray-900">
                                {productInfo[result.text].name}
                              </h5>
                              <p className="text-sm text-gray-600">
                                {productInfo[result.text].category} • ${productInfo[result.text].price}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                SKU: {productInfo[result.text].sku}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteScanResult(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scan Sessions</CardTitle>
              <CardDescription>
                History of your scanning sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scanSessions.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No scan sessions yet. Start a new session to begin tracking.
                    </AlertDescription>
                  </Alert>
                ) : (
                  scanSessions.map((session) => (
                    <div key={session.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{session.name}</h4>
                          <p className="text-sm text-gray-600">
                            {session.startTime.toLocaleString()} - {session.endTime?.toLocaleString() || 'Active'}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-sm text-gray-500">
                              Total: {session.totalScans}
                            </span>
                            <span className="text-sm text-green-600">
                              Success: {session.successfulScans}
                            </span>
                            <span className="text-sm text-red-600">
                              Failed: {session.failedScans}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={session.status === 'active' ? 'default' : 'outline'}>
                            {session.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
                <Scan className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{scanningStats.totalScans}</div>
                <p className="text-xs text-muted-foreground">
                  All time scans
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {scanningStats.totalScans > 0 
                    ? Math.round((scanningStats.successfulScans / scanningStats.totalScans) * 100)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Successful scans
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(scanningStats.averageConfidence * 100)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Scan accuracy
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Format</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{scanningStats.mostCommonFormat}</div>
                <p className="text-xs text-muted-foreground">
                  Most scanned format
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Format Distribution</CardTitle>
              <CardDescription>
                Breakdown of scanned barcode formats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(scanningStats.formats).map(([format, count]) => (
                  <div key={format} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge className={getFormatColor(format)}>
                        {format}
                      </Badge>
                      <span className="text-sm">{count}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {scanningStats.totalScans > 0 
                        ? Math.round((count / scanningStats.totalScans) * 100)
                        : 0}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

