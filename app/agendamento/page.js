import { Suspense } from "react";
import SiteShell from "../../components/SiteShell";
import PageHero from "../../components/PageHero";
import BookingUnits from "../../components/BookingUnits";
import { veterinarians as seedVeterinarians } from "../../data/veterinarians";
import { getSiteData } from "../../lib/serverStore";

export const dynamic = "force-dynamic";

export default async function AgendamentoPage() {
  const storedVeterinarians = await getSiteData("veterinarians", seedVeterinarians);
  const veterinarians = Array.isArray(storedVeterinarians) ? storedVeterinarians : seedVeterinarians;

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
            <BookingUnits veterinarians={veterinarians} />
          </Suspense>
        </div>
      </section>
    </SiteShell>
  );
}
