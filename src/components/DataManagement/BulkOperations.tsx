'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, 
  Download, 
  Upload, 
  Copy, 
  Edit, 
  Archive, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  FileText,
  Database
} from 'lucide-react';

interface BulkOperation {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  action: (selectedItems: string[]) => void;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

interface BulkOperationsProps {
  selectedItems: string[];
  onClearSelection: () => void;
  onRefresh: () => void;
}

export default function BulkOperations({ selectedItems, onClearSelection, onRefresh }: BulkOperationsProps) {
  const [showOperations, setShowOperations] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<BulkOperation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const bulkOperations: BulkOperation[] = [
    {
      id: 'export',
      name: 'Export Selected',
      description: 'Export selected items to CSV/Excel',
      icon: <Download className="w-4 h-4" />,
      color: 'text-blue-600 bg-blue-50 hover:bg-blue-100',
      action: (items) => handleExport(items)
    },
    {
      id: 'delete',
      name: 'Delete Selected',
      description: 'Permanently delete selected items',
      icon: <Trash2 className="w-4 h-4" />,
      color: 'text-red-600 bg-red-50 hover:bg-red-100',
      action: (items) => handleDelete(items),
      requiresConfirmation: true,
      confirmationMessage: `Are you sure you want to delete ${selectedItems.length} items? This action cannot be undone.`
    },
    {
      id: 'archive',
      name: 'Archive Selected',
      description: 'Archive selected items',
      icon: <Archive className="w-4 h-4" />,
      color: 'text-orange-600 bg-orange-50 hover:bg-orange-100',
      action: (items) => handleArchive(items)
    },
    {
      id: 'duplicate',
      name: 'Duplicate Selected',
      description: 'Create copies of selected items',
      icon: <Copy className="w-4 h-4" />,
      color: 'text-green-600 bg-green-50 hover:bg-green-100',
      action: (items) => handleDuplicate(items)
    },
    {
      id: 'edit',
      name: 'Bulk Edit',
      description: 'Edit multiple items at once',
      icon: <Edit className="w-4 h-4" />,
      color: 'text-purple-600 bg-purple-50 hover:bg-purple-100',
      action: (items) => handleBulkEdit(items)
    }
  ];

  const handleExport = async (items: string[]) => {
    setIsProcessing(true);
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create downloadable file
      const data = items.map(id => ({ id, exported: new Date().toISOString() }));
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      onClearSelection();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (items: string[]) => {
    setIsProcessing(true);
    try {
      // Simulate delete process
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Deleted items:', items);
      onClearSelection();
      onRefresh();
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleArchive = async (items: string[]) => {
    setIsProcessing(true);
    try {
      // Simulate archive process
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Archived items:', items);
      onClearSelection();
      onRefresh();
    } catch (error) {
      console.error('Archive failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDuplicate = async (items: string[]) => {
    setIsProcessing(true);
    try {
      // Simulate duplicate process
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Duplicated items:', items);
      onClearSelection();
      onRefresh();
    } catch (error) {
      console.error('Duplicate failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkEdit = (items: string[]) => {
    // Open bulk edit modal
    const event = new CustomEvent('openBulkEdit', { detail: { items } });
    window.dispatchEvent(event);
    onClearSelection();
  };

  const executeOperation = (operation: BulkOperation) => {
    if (operation.requiresConfirmation) {
      setSelectedOperation(operation);
      setShowConfirmation(true);
    } else {
      operation.action(selectedItems);
    }
  };

  const confirmOperation = () => {
    if (selectedOperation) {
      selectedOperation.action(selectedItems);
      setShowConfirmation(false);
      setSelectedOperation(null);
    }
  };

  if (selectedItems.length === 0) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40"
      >
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-900">
                {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowOperations(!showOperations)}
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Actions
              </button>
              
              <button
                onClick={onClearSelection}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
              >
                Clear
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showOperations && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-gray-200"
              >
                <div className="grid grid-cols-2 gap-2">
                  {bulkOperations.map((operation) => (
                    <button
                      key={operation.id}
                      onClick={() => executeOperation(operation)}
                      disabled={isProcessing}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors text-sm font-medium ${operation.color} ${
                        isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {operation.icon}
                      <span>{operation.name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && selectedOperation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowConfirmation(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirm Action
                </h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                {selectedOperation.confirmationMessage}
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmOperation}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Processing Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-xl p-6 text-center"
            >
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Processing your request...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

