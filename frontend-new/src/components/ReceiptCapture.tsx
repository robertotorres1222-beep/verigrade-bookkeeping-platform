'use client';

import { useState, useRef, useCallback } from 'react';
import { 
  CameraIcon, 
  PhotoIcon, 
  DocumentArrowUpIcon,
  XMarkIcon,
  CheckCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface ReceiptCaptureProps {
  onReceiptProcessed: (data: any) => void;
  onClose: () => void;
}

export default function ReceiptCapture({ onReceiptProcessed, onClose }: ReceiptCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResult, setProcessingResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCapturing(true);
      }
    } catch (err) {
      setError('Unable to access camera. Please check permissions.');
      console.error('Camera error:', err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  }, [stopCamera]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCapturedImage(result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const processReceipt = useCallback(async () => {
    if (!capturedImage) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Send image to backend for AI processing
      const response = await fetch('/api/receipts/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          image: capturedImage,
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process receipt');
      }

      const result = await response.json();
      setProcessingResult(result);
      
      // Auto-fill the form with extracted data
      if (result.success) {
        onReceiptProcessed(result.data);
      }
    } catch (err) {
      setError('Failed to process receipt. Please try again.');
      console.error('Processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [capturedImage, onReceiptProcessed]);

  const resetCapture = useCallback(() => {
    setCapturedImage(null);
    setProcessingResult(null);
    setError(null);
    setIsProcessing(false);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Capture Receipt</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {!capturedImage ? (
            <div className="space-y-4">
              {/* Camera Interface */}
              {isCapturing ? (
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-64 bg-gray-100 rounded-lg object-cover"
                  />
                  <canvas
                    ref={canvasRef}
                    className="hidden"
                  />
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                    <button
                      onClick={capturePhoto}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg"
                    >
                      <CameraIcon className="h-6 w-6" />
                    </button>
                    <button
                      onClick={stopCamera}
                      className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <CameraIcon className="h-16 w-16 text-gray-400" />
                  </div>
                  
                  <div className="space-y-3">
                    <button
                      onClick={startCamera}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center space-x-2"
                    >
                      <CameraIcon className="h-5 w-5" />
                      <span>Use Camera</span>
                    </button>
                    
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center space-x-2"
                    >
                      <PhotoIcon className="h-5 w-5" />
                      <span>Upload Photo</span>
                    </button>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Captured Image Preview */}
              <div className="relative">
                <img
                  src={capturedImage}
                  alt="Captured receipt"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  onClick={resetCapture}
                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>

              {/* Processing Section */}
              {!processingResult ? (
                <div className="space-y-3">
                  <button
                    onClick={processReceipt}
                    disabled={isProcessing}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center space-x-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="h-5 w-5" />
                        <span>Process with AI</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={resetCapture}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    Capture Again
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      <span className="text-green-800 font-medium">Receipt Processed Successfully</span>
                    </div>
                    <div className="mt-2 text-sm text-green-700">
                      <p>Amount: ${processingResult.data?.amount || 'N/A'}</p>
                      <p>Vendor: {processingResult.data?.vendor || 'N/A'}</p>
                      <p>Category: {processingResult.data?.category || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={onClose}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    Use This Data
                  </button>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




