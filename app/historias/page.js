import SiteShell from "../../components/SiteShell";
import PageHero from "../../components/PageHero";
import AdoptionStories from "../../components/AdoptionStories";
import { getSiteData } from "../../lib/serverStore";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Histórias de adoção | Onda Animal",
  description: "Conheça animais que encontraram uma nova família através da Onda Animal.",
};

export default async function StoriesPage() {
  let stories = [];
  try {
    stories = await getSiteData("stories", []);
  } catch {
    // Fallback local.
  }

  return (
    <SiteShell>
      <PageHero
        eyebrow="Histórias de adoção"
        title="Quando um encontro muda duas vidas."
        text="Animais que encontraram uma família e começaram um novo capítulo."
      />
      <section className="section detail-section stories-public-section">
        <AdoptionStories initialStories={stories} />
      </section>
    </SiteShell>
  );
}
