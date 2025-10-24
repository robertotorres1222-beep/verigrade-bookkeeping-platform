'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Calendar, 
  FileText, 
  MessageSquare, 
  Settings, 
  Database,
  Shield,
  Zap,
  Star,
  CheckCircle,
  AlertCircle,
  Info,
  Clock,
  XCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'user' | 'system' | 'data' | 'notification' | 'error' | 'success' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: Date;
  user?: {
    name: string;
    avatar?: string;
    email?: string;
  };
  metadata?: {
    action?: string;
    resource?: string;
    value?: string | number;
    status?: string;
    [key: string]: any;
  };
  priority?: 'low' | 'medium' | 'high' | 'critical';
  read?: boolean;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  showFilters?: boolean;
  showUser?: boolean;
  showTimestamp?: boolean;
  maxItems?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onFilter?: (filter: string) => void;
  className?: string;
}

export default function ActivityFeed({
  activities,
  showFilters = true,
  showUser = true,
  showTimestamp = true,
  maxItems = 50,
  autoRefresh = false,
  refreshInterval = 30000,
  onMarkAsRead,
  onMarkAllAsRead,
  onFilter,
  className = ''
}: ActivityFeedProps) {
  const [filteredActivities, setFilteredActivities] = useState<ActivityItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter activities
  useEffect(() => {
    let filtered = [...activities];

    if (activeFilter !== 'all') {
      filtered = filtered.filter(activity => activity.type === activeFilter);
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Limit items
    filtered = filtered.slice(0, maxItems);

    setFilteredActivities(filtered);
  }, [activities, activeFilter, maxItems]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setIsRefreshing(true);
      // Simulate refresh
      setTimeout(() => setIsRefreshing(false), 1000);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <User className="w-4 h-4" />;
      case 'system':
        return <Settings className="w-4 h-4" />;
      case 'data':
        return <Database className="w-4 h-4" />;
      case 'notification':
        return <MessageSquare className="w-4 h-4" />;
      case 'error':
        return <XCircle className="w-4 h-4" />;
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4" />;
      case 'info':
        return <Info className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string, priority?: string) => {
    if (priority === 'critical') return 'text-red-600 bg-red-50 border-red-200';
    if (priority === 'high') return 'text-orange-600 bg-orange-50 border-orange-200';
    if (priority === 'medium') return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (priority === 'low') return 'text-green-600 bg-green-50 border-green-200';

    switch (type) {
      case 'user':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'system':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'data':
        return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      case 'notification':
        return 'text-cyan-600 bg-cyan-50 border-cyan-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    onFilter?.(filter);
  };

  const handleMarkAsRead = (id: string) => {
    onMarkAsRead?.(id);
  };

  const handleMarkAllAsRead = () => {
    onMarkAllAsRead?.();
  };

  const getFilterCount = (filter: string) => {
    if (filter === 'all') return activities.length;
    return activities.filter(activity => activity.type === filter).length;
  };

  const unreadCount = activities.filter(activity => !activity.read).length;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Activity className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Activity Feed</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {isRefreshing && (
            <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          )}
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All' },
              { key: 'user', label: 'User' },
              { key: 'system', label: 'System' },
              { key: 'data', label: 'Data' },
              { key: 'notification', label: 'Notifications' },
              { key: 'error', label: 'Errors' },
              { key: 'success', label: 'Success' },
              { key: 'warning', label: 'Warnings' },
              { key: 'info', label: 'Info' }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => handleFilterChange(filter.key)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === filter.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {filter.label} ({getFilterCount(filter.key)})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Activities */}
      <div className="max-h-96 overflow-y-auto">
        <AnimatePresence>
          {filteredActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                !activity.read ? 'bg-blue-50/30' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                {/* Icon */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center ${getActivityColor(activity.type, activity.priority)}`}>
                  {getActivityIcon(activity.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                      <p className="mt-1 text-sm text-gray-600">{activity.description}</p>
                      
                      {/* Metadata */}
                      {activity.metadata && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {Object.entries(activity.metadata).map(([key, value]) => (
                            <span
                              key={key}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                            >
                              <span className="font-medium">{key}:</span>
                              <span className="ml-1">{String(value)}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {showTimestamp && (
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(activity.timestamp)}
                        </span>
                      )}
                      {!activity.read && (
                        <button
                          onClick={() => handleMarkAsRead(activity.id)}
                          className="w-2 h-2 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
                          title="Mark as read"
                        />
                      )}
                    </div>
                  </div>

                  {/* User Info */}
                  {showUser && activity.user && (
                    <div className="mt-2 flex items-center space-x-2">
                      <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                        {activity.user.avatar ? (
                          <img
                            src={activity.user.avatar}
                            alt={activity.user.name}
                            className="w-5 h-5 rounded-full"
                          />
                        ) : (
                          <User className="w-3 h-3 text-gray-600" />
                        )}
                      </div>
                      <span className="text-xs text-gray-600">{activity.user.name}</span>
                      {activity.user.email && (
                        <span className="text-xs text-gray-500">({activity.user.email})</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredActivities.length === 0 && (
          <div className="p-8 text-center">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
            <p className="text-gray-500">Try adjusting your filters to see more activities.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Real-time Activity Feed
export function RealTimeActivityFeed({ 
  activities, 
  onNewActivity 
}: { 
  activities: ActivityItem[];
  onNewActivity?: (activity: ActivityItem) => void;
}) {
  return (
    <ActivityFeed
      activities={activities}
      showFilters={true}
      showUser={true}
      showTimestamp={true}
      autoRefresh={true}
      refreshInterval={5000}
      maxItems={100}
    />
  );
}

// Notification Feed
export function NotificationFeed({ 
  notifications, 
  onMarkAsRead, 
  onMarkAllAsRead 
}: { 
  notifications: ActivityItem[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
}) {
  return (
    <ActivityFeed
      activities={notifications}
      showFilters={false}
      showUser={true}
      showTimestamp={true}
      maxItems={20}
      onMarkAsRead={onMarkAsRead}
      onMarkAllAsRead={onMarkAllAsRead}
    />
  );
}

