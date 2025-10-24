'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  PlayIcon,
  PauseIcon,
  TrashIcon,
  BookmarkIcon,
  BoltIcon,
  Cog6ToothIcon,
  ClockIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'condition' | 'action' | 'delay';
  name: string;
  config: any;
  position: { x: number; y: number };
  connections: string[];
}

interface WorkflowBuilderProps {
  workflow?: {
    id: string;
    name: string;
    description: string;
    nodes: WorkflowNode[];
  };
  onSave: (workflow: any) => void;
  onCancel: () => void;
}

const nodeTypes = [
  { type: 'trigger', name: 'Trigger', icon: BoltIcon, color: 'blue' },
  { type: 'condition', name: 'Condition', icon: Cog6ToothIcon, color: 'yellow' },
  { type: 'action', name: 'Action', icon: PlayIcon, color: 'green' },
  { type: 'delay', name: 'Delay', icon: ClockIcon, color: 'purple' }
];

const actionTypes = [
  { value: 'send_email', label: 'Send Email' },
  { value: 'update_status', label: 'Update Status' },
  { value: 'assign_task', label: 'Assign Task' },
  { value: 'create_record', label: 'Create Record' },
  { value: 'update_record', label: 'Update Record' },
  { value: 'generate_report', label: 'Generate Report' },
  { value: 'call_webhook', label: 'Call Webhook' },
  { value: 'set_variable', label: 'Set Variable' }
];

const triggerTypes = [
  { value: 'event', label: 'Event Trigger' },
  { value: 'schedule', label: 'Schedule Trigger' },
  { value: 'manual', label: 'Manual Trigger' }
];

export default function WorkflowBuilder({ workflow, onSave, onCancel }: WorkflowBuilderProps) {
  const [nodes, setNodes] = useState<WorkflowNode[]>(workflow?.nodes || []);
  const [connections, setConnections] = useState<Array<{ from: string; to: string }>>([]);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState(workflow?.name || '');
  const [workflowDescription, setWorkflowDescription] = useState(workflow?.description || '');
  const [showNodePalette, setShowNodePalette] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });

  const addNode = (type: string) => {
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type: type as any,
      name: `New ${type}`,
      config: {},
      position: { x: 200, y: 200 },
      connections: []
    };

    setNodes(prev => [...prev, newNode]);
    setSelectedNode(newNode);
    setShowNodePalette(false);
  };

  const updateNode = (nodeId: string, updates: Partial<WorkflowNode>) => {
    setNodes(prev => 
      prev.map(node => 
        node.id === nodeId ? { ...node, ...updates } : node
      )
    );
  };

  const deleteNode = (nodeId: string) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    setConnections(prev => prev.filter(conn => conn.from !== nodeId && conn.to !== nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  };

  const startConnection = (nodeId: string) => {
    setIsConnecting(true);
    setConnectionStart(nodeId);
  };

  const endConnection = (nodeId: string) => {
    if (isConnecting && connectionStart && connectionStart !== nodeId) {
      const newConnection = { from: connectionStart, to: nodeId };
      setConnections(prev => [...prev, newConnection]);
      
      // Update node connections
      setNodes(prev => 
        prev.map(node => 
          node.id === connectionStart 
            ? { ...node, connections: [...node.connections, nodeId] }
            : node
        )
      );
    }
    setIsConnecting(false);
    setConnectionStart(null);
  };

  const deleteConnection = (from: string, to: string) => {
    setConnections(prev => prev.filter(conn => !(conn.from === from && conn.to === to)));
    setNodes(prev => 
      prev.map(node => 
        node.id === from 
          ? { ...node, connections: node.connections.filter(id => id !== to) }
          : node
      )
    );
  };

  const handleNodeDrag = (nodeId: string, position: { x: number; y: number }) => {
    updateNode(nodeId, { position });
  };

  const getNodeIcon = (type: string) => {
    const nodeType = nodeTypes.find(nt => nt.type === type);
    return nodeType ? nodeType.icon : DocumentTextIcon;
  };

  const getNodeColor = (type: string) => {
    const nodeType = nodeTypes.find(nt => nt.type === type);
    return nodeType ? nodeType.color : 'gray';
  };

  const validateWorkflow = () => {
    const errors: string[] = [];
    
    if (!workflowName.trim()) {
      errors.push('Workflow name is required');
    }
    
    if (nodes.length === 0) {
      errors.push('Workflow must have at least one node');
    }
    
    const triggerNodes = nodes.filter(node => node.type === 'trigger');
    if (triggerNodes.length === 0) {
      errors.push('Workflow must have at least one trigger node');
    }
    
    const orphanedNodes = nodes.filter(node => 
      node.type !== 'trigger' && 
      !connections.some(conn => conn.to === node.id)
    );
    
    if (orphanedNodes.length > 0) {
      errors.push('All nodes must be connected to the workflow');
    }
    
    return errors;
  };

  const handleSave = () => {
    const errors = validateWorkflow();
    if (errors.length > 0) {
      alert(`Please fix the following errors:\n${errors.join('\n')}`);
      return;
    }

    onSave({
      name: workflowName,
      description: workflowDescription,
      nodes: nodes.map(node => ({
        ...node,
        connections: connections
          .filter(conn => conn.from === node.id)
          .map(conn => conn.to)
      }))
    });
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">Workflow Builder</h2>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Workflow name"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Description"
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowNodePalette(true)}
              className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Node
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <BookmarkIcon className="h-4 w-4 mr-1" />
              Save
            </button>
            <button
              onClick={onCancel}
              className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Node Palette */}
        <AnimatePresence>
          {showNodePalette && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-64 bg-white border-r border-gray-200 p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add Node</h3>
                <button
                  onClick={() => setShowNodePalette(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-2">
                {nodeTypes.map((nodeType) => {
                  const Icon = nodeType.icon;
                  return (
                    <button
                      key={nodeType.type}
                      onClick={() => addNode(nodeType.type)}
                      className="w-full flex items-center space-x-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <Icon className={`h-5 w-5 text-${nodeType.color}-500`} />
                      <span className="text-sm font-medium text-gray-900">{nodeType.name}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <div
            ref={canvasRef}
            className="w-full h-full bg-gray-50 relative"
            style={{ backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px' }}
          >
            {/* Nodes */}
            {nodes.map((node) => {
              const Icon = getNodeIcon(node.type);
              const color = getNodeColor(node.type);
              
              return (
                <motion.div
                  key={node.id}
                  className={`absolute bg-white border-2 rounded-lg shadow-sm cursor-move ${
                    selectedNode?.id === node.id ? 'border-blue-500' : 'border-gray-200'
                  }`}
                  style={{
                    left: node.position.x,
                    top: node.position.y,
                    width: 200,
                    height: 80
                  }}
                  drag
                  onDragEnd={(_, info) => {
                    handleNodeDrag(node.id, {
                      x: node.position.x + info.offset.x,
                      y: node.position.y + info.offset.y
                    });
                  }}
                  onClick={() => setSelectedNode(node)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Icon className={`h-5 w-5 text-${color}-500`} />
                      <span className="text-sm font-medium text-gray-900">{node.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 capitalize">{node.type}</span>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startConnection(node.id);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <ArrowRightIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNode(node.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Connections */}
            <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
              {connections.map((connection, index) => {
                const fromNode = nodes.find(n => n.id === connection.from);
                const toNode = nodes.find(n => n.id === connection.to);
                
                if (!fromNode || !toNode) return null;
                
                const startX = fromNode.position.x + 200;
                const startY = fromNode.position.y + 40;
                const endX = toNode.position.x;
                const endY = toNode.position.y + 40;
                
                return (
                  <g key={index}>
                    <path
                      d={`M ${startX} ${startY} Q ${(startX + endX) / 2} ${startY - 20} ${endX} ${endY}`}
                      stroke="#6b7280"
                      strokeWidth="2"
                      fill="none"
                      markerEnd="url(#arrowhead)"
                    />
                    <circle
                      cx={endX}
                      cy={endY}
                      r="4"
                      fill="#6b7280"
                      onClick={() => deleteConnection(connection.from, connection.to)}
                      className="cursor-pointer hover:fill-red-500"
                    />
                  </g>
                );
              })}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill="#6b7280"
                  />
                </marker>
              </defs>
            </svg>
          </div>
        </div>

        {/* Node Properties Panel */}
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 bg-white border-l border-gray-200 p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Node Properties</h3>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Node Name
                </label>
                <input
                  type="text"
                  value={selectedNode.name}
                  onChange={(e) => updateNode(selectedNode.id, { name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {selectedNode.type === 'trigger' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trigger Type
                  </label>
                  <select
                    value={selectedNode.config.triggerType || ''}
                    onChange={(e) => updateNode(selectedNode.id, { 
                      config: { ...selectedNode.config, triggerType: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select trigger type</option>
                    {triggerTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedNode.type === 'action' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Action Type
                  </label>
                  <select
                    value={selectedNode.config.actionType || ''}
                    onChange={(e) => updateNode(selectedNode.id, { 
                      config: { ...selectedNode.config, actionType: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select action type</option>
                    {actionTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedNode.type === 'condition' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Field
                    </label>
                    <input
                      type="text"
                      value={selectedNode.config.field || ''}
                      onChange={(e) => updateNode(selectedNode.id, { 
                        config: { ...selectedNode.config, field: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., amount, status"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Operator
                    </label>
                    <select
                      value={selectedNode.config.operator || ''}
                      onChange={(e) => updateNode(selectedNode.id, { 
                        config: { ...selectedNode.config, operator: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select operator</option>
                      <option value="equals">Equals</option>
                      <option value="not_equals">Not Equals</option>
                      <option value="greater_than">Greater Than</option>
                      <option value="less_than">Less Than</option>
                      <option value="contains">Contains</option>
                      <option value="is_empty">Is Empty</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Value
                    </label>
                    <input
                      type="text"
                      value={selectedNode.config.value || ''}
                      onChange={(e) => updateNode(selectedNode.id, { 
                        config: { ...selectedNode.config, value: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 1000, approved"
                    />
                  </div>
                </div>
              )}

              {selectedNode.type === 'delay' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delay Duration
                  </label>
                  <input
                    type="text"
                    value={selectedNode.config.delay || ''}
                    onChange={(e) => updateNode(selectedNode.id, { 
                      config: { ...selectedNode.config, delay: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 5m, 1h, 30s"
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
