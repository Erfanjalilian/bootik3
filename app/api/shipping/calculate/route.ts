// ============================================================================
// Shipping Cost Calculation API Route
// All shipments are done with تیباکس (postpaid/cash on delivery)
// No need to call Tapin API for shipping cost calculation
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
 * All shipments are done via تیباکس as postpaid (پس کرایه).
 * Shipping cost is always 0 (paid at delivery).
 * No Tapin API calls needed.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log("========== 🚚 SHIPPING CALCULATE (تیباکس - پس کرایه) ==========");
  
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

    // All shipments are done with تیباکس as postpaid (پس کرایه)
    // Shipping cost is 0 - customer pays at delivery
    console.log("✅ Shipping method: تیباکس (پس کرایه) - cost: 0");

    return NextResponse.json({
      ok: true,
      method: "post" as const,
      title: "ارسال با تیباکس",
      shippingCost: 0,
    });
  } catch (error) {
    console.error("[shipping/calculate] Unexpected error:", error);
    return NextResponse.json(
      { ok: false, message: "خطا در محاسبه هزینه ارسال. لطفاً بعداً تلاش کنید.", canCheckout: false },
      { status: 500 }
    );
  }
}
