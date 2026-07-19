import { Suspense } from "react";
import { XCircle } from "lucide-react";
import Link from "next/link";

function FailureContent({ searchParams }: { searchParams: { reason?: string; trackId?: string; message?: string } }) {
  const errorMessage = searchParams.message || getErrorMessage(searchParams.reason);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900">پرداخت ناموفق</h1>
        <p className="text-gray-600">{errorMessage}</p>

        {searchParams.trackId && (
          <div className="bg-gray-50 rounded-lg p-4 text-right">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">شماره پیگیری:</span>
              <span className="font-medium text-gray-900" dir="ltr">
                {searchParams.trackId}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/cart"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            تلاش مجدد
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            بازگشت به فروشگاه
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Map error reason codes to Persian user-friendly messages
 */
function getErrorMessage(reason?: string): string {
  switch (reason) {
    case "payment_cancelled":
      return "پرداخت توسط شما لغو شد.";
    case "missing_track_id":
      return "شماره پیگیری دریافت نشد.";
    case "invalid_track_id":
      return "شماره پیگیری نامعتبر است.";
    case "verify_error_102":
      return "شناسه مرچنت یافت نشد.";
    case "verify_error_103":
      return "شناسه مرچنت غیرفعال است.";
    case "verify_error_104":
      return "شناسه مرچنت معتبر نیست.";
    case "verify_error_105":
      return "مبلغ باید بزرگتر از 1,000 ریال باشد.";
    case "verify_error_106":
      return "آدرس Callback معتبر نیست.";
    case "verify_error_113":
      return "مبلغ پرداخت با مبلغ درخواست مطابقت ندارد.";
    case "verify_error_201":
    case "verify_error_202":
      return "پرداخت ناموفق بود.";
    case "unexpected_error":
      return "خطای غیرمنتظره‌ای رخ داد. لطفاً دوباره تلاش کنید.";
    default:
      return "پرداخت با خطا مواجه شد. لطفاً دوباره تلاش کنید.";
  }
}

export default function PaymentFailurePage({
  searchParams,
}: {
  searchParams: { reason?: string; trackId?: string; message?: string };
}) {
  return (
    <Suspense fallback={<div className="py-16 text-center text-gray-500">در حال بارگذاری...</div>}>
      <FailureContent searchParams={searchParams} />
    </Suspense>
  );
}