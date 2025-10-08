'use client';

import { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { API_ENDPOINTS } from '../../config/api';
import { trackAuthEvent, trackEvent } from '../../lib/posthog';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: 'robertotorres1222@gmail.com',
    password: '',
  });

  // Enhanced analytics tracking
  const trackEvent = async (eventName: string, properties?: any) => {
    try {
      // Try PostHog first, fallback to local analytics
      try {
        const { trackEvent: trackPostHog } = await import('../../lib/posthog');
        trackPostHog(eventName, properties);
      } catch (error) {
        // PostHog not available, use local analytics
        const localAnalytics = await import('../../lib/localAnalytics');
        localAnalytics.default.track(eventName, properties);
      }
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  };

  const handleLogout = () => {
    // Track logout event
    trackAuthEvent('logout', {
      timestamp: new Date().toISOString()
    });
    
    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('organization');
    
    // Clear cookie
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    // Redirect to login
    window.location.href = '/login';
  };

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
      console.log('🔍 Attempting login with:', { email: formData.email, endpoint: API_ENDPOINTS.auth.login });
      
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

      console.log('📡 Response status:', response.status);
      const data = await response.json();
      console.log('📊 Response data:', data);

      if (response.ok && data.success) {
        // Store authentication token in localStorage
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        localStorage.setItem('organization', JSON.stringify(data.data.user.organization));
        
        // Also set cookie for middleware authentication
        document.cookie = `authToken=${data.data.token}; path=/; max-age=604800`; // 7 days
        
        console.log('✅ Login successful:', data);
        
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
        console.error('❌ Login failed:', data.message);
        alert(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('❌ Error during login:', error);
      alert(`Login error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      // Restore button state
      if (submitButton) {
        submitButton.textContent = originalText || 'Sign In';
        submitButton.disabled = false;
      }
    }
  };

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
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="ml-2">Google</span>
              </button>

              <button
                type="button"
                className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="ml-2">GitHub</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




