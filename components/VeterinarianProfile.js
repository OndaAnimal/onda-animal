"use client";

import Link from "next/link";

export default function VeterinarianProfile({ veterinarian }) {
  const vet = veterinarian;

  return (
    <div className="container vet-profile-layout">
      <div className="vet-profile-presentation">
        <img src={vet.image} alt={`Apresentação de ${vet.name}`} />
      </div>

      <aside className="vet-profile-info">
        <span className="eyebrow">Equipe Onda Animal</span>
        <h1>{vet.name}</h1>
        <strong className="vet-profile-role">{vet.role}</strong>
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
            <strong>{vet.units?.join(" • ")}</strong>
          </div>
        </div>

        <div className="vet-profile-specialties">
          {vet.categories?.map((category) => <span key={category}>{category}</span>)}
        </div>

        <Link className="button primary full vet-schedule-button" href={`/agendamento?profissional=${encodeURIComponent(vet.name)}`}>
          Agendar com {vet.name}
        </Link>

        <Link className="vet-back-link" href="/veterinarios">
          ← Voltar para nossa equipe
        </Link>
      </aside>
    </div>
  );
}
