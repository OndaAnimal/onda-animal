import SiteShell from "../../components/SiteShell";
import PageHero from "../../components/PageHero";
import AnimalsCatalog from "../../components/AnimalsCatalog";
import { animals as seedAnimals } from "../../data/animals";
import { attachAnimalProfileViews, getSiteData } from "../../lib/serverStore";

export const dynamic = "force-dynamic";

export default async function AdoptionPage() {
  let animals = seedAnimals;
  try {
    animals = await getSiteData("animals", seedAnimals);
    animals = await attachAnimalProfileViews(animals);
  } catch {
    // Fallback local.
  }

  return (
    <SiteShell>
      <PageHero eyebrow="Adoção responsável" title="Animais esperando por uma família."
        text="Conheça os animais disponíveis, veja o perfil completo e envie seu interesse para análise da equipe." />
      <section className="section detail-section">
        <div className="container">
          <AnimalsCatalog initialAnimals={animals} />
        </div>
      </section>
    </SiteShell>
  );
}
