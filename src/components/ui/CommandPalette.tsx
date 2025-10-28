'use client';

import { HTMLAttributes, forwardRef, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  CommandLineIcon,
  ArrowRightIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface Command {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  keywords?: string[];
  action: () => void;
  category?: string;
}

interface CommandPaletteProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragEnd' | 'onDragStart' | 'onAnimationStart' | 'onAnimationEnd'> {
  isOpen: boolean;
  onClose: () => void;
  commands: Command[];
  placeholder?: string;
  emptyMessage?: string;
}

const CommandPalette = forwardRef<HTMLDivElement, CommandPaletteProps>(
  ({
    className,
    isOpen,
    onClose,
    commands,
    placeholder = 'Type a command or search...',
    emptyMessage = 'No commands found',
    ...props
  }, ref) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const filteredCommands = commands.filter(command => {
      const searchTerm = query.toLowerCase();
      return (
        command.title.toLowerCase().includes(searchTerm) ||
        command.description?.toLowerCase().includes(searchTerm) ||
        command.keywords?.some(keyword => keyword.toLowerCase().includes(searchTerm)) ||
        command.category?.toLowerCase().includes(searchTerm)
      );
    });

    const groupedCommands = filteredCommands.reduce((groups, command) => {
      const category = command.category || 'General';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(command);
      return groups;
    }, {} as Record<string, Command[]>);

    useEffect(() => {
      if (isOpen && inputRef.current) {
        inputRef.current.focus();
        setQuery('');
        setSelectedIndex(0);
      }
    }, [isOpen]);

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (!isOpen) return;

        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            setSelectedIndex(prev => 
              prev < filteredCommands.length - 1 ? prev + 1 : 0
            );
            break;
          case 'ArrowUp':
            e.preventDefault();
            setSelectedIndex(prev => 
              prev > 0 ? prev - 1 : filteredCommands.length - 1
            );
            break;
          case 'Enter':
            e.preventDefault();
            if (filteredCommands[selectedIndex]) {
              filteredCommands[selectedIndex].action();
              onClose();
            }
            break;
          case 'Escape':
            onClose();
            break;
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, selectedIndex, filteredCommands, onClose]);

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          if (isOpen) {
            onClose();
          } else {
            // This would be handled by the parent component
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const handleCommandSelect = (command: Command) => {
      command.action();
      onClose();
    };

    const scrollToSelected = () => {
      if (listRef.current) {
        const selectedElement = listRef.current.querySelector('[data-selected="true"]');
        if (selectedElement) {
          selectedElement.scrollIntoView({ block: 'nearest' });
        }
      }
    };

    useEffect(() => {
      scrollToSelected();
    }, [selectedIndex]);

    if (!isOpen) return null;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl mx-4',
              'bg-white rounded-xl shadow-2xl border border-gray-200',
              className
            )}
            onClick={(e) => e.stopPropagation()}
            {...props}
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={placeholder}
                  className="flex-1 text-lg border-none outline-none placeholder-gray-400"
                />
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <kbd className="px-2 py-1 bg-gray-100 rounded">↑↓</kbd>
                  <span>navigate</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded">↵</kbd>
                  <span>select</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded">esc</kbd>
                  <span>close</span>
                </div>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto" ref={listRef}>
              {Object.keys(groupedCommands).length > 0 ? (
                Object.entries(groupedCommands).map(([category, categoryCommands]) => (
                  <div key={category} className="p-2">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {category}
                    </div>
                    {categoryCommands.map((command, index) => {
                      const globalIndex = filteredCommands.indexOf(command);
                      const isSelected = globalIndex === selectedIndex;
                      
                      return (
                        <button
                          key={command.id}
                          data-selected={isSelected}
                          onClick={() => handleCommandSelect(command)}
                          className={cn(
                            'w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors duration-150',
                            isSelected ? 'bg-blue-50 text-blue-900' : 'hover:bg-gray-50'
                          )}
                        >
                          {command.icon && (
                            <div className="flex-shrink-0 text-gray-400">
                              {command.icon}
                            </div>
                          )}
                          <div className="flex-1 min-w-0 text-left">
                            <div className="text-sm font-medium">{command.title}</div>
                            {command.description && (
                              <div className="text-xs text-gray-500 mt-1">
                                {command.description}
                              </div>
                            )}
                          </div>
                          <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                        </button>
                      );
                    })}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <CommandLineIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm">{emptyMessage}</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-4">
                  <span>Press <kbd className="px-1 py-0.5 bg-white rounded">⌘K</kbd> to open</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>Powered by VeriGrade</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }
);
CommandPalette.displayName = 'CommandPalette';

export { CommandPalette };

