import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import type { FullUserProfile, ProfileDetailResponse, Platform } from "@/types";
import { formatEngagementRate, formatFollowers, formatNumber } from "@/utils/formatters";
import { loadProfileByUsername } from "@/utils/profileLoader";
import { extractProfiles, getPlatformLabel } from "@/utils/dataHelpers";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { useListStore } from "@/store/useListStore";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  ExternalLink, 
  Users, 
  Percent, 
  Heart, 
  MessageCircle, 
  Eye, 
  Flame, 
  FileText, 
  Check, 
  Plus, 
  Trash2 
} from "lucide-react";

export function ProfileDetailPage() {
  const { username } = useParams<{ username: string }>();
  const [searchParams] = useSearchParams();
  const platform = (searchParams.get("platform") as Platform | null) || "unknown";
  const [prevUsername, setPrevUsername] = useState<string | undefined>(undefined);
  const [profileData, setProfileData] = useState<ProfileDetailResponse | null>(null);
  const [loaded, setLoaded] = useState(false);
  const addProfile = useListStore((state) => state.addProfile);
  const removeProfile = useListStore((state) => state.removeProfile);
  const isSelected = useListStore((state) => state.isSelected);

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
        <div className="text-left max-w-3xl mx-auto py-12">
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-6 rounded-2xl">
            <p className="mb-4 text-red-650 dark:text-red-400 font-bold">Invalid profile username</p>
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-500 hover:underline">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to search</span>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // Try to get summary/fallback info from search data for this username
  const summaryUser = platform !== "unknown"
    ? extractProfiles(platform as Platform).find(p => {
        const pUsername = p.username || p.handle || p.custom_name || "";
        return pUsername.toLowerCase() === username.toLowerCase();
      })
    : null;

  if (!loaded) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto py-12 text-left">
          {/* Skeleton/Loading State */}
          <div className="animate-pulse flex flex-col gap-6">
            <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="flex gap-6 items-center">
              <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="flex-1 flex flex-col gap-3">
                <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 bg-slate-100 dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-800/40 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Determine the user profile to show: loaded full details, or fallback summary, or null
  const baseUserProfile = profileData?.data?.user_profile;
  
  if (!baseUserProfile && !summaryUser) {
    return (
      <Layout>
        <div className="text-left max-w-3xl mx-auto py-12">
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-6 rounded-2xl">
            <p className="text-red-600 mb-4 font-semibold">
              Could not load profile details for @{username}
            </p>
            <Link to={platform !== "unknown" ? `/?platform=${platform}` : "/"} className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-500 hover:underline">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to search</span>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // Construct the user object
  const user: FullUserProfile = {
    ...(summaryUser || {}),
    ...(baseUserProfile || {}),
    username: baseUserProfile?.username || summaryUser?.username || summaryUser?.handle || summaryUser?.custom_name || username,
    followers: summaryUser ? summaryUser.followers : (baseUserProfile?.followers || 0),
    engagements: summaryUser?.engagements ?? baseUserProfile?.engagements,
    engagement_rate: summaryUser?.engagement_rate ?? baseUserProfile?.engagement_rate,
    description: baseUserProfile?.description || "Detailed statistics are not available for this profile.",
  } as FullUserProfile;

  const isAdded = isSelected(username || "");

  const handleListToggle = () => {
    if (isAdded) {
      removeProfile(username || "");
    } else {
      addProfile({ ...user, platform: platform === "unknown" ? "instagram" : platform });
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

  const currentPlatform = platformConfig[platform as Platform] || platformConfig.instagram;

  // Compile detailed stats to display in cards
  const statsList = [
    {
      label: "Followers",
      value: formatFollowers(user.followers, 1),
      icon: <Users className="w-5 h-5 text-orange-500" />,
      desc: "Total reach"
    },
    {
      label: "Engagement Rate",
      value: formatEngagementRate(user.engagement_rate),
      icon: <Percent className="w-5 h-5 text-indigo-500" />,
      desc: "Interaction percentage"
    },
    user.posts_count !== undefined ? {
      label: "Total Posts",
      value: formatNumber(user.posts_count),
      icon: <FileText className="w-5 h-5 text-emerald-500" />,
      desc: "Total published pieces"
    } : null,
    user.avg_likes !== undefined ? {
      label: "Average Likes",
      value: formatFollowers(user.avg_likes, 1),
      icon: <Heart className="w-5 h-5 text-rose-500" />,
      desc: "Likes per post"
    } : null,
    user.avg_comments !== undefined ? {
      label: "Average Comments",
      value: formatNumber(user.avg_comments),
      icon: <MessageCircle className="w-5 h-5 text-blue-500" />,
      desc: "Comments per post"
    } : null,
    user.avg_views !== undefined && user.avg_views > 0 ? {
      label: "Average Views",
      value: formatFollowers(user.avg_views, 1),
      icon: <Eye className="w-5 h-5 text-amber-500" />,
      desc: "Video views"
    } : null,
    user.engagements !== undefined ? {
      label: "Total Engagements",
      value: formatNumber(user.engagements),
      icon: <Flame className="w-5 h-5 text-pink-500" />,
      desc: "Total lifetime engagement"
    } : null,
  ].filter(Boolean) as { label: string; value: string; icon: React.ReactNode; desc: string }[];

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-4 text-left">
        {/* Back Link Button */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <Link
            to={platform !== "unknown" ? `/?platform=${platform}` : "/"}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-sm rounded-2xl shadow-xs hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-950 dark:hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to directory</span>
          </Link>
        </motion.div>

        {/* Creator Hero Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-slate-950/20 border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 rounded-3xl shadow-sm mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-6 sm:items-center">
            <div className="relative self-start sm:self-center">
              <ImageWithFallback
                src={user.picture}
                nameFallback={user.fullname || user.username}
                fallbackSrcs={
                  platform === "youtube"
                    ? [
                        `https://unavatar.io/youtube/${user.handle || user.username}`,
                        `https://unavatar.io/youtube/${user.user_id}`
                      ]
                    : platform === "tiktok"
                    ? [`https://unavatar.io/tiktok/${user.username}`]
                    : []
                }
                className="w-24 h-24 rounded-full object-cover border-4 border-orange-500/10 dark:border-orange-500/5 shadow-xs"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                  @{user.username}
                </h1>
                <VerifiedBadge verified={user.is_verified} />
              </div>
              
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-bold mt-1">
                {user.fullname}
              </p>

              <div className="flex items-center gap-2 mt-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-extrabold uppercase rounded-lg border tracking-wider ${currentPlatform.color}`}>
                  {currentPlatform.icon}
                  {getPlatformLabel(platform as Platform)}
                </span>
                
                <span className="px-3 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-lg text-xs font-bold text-slate-500 dark:text-slate-400">
                  {formatFollowers(user.followers, 1)} Followers
                </span>
              </div>
            </div>
          </div>

          {/* Biography */}
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/60 text-slate-700 dark:text-slate-350 text-sm leading-relaxed">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Biography</h3>
            <p className="font-medium">{user.description}</p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.05
              }
            }
          }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8"
        >
          {statsList.map((stat, idx) => (
            <motion.div
              key={idx}
              variants={{
                hidden: { opacity: 0, y: 10 },
                show: { opacity: 1, y: 0 }
              }}
              className="bg-white dark:bg-slate-950/20 border border-slate-200/60 dark:border-slate-800/60 p-4.5 rounded-2xl shadow-xs"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {stat.label}
                </span>
                <span className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900/60 flex items-center justify-center border border-slate-100 dark:border-slate-800">
                  {stat.icon}
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">
                {stat.value}
              </div>
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">
                {stat.desc}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Primary CTA Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center pt-4 border-t border-slate-200 dark:border-slate-800"
        >
          <button
            type="button"
            onClick={handleListToggle}
            className={`flex-1 py-4.5 px-6 text-sm font-extrabold rounded-2xl border transition-all duration-200 cursor-pointer shadow-sm flex items-center justify-center gap-2 ${
              isAdded
                ? "bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/40 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-650 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900/30 group"
                : "bg-slate-900 dark:bg-slate-100 border-transparent text-white dark:text-slate-900 hover:bg-orange-500 dark:hover:bg-orange-500 hover:text-white dark:hover:text-white"
            }`}
            aria-label={isAdded ? `Remove ${user.fullname || user.username} from list` : `Add ${user.fullname || user.username} to list`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4 stroke-[3] group-hover:hidden" />
                <Trash2 className="w-4 h-4 hidden group-hover:block" />
                <span className="group-hover:hidden">Added to List</span>
                <span className="hidden group-hover:block">Remove from List</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add to List</span>
              </>
            )}
          </button>

          {user.url && (
            <a
              href={user.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-4.5 px-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View on {getPlatformLabel(platform as Platform)}</span>
            </a>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
