import SiteShell from "../../../components/SiteShell";
import AnimalProfileClient from "../../../components/AnimalProfileClient";
import { animals as seedAnimals } from "../../../data/animals";
import { getSiteData } from "../../../lib/serverStore";

export const dynamic = "force-dynamic";

export default async function AnimalPage({ params }) {
  const { slug } = await params;
  let animals = seedAnimals;
  try {
    animals = await getSiteData("animals", seedAnimals);
  } catch {
    // Fallback local.
  }

  return (
    <SiteShell>
      <AnimalProfileClient slug={slug} initialAnimals={animals} />
    </SiteShell>
  );
}
