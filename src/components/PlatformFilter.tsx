import type { Platform } from "@/types";
import { PLATFORMS, getPlatformLabel } from "@/utils/dataHelpers";
import { SearchBar } from "./SearchBar";

interface PlatformFilterProps {
  selected: Platform;
  onChange: (platform: Platform) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function PlatformFilter({
  selected,
  onChange,
  searchQuery,
  onSearchChange,
}: PlatformFilterProps) {
  const getPlatformIcon = (platform: Platform) => {
    switch (platform) {
      case "instagram":
        return (
          <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
        );
      case "youtube":
        return (
          <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2a29 29 0 0 0-.46 5.33 29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
            <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
          </svg>
        );
      case "tiktok":
        return (
          <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
          </svg>
        );
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 items-center">
      {/* Platform Pills */}
      <div 
        className="flex p-1.5 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 w-fit" 
        role="tablist" 
        aria-label="Social Media Platforms"
      >
        {PLATFORMS.map((p) => {
          const isSelected = selected === p;
          return (
            <button
              key={p}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls="influencer-list-container"
              aria-label={`Show influencers on ${getPlatformLabel(p)}`}
              onClick={() => onChange(p)}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "bg-white dark:bg-slate-800 text-orange-500 dark:text-orange-400 shadow-sm border border-slate-200/30 dark:border-slate-700/30 scale-[1.02]"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:scale-[1.01]"
              }`}
            >
              {getPlatformIcon(p)}
              <span>{getPlatformLabel(p)}</span>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="w-full max-w-xl">
        <SearchBar
          value={searchQuery}
          onChange={onSearchChange}
          placeholder={`Search ${getPlatformLabel(selected)} creators...`}
        />
      </div>
    </div>
  );
}
