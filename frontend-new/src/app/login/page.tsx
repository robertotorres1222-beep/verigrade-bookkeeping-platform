'use client';

import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Chrome, Building2 } from 'lucide-react';
import { API_ENDPOINTS } from '../../lib/apiConfig';
import { trackAuthEvent } from '../../lib/posthog';
import MFALoginVerification from '../../components/Security/MFALoginVerification';


export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaMethods, setMfaMethods] = useState<any[]>([]);
  const [tempToken, setTempToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Track login attempt
    trackAuthEvent('login_attempt', {
      email: formData.email,
      timestamp: new Date().toISOString()
    });
    
    // Add loading state
    const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
    const originalText = submitButton?.textContent;
    if (submitButton) {
      submitButton.textContent = 'Signing in...';
      submitButton.disabled = true;
    }
    
    try {
      // Real authentication with backend
      const response = await fetch(API_ENDPOINTS.auth.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Login failed. Please try again.' }));
        throw new Error(errorData.message || 'Login failed. Please try again.');
      }

      const data = await response.json();

      if (response.ok && data.success) {
        // Check if MFA is required
        if (data.data.mfaRequired) {
          setMfaRequired(true);
          setMfaMethods(data.data.mfaMethods || []);
          setTempToken(data.data.tempToken);
          return;
        }

        // Store authentication token in localStorage
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        localStorage.setItem('organization', JSON.stringify(data.data.user.organization));
        
        // Also set cookie for middleware authentication
        document.cookie = `authToken=${data.data.token}; path=/; max-age=604800`; // 7 days
        
        // Track successful login
        trackAuthEvent('login_success', {
          email: formData.email,
          user_id: data.data.user.id,
          organization: data.data.user.organization?.name,
          timestamp: new Date().toISOString()
        });
        
        // Show success message
        alert('Login successful! Redirecting to dashboard...');
        
        // Use multiple redirect methods to ensure it works
        setTimeout(() => {
          // Method 1: Direct href
          window.location.href = '/dashboard';
        }, 100);
        
        // Method 2: Replace state (fallback)
        setTimeout(() => {
          window.location.replace('/dashboard');
        }, 500);
        
        // Method 3: Reload to dashboard (final fallback)
        setTimeout(() => {
          window.location.reload();
          window.location.href = '/dashboard';
        }, 1000);
      } else {
        const errorMessage = data.message || 'Login failed. Please check your credentials.';
        trackAuthEvent('login_failed', {
          email: formData.email,
          reason: errorMessage,
          timestamp: new Date().toISOString()
        });
        alert(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      trackAuthEvent('login_error', {
        email: formData.email,
        error: errorMessage,
        timestamp: new Date().toISOString()
      });
      alert(`Login error: ${errorMessage}`);
    } finally {
      // Restore button state
      if (submitButton) {
        submitButton.textContent = originalText || 'Sign In';
        submitButton.disabled = false;
      }
    }
  };

  const handleMfaVerificationSuccess = (token: string) => {
    // Store authentication token in localStorage
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify({ email: formData.email }));
    
    // Also set cookie for middleware authentication
    document.cookie = `authToken=${token}; path=/; max-age=604800`; // 7 days
    
    // Track successful MFA verification
    trackAuthEvent('mfa_verification_success', {
      email: formData.email,
      timestamp: new Date().toISOString()
    });
    
    // Redirect to dashboard
    window.location.href = '/dashboard';
  };

  const handleMfaBack = () => {
    setMfaRequired(false);
    setMfaMethods([]);
    setTempToken(null);
  };

  const handleResendMfaCode = async () => {
    try {
      const response = await fetch('/api/auth/resend-mfa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tempToken: tempToken
        })
      });

      if (!response.ok) {
        throw new Error('Failed to resend code');
      }
    } catch (error) {
      trackAuthEvent('mfa_resend_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  };

  const handleSsoLogin = async (provider: 'google' | 'microsoft' | 'saml') => {
    try {
      // Track SSO login attempt
      trackAuthEvent('sso_login_attempt', {
        provider,
        timestamp: new Date().toISOString()
      });

      // Redirect to SSO provider
      window.location.href = `/api/sso/initiate/${provider}`;
    } catch (error) {
      trackAuthEvent('sso_login_error', {
        provider,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      alert('SSO login failed. Please try again.');
    }
  };

  // Show MFA verification if required
  if (mfaRequired) {
    return (
      <MFALoginVerification
        mfaRequired={mfaRequired}
        mfaMethods={mfaMethods}
        onVerificationSuccess={handleMfaVerificationSuccess}
        onBack={handleMfaBack}
        onResendCode={handleResendMfaCode}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-indigo-600">VeriGrade</h1>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              start your free trial
            </a>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm text-gray-900 bg-white"
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 pr-10 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm text-gray-900 bg-white"
                  value={formData.password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Sign in
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSsoLogin('google')}
                className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50"
              >
                <Chrome className="h-5 w-5" />
                <span className="ml-2">Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleSsoLogin('microsoft')}
                className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50"
              >
                <Building2 className="h-5 w-5" />
                <span className="ml-2">Microsoft</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




