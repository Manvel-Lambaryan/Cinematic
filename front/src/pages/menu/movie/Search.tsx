import { useEffect } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSearchStore } from "../../../store/useSearchStore";
import { useMovieStore } from "../../../store/useMovieStore";

export const Search = () => {
  const navigate = useNavigate();

  const query = useSearchStore((state) => state.query);
  const results = useSearchStore((state) => state.results);
  const isSearching = useSearchStore((state) => state.isSearching);
  const lastSearchEmpty = useSearchStore((state) => state.lastSearchEmpty);
  const error = useSearchStore((state) => state.error);
  const setQuery = useSearchStore((state) => state.setQuery);
  const searchMovies = useSearchStore((state) => state.searchMovies);
  const clearResults = useSearchStore((state) => state.clearResults);

  const getFullImageUrl = useMovieStore((state) => state.getFullImageUrl);

  useEffect(() => {
    const delay = setTimeout(() => {
      void searchMovies(query);
    }, 300);
    return () => clearTimeout(delay);
  }, [query, searchMovies]);

  const q = query.trim();
  const showPanel =
    Boolean(q) && (isSearching || Boolean(error) || results.length > 0 || lastSearchEmpty);

  return (
    <div className="relative z-[100] shrink-0 hidden xl:block">
      {/* overflow-hidden միայն դաշտի վրա — հակառակ դեպքում dropdown-ը կտրվում էր */}
      <div
        className={`relative flex items-center overflow-hidden rounded-[22px] border border-zinc-200 dark:border-white/10 hover:border-red-600/40 focus-within:border-red-600/40 bg-zinc-100 dark:bg-white/5 h-[52px] transition-[width,border-color] duration-300 ease-out group ${q ? "w-64" : "w-14 hover:w-64 focus-within:w-64"}`}
      >
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 dark:text-zinc-500 shrink-0 pointer-events-none" />
        <input
          type="search"
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies..."
          className="flex-1 min-w-0 bg-transparent border-0 py-3 pl-12 pr-4 text-xs focus:outline-none focus:ring-0 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
        />
      </div>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 mt-2 w-64 max-h-[min(60vh,320px)] overflow-y-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-2xl z-[110]"
          >
            {isSearching && (
              <div className="p-4 text-center text-[11px] text-zinc-500">…</div>
            )}
            {!isSearching && error && (
              <div className="p-4 text-center text-[11px] text-red-500">{error}</div>
            )}
            {!isSearching && !error && results.length === 0 && (
              <div className="p-4 text-center text-[11px] text-zinc-500">No matches</div>
            )}
            {!isSearching &&
              !error &&
              results.map((movie) => (
                <div
                  key={String(movie._id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(`/movie/${movie._id}`);
                      clearResults();
                    }
                  }}
                  onClick={() => {
                    navigate(`/movie/${movie._id}`);
                    clearResults();
                  }}
                  className="p-3 hover:bg-red-600/10 cursor-pointer flex items-center gap-3 transition-colors border-b border-zinc-100 dark:border-white/5 last:border-none"
                >
                  <img
                    src={getFullImageUrl(
                      (movie.posterUrl || movie.imageUrl || "").replace("/not/", "/")
                    )}
                    className="w-8 h-10 object-cover rounded bg-zinc-200 dark:bg-zinc-800 shrink-0"
                    alt={movie.title}
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/32x40?text=No";
                    }}
                  />
                  <div className="flex flex-col overflow-hidden min-w-0">
                    <span className="text-[11px] font-bold truncate dark:text-white">
                      {movie.title}
                    </span>
                    <span className="text-[9px] text-zinc-500 truncate">{movie.genre}</span>
                  </div>
                </div>
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
