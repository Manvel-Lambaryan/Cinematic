import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Axios } from "../../config/axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config/axios";
import { useMovieTranslation } from "../../hooks/useMovieTranslation"; // 1. Ներմուծում ենք Hook-ը

export const Home = () => {
  const [movies, setMovies] = useState<any[]>([]);
  const [heroMovies, setHeroMovies] = useState<any[]>([]);
  const [imgIndex, setImgIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { getMovieTitle, t } = useMovieTranslation(); // 2. Օգտագործում ենք Hook-ը

  useEffect(() => {
    const fetchData = async () => {
      try {
        const moviesRes = await Axios.get("/movie");
        const movieData = moviesRes.data.data || moviesRes.data;

        if (Array.isArray(movieData)) {
          setMovies(movieData);
          const randomSix = [...movieData]
            .sort(() => 0.5 - Math.random())
            .slice(0, 6);
          setHeroMovies(randomSix);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (heroMovies.length > 0) {
      const interval = setInterval(() => {
        setImgIndex((prev) => (prev + 1) % heroMovies.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [heroMovies.length]);

  const getFullImageUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${API_URL}${cleanPath}`;
  };

  if (loading)
    return (
      <div className="h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-[var(--background)]">
        <div className="text-zinc-900 dark:text-white font-black italic animate-pulse uppercase tracking-[10px]">
          Cinematic<span className="text-red-600">...</span>
        </div>
      </div>
    );

  const currentHeroMovie = heroMovies[imgIndex];

  return (
    <div className="h-full w-full flex flex-col gap-10 overflow-y-auto no-scrollbar pb-20 px-2 transition-colors duration-700 bg-white dark:bg-[var(--background)]">
      {/* --- HERO SECTION --- */}
      <section className="h-[600px] min-h-[500px] relative rounded-[45px] overflow-hidden border border-zinc-200 dark:border-white/5 bg-zinc-100 dark:bg-blue-950/20 shadow-2xl shrink-0">
        <AnimatePresence mode="wait">
          {heroMovies.length > 0 ? (
            <motion.img
              key={currentHeroMovie?._id}
              src={getFullImageUrl(
                currentHeroMovie.imageUrl?.includes("/not/")
                  ? currentHeroMovie.imageUrl
                  : currentHeroMovie.imageUrl?.replace("/uploads/", "/uploads/not/"),
              )}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-300 dark:text-white/5 uppercase font-black italic tracking-widest text-4xl">
              No Banner
            </div>
          )}
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent dark:from-[var(--background)] dark:via-transparent dark:to-transparent z-10 transition-colors duration-700" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-transparent dark:from-black/40 dark:via-transparent dark:to-transparent z-10" />

        <div className="absolute inset-0 p-16 flex flex-col justify-end z-20">
          <AnimatePresence mode="wait">
            {currentHeroMovie && (
              <motion.div key={currentHeroMovie._id} initial="hidden" animate="visible">
                <motion.h1 className="text-4xl md:text-6xl font-black italic tracking-[-1px] uppercase leading-tight drop-shadow-2xl flex flex-wrap">
                  {/* 3. ԱՎՏՈՄԱՏ ԹԱՐԳՄԱՆՎՈՂ TITLE */}
                  {getMovieTitle(currentHeroMovie.title)
                    .split("")
                    .map((char: string, index: number, arr: string[]) => (
                      <motion.span
                        key={index}
                        variants={{
                          hidden: { opacity: 0, y: 30 },
                          visible: { opacity: 1, y: 0, transition: { delay: index * 0.02 } },
                        }}
                        className={index < arr.length / 2 ? "text-zinc-900 dark:text-white" : "text-red-600"}
                      >
                        {char === " " ? "\u00A0" : char}
                      </motion.span>
                    ))}
                </motion.h1>

                <div className="flex gap-2 mt-8 items-center">
                  {heroMovies.slice(0, 10).map((_, i) => (
                    <motion.div
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setImgIndex(i); }}
                      animate={{
                        width: i === imgIndex ? 30 : 8,
                        backgroundColor: i === imgIndex ? "#dc2626" : "rgba(150,150,150,0.3)",
                      }}
                      className="h-2 rounded-full cursor-pointer transition-all duration-300"
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* --- MARQUEE --- */}
      <div className="py-8 bg-zinc-100 dark:bg-blue-950/20 border-y border-zinc-200 dark:border-white/5 overflow-hidden flex whitespace-nowrap transition-colors duration-700">
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: "-50%" }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="flex items-center gap-10 pr-10"
        >
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-20">
              <span className="text-4xl md:text-5xl font-black uppercase italic text-zinc-400 dark:text-white/80">
                Cinema<span className="text-red-600">TIC</span> • New{" "}
                <span className="text-red-600">Releases</span> • Trending{" "}
                <span className="text-red-600">Now</span> •
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* --- TRENDING SECTION --- */}
      <section className="px-4">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-10 text-zinc-900 dark:text-white flex items-center gap-4 transition-colors">
          <span className="w-10 h-[2px] bg-red-600 inline-block"></span>
          {t("trending", { defaultValue: "Trending" })} <span className="text-red-600">{t("now", { defaultValue: "Now" })}</span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 text-zinc-900 dark:text-white">
          {movies.slice(0, 6).map((movie) => (
            <motion.div key={movie._id} whileHover={{ y: -12 }} className="group">
              <div className="aspect-[2/3] bg-zinc-100 dark:bg-blue-900/10 rounded-[30px] border border-zinc-200 dark:border-white/5 overflow-hidden relative shadow-xl group-hover:shadow-red-600/20 transition-all duration-500">
                <button
                  onClick={() => navigate(`/movie/${movie._id}`)}
                  className="w-full h-full p-0 border-none bg-transparent cursor-pointer outline-none block relative"
                >
                  <img
                    src={getFullImageUrl(movie.posterUrl?.replace("/not/", "/"))}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    alt={movie.title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-400 flex flex-col justify-end p-6 text-left">
                    <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mb-1">
                      {t(`genres.${movie.genre?.toLowerCase()}`, { defaultValue: movie.genre || "Movie" })}
                    </p>
                    <h3 className="text-white text-[14px] font-bold uppercase leading-tight truncate">
                      {/* 4. ԱՎՏՈՄԱՏ ԹԱՐԳՄԱՆՎՈՂ TITLE */}
                      {getMovieTitle(movie.title)}
                    </h3>
                  </div>
                </button>
              </div>
              <h3
                onClick={() => navigate(`/movie/${movie._id}`)}
                className="mt-4 text-center text-sm font-bold text-zinc-500 dark:text-zinc-400 group-hover:text-red-600 transition-all cursor-pointer uppercase truncate px-2"
              >
                {/* 5. ԱՎՏՈՄԱՏ ԹԱՐԳՄԱՆՎՈՂ TITLE */}
                {getMovieTitle(movie.title)}
              </h3>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};