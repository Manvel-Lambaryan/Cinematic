// Centralized store exports for easy imports
export { useAuthStore } from './useAuthStore';
export { useUIStore } from './useUIStore';
export { useMovieStore } from './useMovieStore';
export { useBookingStore } from './useBookingStore';
export { useAdminStore } from './useAdminStore';
export { useSearchStore } from './useSearchStore';

// Types exports for convenience
export type { User } from './useAuthStore';
export type { Movie } from './useMovieStore';
export type { Seat, Cinema } from './useBookingStore';
