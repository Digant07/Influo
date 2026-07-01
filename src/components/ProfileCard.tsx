import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Check, Trash2 } from "lucide-react";
import type { Platform, UserProfileSummary } from "@/types";
import { VerifiedBadge } from "./VerifiedBadge";
import { formatFollowers } from "@/utils/formatters";
import { ImageWithFallback } from "./ImageWithFallback";
import { useListStore } from "@/store/useListStore";

interface ProfileCardProps {
  profile: UserProfileSummary;
  platform: Platform;
  searchQuery: string;
  onProfileClick?: (profile: UserProfileSummary) => void;
}

export function ProfileCard({
  profile,
  platform,
  searchQuery,
  onProfileClick,
}: ProfileCardProps) {
  const navigate = useNavigate();
  const addProfile = useListStore((state) => state.addProfile);
  const removeProfile = useListStore((state) => state.removeProfile);
  const isSelected = useListStore((state) => state.isSelected);

  const username = profile.username || profile.handle || profile.custom_name || "unknown";
  const isAdded = isSelected(username);

  const handleClick = () => {
    if (onProfileClick) {
      onProfileClick(profile);
    } else {
      navigate(`/profile/${username}?platform=${platform}`);
    }
  };

  const handleListToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAdded) {
      removeProfile(username);
    } else {
      addProfile({ ...profile, platform });
    }
  };

  const decimals = profile.followers >= 1000000 ? 1 : 0;

  const fallbackSrcs =
    platform === "youtube"
      ? [
        `https://unavatar.io/youtube/${profile.handle || username}`,
        `https://unavatar.io/youtube/${profile.user_id}`
      ]
      : platform === "tiktok"
        ? [`https://unavatar.io/tiktok/${username}`]
        : [];

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      onClick={handleClick}
      className="hover-lift flex items-center justify-between gap-4 p-4.5 bg-white dark:bg-slate-950/30 border border-slate-200/80 dark:border-slate-800/80 mb-3.5 cursor-pointer w-full max-w-[700px] rounded-2xl shadow-xs"
      data-search={searchQuery}
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="relative flex-shrink-0">
          <ImageWithFallback
            src={profile.picture}
            nameFallback={profile.fullname || username}
            fallbackSrcs={fallbackSrcs}
            className="w-13 h-13 rounded-full object-cover border-2 border-orange-500/10 dark:border-orange-500/5 shadow-xs"
          />
        </div>

        <div className="text-left min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white truncate">
              @{username}
            </span>
            <VerifiedBadge verified={profile.is_verified} />

            {/* Platform Badge
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase rounded-md border ${currentPlatform.color}`}>
              {currentPlatform.icon}
              {getPlatformLabel(platform)}
            </span> */}
          </div>

          <div className="text-sm text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
            {profile.fullname}
          </div>

          <div className="text-[13px] text-slate-400 dark:text-slate-500 font-medium mt-1">
            <span className="text-slate-700 dark:text-slate-300 font-bold">
              {formatFollowers(profile.followers, decimals)}
            </span>{" "}
            followers
          </div>
        </div>
      </div>

      <div className="flex-shrink-0">
        <button
          type="button"
          onClick={handleListToggle}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl border transition-all duration-200 cursor-pointer shadow-xs ${isAdded
            ? "bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 border-orange-200/80 dark:border-orange-900/30 hover:bg-red-50 dark:hover:bg-red-950/35 hover:text-red-600 dark:hover:text-red-450 hover:border-red-200/85 dark:hover:border-red-900/35 group"
            : "bg-slate-900 dark:bg-slate-100 border-transparent text-white dark:text-slate-900 hover:bg-orange-500 dark:hover:bg-orange-500 hover:text-white dark:hover:text-white hover:scale-[1.02]"
            }`}
          aria-label={isAdded ? `Remove ${profile.fullname || username} from list` : `Add ${profile.fullname || username} to list`}
        >
          {isAdded ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[3] group-hover:hidden" />
              <Trash2 className="w-3.5 h-3.5 hidden group-hover:block" />
              <span className="group-hover:hidden">Added</span>
              <span className="hidden group-hover:block">Remove</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Add to List</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
