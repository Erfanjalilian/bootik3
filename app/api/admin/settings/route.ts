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
    const currentSettings = await readSettings();
    const defaults = getSettings();

    const mergedAbout = {
      ...defaults.about,
      ...(currentSettings.about ?? {}),
      ...(body.about ?? {}),
      enabled: {
        ...defaults.about.enabled,
        ...(currentSettings.about?.enabled ?? {}),
        ...(body.about?.enabled ?? {}),
      },
      values: body.about?.values ?? currentSettings.about?.values ?? defaults.about.values,
      stats: body.about?.stats ?? currentSettings.about?.stats ?? defaults.about.stats,
    };

    const mergedContact = {
      ...defaults.contact,
      ...(currentSettings.contact ?? {}),
      ...(body.contact ?? {}),
      enabled: {
        ...defaults.contact.enabled,
        ...(currentSettings.contact?.enabled ?? {}),
        ...(body.contact?.enabled ?? {}),
      },
    };

    const updatedSettings: SiteSettings = {
      ...defaults,
      ...currentSettings,
      ...body,
      about: mergedAbout,
      contact: mergedContact,
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
