import Link from "next/link";
import SiteShell from "../../components/SiteShell";
import PageHero from "../../components/PageHero";
import ContactCTA from "../../components/ContactCTA";

export default function EstruturaPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Nossa estrutura"
        title="Ambientes preparados para cuidar melhor."
        text="Uma página dedicada à estrutura da Onda Animal, pronta para receber fotos reais da clínica e apresentar cada setor."
      />
      <section className="section soft-section">
        <div className="container split-grid">
          <div className="structure-card">
            <div className="structure-brand">
              <img src="/logo.png" alt="Onda Animal" />
              <div><span>ONDA ANIMAL</span><small>CLÍNICA VETERINÁRIA</small></div>
            </div>
            <div className="structure-lines">
              <div><span>01</span><p>Recepção e atendimento organizado</p></div>
              <div><span>02</span><p>Ambiente clínico preparado</p></div>
              <div><span>03</span><p>Centro cirúrgico e suporte diagnóstico</p></div>
              <div><span>04</span><p>Internação e acompanhamento</p></div>
            </div>
          </div>
          <div className="split-copy">
            <span className="eyebrow">Mais segurança</span>
            <h2>Estrutura aliada ao cuidado da equipe.</h2>
            <p>
              Aqui podemos acrescentar fotos reais da recepção, consultórios, centro cirúrgico,
              internação, laboratório e demais ambientes das unidades.
            </p>
            <Link className="button primary" href="/agendamento">Agendar atendimento</Link>
          </div>
        </div>
      </section>
      <ContactCTA />
    </SiteShell>
  );
}
