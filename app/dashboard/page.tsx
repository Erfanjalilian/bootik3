import Link from "next/link";
import { getAuthenticatedUser } from "@/lib/auth/service";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center justify-center px-6 py-16 text-center">
      <div className="rounded-3xl border border-pink-200/70 bg-white/70 p-10 shadow-xl backdrop-blur">
        <h1 className="text-3xl font-bold text-gray-900">خوش آمدید</h1>
        <p className="mt-3 text-lg text-gray-600">
          ورود شما با موفقیت انجام شد. شماره موبایل: {user.phone}
        </p>
        <Link href="/" className="mt-8 inline-flex rounded-2xl bg-pink-600 px-6 py-3 text-white shadow-lg">
          بازگشت به فروشگاه
        </Link>
      </div>
    </div>
  );
}
