import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import { useTranslation } from "react-i18next";
import {
  Squares2X2Icon,
  FilmIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon, // Admin icon
  SunIcon,
  MoonIcon,
  WalletIcon,
  ClockIcon,
  Cog6ToothIcon,
  XMarkIcon,
  SwatchIcon,
  LanguageIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { Axios } from "../config/axios";
import { Search } from "./menu/movie/Search";

export const CinemaLayout = () => {
  const { t, i18n } = useTranslation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState("");
  const [balance, setBalance] = useState<number>(0);
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem("theme") !== "light",
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const changeLanguage = (lng: string) => i18n.changeLanguage(lng);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    isDark ? root.classList.add("dark") : root.classList.remove("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const updateUserData = () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decoded = jwtDecode<any>(token);
        setIsAdmin(decoded.role === "admin");
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          setUserName(user.name || "Guest");
          setBalance(user.balance || 0);
        }
        Axios.get("/auth/user").then((res) => {
          const freshData = res.data.data || res.data;
          setUserName(freshData.name);
          setBalance(freshData.balance);
          localStorage.setItem("user", JSON.stringify(freshData));
        });
      } catch (error) {
        handleLogout();
      }
    }
  };

  useEffect(() => {
    updateUserData();
    window.addEventListener("storage", updateUserData);
    return () => window.removeEventListener("storage", updateUserData);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="h-screen w-screen transition-colors duration-700 bg-zinc-50 dark:bg-[#020617] text-zinc-900 dark:text-white font-sans overflow-hidden flex flex-col p-5 gap-5 relative">
      {/* ⚙️ SETTINGS DRAWER */}
      <AnimatePresence>
        {isSettingsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md z-[100]"
            />
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-4 top-4 bottom-4 w-85 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-3xl border border-white/20 dark:border-white/5 z-[101] rounded-[48px] p-8 shadow-2xl flex flex-col overflow-hidden"
            >
              <header className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/30">
                    <Cog6ToothIcon className="w-6 h-6 text-white animate-[spin_8s_linear_infinite]" />
                  </div>
                  <h3 className="text-xl font-black italic tracking-widest uppercase">
                    {t("settings")}
                  </h3>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </header>

              <div className="space-y-10 flex-1">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 opacity-30 px-2">
                    <SwatchIcon className="w-4 h-4" />
                    <p className="text-[10px] font-black uppercase tracking-[4px]">
                      {t("appearance")}
                    </p>
                  </div>
                  <div className="relative flex p-1.5 bg-zinc-100 dark:bg-white/5 rounded-[30px] border border-zinc-200 dark:border-white/5">
                    <motion.div
                      layout
                      className="absolute inset-y-1.5 w-[calc(50%-6px)] bg-white dark:bg-white/10 rounded-[25px] shadow-sm"
                      animate={{ x: isDark ? "100%" : "0%" }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                    <button
                      onClick={() => setIsDark(false)}
                      className="relative z-10 flex-1 flex items-center justify-center gap-3 py-4 font-black text-[10px] uppercase tracking-widest"
                    >
                      <SunIcon
                        className={`w-5 h-5 ${!isDark ? "text-yellow-500" : "opacity-30"}`}
                      />{" "}
                      {t("light")}
                    </button>
                    <button
                      onClick={() => setIsDark(true)}
                      className="relative z-10 flex-1 flex items-center justify-center gap-3 py-4 font-black text-[10px] uppercase tracking-widest"
                    >
                      <MoonIcon
                        className={`w-5 h-5 ${isDark ? "text-indigo-400" : "opacity-30"}`}
                      />{" "}
                      {t("dark")}
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 opacity-30 px-2">
                    <LanguageIcon className="w-4 h-4" />
                    <p className="text-[10px] font-black uppercase tracking-[4px]">
                      {t("language")}
                    </p>
                  </div>
                  <div className="space-y-3">
                    {[
                      { id: "am", n: "Հայերեն", f: "am" },
                      { id: "en", n: "English", f: "us" },
                      { id: "ru", n: "Русский", f: "ru" },
                    ].map((l) => (
                      <motion.button
                        key={l.id}
                        layout
                        onClick={() => changeLanguage(l.id)}
                        className={`w-full flex items-center justify-between p-5 rounded-[30px] border transition-all duration-500 ${i18n.language === l.id ? "bg-red-600 border-red-600 text-white shadow-xl shadow-red-600/20" : "bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/5 hover:border-red-600/40"}`}
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={`https://flagcdn.com/w40/${l.f}.png`}
                            className="w-6 rounded-[4px]"
                          />
                          <span className="font-black italic uppercase text-xs tracking-[2px]">
                            {l.n}
                          </span>
                        </div>
                        {i18n.language === l.id && (
                          <motion.div
                            layoutId="check"
                            className="w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]"
                          />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{
                  backgroundColor: "rgba(220, 38, 38, 0.1)",
                  color: "#dc2626",
                }}
                onClick={handleLogout}
                className="mt-auto w-full flex items-center justify-center gap-4 p-6 rounded-[30px] bg-zinc-100 dark:bg-white/5 text-zinc-400 transition-all border border-zinc-200 dark:border-white/5 group"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5 group-hover:-translate-x-2 transition-transform duration-300" />
                <span className="font-black uppercase text-[10px] tracking-[5px]">
                  {t("logout")}
                </span>
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <header className="h-24 min-h-[96px] bg-white/70 dark:bg-white/[0.02] backdrop-blur-3xl border border-zinc-200 dark:border-white/5 rounded-[40px] flex items-center justify-between px-10 shadow-xl z-50">
        <div className="flex items-center gap-12">
          <Link to="/" className="group">
            <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none text-zinc-900 dark:text-white">
              CINEMA
              <span className="text-red-600 group-hover:text-red-500 transition-colors">
                TIC
              </span>
            </h1>
          </Link>

          <nav className="flex items-center gap-2">
            <TopNavLink
              to="/"
              icon={<Squares2X2Icon className="w-6 h-6" />}
              label={t("home")}
              active={location.pathname === "/"}
            />
            <TopNavLink
              to="/movies"
              icon={<FilmIcon className="w-6 h-6" />}
              label={t("movies")}
              active={location.pathname === "/movies"}
            />
            <TopNavLink
              to="/calendar"
              icon={<CalendarIcon className="w-6 h-6" />}
              label="Schedule"
              active={location.pathname === "/calendar"}
            />
            <TopNavLink
              to="/profile/payments"
              icon={<ClockIcon className="w-6 h-6" />}
              label={t("history")}
              active={location.pathname === "/profile/payments"}
            />

            {/* 🛡️ ADMIN PANEL BUTTON (ՎԵՐԱԿԱՆԳՆՎԱԾ) */}
            {isAdmin && (
              <TopNavLink
                to="/admin/add-movie"
                icon={<ShieldCheckIcon className="w-6 h-6" />}
                label={t("admin_panel", { defaultValue: "Admin" })}
                active={location.pathname.startsWith("/admin/add-movie")}
              />
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Search />

          <button
            onClick={toggleFullscreen}
            className="p-4 rounded-[22px] bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 hover:border-red-600/50 transition-all text-zinc-500 dark:text-white/60 hover:text-red-600"
          >
            {isFullscreen ? (
              <ArrowsPointingInIcon className="w-6 h-6" />
            ) : (
              <ArrowsPointingOutIcon className="w-6 h-6" />
            )}
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-4 rounded-[22px] bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 hover:border-red-600/50 transition-all group"
          >
            <Cog6ToothIcon className="w-6 h-6 text-zinc-500 dark:text-white/60 group-hover:text-red-600 group-hover:rotate-90 transition-all duration-500" />
          </button>

          <div className="flex items-center gap-5 border-l border-zinc-200 dark:border-white/10 pl-6 text-right">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="hidden md:flex items-center gap-3 px-5 py-2.5 bg-zinc-100 dark:bg-white/5 rounded-[20px] border border-zinc-200 dark:border-white/5 cursor-pointer shadow-inner"
              onClick={() => navigate("/profile/payments")}
            >
              <WalletIcon className="w-4 h-4 text-green-500" />
              <div className="flex flex-col text-left">
                <span className="text-[8px] font-black uppercase tracking-widest opacity-40 leading-none mb-1">
                  {t("balance")}
                </span>
                <span className="text-xs font-black italic text-zinc-900 dark:text-white leading-none">
                  {balance.toLocaleString()}{" "}
                  <span className="text-red-600 not-italic ml-0.5">AMD</span>
                </span>
              </div>
            </motion.div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-red-600 uppercase tracking-[2px] mb-1 leading-none">
                {isAdmin ? t("role_admin") : t("role_user")}
              </span>
              <span className="text-xs font-black tracking-widest uppercase opacity-80 max-w-[100px] truncate leading-none">
                {userName || "Guest"}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden bg-white/50 dark:bg-white/[0.01] rounded-[48px] border border-zinc-200 dark:border-white/5 shadow-inner">
        <div className="absolute inset-0 overflow-y-auto no-scrollbar p-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

const TopNavLink = ({ to, icon, label, active = false }: any) => (
  <Link to={to}>
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.95 }}
      className={`flex items-center gap-4 px-6 py-4 rounded-[24px] transition-all duration-500 ${active ? "bg-red-600 text-white shadow-[0_15px_30px_-10px_rgba(220,38,38,0.5)]" : "text-zinc-400 hover:text-red-600 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5"}`}
    >
      <span>{icon}</span>
      <span className="font-black text-[10px] uppercase tracking-[3px] hidden lg:block">
        {label}
      </span>
    </motion.div>
  </Link>
);
