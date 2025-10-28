import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldIcon, SmartphoneIcon, KeyIcon, AlertCircleIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface MFAVerificationProps {
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MFAVerification({ userId, onSuccess, onCancel }: MFAVerificationProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!verificationCode && !backupCode) {
      toast.error('Please enter a verification code');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/mfa/verify-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          code: verificationCode,
          backupCode: useBackupCode ? backupCode : undefined
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('MFA verification successful!');
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Invalid verification code');
      }
    } catch (error) {
      console.error('Failed to verify MFA:', error);
      toast.error('Failed to verify MFA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-6">
          <ShieldIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Two-Factor Authentication</h2>
          <p className="text-gray-600">
            Enter the verification code from your authenticator app or SMS.
          </p>
        </div>

        <div className="space-y-4">
          {!useBackupCode ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter verification code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
              <button
                onClick={() => setUseBackupCode(true)}
                className="text-blue-600 hover:text-blue-800 text-sm mt-2"
              >
                Use backup code instead
              </button>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter backup code
              </label>
              <input
                type="text"
                value={backupCode}
                onChange={(e) => setBackupCode(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter backup code"
              />
              <button
                onClick={() => setUseBackupCode(false)}
                className="text-blue-600 hover:text-blue-800 text-sm mt-2"
              >
                Use verification code instead
              </button>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={handleVerify}
              disabled={loading || (!verificationCode && !backupCode)}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Having trouble? Contact support for assistance.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
