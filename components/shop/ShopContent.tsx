"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, LayoutGrid, List } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import ProductImage from "@/components/ui/ProductImage";
import ProductFilters, { type FilterState } from "@/components/shop/ProductFilters";
import { formatPrice } from "@/lib/utils";
import type { Brand, Category, Product } from "@/lib/types";
import Link from "next/link";
import { Star } from "lucide-react";

interface ShopContentProps {
  products: Product[];
  brands: Brand[];
  categories: Category[];
  initialCategory?: string;
  initialBestSeller?: boolean;
  initialIsNew?: boolean;
  initialOnSale?: boolean;
}

export default function ShopContent({
  products,
  brands,
  categories,
  initialCategory = "",
  initialBestSeller = false,
  initialIsNew = false,
  initialOnSale = false,
}: ShopContentProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    brandId: "",
    categoryId: initialCategory,
    minPrice: "",
    maxPrice: "",
    viewMode: "grid",
  });
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (initialBestSeller && !p.isBestSeller) return false;
      if (initialIsNew && !p.isNew) return false;
      if (initialOnSale && !p.isOnSale) return false;
      if (filters.categoryId && p.categoryId !== filters.categoryId) return false;
      if (filters.brandId && p.brandId !== filters.brandId) return false;
      if (filters.minPrice && p.price < Number(filters.minPrice)) return false;
      if (filters.maxPrice && p.price > Number(filters.maxPrice)) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (
          !p.name.toLowerCase().includes(q) &&
          !p.description.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [products, filters, initialBestSeller, initialIsNew, initialOnSale]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold gradient-text">فروشگاه</h1>
        <p className="mt-2 text-gray-500">
          {filtered.length} محصول یافت شد
        </p>
      </motion.div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="جستجوی محصول..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full rounded-2xl border border-pink-100 bg-white py-3 pr-12 pl-4 text-sm outline-none transition-all focus:border-pink-300 focus:ring-4 focus:ring-pink-50"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="flex items-center gap-2 rounded-2xl gradient-primary px-5 py-3 text-sm font-medium text-white shadow-lg lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            فیلتر محصولات
          </button>

          <div className="hidden items-center gap-1 rounded-2xl border border-pink-100 bg-white p-1 sm:flex">
            <button
              onClick={() => setFilters({ ...filters, viewMode: "grid" })}
              className={`rounded-xl p-2 transition-colors ${
                filters.viewMode === "grid"
                  ? "bg-pink-100 text-pink-600"
                  : "text-gray-400 hover:text-pink-500"
              }`}
              aria-label="نمایش شبکه‌ای"
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setFilters({ ...filters, viewMode: "list" })}
              className={`rounded-xl p-2 transition-colors ${
                filters.viewMode === "list"
                  ? "bg-pink-100 text-pink-600"
                  : "text-gray-400 hover:text-pink-500"
              }`}
              aria-label="نمایش لیستی"
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        <div className="hidden w-72 shrink-0 lg:block">
          <ProductFilters
            filters={filters}
            onChange={setFilters}
            brands={brands}
            categories={categories}
          />
        </div>

        <ProductFilters
          filters={filters}
          onChange={setFilters}
          brands={brands}
          categories={categories}
          isOpen={mobileFilterOpen}
          onClose={() => setMobileFilterOpen(false)}
          isMobile
        />

        <div className="flex-1">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-lg font-medium text-gray-500">
                محصولی یافت نشد
              </p>
              <p className="mt-2 text-sm text-gray-400">
                فیلترها را تغییر دهید یا عبارت جستجو را اصلاح کنید
              </p>
            </div>
          ) : filters.viewMode === "grid" ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={`/products/${product.id}`}
                    className="group flex gap-4 rounded-3xl border border-white/80 bg-white/80 p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-pink-100/50 sm:gap-6"
                  >
                    <div className="relative h-32 w-28 shrink-0 overflow-hidden rounded-2xl sm:h-40 sm:w-36">
                      <ProductImage src={product.images[0]} alt={product.name} />
                    </div>
                    <div className="flex flex-1 flex-col justify-center">
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-pink-600">
                        {product.name}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                        {product.description}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm text-gray-500">
                          {product.rating}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
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
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
