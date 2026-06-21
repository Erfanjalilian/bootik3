"use client";

import Link from "next/link";
import ProductImage from "@/components/ui/ProductImage";
import type { Banner } from "@/lib/types";

interface AdBannersProps {
  banners: Banner[];
}

export default function AdBanners({ banners }: AdBannersProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="grid gap-6 md:grid-cols-2">
        {banners.map((banner) => (
          <div key={banner.id}>
            <Link
              href={banner.link}
              className="group relative block aspect-[4/3] overflow-hidden rounded-3xl shadow-lg shadow-blue-200/30 sm:aspect-[3/1]"
            >
              <ProductImage
                src={banner.image}
                alt={banner.title}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-blue-900/60 via-blue-900/20 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-8">
                <h3 className="text-base font-bold text-white sm:text-lg md:text-2xl">
                  {banner.title}
                </h3>
                <p className="mt-1 text-xs text-blue-100 sm:text-sm">{banner.subtitle}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
