"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import ProductImage from "@/components/ui/ProductImage";
import type { Banner } from "@/lib/types";

interface AdBannersProps {
  banners: Banner[];
}

export default function AdBanners({ banners }: AdBannersProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="grid gap-6 md:grid-cols-2">
        {banners.map((banner, i) => (
          <motion.div
            key={banner.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
          >
            <Link
              href={banner.link}
              className="group relative block aspect-[3/1] overflow-hidden rounded-3xl shadow-lg shadow-blue-200/30 transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <ProductImage
                src={banner.image}
                alt={banner.title}
                className="transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-blue-900/60 via-blue-900/20 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-center px-8">
                <h3 className="text-lg font-bold text-white md:text-2xl">
                  {banner.title}
                </h3>
                <p className="mt-1 text-sm text-blue-100">{banner.subtitle}</p>
              </div>
              <div className="absolute inset-0 shimmer opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
