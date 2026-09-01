"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchPublicResource } from "../lib/apiClient";

export default function HomeAnimalCollage({ initialAnimals }) {
  const [animals, setAnimals] = useState(initialAnimals);

  useEffect(() => {
    let active = true;
    fetchPublicResource("animals", initialAnimals).then((items) => {
      if (active && Array.isArray(items)) setAnimals(items);
    });
    return () => { active = false; };
  }, [initialAnimals]);

  const featured = useMemo(() => {
    const active = animals.filter((a) => a.status !== "Adotado" && a.status !== "Indisponível");
    const chosen = active.filter((a) => a.featured);
    return (chosen.length ? chosen : active).slice(0, 3);
  }, [animals]);

  return (
    <div className="adoption-hero-collage">
      {featured.map((animal, index) => (
        <Link key={animal.slug} href={`/adocao/${animal.slug}`} className={`hero-animal hero-animal-${index + 1}`}>
          <img src={animal.photos?.[0]} alt={animal.name} />
          <div>
            <strong>{animal.name}</strong>
            <span>{animal.age} • {animal.city}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
