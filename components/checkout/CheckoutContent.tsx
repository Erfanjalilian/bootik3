"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, ArrowRight, Loader2, CreditCard, User } from "lucide-react";
import Button from "@/components/ui/Button";
import ProductImage from "@/components/ui/ProductImage";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart-store";

export default function CheckoutContent() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState<{ id: string; phone: string } | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) {
          router.replace("/login?redirectTo=/checkout");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.ok) {
          setUser(data.user);
        }
      })
      .catch(() => {
        router.replace("/login?redirectTo=/checkout");
      })
      .finally(() => setIsLoadingUser(false));
  }, [router]);

  if (isLoadingUser) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-pink-500" />
          <p className="mt-4 text-gray-500">در حال بررسی اطلاعات...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 lg:px-8">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-pink-50">
            <ShoppingBag className="h-12 w-12 text-pink-300" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">سبد خرید خالی است</h1>
          <p className="mt-2 text-gray-500">
            هیچ محصولی برای ادامه خرید وجود ندارد
          </p>
          <Button href="/shop" className="mt-8">
            رفتن به فروشگاه
          </Button>
        </div>
      </div>
    );
  }

  const handleProceedToPayment = async () => {
    setIsProcessing(true);
    try {
      // TODO: Create order in backend and get payment URL
      // For now, redirect to payment gateway with a mock flow
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            color: item.color,
            size: item.size,
            image: item.image,
          })),
          totalAmount: totalPrice(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.message || "خطا در ثبت سفارش");
        return;
      }

      const data = await response.json();
      if (data.gatewayUrl) {
        clearCart();
        window.location.href = data.gatewayUrl;
      } else {
        alert("خطا در اتصال به درگاه پرداخت");
      }
    } catch {
      alert("خطا در ارتباط با سرور");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold gradient-text">ادامه خرید</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Right side – Order items */}
        <div className="space-y-4 lg:col-span-2">
          {/* User info card */}
          <div className="rounded-3xl border border-pink-200/70 bg-pink-50/90 p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-800">اطلاعات کاربر</h2>
            <div className="flex items-center gap-3 text-gray-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100">
                <User className="h-5 w-5 text-pink-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">شماره موبایل</p>
                <p className="font-medium text-gray-800" dir="ltr">
                  {user.phone}
                </p>
              </div>
            </div>
          </div>

          {/* Order items */}
          <div className="rounded-3xl border border-pink-200/70 bg-pink-50/90 p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-800">محصولات</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.color}-${item.size}`}
                  className="flex items-center gap-4 rounded-2xl border border-pink-100 bg-white p-3"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                    <ProductImage src={item.image} alt={item.name} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">
                      {item.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {item.color} | {item.size} | <span className="text-pink-600 font-medium">{formatPrice(item.price)}</span>
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-gray-500">تعداد</p>
                    <p className="font-medium text-gray-800">{item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Left side – Order summary */}
        <div className="h-fit space-y-4">
          <div className="gradient-card glow-pink rounded-3xl border border-pink-200/70 p-6">
            <h2 className="mb-6 text-lg font-bold text-gray-800">خلاصه سفارش</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>تعداد کالا</span>
                <span>{items.reduce((sum, i) => sum + i.quantity, 0)} عدد</span>
              </div>
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

            <Button
              size="lg"
              className="mt-6 w-full"
              onClick={handleProceedToPayment}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  در حال اتصال به درگاه...
                </>
              ) : (
                <>
                  پرداخت
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>

            <Button
              href="/cart"
              variant="outline"
              size="md"
              className="mt-3 w-full"
            >
              بازگشت به سبد خرید
            </Button>
          </div>

          {/* Payment methods info */}
          <div className="rounded-3xl border border-pink-200/70 bg-pink-50/90 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-pink-500" />
              <span className="text-sm text-gray-600">
                پرداخت امن از طریق درگاه زرین‌پال
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}