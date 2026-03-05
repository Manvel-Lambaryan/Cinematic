import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, AlertCircle, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export const NotFound = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Ստեղծում ենք 20-30 հատ սխալի պատուհան, որոնք պետք է շարվեն իրար վրա
  const windows = Array.from({ length: 25 });

  return (
    <div className="h-screen w-full bg-[#050505] flex items-center justify-center relative overflow-hidden select-none">
      {/* --- CASCADING ERROR WINDOWS --- */}
      <div className="absolute inset-0 z-10">
        {windows.map((_, i) => (
          <motion.div
            key={i}
            initial={{
              opacity: 0,
              scale: 0.8,
              x: "50%",
              y: "50%",
            }}
            animate={{
              opacity: 1,
              scale: 1,
              // Սա ստեղծում է շեղվող շարքի էֆեկտը
              x: `calc(10% + ${i * 15}px)`,
              y: `calc(15% + ${i * 12}px)`,
            }}
            transition={{
              delay: i * 0.05,
              type: "spring",
              stiffness: 100,
            }}
            className="absolute w-64 md:w-80 bg-zinc-900 border border-zinc-700 shadow-2xl rounded-lg overflow-hidden"
            style={{ zIndex: i }}
          >
            {/* Window Header */}
            <div className="bg-zinc-800 px-3 py-1.5 flex items-center justify-between border-b border-zinc-700">
              <div className="flex items-center gap-2">
                <AlertCircle size={12} className="text-red-600" />
                <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-tighter">
                  {t("system_error_404")}
                </span>
              </div>
              <X size={12} className="text-zinc-500" />
            </div>

            {/* Window Body */}
            <div className="p-6 bg-zinc-900 flex flex-col items-center gap-4">
              <div className="text-4xl font-black italic text-white tracking-tighter">
                {t("http_404")}
              </div>
              <p className="text-[10px] text-zinc-500 text-center font-mono uppercase">
                {t("scene_corrupted")}
              </p>
              <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="h-full bg-red-600"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* --- TOP LAYER CONTENT (BUTTONS) --- */}
      <div className="relative z-[100] text-center bg-black/40 backdrop-blur-xl p-10 rounded-[40px] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        <motion.h1
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-6xl font-black italic uppercase tracking-tighter mb-4"
        >
          {t("fatal_error")}
        </motion.h1>

        <p className="text-zinc-400 text-xs font-bold uppercase tracking-[0.3em] mb-10">
          {t("cinematic_sequence_failed")}
        </p>

        <div className="flex flex-col md:flex-row items-center gap-6 justify-center">
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: "#dc2626" }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("/")}
            className="flex items-center gap-3 bg-red-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
          >
            <Home size={14} />
            {t("emergency_reboot")}
          </motion.button>

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-black uppercase tracking-widest text-[10px]"
          >
            <ArrowLeft size={14} />
            {t("go_back")}
          </button>
        </div>
      </div>

      {/* BACKGROUND GLITCH NOISE */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0 bg-[url('https://media.giphy.com/media/oEI9uWUHv9atSgn6EB/giphy.gif')]" />
    </div>
  );
};
