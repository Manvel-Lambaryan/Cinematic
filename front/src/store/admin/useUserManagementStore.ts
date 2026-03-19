import { create } from 'zustand';
import { Axios } from '../../config/axios';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  balance: number;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface UserManagementState {
  users: User[];
  filteredUsers: User[];
  selectedUser: User | null;
  loading: boolean;
  error: string;
  searchQuery: string;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  sortBy: 'name' | 'email' | 'createdAt' | 'balance';
  sortOrder: 'asc' | 'desc';
  roleFilter: string;
  statusFilter: 'all' | 'active' | 'inactive';
  isEditModalOpen: boolean;
  isDeleteModalOpen: boolean;
  optimisticUpdates: Map<string, Partial<User>>;
}

interface UserManagementActions {
  fetchUsers: (page?: number, filters?: any) => Promise<void>;
  searchUsers: (query: string) => void;
  sortUsers: (sortBy: string, order: 'asc' | 'desc') => void;
  filterUsers: (role: string, status: string) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  selectUser: (user: User | null) => void;
  openEditModal: (user: User) => void;
  closeEditModal: () => void;
  openDeleteModal: (user: User) => void;
  closeDeleteModal: () => void;
  updateUser: (userId: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  toggleUserStatus: (userId: string) => Promise<void>;
  updateUserBalance: (userId: string, newBalance: number) => Promise<void>;
  clearError: () => void;
  resetFilters: () => void;
  // Optimistic updates
  optimisticUpdateUser: (userId: string, updates: Partial<User>) => void;
  commitOptimisticUpdate: (userId: string) => void;
  rollbackOptimisticUpdate: (userId: string) => void;
}

export const useUserManagementStore = create<UserManagementState & UserManagementActions>((set, get) => ({
  // Initial state
  users: [],
  filteredUsers: [],
  selectedUser: null,
  loading: false,
  error: '',
  searchQuery: '',
  currentPage: 1,
  totalPages: 1,
  pageSize: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
  roleFilter: '',
  statusFilter: 'all',
  isEditModalOpen: false,
  isDeleteModalOpen: false,
  optimisticUpdates: new Map(),

  // Actions
  fetchUsers: async (page = 1, filters = {}) => {
    set({ loading: true, error: '' });
    
    try {
      const response = await Axios.get('/admin/get-users');
      const raw = response.data;
      const users = Array.isArray(raw) ? raw : (raw?.data ?? raw ?? []);
      
      const filtered = get().searchQuery.trim()
        ? users.filter((u: User) =>
            u.name.toLowerCase().includes(get().searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(get().searchQuery.toLowerCase())
          )
        : users;
      const totalPages = Math.max(1, Math.ceil(filtered.length / get().pageSize));
      
      set({
        users,
        filteredUsers: filtered,
        totalPages,
        currentPage: page,
        loading: false,
      });
      
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to fetch users',
        loading: false,
      });
    }
  },

  searchUsers: (query: string) => {
    set({ searchQuery: query, currentPage: 1 });
    
    const { users, roleFilter, statusFilter } = get();
    let filtered = users;
    
    // Apply search filter
    if (query.trim()) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Apply role filter
    if (roleFilter) {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => 
        statusFilter === 'active' ? user.isActive : !user.isActive
      );
    }
    
    set({ filteredUsers: filtered });
  },

  sortUsers: (sortBy: string, order: 'asc' | 'desc') => {
    set({ sortBy: sortBy as any, sortOrder: order });
    
    const { filteredUsers } = get();
    const sorted = [...filteredUsers].sort((a, b) => {
      const aValue = a[sortBy as keyof User];
      const bValue = b[sortBy as keyof User];
      
      if (aValue === undefined || bValue === undefined) return 0;
      
      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      }
      
      return order === 'asc' ? comparison : -comparison;
    });
    
    set({ filteredUsers: sorted });
  },

  filterUsers: (role: string, status: string) => {
    set({ roleFilter: role, statusFilter: status as any, currentPage: 1 });
    get().searchUsers(get().searchQuery); // Re-apply search with new filters
  },

  setCurrentPage: (page: number) => {
    set({ currentPage: page });
    get().fetchUsers(page);
  },

  setPageSize: (size: number) => {
    set({ pageSize: size, currentPage: 1 });
    get().fetchUsers(1);
  },

  selectUser: (user: User | null) => {
    set({ selectedUser: user });
  },

  openEditModal: (user: User) => {
    set({ selectedUser: user, isEditModalOpen: true });
  },

  closeEditModal: () => {
    set({ isEditModalOpen: false, selectedUser: null });
  },

  openDeleteModal: (user: User) => {
    set({ selectedUser: user, isDeleteModalOpen: true });
  },

  closeDeleteModal: () => {
    set({ isDeleteModalOpen: false, selectedUser: null });
  },

  updateUser: async (userId: string, updates: Partial<User>) => {
    get().optimisticUpdateUser(userId, updates);
    
    try {
      const response = await Axios.put(`/admin/user/${userId}`, updates);
      const updatedUser = response.data?.data ?? response.data;
      
      get().commitOptimisticUpdate(userId);
      
      const { users, filteredUsers } = get();
      const updateInArray = (arr: User[]) => 
        arr.map(user => user._id === userId ? { ...user, ...updatedUser } : user);
      
      set({
        users: updateInArray(users),
        filteredUsers: updateInArray(filteredUsers),
      });
      
    } catch (err: any) {
      get().rollbackOptimisticUpdate(userId);
      set({
        error: err.response?.data?.message || 'Failed to update user',
      });
    }
  },

  deleteUser: async (userId: string) => {
    const { users, filteredUsers } = get();
    const originalUsers = users;
    const originalFilteredUsers = filteredUsers;
    
    set({
      users: users.filter(user => user._id !== userId),
      filteredUsers: filteredUsers.filter(user => user._id !== userId),
    });
    
    try {
      await Axios.delete(`/admin/user/${userId}`);
      get().closeDeleteModal();
    } catch (err: any) {
      set({
        users: originalUsers,
        filteredUsers: originalFilteredUsers,
        error: err.response?.data?.message || 'Failed to delete user',
      });
    }
  },

  toggleUserStatus: async (userId: string) => {
    const { users } = get();
    const user = users.find(u => u._id === userId);
    if (!user) return;
    const newStatus = !(user as any).isActive;
    get().optimisticUpdateUser(userId, { isActive: newStatus } as Partial<User>);
    try {
      await Axios.put(`/admin/user/${userId}`, { isActive: newStatus });
      get().commitOptimisticUpdate(userId);
    } catch (err: any) {
      get().rollbackOptimisticUpdate(userId);
      set({ error: err.response?.data?.message || 'Failed to toggle user status' });
    }
  },

  updateUserBalance: async (userId: string, newBalance: number) => {
    get().optimisticUpdateUser(userId, { balance: newBalance });
    try {
      await Axios.put(`/admin/user/${userId}`, { balance: newBalance });
      get().commitOptimisticUpdate(userId);
    } catch (err: any) {
      get().rollbackOptimisticUpdate(userId);
      set({ error: err.response?.data?.message || 'Failed to update user balance' });
    }
  },

  clearError: () => set({ error: '' }),

  resetFilters: () => {
    set({
      searchQuery: '',
      roleFilter: '',
      statusFilter: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      currentPage: 1,
    });
    get().fetchUsers(1);
  },

  // Optimistic update methods
  optimisticUpdateUser: (userId: string, updates: Partial<User>) => {
    const { optimisticUpdates } = get();
    optimisticUpdates.set(userId, updates);
    set({ optimisticUpdates: new Map(optimisticUpdates) });
    
    // Apply optimistic update to UI immediately
    const { users, filteredUsers } = get();
    const applyOptimisticUpdate = (arr: User[]) =>
      arr.map(user => 
        user._id === userId ? { ...user, ...updates } : user
      );
    
    set({
      users: applyOptimisticUpdate(users),
      filteredUsers: applyOptimisticUpdate(filteredUsers),
    });
  },

  commitOptimisticUpdate: (userId: string) => {
    const { optimisticUpdates } = get();
    optimisticUpdates.delete(userId);
    set({ optimisticUpdates: new Map(optimisticUpdates) });
  },

  rollbackOptimisticUpdate: (userId: string) => {
    const { optimisticUpdates, users, filteredUsers } = get();
    const originalUpdate = optimisticUpdates.get(userId);
    
    if (originalUpdate) {
      optimisticUpdates.delete(userId);
      set({ optimisticUpdates: new Map(optimisticUpdates) });
      
      // Re-fetch to get original state
      get().fetchUsers(get().currentPage);
    }
  },
}));
