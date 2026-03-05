import { useEffect, useState } from "react";
import { Axios } from "../../../config/axios";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../../config/axios";


export const Search = () => {
  const [title, setTitle] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const searchMovie = async () => {
      if (!title.trim()) {
        setResults([]);
        return;
      }

      try {
        const res = await Axios.get(`/movie/search/${title}`);
        const data = Array.isArray(res.data) ? res.data : [res.data];
        setResults(data);
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
      }
    };

    const delay = setTimeout(searchMovie, 300);
    return () => clearTimeout(delay);
  }, [title]);

 
  const getSearchImageUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;

    const cleanPath = path.replace("/not/", "/");
    const finalPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;

    return `${API_URL}${finalPath}`;
  };

  return (
    <div className="relative w-64 group hidden xl:block">
      <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Search movies..."
        className="w-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl py-3 pl-14 pr-6 text-xs focus:outline-none focus:border-red-600/30 transition-all text-zinc-900 dark:text-white"
      />

      {/* --- ԱՐԴՅՈՒՆՔՆԵՐԻ DROPDOWN --- */}
      <AnimatePresence>
        {results.length > 0 && title && (
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
                  setTitle(""); 
                }}
                className="p-3 hover:bg-red-600/10 cursor-pointer flex items-center gap-3 transition-colors border-b border-zinc-100 dark:border-white/5 last:border-none"
              >
                <img
                  /* Ուղղված է movie.imageUrl-ի (կամ movie.posterUrl-ի) և path-ի տրամաբանությունը */
                  src={getSearchImageUrl(movie.posterUrl || movie.imageUrl)}
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