import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Axios } from '../../config/axios';
import { jwtDecode } from 'jwt-decode';

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
  permissions: string[];
  lastLogin?: string;
  isActive: boolean;
}

interface AdminAuthState {
  admin: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  permissions: string[];
  loading: boolean;
  error: string;
  sessionTimeout: number;
}

interface AdminAuthActions {
  adminLogin: (email: string, password: string) => Promise<void>;
  adminLogout: () => void;
  refreshAdminSession: () => Promise<void>;
  checkPermissions: (requiredPermission: string) => boolean;
  checkRole: (requiredRole: 'admin' | 'super_admin') => boolean;
  updateLastLogin: () => void;
  clearError: () => void;
  setSessionTimeout: (minutes: number) => void;
}

export const useAdminAuthStore = create<AdminAuthState & AdminAuthActions>()(
  persist(
    (set, get) => ({
      // Initial state
      admin: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      isSuperAdmin: false,
      permissions: [],
      loading: false,
      error: '',
      sessionTimeout: 30, // 30 minutes default

      // Actions
      adminLogin: async (email: string, password: string) => {
        set({ loading: true, error: '' });
        
        try {
          const response = await Axios.post('/auth/admin/login', { email, password });
          const { token, admin } = response.data;
          
          if (!token || !admin) {
            throw new Error('Invalid admin credentials');
          }

          const decoded = jwtDecode<any>(token);
          
          set({
            token,
            admin,
            isAuthenticated: true,
            isAdmin: decoded.role === 'admin' || decoded.role === 'super_admin',
            isSuperAdmin: decoded.role === 'super_admin',
            permissions: admin.permissions || [],
            loading: false,
            error: '',
          });

          // Set session timeout check
          get().setSessionTimeout(30);
          
        } catch (err: any) {
          set({
            error: err.response?.data?.message || 'Admin login failed',
            loading: false,
          });
        }
      },

      adminLogout: () => {
        set({
          admin: null,
          token: null,
          isAuthenticated: false,
          isAdmin: false,
          isSuperAdmin: false,
          permissions: [],
          error: '',
        });
      },

      refreshAdminSession: async () => {
        const { token } = get();
        if (!token) return;

        try {
          const response = await Axios.get('/auth/admin/verify', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const { admin } = response.data;
          set({ admin, permissions: admin.permissions || [] });
          
        } catch (err) {
          // Token expired or invalid, logout
          get().adminLogout();
        }
      },

      checkPermissions: (requiredPermission: string) => {
        const { permissions, isSuperAdmin } = get();
        return isSuperAdmin || permissions.includes(requiredPermission);
      },

      checkRole: (requiredRole: 'admin' | 'super_admin') => {
        const { isAdmin, isSuperAdmin } = get();
        
        if (requiredRole === 'super_admin') {
          return isSuperAdmin;
        }
        
        return isAdmin || isSuperAdmin;
      },

      updateLastLogin: async () => {
        const { admin } = get();
        if (!admin) return;

        try {
          await Axios.patch('/auth/admin/last-login', { adminId: admin._id });
        } catch (err) {
          console.error('Failed to update last login:', err);
        }
      },

      clearError: () => set({ error: '' }),

      setSessionTimeout: (minutes: number) => {
        set({ sessionTimeout: minutes });
        
        // Set up session timeout warning
        setTimeout(() => {
          const { isAuthenticated } = get();
          if (isAuthenticated) {
            // Show session timeout warning
            console.warn('Admin session expiring soon');
          }
        }, (minutes - 5) * 60 * 1000); // 5 minutes before expiry
      },
    }),
    {
      name: 'admin-auth-storage',
      partialize: (state) => ({
        token: state.token,
        admin: state.admin,
        isAuthenticated: state.isAuthenticated,
        permissions: state.permissions,
      }),
    }
  )
);
