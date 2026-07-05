import Link from "next/link";
import { Camera, Send, MessageCircle, MapPin, Phone } from "lucide-react";
import { getSettings } from "@/lib/data";

export default function Footer() {
  const settings = getSettings();

  return (
    <footer className="relative mt-auto overflow-hidden">
      <div className="light-orb -top-20 right-0 h-60 w-60 bg-pink-300/30" />
      <div className="light-orb -bottom-20 left-0 h-60 w-60 bg-blue-300/30" />

      <div className="relative border-t border-pink-200/60 bg-gradient-to-b from-pink-100/90 to-pink-200/70 backdrop-blur-sm">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {/* معرفی سایت */}
          <div>
            <h3 className="mb-4 text-lg font-bold gradient-text">
              {settings.siteName}
            </h3>
            <p className="text-sm leading-relaxed text-gray-500">
              {settings.tagline}. ما بهترین پوشاک با کیفیت و قیمت مناسب را برای
              شما فراهم می‌کنیم.
            </p>
          </div>

          {/* دسترسی سریع */}
          <div>
            <h4 className="mb-4 font-semibold text-gray-800">دسترسی سریع</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link href="/shop" className="hover:text-pink-500 transition-colors">
                  فروشگاه
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-pink-500 transition-colors">
                  درباره ما
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-pink-500 transition-colors">
                  تماس با ما
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-pink-500 transition-colors">
                  ورود / ثبت‌نام
                </Link>
              </li>
            </ul>
          </div>

          {/* اطلاعات تماس */}
          <div>
            <h4 className="mb-4 font-semibold text-gray-800">تماس با ما</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-pink-400" />
                {settings.phone}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-400" />
                {settings.landline}
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-pink-400" />
                {settings.address}
              </li>
            </ul>
          </div>

          {/* شبکه‌های اجتماعی و اینماد */}
          <div>
            <h4 className="mb-4 font-semibold text-gray-800">
              شبکه‌های اجتماعی
            </h4>

            <div className="flex justify-center gap-3 lg:justify-start">
              <a
                href={settings.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 text-white shadow-lg transition-transform hover:scale-105"
                aria-label="اینستاگرام"
              >
                <Camera className="h-5 w-5" />
              </a>

              <a
                href={settings.social.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 text-white shadow-lg transition-transform hover:scale-105"
                aria-label="تلگرام"
              >
                <Send className="h-5 w-5" />
              </a>

              <a
                href={settings.social.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-green-500 text-white shadow-lg transition-transform hover:scale-105"
                aria-label="واتساپ"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>

            {/* لوگوی اینماد */}
            <div className="mt-6 flex justify-center lg:justify-start">
              <a
                referrerPolicy="origin"
                target="_blank"
                rel="noopener noreferrer"
                href="https://trustseal.enamad.ir/?id=753509&Code=649a8VzsmbLK1aSI6N5cP8Yyc4NVw8Un"
                className="rounded-xl bg-white p-2 shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                <img
                  referrerPolicy="origin"
                  src="https://trustseal.enamad.ir/logo.aspx?id=753509&Code=649a8VzsmbLK1aSI6N5cP8Yyc4NVw8Un"
                  alt="نماد اعتماد الکترونیکی"
                  className="h-24 w-auto object-contain"
                />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-pink-200/60 py-6 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} {settings.siteName}. تمامی حقوق محفوظ
          است.
        </div>
      </div>
    </footer>
  );
}