import { NextResponse } from "next/server";
import { recordAnimalProfileView } from "../../../../../lib/serverStore";

export const dynamic = "force-dynamic";

export async function POST(request, context) {
  try {
    const { slug } = await context.params;
    const body = await request.json().catch(() => ({}));
    const visitorId = String(body.visitorId || "").trim();

    if (!slug || !visitorId || visitorId.length > 160) {
      return NextResponse.json(
        { error: "Visualização inválida." },
        { status: 400 }
      );
    }

    const result = await recordAnimalProfileView(slug, visitorId);
    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("profile view error", error);
    return NextResponse.json(
      { error: "Não foi possível registrar a visualização." },
      { status: 500 }
    );
  }
}
