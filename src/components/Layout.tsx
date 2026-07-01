import { useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useList } from "@/context/ListContext";
import { ImageWithFallback } from "./ImageWithFallback";
import { formatFollowers } from "@/utils/formatters";

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export function Layout({ children, title }: LayoutProps) {
  const { list, removeFromList } = useList();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleExportCSV = () => {
    if (list.length === 0) return;
    const headers = ["User ID", "Username", "Full Name", "Followers", "URL"];
    const rows = list.map((p) => [
      p.user_id,
      p.username || p.handle || "",
      p.fullname || "",
      p.followers,
      p.url,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.map((val) => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "selected_influencers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 min-h-screen text-gray-800 dark:text-gray-200">
      <header className="mb-6 border-b pb-4 flex justify-between items-center">
        <div>
          <Link to="/" className="text-xl font-semibold text-gray-900 dark:text-white">
            Influencer Search
          </Link>
          {title && <h1 className="text-2xl mt-2 text-gray-900 dark:text-white">{title}</h1>}
        </div>
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center gap-2 px-4 py-2 border rounded-full bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-sm hover:shadow transition-all duration-200 border-gray-300 dark:border-gray-700"
          aria-label={`View my list of ${list.length} selected influencers`}
        >
          <span className="font-semibold text-sm">My List</span>
          <span className="flex items-center justify-center bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 text-xs font-bold w-5 h-5 rounded-full">
            {list.length}
          </span>
        </button>
      </header>
      <main>{children}</main>

      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex justify-end"
          onClick={() => setIsDrawerOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#16171d] w-96 max-w-full h-full p-6 shadow-xl flex flex-col text-left border-l border-gray-200 dark:border-gray-800 animate-slide-in"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="My Selected Influencers List"
          >
            {/* Drawer Header */}
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Selected Creators ({list.length})
              </h2>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white font-semibold text-lg"
                aria-label="Close List Drawer"
              >
                ✕
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-3">
              {list.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 text-center py-12 text-gray-400">
                  <span className="text-3xl mb-2">📋</span>
                  <p className="text-sm">Your list is currently empty.</p>
                  <p className="text-xs mt-1">Add creators from the search page.</p>
                </div>
              ) : (
                list.map((profile) => {
                  const username = profile.username || profile.handle || profile.custom_name || "unknown";
                  return (
                    <div
                      key={profile.user_id}
                      className="flex items-center gap-3 p-2 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                    >
                      <ImageWithFallback
                        src={profile.picture}
                        nameFallback={profile.fullname || username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate text-gray-950 dark:text-white">
                          @{username}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {profile.fullname}
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatFollowers(profile.followers, 1)} followers
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromList(profile.user_id)}
                        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded"
                        aria-label={`Remove ${profile.fullname || username} from list`}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Drawer Footer */}
            {list.length > 0 && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex gap-2">
                <button
                  onClick={handleExportCSV}
                  className="flex-1 py-2 px-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold text-sm rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                >
                  Export List (CSV)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
