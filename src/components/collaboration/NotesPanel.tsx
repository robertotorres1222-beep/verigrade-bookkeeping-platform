'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChatBubbleLeftIcon,
  PlusIcon,
  UserIcon,
  ClockIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';

interface Note {
  id: string;
  content: string;
  isInternal: boolean;
  mentions: string[];
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface NotesPanelProps {
  resourceId: string;
  resourceType: 'transaction' | 'document';
  organizationId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function NotesPanel({ resourceId, resourceType, organizationId, isOpen, onClose }: NotesPanelProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isInternal, setIsInternal] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showInternalOnly, setShowInternalOnly] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotes();
    }
  }, [isOpen, resourceId]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      // Mock data for demo
      const mockNotes: Note[] = [
        {
          id: 'note-1',
          content: 'This transaction needs review - unusual amount for this vendor',
          isInternal: true,
          mentions: [],
          createdAt: '2024-01-20T10:30:00Z',
          user: {
            id: 'user-1',
            firstName: 'Sarah',
            lastName: 'Johnson',
            email: 'sarah@verigrade.com',
          },
        },
        {
          id: 'note-2',
          content: 'Client confirmed this is correct - annual software license renewal',
          isInternal: false,
          mentions: ['user-1'],
          createdAt: '2024-01-20T11:15:00Z',
          user: {
            id: 'user-2',
            firstName: 'Mike',
            lastName: 'Chen',
            email: 'mike@verigrade.com',
          },
        },
      ];
      setNotes(mockNotes);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;

    try {
      const note: Note = {
        id: `note-${Date.now()}`,
        content: newNote,
        isInternal,
        mentions: [],
        createdAt: new Date().toISOString(),
        user: {
          id: 'current-user',
          firstName: 'Current',
          lastName: 'User',
          email: 'current@verigrade.com',
        },
      };

      setNotes(prev => [note, ...prev]);
      setNewNote('');
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const filteredNotes = showInternalOnly 
    ? notes.filter(note => note.isInternal)
    : notes;

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl border-l border-gray-200 z-50"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <ChatBubbleLeftIcon className="h-5 w-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Notes & Comments</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-gray-200 space-y-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowInternalOnly(!showInternalOnly)}
              className={`flex items-center px-3 py-1 rounded-md text-sm ${
                showInternalOnly
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {showInternalOnly ? (
                <EyeIcon className="h-4 w-4 mr-1" />
              ) : (
                <EyeSlashIcon className="h-4 w-4 mr-1" />
              )}
              Internal Only
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="internal-note"
              checked={isInternal}
              onChange={(e) => setIsInternal(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="internal-note" className="text-sm text-gray-700">
              Internal note (not visible to client)
            </label>
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-8">
              <ChatBubbleLeftIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No notes yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredNotes.map((note) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`p-4 rounded-lg border ${
                      note.isInternal
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                          <UserIcon className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {note.user.firstName} {note.user.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(note.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {note.isInternal && (
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          Internal
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">{note.content}</p>
                    {note.mentions.length > 0 && (
                      <div className="mt-2 flex items-center">
                        <span className="text-xs text-gray-500 mr-2">Mentioned:</span>
                        <div className="flex space-x-1">
                          {note.mentions.map((mention) => (
                            <span
                              key={mention}
                              className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full"
                            >
                              @{mention}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Add Note Form */}
        <div className="p-4 border-t border-gray-200">
          <div className="space-y-3">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note or comment..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="new-internal-note"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="new-internal-note" className="text-sm text-gray-700">
                  Internal
                </label>
              </div>
              <button
                onClick={addNote}
                disabled={!newNote.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Note
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

