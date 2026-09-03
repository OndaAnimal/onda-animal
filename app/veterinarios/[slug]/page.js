import { notFound } from "next/navigation";
import SiteShell from "../../../components/SiteShell";
import VeterinarianProfile from "../../../components/VeterinarianProfile";
import {
  veterinarians as seedVeterinarians,
  getVeterinarianFromList,
} from "../../../data/veterinarians";
import { getSiteData } from "../../../lib/serverStore";

export const dynamic = "force-dynamic";

async function loadVeterinarian(slug) {
  const stored = await getSiteData("veterinarians", seedVeterinarians);
  const list = Array.isArray(stored) ? stored : seedVeterinarians;
  const vet = getVeterinarianFromList(list, slug);
  return vet?.active === false ? null : vet;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const vet = await loadVeterinarian(slug);

  if (!vet) return { title: "Veterinário | Onda Animal" };

  return {
    title: `${vet.name} | Onda Animal`,
    description: `${vet.name} — ${vet.role}. Conheça o profissional e agende seu atendimento.`,
  };
}

export default async function VeterinarianPage({ params }) {
  const { slug } = await params;
  const vet = await loadVeterinarian(slug);

  if (!vet) notFound();

  return (
    <SiteShell>
      <section className="section vet-profile-section">
        <VeterinarianProfile veterinarian={vet} />
      </section>
    </SiteShell>
  );
}
