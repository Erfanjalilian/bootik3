"use client";

import {
  CreditCard,
  ShieldCheck,
  PackageCheck,
  Headset,
  BadgePercent,
  Lock,
} from "lucide-react";

const policyItems = [
  {
    icon: CreditCard,
    title: "پرداخت آنلاین و امن",
    description:
      "کاربران می‌توانند هزینه سفارش‌های خود را به صورت آنلاین و از طریق درگاه پرداخت بانکی امن انجام دهند.",
    color: "from-pink-400 to-rose-400",
  },
  {
    icon: PackageCheck,
    title: "ثبت سفارش پس از پرداخت",
    description:
      "پس از تکمیل موفقیت‌آمیز پرداخت، سفارش ثبت شده و فرآیند آماده‌سازی کالا آغاز می‌شود.",
    color: "from-blue-400 to-blue-500",
  },
  {
    icon: Lock,
    title: "محرمانگی اطلاعات بانکی",
    description:
      "اطلاعات محرمانه کارت بانکی کاربران مانند شماره کارت و رمز بانکی توسط درگاه پرداخت بانکی پردازش می‌شود و فروشگاه یاردیم شاپ به این اطلاعات دسترسی ندارد.",
    color: "from-emerald-400 to-teal-500",
  },
  {
    icon: Headset,
    title: "پشتیبانی در صورت بروز مشکل",
    description:
      "در صورت بروز مشکل در پرداخت یا ثبت سفارش، کاربران می‌توانند از طریق راه‌های ارتباطی فروشگاه با پشتیبانی تماس بگیرند.",
    color: "from-amber-400 to-orange-500",
  },
  {
    icon: BadgePercent,
    title: "قیمت ملاک محاسبه",
    description:
      "قیمت کالاها در زمان ثبت سفارش ملاک محاسبه نهایی خواهد بود.",
    color: "from-violet-400 to-purple-500",
  },
];

export default function PaymentPolicyContent() {
  return (
    <div className="relative overflow-hidden">
      <div className="light-orb -top-20 left-1/3 h-96 w-96 bg-pink-300/15" />
      <div className="light-orb top-1/3 -right-20 h-80 w-80 bg-blue-300/15" />

      <section className="relative mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-pink-50 px-4 py-1.5 text-sm font-medium text-pink-600">
            <ShieldCheck className="h-4 w-4" />
            پرداخت امن
          </span>

          <h1 className="mt-6 text-3xl font-bold gradient-text md:text-5xl">
            شرایط و روش‌های پرداخت
          </h1>

          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-gray-500">
            در فروشگاه یاردیم شاپ، پرداخت سفارش‌ها به صورت آنلاین و از طریق
            درگاه پرداخت بانکی امن انجام می‌شود. در ادامه با شرایط و روش‌های
            پرداخت آشنا شوید.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-2">
          {policyItems.map((item) => (
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
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="mb-3 text-lg font-semibold text-gray-800">
              پرداخت با خیال راحت
            </h3>
            <p className="mx-auto max-w-2xl leading-relaxed text-gray-600">
              تمامی پرداخت‌های فروشگاه یاردیم شاپ از طریق درگاه‌های پرداخت
              بانکی معتبر و امن انجام می‌شود و اطلاعات بانکی شما به هیچ‌وجه در
              اختیار فروشگاه قرار نمی‌گیرد.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}