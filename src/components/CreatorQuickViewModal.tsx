import { motion } from "framer-motion";
import { X, ExternalLink, Users, Percent, Heart, MessageCircle, Eye, Flame, FileText, Check, Plus, Trash2 } from "lucide-react";
import type { FullUserProfile, Platform } from "@/types";
import { VerifiedBadge } from "./VerifiedBadge";
import { ImageWithFallback } from "./ImageWithFallback";
import { formatEngagementRate, formatFollowers, formatNumber } from "@/utils/formatters";
import { getPlatformLabel } from "@/utils/dataHelpers";
import { useListStore } from "@/store/useListStore";
import { Link } from "react-router-dom";

interface CreatorQuickViewModalProps {
  user: FullUserProfile | null;
  platform: Platform;
  isOpen: boolean;
  onClose: () => void;
}

export function CreatorQuickViewModal({
  user,
  platform,
  isOpen,
  onClose,
}: CreatorQuickViewModalProps) {
  const addProfile = useListStore((state) => state.addProfile);
  const removeProfile = useListStore((state) => state.removeProfile);
  const isSelected = useListStore((state) => state.isSelected);

  if (!isOpen || !user) return null;

  const username = user.username || user.handle || user.custom_name || "unknown";
  const isAdded = isSelected(username);

  const handleListToggle = () => {
    if (isAdded) {
      removeProfile(username);
    } else {
      addProfile({ ...user, platform });
    }
  };

  // Platform style mappings
  const platformConfig = {
    instagram: {
      color: "text-pink-600 bg-pink-50 dark:bg-pink-950/20 border-pink-100 dark:border-pink-900/30",
      icon: (
        <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
      )
    },
    youtube: {
      color: "text-red-600 bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30",
      icon: (
        <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2a29 29 0 0 0-.46 5.33 29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
          <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor"></polygon>
        </svg>
      )
    },
    tiktok: {
      color: "text-slate-900 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700",
      icon: (
        <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
        </svg>
      )
    }
  };

  const currentPlatform = platformConfig[platform] || platformConfig.instagram;

  const statsList = [
    {
      label: "Followers",
      value: formatFollowers(user.followers, 1),
      icon: <Users className="w-4 h-4 text-orange-500" />,
      desc: "Total reach"
    },
    {
      label: "Engagement Rate",
      value: formatEngagementRate(user.engagement_rate),
      icon: <Percent className="w-4 h-4 text-indigo-500" />,
      desc: "Interaction %"
    },
    user.posts_count !== undefined ? {
      label: "Total Posts",
      value: formatNumber(user.posts_count),
      icon: <FileText className="w-4 h-4 text-emerald-500" />,
      desc: "Published items"
    } : null,
    user.avg_likes !== undefined ? {
      label: "Avg Likes",
      value: formatFollowers(user.avg_likes, 1),
      icon: <Heart className="w-4 h-4 text-rose-500" />,
      desc: "Likes per post"
    } : null,
    user.avg_comments !== undefined ? {
      label: "Avg Comments",
      value: formatNumber(user.avg_comments),
      icon: <MessageCircle className="w-4 h-4 text-blue-500" />,
      desc: "Comments per post"
    } : null,
    user.avg_views !== undefined && user.avg_views > 0 ? {
      label: "Avg Views",
      value: formatFollowers(user.avg_views, 1),
      icon: <Eye className="w-4 h-4 text-amber-500" />,
      desc: "Video views"
    } : null,
    user.engagements !== undefined ? {
      label: "Engagements",
      value: formatNumber(user.engagements),
      icon: <Flame className="w-4 h-4 text-pink-500" />,
      desc: "Lifetime engagement"
    } : null,
  ].filter(Boolean) as { label: string; value: string; icon: React.ReactNode; desc: string }[];

  const fallbackSrcs =
    platform === "youtube"
      ? [
          `https://unavatar.io/youtube/${user.handle || username}`,
          `https://unavatar.io/youtube/${user.user_id}`
        ]
      : platform === "tiktok"
      ? [`https://unavatar.io/tiktok/${username}`]
      : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/45 dark:bg-slate-950/60 backdrop-blur-xs"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", damping: 25, stiffness: 250 }}
        className="bg-white dark:bg-slate-950 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden z-10 flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4.5 border-b border-slate-100 dark:border-slate-800/40">
          <div className="flex items-center gap-1.5">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-lg border ${currentPlatform.color}`}>
              {currentPlatform.icon}
              {getPlatformLabel(platform)}
            </span>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Creator Preview
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            aria-label="Close Preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {/* Creator Core Block */}
          <div className="flex gap-4 items-center">
            <ImageWithFallback
              src={user.picture}
              nameFallback={user.fullname || username}
              fallbackSrcs={fallbackSrcs}
              className="w-18 h-18 rounded-full object-cover border-3 border-orange-500/10 shadow-xs"
            />
            <div className="text-left min-w-0">
              <div className="flex items-center gap-1 flex-wrap">
                <span className="font-extrabold text-lg text-slate-950 dark:text-white truncate">
                  @{username}
                </span>
                <VerifiedBadge verified={user.is_verified} />
              </div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 truncate">
                {user.fullname}
              </p>
              <div className="text-xs font-semibold text-orange-500 mt-0.5">
                {formatFollowers(user.followers, 1)} followers
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/40 p-4.5 rounded-2xl text-left text-sm leading-relaxed">
            <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Biography</h4>
            <p className="font-medium text-slate-650 dark:text-slate-350">
              {user.description || "Detailed statistics are not available for this profile."}
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="flex flex-col gap-3.5 text-left">
            <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Key Performance Stats</h4>
            <div className="grid grid-cols-2 gap-3">
              {statsList.map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900/10 border border-slate-200/50 dark:border-slate-800/40 p-3.5 rounded-xl flex items-center justify-between gap-2 shadow-xs"
                >
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {stat.label}
                    </div>
                    <div className="text-base font-black text-slate-950 dark:text-white mt-0.5">
                      {stat.value}
                    </div>
                    <div className="text-[9px] font-medium text-slate-400 dark:text-slate-500 truncate">
                      {stat.desc}
                    </div>
                  </div>
                  <span className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-900/60 flex items-center justify-center flex-shrink-0 border border-slate-100 dark:border-slate-800">
                    {stat.icon}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4.5 bg-slate-50/50 dark:bg-slate-900/20 border-t border-slate-100 dark:border-slate-800/40 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={handleListToggle}
            className={`flex-1 py-3 px-4.5 text-xs font-black rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
              isAdded
                ? "bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 border-orange-200/80 dark:border-orange-900/30 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-650 dark:hover:text-red-400 hover:border-red-200 group"
                : "bg-slate-900 dark:bg-slate-100 border-transparent text-white dark:text-slate-900 hover:bg-orange-500 dark:hover:bg-orange-500 hover:text-white dark:hover:text-white"
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3] group-hover:hidden" />
                <Trash2 className="w-3.5 h-3.5 hidden group-hover:block" />
                <span className="group-hover:hidden">Added to List</span>
                <span className="hidden group-hover:block">Remove from List</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Add to List</span>
              </>
            )}
          </button>

          <Link
            to={`/profile/${username}?platform=${platform}`}
            onClick={onClose}
            className="flex-1 py-3 px-4.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-800 dark:text-slate-200 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Full Profile</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
