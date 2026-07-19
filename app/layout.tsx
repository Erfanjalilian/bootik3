import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/lib/auth/auth-context";
import { getSettings } from "@/lib/data";
import "./globals.css";

const settings = getSettings();

export const metadata: Metadata = {
  title: {
    default: settings.siteName,
    template: `%s | ${settings.siteName}`,
  },
  description: settings.tagline,
  other: {
    enamad: "69798633",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-[sans-serif]">
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
