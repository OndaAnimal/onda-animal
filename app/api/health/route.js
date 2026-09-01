import { NextResponse } from "next/server";
import { ensureDatabase } from "../../../lib/serverStore";
import { cloudinaryConfigured } from "../../../lib/cloudinary";

export async function GET() {
  try {
    await ensureDatabase();
    return NextResponse.json({
      ok: true,
      database: "connected",
      service: "onda-animal",
      media: cloudinaryConfigured() ? "cloudinary-configured" : "cloudinary-not-configured",
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, database: "error", detail: error.message },
      { status: 503 }
    );
  }
}
