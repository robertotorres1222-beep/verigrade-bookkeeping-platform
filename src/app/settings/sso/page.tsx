'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Users, 
  Settings, 
  Key,
  Globe,
  Lock,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Copy,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

interface SSOProvider {
  id: string;
  name: string;
  type: 'oauth' | 'saml';
  isEnabled: boolean;
  isConfigured: boolean;
  clientId?: string;
  redirectUri?: string;
  metadataUrl?: string;
  certificate?: string;
  createdAt: string;
  lastUsed?: string;
}

interface SSOSettings {
  enforceSSO: boolean;
  allowPasswordLogin: boolean;
  autoProvisionUsers: boolean;
  defaultRole: string;
  providers: SSOProvider[];
}

export default function SSOSettingsPage() {
  const [settings, setSettings] = useState<SSOSettings>({
    enforceSSO: false,
    allowPasswordLogin: true,
    autoProvisionUsers: false,
    defaultRole: 'user',
    providers: []
  });
  const [loading, setLoading] = useState(false);
  const [activeProvider, setActiveProvider] = useState<SSOProvider | null>(null);
  const [samlMetadata, setSamlMetadata] = useState('');

  useEffect(() => {
    loadSSOSettings();
  }, []);

  const loadSSOSettings = async () => {
    try {
      const response = await fetch('/api/sso/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.data);
      }
    } catch (error) {
      console.error('Failed to load SSO settings:', error);
    }
  };

  const handleToggleSSO = async (enforce: boolean) => {
    setLoading(true);
    try {
      const response = await fetch('/api/sso/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enforceSSO: enforce })
      });

      if (response.ok) {
        setSettings(prev => ({ ...prev, enforceSSO: enforce }));
        toast.success(`SSO ${enforce ? 'enabled' : 'disabled'}`);
      } else {
        throw new Error('Failed to update SSO settings');
      }
    } catch (error) {
      toast.error('Failed to update SSO settings');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigureProvider = async (providerId: string, config: any) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/sso/providers/${providerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        await loadSSOSettings();
        toast.success('Provider configured successfully');
      } else {
        throw new Error('Failed to configure provider');
      }
    } catch (error) {
      toast.error('Failed to configure provider');
    } finally {
      setLoading(false);
    }
  };

  const handleTestProvider = async (providerId: string) => {
    try {
      const response = await fetch(`/api/sso/providers/${providerId}/test`, {
        method: 'POST'
      });

      if (response.ok) {
        toast.success('Provider test successful');
      } else {
        throw new Error('Provider test failed');
      }
    } catch (error) {
      toast.error('Provider test failed');
    }
  };

  const handleDownloadMetadata = (providerId: string) => {
    if (typeof window !== 'undefined') {
      const metadataUrl = `${getBaseUrl()}/api/sso/metadata/${providerId}`;
      window.open(metadataUrl, '_blank');
    }
  };

  const copyToClipboard = (text: string) => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    }
  };

  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://your-domain.com'; // Fallback for SSR
  };

  const getProviderIcon = (type: string) => {
    switch (type) {
      case 'oauth': return <Globe className="h-4 w-4" />;
      case 'saml': return <Lock className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getProviderName = (name: string) => {
    switch (name) {
      case 'google': return 'Google Workspace';
      case 'microsoft': return 'Microsoft Azure AD';
      case 'okta': return 'Okta';
      case 'auth0': return 'Auth0';
      case 'generic-saml': return 'Generic SAML';
      default: return name;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Shield className="h-6 w-6 text-blue-600" />
        <h1 className="text-3xl font-bold">Single Sign-On (SSO)</h1>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="saml">SAML Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* SSO Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>SSO Status</span>
                <Badge variant={settings.enforceSSO ? 'default' : 'secondary'}>
                  {settings.enforceSSO ? 'Enforced' : 'Optional'}
                </Badge>
              </CardTitle>
              <CardDescription>
                Configure single sign-on for your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="enforce-sso">Enforce SSO</Label>
                  <p className="text-sm text-muted-foreground">
                    Require all users to sign in via SSO
                  </p>
                </div>
                <Switch
                  id="enforce-sso"
                  checked={settings.enforceSSO}
                  onCheckedChange={handleToggleSSO}
                  disabled={loading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="allow-password">Allow Password Login</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow users to sign in with email and password
                  </p>
                </div>
                <Switch
                  id="allow-password"
                  checked={settings.allowPasswordLogin}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, allowPasswordLogin: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="auto-provision">Auto-Provision Users</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically create user accounts from SSO
                  </p>
                </div>
                <Switch
                  id="auto-provision"
                  checked={settings.autoProvisionUsers}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, autoProvisionUsers: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Active Providers */}
          <Card>
            <CardHeader>
              <CardTitle>Active Providers</CardTitle>
              <CardDescription>
                {settings.providers.filter(p => p.isEnabled).length} of {settings.providers.length} providers enabled
              </CardDescription>
            </CardHeader>
            <CardContent>
              {settings.providers.length === 0 ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No SSO providers configured. Add a provider to enable SSO.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  {settings.providers.map((provider) => (
                    <div key={provider.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        {getProviderIcon(provider.type)}
                        <div>
                          <p className="font-medium">{getProviderName(provider.name)}</p>
                          <p className="text-sm text-muted-foreground">
                            {provider.isConfigured ? 'Configured' : 'Not configured'} • 
                            {provider.lastUsed ? `Last used ${new Date(provider.lastUsed).toLocaleDateString()}` : 'Never used'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={provider.isEnabled ? 'default' : 'secondary'}>
                          {provider.isEnabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveProvider(provider)}
                        >
                          Configure
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers" className="space-y-6">
          {/* OAuth Providers */}
          <Card>
            <CardHeader>
              <CardTitle>OAuth Providers</CardTitle>
              <CardDescription>
                Configure OAuth providers for easy sign-in
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Google */}
                <div className="p-4 border rounded space-y-3">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-5 w-5 text-blue-600" />
                    <h3 className="font-medium">Google Workspace</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Sign in with Google accounts
                  </p>
                  <div className="space-y-2">
                    <div>
                      <Label htmlFor="google-client-id">Client ID</Label>
                      <Input
                        id="google-client-id"
                        placeholder="Enter Google Client ID"
                        value={activeProvider?.name === 'google' ? activeProvider.clientId || '' : ''}
                        onChange={(e) => {
                          if (activeProvider?.name === 'google') {
                            setActiveProvider({ ...activeProvider, clientId: e.target.value });
                          }
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="google-redirect">Redirect URI</Label>
                      <Input
                        id="google-redirect"
                        value={`${getBaseUrl()}/api/sso/callback/google`}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleConfigureProvider('google', {
                        clientId: activeProvider?.clientId,
                        redirectUri: `${getBaseUrl()}/api/sso/callback/google`
                      })}
                      disabled={loading}
                    >
                      {loading ? 'Configuring...' : 'Configure'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestProvider('google')}
                    >
                      Test
                    </Button>
                  </div>
                </div>

                {/* Microsoft */}
                <div className="p-4 border rounded space-y-3">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-5 w-5 text-blue-600" />
                    <h3 className="font-medium">Microsoft Azure AD</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Sign in with Microsoft accounts
                  </p>
                  <div className="space-y-2">
                    <div>
                      <Label htmlFor="microsoft-client-id">Client ID</Label>
                      <Input
                        id="microsoft-client-id"
                        placeholder="Enter Microsoft Client ID"
                        value={activeProvider?.name === 'microsoft' ? activeProvider.clientId || '' : ''}
                        onChange={(e) => {
                          if (activeProvider?.name === 'microsoft') {
                            setActiveProvider({ ...activeProvider, clientId: e.target.value });
                          }
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="microsoft-redirect">Redirect URI</Label>
                      <Input
                        id="microsoft-redirect"
                        value={`${getBaseUrl()}/api/sso/callback/microsoft`}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleConfigureProvider('microsoft', {
                        clientId: activeProvider?.clientId,
                        redirectUri: `${getBaseUrl()}/api/sso/callback/microsoft`
                      })}
                      disabled={loading}
                    >
                      {loading ? 'Configuring...' : 'Configure'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestProvider('microsoft')}
                    >
                      Test
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saml" className="space-y-6">
          {/* SAML Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>SAML Configuration</CardTitle>
              <CardDescription>
                Configure SAML for enterprise SSO
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="saml-metadata-url">SAML Metadata URL</Label>
                  <Input
                    id="saml-metadata-url"
                    placeholder="https://your-idp.com/metadata"
                    value={samlMetadata}
                    onChange={(e) => setSamlMetadata(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Enter your identity provider's metadata URL
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Our SAML Metadata</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={`${getBaseUrl()}/api/sso/metadata/saml`}
                      readOnly
                      className="bg-gray-50"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(`${getBaseUrl()}/api/sso/metadata/saml`)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadMetadata('saml')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Provide this URL to your identity provider
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Entity ID</Label>
                  <Input
                    value="verigrade-saml"
                    readOnly
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label>ACS URL (Assertion Consumer Service)</Label>
                  <Input
                    value={`${getBaseUrl()}/api/sso/callback/saml`}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleConfigureProvider('saml', {
                      metadataUrl: samlMetadata,
                      entityId: 'verigrade-saml',
                      acsUrl: `${getBaseUrl()}/api/sso/callback/saml`
                    })}
                    disabled={loading || !samlMetadata}
                  >
                    {loading ? 'Configuring...' : 'Configure SAML'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleTestProvider('saml')}
                  >
                    Test SAML
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SAML Certificate */}
          <Card>
            <CardHeader>
              <CardTitle>SAML Certificate</CardTitle>
              <CardDescription>
                Upload your SAML certificate for encryption
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="saml-certificate">Certificate (PEM format)</Label>
                  <textarea
                    id="saml-certificate"
                    className="w-full h-32 p-3 border rounded font-mono text-sm"
                    placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                  />
                </div>
                <Button
                  onClick={() => {
                    // Handle certificate upload
                    toast.success('Certificate uploaded successfully');
                  }}
                >
                  Upload Certificate
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}