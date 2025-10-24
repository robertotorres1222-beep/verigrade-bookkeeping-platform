'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Home,
  BarChart3,
  Users,
  Settings,
  FileText,
  Calendar,
  MessageSquare,
  Bell,
  Search,
  User,
  LogOut,
  ChevronDown,
  ChevronUp,
  Star,
  Bookmark,
  History,
  HelpCircle,
  Shield,
  Zap,
  Database,
  Globe,
  Mail,
  Phone,
  MapPin,
  Clock,
  DollarSign,
  TrendingUp,
  Target,
  Award,
  Activity
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  badge?: string | number;
  children?: SidebarItem[];
  onClick?: () => void;
  disabled?: boolean;
  hidden?: boolean;
}

interface SidebarProps {
  items: SidebarItem[];
  isOpen: boolean;
  onToggle: () => void;
  onItemClick?: (item: SidebarItem) => void;
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role?: string;
  };
  showUserMenu?: boolean;
  onLogout?: () => void;
  className?: string;
}

export default function Sidebar({
  items,
  isOpen,
  onToggle,
  onItemClick,
  user,
  showUserMenu = true,
  onLogout,
  className = ''
}: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [activeItem, setActiveItem] = useState<string>('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // Auto-collapse on mobile
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleItemClick = (item: SidebarItem) => {
    if (item.children && item.children.length > 0) {
      toggleExpanded(item.id);
    } else {
      setActiveItem(item.id);
      onItemClick?.(item);
    }
  };

  const renderSidebarItem = (item: SidebarItem, level = 0) => {
    const isExpanded = expandedItems.has(item.id);
    const isActive = activeItem === item.id;
    const hasChildren = item.children && item.children.length > 0;

    if (item.hidden) return null;

    return (
      <div key={item.id}>
        <motion.button
          onClick={() => handleItemClick(item)}
          disabled={item.disabled}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
            isActive
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-700 hover:bg-gray-100'
          } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={{ paddingLeft: `${12 + level * 16}px` }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex-shrink-0 w-5 h-5">
            {item.icon}
          </div>
          
          {!isCollapsed && (
            <>
              <span className="flex-1 text-sm font-medium truncate">
                {item.label}
              </span>
              
              {item.badge && (
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                  {item.badge}
                </span>
              )}
              
              {hasChildren && (
                <div className="flex-shrink-0">
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              )}
            </>
          )}
        </motion.button>

        {/* Children */}
        <AnimatePresence>
          {hasChildren && isExpanded && !isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-1 space-y-1"
            >
              {item.children!.map(child => renderSidebarItem(child, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: isOpen ? 0 : (isCollapsed ? -280 : -280),
          width: isCollapsed ? 64 : 280
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed left-0 top-0 z-50 h-full bg-white border-r border-gray-200 shadow-lg ${className} ${
          isCollapsed ? 'w-16' : 'w-70'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">VeriGrade</span>
            </div>
          )}
          
          <button
            onClick={onToggle}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {items.map(item => renderSidebarItem(item))}
        </nav>

        {/* User Menu */}
        {showUserMenu && user && !isCollapsed && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <User className="w-4 h-4 text-gray-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {user.name}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {user.email}
                </div>
                {user.role && (
                  <div className="text-xs text-blue-600">
                    {user.role}
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>
        )}

        {/* Collapse Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
            {!isCollapsed && <span>Collapse</span>}
          </button>
        </div>
      </motion.div>
    </>
  );
}

// Predefined sidebar configurations
export const defaultSidebarItems: SidebarItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <Home className="w-5 h-5" />,
    href: '/dashboard'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <BarChart3 className="w-5 h-5" />,
    children: [
      {
        id: 'revenue',
        label: 'Revenue',
        icon: <DollarSign className="w-4 h-4" />,
        href: '/analytics/revenue'
      },
      {
        id: 'users',
        label: 'Users',
        icon: <Users className="w-4 h-4" />,
        href: '/analytics/users'
      },
      {
        id: 'performance',
        label: 'Performance',
        icon: <TrendingUp className="w-4 h-4" />,
        href: '/analytics/performance'
      }
    ]
  },
  {
    id: 'practice',
    label: 'Practice',
    icon: <Users className="w-5 h-5" />,
    href: '/practice'
  },
  {
    id: 'ai-assistant',
    label: 'AI Assistant',
    icon: <Zap className="w-5 h-5" />,
    href: '/ai-assistant',
    badge: 'New'
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: <FileText className="w-5 h-5" />,
    children: [
      {
        id: 'invoices',
        label: 'Invoices',
        icon: <FileText className="w-4 h-4" />,
        href: '/documents/invoices'
      },
      {
        id: 'reports',
        label: 'Reports',
        icon: <BarChart3 className="w-4 h-4" />,
        href: '/documents/reports'
      }
    ]
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: <Calendar className="w-5 h-5" />,
    href: '/calendar'
  },
  {
    id: 'messages',
    label: 'Messages',
    icon: <MessageSquare className="w-5 h-5" />,
    href: '/messages',
    badge: 3
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: <Bell className="w-5 h-5" />,
    href: '/notifications',
    badge: 5
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings className="w-5 h-5" />,
    href: '/settings'
  }
];

// Collapsible Sidebar Hook
export function useSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggle = () => setIsOpen(!isOpen);
  const close = () => setIsOpen(false);
  const open = () => setIsOpen(true);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return {
    isOpen,
    isCollapsed,
    toggle,
    close,
    open,
    toggleCollapse
  };
}

