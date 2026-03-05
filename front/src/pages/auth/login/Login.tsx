import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Ticket, ChevronRight, AlertCircle } from "lucide-react";
import { Axios } from "../../../config/axios";
import { GoogleLogin } from "@react-oauth/google";
import { useTranslation } from "react-i18next";

export const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  const cinemaBackground =
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return; // Արգելափակում ենք հարցումը, եթե լոկ է

    setError("");
    setLoading(true);
    try {
      const response = await Axios.post("/auth/login", { email, password });
      localStorage.setItem("accessToken", response.data.accessToken);
      window.location.href = "/";
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || t("invalid_credentials");
      setError(errorMessage);

      // Եթե սխալը պարունակում է "locked" կամ "blocked", նշանակում է 3 անգամ սխալվել է
      if (
        errorMessage.toLowerCase().includes("locked") ||
        errorMessage.toLowerCase().includes("blocked")
      ) {
        setIsLocked(true);
        // 3 րոպե հետո ավտոմատ բացել կոճակը Frontend-ում
        setTimeout(() => setIsLocked(false), 180000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setLoading(true);
      setError("");

      const res = await Axios.post("/auth/google-login", {
        token: credentialResponse.credential,
      });

      if (res.data.accessToken) {
        localStorage.setItem("accessToken", res.data.accessToken);
        window.location.href = "/";
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t("google_login_failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] overflow-hidden relative p-4 font-sans">
      <div className="absolute inset-0 z-0">
        <img
          src={cinemaBackground}
          className="w-full h-full object-cover opacity-60"
          alt="Cinema background"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-black/60" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-[460px]"
      >
        <div className="bg-black/60 backdrop-blur-2xl border border-white/10 p-8 md:p-10 rounded-[2.5rem] shadow-2xl">
          <div className="text-center mb-8">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="bg-red-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-red-600/40"
            >
              <Ticket className="text-white w-9 h-9" />
            </motion.div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
              CINEMA<span className="text-red-600">TIC</span>
            </h1>
            <p className="text-gray-400 text-[10px] tracking-[0.3em] uppercase mt-2 font-bold">
              {t("premium_experience")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`flex items-center gap-2 p-3 rounded-xl text-xs font-bold text-center border ${
                    isLocked
                      ? "bg-orange-500/10 border-orange-500/50 text-orange-500"
                      : "bg-red-500/10 border-red-500/50 text-red-500"
                  }`}
                >
                  <AlertCircle size={16} />
                  <span className="flex-1">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <div className="relative group">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-red-600 transition-colors"
                  size={20}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLocked}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-red-600/50 transition-all text-sm disabled:opacity-50"
                  placeholder={t("email_address")}
                  required
                />
              </div>

              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-red-600 transition-colors"
                  size={20}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLocked}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-red-600/50 transition-all text-sm disabled:opacity-50"
                  placeholder={t("password")}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || isLocked}
              className={`w-full h-14 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 ${
                isLocked
                  ? "bg-gray-700 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20"
              }`}
            >
              {isLocked
                ? t("locked_account")
                : loading
                ? t("rolling")
                : t("login")}
              {!loading && !isLocked && <ChevronRight size={20} />}
            </button>
          </form>

          <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <span className="relative bg-[#0d0d0d] px-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
              {t("instant_entry")}
            </span>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError(t("google_login_failed"))}
              theme="filled_black"
              shape="pill"
              width="320"
            />
          </div>

          <div className="mt-8 text-center pt-6 border-t border-white/5">
            <Link
              to="/register"
              className="text-gray-400 text-xs font-bold hover:text-white transition-colors uppercase tracking-widest"
            >
              {t("new_critic")}{" "}
              <span className="text-red-600 ml-1 underline decoration-2 underline-offset-4">
                {t("join_the_club")}
              </span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
