// ============================================================================
// Shipping Cost Calculation API Route
// Calculates shipping cost based on destination city
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import {
  calculateShippingCost,
  isDestinationSari,
  SARI_COURIER_FIXED_PRICE,
  TapinApiError,
} from "@/lib/services/tapin";
import type { ShippingItem, ShippingLocation } from "@/lib/services/tapin";

/**
 * Request body for shipping calculation
 */
interface CalculateShippingRequest {
  city: string;
  province: string;
  items: ShippingItem[];
}

/**
 * Validate that a value is a positive number
 */
function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && value > 0 && isFinite(value);
}

/**
 * POST handler for shipping cost calculation
 *
 * Expects:
 * {
 *   city: string,
 *   province: string,
 *   items: Array<{ weight, length, width, height, quantity }>
 * }
 *
 * Returns:
 * - For Sari: { method: "courier", title: "...", shippingCost: fixed_price }
 * - For other cities: { method: "post", title: "...", shippingCost: amount }
 * - On error: { ok: false, message: string, canCheckout: boolean }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: CalculateShippingRequest = await request.json();
    const { city, province, items } = body;

    // Validate required fields
    if (!city || !city.trim()) {
      return NextResponse.json(
        {
          ok: false,
          message: "لطفاً شهر مقصد را وارد کنید",
          canCheckout: false,
        },
        { status: 400 }
      );
    }

    if (!province || !province.trim()) {
      return NextResponse.json(
        {
          ok: false,
          message: "لطفاً استان مقصد را وارد کنید",
          canCheckout: false,
        },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          message: "سبد خرید خالی است",
          canCheckout: false,
        },
        { status: 400 }
      );
    }

    // Validate that items have proper dimensions
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!isPositiveNumber(item.weight)) {
        console.warn(`Item ${i} has invalid or missing weight:`, item.weight);
      }
      if (!isPositiveNumber(item.length)) {
        console.warn(`Item ${i} has invalid or missing length:`, item.length);
      }
      if (!isPositiveNumber(item.width)) {
        console.warn(`Item ${i} has invalid or missing width:`, item.width);
      }
      if (!isPositiveNumber(item.height)) {
        console.warn(`Item ${i} has invalid or missing height:`, item.height);
      }
      if (!isPositiveNumber(item.quantity) || item.quantity < 1) {
        return NextResponse.json(
          {
            ok: false,
            message: "تعداد محصول نامعتبر است",
            canCheckout: false,
          },
          { status: 400 }
        );
      }
    }

    // Check if destination is Sari
    if (isDestinationSari(city)) {
      // Sari: courier delivery with fixed price
      return NextResponse.json({
        ok: true,
        method: "courier" as const,
        title: "ارسال با پیک",
        shippingCost: SARI_COURIER_FIXED_PRICE,
      });
    }

    // Non-Sari: use Tapin API to calculate express post cost
    const destination: ShippingLocation = { province, city };
    const shippingCost = await calculateShippingCost(destination, items);

    return NextResponse.json({
      ok: true,
      method: "post" as const,
      title: "پست پیشتاز",
      shippingCost,
    });
  } catch (error) {
    // Handle Tapin-specific errors
    if (error instanceof TapinApiError) {
      console.error("[shipping/calculate] Tapin error:", {
        message: error.message,
        statusCode: error.statusCode,
        persianMessage: error.getPersianMessage(),
      });

      return NextResponse.json(
        {
          ok: false,
          message: error.getPersianMessage(),
          canCheckout: false,
        },
        { status: error.statusCode }
      );
    }

    // Handle unexpected errors
    console.error("[shipping/calculate] Unexpected error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "خطا در محاسبه هزینه ارسال. لطفاً بعداً تلاش کنید.",
        canCheckout: false,
      },
      { status: 500 }
    );
  }
}