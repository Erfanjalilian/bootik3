import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getUserOrders } from "@/lib/orders/store";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const orders = await getUserOrders(user.id);
    return NextResponse.json({ ok: true, orders });
  } catch (error) {
    console.error("[orders/user-orders] error", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}