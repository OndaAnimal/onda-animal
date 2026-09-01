import { NextResponse } from "next/server";
import { createApplication, getSiteData } from "../../../lib/serverStore";
import { animals as seedAnimals } from "../../../data/animals";

export async function POST(request) {
  try {
    const application = await request.json();
    if (!application?.id || !application?.animalSlug || !application?.animalName || !application?.applicant) {
      return NextResponse.json({ error: "Dados incompletos." }, { status: 400 });
    }

    const animals = await getSiteData("animals", seedAnimals);
    const animal = (animals || []).find((item) => item.slug === application.animalSlug);
    if (!animal || animal.status === "Adotado" || animal.status === "Indisponível") {
      return NextResponse.json({ error: "Este animal não está disponível para esta solicitação." }, { status: 400 });
    }

    if (application.applicant?.housingPhotoConsent !== true) {
      return NextResponse.json(
        { error: "É necessário autorizar o uso das fotos da moradia para análise da adoção." },
        { status: 400 }
      );
    }

    const housingPhotos = application.applicant?.housingPhotos || {};
    const windows = Array.isArray(housingPhotos.windows) ? housingPhotos.windows : [];
    const home = Array.isArray(housingPhotos.home) ? housingPhotos.home : [];
    const patio = Array.isArray(housingPhotos.patio) ? housingPhotos.patio : [];
    const validPhoto = (url) => typeof url === "string" && /^https:\/\/res\.cloudinary\.com\//.test(url);

    if (animal.species === "Gato") {
      if (windows.length < 2 || !windows.every(validPhoto)) {
        return NextResponse.json(
          { error: "Para adoção de gatos, envie pelo menos 2 fotos das janelas/telas da moradia." },
          { status: 400 }
        );
      }
    }

    if (animal.species === "Cão") {
      if (home.length < 1 || patio.length < 1 || !home.every(validPhoto) || !patio.every(validPhoto)) {
        return NextResponse.json(
          { error: "Para adoção de cães, envie fotos da casa/apartamento e do pátio/área externa." },
          { status: 400 }
        );
      }
    }

    const saved = await createApplication(application);
    return NextResponse.json({ data: saved }, { status: 201 });
  } catch (error) {
    console.error("application error", error);
    return NextResponse.json({ error: "Não foi possível enviar a solicitação." }, { status: 500 });
  }
}
