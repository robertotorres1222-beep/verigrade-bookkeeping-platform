'use client';

import { useState } from 'react';
import { 
  ShieldCheckIcon, 
  QrCodeIcon, 
  KeyIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface MFASetupProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function MFASetup({ isOpen, onClose, onComplete }: MFASetupProps) {
  const [step, setStep] = useState<'generate' | 'verify' | 'complete'>('generate');
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const generateSecret = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/v1/mfa/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setQrCode(data.data.qrCode);
        setSecret(data.data.manualEntryKey);
        setStep('verify');
      } else {
        setError(data.message || 'Failed to generate MFA secret');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const verifyAndEnable = async () => {
    if (!token || token.length !== 6) {
      setError('Please enter a valid 6-digit token');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/v1/mfa/enable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (data.success) {
        setStep('complete');
        setTimeout(() => {
          onComplete();
          onClose();
        }, 2000);
      } else {
        setError(data.message || 'Invalid token');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Setup Multi-Factor Authentication</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {step === 'generate' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-blue-600">
              <ShieldCheckIcon className="h-5 w-5" />
              <span className="font-medium">Step 1: Generate MFA Secret</span>
            </div>
            
            <p className="text-gray-600">
              Click the button below to generate your MFA secret. This will create a QR code 
              that you can scan with an authenticator app.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={generateSecret}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate MFA Secret'}
            </button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-blue-600">
              <QrCodeIcon className="h-5 w-5" />
              <span className="font-medium">Step 2: Scan QR Code</span>
            </div>

            <p className="text-gray-600">
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.):
            </p>

            {qrCode && (
              <div className="flex justify-center">
                <img src={qrCode} alt="MFA QR Code" className="w-48 h-48" />
              </div>
            )}

            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-2">
                Or manually enter this key:
              </p>
              <div className="flex items-center space-x-2">
                <code className="flex-1 bg-gray-100 p-2 rounded text-sm font-mono">
                  {secret}
                </code>
                <button
                  onClick={copySecret}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Copy
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter 6-digit code from your authenticator app:
              </label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-center text-lg font-mono"
                placeholder="123456"
                maxLength={6}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => setStep('generate')}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Back
              </button>
              <button
                onClick={verifyAndEnable}
                disabled={loading || token.length !== 6}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Enable'}
              </button>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircleIcon className="h-16 w-16 text-green-500" />
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900">
              MFA Successfully Enabled!
            </h3>
            
            <p className="text-gray-600">
              Your account is now protected with multi-factor authentication. 
              You'll need to enter a code from your authenticator app when logging in.
            </p>

            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-sm text-green-800">
                <strong>Important:</strong> Save your backup codes and keep your authenticator 
                app secure. Without your device, you may not be able to access your account.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

