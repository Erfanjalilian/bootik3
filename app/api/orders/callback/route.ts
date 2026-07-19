// ============================================================================
// Zibal Payment Callback Route
// Handles the redirect from Zibal payment gateway after payment attempt
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { verifyPayment, ZibalApiError } from "@/lib/services/zibal";

/**
 * Success page URL (relative to APP_URL)
 */
const SUCCESS_PATH = "/payment/success";

/**
 * Failure page URL (relative to APP_URL)
 */
const FAILURE_PATH = "/payment/failure";

/**
 * Handle the callback redirect from Zibal payment gateway
 *
 * Zibal redirects the user to this endpoint after a payment attempt.
 * We verify the transaction with Zibal and redirect the user accordingly.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const trackIdParam = searchParams.get("trackId");
  const successParam = searchParams.get("success");
  const statusParam = searchParams.get("status");

  // Log incoming callback parameters
  console.log("========== ZIBAL CALLBACK RECEIVED ==========");
  console.log("trackId:", trackIdParam);
  console.log("success:", successParam);
  console.log("status:", statusParam);
  console.log("=============================================");

  // If Zibal indicates failure, redirect to failure page
  if (successParam === "0" || statusParam === "0") {
    return NextResponse.redirect(
      new URL(`${FAILURE_PATH}?reason=payment_cancelled&trackId=${trackIdParam || ""}`, process.env.APP_URL!)
    );
  }

  // Validate trackId
  if (!trackIdParam) {
    console.error("ZIBAL CALLBACK ERROR: Missing trackId parameter");
    return NextResponse.redirect(
      new URL(`${FAILURE_PATH}?reason=missing_track_id`, process.env.APP_URL!)
    );
  }

  const trackId = parseInt(trackIdParam, 10);

  if (isNaN(trackId) || trackId <= 0) {
    console.error("ZIBAL CALLBACK ERROR: Invalid trackId:", trackIdParam);
    return NextResponse.redirect(
      new URL(`${FAILURE_PATH}?reason=invalid_track_id`, process.env.APP_URL!)
    );
  }

  try {
    // Verify the payment with Zibal
    // expectedAmount is not passed here; it should be retrieved from stored order data
    // and passed to verifyPayment for security validation
    const transaction = await verifyPayment(trackId);

    // Log successful verification
    console.log("========== PAYMENT VERIFIED SUCCESSFULLY ==========");
    console.log("TrackId:", transaction.trackId);
    console.log("RefNumber:", transaction.refNumber);
    console.log("CardNumber:", transaction.cardNumber);
    console.log("Amount:", transaction.amount);
    console.log("Status:", transaction.status);
    console.log("==================================================");

    // TODO: Update order status in database/data store
    // The orderId should be retrieved from stored order data using trackId
    // Then update the order status to "completed" and save payment info
    //
    // Example:
    // const order = getOrderByTrackId(trackId);
    // if (order) {
    //   updateOrderStatus(order.id, "completed", {
    //     trackId: transaction.trackId,
    //     refNumber: transaction.refNumber,
    //     cardNumber: transaction.cardNumber,
    //     amount: transaction.amount,
    //   });
    // }

    // Redirect to success page with transaction details
    const successUrl = new URL(SUCCESS_PATH, process.env.APP_URL!);
    successUrl.searchParams.set("trackId", transaction.trackId.toString());
    successUrl.searchParams.set("refNumber", transaction.refNumber.toString());
    successUrl.searchParams.set("status", "success");

    return NextResponse.redirect(successUrl);
  } catch (error) {
    // Handle Zibal API errors
    if (error instanceof ZibalApiError) {
      console.error("ZIBAL VERIFY ERROR:", {
        code: error.code,
        message: error.message,
        persianMessage: error.getPersianMessage(),
        trackId: error.trackId,
      });

      const failureUrl = new URL(FAILURE_PATH, process.env.APP_URL!);
      failureUrl.searchParams.set("reason", `verify_error_${error.code}`);
      failureUrl.searchParams.set("trackId", trackIdParam);
      failureUrl.searchParams.set("message", error.getPersianMessage());

      return NextResponse.redirect(failureUrl);
    }

    // Handle unexpected errors
    console.error("ZIBAL CALLBACK UNEXPECTED ERROR:", error);

    const failureUrl = new URL(FAILURE_PATH, process.env.APP_URL!);
    failureUrl.searchParams.set("reason", "unexpected_error");
    failureUrl.searchParams.set("trackId", trackIdParam);

    return NextResponse.redirect(failureUrl);
  }
}