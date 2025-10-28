'use client';

import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Info, 
  XCircle,
  User,
  Calendar,
  FileText,
  MessageSquare,
  Settings,
  Database,
  Shield,
  Zap,
  Star
} from 'lucide-react';

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'in-progress' | 'cancelled' | 'warning' | 'info';
  user?: {
    name: string;
    avatar?: string;
    email?: string;
  };
  metadata?: Record<string, any>;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
}

interface TimelineProps {
  items: TimelineItem[];
  showUser?: boolean;
  showTimestamp?: boolean;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

export default function Timeline({
  items,
  showUser = true,
  showTimestamp = true,
  showActions = false,
  compact = false,
  className = ''
}: TimelineProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'in-progress':
        return <Zap className="w-5 h-5 text-blue-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'pending':
        return 'border-yellow-200 bg-yellow-50';
      case 'in-progress':
        return 'border-blue-200 bg-blue-50';
      case 'cancelled':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-orange-200 bg-orange-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
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

  const getActionVariant = (variant?: string) => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 text-white hover:bg-blue-700';
      case 'secondary':
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
      case 'danger':
        return 'bg-red-600 text-white hover:bg-red-700';
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          className="relative"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          {/* Timeline Line */}
          {index < items.length - 1 && (
            <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200" />
          )}

          <div className="flex items-start space-x-4">
            {/* Status Icon */}
            <div className={`flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center ${getStatusColor(item.status)}`}>
              {getStatusIcon(item.status)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                    {item.description && (
                      <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                    )}
                  </div>
                  
                  {showTimestamp && (
                    <div className="flex-shrink-0 ml-4">
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(item.timestamp)}
                      </span>
                    </div>
                  )}
                </div>

                {/* User Info */}
                {showUser && item.user && (
                  <div className="mt-3 flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                      {item.user.avatar ? (
                        <img
                          src={item.user.avatar}
                          alt={item.user.name}
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <User className="w-3 h-3 text-gray-600" />
                      )}
                    </div>
                    <span className="text-sm text-gray-600">{item.user.name}</span>
                    {item.user.email && (
                      <span className="text-xs text-gray-500">({item.user.email})</span>
                    )}
                  </div>
                )}

                {/* Metadata */}
                {item.metadata && Object.keys(item.metadata).length > 0 && (
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(item.metadata).map(([key, value]) => (
                        <span
                          key={key}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                        >
                          <span className="font-medium">{key}:</span>
                          <span className="ml-1">{String(value)}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {showActions && item.actions && item.actions.length > 0 && (
                  <div className="mt-4 flex space-x-2">
                    {item.actions.map((action, actionIndex) => (
                      <button
                        key={actionIndex}
                        onClick={action.onClick}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${getActionVariant(action.variant)}`}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Activity Feed Component
export function ActivityFeed({ 
  activities, 
  showUser = true,
  compact = false 
}: { 
  activities: TimelineItem[];
  showUser?: boolean;
  compact?: boolean;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          View all
        </button>
      </div>
      
      <Timeline
        items={activities}
        showUser={showUser}
        showTimestamp={true}
        compact={compact}
      />
    </div>
  );
}

// Status Timeline Component
export function StatusTimeline({ 
  statuses, 
  currentStatus 
}: { 
  statuses: Array<{
    id: string;
    title: string;
    description: string;
    status: 'completed' | 'pending' | 'current';
  }>;
  currentStatus: string;
}) {
  const timelineItems: TimelineItem[] = statuses.map((status, index) => ({
    id: status.id,
    title: status.title,
    description: status.description,
    timestamp: new Date(),
    status: status.status === 'current' ? 'in-progress' : status.status as any,
    user: undefined
  }));

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Process Status</h3>
      <Timeline
        items={timelineItems}
        showUser={false}
        showTimestamp={false}
        compact={true}
      />
    </div>
  );
}

// Audit Trail Component
export function AuditTrail({ 
  events, 
  showUser = true 
}: { 
  events: TimelineItem[];
  showUser?: boolean;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Audit Trail</h3>
        <div className="flex items-center space-x-2">
          <button className="text-sm text-gray-600 hover:text-gray-700 font-medium">
            Filter
          </button>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Export
          </button>
        </div>
      </div>
      
      <Timeline
        items={events}
        showUser={showUser}
        showTimestamp={true}
        showActions={false}
      />
    </div>
  );
}

