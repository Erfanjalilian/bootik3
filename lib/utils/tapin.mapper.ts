// ============================================================================
// Tapin Shipping API - Mapper Utilities
// ============================================================================

import type {
  TapinProduct,
  TapinCheckPriceRequest,
  TapinRegisterRequest,
  ProvinceMapping,
  CityMapping,
} from "@/lib/types/tapin.types";

export interface ProductToMap {
  count: number;
  discount: number;
  price: number;
  title: string;
  weight: number;
  productId: number;
}

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

export function mapCheckPriceRequest(params: {
  shopId: string;
  cityCode: string;
  provinceCode: string;
  products: TapinProduct[];
}): TapinCheckPriceRequest {
  return {
    shop_id: params.shopId,
    address: "---",
    state_code: params.provinceCode,
    city_code: params.cityCode,
    province_code: params.provinceCode,
    first_name: "---",
    last_name: "---",
    mobile: "09123456789",
    postal_code: "1234567890",
    pay_type: "1",
    order_type: "1",
    package_weight: 1000,
    box_id: "1",
    packet_type: "1",
    has_insurance: false,
    products: params.products,
    send_type: "1",
    description: "---",
    email: "test@example.com",
    employee_code: "-1",
    phone: "09123456789",
    order_items: params.products.map((p) => ({
      name: p.title,
      weight: p.weight,
      count: p.count,
      product_type_code: "1",
      product_id: p.product_id,
    })),
  };
}

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
    packet_type: params.packetType || "2",
    has_insurance: params.hasInsurance,
    products: params.products,
  };
}

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

export function lookupProvinceCode(persianName: string): string | null {
  if (!cachedProvinceMap) return null;
  if (cachedProvinceMap[persianName]) return cachedProvinceMap[persianName];
  const trimmed = persianName.trim();
  if (cachedProvinceMap[trimmed]) return cachedProvinceMap[trimmed];
  return null;
}

export function lookupCityCode(provinceCode: string, persianCityName: string): string | null {
  const provinceCities = cachedCityMap[provinceCode];
  if (!provinceCities) return null;
  if (provinceCities[persianCityName]) return provinceCities[persianCityName];
  const trimmed = persianCityName.trim();
  if (provinceCities[trimmed]) return provinceCities[trimmed];
  return null;
}

export function clearCachedMaps(): void {
  cachedProvinceMap = null;
  cachedCityMap = {};
}