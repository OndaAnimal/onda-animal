import SiteShell from "../../components/SiteShell";
import PageHero from "../../components/PageHero";
import VeterinariansDirectory from "../../components/VeterinariansDirectory";
import { veterinarians as seedVeterinarians, sortVeterinarians } from "../../data/veterinarians";
import { DEFAULT_SITE_SETTINGS } from "../../lib/localData";
import { getSiteData } from "../../lib/serverStore";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Veterinários | Onda Animal",
  description: "Conheça a equipe veterinária da Onda Animal.",
};

export default async function VeterinariansPage() {
  const [storedVeterinarians, storedSettings] = await Promise.all([
    getSiteData("veterinarians", seedVeterinarians),
    getSiteData("settings", DEFAULT_SITE_SETTINGS),
  ]);

  const settings = { ...DEFAULT_SITE_SETTINGS, ...(storedSettings || {}) };
  const veterinarians = sortVeterinarians(
    (Array.isArray(storedVeterinarians) ? storedVeterinarians : seedVeterinarians)
      .filter((vet) => vet.active !== false)
  );

  return (
    <SiteShell>
      <PageHero
        eyebrow={settings.vetsPageEyebrow}
        title={settings.vetsPageTitle}
        text={settings.vetsPageText}
      />

      <section className="section vets-section">
        <div className="container">
          <div className="vets-page-intro">
            <div>
              <span className="eyebrow">{settings.vetsIntroEyebrow}</span>
              <h2>{settings.vetsIntroTitle}</h2>
            </div>
            <p>{settings.vetsIntroText}</p>
          </div>

          <VeterinariansDirectory veterinarians={veterinarians} />
        </div>
      </section>
    </SiteShell>
  );
}
