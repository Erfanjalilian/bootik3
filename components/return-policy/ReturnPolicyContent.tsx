"use client";

import {
  PackageCheck,
  ShieldCheck,
  PackagePlus,
  RotateCcw,
  Timer,
  Scale,
  Headset,
  Undo2,
} from "lucide-react";

const returnItems = [
  {
    icon: PackageCheck,
    title: "بررسی سلامت کالا پس از دریافت",
    description:
      "مشتریان پس از دریافت کالا می‌توانند محصول را از نظر سلامت ظاهری و تطابق با سفارش بررسی کنند.",
    color: "from-pink-400 to-rose-400",
  },
  {
    icon: Headset,
    title: "اطلاع‌رسانی سریع به پشتیبانی",
    description:
      "در صورت وجود مشکل فنی، آسیب‌دیدگی هنگام ارسال یا مغایرت کالا با سفارش ثبت شده، موضوع باید در سریع‌ترین زمان ممکن به پشتیبانی اطلاع داده شود.",
    color: "from-blue-400 to-blue-500",
  },
  {
    icon: PackagePlus,
    title: "بازگرداندن در شرایط اولیه",
    description:
      "کالا باید در شرایط اولیه، همراه با بسته‌بندی و متعلقات اصلی بازگردانده شود.",
    color: "from-emerald-400 to-teal-500",
  },
  {
    icon: ShieldCheck,
    title: "عدم پذیرش مرجوعی کالای آسیب‌دیده",
    description:
      "استفاده، آسیب‌دیدگی یا تغییر در وضعیت اصلی کالا ممکن است باعث عدم پذیرش مرجوعی شود.",
    color: "from-amber-400 to-orange-500",
  },
  {
    icon: Timer,
    title: "بررسی پس از دریافت کالا",
    description:
      "بررسی درخواست‌های مرجوعی پس از دریافت کالا توسط فروشگاه انجام خواهد شد.",
    color: "from-violet-400 to-purple-500",
  },
  {
    icon: Scale,
    title: "هزینه و شرایط بازگشت",
    description:
      "هزینه و شرایط بازگشت کالا بر اساس نوع مشکل و قوانین فروشگاه بررسی می‌شود.",
    color: "from-cyan-400 to-sky-500",
  },
];

export default function ReturnPolicyContent() {
  return (
    <div className="relative overflow-hidden">
      <div className="light-orb -top-20 left-1/3 h-96 w-96 bg-pink-300/15" />
      <div className="light-orb top-1/3 -right-20 h-80 w-80 bg-blue-300/15" />

      <section className="relative mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-pink-50 px-4 py-1.5 text-sm font-medium text-pink-600">
            <RotateCcw className="h-4 w-4" />
            تست و مرجوعی کالا
          </span>

          <h1 className="mt-6 text-3xl font-bold gradient-text md:text-5xl">
            شرایط تست و مرجوعی کالا
          </h1>

          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-gray-500">
            یاردیم شاپ تلاش می‌کند محصولات را با توضیحات کامل و کیفیت مناسب در
            اختیار مشتریان قرار دهد.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-2">
          {returnItems.map((item) => (
            <div
              key={item.title}
              className="gradient-card rounded-3xl border border-pink-200/70 p-8"
            >
              <div
                className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-lg`}
              >
                <item.icon className="h-6 w-6" />
              </div>

              <h3 className="mb-3 text-lg font-semibold text-gray-800">
                {item.title}
              </h3>

              <p className="leading-relaxed text-gray-600">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-14 max-w-5xl">
          <div className="gradient-card rounded-3xl border border-pink-200/70 p-8 text-center">
            <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 to-blue-400 text-white shadow-lg">
              <Undo2 className="h-6 w-6" />
            </div>
            <h3 className="mb-3 text-lg font-semibold text-gray-800">
              بازگشت کالا با خیال راحت
            </h3>
            <p className="mx-auto max-w-2xl leading-relaxed text-gray-600">
              فروشگاه یاردیم شاپ در فرآیند بررسی و مرجوعی کالا، رعایت حقوق
              مشتریان و پاسخ‌گویی سریع به درخواست‌های آن‌ها را در اولویت قرار
              می‌دهد.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}