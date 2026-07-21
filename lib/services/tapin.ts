// ============================================================================
// Tapin Shipping API Service
// Based on official Tapin API documentation (taapin.ir)
// Version: 1.0.0
// ============================================================================

// ---------------------------------------------------------------------------
// Types & Interfaces
// ---------------------------------------------------------------------------

/**
 * Product dimensions and weight used for shipping calculation
 */
export interface ShippingItem {
  weight: number; // grams
  length: number; // cm
  width: number;  // cm
  height: number; // cm
  quantity: number;
}

/**
 * Origin/Destination location info
 */
export interface ShippingLocation {
  province: string;
  city: string;
}

/**
 * Request payload for Tapin calculator API
 */
interface TapinCalculateRequest {
  origin: ShippingLocation;
  destination: ShippingLocation;
  parcels: TapinParcel[];
  service_type?: string;
}

/**
 * A single parcel in Tapin API request
 */
interface TapinParcel {
  weight: number; // grams
  length: number; // cm
  width: number;  // cm
  height: number; // cm
}

/**
 * A shipping service option returned by Tapin
 */
export interface TapinServiceOption {
  id: string;
  title: string;
  price: number;
  description?: string;
  estimated_delivery?: string;
}

/**
 * Response from Tapin calculator API
 */
interface TapinCalculateResponse {
  status: boolean;
  data?: {
    services: TapinServiceOption[];
  };
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * Request payload for creating a Tapin shipment
 */
export interface TapinCreateShipmentRequest {
  origin: ShippingLocation;
  destination: ShippingLocation;
  receiver: {
    first_name: string;
    last_name: string;
    phone: string;
    address: string;
    postal_code: string;
  };
  parcels: TapinParcel[];
  service_type: string;
  description?: string;
}

/**
 * Created shipment response from Tapin
 */
interface TapinCreateShipmentResponse {
  status: boolean;
  data?: {
    id: string;
    tracking_code: string;
    status: string;
    price: number;
  };
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * Result of shipping cost calculation for our store
 */
export interface ShippingCalculationResult {
  method: "courier" | "post";
  title: string;
  shippingCost: number;
  serviceType?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Fixed courier shipping cost for Sari city (in Rial)
 * Change this value to update the fixed delivery price
 */
export const SARI_COURIER_FIXED_PRICE = 50000;

/**
 * Sari city name for comparison
 */
const SARI_CITY = "ساری";

/**
 * Mazandaran province name
 */
const MAZANDARAN_PROVINCE = "مازندران";

/**
 * Tapin API base URL
 */
const TAPIN_API_BASE = "https://api.tapin.ir/v2";

/**
 * Tapin calculator endpoint
 */
const TAPIN_CALCULATE_URL = `${TAPIN_API_BASE}/calculator`;

/**
 * Tapin create shipment endpoint
 */
const TAPIN_SHIPMENT_URL = `${TAPIN_API_BASE}/order`;

// ---------------------------------------------------------------------------
// Error Classes
// ---------------------------------------------------------------------------

/**
 * Custom error class for Tapin API errors
 */
export class TapinApiError extends Error {
  public readonly statusCode: number;
  public readonly rawResponse: Record<string, unknown> | null;

  constructor(
    message: string,
    statusCode: number = 500,
    rawResponse: Record<string, unknown> | null = null
  ) {
    super(message);
    this.name = "TapinApiError";
    this.statusCode = statusCode;
    this.rawResponse = rawResponse;
  }

  /**
   * Returns a Persian-friendly error message
   */
  public getPersianMessage(): string {
    if (this.statusCode >= 500) {
      return "سیستم ارسال (تاپین) در دسترس نیست. لطفاً بعداً تلاش کنید.";
    }
    if (this.statusCode === 401 || this.statusCode === 403) {
      return "خطای احراز هویت سرویس ارسال. لطفاً با پشتیبانی تماس بگیرید.";
    }
    return this.message || "خطا در محاسبه هزینه ارسال";
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Retrieve Tapin token from environment variables
 */
function getTapinToken(): string {
  const token = process.env.TAPIN_TOKEN;
  if (!token) {
    throw new TapinApiError(
      "TAPIN_TOKEN environment variable is not set",
      500
    );
  }
  return token;
}

/**
 * Retrieve Tapin shop ID from environment variables
 */
function getTapinShopId(): string {
  const shopId = process.env.TAPIN_SHOP_ID;
  if (!shopId) {
    throw new TapinApiError(
      "TAPIN_SHOP_ID environment variable is not set",
      500
    );
  }
  return shopId;
}

/**
 * Get store origin location (always Sari, Mazandaran)
 */
export function getStoreOrigin(): ShippingLocation {
  return {
    province: MAZANDARAN_PROVINCE,
    city: SARI_CITY,
  };
}

/**
 * Check if the destination city is Sari
 */
export function isDestinationSari(city: string): boolean {
  return city.trim() === SARI_CITY;
}

/**
 * Calculate combined package dimensions for multiple items.
 *
 * Strategy:
 * - Total weight = sum of all items' weight * quantity
 * - Package length = max length among all items
 * - Package width = max width among all items
 * - Package height = sum of all items' height * quantity (stacked)
 *
 * This provides a reasonable estimate for combined packaging.
 */
export function calculateCombinedParcel(
  items: ShippingItem[]
): TapinParcel {
  if (items.length === 0) {
    return { weight: 0, length: 0, width: 0, height: 0 };
  }

  let totalWeight = 0;
  let totalHeight = 0;
  let maxLength = 0;
  let maxWidth = 0;

  for (const item of items) {
    if (item.quantity <= 0) continue;

    totalWeight += (item.weight || 0) * item.quantity;
    maxLength = Math.max(maxLength, item.length || 0);
    maxWidth = Math.max(maxWidth, item.width || 0);
    totalHeight += (item.height || 0) * item.quantity;
  }

  return {
    weight: totalWeight,
    length: maxLength,
    width: maxWidth,
    height: totalHeight,
  };
}

// ---------------------------------------------------------------------------
// API Functions
// ---------------------------------------------------------------------------

/**
 * Get available shipping services from Tapin for a given route.
 *
 * This fetches all services Tapin offers between origin and destination.
 *
 * @param destination - The destination location (province, city)
 * @param items - Array of items with dimensions and quantities
 * @returns Array of available service options
 *
 * @throws TapinApiError if the API call fails
 */
export async function getAvailableServices(
  destination: ShippingLocation,
  items: ShippingItem[]
): Promise<TapinServiceOption[]> {
  const token = getTapinToken();
  const shopId = getTapinShopId();
  const origin = getStoreOrigin();
  const parcel = calculateCombinedParcel(items);

  const payload: TapinCalculateRequest = {
    origin,
    destination,
    parcels: [parcel],
  };

  console.log("========== TAPIN CALCULATE REQUEST ==========");
  console.log("Shop ID:", shopId);
  console.log("Origin:", JSON.stringify(origin));
  console.log("Destination:", JSON.stringify(destination));
  console.log("Parcel:", JSON.stringify(parcel));
  console.log("=============================================");

  let httpStatus: number;
  let responseData: Record<string, unknown>;

  try {
    const response = await fetch(TAPIN_CALCULATE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Shop-Id": shopId,
      },
      body: JSON.stringify(payload),
    });

    httpStatus = response.status;
    responseData = await response.json();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Network error";
    throw new TapinApiError(
      `ارتباط با سرویس تاپین برقرار نشد: ${errorMessage}`,
      503
    );
  }

  console.log("========== TAPIN CALCULATE RESPONSE ==========");
  console.log("HTTP Status:", httpStatus);
  console.log("Response:", JSON.stringify(responseData, null, 2));
  console.log("=============================================");

  if (!responseData.status) {
    const message =
      (responseData.message as string) ||
      "خطا در دریافت سرویس‌های ارسال از تاپین";
    throw new TapinApiError(message, httpStatus, responseData);
  }

  const data = responseData.data as { services: TapinServiceOption[] } | undefined;
  return data?.services || [];
}

/**
 * Calculate shipping cost via Tapin API.
 *
 * Fetches available services and returns the cost for "پست پیشتاز" (express post).
 *
 * @param destination - The destination location
 * @param items - Array of items with dimensions and quantities
 * @returns Shipping cost for express post
 *
 * @throws TapinApiError if the API call fails or no post service is found
 */
export async function calculateShippingCost(
  destination: ShippingLocation,
  items: ShippingItem[]
): Promise<number> {
  const services = await getAvailableServices(destination, items);

  // Find the express post service (پست پیشتاز)
  const postService = services.find(
    (s) =>
      s.id === "post" ||
      s.title.includes("پیشتاز") ||
      s.title.includes("پست")
  );

  if (!postService) {
    throw new TapinApiError(
      "سرویس پست پیشتاز برای این مسیر در دسترس نیست",
      404
    );
  }

  console.log(
    `Selected service: ${postService.title} - Price: ${postService.price}`
  );

  return postService.price;
}

/**
 * Create a shipment order in Tapin.
 *
 * After payment is confirmed, this creates the actual shipping order
 * so the courier can pick up and deliver the package.
 *
 * @param request - The complete shipment creation payload
 * @returns Created shipment details including tracking code
 *
 * @throws TapinApiError if the API call fails
 */
export async function createShipment(
  request: TapinCreateShipmentRequest
): Promise<{ id: string; trackingCode: string; price: number }> {
  const token = getTapinToken();
  const shopId = getTapinShopId();

  console.log("========== TAPIN CREATE SHIPMENT ==========");
  console.log("Shop ID:", shopId);
  console.log("Request:", JSON.stringify(request, null, 2));
  console.log("===========================================");

  let httpStatus: number;
  let responseData: Record<string, unknown>;

  try {
    const response = await fetch(TAPIN_SHIPMENT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Shop-Id": shopId,
      },
      body: JSON.stringify(request),
    });

    httpStatus = response.status;
    responseData = await response.json();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Network error";
    throw new TapinApiError(
      `ارتباط با سرویس تاپین برای ثبت سفارش برقرار نشد: ${errorMessage}`,
      503
    );
  }

  console.log("========== TAPIN SHIPMENT RESPONSE ==========");
  console.log("HTTP Status:", httpStatus);
  console.log("Response:", JSON.stringify(responseData, null, 2));
  console.log("============================================");

  if (!responseData.status) {
    const message =
      (responseData.message as string) || "خطا در ثبت سفارش ارسال در تاپین";
    throw new TapinApiError(message, httpStatus, responseData);
  }

  const data = responseData.data as {
    id: string;
    tracking_code: string;
    status: string;
    price: number;
  } | undefined;

  if (!data?.id || !data?.tracking_code) {
    throw new TapinApiError(
      "پاسخ ناقص از سرویس تاپین دریافت شد",
      httpStatus,
      responseData
    );
  }

  return {
    id: data.id,
    trackingCode: data.tracking_code,
    price: data.price,
  };
}