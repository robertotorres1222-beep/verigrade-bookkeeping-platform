'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';

export default function SSOCallbackPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');
  const [user, setUser] = useState<any>(null);

  const provider = params.provider as string;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const errorParam = searchParams.get('error');

  useEffect(() => {
    if (errorParam) {
      setStatus('error');
      setError(decodeURIComponent(errorParam));
      return;
    }

    if (code) {
      handleSSOCallback();
    }
  }, [code, errorParam]);

  const handleSSOCallback = async () => {
    try {
      const response = await fetch('/api/sso/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          code,
          state
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store authentication data
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        localStorage.setItem('organization', JSON.stringify(data.data.user.organization));
        
        // Set cookie for middleware authentication
        document.cookie = `authToken=${data.data.token}; path=/; max-age=604800`; // 7 days
        
        setUser(data.data.user);
        setStatus('success');
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'SSO authentication failed');
      }
    } catch (error) {
      setStatus('error');
      setError(error instanceof Error ? error.message : 'SSO authentication failed');
    }
  };

  const handleRetry = () => {
    setStatus('loading');
    setError('');
    handleSSOCallback();
  };

  const handleBackToLogin = () => {
    window.location.href = '/login';
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <RefreshCw className="h-8 w-8 animate-spin text-indigo-600" />
                <div className="text-center">
                  <h2 className="text-xl font-semibold">Completing Sign-In</h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    Please wait while we complete your {provider} sign-in...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                <span>Sign-In Failed</span>
              </CardTitle>
              <CardDescription>
                There was an error completing your {provider} sign-in
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
              
              <div className="flex space-x-2">
                <Button onClick={handleRetry} className="flex-1">
                  Try Again
                </Button>
                <Button variant="outline" onClick={handleBackToLogin} className="flex-1">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>Sign-In Successful</span>
              </CardTitle>
              <CardDescription>
                Welcome back! You've been signed in with {provider}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {user && (
                <div className="bg-green-50 p-4 rounded">
                  <p className="text-sm">
                    <strong>Signed in as:</strong> {user.email}
                  </p>
                  {user.organization && (
                    <p className="text-sm text-muted-foreground">
                      <strong>Organization:</strong> {user.organization.name}
                    </p>
                  )}
                </div>
              )}
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Redirecting to dashboard...
                </p>
                <div className="mt-2">
                  <RefreshCw className="h-4 w-4 animate-spin mx-auto" />
                </div>
              </div>
              
              <Button 
                onClick={() => window.location.href = '/dashboard'} 
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}

