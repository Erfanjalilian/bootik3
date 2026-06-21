"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";

export default function LoginForm() {
  const [phone, setPhone] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="relative flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="light-orb -top-20 right-1/4 h-72 w-72 bg-pink-300/20" />
      <div className="light-orb -bottom-20 left-1/4 h-72 w-72 bg-blue-300/20" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        <div className="gradient-card glow-pink overflow-hidden rounded-3xl border border-white/80 p-8 shadow-xl">
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
                  className="w-full rounded-2xl border border-pink-100 bg-white py-3.5 pr-12 pl-4 text-left outline-none transition-all focus:border-pink-300 focus:ring-4 focus:ring-pink-50"
                  dir="ltr"
                  required
                />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full">
              دریافت کد تأیید
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400">
            با ورود، شرایط و قوانین استفاده از سایت را می‌پذیرید
          </p>
        </div>
      </motion.div>
    </div>
  );
}
