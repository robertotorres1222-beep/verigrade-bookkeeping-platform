'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  DocumentArrowDownIcon,
  ShareIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  MinusIcon,
  ArrowPathIcon,
  PrinterIcon,
  DocumentDuplicateIcon,
  ArchiveBoxIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface Document {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
  updatedAt: string;
  uploadedByUser: {
    id: string;
    name: string;
    email: string;
  };
  versions: Array<{
    id: string;
    version: number;
    url: string;
    size: number;
    createdAt: string;
    uploadedBy: string;
  }>;
}

interface DocumentViewerProps {
  document: Document;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (document: Document) => void;
  onShare: (document: Document) => void;
  onEdit: (document: Document) => void;
  onDelete: (document: Document) => void;
}

export default function DocumentViewer({
  document,
  isOpen,
  onClose,
  onDownload,
  onShare,
  onEdit,
  onDelete
}: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(0);
  const [showVersions, setShowVersions] = useState(false);

  useEffect(() => {
    if (isOpen) {
      window.document.body.style.overflow = 'hidden';
    } else {
      window.document.body.style.overflow = 'unset';
    }

    return () => {
      window.document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📈';
    return '📁';
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25));
  };

  const handleResetZoom = () => {
    setZoom(100);
    setRotation(0);
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleFullscreen = () => {
    if (!window.document.fullscreenElement) {
      window.document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      window.document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const renderDocumentContent = () => {
    if (document.mimeType.startsWith('image/')) {
      return (
        <img
          src={document.url}
          alt={document.name}
          className="max-w-full max-h-full object-contain"
          style={{
            transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
            transformOrigin: 'center'
          }}
        />
      );
    } else if (document.mimeType.includes('pdf')) {
      return (
        <iframe
          src={document.url}
          className="w-full h-full border-0"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top left'
          }}
        />
      );
    } else {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-6xl mb-4">{getFileIcon(document.mimeType)}</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{document.name}</h3>
            <p className="text-gray-500 mb-4">
              This file type cannot be previewed. Download to view.
            </p>
            <button
              onClick={() => onDownload(document)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Download File
            </button>
          </div>
        </div>
      );
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative bg-white rounded-lg shadow-xl max-w-7xl max-h-[90vh] w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className="text-2xl mr-3">{getFileIcon(document.mimeType)}</span>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{document.name}</h2>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(document.size)} • {new Date(document.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Zoom Controls */}
              <div className="flex items-center space-x-1 border border-gray-300 rounded-md">
                <button
                  onClick={handleZoomOut}
                  className="p-2 text-gray-600 hover:text-gray-900"
                  title="Zoom Out"
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                <span className="px-2 text-sm text-gray-600">{zoom}%</span>
                <button
                  onClick={handleZoomIn}
                  className="p-2 text-gray-600 hover:text-gray-900"
                  title="Zoom In"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>

              {/* Action Buttons */}
              <button
                onClick={handleRotate}
                className="p-2 text-gray-600 hover:text-gray-900"
                title="Rotate"
              >
                <ArrowPathIcon className="h-4 w-4" />
              </button>

              <button
                onClick={handleResetZoom}
                className="p-2 text-gray-600 hover:text-gray-900"
                title="Reset View"
              >
                <EyeIcon className="h-4 w-4" />
              </button>

              <button
                onClick={() => onDownload(document)}
                className="p-2 text-gray-600 hover:text-gray-900"
                title="Download"
              >
                <DocumentArrowDownIcon className="h-4 w-4" />
              </button>

              <button
                onClick={() => onShare(document)}
                className="p-2 text-gray-600 hover:text-gray-900"
                title="Share"
              >
                <ShareIcon className="h-4 w-4" />
              </button>

              <button
                onClick={() => onEdit(document)}
                className="p-2 text-gray-600 hover:text-gray-900"
                title="Edit"
              >
                <PencilIcon className="h-4 w-4" />
              </button>

              <button
                onClick={handlePrint}
                className="p-2 text-gray-600 hover:text-gray-900"
                title="Print"
              >
                <PrinterIcon className="h-4 w-4" />
              </button>

              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:text-gray-900"
                title="Close"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Document Content */}
          <div className="relative h-[calc(90vh-120px)] overflow-auto bg-gray-100">
            <div className="flex items-center justify-center h-full p-4">
              {renderDocumentContent()}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Uploaded by {document.uploadedByUser.name}</span>
              <span>•</span>
              <span>Version {document.versions.length + 1}</span>
              {document.versions.length > 0 && (
                <>
                  <span>•</span>
                  <button
                    onClick={() => setShowVersions(!showVersions)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View all versions
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onEdit(document)}
                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Edit
              </button>
              <button
                onClick={() => onDelete(document)}
                className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                Delete
              </button>
            </div>
          </div>

          {/* Versions Panel */}
          <AnimatePresence>
            {showVersions && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-16 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4"
              >
                <h4 className="text-sm font-medium text-gray-900 mb-3">Document Versions</h4>
                <div className="space-y-2">
                  {document.versions.map((version, index) => (
                    <div
                      key={version.id}
                      className="flex items-center justify-between p-2 border border-gray-200 rounded"
                    >
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm text-gray-900">Version {version.version}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          {formatFileSize(version.size)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {new Date(version.createdAt).toLocaleDateString()}
                        </span>
                        <button className="text-blue-600 hover:text-blue-800 text-xs">
                          Restore
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
