import { NextResponse } from "next/server";
import { verifyOtp } from "@/lib/auth/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phone = typeof body?.phone === "string" ? body.phone : "";
    const otp = typeof body?.otp === "string" ? body.otp : "";
    console.info("[auth] incoming otp verify", { phone, otpLength: otp.length });
    const result = await verifyOtp(phone, otp);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    console.error("[auth] otp verify route error", error);
    return NextResponse.json({ ok: false, message: "درخواست نامعتبر است." }, { status: 400 });
  }
}
