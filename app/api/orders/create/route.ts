import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { createOrder, updateOrderTrackId } from "@/lib/orders/store";
import { requestPayment, ZibalApiError } from "@/lib/services/zibal";
import type { ShippingAddress, OrderItem } from "@/lib/orders/types";

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, message: "لطفا ابتدا وارد حساب خود شوید" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { items, totalAmount, shippingAddress } = body as {
      items: OrderItem[];
      totalAmount: number;
      shippingAddress: ShippingAddress;
    };

    // Validate required fields
    if (!items || items.length === 0) {
      return NextResponse.json(
        { ok: false, message: "سبد خرید خالی است" },
        { status: 400 }
      );
    }

    if (!shippingAddress) {
      return NextResponse.json(
        { ok: false, message: "لطفا اطلاعات ارسال را وارد کنید" },
        { status: 400 }
      );
    }

    // Validate shipping address fields
    const requiredFields: (keyof ShippingAddress)[] = [
      "firstName", "lastName", "phone", "province", "city", "address", "postalCode"
    ];
    for (const field of requiredFields) {
      if (!shippingAddress[field]?.trim()) {
        const labels: Record<string, string> = {
          firstName: "نام",
          lastName: "نام خانوادگی",
          phone: "شماره تماس",
          province: "استان",
          city: "شهر",
          address: "آدرس",
          postalCode: "کد پستی",
        };
        return NextResponse.json(
          { ok: false, message: `لطفا "${labels[field]}" را وارد کنید` },
          { status: 400 }
        );
      }
    }

    // Create order in database
    const order = await createOrder({
      userId: user.id,
      items,
      totalAmount,
      shippingAddress,
    });

    // Request payment from Zibal
    try {
      const { trackId, gatewayUrl } = await requestPayment(
        totalAmount,
        order.id,
        {
          description: `سفارش ${order.id.slice(0, 8)}`,
          mobile: user.phone || shippingAddress.phone,
        }
      );

      // Save trackId to order
      await updateOrderTrackId(order.id, trackId);

      return NextResponse.json({
        ok: true,
        orderId: order.id,
        trackId,
        gatewayUrl,
      });
    } catch (paymentError) {
      // If payment request fails, return error but order is already created
      if (paymentError instanceof ZibalApiError) {
        return NextResponse.json(
          { ok: false, message: paymentError.getPersianMessage() },
          { status: 502 }
        );
      }
      throw paymentError;
    }
  } catch (error) {
    console.error("[orders/create] error:", error);
    return NextResponse.json(
      { ok: false, message: "خطا در ارتباط با سرور" },
      { status: 500 }
    );
  }
}