"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { User, Lock, LogIn } from "lucide-react";
import Button from "@/components/ui/Button";

export default function PasswordLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setError(payload.message || "ورود با خطا مواجه شد.");
        return;
      }
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
        <label htmlFor="login-username" className="mb-2 block text-sm font-medium text-gray-700">
          نام کاربری
        </label>
        <div className="relative">
          <User className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-pink-400" />
          <input
            id="login-username"
            type="text"
            placeholder="نام کاربری خود را وارد کنید"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-2xl border border-pink-100 bg-pink-50 py-3.5 pr-12 pl-4 text-right outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
            required
            autoComplete="username"
          />
        </div>
      </div>

      <div>
        <label htmlFor="login-password" className="mb-2 block text-sm font-medium text-gray-700">
          رمز عبور
        </label>
        <div className="relative">
          <Lock className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-pink-400" />
          <input
            id="login-password"
            type="password"
            placeholder="رمز عبور خود را وارد کنید"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-pink-100 bg-pink-50 py-3.5 pr-12 pl-4 text-right outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
            required
            autoComplete="current-password"
          />
        </div>
      </div>

      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        <LogIn className="h-5 w-5" />
        {isSubmitting ? "در حال ورود..." : "ورود"}
      </Button>
    </form>
  );
}