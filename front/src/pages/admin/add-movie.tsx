import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Axios } from "../../config/axios";
import {
  CloudArrowUpIcon,
  FilmIcon,
  StarIcon,
  DocumentTextIcon,
  TagIcon,
  SparklesIcon,
  VideoCameraIcon,
  TicketIcon,
  CalendarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

export const AddMovie = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    genre: "",
    rating: "",
    cinemaId: "",
    price: "",
    releaseDate: "",
    showTime: "",
  });

  const [cinemas, setCinemas] = useState<any[]>([]);
  const [isCinemasLoading, setIsCinemasLoading] = useState(true);
  const [previews, setPreviews] = useState({ poster: "", banner: "" });
  const [files, setFiles] = useState<{
    poster: File | null;
    banner: File | null;
    video: File | null;
  }>({ poster: null, banner: null, video: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCinemas = async () => {
      setIsCinemasLoading(true);
      try {
        const res = await Axios.get("/cinema");
        const actualData = res.data.data || res.data;
        setCinemas(Array.isArray(actualData) ? actualData : []);
      } catch (err) {
        console.error(t("error_fetching_cinemas"), err);
      } finally {
        setIsCinemasLoading(false);
      }
    };
    fetchCinemas();
  }, [t]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "poster" | "banner" | "video",
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles((prev) => ({ ...prev, [type]: file }));
      if (type !== "video") {
        setPreviews((prev) => ({ ...prev, [type]: URL.createObjectURL(file) }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.cinemaId || formData.cinemaId === "") {
      return alert(t("please_select_cinema_hall"));
    }

    setIsSubmitting(true);
    const data = new FormData();

    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("genre", formData.genre);
    data.append("rating", formData.rating || "0");
    data.append("price", formData.price || "0");
    data.append("cinema", formData.cinemaId);

    const releaseDateTime = formData.releaseDate && formData.showTime 
      ? new Date(`${formData.releaseDate}T${formData.showTime}`)
      : new Date();
    data.append("releaseDate", releaseDateTime.toISOString());
    data.append("showTime", formData.showTime || "00:00");
    data.append("duration", "120");

    if (files.poster) data.append("posterUrl", files.poster);
    if (files.banner) data.append("imageUrl", files.banner);
    if (files.video) data.append("videoUrl", files.video);

    try {
      await Axios.post("/movie/add-movie", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(t("movie_published_success"));
    } catch (err: any) {
      console.error(t("upload_error"), err.response?.data || err);
      alert(err.response?.data?.message || t("upload_failed_check_console"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-zinc-900 dark:text-white font-sans selection:bg-red-600/30 transition-colors duration-700">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* --- HEADER --- */}
        <div className="mb-20 text-center relative">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-red-600/10 blur-[80px] rounded-full"
          />
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-7xl md:text-8xl font-black uppercase italic tracking-tighter text-zinc-900 dark:text-white"
          >
            {t("studio_vault")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-[10px] text-xs mt-4"
          >
            {t("forge_cinematic_legacy")}
          </motion.p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start"
        >
          {/* --- LEFT SIDE --- */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="lg:col-span-7 space-y-12"
          >
            <div className="space-y-8">
              <SectionHeader title={t("core_details")} step="01" />
              <div className="grid gap-8">
                <FloatingInput
                  label={t("feature_title")}
                  placeholder={t("interstellar")}
                  icon={<FilmIcon className="w-5 h-5 text-red-600" />}
                  onChange={(val: string) =>
                    setFormData({ ...formData, title: val })
                  }
                />

                {/* Cinema Hall Selector */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600/20 to-transparent rounded-3xl opacity-0 group-focus-within:opacity-100 transition-all" />
                  <div className="relative bg-zinc-50 dark:bg-black/40 border-2 border-zinc-200 dark:border-white/5 rounded-3xl p-6 flex items-center gap-6">
                    <div className="p-3 bg-white dark:bg-white/5 border border-zinc-100 dark:border-none rounded-2xl text-red-600">
                      <TicketIcon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">
                        {t("assign_cinema_hall")}
                      </span>
                      <select
                        value={formData.cinemaId}
                        onChange={(e) =>
                          setFormData({ ...formData, cinemaId: e.target.value })
                        }
                        className="bg-transparent outline-none text-lg font-bold text-zinc-900 dark:text-white appearance-none cursor-pointer w-full"
                        disabled={isCinemasLoading}
                      >
                        <option value="" className="dark:bg-zinc-900">
                          {isCinemasLoading
                            ? t("loading")
                            : t("select_a_hall")}
                        </option>
                        {cinemas.map((c) => (
                          <option
                            key={c._id}
                            value={c._id}
                            className="text-black dark:text-white dark:bg-zinc-900"
                          >
                            {t("hall_number_short")}
                            {c.numbering}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  <FloatingInput
                    label={t("primary_genre")}
                    placeholder={t("scifi_adventure")}
                    icon={<TagIcon className="w-5 h-5 text-red-600" />}
                    onChange={(val: string) =>
                      setFormData({ ...formData, genre: val })
                    }
                  />
                  <FloatingInput
                    label={t("internal_rating")}
                    placeholder={t("rating_example")}
                    type="number"
                    icon={<StarIcon className="w-5 h-5 text-red-600" />}
                    onChange={(val: string) =>
                      setFormData({ ...formData, rating: val })
                    }
                  />
                  <FloatingInput
                    label={t("price")}
                    placeholder={t("price_example")}
                    type="number"
                    icon={<TicketIcon className="w-5 h-5 text-red-600" />}
                    onChange={(val: string) =>
                      setFormData({ ...formData, price: val })
                    }
                  />
                </div>

                {/* Date and Time Section - Modern Glass Style */}
                <div className="space-y-8">
                  <SectionHeader title="Schedule" step="03" />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Release Date Picker */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl opacity-20 blur-xl" />
                      <div className="relative bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-8 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                              <CalendarIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Release Date</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">When does it premiere?</p>
                            </div>
                          </div>
                        </div>
                        <div className="relative">
                          <input
                            type="date"
                            value={formData.releaseDate}
                            onChange={(e) =>
                              setFormData({ ...formData, releaseDate: e.target.value })
                            }
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            min={new Date().toISOString().split('T')[0]}
                          />
                          {formData.releaseDate && (
                            <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                              <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                                🎬 {new Date(formData.releaseDate).toLocaleDateString('en-US', { 
                                  weekday: 'long', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Show Time Picker */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-2xl opacity-20 blur-xl" />
                      <div className="relative bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-8 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                              <ClockIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Show Time</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">When does it start?</p>
                            </div>
                          </div>
                        </div>
                        <div className="relative">
                          <input
                            type="time"
                            value={formData.showTime}
                            onChange={(e) =>
                              setFormData({ ...formData, showTime: e.target.value })
                            }
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          />
                          {formData.showTime && (
                            <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                🎭 {formData.showTime} • {parseInt(formData.showTime.split(':')[0]) < 12 ? 'Morning Show' : parseInt(formData.showTime.split(':')[0]) < 18 ? 'Matinee' : 'Evening Show'}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Combined Schedule Display */}
                  {formData.releaseDate && formData.showTime && (
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl opacity-20 blur-xl" />
                      <div className="relative bg-white/90 dark:bg-black/90 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-8 shadow-2xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Scheduled Successfully!</h3>
                              <p className="text-gray-600 dark:text-gray-400">
                                {new Date(formData.releaseDate).toLocaleDateString('en-US', { 
                                  weekday: 'short', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })} at {formData.showTime}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-green-600 dark:text-green-400">Ready to premiere</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Cinema management</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <SectionHeader title={t("trailer_sync")} step="02" />
              <div className="relative group">
                <div
                  className={`w-full bg-zinc-100 dark:bg-white/[0.02] border-2 border-dashed ${
                    files.video
                      ? "border-red-600/50"
                      : "border-zinc-200 dark:border-white/10"
                  } rounded-[30px] p-8 transition-all flex items-center justify-between`}
                >
                  <div className="flex items-center gap-6">
                    <div
                      className={`p-4 rounded-2xl ${
                        files.video
                          ? "bg-red-600 text-white"
                          : "bg-zinc-200 dark:bg-white/5 text-zinc-500"
                      }`}
                    >
                      <VideoCameraIcon className="w-8 h-8" />
                    </div>
                    <div className="flex flex-col">
                      <p className="font-black uppercase tracking-widest text-[10px] text-zinc-500 mb-1">
                        {t("trailer_asset")}
                      </p>
                      <p className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
                        {files.video
                          ? files.video.name
                          : t("no_cinematic_file_linked")}
                      </p>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileChange(e, "video")}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <SectionHeader title={t("narrative")} step="03" />
              <div className="relative group">
                <textarea
                  placeholder={t("movie_synopsis_placeholder")}
                  className="w-full bg-zinc-100 dark:bg-white/[0.02] border-2 border-zinc-200 dark:border-white/5 rounded-[40px] p-8 h-60 outline-none focus:border-red-600/40 transition-all text-lg leading-relaxed text-zinc-900 dark:text-white resize-none"
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
                <DocumentTextIcon className="absolute right-8 top-8 w-6 h-6 text-zinc-300 dark:text-zinc-800 group-focus-within:text-red-600 transition-colors" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="lg:col-span-5 space-y-12"
          >
            <div className="space-y-8">
              <SectionHeader title={t("visual_identity")} step="04" />
              <div className="space-y-8">
                <AssetUpload
                  label={t("vertical_key_art")}
                  aspect="aspect-[2/3]"
                  preview={previews.poster}
                  onChange={(e: any) => handleFileChange(e, "poster")}
                />
                <AssetUpload
                  label={t("cinematic_banner")}
                  aspect="aspect-video"
                  preview={previews.banner}
                  onChange={(e: any) => handleFileChange(e, "banner")}
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
              type="submit"
              className="relative w-full overflow-hidden group rounded-[30px] p-[2px] bg-gradient-to-r from-red-600 to-red-900 shadow-[0_20px_50px_rgba(220,38,38,0.2)]"
            >
              <div className="bg-white dark:bg-[#020202] group-hover:bg-transparent transition-all duration-500 py-6 rounded-[28px] flex items-center justify-center gap-4">
                <SparklesIcon
                  className={`w-6 h-6 text-red-600 group-hover:text-white ${
                    isSubmitting ? "animate-spin" : ""
                  }`}
                />
                <span className="font-black uppercase tracking-[6px] text-sm text-zinc-900 dark:text-white group-hover:text-white transition-colors">
                  {isSubmitting ? t("syncing_studio") : t("finalize_release")}
                </span>
              </div>
            </motion.button>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

// --- Helper Components ---

const SectionHeader = ({ title, step }: { title: string; step: string }) => (
  <div className="flex items-center gap-4">
    <span className="text-red-600 font-black italic text-2xl">{step}</span>
    <div className="h-[1px] w-8 bg-red-600" />
    <h3 className="text-sm font-black uppercase tracking-[4px] text-zinc-400 dark:text-zinc-500">
      {title}
    </h3>
  </div>
);

const FloatingInput = ({
  label,
  icon,
  placeholder,
  type = "text",
  onChange,
}: any) => (
  <div className="relative group">
    <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600/20 to-transparent rounded-3xl opacity-0 group-focus-within:opacity-100 transition-all" />
    <div className="relative bg-zinc-50 dark:bg-black/40 border-2 border-zinc-200 dark:border-white/5 rounded-3xl p-6 flex items-center gap-6 group-focus-within:border-red-600/40 transition-all">
      <div className="p-3 bg-white dark:bg-white/5 border border-zinc-100 dark:border-none rounded-2xl group-focus-within:bg-red-600/10 text-zinc-400 group-focus-within:text-red-600">
        {icon}
      </div>
      <div className="flex flex-col flex-1">
        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">
          {label}
        </span>
        <input
          type={type}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="bg-transparent outline-none text-lg font-bold placeholder:text-zinc-300 dark:placeholder:text-zinc-800 w-full text-zinc-900 dark:text-white"
        />
      </div>
    </div>
  </div>
);

const AssetUpload = ({ label, aspect, preview, onChange }: any) => (
  <div
    className={`relative ${aspect} rounded-[40px] overflow-hidden border-2 border-dashed border-zinc-200 dark:border-white/10 hover:border-red-600/50 transition-all duration-700 group bg-zinc-50 dark:bg-white/[0.01]`}
  >
    <AnimatePresence mode="wait">
      {preview ? (
        <motion.img
          key="preview"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          src={preview}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white dark:bg-white/5 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all text-zinc-400">
            <CloudArrowUpIcon className="w-8 h-8" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[4px] text-zinc-400 group-hover:text-red-600">
            {label}
          </p>
        </div>
      )}
    </AnimatePresence>
    <input
      type="file"
      onChange={onChange}
      className="absolute inset-0 opacity-0 cursor-pointer z-20"
    />
  </div>
);
