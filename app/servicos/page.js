import Link from "next/link";
import SiteShell from "../../components/SiteShell";
import PageHero from "../../components/PageHero";
import ContactCTA from "../../components/ContactCTA";
import { services } from "../../data/services";

export default function ServicosPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Nossos serviços"
        title="Cuidado veterinário em diferentes etapas."
        text="Conheça os principais serviços da Onda Animal e entre na página de cada atendimento para saber mais."
      />
      <section className="section">
        <div className="container service-grid">
          {services.map((service) => (
            <article className="service-card" key={service.slug}>
              <div className="service-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
              <Link href={`/servicos/${service.slug}`}>Abrir serviço <span>→</span></Link>
            </article>
          ))}
        </div>
      </section>
      <ContactCTA />
    </SiteShell>
  );
}
