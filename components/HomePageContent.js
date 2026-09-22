"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import HomeAnimals from "./HomeAnimals";
import HomeAnimalCollage from "./HomeAnimalCollage";
import { useSiteSettings } from "./SiteSettingsProvider";
import { mediaUrl } from "../lib/mediaUrl";

export default function HomePageContent({ initialAnimals }) {
  const { settings } = useSiteSettings();
  const [nfgOpen, setNfgOpen] = useState(false);

  useEffect(() => {
    if (!nfgOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => {
      if (event.key === "Escape") setNfgOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [nfgOpen]);

  const heroStyle = settings.heroBannerImage
    ? {
        backgroundImage: `linear-gradient(rgba(248,251,252,${settings.heroOverlay}), rgba(238,248,247,${settings.heroOverlay})), url("${mediaUrl(settings.heroBannerImage, { width: 1920, height: 1080, crop: "fill" })}")`,
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

      {settings.shelterAlertEnabled && (
        <section
          className="shelter-home-alert"
          style={{
            "--shelter-alert-bg": settings.shelterAlertBackground || "#fff4f7",
            "--shelter-alert-accent": settings.shelterAlertAccent || "#b63a5e",
            "--shelter-alert-text": settings.shelterAlertTextColor || "#173f4b",
          }}
        >
          <div className="container shelter-home-alert-inner">
            <div className="shelter-alert-icon" aria-hidden="true">
              <span>♡</span>
              <small>ABRIGO</small>
            </div>

            <div className="shelter-alert-copy">
              <span className="shelter-alert-eyebrow">
                <i />
                {settings.shelterAlertEyebrow}
                <i />
              </span>
              <h2>{settings.shelterAlertTitle}</h2>
              {settings.shelterAlertWarningEnabled !== false && settings.shelterAlertWarningText && (
                <div className="shelter-alert-warning" role="note" aria-label={settings.shelterAlertWarningText}>
                  <span className="shelter-alert-warning-dot" aria-hidden="true" />
                  <strong>{settings.shelterAlertWarningText}</strong>
                </div>
              )}
              <p>{settings.shelterAlertText}</p>
            </div>

            <div className="shelter-alert-actions">
              {settings.shelterAlertButtonText && settings.shelterAlertButtonLink && (
                <Link className="shelter-alert-primary" href={settings.shelterAlertButtonLink}>
                  {settings.shelterAlertButtonText}
                  <span>→</span>
                </Link>
              )}
              {settings.shelterAlertSecondaryText && settings.shelterAlertSecondaryLink && (
                <Link className="shelter-alert-secondary" href={settings.shelterAlertSecondaryLink}>
                  {settings.shelterAlertSecondaryText}
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {settings.nfgBannerEnabled && (
        <section
          className="nfg-home-banner"
          style={{
            "--nfg-bg": settings.nfgBackground || "#eef7ff",
            "--nfg-accent": settings.nfgAccent || "#1c6fa8",
            "--nfg-text": settings.nfgTextColor || "#173f4b",
          }}
        >
          <div className="container nfg-home-banner-inner">
            <div className="nfg-home-logo-card" aria-hidden="true">
              <img
                className="nfg-home-logo-image"
                src={settings.nfgLogoPath || "/nfg-logo.png"}
                alt=""
              />
            </div>

            <div className="nfg-home-copy">
              <span>{settings.nfgEyebrow}</span>
              <h2>{settings.nfgTitle}</h2>
              <p>{settings.nfgText}</p>
              <div className="nfg-entity-mini">
                <b>{settings.nfgEntityName}</b>
                <span>{settings.nfgEntityCity} • {settings.nfgEntityArea}</span>
                {settings.nfgEntityCode && <small>Cód. {settings.nfgEntityCode}</small>}
              </div>
            </div>

            <div className="nfg-home-actions">
              <button type="button" className="nfg-how-button" onClick={() => setNfgOpen(true)}>
                {settings.nfgButtonText || "Como ajudar"} <span>?</span>
              </button>
              {settings.nfgOfficialUrl && (
                <a className="nfg-official-link" href={settings.nfgOfficialUrl} target="_blank" rel="noreferrer">
                  {settings.nfgOfficialButtonText || "Abrir Nota Fiscal Gaúcha"} ↗
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {nfgOpen && (
        <div className="nfg-modal-backdrop" onMouseDown={(event) => {
          if (event.currentTarget === event.target) setNfgOpen(false);
        }}>
          <article className="nfg-modal" role="dialog" aria-modal="true" aria-labelledby="nfg-modal-title">
            <button type="button" className="nfg-modal-close" onClick={() => setNfgOpen(false)} aria-label="Fechar">×</button>

            <header className="nfg-modal-head">
              <div className="nfg-modal-logo-card" aria-hidden="true">
                <img
                  className="nfg-modal-logo-image"
                  src={settings.nfgLogoPath || "/nfg-logo.png"}
                  alt=""
                />
              </div>
              <div>
                <span>{settings.nfgEyebrow}</span>
                <h2 id="nfg-modal-title">{settings.nfgModalTitle}</h2>
                <p>{settings.nfgModalIntro}</p>
              </div>
            </header>

            <div className="nfg-modal-entity">
              <span>ENTIDADE PARA SELECIONAR</span>
              <strong>{settings.nfgEntityName}</strong>
              <p>{settings.nfgEntityArea} • {settings.nfgEntityCity}</p>
              {settings.nfgEntityCode && <b>Código de habilitação: {settings.nfgEntityCode}</b>}
            </div>

            <div className="nfg-modal-steps">
              {[settings.nfgStep1,settings.nfgStep2,settings.nfgStep3,settings.nfgStep4,settings.nfgStep5]
                .filter(Boolean).map((step,index) => (
                  <div key={index}><span>{String(index+1).padStart(2,"0")}</span><p>{step}</p></div>
                ))}
            </div>

            <div className="nfg-modal-note">
              <strong>Importante</strong>
              <p>A escolha da entidade é feita no cadastro da Nota Fiscal Gaúcha. Depois disso, continue informando seu CPF nas compras participantes.</p>
            </div>

            <footer className="nfg-modal-footer">
              <button type="button" className="button secondary" onClick={() => setNfgOpen(false)}>Fechar</button>
              {settings.nfgOfficialUrl && (
                <a className="button primary" href={settings.nfgOfficialUrl} target="_blank" rel="noreferrer">
                  Ir para Nota Fiscal Gaúcha ↗
                </a>
              )}
            </footer>
          </article>
        </div>
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
