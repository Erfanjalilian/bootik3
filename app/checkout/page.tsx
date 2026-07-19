import { Suspense } from "react";
import CheckoutContent from "@/components/checkout/CheckoutContent";

export const metadata = {
  title: "ادامه خرید",
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-gray-500">در حال بارگذاری...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}