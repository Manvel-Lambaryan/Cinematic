import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Axios } from '../config/axios';
import { API_URL } from '../config/axios';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  balance?: number;
  loginAttempts?: number;
  lockUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminState {
  users: User[];
  usersLoading: boolean;
  usersError: string;
  selectedUser: User | null;
  isUserEditModalOpen: boolean;
  optimisticUpdates: Map<string, User>; // Track optimistic changes
  pendingOperations: Map<string, Promise<any>>; // Track ongoing operations
  lastSyncTime: number;
}

export interface AdminActions {
  // Optimistic CRUD operations
  fetchUsers: () => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  
  // UI state management
  setSelectedUser: (user: User | null) => void;
  toggleUserEditModal: () => void;
  clearUsersError: () => void;
  
  // Optimistic update management
  rollbackUser: (id: string) => void;
  clearOptimisticUpdates: () => void;
  
  // Background sync
  syncUsers: () => Promise<void>;
  isDataStale: () => boolean;
}

export const useAdminOptimisticStore = create<AdminState & AdminActions>()(
  persist(
    (set, get) => ({
      // Initial state
      users: [],
      usersLoading: false,
      usersError: '',
      selectedUser: null,
      isUserEditModalOpen: false,
      optimisticUpdates: new Map(),
      pendingOperations: new Map(),
      lastSyncTime: Date.now(),

      // Optimistic fetch with stale-while-revalidate
      fetchUsers: async () => {
        const state = get();
        
        // If we have cached data and it's not stale, return immediately
        if (state.users.length > 0 && !state.isDataStale()) {
          set({ usersLoading: false });
          return;
        }

        set({ usersLoading: true, usersError: '' });
        
        try {
          const response = await Axios.get('/admin/get-users');
          const usersData = response.data.data || response.data;
          
          set({
            users: Array.isArray(usersData) ? usersData : [],
            usersLoading: false,
            lastSyncTime: Date.now(),
          });
        } catch (err: any) {
          set({ 
            usersError: err.response?.data?.message || 'Failed to fetch users',
            usersLoading: false,
          });
        }
      },

      // Optimistic update with rollback
      updateUser: async (id: string, updates: Partial<User>) => {
        const state = get();
        const originalUser = state.users.find(u => u._id === id);
        
        if (!originalUser) return;

        // Store original state for rollback
        const optimisticUpdates = new Map(state.optimisticUpdates);
        optimisticUpdates.set(id, originalUser);

        // Apply optimistic update immediately
        const updatedUsers = state.users.map(user =>
          user._id === id ? { ...user, ...updates } : user
        );

        set({
          users: updatedUsers,
          optimisticUpdates,
        });

        // API call with error handling and rollback
        try {
          const operation = Axios.put(`/admin/user/${id}`, updates);
          
          // Track the operation
          const pendingOperations = new Map(state.pendingOperations);
          pendingOperations.set(`update-${id}`, operation);
          set({ pendingOperations });

          const response = await operation;
          const updatedUser = response.data.data || response.data;

          // Update with server response
          set(state => {
            const newOptimisticUpdates = new Map(state.optimisticUpdates);
            newOptimisticUpdates.delete(id);
            const newPendingOperations = new Map(state.pendingOperations);
            newPendingOperations.delete(`update-${id}`);
            
            return {
              users: state.users.map(user =>
                user._id === id ? updatedUser : user
              ),
              optimisticUpdates: newOptimisticUpdates,
              pendingOperations: newPendingOperations,
            };
          });

        } catch (err: any) {
          // Rollback on error
          get().rollbackUser(id);
          set(state => {
            const newPendingOperations = new Map(state.pendingOperations);
            newPendingOperations.delete(`delete-${id}`);
            
            return {
              usersError: err.response?.data?.message || 'Failed to update user',
              pendingOperations: newPendingOperations,
            };
          });
        }
      },

      // Optimistic delete with rollback
      deleteUser: async (id: string) => {
        const state = get();
        const originalUser = state.users.find(u => u._id === id);
        
        if (!originalUser) return;

        // Store original state for rollback
        const optimisticUpdates = new Map(state.optimisticUpdates);
        optimisticUpdates.set(id, originalUser);

        // Apply optimistic delete immediately
        const updatedUsers = state.users.filter(user => user._id !== id);
        
        set({
          users: updatedUsers,
          optimisticUpdates,
        });

        try {
          const operation = Axios.delete(`/admin/user/${id}`);
          
          // Track the operation
          const pendingOperations = new Map(state.pendingOperations);
          pendingOperations.set(`delete-${id}`, operation);
          set({ pendingOperations });

          await operation;

          // Remove from optimistic updates on success
          set(state => {
            const newOptimisticUpdates = new Map(state.optimisticUpdates);
            newOptimisticUpdates.delete(id);
            const newPendingOperations = new Map(state.pendingOperations);
            newPendingOperations.delete(`delete-${id}`);
            
            return {
              optimisticUpdates: newOptimisticUpdates,
              pendingOperations: newPendingOperations,
            };
          });

        } catch (err: any) {
          // Rollback on error
          get().rollbackUser(id);
          set(state => {
            const newPendingOperations = new Map(state.pendingOperations);
            newPendingOperations.delete(`delete-${id}`);
            
            return {
              usersError: err.response?.data?.message || 'Failed to delete user',
              pendingOperations: newPendingOperations,
            };
          });
        }
      },

      // UI state management
      setSelectedUser: (user: User | null) => set({ selectedUser: user }),
      toggleUserEditModal: () => set(state => ({ isUserEditModalOpen: !state.isUserEditModalOpen })),
      clearUsersError: () => set({ usersError: '' }),

      // Rollback mechanism
      rollbackUser: (id: string) => {
        const state = get();
        const originalUser = state.optimisticUpdates.get(id);
        
        if (originalUser) {
          set(state => {
            const newOptimisticUpdates = new Map(state.optimisticUpdates);
            newOptimisticUpdates.delete(id);
            
            return {
              users: state.users.some(u => u._id === id) 
                ? state.users.map(user => user._id === id ? originalUser : user)
                : [...state.users, originalUser],
              optimisticUpdates: newOptimisticUpdates,
            };
          });
        }
      },

      clearOptimisticUpdates: () => set({ optimisticUpdates: new Map() }),

      // Background sync
      syncUsers: async () => {
        const state = get();
        
        // Only sync if there are no pending operations
        if (state.pendingOperations.size === 0) {
          await get().fetchUsers();
        }
      },

      // Check if data is stale (5 minutes)
      isDataStale: () => {
        const state = get();
        return Date.now() - state.lastSyncTime > 5 * 60 * 1000;
      },
    }),
    {
      name: 'admin-optimistic-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        users: state.users,
        lastSyncTime: state.lastSyncTime,
        // Don't persist loading states, errors, or optimistic updates
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Mark as hydrated and trigger background sync
          state.usersLoading = false;
          // Trigger background refresh to ensure data is fresh
          setTimeout(() => {
            const store = useAdminOptimisticStore.getState();
            if (store.isDataStale()) {
              store.syncUsers();
            }
          }, 100);
        }
      },
    }
  )
);

// Optimized selectors with memoization
export const useAdminUsers = () => {
  const users = useAdminOptimisticStore((state) => state.users);
  const usersLoading = useAdminOptimisticStore((state) => state.usersLoading);
  const usersError = useAdminOptimisticStore((state) => state.usersError);
  const optimisticUpdates = useAdminOptimisticStore((state) => state.optimisticUpdates);
  
  return { users, usersLoading, usersError, optimisticUpdates };
};

export const useAdminActions = () => {
  const fetchUsers = useAdminOptimisticStore((state) => state.fetchUsers);
  const updateUser = useAdminOptimisticStore((state) => state.updateUser);
  const deleteUser = useAdminOptimisticStore((state) => state.deleteUser);
  const clearUsersError = useAdminOptimisticStore((state) => state.clearUsersError);
  
  return { fetchUsers, updateUser, deleteUser, clearUsersError };
};

export const useAdminUI = () => {
  const selectedUser = useAdminOptimisticStore((state) => state.selectedUser);
  const isUserEditModalOpen = useAdminOptimisticStore((state) => state.isUserEditModalOpen);
  const setSelectedUser = useAdminOptimisticStore((state) => state.setSelectedUser);
  const toggleUserEditModal = useAdminOptimisticStore((state) => state.toggleUserEditModal);
  
  return { selectedUser, isUserEditModalOpen, setSelectedUser, toggleUserEditModal };
};
