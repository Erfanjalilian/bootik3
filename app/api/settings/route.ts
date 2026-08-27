import { NextResponse } from "next/server";
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getSettings(), {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
