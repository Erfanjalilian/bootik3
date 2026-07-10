import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { Banner } from "@/lib/types";
import { getBanners } from "@/lib/data";

const dataDir = path.join(process.cwd(), "data");
const bannersFile = path.join(dataDir, "banners.json");

async function readBanners(): Promise<Banner[]> {
  const content = await fs.readFile(bannersFile, "utf-8");
  return JSON.parse(content);
}

async function writeBanners(banners: Banner[]): Promise<void> {
  await fs.writeFile(bannersFile, JSON.stringify(banners, null, 2), "utf-8");
}

export async function GET() {
  try {
    const banners = getBanners();
    return NextResponse.json(banners);
  } catch (error) {
    console.error("Error reading banners:", error);
    return NextResponse.json(
      { error: "Failed to read banners" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const banners = await readBanners();

    const newBanner: Banner = {
      id: `banner-${Date.now()}`,
      title: body.title,
      subtitle: body.subtitle,
      image: body.image,
      link: body.link,
      type: body.type || "hero",
    };

    banners.push(newBanner);
    await writeBanners(banners);

    return NextResponse.json(newBanner, { status: 201 });
  } catch (error) {
    console.error("Error creating banner:", error);
    return NextResponse.json(
      { error: "Failed to create banner" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Banner ID is required" },
        { status: 400 }
      );
    }

    const banners = await readBanners();
    const index = banners.findIndex((b) => b.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: "Banner not found" },
        { status: 404 }
      );
    }

    const updatedBanner: Banner = {
      ...banners[index],
      ...body,
      id: banners[index].id,
    };

    banners[index] = updatedBanner;
    await writeBanners(banners);

    return NextResponse.json(updatedBanner);
  } catch (error) {
    console.error("Error updating banner:", error);
    return NextResponse.json(
      { error: "Failed to update banner" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Banner ID is required" },
        { status: 400 }
      );
    }

    const banners = await readBanners();
    const filteredBanners = banners.filter((b) => b.id !== id);

    if (filteredBanners.length === banners.length) {
      return NextResponse.json(
        { error: "Banner not found" },
        { status: 404 }
      );
    }

    await writeBanners(filteredBanners);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting banner:", error);
    return NextResponse.json(
      { error: "Failed to delete banner" },
      { status: 500 }
    );
  }
}
