import type { Platform, UserProfileSummary } from "@/types";
import { ProfileCard } from "./ProfileCard";

interface ProfileListProps {
  profiles: UserProfileSummary[];
  platform: Platform;
  searchQuery: string;
  onProfileClick: (username: string) => void;
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
      className="flex flex-col items-center w-full"
    >
      {profiles.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500">
          <span className="text-4xl mb-3">🔍</span>
          <h3 className="text-lg font-semibold mb-1">No profiles found</h3>
          <p className="text-sm text-gray-400">
            We couldn't find any influencers matching "{searchQuery}" on {platform}.
          </p>
        </div>
      )}
      {profiles.map((profile) => (
        <ProfileCard
          key={profile.user_id}
          profile={profile}
          platform={platform}
          searchQuery={searchQuery}
          onProfileClick={onProfileClick}
        />
      ))}
    </div>
  );
}
