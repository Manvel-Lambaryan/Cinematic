import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Ticket, ChevronRight, User } from "lucide-react";
import { Axios } from "../../../config/axios";
import { useTranslation } from "react-i18next";

export const Register = () => {
  const { t } = useTranslation();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const cinemaBackground =
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await Axios.post("/auth/register", {
        name,
        email,
        password,
      });

      const { accessToken } = response.data;
      localStorage.setItem("accessToken", accessToken);
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.err || t("registration_failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    /* flex items-center justify-center - սա է ապահովում կատարյալ կենտրոնացումը */
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] overflow-hidden relative p-4">
      {/* 🎬 Background Layer */}
      <div className="absolute inset-0 z-0">
        <img
          src={cinemaBackground}
          alt="Cinema"
          className="w-full h-full object-cover opacity-98" // Բարձրացրել ենք opacity-ն, որ ավելի պարզ երևա
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
      </div>

      {/* 🎫 Styled Register Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full flex justify-center"
      >
        {/* Քո նշած w-140-ը փոխարինել ենք max-w-[560px]-ով (քանի որ 140 * 4px = 560px) */}
        <div className="bg-black/70 backdrop-blur-md border border-white/20 p-8 rounded-[2rem] shadow-[0_0_40px_rgba(0,0,0,0.3)] w-full max-w-[460px]">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-red-600 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-600/40 -rotate-3 hover:rotate-0 transition-transform cursor-default">
              <Ticket className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
              CINEMA<span className="text-red-600">TIC</span>
            </h1>
            <p className="text-gray-300 text-[11px] mt-1 font-medium tracking-[0.2em] uppercase opacity-80">
              {t("create_premiere_account")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl text-xs text-center font-semibold"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Name Field */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 p-1.5 rounded-lg group-focus-within:bg-red-600 transition-colors">
                <User className="text-white" size={16} />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-white/10 border border-white/10 rounded-2xl pl-14 pr-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all placeholder:text-gray-400 text-sm font-medium"
                placeholder={t("full_name")}
              />
            </div>

            {/* Email Field */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 p-1.5 rounded-lg group-focus-within:bg-red-600 transition-colors">
                <Mail className="text-white" size={16} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/10 border border-white/10 rounded-2xl pl-14 pr-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all placeholder:text-gray-400 text-sm font-medium"
                placeholder={t("email_address")}
              />
            </div>

            {/* Password Field */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 p-1.5 rounded-lg group-focus-within:bg-red-600 transition-colors">
                <Lock className="text-white" size={16} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/10 border border-white/10 rounded-2xl pl-14 pr-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all placeholder:text-gray-400 text-sm font-medium"
                placeholder={t("create_password")}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-red-600/20 transition-all active:scale-95 disabled:opacity-50 mt-4"
            >
              {loading ? t("joining_theater") : t("get_your_ticket")}
              {!loading && <ChevronRight size={18} />}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center border-t border-white/10 pt-6">
            <Link
              to="/login"
              className="text-gray-300 text-xs font-medium hover:text-white transition-colors uppercase tracking-widest"
            >
              {t("already_a_member")}{" "}
              <span className="text-red-500 font-bold ml-1 hover:underline underline-offset-4">
                {t("login")}
              </span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
