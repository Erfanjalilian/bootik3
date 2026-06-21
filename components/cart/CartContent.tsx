"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import ProductImage from "@/components/ui/ProductImage";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart-store";

export default function CartContent() {
  const { items, updateQuantity, removeItem, totalPrice, clearCart } =
    useCartStore();

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 lg:px-8">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-pink-50">
            <ShoppingBag className="h-12 w-12 text-pink-300" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">سبد خرید خالی است</h1>
          <p className="mt-2 text-gray-500">
            هنوز محصولی به سبد خرید اضافه نکرده‌اید
          </p>
          <Button href="/shop" className="mt-8">
            رفتن به فروشگاه
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold gradient-text">سبد خرید</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.color}-${item.size}`}
              className="flex gap-4 rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm sm:gap-6 sm:p-6"
            >
              <Link
                href={`/products/${item.productId}`}
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl sm:h-32 sm:w-32"
              >
                <ProductImage src={item.image} alt={item.name} />
              </Link>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link
                    href={`/products/${item.productId}`}
                    className="font-semibold text-gray-800 hover:text-pink-600"
                  >
                    {item.name}
                  </Link>
                  <p className="mt-1 text-sm text-gray-500">
                    رنگ: {item.color} | سایز: {item.size}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="inline-flex items-center gap-3 rounded-xl border border-pink-100 px-3 py-1.5">
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.productId,
                          item.color,
                          item.size,
                          item.quantity - 1
                        )
                      }
                      className="text-gray-500 hover:text-pink-600"
                      aria-label="کاهش"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="font-medium">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.productId,
                          item.color,
                          item.size,
                          item.quantity + 1
                        )
                      }
                      className="text-gray-500 hover:text-pink-600"
                      aria-label="افزایش"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-pink-600">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                    <button
                      onClick={() =>
                        removeItem(item.productId, item.color, item.size)
                      }
                      className="rounded-xl p-2 text-red-400 hover:bg-red-50 hover:text-red-600"
                      aria-label="حذف"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="gradient-card glow-pink h-fit rounded-3xl border border-white/80 p-6">
          <h2 className="mb-6 text-lg font-bold text-gray-800">خلاصه سفارش</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>جمع کل</span>
              <span>{formatPrice(totalPrice())}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>هزینه ارسال</span>
              <span className="text-green-600">رایگان</span>
            </div>
            <div className="border-t border-pink-100 pt-3">
              <div className="flex justify-between text-lg font-bold">
                <span>مبلغ قابل پرداخت</span>
                <span className="text-pink-600">{formatPrice(totalPrice())}</span>
              </div>
            </div>
          </div>
          <Button size="lg" className="mt-6 w-full">
            تکمیل خرید
          </Button>
          <button
            onClick={clearCart}
            className="mt-3 w-full text-center text-sm text-gray-400 hover:text-red-500"
          >
            پاک کردن سبد
          </button>
          <Link
            href="/shop"
            className="mt-4 flex items-center justify-center gap-1 text-sm text-pink-600 hover:text-pink-700"
          >
            <ArrowLeft className="h-4 w-4" />
            ادامه خرید
          </Link>
        </div>
      </div>
    </div>
  );
}
