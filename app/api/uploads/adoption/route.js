import { NextResponse } from "next/server";
import {
  cloudinaryConfigured,
  createCloudinarySignedUpload,
  sanitizeMediaKey,
} from "../../../../lib/cloudinary";

export const runtime = "nodejs";

const CATEGORIES = new Set(["windows", "home", "patio"]);
const APPLICATION_RE = /^OA-\d{4}-[A-Z0-9]{10}$/;

export async function POST(request) {
  try {
    if (!cloudinaryConfigured()) {
      return NextResponse.json(
        { error: "Envio de imagens temporariamente indisponível." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const applicationId = String(body.applicationId || "").toUpperCase();
    const animalSlug = sanitizeMediaKey(body.animalSlug);
    const category = String(body.category || "");
    const index = Number(body.index);

    if (!APPLICATION_RE.test(applicationId)) {
      return NextResponse.json({ error: "Identificador da solicitação inválido." }, { status: 400 });
    }
    if (!/^[a-z0-9-]{1,100}$/.test(animalSlug)) {
      return NextResponse.json({ error: "Animal inválido." }, { status: 400 });
    }
    if (!CATEGORIES.has(category) || !Number.isInteger(index) || index < 0 || index > 5) {
      return NextResponse.json({ error: "Categoria de foto inválida." }, { status: 400 });
    }

    const publicId = `onda-animal/applications/${applicationId.toLowerCase()}/${animalSlug}/${category}-${index + 1}`;
    const data = createCloudinarySignedUpload(publicId);

    return NextResponse.json({ data });
  } catch (error) {
    console.error("adoption image signature error", error);
    return NextResponse.json(
      { error: "Não foi possível preparar o envio da imagem." },
      { status: 500 }
    );
  }
}
