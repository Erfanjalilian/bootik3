import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = {
  title: "ورود / ثبت‌نام",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-gray-500">در حال آماده‌سازی...</div>}>
      <LoginForm />
    </Suspense>
  );
}
