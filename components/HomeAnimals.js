"use client";

import { useMemo } from "react";
import AnimalCard from "./AnimalCard";

export default function HomeAnimals({ initialAnimals }) {
  const featured = useMemo(() => {
    const available = initialAnimals.filter((a) => a.status !== "Adotado" && a.status !== "Indisponível");
    const chosen = available.filter((a) => a.featured);
    return (chosen.length ? chosen : available).slice(0, 3);
  }, [initialAnimals]);

  return (
    <div className="animal-grid">
      {featured.map((animal, index) => (
        <AnimalCard key={animal.slug} animal={animal} priority={index === 0} />
      ))}
    </div>
  );
}
