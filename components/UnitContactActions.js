"use client";

import Link from "next/link";
import { useSiteSettings } from "./SiteSettingsProvider";
import { clinicWhatsAppUrl } from "../lib/whatsapp";
import { maskBrazilPhone } from "../lib/masks";

export default function UnitContactActions({ city }) {
  const { settings } = useSiteSettings();
  const whatsapp = city === "Cachoeirinha" ? settings.cachoeirinhaWhatsApp : settings.gravataiWhatsApp;
  const url = clinicWhatsAppUrl(whatsapp, { city });

  return (
    <>
      {url ? (
        <a className="button whatsapp-clinic-button full" href={url} target="_blank" rel="noreferrer">
          WhatsApp {city} • {maskBrazilPhone(whatsapp)}
        </a>
      ) : (
        <Link className="button primary full" href="/agendamento">Escolher unidade para agendar</Link>
      )}
      <Link className="button secondary full" href="/contato">Ver contatos</Link>
    </>
  );
}
