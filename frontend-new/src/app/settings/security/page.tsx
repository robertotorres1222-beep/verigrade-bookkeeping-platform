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
  Lock, 
  Eye, 
  EyeOff,
  Key,
  Smartphone,
  Mail,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Monitor
} from 'lucide-react';
import { toast } from 'sonner';
import MFAManager from '@/components/Security/MFAManager';

interface SecuritySettings {
  passwordLastChanged: string;
  loginAttempts: number;
  lastLogin: string;
  lastLoginLocation: string;
  lastLoginDevice: string;
  activeSessions: number;
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
  loginAlerts: boolean;
}

export default function SecuritySettingsPage() {
  const [settings, setSettings] = useState<SecuritySettings>({
    passwordLastChanged: '2024-01-15',
    loginAttempts: 0,
    lastLogin: '2024-01-20T10:30:00Z',
    lastLoginLocation: 'New York, NY',
    lastLoginDevice: 'Chrome on Windows',
    activeSessions: 3,
    twoFactorEnabled: false,
    emailNotifications: true,
    loginAlerts: true,
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (response.ok) {
        toast.success('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setSettings(prev => ({
          ...prev,
          passwordLastChanged: new Date().toISOString().split('T')[0],
        }));
      } else {
        throw new Error('Failed to change password');
      }
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOutAll = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/signout-all', {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('All sessions signed out');
        setSettings(prev => ({ ...prev, activeSessions: 1 }));
      } else {
        throw new Error('Failed to sign out all sessions');
      }
    } catch (error) {
      toast.error('Failed to sign out all sessions');
    } finally {
      setLoading(false);
    }
  };

  const toggleNotification = async (type: 'email' | 'login') => {
    try {
      const response = await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [type === 'email' ? 'emailNotifications' : 'loginAlerts']: !settings[type === 'email' ? 'emailNotifications' : 'loginAlerts'],
        }),
      });

      if (response.ok) {
        setSettings(prev => ({
          ...prev,
          [type === 'email' ? 'emailNotifications' : 'loginAlerts']: !prev[type === 'email' ? 'emailNotifications' : 'loginAlerts'],
        }));
        toast.success(`${type === 'email' ? 'Email' : 'Login'} notifications ${!settings[type === 'email' ? 'emailNotifications' : 'loginAlerts'] ? 'enabled' : 'disabled'}`);
      } else {
        throw new Error('Failed to update notification settings');
      }
    } catch (error) {
      toast.error('Failed to update notification settings');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Shield className="h-6 w-6 text-blue-600" />
        <h1 className="text-3xl font-bold">Security Settings</h1>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Security Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security Score</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="text-4xl font-bold text-green-600">85%</div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Good security practices. Consider enabling 2FA for better protection.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3 p-3 border rounded">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Successful login</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(settings.lastLogin).toLocaleString()} • {settings.lastLoginLocation}
                  </p>
                </div>
                <Badge variant="outline">{settings.lastLoginDevice}</Badge>
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded">
                <Key className="h-4 w-4 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Password changed</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(settings.passwordLastChanged).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {settings.loginAttempts > 0 && (
                <div className="flex items-center space-x-3 p-3 border rounded border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">Failed login attempts</p>
                    <p className="text-xs text-red-600">
                      {settings.loginAttempts} failed attempts in the last 24 hours
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="authentication" className="space-y-6">
          {/* Password Change */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="h-5 w-5" />
                <span>Change Password</span>
              </CardTitle>
              <CardDescription>
                Last changed: {new Date(settings.passwordLastChanged).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showPasswords ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPasswords(!showPasswords)}
                    >
                      {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPasswords ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type={showPasswords ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={showPasswords}
                    onCheckedChange={setShowPasswords}
                  />
                  <Label htmlFor="show-passwords">Show passwords</Label>
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Changing Password...' : 'Change Password'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* MFA Manager */}
          <MFAManager userId="current-user" />
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Active Sessions</span>
                <Badge variant="outline">{settings.activeSessions} active</Badge>
              </CardTitle>
              <CardDescription>
                Manage your active sessions across different devices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 border rounded">
                  <Monitor className="h-4 w-4 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Current Session</p>
                    <p className="text-xs text-muted-foreground">
                      Chrome on Windows • {settings.lastLoginLocation}
                    </p>
                  </div>
                  <Badge variant="default">Current</Badge>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded">
                  <Smartphone className="h-4 w-4 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Mobile App</p>
                    <p className="text-xs text-muted-foreground">
                      iOS • New York, NY • 2 hours ago
                    </p>
                  </div>
                  <Button size="sm" variant="outline">Sign Out</Button>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded">
                  <Monitor className="h-4 w-4 text-gray-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Chrome on Mac</p>
                    <p className="text-xs text-muted-foreground">
                      macOS • San Francisco, CA • 1 day ago
                    </p>
                  </div>
                  <Button size="sm" variant="outline">Sign Out</Button>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button 
                  variant="destructive" 
                  onClick={handleSignOutAll}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Signing Out...' : 'Sign Out All Other Sessions'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Notifications</CardTitle>
              <CardDescription>
                Choose which security events you want to be notified about
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive security alerts via email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={() => toggleNotification('email')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="login-alerts">Login Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified of new login attempts
                  </p>
                </div>
                <Switch
                  id="login-alerts"
                  checked={settings.loginAlerts}
                  onCheckedChange={() => toggleNotification('login')}
                />
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              We recommend keeping security notifications enabled to stay informed about account activity.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
}