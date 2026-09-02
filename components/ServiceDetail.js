import Link from "next/link";
import SiteShell from "./SiteShell";
import PageHero from "./PageHero";
import ContactCTA from "./ContactCTA";

export default function ServiceDetail({ service }) {
  return (
    <SiteShell>
      <PageHero eyebrow="Serviços Onda Animal" title={service.title} text={service.intro} />
      <section className="section detail-section">
        <div className="container detail-grid">
          <article className="detail-card detail-main">
            <div className="service-icon large">{service.icon}</div>
            <h2>Cuidado pensado para cada paciente.</h2>
            <p>{service.text}</p>
            <p>
              Nossa equipe avalia cada caso individualmente e orienta o tutor sobre
              preparo, acompanhamento e próximos passos necessários.
            </p>
          </article>
          <aside className="detail-card detail-aside">
            <span className="unit-label">PRÓXIMO PASSO</span>
            <h3>Quer saber horários ou disponibilidade?</h3>
            <p>Escolha sua unidade ou fale diretamente com a equipe.</p>
            <Link className="button primary full" href={`/agendamento?servico=${encodeURIComponent(service.title)}`}>Agendar atendimento</Link>
            <Link className="button secondary full" href="/unidades">Ver unidades</Link>
          </aside>
        </div>
      </section>
      <ContactCTA />
    </SiteShell>
  );
}
