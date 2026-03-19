import { create } from 'zustand';
import { Axios } from '../../config/axios';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalMovies: number;
  totalBookings: number;
  totalRevenue: number;
  monthlyRevenue: number;
  newUsersThisMonth: number;
  popularMovies: Array<{
    _id: string;
    title: string;
    bookings: number;
    revenue: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: 'user_registered' | 'booking_made' | 'movie_added' | 'payment_processed';
    description: string;
    timestamp: string;
    userId?: string;
    movieId?: string;
  }>;
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }>;
}

interface DashboardState {
  stats: DashboardStats | null;
  loading: boolean;
  error: string;
  lastUpdated: string;
  refreshInterval: number;
  autoRefresh: boolean;
  
  // Chart data
  revenueChart: ChartData | null;
  bookingsChart: ChartData | null;
  usersChart: ChartData | null;
  
  // Filters
  dateRange: {
    start: string;
    end: string;
  };
  selectedPeriod: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  selectedCategory: 'all' | 'movies' | 'users' | 'bookings' | 'revenue';
  
  // UI State
  isRefreshing: boolean;
  notifications: Array<{
    id: string;
    type: 'success' | 'warning' | 'error' | 'info';
    message: string;
    timestamp: string;
    read: boolean;
  }>;
}

interface DashboardActions {
  fetchDashboardStats: (filters?: any) => Promise<void>;
  fetchChartData: (chartType: string, period: string) => Promise<void>;
  setDateRange: (start: string, end: string) => void;
  setSelectedPeriod: (period: string) => void;
  setSelectedCategory: (category: string) => void;
  refreshData: () => Promise<void>;
  toggleAutoRefresh: () => void;
  setRefreshInterval: (seconds: number) => void;
  addNotification: (notification: Omit<DashboardState['notifications'][0], 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  exportData: (format: 'csv' | 'json' | 'pdf') => Promise<void>;
  clearError: () => void;
}

export const useDashboardStore = create<DashboardState & DashboardActions>((set, get) => ({
  // Initial state
  stats: null,
  loading: false,
  error: '',
  lastUpdated: '',
  refreshInterval: 60, // 60 seconds
  autoRefresh: true,
  
  revenueChart: null,
  bookingsChart: null,
  usersChart: null,
  
  dateRange: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end: new Date().toISOString().split('T')[0], // today
  },
  selectedPeriod: 'month',
  selectedCategory: 'all',
  
  isRefreshing: false,
  notifications: [],

  // Actions
  fetchDashboardStats: async (filters = {}) => {
    set({ loading: true, error: '' });
    
    try {
      const params = {
        dateRange: get().dateRange,
        period: get().selectedPeriod,
        category: get().selectedCategory,
        ...filters,
      };

      const response = await Axios.get('/admin/dashboard/stats', { params });
      const stats = response.data;
      
      set({
        stats,
        loading: false,
        lastUpdated: new Date().toISOString(),
      });
      
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to fetch dashboard stats',
        loading: false,
      });
    }
  },

  fetchChartData: async (chartType: string, period: string) => {
    try {
      const params = {
        chartType,
        period,
        dateRange: get().dateRange,
      };

      const response = await Axios.get('/admin/dashboard/charts', { params });
      const chartData = response.data;
      
      // Update the appropriate chart data
      switch (chartType) {
        case 'revenue':
          set({ revenueChart: chartData });
          break;
        case 'bookings':
          set({ bookingsChart: chartData });
          break;
        case 'users':
          set({ usersChart: chartData });
          break;
      }
      
    } catch (err: any) {
      console.error(`Failed to fetch ${chartType} chart data:`, err);
    }
  },

  setDateRange: (start: string, end: string) => {
    set({ 
      dateRange: { start, end },
      selectedPeriod: 'custom'
    });
    get().fetchDashboardStats();
  },

  setSelectedPeriod: (period: string) => {
    set({ selectedPeriod: period as any });
    
    // Update date range based on period
    const now = new Date();
    let start: Date;
    let end: Date = now;
    
    switch (period) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        start = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return;
    }
    
    set({
      dateRange: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
      }
    });
    
    get().fetchDashboardStats();
  },

  setSelectedCategory: (category: string) => {
    set({ selectedCategory: category as any });
    get().fetchDashboardStats();
  },

  refreshData: async () => {
    set({ isRefreshing: true });
    
    try {
      await get().fetchDashboardStats();
      
      // Refresh all chart data
      await Promise.all([
        get().fetchChartData('revenue', get().selectedPeriod),
        get().fetchChartData('bookings', get().selectedPeriod),
        get().fetchChartData('users', get().selectedPeriod),
      ]);
      
      set({ isRefreshing: false });
      
    } catch (err) {
      set({ isRefreshing: false });
    }
  },

  toggleAutoRefresh: () => {
    const newAutoRefresh = !get().autoRefresh;
    set({ autoRefresh: newAutoRefresh });
    
    if (newAutoRefresh) {
      // Start auto refresh interval
      const interval = setInterval(() => {
        if (get().autoRefresh) {
          get().refreshData();
        }
      }, get().refreshInterval * 1000);
      
      // Store interval ID for cleanup (in a real app, you'd manage this properly)
      (window as any).__dashboardRefreshInterval = interval;
    } else {
      // Clear existing interval
      const interval = (window as any).__dashboardRefreshInterval;
      if (interval) {
        clearInterval(interval);
        delete (window as any).__dashboardRefreshInterval;
      }
    }
  },

  setRefreshInterval: (seconds: number) => {
    set({ refreshInterval: seconds });
    
    // Restart auto refresh with new interval if it's enabled
    if (get().autoRefresh) {
      get().toggleAutoRefresh(); // Turn off
      get().toggleAutoRefresh(); // Turn on with new interval
    }
  },

  addNotification: (notification) => {
    const newNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    
    set(state => ({
      notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep only 50 most recent
    }));
  },

  markNotificationRead: (id: string) => {
    set(state => ({
      notifications: state.notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },

  exportData: async (format: 'csv' | 'json' | 'pdf') => {
    try {
      const params = {
        format,
        dateRange: get().dateRange,
        category: get().selectedCategory,
      };

      const response = await Axios.get('/admin/dashboard/export', { 
        params,
        responseType: format === 'pdf' ? 'blob' : 'json'
      });

      // Handle file download
      if (format === 'pdf') {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const data = response.data;
        const blob = new Blob([JSON.stringify(data, null, 2)], { 
          type: format === 'csv' ? 'text/csv' : 'application/json' 
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
      }

      get().addNotification({
        type: 'success',
        message: `Dashboard data exported successfully as ${format.toUpperCase()}`,
      });
      
    } catch (err: any) {
      get().addNotification({
        type: 'error',
        message: 'Failed to export dashboard data',
      });
    }
  },

  clearError: () => set({ error: '' }),
}));
