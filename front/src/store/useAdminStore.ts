import { create } from 'zustand';
import { Axios } from '../config/axios';

interface Cinema {
  _id: string;
  numbering: number;
  seats: any[];
  capacity?: number;
}

interface MovieFormData {
  title: string;
  description: string;
  genre: string;
  rating: string;
  cinemaId: string;
  price: string;
  releaseDate: string;
  showTime: string;
}

interface AdminState {
  cinemas: Cinema[];
  isCinemasLoading: boolean;
  movieFormData: MovieFormData;
  isSubmitting: boolean;
  movies: any[];
  isMoviesLoading: boolean;
  users: any[];
  isUsersLoading: boolean;
  tickets: any[];
  isTicketsLoading: boolean;
  error: string;
}

interface AdminActions {
  fetchCinemas: () => Promise<void>;
  setMovieFormData: (data: Partial<MovieFormData>) => void;
  resetMovieForm: () => void;
  submitMovie: (files: { poster: File | null; banner: File | null; video: File | null }) => Promise<void>;
  fetchMovies: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchTickets: () => Promise<void>;
  deleteMovie: (movieId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  clearError: () => void;
}

const initialMovieFormData: MovieFormData = {
  title: '',
  description: '',
  genre: '',
  rating: '',
  cinemaId: '',
  price: '',
  releaseDate: '',
  showTime: '',
};

export const useAdminStore = create<AdminState & AdminActions>((set, get) => ({
  // Initial state
  cinemas: [],
  isCinemasLoading: true,
  movieFormData: initialMovieFormData,
  isSubmitting: false,
  movies: [],
  isMoviesLoading: true,
  users: [],
  isUsersLoading: true,
  tickets: [],
  isTicketsLoading: true,
  error: '',

  // Actions
  fetchCinemas: async () => {
    set({ isCinemasLoading: true, error: '' });
    try {
      const res = await Axios.get('/cinema');
      const actualData = res.data.data || res.data;
      set({ 
        cinemas: Array.isArray(actualData) ? actualData : [],
        isCinemasLoading: false,
      });
    } catch (err: any) {
      set({ 
        error: err.response?.data?.message || 'Failed to fetch cinemas',
        isCinemasLoading: false,
      });
    }
  },

  setMovieFormData: (data: Partial<MovieFormData>) => {
    set((state) => ({
      movieFormData: { ...state.movieFormData, ...data },
    }));
  },

  resetMovieForm: () => {
    set({ movieFormData: initialMovieFormData });
  },

  submitMovie: async (files) => {
    const { movieFormData } = get();
    
    if (!movieFormData.cinemaId || movieFormData.cinemaId === '') {
      set({ error: 'Please select a cinema hall' });
      return;
    }

    set({ isSubmitting: true, error: '' });
    
    const data = new FormData();
    data.append('title', movieFormData.title);
    data.append('description', movieFormData.description);
    data.append('genre', movieFormData.genre);
    data.append('rating', movieFormData.rating || '0');
    data.append('price', movieFormData.price || '0');
    data.append('cinema', movieFormData.cinemaId);

    const releaseDateTime = movieFormData.releaseDate && movieFormData.showTime 
      ? new Date(`${movieFormData.releaseDate}T${movieFormData.showTime}`)
      : new Date();
    data.append('releaseDate', releaseDateTime.toISOString());
    data.append('showTime', movieFormData.showTime || '00:00');
    data.append('duration', '120');

    if (files.poster) data.append('posterUrl', files.poster);
    if (files.banner) data.append('imageUrl', files.banner);
    if (files.video) data.append('videoUrl', files.video);

    try {
      await Axios.post('/movie/add-movie', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      set({ isSubmitting: false });
      get().resetMovieForm();
    } catch (err: any) {
      set({ 
        error: err.response?.data?.message || 'Upload failed',
        isSubmitting: false,
      });
    }
  },

  fetchMovies: async () => {
    set({ isMoviesLoading: true, error: '' });
    try {
      const response = await Axios.get('/movie');
      const movieData = response.data.data || response.data;
      set({
        movies: Array.isArray(movieData) ? movieData : [],
        isMoviesLoading: false,
      });
    } catch (err: any) {
      set({ 
        error: err.response?.data?.message || 'Failed to fetch movies',
        isMoviesLoading: false,
      });
    }
  },

  fetchUsers: async () => {
    set({ isUsersLoading: true, error: '' });
    try {
      const response = await Axios.get('/admin/get-users');
      const userData = Array.isArray(response.data) ? response.data : (response.data?.data ?? []);
      set({
        users: userData,
        isUsersLoading: false,
      });
    } catch (err: any) {
      set({ 
        error: err.response?.data?.message || 'Failed to fetch users',
        isUsersLoading: false,
      });
    }
  },

  fetchTickets: async () => {
    set({ isTicketsLoading: true, error: '' });
    try {
      const response = await Axios.get('/admin/bookings');
      const ticketData = Array.isArray(response.data) ? response.data : (response.data?.data ?? []);
      set({
        tickets: ticketData,
        isTicketsLoading: false,
      });
    } catch (err: any) {
      set({ 
        error: err.response?.data?.message || 'Failed to fetch tickets',
        isTicketsLoading: false,
      });
    }
  },

  deleteMovie: async (movieId: string) => {
    try {
      await Axios.delete(`/movie/${movieId}`);
      set((state) => ({
        movies: state.movies.filter(movie => movie._id !== movieId),
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to delete movie' });
    }
  },

  deleteUser: async (userId: string) => {
    try {
      await Axios.delete(`/admin/user/${userId}`);
      set((state) => ({
        users: state.users.filter(user => user._id !== userId),
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to delete user' });
    }
  },

  clearError: () => set({ error: '' }),
}));
