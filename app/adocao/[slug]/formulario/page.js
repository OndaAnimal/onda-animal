import SiteShell from "../../../../components/SiteShell";
import AdoptionFormLoader from "../../../../components/AdoptionFormLoader";
import { animals } from "../../../../data/animals";

export default async function AdoptionApplicationPage({ params }) {
  const { slug } = await params;
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
