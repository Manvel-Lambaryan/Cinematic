import { useEffect, useState } from "react";
import { Axios } from "../../config/axios";
import type { IMovie } from "../../types/type";
import {
  Trash2,
  AlertCircle,
  Search,
  Pencil,
  X,
  Save,
  Clapperboard,
  DollarSign,
  Star,
  Layers,
  Video,
  LayoutGrid, // Նոր icon դահլիճի համար
  Calendar,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "../../config/axios";

const MovieList = () => {
  const [movies, setMovies] = useState<IMovie[]>([]);
  const [cinemas, setCinemas] = useState<any[]>([]); // Դահլիճների state
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<IMovie | null>(null);

  useEffect(() => {
    fetchMovies();
    fetchCinemas(); // Բեռնում ենք դահլիճները էջը բացելիս
  }, []);

  const fetchMovies = async () => {
    try {
      const res = await Axios.get("/movie");
      const data = res.data.data || res.data;
      if (Array.isArray(data)) setMovies(data);
    } catch (err) {
      console.error("Failed to fetch movies", err);
    }
  };

  const fetchCinemas = async () => {
    try {
      const res = await Axios.get("/cinema");
      const data = res.data.data || res.data;
      if (Array.isArray(data)) setCinemas(data);
    } catch (err) {
      console.error("Failed to fetch cinemas", err);
    }
  };

  const getImageUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const cleanPath = path.replace("/not/", "/");
    const finalPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
    return `${API_URL}${finalPath}`;
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this title?")) return;
    setLoading(true);
    try {
      const res = await Axios.delete(`/movie/${id}`);
      if (res.data.success || res.status === 200) {
        setMovies((prev) => prev.filter((m) => m._id !== id));
      }
    } catch (err) {
      alert("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (movie: IMovie) => {
    setEditingMovie({ ...movie });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMovie) return;
    setLoading(true);
    try {
      const res = await Axios.patch(`/movie/${editingMovie._id}`, editingMovie);
      if (res.data.success || res.status === 200) {
        setMovies((prev) =>
          prev.map((m) => (m._id === editingMovie._id ? editingMovie : m)),
        );
        setIsEditModalOpen(false);
      }
    } catch (err) {
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  const filteredMovies = movies.filter((m) =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-10 font-sans text-zinc-900 dark:text-white transition-colors duration-700">
      <div className="max-w-6xl mx-auto">
        {/* --- HEADER --- */}
        <div className="relative mb-12 p-8 rounded-[40px] border border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.02] backdrop-blur-md shadow-sm">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter flex items-center gap-4">
                Movie <span className="text-red-600">Vault</span>
              </h2>
              <p className="text-zinc-500 mt-2 font-medium uppercase tracking-[2px] text-xs">
                Administrative Control Panel
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search Movies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl py-3 pl-12 pr-6 focus:outline-none focus:border-red-600/50 transition-all w-full md:w-64 text-sm shadow-inner dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* --- MOVIE LIST --- */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredMovies.map((movie, index) => (
              <motion.div
                key={movie._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="group flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-zinc-900/40 hover:bg-zinc-50 dark:hover:bg-zinc-900/80 p-5 rounded-[30px] border border-zinc-200 dark:border-white/5 hover:border-red-600/30 transition-all duration-500 shadow-sm"
              >
                <div className="flex items-center gap-6">
                  <img
                    src={getImageUrl(movie.posterUrl || movie.imageUrl)}
                    alt={movie.title}
                    className="w-16 h-24 object-cover rounded-xl shadow-lg border border-zinc-200 dark:border-white/10"
                  />
                  <div>
                    <h3 className="text-xl font-black uppercase italic group-hover:text-red-600 transition-colors dark:text-white">
                      {movie.title}
                    </h3>
                    <div className="flex flex-wrap gap-3 mt-2">
                      <span className="text-[9px] font-black px-2 py-0.5 bg-red-600 text-white rounded uppercase">
                        {movie.genre}
                      </span>
                      <span className="text-[10px] text-zinc-400 uppercase font-bold flex items-center gap-1">
                        <LayoutGrid size={12} /> Hall #
                        {cinemas.find((c) => c._id === movie.cinema)
                          ?.numbering || "N/A"}
                      </span>
                      <span className="text-[10px] text-zinc-400 uppercase font-bold flex items-center gap-1">
                        <DollarSign size={12} /> {movie.price} AMD
                      </span>
                      {movie.releaseDate && (
                        <span className="text-[10px] text-purple-400 uppercase font-bold flex items-center gap-1">
                          <Calendar size={12} /> {new Date(movie.releaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                      {movie.showTime && (
                        <span className="text-[10px] text-blue-400 uppercase font-bold flex items-center gap-1">
                          <Clock size={12} /> {movie.showTime}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6 md:mt-0">
                  <button
                    onClick={() => handleEdit(movie)}
                    className="p-4 bg-blue-600/10 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(movie._id)}
                    className="p-4 bg-red-600/10 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* --- EDIT MODAL --- */}
      <AnimatePresence>
        {isEditModalOpen && editingMovie && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="fixed inset-0 bg-zinc-950/90 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-[40px] shadow-2xl border border-zinc-200 dark:border-white/10 overflow-hidden"
            >
              <div className="p-8 md:p-10 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-600 rounded-2xl text-white shadow-lg shadow-red-600/30">
                      <Clapperboard size={24} />
                    </div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter dark:text-white">
                      Edit <span className="text-red-600">Metadata</span>
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-full dark:text-zinc-400"
                  >
                    <X size={28} />
                  </button>
                </div>

                <form onSubmit={handleUpdate} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Poster Preview */}
                    <div className="flex flex-col gap-6">
                      <img
                        src={getImageUrl(
                          editingMovie.posterUrl || editingMovie.imageUrl,
                        )}
                        className="w-full h-80 object-cover rounded-[30px] shadow-2xl border dark:border-white/10"
                        alt="Poster"
                      />
                      <div className="space-y-3">
                        <label className="text-[10px] uppercase font-black text-zinc-400 tracking-widest ml-2 flex items-center gap-2">
                          <Video size={12} /> Trailer URL
                        </label>
                        <input
                          type="text"
                          value={editingMovie.videoUrl || ""}
                          onChange={(e) =>
                            setEditingMovie({
                              ...editingMovie,
                              videoUrl: e.target.value,
                            })
                          }
                          className="w-full bg-zinc-100 dark:bg-white/5 p-4 rounded-2xl text-xs outline-none border border-transparent focus:border-red-600/50 transition-all dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4 md:col-span-2">
                        <label className="text-[10px] uppercase font-black text-zinc-400 tracking-widest ml-2">
                          Title
                        </label>
                        <input
                          type="text"
                          value={editingMovie.title}
                          onChange={(e) =>
                            setEditingMovie({
                              ...editingMovie,
                              title: e.target.value,
                            })
                          }
                          className="w-full bg-zinc-100 dark:bg-white/5 p-4 rounded-2xl text-sm outline-none border border-transparent focus:border-red-600/50 transition-all font-bold dark:text-white"
                        />
                      </div>

                      <div className="space-y-4 md:col-span-2">
                        <label className="text-[10px] uppercase font-black text-zinc-400 tracking-widest ml-2">
                          Description
                        </label>
                        <textarea
                          rows={3}
                          value={editingMovie.description}
                          onChange={(e) =>
                            setEditingMovie({
                              ...editingMovie,
                              description: e.target.value,
                            })
                          }
                          className="w-full bg-zinc-100 dark:bg-white/5 p-4 rounded-2xl text-sm outline-none border border-transparent focus:border-red-600/50 transition-all resize-none dark:text-white"
                        />
                      </div>

                      {/* --- HALL SELECTION (NEW) --- */}
                      <div className="space-y-4">
                        <label className="text-[10px] uppercase font-black text-zinc-400 tracking-widest ml-2 flex items-center gap-2">
                          <LayoutGrid size={12} /> Assigned Hall
                        </label>
                        <select
                          value={editingMovie.cinema || ""}
                          onChange={(e) =>
                            setEditingMovie({
                              ...editingMovie,
                              cinema: e.target.value,
                            })
                          }
                          className="w-full bg-zinc-100 dark:bg-white/5 p-4 rounded-2xl text-sm outline-none border border-transparent focus:border-red-600/50 transition-all dark:text-white appearance-none cursor-pointer font-bold"
                        >
                          <option
                            value=""
                            disabled
                            className="dark:bg-zinc-900"
                          >
                            Select a Hall
                          </option>
                          {cinemas.map((hall) => (
                            <option
                              key={hall._id}
                              value={hall._id}
                              className="dark:bg-zinc-900"
                            >
                              Hall #{hall.numbering} ({hall.seats?.length || 0}{" "}
                              Seats)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] uppercase font-black text-zinc-400 tracking-widest ml-2 flex items-center gap-2">
                          <Layers size={12} /> Genre
                        </label>
                        <input
                          type="text"
                          value={editingMovie.genre}
                          onChange={(e) =>
                            setEditingMovie({
                              ...editingMovie,
                              genre: e.target.value,
                            })
                          }
                          className="w-full bg-zinc-100 dark:bg-white/5 p-4 rounded-2xl text-sm outline-none border border-transparent focus:border-red-600/50 transition-all dark:text-white"
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] uppercase font-black text-zinc-400 tracking-widest ml-2 flex items-center gap-2">
                          <Star size={12} /> Rating
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={editingMovie.rating}
                          onChange={(e) =>
                            setEditingMovie({
                              ...editingMovie,
                              rating: Number(e.target.value),
                            })
                          }
                          className="w-full bg-zinc-100 dark:bg-white/5 p-4 rounded-2xl text-sm outline-none border border-transparent focus:border-red-600/50 transition-all font-bold text-red-600"
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] uppercase font-black text-zinc-400 tracking-widest ml-2 flex items-center gap-2">
                          <DollarSign size={12} /> Ticket Price
                        </label>
                        <input
                          type="number"
                          value={editingMovie.price}
                          onChange={(e) =>
                            setEditingMovie({
                              ...editingMovie,
                              price: Number(e.target.value),
                            })
                          }
                          className="w-full bg-zinc-100 dark:bg-white/5 p-4 rounded-2xl text-sm outline-none border border-transparent focus:border-red-600/50 transition-all font-bold text-green-600"
                        />
                      </div>

                      {/* Release Date Field */}
                      <div className="space-y-4">
                        <label className="text-[10px] uppercase font-black text-zinc-400 tracking-widest ml-2 flex items-center gap-2">
                          <Calendar size={12} /> Release Date
                        </label>
                        <input
                          type="date"
                          value={editingMovie.releaseDate ? new Date(editingMovie.releaseDate).toISOString().split('T')[0] : ''}
                          onChange={(e) =>
                            setEditingMovie({
                              ...editingMovie,
                              releaseDate: new Date(e.target.value).toISOString(),
                            })
                          }
                          className="w-full bg-zinc-100 dark:bg-white/5 p-4 rounded-2xl text-sm outline-none border border-transparent focus:border-red-600/50 transition-all font-bold text-purple-600"
                        />
                      </div>

                      {/* Show Time Field */}
                      <div className="space-y-4">
                        <label className="text-[10px] uppercase font-black text-zinc-400 tracking-widest ml-2 flex items-center gap-2">
                          <Clock size={12} /> Show Time
                        </label>
                        <input
                          type="time"
                          value={editingMovie.showTime || ''}
                          onChange={(e) =>
                            setEditingMovie({
                              ...editingMovie,
                              showTime: e.target.value,
                            })
                          }
                          className="w-full bg-zinc-100 dark:bg-white/5 p-4 rounded-2xl text-sm outline-none border border-transparent focus:border-red-600/50 transition-all font-bold text-blue-600"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t dark:border-white/5 flex gap-4">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="flex-1 bg-zinc-100 dark:bg-white/5 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[2px] dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-white/10 transition-all"
                    >
                      Discard
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-[2] bg-red-600 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[2px] text-white shadow-xl shadow-red-600/20 flex items-center justify-center gap-3 hover:bg-red-700 transition-all"
                    >
                      <Save size={18} />{" "}
                      {loading ? "Syncing..." : "Commit Changes"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MovieList;
