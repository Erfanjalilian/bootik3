"use client";

import { Heart, Target, Eye, Sparkles } from "lucide-react";
import type { SiteSettings } from "@/lib/types";

interface AboutContentProps {
  settings: SiteSettings;
}

export default function AboutContent({ settings }: AboutContentProps) {
  const { about } = settings;

  return (
    <div className="relative overflow-hidden">
      <div className="light-orb -top-20 left-1/3 h-96 w-96 bg-pink-300/15" />
      <div className="light-orb top-1/3 -right-20 h-80 w-80 bg-blue-300/15" />

      <section className="relative mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-pink-50 px-4 py-1.5 text-sm font-medium text-pink-600">
            <Sparkles className="h-4 w-4" />
            {about.subtitle}
          </span>
          <h1 className="mt-6 text-4xl font-bold gradient-text md:text-5xl">
            {about.title}
          </h1>
        </div>

        <div className="mx-auto mt-14 max-w-3xl text-center">
          <p className="text-lg leading-loose text-gray-600">{about.story}</p>
        </div>

        <div className="mt-20 grid gap-8 md:grid-cols-3">
          {about.stats.map((stat) => (
            <div
              key={stat.label}
              className="gradient-card rounded-3xl border border-pink-200/70 p-8 text-center"
            >
              <p className="text-4xl font-bold gradient-text">{stat.value}</p>
              <p className="mt-2 text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-50/50 to-blue-50/50" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 md:grid-cols-2 lg:px-8">
          <div className="gradient-card glow-pink rounded-3xl border border-pink-200/70 p-10">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 to-rose-400 text-white">
              <Target className="h-7 w-7" />
            </div>
            <h2 className="mb-4 text-2xl font-bold text-gray-800">ماموریت ما</h2>
            <p className="leading-relaxed text-gray-600">{about.mission}</p>
          </div>

          <div className="gradient-card glow-blue rounded-3xl border border-pink-200/70 p-10">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-500 text-white">
              <Eye className="h-7 w-7" />
            </div>
            <h2 className="mb-4 text-2xl font-bold text-gray-800">چشم‌انداز ما</h2>
            <p className="leading-relaxed text-gray-600">{about.vision}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <h2 className="mb-12 text-center text-3xl font-bold text-gray-800">
          ارزش‌های ما
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {about.values.map((value) => (
            <div
              key={value.title}
              className="rounded-3xl border border-pink-200/70 bg-pink-50/80 p-8 text-center backdrop-blur-sm"
            >
              <span className="text-4xl">{value.icon}</span>
              <h3 className="mt-4 text-lg font-semibold text-gray-800">
                {value.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-4xl px-4 text-center lg:px-8">
          <div className="gradient-primary relative overflow-hidden rounded-3xl px-8 py-16 shadow-2xl shadow-pink-200/40">
            <div className="absolute inset-0 shimmer opacity-20" />
            <Heart className="relative mx-auto mb-4 h-10 w-10 text-white" />
            <h2 className="relative text-2xl font-bold text-white md:text-3xl">
              با ما همراه باشید
            </h2>
            <p className="relative mx-auto mt-4 max-w-lg text-pink-100">
              هر خرید از رز مد، حمایت از یک کسب‌وکار ایرانی و تیم پرشور ماست.
              از اعتماد شما سپاسگزاریم.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
