import { NextResponse } from "next/server";
import { registerWithPassword } from "@/lib/auth/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = typeof body?.username === "string" ? body.username.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    console.info("[auth] incoming register", { username });
    const result = await registerWithPassword(username, password);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    console.error("[auth] register route error", error);
    return NextResponse.json({ ok: false, message: "درخواست نامعتبر است." }, { status: 400 });
  }
}