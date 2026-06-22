"use client";

import { X } from "lucide-react";
import type { Brand, Category } from "@/lib/types";

export interface FilterState {
  search: string;
  brandId: string;
  categoryId: string;
  minPrice: string;
  maxPrice: string;
  viewMode: "grid" | "list";
}

interface ProductFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  brands: Brand[];
  categories: Category[];
  isOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

export default function ProductFilters({
  filters,
  onChange,
  brands,
  categories,
  isOpen = true,
  onClose,
  isMobile = false,
}: ProductFiltersProps) {
  const update = (partial: Partial<FilterState>) => {
    onChange({ ...filters, ...partial });
  };

  const reset = () => {
    onChange({
      search: filters.search,
      brandId: "",
      categoryId: "",
      minPrice: "",
      maxPrice: "",
      viewMode: filters.viewMode,
    });
  };

  const content = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800">فیلتر محصولات</h3>
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="rounded-xl p-2 hover:bg-pink-50"
            aria-label="بستن"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-600">
          دسته‌بندی
        </label>
        <select
          value={filters.categoryId}
          onChange={(e) => update({ categoryId: e.target.value })}
          className="w-full rounded-xl border border-pink-100 bg-pink-50 px-4 py-2.5 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
        >
          <option value="">همه دسته‌ها</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-600">
          برند
        </label>
        <select
          value={filters.brandId}
          onChange={(e) => update({ brandId: e.target.value })}
          className="w-full rounded-xl border border-pink-100 bg-pink-50 px-4 py-2.5 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
        >
          <option value="">همه برندها</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-600">
          محدوده قیمت (تومان)
        </label>
        <div className="flex gap-3">
          <input
            type="number"
            placeholder="حداقل"
            value={filters.minPrice}
            onChange={(e) => update({ minPrice: e.target.value })}
            className="w-full rounded-xl border border-pink-100 bg-pink-50 px-4 py-2.5 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
          />
          <input
            type="number"
            placeholder="حداکثر"
            value={filters.maxPrice}
            onChange={(e) => update({ maxPrice: e.target.value })}
            className="w-full rounded-xl border border-pink-100 bg-pink-50 px-4 py-2.5 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
          />
        </div>
      </div>

      <button
        onClick={reset}
        className="w-full rounded-xl border-2 border-pink-200 py-2.5 text-sm font-medium text-pink-600 hover:bg-pink-50"
      >
        پاک کردن فیلترها
      </button>
    </div>
  );

  if (isMobile) {
    if (!isOpen) return null;

    return (
      <>
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        />
        <aside className="fixed top-0 right-0 z-50 h-full w-[85%] max-w-sm overflow-y-auto bg-pink-50 p-6 shadow-2xl lg:hidden">
          {content}
        </aside>
      </>
    );
  }

  return (
    <aside className="gradient-card glow-blue hidden rounded-3xl border border-pink-200/70 p-6 lg:block">
      {content}
    </aside>
  );
}
