import SiteShell from "./SiteShell";
import PageHero from "./PageHero";
import ContactCTA from "./ContactCTA";
import UnitContactActions from "./UnitContactActions";

export default function UnitDetail({ city, address, description }) {
  return (
    <SiteShell>
      <PageHero eyebrow="Unidade Onda Animal" title={city} text={description} />
      <section className="section detail-section">
        <div className="container detail-grid">
          <article className="detail-card detail-main">
            <span className="unit-label">ENDEREÇO</span>
            <h2>{city}</h2>
            <p>{address}</p>
            <div className="route-tags">
              <span>Consultas</span><span>Cirurgias</span><span>Exames</span><span>Internação</span>
            </div>
          </article>
          <aside className="detail-card detail-aside">
            <span className="unit-label">ATENDIMENTO</span>
            <h3>Fale com a unidade.</h3>
            <p>Consulte horários, serviços e disponibilidade antes de se deslocar.</p>
            <UnitContactActions city={city} />
          </aside>
        </div>
      </section>
      <ContactCTA />
    </SiteShell>
  );
}
