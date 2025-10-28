import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
  category: string;
}

export const useKeyboardShortcuts = () => {
  const router = useRouter();

  const shortcuts: KeyboardShortcut[] = [
    // Navigation shortcuts
    {
      key: 'h',
      metaKey: true,
      action: () => router.push('/'),
      description: 'Go to Home',
      category: 'Navigation'
    },
    {
      key: 'd',
      metaKey: true,
      action: () => router.push('/dashboard'),
      description: 'Go to Dashboard',
      category: 'Navigation'
    },
    {
      key: 'p',
      metaKey: true,
      action: () => router.push('/practice'),
      description: 'Go to Practice Dashboard',
      category: 'Navigation'
    },
    {
      key: 'a',
      metaKey: true,
      action: () => router.push('/ai-assistant'),
      description: 'Go to AI Assistant',
      category: 'Navigation'
    },
    {
      key: 'c',
      metaKey: true,
      action: () => router.push('/client-portal'),
      description: 'Go to Client Portal',
      category: 'Navigation'
    },
    {
      key: 'k',
      metaKey: true,
      action: () => {
        // Open command palette
        const event = new CustomEvent('openCommandPalette');
        window.dispatchEvent(event);
      },
      description: 'Open Command Palette',
      category: 'Navigation'
    },
    
    // Search shortcuts
    {
      key: '/',
      action: () => {
        // Focus search input
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      },
      description: 'Focus Search',
      category: 'Search'
    },
    {
      key: 'f',
      metaKey: true,
      action: () => {
        // Open global search
        const event = new CustomEvent('openGlobalSearch');
        window.dispatchEvent(event);
      },
      description: 'Open Global Search',
      category: 'Search'
    },
    
    // Action shortcuts
    {
      key: 'n',
      metaKey: true,
      action: () => {
        // Create new item (context dependent)
        const event = new CustomEvent('createNewItem');
        window.dispatchEvent(event);
      },
      description: 'Create New Item',
      category: 'Actions'
    },
    {
      key: 's',
      metaKey: true,
      action: () => {
        // Save current form
        const event = new CustomEvent('saveForm');
        window.dispatchEvent(event);
      },
      description: 'Save Form',
      category: 'Actions'
    },
    {
      key: 'e',
      metaKey: true,
      action: () => {
        // Export data
        const event = new CustomEvent('exportData');
        window.dispatchEvent(event);
      },
      description: 'Export Data',
      category: 'Actions'
    },
    
    // Help shortcuts
    {
      key: '?',
      action: () => {
        // Show keyboard shortcuts help
        const event = new CustomEvent('showKeyboardShortcuts');
        window.dispatchEvent(event);
      },
      description: 'Show Keyboard Shortcuts',
      category: 'Help'
    },
    {
      key: 'h',
      metaKey: true,
      shiftKey: true,
      action: () => {
        // Show help
        const event = new CustomEvent('showHelp');
        window.dispatchEvent(event);
      },
      description: 'Show Help',
      category: 'Help'
    },
    
    // Utility shortcuts
    {
      key: 'z',
      metaKey: true,
      action: () => {
        // Undo last action
        const event = new CustomEvent('undoAction');
        window.dispatchEvent(event);
      },
      description: 'Undo',
      category: 'Utilities'
    },
    {
      key: 'y',
      metaKey: true,
      action: () => {
        // Redo last action
        const event = new CustomEvent('redoAction');
        window.dispatchEvent(event);
      },
      description: 'Redo',
      category: 'Utilities'
    },
    {
      key: 'r',
      metaKey: true,
      action: () => {
        // Refresh current page
        window.location.reload();
      },
      description: 'Refresh Page',
      category: 'Utilities'
    }
  ];

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

    const matchingShortcut = shortcuts.find(shortcut => {
      return (
        shortcut.key === event.key &&
        !!shortcut.ctrlKey === event.ctrlKey &&
        !!shortcut.metaKey === event.metaKey &&
        !!shortcut.shiftKey === event.shiftKey &&
        !!shortcut.altKey === event.altKey
      );
    });

    if (matchingShortcut) {
      event.preventDefault();
      matchingShortcut.action();
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    shortcuts,
    handleKeyDown
  };
};

