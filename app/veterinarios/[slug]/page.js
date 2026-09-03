import { notFound } from "next/navigation";
import SiteShell from "../../../components/SiteShell";
import VeterinarianProfile from "../../../components/VeterinarianProfile";
import { getVeterinarian, veterinarians } from "../../../data/veterinarians";

export function generateStaticParams() {
  return veterinarians.map((vet) => ({ slug: vet.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const vet = getVeterinarian(slug);

  if (!vet) return { title: "Veterinário | Onda Animal" };

  return {
    title: `${vet.name} | Onda Animal`,
    description: `${vet.name} — ${vet.role}. Conheça o profissional e agende seu atendimento.`,
  };
}

export default async function VeterinarianPage({ params }) {
  const { slug } = await params;
  const vet = getVeterinarian(slug);

  if (!vet) notFound();

  return (
    <SiteShell>
      <section className="section vet-profile-section">
        <VeterinarianProfile veterinarian={vet} />
      </section>
    </SiteShell>
  );
}
