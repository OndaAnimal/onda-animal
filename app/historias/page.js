import SiteShell from "../../components/SiteShell";
import PageHero from "../../components/PageHero";
import AdoptionStories from "../../components/AdoptionStories";

export const metadata = {
  title: "Histórias de adoção | Onda Animal",
  description: "Conheça animais que encontraram uma nova família através da Onda Animal.",
};

export default function StoriesPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Histórias de adoção"
        title="Quando um encontro muda duas vidas."
        text="Animais que encontraram uma família e começaram um novo capítulo."
      />
      <section className="section detail-section stories-public-section">
        <AdoptionStories />
      </section>
    </SiteShell>
  );
}
