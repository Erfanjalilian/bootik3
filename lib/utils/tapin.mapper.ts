// ============================================================================
// Tapin Shipping API - Mapper Utilities
// Handles conversion between Persian names and Tapin codes
// ============================================================================

import type {
  TapinProduct,
  TapinCheckPriceRequest,
  TapinRegisterRequest,
  ProvinceMapping,
  CityMapping,
} from "@/lib/types/tapin.types";

/**
 * Product info from cart/order that needs to be mapped to Tapin format
 */
export interface ProductToMap {
  count: number;
  discount: number;
  price: number;
  title: string;
  weight: number;
  productId: string;
}

/**
 * Convert internal product format to Tapin product format
 */
export function mapProductsToTapin(products: ProductToMap[]): TapinProduct[] {
  return products.map((p) => ({
    count: p.count,
    discount: p.discount,
    price: p.price,
    title: p.title,
    weight: p.weight,
    product_id: p.productId,
  }));
}

/**
 * Map check price request payload
 * اصلاح شده با فیلدهای درست برای تاپین
 */
export function mapCheckPriceRequest(params: {
  shopId: string;
  address: string;
  cityCode: string;
  provinceCode: string;
  firstName: string;
  lastName: string;
  mobile: string;
  postalCode: string;
  payType: string;
  orderType: string;
  packageWeight: number;
  boxId: string;
  packetType: string;
  hasInsurance: boolean;
  products: TapinProduct[];
}): TapinCheckPriceRequest {
  return {
    shop_id: params.shopId,
    state_code: params.provinceCode,        // ← اصلاح: state_code
    city_code: params.cityCode,
    send_type: "1",                         // ← اضافه شد: send_type
    order_items: params.products,           // ← اصلاح: order_items به جای products
    // فیلدهای اضافی که تاپین نیاز نداره رو حذف کردیم
  };
}

/**
 * Map register shipment request payload
 */
export function mapRegisterRequest(params: {
  registerType: string;
  shopId: string;
  address: string;
  cityCode: string;
  provinceCode: string;
  firstName: string;
  lastName: string;
  mobile: string;
  postalCode: string;
  payType: string;
  orderType: string;
  packageWeight: number;
  boxId: string;
  packetType: string;
  hasInsurance: boolean;
  products: TapinProduct[];
}): TapinRegisterRequest {
  return {
    register_type: params.registerType,
    shop_id: params.shopId,
    address: params.address,
    city_code: params.cityCode,
    province_code: params.provinceCode,
    first_name: params.firstName,
    last_name: params.lastName,
    mobile: params.mobile,
    postal_code: params.postalCode,
    pay_type: params.payType,
    order_type: params.orderType,
    package_weight: params.packageWeight,
    box_id: params.boxId,
    packet_type: params.packetType,
    has_insurance: params.hasInsurance,
    products: params.products,
  };
}

/**
 * Persian province name to Tapin province_code mapping
 * This should be populated from the Tapin province tree API at startup
 */
let cachedProvinceMap: ProvinceMapping | null = null;
let cachedCityMap: Record<string, CityMapping> = {};

export function setCachedProvinceMap(map: ProvinceMapping): void {
  cachedProvinceMap = map;
}

export function getCachedProvinceMap(): ProvinceMapping | null {
  return cachedProvinceMap;
}

export function setCachedCityMap(provinceCode: string, cities: CityMapping): void {
  cachedCityMap[provinceCode] = cities;
}

export function getCachedCityMap(provinceCode: string): CityMapping | null {
  return cachedCityMap[provinceCode] ?? null;
}

/**
 * Look up a province code from a Persian province name
 */
export function lookupProvinceCode(persianName: string): string | null {
  if (!cachedProvinceMap) return null;
  // Try exact match
  if (cachedProvinceMap[persianName]) return cachedProvinceMap[persianName];
  // Try trimmed match
  const trimmed = persianName.trim();
  if (cachedProvinceMap[trimmed]) return cachedProvinceMap[trimmed];
  return null;
}

/**
 * Look up a city code from a Persian city name, within a province
 */
export function lookupCityCode(provinceCode: string, persianCityName: string): string | null {
  const provinceCities = cachedCityMap[provinceCode];
  if (!provinceCities) return null;
  // Try exact match
  if (provinceCities[persianCityName]) return provinceCities[persianCityName];
  // Try trimmed match
  const trimmed = persianCityName.trim();
  if (provinceCities[trimmed]) return provinceCities[trimmed];
  return null;
}

/**
 * Clear cached maps (useful for testing or refresh)
 */
export function clearCachedMaps(): void {
  cachedProvinceMap = null;
  cachedCityMap = {};
}