import { getProducts, getBanners } from "@/lib/data";
import BannerSlider from "@/components/home/BannerSlider";
import AdBanners from "@/components/home/AdBanners";
import ProductSection from "@/components/home/ProductSection";
import Button from "@/components/ui/Button";
import { Sparkles, Truck, Shield, Headphones } from "lucide-react";

export default function Home() {
  const products = getProducts();
  const banners = getBanners();
  const heroBanners = banners.filter((b) => b.type === "hero");
  const adBanners = banners.filter((b) => b.type === "ad");

  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4);
  const newest = products.filter((p) => p.isNew).slice(0, 4);
  const onSale = products.filter((p) => p.isOnSale).slice(0, 4);

  const features = [
    {
      icon: Truck,
      title: "ارسال سریع",
      desc: "ارسال رایگان برای سفارش‌های بالای ۵۰۰ هزار تومان",
    },
    {
      icon: Shield,
      title: "ضمانت اصالت",
      desc: "تمامی محصولات با گارانتی اصالت کالا",
    },
    {
      icon: Headphones,
      title: "پشتیبانی ۲۴/۷",
      desc: "پاسخگویی در تمام ساعات شبانه‌روز",
    },
    {
      icon: Sparkles,
      title: "کیفیت برتر",
      desc: "انتخاب بهترین برندها و مواد اولیه",
    },
  ];

  return (
    <>
      <BannerSlider banners={heroBanners} />

      <AdBanners banners={adBanners} />

      <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="gradient-card rounded-3xl border border-white/80 p-5 text-center"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-100 to-blue-100">
                <feature.icon className="h-6 w-6 text-pink-500" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800">
                {feature.title}
              </h3>
              <p className="mt-1 text-xs text-gray-500">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <ProductSection
        title="پرفروش‌ترین‌ها"
        subtitle="محبوب‌ترین محصولات میان مشتریان ما"
        products={bestSellers}
        viewAllHref="/shop?bestSeller=true"
        accent="pink"
      />

      <div className="relative overflow-hidden py-4">
        <div className="light-orb top-0 left-1/4 h-40 w-40 bg-pink-200/30" />
        <div className="mx-auto max-w-7xl px-4 text-center lg:px-8">
          <div className="gradient-primary relative overflow-hidden rounded-3xl px-8 py-12 shadow-2xl shadow-pink-200/40">
            <div className="absolute inset-0 shimmer opacity-30" />
            <h2 className="relative text-2xl font-bold text-white md:text-3xl">
              تخفیف ویژه آخر هفته
            </h2>
            <p className="relative mt-2 text-pink-100">
              تا ۴۰٪ تخفیف روی محصولات منتخب — فقط تا پایان هفته
            </p>
            <Button
              href="/shop?onSale=true"
              variant="secondary"
              className="relative mt-6 bg-white text-pink-600 hover:bg-pink-50"
            >
              مشاهده تخفیف‌ها
            </Button>
          </div>
        </div>
      </div>

      <ProductSection
        title="جدیدترین محصولات"
        subtitle="تازه‌ترین استایل‌ها و مدل‌های فصل"
        products={newest}
        viewAllHref="/shop?isNew=true"
        accent="blue"
      />

      <ProductSection
        title="تخفیف‌های ویژه"
        subtitle="فرصت‌های طلایی برای خرید با قیمت استثنایی"
        products={onSale}
        viewAllHref="/shop?onSale=true"
        accent="pink"
      />
    </>
  );
}
