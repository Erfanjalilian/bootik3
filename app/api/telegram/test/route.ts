/**
 * Telegram Test Endpoint
 * Tests if Telegram Bot configuration is correct
 * 
 * GET /api/telegram/test
 * Returns: { success: boolean, message: string, details?: {...} }
 */

import { NextRequest, NextResponse } from "next/server";
import { testTelegramConnection } from "@/lib/telegram";

export async function GET(request: NextRequest) {
  try {
    const result = await testTelegramConnection();

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        message: `❌ Test endpoint error: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
