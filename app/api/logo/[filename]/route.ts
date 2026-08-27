import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const LOGO_ROOT = path.resolve(process.env.UPLOAD_DIR || "/root/uploads", "logos");
const SAFE_FILENAME = /^[A-Za-z0-9][A-Za-z0-9._-]*\.(?:jpg|jpeg|png|webp|gif)$/i;
const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  if (!SAFE_FILENAME.test(filename) || filename !== path.basename(filename)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const filePath = path.resolve(LOGO_ROOT, filename);
  if (path.dirname(filePath) !== LOGO_ROOT) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const file = await fs.readFile(filePath);
    const extension = path.extname(filename).slice(1).toLowerCase();
    return new NextResponse(file, {
      headers: {
        "Content-Type": CONTENT_TYPES[extension],
        "Cache-Control": "no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
