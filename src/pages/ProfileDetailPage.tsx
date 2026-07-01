import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import type { FullUserProfile, ProfileDetailResponse, Platform } from "@/types";
import { formatEngagementRate, formatFollowers, formatNumber } from "@/utils/formatters";
import { loadProfileByUsername } from "@/utils/profileLoader";
import { extractProfiles } from "@/utils/dataHelpers";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { useList } from "@/context/ListContext";

export function ProfileDetailPage() {
  const { username } = useParams<{ username: string }>();
  const [searchParams] = useSearchParams();
  const platform = (searchParams.get("platform") as Platform | null) || "unknown";
  const [prevUsername, setPrevUsername] = useState<string | undefined>(undefined);
  const [profileData, setProfileData] = useState<ProfileDetailResponse | null>(null);
  const [loaded, setLoaded] = useState(false);
  const { addToList, removeFromList, isInList } = useList();

  if (username !== prevUsername) {
    setPrevUsername(username);
    setProfileData(null);
    setLoaded(false);
  }

  useEffect(() => {
    if (!username) return;
    let active = true;

    loadProfileByUsername(username)
      .then((data) => {
        if (active) {
          setProfileData(data);
          setLoaded(true);
        }
      })
      .catch((err) => {
        console.error("Failed to load profile details:", err);
        if (active) {
          setProfileData(null);
          setLoaded(true);
        }
      });

    return () => {
      active = false;
    };
  }, [username]);

  if (!username) {
    return (
      <Layout>
        <div className="text-left max-w-2xl mx-auto">
          <p className="mb-4 text-gray-900 dark:text-white font-semibold">Invalid profile username</p>
          <Link to="/" className="text-blue-600 underline">Back to search</Link>
        </div>
      </Layout>
    );
  }

  // Try to get summary/fallback info from search data for this username
  const summaryUser = platform !== "unknown"
    ? extractProfiles(platform).find(p => {
        const pUsername = p.username || p.handle || p.custom_name || "";
        return pUsername.toLowerCase() === username.toLowerCase();
      })
    : null;

  if (!loaded) {
    return (
      <Layout title={`@${username}`}>
        <div className="text-left max-w-2xl mx-auto">
          <p className="text-gray-400">Loading...</p>
        </div>
      </Layout>
    );
  }

  // Determine the user profile to show: loaded full details, or fallback summary, or null
  const baseUserProfile = profileData?.data?.user_profile;
  
  if (!baseUserProfile && !summaryUser) {
    return (
      <Layout title={`@${username}`}>
        <div className="text-left max-w-2xl mx-auto">
          <p className="text-red-600 mb-4 font-semibold">
            Could not load profile details for {username}
          </p>
          <Link to={platform !== "unknown" ? `/?platform=${platform}` : "/"} className="text-blue-600 underline">
            Back to search
          </Link>
        </div>
      </Layout>
    );
  }

  // Construct the user object (merging loaded full details with latest search summary stats if available)
  const user: FullUserProfile = {
    ...(summaryUser || {}),
    ...(baseUserProfile || {}),
    // Guarantee followers and other search stats are up to date and match the search card
    username: baseUserProfile?.username || summaryUser?.username || summaryUser?.handle || summaryUser?.custom_name || username,
    followers: summaryUser ? summaryUser.followers : (baseUserProfile?.followers || 0),
    engagements: summaryUser?.engagements ?? baseUserProfile?.engagements,
    engagement_rate: summaryUser?.engagement_rate ?? baseUserProfile?.engagement_rate,
    description: baseUserProfile?.description || "Detailed statistics are not available for this profile.",
  } as FullUserProfile;

  const isAdded = isInList(user.user_id);

  const handleListToggle = () => {
    if (isAdded) {
      removeFromList(user.user_id);
    } else {
      addToList(user);
    }
  };

  return (
    <Layout title={user.fullname}>
      <div className="text-left max-w-2xl mx-auto">
        <Link to={platform !== "unknown" ? `/?platform=${platform}` : "/"} className="text-sm text-blue-600 mb-4 inline-block hover:underline">
          ← Back to search
        </Link>
      </div>

      <div className="flex gap-6 items-start text-left max-w-2xl mx-auto">
        <ImageWithFallback
          src={user.picture}
          nameFallback={user.fullname || user.username}
          className="w-24 h-24 rounded-full border border-gray-200 dark:border-gray-800 object-cover"
        />
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-950 dark:text-white">
            @{user.username}
            <VerifiedBadge verified={user.is_verified} />
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{user.fullname}</p>
          <p className="text-xs text-gray-400 mt-1">Platform: {platform}</p>

          {user.description && (
            <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">{user.description}</p>
          )}

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="border border-gray-200 dark:border-gray-800 p-2 rounded">
              <div className="text-gray-500">Followers</div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {formatFollowers(user.followers, 1)}
              </div>
            </div>
            <div className="border border-gray-200 dark:border-gray-800 p-2 rounded">
              <div className="text-gray-500">Engagement Rate</div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {formatEngagementRate(user.engagement_rate)}
              </div>
            </div>
            {user.posts_count !== undefined && (
              <div className="border border-gray-200 dark:border-gray-800 p-2 rounded">
                <div className="text-gray-500">Posts</div>
                <div className="font-semibold text-gray-900 dark:text-white">{user.posts_count}</div>
              </div>
            )}
            {user.avg_likes !== undefined && (
              <div className="border border-gray-200 dark:border-gray-800 p-2 rounded">
                <div className="text-gray-500">Avg Likes</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {formatFollowers(user.avg_likes, 1)}
                </div>
              </div>
            )}
            {user.avg_comments !== undefined && (
              <div className="border border-gray-200 dark:border-gray-800 p-2 rounded">
                <div className="text-gray-500">Avg Comments</div>
                <div className="font-semibold text-gray-900 dark:text-white">{formatNumber(user.avg_comments)}</div>
              </div>
            )}
            {user.avg_views !== undefined && user.avg_views > 0 && (
              <div className="border border-gray-200 dark:border-gray-800 p-2 rounded">
                <div className="text-gray-500">Avg Views</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {formatFollowers(user.avg_views, 1)}
                </div>
              </div>
            )}
            {user.engagements !== undefined && (
              <div className="border border-gray-200 dark:border-gray-800 p-2 rounded">
                <div className="text-gray-500">Engagements</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {formatNumber(user.engagements)}
                </div>
              </div>
            )}
          </div>

          {user.url && (
            <a
              href={user.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 text-blue-600 hover:underline text-sm"
            >
              View on platform →
            </a>
          )}

          <button
            type="button"
            onClick={handleListToggle}
            className={`block mt-4 px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 cursor-pointer ${
              isAdded
                ? "bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/20 dark:border-red-900/40 dark:text-red-400 hover:bg-red-100"
                : "bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
            }`}
            aria-label={isAdded ? `Remove ${user.fullname || user.username} from list` : `Add ${user.fullname || user.username} to list`}
          >
            {isAdded ? "Remove from List" : "Add to List"}
          </button>
        </div>
      </div>
    </Layout>
  );
}
