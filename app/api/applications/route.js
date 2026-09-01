import { NextResponse } from "next/server";
import { createApplication } from "../../../lib/serverStore";

export async function POST(request) {
  try {
    const application = await request.json();
    if (!application?.id || !application?.animalSlug || !application?.animalName || !application?.applicant) {
      return NextResponse.json({ error: "Dados incompletos." }, { status: 400 });
    }
    const saved = await createApplication(application);
    return NextResponse.json({ data: saved }, { status: 201 });
  } catch (error) {
    console.error("application error", error);
    return NextResponse.json({ error: "Não foi possível enviar a solicitação." }, { status: 500 });
  }
}
