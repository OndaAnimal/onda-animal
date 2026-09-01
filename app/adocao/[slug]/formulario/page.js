import SiteShell from "../../../../components/SiteShell";
import AdoptionFormLoader from "../../../../components/AdoptionFormLoader";
import { animals as seedAnimals } from "../../../../data/animals";
import { getSiteData } from "../../../../lib/serverStore";

export const dynamic = "force-dynamic";

export default async function AdoptionApplicationPage({ params }) {
  const { slug } = await params;
  let animals = seedAnimals;
  try {
    animals = await getSiteData("animals", seedAnimals);
  } catch {
    // Fallback local.
  }

  return (
    <SiteShell>
      <main className="adoption-form-page">
        <div className="container adoption-form-container">
          <AdoptionFormLoader slug={slug} initialAnimals={animals} />
        </div>
      </main>
    </SiteShell>
  );
}
