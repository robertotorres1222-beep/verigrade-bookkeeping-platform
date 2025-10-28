'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardDocumentListIcon,
  PlusIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserIcon,
  CalendarIcon,
  TagIcon,
} from '@heroicons/react/24/outline';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  dueDate?: string;
  clientId?: string;
  category?: string;
  tags: string[];
  createdAt: string;
  assignedUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdByUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface TaskManagerProps {
  isOpen: boolean;
  onClose: () => void;
  practiceId?: string;
  clientId?: string;
}

export default function TaskManager({ isOpen, onClose, practiceId, clientId }: TaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState('all');
  const [priority, setPriority] = useState('all');
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as const,
    dueDate: '',
    category: '',
    tags: [] as string[],
  });

  useEffect(() => {
    if (isOpen) {
      fetchTasks();
    }
  }, [isOpen, filter, priority]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      // Mock data for demo
      const mockTasks: Task[] = [
        {
          id: 'task-1',
          title: 'Review Q1 financial statements',
          description: 'Complete review of all Q1 financial statements for TechStart Inc',
          priority: 'HIGH',
          status: 'IN_PROGRESS',
          dueDate: '2024-01-25',
          clientId: 'client-1',
          category: 'Review',
          tags: ['Q1', 'Financial Statements'],
          createdAt: '2024-01-20T09:00:00Z',
          assignedUser: {
            id: 'user-1',
            firstName: 'Sarah',
            lastName: 'Johnson',
            email: 'sarah@verigrade.com',
          },
          createdByUser: {
            id: 'user-2',
            firstName: 'Mike',
            lastName: 'Chen',
            email: 'mike@verigrade.com',
          },
        },
        {
          id: 'task-2',
          title: 'Prepare tax documents',
          description: 'Gather and organize all tax documents for 2023 filing',
          priority: 'URGENT',
          status: 'PENDING',
          dueDate: '2024-01-30',
          clientId: 'client-2',
          category: 'Tax',
          tags: ['2023', 'Tax Filing'],
          createdAt: '2024-01-19T14:30:00Z',
          assignedUser: {
            id: 'user-2',
            firstName: 'Mike',
            lastName: 'Chen',
            email: 'mike@verigrade.com',
          },
          createdByUser: {
            id: 'user-1',
            firstName: 'Sarah',
            lastName: 'Johnson',
            email: 'sarah@verigrade.com',
          },
        },
        {
          id: 'task-3',
          title: 'Bank reconciliation',
          description: 'Reconcile January bank statements for all clients',
          priority: 'MEDIUM',
          status: 'COMPLETED',
          dueDate: '2024-01-22',
          category: 'Reconciliation',
          tags: ['Banking', 'January'],
          createdAt: '2024-01-18T10:15:00Z',
          assignedUser: {
            id: 'user-1',
            firstName: 'Sarah',
            lastName: 'Johnson',
            email: 'sarah@verigrade.com',
          },
          createdByUser: {
            id: 'user-2',
            firstName: 'Mike',
            lastName: 'Chen',
            email: 'mike@verigrade.com',
          },
        },
      ];
      setTasks(mockTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async () => {
    if (!newTask.title.trim()) return;

    try {
      const task: Task = {
        id: `task-${Date.now()}`,
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        status: 'PENDING',
        dueDate: newTask.dueDate,
        category: newTask.category,
        tags: newTask.tags,
        createdAt: new Date().toISOString(),
        assignedUser: {
          id: 'current-user',
          firstName: 'Current',
          lastName: 'User',
          email: 'current@verigrade.com',
        },
        createdByUser: {
          id: 'current-user',
          firstName: 'Current',
          lastName: 'User',
          email: 'current@verigrade.com',
        },
      };

      setTasks(prev => [task, ...prev]);
      setNewTask({
        title: '',
        description: '',
        priority: 'MEDIUM',
        dueDate: '',
        category: '',
        tags: [],
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    try {
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, status }
          : task
      ));
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter !== 'all' && task.status !== filter) return false;
    if (priority !== 'all' && task.priority !== priority) return false;
    return true;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'text-red-600 bg-red-100';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'IN_PROGRESS': return <ClockIcon className="h-5 w-5 text-blue-600" />;
      case 'PENDING': return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />;
      default: return <ClipboardDocumentListIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl border-l border-gray-200 z-50"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <ClipboardDocumentListIcon className="h-5 w-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Task Manager</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 space-y-3">
          <div className="flex space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Tasks</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Task
          </button>
        </div>

        {/* Create Task Form */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 border-b border-gray-200 bg-gray-50"
          >
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Description (optional)"
                value={newTask.description}
                onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={2}
              />
              <div className="flex space-x-2">
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="LOW">Low Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="HIGH">High Priority</option>
                  <option value="URGENT">Urgent</option>
                </select>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={createTask}
                  disabled={!newTask.title.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tasks List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardDocumentListIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No tasks found</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        {getStatusIcon(task.status)}
                        <h4 className="ml-2 text-sm font-medium text-gray-900">{task.title}</h4>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-1" />
                        {task.assignedUser.firstName} {task.assignedUser.lastName}
                      </div>
                      {task.dueDate && (
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    
                    {task.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {task.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full flex items-center"
                          >
                            <TagIcon className="h-3 w-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-3 flex space-x-2">
                      {task.status !== 'COMPLETED' && (
                        <button
                          onClick={() => updateTaskStatus(task.id, 'COMPLETED')}
                          className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                        >
                          Complete
                        </button>
                      )}
                      {task.status === 'PENDING' && (
                        <button
                          onClick={() => updateTaskStatus(task.id, 'IN_PROGRESS')}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                        >
                          Start
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

