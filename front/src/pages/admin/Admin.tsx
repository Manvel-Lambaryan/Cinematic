import { motion } from "framer-motion";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  PlusCircleIcon,
  QueueListIcon,
  UserCircleIcon,
  TicketIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

export const Admin = () => {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10 font-sans transition-colors duration-700 bg-[#f8fafc] dark:bg-[#020617] min-h-screen text-slate-900 dark:text-slate-200">
      {/* Navigation Container */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-white/[0.03] p-2 rounded-[35px] border border-slate-200 dark:border-white/5 shadow-xl dark:shadow-none transition-all duration-700 backdrop-blur-md">
        <div className="flex flex-wrap gap-1">
          <AdminTab
            to="/admin/add-movie"
            label={t("add_movie")}
            icon={<PlusCircleIcon className="w-5 h-5" />}
            active={
              location.pathname === "/admin" ||
              location.pathname === "/admin/add-movie"
            }
          />

          <AdminTab
            to="/admin/add-cinema"
            label={t("add_cinema")}
            icon={<PlusCircleIcon className="w-5 h-5" />}
            active={location.pathname === "/admin/add-cinema"}
          />

          <AdminTab
            to="/admin/get-users"
            label={t("all_users")}
            icon={<UserCircleIcon className="w-5 h-5" />}
            active={location.pathname === "/admin/get-users"}
          />

          <AdminTab
            to="/admin/list"
            label={t("movies_list")}
            icon={<QueueListIcon className="w-5 h-5" />}
            active={location.pathname === "/admin/list"}
          />

          <AdminTab
            to="/admin/tickets"
            label={t("ticket_management")}
            icon={<TicketIcon className="w-5 h-5" />}
            active={location.pathname === "/admin/tickets"}
          />
        </div>

        {/* Status Badge */}
        <div className="hidden md:flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-red-600 text-white rounded-[30px] shadow-lg mr-2">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">
            {t("admin_system")}
          </span>
        </div>
      </div>

      {/* Page Content Animation */}
      <motion.div
        key={location.pathname} // Սա թույլ է տալիս, որ ամեն էջ փոխվելիս անիմացիան նորից աշխատի
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative z-10"
      >
        <Outlet />
      </motion.div>
    </div>
  );
};

interface ITabProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
}

const AdminTab = ({ to, label, icon, active }: ITabProps) => (
  <Link to={to} className="relative">
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative flex items-center gap-3 px-6 py-3.5 rounded-[28px] transition-colors duration-500 z-10 ${
        active
          ? "text-white"
          : "text-slate-500 dark:text-slate-400 hover:text-red-600"
      }`}
    >
      {/* Sliding Background Animation */}
      {active && (
        <motion.div
          layoutId="adminActiveTab" // Մոգական անիմացիան այստեղ է
          className="absolute inset-0 bg-red-600 rounded-[28px] shadow-lg shadow-red-600/30"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}

      <span className="relative z-20">{icon}</span>
      <span className="relative z-20 text-[11px] font-black uppercase tracking-widest">
        {label}
      </span>
    </motion.div>
  </Link>
);
