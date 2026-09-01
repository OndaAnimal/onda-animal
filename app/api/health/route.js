import { NextResponse } from "next/server";
import { ensureDatabase } from "../../../lib/serverStore";

export async function GET() {
  try {
    await ensureDatabase();
    return NextResponse.json({
      ok: true,
      database: "connected",
      service: "onda-animal",
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, database: "error", detail: error.message },
      { status: 503 }
    );
  }
}
