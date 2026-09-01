"use client";

import { useMemo, useState } from "react";
import AnimalCard from "./AnimalCard";

export default function AnimalsCatalog({ initialAnimals }) {
  const [filter, setFilter] = useState("Todos");

  const visible = useMemo(() => {
    const active = initialAnimals.filter(
      (animal) => animal.status !== "Adotado" && animal.status !== "Indisponível"
    );

    if (filter === "Todos") return active;
    if (filter === "Cães") return active.filter((a) => a.species === "Cão");
    if (filter === "Gatos") return active.filter((a) => a.species === "Gato");
    return active.filter((a) => a.city === filter);
  }, [initialAnimals, filter]);

  return (
    <>
      <div className="adoption-toolbar">
        <div>
          <strong>{visible.length}</strong>
          <span>{visible.length === 1 ? "animal encontrado" : "animais encontrados"}</span>
        </div>
        <div className="filter-chips interactive-filters">
          {["Todos", "Cães", "Gatos", "Gravataí", "Cachoeirinha"].map((item) => (
            <button key={item} type="button" className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="animal-grid">
        {visible.map((animal, index) => (
          <AnimalCard key={animal.slug} animal={animal} priority={index < 3} />
        ))}
      </div>

      {visible.length === 0 && (
        <div className="catalog-empty">
          <strong>Nenhum animal nesse filtro.</strong>
          <span>Tente outra categoria.</span>
        </div>
      )}
    </>
  );
}
