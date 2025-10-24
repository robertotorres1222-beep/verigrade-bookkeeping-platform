import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Upload, Check, X, DollarSign, Calendar, Tag, FileText } from 'lucide-react';
import CameraCapture from '../components/CameraCapture';

interface ReceiptData {
  image: string;
  amount: number;
  date: string;
  category: string;
  description: string;
  vendor: string;
}

const ReceiptCapture: React.FC = () => {
  const navigate = useNavigate();
  const [showCamera, setShowCamera] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData>({
    image: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    category: '',
    description: '',
    vendor: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<Partial<ReceiptData>>({});

  const handleImageCapture = async (imageData: string) => {
    setReceiptData(prev => ({ ...prev, image: imageData }));
    setShowCamera(false);
    
    // Simulate OCR processing
    setIsProcessing(true);
    setTimeout(() => {
      // Mock extracted data
      setExtractedData({
        amount: 25.50,
        vendor: 'Coffee Shop',
        description: 'Coffee and pastry',
        date: new Date().toISOString().split('T')[0]
      });
      setIsProcessing(false);
    }, 2000);
  };

  const handleSave = async () => {
    try {
      // Here you would save the receipt data to your backend
      console.log('Saving receipt:', receiptData);
      
      // Navigate back to expenses or dashboard
      navigate('/expenses');
    } catch (error) {
      console.error('Error saving receipt:', error);
    }
  };

  const categories = [
    'Meals & Entertainment',
    'Office Supplies',
    'Travel',
    'Marketing',
    'Professional Services',
    'Utilities',
    'Rent',
    'Other'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg mr-3"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Capture Receipt</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCamera(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Camera className="w-4 h-4" />
                Take Photo
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Preview */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Receipt Image</h2>
            </div>
            <div className="p-4">
              {receiptData.image ? (
                <div className="relative">
                  <img
                    src={receiptData.image}
                    alt="Receipt"
                    className="w-full h-64 object-cover rounded-lg border"
                  />
                  <button
                    onClick={() => setShowCamera(true)}
                    className="absolute top-2 right-2 p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg h-64 flex flex-col items-center justify-center">
                  <Camera className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-4">No receipt image captured</p>
                  <button
                    onClick={() => setShowCamera(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Capture Receipt
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Receipt Details */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Receipt Details</h2>
            </div>
            <div className="p-4 space-y-4">
              {/* Processing Indicator */}
              {isProcessing && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                    <p className="text-blue-700">Processing receipt image...</p>
                  </div>
                </div>
              )}

              {/* Extracted Data */}
              {extractedData && Object.keys(extractedData).length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-800 mb-2">Extracted Information</h3>
                  <div className="space-y-2 text-sm">
                    {extractedData.amount && (
                      <p><span className="font-medium">Amount:</span> ${extractedData.amount}</p>
                    )}
                    {extractedData.vendor && (
                      <p><span className="font-medium">Vendor:</span> {extractedData.vendor}</p>
                    )}
                    {extractedData.description && (
                      <p><span className="font-medium">Description:</span> {extractedData.description}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      value={receiptData.amount || ''}
                      onChange={(e) => setReceiptData(prev => ({ 
                        ...prev, 
                        amount: parseFloat(e.target.value) || 0 
                      }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={receiptData.date}
                      onChange={(e) => setReceiptData(prev => ({ 
                        ...prev, 
                        date: e.target.value 
                      }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vendor
                  </label>
                  <input
                    type="text"
                    value={receiptData.vendor}
                    onChange={(e) => setReceiptData(prev => ({ 
                      ...prev, 
                      vendor: e.target.value 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Store or vendor name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={receiptData.category}
                      onChange={(e) => setReceiptData(prev => ({ 
                        ...prev, 
                        category: e.target.value 
                      }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <textarea
                      value={receiptData.description}
                      onChange={(e) => setReceiptData(prev => ({ 
                        ...prev, 
                        description: e.target.value 
                      }))}
                      rows={3}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Additional notes or description"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => navigate(-1)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!receiptData.image || !receiptData.amount || !receiptData.date}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <Check className="w-4 h-4 inline mr-2" />
                  Save Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={handleImageCapture}
          onClose={() => setShowCamera(false)}
          mode="receipt"
        />
      )}
    </div>
  );
};

export default ReceiptCapture;

