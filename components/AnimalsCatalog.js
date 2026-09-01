"use client";

import { useEffect, useMemo, useState } from "react";
import AnimalCard from "./AnimalCard";
import { fetchPublicResource } from "../lib/apiClient";

export default function AnimalsCatalog({ initialAnimals }) {
  const [animals, setAnimals] = useState(initialAnimals);
  const [filter, setFilter] = useState("Todos");

  useEffect(() => {
    let active = true;
    fetchPublicResource("animals", initialAnimals).then((items) => {
      if (active && Array.isArray(items)) setAnimals(items);
    });
    return () => { active = false; };
  }, [initialAnimals]);

  const visible = useMemo(() => {
    const active = animals.filter(
      (animal) => animal.status !== "Adotado" && animal.status !== "Indisponível"
    );

    if (filter === "Todos") return active;
    if (filter === "Cães") return active.filter((a) => a.species === "Cão");
    if (filter === "Gatos") return active.filter((a) => a.species === "Gato");
    return active.filter((a) => a.city === filter);
  }, [animals, filter]);

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
        {visible.map((animal) => <AnimalCard key={animal.slug} animal={animal} />)}
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
