import { Suspense } from "react";
import OtpVerifyForm from "@/components/auth/OtpVerifyForm";

export const metadata = {
  title: "تأیید کد",
};

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-gray-500">در حال آماده‌سازی...</div>}>
      <OtpVerifyForm />
    </Suspense>
  );
}
