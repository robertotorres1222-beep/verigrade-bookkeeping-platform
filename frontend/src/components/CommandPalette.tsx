import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  Paper
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  ArrowForward as ArrowIcon,
  Home as HomeIcon,
  Receipt as InvoiceIcon,
  AccountBalance as BankIcon,
  Assessment as ReportIcon,
  People as ClientIcon,
  Add as AddIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Keyboard as KeyboardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

interface CommandItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  action: () => void;
  keywords: string[];
  shortcut?: string;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { shortcuts } = useKeyboardShortcuts();

  const commandItems: CommandItem[] = [
    // Navigation
    {
      id: 'nav-home',
      title: 'Go to Dashboard',
      description: 'Navigate to the main dashboard',
      icon: <HomeIcon />,
      category: 'Navigation',
      action: () => navigate('/'),
      keywords: ['dashboard', 'home', 'main'],
      shortcut: 'Ctrl+H'
    },
    {
      id: 'nav-invoices',
      title: 'Go to Invoices',
      description: 'View and manage invoices',
      icon: <InvoiceIcon />,
      category: 'Navigation',
      action: () => navigate('/invoices'),
      keywords: ['invoices', 'billing', 'payments'],
      shortcut: 'Ctrl+I'
    },
    {
      id: 'nav-banking',
      title: 'Go to Banking',
      description: 'Manage bank accounts and transactions',
      icon: <BankIcon />,
      category: 'Navigation',
      action: () => navigate('/banking'),
      keywords: ['banking', 'accounts', 'transactions'],
      shortcut: 'Ctrl+B'
    },
    {
      id: 'nav-reports',
      title: 'Go to Reports',
      description: 'View financial reports and analytics',
      icon: <ReportIcon />,
      category: 'Navigation',
      action: () => navigate('/reports'),
      keywords: ['reports', 'analytics', 'financial'],
      shortcut: 'Ctrl+R'
    },
    {
      id: 'nav-clients',
      title: 'Go to Clients',
      description: 'Manage client information',
      icon: <ClientIcon />,
      category: 'Navigation',
      action: () => navigate('/clients'),
      keywords: ['clients', 'customers', 'contacts'],
      shortcut: 'Ctrl+C'
    },
    
    // Actions
    {
      id: 'action-new-invoice',
      title: 'Create New Invoice',
      description: 'Create a new invoice for a client',
      icon: <AddIcon />,
      category: 'Actions',
      action: () => navigate('/invoices/new'),
      keywords: ['new', 'invoice', 'create', 'bill'],
      shortcut: 'Ctrl+N'
    },
    {
      id: 'action-new-expense',
      title: 'Create New Expense',
      description: 'Record a new business expense',
      icon: <AddIcon />,
      category: 'Actions',
      action: () => navigate('/expenses/new'),
      keywords: ['new', 'expense', 'create', 'record'],
      shortcut: 'Ctrl+N'
    },
    {
      id: 'action-new-client',
      title: 'Add New Client',
      description: 'Add a new client to your system',
      icon: <AddIcon />,
      category: 'Actions',
      action: () => navigate('/clients/new'),
      keywords: ['new', 'client', 'add', 'customer'],
      shortcut: 'Ctrl+N'
    },
    
    // Settings & Help
    {
      id: 'settings',
      title: 'Settings',
      description: 'Configure your account settings',
      icon: <SettingsIcon />,
      category: 'Settings',
      action: () => navigate('/settings'),
      keywords: ['settings', 'preferences', 'configure'],
      shortcut: ''
    },
    {
      id: 'help',
      title: 'Help Center',
      description: 'Get help and support',
      icon: <HelpIcon />,
      category: 'Help',
      action: () => navigate('/help'),
      keywords: ['help', 'support', 'documentation'],
      shortcut: ''
    },
    {
      id: 'shortcuts',
      title: 'Keyboard Shortcuts',
      description: 'View all available keyboard shortcuts',
      icon: <KeyboardIcon />,
      category: 'Help',
      action: () => {
        onClose();
        const event = new CustomEvent('showKeyboardShortcuts');
        window.dispatchEvent(event);
      },
      keywords: ['shortcuts', 'keyboard', 'hotkeys'],
      shortcut: '?'
    }
  ];

  const filteredItems = commandItems.filter(item => {
    if (!query) return true;
    
    const searchTerms = query.toLowerCase().split(' ');
    return searchTerms.every(term =>
      item.title.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term) ||
      item.keywords.some(keyword => keyword.toLowerCase().includes(term))
    );
  });

  const groupedItems = filteredItems.reduce((groups, item) => {
    if (!groups[item.category]) {
      groups[item.category] = [];
    }
    groups[item.category].push(item);
    return groups;
  }, {} as { [key: string]: CommandItem[] });

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!open) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev => 
            Math.min(prev + 1, filteredItems.length - 1)
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          event.preventDefault();
          if (filteredItems[selectedIndex]) {
            filteredItems[selectedIndex].action();
            onClose();
          }
          break;
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, filteredItems, selectedIndex, onClose]);

  const handleItemClick = (item: CommandItem) => {
    item.action();
    onClose();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Navigation': return <ArrowIcon />;
      case 'Actions': return <AddIcon />;
      case 'Settings': return <SettingsIcon />;
      case 'Help': return <HelpIcon />;
      default: return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          mt: '10vh',
          maxHeight: '80vh'
        }
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <TextField
            ref={inputRef}
            fullWidth
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={onClose}>
                    <CloseIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
            autoFocus
          />
        </Box>

        <Box sx={{ maxHeight: '60vh', overflow: 'auto' }}>
          {Object.keys(groupedItems).length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="textSecondary">
                No commands found
              </Typography>
            </Box>
          ) : (
            Object.entries(groupedItems).map(([category, items]) => (
              <Box key={category}>
                <Box sx={{ px: 2, py: 1, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    {category}
                  </Typography>
                </Box>
                <List dense>
                  {items.map((item, index) => {
                    const globalIndex = filteredItems.indexOf(item);
                    const isSelected = globalIndex === selectedIndex;
                    
                    return (
                      <ListItem
                        key={item.id}
                        button
                        onClick={() => handleItemClick(item)}
                        sx={{
                          bgcolor: isSelected ? 'primary.light' : 'transparent',
                          '&:hover': {
                            bgcolor: isSelected ? 'primary.light' : 'grey.100'
                          }
                        }}
                      >
                        <ListItemIcon>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.title}
                          secondary={item.description}
                        />
                        {item.shortcut && (
                          <Chip
                            label={item.shortcut}
                            size="small"
                            variant="outlined"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </ListItem>
                    );
                  })}
                </List>
                <Divider />
              </Box>
            ))
          )}
        </Box>

        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
          <Typography variant="caption" color="textSecondary">
            Use ↑↓ to navigate, Enter to select, Esc to close
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CommandPalette;







