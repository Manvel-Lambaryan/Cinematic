import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Axios } from "../../config/axios";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  MapPinIcon,
  TicketIcon,
  XMarkIcon,
  FilmIcon,
  StarIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { API_URL } from "../../config/axios";

interface Movie {
  _id: string;
  title: string;
  genre: string;
  releaseDate: string;
  showTime?: string;
  cinema: string;
  cinemaName?: string;
  cinemaNumbering?: number;
  posterUrl?: string;
  imageUrl?: string;
  price: number;
  description?: string;
  rating?: number;
}

interface Cinema {
  _id: string;
  numbering: number;
  name?: string;
}

const MovieCalendar = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [moviesRes, cinemasRes] = await Promise.all([
        Axios.get("/movie"),
        Axios.get("/cinema")
      ]);

      const moviesData = moviesRes.data.data || moviesRes.data;
      const cinemasData = cinemasRes.data.data || cinemasRes.data;

      const moviesWithCinemaNames = moviesData.map((movie: Movie) => {
        const cinema = cinemasData.find((c: Cinema) => c._id === movie.cinema);
        return {
          ...movie,
          cinemaName: cinema?.name || `Hall ${cinema?.numbering}`,
          cinemaNumbering: cinema?.numbering
        };
      });

      setMovies(Array.isArray(moviesWithCinemaNames) ? moviesWithCinemaNames : []);
      setCinemas(Array.isArray(cinemasData) ? cinemasData : []);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getMoviesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return movies.filter(movie => {
      const movieDate = new Date(movie.releaseDate).toISOString().split('T')[0];
      return movieDate === dateStr;
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getImageUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const cleanPath = path.replace("/not/", "/");
    const finalPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
    return `${API_URL}${finalPath}`;
  };

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  const monthYear = currentDate.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent p-4 md:p-10 font-sans text-zinc-900 dark:text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-zinc-500 dark:text-zinc-400">Loading cinema schedule...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-10 font-sans text-zinc-900 dark:text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter mb-4"
          >
            Cinema <span className="text-red-600">Schedule</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-500 dark:text-zinc-400 text-lg"
          >
            View movie screenings by date
          </motion.p>
        </div>

        {/* Calendar Navigation */}
        <div className="bg-white dark:bg-zinc-900/40 rounded-[40px] border border-zinc-200 dark:border-white/5 p-6 mb-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigateMonth('prev')}
              className="p-3 bg-zinc-100 dark:bg-white/5 rounded-2xl hover:bg-zinc-200 dark:hover:bg-white/10 transition-all"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </motion.button>

            <h2 className="text-2xl font-bold text-center">{monthYear}</h2>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigateMonth('next')}
              className="p-3 bg-zinc-100 dark:bg-white/5 rounded-2xl hover:bg-zinc-200 dark:hover:bg-white/10 transition-all"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {getDaysInMonth(currentDate).map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="aspect-square"></div>;
              }

              const dayMovies = getMoviesForDate(date);
              const isToday = date.toDateString() === new Date().toDateString();

              return (
                <motion.div
                  key={date.toISOString()}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                  whileHover={{ scale: 1.05, zIndex: 10 }}
                  className={`aspect-square relative rounded-2xl border-2 transition-all overflow-hidden cursor-pointer ${
                    isToday
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                      : 'bg-zinc-50 dark:bg-white/5 border-zinc-200 dark:border-white/10 hover:border-red-300 dark:hover:border-red-700'
                  }`}
                >
                  {/* Movie Information Directly on Calendar Day */}
                  {dayMovies.length > 0 ? (
                    dayMovies.slice(0, 1).map((movie) => (
                      <div
                        key={movie._id}
                        className="relative w-full h-full cursor-pointer"
                        onClick={() => handleMovieClick(movie)}
                      >
                        <img
                          src={getImageUrl(movie.posterUrl || movie.imageUrl || '')}
                          alt={movie.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-movie.jpg';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-between p-2">
                          <div className="text-right">
                            <div className="text-sm font-bold text-white">
                              {date.getDate()}
                            </div>
                          </div>
                          <div className="text-white">
                            <div className="text-[10px] font-black truncate leading-tight">
                              {movie.title.length > 20 ? movie.title.substring(0, 20) + '...' : movie.title}
                            </div>
                            <div className="flex items-center gap-1 text-[8px]">
                              <MapPinIcon className="w-3 h-3" />
                              <span>#{movie.cinemaNumbering}</span>
                              {movie.showTime && (
                                <>
                                  <ClockIcon className="w-3 h-3 ml-1" />
                                  <span>{movie.showTime}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {dayMovies.length > 1 && (
                          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-black px-2 py-1 rounded-full">
                            +{dayMovies.length - 1}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-2 h-full flex flex-col">
                      <div className="text-sm font-bold text-zinc-900 dark:text-white">
                        {date.getDate()}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Movie Details Modal */}
      <AnimatePresence>
        {isModalOpen && selectedMovie && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-zinc-950/90 backdrop-blur-md"
              style={{ zIndex: 9999 }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 flex items-center justify-center p-4"
              style={{ zIndex: 10000 }}
            >
              <div className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-[40px] shadow-2xl border border-zinc-200 dark:border-white/10 overflow-hidden">
                <div className="p-8 md:p-10 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-red-600 rounded-2xl text-white shadow-lg shadow-red-600/30">
                        <CalendarIcon className="w-6 h-6" />
                      </div>
                      <h2 className="text-3xl font-black italic uppercase tracking-tighter dark:text-white">
                        Film <span className="text-red-600">Details</span>
                      </h2>
                    </div>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-full dark:text-zinc-400"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Movie Poster */}
                    <div className="flex flex-col gap-6">
                      <img
                        src={getImageUrl(selectedMovie.posterUrl || selectedMovie.imageUrl || '')}
                        alt={selectedMovie.title}
                        className="w-full h-80 object-cover rounded-3xl shadow-2xl border dark:border-white/10"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-movie.jpg';
                        }}
                      />
                    </div>

                    {/* Movie Information */}
                    <div className="md:col-span-2 space-y-6">
                      <div>
                        <h3 className="text-2xl font-black mb-2 dark:text-white">
                          {selectedMovie.title}
                        </h3>
                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          {selectedMovie.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-[10px] uppercase font-black text-zinc-400 tracking-widest ml-2 flex items-center gap-2">
                              <FilmIcon className="w-4 h-4" /> Genre
                            </label>
                            <div className="text-lg font-bold text-zinc-900 dark:text-white">
                              {selectedMovie.genre}
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] uppercase font-black text-zinc-400 tracking-widest ml-2 flex items-center gap-2">
                              <StarIcon className="w-4 h-4" /> Rating
                            </label>
                            <div className="text-lg font-bold text-red-600">
                              {selectedMovie.rating} / 10
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="text-[10px] uppercase font-black text-zinc-400 tracking-widest ml-2 flex items-center gap-2">
                              <MapPinIcon className="w-4 h-4" /> Cinema Room
                            </label>
                            <div className="text-lg font-bold text-zinc-900 dark:text-white">
                              {selectedMovie.cinemaName || `Hall ${selectedMovie.cinemaNumbering}`}
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] uppercase font-black text-zinc-400 tracking-widest ml-2 flex items-center gap-2">
                              <CurrencyDollarIcon className="w-4 h-4" /> Ticket Price
                            </label>
                            <div className="text-lg font-bold text-green-600">
                              {selectedMovie.price} AMD
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Date and Time */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-[10px] uppercase font-black text-zinc-400 tracking-widest ml-2 flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4" /> Release Date
                          </label>
                          <div className="text-lg font-bold text-purple-600">
                            {selectedMovie.releaseDate ? new Date(selectedMovie.releaseDate).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            }) : 'Not set'}
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] uppercase font-black text-zinc-400 tracking-widest ml-2 flex items-center gap-2">
                            <ClockIcon className="w-4 h-4" /> Show Time
                          </label>
                          <div className="text-lg font-bold text-blue-600">
                            {selectedMovie.showTime || 'Not set'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t dark:border-white/5 flex gap-4">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 bg-zinc-100 dark:bg-white/5 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[2px] dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-white/10 transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MovieCalendar;
