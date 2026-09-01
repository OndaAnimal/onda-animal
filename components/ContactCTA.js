import Link from "next/link";

export default function ContactCTA() {
  return (
    <section className="cta-section">
      <div className="container">
        <div className="cta-box">
          <div>
            <span className="eyebrow light">Precisa de atendimento?</span>
            <h2>Fale com a equipe da Onda Animal.</h2>
            <p>Entre em contato para informações, horários e agendamentos.</p>
          </div>
          <div className="cta-actions">
            <Link className="button white" href="/agendamento">Agendar atendimento</Link>
            <Link className="button ghost-white" href="/contato">Ver contatos</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
