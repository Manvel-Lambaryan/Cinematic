import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Axios } from '../config/axios';
import { API_URL } from '../config/axios';

export interface Movie {
  _id: string;
  title: string;
  description?: string;
  genre?: string;
  imageUrl?: string;
  posterUrl?: string;
  price?: number;
  duration?: number;
  rating?: number;
  releaseDate?: string;
}

interface MovieState {
  movies: Movie[];
  heroMovies: Movie[];
  currentMovie: Movie | null;
  loading: boolean;
  error: string;
  imgIndex: number;
}

interface MovieActions {
  fetchMovies: () => Promise<void>;
  fetchMovieById: (id: string) => Promise<void>;
  setCurrentMovie: (movie: Movie | null) => void;
  setImgIndex: (index: number) => void;
  nextImage: () => void;
  clearError: () => void;
  getFullImageUrl: (path: string) => string;
}

// Optimized selectors for better performance
export const useMovieSelectors = {
  movies: (state: MovieState) => state.movies,
  heroMovies: (state: MovieState) => state.heroMovies,
  currentMovie: (state: MovieState) => state.currentMovie,
  loading: (state: MovieState) => state.loading,
  error: (state: MovieState) => state.error,
  imgIndex: (state: MovieState) => state.imgIndex,
};

export const useMovieStore = create<MovieState & MovieActions>()(
  persist(
    (set, get) => ({
      // Initial state
      movies: [],
      heroMovies: [],
      currentMovie: null,
      loading: true,
      error: '',
      imgIndex: 0,

      // Actions
      fetchMovies: async () => {
        set({ loading: true, error: '' });
        try {
          const response = await Axios.get('/movie');
          const movieData = response.data.data || response.data;
          
          if (Array.isArray(movieData)) {
            const randomSix = [...movieData]
              .sort(() => 0.5 - Math.random())
              .slice(0, 6);
            
            set({
              movies: movieData,
              heroMovies: randomSix,
              loading: false,
            });
          }
        } catch (err: any) {
          set({ 
            error: err.response?.data?.message || 'Failed to fetch movies',
            loading: false,
          });
        }
      },

      fetchMovieById: async (id: string) => {
        set({ loading: true, error: '' });
        try {
          const response = await Axios.get(`/movie/${id}`);
          const movieData = response.data.data || response.data;
          set({
            currentMovie: movieData,
            loading: false,
          });
        } catch (err: any) {
          set({ 
            error: err.response?.data?.message || 'Failed to fetch movie',
            loading: false,
          });
        }
      },

      setCurrentMovie: (movie: Movie | null) => set({ currentMovie: movie }),

      setImgIndex: (index: number) => set({ imgIndex: index }),

      nextImage: () => {
        const { heroMovies, imgIndex } = get();
        if (heroMovies.length > 0) {
          const nextIndex = (imgIndex + 1) % heroMovies.length;
          set({ imgIndex: nextIndex });
        }
      },

      clearError: () => set({ error: '' }),

      getFullImageUrl: (path: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${API_URL}${cleanPath}`;
      },
    }),
    {
      name: 'movie-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        movies: state.movies,
        heroMovies: state.heroMovies,
        imgIndex: state.imgIndex,
        // Don't persist loading, error, or currentMovie
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Mark as hydrated and trigger background sync
          state.loading = false;
          // Trigger background refresh to ensure data is fresh
          setTimeout(() => {
            const store = useMovieStore.getState();
            store.fetchMovies();
          }, 100);
        }
      },
    }
  )
);

// Combined selectors for components that need multiple values
export const useMovieData = () => {
  const movies = useMovieStore((state) => state.movies);
  const heroMovies = useMovieStore((state) => state.heroMovies);
  const loading = useMovieStore((state) => state.loading);
  const error = useMovieStore((state) => state.error);
  
  return { movies, heroMovies, loading, error };
};

export const useCurrentMovie = () => {
  return useMovieStore((state) => state.currentMovie);
};

export const useMovieCarousel = () => {
  const imgIndex = useMovieStore((state) => state.imgIndex);
  const heroMovies = useMovieStore((state) => state.heroMovies);
  
  return { imgIndex, heroMovies };
};
