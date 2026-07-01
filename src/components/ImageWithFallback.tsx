import { useState } from "react";

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  nameFallback?: string;
}

function getInitials(name: string): string {
  const cleanName = name.replace(/[^a-zA-Z0-9\s-_]/g, "").trim();
  if (!cleanName) return "U";

  // Split by space, hyphen, or underscore
  const parts = cleanName.split(/[\s-_]+/);
  if (parts.length >= 2) {
    const first = parts[0][0] || "";
    let secondPart = parts[1];
    if (
      (secondPart.toLowerCase() === "and" ||
        secondPart.toLowerCase() === "of" ||
        secondPart.toLowerCase() === "the") &&
      parts[2]
    ) {
      secondPart = parts[2];
    }
    const second = secondPart[0] || "";
    return (first + second).toUpperCase();
  }

  // Check for PascalCase / camelCase capitals (e.g. MrBeast -> MB)
  const capitals = cleanName.match(/[A-Z]/g);
  if (capitals && capitals.length >= 2) {
    return capitals.slice(0, 2).join("").toUpperCase();
  }

  return cleanName.slice(0, 2).toUpperCase();
}

function getGradient(name: string): string {
  const gradients = [
    "from-orange-500 to-amber-400 text-white shadow-orange-500/10",
    "from-pink-500 to-rose-450 text-white shadow-pink-500/10",
    "from-indigo-500 to-purple-400 text-white shadow-indigo-500/10",
    "from-blue-500 to-cyan-400 text-white shadow-blue-500/10",
    "from-emerald-500 to-teal-400 text-white shadow-emerald-500/10",
    "from-violet-500 to-fuchsia-450 text-white shadow-violet-500/10",
    "from-red-500 to-orange-400 text-white shadow-red-500/10",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  nameFallback?: string;
  fallbackSrcs?: string[];
}

export function ImageWithFallback({
  src,
  nameFallback = "U",
  fallbackSrcs = [],
  className,
  ...props
}: ImageWithFallbackProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [fallbackIndex, setFallbackIndex] = useState(-1);
  const [error, setError] = useState(false);

  // Sync state if initial src changes
  if (src !== currentSrc && fallbackIndex === -1) {
    setCurrentSrc(src);
  }

  const handleError = () => {
    const nextIndex = fallbackIndex + 1;
    if (fallbackIndex === -1 && src !== currentSrc) {
      // If we are currently showing a fallback but src changed
      setError(true);
    } else if (nextIndex < fallbackSrcs.length) {
      setFallbackIndex(nextIndex);
      setCurrentSrc(fallbackSrcs[nextIndex]);
    } else {
      setError(true);
    }
  };

  if (error || !currentSrc) {
    const initials = getInitials(nameFallback);
    const gradient = getGradient(nameFallback);
    return (
      <div
        className={`${className} flex items-center justify-center bg-gradient-to-br ${gradient} font-bold select-none border border-white/10 dark:border-slate-800/60 shadow-xs`}
        style={{ aspectRatio: "1/1" }}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      className={className}
      onError={handleError}
      referrerPolicy="no-referrer"
      {...props}
    />
  );
}
