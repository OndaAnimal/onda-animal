import SiteShell from "../../components/SiteShell";
import PageHero from "../../components/PageHero";
import VeterinariansDirectory from "../../components/VeterinariansDirectory";
import { veterinarians } from "../../data/veterinarians";

export const metadata = {
  title: "Veterinários | Onda Animal",
  description: "Conheça a equipe veterinária da Onda Animal.",
};

export default function VeterinariansPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Nossa equipe"
        title="Conheça quem cuida de cada história."
        text="Profissionais que unem conhecimento, experiência e carinho para cuidar do seu pet."
      />

      <section className="section vets-section">
        <div className="container">
          <div className="vets-page-intro">
            <div>
              <span className="eyebrow">Equipe Onda Animal</span>
              <h2>Veterinários que fazem parte da nossa rotina.</h2>
            </div>
            <p>
              Conheça um pouco mais sobre nossos profissionais, suas áreas de atuação
              e escolha com quem deseja falar para agendar o atendimento.
            </p>
          </div>

          <VeterinariansDirectory veterinarians={veterinarians} />
        </div>
      </section>
    </SiteShell>
  );
}
