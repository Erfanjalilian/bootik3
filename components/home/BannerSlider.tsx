"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductImage from "@/components/ui/ProductImage";
import type { Banner } from "@/lib/types";

interface BannerSliderProps {
  banners: Banner[];
}

export default function BannerSlider({ banners }: BannerSliderProps) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % banners.length);
  }, [banners.length]);

  const prev = () => {
    setCurrent((c) => (c - 1 + banners.length) % banners.length);
  };

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative mx-auto max-w-7xl overflow-hidden px-4 pt-6 lg:px-8">
      <div className="relative aspect-[21/9] min-h-[280px] overflow-hidden rounded-3xl shadow-2xl shadow-pink-200/30 md:min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0"
          >
            <ProductImage
              src={banners[current].image}
              alt={banners[current].title}
              priority={current === 0}
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-pink-900/70 via-pink-900/30 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16">
              <motion.h2
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-3 max-w-lg text-2xl font-bold text-white md:text-4xl lg:text-5xl"
              >
                {banners[current].title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
                className="mb-6 max-w-md text-sm text-pink-100 md:text-lg"
              >
                {banners[current].subtitle}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Link
                  href={banners[current].link}
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-pink-600 shadow-xl transition-all hover:scale-105 hover:shadow-2xl md:text-base"
                >
                  مشاهده محصولات
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        <button
          onClick={prev}
          className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-all hover:bg-white/40"
          aria-label="اسلاید قبلی"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
        <button
          onClick={next}
          className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-all hover:bg-white/40"
          aria-label="اسلاید بعدی"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? "w-8 bg-white" : "w-2 bg-white/50"
              }`}
              aria-label={`اسلاید ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
