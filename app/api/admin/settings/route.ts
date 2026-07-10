import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { SiteSettings } from "@/lib/types";
import { getSettings } from "@/lib/data";

const dataDir = path.join(process.cwd(), "data");
const settingsFile = path.join(dataDir, "settings.json");

async function readSettings(): Promise<SiteSettings> {
  try {
    const content = await fs.readFile(settingsFile, "utf-8");
    return JSON.parse(content);
  } catch {
    return getSettings();
  }
}

async function writeSettings(settings: SiteSettings): Promise<void> {
  await fs.writeFile(settingsFile, JSON.stringify(settings, null, 2), "utf-8");
}

export async function GET() {
  try {
    const settings = await readSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error reading settings:", error);
    return NextResponse.json(
      { error: "Failed to read settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const settings = await readSettings();

    const updatedSettings: SiteSettings = {
      ...settings,
      ...body,
    };

    await writeSettings(updatedSettings);
    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
