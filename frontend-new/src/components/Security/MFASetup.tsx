import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldIcon, SmartphoneIcon, KeyIcon, CheckCircleIcon, AlertCircleIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface MFASetupProps {
  onComplete: () => void;
  onCancel: () => void;
}

export default function MFASetup({ onComplete, onCancel }: MFASetupProps) {
  const [step, setStep] = useState<'select' | 'setup' | 'verify'>('select');
  const [selectedMethod, setSelectedMethod] = useState<'sms' | 'authenticator' | null>(null);
  const [setupData, setSetupData] = useState<any>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEnableMFA = async (method: 'sms' | 'authenticator') => {
    try {
      setLoading(true);
      const response = await fetch('/api/mfa/enable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ method })
      });

      if (response.ok) {
        const data = await response.json();
        setSetupData(data.data);
        setSelectedMethod(method);
        setStep('setup');
        toast.success(`${method.toUpperCase()} MFA setup initiated`);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to enable MFA');
      }
    } catch (error) {
      console.error('Failed to enable MFA:', error);
      toast.error('Failed to enable MFA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMFA = async () => {
    if (!setupData) return;

    try {
      setLoading(true);
      const response = await fetch('/api/mfa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          mfaId: setupData.mfaId,
          code: verificationCode,
          backupCode: useBackupCode ? backupCode : undefined
        })
      });

      if (response.ok) {
        toast.success('MFA successfully activated!');
        onComplete();
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

  const handleResendSMS = async () => {
    try {
      const response = await fetch('/api/mfa/resend-sms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.success('SMS code resent');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to resend SMS');
      }
    } catch (error) {
      console.error('Failed to resend SMS:', error);
      toast.error('Failed to resend SMS');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md"
      >
        {step === 'select' && (
          <div>
            <div className="text-center mb-6">
              <ShieldIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Enable Two-Factor Authentication</h2>
              <p className="text-gray-600">
                Add an extra layer of security to your account by enabling two-factor authentication.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => handleEnableMFA('authenticator')}
                disabled={loading}
                className="w-full flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SmartphoneIcon className="h-6 w-6 text-blue-600 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Authenticator App</div>
                  <div className="text-sm text-gray-500">Use Google Authenticator, Authy, or similar</div>
                </div>
              </button>
              <button
                onClick={() => handleEnableMFA('sms')}
                disabled={loading}
                className="w-full flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <KeyIcon className="h-6 w-6 text-green-600 mr-3" />
                <div className="text-left">
                  <div className="font-medium">SMS Text Message</div>
                  <div className="text-sm text-gray-500">Receive codes via text message</div>
                </div>
              </button>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={onCancel}
                className="text-gray-600 hover:text-gray-800"
              >
                Skip for now
              </button>
            </div>
          </div>
        )}

        {step === 'setup' && setupData && (
          <div>
            {selectedMethod === 'authenticator' ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Setup Authenticator App</h3>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Scan this QR code with your authenticator app:
                  </p>
                  {setupData.setupData.qrCode && (
                    <div className="text-center">
                      <img src={setupData.setupData.qrCode} alt="QR Code" className="mx-auto" />
                    </div>
                  )}
                  <p className="text-sm text-gray-600">
                    Or manually enter this code: <code className="bg-gray-100 px-2 py-1 rounded">{setupData.setupData.secret}</code>
                  </p>
                  <button
                    onClick={() => setStep('verify')}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                  >
                    I've Added the Account
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Setup SMS Authentication</h3>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    We've sent a verification code to {setupData.setupData.phone}
                  </p>
                  <button
                    onClick={handleResendSMS}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Resend Code
                  </button>
                  <button
                    onClick={() => setStep('verify')}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                  >
                    Enter Code
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'verify' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Verify Setup</h3>
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
                  />
                  {selectedMethod === 'authenticator' && (
                    <button
                      onClick={() => setUseBackupCode(true)}
                      className="text-blue-600 hover:text-blue-800 text-sm mt-2"
                    >
                      Use backup code instead
                    </button>
                  )}
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
                  onClick={handleVerifyMFA}
                  disabled={loading || (!verificationCode && !backupCode)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify & Activate'}
                </button>
                <button
                  onClick={() => setStep('select')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
