import { NextResponse } from "next/server";
import { requestOtp } from "@/lib/auth/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phone = typeof body?.phone === "string" ? body.phone : "";
    console.info("[auth] incoming otp request", { phone });
    const result = await requestOtp(phone);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    console.error("[auth] otp request route error", error);
    return NextResponse.json({ ok: false, message: "درخواست نامعتبر است." }, { status: 400 });
  }
}
