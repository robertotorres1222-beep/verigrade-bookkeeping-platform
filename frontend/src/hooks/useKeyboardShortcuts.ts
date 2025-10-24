import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
  category: string;
}

export interface KeyboardShortcutsConfig {
  enabled: boolean;
  showHelp: boolean;
  categories: {
    [key: string]: {
      name: string;
      shortcuts: KeyboardShortcut[];
    };
  };
}

const defaultShortcuts: KeyboardShortcut[] = [
  // Navigation
  {
    key: 'h',
    ctrlKey: true,
    action: () => window.location.href = '/',
    description: 'Go to Home',
    category: 'navigation'
  },
  {
    key: 'i',
    ctrlKey: true,
    action: () => window.location.href = '/invoices',
    description: 'Go to Invoices',
    category: 'navigation'
  },
  {
    key: 'e',
    ctrlKey: true,
    action: () => window.location.href = '/expenses',
    description: 'Go to Expenses',
    category: 'navigation'
  },
  {
    key: 'b',
    ctrlKey: true,
    action: () => window.location.href = '/banking',
    description: 'Go to Banking',
    category: 'navigation'
  },
  {
    key: 'r',
    ctrlKey: true,
    action: () => window.location.href = '/reports',
    description: 'Go to Reports',
    category: 'navigation'
  },
  {
    key: 'c',
    ctrlKey: true,
    action: () => window.location.href = '/clients',
    description: 'Go to Clients',
    category: 'navigation'
  },
  
  // Actions
  {
    key: 'n',
    ctrlKey: true,
    action: () => {
      // This would be context-aware based on current page
      const currentPath = window.location.pathname;
      if (currentPath.includes('/invoices')) {
        window.location.href = '/invoices/new';
      } else if (currentPath.includes('/expenses')) {
        window.location.href = '/expenses/new';
      } else if (currentPath.includes('/clients')) {
        window.location.href = '/clients/new';
      }
    },
    description: 'Create New Item',
    category: 'actions'
  },
  {
    key: 's',
    ctrlKey: true,
    action: () => {
      // Save current form
      const saveButton = document.querySelector('[data-action="save"]') as HTMLButtonElement;
      if (saveButton) {
        saveButton.click();
      }
    },
    description: 'Save',
    category: 'actions'
  },
  {
    key: 'f',
    ctrlKey: true,
    action: () => {
      // Focus search
      const searchInput = document.querySelector('[data-search="true"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    },
    description: 'Focus Search',
    category: 'actions'
  },
  
  // Global
  {
    key: 'k',
    ctrlKey: true,
    action: () => {
      // Open command palette
      const event = new CustomEvent('openCommandPalette');
      window.dispatchEvent(event);
    },
    description: 'Open Command Palette',
    category: 'global'
  },
  {
    key: '?',
    action: () => {
      // Show keyboard shortcuts help
      const event = new CustomEvent('showKeyboardShortcuts');
      window.dispatchEvent(event);
    },
    description: 'Show Keyboard Shortcuts',
    category: 'global'
  },
  {
    key: 'Escape',
    action: () => {
      // Close modals, dropdowns, etc.
      const event = new CustomEvent('closeModals');
      window.dispatchEvent(event);
    },
    description: 'Close Modal/Dropdown',
    category: 'global'
  },
  
  // Data operations
  {
    key: 'a',
    ctrlKey: true,
    action: () => {
      // Select all items in current view
      const selectAllButton = document.querySelector('[data-action="select-all"]') as HTMLButtonElement;
      if (selectAllButton) {
        selectAllButton.click();
      }
    },
    description: 'Select All',
    category: 'data'
  },
  {
    key: 'd',
    ctrlKey: true,
    action: () => {
      // Delete selected items
      const deleteButton = document.querySelector('[data-action="delete"]') as HTMLButtonElement;
      if (deleteButton) {
        deleteButton.click();
      }
    },
    description: 'Delete Selected',
    category: 'data'
  },
  {
    key: 'e',
    ctrlKey: true,
    action: () => {
      // Export data
      const exportButton = document.querySelector('[data-action="export"]') as HTMLButtonElement;
      if (exportButton) {
        exportButton.click();
      }
    },
    description: 'Export Data',
    category: 'data'
  }
];

export const useKeyboardShortcuts = (customShortcuts: KeyboardShortcut[] = []) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const shortcutsRef = useRef<KeyboardShortcut[]>([]);

  // Combine default and custom shortcuts
  useEffect(() => {
    shortcutsRef.current = [...defaultShortcuts, ...customShortcuts];
  }, [customShortcuts]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement ||
      (event.target as HTMLElement)?.contentEditable === 'true'
    ) {
      return;
    }

    const matchingShortcut = shortcutsRef.current.find(shortcut => {
      return (
        shortcut.key.toLowerCase() === event.key.toLowerCase() &&
        !!shortcut.ctrlKey === event.ctrlKey &&
        !!shortcut.altKey === event.altKey &&
        !!shortcut.shiftKey === event.shiftKey &&
        !!shortcut.metaKey === event.metaKey
      );
    });

    if (matchingShortcut) {
      event.preventDefault();
      event.stopPropagation();
      
      try {
        matchingShortcut.action();
        
        // Show feedback for certain actions
        if (matchingShortcut.category === 'actions' || matchingShortcut.category === 'data') {
          enqueueSnackbar(`Shortcut: ${matchingShortcut.description}`, {
            variant: 'info',
            autoHideDuration: 1000
          });
        }
      } catch (error) {
        console.error('Error executing keyboard shortcut:', error);
        enqueueSnackbar('Shortcut action failed', {
          variant: 'error',
          autoHideDuration: 2000
        });
      }
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const getShortcutsByCategory = useCallback(() => {
    const shortcuts = shortcutsRef.current;
    const categories: { [key: string]: KeyboardShortcut[] } = {};
    
    shortcuts.forEach(shortcut => {
      if (!categories[shortcut.category]) {
        categories[shortcut.category] = [];
      }
      categories[shortcut.category].push(shortcut);
    });
    
    return categories;
  }, []);

  const addShortcut = useCallback((shortcut: KeyboardShortcut) => {
    shortcutsRef.current = [...shortcutsRef.current, shortcut];
  }, []);

  const removeShortcut = useCallback((key: string, modifiers?: Partial<Pick<KeyboardShortcut, 'ctrlKey' | 'altKey' | 'shiftKey' | 'metaKey'>>) => {
    shortcutsRef.current = shortcutsRef.current.filter(shortcut => {
      if (shortcut.key !== key) return true;
      
      if (modifiers) {
        return !(
          !!shortcut.ctrlKey === !!modifiers.ctrlKey &&
          !!shortcut.altKey === !!modifiers.altKey &&
          !!shortcut.shiftKey === !!modifiers.shiftKey &&
          !!shortcut.metaKey === !!modifiers.metaKey
        );
      }
      
      return false;
    });
  }, []);

  const getShortcutDescription = useCallback((key: string, modifiers?: Partial<Pick<KeyboardShortcut, 'ctrlKey' | 'altKey' | 'shiftKey' | 'metaKey'>>) => {
    const shortcut = shortcutsRef.current.find(s => {
      if (s.key !== key) return false;
      
      if (modifiers) {
        return (
          !!s.ctrlKey === !!modifiers.ctrlKey &&
          !!s.altKey === !!modifiers.altKey &&
          !!s.shiftKey === !!modifiers.shiftKey &&
          !!s.metaKey === !!modifiers.metaKey
        );
      }
      
      return true;
    });
    
    return shortcut?.description || '';
  }, []);

  return {
    shortcuts: shortcutsRef.current,
    getShortcutsByCategory,
    addShortcut,
    removeShortcut,
    getShortcutDescription
  };
};

export default useKeyboardShortcuts;






