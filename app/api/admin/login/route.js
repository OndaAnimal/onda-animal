import { NextResponse } from "next/server";
import {
  adminCookieOptions,
  configuredAdminPin,
  createAdminToken,
} from "../../../../lib/adminAuth";

export async function POST(request) {
  try {
    const { pin } = await request.json();
    const expected = configuredAdminPin();

    if (!expected) {
      return NextResponse.json(
        { error: "ADMIN_PIN não configurado no ambiente." },
        { status: 503 }
      );
    }

    if (String(pin || "") !== String(expected)) {
      return NextResponse.json({ error: "PIN incorreto." }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      ...adminCookieOptions(),
      value: createAdminToken(),
    });
    return response;
  } catch (error) {
    console.error("admin login error", error);
    return NextResponse.json({ error: "Falha no login." }, { status: 500 });
  }
}
