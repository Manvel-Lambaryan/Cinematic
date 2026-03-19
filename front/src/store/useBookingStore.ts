import { create } from 'zustand';
import { Axios } from '../config/axios';

export interface Seat {
  _id: string;
  x: number;
  y: number;
  numbering: number | string;
  types: 'VIP' | 'MEDIUM' | 'NORMAL' | 'STANDARD';
  isBooked: boolean;
  price?: number;
}

export interface Cinema {
  _id: string;
  numbering: number;
  seats: Seat[];
}

interface BookingState {
  cinema: Cinema | null;
  movie: any;
  selectedSeats: Seat[];
  gridSize: { cols: number; rows: number };
  loading: boolean;
  isProcessing: boolean;
  showTopUp: boolean;
  error: string;
}

interface BookingActions {
  fetchCinemaData: (cinemaId: string, movieId: string) => Promise<void>;
  fetchMovieData: (movieId: string) => Promise<void>;
  toggleSeat: (seat: Seat) => void;
  clearSelectedSeats: () => void;
  confirmOrder: (userId: string, cinemaId: string, movieId: string) => Promise<void>;
  setShowTopUp: (show: boolean) => void;
  clearError: () => void;
  calculateTotalPrice: () => number;
  resetBooking: () => void;
}

export const useBookingStore = create<BookingState & BookingActions>((set, get) => ({
  // Initial state
  cinema: null,
  movie: null,
  selectedSeats: [],
  gridSize: { cols: 0, rows: 0 },
  loading: true,
  isProcessing: false,
  showTopUp: false,
  error: '',

  // Actions
  fetchCinemaData: async (cinemaId: string, movieId: string) => {
    set({ loading: true, error: '' });
    try {
      const response = await Axios.get(`/cinema/${cinemaId}?movieId=${movieId}`);
      const cinemaData = response.data?.data ?? response.data;
      
      set({ cinema: cinemaData, loading: false });

      if (cinemaData?.seats?.length > 0) {
        const max_x = Math.max(...cinemaData.seats.map((s: Seat) => s.x));
        const max_y = Math.max(...cinemaData.seats.map((s: Seat) => s.y));
        set({ gridSize: { cols: max_x + 1, rows: max_y + 1 } });
      }
    } catch (err: any) {
      set({ 
        error: err.response?.data?.message || 'Failed to load cinema data',
        loading: false,
      });
    }
  },

  fetchMovieData: async (movieId: string) => {
    set({ loading: true, error: '' });
    try {
      const response = await Axios.get(`/movie/${movieId}`);
      const movieData = response.data?.data ?? response.data;
      set({ 
        movie: movieData,
        loading: false,
      });
    } catch (err: any) {
      set({ 
        error: err.response?.data?.message || 'Failed to load movie data',
        loading: false,
      });
    }
  },

  toggleSeat: (seat: Seat) => {
    if (seat.isBooked) return;

    set((state) => ({
      selectedSeats: state.selectedSeats.find((s) => s._id === seat._id)
        ? state.selectedSeats.filter((s) => s._id !== seat._id)
        : [...state.selectedSeats, seat],
    }));
  },

  clearSelectedSeats: () => set({ selectedSeats: [] }),

  confirmOrder: async (userId: string, cinemaId: string, movieId: string) => {
    const { selectedSeats } = get();
    if (selectedSeats.length === 0) return;

    set({ isProcessing: true, error: '' });
    
    try {
      const totalPrice = get().calculateTotalPrice();
      
      const response = await Axios.post('/payments/process', {
        userId,
        cinemaId,
        movieId,
        selectedSeats,
        totalPrice,
      });

      const payload = response.data?.data ?? response.data;
      const newBalance = payload?.newBalance;
      if (response.data?.success !== false && newBalance !== undefined) {
        try {
          const { useAuthStore } = await import('../store/useAuthStore');
          useAuthStore.getState().updateBalance(newBalance);
        } catch (_) {}
      }

      if (response.data?.success !== false) {
        set({
          selectedSeats: [],
          isProcessing: false,
          showTopUp: false,
        });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Payment failed',
        isProcessing: false,
      });
    }
  },

  setShowTopUp: (show: boolean) => set({ showTopUp: show }),

  clearError: () => set({ error: '' }),

  calculateTotalPrice: () => {
    const { selectedSeats, movie } = get();
    const basePrice = Number(movie?.price) || 0;
    
    return selectedSeats.reduce((acc, seat) => {
      if (seat.types === 'VIP') return acc + basePrice * 2.5;
      if (seat.types === 'MEDIUM') return acc + basePrice * 1.5;
      return acc + basePrice;
    }, 0);
  },

  resetBooking: () => set({
    cinema: null,
    movie: null,
    selectedSeats: [],
    gridSize: { cols: 0, rows: 0 },
    loading: true,
    isProcessing: false,
    showTopUp: false,
    error: '',
  }),
}));
