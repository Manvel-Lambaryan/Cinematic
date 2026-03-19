import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Axios } from '../config/axios';
import { jwtDecode } from 'jwt-decode';

interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  balance: number;
  role: 'admin' | 'user';
}

export type { User };

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  error: string;
  isLocked: boolean;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateBalance: (newBalance: number) => void;
  fetchUserData: () => Promise<void>;
  setLocked: (locked: boolean) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      loading: false,
      error: '',
      isLocked: false,

      // Actions
      login: async (email: string, password: string) => {
        if (get().isLocked) return;
        
        set({ loading: true, error: '' });
        try {
          const response = await Axios.post('/auth/login', { email, password });
          const { accessToken, user } = response.data;
          const decoded = jwtDecode<any>(accessToken);
          
          // Use user data from login response (backend already provides it)
          const userData = user || {
            id: decoded.id,
            _id: decoded.id,
            name: decoded.username,
            email: email,
            balance: 0,
            role: decoded.role,
          };
          
          set({
            token: accessToken,
            user: userData,
            isAuthenticated: true,
            isAdmin: decoded.role === 'admin',
            loading: false,
            error: '',
          });
          
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (err: any) {
          const errorMessage = err.response?.data?.error || 'Invalid credentials';
          set({ 
            error: errorMessage,
            loading: false,
          });

          // Lock account if error contains "locked" or "blocked"
          if (errorMessage.toLowerCase().includes('locked') || 
              errorMessage.toLowerCase().includes('blocked')) {
            set({ isLocked: true });
            setTimeout(() => set({ isLocked: false }), 180000);
          }
        }
      },

      googleLogin: async (credential: string) => {
        set({ loading: true, error: '' });
        try {
          const res = await Axios.post('/auth/google-login', { token: credential });
          
          if (res.data.accessToken) {
            const decoded = jwtDecode<any>(res.data.accessToken);
            
            // Fetch user data
            const userRes = await Axios.get('/auth/user');
            const userData = userRes.data.data || userRes.data;
            
            set({
              token: res.data.accessToken,
              user: userData,
              isAuthenticated: true,
              isAdmin: decoded.role === 'admin',
              loading: false,
              error: '',
            });
            
            localStorage.setItem('accessToken', res.data.accessToken);
            localStorage.setItem('user', JSON.stringify(userData));
          }
        } catch (err: any) {
          set({ 
            error: err.response?.data?.message || 'Google login failed',
            loading: false,
          });
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ loading: true, error: '' });
        try {
          const response = await Axios.post('/auth/register', { name, email, password });
          const { accessToken } = response.data;
          const decoded = jwtDecode<any>(accessToken);
          
          // Register endpoint only returns tokens, so fetch user data
          const userRes = await Axios.get('/auth/user');
          const userData = userRes.data.data || userRes.data;
          
          set({
            token: accessToken,
            user: userData,
            isAuthenticated: true,
            isAdmin: decoded.role === 'admin',
            loading: false,
            error: '',
          });
          
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (err: any) {
          set({ 
            error: err.response?.data?.error || 'Registration failed',
            loading: false,
          });
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isAdmin: false,
          error: '',
          isLocked: false,
        });
        localStorage.clear();
      },

      clearError: () => set({ error: '' }),

      updateBalance: (newBalance: number) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, balance: newBalance };
          set({ user: updatedUser });
          localStorage.setItem('user', JSON.stringify(updatedUser));
          // Notify other components of the change
          window.dispatchEvent(new Event('storage'));
        }
      },

      fetchUserData: async () => {
        try {
          const res = await Axios.get('/auth/user');
          const userData = res.data.data || res.data;
          set({ user: userData });
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
          get().logout();
        }
      },

      setLocked: (locked: boolean) => set({ isLocked: locked }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
      }),
    }
  )
);
