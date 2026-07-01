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
  return (
    <div className="mb-4">
      <div className="flex gap-2 justify-center mb-3" role="tablist" aria-label="Social Media Platforms">
        {PLATFORMS.map((p) => (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={selected === p}
            aria-controls="influencer-list-container"
            aria-label={`Show influencers on ${getPlatformLabel(p)}`}
            onClick={() => onChange(p)}
            className={`px-4 py-2 border rounded cursor-pointer transition-colors duration-200 ${
              selected === p ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {getPlatformLabel(p)}
          </button>
        ))}
      </div>
      <SearchBar
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Search by username or name..."
        className="w-full max-w-md border px-3 py-2 rounded dark:bg-gray-850 dark:border-gray-700 focus:outline-hidden focus:ring-2 focus:ring-gray-400"
        aria-label="Search influencers by username or name"
      />
    </div>
  );
}
