import { create } from 'zustand';

export interface UndoRedoAction {
  id: string;
  type: 'create' | 'update' | 'delete' | 'move' | 'bulk';
  entityType: string;
  entityId: string;
  description: string;
  timestamp: Date;
  data: {
    before?: any;
    after?: any;
    originalData?: any;
  };
  metadata?: {
    userId: string;
    sessionId: string;
    source: string;
  };
}

export interface UndoRedoState {
  actions: UndoRedoAction[];
  currentIndex: number;
  maxHistorySize: number;
  isUndoAvailable: boolean;
  isRedoAvailable: boolean;
}

interface UndoRedoStore extends UndoRedoState {
  // Actions
  addAction: (action: Omit<UndoRedoAction, 'id' | 'timestamp'>) => void;
  undo: () => UndoRedoAction | null;
  redo: () => UndoRedoAction | null;
  clear: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  getHistory: () => UndoRedoAction[];
  getCurrentAction: () => UndoRedoAction | null;
  
  // Configuration
  setMaxHistorySize: (size: number) => void;
  
  // Batch operations
  startBatch: () => void;
  endBatch: () => void;
  isBatching: boolean;
}

export const useUndoRedoStore = create<UndoRedoStore>((set, get) => ({
  // Initial state
  actions: [],
  currentIndex: -1,
  maxHistorySize: 50,
  isUndoAvailable: false,
  isRedoAvailable: false,
  isBatching: false,

  // Add action to history
  addAction: (actionData) => {
    const { actions, currentIndex, maxHistorySize, isBatching } = get();
    
    // If we're batching, don't add individual actions
    if (isBatching) {
      return;
    }

    const action: UndoRedoAction = {
      ...actionData,
      id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    // Remove any actions after current index (when user does new action after undo)
    const newActions = actions.slice(0, currentIndex + 1);
    newActions.push(action);

    // Limit history size
    if (newActions.length > maxHistorySize) {
      newActions.shift();
    }

    const newCurrentIndex = newActions.length - 1;

    set({
      actions: newActions,
      currentIndex: newCurrentIndex,
      isUndoAvailable: newCurrentIndex >= 0,
      isRedoAvailable: false
    });
  },

  // Undo last action
  undo: () => {
    const { actions, currentIndex } = get();
    
    if (currentIndex < 0 || currentIndex >= actions.length) {
      return null;
    }

    const action = actions[currentIndex];
    const newCurrentIndex = currentIndex - 1;

    set({
      currentIndex: newCurrentIndex,
      isUndoAvailable: newCurrentIndex >= 0,
      isRedoAvailable: true
    });

    return action;
  },

  // Redo last undone action
  redo: () => {
    const { actions, currentIndex } = get();
    
    if (currentIndex + 1 >= actions.length) {
      return null;
    }

    const newCurrentIndex = currentIndex + 1;
    const action = actions[newCurrentIndex];

    set({
      currentIndex: newCurrentIndex,
      isUndoAvailable: true,
      isRedoAvailable: newCurrentIndex + 1 < actions.length
    });

    return action;
  },

  // Clear all history
  clear: () => {
    set({
      actions: [],
      currentIndex: -1,
      isUndoAvailable: false,
      isRedoAvailable: false
    });
  },

  // Check if undo is available
  canUndo: () => {
    const { currentIndex } = get();
    return currentIndex >= 0;
  },

  // Check if redo is available
  canRedo: () => {
    const { actions, currentIndex } = get();
    return currentIndex + 1 < actions.length;
  },

  // Get history of actions
  getHistory: () => {
    const { actions } = get();
    return [...actions];
  },

  // Get current action
  getCurrentAction: () => {
    const { actions, currentIndex } = get();
    return currentIndex >= 0 && currentIndex < actions.length ? actions[currentIndex] : null;
  },

  // Set max history size
  setMaxHistorySize: (size: number) => {
    set({ maxHistorySize: size });
  },

  // Start batch operation
  startBatch: () => {
    set({ isBatching: true });
  },

  // End batch operation
  endBatch: () => {
    set({ isBatching: false });
  }
}));

// Utility functions for common undo/redo operations
export const createUndoRedoAction = (
  type: UndoRedoAction['type'],
  entityType: string,
  entityId: string,
  description: string,
  data: UndoRedoAction['data'],
  metadata?: UndoRedoAction['metadata']
): Omit<UndoRedoAction, 'id' | 'timestamp'> => ({
  type,
  entityType,
  entityId,
  description,
  data,
  metadata
});

// Common action creators
export const createCreateAction = (
  entityType: string,
  entityId: string,
  data: any,
  description?: string
) => createUndoRedoAction(
  'create',
  entityType,
  entityId,
  description || `Created ${entityType}`,
  { after: data }
);

export const createUpdateAction = (
  entityType: string,
  entityId: string,
  before: any,
  after: any,
  description?: string
) => createUndoRedoAction(
  'update',
  entityType,
  entityId,
  description || `Updated ${entityType}`,
  { before, after }
);

export const createDeleteAction = (
  entityType: string,
  entityId: string,
  originalData: any,
  description?: string
) => createUndoRedoAction(
  'delete',
  entityType,
  entityId,
  description || `Deleted ${entityType}`,
  { originalData }
);

export const createBulkAction = (
  entityType: string,
  entityIds: string[],
  operation: string,
  data: any,
  description?: string
) => createUndoRedoAction(
  'bulk',
  entityType,
  entityIds.join(','),
  description || `Bulk ${operation} ${entityType}s`,
  data
);

// Hook for using undo/redo in components
export const useUndoRedo = () => {
  const store = useUndoRedoStore();
  
  return {
    // State
    canUndo: store.canUndo(),
    canRedo: store.canRedo(),
    history: store.getHistory(),
    currentAction: store.getCurrentAction(),
    
    // Actions
    addAction: store.addAction,
    undo: store.undo,
    redo: store.redo,
    clear: store.clear,
    
    // Batch operations
    startBatch: store.startBatch,
    endBatch: store.endBatch,
    isBatching: store.isBatching,
    
    // Configuration
    setMaxHistorySize: store.setMaxHistorySize
  };
};

// Keyboard shortcuts for undo/redo
export const useUndoRedoKeyboardShortcuts = () => {
  const { undo, redo, canUndo, canRedo } = useUndoRedo();

  const handleKeyDown = (event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement ||
      (event.target as HTMLElement)?.contentEditable === 'true'
    ) {
      return;
    }

    if (event.ctrlKey || event.metaKey) {
      switch (event.key.toLowerCase()) {
        case 'z':
          event.preventDefault();
          if (event.shiftKey && canRedo) {
            redo();
          } else if (canUndo) {
            undo();
          }
          break;
        case 'y':
          event.preventDefault();
          if (canRedo) {
            redo();
          }
          break;
      }
    }
  };

  return { handleKeyDown };
};

// Middleware for automatically creating undo/redo actions
export const withUndoRedo = <T extends any>(
  action: T,
  entityType: string,
  entityId: string,
  description: string,
  data: any
): T => {
  return ((...args: any[]) => {
    const result = action(...args);
    
    // Add undo/redo action
    useUndoRedoStore.getState().addAction(
      createUndoRedoAction(
        'update',
        entityType,
        entityId,
        description,
        data
      )
    );
    
    return result;
  }) as T;
};

export default useUndoRedoStore;







