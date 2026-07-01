import { useState } from "react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useListStore } from "@/store/useListStore";
import { ImageWithFallback } from "./ImageWithFallback";
import { formatFollowers } from "@/utils/formatters";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Download, ListChecks } from "lucide-react";
import { downloadCreatorsCSV } from "@/utils/exportHelpers";

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export function Layout({ children, title }: LayoutProps) {
  const list = useListStore((state) => state.selectedProfiles);
  const removeProfile = useListStore((state) => state.removeProfile);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (isHome) {
      e.preventDefault();
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleExportCSV = () => {
    downloadCreatorsCSV(list);
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-700 dark:text-slate-300">
      {/* Sticky frosted glass header */}
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-1.5 group select-none">
              <img
                src="/ChatGPT Image Jun 30, 2026, 05_27_11 PM.png"
                className="w-8 h-8 rounded-lg object-cover group-hover:scale-105 transition-transform duration-200"
                alt="Influo Logo"
              />
              <div className="flex flex-col text-left">
                <span className="text-xl font-extrabold leading-none tracking-tight text-slate-900 dark:text-white">
                  Influo
                </span>
                <span className="text-[9px] font-bold text-orange-500 uppercase tracking-widest leading-none mt-0.5">
                  Find. Match. Connect.
                </span>
              </div>
            </Link>
          </div>

          {/* Header Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <a
              href="#features"
              onClick={(e) => handleNavClick(e, "features")}
              className="text-slate-650 hover:text-orange-500 dark:text-slate-400 dark:hover:text-orange-400 transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => handleNavClick(e, "how-it-works")}
              className="text-slate-650 hover:text-orange-500 dark:text-slate-400 dark:hover:text-orange-400 transition-colors"
            >
              How It Works
            </a>
            <a
              href="#trending"
              onClick={(e) => handleNavClick(e, "trending")}
              className="text-slate-650 hover:text-orange-500 dark:text-slate-400 dark:hover:text-orange-400 transition-colors"
            >
              Spotlights
            </a>
            <a
              href="#my-list-preview"
              onClick={(e) => handleNavClick(e, "my-list-preview")}
              className="text-slate-650 hover:text-orange-500 dark:text-slate-400 dark:hover:text-orange-400 transition-colors"
            >
              Shortlist Preview
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-2 px-4.5 py-2.5 bg-orange-50 dark:bg-orange-950/20 border border-orange-200/50 dark:border-orange-900/30 text-orange-600 dark:text-orange-400 font-bold text-sm rounded-2xl shadow-xs hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500 dark:hover:text-white hover:border-orange-500 dark:hover:border-orange-500 transition-all duration-200 cursor-pointer"
              aria-label={`View my list of ${list.length} selected influencers`}
            >
              <ListChecks className="w-4 h-4" />
              <span className="hidden sm:inline">My List</span>
              <span className="flex items-center justify-center bg-orange-500 text-white dark:bg-orange-500 dark:text-white text-xs font-black min-w-5 h-5 px-1.5 rounded-full">
                {list.length}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main container with spacing */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {title && (
          <div className="mb-6 text-left">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
              {title}
            </h1>
          </div>
        )}
        {children}
      </main>

      {/* Drawer Overlay with AnimatePresence */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-xs z-50 flex justify-end"
            >
              {/* Drawer Content */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="bg-white dark:bg-slate-950 w-96 max-w-full h-full p-6 shadow-2xl flex flex-col text-left border-l border-slate-200 dark:border-slate-800"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="My Selected Influencers List"
              >
                {/* Header */}
                <div className="flex justify-between items-center pb-4.5 border-b border-slate-200/80 dark:border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <ListChecks className="w-5.5 h-5.5 text-orange-500" />
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                      Selected List ({list.length})
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    aria-label="Close List Drawer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-3">
                  <AnimatePresence mode="popLayout">
                    {list.length === 0 ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center flex-1 text-center py-12 text-slate-400"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-300 dark:text-slate-700 mb-4">
                          <ListChecks className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Your shortlist is empty</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-[200px]">
                          Click "Add to List" on creator profiles to build your list.
                        </p>
                      </motion.div>
                    ) : (
                      list.map((profile) => {
                        const username = profile.username || profile.handle || profile.custom_name || "unknown";
                        const isYouTube = profile.url.includes("youtube.com") || profile.url.includes("youtu.be");
                        const isTikTok = profile.url.includes("tiktok.com");
                        const fallbackSrcs = isYouTube
                          ? [
                              `https://unavatar.io/youtube/${profile.handle || username}`,
                              `https://unavatar.io/youtube/${profile.user_id}`
                            ]
                          : isTikTok
                          ? [`https://unavatar.io/tiktok/${username}`]
                          : [];

                        return (
                          <motion.div
                            key={profile.user_id}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.18 }}
                            className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/10 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                          >
                            <ImageWithFallback
                              src={profile.picture}
                              nameFallback={profile.fullname || username}
                              fallbackSrcs={fallbackSrcs}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-800"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-sm truncate text-slate-900 dark:text-white">
                                @{username}
                              </div>
                              <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate">
                                {profile.fullname}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                                {formatFollowers(profile.followers, 1)} followers
                              </div>
                            </div>
                            <button
                              onClick={() => removeProfile(username)}
                              className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all cursor-pointer"
                              aria-label={`Remove ${profile.fullname || username} from list`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </motion.div>
                        );
                      })
                    )}
                  </AnimatePresence>
                </div>

                {/* Footer */}
                {list.length > 0 && (
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                    <button
                      onClick={handleExportCSV}
                      className="flex-1 py-3 px-4 bg-slate-900 dark:bg-slate-100 hover:bg-orange-500 dark:hover:bg-orange-500 hover:text-white dark:hover:text-slate-950 text-white dark:text-slate-900 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-xs"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export List (CSV)</span>
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
