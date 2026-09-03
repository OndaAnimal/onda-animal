"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const filters = ["Todos", "Clínica Geral", "Cirurgia", "Cardiologia", "Felinos"];

export default function VeterinariansDirectory({ veterinarians }) {
  const [filter, setFilter] = useState("Todos");

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
        {visible.map((vet) => (
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
                </div>
                <span className="vet-arrow">↗</span>
              </div>

              <p>{vet.summary}</p>

              <div className="vet-tags">
                {vet.units?.map((unit) => <span key={unit}>{unit}</span>)}
                {vet.categories?.slice(0, 2).map((category) => (
                  <span className="specialty" key={category}>{category}</span>
                ))}
              </div>

              <div className="vet-card-actions">
                <Link className="button secondary" href={`/veterinarios/${vet.slug}`}>
                  Ver apresentação
                </Link>
                <Link className="button primary" href={`/agendamento?profissional=${encodeURIComponent(vet.name)}`}>
                  Agendar
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
