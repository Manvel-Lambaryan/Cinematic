import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface SyncState {
  isOnline: boolean;
  lastSyncTime: number;
  syncQueue: Array<{
    id: string;
    type: 'create' | 'update' | 'delete';
    store: string;
    data: any;
    timestamp: number;
    retries: number;
  }>;
  backgroundSyncActive: boolean;
  syncInProgress: boolean;
}

interface SyncActions {
  setOnlineStatus: (isOnline: boolean) => void;
  addToSyncQueue: (item: SyncState['syncQueue'][0]) => void;
  processSyncQueue: () => Promise<void>;
  clearSyncQueue: () => void;
  retryFailedOperations: () => Promise<void>;
  enableBackgroundSync: () => void;
  disableBackgroundSync: () => void;
}

export const useDataSyncManager = create<SyncState & SyncActions>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    isOnline: navigator.onLine,
    lastSyncTime: Date.now(),
    syncQueue: [],
    backgroundSyncActive: true,
    syncInProgress: false,

    // Network status management
    setOnlineStatus: (isOnline: boolean) => {
      set({ isOnline });
      
      // When coming back online, process sync queue
      if (isOnline && get().syncQueue.length > 0) {
        setTimeout(() => {
          get().processSyncQueue();
        }, 1000);
      }
    },

    // Sync queue management
    addToSyncQueue: (item) => {
      set(state => ({
        syncQueue: [...state.syncQueue, { ...item, timestamp: Date.now(), retries: 0 }]
      }));
    },

    // Process sync queue with exponential backoff
    processSyncQueue: async () => {
      const state = get();
      if (state.syncInProgress || state.syncQueue.length === 0 || !state.isOnline) {
        return;
      }

      set({ syncInProgress: true });

      try {
        const queue = [...state.syncQueue];
        const failedOperations: typeof state.syncQueue = [];

        for (const operation of queue) {
          try {
            // Exponential backoff for retries
            const delay = Math.min(1000 * Math.pow(2, operation.retries), 30000);
            if (operation.retries > 0) {
              await new Promise(resolve => setTimeout(resolve, delay));
            }

            // Execute the operation based on store and type
            await executeSyncOperation(operation);
            
          } catch (error) {
            console.error(`Sync operation failed:`, operation, error);
            
            // Add to failed operations if retries < 3
            if (operation.retries < 3) {
              failedOperations.push({
                ...operation,
                retries: operation.retries + 1
              });
            }
          }
        }

        // Update queue with failed operations
        set(state => ({
          syncQueue: failedOperations,
          syncInProgress: false,
          lastSyncTime: Date.now()
        }));

      } catch (error) {
        console.error('Sync queue processing failed:', error);
        set({ syncInProgress: false });
      }
    },

    clearSyncQueue: () => set({ syncQueue: [] }),

    retryFailedOperations: async () => {
      await get().processSyncQueue();
    },

    enableBackgroundSync: () => set({ backgroundSyncActive: true }),

    disableBackgroundSync: () => set({ backgroundSyncActive: false }),
  }))
);

// Execute sync operations based on store and type
async function executeSyncOperation(operation: SyncState['syncQueue'][0]) {
  const { store, type, data } = operation;
  
  // This would integrate with your actual stores
  // For now, it's a placeholder that would be implemented based on your store structure
  
  switch (store) {
    case 'admin':
      // Handle admin store operations
      break;
    case 'movies':
      // Handle movie store operations
      break;
    case 'auth':
      // Handle auth store operations
      break;
    default:
      console.warn(`Unknown store for sync: ${store}`);
  }
}

// Network event listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useDataSyncManager.getState().setOnlineStatus(true);
  });

  window.addEventListener('offline', () => {
    useDataSyncManager.getState().setOnlineStatus(false);
  });
}

// Background sync interval (every 5 minutes when online)
setInterval(() => {
  const state = useDataSyncManager.getState();
  if (state.backgroundSyncActive && state.isOnline && state.syncQueue.length > 0) {
    state.processSyncQueue();
  }
}, 5 * 60 * 1000);

// Optimized selectors
export const useSyncStatus = () => {
  const isOnline = useDataSyncManager(state => state.isOnline);
  const syncInProgress = useDataSyncManager(state => state.syncInProgress);
  const queueLength = useDataSyncManager(state => state.syncQueue.length);
  
  return { isOnline, syncInProgress, queueLength };
};

export const useSyncActions = () => {
  const processSyncQueue = useDataSyncManager(state => state.processSyncQueue);
  const retryFailedOperations = useDataSyncManager(state => state.retryFailedOperations);
  const clearSyncQueue = useDataSyncManager(state => state.clearSyncQueue);
  
  return { processSyncQueue, retryFailedOperations, clearSyncQueue };
};
