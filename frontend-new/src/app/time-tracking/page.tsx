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
  Clock, 
  Play, 
  Pause, 
  Square, 
  Plus,
  Edit,
  Trash2,
  Filter,
  Download,
  RefreshCw,
  Timer,
  DollarSign,
  User,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

interface TimeEntry {
  id: string;
  description: string;
  hours: number;
  rate: number;
  amount: number;
  date: string;
  startTime?: string;
  endTime?: string;
  isActive: boolean;
  isBillable: boolean;
  notes?: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  servicePackage: {
    id: string;
    name: string;
    billingType: string;
  };
  client: {
    id: string;
    name: string;
    email: string;
  };
}

interface ServicePackage {
  id: string;
  name: string;
  description?: string;
  hourlyRate?: number;
  fixedPrice?: number;
  billingType: string;
  isActive: boolean;
}

interface Client {
  id: string;
  name: string;
  email: string;
}

export default function TimeTrackingPage() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [servicePackages, setServicePackages] = useState<ServicePackage[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    clientId: '',
    packageId: ''
  });

  // New entry form
  const [newEntry, setNewEntry] = useState({
    servicePackageId: '',
    clientId: '',
    description: '',
    hours: 0,
    rate: 0,
    date: new Date().toISOString().split('T')[0],
    isBillable: true,
    notes: ''
  });

  useEffect(() => {
    loadData();
    loadActiveTimer();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTimer) {
      interval = setInterval(() => {
        const now = new Date();
        const startTime = new Date(activeTimer.startTime!);
        const elapsed = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        setElapsedTime(elapsed);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [entriesRes, packagesRes, clientsRes] = await Promise.all([
        fetch('/api/service-billing/time-entries'),
        fetch('/api/service-billing/packages'),
        fetch('/api/customers')
      ]);

      if (entriesRes.ok) {
        const entriesData = await entriesRes.json();
        setTimeEntries(entriesData.data.timeEntries || []);
      }

      if (packagesRes.ok) {
        const packagesData = await packagesRes.json();
        setServicePackages(packagesData.data.packages || []);
      }

      if (clientsRes.ok) {
        const clientsData = await clientsRes.json();
        setClients(clientsData.data.customers || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadActiveTimer = async () => {
    try {
      const response = await fetch('/api/service-billing/timer/active');
      if (response.ok) {
        const data = await response.json();
        setActiveTimer(data.data);
        if (data.data) {
          const now = new Date();
          const startTime = new Date(data.data.startTime);
          const elapsed = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);
          setElapsedTime(elapsed);
        }
      }
    } catch (error) {
      console.error('Failed to load active timer:', error);
    }
  };

  const handleStartTimer = async () => {
    if (!newEntry.servicePackageId || !newEntry.clientId || !newEntry.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/service-billing/timer/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          servicePackageId: newEntry.servicePackageId,
          clientId: newEntry.clientId,
          description: newEntry.description
        })
      });

      if (response.ok) {
        const data = await response.json();
        setActiveTimer(data.data);
        setElapsedTime(0);
        toast.success('Timer started');
        await loadData();
      } else {
        throw new Error('Failed to start timer');
      }
    } catch (error) {
      toast.error('Failed to start timer');
    } finally {
      setLoading(false);
    }
  };

  const handleStopTimer = async () => {
    if (!activeTimer) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/service-billing/timer/stop/${activeTimer.id}`, {
        method: 'POST'
      });

      if (response.ok) {
        setActiveTimer(null);
        setElapsedTime(0);
        toast.success('Timer stopped');
        await loadData();
      } else {
        throw new Error('Failed to stop timer');
      }
    } catch (error) {
      toast.error('Failed to stop timer');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/service-billing/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry)
      });

      if (response.ok) {
        toast.success('Time entry added');
        setNewEntry({
          servicePackageId: '',
          clientId: '',
          description: '',
          hours: 0,
          rate: 0,
          date: new Date().toISOString().split('T')[0],
          isBillable: true,
          notes: ''
        });
        setShowAddEntry(false);
        await loadData();
      } else {
        throw new Error('Failed to add time entry');
      }
    } catch (error) {
      toast.error('Failed to add time entry');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this time entry?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/service-billing/time-entries/${entryId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Time entry deleted');
        await loadData();
      } else {
        throw new Error('Failed to delete time entry');
      }
    } catch (error) {
      toast.error('Failed to delete time entry');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getTotalHours = () => {
    return timeEntries.reduce((sum, entry) => sum + entry.hours, 0);
  };

  const getTotalAmount = () => {
    return timeEntries.reduce((sum, entry) => sum + entry.amount, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className="h-6 w-6 text-blue-600" />
          <h1 className="text-3xl font-bold">Time Tracking</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setShowAddEntry(true)}
            disabled={activeTimer !== null}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </Button>
        </div>
      </div>

      {/* Active Timer */}
      {activeTimer && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <Timer className="h-5 w-5" />
              <span>Active Timer</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{activeTimer.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {activeTimer.servicePackage.name} • {activeTimer.client.name}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {formatTime(elapsedTime)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Started {new Date(activeTimer.startTime!).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={handleStopTimer}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop Timer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timer Controls */}
      {!activeTimer && (
        <Card>
          <CardHeader>
            <CardTitle>Start New Timer</CardTitle>
            <CardDescription>
              Track time for a specific task or project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleStartTimer} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="package">Service Package</Label>
                  <select
                    id="package"
                    value={newEntry.servicePackageId}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, servicePackageId: e.target.value }))}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select package</option>
                    {servicePackages.map(pkg => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client">Client</Label>
                  <select
                    id="client"
                    value={newEntry.clientId}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, clientId: e.target.value }))}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select client</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newEntry.description}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="What are you working on?"
                    required
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                <Play className="h-4 w-4 mr-2" />
                Start Timer
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Time Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Time Entries</CardTitle>
          <CardDescription>
            {timeEntries.length} entries • {formatTime(getTotalHours())} total • {formatCurrency(getTotalAmount())}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading time entries...</span>
            </div>
          ) : timeEntries.length === 0 ? (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                No time entries found. Start tracking your time to see entries here.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {timeEntries.map((entry) => (
                <div key={entry.id} className="border rounded p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {entry.isActive ? (
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      ) : (
                        <div className="w-3 h-3 bg-gray-300 rounded-full" />
                      )}
                      <div>
                        <p className="font-medium">{entry.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {entry.servicePackage.name} • {entry.client.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatTime(entry.hours)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(entry.amount)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(entry.date).toLocaleDateString()}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{entry.user.firstName} {entry.user.lastName}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4" />
                        <span>${entry.rate}/hr</span>
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={entry.isBillable ? 'default' : 'secondary'}>
                        {entry.isBillable ? 'Billable' : 'Non-billable'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteEntry(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {entry.notes && (
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-muted-foreground">{entry.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Entry Modal */}
      {showAddEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add Time Entry</CardTitle>
              <CardDescription>
                Manually add a time entry
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddEntry} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="entry-package">Service Package</Label>
                  <select
                    id="entry-package"
                    value={newEntry.servicePackageId}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, servicePackageId: e.target.value }))}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select package</option>
                    {servicePackages.map(pkg => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entry-client">Client</Label>
                  <select
                    id="entry-client"
                    value={newEntry.clientId}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, clientId: e.target.value }))}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select client</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entry-description">Description</Label>
                  <Input
                    id="entry-description"
                    value={newEntry.description}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="What did you work on?"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="entry-hours">Hours</Label>
                    <Input
                      id="entry-hours"
                      type="number"
                      step="0.25"
                      min="0"
                      value={newEntry.hours}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, hours: parseFloat(e.target.value) || 0 }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="entry-rate">Rate ($/hr)</Label>
                    <Input
                      id="entry-rate"
                      type="number"
                      step="0.01"
                      min="0"
                      value={newEntry.rate}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entry-date">Date</Label>
                  <Input
                    id="entry-date"
                    type="date"
                    value={newEntry.date}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entry-notes">Notes (Optional)</Label>
                  <textarea
                    id="entry-notes"
                    value={newEntry.notes}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full p-2 border rounded"
                    rows={3}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Adding...' : 'Add Entry'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddEntry(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}