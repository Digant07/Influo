import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { Platform, UserProfileSummary, FullUserProfile } from "@/types";
import { Layout } from "@/components/Layout";
import { PlatformFilter } from "@/components/PlatformFilter";
import { ProfileList } from "@/components/ProfileList";
import { CreatorQuickViewModal } from "@/components/CreatorQuickViewModal";
import { extractProfiles, filterProfiles, getPlatformLabel } from "@/utils/dataHelpers";
import { loadProfileByUsername } from "@/utils/profileLoader";
import { useListStore } from "@/store/useListStore";
import { downloadCreatorsCSV } from "@/utils/exportHelpers";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { formatFollowers } from "@/utils/formatters";
import { 
  Users, Sparkles, Filter, ChevronDown, Check, ArrowRight, 
  Zap, Database, CheckCircle, BarChart3, Search, 
  ExternalLink, Layers, ShieldCheck, Download, Star
} from "lucide-react";

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const platform = (searchParams.get("platform") as Platform) || "instagram";
  const [searchQuery, setSearchQuery] = useState("");
  const [clickCount, setClickCount] = useState(0);

  // Filter and Sorting state
  const [sortBy, setSortBy] = useState<"followers-desc" | "followers-asc" | "engagement-desc" | "name-asc">("followers-desc");
  const [filterVerified, setFilterVerified] = useState(false);
  const [filterTopReach, setFilterTopReach] = useState(false);
  const [filterHighEng, setFilterHighEng] = useState(false);

  // Quick View Modal state
  const [selectedUser, setSelectedUser] = useState<FullUserProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Loading skeleton simulation state
  const [isLoading, setIsLoading] = useState(false);

  // typing animation slogan state
  const textToType = "We'll Find Them!";
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const searchSectionRef = useRef<HTMLDivElement>(null);
  const list = useListStore((state) => state.selectedProfiles);
  const removeProfile = useListStore((state) => state.removeProfile);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    if (isDeleting) {
      if (displayedText.length > 0) {
        timeoutId = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1));
        }, 50);
      } else {
        timeoutId = setTimeout(() => {
          setIsDeleting(false);
        }, 500);
      }
    } else {
      if (displayedText.length < textToType.length) {
        timeoutId = setTimeout(() => {
          setDisplayedText(textToType.slice(0, displayedText.length + 1));
        }, 120);
      } else {
        timeoutId = setTimeout(() => {
          setIsDeleting(true);
        }, 3000);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [displayedText, isDeleting]);

  const allProfiles = extractProfiles(platform);
  
  // Filter logic
  let filtered = filterProfiles(allProfiles, searchQuery);
  if (filterVerified) {
    filtered = filtered.filter(p => p.is_verified);
  }
  if (filterTopReach) {
    filtered = filtered.filter(p => p.followers >= 50000000);
  }
  if (filterHighEng) {
    filtered = filtered.filter(p => p.engagement_rate !== undefined && p.engagement_rate >= 0.02);
  }

  // Sorting logic
  if (sortBy === "followers-desc") {
    filtered.sort((a, b) => b.followers - a.followers);
  } else if (sortBy === "followers-asc") {
    filtered.sort((a, b) => a.followers - b.followers);
  } else if (sortBy === "engagement-desc") {
    filtered.sort((a, b) => (b.engagement_rate || 0) - (a.engagement_rate || 0));
  } else if (sortBy === "name-asc") {
    filtered.sort((a, b) => (a.fullname || "").localeCompare(b.fullname || ""));
  }

  const handleProfileClick = async (profile: UserProfileSummary) => {
    setClickCount((prev) => prev + 1);
    console.log("Clicked profile:", profile.username, "total clicks:", clickCount + 1);
    
    // Set immediate summary details so modal opens instantly
    setSelectedUser(profile as FullUserProfile);
    setIsModalOpen(true);

    // Fetch full profile details in background to load biography/extra stats
    try {
      const username = profile.username || profile.handle || profile.custom_name || "";
      const fullDetail = await loadProfileByUsername(username);
      if (fullDetail?.data?.user_profile) {
        setSelectedUser((prev) => {
          if (prev && prev.user_id === profile.user_id) {
            return {
              ...prev,
              ...fullDetail.data.user_profile,
              followers: profile.followers // preserve summary followers
            };
          }
          return prev;
        });
      }
    } catch (e) {
      console.error("Failed to load quick preview details:", e);
    }
  };

  const handlePlatformChange = (p: Platform) => {
    setIsLoading(true);
    setSearchParams({ platform: p });
    setTimeout(() => setIsLoading(false), 400);
  };

  const scrollToSearch = () => {
    searchSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Curated trending spotlights
  const SPOTLIGHT_CREATORS = [
    {
      username: "cristiano",
      fullname: "Cristiano Ronaldo",
      platform: "instagram" as Platform,
      followers: 641325352,
      engagement_rate: 0.01214,
      tag: "Sports & Fitness",
      picture: "https://imgp.sptds.icu/v2?mb0KwpL92uYofJiSjDn1%2F6peL1lBwv3s%2BUvShHERlDb05bk9EAgW7oQoJCzCEnmGmUuoxbOW5tBwsZsGrK%2FS7yWdNkP7y%2B1pFCfs%2BJuNwg4LMGQUZTpkh%2BW3cdViohxwWwq5%2BhsabX0Nc9aXCBbcsw%3D%3D",
    },
    {
      username: "MrBeast",
      fullname: "MrBeast",
      platform: "youtube" as Platform,
      followers: 324000000,
      engagement_rate: 0.01826,
      tag: "Entertainment",
      picture: "https://yt3.googleusercontent.com/fxGKYucJAVme-Yz4fsdCroCFCrANWqw0ql4GYuvx8Uq4l_euNJHgE-w9MTkLQA805vWCi-kE0g=s480-c-k-c0x00ffffff-no-rj",
    },
    {
      username: "khaby.lame",
      fullname: "Khabane lame",
      platform: "tiktok" as Platform,
      followers: 162800000,
      engagement_rate: 0.00579,
      tag: "Comedy & Memes",
      picture: "https://imgp.sptds.icu/v2?9gRRkBbg4nctjMDXek72QZVfwaM%2B9JyelB0J2IwjGfU5qrdIuBTqbpa5S%2B1WOkIwHAVH03R0TVmK0Oy0yObCmwuIsrGx60XSYd%2BD6nKKd8aNGm6dJgPNj02cA0jIQu3V%2Bk78B76Sl4D1WCFaQ7oUVfcU3Sucu%2BziMExlEdMhxTs%3D",
    }
  ];

  return (
    <Layout>
      {/* 2. Hero Section */}
      <div className="text-center max-w-4xl mx-auto mt-6 sm:mt-16 mb-16 sm:mb-24 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 rounded-full mb-6">
            <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "3s" }} />
            <span>Discover Top Creators Instantly</span>
          </span>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-tight"
        >
          Describe Your Creator.{" "}
          <span className="sm:whitespace-nowrap inline-block bg-linear-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent min-h-[1.2em]">
            {displayedText}
            <span className="animate-pulse text-orange-500 dark:text-orange-400 font-normal ml-0.5">|</span>
          </span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="mt-6 text-base sm:text-xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl"
        >
          Discover, analyze, and shortlist top influencers across Instagram, YouTube, and TikTok to grow your creator network.
        </motion.p>

        {/* Hero CTA Row */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <button
            onClick={scrollToSearch}
            className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-2xl shadow-lg shadow-orange-500/20 hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Start Discovering</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <a
            href="#my-list-preview"
            className="px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/50 font-extrabold rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>View Shortlist</span>
            <CheckCircle className="w-5 h-5 text-orange-500" />
          </a>
        </motion.div>
      </div>

      {/* 3. Trust / Product Proof Row */}
      <div className="w-full py-8 border-y border-slate-200/50 dark:border-slate-800/40 mb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <div className="flex items-center gap-3 justify-center">
            <Layers className="w-5 h-5 text-orange-500" />
            <div className="text-left">
              <div className="font-extrabold text-slate-900 dark:text-white text-sm">3 Platforms</div>
              <div className="text-xs text-slate-400">IG, YT & TikTok data</div>
            </div>
          </div>
          <div className="flex items-center gap-3 justify-center">
            <Zap className="w-5 h-5 text-orange-500" />
            <div className="text-left">
              <div className="font-extrabold text-slate-900 dark:text-white text-sm">Fast Discovery</div>
              <div className="text-xs text-slate-400">Instant query matches</div>
            </div>
          </div>
          <div className="flex items-center gap-3 justify-center">
            <Database className="w-5 h-5 text-orange-500" />
            <div className="text-left">
              <div className="font-extrabold text-slate-900 dark:text-white text-sm">Rich Profile Analytics</div>
              <div className="text-xs text-slate-400">Engagement & views</div>
            </div>
          </div>
          <div className="flex items-center gap-3 justify-center">
            <ShieldCheck className="w-5 h-5 text-orange-500" />
            <div className="text-left">
              <div className="font-extrabold text-slate-900 dark:text-white text-sm">Verified Shortlists</div>
              <div className="text-xs text-slate-400">Export lists in CSV</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Discovery Sticky Shell */}
      <div ref={searchSectionRef} className="scroll-mt-20 mb-24">
        {/* Sticky Filters & Search Area */}
        <div className="sticky top-16 z-30 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md py-5 border-b border-slate-200/50 dark:border-slate-800/40 w-full mb-8">
          <div className="max-w-3xl mx-auto flex flex-col gap-4">
            <PlatformFilter
              selected={platform}
              onChange={handlePlatformChange}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />

            {/* Sorting and Advanced Filtering Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-1.5 px-1">
              {/* Filter Chips */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-1.5 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filters</span>
                </span>
                
                <button
                  onClick={() => setFilterVerified(!filterVerified)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer ${
                    filterVerified
                      ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-350"
                  }`}
                >
                  {filterVerified && <Check className="w-3 h-3 stroke-[3]" />}
                  <span>Verified</span>
                </button>

                <button
                  onClick={() => setFilterTopReach(!filterTopReach)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer ${
                    filterTopReach
                      ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-350"
                  }`}
                >
                  {filterTopReach && <Check className="w-3 h-3 stroke-[3]" />}
                  <span>Top Reach (50M+)</span>
                </button>

                <button
                  onClick={() => setFilterHighEng(!filterHighEng)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer ${
                    filterHighEng
                      ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-350"
                  }`}
                >
                  {filterHighEng && <Check className="w-3 h-3 stroke-[3]" />}
                  <span>High Engagement (2%+)</span>
                </button>
              </div>

              {/* Sorting Dropdown */}
              <div className="relative flex items-center justify-end">
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300">
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="bg-transparent border-none text-xs font-bold focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="followers-desc" className="bg-white dark:bg-slate-950">Followers (High to Low)</option>
                    <option value="followers-asc" className="bg-white dark:bg-slate-950">Followers (Low to High)</option>
                    <option value="engagement-desc" className="bg-white dark:bg-slate-950">Engagement Rate</option>
                    <option value="name-asc" className="bg-white dark:bg-slate-950">Name (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Directory Results */}
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          {/* Dynamic Results Header Badge */}
          <div className="flex items-center justify-center mb-6">
            <span className="px-3.5 py-1.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 rounded-full text-xs font-semibold text-slate-500 dark:text-slate-400">
              Showing <span className="font-bold text-slate-900 dark:text-slate-100">{filtered.length}</span> of{" "}
              <span className="font-bold text-slate-900 dark:text-slate-100">{allProfiles.length}</span> creators on{" "}
              <span className="font-bold text-orange-500">{getPlatformLabel(platform)}</span>
            </span>
          </div>

          {/* Skeleton Loaders or Content List */}
          {isLoading ? (
            <div className="w-full max-w-[700px] flex flex-col gap-3.5 mt-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-800/50 p-4.5 rounded-2xl h-[92px] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-13 h-13 rounded-full bg-slate-200 dark:bg-slate-800" />
                    <div className="flex flex-col gap-2">
                      <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                      <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                    </div>
                  </div>
                  <div className="h-10 w-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                </div>
              ))}
            </div>
          ) : (
            <ProfileList
              profiles={filtered}
              platform={platform}
              searchQuery={searchQuery}
              onProfileClick={handleProfileClick}
            />
          )}
        </div>
      </div>

      {/* 4. Features Comparison Grid */}
      <section id="features" className="scroll-mt-20 py-16 sm:py-20 border-t border-slate-200/50 dark:border-slate-800/40 mb-16">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest bg-orange-50 dark:bg-orange-950/20 px-3 py-1 rounded-full border border-orange-100 dark:border-orange-900/30">
            Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-4 tracking-tight">
            Discovery Built for Professional Teams
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Everything you need to search, filter, evaluate, and shortlist creators.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Card 1 */}
          <div className="bg-white dark:bg-slate-950/10 border border-slate-200/60 dark:border-slate-800/50 p-6 rounded-3xl text-left shadow-xs hover-lift">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center text-orange-500 mb-4.5">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-slate-950 dark:text-white mb-2">Platform Search</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Find creators across Instagram, YouTube, and TikTok using simple handles or name parameters instantly.
            </p>
          </div>
          {/* Card 2 */}
          <div className="bg-white dark:bg-slate-950/10 border border-slate-200/60 dark:border-slate-800/50 p-6 rounded-3xl text-left shadow-xs hover-lift">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center text-indigo-500 mb-4.5">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-slate-950 dark:text-white mb-2">Metrics Deep Dive</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Evaluate real engagement metrics, average views, total content pieces, and reach estimates side-by-side.
            </p>
          </div>
          {/* Card 3 */}
          <div className="bg-white dark:bg-slate-950/10 border border-slate-200/60 dark:border-slate-800/50 p-6 rounded-3xl text-left shadow-xs hover-lift">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-500 mb-4.5">
              <CheckCircle className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-slate-950 dark:text-white mb-2">Custom Roster Shortlisting</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Tag selected profiles, build cross-platform influencer lists, and prevent duplicate selections.
            </p>
          </div>
          {/* Card 4 */}
          <div className="bg-white dark:bg-slate-950/10 border border-slate-200/60 dark:border-slate-800/50 p-6 rounded-3xl text-left shadow-xs hover-lift">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center text-amber-500 mb-4.5">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-slate-950 dark:text-white mb-2">One-Click CSV Export</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Download your shortlist with usernames, full names, reach numbers, and platform URLs for simple CRM inputs.
            </p>
          </div>
          {/* Card 5 */}
          <div className="bg-white dark:bg-slate-950/10 border border-slate-200/60 dark:border-slate-800/50 p-6 rounded-3xl text-left shadow-xs hover-lift">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center text-rose-500 mb-4.5">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-slate-950 dark:text-white mb-2">Instant Quick-View</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Scan bios and detail metrics panels instantly in an overlay modal without breaking your search workflow directory.
            </p>
          </div>
          {/* Card 6 */}
          <div className="bg-white dark:bg-slate-950/10 border border-slate-200/60 dark:border-slate-800/50 p-6 rounded-3xl text-left shadow-xs hover-lift">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/20 flex items-center justify-center text-teal-500 mb-4.5">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-slate-950 dark:text-white mb-2">Real-Time Sync</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Keep selected shortlists safe across sessions using local-first storage updates in your browser.
            </p>
          </div>
        </div>
      </section>

      {/* 5. How It Works Timeline */}
      <section id="how-it-works" className="scroll-mt-20 py-16 sm:py-20 border-t border-slate-200/50 dark:border-slate-800/40 mb-16">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest bg-orange-50 dark:bg-orange-950/20 px-3 py-1 rounded-full border border-orange-100 dark:border-orange-900/30">
            Discovery Pipeline
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-4 tracking-tight">
            How Influo Works
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Find the right matches for your brand roster in four simple steps.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-4 text-left">
          <div className="flex flex-col gap-3 relative">
            <div className="w-9 h-9 rounded-xl bg-orange-500 text-white font-bold flex items-center justify-center text-sm shadow-sm shadow-orange-500/20">
              1
            </div>
            <h3 className="font-extrabold text-sm text-slate-950 dark:text-white">Filter by Platform</h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Select YouTube, TikTok, or Instagram to filter creators natively on specific networks.
            </p>
          </div>
          <div className="flex flex-col gap-3 relative">
            <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold flex items-center justify-center text-sm">
              2
            </div>
            <h3 className="font-extrabold text-sm text-slate-950 dark:text-white">Search & Query</h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Input username letters or full names. Apply verified checks or reach filters to isolate targets.
            </p>
          </div>
          <div className="flex flex-col gap-3 relative">
            <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold flex items-center justify-center text-sm">
              3
            </div>
            <h3 className="font-extrabold text-sm text-slate-950 dark:text-white">Evaluate Profile Stats</h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Open the preview modal to verify engagement metrics, content posts, and reach estimates instantly.
            </p>
          </div>
          <div className="flex flex-col gap-3 relative">
            <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold flex items-center justify-center text-sm">
              4
            </div>
            <h3 className="font-extrabold text-sm text-slate-950 dark:text-white">Shortlist & Export</h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Shortlist creators in your active list and export custom CSVs directly into your internal workflows.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Featured Creators Spotlight Row */}
      <section id="trending" className="scroll-mt-20 py-16 sm:py-20 border-t border-slate-200/50 dark:border-slate-800/40 mb-16">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest bg-orange-50 dark:bg-orange-950/20 px-3 py-1 rounded-full border border-orange-100 dark:border-orange-900/30">
            Featured Spotlight
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-4 tracking-tight">
            Trending Creators This Week
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Spotlighting top performers across social platforms based on engagement and reach.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
          {SPOTLIGHT_CREATORS.map((c, idx) => {
            const platformLabel = getPlatformLabel(c.platform);
            return (
              <div 
                key={idx}
                className="bg-white dark:bg-slate-950/10 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-3xl text-left shadow-xs relative flex flex-col justify-between hover-lift"
              >
                {/* Header Tag */}
                <div className="flex justify-between items-center mb-4">
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                    <span>{c.tag}</span>
                  </span>
                  
                  <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-orange-50 dark:bg-orange-950/20 text-orange-500 dark:text-orange-400 border border-orange-100 dark:border-orange-900/30">
                    {platformLabel}
                  </span>
                </div>

                <div className="flex items-center gap-3.5 mb-6">
                  <img
                    src={c.picture}
                    alt={c.fullname}
                    className="w-12 h-12 rounded-full object-cover border border-slate-100"
                  />
                  <div>
                    <h4 className="font-extrabold text-slate-950 dark:text-white text-sm">@{c.username}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">{c.fullname}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800/40 pt-4 mb-4">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Followers</div>
                    <div className="text-base font-black text-slate-950 dark:text-white mt-0.5">{c.followers.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Engagement</div>
                    <div className="text-base font-black text-slate-950 dark:text-white mt-0.5">{(c.engagement_rate * 100).toFixed(2)}%</div>
                  </div>
                </div>

                <Link
                  to={`/profile/${c.username}?platform=${c.platform}`}
                  className="w-full py-2.5 bg-slate-900 dark:bg-slate-100 hover:bg-orange-500 dark:hover:bg-orange-500 text-white dark:text-slate-900 hover:text-white dark:hover:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <span>View Details</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. My List Preview / Shortlist Section */}
      <section id="my-list-preview" className="scroll-mt-20 py-16 sm:py-20 border-t border-slate-200/50 dark:border-slate-800/40 mb-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest bg-orange-50 dark:bg-orange-950/20 px-3 py-1 rounded-full border border-orange-100 dark:border-orange-900/30">
            Active Campaign Shortlist
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-4 tracking-tight">
            Your Shortlisted Creators
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Review and export your campaign shortlist.
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 text-center">
          {list.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-slate-50/40 dark:bg-slate-900/10 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl">
              <Users className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-4" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-350">Your campaign list is currently empty</p>
              <p className="text-xs text-slate-400 mt-1 mb-6 max-w-xs mx-auto">
                Discover creators in the directory and click "Add to List" to build your roster.
              </p>
              <button
                onClick={scrollToSearch}
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-2xl shadow-md text-xs cursor-pointer"
              >
                Browse Creator Directory
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-950/10 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-3xl shadow-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-left">
                {list.map((profile) => {
                  const username = profile.username || profile.handle || profile.custom_name || "unknown";
                  return (
                    <div 
                      key={profile.user_id}
                      className="bg-slate-50/50 dark:bg-slate-900/10 border border-slate-100 dark:border-slate-800/40 p-3 rounded-2xl flex items-center gap-3.5 relative hover:border-slate-200"
                    >
                      <ImageWithFallback
                        src={profile.picture}
                        nameFallback={profile.fullname || username}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-extrabold text-xs text-slate-950 dark:text-white truncate">@{username}</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{profile.fullname}</div>
                        <div className="text-[10px] text-slate-500 font-semibold mt-0.5">{formatFollowers(profile.followers, 1)} reach</div>
                      </div>
                      <button
                        onClick={() => removeProfile(username)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center text-[10px] font-black border border-red-200/50 dark:border-red-900/50 cursor-pointer hover:bg-red-500 hover:text-white hover:border-red-500"
                        title={`Remove ${username}`}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>              <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800/40">
                <button
                  onClick={() => downloadCreatorsCSV(list)}
                  className="py-3 px-5 bg-slate-900 dark:bg-slate-100 hover:bg-orange-500 dark:hover:bg-orange-500 text-white dark:text-slate-900 hover:text-white dark:hover:text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Shortlist (CSV)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 8. Branded Roster Footer */}
      <footer className="w-full border-t border-slate-200/50 dark:border-slate-800/40 pt-16 pb-12 mt-12 bg-slate-50/30 dark:bg-slate-950/20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-4 text-left mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-1.5 mb-4 select-none">
              <img
                src="/ChatGPT Image Jun 30, 2026, 05_27_11 PM.png"
                className="w-7 h-7 rounded-lg object-cover"
                alt="Influo Logo"
              />
              <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Influo</span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm leading-relaxed mb-4">
              Influo is a modern, search-first creator discovery tool built for talent teams, marketing managers, and agency coordinators. Find. Match. Connect.
            </p>
            <div className="text-[10px] text-slate-400">
              © {new Date().getFullYear()} Influo. All rights reserved.
            </div>
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-slate-950 dark:text-white uppercase tracking-wider mb-4">Supported Networks</h4>
            <ul className="flex flex-col gap-2.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                <span>Instagram Creators</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span>YouTube Channels</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-950 dark:bg-white" />
                <span>TikTok Profiles</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-slate-950 dark:text-white uppercase tracking-wider mb-4">Directory Access</h4>
            <ul className="flex flex-col gap-2.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <li>
                <button onClick={scrollToSearch} className="hover:text-orange-500 cursor-pointer text-left">
                  Creator Search Bar
                </button>
              </li>
              <li>
                <a href="#features" className="hover:text-orange-500">
                  Feature Roster
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-orange-500">
                  Timeline Flow
                </a>
              </li>
              <li>
                <a href="#my-list-preview" className="hover:text-orange-500">
                   shortlists Preview
                </a>
              </li>
            </ul>
          </div>
        </div>
      </footer>

      {/* Quick View Creator Details Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <CreatorQuickViewModal
            user={selectedUser}
            platform={platform}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
}
