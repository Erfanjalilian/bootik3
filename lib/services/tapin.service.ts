// lib/services/tapin.service.ts

// ============================================================================
// Tapin Shipping API Service
// Official Tapin API Integration
// Endpoints:
//   - POST https://api.tapin.ir/api/v2/public/order/post/check-price/
//   - POST https://api.tapin.ir/api/v2/public/order/post/register/
//   - POST https://api.tapin.ir/api/v2/public/state/tree/
//   - POST https://api.tapin.ir/api/v2/public/city/list/
// ============================================================================

import type {
  TapinApiResponse,
  TapinCheckPriceRequest,
  TapinRegisterRequest,
  TapinProvinceTreeResponse,
  TapinCityListResponse,
  TapinProvince,
  TapinCity,
  TapinResponseEntry,
  ShippingCostResult,
  ShipmentResult,
} from "@/lib/types/tapin.types";

// ---------------------------------------------------------------------------
// Constants - Tapin API Endpoints
// ---------------------------------------------------------------------------

const TAPIN_BASE_URL = "https://api.tapin.ir/api/v2/public";

const ENDPOINTS = {
  CHECK_PRICE: `${TAPIN_BASE_URL}/order/post/check-price/`,
  REGISTER: `${TAPIN_BASE_URL}/order/post/register/`,
  PROVINCES: `${TAPIN_BASE_URL}/state/tree/`,
  CITIES: `${TAPIN_BASE_URL}/city/list/`,
} as const;

// ---------------------------------------------------------------------------
// Custom Error Class
// ---------------------------------------------------------------------------

export class TapinApiError extends Error {
  public readonly httpStatus: number;
  public readonly tapinStatus: number | null;
  public readonly tapinMessage: string | null;
  public readonly rawResponse: Record<string, unknown> | null;

  constructor(
    message: string,
    httpStatus: number = 500,
    tapinStatus: number | null = null,
    tapinMessage: string | null = null,
    rawResponse: Record<string, unknown> | null = null
  ) {
    super(message);
    this.name = "TapinApiError";
    this.httpStatus = httpStatus;
    this.tapinStatus = tapinStatus;
    this.tapinMessage = tapinMessage;
    this.rawResponse = rawResponse;
  }

  /**
   * Return user-friendly Persian error message
   */
  public getPersianMessage(): string {
    // Network/connection errors
    if (this.httpStatus === 0 || this.httpStatus >= 500) {
      return "سیستم ارسال (تاپین) در دسترس نیست. لطفاً بعداً تلاش کنید.";
    }
    // Auth errors
    if (this.httpStatus === 401 || this.httpStatus === 403) {
      return "خطای احراز هویت سرویس ارسال. لطفاً با پشتیبانی تماس بگیرید.";
    }
    // Not found
    if (this.httpStatus === 404) {
      return "سرویس ارسال مورد نظر یافت نشد.";
    }
    // Tapin business errors (they return HTTP 200 with returns.status != 200)
    if (this.tapinMessage) {
      return this.convertTapinMessage(this.tapinMessage);
    }
    // Fallback
    return this.message || "خطا در محاسبه هزینه ارسال";
  }

  /**
   * Convert Tapin error messages to Persian-friendly messages
   */
  private convertTapinMessage(msg: string): string {
    const msgLower = msg.toLowerCase();

    // Address validation errors
    if (msgLower.includes("address") || msgLower.includes("آدرس")) {
      return "آدرس وارد شده معتبر نیست. لطفاً آدرس کامل و صحیح وارد کنید.";
    }
    // City/province errors
    if (msgLower.includes("city") || msgLower.includes("شهر") || msgLower.includes("province") || msgLower.includes("استان")) {
      return "کد شهر یا استان وارد شده نامعتبر است.";
    }
    // Phone errors
    if (msgLower.includes("mobile") || msgLower.includes("phone") || msgLower.includes("موبایل") || msgLower.includes("تلفن")) {
      return "شماره تماس وارد شده معتبر نیست.";
    }
    // Postal code errors
    if (msgLower.includes("postal") || msgLower.includes("کد پستی")) {
      return "کد پستی وارد شده معتبر نیست.";
    }
    // Product errors
    if (msgLower.includes("product") || msgLower.includes("محصول")) {
      return "اطلاعات محصولات نامعتبر است.";
    }
    // Weight errors
    if (msgLower.includes("weight") || msgLower.includes("وزن")) {
      return "وزن بسته وارد شده نامعتبر است.";
    }
    // Shop errors
    if (msgLower.includes("shop") || msgLower.includes("فروشگاه")) {
      return "اطلاعات فروشگاه نامعتبر است. لطفاً با پشتیبانی تماس بگیرید.";
    }

    // Return the original Tapin message if we can't map it
    return msg;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get Tapin token from environment variables
 */
function getTapinToken(): string {
  const token = process.env.TAPIN_TOKEN;
  if (!token) {
    throw new TapinApiError(
      "TAPIN_TOKEN environment variable is not set",
      500,
      null,
      null,
      null
    );
  }
  return token;
}

/**
 * Get Tapin shop ID from environment variables
 */
export function getTapinShopId(): string {
  const shopId = process.env.TAPIN_SHOP_ID;
  if (!shopId) {
    throw new TapinApiError(
      "TAPIN_SHOP_ID environment variable is not set",
      500,
      null,
      null,
      null
    );
  }
  return shopId;
}

/**
 * Mask sensitive parts of a token for logging
 */
function maskToken(token: string): string {
  if (token.length <= 10) return token.slice(0, 4) + "****";
  return token.slice(0, 8) + "..." + token.slice(-4);
}

/**
 * Common headers for Tapin API requests
 */
function getHeaders(): Record<string, string> {
  const token = getTapinToken();

  // Debug logging for token
  console.log("================ TAPIN AUTH DEBUG ================");
  console.log("Raw Token Length:", token.length);
  console.log("Starts With jwt:", token.toLowerCase().startsWith("jwt "));
  console.log("First 10:", token.slice(0, 10));
  console.log("Last 10:", token.slice(-10));

  // Auto-prepend "jwt " if missing
  const finalToken = token.toLowerCase().startsWith("jwt ") ? token : `jwt ${token}`;

  console.log("Authorization Sent:", finalToken.slice(0, 20) + "...");
  console.log("Authorization Length:", finalToken.length);
  console.log("==================================================");

  return {
    "Content-Type": "application/json",
    Authorization: finalToken,
  };
}

/**
 * Log Tapin API request details - اضافه شده برای دیباگ
 */
function logRequest(endpoint: string, payload: Record<string, unknown>): void {
  const token = process.env.TAPIN_TOKEN || "";
  const masked = maskToken(token);
  
  console.log("========== 🔵 TAPIN REQUEST ==========");
  console.log("📍 Endpoint:", endpoint);
  console.log("🔑 Authorization:", masked);
  
  // =============== لاگ کامل دیتای ارسالی ===============
  console.log("📦 COMPLETE PAYLOAD BEING SENT TO TAPIN:");
  console.log(JSON.stringify(payload, null, 2));
  
  // لاگ جزئیات مهم
  console.log("\n📌 PAYLOAD DETAILS:");
  
  // 1. Location data (برای check-price)
  if ('state_code' in payload) {
    console.log(`  🏛️  state_code: ${payload.state_code} (${typeof payload.state_code})`);
  }
  if ('city_code' in payload) {
    console.log(`  🏙️  city_code: ${payload.city_code} (${typeof payload.city_code})`);
  }
  if ('send_type' in payload) {
    console.log(`  📬  send_type: ${payload.send_type}`);
  }
  
  // 2. Location object (برای register)
  if ('location' in payload && payload.location && typeof payload.location === 'object') {
    const location = payload.location as Record<string, unknown>;
    console.log("  📍 location:");
    for (const [key, value] of Object.entries(location)) {
      console.log(`    ${key}: ${value} (${typeof value})`);
    }
  }
  
  // 3. Order items
  if ('order_items' in payload && Array.isArray(payload.order_items)) {
    console.log(`  📦 order_items: ${payload.order_items.length} items`);
    payload.order_items.forEach((item: any, index: number) => {
      console.log(`    Item ${index + 1}:`, JSON.stringify(item, null, 2));
    });
  }
  
  // 4. Customer info
  if ('customer' in payload && payload.customer && typeof payload.customer === 'object') {
    const customer = payload.customer as Record<string, unknown>;
    console.log("  👤 customer:");
    for (const [key, value] of Object.entries(customer)) {
      console.log(`    ${key}: ${value} (${typeof value})`);
    }
  }
  
  // 5. Shop info
  if ('shop' in payload && payload.shop && typeof payload.shop === 'object') {
    const shop = payload.shop as Record<string, unknown>;
    console.log("  🏪 shop:");
    for (const [key, value] of Object.entries(shop)) {
      console.log(`    ${key}: ${value} (${typeof value})`);
    }
  }
  
  // 6. سایر فیلدها
  console.log("\n📋 OTHER FIELDS:");
  for (const [key, value] of Object.entries(payload)) {
    if (!['state_code', 'city_code', 'send_type', 'location', 'order_items', 'customer', 'shop'].includes(key)) {
      console.log(`  ${key}: ${JSON.stringify(value)} (${typeof value})`);
    }
  }
  
  console.log("======================================");
}

/**
 * Log Tapin API response details - اضافه شده برای دیباگ
 */
function logResponse(endpoint: string, httpStatus: number, responseData: Record<string, unknown>): void {
  console.log("========== 🟢 TAPIN RESPONSE =========");
  console.log("📍 Endpoint:", endpoint);
  console.log("📊 HTTP Status:", httpStatus);
  
  // =============== لاگ کامل پاسخ دریافتی ===============
  console.log("📦 COMPLETE RESPONSE FROM TAPIN:");
  console.log(JSON.stringify(responseData, null, 2));
  
  // لاگ returns
  if (responseData.returns) {
    console.log("\n📊 returns:", JSON.stringify(responseData.returns, null, 2));
  }
  
  // لاگ entries
  if (responseData.entries) {
    console.log("\n📦 entries:", JSON.stringify(responseData.entries, null, 2));
  }
  
  // لاگ status و message
  if (responseData.status !== undefined) {
    console.log(`📊 status: ${responseData.status}`);
  }
  if (responseData.message) {
    console.log(`📊 message: ${responseData.message}`);
  }
  
  console.log("======================================");
}

/**
 * Make a POST request to the Tapin API with error handling
 */
async function tapinPost<T extends Record<string, unknown>>(
  endpoint: string,
  payload: Record<string, unknown>
): Promise<T> {
  const token = getTapinToken();
  const headers = getHeaders();

  // =============== لاگ درخواست ===============
  logRequest(endpoint, payload);

  // Debug: log auth header details before fetch
  console.log("========== 🔧 TAPIN FETCH DEBUG ==========");
  console.log("Authorization Header:", (headers.Authorization || "").slice(0, 20) + "...");
  console.log("Authorization Length:", (headers.Authorization || "").length);
  console.log("Endpoint:", endpoint);
  console.log("===========================================");

  let httpStatus: number;
  let responseData: Record<string, unknown>;

  try {
    console.log("========== 📨 FINAL HEADERS ==========");
    console.log(headers);
    console.log("Authorization RAW:", headers.Authorization);
    console.log("======================================");
    
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    httpStatus = response.status;
    responseData = await response.json();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Network error";
    throw new TapinApiError(
      `ارتباط با سرویس تاپین برقرار نشد: ${errorMessage}`,
      503,
      null,
      null,
      null
    );
  }

  // =============== لاگ پاسخ ===============
  logResponse(endpoint, httpStatus, responseData);

  // Check for non-HTTP-200 status codes
  if (httpStatus < 200 || httpStatus >= 300) {
    const returns = responseData.returns as { status: number; message: string } | undefined;
    const tapinMessage = returns?.message || (responseData.message as string) || "خطا در ارتباط با سرویس تاپین";

    console.error("========== ❌ TAPIN ERROR ==========");
    console.error("HTTP Status:", httpStatus);
    console.error("returns.status:", returns?.status ?? "N/A");
    console.error("returns.message:", returns?.message ?? "N/A");
    console.error("Full Response:", JSON.stringify(responseData, null, 2));
    console.error("=====================================");

    throw new TapinApiError(
      tapinMessage,
      httpStatus,
      returns?.status ?? null,
      returns?.message ?? null,
      responseData as Record<string, unknown>
    );
  }

  // Check for Tapin business logic errors (HTTP 200 but returns.status != 200)
  const returns = responseData.returns as { status: number; message: string } | undefined;
  if (returns && returns.status !== 200) {
    const tapinMessage = returns.message || "خطا در سرویس تاپین";

    console.error("========== ❌ TAPIN BUSINESS ERROR ==========");
    console.error("HTTP Status:", httpStatus);
    console.error("returns.status:", returns.status);
    console.error("returns.message:", returns.message);
    console.error("Full Response:", JSON.stringify(responseData, null, 2));
    console.error("==============================================");

    throw new TapinApiError(
      tapinMessage,
      httpStatus,
      returns.status,
      returns.message,
      responseData as Record<string, unknown>
    );
  }

  return responseData as unknown as T;
}

// ---------------------------------------------------------------------------
// Province and City Services
// ---------------------------------------------------------------------------

/**
 * Fetch all provinces from Tapin API
 * POST https://api.tapin.ir/api/v2/public/state/tree/
 *
 * @returns Array of provinces with their codes and cities
 */
export async function getProvinces(): Promise<TapinProvince[]> {
  console.log("========== 🌍 FETCHING TAPIN PROVINCES ==========");

  const response = await tapinPost<TapinProvinceTreeResponse>(
    ENDPOINTS.PROVINCES,
    {}
  );

  // The response may have entries as an array of provinces
  const entries = response.entries;
  if (!entries || !Array.isArray(entries)) {
    throw new TapinApiError(
      "خطا در دریافت لیست استان‌ها از سرویس تاپین",
      200,
      null,
      "No entries in province response",
      response as unknown as Record<string, unknown>
    );
  }

  console.log(`Fetched ${entries.length} provinces from Tapin`);
  return entries;
}

/**
 * Fetch cities for a given state code from Tapin API
 * POST https://api.tapin.ir/api/v2/public/city/list/
 *
 * @param stateCode - The province/state code to fetch cities for
 * @returns Array of cities with their codes
 */
export async function getCities(stateCode: string): Promise<TapinCity[]> {
  console.log(`========== 🏙️ FETCHING TAPIN CITIES FOR STATE: ${stateCode} ==========`);

  const response = await tapinPost<TapinCityListResponse>(
    ENDPOINTS.CITIES,
    { state_code: stateCode }
  );

  const entries = response.entries;
  if (!entries || !Array.isArray(entries)) {
    throw new TapinApiError(
      `خطا در دریافت لیست شهرهای استان از سرویس تاپین`,
      200,
      null,
      "No entries in city response",
      response as unknown as Record<string, unknown>
    );
  }

  console.log(`Fetched ${entries.length} cities for state ${stateCode}`);
  return entries;
}

// ---------------------------------------------------------------------------
// Shipping Cost Calculation
// ---------------------------------------------------------------------------

/**
 * Calculate shipping cost via Tapin API
 * POST https://api.tapin.ir/api/v2/public/order/post/check-price/
 *
 * @param payload - The check price request payload
 * @returns Shipping cost result with totalPrice and sendPrice
 *
 * @throws TapinApiError if the API call fails
 */
export async function calculateShippingCost(
  payload: TapinCheckPriceRequest
): Promise<ShippingCostResult> {
  console.log("========== 💰 TAPIN CALCULATE SHIPPING COST ==========");
  
  // =============== لاگ دیتای ورودی به تابع ===============
  console.log("📥 INPUT DATA TO calculateShippingCost:");
  console.log(JSON.stringify(payload, null, 2));

  const response = await tapinPost<TapinApiResponse>(
    ENDPOINTS.CHECK_PRICE,
    payload as unknown as Record<string, unknown>
  );

  // Extract entries - could be a single object or array
  const entries = response.entries;
  if (!entries) {
    throw new TapinApiError(
      "پاسخ ناقص از سرویس محاسبه هزینه ارسال دریافت شد",
      200,
      null,
      "No entries in response",
      response as unknown as Record<string, unknown>
    );
  }

  // Handle array of entries or single entry
  const entry: TapinResponseEntry = Array.isArray(entries) ? entries[0] : entries;

  if (!entry) {
    throw new TapinApiError(
      "پاسخ خالی از سرویس محاسبه هزینه ارسال دریافت شد",
      200,
      null,
      "Empty entries",
      response as unknown as Record<string, unknown>
    );
  }

  // Read from total_price or send_price
  const totalPrice = typeof entry.total_price === "number" ? entry.total_price : 0;
  const sendPrice = typeof entry.send_price === "number" ? entry.send_price : 0;

  if (totalPrice === 0 && sendPrice === 0) {
    throw new TapinApiError(
      "هزینه ارسال از سرویس تاپین دریافت نشد",
      200,
      null,
      "Zero price returned",
      response as unknown as Record<string, unknown>
    );
  }

  console.log("Shipping cost calculated:");
  console.log("  total_price:", totalPrice);
  console.log("  send_price:", sendPrice);

  return {
    totalPrice,
    sendPrice,
  };
}

// ---------------------------------------------------------------------------
// Shipment Creation
// ---------------------------------------------------------------------------

/**
 * Create a shipment order in Tapin
 * POST https://api.tapin.ir/api/v2/public/order/post/register/
 *
 * This should be called after payment is confirmed.
 *
 * @param payload - The register shipment request payload
 * @returns Shipment details including id, barcode, order_id, and send price
 *
 * @throws TapinApiError if the API call fails
 */
export async function createShipment(
  payload: TapinRegisterRequest
): Promise<ShipmentResult> {
  console.log("========== 📦 TAPIN CREATE SHIPMENT ==========");
  
  // =============== لاگ دیتای ورودی به تابع ===============
  console.log("📥 INPUT DATA TO createShipment:");
  console.log(JSON.stringify(payload, null, 2));

  const response = await tapinPost<TapinApiResponse>(
    ENDPOINTS.REGISTER,
    payload as unknown as Record<string, unknown>
  );

  // Extract entries
  const entries = response.entries;
  if (!entries) {
    throw new TapinApiError(
      "پاسخ ناقص از سرویس ثبت سفارش ارسال دریافت شد",
      200,
      null,
      "No entries in response",
      response as unknown as Record<string, unknown>
    );
  }

  // Handle array of entries or single entry
  const entry: TapinResponseEntry = Array.isArray(entries) ? entries[0] : entries;

  if (!entry) {
    throw new TapinApiError(
      "پاسخ خالی از سرویس ثبت سفارش ارسال دریافت شد",
      200,
      null,
      "Empty entries",
      response as unknown as Record<string, unknown>
    );
  }

  // Validate required fields
  const id = entry.id;
  const barcode = entry.barcode;
  const orderId = entry.order_id;
  const sendPrice = typeof entry.send_price === "number" ? entry.send_price : 0;

  if (!id || !barcode || !orderId) {
    const missing: string[] = [];
    if (!id) missing.push("id");
    if (!barcode) missing.push("barcode");
    if (!orderId) missing.push("order_id");

    throw new TapinApiError(
      "پاسخ ناقص از سرویس ثبت سفارش ارسال دریافت شد",
      200,
      null,
      `Missing fields: ${missing.join(", ")}`,
      response as unknown as Record<string, unknown>
    );
  }

  console.log("Shipment created successfully:");
  console.log("  id:", id);
  console.log("  barcode:", barcode);
  console.log("  order_id:", orderId);
  console.log("  send_price:", sendPrice);

  return {
    id,
    barcode,
    orderId,
    sendPrice,
  };
}