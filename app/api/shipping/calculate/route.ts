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
import type { ProvinceMapping, CityMapping } from "@/lib/types/tapin.types";

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
 * Ensure province/city codes are cached by fetching from Tapin if needed
 */
async function ensureCodesCached(provinceName: string, cityName: string): Promise<{
  provinceCode: string;
  cityCode: string;
}> {
  // Try to look up codes from cache first
  let provinceCode = lookupProvinceCode(provinceName);
  
  if (!provinceCode) {
    console.log("Province cache empty, fetching from Tapin API...");
    const provinces = await getProvinces();

    const provinceMap: ProvinceMapping = {};
    for (const province of provinces) {
      provinceMap[province.state_name] = province.state_code;
    }
    setCachedProvinceMap(provinceMap);

    for (const province of provinces) {
      const cityMap: CityMapping = {};
      for (const city of province.cities) {
        cityMap[city.city_name] = city.city_code;
      }
      setCachedCityMap(province.state_code, cityMap);
    }

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

  let cityCode = lookupCityCode(provinceCode, cityName);

  if (!cityCode) {
    console.log(`City cache empty for province ${provinceCode}, fetching from Tapin...`);
    const cities = await getCities(provinceCode);

    const cityMap: CityMapping = {};
    for (const city of cities) {
      cityMap[city.city_name] = city.city_code;
    }
    setCachedCityMap(provinceCode, cityMap);

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
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log("========== 🚀 SHIPPING CALCULATE ROUTE STARTED ==========");
  
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

    // =============== تشخیص عددی بودن یا نبودن ===============
    const isNumericProvince = /^\d+$/.test(province.trim());
    const isNumericCity = /^\d+$/.test(city.trim());
    
    console.log("🔍 Detected types:", {
      province: { value: province, isNumeric: isNumericProvince },
      city: { value: city, isNumeric: isNumericCity },
    });

    let provinceCode: string;
    let cityCode: string;

    if (isNumericProvince && isNumericCity) {
      // اگر کد عددی بود، مستقیماً استفاده کن
      provinceCode = province.trim();
      cityCode = city.trim();
      console.log("✅ Using numeric codes directly:", { provinceCode, cityCode });
    } else {
      // اگر نام بود، از کش استفاده کن
      console.log("🔄 Resolving names to codes...");
      try {
        const codes = await ensureCodesCached(province, city);
        provinceCode = codes.provinceCode;
        cityCode = codes.cityCode;
        console.log("✅ Resolved codes:", { provinceCode, cityCode });
      } catch (error) {
        if (error instanceof TapinApiError) {
          return NextResponse.json(
            { ok: false, message: error.getPersianMessage(), canCheckout: false },
            { status: 404 }
          );
        }
        throw error;
      }
    }

    // Get shop ID
    console.log("🏪 Getting Shop ID from environment...");
    const shopId = getTapinShopId();
    console.log("🏪 Shop ID retrieved:", shopId);

    // Map products to Tapin format
    const tapinProducts = mapProductsToTapin(
      products.map((p) => ({
        count: p.quantity,
        discount: p.discount ?? 0,
        price: p.price,
        title: p.name,
        weight: p.weight || 200,
        productId: String(p.productId),
      }))
    );

    // =============== فقط فیلدهای مورد نیاز ===============
    const payload = mapCheckPriceRequest({
      shopId,
      cityCode,
      provinceCode,
      products: tapinProducts,
    });

    // لاگ FINAL PAYLOAD
    console.log("========== 🔍 FINAL PAYLOAD ==========");
    console.log("1️⃣ Shop ID:", shopId);
    console.log("2️⃣ province_code:", provinceCode);
    console.log("3️⃣ city_code:", cityCode);
    console.log("4️⃣ Full Payload:", JSON.stringify(payload, null, 2));
    console.log("======================================");

    // Calculate shipping cost via Tapin
    console.log("🔄 Calling calculateShippingCost with payload...");
    const result = await calculateShippingCost(payload);
    console.log("✅ calculateShippingCost result:", result);

    const shippingCost = result.totalPrice > 0 ? result.totalPrice : result.sendPrice;
    console.log("💰 Final shipping cost:", shippingCost);

    return NextResponse.json({
      ok: true,
      method: "post" as const,
      title: "پست پیشتاز",
      shippingCost,
      totalPrice: result.totalPrice,
      sendPrice: result.sendPrice,
    });
  } catch (error) {
    if (error instanceof TapinApiError) {
      console.error("[shipping/calculate] Tapin error:", {
        message: error.message,
        httpStatus: error.httpStatus,
        tapinStatus: error.tapinStatus,
        tapinMessage: error.tapinMessage,
        persianMessage: error.getPersianMessage(),
      });

      return NextResponse.json(
        { ok: false, message: error.getPersianMessage(), canCheckout: false },
        { status: error.httpStatus === 503 ? 503 : 400 }
      );
    }

    console.error("[shipping/calculate] Unexpected error:", error);
    return NextResponse.json(
      { ok: false, message: "خطا در محاسبه هزینه ارسال. لطفاً بعداً تلاش کنید.", canCheckout: false },
      { status: 500 }
    );
  }
}