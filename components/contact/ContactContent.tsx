"use client";

import { Phone, MapPin, Mail, Clock } from "lucide-react";
import type { SiteSettings } from "@/lib/types";

interface ContactContentProps {
  settings: SiteSettings;
}

export default function ContactContent({ settings }: ContactContentProps) {
  const contactItems = [
    {
      icon: Phone,
      title: "موبایل",
      value: settings.phone,
      color: "from-pink-400 to-rose-400",
    },
    {
      icon: Phone,
      title: "تلفن ثابت",
      value: settings.landline,
      color: "from-blue-400 to-blue-500",
    },
    {
      icon: MapPin,
      title: "آدرس دفتر",
      value: settings.address,
      color: "from-purple-400 to-pink-400",
    },
    {
      icon: Mail,
      title: "ایمیل",
      value: settings.email,
      color: "from-pink-300 to-blue-300",
    },
    {
      icon: Clock,
      title: "ساعات کاری",
      value: "شنبه تا پنج‌شنبه — ۹ صبح تا ۹ شب",
      color: "from-blue-300 to-indigo-400",
    },
  ];

  return (
    <div className="relative overflow-hidden">
      <div className="light-orb -top-32 right-0 h-80 w-80 bg-pink-300/20" />
      <div className="light-orb top-1/2 -left-32 h-80 w-80 bg-blue-300/20" />

      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="mb-14 text-center">
          <h1 className="text-3xl font-bold gradient-text md:text-4xl">
            تماس با ما
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-gray-500">
            ما همیشه آماده پاسخگویی به سوالات شما هستیم. از راه‌های زیر با ما
            در ارتباط باشید.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {contactItems.map((item) => (
            <div
              key={item.title}
              className="gradient-card rounded-3xl border border-white/80 p-8"
            >
              <div
                className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-lg`}
              >
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-800">
                {item.title}
              </h3>
              <p className="leading-relaxed text-gray-600">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 overflow-hidden rounded-3xl shadow-2xl shadow-pink-200/30">
          <div className="gradient-primary relative flex h-64 items-center justify-center md:h-80">
            <div className="absolute inset-0 shimmer opacity-20" />
            <div className="relative text-center text-white">
              <MapPin className="mx-auto mb-4 h-12 w-12 opacity-80" />
              <p className="text-lg font-semibold md:text-xl">{settings.address}</p>
              <p className="mt-2 text-pink-100">به زودی نقشه اینجا قرار می‌گیرد</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
