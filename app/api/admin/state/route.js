import { NextResponse } from "next/server";
import { animals as seedAnimals } from "../../../../data/animals";
import { veterinarians as seedVeterinarians } from "../../../../data/veterinarians";
import { DEFAULT_SITE_SETTINGS } from "../../../../lib/localData";
import { isAdminAuthenticated } from "../../../../lib/adminAuth";
import {
  addMessage,
  getSiteData,
  listApplications,
  listConversations,
  listFeedback,
  listAnimalProfileViews,
  markConversationRead,
  setConversationStatus,
  setSiteData,
  updateApplication,
} from "../../../../lib/serverStore";

async function guard() {
  return isAdminAuthenticated();
}

export async function GET() {
  try {
    if (!(await guard())) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const [animals, veterinarians, applications, feedback, settings, stories, conversations, profileViews] =
      await Promise.all([
        getSiteData("animals", seedAnimals),
        getSiteData("veterinarians", seedVeterinarians),
        listApplications(),
        listFeedback(),
        getSiteData("settings", DEFAULT_SITE_SETTINGS),
        getSiteData("stories", []),
        listConversations(),
        listAnimalProfileViews(),
      ]);

    return NextResponse.json({
      data: {
        animals,
        veterinarians,
        applications,
        feedback,
        settings: { ...DEFAULT_SITE_SETTINGS, ...settings },
        stories,
        profileViews,
        connect: { conversations, tickets: [], news: [], help: [] },
      },
    });
  } catch (error) {
    console.error("admin state get error", error);
    return NextResponse.json(
      { error: "Não foi possível carregar o painel.", detail: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    if (!(await guard())) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === "saveResource") {
      const allowed = new Set(["animals", "veterinarians", "settings", "stories"]);
      if (!allowed.has(body.resource)) {
        return NextResponse.json({ error: "Recurso inválido." }, { status: 400 });
      }
      const value =
        body.resource === "settings"
          ? { ...DEFAULT_SITE_SETTINGS, ...(body.value || {}) }
          : body.value;
      await setSiteData(body.resource, value);
      return NextResponse.json({ data: value });
    }

    if (action === "completeAdoption") {
      const animalSlug = String(body.animalSlug || "").trim();
      const storyInput = body.story || {};

      if (!animalSlug) {
        return NextResponse.json({ error: "Animal inválido." }, { status: 400 });
      }

      if (!storyInput.photo || !String(storyInput.title || "").trim() || !String(storyInput.story || "").trim()) {
        return NextResponse.json(
          { error: "Foto, título e história são obrigatórios." },
          { status: 400 }
        );
      }

      const [animals, stories, currentApplications] = await Promise.all([
        getSiteData("animals", seedAnimals),
        getSiteData("stories", []),
        listApplications(),
      ]);

      const animal = (animals || []).find((item) => item.slug === animalSlug);
      if (!animal) {
        return NextResponse.json({ error: "Animal não encontrado." }, { status: 404 });
      }

      const storyId = animal.adoptionStoryId || `historia_${Date.now()}`;
      const adoptionDate =
        storyInput.adoptionDate || new Date().toISOString().slice(0, 10);

      const storyRecord = {
        id: storyId,
        animalSlug,
        animalName: animal.name,
        originalPhoto: animal.photos?.[0] || "",
        photo: storyInput.photo,
        title: String(storyInput.title || "").trim(),
        story: String(storyInput.story || "").trim(),
        adoptionDate,
        familyName: String(storyInput.familyName || "").trim(),
        familyCity: String(storyInput.familyCity || "").trim(),
        createdAt: new Date().toISOString(),
      };

      const nextStories = [
        storyRecord,
        ...(stories || []).filter((item) => item.animalSlug !== animalSlug),
      ];

      const nextAnimals = (animals || []).map((item) =>
        item.slug === animalSlug
          ? {
              ...item,
              status: "Adotado",
              featured: false,
              adoptedAt: adoptionDate,
              adoptionStoryId: storyId,
            }
          : item
      );

      // A conclusão principal não depende da atualização das candidaturas.
      // Assim, uma candidatura antiga/inconsistente não bloqueia a adoção.
      await setSiteData("stories", nextStories);
      await setSiteData("animals", nextAnimals);

      const approvedForAnimal = (currentApplications || []).filter(
        (item) => item?.id && item.animalSlug === animalSlug && item.status === "APROVADO"
      );

      if (approvedForAnimal.length) {
        await Promise.allSettled(
          approvedForAnimal.map((item) =>
            updateApplication(item.id, {
              status: "ADOTADO",
              internalNotes: item.internalNotes || "",
            })
          )
        );
      }

      const applications = await listApplications();

      return NextResponse.json({
        data: {
          animals: nextAnimals,
          stories: nextStories,
          applications,
          story: storyRecord,
        },
      });
    }

    if (action === "updateApplication") {
      const data = await updateApplication(body.id, body.patch || {});
      return NextResponse.json({ data });
    }

    if (action === "bulkApplications") {
      const items = Array.isArray(body.items) ? body.items : [];
      await Promise.all(
        items.map((item) =>
          updateApplication(item.id, {
            status: item.status,
            internalNotes: item.internalNotes || "",
          })
        )
      );
      const data = await listApplications();
      return NextResponse.json({ data });
    }

    if (action === "listConversations") {
      const data = await listConversations();
      return NextResponse.json({ data });
    }

    if (action === "markConversationRead") {
      await markConversationRead(body.id, "support");
      const conversations = await listConversations();
      return NextResponse.json({ data: conversations });
    }

    if (action === "sendSupportMessage") {
      await addMessage(body.id, {
        id: body.message?.id,
        from: "support",
        text: body.message?.text,
        date: body.message?.date,
        readByClient: false,
        readBySupport: true,
      });
      const conversations = await listConversations();
      return NextResponse.json({ data: conversations });
    }

    if (action === "toggleConversationStatus") {
      await setConversationStatus(body.id, body.status);
      const conversations = await listConversations();
      return NextResponse.json({ data: conversations });
    }

    return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  } catch (error) {
    console.error("admin state post error", error);
    return NextResponse.json(
      { error: "Não foi possível salvar.", detail: error.message },
      { status: 500 }
    );
  }
}
