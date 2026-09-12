/**
 * Telegram Bot Service
 * Handles sending order notifications to Telegram
 * Token is stored in TELEGRAM_BOT_TOKEN environment variable (server-side only)
 */

import type { Order } from "./orders/types";

interface TelegramInlineKeyboard {
  text: string;
  url: string;
}

interface TelegramMessage {
  chat_id: string;
  text: string;
  parse_mode: "HTML" | "Markdown";
  reply_markup?: {
    inline_keyboard: TelegramInlineKeyboard[][];
  };
}

/**
 * Sanitize order ID for safe display (show first 8 chars)
 */
function formatOrderId(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

/**
 * Format price in Persian locale
 */
function formatPrice(price: number): string {
  return price.toLocaleString("fa-IR");
}

/**
 * Format date in Persian locale
 */
function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Escape special characters for Telegram HTML parsing
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Remove the Telegram bot token from any message before it is logged
 * Ensures the token is never written to server logs
 */
function redactToken(message: string): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (token && message.includes(token)) {
    return message.split(token).join("[TOKEN REDACTED]");
  }
  return message;
}

/**
 * Build formatted Telegram message for new paid order
 */
function buildOrderMessage(
  order: Order,
  isTest: boolean = false
): { text: string; keyboard: TelegramInlineKeyboard[][] } {
  const customer = order.shippingAddress;
  const orderItems = order.items
    .map((item) => `• ${escapeHtml(item.name)} × ${item.quantity}`)
    .join("\n");

  // Optional test marker — only prepended for development test orders.
  // Real store orders keep the original message exactly as before.
  const testMarker = isTest ? "🧪 <b>TEST ORDER</b>\n\n" : "";
  const text = `${testMarker}🛒 <b>سفارش جدید</b>

━━━━━━━━━━━━━━━━━━━━
📦 <b>شماره سفارش:</b> <code>#${formatOrderId(order.id)}</code>

👤 <b>مشتری:</b>
${escapeHtml(customer.firstName)} ${escapeHtml(customer.lastName)}

📱 <b>شماره موبایل:</b>
<code>${customer.phone}</code>

💰 <b>مبلغ:</b>
${formatPrice(order.totalAmount)} تومان

💳 <b>وضعیت پرداخت:</b>
✅ پرداخت موفق

📦 <b>محصولات:</b>
${orderItems}

⏰ <b>تاریخ سفارش:</b>
${formatDate(order.createdAt)}
━━━━━━━━━━━━━━━━━━━━`;

  // Inline keyboard with "View Order" button
  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const adminOrderUrl = `${appUrl}/admin1383/orders`;
  
  const keyboard: TelegramInlineKeyboard[][] = [
    [
      {
        text: "🔎 مشاهده سفارش",
        url: adminOrderUrl,
      },
    ],
  ];

  return { text, keyboard };
}

/**
 * Send a message to Telegram
 * @param message - Telegram message object
 * @throws Error if API call fails
 */
async function sendTelegramMessage(message: TelegramMessage): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  }

  if (!chatId) {
    throw new Error("TELEGRAM_CHAT_ID is not configured");
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...message,
      chat_id: chatId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    // Don't expose token in error messages
    const errorMessage =
      error.description || `Telegram API error: ${response.status}`;
    throw new Error(errorMessage);
  }

  const result = await response.json();

  if (!result.ok) {
    const errorMessage = result.description || "Unknown Telegram API error";
    throw new Error(errorMessage);
  }
}

/**
 * Send order notification to Telegram
 * This function is called when an order payment is successfully verified
 *
 * @param order - The order object with all details
 * @throws Error if sending fails (but this error should be caught and logged server-side)
 */
export async function sendOrderNotification(
  order: Order,
  options?: { isTest?: boolean }
): Promise<void> {
  try {
    const { text, keyboard } = buildOrderMessage(order, options?.isTest === true);

    // Telegram Bot API only accepts HTTPS URLs for inline keyboard buttons.
    // In development APP_URL is usually http://localhost:3000, so attaching
    // the button would make Telegram reject the entire message. In that case
    // we send the notification text WITHOUT the button. Production (HTTPS)
    // keeps the button exactly as before.
    const keyboardUrl = keyboard[0]?.[0]?.url ?? "";
    const replyMarkup = keyboardUrl.startsWith("https://")
      ? { inline_keyboard: keyboard }
      : undefined;

    await sendTelegramMessage({
      chat_id: process.env.TELEGRAM_CHAT_ID!,
      text,
      parse_mode: "HTML",
      ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
    });

    console.log(`✅ Telegram notification sent for order ${order.id}`);
  } catch (error) {
    // Log the error but don't throw - order should still be successful
    const errorMessage = error instanceof Error ? error.message : String(error);
    // Don't log token in error messages (redact for extra safety)
    console.error(
      `❌ Failed to send Telegram notification for order ${order.id}: ${redactToken(errorMessage)}`
    );
    // Re-throw so caller can handle it appropriately
    throw error;
  }
}

/**
 * Test function to verify Telegram configuration
 * This sends a simple test message to Telegram
 *
 * @throws Error if configuration is invalid or API call fails
 */
export async function testTelegramConnection(): Promise<{
  success: boolean;
  message: string;
  details?: {
    botToken: string;
    chatId: string;
  };
}> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token) {
    return {
      success: false,
      message: "❌ TELEGRAM_BOT_TOKEN is not configured in .env.local",
    };
  }

  if (!chatId) {
    return {
      success: false,
      message: "❌ TELEGRAM_CHAT_ID is not configured in .env.local",
    };
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: "🧪 <b>تست اتصال Telegram</b>\n\nاگر این پیام را دریافت کردید، تنظیمات Telegram صحیح است! ✅",
        parse_mode: "HTML",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        message: `❌ Telegram API Error: ${error.description || response.status}`,
        details: {
          botToken: `${token.slice(0, 10)}...`,
          chatId,
        },
      };
    }

    const result = await response.json();

    if (!result.ok) {
      return {
        success: false,
        message: `❌ Telegram API Error: ${result.description || "Unknown error"}`,
        details: {
          botToken: `${token.slice(0, 10)}...`,
          chatId,
        },
      };
    }

    return {
      success: true,
      message: "✅ Telegram connection test successful! Message sent to chat.",
      details: {
        botToken: `${token.slice(0, 10)}... (hidden for security)`,
        chatId,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `❌ Connection failed: ${errorMessage}`,
      details: {
        botToken: `${token.slice(0, 10)}...`,
        chatId,
      },
    };
  }
}
