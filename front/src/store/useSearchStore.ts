import { create } from 'zustand';
import { Axios } from '../config/axios';

interface SearchState {
  query: string;
  results: any[];
  isSearching: boolean;
  error: string;
  filters: {
    genre?: string;
    minRating?: number;
    maxPrice?: number;
  };
}

interface SearchActions {
  setQuery: (query: string) => void;
  searchMovies: (query?: string) => Promise<void>;
  clearResults: () => void;
  setFilters: (filters: Partial<SearchState['filters']>) => void;
  clearFilters: () => void;
  clearError: () => void;
}

export const useSearchStore = create<SearchState & SearchActions>((set, get) => ({
  // Initial state
  query: '',
  results: [],
  isSearching: false,
  error: '',
  filters: {},

  // Actions
  setQuery: (query: string) => set({ query }),

  searchMovies: async (query?: string) => {
    const searchQuery = query || get().query;
    if (!searchQuery.trim()) {
      set({ results: [], isSearching: false });
      return;
    }

    set({ isSearching: true, error: '' });
    try {
      const response = await Axios.get(`/movie/search/${encodeURIComponent(searchQuery.trim())}`);
      const movieData = response.data;
      set({
        results: Array.isArray(movieData) ? movieData : [],
        isSearching: false,
      });
    } catch (err: any) {
      set({ 
        error: err.response?.data?.message || 'Search failed',
        isSearching: false,
        results: [],
      });
    }
  },

  clearResults: () => set({ results: [], query: '', error: '' }),

  setFilters: (filters: Partial<SearchState['filters']>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  clearFilters: () => set({ filters: {} }),

  clearError: () => set({ error: '' }),
}));
