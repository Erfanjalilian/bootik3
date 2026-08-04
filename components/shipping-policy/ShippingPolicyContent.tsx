"use client";

import {
  Truck,
  PackageCheck,
  MapPin,
  ShieldCheck,
  Timer,
  Route,
  Scale,
  PackagePlus,
} from "lucide-react";

const shippingItems = [
  {
    icon: Truck,
    title: "ارسال با تیپاکس",
    description:
      "در حال حاضر ارسال سفارش‌ها از طریق شرکت حمل‌ونقل تیپاکس انجام می‌شود.",
    color: "from-pink-400 to-rose-400",
  },
  {
    icon: PackageCheck,
    title: "ارسال پس از تأیید پرداخت",
    description:
      "ارسال سفارش‌های یاردیم شاپ پس از ثبت نهایی سفارش و تأیید پرداخت انجام می‌شود.",
    color: "from-blue-400 to-blue-500",
  },
  {
    icon: Route,
    title: "اطلاعات رهگیری مرسوله",
    description:
      "پس از ارسال سفارش، اطلاعات رهگیری در صورت ارائه توسط شرکت حمل‌ونقل در اختیار مشتری قرار خواهد گرفت.",
    color: "from-emerald-400 to-teal-500",
  },
  {
    icon: Timer,
    title: "زمان تحویل متغیر",
    description:
      "زمان تحویل سفارش بسته به شهر مقصد و شرایط شرکت حمل‌ونقل متفاوت است.",
    color: "from-amber-400 to-orange-500",
  },
  {
    icon: Scale,
    title: "محاسبه هزینه ارسال",
    description:
      "هزینه ارسال بر اساس مقصد، وزن و شرایط سفارش محاسبه می‌شود.",
    color: "from-violet-400 to-purple-500",
  },
  {
    icon: PackagePlus,
    title: "روش‌های ارسال آینده",
    description:
      "در آینده ممکن است روش‌های ارسال دیگری مانند پست پیشتاز نیز به فروشگاه اضافه شود.",
    color: "from-cyan-400 to-sky-500",
  },
];

export default function ShippingPolicyContent() {
  return (
    <div className="relative overflow-hidden">
      <div className="light-orb -top-20 left-1/3 h-96 w-96 bg-pink-300/15" />
      <div className="light-orb top-1/3 -right-20 h-80 w-80 bg-blue-300/15" />

      <section className="relative mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-pink-50 px-4 py-1.5 text-sm font-medium text-pink-600">
            <Truck className="h-4 w-4" />
            ارسال سفارش
          </span>

          <h1 className="mt-6 text-3xl font-bold gradient-text md:text-5xl">
            شرایط و روش‌های ارسال
          </h1>

          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-gray-500">
            در فروشگاه یاردیم شاپ، سفارش‌ها پس از ثبت نهایی و تأیید پرداخت از
            طریق شرکت حمل‌ونقل تیپاکس ارسال می‌شوند. در ادامه با شرایط و
            روش‌های ارسال آشنا شوید.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-2">
          {shippingItems.map((item) => (
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
              <MapPin className="h-6 w-6" />
            </div>
            <h3 className="mb-3 text-lg font-semibold text-gray-800">
              پیگیری سفارش شما
            </h3>
            <p className="mx-auto max-w-2xl leading-relaxed text-gray-600">
              پس از ارسال سفارش، اطلاعات رهگیری مرسوله در صورت ارائه توسط شرکت
              حمل‌ونقل در اختیار شما قرار می‌گیرد تا بتوانید وضعیت سفارش خود را
              در هر مرحله پیگیری کنید.
            </p>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-5xl">
          <div className="gradient-card rounded-3xl border border-pink-200/70 p-8 text-center">
            <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="mb-3 text-lg font-semibold text-gray-800">
              ارسال مطمئن
            </h3>
            <p className="mx-auto max-w-2xl leading-relaxed text-gray-600">
              تمامی سفارش‌های فروشگاه یاردیم شاپ با دقت و اطمینان کافی بسته‌بندی
              شده و از طریق شرکت حمل‌ونقل معتبر به سراسر کشور ارسال می‌شوند.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}