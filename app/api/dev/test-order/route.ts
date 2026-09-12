// ============================================================================
// DEVELOPMENT-ONLY Test Order Endpoint
// ----------------------------------------------------------------------------
// Creates a REAL order in data/orders.json (same store/logic used by real
// orders), simulates a successful payment (mocked trackId/refNumber, exactly
// like the Zibal callback flow), and then sends the REAL Telegram order
// notification via the same `sendOrderNotification()` used for real orders.
//
// - NO real payment gateway call
// - NO stock decrement
// - NO email / SMS
// - Only enabled when NODE_ENV === "development"
// ============================================================================

import { NextResponse } from "next/server";
import { getProducts } from "@/lib/data";
import { createUser } from "@/lib/auth/store";
import { createOrder, updateOrderStatus } from "@/lib/orders/store";
import { sendOrderNotification } from "@/lib/telegram";
import type { Order, OrderItem, OrderShippingInfo, ShippingAddress } from "@/lib/orders/types";

// ---------------------------------------------------------------------------
// Dev-only guard
// ---------------------------------------------------------------------------
const DEV_ONLY = process.env.NODE_ENV === "development";

// ---------------------------------------------------------------------------
// Test fixtures (customer information requested for the test order)
// ---------------------------------------------------------------------------
const TEST_USER_PHONE = "989000000000"; // normalized form of 09000000000

const TEST_ADDRESS: ShippingAddress = {
  firstName: "Test Customer",
  lastName: "Telegram Test",
  phone: "09000000000",
  province: "تهران",
  city: "تهران",
  address: "آدرس تست — سفارش آزمایشی Telegram (بدون ارسال واقعی)",
  postalCode: "1234567890",
};

const TEST_SHIPPING: OrderShippingInfo = {
  method: "post",
  title: "ارسال با پست",
  cost: 160000,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Remove the Telegram bot token from any message before it is returned/logged */
function redactToken(message: string): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (token && message.includes(token)) {
    return message.split(token).join("[TOKEN REDACTED]");
  }
  return message;
}

/**
 * Core test logic:
 * 1. Pick a real in-stock product from the database
 * 2. Create/reuse a dedicated test customer
 * 3. Build the order items + amount using real product pricing (like checkout)
 * 4. Create the order via the REAL order store
 * 5. Simulate "payment success" (dev-only) using the SAME updateOrderStatus
 *    call that the Zibal callback uses for real paid orders
 * 6. Send the REAL Telegram notification with the test marker
 */
async function createAndNotifyTestOrder(): Promise<{
  order: Order;
  telegramNotification: boolean;
  telegramError?: string;
}> {
  // 1. Real product from data/products.json
  const available = getProducts().filter((p) => p.stock > 0 && p.images.length > 0);
  if (available.length === 0) {
    throw new Error("No in-stock product found in data/products.json");
  }
  const product = available[0];

  // 2. Test customer (idempotent — created once, reused afterwards)
  const testUser = await createUser(TEST_USER_PHONE);

  // 3. Order items from the real product + real shipping (same as checkout)
  const items: OrderItem[] = [
    {
      productId: String(product.id),
      name: product.name,
      price: product.price,
      quantity: 1,
      color: product.colors[0]?.name ?? "",
      size: product.sizes[0] ?? "",
      image: product.images[0],
    },
  ];
  const totalAmount =
    items.reduce((sum, item) => sum + item.price * item.quantity, 0) + TEST_SHIPPING.cost;

  // 4. Create the order through the REAL store (real id + real createdAt)
  const order = await createOrder({
    userId: testUser.id,
    items,
    totalAmount,
    shippingAddress: TEST_ADDRESS,
    shipping: TEST_SHIPPING,
  });

  // 5. Mock payment success — mirrors what app/api/orders/callback/route.ts does
  //    for a real PAID order (status -> "paid", trackId + refNumber saved)
  const mockTrackId = Math.floor(1000000000 + Math.random() * 9000000000);
  const mockRefNumber = Math.floor(100000 + Math.random() * 900000);
  const paidOrder = await updateOrderStatus(order.id, "paid", {
    trackId: mockTrackId,
    refNumber: mockRefNumber,
  });
  if (!paidOrder) {
    throw new Error("Failed to mark test order as paid");
  }
  console.log(`[dev/test-order] Test order ${paidOrder.id} marked as paid (mocked payment)`);

  // 6. Send the REAL Telegram notification (same function used for real orders)
  let telegramNotification = false;
  let telegramError: string | undefined;

  try {
    await sendOrderNotification(paidOrder, { isTest: true });
    telegramNotification = true;
  } catch (error) {
    // Order must never crash because of Telegram. Log details (token redacted)
    // and report the status in the API response.
    telegramError = redactToken(error instanceof Error ? error.message : String(error));
    console.error(
      `[dev/test-order] ❌ Telegram notification failed for test order ${paidOrder.id}: ${telegramError}`
    );
  }

  console.log(
    `[dev/test-order] ✅ Test order ${paidOrder.id} ready (totalAmount=${totalAmount}, telegram=${telegramNotification})`
  );

  return { order: paidOrder, telegramNotification, telegramError };
}

// ---------------------------------------------------------------------------
// Request handlers — both GET (easy browser test) and POST (programmatic)
// ---------------------------------------------------------------------------

const forbidden = () =>
  NextResponse.json(
    {
      success: false,
      telegramNotification: false,
      message: "Not available outside development environment",
    },
    { status: 403 }
  );

export async function GET() {
  if (!DEV_ONLY) return forbidden();
  return handleTestOrder();
}

export async function POST() {
  if (!DEV_ONLY) return forbidden();
  return handleTestOrder();
}

async function handleTestOrder() {
  try {
    const result = await createAndNotifyTestOrder();

    return NextResponse.json({
      success: true,
      telegramNotification: result.telegramNotification,
      ...(result.telegramError ? { telegramError: result.telegramError } : {}),
      order: {
        id: result.order.id,
        status: result.order.status,
        totalAmount: result.order.totalAmount,
        trackId: result.order.trackId,
        refNumber: result.order.refNumber,
        shipping: result.order.shipping,
        items: result.order.items,
        shippingAddress: result.order.shippingAddress,
        createdAt: result.order.createdAt,
        paidAt: result.order.paidAt,
      },
    });
  } catch (error) {
    const message = redactToken(error instanceof Error ? error.message : String(error));
    console.error(`[dev/test-order] ❌ Failed to create test order: ${message}`);
    return NextResponse.json(
      {
        success: false,
        telegramNotification: false,
        message,
      },
      { status: 500 }
    );
  }
}