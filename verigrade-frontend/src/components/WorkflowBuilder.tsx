import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause, 
  Square, 
  Save, 
  Download, 
  Upload, 
  Settings, 
  Plus, 
  Trash2, 
  Edit, 
  Copy, 
  Move, 
  RotateCw, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Grid, 
  Layers, 
  Search, 
  Filter, 
  SortAsc, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Share, 
  MoreHorizontal,
  Workflow,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Info,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  ArrowLeft,
  Circle,
  Square as SquareIcon,
  Triangle,
  Hexagon,
  Star,
  Heart,
  Tag,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  DollarSign,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  File,
  Folder,
  Database,
  Server,
  Cloud,
  Wifi,
  WifiOff,
  Signal,
  SignalZero,
  SignalOne,
  SignalTwo,
  SignalThree,
  SignalFour,
  SignalFive,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay' | 'webhook' | 'email' | 'sms' | 'notification' | 'data' | 'api' | 'database' | 'file' | 'custom';
  title: string;
  description: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  icon: string;
  status: 'idle' | 'running' | 'completed' | 'error' | 'paused';
  inputs: WorkflowNodeInput[];
  outputs: WorkflowNodeOutput[];
  config: Record<string, any>;
  isSelected: boolean;
  isLocked: boolean;
  isVisible: boolean;
}

interface WorkflowNodeInput {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'file' | 'object' | 'array';
  required: boolean;
  defaultValue?: any;
  description: string;
}

interface WorkflowNodeOutput {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'file' | 'object' | 'array';
  description: string;
}

interface WorkflowConnection {
  id: string;
  sourceNodeId: string;
  sourceOutputId: string;
  targetNodeId: string;
  targetInputId: string;
  type: 'success' | 'error' | 'data' | 'conditional';
  label?: string;
  isActive: boolean;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  createdAt: string;
  updatedAt: string;
  author: string;
  isPublic: boolean;
  isTemplate: boolean;
}

interface WorkflowBuilderProps {
  workflowId?: string;
  onSave: (workflow: WorkflowTemplate) => void;
  onRun: (workflow: WorkflowTemplate) => void;
  onStop: (workflow: WorkflowTemplate) => void;
  onTest: (workflow: WorkflowTemplate) => void;
  className?: string;
}

export function WorkflowBuilder({
  workflowId,
  onSave,
  onRun,
  onStop,
  onTest,
  className
}: WorkflowBuilderProps) {
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [connections, setConnections] = useState<WorkflowConnection[]>([]);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [selectedConnections, setSelectedConnections] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connectionStart, setConnectionStart] = useState<{ nodeId: string; outputId: string } | null>(null);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showLayers, setShowLayers] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'status' | 'created'>('name');
  const [viewMode, setViewMode] = useState<'design' | 'code' | 'preview'>('design');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Node templates
  const nodeTemplates = [
    {
      type: 'trigger',
      title: 'Webhook Trigger',
      description: 'Trigger workflow when webhook is called',
      icon: 'Zap',
      color: 'bg-blue-500',
      inputs: [],
      outputs: [
        { id: 'data', name: 'Data', type: 'object', description: 'Webhook payload data' }
      ]
    },
    {
      type: 'trigger',
      title: 'Schedule Trigger',
      description: 'Trigger workflow on schedule',
      icon: 'Clock',
      color: 'bg-green-500',
      inputs: [],
      outputs: [
        { id: 'time', name: 'Time', type: 'date', description: 'Current time' }
      ]
    },
    {
      type: 'action',
      title: 'Send Email',
      description: 'Send email notification',
      icon: 'Mail',
      color: 'bg-purple-500',
      inputs: [
        { id: 'to', name: 'To', type: 'string', required: true, description: 'Recipient email' },
        { id: 'subject', name: 'Subject', type: 'string', required: true, description: 'Email subject' },
        { id: 'body', name: 'Body', type: 'string', required: true, description: 'Email body' }
      ],
      outputs: [
        { id: 'success', name: 'Success', type: 'boolean', description: 'Email sent successfully' }
      ]
    },
    {
      type: 'action',
      title: 'Create Record',
      description: 'Create new database record',
      icon: 'Database',
      color: 'bg-orange-500',
      inputs: [
        { id: 'table', name: 'Table', type: 'string', required: true, description: 'Table name' },
        { id: 'data', name: 'Data', type: 'object', required: true, description: 'Record data' }
      ],
      outputs: [
        { id: 'record', name: 'Record', type: 'object', description: 'Created record' }
      ]
    },
    {
      type: 'condition',
      title: 'If Condition',
      description: 'Conditional logic branch',
      icon: 'Triangle',
      color: 'bg-yellow-500',
      inputs: [
        { id: 'condition', name: 'Condition', type: 'boolean', required: true, description: 'Condition to evaluate' }
      ],
      outputs: [
        { id: 'true', name: 'True', type: 'boolean', description: 'Condition is true' },
        { id: 'false', name: 'False', type: 'boolean', description: 'Condition is false' }
      ]
    },
    {
      type: 'delay',
      title: 'Wait',
      description: 'Wait for specified time',
      icon: 'Clock',
      color: 'bg-gray-500',
      inputs: [
        { id: 'duration', name: 'Duration', type: 'number', required: true, description: 'Wait duration in seconds' }
      ],
      outputs: [
        { id: 'completed', name: 'Completed', type: 'boolean', description: 'Wait completed' }
      ]
    }
  ];

  // Handle node creation
  const handleNodeCreate = (template: any) => {
    const newNode: WorkflowNode = {
      id: `node_${Date.now()}`,
      type: template.type,
      title: template.title,
      description: template.description,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      width: 200,
      height: 100,
      color: template.color,
      icon: template.icon,
      status: 'idle',
      inputs: template.inputs,
      outputs: template.outputs,
      config: {},
      isSelected: false,
      isLocked: false,
      isVisible: true
    };
    setNodes(prev => [...prev, newNode]);
  };

  // Handle node selection
  const handleNodeSelect = (nodeId: string, multiSelect: boolean = false) => {
    if (multiSelect) {
      setSelectedNodes(prev => 
        prev.includes(nodeId) 
          ? prev.filter(id => id !== nodeId)
          : [...prev, nodeId]
      );
    } else {
      setSelectedNodes([nodeId]);
    }
  };

  // Handle node deletion
  const handleNodeDelete = (nodeId: string) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    setConnections(prev => prev.filter(conn => 
      conn.sourceNodeId !== nodeId && conn.targetNodeId !== nodeId
    ));
    setSelectedNodes(prev => prev.filter(id => id !== nodeId));
  };

  // Handle connection creation
  const handleConnectionStart = (nodeId: string, outputId: string) => {
    setIsConnecting(true);
    setConnectionStart({ nodeId, outputId });
  };

  const handleConnectionEnd = (nodeId: string, inputId: string) => {
    if (isConnecting && connectionStart) {
      const newConnection: WorkflowConnection = {
        id: `conn_${Date.now()}`,
        sourceNodeId: connectionStart.nodeId,
        sourceOutputId: connectionStart.outputId,
        targetNodeId: nodeId,
        targetInputId: inputId,
        type: 'data',
        isActive: true
      };
      setConnections(prev => [...prev, newConnection]);
    }
    setIsConnecting(false);
    setConnectionStart(null);
  };

  // Handle workflow run
  const handleRun = () => {
    setIsRunning(true);
    setIsPaused(false);
    // Mock workflow execution
    setTimeout(() => {
      setIsRunning(false);
    }, 3000);
  };

  // Handle workflow stop
  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
  };

  // Handle workflow pause
  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  // Handle zoom
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  // Handle pan
  const handlePanStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handlePanMove = (e: React.MouseEvent) => {
    if (isDragging && dragStart) {
      setPanX(e.clientX - dragStart.x);
      setPanY(e.clientY - dragStart.y);
    }
  };

  const handlePanEnd = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  // Get node icon
  const getNodeIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      Zap,
      Clock,
      Mail,
      Database,
      Triangle,
      Circle,
      Square: SquareIcon,
      Star,
      Heart,
      Tag,
      Calendar,
      User,
      Phone,
      MapPin,
      CreditCard,
      DollarSign,
      FileText,
      Image,
      Video,
      Music,
      Archive,
      File,
      Folder,
      Server,
      Cloud,
      Wifi,
      Signal
    };
    const IconComponent = icons[iconName] || Circle;
    return <IconComponent className="h-4 w-4" />;
  };

  // Get node status icon
  const getNodeStatusIcon = (status: WorkflowNode['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  // Filter nodes
  const filteredNodes = nodes.filter(node => {
    const matchesSearch = node.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || node.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className={cn("flex h-full bg-background", className)}>
      {/* Sidebar */}
      <div className="w-80 border-r bg-muted/50 flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 mb-4">
            <Button size="sm" onClick={handleRun} disabled={isRunning}>
              <Play className="h-4 w-4 mr-2" />
              {isRunning ? 'Running' : 'Run'}
            </Button>
            <Button size="sm" variant="outline" onClick={handlePause} disabled={!isRunning}>
              <Pause className="h-4 w-4 mr-2" />
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
            <Button size="sm" variant="outline" onClick={handleStop} disabled={!isRunning}>
              <Square className="h-4 w-4 mr-2" />
              Stop
            </Button>
          </div>
          <Input
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />
        </div>

        <Tabs defaultValue="nodes" className="flex-1">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="nodes">Nodes</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="nodes" className="flex-1 p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="flex-1 px-3 py-1 text-sm border rounded-md"
                >
                  <option value="all">All Types</option>
                  <option value="trigger">Triggers</option>
                  <option value="action">Actions</option>
                  <option value="condition">Conditions</option>
                  <option value="delay">Delays</option>
                </select>
              </div>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {filteredNodes.map(node => (
                  <Card
                    key={node.id}
                    className={cn(
                      "cursor-pointer transition-colors",
                      selectedNodes.includes(node.id) && "ring-2 ring-primary"
                    )}
                    onClick={() => handleNodeSelect(node.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <div className={cn("p-1 rounded", node.color)}>
                          {getNodeIcon(node.icon)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{node.title}</div>
                          <div className="text-xs text-muted-foreground truncate">{node.description}</div>
                        </div>
                        <div className="flex items-center gap-1">
                          {getNodeStatusIcon(node.status)}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNodeDelete(node.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="flex-1 p-4">
            <div className="space-y-2">
              {nodeTemplates.map((template, index) => (
                <Card
                  key={index}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleNodeCreate(template)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <div className={cn("p-1 rounded", template.color)}>
                        {getNodeIcon(template.icon)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{template.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{template.description}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">{Math.round(zoom * 100)}%</span>
              <Button variant="outline" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant={showGrid ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowGrid(!showGrid)}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={showLayers ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowLayers(!showLayers)}
              >
                <Layers className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div
          ref={containerRef}
          className="flex-1 overflow-auto relative"
          onMouseDown={handlePanStart}
          onMouseMove={handlePanMove}
          onMouseUp={handlePanEnd}
          onMouseLeave={handlePanEnd}
        >
          <div
            ref={canvasRef}
            className="relative"
            style={{
              transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
              transformOrigin: '0 0'
            }}
          >
            {/* Grid */}
            {showGrid && (
              <div className="absolute inset-0 opacity-20">
                <svg width="100%" height="100%">
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>
            )}

            {/* Connections */}
            <svg className="absolute inset-0 pointer-events-none">
              {connections.map(connection => {
                const sourceNode = nodes.find(n => n.id === connection.sourceNodeId);
                const targetNode = nodes.find(n => n.id === connection.targetNodeId);
                if (!sourceNode || !targetNode) return null;

                const startX = sourceNode.x + sourceNode.width;
                const startY = sourceNode.y + sourceNode.height / 2;
                const endX = targetNode.x;
                const endY = targetNode.y + targetNode.height / 2;

                return (
                  <path
                    key={connection.id}
                    d={`M ${startX} ${startY} Q ${(startX + endX) / 2} ${startY} ${(startX + endX) / 2} ${(startY + endY) / 2} Q ${(startX + endX) / 2} ${endY} ${endX} ${endY}`}
                    stroke={connection.isActive ? '#3b82f6' : '#6b7280'}
                    strokeWidth="2"
                    fill="none"
                    className="pointer-events-auto"
                  />
                );
              })}
            </svg>

            {/* Nodes */}
            {nodes.map(node => (
              <Card
                key={node.id}
                className={cn(
                  "absolute cursor-pointer transition-all",
                  selectedNodes.includes(node.id) && "ring-2 ring-primary",
                  node.status === 'running' && "animate-pulse",
                  node.status === 'error' && "ring-2 ring-red-500"
                )}
                style={{
                  left: node.x,
                  top: node.y,
                  width: node.width,
                  height: node.height
                }}
                onClick={() => handleNodeSelect(node.id)}
              >
                <CardHeader className="p-3 pb-2">
                  <div className="flex items-center gap-2">
                    <div className={cn("p-1 rounded", node.color)}>
                      {getNodeIcon(node.icon)}
                    </div>
                    <CardTitle className="text-sm truncate">{node.title}</CardTitle>
                    <div className="ml-auto flex items-center gap-1">
                      {getNodeStatusIcon(node.status)}
                      {node.isLocked && <Lock className="h-3 w-3" />}
                      {!node.isVisible && <EyeOff className="h-3 w-3" />}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    {node.description}
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {node.inputs.map(input => (
                      <div
                        key={input.id}
                        className="w-2 h-2 bg-blue-500 rounded-full cursor-pointer"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleConnectionEnd(node.id, input.id);
                        }}
                      />
                    ))}
                    {node.outputs.map(output => (
                      <div
                        key={output.id}
                        className="w-2 h-2 bg-green-500 rounded-full cursor-pointer"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleConnectionStart(node.id, output.id);
                        }}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

