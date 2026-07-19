"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, TimerReset } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/auth-context";

const RESEND_SECONDS = 60;

export default function OtpVerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "";
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";
  const { setUser } = useAuth();
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setInterval(() => setCountdown((value) => value - 1), 1000);
    return () => window.clearInterval(timer);
  }, [countdown]);

  const canResend = useMemo(() => countdown === 0, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setError(payload.message || "تأیید کد با خطا مواجه شد.");
        return;
      }
      setUser(payload.user);
      setMessage(payload.message || "ورود با موفقیت انجام شد.");
      router.replace(redirectTo);
    } catch {
      setError("درخواست تأیید با خطا مواجه شد.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!phone || !canResend) return;
    setIsResending(true);
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
        setError(payload.message || "ارسال مجدد کد با خطا مواجه شد.");
        return;
      }
      setCountdown(RESEND_SECONDS);
      setMessage(payload.message || "کد جدید ارسال شد.");
    } catch {
      setError("ارسال مجدد با خطا مواجه شد.");
    } finally {
      setIsResending(false);
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
            <h1 className="text-2xl font-bold gradient-text">تأیید کد</h1>
            <p className="mt-2 text-sm text-gray-500">
              کد ۶ رقمی ارسال‌شده به {phone || "شماره شما"} را وارد کنید
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="otp" className="mb-2 block text-sm font-medium text-gray-700">
                کد تأیید
              </label>
              <input
                ref={inputRef}
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
                className="w-full rounded-2xl border border-pink-100 bg-pink-50 py-3.5 px-4 text-center text-2xl tracking-[0.35em] outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
                dir="ltr"
                placeholder="●●●●●●"
              />
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

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting || otp.length !== 6}>
              {isSubmitting ? "در حال تأیید..." : "تأیید و ورود"}
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
            <button
              type="button"
              onClick={handleResend}
              disabled={!canResend || isResending}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-pink-600 hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <TimerReset className="h-4 w-4" />
              {isResending ? "در حال ارسال..." : "ارسال مجدد کد"}
            </button>
            <span className="text-gray-400">{canResend ? "آماده ارسال مجدد" : `${countdown}s`}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
