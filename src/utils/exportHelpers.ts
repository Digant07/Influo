import type { UserProfileSummary } from "@/types";
import { formatFollowers, formatEngagementRate } from "./formatters";
import { getPlatformLabel } from "./dataHelpers";

export interface CreatorCSVExportRow {
  Username: string;
  "Full Name": string;
  Platform: string;
  Verified: string;
  Followers: number;
  "Followers Display": string;
  "Engagement Rate": string;
  "Avg Views": number;
  "Avg Views Display": string;
  Engagements: number;
  "Engagements Display": string;
  Category: string;
  Country: string;
  "Profile URL": string;
  "Added To List": string;
  "Exported At": string;
}

export function escapeCSVValue(val: unknown): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function detectPlatformFromUrl(url: string): string {
  const lowerUrl = (url || "").toLowerCase();
  if (lowerUrl.includes("instagram.com")) return "Instagram";
  if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be")) return "YouTube";
  if (lowerUrl.includes("tiktok.com")) return "TikTok";
  return "Instagram";
}

export function getCreatorCategory(username: string): string {
  const name = (username || "").toLowerCase();
  if (name.includes("mrbeast")) return "Entertainment";
  if (name.includes("cristiano")) return "Sports & Fitness";
  if (name.includes("khaby") || name.includes("khabane")) return "Comedy & Memes";
  if (name.includes("tseries") || name.includes("t-series")) return "Music & Entertainment";
  if (name.includes("vlad") || name.includes("niki")) return "Kids & Family";
  if (name.includes("pewdiepie")) return "Gaming & Comedy";
  if (name.includes("charlidamelio") || name.includes("charli")) return "Dance & Entertainment";
  if (name.includes("bellapoarch")) return "Music & Entertainment";
  if (name.includes("zachking")) return "Magic & Comedy";
  if (name.includes("kylie")) return "Fashion & Beauty";
  if (name.includes("selena")) return "Music & Acting";
  if (name.includes("messi") || name.includes("leomessi")) return "Sports & Fitness";
  return "General";
}

export function getCreatorCountry(username: string): string {
  const name = (username || "").toLowerCase();
  if (name.includes("mrbeast")) return "United States";
  if (name.includes("cristiano")) return "Portugal";
  if (name.includes("khaby") || name.includes("khabane")) return "Italy";
  if (name.includes("tseries") || name.includes("t-series")) return "India";
  if (name.includes("vlad") || name.includes("niki")) return "United States";
  if (name.includes("pewdiepie")) return "Japan";
  if (name.includes("charlidamelio") || name.includes("charli")) return "United States";
  if (name.includes("bellapoarch")) return "United States";
  if (name.includes("zachking")) return "United States";
  if (name.includes("kylie")) return "United States";
  if (name.includes("selena")) return "United States";
  if (name.includes("messi") || name.includes("leomessi")) return "Argentina";
  return "United States";
}

export function downloadCreatorsCSV(list: UserProfileSummary[]) {
  if (list.length === 0) return;

  const headers = [
    "Username",
    "Full Name",
    "Platform",
    "Verified",
    "Followers",
    "Followers Display",
    "Engagement Rate",
    "Avg Views",
    "Avg Views Display",
    "Engagements",
    "Engagements Display",
    "Category",
    "Country",
    "Profile URL",
    "Added To List",
    "Exported At"
  ];

  const nowStr = new Date().toISOString().replace("T", " ").substring(0, 19);

  const rows = list.map((p) => {
    const username = p.username || p.handle || p.custom_name || "";
    const platformStr = p.platform ? getPlatformLabel(p.platform) : detectPlatformFromUrl(p.url);
    const followersDisplay = formatFollowers(p.followers, 1);
    const engagementRateStr = p.engagement_rate !== undefined ? formatEngagementRate(p.engagement_rate) : "0%";
    const avgViews = p.avg_views || 0;
    const avgViewsDisplay = avgViews > 0 ? formatFollowers(avgViews, 1) : "0";
    const engagements = p.engagements || 0;
    const engagementsDisplay = engagements > 0 ? formatFollowers(engagements, 1) : "0";
    const category = getCreatorCategory(username);
    const country = getCreatorCountry(username);

    return [
      escapeCSVValue(username),
      escapeCSVValue(p.fullname || ""),
      escapeCSVValue(platformStr),
      escapeCSVValue(p.is_verified ? "Yes" : "No"),
      p.followers,
      escapeCSVValue(followersDisplay),
      escapeCSVValue(engagementRateStr),
      avgViews,
      escapeCSVValue(avgViewsDisplay),
      engagements,
      escapeCSVValue(engagementsDisplay),
      escapeCSVValue(category),
      escapeCSVValue(country),
      escapeCSVValue(p.url),
      "Yes",
      escapeCSVValue(nowStr)
    ];
  });

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(","))
  ].join("\n");

  // Create Blob with UTF-8 BOM to ensure it opens properly in Excel/Sheets
  const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute("href", url);
  link.setAttribute("download", `influo-creators-${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
