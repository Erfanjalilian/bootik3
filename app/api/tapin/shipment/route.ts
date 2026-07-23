// ============================================================================
// Tapin Shipment Creation API Route
// Creates a Tapin shipment for a paid order
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import {
  TapinApiError,
  createShipment,
  getTapinShopId,
  getProvinces,
  getCities,
} from "@/lib/services/tapin";
import {
  setCachedProvinceMap,
  setCachedCityMap,
  lookupProvinceCode,
  lookupCityCode,
} from "@/lib/utils/tapin.mapper";
import { mapProductsToTapin, mapRegisterRequest } from "@/lib/utils/tapin.mapper";
import { getOrderById, updateOrderTapinShipment } from "@/lib/orders/store";
import type { ProvinceMapping, CityMapping } from "@/lib/types/tapin.types";

/**
 * POST handler - Create a Tapin shipment for a paid order
 *
 * Expects:
 * {
 *   orderId: string (internal order ID)
 * }
 *
 * Returns:
 * - Success: { ok: true, shipment: { id, barcode, orderId, sendPrice } }
 * - On error: { ok: false, message: string }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { orderId } = body as { orderId: string };

    if (!orderId) {
      return NextResponse.json(
        { ok: false, message: "شناسه سفارش الزامی است" },
        { status: 400 }
      );
    }

    // Fetch the order
    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json(
        { ok: false, message: "سفارش یافت نشد" },
        { status: 404 }
      );
    }

    // Check order is paid
    if (order.status !== "paid") {
      return NextResponse.json(
        { ok: false, message: "فقط سفارش‌های پرداخت شده می‌توانند ثبت ارسال شوند" },
        { status: 400 }
      );
    }

    // Check if already created
    if (order.tapinShipmentId) {
      return NextResponse.json({
        ok: true,
        message: "سفارش ارسال قبلاً ثبت شده است",
        shipment: {
          id: order.tapinShipmentId,
          barcode: order.tapinBarcode,
          orderId: order.tapinOrderId,
          sendPrice: order.tapinSendPrice,
        },
      });
    }

    const { shippingAddress, items } = order;

    // Resolve Persian province/city names to Tapin codes
    const provinceName = shippingAddress.province;
    const cityName = shippingAddress.city;

    // Ensure codes are cached
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
      return NextResponse.json(
        { ok: false, message: `استان "${provinceName}" در سرویس تاپین یافت نشد` },
        { status: 404 }
      );
    }

    let cityCode = lookupCityCode(provinceCode, cityName);
    if (!cityCode) {
      console.log(`City cache empty for ${provinceCode}, fetching...`);
      const cities = await getCities(provinceCode);
      const cityMap: CityMapping = {};
      for (const city of cities) {
        cityMap[city.city_name] = city.city_code;
      }
      setCachedCityMap(provinceCode, cityMap);
      cityCode = lookupCityCode(provinceCode, cityName);
    }

    if (!cityCode) {
      return NextResponse.json(
        { ok: false, message: `شهر "${cityName}" در سرویس تاپین یافت نشد` },
        { status: 404 }
      );
    }

    const shopId = getTapinShopId();

    // Calculate total package weight - use 200g per item as default
    const totalWeight = items.reduce((sum, item) => sum + 200 * item.quantity, 0);

    // =============== Map products to Tapin format with numeric productId ===============
    const tapinProducts = mapProductsToTapin(
      items.map((item) => ({
        count: item.quantity,
        discount: 0,
        price: item.price,
        title: item.name,
        weight: 200,
        productId: Number(item.productId),  // ← تبدیل به عدد
      }))
    );

    // Build the register payload
    const payload = mapRegisterRequest({
      registerType: "0",
      shopId,
      address: shippingAddress.address,
      cityCode,
      provinceCode,
      firstName: shippingAddress.firstName,
      lastName: shippingAddress.lastName,
      mobile: shippingAddress.phone,
      postalCode: shippingAddress.postalCode,
      payType: "1",
      orderType: "1",
      packageWeight: totalWeight,
      boxId: "1",
      packetType: "0",
      hasInsurance: false,
      products: tapinProducts,
    });

    // لاگ payload برای دیباگ
    console.log("========== 🔍 TAPIN REGISTER PAYLOAD ==========");
    console.log("Payload:", JSON.stringify(payload, null, 2));
    console.log("==============================================");

    // Create shipment via Tapin
    const shipment = await createShipment(payload);

    // Save Tapin shipment data to the order
    await updateOrderTapinShipment(orderId, {
      tapinShipmentId: shipment.id,
      tapinBarcode: shipment.barcode,
      tapinOrderId: shipment.orderId,
      tapinSendPrice: shipment.sendPrice,
    });

    console.log("Tapin shipment created for order:", {
      orderId,
      tapinId: shipment.id,
      barcode: shipment.barcode,
      tapinOrderId: shipment.orderId,
    });

    return NextResponse.json({
      ok: true,
      message: "سفارش ارسال با موفقیت ثبت شد",
      shipment: {
        id: shipment.id,
        barcode: shipment.barcode,
        orderId: shipment.orderId,
        sendPrice: shipment.sendPrice,
      },
    });
  } catch (error) {
    if (error instanceof TapinApiError) {
      console.error("[tapin/shipment] Tapin error:", {
        message: error.message,
        httpStatus: error.httpStatus,
        tapinStatus: error.tapinStatus,
        tapinMessage: error.tapinMessage,
      });

      return NextResponse.json(
        { ok: false, message: error.getPersianMessage() },
        { status: error.httpStatus === 503 ? 503 : 400 }
      );
    }

    console.error("[tapin/shipment] Unexpected error:", error);
    return NextResponse.json(
      { ok: false, message: "خطا در ثبت سفارش ارسال" },
      { status: 500 }
    );
  }
}