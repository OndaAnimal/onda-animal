import SiteShell from "../components/SiteShell";
import HomePageContent from "../components/HomePageContent";
import { animals as seedAnimals } from "../data/animals";
import { attachAnimalProfileViews, getSiteData } from "../lib/serverStore";

export const dynamic = "force-dynamic";

export default async function Home() {
  let animals = seedAnimals;
  try {
    animals = await getSiteData("animals", seedAnimals);
    animals = await attachAnimalProfileViews(animals);
  } catch {
    // Fallback para desenvolvimento local sem banco.
  }

  return (
    <SiteShell>
      <HomePageContent initialAnimals={animals} />
    </SiteShell>
  );
}
