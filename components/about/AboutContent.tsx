
"use client";

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
          {about.enabled.title && <h1 className="text-4xl font-bold gradient-text md:text-5xl">{about.title}</h1>}
        </div>

        {about.enabled.story && <div className="mx-auto mt-14 max-w-3xl text-center">
          <p className="text-lg leading-loose text-gray-600">
            همه‌چیز از بهمن ۱۴۰۳ شروع شد؛ با عشق، ذوق و یه عالمه ترس. شروع کردم و قدم‌به‌قدم یاد گرفتم، تجربه کردم و بزرگ‌ترش کردم. شاید مسیر همیشه آسون نبود، ولی هر سفارشی که ثبت شد و هر اعتمادی که بهم کردید، باعث شد ادامه بدم🧚🏼‍♀️️ ممنونم که کنارمونید و بخشی از این مسیر قشنگ هستید🫂🤍
          </p>
        </div>}

        {(about.enabled.mission || about.enabled.vision) && <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2">
          {about.enabled.mission && <div className="rounded-2xl bg-white/70 p-6 text-center"><h2 className="font-bold text-gray-800">ماموریت ما</h2><p className="mt-3 leading-loose text-gray-600">{about.mission}</p></div>}
          {about.enabled.vision && <div className="rounded-2xl bg-white/70 p-6 text-center"><h2 className="font-bold text-gray-800">چشم‌انداز ما</h2><p className="mt-3 leading-loose text-gray-600">{about.vision}</p></div>}
        </div>}

        {about.enabled.values && <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {about.values.map((value) => <div key={value.title} className="rounded-2xl bg-white/70 p-6 text-center">
            <div className="text-3xl">{value.icon}</div>
            <h2 className="mt-3 font-bold text-gray-800">{value.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{value.description}</p>
          </div>)}
        </div>}

      </section>
    </div>
  );
}

