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

  if (fill) {
    return (
      <Image
        src={src}
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
      src={src}
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
