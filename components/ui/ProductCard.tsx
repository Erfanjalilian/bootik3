"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Star, ShoppingBag } from "lucide-react";
import ProductImage from "@/components/ui/ProductImage";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
    >
      <Link href={`/products/${product.id}`} className="group block">
        <article className="gradient-card glow-pink overflow-hidden rounded-3xl border border-white/80 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-pink-200/40">
          <div className="relative aspect-[3/4] overflow-hidden">
            <ProductImage
              src={product.images[0]}
              alt={product.name}
              className="transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-pink-900/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            {product.isOnSale && product.discount && (
              <span className="absolute top-3 right-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-400 px-3 py-1 text-xs font-bold text-white shadow-lg">
                {product.discount}٪ تخفیف
              </span>
            )}
            {product.isNew && (
              <span className="absolute top-3 left-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-300 px-3 py-1 text-xs font-bold text-white shadow-lg">
                جدید
              </span>
            )}

            <div className="absolute bottom-3 left-3 right-3 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <span className="flex items-center justify-center gap-2 rounded-2xl bg-white/90 py-2.5 text-sm font-medium text-pink-600 backdrop-blur-sm">
                <ShoppingBag className="h-4 w-4" />
                مشاهده محصول
              </span>
            </div>
          </div>

          <div className="p-4">
            <h3 className="mb-2 line-clamp-1 text-base font-semibold text-gray-800 transition-colors group-hover:text-pink-600">
              {product.name}
            </h3>
            <div className="mb-2 flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs text-gray-500">{product.rating}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-pink-600">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
