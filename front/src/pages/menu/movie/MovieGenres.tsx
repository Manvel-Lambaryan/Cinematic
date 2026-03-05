import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Axios, API_URL } from "../../../config/axios";
import type { IMovie } from "../../../types/type";
import { motion } from "framer-motion";
import { ChevronLeft, PlayCircle } from "lucide-react";

export const MovieGenre = () => {
    const { genreName } = useParams<{ genreName: string }>();
    const [movies, setMovies] = useState<IMovie[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMoviesByGenre = async () => {
            try {
                setLoading(true);
                const res = await Axios.get("/movie");
                const allMovies: IMovie[] = res.data.data || res.data;

                if (genreName?.toLowerCase() === "all") {
                    setMovies(allMovies);
                } else {
                    const filtered = allMovies.filter((m) =>
                        m.genre?.toLowerCase().includes(genreName?.toLowerCase() || "")
                    );
                    setMovies(filtered);
                }
            } catch (err) {
                console.error("Genre fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMoviesByGenre();
    }, [genreName]);

    if (loading) return (
        // Loader-ի գույնը ևս ադապտիվ է
        <div className="h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center transition-colors">
            <div className="w-12 h-[2px] bg-red-600 animate-pulse shadow-[0_0_15px_#dc2626]" />
        </div>
    );

    return (
        <div className="min-h-screen w-full bg-slate-50 dark:bg-[#020617] transition-colors duration-500 p-6 md:p-12 lg:p-16">

            {/* BACK BUTTON */}
            <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => navigate(-1)}
                className="flex items-center gap-3 text-slate-500 dark:text-white/40 mb-12 group transition-all"
            >
                <div className="p-2 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 group-hover:bg-red-600 group-hover:border-red-600 group-hover:text-white transition-all shadow-sm">
                    <ChevronLeft size={18} />
                </div>
                <span className="uppercase font-black text-[10px] tracking-[3px] group-hover:text-red-600 dark:group-hover:text-white transition-colors">Back</span>
            </motion.button>

            {/* HEADER */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-16"
            >
                <p className="text-red-600 font-black uppercase text-[12px] tracking-[4px] mb-2 italic">Category</p>
                <h2 className="text-slate-900 dark:text-white text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">
                    {genreName} <span className="text-slate-300 dark:text-white/10 italic">Collections</span>
                </h2>
            </motion.div>

            {/* MOVIES GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-10">
                {movies.map((movie, index) => (
                    <motion.div
                        key={movie._id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => navigate(`/movie/${movie._id}`)}
                        className="group cursor-pointer"
                    >
                        <div className="relative aspect-[2/3] rounded-[30px] overflow-hidden shadow-lg hover:shadow-2xl dark:shadow-none border border-slate-200 dark:border-white/10 bg-slate-200 dark:bg-white/5 transition-all duration-500">
                            <img
                                src={`${API_URL}${movie.posterUrl}`}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                alt={movie.title}
                            />

                            {/* Overlay on hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-red-600/90 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    className="bg-white text-red-600 p-4 rounded-full shadow-2xl"
                                >
                                    <PlayCircle size={32} fill="currentColor" className="text-white" />
                                </motion.div>
                            </div>
                        </div>

                        {/* Info Block */}
                        <div className="mt-6 px-2">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-red-600 text-[9px] font-black uppercase tracking-widest">{movie.genre}</span>
                            </div>
                            <h3 className="text-slate-900 dark:text-white font-black uppercase italic text-sm md:text-base leading-tight group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
                                {movie.title}
                            </h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* EMPTY STATE */}
            {movies.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-40 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[40px]"
                >
                    <div className="text-slate-200 dark:text-white/5 text-6xl md:text-9xl font-black uppercase italic tracking-tighter select-none">
                        Empty
                    </div>
                    <p className="text-slate-400 dark:text-white/40 font-bold uppercase tracking-[4px] text-[10px] mt-4">
                        No movies found in this genre
                    </p>
                </motion.div>
            )}
        </div>
    );
};