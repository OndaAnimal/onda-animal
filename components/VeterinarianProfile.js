"use client";

import Link from "next/link";

export default function VeterinarianProfile({ veterinarian }) {
  const vet = veterinarian;
  const canSchedule = vet.scheduleEnabled !== false && (vet.units || []).length > 0;

  return (
    <div className="container vet-profile-layout">
      <div className="vet-profile-presentation">
        <img src={vet.image} alt={`Apresentação de ${vet.name}`} />
      </div>

      <aside className="vet-profile-info">
        <span className="eyebrow">Equipe Onda Animal</span>
        <h1>{vet.name}</h1>
        <strong className="vet-profile-role">{vet.role}</strong>
        {vet.crmv && <span className="vet-profile-crmv">{vet.crmv}</span>}
        <p>{vet.summary}</p>

        <div className="vet-profile-facts">
          {vet.highlight && (
            <div>
              <small>DESTAQUE</small>
              <strong>{vet.highlight}</strong>
            </div>
          )}
          {vet.graduation && (
            <div>
              <small>FORMAÇÃO</small>
              <strong>Formação em {vet.graduation}</strong>
            </div>
          )}
          <div>
            <small>ATENDIMENTO</small>
            <strong>{(vet.units || []).length ? vet.units.join(" • ") : "Sem unidade com agendamento online"}</strong>
          </div>
        </div>

        <div className="vet-profile-specialties">
          {(vet.categories || []).map((category) => <span key={category}>{category}</span>)}
        </div>

        {canSchedule ? (
          <Link className="button primary full vet-schedule-button" href={`/agendamento?profissional=${encodeURIComponent(vet.slug)}`}>
            Agendar com {vet.name}
          </Link>
        ) : (
          <div className="vet-profile-schedule-disabled">
            <strong>Agendamento online indisponível</strong>
            <span>Entre em contato com a clínica para informações sobre este profissional.</span>
          </div>
        )}

        <Link className="vet-back-link" href="/veterinarios">
          ← Voltar para nossa equipe
        </Link>
      </aside>
    </div>
  );
}
