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
  Calculator, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Users,
  Package,
  FileText,
  BarChart3,
  PieChart,
  Target,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Download,
  Filter,
  Search
} from 'lucide-react';
import { toast } from 'sonner';

interface Project {
  id: string;
  name: string;
  description: string;
  clientId: string;
  clientName: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  startDate: string;
  endDate?: string;
  budget: number;
  actualCost: number;
  estimatedHours: number;
  actualHours: number;
  hourlyRate: number;
  profitMargin: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProjectExpense {
  id: string;
  projectId: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  vendor?: string;
  isBillable: boolean;
  createdAt: string;
}

interface LaborEntry {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  role: string;
  hours: number;
  rate: number;
  amount: number;
  date: string;
  description: string;
  isBillable: boolean;
  createdAt: string;
}

interface MaterialEntry {
  id: string;
  projectId: string;
  itemName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  supplier?: string;
  date: string;
  description?: string;
  isBillable: boolean;
  createdAt: string;
}

interface ProjectDashboard {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalBudget: number;
  totalActualCost: number;
  totalProfit: number;
  averageProfitMargin: number;
  onBudgetProjects: number;
  overBudgetProjects: number;
}

export default function JobCostingPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [expenses, setExpenses] = useState<ProjectExpense[]>([]);
  const [laborEntries, setLaborEntries] = useState<LaborEntry[]>([]);
  const [materialEntries, setMaterialEntries] = useState<MaterialEntry[]>([]);
  const [dashboard, setDashboard] = useState<ProjectDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateExpense, setShowCreateExpense] = useState(false);
  const [showCreateLabor, setShowCreateLabor] = useState(false);
  const [showCreateMaterial, setShowCreateMaterial] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    clientId: '',
    startDate: '',
    endDate: '',
    budget: 0,
    estimatedHours: 0,
    hourlyRate: 0
  });

  const [newExpense, setNewExpense] = useState({
    projectId: '',
    category: '',
    description: '',
    amount: 0,
    date: '',
    vendor: '',
    isBillable: true
  });

  const [newLabor, setNewLabor] = useState({
    projectId: '',
    userId: '',
    role: '',
    hours: 0,
    rate: 0,
    date: '',
    description: '',
    isBillable: true
  });

  const [newMaterial, setNewMaterial] = useState({
    projectId: '',
    itemName: '',
    quantity: 0,
    unitCost: 0,
    supplier: '',
    date: '',
    description: '',
    isBillable: true
  });

  useEffect(() => {
    loadDashboard();
    loadProjects();
    loadExpenses();
    loadLaborEntries();
    loadMaterialEntries();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await fetch('/api/job-costing/dashboard');
      if (response.ok) {
        const data = await response.json();
        setDashboard(data.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    }
  };

  const loadProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/job-costing/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.data.projects || []);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExpenses = async () => {
    try {
      const response = await fetch('/api/job-costing/expenses');
      if (response.ok) {
        const data = await response.json();
        setExpenses(data.data.expenses || []);
      }
    } catch (error) {
      console.error('Failed to load expenses:', error);
    }
  };

  const loadLaborEntries = async () => {
    try {
      const response = await fetch('/api/job-costing/labor');
      if (response.ok) {
        const data = await response.json();
        setLaborEntries(data.data.laborEntries || []);
      }
    } catch (error) {
      console.error('Failed to load labor entries:', error);
    }
  };

  const loadMaterialEntries = async () => {
    try {
      const response = await fetch('/api/job-costing/materials');
      if (response.ok) {
        const data = await response.json();
        setMaterialEntries(data.data.materialEntries || []);
      }
    } catch (error) {
      console.error('Failed to load material entries:', error);
    }
  };

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/job-costing/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject)
      });

      if (response.ok) {
        toast.success('Project created successfully');
        setNewProject({
          name: '',
          description: '',
          clientId: '',
          startDate: '',
          endDate: '',
          budget: 0,
          estimatedHours: 0,
          hourlyRate: 0
        });
        setShowCreateProject(false);
        await loadProjects();
        await loadDashboard();
      } else {
        throw new Error('Failed to create project');
      }
    } catch (error) {
      toast.error('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExpense = async () => {
    if (!newExpense.projectId || !newExpense.description || newExpense.amount <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/job-costing/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpense)
      });

      if (response.ok) {
        toast.success('Expense added successfully');
        setNewExpense({
          projectId: '',
          category: '',
          description: '',
          amount: 0,
          date: '',
          vendor: '',
          isBillable: true
        });
        setShowCreateExpense(false);
        await loadExpenses();
        await loadDashboard();
      } else {
        throw new Error('Failed to create expense');
      }
    } catch (error) {
      toast.error('Failed to create expense');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLabor = async () => {
    if (!newLabor.projectId || !newLabor.userId || newLabor.hours <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/job-costing/labor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLabor)
      });

      if (response.ok) {
        toast.success('Labor entry added successfully');
        setNewLabor({
          projectId: '',
          userId: '',
          role: '',
          hours: 0,
          rate: 0,
          date: '',
          description: '',
          isBillable: true
        });
        setShowCreateLabor(false);
        await loadLaborEntries();
        await loadDashboard();
      } else {
        throw new Error('Failed to create labor entry');
      }
    } catch (error) {
      toast.error('Failed to create labor entry');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMaterial = async () => {
    if (!newMaterial.projectId || !newMaterial.itemName || newMaterial.quantity <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/job-costing/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newMaterial,
          totalCost: newMaterial.quantity * newMaterial.unitCost
        })
      });

      if (response.ok) {
        toast.success('Material entry added successfully');
        setNewMaterial({
          projectId: '',
          itemName: '',
          quantity: 0,
          unitCost: 0,
          supplier: '',
          date: '',
          description: '',
          isBillable: true
        });
        setShowCreateMaterial(false);
        await loadMaterialEntries();
        await loadDashboard();
      } else {
        throw new Error('Failed to create material entry');
      }
    } catch (error) {
      toast.error('Failed to create material entry');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planning': return <Target className="h-4 w-4" />;
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'on_hold': return <AlertCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getProfitColor = (profit: number) => {
    if (profit > 0) return 'text-green-600';
    if (profit < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getProfitIcon = (profit: number) => {
    if (profit > 0) return <TrendingUp className="h-4 w-4" />;
    if (profit < 0) return <TrendingDown className="h-4 w-4" />;
    return <Target className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calculator className="h-6 w-6 text-blue-600" />
          <h1 className="text-3xl font-bold">Job Costing & Project Management</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              loadDashboard();
              loadProjects();
            }}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateProject(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="labor">Labor</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {dashboard ? (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                    <Calculator className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboard.totalProjects}</div>
                    <p className="text-xs text-muted-foreground">
                      {dashboard.activeProjects} active
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${dashboard.totalBudget.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      ${dashboard.totalActualCost.toLocaleString()} actual
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${getProfitColor(dashboard.totalProfit)}`}>
                      ${dashboard.totalProfit.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {dashboard.averageProfitMargin.toFixed(1)}% margin
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Budget Performance</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {dashboard.onBudgetProjects}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {dashboard.overBudgetProjects} over budget
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Project Performance Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Performance</CardTitle>
                  <CardDescription>
                    Profitability analysis across all projects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {projects.slice(0, 5).map((project) => {
                      const profit = project.budget - project.actualCost;
                      const margin = project.budget > 0 ? (profit / project.budget) * 100 : 0;
                      
                      return (
                        <div key={project.id} className="flex items-center justify-between p-4 border rounded">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(project.status)}
                            <div>
                              <p className="font-medium">{project.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {project.clientName}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                ${project.budget.toLocaleString()} budget
                              </p>
                              <p className="text-sm text-muted-foreground">
                                ${project.actualCost.toLocaleString()} actual
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`font-medium ${getProfitColor(profit)}`}>
                                ${profit.toLocaleString()}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {margin.toFixed(1)}% margin
                              </p>
                            </div>
                            <Badge className={getStatusColor(project.status)}>
                              {project.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading dashboard...</span>
            </div>
          )}
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading projects...</span>
            </div>
          ) : projects.length === 0 ? (
            <Alert>
              <Calculator className="h-4 w-4" />
              <AlertDescription>
                No projects found. Create your first project to start tracking costs and profitability.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => {
                const profit = project.budget - project.actualCost;
                const margin = project.budget > 0 ? (profit / project.budget) * 100 : 0;
                
                return (
                  <Card key={project.id} className="relative">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(project.status)}>
                            {project.status.replace('_', ' ')}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingProject(project)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription>
                        {project.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Client */}
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">Client</Label>
                        <p className="text-sm">{project.clientName}</p>
                      </div>

                      {/* Budget vs Actual */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Budget:</span>
                          <span className="font-medium">
                            ${project.budget.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Actual:</span>
                          <span className="font-medium">
                            ${project.actualCost.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Profit:</span>
                          <span className={`font-medium ${getProfitColor(profit)}`}>
                            ${profit.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Margin:</span>
                          <span className={`font-medium ${getProfitColor(margin)}`}>
                            {margin.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      {/* Hours */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Estimated Hours:</span>
                          <span>{project.estimatedHours}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Actual Hours:</span>
                          <span>{project.actualHours}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedProject(project.id)}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingProject(project)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Project Expenses</h2>
            <Button onClick={() => setShowCreateExpense(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </div>

          {expenses.length === 0 ? (
            <Alert>
              <Package className="h-4 w-4" />
              <AlertDescription>
                No expenses found. Add expenses to track project costs.
              </AlertDescription>
            </Alert>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left p-4">Project</th>
                        <th className="text-left p-4">Category</th>
                        <th className="text-left p-4">Description</th>
                        <th className="text-left p-4">Amount</th>
                        <th className="text-left p-4">Date</th>
                        <th className="text-left p-4">Billable</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((expense) => (
                        <tr key={expense.id} className="border-b">
                          <td className="p-4">
                            {projects.find(p => p.id === expense.projectId)?.name || 'Unknown'}
                          </td>
                          <td className="p-4">{expense.category}</td>
                          <td className="p-4">{expense.description}</td>
                          <td className="p-4 font-medium">
                            ${expense.amount.toLocaleString()}
                          </td>
                          <td className="p-4">
                            {new Date(expense.date).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <Badge variant={expense.isBillable ? 'default' : 'secondary'}>
                              {expense.isBillable ? 'Yes' : 'No'}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="labor" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Labor Tracking</h2>
            <Button onClick={() => setShowCreateLabor(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Labor Entry
            </Button>
          </div>

          {laborEntries.length === 0 ? (
            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                No labor entries found. Add labor entries to track project hours and costs.
              </AlertDescription>
            </Alert>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left p-4">Project</th>
                        <th className="text-left p-4">User</th>
                        <th className="text-left p-4">Role</th>
                        <th className="text-left p-4">Hours</th>
                        <th className="text-left p-4">Rate</th>
                        <th className="text-left p-4">Amount</th>
                        <th className="text-left p-4">Date</th>
                        <th className="text-left p-4">Billable</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {laborEntries.map((labor) => (
                        <tr key={labor.id} className="border-b">
                          <td className="p-4">
                            {projects.find(p => p.id === labor.projectId)?.name || 'Unknown'}
                          </td>
                          <td className="p-4">{labor.userName}</td>
                          <td className="p-4">{labor.role}</td>
                          <td className="p-4">{labor.hours}</td>
                          <td className="p-4">${labor.rate.toFixed(2)}</td>
                          <td className="p-4 font-medium">
                            ${labor.amount.toLocaleString()}
                          </td>
                          <td className="p-4">
                            {new Date(labor.date).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <Badge variant={labor.isBillable ? 'default' : 'secondary'}>
                              {labor.isBillable ? 'Yes' : 'No'}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="materials" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Material Tracking</h2>
            <Button onClick={() => setShowCreateMaterial(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Material Entry
            </Button>
          </div>

          {materialEntries.length === 0 ? (
            <Alert>
              <Package className="h-4 w-4" />
              <AlertDescription>
                No material entries found. Add material entries to track project materials and costs.
              </AlertDescription>
            </Alert>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left p-4">Project</th>
                        <th className="text-left p-4">Item</th>
                        <th className="text-left p-4">Quantity</th>
                        <th className="text-left p-4">Unit Cost</th>
                        <th className="text-left p-4">Total Cost</th>
                        <th className="text-left p-4">Supplier</th>
                        <th className="text-left p-4">Date</th>
                        <th className="text-left p-4">Billable</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materialEntries.map((material) => (
                        <tr key={material.id} className="border-b">
                          <td className="p-4">
                            {projects.find(p => p.id === material.projectId)?.name || 'Unknown'}
                          </td>
                          <td className="p-4">{material.itemName}</td>
                          <td className="p-4">{material.quantity}</td>
                          <td className="p-4">${material.unitCost.toFixed(2)}</td>
                          <td className="p-4 font-medium">
                            ${material.totalCost.toLocaleString()}
                          </td>
                          <td className="p-4">{material.supplier || '-'}</td>
                          <td className="p-4">
                            {new Date(material.date).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <Badge variant={material.isBillable ? 'default' : 'secondary'}>
                              {material.isBillable ? 'Yes' : 'No'}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Project Modal */}
      {showCreateProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Create New Project</CardTitle>
              <CardDescription>
                Set up a new project for cost tracking and profitability analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="project-name">Project Name</Label>
                  <Input
                    id="project-name"
                    value={newProject.name}
                    onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter project name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client-id">Client</Label>
                  <select
                    id="client-id"
                    value={newProject.clientId}
                    onChange={(e) => setNewProject(prev => ({ ...prev, clientId: e.target.value }))}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select client</option>
                    {/* TODO: Load clients from API */}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={newProject.startDate}
                    onChange={(e) => setNewProject(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date (Optional)</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={newProject.endDate}
                    onChange={(e) => setNewProject(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Budget</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={newProject.budget}
                    onChange={(e) => setNewProject(prev => ({ ...prev, budget: Number(e.target.value) }))}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimated-hours">Estimated Hours</Label>
                  <Input
                    id="estimated-hours"
                    type="number"
                    value={newProject.estimatedHours}
                    onChange={(e) => setNewProject(prev => ({ ...prev, estimatedHours: Number(e.target.value) }))}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hourly-rate">Hourly Rate</Label>
                  <Input
                    id="hourly-rate"
                    type="number"
                    value={newProject.hourlyRate}
                    onChange={(e) => setNewProject(prev => ({ ...prev, hourlyRate: Number(e.target.value) }))}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={newProject.description}
                  onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter project description"
                  className="w-full p-2 border rounded"
                  rows={3}
                />
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleCreateProject} disabled={loading} className="flex-1">
                  {loading ? 'Creating...' : 'Create Project'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateProject(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Expense Modal */}
      {showCreateExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Add Project Expense</CardTitle>
              <CardDescription>
                Track expenses for project cost management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expense-project">Project</Label>
                  <select
                    id="expense-project"
                    value={newExpense.projectId}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, projectId: e.target.value }))}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expense-category">Category</Label>
                  <Input
                    id="expense-category"
                    value={newExpense.category}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g., Materials, Travel, Equipment"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expense-amount">Amount</Label>
                  <Input
                    id="expense-amount"
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, amount: Number(e.target.value) }))}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expense-date">Date</Label>
                  <Input
                    id="expense-date"
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expense-vendor">Vendor (Optional)</Label>
                  <Input
                    id="expense-vendor"
                    value={newExpense.vendor}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, vendor: e.target.value }))}
                    placeholder="Vendor name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expense-billable">Billable</Label>
                  <select
                    id="expense-billable"
                    value={newExpense.isBillable.toString()}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, isBillable: e.target.value === 'true' }))}
                    className="w-full p-2 border rounded"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expense-description">Description</Label>
                <textarea
                  id="expense-description"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter expense description"
                  className="w-full p-2 border rounded"
                  rows={3}
                />
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleCreateExpense} disabled={loading} className="flex-1">
                  {loading ? 'Adding...' : 'Add Expense'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateExpense(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Labor Modal */}
      {showCreateLabor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Add Labor Entry</CardTitle>
              <CardDescription>
                Track labor hours and costs for project management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="labor-project">Project</Label>
                  <select
                    id="labor-project"
                    value={newLabor.projectId}
                    onChange={(e) => setNewLabor(prev => ({ ...prev, projectId: e.target.value }))}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="labor-user">User</Label>
                  <select
                    id="labor-user"
                    value={newLabor.userId}
                    onChange={(e) => setNewLabor(prev => ({ ...prev, userId: e.target.value }))}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select user</option>
                    {/* TODO: Load users from API */}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="labor-role">Role</Label>
                  <Input
                    id="labor-role"
                    value={newLabor.role}
                    onChange={(e) => setNewLabor(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="e.g., Developer, Designer, Manager"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="labor-hours">Hours</Label>
                  <Input
                    id="labor-hours"
                    type="number"
                    value={newLabor.hours}
                    onChange={(e) => setNewLabor(prev => ({ ...prev, hours: Number(e.target.value) }))}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="labor-rate">Rate</Label>
                  <Input
                    id="labor-rate"
                    type="number"
                    value={newLabor.rate}
                    onChange={(e) => setNewLabor(prev => ({ ...prev, rate: Number(e.target.value) }))}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="labor-date">Date</Label>
                  <Input
                    id="labor-date"
                    type="date"
                    value={newLabor.date}
                    onChange={(e) => setNewLabor(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="labor-billable">Billable</Label>
                  <select
                    id="labor-billable"
                    value={newLabor.isBillable.toString()}
                    onChange={(e) => setNewLabor(prev => ({ ...prev, isBillable: e.target.value === 'true' }))}
                    className="w-full p-2 border rounded"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="labor-description">Description</Label>
                <textarea
                  id="labor-description"
                  value={newLabor.description}
                  onChange={(e) => setNewLabor(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter work description"
                  className="w-full p-2 border rounded"
                  rows={3}
                />
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleCreateLabor} disabled={loading} className="flex-1">
                  {loading ? 'Adding...' : 'Add Labor Entry'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateLabor(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Material Modal */}
      {showCreateMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Add Material Entry</CardTitle>
              <CardDescription>
                Track materials and supplies for project cost management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="material-project">Project</Label>
                  <select
                    id="material-project"
                    value={newMaterial.projectId}
                    onChange={(e) => setNewMaterial(prev => ({ ...prev, projectId: e.target.value }))}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="material-item">Item Name</Label>
                  <Input
                    id="material-item"
                    value={newMaterial.itemName}
                    onChange={(e) => setNewMaterial(prev => ({ ...prev, itemName: e.target.value }))}
                    placeholder="Enter item name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="material-quantity">Quantity</Label>
                  <Input
                    id="material-quantity"
                    type="number"
                    value={newMaterial.quantity}
                    onChange={(e) => setNewMaterial(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="material-unit-cost">Unit Cost</Label>
                  <Input
                    id="material-unit-cost"
                    type="number"
                    value={newMaterial.unitCost}
                    onChange={(e) => setNewMaterial(prev => ({ ...prev, unitCost: Number(e.target.value) }))}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="material-supplier">Supplier (Optional)</Label>
                  <Input
                    id="material-supplier"
                    value={newMaterial.supplier}
                    onChange={(e) => setNewMaterial(prev => ({ ...prev, supplier: e.target.value }))}
                    placeholder="Supplier name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="material-date">Date</Label>
                  <Input
                    id="material-date"
                    type="date"
                    value={newMaterial.date}
                    onChange={(e) => setNewMaterial(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="material-billable">Billable</Label>
                  <select
                    id="material-billable"
                    value={newMaterial.isBillable.toString()}
                    onChange={(e) => setNewMaterial(prev => ({ ...prev, isBillable: e.target.value === 'true' }))}
                    className="w-full p-2 border rounded"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="material-description">Description (Optional)</Label>
                <textarea
                  id="material-description"
                  value={newMaterial.description}
                  onChange={(e) => setNewMaterial(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter material description"
                  className="w-full p-2 border rounded"
                  rows={3}
                />
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleCreateMaterial} disabled={loading} className="flex-1">
                  {loading ? 'Adding...' : 'Add Material Entry'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateMaterial(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}