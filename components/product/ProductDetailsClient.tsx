"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Minus,
  Plus,
  Check,
  Star,
  ChevronLeft,
} from "lucide-react";
import ProductImage from "@/components/ui/ProductImage";
import ProductCard from "@/components/ui/ProductCard";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart-store";
import type { Brand, Category, Product } from "@/lib/types";

interface ProductDetailsClientProps {
  product: Product;
  brand?: Brand;
  category?: Category;
  relatedProducts: Product[];
}

export default function ProductDetailsClient({
  product,
  brand,
  category,
  relatedProducts,
}: ProductDetailsClientProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name ?? "");
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      color: selectedColor,
      size: selectedSize,
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <Link
        href="/shop"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-pink-600"
      >
        <ChevronLeft className="h-4 w-4" />
        بازگشت به فروشگاه
      </Link>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-pink-50 shadow-xl shadow-pink-100/50">
            <ProductImage
              src={product.images[selectedImage]}
              alt={product.name}
              priority
            />
            {product.isOnSale && product.discount && (
              <span className="absolute top-4 right-4 rounded-full gradient-primary px-4 py-1.5 text-sm font-bold text-white">
                {product.discount}٪ تخفیف
              </span>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 ${
                    i === selectedImage
                      ? "border-pink-400 shadow-lg shadow-pink-200/50"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <ProductImage src={img} alt={`${product.name} ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-gray-500">
              {category && <span>{category.name}</span>}
              {brand && (
                <>
                  <span>•</span>
                  <span>{brand.name}</span>
                </>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
              {product.name}
            </h1>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">({product.rating})</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-pink-600">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-lg text-gray-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <p className="leading-relaxed text-gray-600">{product.description}</p>

          {product.colors.length > 0 && (
            <div>
              <label className="mb-3 block text-sm font-medium text-gray-700">
                رنگ: <span className="text-pink-600">{selectedColor}</span>
              </label>
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`h-10 w-10 rounded-full border-2 ${
                      selectedColor === color.name
                        ? "border-pink-500 shadow-lg"
                        : "border-gray-200"
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                    aria-label={color.name}
                  />
                ))}
              </div>
            </div>
          )}

          {product.sizes.length > 0 && (
            <div>
              <label className="mb-3 block text-sm font-medium text-gray-700">
                سایز
              </label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[48px] rounded-xl px-4 py-2 text-sm font-medium ${
                      selectedSize === size
                        ? "gradient-primary text-white shadow-lg"
                        : "border border-pink-100 bg-pink-50 text-gray-600 hover:border-pink-300"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="mb-3 block text-sm font-medium text-gray-700">
              تعداد
            </label>
            <div className="inline-flex items-center gap-4 rounded-2xl border border-pink-100 bg-pink-50 px-4 py-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="rounded-lg p-1 text-gray-500 hover:bg-pink-50 hover:text-pink-600"
                aria-label="کاهش"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-[2rem] text-center font-semibold">
                {quantity}
              </span>
              <button
                onClick={() =>
                  setQuantity(Math.min(product.stock, quantity + 1))
                }
                className="rounded-lg p-1 text-gray-500 hover:bg-pink-50 hover:text-pink-600"
                aria-label="افزایش"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-400">
              {product.stock} عدد موجود در انبار
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={handleAddToCart}
              size="lg"
              className="flex-1"
            >
              {added ? (
                <>
                  <Check className="h-5 w-5" />
                  افزوده شد!
                </>
              ) : (
                <>
                  <ShoppingBag className="h-5 w-5" />
                  افزودن به سبد خرید
                </>
              )}
            </Button>
            <Button href="/cart" variant="outline" size="lg">
              مشاهده سبد
            </Button>
          </div>

          {/* =============== بخش اصلاح شده مشخصات محصول =============== */}
          <div className="gradient-card rounded-3xl border border-pink-200/70 p-6">
            <h3 className="mb-4 font-semibold text-gray-800">مشخصات محصول</h3>
            <dl className="space-y-3">
              {Object.entries(product.specifications).length > 0 ? (
                Object.entries(product.specifications).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between border-b border-pink-50 pb-2 text-sm last:border-0"
                  >
                    <dt className="text-gray-500">{key}</dt>
                    <dd className="font-medium text-gray-800">
                      {typeof value === 'object' ? JSON.stringify(value) : value}
                    </dd>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">هیچ مشخصاتی ثبت نشده است.</p>
              )}
            </dl>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-8 text-2xl font-bold text-gray-800">
            محصولات مشابه
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}