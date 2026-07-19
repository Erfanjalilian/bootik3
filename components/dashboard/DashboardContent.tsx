"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  User,
  Phone,
  MapPin,
  Package,
  Clock,
  ChevronLeft,
  Plus,
  Trash2,
  Loader2,
  Check,
  X,
  ShoppingBag,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import type { AuthUser } from "@/lib/auth/types";
import type { Order } from "@/lib/orders/types";
import type { SavedAddress } from "@/lib/addresses/store";

const PROVINCES = [
  "آذربایجان شرقی", "آذربایجان غربی", "اردبیل", "اصفهان", "البرز",
  "ایلام", "بوشهر", "تهران", "چهارمحال و بختیاری", "خراسان جنوبی",
  "خراسان رضوی", "خراسان شمالی", "خوزستان", "زنجان", "سمنان",
  "سیستان و بلوچستان", "فارس", "قزوین", "قم", "کردستان",
  "کرمان", "کرمانشاه", "کهگیلویه و بویراحمد", "گلستان", "گیلان",
  "لرستان", "مازندران", "مرکزی", "هرمزگان", "همدان", "یزد",
];

const statusLabels: Record<string, string> = {
  pending: "در انتظار پرداخت",
  paid: "پرداخت شده",
  failed: "ناموفق",
  cancelled: "لغو شده",
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
};

interface DashboardContentProps {
  user: AuthUser;
}

export default function DashboardContent({ user }: DashboardContentProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

  // Profile edit state
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [phone, setPhone] = useState(user.phone);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    province: "",
    city: "",
    address: "",
    postalCode: "",
  });
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  const fetchOrders = useCallback(async () => {
    setIsLoadingOrders(true);
    try {
      const res = await fetch("/api/orders/user-orders");
      const data = await res.json();
      if (data.ok) {
        setOrders(data.orders);
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingOrders(false);
    }
  }, []);

  const fetchAddresses = useCallback(async () => {
    setIsLoadingAddresses(true);
    try {
      const res = await fetch("/api/addresses");
      const data = await res.json();
      if (data.ok) {
        setAddresses(data.addresses);
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingAddresses(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchAddresses();
  }, [fetchOrders, fetchAddresses]);

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    setProfileMessage(null);
    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, phone }),
      });
      const data = await res.json();
      if (data.ok) {
        setProfileMessage({ type: "success", text: "اطلاعات با موفقیت ذخیره شد" });
      } else {
        setProfileMessage({ type: "error", text: data.message || "خطا در ذخیره اطلاعات" });
      }
    } catch {
      setProfileMessage({ type: "error", text: "خطا در ارتباط با سرور" });
    } finally {
      setIsSavingProfile(false);
      setTimeout(() => setProfileMessage(null), 3000);
    }
  };

  const validateAddressForm = () => {
    const errors: Record<string, string> = {};
    if (!addressForm.firstName.trim()) errors.firstName = "نام را وارد کنید";
    if (!addressForm.lastName.trim()) errors.lastName = "نام خانوادگی را وارد کنید";
    if (!addressForm.phone.trim()) errors.phone = "شماره تماس را وارد کنید";
    else if (!/^09[0-9]{9}$/.test(addressForm.phone.replace(/\s/g, ""))) errors.phone = "شماره تماس معتبر نیست";
    if (!addressForm.province) errors.province = "استان را انتخاب کنید";
    if (!addressForm.city.trim()) errors.city = "شهر را وارد کنید";
    if (!addressForm.address.trim()) errors.address = "آدرس را وارد کنید";
    if (!addressForm.postalCode.trim()) errors.postalCode = "کد پستی را وارد کنید";
    else if (!/^[0-9]{10}$/.test(addressForm.postalCode.replace(/\s/g, ""))) errors.postalCode = "کد پستی باید 10 رقم باشد";
    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddAddress = async () => {
    if (!validateAddressForm()) return;
    setIsSavingAddress(true);
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressForm),
      });
      const data = await res.json();
      if (data.ok) {
        setAddresses((prev) => [data.address, ...prev]);
        setShowAddressForm(false);
        setAddressForm({ firstName: "", lastName: "", phone: "", province: "", city: "", address: "", postalCode: "" });
        setAddressErrors({});
      } else {
        alert(data.message || "خطا در ذخیره آدرس");
      }
    } catch {
      alert("خطا در ارتباط با سرور");
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("آیا از حذف این آدرس اطمینان دارید؟")) return;
    try {
      const res = await fetch(`/api/addresses?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.ok) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
      }
    } catch {
      alert("خطا در حذف آدرس");
    }
  };

  const inputClass = (field: string, hasError = false) =>
    `w-full rounded-xl border ${hasError ? "border-red-400 bg-red-50" : "border-pink-200 bg-white"} px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100 transition-all`;

  const hasProfileInfo = user.firstName || user.lastName;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold gradient-text">پنل کاربری</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Sidebar */}
        <div className="space-y-4 lg:col-span-1">
          {/* User card */}
          <div className="rounded-3xl border border-pink-200/70 bg-white/70 p-6 shadow-sm backdrop-blur">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 to-pink-600 text-xl font-bold text-white shadow-md">
                {user.firstName ? user.firstName[0] : user.phone[user.phone.length - 1]}
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800">
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : "کاربر"}
                </p>
                <p className="text-sm text-gray-500" dir="ltr">
                  {user.phone}
                </p>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="rounded-3xl border border-pink-200/70 bg-white/70 p-4 shadow-sm backdrop-blur">
            <nav className="space-y-1">
              <a
                href="#profile"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-600 transition-colors hover:bg-pink-50 hover:text-pink-600"
              >
                <User className="h-4 w-4" />
                <span>اطلاعات حساب</span>
              </a>
              <a
                href="#orders"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-600 transition-colors hover:bg-pink-50 hover:text-pink-600"
              >
                <Package className="h-4 w-4" />
                <span>سفارش‌ها</span>
              </a>
              <a
                href="#addresses"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-600 transition-colors hover:bg-pink-50 hover:text-pink-600"
              >
                <MapPin className="h-4 w-4" />
                <span>آدرس‌ها</span>
              </a>
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="space-y-8 lg:col-span-2">
          {/* Profile Section */}
          <section id="profile" className="scroll-mt-20 rounded-3xl border border-pink-200/70 bg-white/70 p-6 shadow-sm backdrop-blur">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100">
                <User className="h-5 w-5 text-pink-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">اطلاعات حساب</h2>
            </div>

            {!hasProfileInfo && (
              <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
                لطفاً نام و نام خانوادگی خود را وارد کنید
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">نام</label>
                <input
                  type="text"
                  placeholder="مثال: علی"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={inputClass("firstName")}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">نام خانوادگی</label>
                <input
                  type="text"
                  placeholder="مثال: محمدی"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={inputClass("lastName")}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">شماره تماس</label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    placeholder="09123456789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`${inputClass("phone")} pr-10`}
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <Button size="sm" onClick={handleSaveProfile} disabled={isSavingProfile}>
                {isSavingProfile ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    در حال ذخیره...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    ذخیره اطلاعات
                  </>
                )}
              </Button>
              {profileMessage && (
                <span
                  className={`text-sm ${
                    profileMessage.type === "success" ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {profileMessage.text}
                </span>
              )}
            </div>
          </section>

          {/* Orders Section */}
          <section id="orders" className="scroll-mt-20 rounded-3xl border border-pink-200/70 bg-white/70 p-6 shadow-sm backdrop-blur">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100">
                <Package className="h-5 w-5 text-pink-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">تاریخچه سفارشات</h2>
            </div>

            {isLoadingOrders ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
              </div>
            ) : orders.length === 0 ? (
              <div className="py-8 text-center">
                <ShoppingBag className="mx-auto h-12 w-12 text-pink-300" />
                <p className="mt-3 text-gray-500">هنوز سفارشی ثبت نکرده‌اید</p>
                <Button href="/shop" size="sm" className="mt-4">
                  رفتن به فروشگاه
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-2xl border border-pink-100 bg-white p-4 transition-shadow hover:shadow-md"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50">
                          <Package className="h-5 w-5 text-pink-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            سفارش #{order.id.slice(0, 8)}
                          </p>
                          <p className="text-xs text-gray-400">
                            <Clock className="ml-1 inline h-3 w-3" />
                            {new Date(order.createdAt).toLocaleDateString("fa-IR", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-pink-600">{formatPrice(order.totalAmount)}</p>
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                            statusColors[order.status]
                          }`}
                        >
                          {statusLabels[order.status]}
                        </span>
                      </div>
                    </div>

                    {/* Order items preview */}
                    <div className="mt-3 flex flex-wrap gap-2 border-t border-pink-50 pt-3">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <span
                          key={idx}
                          className="rounded-lg bg-pink-50 px-2.5 py-1 text-xs text-gray-600"
                        >
                          {item.name} × {item.quantity}
                        </span>
                      ))}
                      {order.items.length > 3 && (
                        <span className="rounded-lg bg-pink-50 px-2.5 py-1 text-xs text-gray-400">
                          +{order.items.length - 3} عدد دیگر
                        </span>
                      )}
                    </div>

                    {/* Shipping address */}
                    <div className="mt-2 flex items-start gap-2 text-xs text-gray-500">
                      <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                      <span>
                        {order.shippingAddress.province}، {order.shippingAddress.city}،{" "}
                        {order.shippingAddress.address}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Addresses Section */}
          <section id="addresses" className="scroll-mt-20 rounded-3xl border border-pink-200/70 bg-white/70 p-6 shadow-sm backdrop-blur">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100">
                  <MapPin className="h-5 w-5 text-pink-500" />
                </div>
                <h2 className="text-lg font-bold text-gray-800">آدرس‌های ذخیره شده</h2>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAddressForm(!showAddressForm)}
              >
                {showAddressForm ? (
                  <>
                    <X className="h-4 w-4" />
                    انصراف
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    آدرس جدید
                  </>
                )}
              </Button>
            </div>

            {/* Add address form */}
            {showAddressForm && (
              <div className="mb-6 rounded-2xl border border-pink-100 bg-pink-50/50 p-5">
                <h3 className="mb-4 text-sm font-bold text-gray-700">آدرس جدید</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">نام</label>
                    <input
                      type="text"
                      placeholder="مثال: علی"
                      value={addressForm.firstName}
                      onChange={(e) =>
                        setAddressForm((prev) => ({ ...prev, firstName: e.target.value }))
                      }
                      className={inputClass("firstName", !!addressErrors.firstName)}
                    />
                    {addressErrors.firstName && (
                      <p className="mt-1 text-xs text-red-500">{addressErrors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">نام خانوادگی</label>
                    <input
                      type="text"
                      placeholder="مثال: محمدی"
                      value={addressForm.lastName}
                      onChange={(e) =>
                        setAddressForm((prev) => ({ ...prev, lastName: e.target.value }))
                      }
                      className={inputClass("lastName", !!addressErrors.lastName)}
                    />
                    {addressErrors.lastName && (
                      <p className="mt-1 text-xs text-red-500">{addressErrors.lastName}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">شماره تماس</label>
                    <input
                      type="tel"
                      placeholder="09123456789"
                      value={addressForm.phone}
                      onChange={(e) =>
                        setAddressForm((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      className={inputClass("phone", !!addressErrors.phone)}
                      dir="ltr"
                    />
                    {addressErrors.phone && (
                      <p className="mt-1 text-xs text-red-500">{addressErrors.phone}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">کد پستی</label>
                    <input
                      type="text"
                      placeholder="1234567890"
                      value={addressForm.postalCode}
                      onChange={(e) =>
                        setAddressForm((prev) => ({ ...prev, postalCode: e.target.value }))
                      }
                      className={inputClass("postalCode", !!addressErrors.postalCode)}
                      dir="ltr"
                    />
                    {addressErrors.postalCode && (
                      <p className="mt-1 text-xs text-red-500">{addressErrors.postalCode}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">استان</label>
                    <select
                      value={addressForm.province}
                      onChange={(e) =>
                        setAddressForm((prev) => ({ ...prev, province: e.target.value }))
                      }
                      className={inputClass("province", !!addressErrors.province)}
                    >
                      <option value="">انتخاب استان</option>
                      {PROVINCES.map((province) => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                    {addressErrors.province && (
                      <p className="mt-1 text-xs text-red-500">{addressErrors.province}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">شهر</label>
                    <input
                      type="text"
                      placeholder="مثال: تهران"
                      value={addressForm.city}
                      onChange={(e) =>
                        setAddressForm((prev) => ({ ...prev, city: e.target.value }))
                      }
                      className={inputClass("city", !!addressErrors.city)}
                    />
                    {addressErrors.city && (
                      <p className="mt-1 text-xs text-red-500">{addressErrors.city}</p>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">آدرس</label>
                  <textarea
                    placeholder="مثال: خیابان ولیعصر، کوچه گلستان، پلاک ۵، واحد ۲"
                    value={addressForm.address}
                    onChange={(e) =>
                      setAddressForm((prev) => ({ ...prev, address: e.target.value }))
                    }
                    rows={2}
                    className={inputClass("address", !!addressErrors.address)}
                  />
                  {addressErrors.address && (
                    <p className="mt-1 text-xs text-red-500">{addressErrors.address}</p>
                  )}
                </div>
                <div className="mt-4 flex justify-end">
                  <Button size="sm" onClick={handleAddAddress} disabled={isSavingAddress}>
                    {isSavingAddress ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        در حال ذخیره...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        ذخیره آدرس
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Addresses list */}
            {isLoadingAddresses ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
              </div>
            ) : addresses.length === 0 ? (
              <div className="py-8 text-center">
                <MapPin className="mx-auto h-12 w-12 text-pink-300" />
                <p className="mt-3 text-gray-500">آدرسی ذخیره نشده است</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-4"
                  onClick={() => setShowAddressForm(true)}
                >
                  <Plus className="h-4 w-4" />
                  افزودن آدرس
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="rounded-2xl border border-pink-100 bg-white p-4 transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                          <User className="h-4 w-4 text-pink-500" />
                          <span>
                            {addr.firstName} {addr.lastName}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500" dir="ltr">
                          <Phone className="h-3 w-3" />
                          <span>{addr.phone}</span>
                        </div>
                        <div className="mt-2 flex items-start gap-2 text-sm text-gray-600">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-pink-400" />
                          <span>
                            {addr.province}، {addr.city}، {addr.address}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-gray-400">
                          کد پستی: {addr.postalCode}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                        title="حذف آدرس"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}