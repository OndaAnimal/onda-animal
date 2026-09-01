import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "../../../../lib/adminAuth";
import {
  cloudinaryConfigured,
  sanitizeMediaKey,
  uploadCloudinaryImage,
} from "../../../../lib/cloudinary";

export const runtime = "nodejs";

const CMS_KEYS = new Set(["logo", "favicon", "hero-banner", "social-image"]);

function destination(scope, key) {
  const safeKey = sanitizeMediaKey(key);
  if (!safeKey) throw new Error("Destino da imagem não informado.");

  if (scope === "cms") {
    if (!CMS_KEYS.has(safeKey)) throw new Error("Imagem do CMS inválida.");
    return `onda-animal/cms/${safeKey}`;
  }

  if (scope === "animal") {
    if (!/^[a-z0-9-]+\/photo-[12]$/.test(safeKey)) {
      throw new Error("Destino da foto do animal inválido.");
    }
    return `onda-animal/animals/${safeKey}`;
  }

  if (scope === "story") {
    if (!/^[a-z0-9-]+\/final$/.test(safeKey)) {
      throw new Error("Destino da foto da história inválido.");
    }
    return `onda-animal/stories/${safeKey}`;
  }

  throw new Error("Tipo de imagem inválido.");
}

export async function POST(request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    if (!cloudinaryConfigured()) {
      return NextResponse.json(
        {
          error: "Cloudinary não configurado.",
          detail:
            "Cadastre CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET no Vercel.",
        },
        { status: 503 }
      );
    }

    const form = await request.formData();
    const file = form.get("file");
    const scope = String(form.get("scope") || "");
    const key = String(form.get("key") || "");

    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json({ error: "Selecione uma imagem." }, { status: 400 });
    }

    const data = await uploadCloudinaryImage(file, destination(scope, key));
    return NextResponse.json({ data });
  } catch (error) {
    console.error("cloudinary upload error", error);
    return NextResponse.json(
      { error: "Não foi possível enviar a imagem.", detail: error.message },
      { status: 500 }
    );
  }
}
