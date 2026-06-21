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
}

export default function ProductImage({
  src,
  alt,
  fill = true,
  className = "",
  priority = false,
  sizes,
}: ProductImageProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-pink-100 via-white to-blue-100 ${fill ? "absolute inset-0" : ""} ${className}`}
      >
        <ImageIcon className="h-12 w-12 text-pink-300" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      priority={priority}
      sizes={sizes}
      className={`object-cover ${className}`}
      onError={() => setError(true)}
    />
  );
}
