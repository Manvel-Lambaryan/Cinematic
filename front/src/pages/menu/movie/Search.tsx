import { useEffect } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSearchStore } from "../../../store/useSearchStore";
import { useMovieStore } from "../../../store/useMovieStore";

export const Search = () => {
  const navigate = useNavigate();

  // Search store selectors
  const query = useSearchStore((state) => state.query);
  const results = useSearchStore((state) => state.results);
  const setQuery = useSearchStore((state) => state.setQuery);
  const searchMovies = useSearchStore((state) => state.searchMovies);
  const clearResults = useSearchStore((state) => state.clearResults);

  // Movie store for image URL generation
  const getFullImageUrl = useMovieStore((state) => state.getFullImageUrl);

  useEffect(() => {
    const delay = setTimeout(() => {
      searchMovies(query);
    }, 300);
    return () => clearTimeout(delay);
  }, [query, searchMovies]);

  return (
    <div className="relative w-64 group hidden xl:block">
      <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search movies..."
        className="w-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl py-3 pl-14 pr-6 text-xs focus:outline-none focus:border-red-600/30 transition-all text-zinc-900 dark:text-white"
      />

      {/* --- ԱՐԴՅՈՒՆՔՆԵՐԻ DROPDOWN --- */}
      <AnimatePresence>
        {results.length > 0 && query && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full mt-2 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            {results.map((movie) => (
              <div
                key={movie._id}
                onClick={() => {
                  navigate(`/movie/${movie._id}`);
                  clearResults();
                }}
                className="p-3 hover:bg-red-600/10 cursor-pointer flex items-center gap-3 transition-colors border-b border-zinc-100 dark:border-white/5 last:border-none"
              >
                <img
                  /* Ուղղված է movie.imageUrl-ի (կամ movie.posterUrl-ի) և path-ի տրամաբանությունը */
                  src={getFullImageUrl(movie.posterUrl || movie.imageUrl || "")}
                  className="w-8 h-10 object-cover rounded bg-zinc-200 dark:bg-zinc-800"
                  alt={movie.title}
                  onError={(e: any) => {
                    e.target.src = "https://via.placeholder.com/32x40?text=No";
                  }}
                />
                <div className="flex flex-col overflow-hidden">
                  <span className="text-[11px] font-bold truncate dark:text-white">
                    {movie.title}
                  </span>
                  <span className="text-[9px] text-zinc-500">
                    {movie.genre}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};