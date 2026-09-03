"use client";

import { useSearchParams } from "next/navigation";
import { useSiteSettings } from "./SiteSettingsProvider";
import { clinicWhatsAppUrl } from "../lib/whatsapp";
import { maskBrazilPhone } from "../lib/masks";

function UnitBookingCard({ city, whatsapp, service, professional }) {
  const url = clinicWhatsAppUrl(whatsapp, { city, service, professional });

  return (
    <article className="booking-card booking-card-whatsapp">
      <span>UNIDADE</span>
      <h2>{city}</h2>
      {service && <p className="booking-service-selected">Serviço: <strong>{service}</strong></p>}
      {professional && <p className="booking-service-selected">Profissional: <strong>{professional}</strong></p>}

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

export default function BookingUnits({ veterinarians = [] }) {
  const searchParams = useSearchParams();
  const { settings } = useSiteSettings();
  const service = searchParams.get("servico") || "";
  const professionalRef = searchParams.get("profissional") || "";

  const veterinarian = professionalRef
    ? veterinarians.find(
        (vet) =>
          vet.active !== false &&
          (vet.slug === professionalRef || vet.name === professionalRef)
      )
    : null;

  if (veterinarian && veterinarian.scheduleEnabled === false) {
    return (
      <div className="booking-professional-unavailable">
        <span>PROFISSIONAL</span>
        <h2>{veterinarian.name}</h2>
        <p>O agendamento online está desativado para este profissional.</p>
      </div>
    );
  }

  const allowedUnits = veterinarian
    ? new Set(veterinarian.units || [])
    : new Set(["Gravataí", "Cachoeirinha"]);

  const units = [
    { city: "Gravataí", whatsapp: settings.gravataiWhatsApp },
    { city: "Cachoeirinha", whatsapp: settings.cachoeirinhaWhatsApp },
  ].filter((unit) => allowedUnits.has(unit.city));

  if (veterinarian && !units.length) {
    return (
      <div className="booking-professional-unavailable">
        <span>PROFISSIONAL</span>
        <h2>{veterinarian.name}</h2>
        <p>Nenhuma unidade foi habilitada para agendamento deste profissional no CMS.</p>
      </div>
    );
  }

  return (
    <>
      {veterinarian && (
        <div className="booking-professional-context">
          <span>Agendamento com</span>
          <strong>{veterinarian.name}</strong>
          <small>Mostrando somente as unidades em que este profissional atende.</small>
        </div>
      )}

      <div className="booking-grid">
        {units.map((unit) => (
          <UnitBookingCard
            key={unit.city}
            city={unit.city}
            whatsapp={unit.whatsapp}
            service={service}
            professional={veterinarian?.name || ""}
          />
        ))}
      </div>
    </>
  );
}
