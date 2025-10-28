'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Chrome, 
  Monitor, 
  Key, 
  Shield,
  ExternalLink,
  Loader2
} from 'lucide-react';

interface SsoProvider {
  id: string;
  provider: string;
  isActive: boolean;
  clientId?: string;
  redirectUri?: string;
  entityId?: string;
  ssoUrl?: string;
}

interface SsoLoginProps {
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
  organizationId?: string;
}

const SsoLogin: React.FC<SsoLoginProps> = ({ 
  onSuccess, 
  onError, 
  organizationId 
}) => {
  const [providers, setProviders] = useState<SsoProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [initiating, setInitiating] = useState<string | null>(null);

  useEffect(() => {
    fetchSsoProviders();
  }, [organizationId]);

  const fetchSsoProviders = async () => {
    try {
      const response = await fetch('/api/sso/status');
      if (response.ok) {
        const data = await response.json();
        setProviders(data.providers.filter((p: SsoProvider) => p.isActive));
      }
    } catch (error) {
      console.error('Error fetching SSO providers:', error);
      onError?.('Failed to load SSO providers');
    } finally {
      setLoading(false);
    }
  };

  const handleSsoLogin = async (provider: string) => {
    setInitiating(provider);
    try {
      const response = await fetch(`/api/sso/initiate/${provider}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId,
          returnUrl: window.location.origin + '/dashboard'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.authUrl) {
          // Redirect to SSO provider
          window.location.href = data.authUrl;
        } else {
          onError?.('No authentication URL received');
        }
      } else {
        const errorData = await response.json();
        onError?.(errorData.message || 'Failed to initiate SSO login');
      }
    } catch (error) {
      console.error('SSO login error:', error);
      onError?.('Network error during SSO login');
    } finally {
      setInitiating(null);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'google':
        return <Chrome className="w-5 h-5" />;
      case 'microsoft':
        return <Monitor className="w-5 h-5" />;
      case 'saml':
        return <Key className="w-5 h-5" />;
      default:
        return <Shield className="w-5 h-5" />;
    }
  };

  const getProviderName = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'google':
        return 'Google Workspace';
      case 'microsoft':
        return 'Microsoft Azure AD';
      case 'saml':
        return 'SAML 2.0';
      default:
        return provider;
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'google':
        return 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100';
      case 'microsoft':
        return 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100';
      case 'saml':
        return 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading SSO providers...</span>
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="text-center py-8">
        <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No SSO providers configured</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Sign in with your organization
        </h3>
        <p className="text-sm text-gray-600">
          Choose your preferred SSO provider to continue
        </p>
      </div>

      <div className="space-y-3">
        {providers.map((provider) => (
          <motion.button
            key={provider.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSsoLogin(provider.provider)}
            disabled={initiating === provider.provider}
            className={`w-full flex items-center justify-center px-4 py-3 border rounded-lg transition-colors duration-200 ${
              getProviderColor(provider.provider)
            } ${initiating === provider.provider ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {initiating === provider.provider ? (
              <Loader2 className="w-5 h-5 animate-spin mr-3" />
            ) : (
              <div className="mr-3">
                {getProviderIcon(provider.provider)}
              </div>
            )}
            <span className="font-medium">
              {initiating === provider.provider 
                ? 'Connecting...' 
                : `Continue with ${getProviderName(provider.provider)}`
              }
            </span>
            <ExternalLink className="w-4 h-4 ml-2" />
          </motion.button>
        ))}
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-500">
          Secure authentication powered by your organization's identity provider
        </p>
      </div>
    </div>
  );
};

export default SsoLogin;
