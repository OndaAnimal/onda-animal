import { NextResponse } from "next/server";
import { ensureDatabase } from "../../../lib/serverStore";
import { cloudinaryConfigured } from "../../../lib/cloudinary";
import { animalAiConfigured } from "../../../lib/openaiAnimalAi";

export async function GET() {
  try {
    await ensureDatabase();
    return NextResponse.json({
      ok: true,
      database: "connected",
      service: "onda-animal",
      media: cloudinaryConfigured() ? "cloudinary-configured" : "cloudinary-not-configured",
      ai: animalAiConfigured() ? "openai-configured" : "openai-not-configured",
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, database: "error", detail: error.message },
      { status: 503 }
    );
  }
}
