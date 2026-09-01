"use client";

import Link from "next/link";
import HomeAnimals from "./HomeAnimals";
import HomeAnimalCollage from "./HomeAnimalCollage";
import { useSiteSettings } from "./SiteSettingsProvider";

export default function HomePageContent({ initialAnimals }) {
  const { settings } = useSiteSettings();

  const heroStyle = settings.heroBannerImage
    ? {
        backgroundImage: `linear-gradient(rgba(248,251,252,${settings.heroOverlay}), rgba(238,248,247,${settings.heroOverlay})), url("${settings.heroBannerImage}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : undefined;

  return (
    <>
      {settings.heroEnabled && (
        <section
          className={settings.heroBannerImage ? "adoption-hero cms-hero-image" : "adoption-hero"}
          style={heroStyle}
        >
          <div className="container adoption-hero-grid">
            <div className="adoption-hero-copy cms-hero-copy">
              <span className="eyebrow">{settings.heroEyebrow}</span>
              <h1>{settings.heroTitle}</h1>
              <p>{settings.heroText}</p>

              <div className="hero-actions">
                {settings.heroPrimaryText && (
                  <Link className="button primary" href={settings.heroPrimaryLink || "/adocao"}>
                    {settings.heroPrimaryText}
                  </Link>
                )}
                {settings.heroSecondaryText && (
                  <Link className="button secondary" href={settings.heroSecondaryLink || "/como-adotar"}>
                    {settings.heroSecondaryText}
                  </Link>
                )}
              </div>

              <div className="adoption-points">
                {settings.heroBadge1 && <span>{settings.heroBadge1}</span>}
                {settings.heroBadge2 && <span>{settings.heroBadge2}</span>}
                {settings.heroBadge3 && <span>{settings.heroBadge3}</span>}
              </div>
            </div>

            {!settings.heroBannerImage && (
              <HomeAnimalCollage initialAnimals={initialAnimals} />
            )}
          </div>
        </section>
      )}

      {settings.stepsStripEnabled && (
        <section className="adoption-number-strip">
          <div className="container adoption-number-grid">
            <div><strong>01</strong><span>{settings.stripStep1}</span></div>
            <div><strong>02</strong><span>{settings.stripStep2}</span></div>
            <div><strong>03</strong><span>{settings.stripStep3}</span></div>
            <div><strong>04</strong><span>{settings.stripStep4}</span></div>
          </div>
        </section>
      )}

      {settings.homeAnimalsEnabled && (
        <section className="section">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="eyebrow">{settings.homeAnimalsEyebrow}</span>
                <h2>{settings.homeAnimalsTitle}</h2>
              </div>
              <p>{settings.homeAnimalsText}</p>
            </div>

            <HomeAnimals initialAnimals={initialAnimals} />

            <div className="center-action">
              <Link className="button secondary" href="/adocao">
                {settings.homeAnimalsButtonText}
              </Link>
            </div>
          </div>
        </section>
      )}

      {settings.processEnabled && (
        <section className="section adoption-process-section">
          <div className="container process-layout">
            <div className="process-copy">
              <span className="eyebrow">{settings.processEyebrow}</span>
              <h2>{settings.processTitle}</h2>
              <p>{settings.processText}</p>
              <Link className="text-link" href="/como-adotar">
                {settings.processButtonText}
              </Link>
            </div>

            <div className="process-steps">
              <div><span>1</span><strong>{settings.processStep1Title}</strong><p>{settings.processStep1Text}</p></div>
              <div><span>2</span><strong>{settings.processStep2Title}</strong><p>{settings.processStep2Text}</p></div>
              <div><span>3</span><strong>{settings.processStep3Title}</strong><p>{settings.processStep3Text}</p></div>
              <div><span>4</span><strong>{settings.processStep4Title}</strong><p>{settings.processStep4Text}</p></div>
            </div>
          </div>
        </section>
      )}

      {settings.clinicCtaEnabled && (
        <section className="clinic-secondary">
          <div className="container clinic-secondary-inner">
            <div>
              <span className="eyebrow light">{settings.clinicCtaEyebrow}</span>
              <h2>{settings.clinicCtaTitle}</h2>
              <p>{settings.clinicCtaText}</p>
            </div>
            <Link className="button white" href={settings.clinicCtaButtonLink || "/servicos"}>
              {settings.clinicCtaButtonText}
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
