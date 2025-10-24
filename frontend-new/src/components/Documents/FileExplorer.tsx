'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  DocumentIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  FolderPlusIcon,
  DocumentPlusIcon
} from '@heroicons/react/24/outline';

interface Folder {
  id: string;
  name: string;
  path: string;
  parentId?: string;
  children?: Folder[];
  documentCount: number;
  isExpanded?: boolean;
}

interface FileExplorerProps {
  folders: Folder[];
  onFolderSelect: (folder: Folder) => void;
  onFolderCreate: (parentId?: string) => void;
  onFolderRename: (folderId: string, newName: string) => void;
  onFolderDelete: (folderId: string) => void;
  selectedFolderId?: string;
}

export default function FileExplorer({
  folders,
  onFolderSelect,
  onFolderCreate,
  onFolderRename,
  onFolderDelete,
  selectedFolderId
}: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const handleFolderClick = (folder: Folder) => {
    onFolderSelect(folder);
    toggleFolder(folder.id);
  };

  const handleRenameStart = (folder: Folder) => {
    setEditingFolder(folder.id);
    setEditValue(folder.name);
  };

  const handleRenameSave = () => {
    if (editingFolder && editValue.trim()) {
      onFolderRename(editingFolder, editValue.trim());
      setEditingFolder(null);
      setEditValue('');
    }
  };

  const handleRenameCancel = () => {
    setEditingFolder(null);
    setEditValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameSave();
    } else if (e.key === 'Escape') {
      handleRenameCancel();
    }
  };

  const renderFolder = (folder: Folder, level: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedFolderId === folder.id;
    const isEditing = editingFolder === folder.id;

    return (
      <div key={folder.id}>
        <motion.div
          className={`flex items-center py-2 px-3 rounded-md cursor-pointer group hover:bg-gray-100 ${
            isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
          }`}
          style={{ paddingLeft: `${level * 20 + 12}px` }}
          onClick={() => !isEditing && handleFolderClick(folder)}
          whileHover={{ x: 2 }}
        >
          <div className="flex items-center flex-1 min-w-0">
            {folder.children && folder.children.length > 0 ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolder(folder.id);
                }}
                className="mr-2 p-1 hover:bg-gray-200 rounded"
              >
                {isExpanded ? (
                  <ChevronDownIcon className="h-4 w-4" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4" />
                )}
              </button>
            ) : (
              <div className="w-6 mr-2" />
            )}

            <FolderIcon className="h-5 w-5 mr-2 text-blue-500" />
            
            {isEditing ? (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleRenameSave}
                onKeyDown={handleKeyPress}
                className="flex-1 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            ) : (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{folder.name}</div>
                <div className="text-xs text-gray-500">
                  {folder.documentCount} document{folder.documentCount !== 1 ? 's' : ''}
                </div>
              </div>
            )}
          </div>

          {!isEditing && (
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFolderCreate(folder.id);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                title="Create subfolder"
              >
                <FolderPlusIcon className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRenameStart(folder);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                title="Rename folder"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFolderDelete(folder.id);
                }}
                className="p-1 text-gray-400 hover:text-red-600 rounded"
                title="Delete folder"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </motion.div>

        <AnimatePresence>
          {isExpanded && folder.children && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {folder.children.map(child => renderFolder(child, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Folders</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onFolderCreate()}
              className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              title="Create folder"
            >
              <FolderPlusIcon className="h-4 w-4 mr-1" />
              New Folder
            </button>
          </div>
        </div>
      </div>

      <div className="p-2">
        {folders.length === 0 ? (
          <div className="text-center py-8">
            <FolderIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-4">No folders yet</p>
            <button
              onClick={() => onFolderCreate()}
              className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <FolderPlusIcon className="h-4 w-4 mr-1" />
              Create First Folder
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {folders.map(folder => renderFolder(folder))}
          </div>
        )}
      </div>
    </div>
  );
}
