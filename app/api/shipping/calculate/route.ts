// ============================================================================
// Shipping Cost Calculation API Route
// Postal shipping has a fixed fee and does not require an external API.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";

/**
 * Request body for shipping calculation
 */
interface CalculateShippingRequest {
  city: string;
  province: string;
  products: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    weight: number;
    discount?: number;
  }[];
  address?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  postalCode?: string;
}

/**
 * POST handler for shipping cost calculation
 *
 * Postal shipping uses a fixed fee of 160,000 tomans.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log("========== 🚚 SHIPPING CALCULATE (پست) ==========");
  
  try {
    const body: CalculateShippingRequest = await request.json();
    const { city, province, products } = body;

    console.log("📥 Request body received:", {
      city,
      province,
      productsCount: products?.length || 0,
    });

    // Validate required fields
    if (!city || !city.trim()) {
      return NextResponse.json(
        { ok: false, message: "لطفاً شهر مقصد را وارد کنید", canCheckout: false },
        { status: 400 }
      );
    }

    if (!province || !province.trim()) {
      return NextResponse.json(
        { ok: false, message: "لطفاً استان مقصد را وارد کنید", canCheckout: false },
        { status: 400 }
      );
    }

    if (!products || products.length === 0) {
      return NextResponse.json(
        { ok: false, message: "سبد خرید خالی است", canCheckout: false },
        { status: 400 }
      );
    }

    const shippingCost = 160000;
    console.log(`✅ Shipping method: پست - cost: ${shippingCost}`);

    return NextResponse.json({
      ok: true,
      method: "post" as const,
      title: "ارسال با پست",
      shippingCost,
    });
  } catch (error) {
    console.error("[shipping/calculate] Unexpected error:", error);
    return NextResponse.json(
      { ok: false, message: "خطا در محاسبه هزینه ارسال. لطفاً بعداً تلاش کنید.", canCheckout: false },
      { status: 500 }
    );
  }
}
