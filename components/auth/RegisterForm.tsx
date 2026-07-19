"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { User, Lock, UserPlus } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/auth-context";

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";
  const { setUser } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError("رمز عبور و تکرار آن مطابقت ندارند.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setError(payload.message || "ثبت‌نام با خطا مواجه شد.");
        return;
      }
      setUser(payload.user);
      setMessage(payload.message || "ثبت‌نام با موفقیت انجام شد.");
      router.replace(redirectTo);
    } catch {
      setError("درخواست به سرور با خطا مواجه شد.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="register-username" className="mb-2 block text-sm font-medium text-gray-700">
          نام کاربری
        </label>
        <div className="relative">
          <User className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-pink-400" />
          <input
            id="register-username"
            type="text"
            placeholder="نام کاربری (حروف انگلیسی)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-2xl border border-pink-100 bg-pink-50 py-3.5 pr-12 pl-4 text-right outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
            required
            autoComplete="username"
          />
        </div>
        <p className="mt-1 text-xs text-gray-400">حداقل ۳ حرف، فقط حروف انگلیسی، اعداد و زیرخط</p>
      </div>

      <div>
        <label htmlFor="register-password" className="mb-2 block text-sm font-medium text-gray-700">
          رمز عبور
        </label>
        <div className="relative">
          <Lock className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-pink-400" />
          <input
            id="register-password"
            type="password"
            placeholder="رمز عبور (حداقل ۴ حرف)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-pink-100 bg-pink-50 py-3.5 pr-12 pl-4 text-right outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
            required
            autoComplete="new-password"
          />
        </div>
      </div>

      <div>
        <label htmlFor="register-confirm" className="mb-2 block text-sm font-medium text-gray-700">
          تکرار رمز عبور
        </label>
        <div className="relative">
          <Lock className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-pink-400" />
          <input
            id="register-confirm"
            type="password"
            placeholder="رمز عبور را دوباره وارد کنید"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-2xl border border-pink-100 bg-pink-50 py-3.5 pr-12 pl-4 text-right outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
            required
            autoComplete="new-password"
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
        <UserPlus className="h-5 w-5" />
        {isSubmitting ? "در حال ثبت‌نام..." : "ثبت‌نام"}
      </Button>
    </form>
  );
}