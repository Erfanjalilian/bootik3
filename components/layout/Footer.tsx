import Link from "next/link";
import { Camera, Send, MessageCircle, MapPin, Phone } from "lucide-react";
import { getSettings } from "@/lib/data";

export default function Footer() {
  const settings = getSettings();

  return (
    <footer className="relative mt-auto overflow-hidden">
      <div className="light-orb -top-20 right-0 h-60 w-60 bg-pink-300/30" />
      <div className="light-orb -bottom-20 left-0 h-60 w-60 bg-blue-300/30" />

      <div className="relative border-t border-white/60 bg-gradient-to-b from-white/80 to-pink-50/80 backdrop-blur-sm">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
          <div>
            <h3 className="mb-4 text-lg font-bold gradient-text">
              {settings.siteName}
            </h3>
            <p className="text-sm leading-relaxed text-gray-500">
              {settings.tagline}. ما بهترین پوشاک با کیفیت و قیمت مناسب را برای
              شما فراهم می‌کنیم.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-gray-800">دسترسی سریع</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link href="/shop" className="hover:text-pink-500">
                  فروشگاه
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-pink-500">
                  درباره ما
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-pink-500">
                  تماس با ما
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-pink-500">
                  ورود / ثبت‌نام
                </Link>
              </li>
            </ul>
          </div>

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

          <div>
            <h4 className="mb-4 font-semibold text-gray-800">شبکه‌های اجتماعی</h4>
            <div className="flex gap-3">
              <a
                href={settings.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 text-white shadow-lg"
                aria-label="اینستاگرام"
              >
                <Camera className="h-5 w-5" />
              </a>
              <a
                href={settings.social.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 text-white shadow-lg"
                aria-label="تلگرام"
              >
                <Send className="h-5 w-5" />
              </a>
              <a
                href={settings.social.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-green-500 text-white shadow-lg"
                aria-label="واتساپ"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/60 py-6 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} {settings.siteName}. تمامی حقوق محفوظ است.
        </div>
      </div>
    </footer>
  );
}
