import { Suspense } from "react";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

function SuccessContent({ searchParams }: { searchParams: { trackId?: string; refNumber?: string; status?: string } }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900">پرداخت با موفقیت انجام شد</h1>
        <p className="text-gray-600">سفارش شما با موفقیت ثبت شد و در حال پردازش است.</p>

        <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-right">
          {searchParams.trackId && (
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">شماره پیگیری:</span>
              <span className="font-medium text-gray-900" dir="ltr">
                {searchParams.trackId}
              </span>
            </div>
          )}
          {searchParams.refNumber && (
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">شماره مرجع:</span>
              <span className="font-medium text-gray-900" dir="ltr">
                {searchParams.refNumber}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            پیگیری سفارش
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ادامه خرید
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: { trackId?: string; refNumber?: string; status?: string };
}) {
  return (
    <Suspense fallback={<div className="py-16 text-center text-gray-500">در حال بارگذاری...</div>}>
      <SuccessContent searchParams={searchParams} />
    </Suspense>
  );
}