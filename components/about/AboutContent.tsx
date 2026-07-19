
"use client";

import { Heart, Sparkles } from "lucide-react";
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
          <p className="text-lg leading-loose text-gray-600">
            {about.story}
          </p>
        </div>

        <div className="mt-20 grid gap-8 md:grid-cols-3">
          {about.stats.map((stat) => (
            <div
              key={stat.label}
              className="gradient-card rounded-3xl border border-pink-200/70 p-8 text-center"
            >
              <p className="text-4xl font-bold gradient-text">
                {stat.value}
              </p>

              <p className="mt-2 text-sm text-gray-500">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

