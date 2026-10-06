"use client";

import { useMemo, useState } from "react";
import AnimalCard from "./AnimalCard";

export default function AnimalsCatalog({ initialAnimals }) {
  const [speciesFilter, setSpeciesFilter] = useState("Todos");
  const [sexFilter, setSexFilter] = useState("Todos");
  const [nameSearch, setNameSearch] = useState("");

  const visible = useMemo(() => {
    let active = initialAnimals.filter(
      (animal) => animal.status !== "Adotado" && animal.status !== "Indisponível"
    );

    if (speciesFilter === "Cães") {
      active = active.filter((animal) => animal.species === "Cão");
    }

    if (speciesFilter === "Gatos") {
      active = active.filter((animal) => animal.species === "Gato");
    }

    if (sexFilter === "Macho") {
      active = active.filter((animal) => animal.sex === "Macho");
    }

    if (sexFilter === "Fêmea") {
      active = active.filter((animal) => animal.sex === "Fêmea");
    }

    const normalizedSearch = nameSearch.trim().toLocaleLowerCase("pt-BR");
    if (normalizedSearch) {
      active = active.filter((animal) =>
        String(animal.name || "").toLocaleLowerCase("pt-BR").includes(normalizedSearch)
      );
    }

    return active;
  }, [initialAnimals, speciesFilter, sexFilter, nameSearch]);

  function clearFilters() {
    setSpeciesFilter("Todos");
    setSexFilter("Todos");
    setNameSearch("");
  }

  const hasActiveFilters =
    speciesFilter !== "Todos" ||
    sexFilter !== "Todos" ||
    Boolean(nameSearch.trim());

  return (
    <>
      <div className="adoption-toolbar adoption-toolbar-combined">
        <div className="adoption-result-count">
          <strong>{visible.length}</strong>
          <span>{visible.length === 1 ? "animal encontrado" : "animais encontrados"}</span>
        </div>

        <div className="catalog-search-wrap">
          <label className="catalog-name-search">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={nameSearch}
              onChange={(event) => setNameSearch(event.target.value)}
              placeholder="Pesquisar animal pelo nome..."
              aria-label="Pesquisar animal pelo nome"
            />
            {nameSearch && (
              <button
                type="button"
                onClick={() => setNameSearch("")}
                aria-label="Limpar pesquisa"
              >
                ×
              </button>
            )}
          </label>
        </div>

        <div className="catalog-filter-groups">
          <div className="catalog-filter-group">
            <span className="catalog-filter-label">Espécie</span>
            <div className="filter-chips interactive-filters">
              {["Todos", "Cães", "Gatos"].map((item) => (
                <button
                  key={item}
                  type="button"
                  className={speciesFilter === item ? "active" : ""}
                  onClick={() => setSpeciesFilter(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="catalog-filter-group">
            <span className="catalog-filter-label">Sexo</span>
            <div className="filter-chips interactive-filters">
              {["Todos", "Macho", "Fêmea"].map((item) => (
                <button
                  key={item}
                  type="button"
                  className={sexFilter === item ? "active" : ""}
                  onClick={() => setSexFilter(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {hasActiveFilters && (
            <button type="button" className="catalog-clear-filters" onClick={clearFilters}>
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      <div className="animal-grid">
        {visible.map((animal, index) => (
          <AnimalCard key={animal.slug} animal={animal} priority={index < 3} />
        ))}
      </div>

      {visible.length === 0 && (
        <div className="catalog-empty">
          <strong>Nenhum animal com essa combinação.</strong>
          <span>Tente trocar a espécie ou o sexo selecionado.</span>
          <button type="button" className="button secondary" onClick={clearFilters}>
            Mostrar todos
          </button>
        </div>
      )}
    </>
  );
}
