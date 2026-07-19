// ============================================================================
// Zibal Payment Gateway Service
// Based on official Zibal API documentation
// Version: 1.0.0
// ============================================================================

// ---------------------------------------------------------------------------
// Types & Interfaces
// ---------------------------------------------------------------------------

/**
 * Request payload sent to Zibal for initiating a payment
 */
export interface ZibalPaymentRequest {
  merchant: string;
  amount: number;
  callbackUrl: string;
  description?: string;
  orderId?: string;
  mobile?: string;
}

/**
 * Response received from Zibal after a payment request
 */
export interface ZibalPaymentResponse {
  result: number;
  trackId: number;
  message: string;
}

/**
 * Request payload sent to Zibal for verifying a payment
 */
export interface ZibalVerifyRequest {
  merchant: string;
  trackId: number;
}

/**
 * Response received from Zibal after a verification request
 */
export interface ZibalVerifyResponse {
  result: number;
  status: number;
  trackId: number;
  refNumber: number;
  cardNumber: string;
  amount: number;
  message: string;
  description?: string;
  orderId?: string;
  paidAt?: string;
}

/**
 * Human-readable result codes from Zibal API
 */
interface ZibalResultMessage {
  [key: number]: string;
}

/**
 * Standardized payment data to be persisted after successful verification
 */
export interface PaymentTransaction {
  trackId: number;
  refNumber: number;
  cardNumber: string;
  amount: number;
  message: string;
  status: number;
  paidAt?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ZIBAL_API_BASE = "https://gateway.zibal.ir/v1";
const ZIBAL_REQUEST_URL = `${ZIBAL_API_BASE}/request`;
const ZIBAL_VERIFY_URL = `${ZIBAL_API_BASE}/verify`;
const ZIBAL_START_URL = "https://gateway.zibal.ir/start";

const ZIBAL_RESULT_MESSAGES: ZibalResultMessage = {
  100: "با موفقیت تایید شد",
  102: "merchant یافت نشد",
  103: "merchant غیرفعال",
  104: "merchant معتبر نیست",
  105: "مبلغ باید بزرگتر از 1,000 ریال باشد",
  106: "callbackUrl معتبر نیست",
  113: "مبلغ پرداخت با مبلغ درخواست مطابقت ندارد",
  201: "پرداخت ناموفق بود",
  202: "پرداخت ناموفق بود",
};

// ---------------------------------------------------------------------------
// Error Classes
// ---------------------------------------------------------------------------

/**
 * Custom error class for Zibal API errors
 */
export class ZibalApiError extends Error {
  public readonly code: number;
  public readonly trackId: number | null;
  public readonly rawResponse: Record<string, unknown> | null;

  constructor(code: number, message: string, trackId: number | null = null, rawResponse: Record<string, unknown> | null = null) {
    super(message);
    this.name = "ZibalApiError";
    this.code = code;
    this.trackId = trackId;
    this.rawResponse = rawResponse;
  }

  /**
   * Returns a Persian-friendly error message based on the result code
   */
  public getPersianMessage(): string {
    switch (this.code) {
      case 102:
        return "شناسه مرچنت یافت نشد";
      case 103:
        return "شناسه مرچنت غیرفعال است";
      case 104:
        return "شناسه مرچنت معتبر نیست";
      case 105:
        return "مبلغ باید بزرگتر از 1,000 ریال باشد";
      case 106:
        return "آدرس Callback معتبر نیست";
      case 113:
        return "مبلغ پرداخت با مبلغ درخواست مطابقت ندارد";
      case 201:
      case 202:
        return "پرداخت ناموفق بود";
      default:
        return this.message || "خطای ناشناخته در ارتباط با درگاه پرداخت";
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Retrieve merchant ID from environment variables
 */
function getMerchant(): string {
  const merchant = process.env.ZIBAL_MERCHANT;
  if (!merchant) {
    throw new ZibalApiError(0, "ZIBAL_MERCHANT environment variable is not set");
  }
  return merchant;
}

/**
 * Retrieve application base URL from environment variables
 */
function getAppUrl(): string {
  const appUrl = process.env.APP_URL;
  if (!appUrl) {
    throw new ZibalApiError(0, "APP_URL environment variable is not set");
  }
  return appUrl.replace(/\/+$/, ""); // Remove trailing slash if present
}

/**
 * Construct the callback URL for Zibal redirect
 */
export function getCallbackUrl(): string {
  const appUrl = getAppUrl();
  return `${appUrl}/api/orders/callback`;
}

/**
 * Build the Zibal payment gateway URL for redirecting the user
 */
export function getPaymentGatewayUrl(trackId: number): string {
  return `${ZIBAL_START_URL}/${trackId}`;
}

/**
 * Resolve a Zibal result code to a human-readable message (English)
 */
function getResultMessage(code: number): string {
  return ZIBAL_RESULT_MESSAGES[code] || "نتیجه نامشخص";
}

// ---------------------------------------------------------------------------
// Logging Helpers
// ---------------------------------------------------------------------------

/**
 * Log payment request details before sending to Zibal
 */
function logPaymentRequest(payload: ZibalPaymentRequest): void {
  console.log("=".repeat(30));
  console.log("APP_URL  =", process.env.APP_URL || "NOT SET");
  console.log("CALLBACK =", payload.callbackUrl);
  console.log("MERCHANT =", payload.merchant);
  console.log("AMOUNT   =", payload.amount);
  console.log("ORDER_ID =", payload.orderId || "N/A");
  console.log("MOBILE   =", payload.mobile || "N/A");
  console.log("=".repeat(30));
}

/**
 * Log Zibal API response for debugging
 */
function logPaymentResponse(response: Record<string, unknown>, httpStatus: number): void {
  console.log("========== ZIBAL REQUEST ==========");
  console.log("HTTP Status:", httpStatus);
  console.log("Result:", response.result);
  console.log("TrackId:", response.trackId);
  console.log("Message:", response.message);
  console.log("Raw Response:", JSON.stringify(response, null, 2));
  console.log("===================================");
}

/**
 * Log verify request details before sending to Zibal
 */
function logVerifyRequest(payload: ZibalVerifyRequest): void {
  console.log("========== ZIBAL VERIFY REQUEST ==========");
  console.log("MERCHANT =", payload.merchant);
  console.log("TRACK_ID =", payload.trackId);
  console.log("==========================================");
}

/**
 * Log verify response from Zibal for debugging
 */
function logVerifyResponse(response: Record<string, unknown>, httpStatus: number): void {
  console.log("========== ZIBAL VERIFY RESPONSE ==========");
  console.log("HTTP Status:", httpStatus);
  console.log("Result:", response.result);
  console.log("Status:", response.status);
  console.log("TrackId:", response.trackId);
  console.log("RefNumber:", response.refNumber);
  console.log("CardNumber:", response.cardNumber);
  console.log("Amount:", response.amount);
  console.log("Message:", response.message);
  console.log("Raw Response:", JSON.stringify(response, null, 2));
  console.log("===========================================");
}

// ---------------------------------------------------------------------------
// API Functions
// ---------------------------------------------------------------------------

/**
 * Send a payment request to Zibal gateway
 *
 * @param amount   - Transaction amount in IRR (Rial)
 * @param orderId  - Unique order identifier
 * @param options  - Optional parameters (description, mobile)
 * @returns        - Object containing trackId and gateway URL
 *
 * @throws ZibalApiError if the request fails or Zibal returns a non-100 result
 */
export async function requestPayment(
  amount: number,
  orderId: string,
  options?: { description?: string; mobile?: string }
): Promise<{ trackId: number; gatewayUrl: string }> {
  const merchant = getMerchant();
  const callbackUrl = getCallbackUrl();

  const payload: ZibalPaymentRequest = {
    merchant,
    amount,
    callbackUrl,
    ...(options?.description && { description: options.description }),
    ...(options?.mobile && { mobile: options.mobile }),
    ...(orderId && { orderId }),
  };

  // Log request details for debugging
  logPaymentRequest(payload);

  let httpStatus: number;
  let responseData: Record<string, unknown>;

  try {
    const response = await fetch(ZIBAL_REQUEST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    httpStatus = response.status;
    responseData = await response.json();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Network error";
    throw new ZibalApiError(0, `ارتباط با درگاه زیبال برقرار نشد: ${errorMessage}`);
  }

  // Log response for debugging
  logPaymentResponse(responseData, httpStatus);

  const result = responseData.result as number;
  const trackId = responseData.trackId as number;
  const message = (responseData.message as string) || getResultMessage(result);

  if (result !== 100 || !trackId) {
    throw new ZibalApiError(result, message, null, responseData);
  }

  return {
    trackId,
    gatewayUrl: getPaymentGatewayUrl(trackId),
  };
}

/**
 * Verify a payment transaction with Zibal gateway
 *
 * @param trackId - The transaction tracking ID returned from payment request
 * @param expectedAmount - The expected amount to verify against (security check)
 *
 * @returns - Payment transaction details if verification succeeds
 *
 * @throws ZibalApiError if verification fails or amount mismatch
 */
export async function verifyPayment(
  trackId: number,
  expectedAmount?: number
): Promise<PaymentTransaction> {
  const merchant = getMerchant();

  const payload: ZibalVerifyRequest = {
    merchant,
    trackId,
  };

  // Log verify request
  logVerifyRequest(payload);

  let httpStatus: number;
  let responseData: Record<string, unknown>;

  try {
    const response = await fetch(ZIBAL_VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    httpStatus = response.status;
    responseData = await response.json();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Network error";
    throw new ZibalApiError(0, `ارتباط با زیبال برای تایید پرداخت برقرار نشد: ${errorMessage}`);
  }

  // Log verify response
  logVerifyResponse(responseData, httpStatus);

  const result = responseData.result as number;
  const message = (responseData.message as string) || getResultMessage(result);

  if (result !== 100) {
    throw new ZibalApiError(result, message, trackId, responseData);
  }

  // Extract verified transaction data
  const verifiedResponse = responseData as unknown as ZibalVerifyResponse;

  // Security check: validate amount if expectedAmount provided
  if (expectedAmount !== undefined && verifiedResponse.amount !== expectedAmount) {
    throw new ZibalApiError(
      113,
      `مبلغ پرداخت (${verifiedResponse.amount}) با مبلغ درخواست (${expectedAmount}) مطابقت ندارد`,
      trackId,
      responseData
    );
  }

  return {
    trackId: verifiedResponse.trackId,
    refNumber: verifiedResponse.refNumber,
    cardNumber: verifiedResponse.cardNumber,
    amount: verifiedResponse.amount,
    message: verifiedResponse.message,
    status: verifiedResponse.status,
    paidAt: verifiedResponse.paidAt,
  };
}