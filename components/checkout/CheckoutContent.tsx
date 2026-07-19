"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, ArrowRight, Loader2, CreditCard, User, MapPin, Phone, Mail } from "lucide-react";
import Button from "@/components/ui/Button";
import ProductImage from "@/components/ui/ProductImage";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart-store";
import type { ShippingAddress } from "@/lib/orders/types";

const PROVINCES = [
  "آذربایجان شرقی", "آذربایجان غربی", "اردبیل", "اصفهان", "البرز",
  "ایلام", "بوشهر", "تهران", "چهارمحال و بختیاری", "خراسان جنوبی",
  "خراسان رضوی", "خراسان شمالی", "خوزستان", "زنجان", "سمنان",
  "سیستان و بلوچستان", "فارس", "قزوین", "قم", "کردستان",
  "کرمان", "کرمانشاه", "کهگیلویه و بویراحمد", "گلستان", "گیلان",
  "لرستان", "مازندران", "مرکزی", "هرمزگان", "همدان", "یزد",
];

const initialAddress: ShippingAddress = {
  firstName: "",
  lastName: "",
  phone: "",
  province: "",
  city: "",
  address: "",
  postalCode: "",
};

export default function CheckoutContent() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState<{ id: string; phone: string } | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(initialAddress);
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingAddress, string>>>({});

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
          // Pre-fill phone from user profile
          setShippingAddress((prev) => ({ ...prev, phone: data.user.phone }));
        }
      })
      .catch(() => {
        router.replace("/login?redirectTo=/checkout");
      })
      .finally(() => setIsLoadingUser(false));
  }, [router]);

  const validateField = (field: keyof ShippingAddress, value: string): string => {
    if (!value.trim()) {
      const labels: Record<string, string> = {
        firstName: "نام",
        lastName: "نام خانوادگی",
        phone: "شماره تماس",
        province: "استان",
        city: "شهر",
        address: "آدرس",
        postalCode: "کد پستی",
      };
      return `لطفا ${labels[field]} را وارد کنید`;
    }
    if (field === "phone" && !/^09[0-9]{9}$/.test(value.replace(/\s/g, ""))) {
      return "شماره تماس معتبر نیست";
    }
    if (field === "postalCode" && !/^[0-9]{10}$/.test(value.replace(/\s/g, ""))) {
      return "کد پستی باید 10 رقم باشد";
    }
    return "";
  };

  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ShippingAddress, string>> = {};
    const fields: (keyof ShippingAddress)[] = [
      "firstName", "lastName", "phone", "province", "city", "address", "postalCode"
    ];
    let isValid = true;

    for (const field of fields) {
      const error = validateField(field, shippingAddress[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

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
    if (!validateForm()) return;

    setIsProcessing(true);
    try {
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
          shippingAddress,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "خطا در ثبت سفارش");
        return;
      }

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

  const inputClass = (field: keyof ShippingAddress) =>
    `w-full rounded-xl border ${errors[field] ? "border-red-400 bg-red-50" : "border-pink-200 bg-white"} px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100 transition-all`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold gradient-text">ادامه خرید</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Right side – Form & Order items */}
        <div className="space-y-6 lg:col-span-2">
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

          {/* Shipping Address Form */}
          <div className="rounded-3xl border border-pink-200/70 bg-pink-50/90 p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100">
                <MapPin className="h-5 w-5 text-pink-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">آدرس ارسال</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* First Name */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  نام <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="مثال: علی"
                  value={shippingAddress.firstName}
                  onChange={(e) => handleAddressChange("firstName", e.target.value)}
                  className={inputClass("firstName")}
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  نام خانوادگی <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="مثال: محمدی"
                  value={shippingAddress.lastName}
                  onChange={(e) => handleAddressChange("lastName", e.target.value)}
                  className={inputClass("lastName")}
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  شماره تماس <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    placeholder="09123456789"
                    value={shippingAddress.phone}
                    onChange={(e) => handleAddressChange("phone", e.target.value)}
                    className={`${inputClass("phone")} pr-10`}
                    dir="ltr"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                )}
              </div>

              {/* Postal Code */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  کد پستی <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="1234567890"
                  value={shippingAddress.postalCode}
                  onChange={(e) => handleAddressChange("postalCode", e.target.value)}
                  className={inputClass("postalCode")}
                  dir="ltr"
                />
                {errors.postalCode && (
                  <p className="mt-1 text-xs text-red-500">{errors.postalCode}</p>
                )}
              </div>

              {/* Province */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  استان <span className="text-red-400">*</span>
                </label>
                <select
                  value={shippingAddress.province}
                  onChange={(e) => handleAddressChange("province", e.target.value)}
                  className={inputClass("province")}
                >
                  <option value="">انتخاب استان</option>
                  {PROVINCES.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
                {errors.province && (
                  <p className="mt-1 text-xs text-red-500">{errors.province}</p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  شهر <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="مثال: تهران"
                  value={shippingAddress.city}
                  onChange={(e) => handleAddressChange("city", e.target.value)}
                  className={inputClass("city")}
                />
                {errors.city && (
                  <p className="mt-1 text-xs text-red-500">{errors.city}</p>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                آدرس <span className="text-red-400">*</span>
              </label>
              <textarea
                placeholder="مثال: خیابان ولیعصر، کوچه گلستان، پلاک ۵، واحد ۲"
                value={shippingAddress.address}
                onChange={(e) => handleAddressChange("address", e.target.value)}
                rows={3}
                className={inputClass("address")}
              />
              {errors.address && (
                <p className="mt-1 text-xs text-red-500">{errors.address}</p>
              )}
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