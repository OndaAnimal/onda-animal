"use client";

import Link from "next/link";
import { useSiteSettings } from "./SiteSettingsProvider";

export default function NfgPageContent() {
  const { settings } = useSiteSettings();

  const steps = [
    settings.nfgStep1,
    settings.nfgStep2,
    settings.nfgStep3,
    settings.nfgStep4,
    settings.nfgStep5,
  ].filter(Boolean);

  return (
    <div
      className="nfg-route"
      style={{
        "--nfg-page-accent": settings.nfgAccent || "#1169aa",
        "--nfg-page-bg": settings.nfgBackground || "#f7fbff",
        "--nfg-page-text": settings.nfgTextColor || "#173f4b",
      }}
    >
      <section className="nfg-route-hero">
        <div className="container nfg-route-hero-grid">
          <div className="nfg-route-logo-wrap">
            <div className="nfg-route-orb nfg-route-orb-blue" />
            <div className="nfg-route-orb nfg-route-orb-orange" />
            <img src={settings.nfgLogoPath || "/nfg-logo.png"} alt="Nota Fiscal Gaúcha" />
            <span>CPF NA NOTA • APOIE A ONDA</span>
          </div>

          <div className="nfg-route-copy">
            <span className="nfg-route-eyebrow">{settings.nfgEyebrow || "NOTA FISCAL GAÚCHA"}</span>
            <h1>{settings.nfgTitle}</h1>
            <p>{settings.nfgText}</p>

            <div className="nfg-route-actions">
              {settings.nfgOfficialUrl && (
                <a className="nfg-route-primary" href={settings.nfgOfficialUrl} target="_blank" rel="noreferrer">
                  Entrar na Nota Fiscal Gaúcha <span>↗</span>
                </a>
              )}
              <Link className="nfg-route-secondary" href="/adocao">Ver animais para adoção</Link>
            </div>

            <small className="nfg-route-official-note">Você será direcionado ao site oficial da Nota Fiscal Gaúcha.</small>
          </div>
        </div>
      </section>

      <section className="nfg-route-entity-section">
        <div className="container">
          <div className="nfg-route-entity-card">
            <div>
              <span>ENTIDADE PARA SELECIONAR</span>
              <strong>{settings.nfgEntityName}</strong>
              <p>{settings.nfgEntityArea}</p>
            </div>
            <dl>
              <div><dt>Município</dt><dd>{settings.nfgEntityCity}</dd></div>
              <div><dt>Código de habilitação</dt><dd>{settings.nfgEntityCode}</dd></div>
            </dl>
          </div>
        </div>
      </section>

      <section className="nfg-route-steps-section">
        <div className="container">
          <div className="nfg-route-section-head">
            <span>PASSO A PASSO</span>
            <h2>{settings.nfgModalTitle || "Como ajudar a Onda pela Nota Fiscal Gaúcha"}</h2>
            <p>{settings.nfgModalIntro}</p>
          </div>

          <div className="nfg-route-steps">
            {steps.map((step,index) => (
              <article key={index}>
                <div className="nfg-route-step-number">{String(index+1).padStart(2,"0")}</div>
                <p>{step}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="nfg-route-bottom-cta">
        <div className="container nfg-route-bottom-card">
          <div>
            <span>UMA ESCOLHA QUE AJUDA</span>
            <h2>Selecione a ONDA e continue informando seu CPF nas compras.</h2>
            <p>O processo começa no cadastro da Nota Fiscal Gaúcha. Depois de selecionar a entidade, mantenha seu CPF vinculado às compras participantes.</p>
          </div>
          {settings.nfgOfficialUrl && (
            <a className="nfg-route-primary" href={settings.nfgOfficialUrl} target="_blank" rel="noreferrer">
              Fazer cadastro agora <span>↗</span>
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
