import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import sharp from "sharp";

// Upload directory - configurable via env, defaults to /root/uploads on VPS
const UPLOAD_ROOT = process.env.UPLOAD_DIR || "/root/uploads";
const PRODUCT_UPLOADS_DIR = path.join(UPLOAD_ROOT, "products");
const LOGO_UPLOADS_DIR = path.join(UPLOAD_ROOT, "logos");

// Reasonable limit to prevent abuse (20MB) - actual image data is compressed to WebP
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const uploadType = formData.get("type") === "logo" ? "logo" : "product";

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 20MB" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Detect the actual image format using sharp (not just the file extension)
    let metadata;
    try {
      metadata = await sharp(buffer).metadata();
    } catch {
      return NextResponse.json(
        { error: "Invalid image file" },
        { status: 400 }
      );
    }

    if (!metadata.format) {
      return NextResponse.json(
        { error: "Unsupported image format" },
        { status: 400 }
      );
    }

    // Convert the image to WebP with quality optimized for e-commerce
    const webpBuffer = await sharp(buffer)
      .rotate() // Fix orientation based on EXIF
      .webp({ quality: 80, effort: 4 })
      .toBuffer();

    // Create the uploads directory if it doesn't exist
    const uploadsDir = uploadType === "logo" ? LOGO_UPLOADS_DIR : PRODUCT_UPLOADS_DIR;
    await fs.mkdir(uploadsDir, { recursive: true });

    // Always use .webp extension since we convert everything to WebP
    const uniqueName = `${Date.now()}-${randomUUID().slice(0, 8)}.webp`;
    const filePath = path.join(uploadsDir, uniqueName);

    await fs.writeFile(filePath, webpBuffer);

    const publicPath = uploadType === "logo"
      ? `/api/logo/${uniqueName}`
      : `/uploads/products/${uniqueName}`;
    return NextResponse.json({ url: publicPath }, { status: 201 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}