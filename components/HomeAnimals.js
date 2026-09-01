"use client";

import { useEffect, useMemo, useState } from "react";
import AnimalCard from "./AnimalCard";
import { fetchPublicResource } from "../lib/apiClient";

export default function HomeAnimals({ initialAnimals }) {
  const [animals, setAnimals] = useState(initialAnimals);

  useEffect(() => {
    let active = true;
    fetchPublicResource("animals", initialAnimals).then((items) => {
      if (active && Array.isArray(items)) setAnimals(items);
    });
    return () => { active = false; };
  }, [initialAnimals]);

  const featured = useMemo(() => {
    const available = animals.filter((a) => a.status !== "Adotado" && a.status !== "Indisponível");
    const chosen = available.filter((a) => a.featured);
    return (chosen.length ? chosen : available).slice(0, 3);
  }, [animals]);

  return (
    <div className="animal-grid">
      {featured.map((animal) => <AnimalCard key={animal.slug} animal={animal} />)}
    </div>
  );
}
