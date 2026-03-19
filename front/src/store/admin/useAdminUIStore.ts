import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Modal {
  id: string;
  type: 'user_edit' | 'user_delete' | 'movie_edit' | 'movie_delete' | 'confirm' | 'alert';
  title: string;
  content?: string;
  data?: any;
  isOpen: boolean;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: string;
  read: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
}

interface AdminUIState {
  // Sidebar state
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  activeTab: string;
  
  // Modals
  modals: Modal[];
  activeModal: string | null;
  
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  
  // Loading states
  globalLoading: boolean;
  pageLoading: boolean;
  
  // Theme
  darkMode: boolean;
  compactMode: boolean;
  
  // Table states
  tableStates: Record<string, {
    currentPage: number;
    pageSize: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    selectedRows: string[];
    expandedRows: string[];
  }>;
  
  // Filters
  globalFilters: Record<string, any>;
  
  // Search
  globalSearchQuery: string;
  searchHistory: string[];
  
  // Layout
  layoutDensity: 'comfortable' | 'normal' | 'compact';
  showGridLines: boolean;
}

interface AdminUIActions {
  // Sidebar actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapse: () => void;
  setActiveTab: (tab: string) => void;
  
  // Modal actions
  openModal: (modal: Omit<Modal, 'isOpen'>) => void;
  closeModal: (modalId: string) => void;
  closeAllModals: () => void;
  
  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  
  // Loading actions
  setGlobalLoading: (loading: boolean) => void;
  setPageLoading: (loading: boolean) => void;
  
  // Theme actions
  toggleDarkMode: () => void;
  setDarkMode: (dark: boolean) => void;
  toggleCompactMode: () => void;
  
  // Table actions
  updateTableState: (tableId: string, updates: Partial<AdminUIState['tableStates'][string]>) => void;
  resetTableState: (tableId: string) => void;
  toggleTableRowSelection: (tableId: string, rowId: string) => void;
  toggleAllRowSelection: (tableId: string, rowIds: string[]) => void;
  toggleRowExpansion: (tableId: string, rowId: string) => void;
  
  // Filter actions
  setGlobalFilter: (key: string, value: any) => void;
  removeGlobalFilter: (key: string) => void;
  clearAllFilters: () => void;
  
  // Search actions
  setGlobalSearchQuery: (query: string) => void;
  addToSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  
  // Layout actions
  setLayoutDensity: (density: 'comfortable' | 'normal' | 'compact') => void;
  toggleGridLines: () => void;
}

export const useAdminUIStore = create<AdminUIState & AdminUIActions>()(
  persist(
    (set, get) => ({
      // Initial state
      sidebarOpen: true,
      sidebarCollapsed: false,
      activeTab: 'dashboard',
      
      modals: [],
      activeModal: null,
      
      notifications: [],
      unreadCount: 0,
      
      globalLoading: false,
      pageLoading: false,
      
      darkMode: false,
      compactMode: false,
      
      tableStates: {},
      
      globalFilters: {},
      
      globalSearchQuery: '',
      searchHistory: [],
      
      layoutDensity: 'normal',
      showGridLines: false,

      // Sidebar actions
      toggleSidebar: () => {
        set(state => ({ sidebarOpen: !state.sidebarOpen }));
      },

      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open });
      },

      toggleSidebarCollapse: () => {
        set(state => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },

      setActiveTab: (tab: string) => {
        set({ activeTab: tab });
      },

      // Modal actions
      openModal: (modal) => {
        const newModal: Modal = { ...modal, isOpen: true };
        set(state => ({
          modals: [...state.modals.filter(m => m.id !== modal.id), newModal],
          activeModal: modal.id,
        }));
      },

      closeModal: (modalId: string) => {
        set(state => ({
          modals: state.modals.map(m => 
            m.id === modalId ? { ...m, isOpen: false } : m
          ),
          activeModal: state.activeModal === modalId ? null : state.activeModal,
        }));
        
        // Remove modal after animation
        setTimeout(() => {
          set(state => ({
            modals: state.modals.filter(m => m.id !== modalId),
          }));
        }, 300);
      },

      closeAllModals: () => {
        set(state => ({
          modals: state.modals.map(m => ({ ...m, isOpen: false })),
          activeModal: null,
        }));
        
        setTimeout(() => {
          set({ modals: [] });
        }, 300);
      },

      // Notification actions
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          read: false,
          duration: notification.duration || 5000,
        };
        
        set(state => ({
          notifications: [newNotification, ...state.notifications].slice(0, 100),
          unreadCount: state.unreadCount + 1,
        }));
        
        // Auto-remove notification after duration
        if (newNotification.duration && newNotification.duration > 0) {
          setTimeout(() => {
            get().removeNotification(newNotification.id);
          }, newNotification.duration);
        }
      },

      removeNotification: (id: string) => {
        set(state => {
          const notification = state.notifications.find(n => n.id === id);
          return {
            notifications: state.notifications.filter(n => n.id !== id),
            unreadCount: notification && !notification.read 
              ? state.unreadCount - 1 
              : state.unreadCount,
          };
        });
      },

      markNotificationRead: (id: string) => {
        set(state => {
          const notification = state.notifications.find(n => n.id === id);
          return {
            notifications: state.notifications.map(n => 
              n.id === id ? { ...n, read: true } : n
            ),
            unreadCount: notification && !notification.read 
              ? state.unreadCount - 1 
              : state.unreadCount,
          };
        });
      },

      markAllNotificationsRead: () => {
        set(state => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },

      clearNotifications: () => {
        set({ notifications: [], unreadCount: 0 });
      },

      // Loading actions
      setGlobalLoading: (loading: boolean) => {
        set({ globalLoading: loading });
      },

      setPageLoading: (loading: boolean) => {
        set({ pageLoading: loading });
      },

      // Theme actions
      toggleDarkMode: () => {
        set(state => ({ darkMode: !state.darkMode }));
        
        // Apply dark mode class to document
        const root = document.documentElement;
        const newDarkMode = !get().darkMode;
        if (newDarkMode) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      },

      setDarkMode: (dark: boolean) => {
        set({ darkMode: dark });
        
        const root = document.documentElement;
        if (dark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      },

      toggleCompactMode: () => {
        set(state => ({ compactMode: !state.compactMode }));
      },

      // Table actions
      updateTableState: (tableId: string, updates) => {
        set(state => ({
          tableStates: {
            ...state.tableStates,
            [tableId]: {
              ...state.tableStates[tableId],
              currentPage: 1,
              pageSize: 10,
              sortBy: '',
              sortOrder: 'asc',
              selectedRows: [],
              expandedRows: [],
              ...updates,
            },
          },
        }));
      },

      resetTableState: (tableId: string) => {
        set(state => {
          const newTableStates = { ...state.tableStates };
          delete newTableStates[tableId];
          return { tableStates: newTableStates };
        });
      },

      toggleTableRowSelection: (tableId: string, rowId: string) => {
        set(state => {
          const tableState = state.tableStates[tableId] || {
            currentPage: 1,
            pageSize: 10,
            sortBy: '',
            sortOrder: 'asc',
            selectedRows: [],
            expandedRows: [],
          };
          
          const selectedRows = tableState.selectedRows.includes(rowId)
            ? tableState.selectedRows.filter(id => id !== rowId)
            : [...tableState.selectedRows, rowId];
          
          return {
            tableStates: {
              ...state.tableStates,
              [tableId]: { ...tableState, selectedRows },
            },
          };
        });
      },

      toggleAllRowSelection: (tableId: string, rowIds: string[]) => {
        set(state => {
          const tableState = state.tableStates[tableId] || {
            currentPage: 1,
            pageSize: 10,
            sortBy: '',
            sortOrder: 'asc',
            selectedRows: [],
            expandedRows: [],
          };
          
          const allSelected = rowIds.every(id => tableState.selectedRows.includes(id));
          const selectedRows = allSelected ? [] : rowIds;
          
          return {
            tableStates: {
              ...state.tableStates,
              [tableId]: { ...tableState, selectedRows },
            },
          };
        });
      },

      toggleRowExpansion: (tableId: string, rowId: string) => {
        set(state => {
          const tableState = state.tableStates[tableId] || {
            currentPage: 1,
            pageSize: 10,
            sortBy: '',
            sortOrder: 'asc',
            selectedRows: [],
            expandedRows: [],
          };
          
          const expandedRows = tableState.expandedRows.includes(rowId)
            ? tableState.expandedRows.filter(id => id !== rowId)
            : [...tableState.expandedRows, rowId];
          
          return {
            tableStates: {
              ...state.tableStates,
              [tableId]: { ...tableState, expandedRows },
            },
          };
        });
      },

      // Filter actions
      setGlobalFilter: (key: string, value: any) => {
        set(state => ({
          globalFilters: { ...state.globalFilters, [key]: value },
        }));
      },

      removeGlobalFilter: (key: string) => {
        set(state => {
          const newFilters = { ...state.globalFilters };
          delete newFilters[key];
          return { globalFilters: newFilters };
        });
      },

      clearAllFilters: () => {
        set({ globalFilters: {} });
      },

      // Search actions
      setGlobalSearchQuery: (query: string) => {
        set({ globalSearchQuery: query });
        
        if (query.trim()) {
          get().addToSearchHistory(query.trim());
        }
      },

      addToSearchHistory: (query: string) => {
        set(state => ({
          searchHistory: [query, ...state.searchHistory.filter(q => q !== query)].slice(0, 10),
        }));
      },

      clearSearchHistory: () => {
        set({ searchHistory: [] });
      },

      // Layout actions
      setLayoutDensity: (density: 'comfortable' | 'normal' | 'compact') => {
        set({ layoutDensity: density });
      },

      toggleGridLines: () => {
        set(state => ({ showGridLines: !state.showGridLines }));
      },
    }),
    {
      name: 'admin-ui-storage',
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        sidebarCollapsed: state.sidebarCollapsed,
        darkMode: state.darkMode,
        compactMode: state.compactMode,
        layoutDensity: state.layoutDensity,
        showGridLines: state.showGridLines,
        searchHistory: state.searchHistory,
      }),
    }
  )
);
