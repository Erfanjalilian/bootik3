"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBag,
  User,
  Menu,
  X,
  Sparkles,
  Phone,
} from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/lib/store/cart-store";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "خانه" },
  { href: "/shop", label: "فروشگاه" },
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس با ما" },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems());

  return (
    <header className="sticky top-0 z-50">
      <div className="glass border-b border-white/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
          <Link href="/" className="group flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-pink-200/50">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold gradient-text">رز مد</span>
              <p className="text-[10px] text-gray-400">زیبایی در هر لباس</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-xl px-4 py-2 text-sm font-medium",
                  pathname === link.href
                    ? "bg-pink-50 text-pink-600"
                    : "text-gray-600 hover:text-pink-500"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden rounded-xl p-2.5 text-gray-600 hover:bg-pink-50 hover:text-pink-600 sm:flex"
              aria-label="ورود"
            >
              <User className="h-5 w-5" />
            </Link>
            <Link
              href="/cart"
              className="relative rounded-xl p-2.5 text-gray-600 hover:bg-pink-50 hover:text-pink-600"
              aria-label="سبد خرید"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full gradient-primary text-[10px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-xl p-2.5 text-gray-600 hover:bg-pink-50 md:hidden"
              aria-label="منو"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="glass border-b border-white/50 md:hidden">
          <nav className="flex flex-col gap-1 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-xl px-4 py-3 text-sm font-medium",
                  pathname === link.href
                    ? "bg-pink-50 text-pink-600"
                    : "text-gray-600 hover:bg-pink-50"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 hover:bg-pink-50"
            >
              <Phone className="h-4 w-4" />
              ورود / ثبت‌نام
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
