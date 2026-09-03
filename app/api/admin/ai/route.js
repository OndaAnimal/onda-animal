import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "../../../../lib/adminAuth";
import {
  analyzeAnimalPhotos,
  animalAiConfigured,
  composeAnimalTexts,
  rewriteAnimalText,
} from "../../../../lib/openaiAnimalAi";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    if (!animalAiConfigured()) {
      return NextResponse.json(
        {
          error: "IA não configurada.",
          detail: "Cadastre OPENAI_API_KEY no Vercel e faça um novo deploy.",
        },
        { status: 503 }
      );
    }

    const body = await request.json();

    if (body.action === "analyze") {
      const data = await analyzeAnimalPhotos(body.photos || []);
      return NextResponse.json({ data });
    }

    if (body.action === "compose") {
      const data = await composeAnimalTexts(body.animal || {});
      return NextResponse.json({ data });
    }

    if (body.action === "rewrite") {
      const data = await rewriteAnimalText(
        body.field,
        body.animal || {},
        body.currentText || ""
      );
      return NextResponse.json({ data });
    }

    return NextResponse.json({ error: "Ação de IA inválida." }, { status: 400 });
  } catch (error) {
    console.error("animal ai error", error);
    return NextResponse.json(
      {
        error: "Não foi possível concluir a análise com IA.",
        detail: error.message,
      },
      { status: 500 }
    );
  }
}
