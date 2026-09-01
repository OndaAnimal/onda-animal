import SiteShell from "../../../components/SiteShell";
import AnimalProfileClient from "../../../components/AnimalProfileClient";
import { animals } from "../../../data/animals";

export default async function AnimalPage({ params }) {
  const { slug } = await params;
  return (
    <SiteShell>
      <AnimalProfileClient slug={slug} initialAnimals={animals} />
    </SiteShell>
  );
}
