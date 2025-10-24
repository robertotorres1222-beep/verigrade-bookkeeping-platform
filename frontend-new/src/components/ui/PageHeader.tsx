'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  Home, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Plus, 
  Settings, 
  MoreHorizontal,
  Bell,
  User,
  HelpCircle,
  Bookmark,
  Star,
  Share,
  Edit,
  Trash,
  Copy,
  Archive,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  Tag,
  Users,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Zap,
  Target,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface Action {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  badge?: string | number;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: Action[];
  showBackButton?: boolean;
  onBack?: () => void;
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  showFilters?: boolean;
  filters?: Array<{
    key: string;
    label: string;
    type: 'select' | 'date' | 'text';
    options?: Array<{ value: string; label: string }>;
    value?: any;
    onChange?: (value: any) => void;
  }>;
  showStats?: boolean;
  stats?: Array<{
    label: string;
    value: string | number;
    change?: number;
    trend?: 'up' | 'down' | 'neutral';
  }>;
  showTabs?: boolean;
  tabs?: Array<{
    id: string;
    label: string;
    count?: number;
    active?: boolean;
    onClick?: () => void;
  }>;
  showViewToggle?: boolean;
  viewMode?: 'grid' | 'list' | 'table';
  onViewModeChange?: (mode: 'grid' | 'list' | 'table') => void;
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  description,
  breadcrumbs,
  actions = [],
  showBackButton = false,
  onBack,
  showSearch = false,
  searchPlaceholder = 'Search...',
  onSearch,
  showFilters = false,
  filters = [],
  showStats = false,
  stats = [],
  showTabs = false,
  tabs = [],
  showViewToggle = false,
  viewMode = 'grid',
  onViewModeChange,
  className = ''
}: PageHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const getActionVariant = (variant?: string) => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 text-white hover:bg-blue-700';
      case 'secondary':
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
      case 'danger':
        return 'bg-red-600 text-white hover:bg-red-700';
      case 'ghost':
        return 'text-gray-600 hover:bg-gray-100';
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend?: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`bg-white border-b border-gray-200 ${className}`}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="px-6 py-3 border-b border-gray-100">
          <nav className="flex items-center space-x-2 text-sm">
            <button
              onClick={onBack}
              className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>
            
            {breadcrumbs.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <ChevronDown className="w-4 h-4 text-gray-400 rotate-[-90deg]" />
                {item.href ? (
                  <a
                    href={item.href}
                    className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {item.icon && <span>{item.icon}</span>}
                    <span>{item.label}</span>
                  </a>
                ) : (
                  <span className="flex items-center space-x-1 text-gray-900">
                    {item.icon && <span>{item.icon}</span>}
                    <span>{item.label}</span>
                  </span>
                )}
              </div>
            ))}
          </nav>
        </div>
      )}

      {/* Main Header */}
      <div className="px-6 py-6">
        <div className="flex items-start justify-between">
          {/* Title Section */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-4">
              {showBackButton && (
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
              )}
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                {subtitle && (
                  <p className="mt-1 text-lg text-gray-600">{subtitle}</p>
                )}
                {description && (
                  <p className="mt-2 text-sm text-gray-500">{description}</p>
                )}
              </div>
            </div>

            {/* Stats */}
            {showStats && stats.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(stat.trend)}
                      <span className={`text-sm font-medium ${getTrendColor(stat.trend)}`}>
                        {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">{stat.label}</span>
                    {stat.change !== undefined && (
                      <span className={`text-xs ${getTrendColor(stat.trend)}`}>
                        {stat.change > 0 ? '+' : ''}{stat.change}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Search */}
            {showSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
            )}

            {/* Filters */}
            {showFilters && filters.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowFiltersDropdown(!showFiltersDropdown)}
                  className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                  {showFiltersDropdown ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                <AnimatePresence>
                  {showFiltersDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
                    >
                      <div className="p-4 space-y-4">
                        {filters.map((filter) => (
                          <div key={filter.key}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {filter.label}
                            </label>
                            {filter.type === 'select' && filter.options ? (
                              <select
                                value={filter.value || ''}
                                onChange={(e) => filter.onChange?.(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="">All</option>
                                {filter.options.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            ) : filter.type === 'date' ? (
                              <input
                                type="date"
                                value={filter.value || ''}
                                onChange={(e) => filter.onChange?.(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            ) : (
                              <input
                                type="text"
                                value={filter.value || ''}
                                onChange={(e) => filter.onChange?.(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* View Toggle */}
            {showViewToggle && (
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => onViewModeChange?.('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onViewModeChange?.('list')}
                  className={`p-2 border-l border-gray-300 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Activity className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onViewModeChange?.('table')}
                  className={`p-2 border-l border-gray-300 ${viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <PieChart className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Primary Actions */}
            {actions.slice(0, 3).map((action) => (
              <button
                key={action.id}
                onClick={action.onClick}
                disabled={action.disabled || action.loading}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${getActionVariant(action.variant)} ${
                  action.disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {action.loading ? (
                  <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                ) : (
                  action.icon && <span>{action.icon}</span>
                )}
                <span>{action.label}</span>
                {action.badge && (
                  <span className="px-2 py-1 text-xs font-medium bg-white/20 rounded-full">
                    {action.badge}
                  </span>
                )}
              </button>
            ))}

            {/* More Actions */}
            {actions.length > 3 && (
              <div className="relative">
                <button
                  onClick={() => setShowActionsDropdown(!showActionsDropdown)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MoreHorizontal className="w-5 h-5 text-gray-600" />
                </button>

                <AnimatePresence>
                  {showActionsDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
                    >
                      <div className="py-2">
                        {actions.slice(3).map((action) => (
                          <button
                            key={action.id}
                            onClick={() => {
                              action.onClick();
                              setShowActionsDropdown(false);
                            }}
                            disabled={action.disabled}
                            className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {action.icon && <span>{action.icon}</span>}
                            <span>{action.label}</span>
                            {action.badge && (
                              <span className="ml-auto px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                                {action.badge}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        {showTabs && tabs.length > 0 && (
          <div className="mt-6 border-b border-gray-200">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={tab.onClick}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    tab.active
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="ml-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}

// Predefined page header variants
export function DashboardHeader({ 
  title, 
  stats, 
  actions 
}: { 
  title: string; 
  stats: Array<{ label: string; value: string | number; change?: number; trend?: 'up' | 'down' | 'neutral' }>;
  actions: Action[];
}) {
  return (
    <PageHeader
      title={title}
      showStats={true}
      stats={stats}
      actions={actions}
      showSearch={true}
      showFilters={true}
      showViewToggle={true}
    />
  );
}

export function DetailHeader({ 
  title, 
  subtitle, 
  breadcrumbs, 
  actions 
}: { 
  title: string; 
  subtitle?: string; 
  breadcrumbs: BreadcrumbItem[];
  actions: Action[];
}) {
  return (
    <PageHeader
      title={title}
      subtitle={subtitle}
      breadcrumbs={breadcrumbs}
      actions={actions}
      showBackButton={true}
    />
  );
}

export function ListHeader({ 
  title, 
  description, 
  actions, 
  tabs 
}: { 
  title: string; 
  description?: string; 
  actions: Action[];
  tabs: Array<{ id: string; label: string; count?: number; active?: boolean; onClick?: () => void; }>;
}) {
  return (
    <PageHeader
      title={title}
      description={description}
      actions={actions}
      showTabs={true}
      tabs={tabs}
      showSearch={true}
      showFilters={true}
      showViewToggle={true}
    />
  );
}

