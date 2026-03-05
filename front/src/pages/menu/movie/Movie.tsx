import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Axios, API_URL } from "../../../config/axios";
import type { IMovie } from "../../../types/type";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Star, ChevronLeft, ArrowRight, X, Calendar, Clock } from "lucide-react";
import { useMovieTranslation } from "../../../hooks/useMovieTranslation";

export const Movie = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getMovieTitle, t } = useMovieTranslation();

  const [movie, setMovie] = useState<IMovie | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const res = await Axios.get(`/movie/${id}`);
        setMovie(res.data.data || res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchMovieDetails();
  }, [id]);

  const getFullImageUrl = (path: string) => {
    if (!path) return "";
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${API_URL}${cleanPath}`;
  };

  const images = useMemo(() => {
    if (!movie) return { backdrop: "", poster: "" };
    const bgPath = movie.imageUrl?.includes("/not/")
      ? movie.imageUrl
      : movie.imageUrl?.replace("/uploads/", "/uploads/not/");

    return {
      backdrop: getFullImageUrl(bgPath || ""),
      poster: getFullImageUrl(movie.posterUrl?.replace("/not/", "/") || "")
    };
  }, [movie]);

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  if (loading) return (
    <div className="h-screen bg-white dark:bg-[#020617] flex items-center justify-center">
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="w-16 h-[2px] bg-red-600 shadow-[0_0_20px_#dc2626]"
      />
    </div>
  );

  if (!movie) return null;

  return (
    <div className="h-screen w-full bg-white dark:bg-[#020617] text-zinc-900 dark:text-white relative overflow-hidden transition-colors duration-500">

      {/* BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <motion.img
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.5 }}
          transition={{ duration: 2 }}
          src={images.backdrop}
          className="w-full h-full object-cover"
          alt="background"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-[#020617] dark:via-[#020617]/70 dark:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent dark:from-[#020617] dark:via-transparent dark:to-transparent" />
      </div>

      {/* BACK BUTTON */}
      <motion.button
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => navigate(-1)}
        className="absolute top-8 left-8 z-50 flex items-center gap-3 text-zinc-500 dark:text-white/40 hover:text-red-600 dark:hover:text-white transition-all group"
      >
        <div className="p-2 rounded-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 group-hover:bg-red-600 group-hover:border-red-600 group-hover:text-white transition-all duration-300">
          <ChevronLeft size={18} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[3px]">{t("back", { defaultValue: "Back" })}</span>
      </motion.button>

      {/* MAIN CONTENT AREA */}
      <div className="relative z-20 h-full w-full flex items-center justify-start px-6 md:px-16 lg:px-24">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-10 lg:gap-20 w-full">

          {/* POSTER - Floating Animation */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 1 }}
            className="w-[220px] md:w-[320px] lg:w-[380px] shrink-0 aspect-[2/3] rounded-[40px] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.3)] border border-zinc-200 dark:border-white/10"
          >
            <motion.img
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              src={images.poster}
              className="w-full h-full object-cover"
              alt={movie.title}
            />
          </motion.div>

          {/* TEXT INFO */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex-1 max-w-2xl flex flex-col justify-center text-center md:text-left"
          >
            <motion.div variants={itemVariants} className="flex items-center justify-center md:justify-start gap-3 mb-6">
              <span className="bg-red-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest italic shadow-lg shadow-red-600/20">
                {movie.genre}
              </span>
              <div className="flex items-center gap-1.5 text-yellow-500 font-black bg-zinc-100 dark:bg-white/5 px-3 py-1 rounded-full border border-zinc-200 dark:border-white/10">
                <Star size={14} fill="currentColor" />
                <span className="text-sm">{movie.rating || "9.0"}</span>
              </div>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-7xl lg:text-8xl font-black uppercase italic tracking-tighter leading-[0.8] mb-8 text-zinc-900 dark:text-white"
            >
              {getMovieTitle(movie.title)}
            </motion.h1>


            <motion.p
              variants={itemVariants}
              className="text-sm md:text-base lg:text-lg text-zinc-600 dark:text-white/60 leading-relaxed mb-10 font-medium italic border-l-4 border-red-600 pl-6 max-w-xl"
            >
              {movie.description}
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap justify-center md:justify-start gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={async () => {
                  const res = await Axios.get(`/movie/${id}/trailer`);
                  setTrailerUrl(getFullImageUrl(res.data.data?.videoUrl || movie.videoUrl));
                  setShowTrailer(true);
                }}
                className="bg-red-600 hover:bg-zinc-900 dark:hover:bg-white dark:hover:text-black text-white px-10 py-4 rounded-full font-black uppercase tracking-widest text-[11px] transition-all duration-500 flex items-center gap-3 shadow-xl shadow-red-600/30"
              >
                <Play size={18} fill="currentColor" /> {t("play_trailer")}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "#dc2626", color: "#fff" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/cinema/${movie.cinema}/${movie._id || id}`)}
                className="bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-10 py-4 rounded-full font-black uppercase tracking-widest text-[11px] transition-all duration-300 text-zinc-900 dark:text-white group/btn"
              >
                {t("reserve_seat")}
                <ArrowRight size={18} className="ml-2 inline text-red-600 group-hover/btn:text-white transition-colors" />
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* TRAILER MODAL */}
      <AnimatePresence>
        {showTrailer && trailerUrl && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-white/90 dark:bg-black/95 backdrop-blur-2xl"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-full max-w-6xl aspect-video rounded-[30px] overflow-hidden border border-zinc-200 dark:border-white/10 shadow-2xl bg-black"
            >
              <button onClick={() => setShowTrailer(false)} className="absolute top-6 right-6 z-50 p-3 bg-red-600 text-white rounded-full hover:scale-110 transition-all shadow-xl">
                <X size={24} />
              </button>
              <video src={trailerUrl} controls autoPlay className="w-full h-full object-contain" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};