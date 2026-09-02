import { Suspense } from "react";
import SiteShell from "../../components/SiteShell";
import PageHero from "../../components/PageHero";
import BookingUnits from "../../components/BookingUnits";

export default function AgendamentoPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Agendamento"
        title="Vamos cuidar do seu pet."
        text="Escolha a unidade e fale diretamente com a equipe pelo WhatsApp configurado no painel."
      />
      <section className="section">
        <div className="container">
          <Suspense fallback={<div className="booking-loading">Carregando contatos das unidades...</div>}>
            <BookingUnits />
          </Suspense>
        </div>
      </section>
    </SiteShell>
  );
}
