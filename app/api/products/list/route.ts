// ============================================================================
// Products List API Route
// Returns product details by IDs (used for shipping dimension lookup)
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/data";

/**
 * Request body for product lookup
 */
interface ProductsListRequest {
  ids: string[];
}

/**
 * Product data with dimensions (minimal for shipping calculation)
 */
interface ProductWithDimensions {
  id: string;
  weight: number | null;
  length: number | null;
  width: number | null;
  height: number | null;
}

/**
 * POST handler for fetching product dimensions by IDs
 *
 * Expects: { ids: ["product-id-1", "product-id-2"] }
 * Returns: { ok: true, products: [...] }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: ProductsListRequest = await request.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { ok: false, message: "لیست محصولات خالی است" },
        { status: 400 }
      );
    }

    if (ids.length > 50) {
      return NextResponse.json(
        { ok: false, message: "تعداد محصولات بیش از حد مجاز است" },
        { status: 400 }
      );
    }

    const allProducts = getProducts();
    const products: ProductWithDimensions[] = [];

    for (const id of ids) {
      const product = allProducts.find((p) => p.id === id);
      if (product) {
        products.push({
          id: product.id,
          weight: product.weight ?? null,
          length: product.length ?? null,
          width: product.width ?? null,
          height: product.height ?? null,
        });
      }
    }

    return NextResponse.json({
      ok: true,
      products,
    });
  } catch (error) {
    console.error("[products/list] error:", error);
    return NextResponse.json(
      { ok: false, message: "خطا در دریافت اطلاعات محصولات" },
      { status: 500 }
    );
  }
}