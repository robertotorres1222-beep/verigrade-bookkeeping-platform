'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Smartphone, 
  Mail, 
  Key, 
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface MFAMethod {
  id: string;
  type: 'authenticator' | 'sms' | 'email';
  isActive: boolean;
}

interface MFALoginVerificationProps {
  mfaRequired: boolean;
  mfaMethods: MFAMethod[];
  onVerificationSuccess: (token: string) => void;
  onBack: () => void;
  onResendCode: () => Promise<void>;
}

export default function MFALoginVerification({
  mfaRequired,
  mfaMethods,
  onVerificationSuccess,
  onBack,
  onResendCode
}: MFALoginVerificationProps) {
  const [selectedMethod, setSelectedMethod] = useState<MFAMethod | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (mfaMethods.length > 0) {
      setSelectedMethod(mfaMethods[0]);
    }
  }, [mfaMethods]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMethod || !verificationCode) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/mfa/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'current-user', // This would come from the login flow
          code: verificationCode,
          method: selectedMethod.type
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data.verified) {
          // Get the final token from the login endpoint
          const loginResponse = await fetch('/api/auth/complete-mfa-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tempToken: 'temp-token', // This would come from the login flow
              mfaCode: verificationCode
            })
          });

          if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            onVerificationSuccess(loginData.data.token);
          } else {
            throw new Error('Failed to complete login');
          }
        } else {
          throw new Error('Invalid verification code');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Verification failed');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      await onResendCode();
      setResendCooldown(60); // 60 second cooldown
      toast.success('Verification code sent');
    } catch (error) {
      toast.error('Failed to resend code');
    }
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'authenticator': return <Smartphone className="h-5 w-5" />;
      case 'sms': return <Smartphone className="h-5 w-5" />;
      case 'email': return <Mail className="h-5 w-5" />;
      default: return <Shield className="h-5 w-5" />;
    }
  };

  const getMethodName = (type: string) => {
    switch (type) {
      case 'authenticator': return 'Authenticator App';
      case 'sms': return 'SMS';
      case 'email': return 'Email';
      default: return 'Unknown';
    }
  };

  const getMethodInstructions = (type: string) => {
    switch (type) {
      case 'authenticator': 
        return 'Open your authenticator app and enter the 6-digit code';
      case 'sms': 
        return 'Check your phone for a text message with the verification code';
      case 'email': 
        return 'Check your email for a message with the verification code';
      default: 
        return 'Enter the verification code';
    }
  };

  if (!mfaRequired) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-indigo-600" />
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Two-Factor Authentication
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter the verification code to complete your login
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Verify Your Identity</CardTitle>
            <CardDescription>
              Choose your preferred verification method
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Method Selection */}
            {mfaMethods.length > 1 && (
              <div className="space-y-3">
                <Label>Verification Method</Label>
                <div className="space-y-2">
                  {mfaMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method)}
                      className={`w-full flex items-center space-x-3 p-3 border rounded text-left ${
                        selectedMethod?.id === method.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {getMethodIcon(method.type)}
                      <div>
                        <p className="font-medium">{getMethodName(method.type)}</p>
                        <p className="text-sm text-muted-foreground">
                          {getMethodInstructions(method.type)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Verification Form */}
            {selectedMethod && (
              <form onSubmit={handleVerification} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="verification-code">Verification Code</Label>
                  <Input
                    id="verification-code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="text-center text-lg font-mono"
                    autoComplete="one-time-code"
                    autoFocus
                  />
                  <p className="text-sm text-muted-foreground">
                    {getMethodInstructions(selectedMethod.type)}
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading || verificationCode.length !== 6}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify & Continue'
                    )}
                  </Button>

                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onBack}
                      className="flex-1"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Login
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleResendCode}
                      disabled={resendCooldown > 0}
                      className="flex-1"
                    >
                      {resendCooldown > 0 ? (
                        `Resend in ${resendCooldown}s`
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Resend Code
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {/* Backup Code Option */}
            <div className="pt-4 border-t">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Don't have access to your device?
                </p>
                <Button
                  variant="link"
                  onClick={() => {
                    // This would open a backup code input modal
                    toast.info('Backup code verification not implemented yet');
                  }}
                  className="text-sm"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Use Backup Code
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Notice:</strong> If you didn't request this verification, 
              please contact support immediately.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}