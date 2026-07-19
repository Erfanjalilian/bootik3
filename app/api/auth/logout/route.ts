import { NextResponse } from "next/server";
import { logoutSession } from "@/lib/auth/service";

export async function POST() {
  try {
    await logoutSession();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[auth] logout route error", error);
    return NextResponse.json({ ok: false, message: "خطا در خروج از حساب" }, { status: 500 });
  }
}