import { useNavigate } from "react-router-dom";
import type { Platform, UserProfileSummary } from "@/types";
import { VerifiedBadge } from "./VerifiedBadge";
import { formatFollowers } from "@/utils/formatters";
import { ImageWithFallback } from "./ImageWithFallback";
import { useList } from "@/context/ListContext";

interface ProfileCardProps {
  profile: UserProfileSummary;
  platform: Platform;
  searchQuery: string;
  onProfileClick?: (username: string) => void;
}

export function ProfileCard({
  profile,
  platform,
  searchQuery,
  onProfileClick,
}: ProfileCardProps) {
  const navigate = useNavigate();
  const { addToList, removeFromList, isInList } = useList();

  const username = profile.username || profile.handle || profile.custom_name || "unknown";
  const isAdded = isInList(profile.user_id);

  const handleClick = () => {
    if (onProfileClick) onProfileClick(username);
    navigate(`/profile/${username}?platform=${platform}`);
  };

  const handleListToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAdded) {
      removeFromList(profile.user_id);
    } else {
      addToList(profile);
    }
  };

  const decimals = profile.followers >= 1000000 ? 1 : 0;

  return (
    <div
      onClick={handleClick}
      className="flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-800 mb-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 w-full max-w-[700px] rounded-lg transition-colors"
      data-search={searchQuery}
    >
      <ImageWithFallback
        src={profile.picture}
        nameFallback={profile.fullname || username}
        className="w-12 h-12 rounded-full object-cover border border-gray-100 dark:border-gray-850"
      />
      <div className="text-left flex-1 min-w-0">
        <div className="font-bold truncate text-gray-950 dark:text-white">
          @{username}
          <VerifiedBadge verified={profile.is_verified} />
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
          {profile.fullname}
        </div>
        <div className="text-sm text-gray-500">
          {formatFollowers(profile.followers, decimals)} followers
        </div>
      </div>
      <button
        type="button"
        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer ${
          isAdded
            ? "bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/20 dark:border-red-900/40 dark:text-red-400 hover:bg-red-100"
            : "bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
        }`}
        onClick={handleListToggle}
        aria-label={isAdded ? `Remove ${profile.fullname || username} from list` : `Add ${profile.fullname || username} to list`}
      >
        {isAdded ? "Remove" : "Add to List"}
      </button>
    </div>
  );
}
