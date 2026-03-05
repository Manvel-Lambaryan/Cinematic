import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Axios } from "../../../config/axios";
import { API_URL } from "../../../config/axios";
import { useTranslation } from "react-i18next";
import { Clock, CheckCircle2, Receipt, Wallet, Film } from "lucide-react";

// --- IMAGE URL HELPER ---
const getImageUrl = (path: string, isHeroBanner: boolean = false) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  let finalPath = path.startsWith("/") ? path : `/${path}`;
  if (isHeroBanner) {
    if (!finalPath.includes("/not/"))
      finalPath = finalPath.replace("/uploads/", "/uploads/not/");
  } else {
    finalPath = finalPath.replace("/not/", "/");
  }
  return `${API_URL}${finalPath}`;
};

// --- PAYMENT ITEM COMPONENT ---
export const PaymentItem = ({ tx, index }: { tx: any; index: number }) => {
  const { t } = useTranslation();
  const [movie, setMovie] = useState<any>(
    tx.movie && typeof tx.movie === "object" ? tx.movie : null,
  );
  const isBooking = tx.amount < 0;

  useEffect(() => {
    const fetchMovieData = async () => {
      if (movie && movie.title) return;
      const movieId = tx.movie?._id || tx.movie;

      if (
        isBooking &&
        movieId &&
        typeof movieId === "string" &&
        movieId.length > 10
      ) {
        try {
          const res = await Axios.get(`/movies/${movieId}`);
          const movieData = res.data.data || res.data;
          setMovie(movieData);
        } catch (err) {
          console.error(`Error:`, err);
        }
      }
    };
    fetchMovieData();
  }, [tx.movie, isBooking, movie]);

  const getMovieTitle = () => {
    if (!movie) return isBooking ? t("cinema_booking") : t("wallet_topup");
    const movieKey = movie.title.toLowerCase().replace(/\s+/g, "_");
    return t(`movies_data.${movieKey}_title`, { defaultValue: movie.title });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative bg-zinc-900/40 border border-white/5 p-5 rounded-[30px] flex flex-col md:flex-row items-center justify-between hover:bg-zinc-800/60 transition-all duration-500 mb-4 shadow-xl overflow-hidden"
    >
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${isBooking ? "bg-red-600" : "bg-green-500"} opacity-50`}
      />

      <div className="flex items-center gap-6 w-full">
        {/* Poster */}
        <div className="relative shrink-0 w-20 h-28 rounded-xl overflow-hidden border border-white/10 bg-white/5 shadow-2xl">
          {movie?.posterUrl ? (
            <img
              src={getImageUrl(movie.posterUrl)}
              alt=""
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-800">
              {isBooking ? (
                <Film className="text-white/10" size={28} />
              ) : (
                <Wallet className="text-green-500/20" size={28} />
              )}
            </div>
          )}
        </div>

        {/* Text Info */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h3 className="text-xl md:text-2xl font-black italic uppercase text-white tracking-tighter">
              {getMovieTitle()}
            </h3>
            <span
              className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-md ${isBooking ? "bg-red-600/20 text-red-500" : "bg-green-500/20 text-green-500"}`}
            >
              {isBooking ? t("status_reserved") : t("status_verified")}
            </span>
          </div>

          <div className="flex items-center gap-4 opacity-30 text-[9px] font-bold uppercase tracking-[2px]">
            <div className="flex items-center gap-1.5">
              <Clock size={12} /> {new Date(tx.createdAt).toLocaleDateString()}
            </div>
            <span>Ref: {tx._id.slice(-6).toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Price */}
      <div className="text-right flex flex-col items-end shrink-0 mt-4 md:mt-0">
        <p
          className={`text-3xl md:text-4xl font-black italic tracking-tighter ${isBooking ? "text-white" : "text-green-500"}`}
        >
          {tx.amount > 0 ? "+" : ""}
          {tx.amount.toLocaleString()}
          <span className="text-[10px] not-italic opacity-30 ml-1">AMD</span>
        </p>
        <div className="flex items-center gap-1 mt-1 opacity-40">
          <span className="text-[8px] font-black uppercase tracking-widest">
            {t("status_success")}
          </span>
          <CheckCircle2 size={10} className="text-green-500" />
        </div>
      </div>
    </motion.div>
  );
};

// --- MAIN PAGE COMPONENT ---
const PaymentHistory = () => {
  const { t } = useTranslation();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const userId = user._id || user.id;
        if (userId) {
          const res = await Axios.get(`/payments/history/${userId}`);
          setHistory(res.data.data || res.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#020617]">
        <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-12 text-white min-h-screen">
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-2">
          <Receipt className="text-red-600" size={24} />
          <span className="text-red-600 font-black uppercase tracking-[4px] text-[10px]">
            {t("billing_center")}
          </span>
        </div>
        <h2 className="text-5xl font-black italic uppercase tracking-tighter">
          {t("history")} <span className="opacity-10">{t("settings")}</span>
        </h2>
      </header>

      <div className="space-y-3">
        {history.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-white/5 rounded-[40px] opacity-20 uppercase tracking-[5px] text-xs">
            {t("no_records")}
          </div>
        ) : (
          history.map((tx, index) => (
            <PaymentItem key={tx._id} tx={tx} index={index} />
          ))
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;
