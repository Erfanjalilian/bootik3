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
  product_id: number;
}

/**
 * Order item for check-price API (different from TapinProduct)
 */
export interface TapinOrderItem {
  name: string;
  weight: number;
  count: number;
  product_type_code: string;
  product_id?: number;
}

/**
 * Request payload for Tapin check-price API
 * POST https://api.tapin.ir/api/v2/public/order/post/check-price/
 * بر اساس مستندات رسمی تاپین - شامل تمام فیلدهای اجباری
 */
export interface TapinCheckPriceRequest {
  shop_id: string;
  address: string;
  state_code: string;
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
  send_type: string;
  order_items: TapinOrderItem[];
  description?: string;
  email?: string;
  employee_code?: string;
  phone?: string;
}

/**
 * Request payload for Tapin register shipment API
 * POST https://api.tapin.ir/api/v2/public/order/post/register/
 * بر اساس مستندات رسمی تاپین
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
  description?: string;
  email?: string;
  employee_code?: string;
  phone?: string;
  pre_paid_price?: number;
  presenter_code?: number;
  manual_id?: string;
  content_type?: number;
  kiosk_id?: number;
  duration?: number;
  parcel_turning?: boolean;
}

/**
 * Response entry from Tapin API
 */
export interface TapinResponseEntry {
  id?: string;
  barcode?: string;
  order_id?: number;
  send_price?: number;
  total_price?: number;
  status?: number;
  first_name?: string;
  last_name?: string;
  state_code?: string;
  city_code?: string;
  send_price_tax?: number;
  insurance_price?: number;
  insurance_tax?: number;
  created_at?: string;
  total_send_price_discount?: number;
  product_price?: number;
  pre_paid_price?: number;
  final_pay_price?: number;
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
  orderId: number;
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