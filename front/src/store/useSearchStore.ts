import { create } from 'zustand';
import { Axios } from '../config/axios';

interface SearchState {
  query: string;
  results: any[];
  isSearching: boolean;
  /** Վերջին հաջող որոնումը արդյունք չի տվել (dropdown-ում «No matches») */
  lastSearchEmpty: boolean;
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
  lastSearchEmpty: false,
  error: '',
  filters: {},

  // Actions
  setQuery: (query: string) => set({ query }),

  searchMovies: async (query?: string) => {
    const searchQuery = query || get().query;
    if (!searchQuery.trim()) {
      set({ results: [], isSearching: false, lastSearchEmpty: false, error: '' });
      return;
    }

    set({ isSearching: true, error: '', lastSearchEmpty: false });
    try {
      const response = await Axios.get(`/movie/search/${encodeURIComponent(searchQuery.trim())}`);
      const raw = response.data;
      const movieData = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
          ? raw.data
          : [];
      set({
        results: movieData,
        isSearching: false,
        lastSearchEmpty: movieData.length === 0,
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || 'Search failed',
        isSearching: false,
        results: [],
        lastSearchEmpty: false,
      });
    }
  },

  clearResults: () => set({ results: [], query: '', error: '', lastSearchEmpty: false }),

  setFilters: (filters: Partial<SearchState['filters']>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  clearFilters: () => set({ filters: {} }),

  clearError: () => set({ error: '' }),
}));
