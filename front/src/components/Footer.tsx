import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { siteConfig } from "../config/site";

export const Footer = () => {
  return (
    <footer className="w-full border-t border-zinc-200 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-8 md:py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-10">
          {/* Logo + Name */}
          <Link to="/" className="flex items-center gap-4 group">
            {siteConfig.logo ? (
              <img
                src={siteConfig.logo}
                alt={siteConfig.name}
                className="h-16 md:h-20 lg:h-24 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling?.classList.remove("hidden");
                }}
              />
            ) : null}
            <span className={`font-black italic text-2xl uppercase tracking-tighter text-zinc-900 dark:text-white ${siteConfig.logo ? "hidden" : ""}`}>
              {siteConfig.name}
              <span className="text-red-600 group-hover:text-red-500 transition-colors">TIC</span>
            </span>
            {siteConfig.logo && (
              <span className="hidden font-black italic text-xl uppercase text-zinc-900 dark:text-white">
                {siteConfig.name}
              </span>
            )}
          </Link>

          {/* Contact */}
          <div className="flex flex-wrap items-center gap-8 text-sm">
            <a
              href={`mailto:${siteConfig.email}`}
              className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <span className="p-2 rounded-xl bg-zinc-100 dark:bg-white/5">
                <EnvelopeIcon className="w-5 h-5" />
              </span>
              <span className="font-semibold">{siteConfig.email}</span>
            </a>
            <a
              href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <span className="p-2 rounded-xl bg-zinc-100 dark:bg-white/5">
                <PhoneIcon className="w-5 h-5" />
              </span>
              <span className="font-semibold">{siteConfig.phone}</span>
            </a>
            {siteConfig.address && (
              <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                <span className="p-2 rounded-xl bg-zinc-100 dark:bg-white/5">
                  <MapPinIcon className="w-5 h-5" />
                </span>
                <span className="font-semibold">{siteConfig.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Social + Copyright */}
        <div className="mt-10 pt-8 border-t border-zinc-200 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {siteConfig.social.facebook && (
              <motion.a
                href={siteConfig.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                className="p-2.5 rounded-2xl bg-zinc-100 dark:bg-white/5 text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </motion.a>
            )}
            {siteConfig.social.instagram && (
              <motion.a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                className="p-2.5 rounded-2xl bg-zinc-100 dark:bg-white/5 text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </motion.a>
            )}
            {siteConfig.social.telegram && (
              <motion.a
                href={siteConfig.social.telegram}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                className="p-2.5 rounded-2xl bg-zinc-100 dark:bg-white/5 text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                aria-label="Telegram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              </motion.a>
            )}
          </div>
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            {siteConfig.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
};
