"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Phone, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";

export default function LoginForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setError(payload.message || "درخواست کد تأیید با خطا مواجه شد.");
        return;
      }
      setMessage(payload.message || "کد تأیید ارسال شد.");
      router.push(`/verify?phone=${encodeURIComponent(phone)}`);
    } catch {
      setError("درخواست به سرور با خطا مواجه شد.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="light-orb -top-20 right-1/4 h-72 w-72 bg-pink-300/20" />
      <div className="light-orb -bottom-20 left-1/4 h-72 w-72 bg-blue-300/20" />

      <div className="relative w-full max-w-md">
        <div className="gradient-card glow-pink overflow-hidden rounded-3xl border border-pink-200/70 p-8 shadow-xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold gradient-text">ورود / ثبت‌نام</h1>
            <p className="mt-2 text-sm text-gray-500">
              برای ادامه، شماره موبایل خود را وارد کنید
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                شماره موبایل
              </label>
              <div className="relative">
                <Phone className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-pink-400" />
                <input
                  id="phone"
                  type="tel"
                  placeholder="۰۹۱۲۱۲۳۴۵۶۷"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl border border-pink-100 bg-pink-50 py-3.5 pr-12 pl-4 text-left outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
                  dir="ltr"
                  required
                />
              </div>
            </div>

            {error ? (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </p>
            ) : null}

            {message ? (
              <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {message}
              </p>
            ) : null}

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "در حال ارسال..." : "دریافت کد تأیید"}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400">
            با ورود، شرایط و قوانین استفاده از سایت را می‌پذیرید
          </p>
        </div>
      </div>
    </div>
  );
}
