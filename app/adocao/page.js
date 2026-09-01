import SiteShell from "../../components/SiteShell";
import PageHero from "../../components/PageHero";
import AnimalsCatalog from "../../components/AnimalsCatalog";
import { animals } from "../../data/animals";

export default function AdoptionPage() {
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
