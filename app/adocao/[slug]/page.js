import SiteShell from "../../../components/SiteShell";
import AnimalProfileClient from "../../../components/AnimalProfileClient";
import { animals as seedAnimals } from "../../../data/animals";
import { getAnimalProfileViewCount, getSiteData } from "../../../lib/serverStore";

export const dynamic = "force-dynamic";

export default async function AnimalPage({ params }) {
  const { slug } = await params;
  let animals = seedAnimals;
  let initialViews = 0;

  try {
    [animals, initialViews] = await Promise.all([
      getSiteData("animals", seedAnimals),
      getAnimalProfileViewCount(slug),
    ]);
  } catch {
    // Fallback local.
  }

  return (
    <SiteShell>
      <AnimalProfileClient
        slug={slug}
        initialAnimals={animals}
        initialViews={initialViews}
      />
    </SiteShell>
  );
}
