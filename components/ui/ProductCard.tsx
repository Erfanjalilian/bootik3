"use client";

import Link from "next/link";
import { Star, ShoppingBag } from "lucide-react";
import ProductImage from "@/components/ui/ProductImage";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div>
      <Link href={`/products/${product.id}`} className="group block">
        <article className="gradient-card glow-pink overflow-hidden rounded-3xl border border-white/80">
          <div className="relative aspect-[3/4] overflow-hidden">
            <ProductImage
              src={product.images[0]}
              alt={product.name}
            />

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

            <div className="absolute bottom-3 left-3 right-3 hidden opacity-0 group-hover:opacity-100 sm:block">
              <span className="flex items-center justify-center gap-2 rounded-2xl bg-white/90 py-2.5 text-sm font-medium text-pink-600 backdrop-blur-sm">
                <ShoppingBag className="h-4 w-4" />
                مشاهده محصول
              </span>
            </div>
          </div>

          <div className="p-4">
            <h3 className="mb-2 line-clamp-1 text-base font-semibold text-gray-800 group-hover:text-pink-600">
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
    </div>
  );
}
