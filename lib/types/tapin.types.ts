// ============================================================================
// Tapin Shipping API - TypeScript Types
// Based on official Tapin API documentation
// ============================================================================

/**
 * Product item in a Tapin request
 */
export interface TapinProduct {
  count: number;
  discount: number;
  price: number;
  title: string;
  weight: number;
  product_id: string;
}

/**
 * Request payload for Tapin check-price API
 * POST https://api.tapin.ir/api/v2/public/order/post/check-price/
 * اصلاح شده با فیلدهای درست برای تاپین
 */
export interface TapinCheckPriceRequest {
  shop_id: string;
  state_code: string;        // ← اضافه شد
  city_code: string;
  send_type: string;         // ← اضافه شد
  order_items: TapinProduct[]; // ← اضافه شد (به جای products)
  // فیلدهای زیر برای تاپین check-price نیازی نیستند، ولی اگر باشن اشکالی نداره
  address?: string;
  province_code?: string;
  first_name?: string;
  last_name?: string;
  mobile?: string;
  postal_code?: string;
  pay_type?: string;
  order_type?: string;
  package_weight?: number;
  box_id?: string;
  packet_type?: string;
  has_insurance?: boolean;
  products?: TapinProduct[];  // برای backward compatibility
}

/**
 * Request payload for Tapin register shipment API
 * POST https://api.tapin.ir/api/v2/public/order/post/register/
 */
export interface TapinRegisterRequest {
  register_type: string;
  shop_id: string;
  address: string;
  city_code: string;
  province_code: string;
  first_name: string;
  last_name: string;
  mobile: string;
  postal_code: string;
  pay_type: string;
  order_type: string;
  package_weight: number;
  box_id: string;
  packet_type: string;
  has_insurance: boolean;
  products: TapinProduct[];
}

/**
 * Response entry from Tapin API
 */
export interface TapinResponseEntry {
  id?: string;
  barcode?: string;
  order_id?: string;
  send_price?: number;
  total_price?: number;
  [key: string]: unknown;
}

/**
 * Standard response wrapper from Tapin API
 */
export interface TapinApiResponse {
  status: boolean;
  message?: string;
  entries?: TapinResponseEntry | TapinResponseEntry[];
  returns?: {
    status: number;
    message: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Response from province tree API
 * POST https://api.tapin.ir/api/v2/public/state/tree/
 */
export interface TapinProvince {
  state_code: string;
  state_name: string;
  cities: TapinCity[];
}

/**
 * Response from city list API
 * POST https://api.tapin.ir/api/v2/public/city/list/
 */
export interface TapinCity {
  city_code: string;
  city_name: string;
}

/**
 * Province tree response
 */
export interface TapinProvinceTreeResponse {
  status: boolean;
  message?: string;
  entries?: TapinProvince[];
  returns?: {
    status: number;
    message: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * City list response
 */
export interface TapinCityListResponse {
  status: boolean;
  message?: string;
  entries?: TapinCity[];
  returns?: {
    status: number;
    message: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Result of a shipping cost calculation
 */
export interface ShippingCostResult {
  totalPrice: number;
  sendPrice: number;
}

/**
 * Result of a shipment creation
 */
export interface ShipmentResult {
  id: string;
  barcode: string;
  orderId: string;
  sendPrice: number;
}

/**
 * Cached province mapping: Persian name -> province_code
 */
export interface ProvinceMapping {
  [persianName: string]: string;
}

/**
 * Cached city mapping: Persian name -> city_code
 */
export interface CityMapping {
  [persianName: string]: string;
}