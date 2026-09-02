"use client";

import { useSearchParams } from "next/navigation";
import { useSiteSettings } from "./SiteSettingsProvider";
import { clinicWhatsAppUrl } from "../lib/whatsapp";
import { maskBrazilPhone } from "../lib/masks";

function UnitBookingCard({ city, whatsapp, service }) {
  const url = clinicWhatsAppUrl(whatsapp, { city, service });

  return (
    <article className="booking-card booking-card-whatsapp">
      <span>UNIDADE</span>
      <h2>{city}</h2>
      {service && <p className="booking-service-selected">Serviço: <strong>{service}</strong></p>}

      {url ? (
        <a className="button whatsapp-clinic-button full" href={url} target="_blank" rel="noreferrer">
          <span>WhatsApp {city}</span>
          <strong>{maskBrazilPhone(whatsapp)}</strong>
        </a>
      ) : (
        <div className="booking-whatsapp-missing">
          <strong>WhatsApp ainda não configurado.</strong>
          <span>Cadastre o número desta unidade no Painel → Configurações → Contatos.</span>
        </div>
      )}
    </article>
  );
}

export default function BookingUnits() {
  const searchParams = useSearchParams();
  const { settings } = useSiteSettings();
  const service = searchParams.get("servico") || "";

  return (
    <div className="booking-grid">
      <UnitBookingCard city="Gravataí" whatsapp={settings.gravataiWhatsApp} service={service} />
      <UnitBookingCard city="Cachoeirinha" whatsapp={settings.cachoeirinhaWhatsApp} service={service} />
    </div>
  );
}
