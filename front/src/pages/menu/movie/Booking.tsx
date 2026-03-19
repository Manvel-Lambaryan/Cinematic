import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Ticket,
  Sparkles,
  MoveRight,
  Armchair,
  X,
  Wallet,
  Lock,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { CreditCardForm } from "../../components/CreditCardForm";
import { useTranslation } from "react-i18next";
import { useBookingStore } from "../../../store/useBookingStore";
import { useAuthStore } from "../../../store/useAuthStore";

export const Booking = () => {
  const { cinemaId, id } = useParams<{ cinemaId: string; id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Booking store selectors
  const cinema = useBookingStore(state => state.cinema);
  const movie = useBookingStore(state => state.movie);
  const selectedSeats = useBookingStore(state => state.selectedSeats);
  const gridSize = useBookingStore(state => state.gridSize);
  const loading = useBookingStore(state => state.loading);
  const isProcessing = useBookingStore(state => state.isProcessing);
  const showTopUp = useBookingStore(state => state.showTopUp);
  const fetchCinemaData = useBookingStore(state => state.fetchCinemaData);
  const fetchMovieData = useBookingStore(state => state.fetchMovieData);
  const toggleSeat = useBookingStore(state => state.toggleSeat);
  const confirmOrder = useBookingStore(state => state.confirmOrder);
  const setShowTopUp = useBookingStore(state => state.setShowTopUp);
  const calculateTotalPrice = useBookingStore(state => state.calculateTotalPrice);
  
  // Auth store
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    if (cinemaId && id && id !== "undefined") {
      fetchCinemaData(cinemaId, id);
      fetchMovieData(id);
    }
  }, [cinemaId, id, fetchCinemaData, fetchMovieData]);


  const totalPrice = calculateTotalPrice();

  const handleConfirmOrder = async () => {
    if (selectedSeats.length === 0) return;
    if (!user) {
      toast.error(t("please_login_to_continue"));
      return navigate("/login");
    }
    
    if (user.balance < totalPrice) {
      toast.error(t("insufficient_balance"));
      setShowTopUp(true);
      return;
    }

    try {
      await confirmOrder(user._id || user.id, cinemaId!, id!);
      toast.success(t("booking_successful"));
      navigate("/profile/payments");
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("payment_failed"));
    }
  };

  const movieTitleKey = movie?.title
    ? `movies_data.${movie.title.toLowerCase().replace(/ /g, "_")}_title`
    : "";

  if (loading)
    return (
      <div className="h-screen bg-zinc-100 dark:bg-[#020617] flex items-center justify-center transition-colors">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-[#020617] text-zinc-900 dark:text-white selection:bg-red-600/30 overflow-x-hidden pb-40 transition-colors duration-300">
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] -left-[10%] w-[50%] h-[50%] bg-red-600/10 dark:bg-red-600/10 blur-[120px] rounded-full" />
      </div>

      <header className="max-w-7xl mx-auto px-8 py-10 flex justify-between items-end relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="bg-zinc-200/80 dark:bg-white/5 px-6 py-4 rounded-2xl border border-zinc-300 dark:border-white/5 flex items-center gap-3 hover:bg-zinc-300/80 dark:hover:bg-white/10 transition-all text-zinc-800 dark:text-white"
        >
          <ChevronLeft size={20} className="text-red-600" />
          <span className="text-[11px] font-black uppercase tracking-[3px]">
            {t("back")}
          </span>
        </button>
        <div className="text-right">
          <p className="text-red-600 text-[10px] font-black uppercase tracking-[6px] mb-2">
            {t(movieTitleKey) || movie?.title}
          </p>
          <h1 className="text-5xl font-black italic uppercase leading-none tracking-tighter text-zinc-900 dark:text-white">
            {t("hall_generic")}{" "}
            <span className="text-zinc-400 dark:text-white/10">#{cinema?.numbering}</span>
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 flex flex-col items-center relative z-10">
        <div className="w-full max-w-4xl mb-32">
          <div className="w-full h-[4px] bg-gradient-to-r from-transparent via-red-600 to-transparent shadow-[0_15px_40px_rgba(220,38,38,0.6)]" />
          <p className="text-center text-zinc-400 dark:text-white/10 uppercase tracking-[25px] text-[10px] font-black mt-10 ml-[25px]">
            {t("screen")}
          </p>
        </div>

        {/* SEATS GRID */}

        <div
          className="bg-white/90 dark:bg-white/[0.01] p-12 rounded-[60px] border border-zinc-200 dark:border-white/5 backdrop-blur-3xl mb-12 shadow-2xl overflow-x-auto max-w-full no-scrollbar transition-colors"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${gridSize.cols}, 55px)`,
            gap: "15px",
          }}
        >
          {cinema?.seats?.map((seat: any) => {
            const isSelected = selectedSeats.some((s) => s._id === seat._id);
            // 🔥 Հիմա օգտագործում ենք Backend-ից եկած isBooked դաշտը
            const isBooked = seat.isBooked;

            let seatStyles = "";

            if (isBooked) {
              seatStyles =
                "bg-red-950/20 border-red-900/20 text-transparent cursor-not-allowed opacity-40 blur-[0.5px]";
            } else if (isSelected) {
              seatStyles =
                "bg-red-600 border-red-400 scale-110 shadow-[0_0_20px_rgba(220,38,38,0.6)] text-white z-10";
            } else {
              const base =
                "bg-zinc-100 dark:bg-white/5 border-zinc-300 dark:border-white/10 text-zinc-600 dark:text-white/20 hover:border-red-600/40 hover:bg-zinc-200 dark:hover:bg-white/10";
              if (seat.types === "VIP")
                seatStyles =
                  "border-yellow-500/40 text-yellow-600 dark:text-yellow-500 bg-yellow-500/10 dark:bg-yellow-500/5";
              else if (seat.types === "MEDIUM")
                seatStyles = "border-red-600/40 text-red-600 bg-red-600/10 dark:bg-red-600/5";
              else seatStyles = base;
            }

            return (
              <button
                key={seat._id}
                disabled={isBooked}
                onClick={() => toggleSeat(seat)}
                style={{
                  gridColumnStart: seat.x + 1,
                  gridRowStart: seat.y + 1,
                }}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 relative overflow-hidden group ${seatStyles}`}
              >
                {!isBooked ? (
                  <span className="text-[13px] font-black italic relative z-10 text-zinc-800 dark:text-white">
                    {seat.numbering}
                  </span>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center gap-1"
                  >
                    <Lock size={14} className="text-red-600/60" />
                    <span className="text-[7px] font-black uppercase text-red-600/40 tracking-tighter">
                      {t("taken")}
                    </span>
                  </motion.div>
                )}
                {seat.types === "VIP" && !isBooked && !isSelected && (
                  <Sparkles
                    size={8}
                    className="absolute top-1.5 right-1.5 text-yellow-500 animate-pulse"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-10 bg-zinc-200/60 dark:bg-white/[0.03] px-12 py-7 rounded-full border border-zinc-300 dark:border-white/5 backdrop-blur-md transition-colors">
          {[
            {
              label: t("seat_vip"),
              color: "border-yellow-500/50 bg-yellow-500/10",
              text: "text-yellow-600 dark:text-yellow-500",
            },
            {
              label: t("seat_medium"),
              color: "border-red-600/50 bg-red-600/10",
              text: "text-red-600",
            },
            {
              label: t("seat_available"),
              color: "border-zinc-400 dark:border-white/10 bg-zinc-100 dark:bg-white/5",
              text: "text-zinc-500 dark:text-white/40",
            },
            {
              label: t("seat_booked"),
              icon: <Lock size={10} className="text-red-600" />,
              color: "bg-red-950/20 border-red-900/20 opacity-40",
              text: "text-red-800 dark:text-red-800",
            },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${item.color}`}
              >
                {item.icon}
              </div>
              <span
                className={`text-[10px] font-black uppercase tracking-widest ${item.text}`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </main>

      {/* Modals & Checkout Bar */}
      <AnimatePresence>
        {showTopUp && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 dark:bg-black/95 backdrop-blur-2xl p-4 transition-colors">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white dark:bg-[#0f172a] border border-zinc-200 dark:border-white/10 p-10 rounded-[40px] max-w-md w-full relative shadow-2xl transition-colors"
            >
              <button
                onClick={() => setShowTopUp(false)}
                className="absolute top-6 right-6 text-zinc-400 dark:text-white/20 hover:text-zinc-900 dark:hover:text-white"
              >
                <X size={24} />
              </button>
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-red-600/20 rounded-2xl">
                  <Wallet className="text-red-600" size={28} />
                </div>
                <h3 className="text-2xl font-black italic uppercase text-zinc-900 dark:text-white">
                  {t("balance_topup")}
                </h3>
              </div>
              <CreditCardForm onSuccess={() => setShowTopUp(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedSeats.length > 0 && (
          <motion.div
            initial={{ y: 150, x: "-50%" }}
            animate={{ y: 0, x: "-50%" }}
            className="fixed bottom-8 left-1/2 w-[95%] max-w-5xl z-50"
          >
            <div className="bg-white/95 dark:bg-black/80 backdrop-blur-3xl border border-zinc-200 dark:border-white/10 rounded-[45px] p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl transition-colors">
              <div className="flex gap-12">
                <div className="flex items-center gap-5">
                  <div className="p-5 bg-red-600/10 rounded-2xl text-red-600">
                    <Armchair size={28} />
                  </div>
                  <div>
                    <p className="text-zinc-500 dark:text-white/30 text-[10px] font-black uppercase tracking-[4px]">
                      {t("seats")}
                    </p>
                    <p className="text-4xl font-black italic text-zinc-900 dark:text-white">
                      {selectedSeats.length}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <div className="p-5 bg-zinc-100 dark:bg-white/5 rounded-2xl text-zinc-600 dark:text-white/60">
                    <Ticket size={28} />
                  </div>
                  <div>
                    <p className="text-zinc-500 dark:text-white/30 text-[10px] font-black uppercase tracking-[4px]">
                      {t("total")}
                    </p>
                    <p className="text-4xl font-black italic text-zinc-900 dark:text-white">
                      {totalPrice.toLocaleString()}{" "}
                      <span className="text-red-600 text-xs">
                        {t("currency_amd")}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleConfirmOrder}
                disabled={isProcessing}
                className="bg-red-600 text-white px-16 py-7 rounded-[30px] font-black uppercase italic hover:bg-red-700 transition-all flex items-center justify-center gap-4 disabled:opacity-60"
              >
                {isProcessing ? t("processing") : t("book_now")} <MoveRight />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
