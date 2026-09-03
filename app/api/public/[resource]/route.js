import { NextResponse } from "next/server";
import { animals as seedAnimals } from "../../../../data/animals";
import { veterinarians as seedVeterinarians } from "../../../../data/veterinarians";
import { DEFAULT_SITE_SETTINGS } from "../../../../lib/localData";
import { getSiteData } from "../../../../lib/serverStore";

const PUBLIC_RESOURCES = {
  animals: seedAnimals,
  veterinarians: seedVeterinarians,
  settings: DEFAULT_SITE_SETTINGS,
  stories: [],
};

export async function GET(_request, { params }) {
  try {
    const { resource } = await params;
    if (!(resource in PUBLIC_RESOURCES)) {
      return NextResponse.json({ error: "Recurso inválido." }, { status: 404 });
    }

    const data = await getSiteData(resource, PUBLIC_RESOURCES[resource]);
    return NextResponse.json({ data });
  } catch (error) {
    console.error("public resource error", error);
    return NextResponse.json(
      { error: "Banco de dados indisponível.", detail: error.message },
      { status: 503 }
    );
  }
}
