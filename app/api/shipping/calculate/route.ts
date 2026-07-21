// ============================================================================
// Shipping Cost Calculation API Route
// Calculates shipping cost based on destination city using Tapin API
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import {
  TapinApiError,
  calculateShippingCost,
  getTapinShopId,
} from "@/lib/services/tapin";
import {
  getProvinces,
  getCities,
} from "@/lib/services/tapin.service";
import {
  setCachedProvinceMap,
  setCachedCityMap,
  lookupProvinceCode,
  lookupCityCode,
} from "@/lib/utils/tapin.mapper";
import { mapProductsToTapin, mapCheckPriceRequest } from "@/lib/utils/tapin.mapper";
import type { ProvinceMapping, CityMapping, TapinProvince } from "@/lib/types/tapin.types";

/**
 * Request body for shipping calculation
 */
interface CalculateShippingRequest {
  city: string;
  province: string;
  /** Array of products from the cart */
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
 * Ensure province/city codes are cached by fetching from Tapin if needed
 */
async function ensureCodesCached(provinceName: string, cityName: string): Promise<{
  provinceCode: string;
  cityCode: string;
}> {
  // Try to look up codes from cache first
  let provinceCode = lookupProvinceCode(provinceName);
  
  if (!provinceCode) {
    // Not cached, fetch provinces from Tapin
    console.log("Province cache empty, fetching from Tapin API...");
    const provinces = await getProvinces();

    // Build province mapping and cache it
    const provinceMap: ProvinceMapping = {};
    for (const province of provinces) {
      provinceMap[province.state_name] = province.state_code;
    }
    setCachedProvinceMap(provinceMap);

    // Also cache cities for each province
    for (const province of provinces) {
      const cityMap: CityMapping = {};
      for (const city of province.cities) {
        cityMap[city.city_name] = city.city_code;
      }
      setCachedCityMap(province.state_code, cityMap);
    }

    // Try lookup again
    provinceCode = lookupProvinceCode(provinceName);
  }

  if (!provinceCode) {
    throw new TapinApiError(
      `استان "${provinceName}" در سرویس تاپین یافت نشد`,
      404,
      null,
      `Province not found: ${provinceName}`,
      null
    );
  }

  // Look up city code
  let cityCode = lookupCityCode(provinceCode, cityName);

  if (!cityCode) {
    // Cities not cached for this province, fetch them
    console.log(`City cache empty for province ${provinceCode}, fetching from Tapin...`);
    const cities = await getCities(provinceCode);

    const cityMap: CityMapping = {};
    for (const city of cities) {
      cityMap[city.city_name] = city.city_code;
    }
    setCachedCityMap(provinceCode, cityMap);

    // Try lookup again
    cityCode = lookupCityCode(provinceCode, cityName);
  }

  if (!cityCode) {
    throw new TapinApiError(
      `شهر "${cityName}" در سرویس تاپین یافت نشد`,
      404,
      null,
      `City not found: ${cityName} in province ${provinceCode}`,
      null
    );
  }

  return { provinceCode, cityCode };
}

/**
 * POST handler for shipping cost calculation
 *
 * Expects:
 * {
 *   city: string (Persian name),
 *   province: string (Persian name),
 *   products: Array<{ productId, name, price, quantity, weight, discount? }>,
 *   address?: string,
 *   firstName?: string,
 *   lastName?: string,
 *   phone?: string,
 *   postalCode?: string
 * }
 *
 * Returns:
 * - Success: { ok: true, method: "post", title: "...", shippingCost: number }
 * - On error: { ok: false, message: string, canCheckout: boolean }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: CalculateShippingRequest = await request.json();
    const { city, province, products } = body;

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

    if (!products || products.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          message: "سبد خرید خالی است",
          canCheckout: false,
        },
        { status: 400 }
      );
    }

    // Resolve Persian province/city names to Tapin codes
    let provinceCode: string;
    let cityCode: string;

    try {
      const codes = await ensureCodesCached(province, city);
      provinceCode = codes.provinceCode;
      cityCode = codes.cityCode;
    } catch (error) {
      if (error instanceof TapinApiError) {
        return NextResponse.json(
          {
            ok: false,
            message: error.getPersianMessage(),
            canCheckout: false,
          },
          { status: 404 }
        );
      }
      throw error;
    }

    console.log("Resolved codes:", {
      province: `${province} -> ${provinceCode}`,
      city: `${city} -> ${cityCode}`,
    });

    // Get shop ID
    const shopId = getTapinShopId();

    // Calculate total package weight
    const packageWeight = products.reduce(
      (sum, p) => sum + (p.weight || 200) * p.quantity,
      0
    );

    // Map products to Tapin format
    const tapinProducts = mapProductsToTapin(
      products.map((p) => ({
        count: p.quantity,
        discount: p.discount ?? 0,
        price: p.price,
        title: p.name,
        weight: p.weight || 200,
        productId: p.productId,
      }))
    );

    // Build the check-price payload
    const payload = mapCheckPriceRequest({
      shopId,
      address: body.address || "---",
      cityCode,
      provinceCode,
      firstName: body.firstName || "---",
      lastName: body.lastName || "---",
      mobile: body.phone || "09123456789",
      postalCode: body.postalCode || "0000000000",
      payType: "1",
      orderType: "1",
      packageWeight,
      boxId: "1",
      packetType: "0",
      hasInsurance: false,
      products: tapinProducts,
    });

    // Calculate shipping cost via Tapin
    const result = await calculateShippingCost(payload);

    // Use totalPrice as the shipping cost (total includes both send price and any additional fees)
    const shippingCost = result.totalPrice > 0 ? result.totalPrice : result.sendPrice;

    return NextResponse.json({
      ok: true,
      method: "post" as const,
      title: "پست پیشتاز",
      shippingCost,
      totalPrice: result.totalPrice,
      sendPrice: result.sendPrice,
    });
  } catch (error) {
    // Handle Tapin-specific errors
    if (error instanceof TapinApiError) {
      console.error("[shipping/calculate] Tapin error:", {
        message: error.message,
        httpStatus: error.httpStatus,
        tapinStatus: error.tapinStatus,
        tapinMessage: error.tapinMessage,
        persianMessage: error.getPersianMessage(),
      });

      return NextResponse.json(
        {
          ok: false,
          message: error.getPersianMessage(),
          canCheckout: false,
        },
        { status: error.httpStatus === 503 ? 503 : 400 }
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