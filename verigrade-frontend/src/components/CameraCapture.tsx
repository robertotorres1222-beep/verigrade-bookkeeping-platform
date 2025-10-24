import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, RotateCcw, Check, AlertCircle } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
  mode?: 'receipt' | 'document' | 'general';
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ 
  onCapture, 
  onClose, 
  mode = 'receipt' 
}) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [flashMode, setFlashMode] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setIsCapturing(true);

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      setError('Unable to access camera. Please check permissions.');
      setIsCapturing(false);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
    stopCamera();
  }, [stopCamera]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  const confirmCapture = useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  }, [capturedImage, onCapture, onClose]);

  const toggleFlash = useCallback(() => {
    setFlashMode(!flashMode);
  }, [flashMode]);

  const toggleCamera = useCallback(() => {
    setFacingMode(facingMode === 'user' ? 'environment' : 'user');
    if (isCapturing) {
      stopCamera();
      setTimeout(startCamera, 100);
    }
  }, [facingMode, isCapturing, stopCamera, startCamera]);

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

  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const getModeInstructions = () => {
    switch (mode) {
      case 'receipt':
        return 'Position the receipt within the frame. Ensure all text is clearly visible.';
      case 'document':
        return 'Position the document within the frame. Ensure all text is clearly visible.';
      default:
        return 'Position the item within the frame and tap capture.';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">
            {mode === 'receipt' ? 'Capture Receipt' : 
             mode === 'document' ? 'Capture Document' : 'Take Photo'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera View */}
        <div className="relative bg-black">
          {!capturedImage ? (
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-64 object-cover"
                autoPlay
                playsInline
                muted
              />
              
              {/* Camera Controls */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={toggleFlash}
                  className={`p-2 rounded-full ${
                    flashMode ? 'bg-yellow-500 text-white' : 'bg-white bg-opacity-80'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                </button>
                <button
                  onClick={toggleCamera}
                  className="p-2 bg-white bg-opacity-80 rounded-full"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Instructions */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black bg-opacity-50 text-white p-3 rounded-lg">
                  <p className="text-sm">{getModeInstructions()}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-64 object-cover"
              />
              
              {/* Image Controls */}
              <div className="absolute top-4 right-4">
                <button
                  onClick={retakePhoto}
                  className="p-2 bg-white bg-opacity-80 rounded-full"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Canvas for capture */}
          <canvas
            ref={canvasRef}
            className="hidden"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-400">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="p-4">
          {!capturedImage ? (
            <div className="flex flex-col gap-3">
              {!isCapturing ? (
                <button
                  onClick={startCamera}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <Camera className="w-5 h-5 inline mr-2" />
                  Start Camera
                </button>
              ) : (
                <button
                  onClick={capturePhoto}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  <Camera className="w-5 h-5 inline mr-2" />
                  Capture Photo
                </button>
              )}
              
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <button className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                  <Upload className="w-5 h-5 inline mr-2" />
                  Upload from Gallery
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={retakePhoto}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                <RotateCcw className="w-5 h-5 inline mr-2" />
                Retake
              </button>
              <button
                onClick={confirmCapture}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                <Check className="w-5 h-5 inline mr-2" />
                Use Photo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;

