import { NextResponse } from "next/server";
import { createFeedback } from "../../../lib/serverStore";

export async function POST(request) {
  try {
    const data = await request.json();
    if (!data?.rating || !data?.foundWhatNeeded) {
      return NextResponse.json({ error: "Preencha a avaliação." }, { status: 400 });
    }
    const saved = await createFeedback(data);
    return NextResponse.json({ data: saved }, { status: 201 });
  } catch (error) {
    console.error("feedback error", error);
    return NextResponse.json({ error: "Não foi possível salvar sua avaliação." }, { status: 500 });
  }
}
