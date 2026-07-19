import { NextResponse } from "next/server";
import { loginWithPassword } from "@/lib/auth/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = typeof body?.username === "string" ? body.username.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    console.info("[auth] incoming password login", { username });
    const result = await loginWithPassword(username, password);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    console.error("[auth] password login route error", error);
    return NextResponse.json({ ok: false, message: "درخواست نامعتبر است." }, { status: 400 });
  }
}