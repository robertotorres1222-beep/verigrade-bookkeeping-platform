'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheckIcon,
  KeyIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface SSOProvider {
  id: string;
  name: string;
  type: 'saml' | 'oauth2' | 'ldap';
  status: 'active' | 'inactive' | 'error';
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  metadataUrl?: string;
  entityId?: string;
  certificate?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastSync?: Date;
  userCount: number;
  errorMessage?: string;
}

interface SSOProviderProps {
  className?: string;
}

const SSOProvider: React.FC<SSOProviderProps> = ({ className = '' }) => {
  const [providers, setProviders] = useState<SSOProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<SSOProvider | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'saml' as 'saml' | 'oauth2' | 'ldap',
    clientId: '',
    clientSecret: '',
    redirectUri: '',
    metadataUrl: '',
    entityId: '',
    certificate: '',
    isDefault: false
  });
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/sso/providers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProviders(data.data || []);
      } else {
        // Mock data for demonstration
        const mockProviders: SSOProvider[] = [
          {
            id: '1',
            name: 'Google Workspace',
            type: 'oauth2',
            status: 'active',
            clientId: 'google-client-id-123',
            clientSecret: 'google-secret-***',
            redirectUri: 'https://app.verigrade.com/auth/google/callback',
            isDefault: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
            updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
            lastSync: new Date(Date.now() - 1000 * 60 * 60 * 2),
            userCount: 45
          },
          {
            id: '2',
            name: 'Microsoft Azure AD',
            type: 'saml',
            status: 'active',
            metadataUrl: 'https://login.microsoftonline.com/tenant-id/federationmetadata/2007-06/federationmetadata.xml',
            entityId: 'https://sts.windows.net/tenant-id/',
            isDefault: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
            updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
            lastSync: new Date(Date.now() - 1000 * 60 * 60 * 4),
            userCount: 23
          },
          {
            id: '3',
            name: 'Okta',
            type: 'saml',
            status: 'error',
            metadataUrl: 'https://company.okta.com/app/abc123/sso/saml/metadata',
            entityId: 'http://www.okta.com/abc123',
            isDefault: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
            updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
            userCount: 0,
            errorMessage: 'Invalid certificate or metadata URL'
          }
        ];
        setProviders(mockProviders);
      }
    } catch (error) {
      console.error('Error fetching SSO providers:', error);
      toast.error('Failed to load SSO providers');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProvider = async () => {
    try {
      const response = await fetch('/api/auth/sso/providers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('SSO provider added successfully');
        setShowAddModal(false);
        setFormData({
          name: '',
          type: 'saml',
          clientId: '',
          clientSecret: '',
          redirectUri: '',
          metadataUrl: '',
          entityId: '',
          certificate: '',
          isDefault: false
        });
        fetchProviders();
      } else {
        toast.error('Failed to add SSO provider');
      }
    } catch (error) {
      console.error('Error adding SSO provider:', error);
      toast.error('Failed to add SSO provider');
    }
  };

  const handleUpdateProvider = async () => {
    if (!selectedProvider) return;

    try {
      const response = await fetch(`/api/auth/sso/providers/${selectedProvider.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('SSO provider updated successfully');
        setShowEditModal(false);
        setSelectedProvider(null);
        fetchProviders();
      } else {
        toast.error('Failed to update SSO provider');
      }
    } catch (error) {
      console.error('Error updating SSO provider:', error);
      toast.error('Failed to update SSO provider');
    }
  };

  const handleDeleteProvider = async (providerId: string) => {
    if (!confirm('Are you sure you want to delete this SSO provider?')) return;

    try {
      const response = await fetch(`/api/auth/sso/providers/${providerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        toast.success('SSO provider deleted successfully');
        fetchProviders();
      } else {
        toast.error('Failed to delete SSO provider');
      }
    } catch (error) {
      console.error('Error deleting SSO provider:', error);
      toast.error('Failed to delete SSO provider');
    }
  };

  const handleTestConnection = async (providerId: string) => {
    try {
      const response = await fetch(`/api/auth/sso/providers/${providerId}/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        toast.success('Connection test successful');
        fetchProviders();
      } else {
        toast.error('Connection test failed');
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      toast.error('Connection test failed');
    }
  };

  const handleSyncUsers = async (providerId: string) => {
    try {
      const response = await fetch(`/api/auth/sso/providers/${providerId}/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        toast.success('User sync initiated');
        fetchProviders();
      } else {
        toast.error('User sync failed');
      }
    } catch (error) {
      console.error('Error syncing users:', error);
      toast.error('User sync failed');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'inactive':
        return <XCircleIcon className="h-5 w-5 text-gray-400" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <XCircleIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'saml':
        return <ShieldCheckIcon className="h-5 w-5 text-blue-500" />;
      case 'oauth2':
        return <KeyIcon className="h-5 w-5 text-green-500" />;
      case 'ldap':
        return <GlobeAltIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <KeyIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const toggleSecretVisibility = (providerId: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [providerId]: !prev[providerId]
    }));
  };

  const maskSecret = (secret: string) => {
    if (secret.length <= 8) return '***';
    return secret.substring(0, 4) + '***' + secret.substring(secret.length - 4);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <ArrowPathIcon className="h-6 w-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Loading SSO providers...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Single Sign-On (SSO)</h3>
          <p className="text-sm text-gray-600">Configure SSO providers for secure authentication</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Provider
        </button>
      </div>

      {/* SSO Providers List */}
      <div className="space-y-4">
        {providers.map((provider) => (
          <div key={provider.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {getTypeIcon(provider.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-lg font-medium text-gray-900">{provider.name}</h4>
                    {provider.isDefault && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Default
                      </span>
                    )}
                    <div className="flex items-center">
                      {getStatusIcon(provider.status)}
                      <span className="ml-1 text-sm font-medium capitalize">{provider.status}</span>
                    </div>
                  </div>
                  
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Type:</span> {provider.type.toUpperCase()}
                    </div>
                    <div>
                      <span className="font-medium">Users:</span> {provider.userCount}
                    </div>
                    <div>
                      <span className="font-medium">Last Sync:</span> {
                        provider.lastSync 
                          ? new Date(provider.lastSync).toLocaleDateString()
                          : 'Never'
                      }
                    </div>
                  </div>

                  {provider.errorMessage && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                        <div className="ml-3">
                          <p className="text-sm text-red-800">{provider.errorMessage}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Provider Details */}
                  <div className="mt-4 space-y-2">
                    {provider.clientId && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700 w-20">Client ID:</span>
                        <span className="text-sm text-gray-900 font-mono">{provider.clientId}</span>
                      </div>
                    )}
                    {provider.clientSecret && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700 w-20">Secret:</span>
                        <span className="text-sm text-gray-900 font-mono">
                          {showSecrets[provider.id] ? provider.clientSecret : maskSecret(provider.clientSecret)}
                        </span>
                        <button
                          onClick={() => toggleSecretVisibility(provider.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {showSecrets[provider.id] ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                        </button>
                      </div>
                    )}
                    {provider.redirectUri && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700 w-20">Redirect:</span>
                        <span className="text-sm text-gray-900 break-all">{provider.redirectUri}</span>
                      </div>
                    )}
                    {provider.metadataUrl && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700 w-20">Metadata:</span>
                        <span className="text-sm text-gray-900 break-all">{provider.metadataUrl}</span>
                      </div>
                    )}
                    {provider.entityId && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700 w-20">Entity ID:</span>
                        <span className="text-sm text-gray-900 break-all">{provider.entityId}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleTestConnection(provider.id)}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50"
                >
                  Test
                </button>
                <button
                  onClick={() => handleSyncUsers(provider.id)}
                  className="px-3 py-1 text-sm text-green-600 hover:text-green-800 border border-green-300 rounded-md hover:bg-green-50"
                >
                  Sync
                </button>
                <button
                  onClick={() => {
                    setSelectedProvider(provider);
                    setFormData({
                      name: provider.name,
                      type: provider.type,
                      clientId: provider.clientId || '',
                      clientSecret: provider.clientSecret || '',
                      redirectUri: provider.redirectUri || '',
                      metadataUrl: provider.metadataUrl || '',
                      entityId: provider.entityId || '',
                      certificate: provider.certificate || '',
                      isDefault: provider.isDefault
                    });
                    setShowEditModal(true);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteProvider(provider.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Provider Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add SSO Provider</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Provider Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Google Workspace"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="saml">SAML</option>
                      <option value="oauth2">OAuth2</option>
                      <option value="ldap">LDAP</option>
                    </select>
                  </div>
                </div>

                {formData.type === 'oauth2' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Client ID
                        </label>
                        <input
                          type="text"
                          value={formData.clientId}
                          onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="OAuth2 Client ID"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Client Secret
                        </label>
                        <input
                          type="password"
                          value={formData.clientSecret}
                          onChange={(e) => setFormData({...formData, clientSecret: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="OAuth2 Client Secret"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Redirect URI
                      </label>
                      <input
                        type="url"
                        value={formData.redirectUri}
                        onChange={(e) => setFormData({...formData, redirectUri: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://app.verigrade.com/auth/callback"
                      />
                    </div>
                  </>
                )}

                {formData.type === 'saml' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Metadata URL
                      </label>
                      <input
                        type="url"
                        value={formData.metadataUrl}
                        onChange={(e) => setFormData({...formData, metadataUrl: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://idp.example.com/metadata"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Entity ID
                      </label>
                      <input
                        type="text"
                        value={formData.entityId}
                        onChange={(e) => setFormData({...formData, entityId: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://idp.example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Certificate (Optional)
                      </label>
                      <textarea
                        value={formData.certificate}
                        onChange={(e) => setFormData({...formData, certificate: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                        placeholder="Paste certificate content here..."
                      />
                    </div>
                  </>
                )}

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-900">
                    Set as default provider
                  </label>
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={handleAddProvider}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  Add Provider
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Provider Modal */}
      <AnimatePresence>
        {showEditModal && selectedProvider && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit SSO Provider</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Provider Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="saml">SAML</option>
                      <option value="oauth2">OAuth2</option>
                      <option value="ldap">LDAP</option>
                    </select>
                  </div>
                </div>

                {formData.type === 'oauth2' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Client ID
                        </label>
                        <input
                          type="text"
                          value={formData.clientId}
                          onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Client Secret
                        </label>
                        <input
                          type="password"
                          value={formData.clientSecret}
                          onChange={(e) => setFormData({...formData, clientSecret: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Redirect URI
                      </label>
                      <input
                        type="url"
                        value={formData.redirectUri}
                        onChange={(e) => setFormData({...formData, redirectUri: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}

                {formData.type === 'saml' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Metadata URL
                      </label>
                      <input
                        type="url"
                        value={formData.metadataUrl}
                        onChange={(e) => setFormData({...formData, metadataUrl: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Entity ID
                      </label>
                      <input
                        type="text"
                        value={formData.entityId}
                        onChange={(e) => setFormData({...formData, entityId: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Certificate (Optional)
                      </label>
                      <textarea
                        value={formData.certificate}
                        onChange={(e) => setFormData({...formData, certificate: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                      />
                    </div>
                  </>
                )}

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefaultEdit"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isDefaultEdit" className="ml-2 block text-sm text-gray-900">
                    Set as default provider
                  </label>
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={handleUpdateProvider}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  Update Provider
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SSOProvider;

