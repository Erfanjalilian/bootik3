import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { AuthUser } from "@/lib/auth/types";

const dataDir = path.join(process.cwd(), "data");
const usersFile = path.join(dataDir, "users.json");

async function readUsers(): Promise<AuthUser[]> {
  try {
    const content = await fs.readFile(usersFile, "utf-8");
    return JSON.parse(content);
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    const users = await readUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error reading users:", error);
    return NextResponse.json(
      { error: "Failed to read users" },
      { status: 500 }
    );
  }
}
