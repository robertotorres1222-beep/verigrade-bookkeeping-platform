'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Smartphone, 
  Mail, 
  Key, 
  QrCode,
  Copy,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

interface MFAMethod {
  id: string;
  type: 'authenticator' | 'sms' | 'email';
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
}

interface BackupCode {
  id: string;
  code: string;
  isUsed: boolean;
  usedAt?: string;
}

interface MFAManagerProps {
  userId: string;
}

export default function MFAManager({ userId }: MFAManagerProps) {
  const [methods, setMethods] = useState<MFAMethod[]>([]);
  const [backupCodes, setBackupCodes] = useState<BackupCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [setupMethod, setSetupMethod] = useState<'authenticator' | 'sms' | 'email' | null>(null);
  const [qrCode, setQrCode] = useState<string>('');
  const [secretKey, setSecretKey] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [newBackupCodes, setNewBackupCodes] = useState<string[]>([]);

  useEffect(() => {
    loadMFAStatus();
  }, []);

  const loadMFAStatus = async () => {
    try {
      const response = await fetch('/api/mfa/status');
      if (response.ok) {
        const data = await response.json();
        setMethods(data.data.methods || []);
        setBackupCodes(data.data.backupCodes || []);
      }
    } catch (error) {
      console.error('Failed to load MFA status:', error);
    }
  };

  const handleSetupMFA = async (method: 'authenticator' | 'sms' | 'email') => {
    setLoading(true);
    try {
      const response = await fetch('/api/mfa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method })
      });

      if (response.ok) {
        const data = await response.json();
        setSetupMethod(method);
        
        if (method === 'authenticator') {
          setQrCode(data.data.qrCode);
          setSecretKey(data.data.secretKey);
        }
        
        toast.success(`${method} setup initiated`);
      } else {
        throw new Error('Failed to setup MFA');
      }
    } catch (error) {
      toast.error('Failed to setup MFA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMFA = async () => {
    if (!setupMethod) return;

    setLoading(true);
    try {
      const response = await fetch('/api/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: setupMethod,
          code: verificationCode,
          phoneNumber,
          email
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.data.backupCodes) {
          setNewBackupCodes(data.data.backupCodes);
          setShowBackupCodes(true);
        }
        
        setSetupMethod(null);
        setVerificationCode('');
        setPhoneNumber('');
        setEmail('');
        setQrCode('');
        setSecretKey('');
        
        await loadMFAStatus();
        toast.success('MFA enabled successfully');
      } else {
        throw new Error('Failed to verify MFA');
      }
    } catch (error) {
      toast.error('Failed to verify MFA');
    } finally {
      setLoading(false);
    }
  };

  const handleDisableMFA = async (methodId: string) => {
    const password = prompt('Enter your password to disable MFA:');
    if (!password) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/mfa/disable/${methodId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (response.ok) {
        await loadMFAStatus();
        toast.success('MFA disabled successfully');
      } else {
        throw new Error('Failed to disable MFA');
      }
    } catch (error) {
      toast.error('Failed to disable MFA');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBackupCodes = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/mfa/backup-codes', {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        setNewBackupCodes(data.data.backupCodes);
        setShowBackupCodes(true);
        await loadMFAStatus();
        toast.success('New backup codes generated');
      } else {
        throw new Error('Failed to generate backup codes');
      }
    } catch (error) {
      toast.error('Failed to generate backup codes');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const downloadBackupCodes = () => {
    const codes = newBackupCodes.join('\n');
    const blob = new Blob([codes], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'verigrade-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'authenticator': return <Smartphone className="h-4 w-4" />;
      case 'sms': return <Smartphone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
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

  return (
    <div className="space-y-6">
      {/* MFA Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Two-Factor Authentication</span>
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {methods.length === 0 ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No MFA methods enabled. Enable two-factor authentication for better security.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                {methods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      {getMethodIcon(method.type)}
                      <div>
                        <p className="font-medium">{getMethodName(method.type)}</p>
                        <p className="text-sm text-muted-foreground">
                          {method.isActive ? 'Active' : 'Inactive'} • 
                          Added {new Date(method.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={method.isActive ? 'default' : 'secondary'}>
                        {method.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {method.isActive && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDisableMFA(method.id)}
                          disabled={loading}
                        >
                          Disable
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Setup New MFA Method */}
            {!setupMethod && (
              <div className="space-y-3">
                <h4 className="font-medium">Add MFA Method</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleSetupMFA('authenticator')}
                    disabled={loading}
                    className="flex flex-col items-center space-y-2 h-auto py-4"
                  >
                    <Smartphone className="h-6 w-6" />
                    <span>Authenticator App</span>
                    <span className="text-xs text-muted-foreground">Google Authenticator, Authy</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleSetupMFA('sms')}
                    disabled={loading}
                    className="flex flex-col items-center space-y-2 h-auto py-4"
                  >
                    <Smartphone className="h-6 w-6" />
                    <span>SMS</span>
                    <span className="text-xs text-muted-foreground">Text message codes</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleSetupMFA('email')}
                    disabled={loading}
                    className="flex flex-col items-center space-y-2 h-auto py-4"
                  >
                    <Mail className="h-6 w-6" />
                    <span>Email</span>
                    <span className="text-xs text-muted-foreground">Email verification codes</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* MFA Setup Flow */}
      {setupMethod && (
        <Card>
          <CardHeader>
            <CardTitle>Setup {getMethodName(setupMethod)}</CardTitle>
            <CardDescription>
              Follow the steps below to enable {getMethodName(setupMethod)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {setupMethod === 'authenticator' && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Scan this QR code with your authenticator app
                  </p>
                  {qrCode && (
                    <div className="flex justify-center">
                      <img src={qrCode} alt="QR Code" className="border rounded" />
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Manual Entry Key</Label>
                  <div className="flex items-center space-x-2">
                    <Input value={secretKey} readOnly className="font-mono" />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(secretKey)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {setupMethod === 'sms' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <Button
                  onClick={() => {
                    // Mock SMS sending
                    toast.success('SMS code sent to ' + phoneNumber);
                  }}
                  disabled={!phoneNumber}
                >
                  Send SMS Code
                </Button>
              </div>
            )}

            {setupMethod === 'email' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>
                <Button
                  onClick={() => {
                    // Mock email sending
                    toast.success('Email code sent to ' + email);
                  }}
                  disabled={!email}
                >
                  Send Email Code
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleVerifyMFA} disabled={loading || !verificationCode}>
                {loading ? 'Verifying...' : 'Verify & Enable'}
              </Button>
              <Button variant="outline" onClick={() => setSetupMethod(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Backup Codes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>Backup Codes</span>
          </CardTitle>
          <CardDescription>
            Use these codes to access your account if you lose your MFA device
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                {backupCodes.filter(code => !code.isUsed).length} codes remaining
              </p>
              <p className="text-sm text-muted-foreground">
                {backupCodes.filter(code => code.isUsed).length} codes used
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleGenerateBackupCodes}
              disabled={loading}
            >
              Generate New Codes
            </Button>
          </div>

          {backupCodes.length > 0 && (
            <div className="space-y-2">
              <Label>Backup Codes</Label>
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code) => (
                  <div
                    key={code.id}
                    className={`p-2 border rounded font-mono text-sm ${
                      code.isUsed ? 'bg-gray-100 text-gray-500' : 'bg-white'
                    }`}
                  >
                    {code.code}
                    {code.isUsed && (
                      <span className="ml-2 text-xs text-gray-500">
                        (Used {new Date(code.usedAt!).toLocaleDateString()})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Backup Codes Modal */}
      {showBackupCodes && newBackupCodes.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="h-5 w-5" />
                <span>New Backup Codes</span>
              </CardTitle>
              <CardDescription>
                Save these codes in a safe place. You won't be able to see them again.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {newBackupCodes.map((code, index) => (
                  <div key={index} className="p-2 border rounded font-mono text-sm bg-yellow-50">
                    {code}
                  </div>
                ))}
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={downloadBackupCodes} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowBackupCodes(false);
                    setNewBackupCodes([]);
                  }}
                  className="flex-1"
                >
                  I've Saved These
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}