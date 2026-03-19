import { create } from 'zustand';
import { Axios } from '../../config/axios';

// Backend-aligned User interface based on User.js model
interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  balance: number;
  loginAttempts: number;
  lockUntil?: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Backend-aligned Movie interface
interface AdminMovie {
  _id: string;
  title: string;
  description: string;
  genre: string;
  rating: number;
  price: number;
  cinema: string;
  releaseDate: string;
  showTime: string;
  duration: number;
  posterUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Backend-aligned Ticket interface
interface AdminTicket {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  movie: {
    _id: string;
    title: string;
  };
  cinema: {
    _id: string;
    name?: string;
    numbering?: number;
  };
  seat: {
    numbering: number;
    types: string;
    x: number;
    y: number;
  };
  price: number;
  status: 'active' | 'used' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

interface AdminState {
  // User Management
  users: AdminUser[];
  usersLoading: boolean;
  usersError: string | null;
  
  // Movie Management
  movies: AdminMovie[];
  moviesLoading: boolean;
  moviesError: string | null;
  
  // Ticket Management
  tickets: AdminTicket[];
  ticketsLoading: boolean;
  ticketsError: string | null;
  
  // UI State
  selectedUser: AdminUser | null;
  selectedMovie: AdminMovie | null;
  selectedTicket: AdminTicket | null;
  
  // Modals
  isUserEditModalOpen: boolean;
  isUserDeleteModalOpen: boolean;
  isMovieEditModalOpen: boolean;
  isMovieDeleteModalOpen: boolean;
  isTicketViewModalOpen: boolean;
}

interface AdminActions {
  // User Management Actions
  fetchUsers: () => Promise<void>;
  updateUser: (userId: string, updates: Partial<AdminUser>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  setSelectedUser: (user: AdminUser | null) => void;
  toggleUserEditModal: () => void;
  toggleUserDeleteModal: () => void;
  
  // Movie Management Actions
  fetchMovies: () => Promise<void>;
  addMovie: (movieData: Partial<AdminMovie>) => Promise<void>;
  updateMovie: (movieId: string, updates: Partial<AdminMovie>) => Promise<void>;
  deleteMovie: (movieId: string) => Promise<void>;
  setSelectedMovie: (movie: AdminMovie | null) => void;
  toggleMovieEditModal: () => void;
  toggleMovieDeleteModal: () => void;
  
  // Ticket Management Actions
  fetchTickets: () => Promise<void>;
  validateTicket: (ticketId: string) => Promise<void>;
  setSelectedTicket: (ticket: AdminTicket | null) => void;
  toggleTicketViewModal: () => void;
  
  // Error Handling
  clearUsersError: () => void;
  clearMoviesError: () => void;
  clearTicketsError: () => void;
  clearAllErrors: () => void;
}

export const useAdminStore = create<AdminState & AdminActions>((set, get) => ({
  // Initial State
  users: [],
  usersLoading: false,
  usersError: null,
  
  movies: [],
  moviesLoading: false,
  moviesError: null,
  
  tickets: [],
  ticketsLoading: false,
  ticketsError: null,
  
  selectedUser: null,
  selectedMovie: null,
  selectedTicket: null,
  
  isUserEditModalOpen: false,
  isUserDeleteModalOpen: false,
  isMovieEditModalOpen: false,
  isMovieDeleteModalOpen: false,
  isTicketViewModalOpen: false,

  // User Management Actions
  fetchUsers: async () => {
    set({ usersLoading: true, usersError: null });
    
    try {
      const response = await Axios.get('/admin/get-users');
      
      // Backend returns array directly, not wrapped in data object
      const users = response.data;
      
      if (!Array.isArray(users)) {
        throw new Error('Invalid response format from server');
      }
      
      set({ 
        users: users as AdminUser[],
        usersLoading: false,
      });
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch users';
      set({ 
        usersError: errorMessage,
        usersLoading: false,
        users: [],
      });
    }
  },

  updateUser: async (userId: string, updates: Partial<AdminUser>) => {
    set({ usersError: null });
    
    try {
      // Backend expects PUT to /admin/user/:id with body containing updates
      const response = await Axios.put(`/admin/user/${userId}`, updates);
      
      // Backend returns { message: "...", data: updatedUser }
      const updatedUser = response.data.data;
      
      if (!updatedUser) {
        throw new Error('Invalid response format from server');
      }
      
      // Update local state with the returned user data
      set(state => ({
        users: state.users.map(user => 
          user._id === userId ? updatedUser : user
        ),
        selectedUser: state.selectedUser?._id === userId ? updatedUser : state.selectedUser,
      }));
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update user';
      set({ usersError: errorMessage });
      throw error; // Re-throw for component handling
    }
  },

  deleteUser: async (userId: string) => {
    set({ usersError: null });
    
    try {
      // Backend expects DELETE to /admin/user/:id
      await Axios.delete(`/admin/user/${userId}`);
      
      // Remove user from local state
      set(state => ({
        users: state.users.filter(user => user._id !== userId),
        selectedUser: state.selectedUser?._id === userId ? null : state.selectedUser,
      }));
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete user';
      set({ usersError: errorMessage });
      throw error; // Re-throw for component handling
    }
  },

  setSelectedUser: (user: AdminUser | null) => {
    set({ selectedUser: user });
  },

  toggleUserEditModal: () => {
    set(state => ({ isUserEditModalOpen: !state.isUserEditModalOpen }));
  },

  toggleUserDeleteModal: () => {
    set(state => ({ isUserDeleteModalOpen: !state.isUserDeleteModalOpen }));
  },

  // Movie Management Actions
  fetchMovies: async () => {
    set({ moviesLoading: true, moviesError: null });
    
    try {
      const response = await Axios.get('/movie');
      
      // Backend returns { data: movies } or movies directly
      const movies = response.data.data || response.data;
      
      if (!Array.isArray(movies)) {
        throw new Error('Invalid response format from server');
      }
      
      set({ 
        movies: movies as AdminMovie[],
        moviesLoading: false,
      });
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch movies';
      set({ 
        moviesError: errorMessage,
        moviesLoading: false,
        movies: [],
      });
    }
  },

  addMovie: async (movieData: Partial<AdminMovie>) => {
    set({ moviesError: null });
    
    try {
      // Backend expects POST to /admin/add-movie
      const response = await Axios.post('/admin/add-movie', movieData);
      
      // Backend returns { message: "...", data: newMovie }
      const newMovie = response.data.data;
      
      if (!newMovie) {
        throw new Error('Invalid response format from server');
      }
      
      // Add to local state
      set(state => ({
        movies: [...state.movies, newMovie],
      }));
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add movie';
      set({ moviesError: errorMessage });
      throw error;
    }
  },

  updateMovie: async (movieId: string, updates: Partial<AdminMovie>) => {
    set({ moviesError: null });
    
    try {
      const response = await Axios.patch(`/movie/${movieId}`, updates);
      const updatedMovie = response.data?.data ?? response.data;
      
      set(state => ({
        movies: state.movies.map(movie => 
          movie._id === movieId ? updatedMovie : movie
        ),
        selectedMovie: state.selectedMovie?._id === movieId ? updatedMovie : state.selectedMovie,
      }));
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update movie';
      set({ moviesError: errorMessage });
      throw error;
    }
  },

  deleteMovie: async (movieId: string) => {
    set({ moviesError: null });
    
    try {
      // Backend expects DELETE to /admin/movie/:id
      await Axios.delete(`/admin/movie/${movieId}`);
      
      // Remove from local state
      set(state => ({
        movies: state.movies.filter(movie => movie._id !== movieId),
        selectedMovie: state.selectedMovie?._id === movieId ? null : state.selectedMovie,
      }));
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete movie';
      set({ moviesError: errorMessage });
      throw error;
    }
  },

  setSelectedMovie: (movie: AdminMovie | null) => {
    set({ selectedMovie: movie });
  },

  toggleMovieEditModal: () => {
    set(state => ({ isMovieEditModalOpen: !state.isMovieEditModalOpen }));
  },

  toggleMovieDeleteModal: () => {
    set(state => ({ isMovieDeleteModalOpen: !state.isMovieDeleteModalOpen }));
  },

  // Ticket Management Actions
  fetchTickets: async () => {
    set({ ticketsLoading: true, ticketsError: null });
    
    try {
      const response = await Axios.get('/admin/bookings');
      
      // Backend returns array of populated tickets directly
      const tickets = response.data;
      
      if (!Array.isArray(tickets)) {
        throw new Error('Invalid response format from server');
      }
      
      set({ 
        tickets: tickets as AdminTicket[],
        ticketsLoading: false,
      });
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch tickets';
      set({ 
        ticketsError: errorMessage,
        ticketsLoading: false,
        tickets: [],
      });
    }
  },

  validateTicket: async (ticketId: string) => {
    set({ ticketsError: null });
    
    try {
      // Backend expects PATCH to /admin/bookings/:id/validate
      const response = await Axios.patch(`/admin/bookings/${ticketId}/validate`);
      
      // Backend returns { message: "...", data: updatedTicket }
      const updatedTicket = response.data.data;
      
      if (!updatedTicket) {
        throw new Error('Invalid response format from server');
      }
      
      // Update local state
      set(state => ({
        tickets: state.tickets.map(ticket => 
          ticket._id === ticketId ? updatedTicket : ticket
        ),
        selectedTicket: state.selectedTicket?._id === ticketId ? updatedTicket : state.selectedTicket,
      }));
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to validate ticket';
      set({ ticketsError: errorMessage });
      throw error;
    }
  },

  setSelectedTicket: (ticket: AdminTicket | null) => {
    set({ selectedTicket: ticket });
  },

  toggleTicketViewModal: () => {
    set(state => ({ isTicketViewModalOpen: !state.isTicketViewModalOpen }));
  },

  // Error Handling Actions
  clearUsersError: () => set({ usersError: null }),
  clearMoviesError: () => set({ moviesError: null }),
  clearTicketsError: () => set({ ticketsError: null }),
  clearAllErrors: () => set({ 
    usersError: null, 
    moviesError: null, 
    ticketsError: null 
  }),
}));
