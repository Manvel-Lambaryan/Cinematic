import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Axios, API_URL } from "../../../config/axios";
import { useNavigate } from "react-router-dom";
import { useMovieTranslation } from "../../../hooks/useMovieTranslation";

const GENRES = ["Action", "Fighter", "Crime", "Fantastic", "Hard Science Fiction", "Comedy", "Horror", "Drama"];

export const Discover = () => {
  const [allMovies, setAllMovies] = useState<any[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<any[]>([]);
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [loading, setLoading] = useState(true);
  const [genreIndex, setGenreIndex] = useState(0);

  const navigate = useNavigate();
  const { getMovieTitle, t } = useMovieTranslation();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await Axios.get("/movie");
        const data = res.data.data || res.data;
        setAllMovies(data);
        setFilteredMovies(data);
      } catch (err) {
        console.error("Discover error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  useEffect(() => {
    if (selectedGenre === "All") {
      const timer = setInterval(() => {
        setGenreIndex((prev) => (prev + 1) % GENRES.length);
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [selectedGenre]);

  const handleGenreClick = (genre: string) => {
    setSelectedGenre(genre);
    const filtered = genre === "All" ? allMovies : allMovies.filter(m => m.genre?.toLowerCase().includes(genre.toLowerCase()));
    setFilteredMovies(filtered);
    if (genre !== "All") setGenreIndex(GENRES.indexOf(genre));
  };

  const getImageUrl = (path: string) => {
    if (!path) return "";
    const cleanPath = path.replace("/not/", "/");
    return `${API_URL}${cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`}`;
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-[#020617] transition-colors duration-500">
      <div className="w-12 h-[2px] bg-red-600 animate-pulse shadow-[0_0_15px_#dc2626]" />
    </div>
  );

  return (
    <div className="min-h-screen p-6 md:p-10 bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white transition-colors duration-500 selection:bg-red-600 overflow-hidden relative">

      {/* --- HEADER --- */}
      <header className="mb-12 relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.9] text-slate-900 dark:text-white">
            {t("explore")} <span className="text-red-600 drop-shadow-[0_0_20px_rgba(220,38,38,0.3)]">CINEMA</span>
            <div className="block md:inline-block overflow-hidden h-[50px] md:h-[80px] md:ml-4 align-middle">
              <AnimatePresence mode="wait">
                <motion.span
                  key={selectedGenre === "All" ? GENRES[genreIndex] : selectedGenre}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -40, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-slate-200 dark:text-white/10 block whitespace-nowrap"
                >
                  {selectedGenre === "All" ? GENRES[genreIndex] : selectedGenre}
                </motion.span>
              </AnimatePresence>
            </div>
          </h1>

          {/* --- SLIDING GENRES (Adaptive Design) --- */}
          <div className="flex items-center gap-1 mt-8 p-1.5 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-[30px] w-fit backdrop-blur-xl overflow-x-auto no-scrollbar shadow-lg dark:shadow-2xl">
            {["All", ...GENRES].map((genre) => {
              const isActive = selectedGenre === genre;
              return (
                <button
                  key={genre}
                  onClick={() => handleGenreClick(genre)}
                  className="relative px-7 py-3 outline-none group whitespace-nowrap"
                >
                  {isActive && (
                    <motion.div
                      layoutId="balancedTab"
                      className="absolute inset-0 bg-red-600 rounded-[25px] shadow-[0_8px_20px_rgba(220,38,38,0.3)]"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className={`relative z-10 text-[10px] font-black uppercase tracking-[2px] transition-colors duration-500 ${isActive
                      ? "text-white"
                      : "text-slate-400 dark:text-white/40 group-hover:text-slate-900 dark:group-hover:text-white"
                    }`}>
                    {genre}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </header>

      {/* --- MOVIES GRID --- */}
      <motion.div
        layout
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 relative z-10"
      >
        <AnimatePresence mode="popLayout">
          {filteredMovies.map((movie) => (
            <motion.div
              key={movie._id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              onClick={() => navigate(`/movie/${movie._id}`)}
              className="group cursor-pointer"
            >
              {/* Poster Card */}
              <div className="relative aspect-[2/3] rounded-[2rem] overflow-hidden shadow-xl dark:shadow-2xl border border-slate-200 dark:border-white/5 bg-slate-200 dark:bg-white/5 transition-all duration-500 group-hover:shadow-red-600/25 group-hover:border-red-600/40">
                <img
                  src={getImageUrl(movie.posterUrl || movie.imageUrl)}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  alt={movie.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-5">
                  <div className="bg-red-600 text-[8px] font-black px-2 py-0.5 rounded w-fit mb-2 uppercase italic text-white">{movie.genre}</div>
                  <h4 className="text-white font-black text-xs uppercase leading-tight drop-shadow-md">{getMovieTitle(movie.title)}</h4>
                </div>
              </div>

              {/* Title Section */}
              <div className="mt-4 text-center px-1">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30 group-hover:text-red-600 transition-colors duration-300 truncate">
                  {getMovieTitle(movie.title)}
                </h3>
                <motion.div
                  className="h-[1.5px] bg-red-600 mx-auto mt-2"
                  initial={{ width: 0 }}
                  whileHover={{ width: "50%" }}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Background Decorative Text */}
      <div className="fixed -bottom-10 -right-10 text-[200px] font-black text-slate-200/40 dark:text-white/[0.02] select-none pointer-events-none uppercase italic leading-none -z-10 transition-colors">
        {selectedGenre === "All" ? "CINEMA" : selectedGenre}
      </div>
    </div>
  );
};