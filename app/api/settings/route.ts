import { NextResponse } from "next/server";
import { getSettings } from "@/lib/data";

export async function GET() {
  return NextResponse.json(getSettings());
}
