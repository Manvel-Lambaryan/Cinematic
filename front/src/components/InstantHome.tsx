import { useEffect, memo, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useMovieTranslation } from "../hooks/useMovieTranslation";
import { useMovieStore } from "../store/useMovieStore";

// Skeleton components for instant UI
const MovieSkeleton = memo(() => (
  <div className="aspect-[2/3] bg-zinc-100 dark:bg-blue-900/10 rounded-[30px] border border-zinc-200 dark:border-white/5 overflow-hidden relative shadow-xl animate-pulse">
    <div className="w-full h-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-blue-800/20 dark:to-blue-900/20" />
  </div>
));

const HeroSkeleton = memo(() => (
  <div className="h-[56vh] min-h-[420px] max-h-[680px] relative overflow-hidden rounded-2xl bg-zinc-900 dark:bg-black shrink-0 animate-pulse">
    <div className="absolute inset-0 bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-blue-800/20 dark:to-blue-900/20" />
    <div className="absolute bottom-16 left-16 right-16">
      <div className="h-16 w-3/4 bg-zinc-300 dark:bg-blue-800/30 rounded-lg mb-8 animate-pulse" />
      <div className="flex gap-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-2 w-8 bg-zinc-300 dark:bg-blue-800/30 rounded-full animate-pulse" />
        ))}
      </div>
    </div>
  </div>
));

const InstantHome = memo(() => {
  const navigate = useNavigate();
  const { getMovieTitle, t } = useMovieTranslation();

  // Optimized selectors with instant access to cached data
  const imgIndex = useMovieStore((state) => state.imgIndex);
  const heroMovies = useMovieStore((state) => state.heroMovies);
  const loading = useMovieStore((state) => state.loading);
  const movies = useMovieStore((state) => state.movies);
  const fetchMovies = useMovieStore((state) => state.fetchMovies);
  const setImgIndex = useMovieStore((state) => state.setImgIndex);
  const getFullImageUrl = useMovieStore((state) => state.getFullImageUrl);

  // Memoized carousel data for instant rendering
  const carouselData = useMemo(() => {
    // Return cached data immediately, even if loading
    const cachedMovies = heroMovies.length > 0 ? heroMovies : [];
    const currentMovie = cachedMovies[imgIndex] || null;
    
    return {
      movies: cachedMovies,
      currentMovie,
      hasData: cachedMovies.length > 0
    };
  }, [heroMovies, imgIndex]);

  // Memoized trending movies for instant rendering
  const trendingMovies = useMemo(() => {
    // Return cached data immediately, even if loading
    const cachedMovies = movies.length > 0 ? movies : [];
    return {
      movies: cachedMovies.slice(0, 6),
      hasData: cachedMovies.length > 0
    };
  }, [movies]);

  // Smart data fetching - only fetch if we have no cached data
  useEffect(() => {
    if (!carouselData.hasData && !loading) {
      fetchMovies();
    }
  }, [carouselData.hasData, loading, fetchMovies]);

  // Background sync only when tab is visible (saves CPU/network when tab hidden)
  useEffect(() => {
    let syncInterval: ReturnType<typeof setInterval> | null = null;
    const schedule = () => {
      if (document.visibilityState === "visible" && carouselData.hasData) {
        if (!syncInterval) {
          syncInterval = setInterval(() => {
            if (document.visibilityState === "visible") fetchMovies();
          }, 30000);
        }
      } else {
        if (syncInterval) {
          clearInterval(syncInterval);
          syncInterval = null;
        }
      }
    };
    schedule();
    document.addEventListener("visibilitychange", schedule);
    return () => {
      document.removeEventListener("visibilitychange", schedule);
      if (syncInterval) clearInterval(syncInterval);
    };
  }, [carouselData.hasData, fetchMovies]);

  // Carousel interval - only run if we have data
  useEffect(() => {
    if (carouselData.hasData && carouselData.movies.length > 1) {
      const interval = setInterval(() => {
        const nextIndex = (imgIndex + 1) % carouselData.movies.length;
        setImgIndex(nextIndex);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [carouselData.hasData, carouselData.movies.length, imgIndex, setImgIndex]);

  return (
    <div className="min-h-full w-full flex flex-col gap-8 pb-20 px-3 sm:px-4 transition-colors duration-700 bg-zinc-50 dark:bg-[#020617]">
      {/* --- HERO: լայնությունը content-ի ներսում, երկարությունը ֆիքսված --- */}
      <section className="h-[56vh] min-h-[420px] max-h-[680px] relative overflow-hidden rounded-2xl bg-zinc-900 dark:bg-black shrink-0 isolate">
        <div className="absolute inset-0 overflow-hidden">
          <AnimatePresence mode="wait">
            {carouselData.hasData && carouselData.currentMovie ? (
              <motion.img
                key={carouselData.currentMovie._id}
                src={getFullImageUrl(
                  carouselData.currentMovie.imageUrl?.includes("/not/")
                    ? carouselData.currentMovie.imageUrl || ""
                    : carouselData.currentMovie.imageUrl?.replace("/uploads/", "/uploads/not/") || "",
                )}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 1.5 }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <HeroSkeleton />
            )}
          </AnimatePresence>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 via-transparent to-transparent dark:from-[#020617] dark:via-transparent dark:to-transparent z-10 transition-colors duration-700 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent dark:from-black/50 dark:via-transparent dark:to-transparent z-10 pointer-events-none" />

        <div className="absolute inset-0 p-16 flex flex-col justify-end z-20">
          <AnimatePresence mode="wait">
            {carouselData.hasData && carouselData.currentMovie && (
              <motion.div key={carouselData.currentMovie._id} initial="hidden" animate="visible">
                <motion.h1 className="text-4xl md:text-6xl font-black italic tracking-[-1px] uppercase leading-tight drop-shadow-2xl flex flex-wrap">
                  {getMovieTitle(carouselData.currentMovie.title)
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
                  {carouselData.movies.slice(0, 10).map((_: any, i: number) => (
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
      <div className="py-5 bg-zinc-100 dark:bg-[#020617] border-y border-zinc-200/50 dark:border-white/5 overflow-hidden flex whitespace-nowrap transition-colors duration-700 -mx-3 sm:-mx-4 px-0">
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

      {/* --- TRENDING --- */}
      <section className="pt-2">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-10 text-zinc-900 dark:text-white flex items-center gap-4 transition-colors">
          <span className="w-10 h-[2px] bg-red-600 inline-block"></span>
          {t("trending", { defaultValue: "Trending" })} <span className="text-red-600">{t("now", { defaultValue: "Now" })}</span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 text-zinc-900 dark:text-white">
          {trendingMovies.hasData ? (
            trendingMovies.movies.map((movie) => (
              <motion.div key={movie._id} whileHover={{ y: -12 }} className="group">
                <div className="aspect-[2/3] bg-zinc-100 dark:bg-blue-900/10 rounded-[30px] border border-zinc-200 dark:border-white/5 overflow-hidden relative shadow-xl group-hover:shadow-red-600/20 transition-all duration-500">
                  <button
                    onClick={() => navigate(`/movie/${movie._id}`)}
                    className="w-full h-full p-0 border-none bg-transparent cursor-pointer outline-none block relative"
                  >
                    <img
                      src={getFullImageUrl(movie.posterUrl?.replace("/not/", "/") || "")}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      alt={movie.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-400 flex flex-col justify-end p-6 text-left">
                      <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mb-1">
                        {t(`genres.${movie.genre?.toLowerCase()}`, { defaultValue: movie.genre || "Movie" })}
                      </p>
                      <h3 className="text-white text-[14px] font-bold uppercase leading-tight truncate">
                        {getMovieTitle(movie.title)}
                      </h3>
                    </div>
                  </button>
                </div>
                <h3
                  onClick={() => navigate(`/movie/${movie._id}`)}
                  className="mt-4 text-center text-sm font-bold text-zinc-500 dark:text-zinc-400 group-hover:text-red-600 transition-all cursor-pointer uppercase truncate px-2"
                >
                  {getMovieTitle(movie.title)}
                </h3>
              </motion.div>
            ))
          ) : (
            [...Array(6)].map((_, index) => <MovieSkeleton key={index} />)
          )}
        </div>
      </section>
    </div>
  );
});

export default InstantHome;
