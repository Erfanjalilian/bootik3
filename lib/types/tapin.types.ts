// ============================================================================
// Tapin Shipping API - TypeScript Type Definitions
// ============================================================================

// ---------------------------------------------------------------------------
// Product Types
// ---------------------------------------------------------------------------

export interface TapinProduct {
  count: number;
  discount: number;
  price: number;
  title: string;
  weight: number;
  product_id: number;
}

// ---------------------------------------------------------------------------
// Location Mapping Types
// ---------------------------------------------------------------------------

export interface ProvinceMapping {
  [persianName: string]: string; // province code
}

export interface CityMapping {
  [persianCityName: string]: string; // city code
}

// ---------------------------------------------------------------------------
// Province / City Types (from Tapin API)
// ---------------------------------------------------------------------------

export interface TapinCity {
  city_code: string;
  city_name: string;
}

export interface TapinProvince {
  state_code: string;
  state_name: string;
  cities: TapinCity[];
}

// ---------------------------------------------------------------------------
// Request Types
// ---------------------------------------------------------------------------

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
  pre_paid_price: number;
  package_weight: number;
  box_id: string;
  packet_type: string;
  has_insurance: boolean;
  products: TapinProduct[];
  send_type: string;
  description: string;
  email: string;
  employee_code: string;
  phone: string;
  order_items: Array<{
    name: string;
    weight: number;
    count: number;
    product_type_code: string;
    product_id: number;
  }>;
}

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

// ---------------------------------------------------------------------------
// Response Types
// ---------------------------------------------------------------------------

export interface TapinResponseEntry {
  id: string;
  barcode: string;
  order_id: string;
  send_price: number;
  total_price: number;
  result: boolean;
  status: string;
  delivery_date: string;
}

export interface TapinApiResponse {
  returns: {
    status: number;
    message: string;
  };
  entries: TapinResponseEntry[] | TapinResponseEntry;
  message?: string;
  status?: number;
  [key: string]: unknown;
}

export interface TapinProvinceTreeResponse {
  returns: {
    status: number;
    message: string;
  };
  entries: TapinProvince[];
  [key: string]: unknown;
}

export interface TapinCityListResponse {
  returns: {
    status: number;
    message: string;
  };
  entries: TapinCity[];
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Result Types
// ---------------------------------------------------------------------------

export interface ShippingCostResult {
  totalPrice: number;
  sendPrice: number;
}

export interface ShipmentResult {
  id: string;
  barcode: string;
  orderId: string;
  sendPrice: number;
}