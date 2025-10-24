'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ArrowPathIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface SsoCallbackPageProps {
  params: Promise<{
    provider: string;
  }>;
}

export default async function SsoCallbackPage({ params }: SsoCallbackPageProps) {
  const { provider } = await params;
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing SSO authentication...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleSsoCallback();
  }, []);

  const handleSsoCallback = async () => {
    try {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (error) {
        setStatus('error');
        setError(errorDescription || error);
        setMessage('SSO authentication failed');
        return;
      }

      if (!code) {
        setStatus('error');
        setError('No authorization code received');
        setMessage('SSO authentication failed');
        return;
      }

      // Send code to backend for verification
      const response = await fetch(`/api/sso/callback/${provider}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          state,
          provider: provider
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store authentication token
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        localStorage.setItem('organization', JSON.stringify(data.data.user.organization));
        
        // Set cookie for middleware authentication
        document.cookie = `authToken=${data.data.token}; path=/; max-age=604800`; // 7 days
        
        setStatus('success');
        setMessage('SSO authentication successful! Redirecting to dashboard...');
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setStatus('error');
        setError(data.message || 'SSO authentication failed');
        setMessage('SSO authentication failed');
      }
    } catch (error) {
      console.error('SSO callback error:', error);
      setStatus('error');
      setError('An unexpected error occurred');
      setMessage('SSO authentication failed');
    }
  };

  const handleRetry = () => {
    router.push('/login');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center"
        >
          {status === 'loading' && (
            <>
              <ArrowPathIcon className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Authentication</h2>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircleIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Successful</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="flex items-center justify-center text-sm text-gray-500">
                <ShieldCheckIcon className="h-4 w-4 mr-2" />
                Secure SSO authentication completed
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircleIcon className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h2>
              <p className="text-gray-600 mb-2">{message}</p>
              {error && (
                <p className="text-sm text-red-600 mb-6">{error}</p>
              )}
              <div className="space-y-3">
                <button
                  onClick={handleRetry}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  Try Again
                </button>
                <button
                  onClick={handleGoHome}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
                >
                  Go to Home
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

