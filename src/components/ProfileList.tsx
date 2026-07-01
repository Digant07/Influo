import { AnimatePresence, motion } from "framer-motion";
import type { Platform, UserProfileSummary } from "@/types";
import { ProfileCard } from "./ProfileCard";
import { Search } from "lucide-react";
import { getPlatformLabel } from "@/utils/dataHelpers";

interface ProfileListProps {
  profiles: UserProfileSummary[];
  platform: Platform;
  searchQuery: string;
  onProfileClick: (profile: UserProfileSummary) => void;
}

export function ProfileList({
  profiles,
  platform,
  searchQuery,
  onProfileClick,
}: ProfileListProps) {
  return (
    <div 
      id="influencer-list-container" 
      role="region" 
      aria-live="polite"
      className="flex flex-col items-center w-full mt-8"
    >
      <AnimatePresence mode="popLayout">
        {profiles.length === 0 ? (
          <motion.div 
            key="empty-state"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-950/20 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl w-full max-w-[700px] shadow-xs"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center text-orange-500 dark:text-orange-400 mb-4">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-1 text-slate-900 dark:text-white">No creators found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              We couldn't find any influencers matching <span className="font-semibold text-orange-500">"{searchQuery}"</span> on {getPlatformLabel(platform)}.
            </p>
          </motion.div>
        ) : (
          profiles.map((profile) => (
            <ProfileCard
              key={profile.user_id}
              profile={profile}
              platform={platform}
              searchQuery={searchQuery}
              onProfileClick={onProfileClick}
            />
          ))
        )}
      </AnimatePresence>
    </div>
  );
}
