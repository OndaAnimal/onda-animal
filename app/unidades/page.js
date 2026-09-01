import Link from "next/link";
import SiteShell from "../../components/SiteShell";
import PageHero from "../../components/PageHero";
import ContactCTA from "../../components/ContactCTA";

export default function UnidadesPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Unidades"
        title="Onda Animal em Gravataí e Cachoeirinha."
        text="Escolha a unidade para acessar uma página própria com informações de atendimento e contato."
      />
      <section className="section">
        <div className="container unit-grid">
          <article className="unit-card featured">
            <span className="unit-label">UNIDADE</span>
            <h3>Gravataí</h3>
            <p>Rua Francisco Tafas, 67 — Salgado Filho, Gravataí/RS</p>
            <div className="unit-actions">
              <Link href="/unidades/gravatai">Abrir unidade</Link><span>→</span>
            </div>
          </article>
          <article className="unit-card">
            <span className="unit-label">UNIDADE</span>
            <h3>Cachoeirinha</h3>
            <p>Atendimento veterinário Onda Animal em Cachoeirinha.</p>
            <div className="unit-actions">
              <Link href="/unidades/cachoeirinha">Abrir unidade</Link><span>→</span>
            </div>
          </article>
        </div>
      </section>
      <ContactCTA />
    </SiteShell>
  );
}
