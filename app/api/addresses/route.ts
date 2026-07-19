import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getUserAddresses, addAddress, deleteAddress } from "@/lib/addresses/store";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const addresses = await getUserAddresses(user.id);
    return NextResponse.json({ ok: true, addresses });
  } catch (error) {
    console.error("[addresses/GET] error", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

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
    const { firstName, lastName, phone, province, city, address, postalCode } = body;

    // Validation
    if (!firstName?.trim() || !lastName?.trim() || !phone?.trim() || !province?.trim() || !city?.trim() || !address?.trim() || !postalCode?.trim()) {
      return NextResponse.json(
        { ok: false, message: "لطفاً تمام فیلدهای الزامی را پر کنید" },
        { status: 400 }
      );
    }

    if (!/^09[0-9]{9}$/.test(phone.replace(/\s/g, ""))) {
      return NextResponse.json(
        { ok: false, message: "شماره تماس معتبر نیست" },
        { status: 400 }
      );
    }

    if (!/^[0-9]{10}$/.test(postalCode.replace(/\s/g, ""))) {
      return NextResponse.json(
        { ok: false, message: "کد پستی باید 10 رقم باشد" },
        { status: 400 }
      );
    }

    const savedAddress = await addAddress(user.id, {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      province: province.trim(),
      city: city.trim(),
      address: address.trim(),
      postalCode: postalCode.trim(),
    });

    return NextResponse.json({ ok: true, address: savedAddress });
  } catch (error) {
    console.error("[addresses/POST] error", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const addressId = searchParams.get("id");

    if (!addressId) {
      return NextResponse.json(
        { ok: false, message: "آدرس مشخص نشده است" },
        { status: 400 }
      );
    }

    const deleted = await deleteAddress(addressId, user.id);
    if (!deleted) {
      return NextResponse.json(
        { ok: false, message: "آدرس یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[addresses/DELETE] error", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}