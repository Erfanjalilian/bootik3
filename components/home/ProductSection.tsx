"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import type { Product } from "@/lib/types";

interface ProductSectionProps {
  title: string;
  subtitle: string;
  products: Product[];
  viewAllHref?: string;
  accent?: "pink" | "blue";
}

export default function ProductSection({
  title,
  subtitle,
  products,
  viewAllHref = "/shop",
  accent = "pink",
}: ProductSectionProps) {
  const accentClasses =
    accent === "pink"
      ? "from-pink-500 to-rose-400"
      : "from-blue-400 to-blue-300";

  return (
    <section className="relative mx-auto max-w-7xl px-4 py-14 lg:px-8">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 48 }}
            viewport={{ once: true }}
            className={`mb-3 h-1 rounded-full bg-gradient-to-r ${accentClasses}`}
          />
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold text-gray-800 md:text-3xl"
          >
            {title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-1 text-sm text-gray-500"
          >
            {subtitle}
          </motion.p>
        </div>
        <Link
          href={viewAllHref}
          className="hidden items-center gap-1 text-sm font-medium text-pink-600 transition-colors hover:text-pink-700 sm:flex"
        >
          مشاهده همه
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>

      <div className="mt-8 text-center sm:hidden">
        <Link
          href={viewAllHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-pink-600"
        >
          مشاهده همه
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
