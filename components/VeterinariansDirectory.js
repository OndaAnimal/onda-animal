"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export default function VeterinariansDirectory({ veterinarians }) {
  const [filter, setFilter] = useState("Todos");

  const filters = useMemo(() => {
    const categories = new Set();
    veterinarians.forEach((vet) =>
      (vet.categories || []).forEach((category) => category && categories.add(category))
    );
    return ["Todos", ...Array.from(categories).sort((a, b) => a.localeCompare(b, "pt-BR"))];
  }, [veterinarians]);

  const visible = useMemo(() => {
    if (filter === "Todos") return veterinarians;
    return veterinarians.filter((vet) => vet.categories?.includes(filter));
  }, [filter, veterinarians]);

  return (
    <>
      <div className="vets-filter-bar" aria-label="Filtrar veterinários">
        {filters.map((item) => (
          <button
            type="button"
            key={item}
            className={filter === item ? "active" : ""}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="vets-grid">
        {visible.map((vet) => {
          const canSchedule = vet.scheduleEnabled !== false && (vet.units || []).length > 0;
          return (
            <article className="vet-card" key={vet.slug}>
              <Link className="vet-card-image" href={`/veterinarios/${vet.slug}`}>
                <img src={vet.image} alt={`Apresentação de ${vet.name}`} loading="lazy" decoding="async" />
                <span>Conheça o profissional</span>
              </Link>

              <div className="vet-card-body">
                <div className="vet-card-heading">
                  <div>
                    <span className="vet-role">{vet.role}</span>
                    <h2>{vet.name}</h2>
                    {vet.crmv && <small className="vet-crmv">{vet.crmv}</small>}
                  </div>
                  <span className="vet-arrow">↗</span>
                </div>

                <p>{vet.summary}</p>

                <div className="vet-tags">
                  {(vet.units || []).map((unit) => <span key={unit}>{unit}</span>)}
                  {(vet.categories || []).slice(0, 2).map((category) => (
                    <span className="specialty" key={category}>{category}</span>
                  ))}
                </div>

                <div className="vet-card-actions">
                  <Link className="button secondary" href={`/veterinarios/${vet.slug}`}>
                    Ver apresentação
                  </Link>
                  {canSchedule ? (
                    <Link className="button primary" href={`/agendamento?profissional=${encodeURIComponent(vet.slug)}`}>
                      Agendar
                    </Link>
                  ) : (
                    <span className="vet-schedule-disabled">Sem agendamento online</span>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {!visible.length && (
        <div className="admin-empty big vet-public-empty">
          Nenhum profissional disponível neste filtro.
        </div>
      )}
    </>
  );
}
