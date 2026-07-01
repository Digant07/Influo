import { useState } from "react";

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  nameFallback?: string;
}

export function ImageWithFallback({
  src,
  nameFallback = "U",
  className,
  ...props
}: ImageWithFallbackProps) {
  const [prevSrc, setPrevSrc] = useState(src);
  const [error, setError] = useState(false);

  if (src !== prevSrc) {
    setPrevSrc(src);
    setError(false);
  }

  if (error || !src) {
    const initials = nameFallback.trim().slice(0, 2).toUpperCase();
    return (
      <div
        className={`${className} flex items-center justify-center bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold select-none`}
        style={{ aspectRatio: "1/1" }}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  );
}
