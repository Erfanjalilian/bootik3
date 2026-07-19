import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getUsers, getUserByPhone } from "@/lib/auth/store";
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

const writeJson = async (filePath: string, data: unknown) => {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
};

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { firstName, lastName, phone } = body;

    const users = await getUsers();
    const index = users.findIndex((u) => u.id === user.id);
    if (index === -1) {
      return NextResponse.json(
        { ok: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Validate phone if provided
    if (phone !== undefined && phone !== "") {
      const normalizedPhone = phone.replace(/\D/g, "");
      if (!/^09[0-9]{9}$/.test(normalizedPhone)) {
        return NextResponse.json(
          { ok: false, message: "شماره تماس معتبر نیست" },
          { status: 400 }
        );
      }
      // Check if phone is already taken by another user
      const existingUser = await getUserByPhone(normalizedPhone);
      if (existingUser && existingUser.id !== user.id) {
        return NextResponse.json(
          { ok: false, message: "این شماره تماس قبلاً ثبت شده است" },
          { status: 400 }
        );
      }
      users[index].phone = normalizedPhone;
    }

    if (firstName !== undefined) {
      users[index].firstName = firstName || undefined;
    }
    if (lastName !== undefined) {
      users[index].lastName = lastName || undefined;
    }

    await writeJson(USERS_FILE, users);

    return NextResponse.json({
      ok: true,
      user: users[index],
    });
  } catch (error) {
    console.error("[auth/update-profile] error", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}