"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";

interface ProductImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
}

/**
 * Resolve image URL:
 * - Absolute URLs (https://...) remain as-is (backward compatible with old remote images like i.postimg.cc)
 * - /uploads/ paths are served directly by Nginx from /root/uploads (not in Next.js public folder)
 * - Other relative paths (e.g. /images/...) are served from the Next.js public folder
 */
function resolveImageUrl(src: string): string {
  // Already absolute - return as-is
  if (/^https?:\/\//.test(src)) return src;

  // /uploads/ paths are served by Nginx directly from /root/uploads
  if (src.startsWith("/uploads/")) {
    if (typeof window !== "undefined") {
      return `${window.location.origin}${src}`;
    }
    return src;
  }

  // Other relative paths are served from Next.js public folder
  return src;
}

export default function ProductImage({
  src,
  alt,
  fill = true,
  className = "",
  priority = false,
  sizes,
  width,
  height,
}: ProductImageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const resolvedSrc = resolveImageUrl(src);
  const isUploads = src.startsWith("/uploads/");

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-pink-100 via-white to-blue-100 ${fill ? "absolute inset-0" : ""} ${className}`}
      >
        <div className="text-center">
          <ImageIcon className="h-12 w-12 text-pink-300 mx-auto mb-2" />
          <p className="text-xs text-pink-400">عکس بارگذاری نشد</p>
        </div>
      </div>
    );
  }

  // For /uploads/ paths, use a regular img tag:
  // - These are already optimized WebP images
  // - They are served directly by Nginx from /root/uploads (not through Next.js)
  // - This avoids Next.js Image optimizer involvement entirely
  if (isUploads && !error) {
    if (fill) {
      return (
        <img
          src={resolvedSrc}
          alt={alt}
          className={`object-cover ${loading ? "blur-sm" : "blur-0"} transition-all w-full h-full ${className}`}
          onError={() => setError(true)}
          onLoad={() => setLoading(false)}
        />
      );
    }

    return (
      <img
        src={resolvedSrc}
        alt={alt}
        width={width || 300}
        height={height || 300}
        className={`${loading ? "blur-sm" : "blur-0"} transition-all ${className}`}
        onError={() => setError(true)}
        onLoad={() => setLoading(false)}
      />
    );
  }

  if (fill) {
    return (
      <Image
        src={resolvedSrc}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
        className={`object-cover ${loading ? "blur-sm" : "blur-0"} transition-all ${className}`}
        onError={() => setError(true)}
        onLoadingComplete={() => setLoading(false)}
      />
    );
  }

  return (
    <Image
      src={resolvedSrc}
      alt={alt}
      width={width || 300}
      height={height || 300}
      priority={priority}
      className={`${loading ? "blur-sm" : "blur-0"} transition-all ${className}`}
      onError={() => setError(true)}
      onLoadingComplete={() => setLoading(false)}
    />
  );
}