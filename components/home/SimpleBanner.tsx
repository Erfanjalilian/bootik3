"use client";

import Link from "next/link";
import ProductImage from "@/components/ui/ProductImage";
import { ChevronLeft } from "lucide-react";
import type { Banner } from "@/lib/types";

interface SimpleBannerProps {
  banner: Banner;
}

export default function SimpleBanner({ banner }: SimpleBannerProps) {
  return (
    <section className="relative mx-auto max-w-7xl px-3 pt-4 sm:px-4 sm:pt-6 lg:px-8">
      <div className="relative h-[min(72vh,520px)] min-h-[360px] overflow-hidden rounded-2xl shadow-2xl shadow-pink-200/30 sm:h-auto sm:min-h-[300px] sm:aspect-[16/9] sm:rounded-3xl md:min-h-[360px] lg:aspect-[21/9] lg:min-h-[400px]">
        <div className="absolute inset-0">
          <ProductImage
            src={banner.image}
            alt={banner.title}
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-pink-900/80 via-pink-900/40 to-pink-900/10 sm:bg-gradient-to-l sm:from-pink-900/70 sm:via-pink-900/30 sm:to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end px-4 pb-14 pt-8 sm:justify-center sm:px-8 sm:pb-0 sm:pt-0 md:px-16">
            <h2 className="mb-2 line-clamp-2 max-w-lg text-xl font-bold text-white sm:mb-3 sm:line-clamp-none sm:text-2xl md:text-4xl lg:text-5xl">
              {banner.title}
            </h2>
            <p className="mb-4 line-clamp-2 max-w-md text-xs text-pink-100 sm:mb-6 sm:line-clamp-3 sm:text-sm md:text-lg">
              {banner.subtitle}
            </p>
            <div>
              <Link
                href={banner.link}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-pink-600 shadow-xl sm:rounded-2xl sm:px-6 sm:py-3 sm:text-sm md:text-base"
              >
                مشاهده محصولات
                <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}