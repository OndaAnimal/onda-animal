"use client";

import Link from "next/link";
import PageHero from "./PageHero";
import { useSiteSettings } from "./SiteSettingsProvider";
import { adoptionWhatsAppUrl } from "../lib/whatsapp";
import { maskBrazilPhone } from "../lib/masks";

export default function ContactPageContent() {
  const { settings } = useSiteSettings();
  const adoptionContactName = settings.adoptionContactName || "Luise";
  const adoptionWhatsApp = adoptionWhatsAppUrl(settings.adoptionWhatsApp, { contactName: adoptionContactName });

  return (
    <>
      <PageHero
        eyebrow={settings.contactEyebrow}
        title={settings.contactTitle}
        text={settings.contactText}
      />

      <section className="section detail-section">
        <div className="container contact-purpose-grid">
          <article className="contact-purpose-card featured">
            <span>♡ ADOÇÃO</span>
            <h2>{settings.contactAdoptionTitle}</h2>
            <p>{settings.contactAdoptionText}</p>

            <Link className="button primary full" href="/adocao">
              Escolher um animal
            </Link>

            {adoptionWhatsApp && (
              <a className="button whatsapp-adoption-button full" href={adoptionWhatsApp} target="_blank" rel="noreferrer">
                Falar com {adoptionContactName} no WhatsApp
              </a>
            )}

            {(settings.adoptionWhatsApp || settings.adoptionEmail) && (
              <div className="cms-contact-extra">
                {settings.adoptionWhatsApp && <span>{adoptionContactName}: {maskBrazilPhone(settings.adoptionWhatsApp)}</span>}
                {settings.adoptionEmail && <span>{settings.adoptionEmail}</span>}
              </div>
            )}
          </article>

          <article className="contact-purpose-card">
            <span>✚ CLÍNICA</span>
            <h2>{settings.contactClinicTitle}</h2>
            <p>{settings.contactClinicText}</p>

            <div className="contact-list">
              {settings.phone1 && (
                <a href={`tel:${settings.phone1Raw || ""}`}>
                  <strong>{maskBrazilPhone(settings.phone1)}</strong><span>Ligar</span>
                </a>
              )}
              {settings.phone2 && (
                <a href={`tel:${settings.phone2Raw || ""}`}>
                  <strong>{maskBrazilPhone(settings.phone2)}</strong><span>Ligar</span>
                </a>
              )}
            </div>

            <div className="cms-social-links">
              {settings.instagram && <a href={settings.instagram} target="_blank" rel="noreferrer">Instagram ↗</a>}
              {settings.facebook && <a href={settings.facebook} target="_blank" rel="noreferrer">Facebook ↗</a>}
              {settings.generalEmail && <a href={`mailto:${settings.generalEmail}`}>E-mail</a>}
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
