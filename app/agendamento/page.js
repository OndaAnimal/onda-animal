import Link from "next/link";
import SiteShell from "../../components/SiteShell";
import PageHero from "../../components/PageHero";

export default function AgendamentoPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Agendamento"
        title="Vamos cuidar do seu pet."
        text="Escolha a unidade e o serviço. Esta rota já está pronta para receber depois integração com WhatsApp ou agendamento online."
      />
      <section className="section">
        <div className="container booking-grid">
          <Link className="booking-card" href="/unidades/gravatai">
            <span>UNIDADE</span><h2>Gravataí</h2><p>Escolher Gravataí →</p>
          </Link>
          <Link className="booking-card" href="/unidades/cachoeirinha">
            <span>UNIDADE</span><h2>Cachoeirinha</h2><p>Escolher Cachoeirinha →</p>
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
